-- =========================================================
-- Nexrnn LMS — Migration 12 (certificate storage repair)
-- Run AFTER migration_11.sql.
-- This is an idempotent repair for projects where the earlier
-- certificate RPC was not created or certificate rows were only
-- generated in the browser. It makes database persistence explicit.
-- =========================================================

-- Ensure every profile has a permanent User ID.
alter table profiles add column if not exists user_registration_id text;
update profiles
set user_registration_id = 'USR-' || upper(substr(encode(digest(id::text, 'sha256'), 'hex'), 1, 12))
where user_registration_id is null or trim(user_registration_id) = '';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_user_registration_id_key' and conrelid = 'public.profiles'::regclass) then
    alter table profiles add constraint profiles_user_registration_id_key unique (user_registration_id);
  end if;
end $$;

alter table profiles alter column user_registration_id set not null;

create or replace function protect_user_registration_id()
returns trigger as $$
begin
  if NEW.user_registration_id is distinct from OLD.user_registration_id then
    raise exception 'User ID cannot be changed.';
  end if;
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists protect_user_registration_id on profiles;
create trigger protect_user_registration_id before update on profiles for each row execute procedure protect_user_registration_id();

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, user_registration_id, email, first_name, phone)
  values (new.id, 'USR-' || upper(substr(encode(digest(new.id::text, 'sha256'), 'hex'), 1, 12)), new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do update set email = excluded.email, user_registration_id = coalesce(profiles.user_registration_id, excluded.user_registration_id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Ensure the certificate table exists even if migration_9 stopped early.
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  registration_id text not null unique,
  certificate_id text,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references courses(id) on delete cascade,
  student_name text not null,
  course_title text not null,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table certificates add column if not exists certificate_id text;
update certificates
set certificate_id = coalesce(nullif(certificate_id, ''), registration_id, 'NXR-CERT-' || upper(substr(encode(digest(user_id::text || ':' || course_id || ':nexrnn-certificate', 'sha256'), 'hex'), 1, 12)))
where certificate_id is null or trim(certificate_id) = '';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'certificates_certificate_id_key' and conrelid = 'public.certificates'::regclass) then
    alter table certificates add constraint certificates_certificate_id_key unique (certificate_id);
  end if;
end $$;

alter table certificates alter column certificate_id set not null;
alter table certificates enable row level security;
drop policy if exists "Certificates are publicly verifiable" on certificates;
create policy "Certificates are publicly verifiable" on certificates for select using (true);
drop policy if exists "Users can issue their own certificates" on certificates;
create policy "Users can issue their own certificates" on certificates for insert with check (auth.uid() = user_id);

-- Recreate the guarded RPC. It checks enrollment and completion before
-- inserting, and never changes certificate_id or issued_at on repeat calls.
create or replace function issue_certificate(p_course_id text)
returns setof certificates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_total int;
  v_done int;
  v_student_name text;
  v_course_title text;
  v_certificate_id text;
begin
  if v_user_id is null then raise exception 'You must be signed in to issue a certificate.'; end if;
  select title into v_course_title from courses where id = p_course_id;
  if v_course_title is null then raise exception 'Course not found.'; end if;
  if not exists (select 1 from enrollments where user_id = v_user_id and course_id = p_course_id) then raise exception 'You are not enrolled in this course.'; end if;

  select count(*) into v_total from lessons l join modules m on m.id = l.module_id where m.course_id = p_course_id;
  select count(*) into v_done from lesson_progress lp join lessons l on l.id = lp.lesson_id join modules m on m.id = l.module_id where lp.user_id = v_user_id and lp.done = true and m.course_id = p_course_id;
  if v_total = 0 or v_done < v_total then raise exception 'Complete every lesson before issuing a certificate.'; end if;

  select nullif(trim(concat_ws(' ', first_name, last_name)), '') into v_student_name from profiles where id = v_user_id;
  v_student_name := coalesce(v_student_name, 'Nexrnn Learner');
  v_certificate_id := 'NXR-CERT-' || upper(substr(encode(digest(v_user_id::text || ':' || p_course_id || ':nexrnn-certificate', 'sha256'), 'hex'), 1, 12));

  insert into certificates (registration_id, certificate_id, user_id, course_id, student_name, course_title)
  values (v_certificate_id, v_certificate_id, v_user_id, p_course_id, v_student_name, v_course_title)
  on conflict (user_id, course_id) do update set student_name = excluded.student_name, course_title = excluded.course_title;

  return query select * from certificates where user_id = v_user_id and course_id = p_course_id limit 1;
end;
$$;

grant execute on function issue_certificate(text) to authenticated;

-- Prevent accidental edits to issued identity/date values.
create or replace function protect_certificate_identity()
returns trigger as $$
begin
  if NEW.certificate_id is distinct from OLD.certificate_id or NEW.registration_id is distinct from OLD.registration_id or NEW.issued_at is distinct from OLD.issued_at then
    raise exception 'Certificate ID and issue date cannot be changed after issue.';
  end if;
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists protect_certificate_identity on certificates;
create trigger protect_certificate_identity before update on certificates for each row execute procedure protect_certificate_identity();

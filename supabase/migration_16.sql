-- =========================================================
-- Nexrnn LMS — Migration 16
-- Run after migrations 1–15 in the configured Supabase project.
-- Adds the course/workshop discriminator and preserves existing data,
-- certificates, certificate IDs and issue dates.
-- =========================================================

alter table courses add column if not exists course_type text not null default 'course';
update courses set course_type = 'course' where course_type is null or trim(course_type) = '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'courses_course_type_check'
      and conrelid = 'public.courses'::regclass
  ) then
    alter table courses add constraint courses_course_type_check
      check (course_type in ('course', 'workshop'));
  end if;
end $$;

-- Existing certificate rows remain Course certificates. Workshop rows created
-- after this migration are stamped Workshop by the guarded issue RPC below.
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  registration_id text not null unique,
  certificate_id text,
  certificate_type text not null default 'Course',
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references courses(id) on delete cascade,
  student_name text not null,
  course_title text not null,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table certificates add column if not exists certificate_id text;
alter table certificates add column if not exists certificate_type text not null default 'Course';
update certificates
set certificate_id = coalesce(nullif(certificate_id, ''), registration_id,
  'NXR-CERT-' || upper(substr(encode(digest(user_id::text || ':' || course_id || ':nexrnn-certificate', 'sha256'), 'hex'), 1, 12)))
where certificate_id is null or trim(certificate_id) = '';
update certificates
set certificate_type = case when exists (
  select 1 from courses c where c.id = certificates.course_id and c.course_type = 'workshop'
) then 'Workshop' else 'Course' end
where certificate_type is null or certificate_type not in ('Course', 'Workshop');

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'certificates_certificate_id_key'
      and conrelid = 'public.certificates'::regclass
  ) then
    alter table certificates add constraint certificates_certificate_id_key unique (certificate_id);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'certificates_certificate_type_check'
      and conrelid = 'public.certificates'::regclass
  ) then
    alter table certificates add constraint certificates_certificate_type_check
      check (certificate_type in ('Course', 'Workshop'));
  end if;
end $$;

alter table certificates alter column certificate_id set not null;
alter table certificates enable row level security;
drop policy if exists "Certificates are publicly verifiable" on certificates;
create policy "Certificates are publicly verifiable"
  on certificates for select using (true);
drop policy if exists "Users can issue their own certificates" on certificates;
create policy "Users can issue their own certificates"
  on certificates for insert with check (auth.uid() = user_id);

-- Preserve the admin-controlled completion gate for both item types.
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
  v_course_complete boolean;
  v_certificate_available boolean;
  v_course_type text;
  v_certificate_type text;
  v_certificate_id text;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to issue a certificate.';
  end if;

  select title, course_complete, certificate, coalesce(course_type, 'course')
    into v_course_title, v_course_complete, v_certificate_available, v_course_type
  from courses where id = p_course_id;
  if v_course_title is null then raise exception 'Course or workshop not found.'; end if;
  if coalesce(v_certificate_available, true) is not true then
    raise exception 'This item does not issue a certificate.';
  end if;
  if coalesce(v_course_complete, false) is not true then
    raise exception 'This item is still ongoing. The certificate will be available after the admin marks it complete.';
  end if;
  if not exists (select 1 from enrollments where user_id = v_user_id and course_id = p_course_id) then
    raise exception 'You are not enrolled in this item.';
  end if;

  select count(*) into v_total
  from lessons l join modules m on m.id = l.module_id
  where m.course_id = p_course_id;
  select count(*) into v_done
  from lesson_progress lp
  join lessons l on l.id = lp.lesson_id
  join modules m on m.id = l.module_id
  where lp.user_id = v_user_id and lp.done = true and m.course_id = p_course_id;
  if v_total = 0 or v_done < v_total then
    raise exception 'Complete every lesson before issuing a certificate.';
  end if;

  select nullif(trim(concat_ws(' ', first_name, last_name)), '')
    into v_student_name from profiles where id = v_user_id;
  v_student_name := coalesce(v_student_name, 'Nexrnn Learner');
  v_certificate_type := case when v_course_type = 'workshop' then 'Workshop' else 'Course' end;
  v_certificate_id := 'NXR-CERT-' || upper(substr(encode(digest(v_user_id::text || ':' || p_course_id || ':nexrnn-certificate', 'sha256'), 'hex'), 1, 12));

  insert into certificates (
    registration_id, certificate_id, certificate_type, user_id, course_id, student_name, course_title
  ) values (
    v_certificate_id, v_certificate_id, v_certificate_type, v_user_id, p_course_id, v_student_name, v_course_title
  )
  on conflict (user_id, course_id) do update set
    student_name = excluded.student_name,
    course_title = excluded.course_title,
    certificate_type = excluded.certificate_type;

  return query select * from certificates
    where user_id = v_user_id and course_id = p_course_id limit 1;
end;
$$;

grant execute on function issue_certificate(text) to authenticated;

-- A certificate's ID, legacy registration ID and issue date are immutable.
create or replace function protect_certificate_identity()
returns trigger as $$
begin
  if NEW.certificate_id is distinct from OLD.certificate_id
    or NEW.registration_id is distinct from OLD.registration_id
    or NEW.issued_at is distinct from OLD.issued_at then
    raise exception 'Certificate ID and issue date cannot be changed after issue.';
  end if;
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists protect_certificate_identity on certificates;
create trigger protect_certificate_identity
  before update on certificates for each row execute procedure protect_certificate_identity();

-- Optional starter workshop for existing projects. Existing rows are never
-- overwritten; admins can edit or remove it from Admin Panel → Workshops.
insert into courses (
  id, course_type, tag, title, description, duration, level, mode, projects,
  certificate, course_complete, mentorship, price, original_price, discount_label,
  rating, reviews, icon, what_you_learn, who_should_take, faqs
) values (
  'digital-marketing-workshop', 'workshop', 'WORKSHOP', 'Digital Marketing Workshop',
  'A live, practical workshop with guided exercises, expert discussion and an outcome you can use immediately.',
  '2 Days', 'Beginner to Intermediate', 'Online / Offline', 1, true, false, true,
  999, 1999, '50% OFF', 5.0, 0, 'megaphone',
  array['Plan a practical campaign in a guided session', 'Get live feedback from an instructor', 'Leave with a workshop project and next steps'],
  array['Students and working professionals', 'Business owners wanting a focused learning sprint'],
  '[]'::jsonb
) on conflict (id) do nothing;

insert into modules (id, course_id, title, position) values
('digital-marketing-workshop-m1', 'digital-marketing-workshop', 'Workshop Day 1: Plan', 1),
('digital-marketing-workshop-m2', 'digital-marketing-workshop', 'Workshop Day 2: Execute', 2)
on conflict (id) do nothing;

insert into lessons (id, module_id, title, type, duration, position, free_preview) values
('digital-marketing-workshop-m1-l1', 'digital-marketing-workshop-m1', 'Workshop goals and audience', 'video', '20 MIN', 1, true),
('digital-marketing-workshop-m1-l2', 'digital-marketing-workshop-m1', 'Build your campaign brief', 'text', null, 2, false),
('digital-marketing-workshop-m2-l1', 'digital-marketing-workshop-m2', 'Live campaign exercise', 'video', '35 MIN', 1, false),
('digital-marketing-workshop-m2-l2', 'digital-marketing-workshop-m2', 'Workshop project and next steps', 'text', null, 2, false)
on conflict (id) do nothing;

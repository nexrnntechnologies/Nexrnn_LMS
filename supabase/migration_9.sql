-- =========================================================
-- Nexrnn LMS — Migration 9
-- Run AFTER migration_8.sql.
-- Adds persistent, publicly verifiable completion certificates.
-- =========================================================

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  registration_id text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references courses(id) on delete cascade,
  student_name text not null,
  course_title text not null,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table certificates enable row level security;

drop policy if exists "Certificates are publicly verifiable" on certificates;
create policy "Certificates are publicly verifiable"
  on certificates for select using (true);

drop policy if exists "Users can issue their own certificates" on certificates;
create policy "Users can issue their own certificates"
  on certificates for insert with check (auth.uid() = user_id);

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
  v_registration_id text;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to issue a certificate.';
  end if;

  select title into v_course_title from courses where id = p_course_id;
  if v_course_title is null then
    raise exception 'Course not found.';
  end if;

  if not exists (select 1 from enrollments where user_id = v_user_id and course_id = p_course_id) then
    raise exception 'You are not enrolled in this course.';
  end if;

  select count(*) into v_total
  from lessons l
  join modules m on m.id = l.module_id
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
    into v_student_name
  from profiles where id = v_user_id;
  v_student_name := coalesce(v_student_name, 'Nexrnn Learner');

  v_registration_id := 'NXR-' || upper(substr(encode(digest(v_user_id::text || ':' || p_course_id || ':nexrnn-certificate', 'sha256'), 'hex'), 1, 12));

  insert into certificates (registration_id, user_id, course_id, student_name, course_title)
  values (v_registration_id, v_user_id, p_course_id, v_student_name, v_course_title)
  on conflict (user_id, course_id) do update set
    student_name = excluded.student_name,
    course_title = excluded.course_title;

  return query select * from certificates where user_id = v_user_id and course_id = p_course_id limit 1;
end;
$$;

grant execute on function issue_certificate(text) to authenticated;

-- =========================================================
-- Nexrnn LMS — Migration 14
-- Run AFTER migration_13.sql.
-- Adds the admin-controlled course completion gate. Certificates are
-- issued only when the course is marked complete AND the learner has
-- completed every lesson.
-- =========================================================

alter table courses add column if not exists course_complete boolean not null default false;

-- Any later content change reopens the course automatically. This prevents
-- an admin from accidentally leaving a completed/certificate-ready flag on
-- after adding a new lesson. Existing certificates are not deleted.
create or replace function mark_course_ongoing_after_content_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course_id text;
begin
  if TG_TABLE_NAME = 'modules' then
    if TG_OP = 'DELETE' then
      v_course_id := OLD.course_id;
    else
      v_course_id := NEW.course_id;
    end if;
  else
    if TG_OP = 'DELETE' then
      select course_id into v_course_id from modules where id = OLD.module_id;
    else
      select course_id into v_course_id from modules where id = NEW.module_id;
    end if;
  end if;

  if v_course_id is not null then
    update courses set course_complete = false where id = v_course_id;
  end if;

  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;

drop trigger if exists mark_course_ongoing_on_module_change on modules;
create trigger mark_course_ongoing_on_module_change
after insert or update or delete on modules
for each row execute procedure mark_course_ongoing_after_content_change();

drop trigger if exists mark_course_ongoing_on_lesson_change on lessons;
create trigger mark_course_ongoing_on_lesson_change
after insert or update or delete on lessons
for each row execute procedure mark_course_ongoing_after_content_change();

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
  v_certificate_id text;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to issue a certificate.';
  end if;

  select title, course_complete, certificate
    into v_course_title, v_course_complete, v_certificate_available
  from courses
  where id = p_course_id;

  if v_course_title is null then
    raise exception 'Course not found.';
  end if;
  if coalesce(v_certificate_available, true) is not true then
    raise exception 'This course does not issue a certificate.';
  end if;
  if coalesce(v_course_complete, false) is not true then
    raise exception 'This course is still ongoing. The certificate will be available after the admin marks the course complete.';
  end if;
  if not exists (
    select 1 from enrollments
    where user_id = v_user_id and course_id = p_course_id
  ) then
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
  where lp.user_id = v_user_id
    and lp.done = true
    and m.course_id = p_course_id;

  if v_total = 0 or v_done < v_total then
    raise exception 'Complete every lesson before issuing a certificate.';
  end if;

  select nullif(trim(concat_ws(' ', first_name, last_name)), '')
    into v_student_name
  from profiles
  where id = v_user_id;
  v_student_name := coalesce(v_student_name, 'Nexrnn Learner');

  v_certificate_id := 'NXR-CERT-' || upper(substr(encode(digest(v_user_id::text || ':' || p_course_id || ':nexrnn-certificate', 'sha256'), 'hex'), 1, 12));

  insert into certificates (
    registration_id, certificate_id, user_id, course_id, student_name, course_title
  )
  values (
    v_certificate_id, v_certificate_id, v_user_id, p_course_id, v_student_name, v_course_title
  )
  on conflict (user_id, course_id) do update set
    student_name = excluded.student_name,
    course_title = excluded.course_title;

  return query
    select * from certificates
    where user_id = v_user_id and course_id = p_course_id
    limit 1;
end;
$$;

grant execute on function issue_certificate(text) to authenticated;

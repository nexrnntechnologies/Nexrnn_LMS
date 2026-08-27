-- =========================================================
-- Nexrnn LMS — Migration 15
-- Run AFTER migration_14.sql.
-- Adds full admin CRUD for Course Feedback and preserves the
-- selected learner as the public feedback author.
-- =========================================================

alter table course_ratings add column if not exists learner_name text;

-- Backfill the public author name for existing learner ratings.
update course_ratings r
set learner_name = nullif(trim(concat_ws(' ', p.first_name, p.last_name)), '')
from profiles p
where p.id = r.user_id
  and (r.learner_name is null or trim(r.learner_name) = '');

create or replace function set_course_rating_learner_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  select nullif(trim(concat_ws(' ', first_name, last_name)), '')
    into v_name
  from profiles
  where id = NEW.user_id;
  NEW.learner_name := coalesce(nullif(trim(NEW.learner_name), ''), v_name, 'Nexrnn Learner');
  return NEW;
end;
$$;

drop trigger if exists set_course_rating_learner_name on course_ratings;
create trigger set_course_rating_learner_name
before insert or update on course_ratings
for each row execute procedure set_course_rating_learner_name();

-- Admins can create, edit and delete feedback. The existing unique
-- (user_id, course_id) constraint still prevents duplicate feedback for
-- the same learner and course.
drop policy if exists "Admins can manage course feedback" on course_ratings;
create policy "Admins can manage course feedback"
  on course_ratings for all
  using (is_admin())
  with check (is_admin());

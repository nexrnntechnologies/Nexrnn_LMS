-- =========================================================
-- Nexrnn LMS — Migration 7
-- Run AFTER migration_6.sql.
-- Adds the student's gender field for the learner Profile shown in the LMS.
-- =========================================================

alter table profiles add column if not exists gender text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_gender_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table profiles
      add constraint profiles_gender_check
      check (gender is null or gender in ('male', 'female'));
  end if;
end $$;

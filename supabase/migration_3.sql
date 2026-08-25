-- =========================================================
-- Nexrnn LMS — Migration 3
-- Run this AFTER schema.sql and migration_2.sql
-- Fixes: RLS infinite recursion that was blocking admin actions
-- (only your own user showing in Users, course/module/lesson
-- inserts failing with "violates row-level security policy").
-- =========================================================

-- ---------------------------------------------------------
-- The bug: policies like
--   exists (select 1 from profiles where id = auth.uid() and role = 'admin')
-- query the SAME table (profiles) they're a policy ON, which can
-- recurse indefinitely and breaks admin checks everywhere.
--
-- Fix: a SECURITY DEFINER function bypasses RLS when checking the
-- role, so it never recurses. Every "admin can manage/view" policy
-- below is recreated to use is_admin() instead of the inline subquery.
-- ---------------------------------------------------------
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- profiles
drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles"
  on profiles for select using (is_admin());

-- courses
drop policy if exists "Admins can manage courses" on courses;
create policy "Admins can manage courses"
  on courses for all using (is_admin()) with check (is_admin());

-- modules
drop policy if exists "Admins can manage modules" on modules;
create policy "Admins can manage modules"
  on modules for all using (is_admin()) with check (is_admin());

-- lessons
drop policy if exists "Admins can manage lessons" on lessons;
create policy "Admins can manage lessons"
  on lessons for all using (is_admin()) with check (is_admin());

-- enrollments
drop policy if exists "Admins can view all enrollments" on enrollments;
create policy "Admins can view all enrollments"
  on enrollments for select using (is_admin());

-- lesson_progress
drop policy if exists "Admins can view all lesson progress" on lesson_progress;
create policy "Admins can view all lesson progress"
  on lesson_progress for select using (is_admin());

-- notifications
drop policy if exists "Admins can insert notifications" on notifications;
create policy "Admins can insert notifications"
  on notifications for insert with check (is_admin());

drop policy if exists "Admins can view all notifications" on notifications;
create policy "Admins can view all notifications"
  on notifications for select using (is_admin());

-- communities
drop policy if exists "Admins can manage communities" on communities;
create policy "Admins can manage communities"
  on communities for all using (is_admin()) with check (is_admin());

-- community_posts
drop policy if exists "Admins can manage community posts" on community_posts;
create policy "Admins can manage community posts"
  on community_posts for all using (is_admin()) with check (is_admin());

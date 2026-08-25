-- =========================================================
-- Nexrnn LMS — Migration 2
-- Run this AFTER schema.sql (in Supabase SQL Editor → New query → Run)
-- Safe to re-run — uses IF NOT EXISTS / OR REPLACE throughout.
-- =========================================================

-- ---------------------------------------------------------
-- Capture name + phone at signup (from /createaccount)
-- ---------------------------------------------------------
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------
-- Enrollment details: name/mobile/email snapshot + payment
-- ---------------------------------------------------------
alter table enrollments add column if not exists full_name text;
alter table enrollments add column if not exists mobile text;
alter table enrollments add column if not exists email text;
alter table enrollments add column if not exists payment_ref text;
alter table enrollments add column if not exists status text default 'free';

-- ---------------------------------------------------------
-- Admin visibility into other users' data (read-only)
-- ---------------------------------------------------------
drop policy if exists "Admins can view all enrollments" on enrollments;
create policy "Admins can view all enrollments"
  on enrollments for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admins can view all lesson progress" on lesson_progress;
create policy "Admins can view all lesson progress"
  on lesson_progress for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admins can insert notifications" on notifications;
create policy "Admins can insert notifications"
  on notifications for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admins can view all notifications" on notifications;
create policy "Admins can view all notifications"
  on notifications for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------
-- COMMUNITIES  (admin-managed, linked to a course)
-- ---------------------------------------------------------
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  course_id text references courses(id) on delete set null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

alter table communities enable row level security;
drop policy if exists "Communities are publicly readable" on communities;
create policy "Communities are publicly readable"
  on communities for select using (true);
drop policy if exists "Admins can manage communities" on communities;
create policy "Admins can manage communities"
  on communities for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------
-- COMMUNITY POSTS  (admin posts/announcements to a community)
-- ---------------------------------------------------------
create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  title text,
  body text not null,
  created_at timestamptz default now()
);

alter table community_posts enable row level security;
drop policy if exists "Community posts are publicly readable" on community_posts;
create policy "Community posts are publicly readable"
  on community_posts for select using (true);
drop policy if exists "Admins can manage community posts" on community_posts;
create policy "Admins can manage community posts"
  on community_posts for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

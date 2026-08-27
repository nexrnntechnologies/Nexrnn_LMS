-- =========================================================
-- Nexrnn LMS — Migration 6
-- Run AFTER migration_5.sql.
-- Adds lesson resource links and protects community announcements
-- so only joined members (and admins) can read them.
-- =========================================================

create table if not exists lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id text not null references lessons(id) on delete cascade,
  label text not null,
  url text not null,
  position int default 0,
  created_at timestamptz default now()
);

alter table lesson_resources enable row level security;
drop policy if exists "Lesson resources are readable" on lesson_resources;
create policy "Lesson resources are readable"
  on lesson_resources for select using (true);
drop policy if exists "Admins can manage lesson resources" on lesson_resources;
create policy "Admins can manage lesson resources"
  on lesson_resources for all using (is_admin()) with check (is_admin());

-- Previously community_posts were publicly readable. Replace that policy
-- with a member-only policy. Admins retain full visibility.
drop policy if exists "Community posts are publicly readable" on community_posts;
drop policy if exists "Members and admins can read community posts" on community_posts;
create policy "Members and admins can read community posts"
  on community_posts for select using (
    is_admin() or exists (
      select 1 from community_members
      where community_members.community_id = community_posts.community_id
        and community_members.user_id = auth.uid()
    )
  );

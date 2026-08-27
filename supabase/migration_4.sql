-- =========================================================
-- Nexrnn LMS — Migration 4
-- Run AFTER schema.sql, migration_2.sql and migration_3.sql.
-- Adds: course/lesson media, PDF storage, communities membership,
-- and support requests for the student support form.
-- =========================================================

-- Course demo video and lesson learning material
alter table courses add column if not exists demo_video_url text;
alter table lessons add column if not exists pdf_url text;
alter table lessons add column if not exists content text;

-- ---------------------------------------------------------
-- Public PDF bucket for lesson resources
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('lesson-pdfs', 'lesson-pdfs', true)
on conflict (id) do update set public = true;

drop policy if exists "Admins can upload lesson PDFs" on storage.objects;
create policy "Admins can upload lesson PDFs"
  on storage.objects for insert with check (bucket_id = 'lesson-pdfs' and is_admin());

drop policy if exists "Admins can update lesson PDFs" on storage.objects;
create policy "Admins can update lesson PDFs"
  on storage.objects for update using (bucket_id = 'lesson-pdfs' and is_admin());

drop policy if exists "Admins can delete lesson PDFs" on storage.objects;
create policy "Admins can delete lesson PDFs"
  on storage.objects for delete using (bucket_id = 'lesson-pdfs' and is_admin());

drop policy if exists "Lesson PDFs are publicly readable" on storage.objects;
create policy "Lesson PDFs are publicly readable"
  on storage.objects for select using (bucket_id = 'lesson-pdfs');

-- ---------------------------------------------------------
-- Community membership
-- ---------------------------------------------------------
create table if not exists community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  unique (community_id, user_id)
);

alter table community_members enable row level security;
drop policy if exists "Users can view their community memberships" on community_members;
create policy "Users can view their community memberships"
  on community_members for select using (auth.uid() = user_id or is_admin());

drop policy if exists "Users can join communities" on community_members;
create policy "Users can join communities"
  on community_members for insert with check (auth.uid() = user_id);

drop policy if exists "Users can leave communities" on community_members;
create policy "Users can leave communities"
  on community_members for delete using (auth.uid() = user_id or is_admin());

-- ---------------------------------------------------------
-- Support requests
-- ---------------------------------------------------------
create table if not exists support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  mobile text not null,
  email text not null,
  reason text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table support_requests enable row level security;
drop policy if exists "Users can create support requests" on support_requests;
create policy "Users can create support requests"
  on support_requests for insert with check (auth.uid() = user_id);

drop policy if exists "Users can view their support requests" on support_requests;
create policy "Users can view their support requests"
  on support_requests for select using (auth.uid() = user_id or is_admin());

drop policy if exists "Admins can manage support requests" on support_requests;
create policy "Admins can manage support requests"
  on support_requests for all using (is_admin()) with check (is_admin());

-- Keep updated_at useful when an admin changes status.
create or replace function touch_support_request_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists support_requests_updated_at on support_requests;
create trigger support_requests_updated_at
  before update on support_requests
  for each row execute procedure touch_support_request_updated_at();

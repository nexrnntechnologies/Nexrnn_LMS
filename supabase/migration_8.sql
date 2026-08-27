-- =========================================================
-- Nexrnn LMS — Migration 8
-- Run AFTER migration_7.sql.
-- Adds public landing-page contact queries. No login is needed
-- to submit a query; only admins can read/update saved queries.
-- =========================================================

create table if not exists contact_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  mobile text not null,
  email text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz default now()
);

alter table contact_queries enable row level security;

drop policy if exists "Anyone can submit contact queries" on contact_queries;
create policy "Anyone can submit contact queries"
  on contact_queries for insert with check (true);

drop policy if exists "Admins can manage contact queries" on contact_queries;
create policy "Admins can manage contact queries"
  on contact_queries for all using (is_admin()) with check (is_admin());

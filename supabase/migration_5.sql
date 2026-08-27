-- =========================================================
-- Nexrnn LMS — Migration 5
-- Run AFTER migration_4.sql.
-- Adds admin feedback and clickable links for announcements/notifications.
-- =========================================================

alter table support_requests add column if not exists admin_feedback text;
alter table support_requests add column if not exists feedback_at timestamptz;
alter table community_posts add column if not exists link_url text;
alter table notifications add column if not exists link_url text;

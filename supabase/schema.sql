-- =========================================================
-- Nexrnn LMS — Supabase schema
-- Run this in your Supabase project's SQL editor
-- (Project → SQL Editor → New query → paste → Run)
-- =========================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- PROFILES  (one row per authenticated user, mirrors auth.users)
-- ---------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  company text,
  professional_title text,
  timezone text,
  city text,
  gender text check (gender is null or gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  phone text,
  avatar_url text,
  role text default 'student' check (role in ('student', 'admin')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles"
  on profiles for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone, gender, city)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'gender',
    new.raw_user_meta_data->>'city'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------
-- COURSES
-- ---------------------------------------------------------
create table if not exists courses (
  id text primary key,                 -- e.g. 'digital-marketing'
  tag text not null,
  title text not null,
  description text,
  duration text,
  level text,
  mode text,
  projects int default 0,
  certificate boolean default true,
  course_complete boolean not null default false,
  course_type text not null default 'course' check (course_type in ('course', 'workshop')),
  mentorship boolean default false,
  price numeric not null default 0,
  original_price numeric,
  discount_label text,
  rating numeric default 5,
  reviews int default 0,
  icon text default 'sparkles',        -- lucide icon name, mapped in the frontend
  what_you_learn text[] default '{}',
  who_should_take text[] default '{}',
  faqs jsonb default '[]',             -- [{ "q": "...", "a": "..." }]
  demo_video_url text,
  created_at timestamptz default now()
);

alter table courses enable row level security;
create policy "Courses are publicly readable"
  on courses for select using (true);
create policy "Admins can manage courses"
  on courses for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------
-- MODULES  (grouped lessons within a course)
-- ---------------------------------------------------------
create table if not exists modules (
  id text primary key,                 -- e.g. 'digital-marketing-m1'
  course_id text references courses(id) on delete cascade,
  title text not null,
  position int default 0
);

alter table modules enable row level security;
create policy "Modules are publicly readable"
  on modules for select using (true);
create policy "Admins can manage modules"
  on modules for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------
-- LESSONS
-- ---------------------------------------------------------
create table if not exists lessons (
  id text primary key,                 -- e.g. 'digital-marketing-m1-l1'
  module_id text references modules(id) on delete cascade,
  title text not null,
  type text check (type in ('video','text')) default 'video',
  duration text,
  position int default 0,
  free_preview boolean default false,  -- viewable without enrolling
  video_url text,
  pdf_url text,
  content text
);

alter table lessons enable row level security;
create policy "Lessons are publicly readable"
  on lessons for select using (true);
create policy "Admins can manage lessons"
  on lessons for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Any module/lesson content change reopens an item. Existing certificates
-- remain preserved; only future certificate eligibility is gated.
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
    v_course_id := case when TG_OP = 'DELETE' then OLD.course_id else NEW.course_id end;
  elsif TG_OP = 'DELETE' then
    select course_id into v_course_id from modules where id = OLD.module_id;
  else
    select course_id into v_course_id from modules where id = NEW.module_id;
  end if;
  if v_course_id is not null then update courses set course_complete = false where id = v_course_id; end if;
  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;

drop trigger if exists mark_course_ongoing_on_module_change on modules;
create trigger mark_course_ongoing_on_module_change after insert or update or delete on modules
for each row execute procedure mark_course_ongoing_after_content_change();
drop trigger if exists mark_course_ongoing_on_lesson_change on lessons;
create trigger mark_course_ongoing_on_lesson_change after insert or update or delete on lessons
for each row execute procedure mark_course_ongoing_after_content_change();

-- ---------------------------------------------------------
-- LESSON RESOURCES
-- ---------------------------------------------------------
create table if not exists lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id text not null references lessons(id) on delete cascade,
  label text not null,
  url text not null,
  position int default 0,
  created_at timestamptz default now()
);

alter table lesson_resources enable row level security;
create policy "Lesson resources are publicly readable"
  on lesson_resources for select using (true);
create policy "Admins can manage lesson resources"
  on lesson_resources for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------
-- ENROLLMENTS  (which user is enrolled in which course)
-- ---------------------------------------------------------
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id text references courses(id) on delete cascade,
  full_name text,
  mobile text,
  email text,
  payment_ref text,
  status text default 'free',
  enrolled_at timestamptz default now(),
  unique (user_id, course_id)
);

alter table enrollments enable row level security;
create policy "Users can view their own enrollments"
  on enrollments for select using (auth.uid() = user_id);
create policy "Users can enroll themselves"
  on enrollments for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- LESSON PROGRESS
-- ---------------------------------------------------------
create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  lesson_id text references lessons(id) on delete cascade,
  done boolean default false,
  updated_at timestamptz default now(),
  unique (user_id, lesson_id)
);

alter table lesson_progress enable row level security;
create policy "Users can view their own progress"
  on lesson_progress for select using (auth.uid() = user_id);
create policy "Users can upsert their own progress"
  on lesson_progress for insert with check (auth.uid() = user_id);
create policy "Users can update their own progress"
  on lesson_progress for update using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- COURSE RATINGS  (one star rating + comment per completed course)
-- ---------------------------------------------------------
create table if not exists course_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id text references courses(id) on delete cascade,
  learner_name text,
  stars int check (stars between 1 and 5) not null,
  comment text,
  created_at timestamptz default now(),
  unique (user_id, course_id)
);

alter table course_ratings enable row level security;
create policy "Ratings are publicly readable"
  on course_ratings for select using (true);
create policy "Users can rate courses they're enrolled in"
  on course_ratings for insert with check (auth.uid() = user_id);
-- Ratings are intentionally insert-only; the unique (user_id, course_id)
-- constraint makes each learner's rating one-time per course.

-- ---------------------------------------------------------
-- CERTIFICATES
-- ---------------------------------------------------------
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  registration_id text not null unique,
  certificate_id text not null unique,
  certificate_type text not null default 'Course' check (certificate_type in ('Course', 'Workshop')),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references courses(id) on delete cascade,
  student_name text not null,
  course_title text not null,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table certificates enable row level security;
create policy "Certificates are publicly verifiable"
  on certificates for select using (true);
create policy "Users can issue their own certificates"
  on certificates for insert with check (auth.uid() = user_id);

-- The same guarded RPC is used for courses and workshops. It preserves the
-- original certificate ID/date on repeat calls and enforces the admin gate.
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
  v_course_type text;
  v_certificate_type text;
  v_certificate_id text;
begin
  if v_user_id is null then raise exception 'You must be signed in to issue a certificate.'; end if;
  select title, course_complete, certificate, coalesce(course_type, 'course')
    into v_course_title, v_course_complete, v_certificate_available, v_course_type
    from courses where id = p_course_id;
  if v_course_title is null then raise exception 'Course or workshop not found.'; end if;
  if coalesce(v_certificate_available, true) is not true then raise exception 'This item does not issue a certificate.'; end if;
  if coalesce(v_course_complete, false) is not true then raise exception 'This item is still ongoing. The certificate will be available after the admin marks it complete.'; end if;
  if not exists (select 1 from enrollments where user_id = v_user_id and course_id = p_course_id) then raise exception 'You are not enrolled in this item.'; end if;
  select count(*) into v_total from lessons l join modules m on m.id = l.module_id where m.course_id = p_course_id;
  select count(*) into v_done from lesson_progress lp join lessons l on l.id = lp.lesson_id join modules m on m.id = l.module_id where lp.user_id = v_user_id and lp.done = true and m.course_id = p_course_id;
  if v_total = 0 or v_done < v_total then raise exception 'Complete every lesson before issuing a certificate.'; end if;
  select nullif(trim(concat_ws(' ', first_name, last_name)), '') into v_student_name from profiles where id = v_user_id;
  v_student_name := coalesce(v_student_name, 'Nexrnn Learner');
  v_certificate_type := case when v_course_type = 'workshop' then 'Workshop' else 'Course' end;
  v_certificate_id := 'NXR-CERT-' || upper(substr(encode(digest(v_user_id::text || ':' || p_course_id || ':nexrnn-certificate', 'sha256'), 'hex'), 1, 12));
  insert into certificates (registration_id, certificate_id, certificate_type, user_id, course_id, student_name, course_title)
    values (v_certificate_id, v_certificate_id, v_certificate_type, v_user_id, p_course_id, v_student_name, v_course_title)
    on conflict (user_id, course_id) do update set student_name = excluded.student_name, course_title = excluded.course_title;
  return query select * from certificates where user_id = v_user_id and course_id = p_course_id limit 1;
end;
$$;

grant execute on function issue_certificate(text) to authenticated;

create or replace function protect_certificate_identity()
returns trigger as $$
begin
  if NEW.certificate_id is distinct from OLD.certificate_id or NEW.registration_id is distinct from OLD.registration_id or NEW.issued_at is distinct from OLD.issued_at then
    raise exception 'Certificate ID and issue date cannot be changed after issue.';
  end if;
  return NEW;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists protect_certificate_identity on certificates;
create trigger protect_certificate_identity before update on certificates for each row execute procedure protect_certificate_identity();

-- ---------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  text text not null,
  detail text,
  read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;
create policy "Users can view their own notifications"
  on notifications for select using (auth.uid() = user_id);
create policy "Users can update their own notifications"
  on notifications for update using (auth.uid() = user_id);

-- =========================================================
-- SEED DATA — matches the demo courses used in the frontend
-- =========================================================
insert into courses (id, tag, title, description, duration, level, mode, projects, certificate, mentorship, price, original_price, discount_label, rating, reviews, icon, what_you_learn, who_should_take, faqs)
values
(
  'digital-marketing', 'DIGITAL MARKETING', 'Digital Marketing',
  'A practical, campaign-focused course covering everything from SEO to paid ads to analytics.',
  '3 Months', 'Beginner to Advanced', 'Online / Offline (Lucknow)', 4, true, true,
  4999, 9999, '50% OFF', 4.8, 319, 'megaphone',
  array[
    'Plan and run real Google Ads and Meta Ads campaigns',
    'Optimize a Google Business Profile for local visibility',
    'Build and execute a content and social media strategy',
    'Read analytics data and turn it into decisions',
    'Generate and qualify leads for a business'
  ],
  array[
    'Students exploring a digital marketing career',
    'Business owners who want to market in-house',
    'Freelancers looking to add marketing services'
  ],
  '[
    {"q":"Do I need prior experience?","a":"No — the course starts from fundamentals and builds up to campaign management."},
    {"q":"Is this hands-on?","a":"Yes — you will plan and run real ad campaigns as part of the course."},
    {"q":"Is the course online or offline?","a":"Both — you can join online or attend in person in Lucknow."},
    {"q":"Will I get a certificate?","a":"Yes, a certificate of completion is issued once you finish the course."},
    {"q":"Is mentorship included?","a":"Yes, mentorship is included with this course."}
  ]'::jsonb
),
(
  'demo', 'DEMO', 'Demo Course', 'A short walkthrough course to preview how Nexrnn''s learning experience works.',
  '1 Week', 'Beginner to Advanced', 'Online', 0, true, false,
  10, 100, '90% OFF', 4.9, 210, 'sparkles',
  array['See how the course platform works', 'Preview the learning experience'],
  array['Anyone curious about Nexrnn courses'],
  '[]'::jsonb
),
(
  'artificial-intelligence', 'ARTIFICIAL INTELLIGENCE', 'Artificial Intelligence',
  'A practical AI course covering fundamentals, generative AI, prompt engineering and real applications.',
  '2 Months', 'Beginner to Intermediate', 'Online', 3, true, false,
  3999, 7999, '50% OFF', 5.0, 46, 'brain-circuit',
  array['Understand core AI & ML concepts', 'Use generative AI tools effectively', 'Write strong prompts', 'Build real AI-powered mini projects'],
  array['Students exploring AI as a career', 'Professionals wanting to use AI tools at work'],
  '[]'::jsonb
),
(
  'web-development', 'WEB DEVELOPMENT', 'Web Development',
  'Build and deploy full websites from scratch — HTML, CSS, JavaScript and modern frameworks.',
  '4 Months', 'Beginner to Mastery', 'Online / Offline (Lucknow)', 6, true, true,
  5999, 11999, '50% OFF', 4.9, 128, 'book-open',
  array['Build responsive websites with HTML, CSS & JavaScript', 'Work with modern frameworks', 'Deploy real projects live'],
  array['Beginners wanting to become web developers', 'Freelancers wanting to build client sites'],
  '[]'::jsonb
)
on conflict (id) do nothing;

insert into modules (id, course_id, title, position) values
('digital-marketing-m1', 'digital-marketing', 'Module 1: Introduction to Digital Marketing', 1),
('digital-marketing-m2', 'digital-marketing', 'Module 2: SEO Fundamentals', 2),
('digital-marketing-m3', 'digital-marketing', 'Module 3: Paid Ads', 3)
on conflict (id) do nothing;

insert into lessons (id, module_id, title, type, duration, position, free_preview) values
('digital-marketing-m1-l1', 'digital-marketing-m1', 'What is Digital Marketing?', 'video', '12 MIN', 1, true),
('digital-marketing-m1-l2', 'digital-marketing-m1', 'Setting up your first campaign', 'video', '18 MIN', 2, true),
('digital-marketing-m1-l3', 'digital-marketing-m1', 'Reading notes & resources', 'text', null, 3, false),
('digital-marketing-m2-l1', 'digital-marketing-m2', 'On-page SEO basics', 'video', '22 MIN', 1, false),
('digital-marketing-m2-l2', 'digital-marketing-m2', 'Keyword research walkthrough', 'video', '16 MIN', 2, false),
('digital-marketing-m3-l1', 'digital-marketing-m3', 'Google Ads & YouTube Ads', 'video', '28 MIN', 1, false),
('digital-marketing-m3-l2', 'digital-marketing-m3', 'Facebook & Instagram Ads', 'video', '24 MIN', 2, false),
('digital-marketing-m3-l3', 'digital-marketing-m3', 'Download your E-Certificate', 'text', null, 3, false)
on conflict (id) do nothing;

insert into courses (
  id, course_type, tag, title, description, duration, level, mode, projects,
  certificate, course_complete, mentorship, price, original_price, discount_label,
  rating, reviews, icon, what_you_learn, who_should_take, faqs
) values (
  'digital-marketing-workshop', 'workshop', 'WORKSHOP', 'Digital Marketing Workshop',
  'A live, practical workshop with guided exercises, expert discussion and an outcome you can use immediately.',
  '2 Days', 'Beginner to Intermediate', 'Online / Offline', 1, true, false, true,
  999, 1999, '50% OFF', 5.0, 0, 'megaphone',
  array['Plan a practical campaign in a guided session', 'Get live feedback from an instructor', 'Leave with a workshop project and next steps'],
  array['Students and working professionals', 'Business owners wanting a focused learning sprint'],
  '[]'::jsonb
) on conflict (id) do nothing;

insert into modules (id, course_id, title, position) values
('digital-marketing-workshop-m1', 'digital-marketing-workshop', 'Workshop Day 1: Plan', 1),
('digital-marketing-workshop-m2', 'digital-marketing-workshop', 'Workshop Day 2: Execute', 2)
on conflict (id) do nothing;

insert into lessons (id, module_id, title, type, duration, position, free_preview) values
('digital-marketing-workshop-m1-l1', 'digital-marketing-workshop-m1', 'Workshop goals and audience', 'video', '20 MIN', 1, true),
('digital-marketing-workshop-m1-l2', 'digital-marketing-workshop-m1', 'Build your campaign brief', 'text', null, 2, false),
('digital-marketing-workshop-m2-l1', 'digital-marketing-workshop-m2', 'Live campaign exercise', 'video', '35 MIN', 1, false),
('digital-marketing-workshop-m2-l2', 'digital-marketing-workshop-m2', 'Workshop project and next steps', 'text', null, 2, false)
on conflict (id) do nothing;

-- =========================================================
-- Making a user an admin (do this after they sign up once):
-- =========================================================
-- update profiles set role = 'admin' where email = 'their@email.com';

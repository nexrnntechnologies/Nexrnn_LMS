# Nexrnn Technologies — LMS

React + Vite + Tailwind CSS student LMS UI for Nexrnn Technologies.
Runs in demo mode without credentials and connects to Supabase when `.env` is configured.

## Features

- **Public LMS portal** — the landing page and course catalog/details/previews are open without login; users sign in or create an account only when enrolling or opening account areas
- **Auth** — email/password sign up (captures name + mobile too) / sign in via Supabase, with a "forgot password" email flow (falls back to open demo mode if Supabase isn't connected yet)
- **Real URL routing** — every page has its own address (see below), not just in-app view switching
- **Per-user data** — dashboard, profile, and progress are loaded per signed-in user from Supabase, not shared demo data
- **Dashboard** (`/my-courses`) — real enrolled courses with live progress, real communities, Rate This Course (stars + comment)
- **Enrollment flow** — captures name/mobile/email (and a payment reference for paid courses) before granting access; free courses (₹0) skip payment; successful enrollment opens a Continue Learning popup
- **Access control** — only enrolled students can open a course's lessons in the player; free-preview lessons can be opened before enrollment
- **Video + PDF learning** — YouTube/Vimeo/watch links are normalized to playable embeds; direct MP4 links use a video player; text lessons can display an in-page PDF viewer
- **Courses** (`/courses`) — full course catalog (Nexrnn card style: price, discount, rating, projects, certificate)
- **Course Detail page** (`/courses/:courseId`) — fee card, demo video, certificate sample, what you'll learn, curriculum accordion, FAQ
- **Free preview lessons** — non-enrolled users can open lessons marked "Free Preview"; other lessons show a "buy the course" popup
- **Course Player** (`/my-courses/:courseId`) — real curriculum with progress persisted to Supabase, plays embedded video links set by admin
- **My Account** (`/my-account`) — read-only Profile with name, mobile, email, gender and permanent User ID; Password, Notifications and Order History; Certificates at `/my-courses/certificates`
- **Certificates** — a completed course gets a unique immutable Certificate ID, a fixed issue date, persistent verified certificate, PDF download and public share/copy link
- **Certificate verification** (`/verify-certificate`) — anyone can verify a certificate ID from the public portal
- Account dropdown — My Dashboard, My Account, Support form, Sign Out (visible after login)
- **Community** (`/community`) — discover and join communities; click a joined community to read announcements (visible after login)
- **Support** (`/support`) — authenticated student support form; requests appear in the admin panel
- **Contact queries** — public landing-page form for name, mobile, email and message; saved to Admin → Queries, with direct email reply and open/in progress/resolved status
- **Course feedback** — completed learners can submit a star rating and written feedback once per course; learner feedback appears in a left-to-right slider on the landing page, course catalog and every course detail view, and in Admin → Course Feedback
- **Admin panel** at a hidden URL — full course/content/user/community/notification/support/query management, learner feedback and website visit analytics (see below)

## Admin panel — what you can manage

| Section | What it does |
|---|---|
| **Overview** | Course / user / enrollment counts, website visits and unique visitors |
| **Courses** | Add, edit, delete courses |
| **Course → Content** | Add/edit/delete modules and lessons; set YouTube/Vimeo/direct video links; upload a PDF or add text content; toggle each lesson **Free Preview** vs **Paid** |
| **Registered Users** | Read, update and delete user profile information; User ID is permanently read-only; certificates are visible but their IDs cannot be edited |

| **Course Enrollments** | See user, course, enrollment date, contact/payment/status data, and open the complete user record |
| **Issued Certificates** | See every issued Certificate ID, User ID, learner, course, issue date, and open the public verification link |
| **Communities** | Create/edit/delete communities and announcements; new announcements notify enrolled students |
| **Notifications** | Send a one-off notification to all users, or to everyone enrolled in a specific course, with an optional redirect link |
| **Support** | Read authenticated student support requests and update their status: Open, In progress or Resolved |
| **Queries** | Read public landing-page questions, set Open/In progress/Resolved, and reply manually through the user's email client |
| **Course Feedback** | Read completed-learner ratings and written feedback |

## URL map

| Page | URL |
|---|---|
| Public LMS landing page | `/` |
| Verify certificate | `/verify-certificate?id=NXR-...` |
| Dashboard / My Courses (login required) | `/my-courses` |
| A specific enrolled course (player) | `/my-courses/digital-marketing` |
| Certificates (login required) | `/my-courses/certificates` |
| Browse all courses (public) | `/courses` |
| Course detail page | `/courses/digital-marketing` |
| My Account | `/my-account` |
| Support form | `/support` |
| Change password | `/my-account/password` |
| Notifications | `/my-account/notifications` |
| Order History | `/my-account/orders` |
| User login | `/login` |
| Create account | `/createaccount` |
| Admin login | `/nexrnn/master_nexrnn/admin/login` |
| Admin panel | `/nexrnn/master_nexrnn/admin` |
| Admin — manage courses | `/nexrnn/master_nexrnn/admin/courses` |
| Admin — course content | `/nexrnn/master_nexrnn/admin/courses/:courseId/content` |
| Admin — users | `/nexrnn/master_nexrnn/admin/users` |
| Admin — user detail | `/nexrnn/master_nexrnn/admin/users/:userId` |
| Admin — course enrollments | `/nexrnn/master_nexrnn/admin/enrollments` |
| Admin — issued certificates | `/nexrnn/master_nexrnn/admin/certificates` |
| Admin — communities | `/nexrnn/master_nexrnn/admin/communities` |
| Admin — send notification | `/nexrnn/master_nexrnn/admin/notifications` |
| Admin — support requests | `/nexrnn/master_nexrnn/admin/support` |
| Admin — public queries | `/nexrnn/master_nexrnn/admin/queries` |
| Admin — course feedback | `/nexrnn/master_nexrnn/admin/course-feedback` |

> Note: URLs use lowercase-with-hyphens (`/my-courses`, `/my-account`) instead of spaces,
> since spaces aren't valid in real URLs (browsers turn them into `%20`). This keeps
> `lms.nexrnn.in/my-courses` etc. clean when you deploy.

## Project structure

```
nexrnn-lms/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── .env.example           # copy to .env and fill in your Supabase project values
├── supabase/
│   ├── schema.sql          # run first, in your Supabase project's SQL editor
│   ├── migration_2.sql     # run second — communities, enrollment contact/payment fields
│   ├── migration_3.sql     # run third — fixes an RLS bug that blocked admin actions
│   ├── migration_4.sql     # run fourth — media/PDF, community joins and support requests
│   ├── migration_5.sql     # run fifth — admin feedback and clickable message links
│   ├── migration_6.sql     # run sixth — lesson links and member-only announcements
│   ├── migration_7.sql     # run seventh — learner Profile gender field
│   ├── migration_8.sql     # run eighth — public landing-page contact queries
│   ├── migration_9.sql     # run ninth — persistent certificate verification records
│   ├── migration_10.sql    # run tenth — immutable user IDs and canonical certificate IDs
│   ├── migration_11.sql    # run eleventh — immutable certificate number and issue date
│   ├── migration_12.sql    # run twelfth — idempotent certificate storage/RPC repair
│   ├── migration_13.sql    # run thirteenth — profile fields, admin user CRUD, one-time ratings and website visits
│   ├── migration_14.sql    # run fourteenth — course completion gate and content-change reset
│   └── migration_15.sql    # run fifteenth — full admin feedback CRUD and learner author names
└── src/
    ├── main.jsx             # wraps the app in <BrowserRouter>
    ├── App.jsx               # all routes are defined here
    ├── index.css
    ├── theme.js               # brand colors
    ├── lib/
    │   ├── supabaseClient.js  # Supabase client (auto-falls back to demo mode if .env is empty)
    │   └── certificates.js    # stable IDs and PDF certificate generation
    ├── context/
    │   └── AuthContext.jsx    # sign in / sign up (with name+mobile) / sign out / reset password / admin role
    ├── layouts/
    │   └── AppLayout.jsx      # NavBar + real per-user course/notification/enroll state
    ├── services/
    │   ├── courses.js         # courses, curriculum, enrollments, progress, ratings
    │   ├── profile.js         # profile + notifications
    │   ├── community.js       # public community + posts lookup
    │   ├── certificates.js    # issue, list and verify certificates
│   ├── contactQueries.js  # public queries + admin query updates
│   ├── analytics.js       # public page-visit tracking
│   └── admin.js           # admin CRUD: courses, content, users, communities, notifications
    ├── data/
    │   └── mockData.js        # demo data (used automatically until Supabase is connected)
    ├── components/
    │   ├── Logo.jsx, NavBar.jsx, CourseCard.jsx, Field.jsx
│   ├── LockedContentModal.jsx   # "buy to unlock" popup
│   ├── LearnerFeedbackSlider.jsx # left-to-right learner feedback slider
│   ├── RateCourseModal.jsx      # one-time star rating + comment
    │   ├── CertificatePanel.jsx     # completed-course certificate + download/share
    │   └── EnrollModal.jsx          # captures name/mobile/email + payment ref before enrolling
    ├── pages/                  # student-facing pages (see URL map above)
    │   ├── LandingView.jsx, VerifyCertificateView.jsx
    │   ├── LoginView.jsx, CreateAccountView.jsx
    │   ├── DashboardView.jsx, CoursesView.jsx, CourseDetailView.jsx
    │   ├── CoursePlayerView.jsx, ProfileView.jsx, CommunityView.jsx
    └── admin/                  # admin panel, separate from student app
        ├── components/AdminLayout.jsx   # sidebar + route guard (requires role = 'admin')
        └── pages/
            ├── AdminLogin.jsx, AdminDashboard.jsx
            ├── AdminCourses.jsx, AdminCourseContent.jsx   # course CRUD + modules/lessons CRUD
            ├── AdminUsers.jsx, AdminUserDetail.jsx        # user list + per-user progress
            ├── AdminCommunities.jsx                       # community CRUD + announcements
            ├── AdminNotifications.jsx                     # broadcast notifications
            ├── AdminSupport.jsx                            # support request inbox
            ├── AdminQueries.jsx                            # public contact query inbox
            └── AdminCourseFeedback.jsx                     # course rating/feedback inbox
```

## How to run

1. **Install Node.js** (v18 or newer) if you don't already have it — [nodejs.org](https://nodejs.org)

2. **Unzip the project** and open a terminal inside the `nexrnn-lms` folder:
   ```bash
   cd nexrnn-lms
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```
   If you ever see an error like `Failed to resolve import "@supabase/supabase-js"` or
   `"react-router-dom"`, it means `npm install` didn't finish — re-run it (delete the
   `node_modules` folder first if it still fails).

4. **Start the dev server (works immediately, no Supabase needed):**
   ```bash
   npm run dev
   ```
   This will print a local URL (usually `http://localhost:5173`) — open it in your browser.
   Without a `.env` file, the app runs in **demo mode** using `src/data/mockData.js` — no sign-in required, and `/my-courses` opens directly.

5. **Build for production:**
   ```bash
   npm run build
   ```
   Output goes to `dist/` — deploy this to Vercel or any static host.
   Since this is a single-page app with client-side routing, make sure your host
   rewrites all unknown paths to `index.html` (Vercel does this automatically for Vite apps).

## Connecting Supabase (optional, do this whenever you're ready)

1. Go to [supabase.com](https://supabase.com), create a free account and a new project.
2. In your project, go to **SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, and click **Run**.
   This creates all tables (courses, modules, lessons, enrollments, ratings, notifications, profiles) and seeds the 4 demo courses.
3. **New query** again, paste the entire contents of `supabase/migration_2.sql`, and click **Run**.
   This adds communities, enrollment contact/payment fields, and lets admins send notifications / view all users.
4. **New query** again, paste the entire contents of `supabase/migration_3.sql`, and click **Run**.
   This fixes an RLS bug (infinite recursion in the admin-role check) that caused only your
   own user to show in **Users**, and blocked adding/editing courses, modules, and lessons
   as admin. **Run this even if you already ran schema.sql + migration_2.sql before.**
5. **New query** again, paste the entire contents of `supabase/migration_4.sql`, and click **Run**.
   This adds course demo video links, lesson PDF/text fields, the public `lesson-pdfs` storage bucket,
   community join records and the `support_requests` table. The PDF upload button in Admin → Content
   needs this migration before it can save files.
6. **New query** again, paste the entire contents of `supabase/migration_5.sql`, and click **Run**.
   This adds admin feedback fields and optional redirect links to notifications and community announcements.
7. **New query** again, paste the entire contents of `supabase/migration_6.sql`, and click **Run**.
   This adds lesson resource links and restricts community announcements to joined members and admins.
8. **New query** again, paste the entire contents of `supabase/migration_7.sql`, and click **Run**.
   This adds the optional `gender` field to learner profiles. Existing profiles remain valid.
9. **New query** again, paste the entire contents of `supabase/migration_8.sql`, and click **Run**.
   This adds the public landing-page `contact_queries` table. Anonymous users can submit; only admins can read/update queries.
10. **New query** again, paste the entire contents of `supabase/migration_9.sql`, and click **Run**.
   This adds persistent certificate records, public ID verification, and a secure completion-checked certificate issuing function.
11. **New query** again, paste the entire contents of `supabase/migration_10.sql`, and click **Run**.
   This backfills an immutable `USR-...` User ID for every existing profile, generates User IDs for future accounts, and adds canonical `NXR-CERT-...` Certificate IDs.
12. **New query** again, paste the entire contents of `supabase/migration_11.sql`, and click **Run**.
   This prevents Certificate ID, Registration ID and issue date from changing after issue.
13. **New query** again, paste the entire contents of `supabase/migration_12.sql`, and click **Run**.
   This is a safe repair that ensures certificate rows and the completion-checked database RPC are present and persist correctly.
14. **New query** again, paste the entire contents of `supabase/migration_13.sql`, and click **Run**.
   This adds Gender and City signup storage, admin user update/delete access, immutable ID protections, one-time completed-course ratings and website visit analytics.
15. **New query** again, paste the entire contents of `supabase/migration_14.sql`, and click **Run**.
   This adds the admin-controlled Course Complete / certificate-ready switch. Ongoing courses never issue a certificate, even at 100% learner progress. Any later module or lesson change automatically resets the course to Ongoing, while existing certificates remain preserved.
16. **New query** again, paste the entire contents of `supabase/migration_15.sql`, and click **Run**.
   This adds the learner author name and full admin create/edit/delete controls for Course Feedback.
17. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.
18. In the project folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
19. Open `.env` and paste in your values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
20. Restart the dev server (`npm run dev`). The app will now:
   - Require sign in / sign up at `/login` (name, mobile, gender and city are captured at `/createaccount`)
   - Load courses from your `courses` table instead of demo data
   - Save enrollments (with contact + payment details), lesson progress, one-time ratings and notifications per signed-in user
   - Display immutable User IDs and Certificate IDs
   - Open a unique certificate with the student's profile name and completed course at `/my-courses/certificates`, with download and share-link actions
   - Record public page visits for the admin Overview dashboard
   - Only let a signed-in, enrolled student open that course's lessons

You can go back to demo mode anytime by removing/renaming `.env`.

## Setting up the Admin Panel

The admin panel shares the same Supabase user accounts — it just checks a `role` column.

1. Connect Supabase first (steps above, including `migration_2.sql`, `migration_3.sql`, `migration_4.sql`, `migration_5.sql`, `migration_6.sql`, `migration_7.sql`, `migration_8.sql`, `migration_9.sql`, `migration_10.sql`, `migration_11.sql`, `migration_12.sql`, `migration_13.sql`, `migration_14.sql` and `migration_15.sql`).
2. Sign up a normal account at `/createaccount` with the email you want to use as admin.
3. In Supabase's SQL Editor, run:
   ```sql
   update profiles set role = 'admin' where email = 'youradmin@email.com';
   ```
4. Go to `/nexrnn/master_nexrnn/admin/login` and sign in with that account.
5. You'll land on `/nexrnn/master_nexrnn/admin` — from there you can:
   - **Courses** — add, edit, or delete courses
   - **Course → Content** — add/edit modules and lessons, set a YouTube/Vimeo/video link, upload a PDF for text lessons, and mark it Free Preview or Paid
   - **Registered Users** — read, update and delete user profile information; User IDs and Certificate IDs are always read-only
   - **Course Enrollments** — see each user/course enrollment with date, contact, payment, status, and a View action
   - **Communities** — create/edit/delete communities linked to a course, and create/edit/delete announcements (new announcements auto-notify enrolled students)
   - **Notifications** — send a message to all users, or to everyone enrolled in one course, with an optional internal or external redirect link
   - **Queries** — manage public landing-page questions, set Open/In progress/Resolved, and reply manually through the user's email client
   - **Course Feedback** — add, edit and delete feedback on behalf of a selected learner; the selected learner name is shown publicly
   - **Overview** — view website visits and unique visitors captured from public pages
   - **Courses** — tick **Course complete / certificate ready** only after all content is final; leave it unticked for ongoing courses

A non-admin account (or no account) trying to reach any `/nexrnn/master_nexrnn/admin/*`
URL is automatically redirected to the admin login page.



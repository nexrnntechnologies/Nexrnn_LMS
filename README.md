# Nexrnn Technologies — LMS

React + Vite + Tailwind CSS student LMS UI for Nexrnn Technologies.
Currently runs on mock/demo data (no backend yet).

## Features

- **Auth** — email/password sign up (captures name + mobile too) / sign in via Supabase, with a "forgot password" email flow (falls back to open demo mode if Supabase isn't connected yet)
- **Real URL routing** — every page has its own address (see below), not just in-app view switching
- **Per-user data** — dashboard, profile, and progress are loaded per signed-in user from Supabase, not shared demo data
- **Dashboard** (`/my-courses`) — real enrolled courses with live progress, real communities, Rate This Course (stars + comment)
- **Enrollment flow** — captures name/mobile/email (and a payment reference for paid courses) before granting access; free courses (₹0) skip payment
- **Access control** — only enrolled students can open a course's lessons in the player; everyone else is bounced to the course detail page
- **Courses** (`/courses`) — full course catalog (Nexrnn card style: price, discount, rating, projects, certificate)
- **Course Detail page** (`/courses/:courseId`) — fee card, demo video, certificate sample, what you'll learn, curriculum accordion, FAQ
- **Free preview lessons** — non-enrolled users can open lessons marked "Free Preview"; other lessons show a "buy the course" popup
- **Course Player** (`/my-courses/:courseId`) — real curriculum with progress persisted to Supabase, plays embedded video links set by admin
- **My Account** (`/my-account`) — Profile (loads/saves real data), Password, Notifications, Billing, Order History; Certificates at `/my-courses/certificates`
- Account dropdown — My Dashboard, My Account, Support (mailto to nexrnntechnologies@gmail.com, with a copy-to-clipboard fallback), Sign Out
- **Admin panel** at a hidden URL — full course/content/user/community/notification management (see below)

## Admin panel — what you can manage

| Section | What it does |
|---|---|
| **Overview** | Course / user / enrollment counts |
| **Courses** | Add, edit, delete courses |
| **Course → Content** | Add/delete modules and lessons per course; set a video embed URL and duration; toggle each lesson **Free Preview** vs **Paid** |
| **Users** | List everyone who signed up; click **View** for their profile + per-course enrollment progress |
| **Communities** | Create/edit/delete communities (each optionally linked to a course); post announcements — this both saves the post and sends a notification to everyone enrolled in the linked course |
| **Notifications** | Send a one-off notification to all users, or to everyone enrolled in a specific course |

## URL map

| Page | URL |
|---|---|
| Dashboard / My Courses | `/my-courses` |
| A specific enrolled course (player) | `/my-courses/digital-marketing` |
| Certificates | `/my-courses/certificates` |
| Browse all courses | `/courses` |
| Course detail page | `/courses/digital-marketing` |
| My Account | `/my-account` |
| Change password | `/my-account/password` |
| Notifications | `/my-account/notifications` |
| Billing | `/my-account/billing` |
| Order History | `/my-account/orders` |
| User login | `/login` |
| Create account | `/createaccount` |
| Admin login | `/nexrnn/master_nexrnn/admin/login` |
| Admin panel | `/nexrnn/master_nexrnn/admin` |
| Admin — manage courses | `/nexrnn/master_nexrnn/admin/courses` |
| Admin — course content | `/nexrnn/master_nexrnn/admin/courses/:courseId/content` |
| Admin — users | `/nexrnn/master_nexrnn/admin/users` |
| Admin — user detail | `/nexrnn/master_nexrnn/admin/users/:userId` |
| Admin — communities | `/nexrnn/master_nexrnn/admin/communities` |
| Admin — send notification | `/nexrnn/master_nexrnn/admin/notifications` |

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
│   └── migration_3.sql     # run third — fixes an RLS bug that blocked admin actions
└── src/
    ├── main.jsx             # wraps the app in <BrowserRouter>
    ├── App.jsx               # all routes are defined here
    ├── index.css
    ├── theme.js               # brand colors
    ├── lib/
    │   └── supabaseClient.js  # Supabase client (auto-falls back to demo mode if .env is empty)
    ├── context/
    │   └── AuthContext.jsx    # sign in / sign up (with name+mobile) / sign out / reset password / admin role
    ├── layouts/
    │   └── AppLayout.jsx      # NavBar + real per-user course/notification/enroll state
    ├── services/
    │   ├── courses.js         # courses, curriculum, enrollments, progress, ratings
    │   ├── profile.js         # profile + notifications
    │   ├── community.js       # public community + posts lookup
    │   └── admin.js           # admin CRUD: courses, content, users, communities, notifications
    ├── data/
    │   └── mockData.js        # demo data (used automatically until Supabase is connected)
    ├── components/
    │   ├── Logo.jsx, NavBar.jsx, CourseCard.jsx, Field.jsx
    │   ├── LockedContentModal.jsx   # "buy to unlock" popup
    │   ├── RateCourseModal.jsx      # star rating + comment
    │   └── EnrollModal.jsx          # captures name/mobile/email + payment ref before enrolling
    ├── pages/                  # student-facing pages (see URL map above)
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
            └── AdminNotifications.jsx                     # broadcast notifications
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
4. **New query** once more, paste the entire contents of `supabase/migration_3.sql`, and click **Run**.
   This fixes an RLS bug (infinite recursion in the admin-role check) that caused only your
   own user to show in **Users**, and blocked adding/editing courses, modules, and lessons
   as admin. **Run this even if you already ran schema.sql + migration_2.sql before.**
4. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.
5. In the project folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
6. Open `.env` and paste in your values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
7. Restart the dev server (`npm run dev`). The app will now:
   - Require sign in / sign up at `/login` (name + mobile are captured at `/createaccount`)
   - Load courses from your `courses` table instead of demo data
   - Save enrollments (with contact + payment details), lesson progress, ratings, and notifications per signed-in user
   - Only let a signed-in, enrolled student open that course's lessons

You can go back to demo mode anytime by removing/renaming `.env`.

## Setting up the Admin Panel

The admin panel shares the same Supabase user accounts — it just checks a `role` column.

1. Connect Supabase first (steps above, including `migration_2.sql` and `migration_3.sql`).
2. Sign up a normal account at `/createaccount` with the email you want to use as admin.
3. In Supabase's SQL Editor, run:
   ```sql
   update profiles set role = 'admin' where email = 'youradmin@email.com';
   ```
4. Go to `/nexrnn/master_nexrnn/admin/login` and sign in with that account.
5. You'll land on `/nexrnn/master_nexrnn/admin` — from there you can:
   - **Courses** — add, edit, or delete courses
   - **Course → Content** — add modules/lessons, set each lesson's video link, and mark it Free Preview or Paid
   - **Users** — see everyone who signed up, and click into any user to see their enrollments + real progress
   - **Communities** — create/edit/delete communities linked to a course, and post announcements (auto-notifies enrolled students)
   - **Notifications** — send a message to all users, or to everyone enrolled in one course

A non-admin account (or no account) trying to reach any `/nexrnn/master_nexrnn/admin/*`
URL is automatically redirected to the admin login page.



# Nexrnn Technologies — LMS

React + Vite + Tailwind CSS student LMS UI for Nexrnn Technologies.
Currently runs on mock/demo data (no backend yet).

## Features

- **Auth** — email/password sign in / sign up via Supabase (falls back to open demo mode if Supabase isn't connected yet)
- **Dashboard** — enrolled courses with progress, communities, Rate This Course (stars + comment)
- **Courses** — full course catalog (Nexrnn card style: price, discount, rating, projects, certificate)
- **Course Detail page** ("View Course") — fee card, demo video, certificate sample, what you'll learn, curriculum accordion, FAQ
- **Free preview lessons** — non-enrolled users can open lessons marked "Free Preview"; other lessons show a "buy the course" popup
- **Course Player** — module/lesson sidebar, video area, lesson completion tracking
- **Profile / My Account** — Profile, Password, Certificates, Notifications, Billing, Order History tabs
- Account dropdown — My Dashboard, My Account, Support (opens email to nexrnntechnologies@gmail.com), Sign Out

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
│   └── schema.sql          # run this in your Supabase project's SQL editor
└── src/
    ├── main.jsx
    ├── App.jsx              # root state + view switching
    ├── index.css
    ├── theme.js              # brand colors
    ├── lib/
    │   └── supabaseClient.js # Supabase client (auto-falls back to demo mode if .env is empty)
    ├── context/
    │   └── AuthContext.jsx   # sign in / sign up / sign out
    ├── services/
    │   ├── courses.js        # courses, curriculum, enrollments, ratings
    │   └── profile.js        # profile + notifications
    ├── data/
    │   └── mockData.js       # demo data (used automatically until Supabase is connected)
    ├── components/
    │   ├── Logo.jsx, NavBar.jsx, CourseCard.jsx, Field.jsx
    │   ├── LockedContentModal.jsx   # "buy to unlock" popup
    │   └── RateCourseModal.jsx      # star rating + comment
    └── pages/
        ├── AuthView.jsx
        ├── DashboardView.jsx
        ├── CoursesView.jsx
        ├── CourseDetailView.jsx     # the "View Course" page
        ├── CoursePlayerView.jsx
        ├── ProfileView.jsx
        └── CommunityView.jsx
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

4. **Start the dev server (works immediately, no Supabase needed):**
   ```bash
   npm run dev
   ```
   This will print a local URL (usually `http://localhost:5173`) — open it in your browser.
   Without a `.env` file, the app runs in **demo mode** using `src/data/mockData.js` — no sign-in required.

5. **Build for production:**
   ```bash
   npm run build
   ```
   Output goes to `dist/` — deploy this to Vercel or any static host.

## Connecting Supabase (optional, do this whenever you're ready)

1. Go to [supabase.com](https://supabase.com), create a free account and a new project.
2. In your project, go to **SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, and click **Run**.
   This creates all tables (courses, modules, lessons, enrollments, ratings, notifications, profiles) and seeds the 4 demo courses.
3. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.
4. In the project folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Open `.env` and paste in your values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
6. Restart the dev server (`npm run dev`). The app will now:
   - Require sign in / sign up (via Supabase Auth)
   - Load courses from your `courses` table instead of demo data
   - Save enrollments, lesson progress, ratings, and notifications per signed-in user

You can go back to demo mode anytime by removing/renaming `.env`.

"# Nexrnn_LMS" 

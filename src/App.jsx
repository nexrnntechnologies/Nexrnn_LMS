import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar.jsx";
import DashboardView from "./pages/DashboardView.jsx";
import CoursesView from "./pages/CoursesView.jsx";
import CourseDetailView from "./pages/CourseDetailView.jsx";
import CoursePlayerView from "./pages/CoursePlayerView.jsx";
import ProfileView from "./pages/ProfileView.jsx";
import CommunityView from "./pages/CommunityView.jsx";
import AuthView from "./pages/AuthView.jsx";
import RateCourseModal from "./components/RateCourseModal.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { fetchCourses } from "./services/courses.js";
import { CURRICULUM_BY_COURSE, INITIAL_MY_COURSES, INITIAL_NOTIFICATIONS } from "./data/mockData";

export default function App() {
  const { user, loading, signOut, isSupabaseConfigured } = useAuth();

  const [courses, setCourses] = useState([]);
  const [view, setView] = useState("dashboard");
  const [myCourses, setMyCourses] = useState(INITIAL_MY_COURSES);
  const [activeCourse, setActiveCourse] = useState(INITIAL_MY_COURSES[0]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [ratingCourse, setRatingCourse] = useState(null);

  useEffect(() => {
    fetchCourses().then(setCourses);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const enrolledIds = myCourses.map((c) => c.id);

  const openCourse = (course) => {
    setActiveCourse(course);
    setActiveLessonId(null);
    setView("player");
  };

  const openCourseDetail = (course) => {
    setActiveCourse(course);
    setView("course-detail");
  };

  const startLesson = (course, lesson) => {
    setActiveCourse(course);
    setActiveLessonId(lesson.id);
    setView("player");
  };

  const enrollCourse = (course) => {
    setMyCourses((prev) =>
      prev.some((c) => c.id === course.id) ? prev : [...prev, { ...course, progress: 0 }]
    );
    setActiveCourse(course);
    setActiveLessonId(null);
    setView("player");
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (n) => {
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    setNotifOpen(false);
    setView("community");
  };

  const handleRateSubmit = ({ stars, comment }) => {
    // Persisted via Supabase in src/services/courses.js -> submitRating()
    // once a project is connected; kept local here so the UI still works
    // in demo mode with no backend configured.
    console.log("Rating submitted", { course: ratingCourse?.id, stars, comment });
  };

  // While Supabase is configured but session hasn't resolved yet
  if (isSupabaseConfigured && loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading…</div>;
  }

  // Require sign-in only once a real Supabase project is connected.
  // In demo mode (no .env set up yet) the app skips straight to the UI.
  if (isSupabaseConfigured && !user) {
    return <AuthView />;
  }

  const curriculum = CURRICULUM_BY_COURSE[activeCourse?.id] || [];

  return (
    <div
      className="min-h-screen bg-slate-50 font-sans"
      onClick={() => { setNotifOpen(false); setProfileOpen(false); }}
    >
      <NavBar
        view={view}
        setView={setView}
        notifOpen={notifOpen}
        setNotifOpen={setNotifOpen}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        onOpenNotifications={markAllRead}
        onNotificationClick={handleNotificationClick}
        onSignOut={signOut}
      />

      {view === "dashboard" && (
        <DashboardView openCourse={openCourse} myCourses={myCourses} onRate={setRatingCourse} />
      )}
      {view === "courses" && (
        <CoursesView
          courses={courses}
          onView={openCourse}
          onViewDetail={openCourseDetail}
          onEnroll={enrollCourse}
          enrolledIds={enrolledIds}
        />
      )}
      {view === "course-detail" && (
        <CourseDetailView
          course={activeCourse}
          curriculum={curriculum}
          enrolled={enrolledIds.includes(activeCourse?.id)}
          onBack={() => setView("courses")}
          onEnroll={enrollCourse}
          onStartLesson={startLesson}
        />
      )}
      {view === "player" && (
        <CoursePlayerView course={activeCourse} setView={setView} initialLessonId={activeLessonId} />
      )}
      {view === "profile" && (
        <ProfileView notifications={notifications} enrolledCourses={myCourses} />
      )}
      {view === "community" && <CommunityView />}

      {ratingCourse && (
        <RateCourseModal
          course={ratingCourse}
          onSubmit={handleRateSubmit}
          onClose={() => setRatingCourse(null)}
        />
      )}
    </div>
  );
}

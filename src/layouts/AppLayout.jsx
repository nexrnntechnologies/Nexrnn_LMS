import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, Navigate } from "react-router-dom";
import NavBar from "../components/NavBar.jsx";
import RateCourseModal from "../components/RateCourseModal.jsx";
import EnrollModal from "../components/EnrollModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchCourses, fetchMyCourses, enrollInCourse, submitRating } from "../services/courses.js";
import { fetchNotifications, markNotificationsRead } from "../services/profile.js";
import { INITIAL_MY_COURSES, INITIAL_NOTIFICATIONS } from "../data/mockData";

export default function AppLayout() {
  const { user, profile, signOut, loading, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState(isSupabaseConfigured ? [] : INITIAL_MY_COURSES);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(isSupabaseConfigured ? [] : INITIAL_NOTIFICATIONS);
  const [ratingCourse, setRatingCourse] = useState(null);
  const [enrollTarget, setEnrollTarget] = useState(null);
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  const reloadMyCourses = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return;
    const data = await fetchMyCourses(user.id);
    setMyCourses(data);
  }, [user, isSupabaseConfigured]);

  useEffect(() => {
    fetchCourses().then(setCourses);
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured && user) {
      reloadMyCourses();
      fetchNotifications(user.id).then(setNotifications);
    }
  }, [user, isSupabaseConfigured, reloadMyCourses]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const enrolledIds = myCourses.map((c) => c.id);

  // Opens the enroll modal instead of enrolling immediately, so we can
  // capture contact details (and a payment reference for paid courses).
  const requestEnroll = (course) => {
    setEnrollError("");
    setEnrollTarget(course);
  };

  const confirmEnroll = async (details) => {
    if (!enrollTarget) return;

    if (!isSupabaseConfigured || !user) {
      // Demo mode: just add it locally so the flow is still testable.
      setMyCourses((prev) =>
        prev.some((c) => c.id === enrollTarget.id) ? prev : [...prev, { ...enrollTarget, progress: 0 }]
      );
      setEnrollTarget(null);
      navigate(`/my-courses/${enrollTarget.id}`);
      return;
    }

    setEnrollSubmitting(true);
    setEnrollError("");
    const { error } = await enrollInCourse(user.id, enrollTarget.id, details);
    setEnrollSubmitting(false);

    if (error) {
      setEnrollError(error.message);
      return;
    }

    await reloadMyCourses();
    setEnrollTarget(null);
    navigate(`/my-courses/${enrollTarget.id}`);
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (isSupabaseConfigured && user) {
      await markNotificationsRead(user.id, notifications.filter((n) => !n.read).map((n) => n.id));
    }
  };

  const handleNotificationClick = async (n) => {
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    setNotifOpen(false);
    if (isSupabaseConfigured && user) await markNotificationsRead(user.id, [n.id]);
    navigate("/community");
  };

  const handleRateSubmit = async ({ stars, comment }) => {
    if (isSupabaseConfigured && user && ratingCourse) {
      await submitRating(user.id, ratingCourse.id, stars, comment);
    }
  };

  const userLabel = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email
    : user?.email;

  // Only require sign-in once a real Supabase project is connected.
  // In demo mode (no .env set up yet) the app skips straight to the UI.
  if (isSupabaseConfigured && loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading…</div>;
  }
  if (isSupabaseConfigured && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans" onClick={() => { setNotifOpen(false); setProfileOpen(false); }}>
      <NavBar
        notifOpen={notifOpen}
        setNotifOpen={setNotifOpen}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        onOpenNotifications={markAllRead}
        onNotificationClick={handleNotificationClick}
        onSignOut={signOut}
        userLabel={userLabel}
      />

      <Outlet
        context={{
          courses,
          myCourses,
          enrolledIds,
          enrollCourse: requestEnroll,
          reloadMyCourses,
          notifications,
          setRatingCourse,
        }}
      />

      {ratingCourse && (
        <RateCourseModal course={ratingCourse} onSubmit={handleRateSubmit} onClose={() => setRatingCourse(null)} />
      )}

      {enrollTarget && (
        <EnrollModal
          course={enrollTarget}
          defaultValues={{
            fullName: [profile?.first_name, profile?.last_name].filter(Boolean).join(" "),
            mobile: profile?.phone || "",
            email: profile?.email || user?.email || "",
          }}
          onConfirm={confirmEnroll}
          onClose={() => setEnrollTarget(null)}
          submitting={enrollSubmitting}
          error={enrollError}
        />
      )}
    </div>
  );
}

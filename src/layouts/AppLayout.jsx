import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar.jsx";
import RateCourseModal from "../components/RateCourseModal.jsx";
import EnrollModal from "../components/EnrollModal.jsx";
import EnrollmentSuccessModal from "../components/EnrollmentSuccessModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchCourses, fetchMyCourses, enrollInCourse, submitRating, fetchCourseRatings, getDemoCourseRatings } from "../services/courses.js";
import { fetchNotifications, markNotificationsRead } from "../services/profile.js";
import { INITIAL_MY_COURSES, INITIAL_NOTIFICATIONS } from "../data/mockData";

export default function AppLayout() {
  const { user, profile, signOut, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [myCourses, setMyCourses] = useState(isSupabaseConfigured ? [] : INITIAL_MY_COURSES);
  const [myCoursesLoading, setMyCoursesLoading] = useState(isSupabaseConfigured);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(isSupabaseConfigured ? [] : INITIAL_NOTIFICATIONS);
  const [courseRatings, setCourseRatings] = useState(isSupabaseConfigured ? [] : getDemoCourseRatings());
  const [ratingCourse, setRatingCourse] = useState(null);
  const [enrollTarget, setEnrollTarget] = useState(null);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(null);
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  const reloadMyCourses = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setMyCoursesLoading(false);
      return;
    }
    setMyCoursesLoading(true);
    try {
      setMyCourses(await fetchMyCourses(user.id));
    } finally {
      setMyCoursesLoading(false);
    }
  }, [user, isSupabaseConfigured]);

  useEffect(() => {
    fetchCourses().then((data) => {
      setCourses(data);
      setCoursesLoading(false);
    });
    fetchCourseRatings().then(setCourseRatings);
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured && user) {
      reloadMyCourses();
      fetchNotifications(user.id).then(setNotifications);
    }
  }, [user, isSupabaseConfigured, reloadMyCourses]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const enrolledIds = myCourses.map((course) => course.id);

  const requestEnroll = (course) => {
    if (isSupabaseConfigured && !user) {
      navigate("/login", { state: { from: `/courses/${course.id}` } });
      return;
    }
    if (enrolledIds.includes(course.id)) {
      navigate(`/my-courses/${course.id}`);
      return;
    }
    setEnrollError("");
    setEnrollTarget(course);
  };

  const confirmEnroll = async (details) => {
    const target = enrollTarget;
    if (!target) return;

    if (!isSupabaseConfigured || !user) {
      setMyCourses((current) => current.some((course) => course.id === target.id) ? current : [...current, { ...target, progress: 0 }]);
      setEnrollTarget(null);
      setEnrollmentSuccess(target);
      return;
    }

    setEnrollSubmitting(true);
    setEnrollError("");
    const { error } = await enrollInCourse(user.id, target.id, details);
    setEnrollSubmitting(false);

    if (error) {
      setEnrollError(error.message);
      return;
    }

    await reloadMyCourses();
    setEnrollTarget(null);
    setEnrollmentSuccess(target);
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((notification) => !notification.read).map((notification) => notification.id);
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
    if (isSupabaseConfigured && user && unreadIds.length) await markNotificationsRead(user.id, unreadIds);
  };

  const handleNotificationClick = async (notification) => {
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item));
    setNotifOpen(false);
    const destination = notification.linkUrl || notification.link_url;
    const isExternal = destination && /^https?:\/\//i.test(destination);
    // Start the browser navigation synchronously from the click event; waiting
    // for Supabase first can make popup blockers reject window.open.
    if (isExternal) window.open(destination, "_blank", "noopener,noreferrer");
    else navigate(destination || "/community");
    if (isSupabaseConfigured && user) await markNotificationsRead(user.id, [notification.id]);
  };

  const handleRateSubmit = async ({ stars, comment }) => {
    if (!ratingCourse) return { error: { message: "Please select a course first." } };
    const currentUserId = isSupabaseConfigured ? user?.id : "demo-user";
    if (courseRatings.some((rating) => rating.user_id === currentUserId && rating.course_id === ratingCourse.id)) {
      return { error: { message: "You have already rated this course. Each course can be rated only once." } };
    }
    if (!isSupabaseConfigured || !user) {
      setCourseRatings((current) => {
        const next = [{ id: `demo-${ratingCourse.id}`, user_id: currentUserId, course_id: ratingCourse.id, courseTitle: ratingCourse.title, stars, comment, created_at: new Date().toISOString() }, ...current];
        try { localStorage.setItem("nexrnn_demo_feedback", JSON.stringify(next.filter((rating) => rating.user_id === "demo-user"))); } catch { /* demo persistence is optional */ }
        return next;
      });
      return { error: null };
    }
    const result = await submitRating(user.id, ratingCourse.id, stars, comment);
    if (!result.error) setCourseRatings(await fetchCourseRatings());
    return result;
  };

  const userLabel = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email
    : user?.email;

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
        isAuthenticated={Boolean(user)}
      />

      <Outlet context={{ courses, coursesLoading, myCourses, myCoursesLoading, enrolledIds, enrollCourse: requestEnroll, reloadMyCourses, notifications, courseRatings, setRatingCourse }} />

      {ratingCourse && <RateCourseModal course={ratingCourse} onSubmit={handleRateSubmit} onClose={() => setRatingCourse(null)} />}
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
      {enrollmentSuccess && (
        <EnrollmentSuccessModal
          course={enrollmentSuccess}
          onClose={() => setEnrollmentSuccess(null)}
          onContinue={() => { const course = enrollmentSuccess; setEnrollmentSuccess(null); navigate(`/my-courses/${course.id}`); }}
          onDashboard={() => { setEnrollmentSuccess(null); navigate("/my-courses"); }}
        />
      )}
    </div>
  );
}

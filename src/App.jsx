import React from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import LandingView from "./pages/LandingView.jsx";
import VerifyCertificateView from "./pages/VerifyCertificateView.jsx";
import DashboardView from "./pages/DashboardView.jsx";
import CoursesView from "./pages/CoursesView.jsx";
import CourseDetailView from "./pages/CourseDetailView.jsx";
import CoursePlayerView from "./pages/CoursePlayerView.jsx";
import ProfileView from "./pages/ProfileView.jsx";
import CommunityView from "./pages/CommunityView.jsx";
import SupportView from "./pages/SupportView.jsx";
import LoginView from "./pages/LoginView.jsx";
import CreateAccountView from "./pages/CreateAccountView.jsx";
import NotFoundView from "./pages/NotFoundView.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminLayout from "./admin/components/AdminLayout.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AdminCourses from "./admin/pages/AdminCourses.jsx";
import AdminCourseContent from "./admin/pages/AdminCourseContent.jsx";
import AdminUsers from "./admin/pages/AdminUsers.jsx";
import AdminUserDetail from "./admin/pages/AdminUserDetail.jsx";
import AdminCommunities from "./admin/pages/AdminCommunities.jsx";
import AdminNotifications from "./admin/pages/AdminNotifications.jsx";
import AdminSupport from "./admin/pages/AdminSupport.jsx";
import AdminQueries from "./admin/pages/AdminQueries.jsx";
import AdminCourseFeedback from "./admin/pages/AdminCourseFeedback.jsx";
import AdminEnrollments from "./admin/pages/AdminEnrollments.jsx";
import AdminCertificates from "./admin/pages/AdminCertificates.jsx";
import { trackPageVisit } from "./services/analytics.js";

const ADMIN_BASE = "/nexrnn/master_nexrnn/admin";

function SiteVisitTracker() {
  const location = useLocation();
  React.useEffect(() => {
    trackPageVisit(location.pathname);
  }, [location.pathname]);
  return null;
}

function RequireAuth() {
  const { user, loading, isSupabaseConfigured } = useAuth();
  const location = useLocation();
  if (!isSupabaseConfigured) return <Outlet />;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-slate-400">Loading…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
}

export default function App() {
  return <><SiteVisitTracker /><Routes>
    <Route path="/" element={<LandingView />} />
    <Route path="/verify-certificate" element={<VerifyCertificateView />} />
    <Route path="/login" element={<LoginView />} />
    <Route path="/createaccount" element={<CreateAccountView />} />

    {/* Course discovery and preview are public. Enroll buttons request login. */}
    <Route element={<AppLayout />}>
      <Route path="/courses" element={<CoursesView />} />
      <Route path="/courses/:courseId" element={<CourseDetailView />} />
      <Route path="/my-courses/:courseId" element={<CoursePlayerView />} />
    </Route>

    {/* Dashboard, certificates, community and support are account areas. */}
    <Route element={<RequireAuth />}>
      <Route element={<AppLayout />}>
        <Route path="/my-courses" element={<DashboardView />} />
        <Route path="/my-courses/certificates" element={<ProfileView />} />
        <Route path="/my-account" element={<ProfileView />} />
        <Route path="/my-account/user-id" element={<ProfileView />} />
        <Route path="/my-account/password" element={<ProfileView />} />
        <Route path="/my-account/notifications" element={<ProfileView />} />
        <Route path="/my-account/orders" element={<ProfileView />} />
        <Route path="/community" element={<CommunityView />} />
        <Route path="/support" element={<SupportView />} />
      </Route>
    </Route>

    <Route path={`${ADMIN_BASE}/login`} element={<AdminLogin />} />
    <Route path={ADMIN_BASE} element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="courses" element={<AdminCourses />} />
      <Route path="courses/:courseId/content" element={<AdminCourseContent />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="users/:userId" element={<AdminUserDetail />} />
      <Route path="communities" element={<AdminCommunities />} />
      <Route path="notifications" element={<AdminNotifications />} />
      <Route path="support" element={<AdminSupport />} />
      <Route path="queries" element={<AdminQueries />} />
      <Route path="course-feedback" element={<AdminCourseFeedback />} />
      <Route path="enrollments" element={<AdminEnrollments />} />
      <Route path="certificates" element={<AdminCertificates />} />
    </Route>

    <Route path="*" element={<NotFoundView />} />
  </Routes></>;
}

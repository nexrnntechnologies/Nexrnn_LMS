import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import DashboardView from "./pages/DashboardView.jsx";
import CoursesView from "./pages/CoursesView.jsx";
import CourseDetailView from "./pages/CourseDetailView.jsx";
import CoursePlayerView from "./pages/CoursePlayerView.jsx";
import ProfileView from "./pages/ProfileView.jsx";
import CommunityView from "./pages/CommunityView.jsx";
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

const ADMIN_BASE = "/nexrnn/master_nexrnn/admin";

export default function App() {
  return (
    <Routes>
      {/* Public LMS (student-facing) */}
      <Route element={<AppLayout />}>
        <Route path="/my-courses" element={<DashboardView />} />
        <Route path="/my-courses/certificates" element={<ProfileView />} />
        <Route path="/my-courses/:courseId" element={<CoursePlayerView />} />
        <Route path="/courses" element={<CoursesView />} />
        <Route path="/courses/:courseId" element={<CourseDetailView />} />
        <Route path="/my-account" element={<ProfileView />} />
        <Route path="/my-account/password" element={<ProfileView />} />
        <Route path="/my-account/notifications" element={<ProfileView />} />
        <Route path="/my-account/billing" element={<ProfileView />} />
        <Route path="/my-account/orders" element={<ProfileView />} />
        <Route path="/community" element={<CommunityView />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<LoginView />} />
      <Route path="/createaccount" element={<CreateAccountView />} />

      {/* Admin panel */}
      <Route path={`${ADMIN_BASE}/login`} element={<AdminLogin />} />
      <Route path={ADMIN_BASE} element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="courses/:courseId/content" element={<AdminCourseContent />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:userId" element={<AdminUserDetail />} />
        <Route path="communities" element={<AdminCommunities />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Route>

      {/* Fallbacks */}
      <Route path="/" element={<Navigate to="/my-courses" replace />} />
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
}

import React, { useEffect, useState } from "react";
import { BookOpen, Users, GraduationCap, Eye } from "lucide-react";
import { adminFetchCourses, adminFetchUsers, adminFetchEnrollmentCounts, adminFetchVisitStats } from "../../services/admin.js";
import { BLUE } from "../../theme";
import AdminExportButtons from "../../components/AdminExportButtons.jsx";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-4">
      <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ backgroundColor: BLUE }}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ courses: 0, users: 0, enrollments: 0, visits: 0, visitors: 0 });

  useEffect(() => {
    (async () => {
      const [{ data: courses }, { data: users }, { data: enrollments }, { data: visits }] = await Promise.all([
        adminFetchCourses(),
        adminFetchUsers(),
        adminFetchEnrollmentCounts(),
        adminFetchVisitStats(),
      ]);
      setStats({ courses: courses.length, users: users.length, enrollments: enrollments.length, visits: visits?.visits || 0, visitors: visits?.visitors || 0 });
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8"><h1 className="text-2xl font-extrabold text-slate-900">Overview</h1><AdminExportButtons title="dashboard-overview" rows={[stats]} columns={[{ label: "Courses", key: "courses" }, { label: "Registered Users", key: "users" }, { label: "Total Enrollments", key: "enrollments" }, { label: "Website Visits", key: "visits" }, { label: "Unique Visitors", key: "visitors" }]} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        <StatCard icon={BookOpen} label="Courses" value={stats.courses} />
        <StatCard icon={Users} label="Registered Users" value={stats.users} />
        <StatCard icon={GraduationCap} label="Total Enrollments" value={stats.enrollments} />
        <StatCard icon={Eye} label="Website Visits" value={stats.visits} />
        <StatCard icon={Users} label="Unique Visitors" value={stats.visitors} />
      </div>
      <p className="text-xs text-slate-400 mt-4">Website visits are counted once per page per browser session. Admin-panel pages are excluded.</p>
    </div>
  );
}

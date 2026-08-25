import React, { useEffect, useState } from "react";
import { BookOpen, Users, GraduationCap } from "lucide-react";
import { adminFetchCourses, adminFetchUsers, adminFetchEnrollmentCounts } from "../../services/admin.js";
import { BLUE } from "../../theme";

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
  const [stats, setStats] = useState({ courses: 0, users: 0, enrollments: 0 });

  useEffect(() => {
    (async () => {
      const [{ data: courses }, { data: users }, { data: enrollments }] = await Promise.all([
        adminFetchCourses(),
        adminFetchUsers(),
        adminFetchEnrollmentCounts(),
      ]);
      setStats({ courses: courses.length, users: users.length, enrollments: enrollments.length });
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-8">Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard icon={BookOpen} label="Courses" value={stats.courses} />
        <StatCard icon={Users} label="Registered Users" value={stats.users} />
        <StatCard icon={GraduationCap} label="Total Enrollments" value={stats.enrollments} />
      </div>
    </div>
  );
}

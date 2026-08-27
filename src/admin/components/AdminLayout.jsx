import React from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users, LogOut, ShieldCheck, MessageSquare, Bell, Star, Award, GraduationCap } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { NAVY, BLUE } from "../../theme";

const ADMIN_BASE = "/nexrnn/master_nexrnn/admin";

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4" style={{ backgroundColor: NAVY }}>
        <div className="text-white max-w-sm">
          <ShieldCheck size={32} style={{ color: BLUE }} className="mx-auto mb-3" />
          <p className="font-bold mb-1">Admin panel needs Supabase</p>
          <p className="text-sm text-slate-300">Connect Supabase (see README) to use the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading…</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to={`${ADMIN_BASE}/login`} replace />;
  }

  const navItems = [
    { to: ADMIN_BASE, label: "Overview", icon: LayoutDashboard, end: true },
    { to: `${ADMIN_BASE}/courses`, label: "Courses", icon: BookOpen },
    { to: `${ADMIN_BASE}/enrollments`, label: "Course Enrollments", icon: GraduationCap },
    { to: `${ADMIN_BASE}/certificates`, label: "Issued Certificates", icon: Award },
    { to: `${ADMIN_BASE}/users`, label: "Registered Users", icon: Users },
    { to: `${ADMIN_BASE}/communities`, label: "Communities", icon: MessageSquare },
    { to: `${ADMIN_BASE}/notifications`, label: "Notifications", icon: Bell },
    { to: `${ADMIN_BASE}/support`, label: "Support", icon: MessageSquare },
    { to: `${ADMIN_BASE}/queries`, label: "Queries", icon: MessageSquare },
    { to: `${ADMIN_BASE}/course-feedback`, label: "Course Feedback", icon: Star },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate(`${ADMIN_BASE}/login`);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      <aside className="w-60 h-screen shrink-0 sticky top-0 text-white flex flex-col overflow-y-auto" style={{ backgroundColor: NAVY }}>
        <div className="px-5 py-6 flex items-center gap-2">
          <ShieldCheck size={20} style={{ color: BLUE }} />
          <span className="font-extrabold text-sm">NEXRNN ADMIN</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-semibold ${
                    isActive ? "text-white" : "text-slate-300 hover:bg-white/5"
                  }`
                }
                style={({ isActive }) => (isActive ? { backgroundColor: BLUE } : {})}
              >
                <Icon size={15} /> {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-3 pb-5">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-semibold text-slate-300 hover:bg-white/5"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

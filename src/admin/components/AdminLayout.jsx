import React from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users, LogOut, ShieldCheck, MessageSquare, Bell, Star, Award, GraduationCap, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { NAVY, BLUE } from "../../theme";

const ADMIN_BASE = "/nexrnn/master_nexrnn/admin";

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

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
    { to: `${ADMIN_BASE}/workshops`, label: "Workshops", icon: BookOpen },
    { to: `${ADMIN_BASE}/enrollments`, label: "Course Enrollments", icon: GraduationCap },
    { to: `${ADMIN_BASE}/workshop-enrollments`, label: "Workshop Enrollments", icon: GraduationCap },
    { to: `${ADMIN_BASE}/certificates`, label: "Issued Certificates", icon: Award },
    { to: `${ADMIN_BASE}/users`, label: "Registered Users", icon: Users },
    { to: `${ADMIN_BASE}/communities`, label: "Communities", icon: MessageSquare },
    { to: `${ADMIN_BASE}/notifications`, label: "Notifications", icon: Bell },
    { to: `${ADMIN_BASE}/support`, label: "Support", icon: MessageSquare },
    { to: `${ADMIN_BASE}/queries`, label: "Queries", icon: MessageSquare },
    { to: `${ADMIN_BASE}/feedback`, label: "Feedback", icon: Star },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate(`${ADMIN_BASE}/login`);
  };

  return (
    <div className="min-h-screen lg:h-screen flex overflow-hidden bg-slate-50">
      {sidebarOpen && <button type="button" aria-label="Close admin navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[88vw] shrink-0 text-white flex flex-col overflow-y-auto transition-transform duration-200 lg:static lg:z-auto lg:w-60 lg:h-screen lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ backgroundColor: NAVY }}>
        <div className="px-5 py-5 sm:py-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"><ShieldCheck size={20} style={{ color: BLUE }} /><span className="font-extrabold text-sm">NEXRNN ADMIN</span></div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden w-9 h-9 rounded-md flex items-center justify-center text-slate-300 hover:bg-white/10" aria-label="Close admin navigation"><X size={19} /></button>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-3 rounded-md text-sm font-semibold ${
                    isActive ? "text-white" : "text-slate-300 hover:bg-white/5"
                  }`
                }
                style={({ isActive }) => (isActive ? { backgroundColor: BLUE } : {})}
              >
                <Icon size={16} /> {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-3 pb-5">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-3 rounded-md text-sm font-semibold text-slate-300 hover:bg-white/5"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 min-h-screen lg:h-screen overflow-y-auto">
        <div className="lg:hidden sticky top-0 z-30 h-14 flex items-center justify-between gap-3 px-4 sm:px-6 text-white shadow-sm" style={{ backgroundColor: NAVY }}>
          <button type="button" onClick={() => setSidebarOpen(true)} className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-white/10" aria-label="Open admin navigation"><Menu size={20} /></button>
          <span className="font-extrabold text-sm tracking-wide">NEXRNN ADMIN</span>
          <span className="w-9" aria-hidden="true" />
        </div>
        <Outlet />
      </main>
    </div>
  );
}

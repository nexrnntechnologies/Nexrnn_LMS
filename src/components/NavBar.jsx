import React from "react";
import { LayoutDashboard, BookOpen, Users, Bell, User, ChevronDown, LifeBuoy, LogOut, ExternalLink } from "lucide-react";
import Logo from "./Logo.jsx";
import { NAVY, BLUE } from "../theme";

const SUPPORT_EMAIL = "nexrnntechnologies@gmail.com";

export default function NavBar({
  view, setView, notifOpen, setNotifOpen, profileOpen, setProfileOpen,
  notifications, unreadCount, onOpenNotifications, onNotificationClick, onSignOut,
}) {
  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "courses", label: "Courses", icon: BookOpen },
    { key: "community", label: "Community", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => setView("dashboard")} className="shrink-0">
          <Logo />
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((n) => {
            const Icon = n.icon;
            const active = view === n.key || (n.key === "courses" && view === "player");
            return (
              <button
                key={n.key}
                onClick={() => setView(n.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition ${
                  active ? "text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
                style={active ? { backgroundColor: NAVY } : {}}
              >
                <Icon size={15} />
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                const next = !notifOpen;
                setNotifOpen(next);
                setProfileOpen(false);
                if (next) onOpenNotifications();
              }}
              className="relative w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 hover:bg-slate-50"
            >
              <Bell size={16} className="text-slate-600" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-[10px] font-bold text-white rounded-full w-4 h-4 flex items-center justify-center"
                  style={{ backgroundColor: BLUE }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 font-bold text-slate-800">Notifications</div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => onNotificationClick(n)}
                      className="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 flex gap-2"
                    >
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: BLUE }} />
                      )}
                      <div className={n.read ? "pl-3.5" : ""}>
                        <p className="text-[13px] text-slate-700 leading-snug">
                          <span className="font-semibold">Nexrnn Team</span> {n.text}
                        </p>
                        <p className="text-[12px] text-slate-500 mt-0.5">{n.detail}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-slate-200 hover:bg-slate-50"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <User size={14} />
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden sm:inline">Abhiraj S</span>
              <ChevronDown size={14} className="text-slate-500" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => { setView("dashboard"); setProfileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <LayoutDashboard size={14} /> My Dashboard
                </button>
                <button
                  onClick={() => { setView("profile"); setProfileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User size={14} /> My Account
                </button>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  onClick={() => setProfileOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <LifeBuoy size={14} /> Support <ExternalLink size={11} className="ml-auto text-slate-400" />
                </a>
                <button
                  onClick={() => { onSignOut(); setProfileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

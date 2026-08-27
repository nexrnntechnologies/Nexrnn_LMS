import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users, Bell, User, UserRound, ChevronDown, LifeBuoy, LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import Logo from "./Logo.jsx";
import { NAVY, BLUE } from "../theme";

export default function NavBar({
  notifOpen, setNotifOpen, profileOpen, setProfileOpen,
  notifications, unreadCount, onOpenNotifications, onNotificationClick, onSignOut, userLabel, isAuthenticated,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const homePath = isAuthenticated ? "/my-courses" : "/";
  const navItems = [
    ...(isAuthenticated ? [{ to: "/my-courses", label: "Dashboard", icon: LayoutDashboard, match: (path) => path === "/my-courses" }] : []),
    { to: "/courses", label: "Courses", icon: BookOpen, match: (path) => path.startsWith("/courses") },
    ...(isAuthenticated ? [{ to: "/community", label: "Community", icon: Users, match: (path) => path.startsWith("/community") }] : []),
  ];

  return <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
      <Link to={homePath} className="shrink-0"><Logo /></Link>
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => { const Icon = item.icon; const active = item.match(location.pathname); return <Link key={item.to} to={item.to} className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition ${active ? "text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`} style={active ? { backgroundColor: NAVY } : {}}><Icon size={15} /> {item.label}</Link>; })}
      </nav>

      {isAuthenticated ? <div className="flex items-center gap-3">
        <div className="relative" onClick={(event) => event.stopPropagation()}>
          <button onClick={() => { const next = !notifOpen; setNotifOpen(next); setProfileOpen(false); if (next) onOpenNotifications(); }} aria-label="Notifications" className="relative w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 hover:bg-slate-50"><Bell size={16} className="text-slate-600" />{unreadCount > 0 && <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white rounded-full w-4 h-4 flex items-center justify-center" style={{ backgroundColor: BLUE }}>{unreadCount}</span>}</button>
          {notifOpen && <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden"><div className="px-4 py-3 border-b border-slate-100 font-bold text-slate-800">Notifications</div><div className="max-h-80 overflow-y-auto">{notifications.length === 0 ? <p className="px-4 py-6 text-sm text-slate-400">No notifications yet.</p> : notifications.map((notification) => <button key={notification.id} onClick={() => onNotificationClick(notification)} className="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 flex gap-2">{!notification.read && <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: BLUE }} />}<div className={notification.read ? "pl-3.5" : ""}><p className="text-[13px] text-slate-700 leading-snug"><span className="font-semibold">Nexrnn Team</span> {notification.text}</p><p className="text-[12px] text-slate-500 mt-0.5">{notification.detail}</p><p className="text-[11px] text-slate-400 mt-0.5">{notification.time}</p>{(notification.linkUrl || notification.link_url) && <p className="text-[11px] font-semibold mt-1 flex items-center gap-1" style={{ color: BLUE }}>Open linked resource <ExternalLink size={10} /></p>}</div></button>)}</div></div>}
        </div>
        <div className="relative" onClick={(event) => event.stopPropagation()}>
          <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-slate-200 hover:bg-slate-50"><div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><UserRound size={14} /></div><span className="text-sm font-semibold text-slate-700 hidden sm:inline">{userLabel || "Account"}</span><ChevronDown size={14} className="text-slate-500" /></button>
          {profileOpen && <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden"><button onClick={() => { navigate("/my-courses"); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><LayoutDashboard size={14} /> My Dashboard</button><button onClick={() => { navigate("/my-account"); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><User size={14} /> My Account</button><button onClick={() => { navigate("/support"); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><LifeBuoy size={14} /> Support <ExternalLink size={11} className="ml-auto text-slate-400" /></button><button onClick={() => { onSignOut(); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"><LogOut size={14} /> Sign Out</button></div>}
        </div>
      </div> : <div className="flex items-center gap-2"><Link to="/verify-certificate" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-3 py-2 rounded-md hover:bg-slate-50"><ShieldCheck size={15} /> Verify Certificate</Link><Link to="/login" className="text-sm font-semibold text-slate-600 px-3 py-2 rounded-md hover:bg-slate-50">Log in</Link><Link to="/createaccount" className="text-sm font-bold text-white px-3 py-2 rounded-md hover:opacity-90" style={{ backgroundColor: BLUE }}>Create account</Link></div>}
    </div>
  </header>;
}

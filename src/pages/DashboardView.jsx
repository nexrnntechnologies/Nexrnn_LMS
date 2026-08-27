import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Search } from "lucide-react";
import { NAVY, BLUE } from "../theme";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardView() {
  const { myCourses = [], setRatingCourse, courseRatings = [] } = useOutletContext();
  const { user, profile, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const displayName = isSupabaseConfigured ? profile?.first_name || profile?.email || "there" : "Abhiraj S";
  const currentUserId = isSupabaseConfigured ? user?.id : "demo-user";
  const matches = (course) => (course.title || "").toLowerCase().includes(search.toLowerCase());
  const courses = myCourses.filter((item) => item.courseType !== "workshop" && matches(item));
  const workshops = myCourses.filter((item) => item.courseType === "workshop" && matches(item));

  return <div className="max-w-7xl mx-auto px-6 py-10">
    <div className="flex items-start justify-between gap-4 mb-8"><div><p className="text-sm text-slate-500 font-medium">Welcome back,</p><h1 className="text-2xl font-extrabold text-slate-900">{displayName} 👋</h1></div><div className="relative shrink-0"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="pl-8 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400" /></div></div>
    <DashboardSection title="My Course" emptyText="You haven't enrolled in any courses yet." browseLabel="Browse courses" items={courses} allItems={myCourses.filter((item) => item.courseType !== "workshop")} itemLabel="Course" playerPath="/my-courses" currentUserId={currentUserId} courseRatings={courseRatings} onRate={setRatingCourse} onBrowse={() => navigate("/courses")} onNavigate={navigate} />
    <DashboardSection title="My Workshop" emptyText="You haven't enrolled in any workshops yet." browseLabel="Browse workshops" items={workshops} allItems={myCourses.filter((item) => item.courseType === "workshop")} itemLabel="Workshop" playerPath="/my-workshops" currentUserId={currentUserId} courseRatings={courseRatings} onRate={setRatingCourse} onBrowse={() => navigate("/workshops")} onNavigate={navigate} />
  </div>;
}

function DashboardSection({ title, emptyText, browseLabel, items, allItems, itemLabel, playerPath, currentUserId, courseRatings, onRate, onBrowse, onNavigate }) {
  return <section className="mb-12 last:mb-0"><div className="flex items-center justify-between gap-4 mb-4"><h2 className="text-lg font-extrabold text-slate-900">{title}</h2></div>{allItems.length === 0 ? <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center"><p className="text-sm text-slate-500 mb-3">{emptyText}</p><button onClick={onBrowse} className="text-sm font-semibold hover:underline" style={{ color: BLUE }}>{browseLabel} →</button></div> : items.length === 0 ? <p className="text-sm text-slate-400">No {itemLabel.toLowerCase()}s match your search.</p> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">{items.map((course) => { const Icon = course.icon; const hasRated = courseRatings.some((rating) => rating.user_id === currentUserId && rating.course_id === course.id); return <div key={course.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"><div className="p-5" style={{ backgroundColor: NAVY }}><div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: BLUE }}>{Icon ? <Icon size={18} className="text-white" /> : null}</div></div><div className="p-5"><h3 className="font-bold text-slate-900 mb-3">{course.title}</h3><div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5"><div className="h-full rounded-full" style={{ width: `${course.progress}%`, backgroundColor: BLUE }} /></div><p className="text-[12px] text-slate-500 mb-4">{course.progress}% complete</p><div className="flex justify-between text-sm font-semibold"><button onClick={() => onNavigate(`${playerPath}/${course.id}`)} className="text-slate-500 hover:text-slate-800">See Overview</button>{course.progress === 100 ? <button onClick={() => !hasRated && onRate(course)} disabled={hasRated} style={{ color: hasRated ? "#94a3b8" : BLUE }} className="hover:underline disabled:cursor-not-allowed disabled:no-underline">{hasRated ? "Already Rated" : `Rate This ${itemLabel}`}</button> : <button onClick={() => onNavigate(`${playerPath}/${course.id}`)} style={{ color: BLUE }} className="hover:underline">Continue {itemLabel}</button>}</div></div></div>; })}</div>}</section>;
}

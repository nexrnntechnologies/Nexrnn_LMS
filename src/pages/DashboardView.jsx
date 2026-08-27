import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Search } from "lucide-react";
import { NAVY, BLUE } from "../theme";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardView() {
  const { myCourses, setRatingCourse, courseRatings = [] } = useOutletContext();
  const { user, profile, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const displayName = isSupabaseConfigured ? profile?.first_name || profile?.email || "there" : "Abhiraj S";
  const currentUserId = isSupabaseConfigured ? user?.id : "demo-user";
  const visibleCourses = myCourses.filter((course) => course.title.toLowerCase().includes(search.toLowerCase()));

  return <div className="max-w-7xl mx-auto px-6 py-10">
    <div className="mb-8"><p className="text-sm text-slate-500 font-medium">Welcome back,</p><h1 className="text-2xl font-extrabold text-slate-900">{displayName} 👋</h1></div>
    <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold text-slate-900">My Courses</h2><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="pl-8 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400" /></div></div>
    {myCourses.length === 0 ? <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center"><p className="text-sm text-slate-500 mb-3">You haven't enrolled in any courses yet.</p><button onClick={() => navigate("/courses")} className="text-sm font-semibold hover:underline" style={{ color: BLUE }}>Browse courses →</button></div> : visibleCourses.length === 0 ? <p className="text-sm text-slate-400">No courses match “{search}”.</p> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">{visibleCourses.map((course) => { const Icon = course.icon; const hasRated = courseRatings.some((rating) => rating.user_id === currentUserId && rating.course_id === course.id); return <div key={course.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"><div className="p-5" style={{ backgroundColor: NAVY }}><div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: BLUE }}>{Icon ? <Icon size={18} className="text-white" /> : null}</div></div><div className="p-5"><h3 className="font-bold text-slate-900 mb-3">{course.title}</h3><div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5"><div className="h-full rounded-full" style={{ width: `${course.progress}%`, backgroundColor: BLUE }} /></div><p className="text-[12px] text-slate-500 mb-4">{course.progress}% complete</p><div className="flex justify-between text-sm font-semibold"><button onClick={() => navigate(`/my-courses/${course.id}`)} className="text-slate-500 hover:text-slate-800">See Overview</button>{course.progress === 100 ? <button onClick={() => !hasRated && setRatingCourse(course)} disabled={hasRated} style={{ color: hasRated ? "#94a3b8" : BLUE }} className="hover:underline disabled:cursor-not-allowed disabled:no-underline">{hasRated ? "Already Rated" : "Rate This Course"}</button> : <button onClick={() => navigate(`/my-courses/${course.id}`)} style={{ color: BLUE }} className="hover:underline">Continue Course</button>}</div></div></div>; })}</div>}
  </div>;
}

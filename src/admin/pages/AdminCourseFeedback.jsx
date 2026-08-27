import React, { useEffect, useMemo, useState } from "react";
import { MessageSquare, Search, Star } from "lucide-react";
import { adminFetchCourseFeedback } from "../../services/admin.js";
import { BLUE } from "../../theme";

export default function AdminCourseFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  useEffect(() => {
    adminFetchCourseFeedback().then(({ data, error: loadError }) => {
      setFeedback(data || []);
      setError(loadError?.message || "");
      setLoading(false);
    });
  }, []);

  const courses = useMemo(() => [...new Map(feedback.map((item) => [item.course_id, item.courseTitle])).entries()], [feedback]);
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return feedback.filter((item) => {
      const haystack = [item.courseTitle, item.comment, item.user_id].filter(Boolean).join(" ").toLowerCase();
      return (!search || haystack.includes(search)) && (courseFilter === "all" || item.course_id === courseFilter);
    });
  }, [feedback, query, courseFilter]);

  return <div className="max-w-6xl mx-auto px-8 py-10">
    <div className="mb-6"><p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">Learner voice</p><h1 className="text-2xl font-extrabold text-slate-900">Course Feedback</h1><p className="text-sm text-slate-500 mt-1">Ratings and feedback submitted after course completion.</p></div>
    <div className="bg-white border border-slate-200 rounded-lg p-3 mb-5 grid grid-cols-1 md:grid-cols-[minmax(220px,1fr)_250px] gap-3"><label className="relative block"><span className="sr-only">Search feedback</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search course or feedback…" className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" /></label><select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white"><option value="all">All courses</option>{courses.map(([id, title]) => <option key={id} value={id}>{title || id}</option>)}</select></div>
    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">{error}</p>}
    {loading ? <p className="text-sm text-slate-400">Loading feedback…</p> : visible.length === 0 ? <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center"><MessageSquare size={30} className="mx-auto mb-3 text-slate-300" /><p className="font-semibold text-slate-700">{feedback.length ? "No feedback matches these filters." : "No course feedback yet."}</p><p className="text-sm text-slate-400 mt-1">Completed-course ratings will appear here.</p></div> : <div className="bg-white border border-slate-200 rounded-lg overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[760px]"><thead className="bg-slate-50 text-slate-500 text-left"><tr><th className="px-4 py-3 font-semibold">Course</th><th className="px-4 py-3 font-semibold">Rating</th><th className="px-4 py-3 font-semibold">Feedback</th><th className="px-4 py-3 font-semibold">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-4 py-4 font-semibold text-slate-800">{item.courseTitle || item.course_id}</td><td className="px-4 py-4"><span className="inline-flex items-center gap-1 font-bold text-amber-600">{item.stars} <Star size={14} className="fill-amber-400 text-amber-400" /></span></td><td className="px-4 py-4 text-slate-600 max-w-[480px]">{item.comment || <span className="text-slate-400">No written feedback</span>}</td><td className="px-4 py-4 text-slate-500 whitespace-nowrap">{item.created_at ? new Date(item.created_at).toLocaleString() : "—"}</td></tr>)}</tbody></table></div></div>}
  </div>;
}

import React, { useEffect, useMemo, useState } from "react";
import { MessageSquare, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import {
  adminCreateCourseFeedback,
  adminDeleteCourseFeedback,
  adminFetchCourseFeedback,
  adminFetchFeedbackOptions,
  adminUpdateCourseFeedback,
} from "../../services/admin.js";
import { BLUE } from "../../theme";

const EMPTY_FORM = { user_id: "", course_id: "", learner_name: "", stars: 5, comment: "" };
const inputClass = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400";

function userName(user) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || user?.user_registration_id || user?.id || "Unnamed learner";
}

export default function AdminCourseFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    const [{ data, error: feedbackError }, options] = await Promise.all([adminFetchCourseFeedback(), adminFetchFeedbackOptions()]);
    setFeedback(data || []);
    setUsers(options.users || []);
    setCourses(options.courses || []);
    setError(feedbackError?.message || options.error?.message || "");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const coursesInFeedback = useMemo(() => [...new Map(feedback.map((item) => [item.course_id, item.courseTitle])).entries()], [feedback]);
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return feedback.filter((item) => {
      const haystack = [item.courseTitle, item.comment, item.learner_name, item.user_id].filter(Boolean).join(" ").toLowerCase();
      return (!search || haystack.includes(search)) && (courseFilter === "all" || item.course_id === courseFilter);
    });
  }, [feedback, query, courseFilter]);

  const openCreate = () => {
    setEditingId(null);
    const firstUser = users[0];
    setForm({ ...EMPTY_FORM, user_id: firstUser?.id || "", learner_name: userName(firstUser), course_id: courses[0]?.id || "" });
    setError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ user_id: item.user_id || "", course_id: item.course_id || "", learner_name: item.learner_name || "", stars: item.stars || 5, comment: item.comment || "" });
    setError("");
    setShowForm(true);
  };

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const selectUser = (event) => {
    const user = users.find((item) => item.id === event.target.value);
    setForm((current) => ({ ...current, user_id: event.target.value, learner_name: userName(user) }));
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.user_id || !form.course_id || !form.stars) { setError("Select a learner, course and rating."); return; }
    setSaving(true);
    setError("");
    const result = editingId ? await adminUpdateCourseFeedback(editingId, form) : await adminCreateCourseFeedback(form);
    setSaving(false);
    if (result.error) { setError(result.error.message || "Feedback could not be saved."); return; }
    setShowForm(false);
    await load();
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete feedback from ${item.learner_name || "this learner"}?`)) return;
    const { error: deleteError } = await adminDeleteCourseFeedback(item.id);
    if (deleteError) { setError(deleteError.message || "Feedback could not be deleted."); return; }
    await load();
  };

  return <div className="max-w-6xl mx-auto px-8 py-10">
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6"><div><p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">Learner voice</p><h1 className="text-2xl font-extrabold text-slate-900">Feedback</h1><p className="text-sm text-slate-500 mt-1">Create, view, edit and delete learner feedback. Admin-added feedback is shown on the website under the selected learner's name.</p></div><button onClick={openCreate} disabled={!users.length || !courses.length} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2.5 rounded-md hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: BLUE }}><Plus size={15} /> Add Feedback</button></div>
    <div className="bg-white border border-slate-200 rounded-lg p-3 mb-5 grid grid-cols-1 md:grid-cols-[minmax(220px,1fr)_250px] gap-3"><label className="relative block"><span className="sr-only">Search feedback</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search learner, course or feedback…" className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" /></label><select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className={inputClass}><option value="all">All courses</option>{coursesInFeedback.map(([id, title]) => <option key={id} value={id}>{title || id}</option>)}</select></div>
    {error && !showForm && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">{error}</p>}
    {loading ? <p className="text-sm text-slate-400">Loading feedback…</p> : visible.length === 0 ? <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center"><MessageSquare size={30} className="mx-auto mb-3 text-slate-300" /><p className="font-semibold text-slate-700">{feedback.length ? "No feedback matches these filters." : "No feedback yet."}</p><p className="text-sm text-slate-400 mt-1">Use Add Feedback to publish a learner testimonial.</p></div> : <div className="bg-white border border-slate-200 rounded-lg overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[950px]"><thead className="bg-slate-50 text-slate-500 text-left"><tr><th className="px-4 py-3 font-semibold">Course / Workshop</th><th className="px-4 py-3 font-semibold">Learner</th><th className="px-4 py-3 font-semibold">Rating</th><th className="px-4 py-3 font-semibold">Feedback</th><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-4 py-4 font-semibold text-slate-800">{item.courseTitle || item.course_id}</td><td className="px-4 py-4"><p className="font-semibold text-slate-800">{item.learner_name || "Nexrnn Learner"}</p><p className="text-[11px] text-slate-400">{item.user_id}</p></td><td className="px-4 py-4"><span className="inline-flex items-center gap-1 font-bold text-amber-600">{item.stars} <Star size={14} className="fill-amber-400 text-amber-400" /></span></td><td className="px-4 py-4 text-slate-600 max-w-[420px]">{item.comment || <span className="text-slate-400">No written feedback</span>}</td><td className="px-4 py-4 text-slate-500 whitespace-nowrap">{item.created_at ? new Date(item.created_at).toLocaleString() : "—"}</td><td className="px-4 py-4"><div className="flex items-center justify-end gap-3"><button onClick={() => openEdit(item)} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"><Pencil size={14} /> Edit</button><button onClick={() => remove(item)} className="inline-flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-700"><Trash2 size={14} /> Delete</button></div></td></tr>)}</tbody></table></div></div>}

    {showForm && <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setShowForm(false)}><form onSubmit={save} onClick={(event) => event.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative"><button type="button" onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={18} /></button><h2 className="text-lg font-extrabold text-slate-900 mb-1">{editingId ? "Edit Learner Feedback" : "Add Learner Feedback"}</h2><p className="text-sm text-slate-500 mb-5">The selected learner will be shown as the feedback author on the website.</p><div className="space-y-4"><label className="block"><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Learner</span><select required value={form.user_id} onChange={selectUser} className={inputClass}><option value="">Select learner</option>{users.map((user) => <option key={user.id} value={user.id}>{userName(user)}{user.user_registration_id ? ` — ${user.user_registration_id}` : ""}</option>)}</select></label><label className="block"><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Course</span><select required value={form.course_id} onChange={(event) => updateField("course_id", event.target.value)} className={inputClass}><option value="">Select course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label><div><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Feedback author shown publicly</span><input value={form.learner_name || ""} readOnly className={`${inputClass} bg-slate-50`} /></div><label className="block"><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Rating</span><select required value={form.stars} onChange={(event) => updateField("stars", event.target.value)} className={inputClass}><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></label><label className="block"><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Written feedback</span><textarea rows={5} value={form.comment || ""} onChange={(event) => updateField("comment", event.target.value)} placeholder="What did this learner say?" className={inputClass} /></label></div>{error && <p className="text-sm text-red-600 mt-4">{error}</p>}<button type="submit" disabled={saving} className="w-full mt-6 text-white font-semibold py-2.5 rounded-md disabled:opacity-50" style={{ backgroundColor: BLUE }}>{saving ? "Saving…" : editingId ? "Save Changes" : "Publish Feedback"}</button></form></div>}
  </div>;
}

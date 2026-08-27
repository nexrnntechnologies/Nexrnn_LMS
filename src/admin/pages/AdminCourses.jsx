import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus, Search, Trash2, Pencil, X, Layers, SlidersHorizontal } from "lucide-react";
import { adminFetchCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse } from "../../services/admin.js";
import { BLUE } from "../../theme";
import AdminExportButtons from "../../components/AdminExportButtons.jsx";

const EMPTY_FORM = { id: "", tag: "", title: "", description: "", duration: "", level: "", mode: "", projects: 0, price: 0, original_price: 0, discount_label: "", demo_video_url: "", course_complete: false };
const inputClass = "w-full px-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400";

export default function AdminCourses({ catalogType = "course" }) {
  const isWorkshop = catalogType === "workshop";
  const itemLabel = isWorkshop ? "Workshop" : "Course";
  const catalogBase = isWorkshop ? "workshops" : "courses";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const { data, error: loadError } = await adminFetchCourses(catalogType);
    if (loadError) setError(loadError.message);
    setCourses(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [catalogType]);

  const filteredCourses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return courses.filter((course) => {
      const haystack = [course.id, course.title, course.tag, course.description].filter(Boolean).join(" ").toLowerCase();
      return (!search || haystack.includes(search)) && (priceFilter === "all" || (priceFilter === "free" ? Number(course.price) === 0 : Number(course.price) > 0));
    });
  }, [courses, query, priceFilter]);

  const handleChange = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const handleCompletionChange = (event) => setForm((current) => ({ ...current, course_complete: event.target.checked }));
  const openCreate = () => { setEditingId(null); setForm({ ...EMPTY_FORM }); setError(""); setShowForm(true); };
  const openEdit = (course) => { setEditingId(course.id); setForm({ id: course.id, tag: course.tag || "", title: course.title || "", description: course.description || "", duration: course.duration || "", level: course.level || "", mode: course.mode || "", projects: course.projects || 0, price: course.price || 0, original_price: course.original_price || 0, discount_label: course.discount_label || "", demo_video_url: course.demo_video_url || "", course_complete: Boolean(course.course_complete) }); setError(""); setShowForm(true); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.id.trim() || !form.title.trim() || !form.tag.trim()) { setError(`${itemLabel} ID, Tag and Title are required.`); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.id.trim())) { setError("Course ID should use lowercase letters, numbers and hyphens only."); return; }
    const payload = { ...form, id: form.id.trim(), course_type: catalogType, tag: form.tag.trim(), title: form.title.trim(), projects: Number(form.projects) || 0, price: Number(form.price) || 0, original_price: Number(form.original_price) || 0, demo_video_url: form.demo_video_url.trim() || null, course_complete: Boolean(form.course_complete) };
    const result = editingId ? await adminUpdateCourse(editingId, payload) : await adminCreateCourse(payload);
    if (result.error) { setError(result.error.message); return; }
    setShowForm(false); await load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete ${itemLabel.toLowerCase()} "${id}"? This cannot be undone.`)) return;
    const { error: deleteError } = await adminDeleteCourse(id);
    if (deleteError) { setError(deleteError.message); return; }
    await load();
  };

  return <div className="max-w-6xl mx-auto px-8 py-10">
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6"><div><p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">Learning catalogue</p><h1 className="text-2xl font-extrabold text-slate-900">{itemLabel}s</h1><p className="text-sm text-slate-500 mt-1">Create, edit and manage your {itemLabel.toLowerCase()} content.</p></div><div className="flex flex-wrap items-center gap-3"><AdminExportButtons title={`${catalogType}-catalogue`} rows={filteredCourses} columns={[{ label: "ID", key: "id" }, { label: "Title", key: "title" }, { label: "Tag", key: "tag" }, { label: "Duration", key: "duration" }, { label: "Level", key: "level" }, { label: "Mode", key: "mode" }, { label: "Price", value: (course) => Number(course.price) === 0 ? "Free" : `₹${Number(course.price).toLocaleString("en-IN")}` }, { label: "Status", value: (course) => course.course_complete ? "Complete" : "Ongoing" }]} /><button onClick={openCreate} className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-md hover:opacity-90" style={{ backgroundColor: BLUE }}><Plus size={15} /> Add {itemLabel}</button></div></div>
    <div className="bg-white border border-slate-200 rounded-lg p-3 mb-5 grid grid-cols-1 md:grid-cols-[minmax(220px,1fr)_190px] gap-3 items-end"><label className="relative block"><span className="sr-only">Search courses</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, ID or tag…" className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" /></label><label className="block"><span className="text-[10px] font-bold tracking-wide text-slate-400 uppercase block mb-1">Price</span><div className="relative"><SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white"><option value="all">All {itemLabel.toLowerCase()}s</option><option value="free">Free</option><option value="paid">Paid</option></select></div></label></div>
    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">{error}</p>}
    {loading ? <p className="text-sm text-slate-400">Loading…</p> : filteredCourses.length === 0 ? <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center"><BookOpen size={28} className="mx-auto mb-3 text-slate-300" /><p className="font-semibold text-slate-700">{courses.length ? `No ${itemLabel.toLowerCase()}s match these filters.` : `No ${itemLabel.toLowerCase()}s yet — add your first one.`}</p></div> : <div className="border border-slate-200 rounded-lg overflow-hidden bg-white"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[900px]"><thead className="bg-slate-50 text-slate-500 text-left"><tr><th className="px-4 py-3 font-semibold">Title</th><th className="px-4 py-3 font-semibold">ID / Tag</th><th className="px-4 py-3 font-semibold">Price</th><th className="px-4 py-3 font-semibold">Demo video</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{filteredCourses.map((course) => <tr key={course.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold text-slate-800">{course.title}</td><td className="px-4 py-3"><p className="text-slate-500">{course.id}</p><p className="text-[11px] text-slate-400">{course.tag}</p></td><td className="px-4 py-3 text-slate-700">{Number(course.price) === 0 ? "Free" : `₹${Number(course.price).toLocaleString("en-IN")}`}</td><td className="px-4 py-3 text-xs text-slate-500">{course.demo_video_url ? "Added" : "Not added"}</td><td className="px-4 py-3"><span className={`text-[11px] font-bold px-2 py-1 rounded ${course.course_complete ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{course.course_complete ? `${itemLabel.toUpperCase()} COMPLETE` : "ONGOING"}</span></td><td className="px-4 py-3"><div className="flex items-center justify-end gap-3"><Link to={`/nexrnn/master_nexrnn/admin/${catalogBase}/${course.id}/content`} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-[13px] font-semibold"><Layers size={14} /> Content</Link><button onClick={() => openEdit(course)} className="text-slate-500 hover:text-slate-700" aria-label="Edit course"><Pencil size={15} /></button><button onClick={() => handleDelete(course.id)} className="text-red-500 hover:text-red-700" aria-label={`Delete ${itemLabel.toLowerCase()}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></div>}

    {showForm && <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setShowForm(false)}><form onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto"><button type="button" onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={18} /></button><h2 className="text-lg font-extrabold text-slate-900 mb-5">{editingId ? `Edit ${itemLabel}` : `Add ${itemLabel}`}</h2><div className="grid grid-cols-2 gap-4"><Input label={`${itemLabel} ID (slug)`} value={form.id} onChange={handleChange("id")} placeholder="e.g. seo-mastery" full disabled={!!editingId} /><Input label="Tag" value={form.tag} onChange={handleChange("tag")} placeholder="e.g. SEO" full /><Input label="Title" value={form.title} onChange={handleChange("title")} full /><Input label="Description" value={form.description} onChange={handleChange("description")} full textarea /><Input label="Duration" value={form.duration} onChange={handleChange("duration")} placeholder="e.g. 2 Months" /><Input label="Level" value={form.level} onChange={handleChange("level")} placeholder="e.g. Beginner to Advanced" /><Input label="Mode" value={form.mode} onChange={handleChange("mode")} placeholder="e.g. Online" /><Input label="Projects" value={form.projects} onChange={handleChange("projects")} type="number" /><Input label="Price (₹) — 0 = Free" value={form.price} onChange={handleChange("price")} type="number" /><Input label="Original Price (₹)" value={form.original_price} onChange={handleChange("original_price")} type="number" /><Input label="Discount Label" value={form.discount_label} onChange={handleChange("discount_label")} placeholder="e.g. 50% OFF" full /><Input label="Course Demo Video URL" value={form.demo_video_url} onChange={handleChange("demo_video_url")} placeholder="YouTube, Vimeo or direct MP4 link" full /><label className="col-span-2 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 cursor-pointer"><input type="checkbox" checked={Boolean(form.course_complete)} onChange={handleCompletionChange} className="mt-0.5 h-4 w-4 accent-blue-600" /><span><span className="block text-sm font-bold text-slate-800">{itemLabel} complete / certificate ready</span><span className="block text-xs text-slate-600 mt-1">Tick this only when all {itemLabel.toLowerCase()} content is final. Learners cannot receive a certificate while the {itemLabel.toLowerCase()} is ongoing.</span></span></label><p className="col-span-2 text-[11px] text-slate-400 -mt-2">Normal YouTube watch links are converted into playable embeds automatically.</p></div>{error && <p className="text-sm text-red-600 mt-4">{error}</p>}<button type="submit" className="w-full mt-6 text-white font-semibold py-2.5 rounded-md hover:opacity-90" style={{ backgroundColor: BLUE }}>{editingId ? "Save Changes" : `Create ${itemLabel}`}</button></form></div>}
  </div>;
}

function Input({ label, full, textarea, disabled, ...props }) { return <label className={`block ${full ? "col-span-2" : ""}`}><span className="text-[13px] font-semibold text-slate-600 mb-1 block">{label}</span>{textarea ? <textarea rows={2} disabled={disabled} {...props} className={inputClass + " disabled:bg-slate-50"} /> : <input disabled={disabled} {...props} className={inputClass + " disabled:bg-slate-50"} />}</label>; }

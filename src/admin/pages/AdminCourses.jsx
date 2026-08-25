import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Pencil, X, Layers } from "lucide-react";
import { adminFetchCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse } from "../../services/admin.js";
import { BLUE } from "../../theme";

const EMPTY_FORM = {
  id: "", tag: "", title: "", description: "", duration: "", level: "",
  mode: "", projects: 0, price: 0, original_price: 0, discount_label: "",
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await adminFetchCourses();
    setCourses(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      id: c.id, tag: c.tag || "", title: c.title || "", description: c.description || "",
      duration: c.duration || "", level: c.level || "", mode: c.mode || "",
      projects: c.projects || 0, price: c.price || 0, original_price: c.original_price || 0,
      discount_label: c.discount_label || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.id || !form.title) {
      setError("Course ID and Title are required.");
      return;
    }
    const payload = {
      ...form,
      projects: Number(form.projects) || 0,
      price: Number(form.price) || 0,
      original_price: Number(form.original_price) || 0,
    };

    const { error: submitError } = editingId
      ? await adminUpdateCourse(editingId, payload)
      : await adminCreateCourse(payload);

    if (submitError) {
      setError(submitError.message);
      return;
    }
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete course "${id}"? This cannot be undone.`)) return;
    await adminDeleteCourse(id);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Courses</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-md hover:opacity-90"
          style={{ backgroundColor: BLUE }}
        >
          <Plus size={15} /> Add Course
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-slate-400">No courses yet — add your first one.</p>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold text-slate-800">{c.title}</td>
                  <td className="px-4 py-3 text-slate-500">{c.id}</td>
                  <td className="px-4 py-3 text-slate-700">₹{c.price}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/nexrnn/master_nexrnn/admin/courses/${c.id}/content`}
                        className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-[13px] font-semibold"
                      >
                        <Layers size={14} /> Content
                      </Link>
                      <button onClick={() => openEdit(c)} className="text-slate-500 hover:text-slate-700">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setShowForm(false)}>
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto"
          >
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
            <h2 className="text-lg font-extrabold text-slate-900 mb-5">{editingId ? "Edit Course" : "Add Course"}</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Course ID (slug)" value={form.id} onChange={handleChange("id")} placeholder="e.g. seo-mastery" full disabled={!!editingId} />
              <Input label="Tag" value={form.tag} onChange={handleChange("tag")} placeholder="e.g. SEO" full />
              <Input label="Title" value={form.title} onChange={handleChange("title")} full />
              <Input label="Description" value={form.description} onChange={handleChange("description")} full textarea />
              <Input label="Duration" value={form.duration} onChange={handleChange("duration")} placeholder="e.g. 2 Months" />
              <Input label="Level" value={form.level} onChange={handleChange("level")} placeholder="e.g. Beginner to Advanced" />
              <Input label="Mode" value={form.mode} onChange={handleChange("mode")} placeholder="e.g. Online" />
              <Input label="Projects" value={form.projects} onChange={handleChange("projects")} type="number" />
              <Input label="Price (₹) — 0 = Free" value={form.price} onChange={handleChange("price")} type="number" />
              <Input label="Original Price (₹)" value={form.original_price} onChange={handleChange("original_price")} type="number" />
              <Input label="Discount Label" value={form.discount_label} onChange={handleChange("discount_label")} placeholder="e.g. 50% OFF" full />
            </div>

            {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

            <button
              type="submit"
              className="w-full mt-6 text-white font-semibold py-2.5 rounded-md hover:opacity-90"
              style={{ backgroundColor: BLUE }}
            >
              {editingId ? "Save Changes" : "Create Course"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Input({ label, full, textarea, disabled, ...props }) {
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <span className="text-[13px] font-semibold text-slate-600 mb-1 block">{label}</span>
      {textarea ? (
        <textarea rows={2} disabled={disabled} {...props} className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-slate-50" />
      ) : (
        <input disabled={disabled} {...props} className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-slate-50" />
      )}
    </label>
  );
}

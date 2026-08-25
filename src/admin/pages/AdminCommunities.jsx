import React, { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Send } from "lucide-react";
import {
  adminFetchCommunities, adminCreateCommunity, adminUpdateCommunity, adminDeleteCommunity,
  adminFetchCommunityPosts, adminCreateCommunityPost, adminFetchCourses,
} from "../../services/admin.js";
import { BLUE } from "../../theme";

const EMPTY_FORM = { name: "", description: "", course_id: "" };

export default function AdminCommunities() {
  const [communities, setCommunities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const [postingFor, setPostingFor] = useState(null); // community object
  const [posts, setPosts] = useState([]);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: comms }, { data: crs }] = await Promise.all([adminFetchCommunities(), adminFetchCourses()]);
    setCommunities(comms);
    setCourses(crs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setError(""); setShowForm(true); };
  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, description: c.description || "", course_id: c.course_id || "" });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    const payload = { name: form.name, description: form.description, course_id: form.course_id || null };
    const { error: err } = editingId ? await adminUpdateCommunity(editingId, payload) : await adminCreateCommunity(payload);
    if (err) { setError(err.message); return; }
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this community?")) return;
    await adminDeleteCommunity(id);
    load();
  };

  const openPostPanel = async (community) => {
    setPostingFor(community);
    setPostTitle("");
    setPostBody("");
    const { data } = await adminFetchCommunityPosts(community.id);
    setPosts(data);
  };

  const handleSendPost = async (e) => {
    e.preventDefault();
    if (!postBody.trim()) return;
    setPostSubmitting(true);
    await adminCreateCommunityPost(postingFor, { title: postTitle, body: postBody });
    setPostSubmitting(false);
    setPostTitle("");
    setPostBody("");
    const { data } = await adminFetchCommunityPosts(postingFor.id);
    setPosts(data);
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Communities</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-md hover:opacity-90"
          style={{ backgroundColor: BLUE }}
        >
          <Plus size={15} /> Add Community
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : communities.length === 0 ? (
        <p className="text-sm text-slate-400">No communities yet — add your first one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {communities.map((c) => (
            <div key={c.id} className="border border-slate-200 rounded-lg bg-white p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-slate-900">{c.name}</p>
                  <p className="text-[12px] text-slate-500">{c.courses?.title || "No linked course"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(c)} className="text-slate-400 hover:text-slate-700"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-700"><Trash2 size={14} /></button>
                </div>
              </div>
              {c.description && <p className="text-sm text-slate-500 mb-3">{c.description}</p>}
              <button
                onClick={() => openPostPanel(c)}
                className="text-[13px] font-semibold hover:underline flex items-center gap-1"
                style={{ color: BLUE }}
              >
                <Send size={13} /> Post Announcement
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create/edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setShowForm(false)}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 relative">
            <button type="button" onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            <h2 className="text-lg font-extrabold text-slate-900 mb-5">{editingId ? "Edit Community" : "Add Community"}</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Name</span>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200" />
              </label>
              <label className="block">
                <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Description</span>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200" />
              </label>
              <label className="block">
                <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Linked Course</span>
                <select value={form.course_id} onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200">
                  <option value="">— None —</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">Announcements notify everyone enrolled in the linked course.</span>
              </label>
            </div>
            {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
            <button type="submit" className="w-full mt-6 text-white font-semibold py-2.5 rounded-md hover:opacity-90" style={{ backgroundColor: BLUE }}>
              {editingId ? "Save Changes" : "Create Community"}
            </button>
          </form>
        </div>
      )}

      {/* Post announcement panel */}
      {postingFor && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setPostingFor(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative max-h-[85vh] overflow-y-auto">
            <button onClick={() => setPostingFor(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">{postingFor.name}</h2>
            <p className="text-sm text-slate-500 mb-5">Post an announcement — enrolled students get notified.</p>

            <form onSubmit={handleSendPost} className="space-y-3 mb-6">
              <input
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200"
              />
              <textarea
                required
                rows={3}
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                placeholder="Write your announcement…"
                className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200"
              />
              <button
                type="submit"
                disabled={postSubmitting}
                className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: BLUE }}
              >
                <Send size={14} /> {postSubmitting ? "Posting…" : "Post"}
              </button>
            </form>

            <h3 className="text-sm font-bold text-slate-700 mb-2">Past posts</h3>
            <div className="space-y-3">
              {posts.length === 0 && <p className="text-sm text-slate-400">No posts yet.</p>}
              {posts.map((p) => (
                <div key={p.id} className="border border-slate-100 rounded-md p-3">
                  {p.title && <p className="font-semibold text-sm text-slate-800">{p.title}</p>}
                  <p className="text-sm text-slate-600">{p.body}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{new Date(p.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { ExternalLink, Pencil, Plus, Search, Send, Trash2, X } from "lucide-react";
import {
  adminFetchCommunities, adminCreateCommunity, adminUpdateCommunity, adminDeleteCommunity,
  adminFetchCommunityPosts, adminCreateCommunityPost, adminUpdateCommunityPost,
  adminDeleteCommunityPost, adminFetchCourses,
} from "../../services/admin.js";
import { BLUE } from "../../theme";
import AdminExportButtons from "../../components/AdminExportButtons.jsx";

const EMPTY_FORM = { name: "", description: "", course_id: "" };
const linkIsValid = (value) => !value.trim() || /^https?:\/\//i.test(value.trim());
const inputClass = "w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400";

export default function AdminCommunities() {
  const [communities, setCommunities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [postingFor, setPostingFor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postLink, setPostLink] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [communitiesResult, coursesResult] = await Promise.all([adminFetchCommunities(), adminFetchCourses()]);
    if (communitiesResult.error || coursesResult.error) setError(communitiesResult.error?.message || coursesResult.error?.message || "Could not load communities.");
    setCommunities(communitiesResult.data || []);
    setCourses(coursesResult.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const visibleCommunities = useMemo(() => {
    const search = query.trim().toLowerCase();
    return communities.filter((community) => [community.name, community.description, community.courses?.title].filter(Boolean).join(" ").toLowerCase().includes(search));
  }, [communities, query]);

  const openCreate = () => { setEditingId(null); setForm({ ...EMPTY_FORM }); setError(""); setShowForm(true); };
  const openEdit = (community) => { setEditingId(community.id); setForm({ name: community.name || "", description: community.description || "", course_id: community.course_id || "" }); setError(""); setShowForm(true); };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    const payload = { name: form.name.trim(), description: form.description.trim(), course_id: form.course_id || null };
    const result = editingId ? await adminUpdateCommunity(editingId, payload) : await adminCreateCommunity(payload);
    if (result.error) { setError(result.error.message); return; }
    setShowForm(false); await load();
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this community and all its announcements?")) return;
    const result = await adminDeleteCommunity(id);
    if (result.error) { setError(result.error.message); return; }
    await load();
  };

  const openPostPanel = async (community) => {
    setPostingFor(community); setEditingPostId(null); setPostTitle(""); setPostBody(""); setPostLink(""); setError("");
    const result = await adminFetchCommunityPosts(community.id);
    setPosts(result.data || []);
    if (result.error) setError(result.error.message);
  };
  const startEditPost = (post) => { setEditingPostId(post.id); setPostTitle(post.title || ""); setPostBody(post.body || ""); setPostLink(post.link_url || ""); setError(""); };
  const resetPostForm = () => { setEditingPostId(null); setPostTitle(""); setPostBody(""); setPostLink(""); };
  const handleSavePost = async (event) => {
    event.preventDefault();
    if (!postBody.trim()) { setError("Announcement message is required."); return; }
    if (!linkIsValid(postLink)) { setError("Link must start with http:// or https://"); return; }
    setPostSubmitting(true); setError("");
    const result = editingPostId
      ? await adminUpdateCommunityPost(editingPostId, { title: postTitle.trim() || null, body: postBody.trim(), link_url: postLink.trim() || null })
      : await adminCreateCommunityPost(postingFor, { title: postTitle.trim(), body: postBody.trim(), linkUrl: postLink.trim() });
    setPostSubmitting(false);
    if (result.error) { setError(result.error.message); return; }
    resetPostForm();
    const refreshed = await adminFetchCommunityPosts(postingFor.id);
    setPosts(refreshed.data || []);
  };
  const handleDeletePost = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    const result = await adminDeleteCommunityPost(id);
    if (result.error) { setError(result.error.message); return; }
    setPosts((current) => current.filter((post) => post.id !== id));
  };

  return <div className="max-w-6xl mx-auto px-8 py-10">
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6"><div><p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">Community hub</p><h1 className="text-2xl font-extrabold text-slate-900">Communities</h1><p className="text-sm text-slate-500 mt-1">Create communities and fully manage their announcements.</p></div><div className="flex flex-wrap items-center gap-3"><AdminExportButtons title="communities" rows={visibleCommunities} columns={[{ label: "Name", key: "name" }, { label: "Description", key: "description" }, { label: "Linked Course", value: (item) => item.courses?.title || "" }, { label: "Created", value: (item) => item.created_at ? new Date(item.created_at).toLocaleString("en-IN") : "" }]} /><button onClick={openCreate} className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-md hover:opacity-90" style={{ backgroundColor: BLUE }}><Plus size={15} /> Add Community</button></div></div>
    <div className="bg-white border border-slate-200 rounded-lg p-3 mb-5"><label className="relative block"><span className="sr-only">Search communities</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search community, description or course…" className={`${inputClass} pl-9`} /></label></div>
    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">{error}</p>}
    {loading ? <p className="text-sm text-slate-400">Loading…</p> : visibleCommunities.length === 0 ? <p className="text-sm text-slate-400">{communities.length ? "No communities match your search." : "No communities yet — add your first one."}</p> : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{visibleCommunities.map((community) => <div key={community.id} className="border border-slate-200 rounded-lg bg-white p-5"><div className="flex items-start justify-between mb-2"><div><p className="font-bold text-slate-900">{community.name}</p><p className="text-[12px] text-slate-500">{community.courses?.title || "No linked course"}</p></div><div className="flex items-center gap-2 shrink-0"><button onClick={() => openEdit(community)} className="text-slate-400 hover:text-slate-700" aria-label="Edit community"><Pencil size={14} /></button><button onClick={() => handleDelete(community.id)} className="text-red-400 hover:text-red-700" aria-label="Delete community"><Trash2 size={14} /></button></div></div>{community.description && <p className="text-sm text-slate-500 mb-3">{community.description}</p>}<button onClick={() => openPostPanel(community)} className="text-[13px] font-semibold hover:underline flex items-center gap-1" style={{ color: BLUE }}><Send size={13} /> Manage Announcements</button></div>)}</div>}

    {showForm && <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setShowForm(false)}><form onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 relative"><button type="button" onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-400"><X size={18} /></button><h2 className="text-lg font-extrabold text-slate-900 mb-5">{editingId ? "Edit Community" : "Add Community"}</h2><div className="space-y-4"><label className="block"><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Name</span><input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={inputClass} /></label><label className="block"><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Description</span><textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className={inputClass} /></label><label className="block"><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Linked Course</span><select value={form.course_id} onChange={(event) => setForm((current) => ({ ...current, course_id: event.target.value }))} className={inputClass}><option value="">— None —</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label></div>{error && <p className="text-sm text-red-600 mt-4">{error}</p>}<button type="submit" className="w-full mt-6 text-white font-semibold py-2.5 rounded-md" style={{ backgroundColor: BLUE }}>{editingId ? "Save Changes" : "Create Community"}</button></form></div>}

    {postingFor && <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setPostingFor(null)}><div onClick={(event) => event.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto"><button onClick={() => setPostingFor(null)} className="absolute top-4 right-4 text-slate-400"><X size={18} /></button><div className="flex flex-wrap items-start justify-between gap-3 pr-7"><div><h2 className="text-lg font-extrabold text-slate-900 mb-1">{postingFor.name}</h2><p className="text-sm text-slate-500 mb-5">Create, edit or delete announcements. Joined students will receive notifications.</p></div><AdminExportButtons title={`${postingFor.name}-announcements`} rows={posts} columns={[{ label: "Title", key: "title" }, { label: "Announcement", key: "body" }, { label: "Link", key: "link_url" }, { label: "Created", value: (item) => item.created_at ? new Date(item.created_at).toLocaleString("en-IN") : "" }]} /></div><form onSubmit={handleSavePost} className="space-y-3 mb-7"><input value={postTitle} onChange={(event) => setPostTitle(event.target.value)} placeholder="Announcement title (optional)" className={inputClass} /><textarea required rows={4} value={postBody} onChange={(event) => setPostBody(event.target.value)} placeholder="Write your announcement…" className={inputClass} /><input type="url" value={postLink} onChange={(event) => setPostLink(event.target.value)} placeholder="Optional redirect link: YouTube or website URL" className={inputClass} /><div className="flex items-center gap-3"><button type="submit" disabled={postSubmitting} className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-md disabled:opacity-50" style={{ backgroundColor: BLUE }}><Send size={14} /> {postSubmitting ? "Saving…" : editingPostId ? "Save Announcement" : "Post Announcement"}</button>{editingPostId && <button type="button" onClick={resetPostForm} className="text-sm font-semibold text-slate-500 px-3 py-2">Cancel edit</button>}</div></form><h3 className="text-sm font-bold text-slate-700 mb-2">Existing announcements</h3><div className="space-y-3">{posts.length === 0 && <p className="text-sm text-slate-400">No announcements yet.</p>}{posts.map((post) => <div key={post.id} className="border border-slate-200 rounded-lg p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0">{post.title && <p className="font-semibold text-sm text-slate-800">{post.title}</p>}<p className="text-sm text-slate-600 whitespace-pre-wrap mt-1">{post.body}</p>{post.link_url && <a href={post.link_url} target="_blank" rel="noreferrer" className="text-xs font-semibold hover:underline flex items-center gap-1 mt-2" style={{ color: BLUE }}>Open attached link <ExternalLink size={11} /></a>}</div><div className="flex items-center gap-2 shrink-0"><button onClick={() => startEditPost(post)} className="text-slate-400 hover:text-slate-700" aria-label="Edit announcement"><Pencil size={14} /></button><button onClick={() => handleDeletePost(post.id)} className="text-red-400 hover:text-red-700" aria-label="Delete announcement"><Trash2 size={14} /></button></div></div><p className="text-[11px] text-slate-400 mt-2">{post.created_at ? new Date(post.created_at).toLocaleString() : ""}</p></div>)}</div></div></div>}
  </div>;
}

import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, Pencil, Video, FileText, FileUp, Check, X, ExternalLink } from "lucide-react";
import {
  adminFetchModules, adminCreateModule, adminUpdateModule, adminDeleteModule,
  adminCreateLesson, adminUpdateLesson, adminDeleteLesson, adminReplaceLessonResources,
} from "../../services/admin.js";
import { BLUE } from "../../theme";

const EMPTY_LESSON = { title: "", type: "video", duration: "", videoUrl: "", pdfUrl: "", pdfFile: null, content: "", resources: [], freePreview: false };

function lessonToForm(lesson) {
  return {
    title: lesson.title || "",
    type: lesson.type || "video",
    duration: lesson.duration || "",
    videoUrl: lesson.video_url || "",
    pdfUrl: lesson.pdf_url || "",
    pdfFile: null,
    content: lesson.content || "",
    resources: (lesson.lesson_resources || []).sort((a, b) => a.position - b.position).map((resource) => ({ label: resource.label || "", url: resource.url || "" })),
    freePreview: Boolean(lesson.free_preview),
  };
}

const inputClass = "w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400";
const hasInvalidResource = (resources = []) => resources.some((resource) => (resource.label?.trim() || resource.url?.trim()) && (!resource.label?.trim() || !/^https?:\/\//i.test(resource.url?.trim() || "")));

export default function AdminCourseContent() {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [lessonForms, setLessonForms] = useState({});
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingLessonForm, setEditingLessonForm] = useState(EMPTY_LESSON);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error: loadError } = await adminFetchModules(courseId);
    if (loadError) setError(loadError.message);
    setModules(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  const handleAddModule = async (event) => {
    event.preventDefault();
    if (!newModuleTitle.trim()) return;
    setError(""); setNotice("");
    const { error: createError } = await adminCreateModule(courseId, newModuleTitle.trim(), modules.length + 1);
    if (createError) { setError(createError.message); return; }
    setNewModuleTitle("");
    setNotice("Module added.");
    await load();
  };

  const startEditModule = (module) => { setEditingModuleId(module.id); setEditingModuleTitle(module.title); setError(""); };
  const saveEditModule = async (id) => {
    if (!editingModuleTitle.trim()) { setError("Module title is required."); return; }
    const { error: updateError } = await adminUpdateModule(id, { title: editingModuleTitle.trim() });
    if (updateError) { setError(updateError.message); return; }
    setEditingModuleId(null); await load();
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm("Delete this module and all its lessons?")) return;
    const { error: deleteError } = await adminDeleteModule(id);
    if (deleteError) { setError(deleteError.message); return; }
    await load();
  };

  const getLessonForm = (moduleId) => lessonForms[moduleId] || EMPTY_LESSON;
  const setLessonForm = (moduleId, patch) => setLessonForms((current) => ({ ...current, [moduleId]: { ...getLessonForm(moduleId), ...patch } }));

  const handleAddLesson = async (module) => {
    const form = getLessonForm(module.id);
    if (!form.title.trim()) { setError("Lesson title is required."); return; }
    if (form.type === "video" && !form.videoUrl.trim()) { setError("Add a video URL for this video lesson."); return; }
    if (form.type === "text" && !form.pdfFile && !form.pdfUrl.trim() && !form.content.trim()) { setError("Add a PDF, PDF URL or text content for this text lesson."); return; }
    if (hasInvalidResource(form.resources)) { setError("Each lesson link needs a label and a valid http:// or https:// URL."); return; }
    setError(""); setNotice("");
    const { error: createError } = await adminCreateLesson(module.id, { ...form, position: module.lessons.length + 1 });
    if (createError) { setError(createError.message); return; }
    setLessonForms((current) => ({ ...current, [module.id]: { ...EMPTY_LESSON } }));
    setNotice("Lesson added.");
    await load();
  };

  const startEditLesson = (lesson) => { setEditingLessonId(lesson.id); setEditingLessonForm(lessonToForm(lesson)); setError(""); };
  const cancelEditLesson = () => setEditingLessonId(null);
  const saveEditLesson = async (id) => {
    if (!editingLessonForm.title.trim()) { setError("Lesson title is required."); return; }
    if (editingLessonForm.type === "video" && !editingLessonForm.videoUrl.trim()) { setError("Add a video URL for this video lesson."); return; }
    if (editingLessonForm.type === "text" && !editingLessonForm.pdfFile && !editingLessonForm.pdfUrl.trim() && !editingLessonForm.content.trim()) { setError("Add a PDF, PDF URL or text content for this text lesson."); return; }
    if (hasInvalidResource(editingLessonForm.resources)) { setError("Each lesson link needs a label and a valid http:// or https:// URL."); return; }
    setError(""); setNotice("");
    const { error: updateError } = await adminUpdateLesson(id, editingLessonForm);
    if (updateError) { setError(updateError.message); return; }
    const { error: resourceError } = await adminReplaceLessonResources(id, editingLessonForm.resources || []);
    if (resourceError) { setError(resourceError.message); return; }
    setEditingLessonId(null); setNotice("Lesson updated."); await load();
  };

  const handleToggleFreePreview = async (lesson) => {
    const { error: updateError } = await adminUpdateLesson(lesson.id, { freePreview: !lesson.free_preview });
    if (updateError) setError(updateError.message); else await load();
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm("Delete this lesson?")) return;
    const { error: deleteError } = await adminDeleteLesson(id);
    if (deleteError) { setError(deleteError.message); return; }
    await load();
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <Link to="/nexrnn/master_nexrnn/admin/courses" className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4"><ChevronLeft size={15} /> Back to Courses</Link>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Course Content</h1>
      <p className="text-sm text-slate-500 mb-6">{courseId}</p>

      <form onSubmit={handleAddModule} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row gap-3 mb-6">
        <input value={newModuleTitle} onChange={(event) => setNewModuleTitle(event.target.value)} placeholder="New module title" className={`${inputClass} flex-1`} />
        <button type="submit" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-md hover:opacity-90" style={{ backgroundColor: BLUE }}><Plus size={15} /> Add Module</button>
      </form>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">{error}</p>}
      {notice && <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-2 mb-4">{notice}</p>}
      {loading ? <p className="text-sm text-slate-400">Loading content…</p> : modules.length === 0 ? <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center"><p className="font-semibold text-slate-700">No modules yet.</p><p className="text-sm text-slate-400 mt-1">Add a module above, then add its lessons.</p></div> : <div className="space-y-6">{modules.map((module) => { const form = getLessonForm(module.id); return <ModuleCard key={module.id} module={module} form={form} setForm={(patch) => setLessonForm(module.id, patch)} editingModuleId={editingModuleId} editingModuleTitle={editingModuleTitle} setEditingModuleTitle={setEditingModuleTitle} onStartEditModule={startEditModule} onSaveEditModule={saveEditModule} onCancelEditModule={() => setEditingModuleId(null)} onDeleteModule={handleDeleteModule} editingLessonId={editingLessonId} editingLessonForm={editingLessonForm} setEditingLessonForm={setEditingLessonForm} onStartEditLesson={startEditLesson} onSaveEditLesson={saveEditLesson} onCancelEditLesson={cancelEditLesson} onAddLesson={handleAddLesson} onTogglePreview={handleToggleFreePreview} onDeleteLesson={handleDeleteLesson} />; })}</div>}
    </div>
  );
}

function ModuleCard({ module, form, setForm, editingModuleId, editingModuleTitle, setEditingModuleTitle, onStartEditModule, onSaveEditModule, onCancelEditModule, onDeleteModule, editingLessonId, editingLessonForm, setEditingLessonForm, onStartEditLesson, onSaveEditLesson, onCancelEditLesson, onAddLesson, onTogglePreview, onDeleteLesson }) {
  const isEditingModule = editingModuleId === module.id;
  return <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200 gap-3">
      {isEditingModule ? <div className="flex-1 flex items-center gap-2"><input value={editingModuleTitle} onChange={(event) => setEditingModuleTitle(event.target.value)} className={`${inputClass} flex-1`} autoFocus /><button type="button" onClick={() => onSaveEditModule(module.id)} className="text-green-600 hover:text-green-800"><Check size={16} /></button><button type="button" onClick={onCancelEditModule} className="text-slate-400 hover:text-slate-600"><X size={16} /></button></div> : <><span className="font-bold text-slate-800 text-sm">{module.title}</span><div className="flex items-center gap-3 shrink-0"><button type="button" onClick={() => onStartEditModule(module)} className="text-slate-400 hover:text-slate-700" aria-label="Edit module"><Pencil size={14} /></button><button type="button" onClick={() => onDeleteModule(module.id)} className="text-red-500 hover:text-red-700" aria-label="Delete module"><Trash2 size={15} /></button></div></>}
    </div>

    <div className="divide-y divide-slate-100">
      {module.lessons.map((lesson) => editingLessonId === lesson.id ? <LessonEditor key={lesson.id} form={editingLessonForm} setForm={setEditingLessonForm} onSave={() => onSaveEditLesson(lesson.id)} onCancel={onCancelEditLesson} /> : <LessonRow key={lesson.id} lesson={lesson} onEdit={() => onStartEditLesson(lesson)} onTogglePreview={() => onTogglePreview(lesson)} onDelete={() => onDeleteLesson(lesson.id)} />)}
    </div>

    <div className="px-5 py-4 bg-blue-50/40 border-t border-slate-100">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Add lesson</p>
      <LessonEditor form={form} setForm={setForm} onSave={() => onAddLesson(module)} adding />
    </div>
  </div>;
}

function LessonEditor({ form, setForm, onSave, onCancel, adding = false }) {
  const resources = form.resources || [];
  const updateResource = (index, field, value) => {
    setForm({ resources: resources.map((resource, resourceIndex) => resourceIndex === index ? { ...resource, [field]: value } : resource) });
  };
  const addResource = () => setForm({ resources: [...resources, { label: "", url: "" }] });
  const removeResource = (index) => setForm({ resources: resources.filter((_, resourceIndex) => resourceIndex !== index) });

  return <div className="space-y-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <input value={form.title} onChange={(event) => setForm({ title: event.target.value })} placeholder="Lesson title" className={`${inputClass} sm:col-span-2`} />
      <select value={form.type} onChange={(event) => setForm({ type: event.target.value })} className={inputClass}><option value="video">Video lesson</option><option value="text">Text / PDF lesson</option></select>
      <input value={form.duration} onChange={(event) => setForm({ duration: event.target.value })} placeholder="Duration e.g. 12 MIN" className={inputClass} />
      {form.type === "video" ? <input value={form.videoUrl} onChange={(event) => setForm({ videoUrl: event.target.value })} placeholder="YouTube, Vimeo or direct MP4 URL" className={`${inputClass} sm:col-span-2`} /> : <>
        <textarea rows={3} value={form.content} onChange={(event) => setForm({ content: event.target.value })} placeholder="Optional lesson notes / text" className={`${inputClass} sm:col-span-2`} />
        <input value={form.pdfUrl} onChange={(event) => setForm({ pdfUrl: event.target.value })} placeholder="PDF URL or Google Drive share link" className={`${inputClass} sm:col-span-2`} />
        <label className="sm:col-span-2 flex items-center gap-2 px-3 py-2.5 text-sm rounded-md border border-dashed border-slate-300 bg-white cursor-pointer hover:border-blue-400"><FileUp size={16} style={{ color: BLUE }} /><span className="flex-1">{form.pdfFile ? form.pdfFile.name : "Upload a PDF (max 25 MB)"}</span><input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => setForm({ pdfFile: event.target.files?.[0] || null })} /></label>
        {form.pdfUrl && <a href={form.pdfUrl} target="_blank" rel="noreferrer" className="sm:col-span-2 text-xs font-semibold hover:underline flex items-center gap-1" style={{ color: BLUE }}>Current PDF / Drive file <ExternalLink size={12} /></a>}
        <p className="sm:col-span-2 text-[11px] text-slate-400">For Google Drive, set the file sharing permission to “Anyone with the link” before saving.</p>
      </>}
    </div>

    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-3 mb-2"><div><p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Lesson links</p><p className="text-[11px] text-slate-400">Add links such as Doubts / Queries Forum, WhatsApp, Telegram or other resources.</p></div><button type="button" onClick={addResource} className="text-xs font-bold flex items-center gap-1 hover:underline" style={{ color: BLUE }}><Plus size={13} /> Add link</button></div>
      {resources.length === 0 ? <p className="text-xs text-slate-400">No resource links added.</p> : <div className="space-y-2">{resources.map((resource, index) => <div key={index} className="grid grid-cols-[1fr_1.4fr_auto] gap-2"><input value={resource.label} onChange={(event) => updateResource(index, "label", event.target.value)} placeholder="Link label e.g. WhatsApp Group" className={inputClass} /><input type="url" value={resource.url} onChange={(event) => updateResource(index, "url", event.target.value)} placeholder="https://..." className={inputClass} /><button type="button" onClick={() => removeResource(index)} className="text-red-500 hover:text-red-700 px-2" aria-label="Remove link"><Trash2 size={15} /></button></div>)}</div>}
    </div>

    <label className="flex items-center gap-2 text-[13px] text-slate-600"><input type="checkbox" checked={Boolean(form.freePreview)} onChange={(event) => setForm({ freePreview: event.target.checked })} /> Free preview <span className="text-[11px] text-slate-400">(otherwise shown as Paid)</span></label>
    <div className="flex gap-2"><button type="button" onClick={onSave} className="flex items-center gap-1.5 text-sm font-semibold text-white px-3 py-1.5 rounded-md hover:opacity-90" style={{ backgroundColor: BLUE }}><Check size={14} /> {adding ? "Add Lesson" : "Save"}</button>{onCancel && <button type="button" onClick={onCancel} className="text-sm font-semibold text-slate-500 px-3 py-1.5 rounded-md hover:bg-slate-100">Cancel</button>}</div>
  </div>;
}

function LessonRow({ lesson, onEdit, onTogglePreview, onDelete }) {
  const LessonIcon = lesson.type === "video" ? Video : FileText;
  return <div className="px-5 py-4 flex items-start gap-3"><LessonIcon size={16} className="text-slate-400 mt-0.5 shrink-0" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{lesson.title}</p><p className="text-xs text-slate-400 mt-1">{lesson.type === "video" ? (lesson.duration || "Video") : (lesson.pdf_url ? "PDF viewer attached" : "Text lesson")}{lesson.video_url && " · video link added"}</p><div className="flex flex-wrap gap-2 mt-2">{lesson.free_preview && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">FREE PREVIEW</span>}{lesson.pdf_url && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">PDF</span>}</div></div><div className="flex items-center gap-3 shrink-0"><button type="button" onClick={onTogglePreview} className="text-[11px] font-semibold text-slate-500 hover:text-slate-800">{lesson.free_preview ? "Make paid" : "Make preview"}</button><button type="button" onClick={onEdit} className="text-slate-400 hover:text-slate-700" aria-label="Edit lesson"><Pencil size={14} /></button><button type="button" onClick={onDelete} className="text-red-500 hover:text-red-700" aria-label="Delete lesson"><Trash2 size={14} /></button></div></div>;
}

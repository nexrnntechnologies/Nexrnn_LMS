import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, Pencil, Video, FileText, Check, X } from "lucide-react";
import {
  adminFetchModules, adminCreateModule, adminUpdateModule, adminDeleteModule,
  adminCreateLesson, adminUpdateLesson, adminDeleteLesson,
} from "../../services/admin.js";
import { BLUE } from "../../theme";

const EMPTY_LESSON = { title: "", type: "video", duration: "", videoUrl: "", freePreview: false };

function lessonToForm(l) {
  return {
    title: l.title, type: l.type, duration: l.duration || "",
    videoUrl: l.video_url || "", freePreview: l.free_preview,
  };
}

export default function AdminCourseContent() {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [lessonForms, setLessonForms] = useState({}); // moduleId -> new-lesson form state
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingLessonForm, setEditingLessonForm] = useState(EMPTY_LESSON);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error: err } = await adminFetchModules(courseId);
    if (err) setError(err.message);
    setModules(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    setError("");
    const { error: err } = await adminCreateModule(courseId, newModuleTitle.trim(), modules.length + 1);
    if (err) { setError(err.message); return; }
    setNewModuleTitle("");
    load();
  };

  const startEditModule = (m) => { setEditingModuleId(m.id); setEditingModuleTitle(m.title); };
  const saveEditModule = async (id) => {
    setError("");
    const { error: err } = await adminUpdateModule(id, { title: editingModuleTitle });
    if (err) { setError(err.message); return; }
    setEditingModuleId(null);
    load();
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm("Delete this module and all its lessons?")) return;
    await adminDeleteModule(id);
    load();
  };

  const getLessonForm = (moduleId) => lessonForms[moduleId] || EMPTY_LESSON;
  const setLessonForm = (moduleId, patch) =>
    setLessonForms((prev) => ({ ...prev, [moduleId]: { ...getLessonForm(moduleId), ...patch } }));

  const handleAddLesson = async (module) => {
    const form = getLessonForm(module.id);
    if (!form.title.trim()) return;
    setError("");
    const { error: err } = await adminCreateLesson(module.id, {
      ...form,
      position: module.lessons.length + 1,
    });
    if (err) { setError(err.message); return; }
    setLessonForms((prev) => ({ ...prev, [module.id]: EMPTY_LESSON }));
    load();
  };

  const startEditLesson = (l) => { setEditingLessonId(l.id); setEditingLessonForm(lessonToForm(l)); };
  const cancelEditLesson = () => setEditingLessonId(null);

  const saveEditLesson = async (id) => {
    setError("");
    const { error: err } = await adminUpdateLesson(id, {
      title: editingLessonForm.title,
      type: editingLessonForm.type,
      duration: editingLessonForm.duration,
      video_url: editingLessonForm.videoUrl,
      free_preview: editingLessonForm.freePreview,
    });
    if (err) { setError(err.message); return; }
    setEditingLessonId(null);
    load();
  };

  const handleToggleFreePreview = async (lesson) => {
    await adminUpdateLesson(lesson.id, { free_preview: !lesson.free_preview });
    load();
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm("Delete this lesson?")) return;
    await adminDeleteLesson(id);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <Link
        to="/nexrnn/master_nexrnn/admin/courses"
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4"
      >
        <ChevronLeft size={15} /> Back to Courses
      </Link>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Course Content</h1>
      <p className="text-sm text-slate-500 mb-8">{courseId}</p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-6">
          {modules.map((m) => {
            const lf = getLessonForm(m.id);
            const isEditingModule = editingModuleId === m.id;
            return (
              <div key={m.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200 gap-3">
                  {isEditingModule ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        value={editingModuleTitle}
                        onChange={(e) => setEditingModuleTitle(e.target.value)}
                        className="flex-1 px-2 py-1.5 text-sm rounded-md border border-slate-300"
                        autoFocus
                      />
                      <button onClick={() => saveEditModule(m.id)} className="text-green-600 hover:text-green-800"><Check size={16} /></button>
                      <button onClick={() => setEditingModuleId(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-slate-800 text-sm">{m.title}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <button onClick={() => startEditModule(m)} className="text-slate-400 hover:text-slate-700"><Pencil size={14} /></button>
                        <button onClick={() => handleDeleteModule(m.id)} className="text-red-500 hover:text-red-700"><Trash2 size={15} /></button>
                      </div>
                    </>
                  )}
                </div>

                <div className="divide-y divide-slate-100">
                  {m.lessons.map((l) => {
                    const LType = l.type === "video" ? Video : FileText;
                    const isEditingLesson = editingLessonId === l.id;

                    if (isEditingLesson) {
                      return (
                        <div key={l.id} className="px-5 py-4 bg-blue-50/40 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              value={editingLessonForm.title}
                              onChange={(e) => setEditingLessonForm((f) => ({ ...f, title: e.target.value }))}
                              placeholder="Lesson title"
                              className="px-3 py-2 text-sm rounded-md border border-slate-300 col-span-2"
                            />
                            <select
                              value={editingLessonForm.type}
                              onChange={(e) => setEditingLessonForm((f) => ({ ...f, type: e.target.value }))}
                              className="px-3 py-2 text-sm rounded-md border border-slate-300"
                            >
                              <option value="video">Video</option>
                              <option value="text">Text</option>
                            </select>
                            <input
                              value={editingLessonForm.duration}
                              onChange={(e) => setEditingLessonForm((f) => ({ ...f, duration: e.target.value }))}
                              placeholder="Duration e.g. 12 MIN"
                              className="px-3 py-2 text-sm rounded-md border border-slate-300"
                            />
                            <input
                              value={editingLessonForm.videoUrl}
                              onChange={(e) => setEditingLessonForm((f) => ({ ...f, videoUrl: e.target.value }))}
                              placeholder="Video embed URL"
                              className="px-3 py-2 text-sm rounded-md border border-slate-300 col-span-2"
                            />
                            <label className="flex items-center gap-2 text-[13px] text-slate-600 col-span-2">
                              <input
                                type="checkbox"
                                checked={editingLessonForm.freePreview}
                                onChange={(e) => setEditingLessonForm((f) => ({ ...f, freePreview: e.target.checked }))}
                              />
                              Free preview
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditLesson(l.id)}
                              className="flex items-center gap-1.5 text-sm font-semibold text-white px-3 py-1.5 rounded-md hover:opacity-90"
                              style={{ backgroundColor: BLUE }}
                            >
                              <Check size={14} /> Save
                            </button>
                            <button
                              onClick={cancelEditLesson}
                              className="text-sm font-semibold text-slate-500 px-3 py-1.5 rounded-md hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                        <LType size={15} className="text-slate-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{l.title}</p>
                          {l.video_url && <p className="text-[11px] text-slate-400 truncate">{l.video_url}</p>}
                        </div>
                        <button
                          onClick={() => handleToggleFreePreview(l)}
                          className={`text-[11px] font-bold px-2 py-1 rounded shrink-0 ${
                            l.free_preview ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {l.free_preview ? "FREE PREVIEW" : "PAID"}
                        </button>
                        <button onClick={() => startEditLesson(l)} className="text-slate-400 hover:text-slate-700 shrink-0">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteLesson(l.id)} className="text-red-400 hover:text-red-600 shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                  {m.lessons.length === 0 && (
                    <p className="px-5 py-3 text-[13px] text-slate-400">No lessons yet.</p>
                  )}
                </div>

                {/* Add lesson form */}
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={lf.title}
                      onChange={(e) => setLessonForm(m.id, { title: e.target.value })}
                      placeholder="Lesson title"
                      className="px-3 py-2 text-sm rounded-md border border-slate-200 col-span-2"
                    />
                    <select
                      value={lf.type}
                      onChange={(e) => setLessonForm(m.id, { type: e.target.value })}
                      className="px-3 py-2 text-sm rounded-md border border-slate-200"
                    >
                      <option value="video">Video</option>
                      <option value="text">Text</option>
                    </select>
                    <input
                      value={lf.duration}
                      onChange={(e) => setLessonForm(m.id, { duration: e.target.value })}
                      placeholder="Duration e.g. 12 MIN"
                      className="px-3 py-2 text-sm rounded-md border border-slate-200"
                    />
                    <input
                      value={lf.videoUrl}
                      onChange={(e) => setLessonForm(m.id, { videoUrl: e.target.value })}
                      placeholder="Video embed URL (YouTube/Vimeo embed link)"
                      className="px-3 py-2 text-sm rounded-md border border-slate-200 col-span-2"
                    />
                    <label className="flex items-center gap-2 text-[13px] text-slate-600 col-span-2">
                      <input
                        type="checkbox"
                        checked={lf.freePreview}
                        onChange={(e) => setLessonForm(m.id, { freePreview: e.target.checked })}
                      />
                      Free preview (viewable without enrolling)
                    </label>
                  </div>
                  <button
                    onClick={() => handleAddLesson(m)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-white px-3 py-2 rounded-md hover:opacity-90"
                    style={{ backgroundColor: BLUE }}
                  >
                    <Plus size={14} /> Add Lesson
                  </button>
                </div>
              </div>
            );
          })}

          <form onSubmit={handleAddModule} className="border border-dashed border-slate-300 rounded-lg p-4 flex gap-2">
            <input
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder="New module title, e.g. Module 4: Advanced Topics"
              className="flex-1 px-3 py-2 text-sm rounded-md border border-slate-200"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-md hover:opacity-90"
              style={{ backgroundColor: BLUE }}
            >
              <Plus size={14} /> Add Module
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

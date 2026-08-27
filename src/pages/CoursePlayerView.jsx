import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, useOutletContext } from "react-router-dom";
import { ChevronLeft, ArrowRight, CheckCircle2, Circle, Video, FileText, Play, ChevronRight, Lock, FileDown, ExternalLink } from "lucide-react";
import { NAVY, NAVY_SOFT, BLUE } from "../theme";
import { CURRICULUM_BY_COURSE, MODULES } from "../data/mockData";
import { fetchCourseCurriculumWithProgress, markLessonDone } from "../services/courses.js";
import { normalizeVideoUrl, normalizeDocumentUrl } from "../lib/media.js";
import LockedContentModal from "../components/LockedContentModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function CoursePlayerView() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const initialLessonId = searchParams.get("lesson");
  const isPreview = searchParams.get("preview") === "1";
  const navigate = useNavigate();
  const { courses, myCourses, reloadMyCourses, enrollCourse, myCoursesLoading, coursesLoading } = useOutletContext();
  const { user, isSupabaseConfigured } = useAuth();
  const enrolledCourse = myCourses.find((item) => item.id === courseId);
  const course = enrolledCourse || (isPreview ? courses.find((item) => item.id === courseId) : null);
  const isEnrolled = Boolean(enrolledCourse);

  const [modules, setModules] = useState(CURRICULUM_BY_COURSE[courseId] || MODULES);
  const [activeLesson, setActiveLesson] = useState(null);
  const [openModules, setOpenModules] = useState({});
  const [lockedLesson, setLockedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (myCoursesLoading || coursesLoading) return;
    if (!course) navigate(`/courses/${courseId}`, { replace: true });
  }, [course, courseId, navigate, myCoursesLoading, coursesLoading]);

  useEffect(() => {
    if (!course) return;
    let active = true;
    setLoading(true);
    fetchCourseCurriculumWithProgress(courseId, isEnrolled ? user?.id : null).then((next) => {
      if (!active) return;
      setModules(next);
      const allLessons = next.flatMap((module) => module.lessons);
      const requested = allLessons.find((lesson) => lesson.id === initialLessonId);
      const firstAllowed = isPreview ? allLessons.find((lesson) => lesson.freePreview) : allLessons[0];
      const target = requested && (!isPreview || requested.freePreview) ? requested : firstAllowed;
      setActiveLesson(target || null);
      const parent = next.find((module) => module.lessons.some((lesson) => lesson.id === target?.id));
      setOpenModules(parent ? { [parent.id]: true } : {});
      setLoading(false);
    });
    return () => { active = false; };
  }, [courseId, course?.id, isEnrolled, initialLessonId]);

  if (myCoursesLoading || coursesLoading || !course || loading) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-sm text-slate-400">Loading course…</div>;
  if (!activeLesson) return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-sm text-slate-500">No lessons have been added to this course yet.</div>;

  const flatLessons = modules.flatMap((module) => module.lessons);
  const totalLessons = flatLessons.length;
  const doneLessons = flatLessons.filter((lesson) => lesson.done).length;
  const pct = isEnrolled && totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;
  const isLastLesson = flatLessons.findIndex((lesson) => lesson.id === activeLesson.id) === flatLessons.length - 1;
  const courseCompleted = isEnrolled && totalLessons > 0 && doneLessons === totalLessons;
  const certificateReady = courseCompleted && course.courseComplete === true && course.certificate !== false;

  const toggleModule = (id) => setOpenModules((current) => ({ ...current, [id]: !current[id] }));
  const goToLesson = (lesson) => {
    if (isPreview && !lesson.freePreview) {
      setLockedLesson(lesson);
      return;
    }
    setActiveLesson(lesson);
  };

  const markCompleteAndContinue = async () => {
    if (!isEnrolled) {
      navigate(`/courses/${courseId}`);
      return;
    }
    setModules((current) => current.map((module) => ({ ...module, lessons: module.lessons.map((lesson) => lesson.id === activeLesson.id ? { ...lesson, done: true } : lesson) })));
    setActiveLesson((current) => current ? { ...current, done: true } : current);
    if (isSupabaseConfigured && user) {
      await markLessonDone(user.id, activeLesson.id);
      await reloadMyCourses();
    }
    const next = flatLessons[flatLessons.findIndex((lesson) => lesson.id === activeLesson.id) + 1];
    if (next) {
      if (isPreview && !next.freePreview) { navigate(`/courses/${courseId}`); return; }
      setActiveLesson(next);
      const parent = modules.find((module) => module.lessons.some((lesson) => lesson.id === next.id));
      if (parent) setOpenModules((current) => ({ ...current, [parent.id]: true }));
    }
  };

  const media = normalizeVideoUrl(activeLesson.videoUrl);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      <aside className="w-full md:w-80 border-r border-slate-200 bg-white overflow-y-auto shrink-0">
        <button onClick={() => navigate(isPreview ? `/courses/${courseId}` : "/my-courses")} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 px-5 pt-5"><ChevronLeft size={15} /> {isPreview ? "Back to Course" : "Go to Dashboard"}</button>
        <div className="px-5 pt-4"><h2 className="font-extrabold text-slate-900 leading-snug">{course.title}</h2><div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3 mb-1"><div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: BLUE }} /></div><p className="text-[12px] text-slate-500 mb-4">{isPreview ? "Free preview" : `${pct}% complete`}</p></div>
        <div className="px-5 pb-4"><div className="rounded-lg p-4" style={{ backgroundColor: NAVY_SOFT }}><p className="text-[13px] text-slate-200 mb-3">Join the conversation in the Nexrnn {course.title} — Community.</p><button onClick={() => navigate("/community")} className="w-full text-xs font-bold text-white border border-white/20 rounded-md py-2 flex items-center justify-center gap-1 hover:bg-white/10">GO TO COMMUNITY <ArrowRight size={12} /></button></div></div>
        <nav className="border-t border-slate-100">
          {modules.map((module) => <div key={module.id} className="border-b border-slate-100">
            <button onClick={() => toggleModule(module.id)} className="w-full flex items-center justify-between px-5 py-3 text-left"><span className="text-sm font-bold text-slate-800">{module.title}</span><span className="text-[11px] text-slate-400 font-semibold shrink-0 ml-2">{isPreview ? `${module.lessons.filter((lesson) => lesson.freePreview).length} preview` : `${module.lessons.filter((lesson) => lesson.done).length}/${module.lessons.length}`}</span></button>
            {openModules[module.id] && <div>{module.lessons.map((lesson) => { const LessonType = lesson.type === "video" ? Video : FileText; const active = activeLesson.id === lesson.id; const locked = isPreview && !lesson.freePreview; return <button key={lesson.id} onClick={() => goToLesson(lesson)} className={`w-full flex items-center gap-3 px-5 py-3 text-left border-l-2 ${active ? "bg-slate-50" : "hover:bg-slate-50"}`} style={{ borderColor: active ? BLUE : "transparent" }}>{locked ? <Lock size={15} className="text-slate-300 shrink-0" /> : lesson.done ? <CheckCircle2 size={16} style={{ color: BLUE }} className="shrink-0" /> : <Circle size={16} className="text-slate-300 shrink-0" />}<div className="min-w-0 flex-1"><p className={`text-[13px] font-medium truncate ${locked ? "text-slate-400" : "text-slate-700"}`}>{lesson.title}</p><p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><LessonType size={11} /> {lesson.type === "video" ? lesson.duration || "VIDEO" : lesson.pdfUrl ? "PDF" : "TEXT"}</p></div><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${lesson.freePreview ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{lesson.freePreview ? "FREE" : "PAID"}</span></button>; })}</div>}
          </div>)}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-white"><div className="border-b border-slate-200 px-8 py-4"><p className="text-sm font-semibold text-slate-500">{activeLesson.title}</p></div><div className="px-8 py-8 max-w-4xl">
        {activeLesson.type === "text" ? <TextLesson lesson={activeLesson} /> : media.kind === "iframe" ? <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-black"><iframe src={media.src} title={activeLesson.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : media.kind === "video" ? <div className="aspect-video rounded-xl overflow-hidden mb-6 bg-black"><video src={media.src} controls playsInline className="w-full h-full" /></div> : <div className="aspect-video rounded-xl flex flex-col gap-3 items-center justify-center mb-6" style={{ backgroundColor: NAVY }}><Play size={30} className="text-white/70" /><p className="text-white/70 text-sm">No video link has been added yet.</p></div>}
        <LessonResources resources={activeLesson.resources} />
        <p className="text-sm text-slate-600 mb-8">{isPreview ? "You are viewing a free preview lesson." : "Please watch or read this lesson fully before moving to the next one."}</p>
        {certificateReady ? <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-4 flex flex-wrap items-center justify-between gap-4"><div><p className="font-bold text-green-800">Course completed 🎉</p><p className="text-sm text-green-700 mt-1">Your certificate is ready to view and download.</p></div><button onClick={() => navigate(`/my-courses/certificates?course=${encodeURIComponent(courseId)}`)} className="text-white font-semibold px-4 py-2.5 rounded-md flex items-center gap-2 hover:opacity-90" style={{ backgroundColor: BLUE }}>View Certificate <ArrowRight size={16} /></button></div> : courseCompleted ? <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-4"><p className="font-bold text-amber-800">All current lessons completed.</p><p className="text-sm text-amber-700 mt-1">This course is still ongoing. The certificate will be available after the admin marks the course complete.</p></div> : <button onClick={markCompleteAndContinue} disabled={isEnrolled && isLastLesson && activeLesson.done} className="text-white font-semibold px-5 py-2.5 rounded-md flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: BLUE }}>{isPreview ? "Enroll to continue" : isLastLesson ? "Complete Lesson" : "Complete & Continue"}{isPreview ? <ArrowRight size={16} /> : !(isLastLesson && activeLesson.done) && <ChevronRight size={16} />}</button>}
      </div></main>
      {lockedLesson && <LockedContentModal lesson={lockedLesson} onClose={() => setLockedLesson(null)} onBuyNow={() => { setLockedLesson(null); enrollCourse(course); }} />}
    </div>
  );
}

function TextLesson({ lesson }) {
  const documentUrl = normalizeDocumentUrl(lesson.pdfUrl);
  return <div className="mb-6">{documentUrl ? <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50"><div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200"><div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><FileText size={17} style={{ color: BLUE }} /> Lesson PDF</div><a href={documentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold hover:underline" style={{ color: BLUE }}><FileDown size={14} /> Open / Download</a></div><iframe src={`${documentUrl}#toolbar=1&navpanes=0`} title={lesson.title} className="w-full h-[min(72vh,760px)] bg-white" /></div> : <div className="rounded-xl border border-slate-200 bg-slate-50 p-6"><FileText size={24} style={{ color: BLUE }} className="mb-4" /><p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{lesson.content || "No text has been added to this lesson yet."}</p></div>}</div>;
}

function LessonResources({ resources = [] }) {
  const validResources = resources.filter((resource) => resource?.label && /^https?:\/\//i.test(resource.url || ""));
  if (!validResources.length) return null;
  return <div className="mb-5"><p className="text-xs font-bold tracking-wide text-slate-400 uppercase mb-2">Helpful links</p><div className="flex flex-wrap gap-2">{validResources.map((resource) => <a key={resource.id || resource.url} href={resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-blue-100 bg-blue-50 text-sm font-semibold hover:bg-blue-100" style={{ color: BLUE }}><ExternalLink size={14} /> {resource.label}</a>)}</div></div>;
}

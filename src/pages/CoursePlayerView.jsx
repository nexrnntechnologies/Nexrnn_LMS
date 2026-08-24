import React, { useState, useEffect } from "react";
import {
  ChevronLeft, ArrowRight, CheckCircle2, Circle, Video, FileText,
  Play, ChevronRight,
} from "lucide-react";
import { NAVY, NAVY_SOFT, BLUE } from "../theme";
import { CURRICULUM_BY_COURSE, MODULES } from "../data/mockData";

export default function CoursePlayerView({ course, setView, initialLessonId }) {
  const courseModules = CURRICULUM_BY_COURSE[course?.id] || MODULES;
  const [modules, setModules] = useState(courseModules);
  const [activeLesson, setActiveLesson] = useState(
    courseModules.flatMap((m) => m.lessons).find((l) => l.id === initialLessonId) || courseModules[0].lessons[0]
  );
  const [openModules, setOpenModules] = useState({ [courseModules[0].id]: true });

  useEffect(() => {
    const next = CURRICULUM_BY_COURSE[course?.id] || MODULES;
    setModules(next);
    const target = next.flatMap((m) => m.lessons).find((l) => l.id === initialLessonId) || next[0].lessons[0];
    setActiveLesson(target);
    const parent = next.find((m) => m.lessons.some((l) => l.id === target.id));
    setOpenModules({ [parent?.id || next[0].id]: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, initialLessonId]);

  const toggleModule = (id) => setOpenModules((p) => ({ ...p, [id]: !p[id] }));

  const flatLessons = modules.flatMap((m) => m.lessons);
  const totalLessons = flatLessons.length;
  const doneLessons = flatLessons.filter((l) => l.done).length;
  const pct = Math.round((doneLessons / totalLessons) * 100);

  const goToLesson = (lesson) => setActiveLesson(lesson);

  const markCompleteAndContinue = () => {
    setModules((prev) =>
      prev.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => (l.id === activeLesson.id ? { ...l, done: true } : l)),
      }))
    );
    const idx = flatLessons.findIndex((l) => l.id === activeLesson.id);
    const next = flatLessons[idx + 1];
    if (next) {
      setActiveLesson(next);
      const parentModule = modules.find((m) => m.lessons.some((l) => l.id === next.id));
      if (parentModule) setOpenModules((p) => ({ ...p, [parentModule.id]: true }));
    }
  };

  const isLastLesson = flatLessons.findIndex((l) => l.id === activeLesson.id) === flatLessons.length - 1;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-full md:w-80 border-r border-slate-200 bg-white overflow-y-auto shrink-0">
        <button
          onClick={() => setView("dashboard")}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 px-5 pt-5"
        >
          <ChevronLeft size={15} /> Go to Dashboard
        </button>

        <div className="px-5 pt-4">
          <h2 className="font-extrabold text-slate-900 leading-snug">{course?.title || "Digital Marketing"}</h2>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3 mb-1">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: BLUE }} />
          </div>
          <p className="text-[12px] text-slate-500 mb-4">{pct}% complete</p>
        </div>

        <div className="px-5 pb-4">
          <div className="rounded-lg p-4" style={{ backgroundColor: NAVY_SOFT }}>
            <p className="text-[13px] text-slate-200 mb-3">
              Join the conversation in the Nexrnn {course?.title || "Course"} — Community.
            </p>
            <button
              onClick={() => setView("community")}
              className="w-full text-xs font-bold text-white border border-white/20 rounded-md py-2 flex items-center justify-center gap-1 hover:bg-white/10"
            >
              GO TO COMMUNITY <ArrowRight size={12} />
            </button>
          </div>
        </div>

        <nav className="border-t border-slate-100">
          {modules.map((m) => (
            <div key={m.id} className="border-b border-slate-100">
              <button
                onClick={() => toggleModule(m.id)}
                className="w-full flex items-center justify-between px-5 py-3 text-left"
              >
                <span className="text-sm font-bold text-slate-800">{m.title}</span>
                <span className="text-[11px] text-slate-400 font-semibold shrink-0 ml-2">
                  {m.lessons.filter((l) => l.done).length}/{m.lessons.length}
                </span>
              </button>
              {openModules[m.id] && (
                <div>
                  {m.lessons.map((l) => {
                    const LType = l.type === "video" ? Video : FileText;
                    const active = activeLesson.id === l.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => goToLesson(l)}
                        className={`w-full flex items-center gap-3 px-5 py-3 text-left border-l-2 ${
                          active ? "bg-slate-50" : "hover:bg-slate-50"
                        }`}
                        style={{ borderColor: active ? BLUE : "transparent" }}
                      >
                        {l.done ? (
                          <CheckCircle2 size={16} style={{ color: BLUE }} className="shrink-0" />
                        ) : (
                          <Circle size={16} className="text-slate-300 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-slate-700 truncate">{l.title}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <LType size={11} /> {l.type === "video" ? l.duration : "TEXT"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="border-b border-slate-200 px-8 py-4">
          <p className="text-sm font-semibold text-slate-500">{activeLesson.title}</p>
        </div>

        <div className="px-8 py-8 max-w-3xl">
          <div
            className="aspect-video rounded-xl flex items-center justify-center mb-6"
            style={{ backgroundColor: NAVY }}
          >
            <button
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: BLUE }}
            >
              <Play size={26} className="text-white fill-white ml-1" />
            </button>
          </div>

          <p className="text-sm text-slate-600 mb-2">
            Please watch this lesson fully before moving to the next one.
          </p>
          <div className="flex flex-wrap gap-4 text-sm mb-8">
            <button className="font-semibold hover:underline" style={{ color: BLUE }}>Join WhatsApp Group</button>
            <button className="font-semibold hover:underline" style={{ color: BLUE }}>Join Telegram Group</button>
            <button onClick={() => setView("community")} className="font-semibold hover:underline" style={{ color: BLUE }}>
              Doubts / Queries Forum
            </button>
          </div>

          <button
            onClick={markCompleteAndContinue}
            disabled={isLastLesson && activeLesson.done}
            className="text-white font-semibold px-5 py-2.5 rounded-md flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: BLUE }}
          >
            {isLastLesson ? "Complete Lesson" : "Complete & Continue"}
            {!(isLastLesson && activeLesson.done) && <ChevronRight size={16} />}
          </button>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import {
  ArrowLeft, Clock, BarChart2, Monitor, FolderKanban, Award, Users2,
  PlayCircle, ChevronDown, ChevronUp, CheckCircle, Video, FileText,
  Lock, CheckCircle2, Circle,
} from "lucide-react";
import { NAVY, BLUE } from "../theme";
import LockedContentModal from "../components/LockedContentModal.jsx";
import { CURRICULUM_BY_COURSE } from "../data/mockData";
import { fetchCourseCurriculum } from "../services/courses.js";

function MetaBox({ icon: Icon, label, value }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      <p className="text-[11px] font-bold tracking-wide text-slate-400 flex items-center gap-1.5 mb-1.5">
        <Icon size={13} /> {label.toUpperCase()}
      </p>
      <p className="font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function FaqItem({ faq, open, onToggle }) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-5 py-4 text-left font-bold text-slate-900 ${
          open ? "bg-slate-50" : "bg-white"
        }`}
      >
        {faq.q}
        {open ? <ChevronUp size={16} style={{ color: BLUE }} /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-4 text-sm text-slate-500">{faq.a}</div>}
    </div>
  );
}

export default function CourseDetailView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, enrolledIds, enrollCourse } = useOutletContext();
  const course = courses.find((c) => c.id === courseId);
  const enrolled = enrolledIds.includes(courseId);

  const [curriculum, setCurriculum] = useState(CURRICULUM_BY_COURSE[courseId] || []);
  const [openModule, setOpenModule] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [lockedModalOpen, setLockedModalOpen] = useState(false);

  useEffect(() => {
    fetchCourseCurriculum(courseId).then((data) => {
      setCurriculum(data);
      setOpenModule(data?.[0]?.id);
    });
  }, [courseId]);

  if (!course) return null;
  const Icon = course.icon;

  const handleLessonClick = (lesson) => {
    if (enrolled || lesson.freePreview) {
      navigate(`/my-courses/${course.id}?lesson=${lesson.id}`);
    } else {
      setLockedModalOpen(true);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/courses")}
          className="flex items-center gap-1.5 text-sm font-bold mb-6 hover:underline"
          style={{ color: BLUE }}
        >
          <ArrowLeft size={15} /> All Courses
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Left: hero + meta */}
          <div className="lg:col-span-2">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: BLUE }}>
              <Icon size={30} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 uppercase mb-4">{course.title}</h1>
            <p className="text-slate-500 mb-6 max-w-xl">{course.desc}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetaBox icon={Clock} label="Duration" value={course.duration} />
              <MetaBox icon={BarChart2} label="Level" value={course.level} />
              <MetaBox icon={Monitor} label="Mode" value={course.mode} />
              <MetaBox icon={FolderKanban} label="Projects" value={course.projects} />
            </div>
          </div>

          {/* Right: sticky fee card */}
          <div>
            <div className="border-2 border-slate-900 rounded-xl bg-white p-6 lg:sticky lg:top-24">
              <p className="text-[11px] font-bold tracking-wide text-slate-400 mb-2">COURSE FEE</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-extrabold" style={{ color: BLUE }}>
                  {course.price === 0 ? "Free" : `₹${course.price.toLocaleString("en-IN")}`}
                </span>
                {course.originalPrice > course.price && (
                  <span className="text-slate-400 line-through text-lg">
                    ₹{course.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {course.discount && (
                <span className="inline-block text-[11px] font-bold text-white px-2 py-1 rounded mb-2" style={{ backgroundColor: BLUE }}>
                  {course.discount}
                </span>
              )}
              <p className="text-[12px] text-slate-400 mb-5">Demo pricing — confirm with our team</p>

              <div className="space-y-2 mb-6">
                {course.certificate && (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Award size={15} style={{ color: BLUE }} /> Certificate on completion
                  </div>
                )}
                {course.mentorship && (
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Users2 size={15} style={{ color: BLUE }} /> Mentorship included
                  </div>
                )}
              </div>

              <button
                onClick={() => enrollCourse(course)}
                className="w-full font-bold text-white rounded-md py-3 flex items-center justify-center gap-2 hover:opacity-90"
                style={{ backgroundColor: BLUE }}
              >
                {enrolled ? "Go to Course" : "Enroll Now"} <ArrowLeft size={15} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* Demo video + certificate sample */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
          <div>
            <h2 className="font-extrabold text-slate-900 uppercase flex items-center gap-2 mb-4">
              <PlayCircle size={18} style={{ color: BLUE }} /> Course Demo Video
            </h2>
            <div className="aspect-video rounded-lg flex flex-col items-center justify-center gap-3" style={{ backgroundColor: NAVY }}>
              <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center">
                <PlayCircle size={22} className="text-white/70" />
              </div>
              <p className="text-white/70 text-sm font-semibold">Demo video coming soon</p>
            </div>
          </div>

          <div>
            <h2 className="font-extrabold text-slate-900 uppercase flex items-center gap-2 mb-4">
              <Award size={18} style={{ color: BLUE }} /> Certificate Sample
            </h2>
            <div className="border-2 border-slate-900 rounded-lg bg-white p-6">
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <Award size={18} style={{ color: BLUE }} />
                </div>
                <p className="text-[11px] font-bold tracking-wide text-slate-400 mb-1">CERTIFICATE OF COMPLETION</p>
                <p className="text-lg font-extrabold text-slate-900 uppercase mb-3">Nexrnn Technologies</p>
                <p className="text-xs text-slate-400 mb-1">This certifies that</p>
                <p className="font-extrabold text-slate-800 uppercase mb-3">[ Student Name ]</p>
                <p className="text-xs text-slate-400 mb-1">has successfully completed the</p>
                <p className="font-bold text-sm mb-3" style={{ color: BLUE }}>{course.title} Course</p>
                <p className="text-[11px] text-slate-400">Sample preview — not an issued certificate</p>
              </div>
            </div>
          </div>
        </div>

        {/* What you'll learn + who should take */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
          <div className="lg:col-span-2">
            <h2 className="font-extrabold text-slate-900 uppercase mb-4">What You'll Learn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {(course.whatYoullLearn || []).map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle size={15} style={{ color: BLUE }} className="mt-0.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <h2 className="font-extrabold text-slate-900 uppercase mt-10 mb-4">Curriculum</h2>
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
              {(curriculum || []).map((m) => (
                <div key={m.id}>
                  <button
                    onClick={() => setOpenModule(openModule === m.id ? null : m.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-slate-50"
                  >
                    <span className="font-bold text-slate-900">{m.title}</span>
                    {openModule === m.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {openModule === m.id && (
                    <div className="bg-slate-50">
                      {m.lessons.map((l) => {
                        const LType = l.type === "video" ? Video : FileText;
                        const locked = !enrolled && !l.freePreview;
                        return (
                          <button
                            key={l.id}
                            onClick={() => handleLessonClick(l)}
                            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-slate-100 border-t border-slate-100"
                          >
                            {enrolled ? (
                              l.done ? (
                                <CheckCircle2 size={15} style={{ color: BLUE }} className="shrink-0" />
                              ) : (
                                <Circle size={15} className="text-slate-300 shrink-0" />
                              )
                            ) : locked ? (
                              <Lock size={14} className="text-slate-400 shrink-0" />
                            ) : (
                              <LType size={15} className="text-slate-400 shrink-0" />
                            )}
                            <span className="text-sm text-slate-700 flex-1">{l.title}</span>
                            {l.freePreview && !enrolled && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                                FREE PREVIEW
                              </span>
                            )}
                            {l.duration && <span className="text-[11px] text-slate-400 shrink-0">{l.duration}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-lg p-6 bg-white border border-slate-200">
              <h3 className="font-extrabold text-slate-900 uppercase mb-4 text-sm">Who Should Take This Course</h3>
              <div className="space-y-3">
                {(course.whoShouldTake || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle size={15} style={{ color: BLUE }} className="mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        {course.faqs?.length > 0 && (
          <div className="max-w-3xl">
            <h2 className="font-extrabold text-slate-900 uppercase mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {course.faqs.map((faq, i) => (
                <FaqItem key={i} faq={faq} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {lockedModalOpen && (
        <LockedContentModal
          onClose={() => setLockedModalOpen(false)}
          onBuyNow={() => {
            setLockedModalOpen(false);
            enrollCourse(course);
          }}
        />
      )}
    </div>
  );
}

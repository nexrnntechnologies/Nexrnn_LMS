import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Star } from "lucide-react";
import { BLUE } from "../theme";

export default function LearnerFeedbackSlider({ ratings = [], courseId = null }) {
  const sliderRef = useRef(null);
  const courseRatings = courseId ? ratings.filter((rating) => rating.course_id === courseId) : [];
  // If a course has no individual review yet, keep the section useful by
  // showing feedback from other completed courses and identifying its course.
  const visibleRatings = courseRatings.length ? courseRatings : ratings;
  if (!visibleRatings.length) return null;

  const move = (direction) => {
    sliderRef.current?.scrollBy({ left: direction * 360, behavior: "smooth" });
  };

  return (
    <section className="mt-14" aria-label="Learner feedback">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div className="flex items-start gap-2">
          <MessageSquare size={19} style={{ color: BLUE }} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-1">Learner feedback</p>
            <h2 className="text-xl font-extrabold text-slate-900">What students say after completing their courses.</h2>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => move(-1)} aria-label="Previous feedback" className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50"><ChevronLeft size={17} /></button>
          <button type="button" onClick={() => move(1)} aria-label="Next feedback" className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50"><ChevronRight size={17} /></button>
        </div>
      </div>

      <div ref={sliderRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 scroll-smooth [scrollbar-width:thin]">
        {visibleRatings.map((rating) => (
          <article key={rating.id} className="min-w-[min(86vw,350px)] max-w-[350px] snap-start shrink-0 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-xs font-bold tracking-wide uppercase truncate" style={{ color: BLUE }}>{rating.courseTitle || rating.course_id}</p>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 shrink-0">{rating.stars}<Star size={14} className="fill-amber-400 text-amber-400" /></span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed min-h-[66px]">“{rating.comment || "This learner left a star rating without a written comment."}”</p>
            <p className="text-sm font-bold text-slate-800 mt-5">{rating.learner_name || rating.learnerName || "Nexrnn Learner"}</p>
            <p className="text-[11px] text-slate-400 mt-1">Verified learner feedback{rating.created_at ? ` • ${new Date(rating.created_at).toLocaleDateString()}` : ""}</p>
          </article>
        ))}
      </div>
      <div className="flex sm:hidden justify-end gap-2 mt-1">
        <button type="button" onClick={() => move(-1)} aria-label="Previous feedback" className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500"><ChevronLeft size={17} /></button>
        <button type="button" onClick={() => move(1)} aria-label="Next feedback" className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500"><ChevronRight size={17} /></button>
      </div>
    </section>
  );
}

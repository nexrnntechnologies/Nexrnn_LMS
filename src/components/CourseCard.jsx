import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, FolderKanban, Award, Star, ArrowRight } from "lucide-react";
import { NAVY, BLUE } from "../theme";

export default function CourseCard({ course, onEnroll, enrolled }) {
  const navigate = useNavigate();
  const Icon = course.icon;
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col h-full">
      <div className="p-5" style={{ backgroundColor: NAVY }}>
        <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ backgroundColor: BLUE }}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-[11px] font-bold tracking-wide" style={{ color: BLUE }}>{course.tag}</p>
          <h3 className="text-[17px] font-extrabold text-slate-900 leading-snug mt-1">{course.title}</h3>
        </div>
        <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">{course.desc}</p>

        <div className="flex items-center gap-4 text-[12px] text-slate-500">
          <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
          <span className="flex items-center gap-1"><FolderKanban size={12} /> {course.projects} Projects</span>
        </div>
        <div className="flex items-center gap-1 text-[12px] text-slate-500">
          <Award size={12} /> Certificate
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-lg font-extrabold text-slate-900">
            {course.price === 0 ? "Free" : `₹${course.price.toLocaleString("en-IN")}`}
          </span>
          {course.originalPrice > course.price && (
            <>
              <span className="text-sm text-slate-400 line-through">₹{course.originalPrice.toLocaleString("en-IN")}</span>
              <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: BLUE }}>
                {course.discount}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 text-[12px] text-amber-500 font-semibold">
          <Star size={12} className="fill-amber-400 text-amber-400" /> {course.rating}{" "}
          <span className="text-slate-400 font-normal">({course.reviews})</span>
        </div>

        <div className="flex gap-2 pt-2 mt-auto">
          <button
            onClick={() => navigate(`/courses/${course.id}`)}
            className="flex-1 text-sm font-semibold border border-slate-300 rounded-md py-2 hover:bg-slate-50"
          >
            View Course
          </button>
          <button
            onClick={() => (enrolled ? navigate(`/my-courses/${course.id}`) : onEnroll(course))}
            className="flex-1 text-sm font-semibold text-white rounded-md py-2 flex items-center justify-center gap-1 hover:opacity-90"
            style={{ backgroundColor: enrolled ? "#16A34A" : BLUE }}
          >
            {enrolled ? "Go to Course" : "Enroll Now"} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

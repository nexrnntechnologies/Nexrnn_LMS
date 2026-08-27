import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search } from "lucide-react";
import CourseCard from "../components/CourseCard.jsx";
import LearnerFeedbackSlider from "../components/LearnerFeedbackSlider.jsx";

export default function CoursesView({ catalogType = "course" }) {
  const { courses, workshops, enrollCourse, enrolledIds, courseRatings = [] } = useOutletContext();
  const [query, setQuery] = useState("");
  const isWorkshop = catalogType === "workshop";
  const catalog = isWorkshop ? workshops : courses;
  const filtered = catalog.filter((item) => (item.title || "").toLowerCase().includes(query.toLowerCase()) || (item.tag || "").toLowerCase().includes(query.toLowerCase()));

  return <div className="max-w-7xl mx-auto px-6 py-10">
    <div className="flex items-center justify-between mb-1 gap-4"><div><h1 className="text-2xl font-extrabold text-slate-900 shrink-0">{isWorkshop ? "Workshops" : "Courses"}</h1><p className="text-sm text-slate-500 mt-1">{isWorkshop ? "Focused, practical learning workshops." : "All Courses"}</p></div><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="pl-8 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400" /></div></div>
    {filtered.length === 0 ? <p className="text-sm text-slate-400 mt-8">{catalog.length ? `No ${isWorkshop ? "workshops" : "courses"} match "${query}".` : `${isWorkshop ? "No workshops" : "No courses"} are available yet.`}</p> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">{filtered.map((item) => <CourseCard key={item.id} course={item} onEnroll={enrollCourse} enrolled={enrolledIds.includes(item.id)} />)}</div>}
    <LearnerFeedbackSlider ratings={courseRatings} />
  </div>;
}

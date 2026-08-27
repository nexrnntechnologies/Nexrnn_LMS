import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search } from "lucide-react";
import CourseCard from "../components/CourseCard.jsx";
import LearnerFeedbackSlider from "../components/LearnerFeedbackSlider.jsx";

export default function CoursesView() {
  const { courses, enrollCourse, enrolledIds, courseRatings = [] } = useOutletContext();
  const [query, setQuery] = useState("");
  const filtered = courses.filter((course) => course.title.toLowerCase().includes(query.toLowerCase()) || course.tag.toLowerCase().includes(query.toLowerCase()));

  return <div className="max-w-7xl mx-auto px-6 py-10">
    <div className="flex items-center justify-between mb-1 gap-4"><h1 className="text-2xl font-extrabold text-slate-900 shrink-0">Courses</h1><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="pl-8 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400" /></div></div>
    <p className="text-sm text-slate-500 mb-8">All Courses</p>
    {filtered.length === 0 ? <p className="text-sm text-slate-400">No courses match "{query}".</p> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">{filtered.map((course) => <CourseCard key={course.id} course={course} onEnroll={enrollCourse} enrolled={enrolledIds.includes(course.id)} />)}</div>}
    <LearnerFeedbackSlider ratings={courseRatings} />
  </div>;
}

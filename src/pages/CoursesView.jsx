import React, { useState } from "react";
import { Search } from "lucide-react";
import CourseCard from "../components/CourseCard.jsx";

export default function CoursesView({ courses, onView, onViewDetail, onEnroll, enrolledIds }) {
  const [query, setQuery] = useState("");
  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.tag.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-1 gap-4">
        <h1 className="text-2xl font-extrabold text-slate-900 shrink-0">Courses</h1>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="pl-8 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      <p className="text-sm text-slate-500 mb-8">All Courses</p>
      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400">No courses match "{query}".</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onView={onView}
              onViewDetail={onViewDetail}
              onEnroll={onEnroll}
              enrolled={enrolledIds.includes(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

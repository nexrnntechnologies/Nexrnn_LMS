import React from "react";
import { Search, Users } from "lucide-react";
import { NAVY, NAVY_SOFT, BLUE } from "../theme";
import { COMMUNITIES } from "../data/mockData";

export default function DashboardView({ openCourse, myCourses, onRate }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-sm text-slate-500 font-medium">Welcome back,</p>
        <h1 className="text-2xl font-extrabold text-slate-900">Abhiraj S 👋</h1>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-slate-900">My Courses</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search"
            className="pl-8 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-12">
        {myCourses.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5" style={{ backgroundColor: NAVY }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: BLUE }}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 mb-3">{c.title}</h3>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full rounded-full" style={{ width: `${c.progress}%`, backgroundColor: BLUE }} />
                </div>
                <p className="text-[12px] text-slate-500 mb-4">{c.progress}% complete</p>
                <div className="flex justify-between text-sm font-semibold">
                  <button onClick={() => openCourse(c)} className="text-slate-500 hover:text-slate-800">See Overview</button>
                  <button
                    onClick={() => (c.progress === 100 ? onRate(c) : openCourse(c))}
                    style={{ color: BLUE }}
                    className="hover:underline"
                  >
                    {c.progress === 100 ? "Rate This Course" : "Continue Course"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-extrabold text-slate-900 mb-4">My Communities</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {COMMUNITIES.map((c) => (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="h-24 flex items-center justify-center" style={{ backgroundColor: NAVY_SOFT }}>
              <Users size={28} style={{ color: BLUE }} />
            </div>
            <div className="p-5">
              <h3 className="font-bold text-slate-900">{c.name}</h3>
              <p className="text-[12px] text-slate-500 mt-1">{c.posts} posts</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

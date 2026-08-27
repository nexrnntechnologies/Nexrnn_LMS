import React from "react";
import { CheckCircle2, X } from "lucide-react";
import { BLUE, NAVY } from "../theme";

export default function EnrollmentSuccessModal({ course, onContinue, onDashboard, onClose }) {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="enrollment-success-title"
        onClick={(event) => event.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative text-center"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <X size={18} />
        </button>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#DCFCE7" }}>
          <CheckCircle2 size={36} className="text-green-600" />
        </div>
        <p className="text-xs font-bold tracking-[0.2em] text-green-600 uppercase mb-2">Enrollment successful</p>
        <h2 id="enrollment-success-title" className="text-2xl font-extrabold text-slate-900 mb-2">
          Welcome to {course.title}
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-7">
          Your course has been added to My Courses. Start learning whenever you are ready.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onContinue}
            className="text-white font-bold py-3 rounded-md hover:opacity-90"
            style={{ backgroundColor: BLUE }}
          >
            Continue Learning
          </button>
          <button
            type="button"
            onClick={onDashboard}
            className="font-bold py-3 rounded-md border border-slate-200 hover:bg-slate-50"
            style={{ color: NAVY }}
          >
            Go to My Courses
          </button>
        </div>
      </div>
    </div>
  );
}

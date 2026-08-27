import React from "react";
import { X } from "lucide-react";
import { BLUE } from "../theme";

export default function LockedContentModal({ onBuyNow, onClose, lesson }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={18} />
        </button>
        <p className="text-[11px] font-bold tracking-[0.16em] text-amber-600 uppercase mb-2">Paid content</p>
        <h2 className="text-lg font-extrabold text-slate-900 mb-2 leading-snug">
          {lesson?.title || "This lesson"} is locked.
        </h2>
        <p className="text-sm text-slate-500 mb-6">Enroll in the course to access this paid lesson and all remaining content.</p>
        <button
          onClick={onBuyNow}
          className="font-bold text-sm px-6 py-2.5 rounded-md text-white hover:opacity-90"
          style={{ backgroundColor: BLUE }}
        >
          BUY NOW
        </button>
        <button
          onClick={onClose}
          className="block mx-auto mt-3 text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          NO THANKS
        </button>
      </div>
    </div>
  );
}

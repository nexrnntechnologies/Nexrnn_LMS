import React, { useState } from "react";
import { X, Star } from "lucide-react";
import { BLUE } from "../theme";

export default function RateCourseModal({ course, onSubmit, onClose }) {
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (stars === 0) return;
    onSubmit({ stars, comment });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <h2 className="text-lg font-extrabold text-slate-900 mb-2">Thanks for your feedback!</h2>
            <p className="text-sm text-slate-500">Your rating for {course?.title} has been saved.</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">Rate this course</h2>
            <p className="text-sm text-slate-500 mb-5">{course?.title}</p>

            <div className="flex items-center gap-1 mb-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHoverStars(n)}
                  onMouseLeave={() => setHoverStars(0)}
                  onClick={() => setStars(n)}
                >
                  <Star
                    size={28}
                    className={(hoverStars || stars) >= n ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience with this course..."
              className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-5"
            />

            <button
              onClick={handleSubmit}
              disabled={stars === 0}
              className="w-full font-semibold text-sm px-5 py-2.5 rounded-md text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: BLUE }}
            >
              Submit Rating
            </button>
          </>
        )}
      </div>
    </div>
  );
}

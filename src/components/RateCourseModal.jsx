import React, { useState } from "react";
import { CheckCircle2, X, Star } from "lucide-react";
import { BLUE } from "../theme";

export default function RateCourseModal({ course, onSubmit, onClose }) {
  const itemLabel = course?.courseType === "workshop" ? "workshop" : "course";
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (stars === 0 || submitting) return;
    setError("");
    setSubmitting(true);
    const result = await onSubmit({ stars, comment });
    setSubmitting(false);
    if (result?.error) { setError(result.error.message); return; }
    setSubmitted(true);
  };

  return <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={onClose}><div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative" onClick={(event) => event.stopPropagation()}><button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>{submitted ? <div className="text-center py-6"><CheckCircle2 size={42} className="mx-auto mb-4 text-green-500" /><h2 className="text-lg font-extrabold text-slate-900 mb-2">Thanks for your feedback!</h2><p className="text-sm text-slate-500">Your rating for {course?.title} has been saved and is now visible in Feedback.</p></div> : <><h2 className="text-lg font-extrabold text-slate-900 mb-1">Rate this {itemLabel}</h2><p className="text-sm text-slate-500 mb-1">{course?.title}</p><p className="text-xs text-slate-400 mb-5">You can rate this {itemLabel} only once.</p><div className="flex items-center gap-1 mb-5">{[1, 2, 3, 4, 5].map((number) => <button key={number} type="button" aria-label={`${number} stars`} onMouseEnter={() => setHoverStars(number)} onMouseLeave={() => setHoverStars(0)} onClick={() => setStars(number)}><Star size={30} className={(hoverStars || stars) >= number ? "fill-amber-400 text-amber-400" : "text-slate-300"} /></button>)}</div><textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} placeholder="Share your experience with this course..." className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4" />{error && <p className="text-sm text-red-600 mb-3">{error}</p>}<button onClick={handleSubmit} disabled={stars === 0 || submitting} className="w-full font-semibold text-sm px-5 py-2.5 rounded-md text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: BLUE }}>{submitting ? "Saving…" : "Submit Rating"}</button></>}</div></div>;
}

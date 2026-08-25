import React, { useState } from "react";
import { X } from "lucide-react";
import { BLUE } from "../theme";

export default function EnrollModal({ course, defaultValues = {}, onConfirm, onClose, submitting, error }) {
  const [fullName, setFullName] = useState(defaultValues.fullName || "");
  const [mobile, setMobile] = useState(defaultValues.mobile || "");
  const [email, setEmail] = useState(defaultValues.email || "");
  const [paymentRef, setPaymentRef] = useState("");

  const isPaid = course.price > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      fullName,
      mobile,
      email,
      paymentRef: isPaid ? paymentRef : null,
      status: isPaid ? "paid" : "free",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 relative"
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
        <h2 className="text-lg font-extrabold text-slate-900 mb-1">Enroll in {course.title}</h2>
        <p className="text-sm text-slate-500 mb-5">
          {isPaid ? `Course fee: ₹${course.price.toLocaleString("en-IN")}` : "This course is free."}
        </p>

        <div className="space-y-4">
          <label className="block">
            <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Full Name</span>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Mobile Number</span>
            <input
              required
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
          <label className="block">
            <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>

          {isPaid && (
            <label className="block">
              <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Payment ID / Transaction Reference</span>
              <input
                required
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. UPI transaction ID"
                className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Complete payment separately, then paste the reference ID here to unlock access.
              </span>
            </label>
          )}
        </div>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-6 text-white font-semibold py-2.5 rounded-md hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: BLUE }}
        >
          {submitting ? "Please wait…" : isPaid ? "Confirm & Get Access" : "Enroll Free"}
        </button>
      </form>
    </div>
  );
}

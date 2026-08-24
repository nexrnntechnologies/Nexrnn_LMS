import React from "react";

export default function Field({ label, defaultValue = "", placeholder = "", type = "text", full = false }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[13px] font-semibold text-slate-600 mb-1 block">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </label>
  );
}

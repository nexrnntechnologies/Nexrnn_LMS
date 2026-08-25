import React from "react";

export default function Field({ label, value, defaultValue = "", onChange, placeholder = "", type = "text", full = false, required = false }) {
  const isControlled = value !== undefined && onChange !== undefined;
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[13px] font-semibold text-slate-600 mb-1 block">{label}</span>
      {isControlled ? (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ) : (
        <input
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      )}
    </label>
  );
}

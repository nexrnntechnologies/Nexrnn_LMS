import React, { useState } from "react";
import { User, Lock, Award, Bell, CreditCard, Receipt, Upload, MessageSquare } from "lucide-react";
import { NAVY, BLUE } from "../theme";
import Field from "../components/Field.jsx";

const TIMEZONES = [
  "(GMT+5:30) Chennai, Kolkata, Mumbai, New Delhi",
  "(GMT+0:00) London",
  "(GMT-5:00) Eastern Time (US & Canada)",
  "(GMT-8:00) Pacific Time (US & Canada)",
];

export default function ProfileView({ notifications, enrolledCourses, initialTab = "profile" }) {
  const [tab, setTab] = useState(initialTab);
  const [timezone, setTimezone] = useState("");

  const tabs = [
    { key: "profile", label: "Profile", icon: User },
    { key: "password", label: "Password", icon: Lock },
    { key: "certificates", label: "Certificates", icon: Award },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "billing", label: "Billing", icon: CreditCard },
    { key: "orders", label: "Order History", icon: Receipt },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-56 shrink-0">
        <nav className="flex md:flex-col gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-semibold text-left whitespace-nowrap ${
                  active ? "text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
                style={active ? { backgroundColor: NAVY } : {}}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1">
        {tab === "profile" && (
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-6">Edit Profile</h1>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <User size={28} />
              </div>
              <button className="flex items-center gap-1.5 text-sm font-semibold border border-slate-300 rounded-md px-3 py-2 hover:bg-slate-50">
                <Upload size={14} /> Upload new image
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
              <Field label="Email" defaultValue="abhiraj@example.com" full />
              <Field label="First name" defaultValue="Abhiraj" />
              <Field label="Last name" defaultValue="Singh" />
              <Field label="Company" placeholder="Optional" />
              <Field label="Professional Title" placeholder="Optional" />

              <label className="block">
                <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Timezone</span>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select your timezone</option>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </label>

              <Field label="Your City (required)" defaultValue="Lucknow" />
              <Field label="Phone Number (required)" defaultValue="7520424645" />
            </div>
            <button className="mt-6 text-white font-semibold px-5 py-2.5 rounded-md hover:opacity-90" style={{ backgroundColor: BLUE }}>
              Save Changes
            </button>
          </div>
        )}

        {tab === "password" && (
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-6">Change Password</h1>
            <div className="grid grid-cols-1 gap-5 max-w-sm">
              <Field label="New Password" type="password" />
              <Field label="Retype Password" type="password" />
              <Field label="Current Password" type="password" />
            </div>
            <p className="text-[12px] text-slate-500 mt-2">We need your current password to confirm changes.</p>
            <button className="mt-6 text-white font-semibold px-5 py-2.5 rounded-md hover:opacity-90" style={{ backgroundColor: BLUE }}>
              Update
            </button>
          </div>
        )}

        {tab === "certificates" && (
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-6">Certificates</h1>
            {enrolledCourses?.filter((c) => c.progress === 100).length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrolledCourses.filter((c) => c.progress === 100).map((c) => (
                  <div key={c.id} className="border border-slate-200 rounded-lg p-5 flex items-center gap-3">
                    <Award size={22} style={{ color: BLUE }} />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{c.title}</p>
                      <p className="text-[12px] text-slate-500">Certificate earned</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Complete a course to earn your first certificate.</p>
            )}
          </div>
        )}

        {tab === "notifications" && (
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-6">Notifications</h1>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
              {notifications.map((n) => (
                <div key={n.id} className={`p-4 flex gap-3 ${n.read ? "" : "bg-blue-50/40"}`}>
                  <MessageSquare size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Nexrnn Team</span> {n.text}
                    </p>
                    <p className="text-[13px] text-slate-500 mt-0.5">{n.detail}</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "billing" && (
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-6">Billing</h1>
            <p className="text-sm text-slate-500">No saved payment methods yet.</p>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-6">Order History</h1>
            {enrolledCourses?.length ? (
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                {enrolledCourses.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{c.title}</p>
                      <p className="text-[12px] text-slate-500">Enrolled</p>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">
                      {c.price === 0 ? "Free" : `₹${c.price.toLocaleString("en-IN")}`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No orders yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

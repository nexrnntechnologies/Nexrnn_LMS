import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { User, Lock, Award, Bell, Receipt, MessageSquare, BadgeCheck } from "lucide-react";
import { NAVY, BLUE } from "../theme";
import Field from "../components/Field.jsx";
import CertificatePanel from "../components/CertificatePanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { demoCertificateFor, fetchMyCertificates, issueCertificate } from "../services/certificates.js";
import { getCertificateRegistrationId, getUserRegistrationId } from "../lib/certificates.js";

const TABS = [
  { key: "profile", label: "Profile", icon: User, path: "/my-account" },
  { key: "password", label: "Password", icon: Lock, path: "/my-account/password" },
  { key: "certificates", label: "Certificates", icon: Award, path: "/dashboard/certificates" },
  { key: "notifications", label: "Notifications", icon: Bell, path: "/my-account/notifications" },
  { key: "orders", label: "Order History", icon: Receipt, path: "/my-account/orders" },
];

export default function ProfileView({ certificateType = null }) {
  const { notifications, myCourses } = useOutletContext();
  const { user, profile: authProfile, isSupabaseConfigured } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [certificateError, setCertificateError] = useState("");

  const certificatePath = "/dashboard/certificates";
  const certificateParam = "course";
  const tabs = TABS.map((tab) => tab.key === "certificates" ? { ...tab, label: "Certificates", path: certificatePath } : tab);
  const activeTab = tabs.find((tab) => tab.path === location.pathname)?.key || "profile";
  const profileData = authProfile || {};
  const studentName = [profileData.first_name, profileData.last_name].filter(Boolean).join(" ") || profileData.email || user?.email || "Student Name";
  const catalogCourses = certificateType ? (myCourses || []).filter((course) => course.courseType === certificateType) : (myCourses || []);
  const completedCourses = catalogCourses.filter((course) => course.progress === 100);
  const certificateEligibleCourses = completedCourses.filter((course) => course.courseComplete === true && course.certificate !== false);
  const certificateSearchParams = new URLSearchParams(location.search);
  const selectedCourseId = certificateSearchParams.get("course") || certificateSearchParams.get("workshop");
  const certificateFor = (course) => certificates.find((certificate) => certificate.course_id === course.id) || (!isSupabaseConfigured && course.courseComplete === true && course.progress === 100 ? demoCertificateFor(course, studentName, user?.id || "demo-user") : null);
  const certificateCourses = catalogCourses.filter((course) => certificateFor(course));
  const selectedCourse = certificateCourses.find((course) => course.id === selectedCourseId);

  useEffect(() => {
    let active = true;
    if (!isSupabaseConfigured || !user) {
      setCertificateError("");
      setCertificates(certificateEligibleCourses.map((course) => demoCertificateFor(course, studentName, user?.id || "demo-user")));
      return () => { active = false; };
    }
    (async () => {
      // Always load existing records, even if new lessons have reduced the
      // current progress percentage. Previously issued certificates remain
      // visible and are never regenerated or replaced.
      const existing = await fetchMyCertificates(user.id);
      const issuedResults = await Promise.all(certificateEligibleCourses.map((course) => issueCertificate(user.id, course.id, {
        studentName,
        courseTitle: course.title,
        courseType: course.courseType,
        courseComplete: course.courseComplete,
      })));
      const issued = issuedResults.map((result) => result.data).filter(Boolean);
      const syncError = issuedResults.find((result) => result.error)?.error;
      if (syncError) setCertificateError(syncError.message || "Certificate could not be saved to Supabase."); else setCertificateError("");
      const records = [...existing, ...issued].filter((certificate, index, all) => all.findIndex((item) => item.id === certificate.id || (item.user_id === certificate.user_id && item.course_id === certificate.course_id)) === index);
      if (active) setCertificates(records);
    })();
    return () => { active = false; };
  }, [isSupabaseConfigured, user?.id, myCourses, studentName]);

  return <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
    <aside className="w-full md:w-56 shrink-0"><nav className="flex md:flex-col gap-1 overflow-x-auto">{tabs.map((tab) => { const Icon = tab.icon; const active = activeTab === tab.key; return <button key={tab.key} onClick={() => navigate(tab.path)} className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-semibold text-left whitespace-nowrap ${active ? "text-white" : "text-slate-600 hover:bg-slate-50"}`} style={active ? { backgroundColor: NAVY } : {}}><Icon size={15} /> {tab.label}</button>; })}</nav></aside>

    <div className="flex-1 min-w-0">
      {activeTab === "profile" && <div><h1 className="text-xl font-extrabold text-slate-900 mb-2">Profile</h1><p className="text-sm text-slate-500 mb-6">Your account information is shown below. These details are read-only.</p><div className="max-w-xl border border-slate-200 rounded-xl bg-white p-6 shadow-sm"><div className="flex items-center gap-4 pb-5 border-b border-slate-100"><div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><User size={30} /></div><div><p className="text-xs font-bold tracking-[0.16em] text-slate-400 uppercase">Registered learner</p><p className="text-lg font-extrabold text-slate-900 mt-1">{studentName}</p></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5"><ReadOnlyInfo label="Name" value={studentName} /><ReadOnlyInfo label="Mobile number" value={profileData.phone} /><ReadOnlyInfo label="Email address" value={profileData.email || user?.email} /><ReadOnlyInfo label="Gender" value={profileData.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1) : "Not selected"} /><ReadOnlyInfo label="User ID" value={profileData.user_registration_id || getUserRegistrationId(user?.id)} wide /></div></div><div className="max-w-xl mt-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-4"><p className="text-sm font-semibold text-slate-800">Need to correct your details?</p><p className="text-sm text-slate-600 mt-1">If your name has a spelling mistake or you need to change your name or mobile number, please contact Nexrnn Support.</p><Link to="/support" className="inline-block mt-3 text-sm font-bold hover:underline" style={{ color: BLUE }}>Contact Support →</Link></div></div>}

      {activeTab === "password" && <div><h1 className="text-xl font-extrabold text-slate-900 mb-6">Change Password</h1><div className="grid grid-cols-1 gap-5 max-w-sm"><Field label="New Password" type="password" /><Field label="Retype Password" type="password" /><Field label="Current Password" type="password" /></div><p className="text-[12px] text-slate-500 mt-2">We need your current password to confirm changes.</p><button className="mt-6 text-white font-semibold px-5 py-2.5 rounded-md hover:opacity-90" style={{ backgroundColor: BLUE }}>Update</button></div>}

      {activeTab === "certificates" && (selectedCourse ? <CertificatePanel course={selectedCourse} certificate={certificateFor(selectedCourse)} studentName={studentName} registrationId={certificateFor(selectedCourse).certificate_id || certificateFor(selectedCourse).registration_id || getCertificateRegistrationId(user?.id, selectedCourse.id)} onBack={() => navigate(certificatePath)} /> : <div><div className="flex items-start justify-between gap-4 mb-6"><div><h1 className="text-xl font-extrabold text-slate-900">Certificates</h1><p className="text-sm text-slate-500 mt-1">Certificates are available after completing a course or workshop.</p></div><Award size={24} style={{ color: BLUE }} /></div>{certificateError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">{certificateError}</p>}{certificateCourses.length ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{certificateCourses.map((course) => { const certificate = certificateFor(course); return <button key={course.id} onClick={() => navigate(`${certificatePath}?${course.courseType === "workshop" ? "workshop" : "course"}=${encodeURIComponent(course.id)}`)} className="text-left border border-slate-200 rounded-xl p-5 flex items-center gap-4 bg-white hover:border-blue-300 hover:shadow-sm transition"><div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#eef5ff", color: BLUE }}><Award size={23} /></div><div className="min-w-0"><p className="font-bold text-slate-900 text-sm truncate">{course.title}</p><p className="text-[12px] text-slate-500 mt-1">Certificate earned • Click to view</p><p className="text-[11px] text-slate-400 mt-1">ID: {certificate.certificate_id || certificate.registration_id}</p></div></button>; })}</div> : <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center"><Award size={28} className="mx-auto mb-3 text-slate-300" /><p className="text-sm text-slate-500">{completedCourses.some((course) => course.courseComplete !== true) ? "You have completed the lessons, but an item is still ongoing. Its certificate will be available after the admin marks it complete." : "Complete a course or workshop to earn your first certificate."}</p></div>}</div>)}

      {activeTab === "notifications" && <div><h1 className="text-xl font-extrabold text-slate-900 mb-6">Notifications</h1><div className="border border-slate-200 rounded-lg divide-y divide-slate-100">{notifications.map((notification) => <div key={notification.id} className={`p-4 flex gap-3 ${notification.read ? "" : "bg-blue-50/40"}`}><MessageSquare size={16} className="text-slate-400 mt-0.5 shrink-0" /><div><p className="text-sm text-slate-700"><span className="font-semibold">Nexrnn Team</span> {notification.text}</p><p className="text-[13px] text-slate-500 mt-0.5">{notification.detail}</p><p className="text-[12px] text-slate-400 mt-0.5">{notification.time}</p></div></div>)}{notifications.length === 0 && <p className="p-4 text-sm text-slate-400">No notifications yet.</p>}</div></div>}
      {activeTab === "orders" && <div><h1 className="text-xl font-extrabold text-slate-900 mb-6">Order History</h1>{myCourses?.length ? <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">{myCourses.map((course) => <div key={course.id} className="p-4 flex items-center justify-between"><div><p className="font-semibold text-slate-800 text-sm">{course.title}</p><p className="text-[12px] text-slate-500">Enrolled</p></div><p className="font-bold text-slate-900 text-sm">{course.price === 0 ? "Free" : `₹${course.price.toLocaleString("en-IN")}`}</p></div>)}</div> : <p className="text-sm text-slate-500">No orders yet.</p>}</div>}
    </div>
  </div>;
}

function ReadOnlyInfo({ label, value, wide }) { return <div className={`border border-slate-200 rounded-lg p-3 ${wide ? "sm:col-span-2" : ""}`}><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p><p className="text-sm font-semibold text-slate-800 break-words select-all">{value || "—"}</p></div>; }

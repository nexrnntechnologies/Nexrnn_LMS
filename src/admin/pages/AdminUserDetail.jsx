import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Save, Trash2 } from "lucide-react";
import { adminDeleteUser, adminFetchUserDetail, adminUpdateUserProfile } from "../../services/admin.js";
import { BLUE } from "../../theme";
import AdminExportButtons from "../../components/AdminExportButtons.jsx";

const EMPTY_FORM = { first_name: "", last_name: "", email: "", phone: "", city: "", gender: "", role: "student" };
const inputClass = "w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400";

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUser = async () => {
    setLoading(true);
    const result = await adminFetchUserDetail(userId);
    setProfile(result.profile);
    setForm({ ...EMPTY_FORM, ...(result.profile || {}) });
    setEnrollments(result.enrollments || []);
    setCertificates(result.certificates || []);
    setLoading(false);
  };

  useEffect(() => { loadUser(); }, [userId]);

  const enrollmentExportRows = useMemo(() => enrollments.map((enrollment) => ({
    item: enrollment.courseTitle,
    type: enrollment.courseType === "workshop" ? "Workshop" : "Course",
    status: enrollment.status || "free",
    progress: `${enrollment.pct}%`,
    lessons: `${enrollment.doneLessons}/${enrollment.totalLessons}`,
    payment: enrollment.payment_ref || "",
  })), [enrollments]);
  const certificateExportRows = useMemo(() => certificates.map((certificate) => ({
    item: certificate.course_title,
    certificateId: certificate.certificate_id || certificate.registration_id,
    issued: certificate.issued_at ? new Date(certificate.issued_at).toLocaleString("en-IN") : "",
  })), [certificates]);

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const { data, error: saveError } = await adminUpdateUserProfile(userId, form);
    setSaving(false);
    if (saveError) {
      setError(saveError.message || "User information could not be updated.");
      return;
    }
    setProfile((current) => ({ ...current, ...form, ...(data || {}) }));
    setMessage("User information updated successfully.");
  };

  const remove = async () => {
    if (!window.confirm("Delete this user account and its associated LMS records? This cannot be undone.")) return;
    setDeleting(true);
    setError("");
    const { error: deleteError } = await adminDeleteUser(userId);
    setDeleting(false);
    if (deleteError) {
      setError(deleteError.message || "User could not be deleted. Run the latest Supabase migration first.");
      return;
    }
    navigate("/nexrnn/master_nexrnn/admin/users", { replace: true });
  };

  if (loading) return <div className="max-w-4xl mx-auto px-8 py-10 text-sm text-slate-400">Loading…</div>;
  if (!profile) return <div className="max-w-4xl mx-auto px-8 py-10"><Link to="/nexrnn/master_nexrnn/admin/users" className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4"><ChevronLeft size={15} /> Back to Users</Link><p className="text-sm text-slate-500">User not found.</p></div>;

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <Link to="/nexrnn/master_nexrnn/admin/users" className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4"><ChevronLeft size={15} /> Back to Users</Link>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div><h1 className="text-2xl font-extrabold text-slate-900 mb-1">{[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Unnamed User"}</h1><p className="text-sm text-slate-500">Manage learner information and view account activity.</p></div>
        <button type="button" onClick={remove} disabled={deleting} className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 border border-red-200 px-3 py-2.5 rounded-md hover:bg-red-50 disabled:opacity-50"><Trash2 size={15} /> {deleting ? "Deleting…" : "Delete User"}</button>
      </div>

      <form onSubmit={save} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between gap-3 mb-5"><div><h2 className="font-extrabold text-slate-900">User information</h2><p className="text-xs text-slate-500 mt-1">Admins can update profile details. Identity IDs are permanently locked.</p></div><button type="submit" disabled={saving} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-md disabled:opacity-50" style={{ backgroundColor: BLUE }}><Save size={15} /> {saving ? "Saving…" : "Save Changes"}</button></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label><span className="text-[13px] font-semibold text-slate-600 mb-1 block">First name</span><input value={form.first_name || ""} onChange={setField("first_name")} className={inputClass} /></label>
          <label><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Last name</span><input value={form.last_name || ""} onChange={setField("last_name")} className={inputClass} /></label>
          <label><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Email address</span><input type="email" value={form.email || ""} onChange={setField("email")} className={inputClass} /></label>
          <label><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Mobile number</span><input value={form.phone || ""} onChange={setField("phone")} className={inputClass} /></label>
          <label><span className="text-[13px] font-semibold text-slate-600 mb-1 block">City</span><input value={form.city || ""} onChange={setField("city")} className={inputClass} /></label>
          <label><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Gender</span><select value={form.gender || ""} onChange={setField("gender")} className={inputClass}><option value="">Not selected</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option></select></label>
          <label><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Role</span><select value={form.role || "student"} onChange={setField("role")} className={inputClass}><option value="student">Student</option><option value="admin">Admin</option></select></label>
        </div>
        {message && <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-2 mt-4">{message}</p>}
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mt-4">{error}</p>}
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <InfoBox label="User ID — read only" value={profile.user_registration_id || "Pending migration"} />
        <InfoBox label="Account created" value={profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"} />
      </div>
      <p className="text-xs text-slate-400 -mt-5 mb-8">User ID cannot be edited by the admin panel or changed in the database after it is issued.</p>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><h2 className="font-extrabold text-slate-900">Enrollments &amp; Progress</h2><AdminExportButtons title={`${userId}-enrollments-progress`} rows={enrollmentExportRows} columns={[{ label: "Item", key: "item" }, { label: "Type", key: "type" }, { label: "Status", key: "status" }, { label: "Progress", key: "progress" }, { label: "Lessons", key: "lessons" }, { label: "Payment", key: "payment" }]} /></div>
      {enrollments.length === 0 ? <p className="text-sm text-slate-400">Not enrolled in any courses yet.</p> : <div className="border border-slate-200 rounded-lg overflow-hidden bg-white divide-y divide-slate-100">{enrollments.map((enrollment) => <div key={enrollment.id} className="p-4"><div className="flex items-center justify-between mb-2"><p className="font-semibold text-slate-800 text-sm">{enrollment.courseTitle}</p><span className={`text-[11px] font-bold px-2 py-0.5 rounded ${enrollment.status === "paid" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{enrollment.status || "free"}</span></div><div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1"><div className="h-full rounded-full" style={{ width: `${enrollment.pct}%`, backgroundColor: BLUE }} /></div><p className="text-[12px] text-slate-500">{enrollment.pct}% complete — {enrollment.doneLessons}/{enrollment.totalLessons} lessons{enrollment.payment_ref && <> · Payment ref: {enrollment.payment_ref}</>}</p></div>)}</div>}

      {certificates.length > 0 && <div className="mt-8"><div className="flex flex-wrap items-center justify-between gap-3 mb-4"><h2 className="font-extrabold text-slate-900">Issued certificates</h2><AdminExportButtons title={`${userId}-certificates`} rows={certificateExportRows} columns={[{ label: "Item", key: "item" }, { label: "Certificate ID", key: "certificateId" }, { label: "Issued", key: "issued" }]} /></div><div className="border border-slate-200 rounded-lg overflow-hidden bg-white divide-y divide-slate-100">{certificates.map((certificate) => <div key={certificate.id} className="p-4 flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-slate-800 text-sm">{certificate.course_title}</p><p className="text-[12px] text-slate-500">Issued {certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString() : "—"}</p></div><div className="text-right"><p className="text-xs font-bold text-green-700">{certificate.certificate_id || certificate.registration_id}</p><p className="text-[10px] text-slate-400 mt-1">Certificate ID — read only</p></div></div>)}</div></div>}
    </div>
  );
}

function InfoBox({ label, value }) { return <div className="border border-slate-200 rounded-lg p-3 bg-white"><p className="text-[11px] font-bold text-slate-400 mb-1">{label.toUpperCase()}</p><p className="text-sm font-semibold text-slate-800 break-words">{value}</p></div>; }

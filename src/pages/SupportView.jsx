import React, { useEffect, useState } from "react";
import { CheckCircle2, LifeBuoy, Mail, Phone, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchMySupportRequests, createSupportRequest } from "../services/support.js";
import { BLUE, NAVY } from "../theme";

const SUPPORT_EMAIL = "nexrnntechnologies@gmail.com";
const EMPTY_FORM = { name: "", mobile: "", email: "", reason: "", message: "" };

export default function SupportView() {
  const { user, profile, isSupabaseConfigured } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [requests, setRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: current.name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" "),
      mobile: current.mobile || profile?.phone || "",
      email: current.email || profile?.email || user?.email || "",
    }));
  }, [profile, user]);

  useEffect(() => {
    fetchMySupportRequests(user?.id).then(setRequests);
  }, [user]);

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!/^\d{10}$/.test(form.mobile.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setSubmitting(true);
    const { data, error: submitError } = await createSupportRequest(user?.id || null, form);
    setSubmitting(false);
    if (submitError) {
      setError(submitError.message);
      return;
    }
    setSuccess("Your request has been sent. Our team will get back to you soon.");
    if (data?.[0]) setRequests((current) => [data[0], ...current]);
    setForm((current) => ({ ...current, reason: "", message: "" }));
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 items-start">
          <div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: BLUE }}>
              <LifeBuoy size={28} className="text-white" />
            </div>
            <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">Nexrnn student care</p>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-4">How can we help?</h1>
            <p className="text-slate-500 leading-relaxed max-w-md mb-7">
              Tell us what went wrong or what you need help with. Share as much detail as possible so our team can resolve it faster.
            </p>
            <div className="space-y-3">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-3 text-sm font-semibold text-slate-700 hover:text-slate-900">
                <span className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center"><Mail size={16} style={{ color: BLUE }} /></span>
                {SUPPORT_EMAIL}
              </a>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center"><Phone size={16} style={{ color: BLUE }} /></span>
                Our team will respond by email or phone.
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div><h2 className="text-lg font-extrabold text-slate-900">Contact support</h2><p className="text-sm text-slate-500 mt-1">All fields are required unless marked optional.</p></div>
              <Send size={20} style={{ color: BLUE }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name" value={form.name} onChange={setField("name")} required />
              <Field label="Mobile number" value={form.mobile} onChange={setField("mobile")} required inputMode="numeric" maxLength={10} />
              <Field label="Email address" type="email" value={form.email} onChange={setField("email")} required />
              <label className="block">
                <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Reason / issue</span>
                <select required value={form.reason} onChange={setField("reason")} className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select an issue</option>
                  <option>Course enrollment</option>
                  <option>Video or PDF not opening</option>
                  <option>Payment or access</option>
                  <option>Account or profile</option>
                  <option>Community</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Message</span>
                <textarea required rows={6} value={form.message} onChange={setField("message")} placeholder="Describe your problem or question…" className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </label>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mt-4">{error}</p>}
            {success && <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-2 mt-4 flex items-center gap-2"><CheckCircle2 size={16} /> {success}</p>}
            {!isSupabaseConfigured && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2 mt-4">Demo mode: connect Supabase to save requests for the admin team.</p>}
            <button type="submit" disabled={submitting} className="mt-6 text-white font-bold px-5 py-3 rounded-md flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: NAVY }}>
              <Send size={15} /> {submitting ? "Sending…" : "Send to Nexrnn Support"}
            </button>
          </form>
        </div>

        {requests.length > 0 && (
          <div className="mt-12 max-w-3xl">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">Your previous requests</h2>
            <div className="space-y-3">
              {requests.map((request) => <div key={request.id} className="bg-white border border-slate-200 rounded-lg p-4"><div className="flex items-center justify-between gap-3 mb-1"><p className="font-semibold text-slate-800">{request.reason}</p><span className="text-[11px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">{(request.status || "open").replace("_", " ")}</span></div><p className="text-sm text-slate-500 line-clamp-2">{request.message}</p>{request.admin_feedback && <div className="mt-3 rounded-md bg-blue-50 border border-blue-100 px-3 py-2"><p className="text-[11px] font-bold text-blue-700 uppercase mb-1">Admin feedback</p><p className="text-sm text-slate-700 whitespace-pre-wrap">{request.admin_feedback}</p></div>}<p className="text-[11px] text-slate-400 mt-2">{new Date(request.created_at).toLocaleString()}</p></div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, type = "text", ...props }) {
  return <label className="block"><span className="text-[13px] font-semibold text-slate-600 mb-1 block">{label}</span><input type={type} {...props} className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400" /></label>;
}

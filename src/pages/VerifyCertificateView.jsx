import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Search, ShieldCheck, XCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { verifyCertificate } from "../services/certificates.js";
import { BLUE, NAVY } from "../theme";

export default function VerifyCertificateView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [registrationId, setRegistrationId] = useState(searchParams.get("id") || "");
  const [certificate, setCertificate] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) verify(id);
  }, []);

  async function verify(id = registrationId) {
    const normalized = id.trim();
    if (!normalized) { setError("Enter a Registration ID."); setSearched(false); setCertificate(null); return; }
    setLoading(true); setError(""); setSearched(false);
    const result = await verifyCertificate(normalized);
    setLoading(false); setSearched(true); setCertificate(result.data || null);
    if (result.error) setError(result.error.message);
    setSearchParams({ id: normalized.toUpperCase() });
  }

  return <div className="min-h-screen bg-slate-50"><header className="bg-white border-b border-slate-200"><div className="max-w-5xl mx-auto px-6 h-[72px] flex items-center justify-between"><Link to="/"><Logo /></Link><div className="flex items-center gap-4"><Link to="/courses" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Courses</Link><Link to="/workshops" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Workshops</Link></div></div></header><main className="max-w-3xl mx-auto px-6 py-14"><div className="text-center mb-8"><div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5" style={{ backgroundColor: "#eef5ff", color: BLUE }}><ShieldCheck size={29} /></div><p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">Nexrnn Technologies</p><h1 className="text-3xl font-extrabold text-slate-900">Verify Certificate</h1><p className="text-sm text-slate-500 mt-2">Enter the Certificate ID printed on a Nexrnn certificate.</p></div><form onSubmit={(event) => { event.preventDefault(); verify(); }} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input required value={registrationId} onChange={(event) => setRegistrationId(event.target.value)} placeholder="NXR-ABC123-XYZ789" className="w-full pl-9 pr-3 py-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" /></div><button disabled={loading} className="text-white font-bold px-5 py-3 rounded-md disabled:opacity-50" style={{ backgroundColor: BLUE }}>{loading ? "Checking…" : "Verify ID"}</button></form>{error && <p className="mt-5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-4 py-3">{error}</p>}{searched && !certificate && !error && <div className="mt-5 bg-white border border-red-100 rounded-xl p-8 text-center"><XCircle size={31} className="mx-auto mb-3 text-red-400" /><h2 className="font-extrabold text-slate-900">Certificate not found</h2><p className="text-sm text-slate-500 mt-2">Please check the Registration ID and try again.</p></div>}{certificate && <div className="mt-5 bg-white border border-green-200 rounded-xl p-7 shadow-sm"><div className="flex items-center gap-3 mb-6"><CheckCircle2 size={29} className="text-green-600" /><div><h2 className="font-extrabold text-slate-900">Certificate verified</h2><p className="text-sm text-slate-500 mt-1">This certificate was issued and verified by Nexrnn Technologies.</p></div></div><div className="grid sm:grid-cols-2 gap-3"><Info label="Certificate ID" value={certificate.certificate_id || certificate.registration_id} /><Info label="Student name" value={certificate.student_name} /><Info label="Title" value={certificate.course_title} /><Info label="Item type" value={certificate.certificate_type || "Course"} /><Info label="Issued on" value={certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—"} /></div><p className="text-xs text-slate-400 mt-5">Verification status: <span className="font-bold text-green-700">VALID</span></p></div>}<Link to="/" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 mt-8"><ArrowLeft size={15} /> Back to NexRNN LMS Portal</Link></main><footer className="text-center text-xs text-slate-400 py-8">{new Date().getFullYear()} Nexrnn Technologies</footer></div>;
}

function Info({ label, value }) { return <div className="border border-slate-200 rounded-lg p-3"><p className="text-[10px] font-bold uppercase text-slate-400 mb-1">{label}</p><p className="text-sm font-bold text-slate-800 break-words">{value || "—"}</p></div>; }

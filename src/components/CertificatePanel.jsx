import React, { useMemo, useState } from "react";
import { ArrowLeft, Award, CheckCircle2, Download, Link as LinkIcon, Share2 } from "lucide-react";
import { BLUE, NAVY } from "../theme";
import { downloadCertificatePdf } from "../lib/certificates.js";

export default function CertificatePanel({ course, certificate, studentName, registrationId, onBack }) {
  const [actionMessage, setActionMessage] = useState("");
  const certificateType = course.courseType === "workshop" ? "Workshop" : (certificate?.certificate_type || "Course");
  const issuedDate = useMemo(() => certificate?.issued_at ? new Date(certificate.issued_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }), [certificate?.issued_at]);
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify-certificate?id=${encodeURIComponent(registrationId)}`
    : `/verify-certificate?id=${encodeURIComponent(registrationId)}`;

  const handleCopy = async () => {
    setActionMessage("");
    try {
      if (!navigator.clipboard?.writeText) {
        setActionMessage("Copy is not supported in this browser.");
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setActionMessage("Certificate link copied.");
    } catch {
      setActionMessage("The link could not be copied. Please try again.");
    }
  };

  const handleShare = async () => {
    setActionMessage("");
    if (!navigator.share) {
      setActionMessage("Sharing is not supported in this browser. Use Copy link instead.");
      return;
    }
    try {
      await navigator.share({ title: `${course.title} Certificate`, text: `${studentName}'s Nexrnn certificate`, url: shareUrl });
      setActionMessage("Certificate link shared.");
    } catch (error) {
      if (error?.name !== "AbortError") setActionMessage("The certificate link could not be shared.");
    }
  };

  return <div>
    <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-5"><ArrowLeft size={15} /> All Certificates</button>
    <div className="flex items-start justify-between gap-4 mb-5"><div><p className="text-xs font-bold tracking-[0.18em] text-slate-400 uppercase mb-2">Certificate issued</p><h1 className="text-xl font-extrabold text-slate-900">{course.title}</h1><p className="text-sm text-slate-500 mt-1">Your {certificateType.toLowerCase()} completion certificate is ready.</p></div><CheckCircle2 size={25} style={{ color: BLUE }} /></div>

    <div className="rounded-xl p-2 sm:p-4 shadow-sm" style={{ backgroundColor: "#fff", border: `2px solid ${NAVY}` }}>
      <div className="rounded-lg border-[2px] border-dashed border-slate-200 px-4 sm:px-8 py-10 sm:py-14 text-center">
        <div className="w-12 h-12 rounded-lg mx-auto flex items-center justify-center mb-5" style={{ backgroundColor: "#eef5ff" }}><Award size={27} style={{ color: BLUE }} /></div>
        <p className="text-xs sm:text-sm font-bold tracking-[0.14em] text-slate-400 mb-4">CERTIFICATE OF COMPLETION</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">NEXRNN TECHNOLOGIES</h2>
        <p className="text-sm sm:text-base text-slate-400 mt-7">This certifies that</p>
        <p className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-3 break-words">{studentName}</p>
        <p className="text-sm sm:text-base text-slate-400 mt-5">has successfully completed the</p>
        <p className="text-lg sm:text-xl font-bold mt-2" style={{ color: BLUE }}>{course.title} {certificateType}</p>
        <div className="mt-7 space-y-1 text-xs sm:text-sm text-slate-400"><p>Certificate ID: <span className="font-bold text-slate-600">{registrationId}</span></p><p>Issued on {issuedDate}</p><p className="font-bold text-slate-600">Issued and verified by Nexrnn Technologies</p></div>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-3 mt-5"><button onClick={() => downloadCertificatePdf({ studentName, courseName: `${course.title} ${certificateType}`, registrationId, issuedDate })} className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2.5 rounded-md hover:opacity-90" style={{ backgroundColor: BLUE }}><Download size={15} /> Download PDF</button><button onClick={handleShare} className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"><Share2 size={15} /> Share Link</button><button onClick={handleCopy} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"><LinkIcon size={14} /> Copy link</button></div>{actionMessage && <p className="text-sm text-slate-500 mt-3">{actionMessage}</p>}
    <p className="text-xs text-slate-400 mt-4">Anyone with this link can open this certificate page on this device. The recipient may need to sign in to the LMS.</p>
  </div>;
}

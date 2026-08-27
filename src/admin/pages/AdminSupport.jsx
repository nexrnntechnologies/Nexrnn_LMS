import React, { useEffect, useMemo, useState } from "react";
import { ExternalLink, MessageSquare, RefreshCw, Send } from "lucide-react";
import { adminFetchSupportRequests, adminUpdateSupportRequest } from "../../services/admin.js";
import { BLUE } from "../../theme";
import AdminExportButtons from "../../components/AdminExportButtons.jsx";

const STATUS_STYLES = { open: "bg-red-100 text-red-700", in_progress: "bg-amber-100 text-amber-700", resolved: "bg-green-100 text-green-700" };

export default function AdminSupport() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const { data, error: nextError } = await adminFetchSupportRequests();
    setRequests(data || []);
    setError(nextError?.message || "");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredRequests = useMemo(() => {
    const search = query.trim().toLowerCase();
    return requests.filter((request) => {
      const haystack = [request.name, request.email, request.mobile, request.reason, request.message, request.admin_feedback].filter(Boolean).join(" ").toLowerCase();
      const created = request.created_at ? new Date(request.created_at).toISOString().slice(0, 10) : "";
      return (!search || haystack.includes(search)) && (!fromDate || created >= fromDate) && (!toDate || created <= toDate) && (statusFilter === "all" || (request.status || "open") === statusFilter);
    });
  }, [requests, query, fromDate, toDate, statusFilter]);

  const openRequest = (request) => { setSelected(request); setFeedback(request.admin_feedback || ""); };

  const changeStatus = async (id, status) => {
    const { error: nextError } = await adminUpdateSupportRequest(id, { status });
    if (nextError) { setError(nextError.message); return; }
    setRequests((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    setSelected((current) => current?.id === id ? { ...current, status } : current);
  };

  const saveFeedback = async () => {
    if (!selected) return;
    setSavingFeedback(true);
    const { error: nextError } = await adminUpdateSupportRequest(selected.id, { admin_feedback: feedback.trim() || null, feedback_at: new Date().toISOString() });
    setSavingFeedback(false);
    if (nextError) { setError(nextError.message); return; }
    const updated = { ...selected, admin_feedback: feedback.trim(), feedback_at: new Date().toISOString() };
    setRequests((current) => current.map((item) => item.id === selected.id ? updated : item));
    setSelected(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div><p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">Student care</p><h1 className="text-2xl font-extrabold text-slate-900">Support Requests</h1><p className="text-sm text-slate-500 mt-1">Review issues and send feedback from the admin panel.</p></div>
        <div className="flex flex-wrap items-center gap-3"><AdminExportButtons title="support-requests" rows={filteredRequests} columns={[{ label: "Date", value: (item) => item.created_at ? new Date(item.created_at).toLocaleString("en-IN") : "" }, { label: "Name", key: "name" }, { label: "Email", key: "email" }, { label: "Mobile", key: "mobile" }, { label: "Reason", key: "reason" }, { label: "Message", key: "message" }, { label: "Status", value: (item) => item.status || "open" }, { label: "Admin Feedback", key: "admin_feedback" }]} /><button onClick={load} className="flex items-center gap-2 text-sm font-semibold text-slate-600 border border-slate-200 px-3 py-2 rounded-md hover:bg-white"><RefreshCw size={14} /> Refresh</button></div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-5 grid grid-cols-1 md:grid-cols-[minmax(220px,1fr)_150px_150px_150px] gap-3 items-end">
        <label className="relative block"><span className="sr-only">Search</span><MessageSquare size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, phone, issue…" className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" /></label>
        <Filter label="From" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        <Filter label="To" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        <Filter label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={["all", "open", "in_progress", "resolved"]} />
      </div>
      <div className="flex items-center justify-between mb-3"><p className="text-xs text-slate-500">Showing <strong>{filteredRequests.length}</strong> of {requests.length} requests</p>{(query || fromDate || toDate || statusFilter !== "all") && <button onClick={() => { setQuery(""); setFromDate(""); setToDate(""); setStatusFilter("all"); }} className="text-xs font-semibold hover:underline" style={{ color: BLUE }}>Clear filters</button>}</div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">{error}</p>}
      {loading ? <p className="text-sm text-slate-400">Loading support requests…</p> : filteredRequests.length === 0 ? <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center"><MessageSquare size={30} className="mx-auto mb-3 text-slate-300" /><p className="font-semibold text-slate-700">{requests.length ? "No requests match these filters." : "No support requests yet."}</p><p className="text-sm text-slate-400 mt-1">New requests from the Support page will appear here.</p></div> : <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[1020px]"><thead className="bg-slate-50 text-slate-500 text-left"><tr><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 font-semibold">Name / Contact</th><th className="px-4 py-3 font-semibold">Reason</th><th className="px-4 py-3 font-semibold">Message</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Feedback</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{filteredRequests.map((request) => <tr key={request.id} className="hover:bg-slate-50"><td className="px-4 py-4 text-slate-500 whitespace-nowrap">{request.created_at ? new Date(request.created_at).toLocaleString() : "—"}</td><td className="px-4 py-4"><p className="font-semibold text-slate-800">{request.name}</p><p className="text-xs text-slate-500">{request.email}</p><p className="text-xs text-slate-500">{request.mobile}</p></td><td className="px-4 py-4 text-slate-600">{request.reason}</td><td className="px-4 py-4 text-slate-600 max-w-[250px] truncate" title={request.message}>{request.message}</td><td className="px-4 py-4"><select value={request.status || "open"} onChange={(event) => changeStatus(request.id, event.target.value)} className={`text-[11px] font-bold px-2 py-1 rounded border-0 ${STATUS_STYLES[request.status] || STATUS_STYLES.open}`}><option value="open">OPEN</option><option value="in_progress">IN PROGRESS</option><option value="resolved">RESOLVED</option></select></td><td className="px-4 py-4">{request.admin_feedback ? <span className="text-xs font-semibold text-green-700">Added</span> : <span className="text-xs text-slate-400">Pending</span>}</td><td className="px-4 py-4 text-right"><button onClick={() => openRequest(request)} className="text-sm font-semibold hover:underline" style={{ color: BLUE }}>View</button></td></tr>)}</tbody></table></div></div>}

      {selected && <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={() => setSelected(null)}><div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-7 relative max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}><button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl" aria-label="Close">×</button><p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">Support request</p><h2 className="text-xl font-extrabold text-slate-900 mb-5">{selected.reason}</h2><div className="grid grid-cols-2 gap-3 mb-5"><Info label="Name" value={selected.name} /><Info label="Mobile" value={selected.mobile} /><Info label="Email" value={selected.email} /><Info label="Submitted" value={selected.created_at ? new Date(selected.created_at).toLocaleString() : "—"} /></div><div className="bg-slate-50 rounded-lg p-4 mb-5"><p className="text-[11px] font-bold text-slate-400 uppercase mb-2">Student message</p><p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.message}</p></div><label className="block mb-4"><span className="text-[13px] font-semibold text-slate-600 mb-1 block">Admin feedback / reply</span><textarea rows={5} value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Write the response you want to share with the student…" className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400" /></label><div className="flex flex-wrap gap-3 items-center"><button onClick={saveFeedback} disabled={savingFeedback} className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2.5 rounded-md disabled:opacity-50" style={{ backgroundColor: BLUE }}><Send size={14} /> {savingFeedback ? "Saving…" : "Save Feedback"}</button><a href={`mailto:${selected.email}?subject=Nexrnn support: ${encodeURIComponent(selected.reason)}`} className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 border border-slate-200 px-4 py-2.5 rounded-md hover:bg-slate-50"><ExternalLink size={14} /> Reply by Email</a><label className="ml-auto text-[13px] font-semibold text-slate-600 flex items-center gap-2">Status<select value={selected.status || "open"} onChange={(event) => changeStatus(selected.id, event.target.value)} className="px-2 py-2 rounded-md border border-slate-200"><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></label></div>{selected.admin_feedback && <p className="text-xs text-slate-400 mt-4">Feedback saved{selected.feedback_at ? ` on ${new Date(selected.feedback_at).toLocaleString()}` : ""}.</p>}</div></div>}
    </div>
  );
}

function Filter({ label, options, ...props }) { return <label className="block"><span className="text-[10px] font-bold tracking-wide text-slate-400 uppercase block mb-1">{label}</span>{options ? <select {...props} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white"><option value="all">All</option>{options.filter((option) => option !== "all").map((option) => <option key={option} value={option}>{option.replace("_", " ").toUpperCase()}</option>)}</select> : <input {...props} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-md" />}</label>; }
function Info({ label, value }) { return <div className="border border-slate-200 rounded-lg p-3"><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p><p className="text-sm font-semibold text-slate-800 break-words">{value || "—"}</p></div>; }

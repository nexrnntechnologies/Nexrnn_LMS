import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { adminSendNotification, adminFetchCourses } from "../../services/admin.js";
import { BLUE } from "../../theme";

export default function AdminNotifications() {
  const [courses, setCourses] = useState([]);
  const [audience, setAudience] = useState("all");
  const [courseId, setCourseId] = useState("");
  const [text, setText] = useState("");
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    adminFetchCourses().then(({ data }) => setCourses(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    const { error } = await adminSendNotification({
      audience,
      courseId: audience === "course" ? courseId : null,
      text,
      detail,
    });
    setSubmitting(false);
    setMessage(error ? error.message : "Notification sent.");
    if (!error) { setText(""); setDetail(""); }
  };

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-8">Send Notification</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-slate-200 rounded-lg p-6">
        <label className="block">
          <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Audience</span>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200"
          >
            <option value="all">All registered users</option>
            <option value="course">Students enrolled in a specific course</option>
          </select>
        </label>

        {audience === "course" && (
          <label className="block">
            <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Course</span>
            <select
              required
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200"
            >
              <option value="">Select a course…</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
        )}

        <label className="block">
          <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Message</span>
          <input
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. New live session scheduled"
            className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200"
          />
        </label>

        <label className="block">
          <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Detail (optional)</span>
          <textarea
            rows={2}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200"
          />
        </label>

        {message && <p className="text-sm text-slate-600">{message}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2.5 rounded-md hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: BLUE }}
        >
          <Send size={14} /> {submitting ? "Sending…" : "Send Notification"}
        </button>
      </form>
    </div>
  );
}

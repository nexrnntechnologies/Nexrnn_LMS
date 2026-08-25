import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { adminFetchUserDetail } from "../../services/admin.js";
import { BLUE } from "../../theme";

export default function AdminUserDetail() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetchUserDetail(userId).then(({ profile, enrollments }) => {
      setProfile(profile);
      setEnrollments(enrollments);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div className="max-w-4xl mx-auto px-8 py-10 text-sm text-slate-400">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      <Link
        to="/nexrnn/master_nexrnn/admin/users"
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-4"
      >
        <ChevronLeft size={15} /> Back to Users
      </Link>

      <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
        {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Unnamed User"}
      </h1>
      <p className="text-sm text-slate-500 mb-8">{profile?.email}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <InfoBox label="Phone" value={profile?.phone || "—"} />
        <InfoBox label="City" value={profile?.city || "—"} />
        <InfoBox label="Role" value={profile?.role || "student"} />
        <InfoBox label="Joined" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"} />
      </div>

      <h2 className="font-extrabold text-slate-900 mb-4">Enrollments & Progress</h2>
      {enrollments.length === 0 ? (
        <p className="text-sm text-slate-400">Not enrolled in any courses yet.</p>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white divide-y divide-slate-100">
          {enrollments.map((e) => (
            <div key={e.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-slate-800 text-sm">{e.courseTitle}</p>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${e.status === "paid" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {e.status || "free"}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div className="h-full rounded-full" style={{ width: `${e.pct}%`, backgroundColor: BLUE }} />
              </div>
              <p className="text-[12px] text-slate-500">
                {e.pct}% complete — {e.doneLessons}/{e.totalLessons} lessons
                {e.payment_ref && <> · Payment ref: {e.payment_ref}</>}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-white">
      <p className="text-[11px] font-bold text-slate-400 mb-1">{label.toUpperCase()}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

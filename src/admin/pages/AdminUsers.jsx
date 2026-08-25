import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminFetchUsers } from "../../services/admin.js";
import { BLUE } from "../../theme";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetchUsers().then(({ data }) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-8">Users</h1>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-slate-400">No registered users yet.</p>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${u.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                      {u.role || "student"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/nexrnn/master_nexrnn/admin/users/${u.id}`}
                      className="text-[13px] font-semibold hover:underline"
                      style={{ color: BLUE }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[12px] text-slate-400 mt-4">
        To make a user an admin, run in Supabase SQL editor:{" "}
        <code className="bg-slate-100 px-1.5 py-0.5 rounded">update profiles set role = 'admin' where email = 'their@email.com';</code>
      </p>
    </div>
  );
}

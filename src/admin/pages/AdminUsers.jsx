import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { adminFetchUsers } from "../../services/admin.js";
import { BLUE } from "../../theme";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    adminFetchUsers().then(({ data, error: loadError }) => {
      setUsers(data || []);
      setError(loadError?.message || "");
      setLoading(false);
    });
  }, []);

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return users.filter((user) => {
      const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
      const haystack = [name, user.user_registration_id, user.email, user.phone, user.city, user.role].filter(Boolean).join(" ").toLowerCase();
      return (!search || haystack.includes(search)) && (roleFilter === "all" || (user.role || "student") === roleFilter);
    });
  }, [users, query, roleFilter]);

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between gap-4 mb-6"><div><p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-2">Accounts</p><h1 className="text-2xl font-extrabold text-slate-900">Registered Users</h1><p className="text-sm text-slate-500 mt-1">All registered users, including students and admins.</p></div><span className="text-sm font-semibold text-slate-500">{filteredUsers.length} shown</span></div>

      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-5 grid grid-cols-1 md:grid-cols-[minmax(220px,1fr)_190px] gap-3 items-end"><label className="relative block"><span className="sr-only">Search users</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, phone…" className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" /></label><label className="block"><span className="text-[10px] font-bold tracking-wide text-slate-400 uppercase block mb-1">Role</span><div className="relative"><SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-md bg-white"><option value="all">All roles</option><option value="student">Student</option><option value="admin">Admin</option></select></div></label></div>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mb-4">{error}</p>}
      {loading ? <p className="text-sm text-slate-400">Loading…</p> : filteredUsers.length === 0 ? <p className="text-sm text-slate-400">{users.length ? "No users match these filters." : "No registered users yet."}</p> : <div className="border border-slate-200 rounded-lg overflow-hidden bg-white"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[900px]"><thead className="bg-slate-50 text-slate-500 text-left"><tr><th className="px-4 py-3 font-semibold">Name / User ID</th><th className="px-4 py-3 font-semibold">Email</th><th className="px-4 py-3 font-semibold">Phone</th><th className="px-4 py-3 font-semibold">City</th><th className="px-4 py-3 font-semibold">Role</th><th className="px-4 py-3 font-semibold">Joined</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{filteredUsers.map((user) => <tr key={user.id} className="hover:bg-slate-50"><td className="px-4 py-3"><p className="font-semibold text-slate-800">{[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}</p><p className="text-[11px] text-slate-400 mt-1">{user.user_registration_id || "ID pending migration"}</p></td><td className="px-4 py-3 text-slate-600">{user.email}</td><td className="px-4 py-3 text-slate-500">{user.phone || "—"}</td><td className="px-4 py-3 text-slate-500">{user.city || "—"}</td><td className="px-4 py-3"><span className={`text-[11px] font-bold px-2 py-0.5 rounded ${user.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{user.role || "student"}</span></td><td className="px-4 py-3 text-slate-500">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</td><td className="px-4 py-3 text-right"><Link to={`/nexrnn/master_nexrnn/admin/users/${user.id}`} className="text-[13px] font-semibold hover:underline" style={{ color: BLUE }}>Manage</Link></td></tr>)}</tbody></table></div></div>}
      <p className="text-[12px] text-slate-400 mt-4">To make a user an admin, run in Supabase SQL editor: <code className="bg-slate-100 px-1.5 py-0.5 rounded">update profiles set role = 'admin' where email = 'their@email.com';</code></p>
    </div>
  );
}

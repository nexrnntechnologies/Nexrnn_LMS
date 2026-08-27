import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { supabase } from "../../lib/supabaseClient";
import { NAVY, BLUE } from "../../theme";

export default function AdminLogin() {
  const { signIn, signOut, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isSupabaseConfigured) {
      setError("Connect Supabase first (see README) — admin login needs a live project.");
      return;
    }

    setSubmitting(true);
    const { data, error: signInError } = await signIn(email, password);
    setSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    // Give the AuthContext a moment to load the profile, then check role.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      setError("This account doesn't have admin access.");
      await signOut();
      return;
    }
    navigate("/nexrnn/master_nexrnn/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: NAVY }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 text-white">
          <ShieldCheck size={32} style={{ color: BLUE }} className="mb-2" />
          <p className="font-extrabold tracking-tight">NEXRNN ADMIN</p>
        </div>
        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <h1 className="text-lg font-extrabold text-slate-900 mb-1">Admin Sign In</h1>
          <p className="text-sm text-slate-500 mb-6">Restricted access — Nexrnn team only.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Admin Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white font-semibold py-2.5 rounded-md hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: BLUE }}
            >
              {submitting ? "Checking…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

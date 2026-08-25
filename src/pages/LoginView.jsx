import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import { BLUE } from "../theme";

export default function LoginView() {
  const { signIn, resetPassword, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin"); // "signin" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/my-courses");
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);
    const { error } = await resetPassword(email);
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setInfo("Password reset link sent — check your email.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          {mode === "signin" ? (
            <>
              <h1 className="text-lg font-extrabold text-slate-900 mb-1">Sign in to your account</h1>
              <p className="text-sm text-slate-500 mb-6">Welcome back to Nexrnn LMS.</p>

              {!isSupabaseConfigured && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
                  Supabase isn't connected yet — see README to set it up before signing in.
                </p>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <label className="block">
                  <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </label>
                <label className="block">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-semibold text-slate-600">Password</span>
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); setError(""); setInfo(""); }}
                      className="text-[12px] font-semibold hover:underline"
                      style={{ color: BLUE }}
                    >
                      Forgot password?
                    </button>
                  </div>
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
                  {submitting ? "Please wait…" : "Sign In"}
                </button>
              </form>

              <p className="text-center text-sm mt-5 text-slate-500">
                Don't have an account?{" "}
                <Link to="/createaccount" className="font-semibold hover:underline" style={{ color: BLUE }}>
                  Create one
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-lg font-extrabold text-slate-900 mb-1">Reset your password</h1>
              <p className="text-sm text-slate-500 mb-6">We'll email you a link to set a new password.</p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <label className="block">
                  <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </label>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {info && <p className="text-sm text-green-600">{info}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-white font-semibold py-2.5 rounded-md hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: BLUE }}
                >
                  {submitting ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <button
                onClick={() => { setMode("signin"); setError(""); setInfo(""); }}
                className="w-full text-center text-sm font-semibold mt-5 hover:underline"
                style={{ color: BLUE }}
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

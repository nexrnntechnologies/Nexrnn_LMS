import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import { BLUE } from "../theme";

export default function AuthView() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);
    const { error } = mode === "signin" ? await signIn(email, password) : await signUp(email, password);
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else if (mode === "signup") {
      setInfo("Account created — check your email to confirm, then sign in.");
      setMode("signin");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-lg font-extrabold text-slate-900 mb-1">
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {mode === "signin" ? "Welcome back to Nexrnn LMS." : "Start learning with Nexrnn Technologies."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
            {info && <p className="text-sm text-green-600">{info}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white font-semibold py-2.5 rounded-md hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: BLUE }}
            >
              {submitting ? "Please wait…" : mode === "signin" ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setInfo(""); }}
            className="w-full text-center text-sm font-semibold mt-5 hover:underline"
            style={{ color: BLUE }}
          >
            {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

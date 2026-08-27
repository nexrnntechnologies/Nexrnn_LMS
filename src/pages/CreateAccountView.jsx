import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import { BLUE } from "../theme";

export default function CreateAccountView() {
  const { signUp, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = location.state?.from || "/my-courses";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!firstName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!/^\d{10}$/.test(mobile.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!gender) {
      setError("Please select your gender.");
      return;
    }
    if (!city.trim()) {
      setError("Please enter your city.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    const { data, error: signUpError } = await signUp(email, password, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: mobile.trim(),
      gender,
      city: city.trim(),
    });
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data?.session) {
      navigate(returnPath, { replace: true });
    } else {
      setInfo("Account created — check your email to confirm, then sign in.");
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-lg font-extrabold text-slate-900 mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 mb-6">Start learning with Nexrnn Technologies.</p>

          {!isSupabaseConfigured && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
              Supabase isn't connected yet — see README to set it up before creating an account.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[13px] font-semibold text-slate-600 mb-1 block">First name</span>
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
              <label className="block">
                <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Last name</span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Mobile Number</span>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit number"
                className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Gender</span>
                <select required value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[13px] font-semibold text-slate-600 mb-1 block">City</span>
                <input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Your city" className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </label>
            </div>

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
            <label className="block">
              <span className="text-[13px] font-semibold text-slate-600 mb-1 block">Confirm Password</span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {submitting ? "Creating…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm mt-5 text-slate-500">
            Already have an account?{" "}
            <Link to="/login" state={{ from: returnPath }} className="font-semibold hover:underline" style={{ color: BLUE }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

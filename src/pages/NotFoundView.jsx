import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { BLUE } from "../theme";

export default function NotFoundView() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <Compass size={28} style={{ color: BLUE }} />
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-2">404</h1>
        <p className="text-slate-500 mb-8">This page doesn't exist — it may have been moved or the link is incorrect.</p>
        <Link
          to="/my-courses"
          className="inline-block text-white font-semibold px-5 py-2.5 rounded-md hover:opacity-90"
          style={{ backgroundColor: BLUE }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

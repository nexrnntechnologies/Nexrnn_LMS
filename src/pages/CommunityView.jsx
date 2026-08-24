import React from "react";
import { Users } from "lucide-react";
import { BLUE } from "../theme";

export default function CommunityView() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <Users size={40} style={{ color: BLUE }} className="mx-auto mb-4" />
      <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Nexrnn Community</h1>
      <p className="text-slate-500 max-w-md mx-auto">
        Discussions, resources and announcements from your enrolled course communities will appear here.
      </p>
    </div>
  );
}

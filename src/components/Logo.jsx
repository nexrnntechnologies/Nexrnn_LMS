import React from "react";
import { BLUE } from "../theme";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: BLUE }}
      >
        N
      </div>
      <span className="font-extrabold tracking-tight text-[15px]">
        NEXRNN <span style={{ color: BLUE }}>TECHNOLOGIES</span>
      </span>
    </div>
  );
}

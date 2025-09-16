// src/components/Fab.jsx
import React from "react";

export default function Fab({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Add"
      className="fixed z-40 bottom-[calc(16px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2
                 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95
                 shadow-xl shadow-emerald-900/40 flex items-center justify-center text-2xl font-bold"
    >
      +
    </button>
  );
}

// src/components/Header.jsx
import React from "react";

export default function Header({ T, page, setPage, startQuiz, cn }) {
  return (
    <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
        {/* Brand row — full width title + subtitle (no truncation) */}
        <div className="flex items-start gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-500 flex items-center justify-center font-bold text-zinc-900">
            LT
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-xl font-semibold">
              {T.appTitle1} <span className="hidden sm:inline">{T.appTitle2}</span>
            </div>
            <div className="text-xs text-zinc-400">{T.subtitle}</div>
          </div>
        </div>

        {/* nav */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { key: "home", label: T.navHome },
            { key: "library", label: T.navLibrary },
            { key: "settings", label: T.navSettings },
          ].map((b) => (
            <button
              key={b.key}
              onClick={() => setPage(b.key)}
              className={cn(
                "w-full rounded-xl border px-3 py-2",
                page === b.key
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
              )}
            >
              {b.label}
            </button>
          ))}
        </div>

        <button
          onClick={startQuiz}
          className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl py-3 font-semibold"
        >
          {T.startQuiz}
        </button>
      </div>
    </div>
  );
}

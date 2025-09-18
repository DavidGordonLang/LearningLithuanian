import React from "react";

export default function Header({ T, cn }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-[10000] bg-zinc-950/95 backdrop-blur",
        "border-b border-zinc-800"
      )}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            <span className="text-white">{T.appTitle1}</span>{" "}
            <span className="text-emerald-500">{T.appTitle2}</span>
          </h1>
          <span className="hidden sm:inline text-xs text-zinc-400">
            {T.subtitle}
          </span>
        </div>
      </div>
    </header>
  );
}
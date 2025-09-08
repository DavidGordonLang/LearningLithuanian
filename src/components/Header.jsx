import React from "react";

/**
 * Header.jsx
 * Props:
 * - T                (strings)
 * - page             ("home" | "library" | "settings")
 * - setPage          (fn)
 * - startQuiz        (fn)
 * - cn               (className combiner)
 */
export default function Header({ T, page, setPage, startQuiz, cn }) {
  const NavBtn = ({ id, label }) => (
    <button
      onClick={() => setPage(id)}
      aria-current={page === id ? "page" : undefined}
      className={cn(
        "px-3 py-1.5 rounded-md text-sm border transition",
        page === id
          ? "bg-emerald-600 border-emerald-600 text-white"
          : "bg-zinc-900 border-zinc-700 hover:border-zinc-600"
      )}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
        {/* Top row: title + nav + quiz */}
        <div className="flex items-center gap-3">
          {/* Title */}
          <div className="mr-auto">
            <div className="flex items-baseline gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                {T.appTitle1} <span className="text-emerald-500">{T.appTitle2}</span>
              </h1>
            </div>
            <div className="hidden sm:block text-xs text-zinc-400">
              {T.subtitle}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-2">
            <NavBtn id="home" label={T.navHome} />
            <NavBtn id="library" label={T.navLibrary} />
            <NavBtn id="settings" label={T.navSettings} />
          </nav>

          {/* Start Quiz (only show on Home) */}
          {page === "home" && (
            <button
              onClick={startQuiz}
              className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold px-3 py-2 rounded-md"
              title={T.startQuiz}
            >
              🎯 {T.startQuiz}
            </button>
          )}
        </div>

        {/* Mobile quiz button (under nav) */}
        {page === "home" && (
          <div className="mt-2 sm:hidden">
            <button
              onClick={startQuiz}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold px-3 py-2 rounded-md"
              title={T.startQuiz}
            >
              🎯 {T.startQuiz}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

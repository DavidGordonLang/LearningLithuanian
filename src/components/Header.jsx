import React from "react";

/**
 * Header.jsx
 * - App title + tagline
 * - Navigation: Home / Library / Settings
 * - Start Quiz button
 * - Mobile: page switcher select
 */
export default function Header({ T, page, setPage, startQuiz, cn }) {
  const NavButton = ({ id, label }) => (
    <button
      onClick={() => setPage(id)}
      className={cn(
        "px-3 py-1.5 rounded-md text-sm border",
        page === id
          ? "bg-zinc-800 border-zinc-700 text-white"
          : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
      )}
      aria-current={page === id ? "page" : undefined}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Title */}
          <div className="flex items-baseline gap-2 mr-auto">
            <span className="text-xl font-bold">{T.appTitle1}</span>
            <span className="text-xl font-bold text-emerald-500">
              {T.appTitle2}
            </span>
            <span className="hidden sm:inline text-xs text-zinc-400 ml-2">
              {T.subtitle}
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-2">
            <NavButton id="home" label={T.navHome} />
            <NavButton id="library" label={T.navLibrary} />
            <NavButton id="settings" label={T.navSettings} />
          </nav>

          {/* Start Quiz */}
          <button
            className="shrink-0 px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold"
            onClick={startQuiz}
          >
            {T.startQuiz}
          </button>

          {/* Mobile nav */}
          <div className="sm:hidden">
            <select
              aria-label="Navigate"
              className="bg-zinc-900 border border-zinc-700 rounded-md text-sm px-2 py-2 ml-2"
              value={page}
              onChange={(e) => setPage(e.target.value)}
            >
              <option value="home">{T.navHome}</option>
              <option value="library">{T.navLibrary}</option>
              <option value="settings">{T.navSettings}</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}

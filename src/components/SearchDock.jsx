// src/components/SearchDock.jsx
import React from "react";

export default function SearchDock({
  SearchBox,
  sortMode,
  setSortMode,
  placeholder,
  T,
  offsetTop = 56,
  page,
  setPage,
}) {
  // simple utility for active button styling
  const navBtn = (active) =>
    [
      "px-3 py-1.5 rounded-md text-sm border transition-colors",
      active
        ? "bg-emerald-600 border-emerald-600 text-white"
        : "bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800",
    ].join(" ");

  return (
    <div
      className="fixed left-0 right-0 z-[9999] bg-zinc-950/95 backdrop-blur border-b border-zinc-800"
      style={{ top: offsetTop, height: 56 }}
      aria-label="Search and navigation dock"
    >
      <div className="max-w-6xl mx-auto h-full px-3 sm:px-4 flex items-center gap-3">
        {/* Nav buttons (left) */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            className={navBtn(page === "home")}
            onClick={() => setPage("home")}
          >
            {T.navHome}
          </button>
          <button
            className={navBtn(page === "library")}
            onClick={() => setPage("library")}
          >
            {T.navLibrary}
          </button>
          <button
            className={navBtn(page === "settings")}
            onClick={() => setPage("settings")}
          >
            {T.navSettings}
          </button>
        </div>

        {/* Mobile nav (compact) */}
        <div className="sm:hidden flex items-center gap-1">
          <button
            className={navBtn(page === "home")}
            onClick={() => setPage("home")}
            aria-label={T.navHome}
          >
            {T.navHome}
          </button>
          <button
            className={navBtn(page === "library")}
            onClick={() => setPage("library")}
            aria-label={T.navLibrary}
          >
            {T.navLibrary}
          </button>
          <button
            className={navBtn(page === "settings")}
            onClick={() => setPage("settings")}
            aria-label={T.navSettings}
          >
            {T.navSettings}
          </button>
        </div>

        {/* Search (center, grows) */}
        <div className="flex-1 min-w-0">
          <SearchBox placeholder={placeholder} />
        </div>

        {/* Sort (right) */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block text-xs text-zinc-400">{T.sort}</div>
          <select
            className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1 text-sm"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            aria-label={T.sort}
          >
            <option value="RAG">{T.rag}</option>
            <option value="Newest">{T.newest}</option>
            <option value="Oldest">{T.oldest}</option>
          </select>
        </div>
      </div>
    </div>
  );
}

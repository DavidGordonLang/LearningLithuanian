import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function SearchDock({
  SearchBox,
  sortMode,
  setSortMode,
  placehoimport React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function SearchDock({
  SearchBox,
  sortMode,
  setSortMode,
  placeholder = "Search…",
  T,
  // NEW: nav controls + vertical offset
  page,
  setPage,
  offsetTop = 56, // header height in px
}) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = document.createElement("div");
    host.setAttribute("id", "search-dock-host");
    host.style.position = "fixed";
    host.style.top = `${offsetTop}px`;        // sit under the header
    host.style.left = "0";
    host.style.right = "0";
    host.style.zIndex = "9999";               // above metrics; modal will be higher
    host.style.transform = "translateZ(0)";
    hostRef.current = host;
    document.body.appendChild(host);
    return () => {
      try { document.body.removeChild(host); } catch {}
    };
  }, [offsetTop]);

  if (!hostRef.current) return null;

  const NavBtn = ({ id, label }) => {
    const active = page === id;
    return (
      <button
        onClick={() => setPage(id)}
        className={
          "px-2.5 py-1.5 rounded-md border text-xs " +
          (active
            ? "bg-emerald-600 border-emerald-600 text-white"
            : "bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800")
        }
      >
        {label}
      </button>
    );
  };

  return createPortal(
    <div
      className="bg-zinc-950/95 backdrop-blur"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Left: Search */}
          <div className="min-w-[200px] flex-1">
            <SearchBox placeholder={placeholder} />
          </div>

          {/* Middle: Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">{T.sort}</span>
            <select
              className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
            >
              <option value="RAG">{T.rag}</option>
              <option value="Newest">{T.newest}</option>
              <option value="Oldest">{T.oldest}</option>
            </select>
          </div>

          {/* Right: Primary nav (fills prior empty space) */}
          <div className="ml-auto flex items-center gap-2">
            <NavBtn id="home" label={T.navHome} />
            <NavBtn id="library" label={T.navLibrary} />
            <NavBtn id="settings" label={T.navSettings} />
          </div>
        </div>
      </div>
    </div>,
    hostRef.current
  );
}
lder = "Search…",
  T,
  offsetTop = 56,     // header height
  page,
  setPage,
  streak,
  level,
  levelProgress,
  levelStep = 2500,
  tab,
  setTab,
}) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = document.createElement("div");
    host.id = "search-dock-host";
    host.style.position = "fixed";
    host.style.top = `${offsetTop}px`;
    host.style.left = "0";
    host.style.right = "0";
    host.style.zIndex = "9999";
    host.style.transform = "translateZ(0)";
    hostRef.current = host;
    document.body.appendChild(host);
    return () => {
      try { document.body.removeChild(host); } catch {}
    };
  }, [offsetTop]);

  if (!hostRef.current) return null;

  const NavBtn = ({ id, label }) => (
    <button
      type="button"
      className={
        "px-3 py-1.5 rounded-xl border text-sm " +
        (page === id
          ? "bg-emerald-600 border-emerald-600"
          : "bg-zinc-900 border-zinc-800")
      }
      onClick={() => setPage(id)}
    >
      {label}
    </button>
  );

  const tabs = ["Phrases", "Questions", "Words", "Numbers"];

  return createPortal(
    <div className="bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
      {/* Row 1: Search + Sort */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-2">
        <SearchBox placeholder={placeholder} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">{T.sort}</span>
          <select
            className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
          >
            <option value="RAG">{T.rag}</option>
            <option value="Newest">{T.newest}</option>
            <option value="Oldest">{T.oldest}</option>
          </select>
        </div>
      </div>

      {/* Row 2: Nav + Streak/Level + Tabs (pinned) */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-2">
        <div className="flex flex-col gap-2">
          {/* Nav */}
          <div className="flex items-center gap-2">
            <NavBtn id="home" label={T.navHome} />
            <NavBtn id="library" label={T.navLibrary} />
            <NavBtn id="settings" label={T.navSettings} />
          </div>

          {/* Streak/Level */}
          {page === "home" && (
            <div className="flex items-center gap-3">
              <div className="text-xs text-zinc-400">
                🔥 {T.streak}: <span className="font-semibold">{streak?.streak ?? 0}</span>
              </div>
              <div className="text-xs text-zinc-400">
                🥇 {T.level} <span className="font-semibold">{level}</span>
              </div>
              <div className="flex-1 h-2 bg-zinc-800 rounded-md overflow-hidden">
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: `${(levelProgress / levelStep) * 100}%` }}
                />
              </div>
              <div className="text-xs text-zinc-400">
                {levelProgress} / {levelStep} XP
              </div>
            </div>
          )}

          {/* Tabs */}
          {page === "home" && (
            <div className="flex items-center gap-2 flex-wrap">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={
                    "px-3 py-1.5 rounded-full text-sm border transition-colors " +
                    (tab === t
                      ? "bg-emerald-600 border-emerald-600"
                      : "bg-zinc-900 border-zinc-800")
                  }
                >
                  {t === "Phrases"
                    ? T.phrases
                    : t === "Questions"
                    ? T.questions
                    : t === "Words"
                    ? T.words
                    : T.numbers}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    hostRef.current
  );
}

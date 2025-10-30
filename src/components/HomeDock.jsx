import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * A fixed bar under SearchDock that holds:
 * - Streak/Level/XP progress
 * - Sheet tabs (Phrases / Questions / Words / Numbers)
 */
export default function HomeDock({
  T,
  offsetTop = 56 + 56, // header + search
  LEVEL_STEP,
  level,
  levelProgress,
  streak,
  rows,
  qNorm,
  tab,
  setTab,
  cn,
}) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = document.createElement("div");
    host.setAttribute("id", "home-dock-host");
    host.style.position = "fixed";
    host.style.top = `${offsetTop}px`;
    host.style.left = "0";
    host.style.right = "0";
    host.style.zIndex = "9998";
    host.style.transform = "translateZ(0)";
    hostRef.current = host;
    document.body.appendChild(host);
    return () => { try { document.body.removeChild(host); } catch {} };
  }, [offsetTop]);

  if (!hostRef.current) return null;

  const hitsFor = (sheet) => {
    if (!qNorm) return 0;
    const q = qNorm.toLowerCase();
    return rows
      .filter(r =>
        (r.English || "").toLowerCase().includes(q) ||
        (r.Lithuanian || "").toLowerCase().includes(q)
      )
      .filter(r => r.Sheet === sheet).length;
  };

  return createPortal(
    <div className="bg-zinc-950/95 backdrop-blur"
         style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2">
        {/* Streak / Level */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-zinc-400">
            🔥 {T.streak}: <span className="font-semibold">{streak.streak}</span>
          </div>
          <div className="text-xs text-zinc-400">
            🥇 {T.level} <span className="font-semibold">{level}</span>
          </div>
          <div className="flex-1 h-2 bg-zinc-800 rounded-md overflow-hidden">
            <div className="h-full bg-emerald-600"
                 style={{ width: `${(levelProgress / LEVEL_STEP) * 100}%` }} />
          </div>
          <div className="text-xs text-zinc-400">
            {levelProgress} / {LEVEL_STEP} XP
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {["Phrases", "Questions", "Words", "Numbers"].map((t) => {
            const hits = hitsFor(t);
            const searching = !!qNorm;
            const isActive = tab === t;
            const base = "relative px-3 py-1.5 rounded-full text-sm border transition-colors";
            const normal = isActive ? "bg-emerald-600 border-emerald-600"
                                    : "bg-zinc-900 border-zinc-800";
            const highlighted = hits > 0
              ? "ring-2 ring-emerald-500 ring-offset-0"
              : searching ? "opacity-60" : "";
            return (
              <button key={t}
                      onClick={() => setTab(t)}
                      className={cn(base, normal, highlighted)}
                      title={hits ? `${hits} match${hits === 1 ? "" : "es"}` : undefined}>
                {t === "Phrases" ? T.phrases : t === "Questions" ? T.questions : t === "Words" ? T.words : T.numbers}
                {hits > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 text-xs rounded-full bg-emerald-700 px-1">
                    {hits}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    hostRef.current
  );
}

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * SearchDock
 * - Portals a fixed search/sort bar under the header.
 * - Accepts `offsetTop` so it never overlaps the header.
 * - IMPORTANT: No global focus-preventers here; let forms be focusable.
 */
export default function SearchDock({
  SearchBox,
  sortMode,
  setSortMode,
  placeholder = "Search…",
  T,
  offsetTop = 56, // height of your header on small screens; tweak as needed
}) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = document.createElement("div");
    host.setAttribute("id", "search-dock-host");
    host.style.position = "fixed";
    host.style.top = `${offsetTop}px`; // sit under the header
    host.style.left = "0";
    host.style.right = "0";
    host.style.zIndex = "9999";
    host.style.transform = "translateZ(0)";
    hostRef.current = host;
    document.body.appendChild(host);

    return () => {
      try {
        document.body.removeChild(host);
      } catch {}
    };
  }, [offsetTop]);

  if (!hostRef.current) return null;

  return createPortal(
    <div
      className="bg-zinc-950/95 backdrop-blur"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
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
    </div>,
    hostRef.current
  );
}

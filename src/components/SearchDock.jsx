import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// You already have this SearchBox in App.jsx; if you prefer, move it to its own file and import.
// For now we’ll accept it via props so we don’t duplicate code.

export default function SearchDock({ SearchBox, sortMode, setSortMode, placeholder = "Search…", T }) {
  const hostRef = useRef(null);

  // Create a host element on mount
  useEffect(() => {
    const host = document.createElement("div");
    host.setAttribute("id", "search-dock-host");
    // High z-index, fixed layout, full width
    host.style.position = "fixed";
    host.style.top = "0";
    host.style.left = "0";
    host.style.right = "0";
    host.style.zIndex = "9999";
    host.style.transform = "translateZ(0)"; // own compositing layer on mobile
    hostRef.current = host;
    document.body.appendChild(host);
    return () => {
      try { document.body.removeChild(host); } catch {}
    };
  }, []);

  if (!hostRef.current) return null;

  return createPortal(
    <div
      className="bg-zinc-950/95 backdrop-blur"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      onPointerDown={(e) => {
        // Prevent non-form clicks from stealing focus
        const tag = (e.target.tagName || "").toLowerCase();
        const formy = tag === "input" || tag === "button" || tag === "select" || tag === "label" || tag === "textarea";
        if (!formy) e.preventDefault();
      }}
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

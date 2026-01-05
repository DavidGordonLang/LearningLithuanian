// src/components/ChangeLogModal.jsx
import React, { useEffect, useState } from "react";

export default function ChangeLogModal({ onClose }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadFile() {
      try {
        const res = await fetch("/data/changelog.json", { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        setEntries(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Failed to load changelog:", err);
        if (!alive) return;
        setEntries([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    loadFile();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        bg-black/70 backdrop-blur-sm
        px-4
        pt-[calc(env(safe-area-inset-top)+12px)]
        pb-[calc(env(safe-area-inset-bottom)+12px)]
        flex items-start justify-center
      "
      onPointerDown={onClose}
    >
      {/* ALWAYS-VISIBLE CLOSE (above everything) */}
      <button
        type="button"
        aria-label="Close changelog"
        className="
          fixed z-[10000]
          top-[calc(env(safe-area-inset-top)+10px)]
          right-[calc(env(safe-area-inset-right)+10px)]
          w-10 h-10
          rounded-full
          bg-zinc-900 border border-zinc-700
          text-zinc-200
          flex items-center justify-center
          shadow-lg
          hover:bg-zinc-800 active:bg-zinc-700
          select-none
        "
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onClose}
      >
        ✕
      </button>

      <div
        className="
          w-full max-w-2xl
          bg-zinc-900
          border border-zinc-800
          rounded-2xl
          shadow-[0_0_24px_rgba(0,0,0,0.55)]
          overflow-hidden
          flex flex-col
        "
        style={{
          maxHeight:
            "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 24px)",
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* HEADER (should be visible, but we also have the fixed ✕ as a fallback) */}
        <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center justify-between px-5 py-4 pr-16">
            <h2 className="text-lg sm:text-xl font-bold">Change Log</h2>

            <button
              type="button"
              className="
                bg-zinc-800 text-zinc-200 rounded-full
                px-4 py-1.5 text-sm font-medium
                hover:bg-zinc-700 active:bg-zinc-600
                select-none
              "
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && <div className="text-sm text-zinc-400">Loading…</div>}

          {!loading && entries.length === 0 && (
            <div className="text-sm text-zinc-400">
              No changelog entries found.
            </div>
          )}

          {!loading && entries.length > 0 && (
            <div className="space-y-6">
              {entries.map((entry, index) => (
                <section
                  key={index}
                  className="
                    bg-zinc-950
                    border border-zinc-800
                    rounded-2xl
                    p-4
                  "
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base sm:text-lg font-semibold">
                      {entry.version}
                    </h3>
                    <span className="text-xs text-zinc-400">{entry.date}</span>
                  </div>

                  <ul className="list-disc list-inside space-y-1 text-sm text-zinc-200">
                    {(entry.changes || []).map((change, idx) => (
                      <li key={idx}>{change}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

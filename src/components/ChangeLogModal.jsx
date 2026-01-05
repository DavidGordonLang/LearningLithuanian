// src/components/ChangeLogModal.jsx
import React, { useEffect, useState } from "react";

export default function ChangeLogModal({ onClose }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFile() {
      try {
        const res = await fetch("/data/changelog.json");
        const json = await res.json();
        setEntries(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Failed to load changelog:", err);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    loadFile();
  }, []);

  return (
    <div
      className="
        fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm
        flex items-center justify-center
        px-4
        pt-[calc(env(safe-area-inset-top)+16px)]
        pb-[calc(env(safe-area-inset-bottom)+16px)]
      "
      onPointerDown={onClose}
    >
      <div
        className="
          w-full max-w-2xl
          bg-zinc-900/98 border border-zinc-800
          rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.35)]
          overflow-hidden
          flex flex-col
        "
        style={{
          maxHeight:
            "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 32px)",
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* HEADER (always visible) */}
        <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/98 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-xl font-bold">Change Log</h2>

            <button
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

        {/* BODY (scrollable) */}
        <div className="flex-1 overflow-y-auto p-5">
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
                    bg-zinc-950/60 border border-zinc-800
                    rounded-2xl p-4 shadow-sm
                  "
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{entry.version}</h3>
                    <span className="text-xs text-zinc-400">{entry.date}</span>
                  </div>

                  <ul className="list-disc list-inside space-y-1 text-sm text-zinc-300">
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

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
        setEntries(json);
      } catch (err) {
        console.error("Failed to load changelog:", err);
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
        flex items-start justify-center
        px-4 pb-6
        pt-[calc(env(safe-area-inset-top)+24px)]
      "
      onPointerDown={onClose}
    >
      <div
        className="
          w-full max-w-2xl
          max-h-[85vh] overflow-y-auto
          bg-zinc-900/95 border border-zinc-800
          rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)]
          p-5
        "
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-zinc-900/95 pb-2 pt-1">
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

        {/* LOADING */}
        {loading && (
          <div className="text-sm text-zinc-400">Loading…</div>
        )}

        {/* NO ENTRIES */}
        {!loading && entries.length === 0 && (
          <div className="text-sm text-zinc-400">
            No changelog entries found.
          </div>
        )}

        {/* ENTRIES */}
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
                  {entry.changes.map((change, idx) => (
                    <li key={idx}>{change}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
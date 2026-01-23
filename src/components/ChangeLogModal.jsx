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
        flex items-start justify-center
        px-4
        pt-[calc(env(safe-area-inset-top)+12px)]
        pb-[calc(env(safe-area-inset-bottom)+12px)]
      "
      onPointerDown={onClose}
    >
      {/* Floating close button (always visible) */}
      <button
        type="button"
        aria-label="Close changelog"
        data-press
        className="
          fixed z-[10000]
          w-10 h-10 rounded-2xl
          bg-zinc-950/60 border border-white/10
          text-zinc-200
          flex items-center justify-center
          shadow-[0_12px_40px_rgba(0,0,0,0.45)]
          hover:bg-white/5 active:bg-white/10
          select-none
        "
        style={{
          top: "calc(env(safe-area-inset-top) + 10px)",
          right: "calc(env(safe-area-inset-right) + 10px)",
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onClose}
      >
        ✕
      </button>

      <div
        className="w-full max-w-2xl z-card overflow-hidden flex flex-col"
        style={{
          maxHeight:
            "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 24px)",
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* HEADER (sticky) */}
        <div className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/55 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4 pr-16">
            <div>
              <h2 className="z-title">Change Log</h2>
              <div className="z-subtitle mt-0.5">Recent updates and fixes.</div>
            </div>

            <button
              type="button"
              data-press
              className="z-btn z-btn-quiet px-4 py-2 rounded-xl"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        {/* BODY (scrolls) */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && <div className="text-sm text-zinc-400">Loading…</div>}

          {!loading && entries.length === 0 && (
            <div className="text-sm text-zinc-400">
              No changelog entries found.
            </div>
          )}

          {!loading && entries.length > 0 && (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <section key={index} className="z-inset p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="text-[15px] sm:text-[16px] font-semibold text-zinc-100">
                        {entry.version}
                      </h3>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {entry.date}
                      </div>
                    </div>
                  </div>

                  <ul className="list-disc list-inside space-y-1.5 text-sm text-zinc-200">
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

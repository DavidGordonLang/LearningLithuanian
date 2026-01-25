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
        bg-black/60 backdrop-blur-sm
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
        className="z-btn z-btn-secondary !w-10 !h-10 !p-0 !rounded-full"
        style={{
          position: "fixed",
          zIndex: 10000,
          top: "calc(env(safe-area-inset-top) + 10px)",
          right: "calc(env(safe-area-inset-right) + 10px)",
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onClose}
        data-press
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
        <div className="sticky top-0 z-10 z-inset border-b border-white/10">
          <div className="flex items-center justify-between px-5 py-4 pr-16">
            <div className="min-w-0">
              <h2 className="z-title text-[18px] sm:text-[20px]">Change Log</h2>
              <div className="z-helper mt-0.5">
                {loading
                  ? "Loading…"
                  : entries.length
                  ? `${entries.length} release${entries.length === 1 ? "" : "s"}`
                  : " "}
              </div>
            </div>

            <button
              type="button"
              className="z-btn z-btn-secondary px-4 py-2 text-[13px]"
              onClick={onClose}
              data-press
            >
              Close
            </button>
          </div>
        </div>

        {/* BODY (scrolls) */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && <div className="z-subtitle">Loading…</div>}

          {!loading && entries.length === 0 && (
            <div className="z-subtitle">No changelog entries found.</div>
          )}

          {!loading && entries.length > 0 && (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <section key={index} className="z-inset px-4 py-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-[14px] sm:text-[15px] font-semibold text-zinc-100">
                      {entry.version}
                    </h3>
                    <span className="text-xs text-zinc-500">{entry.date}</span>
                  </div>

                  <ul className="list-disc list-inside space-y-1 text-[13px] sm:text-[14px] text-zinc-200">
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

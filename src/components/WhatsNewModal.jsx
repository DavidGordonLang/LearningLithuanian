// src/components/WhatsNewModal.jsx
import React, { useEffect, useState } from "react";

export default function WhatsNewModal({
  version,
  topOffset = 0,
  onClose,
  onViewChangelog,
}) {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch("/data/changelog.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load changelog");

        const list = await res.json();
        if (!alive || !Array.isArray(list)) return;

        const match = list.find((e) => e?.version === version);
        setEntry(match || list[0] || null);
      } catch {
        if (alive) setEntry(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [version]);

  const changes = Array.isArray(entry?.changes) ? entry.changes : [];
  const date = entry?.date || null;

  const padTop = topOffset ? topOffset + 16 : 16;

  return (
    <div
      className="
        fixed inset-0 z-[210]
        bg-black/60 backdrop-blur-sm
        flex items-center justify-center p-4
      "
      style={{ paddingTop: padTop }}
      onPointerDown={onClose}
    >
      <div
        className="
          w-full max-w-md
          max-h-[80vh] overflow-y-auto
          z-card
          p-5
        "
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <h2 className="z-title">What’s New</h2>
            <div className="text-xs text-zinc-400 mt-0.5">
              App Version: {version}
              {date && <span className="text-zinc-500"> • {date}</span>}
            </div>
          </div>

          <button
            type="button"
            data-press
            className="z-btn z-btn-quiet px-3 py-2 rounded-xl text-xs"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <p className="text-sm text-zinc-300 mb-3">
          Here’s what changed in the latest update:
        </p>

        {loading ? (
          <div className="text-sm text-zinc-400 mb-4">Loading…</div>
        ) : changes.length > 0 ? (
          <div className="z-inset p-4 mb-4">
            <ul className="list-disc list-inside space-y-1.5 text-sm text-zinc-300">
              {changes.slice(0, 8).map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-sm text-zinc-400 mb-4">
            No release notes available for this version.
          </div>
        )}

        <div className="flex gap-3 justify-end flex-wrap">
          <button
            type="button"
            data-press
            className="z-btn z-btn-secondary px-4 py-2 rounded-2xl text-sm"
            onClick={onClose}
          >
            OK
          </button>

          <button
            type="button"
            data-press
            className="
              z-btn px-4 py-2 rounded-2xl text-sm
              bg-emerald-600/90 hover:bg-emerald-500
              border border-emerald-300/20
              text-black font-semibold
            "
            onClick={onViewChangelog}
          >
            View full changelog
          </button>
        </div>
      </div>
    </div>
  );
}

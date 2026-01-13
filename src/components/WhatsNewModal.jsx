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

  return (
    <div
      className="
        fixed inset-0 z-[210] bg-black/60 backdrop-blur-sm
        flex justify-center p-4
      "
      style={{ paddingTop: topOffset ? topOffset + 16 : 16 }}
      onPointerDown={onClose}
    >
      <div
        className="
          w-full max-w-md max-h-[80vh] overflow-y-auto
          bg-zinc-900 border border-zinc-800
          rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)]
          p-5
        "
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-xl font-bold">What’s New</h2>
            <div className="text-xs text-zinc-400 mt-0.5">
              App Version: {version}
              {date && <span className="text-zinc-500"> • {date}</span>}
            </div>
          </div>

          <button
            type="button"
            className="
              bg-zinc-800 text-zinc-200 rounded-full
              px-3 py-1 text-xs font-medium
              hover:bg-zinc-700 active:bg-zinc-600
              select-none
            "
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
          <ul className="list-disc list-inside space-y-1 text-sm text-zinc-300 mb-4">
            {changes.slice(0, 8).map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-zinc-400 mb-4">
            No release notes available for this version.
          </div>
        )}

        <div className="flex gap-3 justify-end flex-wrap">
          <button
            type="button"
            className="
              bg-zinc-800 text-zinc-200 rounded-full
              px-4 py-2 text-sm font-medium
              hover:bg-zinc-700 active:bg-zinc-600
              select-none
            "
            onClick={onClose}
          >
            OK
          </button>

          <button
            type="button"
            className="
              bg-emerald-500 text-black rounded-full
              px-4 py-2 text-sm font-semibold
              hover:bg-emerald-400 active:bg-emerald-300
              select-none
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

// src/components/WhatsNewModal.jsx
import React, { useMemo } from "react";
import changelog from "../data/changelog.json";

export default function WhatsNewModal({
  version,
  topOffset = 0,
  onClose,
  onViewChangelog,
}) {
  const entry = useMemo(() => {
    const list = Array.isArray(changelog) ? changelog : [];
    const match = list.find((e) => e?.version === version);
    return match || list[0] || null;
  }, [version]);

  const changes = Array.isArray(entry?.changes) ? entry.changes : [];
  const date = entry?.date ? String(entry.date) : null;

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
              {date ? <span className="text-zinc-500"> • {date}</span> : null}
            </div>
          </div>

          <button
            className="
              bg-zinc-800 text-zinc-200 rounded-full
              px-3 py-1 text-xs font-medium
              hover:bg-zinc-700 active:bg-zinc-600
              select-none
            "
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <p className="text-sm text-zinc-300 mb-3">
          Here’s what changed in the latest update:
        </p>

        {/* CHANGE LIST (current release) */}
        {changes.length > 0 ? (
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

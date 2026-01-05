// src/components/WhatsNewModal.jsx
import React from "react";

export default function WhatsNewModal({ version, onClose, onViewChangelog }) {
  return (
    <div
      className="
        fixed inset-0 z-[210] bg-black/60 backdrop-blur-sm
        flex items-center justify-center p-4
      "
      onPointerDown={onClose}
    >
      <div
        className="
          w-full max-w-md max-h-[80vh] overflow-y-auto
          bg-zinc-900/95 border border-zinc-800
          rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)]
          p-5
        "
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold">What’s New</h2>
            <div className="text-xs text-zinc-400 mt-0.5">
              App Version: {version}
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
          >
            Close
          </button>
        </div>

        <p className="text-sm text-zinc-300 mb-3">
          Here’s what changed in the latest update:
        </p>

        {/* UPDATED CHANGE LIST FOR v1.3.0-beta */}
        <ul className="list-disc list-inside space-y-1 text-sm text-zinc-300 mb-4">
          <li>
            Added deterministic phrase identity using a stable Lithuanian-only{" "}
            <b>contentKey</b> (no more duplication across devices or merges).
          </li>
          <li>
            Starter pack is now <b>truly idempotent</b>: reinstalling never
            increases entry count.
          </li>
          <li>
            Edited starter entries now cleanly convert to <b>user-owned</b>{" "}
            entries.
          </li>
          <li>
            Deletions are now <b>tombstoned</b> and never “come back” after
            reinstalling or syncing.
          </li>
          <li>
            Added a <b>safe, conflict-aware merge engine</b> that pauses if it
            detects conflicts (nothing is overwritten silently).
          </li>
          <li>
            Manual sync model is finalised with clear <b>Upload</b>,{" "}
            <b>Download</b>, and <b>Merge</b> actions.
          </li>
          <li>
            Duplicate Scanner is reliable again after identity and merge fixes.
          </li>
        </ul>

        <div className="flex gap-3 justify-end">
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

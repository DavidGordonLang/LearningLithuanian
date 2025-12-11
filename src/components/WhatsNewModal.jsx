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

        {/* UPDATED CHANGE LIST FOR v1.1.1-beta */}
        <ul className="list-disc list-inside space-y-1 text-sm text-zinc-300 mb-4">
          <li>Fixed Add/Edit modal being clipped at the top on some devices.</li>
          <li>Improved modal centering and applied safe-area padding for Android and iOS.</li>
          <li>Add/Edit modal now fully resets when switching tabs.</li>
          <li>Duplicate Scanner now scrolls to the top automatically when opened.</li>
          <li>General UI polish for smoother modal behaviour and responsiveness.</li>
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
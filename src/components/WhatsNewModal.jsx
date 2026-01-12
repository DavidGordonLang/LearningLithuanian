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
          bg-zinc-900 border border-zinc-800
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

        {/* CHANGE LIST (current release) */}
        <ul className="list-disc list-inside space-y-1 text-sm text-zinc-300 mb-4">
          <li>Swipe navigation is back: move between Home, Library, and Settings.</li>
          <li>Each tab now scrolls independently, with the header staying fixed.</li>
          <li>Page sizing/width issues have been tightened up for more reliable layouts.</li>
          <li>The header logo now acts as a Home + refresh shortcut.</li>
          <li>Removed the Žodis title text from the header for a cleaner, logo-led look.</li>
        </ul>

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

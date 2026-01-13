// src/components/DailyRecallModal.jsx
import React, { useMemo } from "react";
import { getEnglishForRecall } from "../hooks/useDailyRecall";

export default function DailyRecallModal({
  phrase,
  playText,
  onClose,
}) {
  const lt = String(phrase?.Lithuanian || "").trim();
  const phon = String(phrase?.Phonetic || "").trim();
  const en = useMemo(() => getEnglishForRecall(phrase), [phrase]);

  return (
    <div
      className="
        fixed inset-0 z-[220] bg-black/60 backdrop-blur-sm
        flex items-center justify-center p-4
      "
      onPointerDown={onClose}
    >
      <div
        className="
          w-full max-w-md
          bg-zinc-900/95 border border-zinc-800
          rounded-3xl
          shadow-[0_0_35px_rgba(0,0,0,0.55)]
          overflow-hidden
        "
        style={{
          boxShadow:
            "0 0 0 1px rgba(16,185,129,0.14), 0 0 45px rgba(16,185,129,0.18), 0 20px 60px rgba(0,0,0,0.55)",
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(16,185,129,0.15), rgba(16,185,129,0.65), rgba(16,185,129,0.15))",
          }}
        />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-xs tracking-wide text-emerald-300/90">
                Remember this?
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                A quick recall prompt from your library.
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
              OK
            </button>
          </div>

          {/* Phrase */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/35 p-4">
            <div className="text-xl font-semibold leading-snug break-words">
              {lt || "—"}
            </div>

            {phon ? (
              <div className="text-sm text-zinc-400 mt-2 break-words">
                {phon}
              </div>
            ) : null}

            <div className="mt-4 border-t border-zinc-800 pt-3">
              <div className="text-[12px] text-zinc-500 mb-1">
                English meaning
              </div>
              <div className="text-sm text-zinc-200 break-words">
                {en || "—"}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap pt-5">
            <button
              type="button"
              className="
                bg-emerald-500 text-black rounded-full
                px-5 py-2 text-[16px] shadow
                hover:bg-emerald-400 active:bg-emerald-300
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={() => lt && playText?.(lt)}
              disabled={!lt}
            >
              ▶ Normal
            </button>

            <button
              type="button"
              className="
                bg-emerald-700 text-black rounded-full
                px-5 py-2 text-[16px] shadow
                hover:bg-emerald-600 active:bg-emerald-500
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={() => lt && playText?.(lt, { slow: true })}
              disabled={!lt}
            >
              🐢 Slow
            </button>
          </div>

          {/* Subtle footer */}
          <div className="text-[11px] text-zinc-500 mt-5">
            Tip: You can turn this off in Settings.
          </div>
        </div>
      </div>
    </div>
  );
}

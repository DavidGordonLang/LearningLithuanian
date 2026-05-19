// src/components/DailyRecallModal.jsx
import React, { useMemo } from "react";
import { getEnglishForRecall } from "../hooks/useDailyRecall";
import ModalShell from "./ModalShell";

export default function DailyRecallModal({
  phrase,
  playText,
  onClose,
}) {
  const lt = String(phrase?.Lithuanian || "").trim();
  const phon = String(phrase?.Phonetic || "").trim();
  const en = useMemo(() => getEnglishForRecall(phrase), [phrase]);

  return (
    <ModalShell
      open
      title="Remember this?"
      subtitle="A quick recall prompt from your library."
      onClose={onClose}
      closeOnBackdrop
      closeOnEscape
      maxWidth="max-w-md"
      zIndex="z-[220]"
      titleClassName="z-title text-[18px]"
      subtitleClassName="text-[12px] text-zinc-500 mt-1"
      headerAction={
        <button
          type="button"
          data-press
          className="z-btn z-btn-secondary px-4 py-2 text-[13px]"
          onClick={onClose}
        >
          OK
        </button>
      }
    >
      <div className="p-5 space-y-5">
        <div className="z-inset p-4">
          <div className="text-xl font-semibold leading-snug break-words">
            {lt || "—"}
          </div>

          {phon ? (
            <div className="text-sm text-zinc-400 mt-2 break-words">
              {phon}
            </div>
          ) : null}

          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="text-[12px] text-zinc-500 mb-1">
              English meaning
            </div>
            <div className="text-sm text-zinc-200 break-words">
              {en || "—"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            data-press
            className="
              z-btn px-4 py-2.5 rounded-2xl text-sm font-semibold
              bg-emerald-600/90 hover:bg-emerald-500
              border border-emerald-300/20 text-black
              disabled:opacity-50 disabled:pointer-events-none
            "
            onClick={() => lt && playText?.(lt)}
            disabled={!lt}
            aria-label="Play daily recall phrase"
          >
            <span className="inline-flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M3.25 2.25L12.25 7.5L3.25 12.75V2.25Z" fill="currentColor" />
              </svg>
              Normal
            </span>
          </button>

          <button
            type="button"
            data-press
            className="
              z-btn z-btn-secondary px-4 py-2.5 rounded-2xl text-sm font-semibold
              disabled:opacity-50 disabled:pointer-events-none
            "
            onClick={() => lt && playText?.(lt, { slow: true })}
            disabled={!lt}
            aria-label="Play daily recall phrase slowly"
          >
            <span className="inline-flex items-center gap-2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 5L6 9l5 4V5Z" />
                <path d="M18 5l-5 4 5 4V5Z" />
                <path d="M6 19h12" />
              </svg>
              Slow
            </span>
          </button>
        </div>

        <div className="text-[11px] text-zinc-500">
          Tip: You can turn this off in Settings.
        </div>
      </div>
    </ModalShell>
  );
}

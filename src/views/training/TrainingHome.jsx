// src/views/training/TrainingHome.jsx
import React, { useMemo } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function FocusPill({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-full border px-2.5 py-2 transition select-none",
        "text-[12px] leading-none font-medium",
        "flex items-center justify-center gap-1.5",
        active
          ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-200"
          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.06]"
      )}
      onClick={onClick}
    >
      <span className="truncate">{label}</span>
      <span
        className={cn(
          "shrink-0 rounded-full px-1.5 py-0.5 text-[11px] leading-none",
          active ? "bg-emerald-400/20 text-emerald-100" : "bg-white/[0.06] text-zinc-300"
        )}
      >
        {count}
      </span>
    </button>
  );
}

export default function TrainingHome({
  T,
  focus,
  setFocus,
  counts,
  eligibleCount,
  onStartRecallFlip,
  onStartBlindRecall,
  onStartMatchPairs,
}) {
  const minNeeded = 5;
  const tooFew = useMemo(() => eligibleCount < minNeeded, [eligibleCount]);

  const focusLabel =
    focus === "phrases"
      ? "Phrases"
      : focus === "words"
      ? "Words"
      : focus === "numbers"
      ? "Numbers"
      : "All";

  const wordsNumbersCount = (counts?.words || 0) + (counts?.numbers || 0);
  const matchPairsDisabled = wordsNumbersCount < 10;

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Header */}
      <div>
        <div className="text-xl font-semibold">{T?.navTraining || "Training"}</div>
        <div className="text-sm text-zinc-400 mt-1">
          Practise what you’ve saved. Calm, consistent, and on your terms.
        </div>
      </div>

      {/* Focus pills (single row, no scroll) */}
      <div className="mt-5">
        <div className="grid grid-cols-4 gap-2">
          <FocusPill
            active={focus === "phrases"}
            label="Phrases"
            count={counts?.phrases ?? 0}
            onClick={() => setFocus("phrases")}
          />
          <FocusPill
            active={focus === "words"}
            label="Words"
            count={counts?.words ?? 0}
            onClick={() => setFocus("words")}
          />
          <FocusPill
            active={focus === "numbers"}
            label="Numbers"
            count={counts?.numbers ?? 0}
            onClick={() => setFocus("numbers")}
          />
          <FocusPill
            active={focus === "all"}
            label="All"
            count={counts?.all ?? 0}
            onClick={() => setFocus("all")}
          />
        </div>

        {tooFew && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm font-medium text-zinc-100">Not enough entries</div>
            <div className="text-xs text-zinc-400 mt-1">
              You’ve only got {eligibleCount} in <b>{focusLabel}</b>. Add a few more, or switch
              focus.
            </div>
          </div>
        )}
      </div>

      {/* Modules */}
      <div className="mt-7">
        <div className="text-xs uppercase tracking-wide text-zinc-500">Modules</div>
        <div className="text-xs text-zinc-400 mt-1">
          Start with recall, then reinforce through repetition.
        </div>

        <div className="mt-3 space-y-3">
          <button
            type="button"
            className={cn(
              "w-full rounded-2xl border px-4 py-4 text-left transition",
              tooFew
                ? "border-white/10 bg-white/[0.03] opacity-60 cursor-not-allowed"
                : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
            )}
            onClick={() => {
              if (tooFew) return;
              onStartRecallFlip();
            }}
            disabled={tooFew}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold">Recognise</div>
                <div className="text-sm text-zinc-300 mt-1">
                  Reveal-based recall. Self-grade and move on.
                </div>
              </div>
              <div className="text-sm text-zinc-400">→</div>
            </div>
          </button>

          <button
            type="button"
            className={cn(
              "w-full rounded-2xl border px-4 py-4 text-left transition",
              tooFew
                ? "border-white/10 bg-white/[0.03] opacity-60 cursor-not-allowed"
                : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
            )}
            onClick={() => {
              if (tooFew) return;
              onStartBlindRecall?.();
            }}
            disabled={tooFew}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold">Produce</div>
                <div className="text-sm text-zinc-300 mt-1">
                  Produce Lithuanian first, then reveal.
                </div>
              </div>
              <div className="text-sm text-zinc-400">→</div>
            </div>
          </button>

          <button
            type="button"
            className={cn(
              "w-full rounded-2xl border px-4 py-4 text-left transition",
              matchPairsDisabled
                ? "border-white/10 bg-white/[0.03] opacity-60 cursor-not-allowed"
                : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
            )}
            onClick={() => {
              if (matchPairsDisabled) return;
              onStartMatchPairs?.();
            }}
            disabled={matchPairsDisabled}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold">Reinforce</div>
                <div className="text-sm text-zinc-300 mt-1">
                  Match English and Lithuanian pairs.
                </div>
                {matchPairsDisabled && (
                  <div className="text-xs text-zinc-500 mt-2">
                    Add at least <b>10</b> words/numbers to unlock (you have {wordsNumbersCount}).
                  </div>
                )}
              </div>
              <div className="text-sm text-zinc-400">→</div>
            </div>
          </button>
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}

// src/views/training/TrainingHome.jsx
import React, { useMemo } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function FocusPill({ active, label, sub, onClick }) {
  return (
    <button
      type="button"
      className={cn(
        "w-full text-left rounded-2xl border px-4 py-3 transition select-none",
        active
          ? "border-emerald-500/60 bg-emerald-500/10"
          : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950/60"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-zinc-400">{sub}</div>
      </div>
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
      <div>
        <div className="text-xl font-semibold">{T?.navTraining || "Training"}</div>
        <div className="text-sm text-zinc-400 mt-1">
          Practise what you’ve saved. Calm, consistent, and on your terms.
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold">Focus</div>
        <div className="text-xs text-zinc-400 mt-1">
          Choose what kind of entries you want in your sessions.
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <FocusPill
            active={focus === "phrases"}
            label="Phrases"
            sub={`${counts.phrases}`}
            onClick={() => setFocus("phrases")}
          />
          <FocusPill
            active={focus === "words"}
            label="Words"
            sub={`${counts.words}`}
            onClick={() => setFocus("words")}
          />
          <FocusPill
            active={focus === "numbers"}
            label="Numbers"
            sub={`${counts.numbers}`}
            onClick={() => setFocus("numbers")}
          />
          <FocusPill
            active={focus === "all"}
            label="All"
            sub={`${counts.all}`}
            onClick={() => setFocus("all")}
          />
        </div>

        {tooFew && (
          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div className="text-sm font-medium">Not enough entries</div>
            <div className="text-xs text-zinc-400 mt-1">
              You’ve only got {eligibleCount} in <b>{focusLabel}</b>. Add a few more, or switch
              focus.
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="text-sm font-semibold">Tools</div>
        <div className="text-xs text-zinc-400 mt-1">
          Build recall, then reinforce through repetition.
        </div>

        <div className="mt-3 space-y-3">
          <button
            type="button"
            className={cn(
              "w-full rounded-2xl border px-4 py-4 text-left transition",
              tooFew
                ? "border-zinc-800 bg-zinc-950/30 opacity-60 cursor-not-allowed"
                : "border-zinc-800 bg-zinc-950/50 hover:bg-zinc-950/70"
            )}
            onClick={() => {
              if (tooFew) return;
              onStartRecallFlip();
            }}
            disabled={tooFew}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold">Recall Flip</div>
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
                ? "border-zinc-800 bg-zinc-950/30 opacity-60 cursor-not-allowed"
                : "border-zinc-800 bg-zinc-950/50 hover:bg-zinc-950/70"
            )}
            onClick={() => {
              if (tooFew) return;
              onStartBlindRecall?.();
            }}
            disabled={tooFew}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold">Blind Recall</div>
                <div className="text-sm text-zinc-300 mt-1">
                  Produce Lithuanian first. Type or hold-to-speak, then reveal.
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
                ? "border-zinc-800 bg-zinc-950/30 opacity-60 cursor-not-allowed"
                : "border-zinc-800 bg-zinc-950/50 hover:bg-zinc-950/70"
            )}
            onClick={() => {
              if (matchPairsDisabled) return;
              onStartMatchPairs?.();
            }}
            disabled={matchPairsDisabled}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold">Match Pairs</div>
                <div className="text-sm text-zinc-300 mt-1">
                  Words & numbers only. Tap two tiles to match EN ↔ LT.
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

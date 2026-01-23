// src/views/training/TrainingHome.jsx
import React, { useMemo } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function FocusPill({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      className={cn(
        `
        flex-1 rounded-full px-4 py-2
        text-sm font-medium
        transition
        border
        `,
        active
          ? `
            bg-emerald-500/15
            border-emerald-400/40
            text-emerald-200
            shadow-[0_0_20px_rgba(16,185,129,0.25)]
          `
          : `
            bg-zinc-950/40
            border-white/10
            text-zinc-400
            hover:text-zinc-200
            hover:bg-white/[0.04]
          `
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <span className="text-xs opacity-70">{count}</span>
      </div>
    </button>
  );
}

function ModuleCard({ title, description, icon, disabled, onClick }) {
  return (
    <button
      type="button"
      data-press
      disabled={disabled}
      onClick={onClick}
      className={cn(
        `
        w-full text-left
        rounded-2xl p-4
        border
        transition
        `,
        disabled
          ? `
            bg-zinc-950/30
            border-white/5
            text-zinc-500
            opacity-60
            cursor-not-allowed
          `
          : `
            bg-zinc-950/55
            border-white/10
            hover:bg-white/[0.04]
          `
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className="
            w-10 h-10 rounded-xl
            flex items-center justify-center
            bg-white/[0.06]
            text-lg
            shrink-0
          "
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-zinc-100">
            {title}
          </div>
          <div className="text-sm text-zinc-400 mt-0.5">
            {description}
          </div>
        </div>

        <div className="text-zinc-500">→</div>
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

  const wordsNumbersCount = (counts?.words || 0) + (counts?.numbers || 0);
  const matchPairsDisabled = wordsNumbersCount < 10;

  return (
    <div className="z-page z-page-y pb-28">
      {/* Header */}
      <div>
        <div className="z-title">{T?.navTraining || "Training"}</div>
        <div className="z-subtitle mt-1">
          Practise what you’ve saved. Calm, consistent, and on your terms.
        </div>
      </div>

      {/* Focus */}
      <div className="mt-6 z-card p-4 sm:p-5">
        <div className="z-section-title mb-2">Focus</div>
        <div className="text-sm text-zinc-400 mb-3">
          Choose what kind of entries you want in your sessions.
        </div>

        <div className="flex gap-2">
          <FocusPill
            active={focus === "phrases"}
            label="Phrases"
            count={counts.phrases}
            onClick={() => setFocus("phrases")}
          />
          <FocusPill
            active={focus === "words"}
            label="Words"
            count={counts.words}
            onClick={() => setFocus("words")}
          />
          <FocusPill
            active={focus === "numbers"}
            label="Numbers"
            count={counts.numbers}
            onClick={() => setFocus("numbers")}
          />
          <FocusPill
            active={focus === "all"}
            label="All"
            count={counts.all}
            onClick={() => setFocus("all")}
          />
        </div>

        {tooFew && (
          <div className="mt-4 z-inset p-4">
            <div className="text-sm font-medium text-zinc-200">
              Not enough entries
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Add a few more entries or switch focus to begin training.
            </div>
          </div>
        )}
      </div>

      {/* Modules */}
      <div className="mt-6">
        <div className="z-section-title mb-2">Modules</div>
        <div className="text-sm text-zinc-400 mb-3">
          Start with recall, then reinforce through repetition.
        </div>

        <div className="space-y-3">
          <ModuleCard
            icon="🧠"
            title="Recognise"
            description="Reveal-based recall. Self-grade and move on."
            disabled={tooFew}
            onClick={() => {
              if (!tooFew) onStartRecallFlip();
            }}
          />

          <ModuleCard
            icon="⌨️"
            title="Produce"
            description="Produce Lithuanian first, then reveal."
            disabled={tooFew}
            onClick={() => {
              if (!tooFew) onStartBlindRecall?.();
            }}
          />

          <ModuleCard
            icon="🧩"
            title="Reinforce"
            description="Match English and Lithuanian pairs."
            disabled={matchPairsDisabled}
            onClick={() => {
              if (!matchPairsDisabled) onStartMatchPairs?.();
            }}
          />

          {matchPairsDisabled && (
            <div className="text-xs text-zinc-500 mt-2">
              Add at least <b>10</b> words or numbers to unlock Reinforce.
            </div>
          )}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}

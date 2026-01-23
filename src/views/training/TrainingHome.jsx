// src/views/training/TrainingHome.jsx
import React from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function FocusPillRow({ focus, setFocus }) {
  const items = [
    { key: "phrases", label: "Phrases" },
    { key: "words", label: "Words" },
    { key: "numbers", label: "Numbers" },
    { key: "all", label: "All" },
  ];

  return (
    <div
      className="
        w-full
        rounded-2xl
        border border-white/10
        bg-black/20
        backdrop-blur
        shadow-[0_0_24px_rgba(0,0,0,0.18)]
        p-1
      "
    >
      <div className="flex w-full gap-1">
        {items.map((it) => {
          const active = focus === it.key;
          return (
            <button
              key={it.key}
              type="button"
              data-press
              onClick={() => setFocus?.(it.key)}
              className={cn(
                "flex-1 rounded-xl px-2.5 py-2",
                "text-[12px] font-medium tracking-tight",
                "transition-colors select-none",
                "whitespace-nowrap", // labels must not wrap/truncate
                active
                  ? "bg-emerald-500/20 border border-emerald-400/35 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.18)]"
                  : "bg-white/[0.03] border border-white/0 text-zinc-300 hover:bg-white/[0.05]"
              )}
            >
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ModuleCard({ title, desc, icon, onClick, disabled, hint }) {
  return (
    <button
      type="button"
      data-press
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
      disabled={disabled}
      className={cn(
        "w-full text-left rounded-2xl border px-4 py-4 transition",
        "bg-black/20 backdrop-blur",
        disabled
          ? "border-white/8 opacity-55 cursor-not-allowed"
          : "border-white/10 hover:border-white/15 hover:bg-black/25"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="
            h-10 w-10 rounded-xl
            bg-white/[0.04] border border-white/10
            flex items-center justify-center
            shrink-0
          "
          aria-hidden="true"
        >
          <span className="text-[18px]">{icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="text-[15px] font-semibold text-zinc-100">
              {title}
            </div>
            <div className="text-sm text-zinc-500">→</div>
          </div>
          <div className="text-[13px] text-zinc-300 mt-1 leading-snug">
            {desc}
          </div>

          {hint ? (
            <div className="text-[12px] text-zinc-500 mt-2 leading-snug">
              {hint}
            </div>
          ) : null}
        </div>
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
  const tooFew = (eligibleCount || 0) < minNeeded;

  const wordsNumbersCount = (counts?.words || 0) + (counts?.numbers || 0);
  const matchPairsDisabled = wordsNumbersCount < 10;

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
      {/* Title */}
      <div>
        <div className="text-xl font-semibold text-zinc-100">
          {T?.navTraining || "Training"}
        </div>
        <div className="text-sm text-zinc-400 mt-1">
          Practise what you’ve saved. Calm, consistent, and on your terms.
        </div>
      </div>

      {/* Focus pills (single row, no counts, no truncation) */}
      <div className="mt-4">
        <FocusPillRow focus={focus} setFocus={setFocus} />
      </div>

      {/* Modules */}
      <div className="mt-5">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">
          Modules
        </div>
        <div className="text-xs text-zinc-400 mt-1">
          Start with recall, then reinforce through repetition.
        </div>

        <div className="mt-3 space-y-3">
          <ModuleCard
            title="Recognise"
            desc="Reveal-based recall. Self-grade and move on."
            icon="🧠"
            disabled={tooFew}
            onClick={onStartRecallFlip}
            hint={
              tooFew
                ? `Add a few more entries to unlock (need ${minNeeded}).`
                : null
            }
          />

          <ModuleCard
            title="Produce"
            desc="Produce Lithuanian first, then reveal."
            icon="⌨️"
            disabled={tooFew}
            onClick={onStartBlindRecall}
            hint={
              tooFew
                ? `Add a few more entries to unlock (need ${minNeeded}).`
                : null
            }
          />

          <ModuleCard
            title="Reinforce"
            desc="Match English and Lithuanian pairs."
            icon="🧩"
            disabled={matchPairsDisabled}
            onClick={onStartMatchPairs}
            hint={
              matchPairsDisabled
                ? `Add at least 10 words/numbers to unlock (you have ${wordsNumbersCount}).`
                : null
            }
          />
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}

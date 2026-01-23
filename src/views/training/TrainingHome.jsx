// src/views/training/TrainingHome.jsx
import React, { useMemo } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function SegmentedFocus({ value, onChange, counts }) {
  const items = [
    { key: "phrases", label: "Phrases", count: counts?.phrases ?? 0 },
    { key: "words", label: "Words", count: counts?.words ?? 0 },
    { key: "numbers", label: "Numbers", count: counts?.numbers ?? 0 },
    { key: "all", label: "All", count: counts?.all ?? 0 },
  ];

  return (
    <div className="z-surface overflow-hidden">
      <div className="grid grid-cols-4">
        {items.map((it, idx) => {
          const active = value === it.key;
          return (
            <button
              key={it.key}
              type="button"
              data-press
              onClick={() => onChange(it.key)}
              className={cn(
                "px-3 py-2.5 text-center transition",
                idx !== items.length - 1 ? "border-r border-white/10" : "",
                active
                  ? "bg-amber-500/90 text-black"
                  : "bg-transparent text-zinc-200 hover:bg-white/5"
              )}
            >
              <div className="text-[12px] font-semibold leading-tight">
                {it.label}
              </div>
              <div className={cn("text-[11px] leading-tight", active ? "text-black/70" : "text-zinc-500")}>
                {it.count}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToolRow({ disabled, onClick, icon, title, subtitle, rightHint }) {
  return (
    <button
      type="button"
      data-press
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full text-left",
        "z-card px-4 py-4",
        "flex items-center gap-3",
        "transition",
        disabled ? "opacity-55 cursor-not-allowed" : "hover:bg-white/[0.06]"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
          "border border-white/10",
          disabled ? "bg-white/5 text-zinc-500" : "bg-white/[0.06] text-zinc-200"
        )}
        aria-hidden="true"
      >
        <span className="text-[18px] leading-none">{icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-zinc-100">{title}</div>
        <div className="text-[12px] text-zinc-400 mt-0.5 truncate">
          {subtitle}
        </div>
        {rightHint ? (
          <div className="text-[11px] text-zinc-500 mt-2">{rightHint}</div>
        ) : null}
      </div>

      <div className="text-zinc-500 text-lg leading-none shrink-0">›</div>
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
    <div className="z-page z-page-y pb-28">
      {/* Header */}
      <div className="z-stack">
        <div className="z-title">{T?.navTraining || "Training"}</div>
        <div className="z-subtitle">
          Practise what you’ve saved. Calm, consistent, and on your terms.
        </div>
      </div>

      {/* Focus */}
      <div className="mt-6 z-stack">
        <div className="z-section-title">Focus</div>
        <div className="z-subtitle -mt-1">
          Choose what kind of entries you want in your sessions.
        </div>

        <SegmentedFocus
          value={focus}
          onChange={setFocus}
          counts={counts}
        />

        {tooFew && (
          <div className="z-inset p-4">
            <div className="text-sm font-semibold text-zinc-200">
              Not enough entries
            </div>
            <div className="text-sm text-zinc-400 mt-1">
              You’ve only got <span className="text-zinc-200 font-semibold">{eligibleCount}</span>{" "}
              in <span className="text-zinc-200 font-semibold">{focusLabel}</span>.
              Add a few more, or switch focus.
            </div>
          </div>
        )}
      </div>

      {/* Modules */}
      <div className="mt-8 z-stack">
        <div className="z-section-title">Modules</div>
        <div className="z-subtitle -mt-1">
          Start with recall, then reinforce with repetition.
        </div>

        <div className="z-stack">
          <ToolRow
            disabled={tooFew}
            onClick={() => {
              if (tooFew) return;
              onStartRecallFlip?.();
            }}
            icon="🧠"
            title="Recognise (Recall Flip)"
            subtitle="Reveal-based recall. Self-grade and move on."
          />

          <ToolRow
            disabled={tooFew}
            onClick={() => {
              if (tooFew) return;
              onStartBlindRecall?.();
            }}
            icon="⌨️"
            title="Produce (Blind Recall)"
            subtitle="Produce Lithuanian first. Type (or speak), then reveal."
          />

          <ToolRow
            disabled={matchPairsDisabled}
            onClick={() => {
              if (matchPairsDisabled) return;
              onStartMatchPairs?.();
            }}
            icon="🧩"
            title="Reinforce (Match Pairs)"
            subtitle="Words & numbers only. Tap two tiles to match EN ↔ LT."
            rightHint={
              matchPairsDisabled
                ? `Add at least 10 words/numbers to unlock (you have ${wordsNumbersCount}).`
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}

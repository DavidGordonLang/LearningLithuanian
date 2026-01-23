// src/views/training/TrainingHome.jsx
import React, { useMemo } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function FocusPillBar({ focus, setFocus, counts }) {
  const items = [
    { id: "phrases", label: "Phrases", count: counts?.phrases ?? 0 },
    { id: "words", label: "Words", count: counts?.words ?? 0 },
    { id: "numbers", label: "Numbers", count: counts?.numbers ?? 0 },
    { id: "all", label: "All", count: counts?.all ?? 0 },
  ];

  return (
    <div className="z-pillbar" role="tablist" aria-label="Training focus">
      {items.map((it) => {
        const active = focus === it.id;
        return (
          <button
            key={it.id}
            type="button"
            data-press
            className={cn("z-pill", active ? "z-pill-on" : "z-pill-off")}
            onClick={() => setFocus(it.id)}
            role="tab"
            aria-selected={active}
          >
            <div className="flex items-center justify-center gap-2">
              <span>{it.label}</span>
              <span className="text-xs text-zinc-400">{it.count}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ToolRow({ disabled, icon, title, desc, onClick }) {
  return (
    <button
      type="button"
      data-press
      className={cn(
        "w-full text-left",
        "z-card px-4 py-4",
        "transition",
        disabled ? "opacity-55 cursor-not-allowed" : "hover:bg-white/[0.09]"
      )}
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
      disabled={disabled}
    >
      <div className="flex items-center gap-3">
        <div
          className="
            w-10 h-10 rounded-full
            border border-white/10
            bg-zinc-950/40
            flex items-center justify-center
            shrink-0
          "
        >
          <span className="text-lg">{icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-zinc-100">{title}</div>
          <div className="text-sm text-zinc-400 mt-0.5 leading-snug">{desc}</div>
        </div>

        <div className="text-zinc-500 text-lg">›</div>
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
    <div className="z-page z-page-y pb-28">
      <div className="z-stack-lg">
        <div className="z-stack">
          <div className="z-title">{T?.navTraining || "Training"}</div>
          <div className="z-subtitle">
            Practise what you’ve saved. Calm, consistent, and on your terms.
          </div>
        </div>

        {/* Focus */}
        <div className="z-card p-4 sm:p-5 z-stack">
          <div className="z-section-title">Focus</div>
          <div className="z-subtitle -mt-1">
            Choose what kind of entries you want in your sessions.
          </div>

          <FocusPillBar focus={focus} setFocus={setFocus} counts={counts} />

          {tooFew && (
            <div className="z-inset p-4">
              <div className="text-sm font-semibold text-zinc-200">
                Not enough entries
              </div>
              <div className="text-sm text-zinc-400 mt-1">
                You’ve only got {eligibleCount} in{" "}
                <span className="text-zinc-200 font-semibold">{focusLabel}</span>.
                Add a few more, or switch focus.
              </div>
            </div>
          )}
        </div>

        {/* Modules */}
        <div className="z-card p-4 sm:p-5 z-stack">
          <div className="z-section-title">Modules</div>
          <div className="z-subtitle -mt-1">
            Start with recall, then reinforce with repetition.
          </div>

          <div className="z-stack">
            <ToolRow
              disabled={tooFew}
              icon="🧠"
              title="Recognise"
              desc="Reveal-based recall. Self-grade and move on."
              onClick={onStartRecallFlip}
            />

            <ToolRow
              disabled={tooFew}
              icon="⌨️"
              title="Produce"
              desc="Produce Lithuanian first. Type (or speak), then reveal."
              onClick={onStartBlindRecall}
            />

            <ToolRow
              disabled={matchPairsDisabled}
              icon="🧩"
              title="Reinforce"
              desc="Words & numbers only. Tap two tiles to match EN ↔ LT."
              onClick={onStartMatchPairs}
            />

            {matchPairsDisabled && (
              <div className="z-helper">
                Add at least <span className="text-zinc-200 font-semibold">10</span>{" "}
                words/numbers to unlock (you have {wordsNumbersCount}).
              </div>
            )}
          </div>

          {/* Keep the gating explanation subtle */}
          {tooFew && (
            <div className="z-helper">
              Tools need at least{" "}
              <span className="text-zinc-200 font-semibold">{minNeeded}</span>{" "}
              eligible entries in{" "}
              <span className="text-zinc-200 font-semibold">{focusLabel}</span>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

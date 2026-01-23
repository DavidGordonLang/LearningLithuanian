// src/views/training/TrainingHome.jsx
import React, { useMemo } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function FocusPill({ active, label, sub, onClick }) {
  return (
    <button
      type="button"
      data-press
      className={cn("z-pill", active ? "z-pill-active" : "")}
      onClick={onClick}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="font-medium">{label}</span>
        <span className="text-[11px] opacity-80">{sub}</span>
      </div>
    </button>
  );
}

function ModuleRow({ icon, title, desc, disabled, onClick, hint }) {
  return (
    <button
      type="button"
      data-press
      className={cn(
        "w-full text-left z-inset px-4 py-4 transition",
        "border border-white/10",
        disabled ? "opacity-55 cursor-not-allowed" : "hover:bg-white/5"
      )}
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
      disabled={disabled}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-lg">{icon}</span>
          </div>

          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-zinc-100 truncate">
              {title}
            </div>
            <div className="text-[13px] text-zinc-400 mt-0.5 leading-snug">
              {desc}
            </div>
            {hint ? (
              <div className="text-[12px] text-zinc-500 mt-2">{hint}</div>
            ) : null}
          </div>
        </div>

        <div className="text-zinc-500 pt-1">›</div>
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
        <div>
          <div className="z-title">{T?.navTraining || "Training"}</div>
          <div className="z-subtitle mt-1">
            Practise what you’ve saved. Calm, consistent, and on your terms.
          </div>
        </div>

        {/* FOCUS */}
        <section className="z-card p-4 sm:p-5">
          <div className="z-section-title">Focus</div>
          <div className="z-subtitle mt-1">
            Choose what kind of entries you want in your sessions.
          </div>

          <div className="mt-3 z-pillbar">
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

          {tooFew ? (
            <div className="mt-4 z-inset p-4 border border-amber-500/20 bg-amber-950/15">
              <div className="text-sm font-semibold text-amber-200">
                Not enough entries
              </div>
              <div className="text-sm text-zinc-300 mt-1">
                You’ve only got {eligibleCount} in{" "}
                <span className="text-zinc-100 font-semibold">{focusLabel}</span>.
                Add a few more, or switch focus.
              </div>
            </div>
          ) : null}
        </section>

        {/* MODULES */}
        <section className="z-card p-4 sm:p-5">
          <div className="z-section-title">Modules</div>
          <div className="z-subtitle mt-1">
            Start with recall, then reinforce through repetition.
          </div>

          <div className="mt-3 z-stack">
            <ModuleRow
              icon="🧠"
              title="Recognise"
              desc="Reveal-based recall. Self-grade and move on."
              disabled={tooFew}
              onClick={onStartRecallFlip}
            />

            <ModuleRow
              icon="⌨️"
              title="Produce"
              desc="Produce Lithuanian first. Type (or speak), then reveal."
              disabled={tooFew}
              onClick={onStartBlindRecall}
            />

            <ModuleRow
              icon="🧩"
              title="Reinforce"
              desc="Words & numbers only. Tap two tiles to match EN ↔ LT."
              disabled={matchPairsDisabled}
              onClick={onStartMatchPairs}
              hint={
                matchPairsDisabled
                  ? `Add at least 10 words/numbers to unlock (you have ${wordsNumbersCount}).`
                  : null
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

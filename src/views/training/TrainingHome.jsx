// src/views/training/TrainingHome.jsx
import React from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function SectionLabel({ eyebrow, title, desc }) {
  return (
    <div>
      {eyebrow ? (
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">
          {eyebrow}
        </div>
      ) : null}
      {title ? (
        <div className="text-[15px] font-semibold text-zinc-100 mt-1">
          {title}
        </div>
      ) : null}
      {desc ? (
        <div className="text-xs text-zinc-400 mt-1 leading-snug">{desc}</div>
      ) : null}
    </div>
  );
}

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
                "whitespace-nowrap",
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

function ModuleCard({
  title,
  desc,
  icon,
  onClick,
  disabled,
  hint,
  accent = "default",
  large = false,
}) {
  const accentClasses =
    accent === "learning"
      ? disabled
        ? "border-white/8 opacity-70 cursor-not-allowed"
        : "border-emerald-400/20 bg-emerald-500/[0.07] hover:bg-emerald-500/[0.10] hover:border-emerald-300/25"
      : disabled
      ? "border-white/8 opacity-55 cursor-not-allowed"
      : "border-white/10 hover:border-white/15 hover:bg-black/25";

  const iconShellClasses =
    accent === "learning"
      ? "bg-emerald-500/12 border-emerald-400/20"
      : "bg-white/[0.04] border-white/10";

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
        "w-full text-left rounded-2xl border transition",
        "backdrop-blur",
        large ? "px-4 py-4.5" : "px-4 py-4",
        accentClasses
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-xl border flex items-center justify-center shrink-0",
            iconShellClasses
          )}
          aria-hidden="true"
        >
          <span className="text-[18px]">{icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div
              className={cn(
                "font-semibold text-zinc-100",
                large ? "text-[16px]" : "text-[15px]"
              )}
            >
              {title}
            </div>
            <div className="text-sm text-zinc-500">→</div>
          </div>

          <div className="text-zinc-300 mt-1 leading-snug text-[13px]">
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

function GroupPanel({ children }) {
  return (
    <div
      className="
        rounded-3xl
        border border-white/10
        bg-black/20
        backdrop-blur
        shadow-[0_0_24px_rgba(0,0,0,0.16)]
        p-3
      "
    >
      {children}
    </div>
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
  onStartExamPrep,
  onStartLearning,
}) {
  const minNeeded = 5;
  const tooFew = (eligibleCount || 0) < minNeeded;

  const reinforceEligibleCount =
    focus === "numbers"
      ? counts?.numbers || 0
      : focus === "phrases"
      ? 0
      : counts?.words || 0;

  const reinforceLabel =
    focus === "numbers"
      ? "numbers"
      : focus === "phrases"
      ? "supported items"
      : "words";

  const matchPairsDisabled =
    focus === "phrases" ? true : reinforceEligibleCount < 10;

  const matchPairsHint =
    focus === "phrases"
      ? "Reinforce is for words or numbers only."
      : matchPairsDisabled
      ? `Add at least 10 ${reinforceLabel} to unlock (you have ${reinforceEligibleCount}).`
      : null;

  const learningDisabled = typeof onStartLearning !== "function";

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
      <div>
        <div className="text-xl font-semibold text-zinc-100">
          {T?.navTraining || "Training"}
        </div>
        <div className="text-sm text-zinc-400 mt-1">
          Continue learning, practise your library, or prepare for the exam.
        </div>
      </div>

      <div className="mt-6">
        <SectionLabel eyebrow="Learning" title="Continue learning" />

        <div className="mt-3">
          <ModuleCard
            title="Lesson 1.1.1 — Hello and Goodbye"
            desc="Section 1 · Module 1.1"
            icon="📚"
            large
            accent="learning"
            disabled={learningDisabled}
            onClick={onStartLearning}
            hint={learningDisabled ? "Learning path unavailable." : null}
          />
        </div>
      </div>

      <div className="mt-6">
        <SectionLabel
          eyebrow="Practice"
          title="Practice modes"
          desc="Use your saved library in different ways."
        />

        <div className="mt-3">
          <GroupPanel>
            <div className="space-y-3">
              <FocusPillRow focus={focus} setFocus={setFocus} />

              <div className="space-y-3 pt-1">
                <ModuleCard
                  title="Recognise"
                  desc="Reveal-based recall."
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
                  desc="Recall Lithuanian first."
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
                  desc="Match English and Lithuanian."
                  icon="🧩"
                  disabled={matchPairsDisabled}
                  onClick={onStartMatchPairs}
                  hint={matchPairsHint}
                />
              </div>
            </div>
          </GroupPanel>
        </div>
      </div>

      <div className="mt-6">
        <SectionLabel
          eyebrow="Exam prep"
          title="Exam practice"
          desc="Reading, listening, and writing tasks."
        />

        <div className="mt-3">
          <ModuleCard
            title="Exam Prep"
            desc="Practise foreigner-exam task formats."
            icon="📝"
            onClick={onStartExamPrep}
          />
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}
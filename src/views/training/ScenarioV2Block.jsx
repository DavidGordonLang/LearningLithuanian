import React, { useState } from "react";
import { createPortal } from "react-dom";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function ActionButton({ children, onClick, disabled = false, variant = "primary", className }) {
  const tone = variant === "primary"
    ? "bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black"
    : variant === "secondary"
    ? "bg-white/[0.05] hover:bg-white/[0.08] border-white/10 text-zinc-100"
    : "bg-transparent hover:bg-white/[0.05] border-white/10 text-zinc-300";

  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      disabled={disabled}
      className={cn("rounded-2xl border px-4 py-3 text-sm font-semibold transition", tone, disabled ? "cursor-not-allowed opacity-50" : "", className)}
    >
      {children}
    </button>
  );
}

function SmallMetaPill({ children, accent = "default" }) {
  const tone = accent === "emerald"
    ? "border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-200"
    : "border-white/10 bg-white/[0.03] text-zinc-300";

  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-tight", tone)}>
      {children}
    </div>
  );
}

function AudioIconButton({ text, playText, label = "Play audio" }) {
  if (!text) return null;
  return (
    <button
      type="button"
      data-press
      aria-label={label}
      onClick={() => { try { playText?.(text); } catch {} }}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-200 transition hover:bg-white/[0.07]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M11 5L6.8 9H4v6h2.8L11 19V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 9.5C15.667 10.167 16 11 16 12C16 13 15.667 13.833 15 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M17.5 7C18.833 8.333 19.5 10 19.5 12C19.5 14 18.833 15.667 17.5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function optionCanProgress(option) {
  const result = option?.result || "wrong";
  return (
    result === "best" ||
    result === "acceptable" ||
    result === "awkward" ||
    (result === "repair" && option?.progresses === true)
  );
}

function resultMeta(option) {
  const result = option?.result || "wrong";
  const progresses = optionCanProgress(option);
  if (result === "best") return { label: "Best answer", tone: "border-emerald-400/25 bg-emerald-500/[0.08] text-emerald-200" };
  if (result === "acceptable") return { label: "Acceptable", tone: "border-sky-400/20 bg-sky-500/[0.07] text-sky-200" };
  if (result === "awkward") return { label: "Awkward, but understandable", tone: "border-amber-400/25 bg-amber-500/[0.07] text-amber-200" };
  if (result === "repair" && progresses) return { label: "Useful repair", tone: "border-violet-400/25 bg-violet-500/[0.07] text-violet-200" };
  if (result === "repair") return { label: "Repair does not fit here", tone: "border-rose-400/25 bg-rose-500/[0.07] text-rose-200" };
  return { label: "Try again", tone: "border-rose-400/25 bg-rose-500/[0.07] text-rose-200" };
}

function ScenarioV2FeedbackPanel({ option, onRetry, onContinue }) {
  if (!option) return null;
  const meta = resultMeta(option);
  const progresses = optionCanProgress(option);

  return (
    <div className={cn("rounded-2xl border px-4 py-4", meta.tone)}>
      <div className="text-[13px] font-semibold">{meta.label}</div>
      {option.feedback ? <div className="mt-1 text-[13px] leading-snug text-zinc-300">{option.feedback}</div> : null}
      {option.betterAnswer ? (
        <div className="mt-2 rounded-xl border border-white/10 bg-black/15 px-3 py-2">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">Better answer</div>
          <div className="mt-0.5 text-[13px] font-semibold text-zinc-100">{option.betterAnswer}</div>
        </div>
      ) : null}
      <div className="mt-3">
        {progresses ? (
          <ActionButton onClick={onContinue} className="w-full">Continue</ActionButton>
        ) : (
          <ActionButton variant="secondary" onClick={onRetry} className="w-full">Try another answer</ActionButton>
        )}
      </div>
    </div>
  );
}

function ScenarioV2FocusedMode({ block, playText, onWrongAnswer, onExit, onComplete }) {
  const steps = Array.isArray(block?.steps) ? block.steps : [];
  const [stepIndex, setStepIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [finalLine, setFinalLine] = useState(null);
  const [complete, setComplete] = useState(false);

  const step = steps[stepIndex] || null;
  const options = Array.isArray(step?.options) ? step.options : [];
  const participant = Array.isArray(block?.participants)
    ? block.participants.find((p) => p.id === step?.speakerId)
    : null;
  const speakerLabel = step?.speakerLabel || participant?.label || "Speaker";

  function addCurrentExchange(option) {
    setHistory((prev) => [
      ...prev,
      {
        id: `${step?.id || "step"}_speaker`,
        role: "speaker",
        speakerLabel,
        text: step?.speakerText || "",
        textEn: step?.speakerTextEn || "",
      },
      {
        id: `${step?.id || "step"}_${option?.id || "option"}`,
        role: "learner",
        speakerLabel: "You",
        text: option?.text || "",
        textEn: option?.textEn || "",
      },
    ]);
  }

  function handleOption(option) {
    if (selectedOption || complete) return;
    setSelectedOption(option);
    if (!optionCanProgress(option)) onWrongAnswer?.();
  }

  function handleContinue() {
    if (!selectedOption || !optionCanProgress(selectedOption)) return;
    addCurrentExchange(selectedOption);

    if (step?.finalSystemLine) {
      setFinalLine(step.finalSystemLine);
      setComplete(true);
      setSelectedOption(null);
      return;
    }

    if (stepIndex >= steps.length - 1) {
      setComplete(true);
      setSelectedOption(null);
      return;
    }

    setStepIndex((prev) => prev + 1);
    setSelectedOption(null);
  }

  const content = (
    <div className="fixed inset-0 z-[12000] overflow-y-auto bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 py-4 pb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">Scenario</div>
            <div className="text-[18px] font-semibold text-zinc-100">{block?.title || "Scenario"}</div>
          </div>
          <button type="button" data-press onClick={onExit} className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-200">
            Exit
          </button>
        </div>

        <div className="mb-4 rounded-3xl border border-white/10 bg-white/[0.035] px-4 py-4">
          <div className="text-[13px] leading-snug text-zinc-300">{block?.sceneIntro}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {block?.location ? <SmallMetaPill>{block.location}</SmallMetaPill> : null}
            {block?.goal ? <SmallMetaPill accent="emerald">{block.goal}</SmallMetaPill> : null}
          </div>
        </div>

        {history.length ? (
          <div className="mb-4 space-y-2">
            {history.map((item) => (
              <div key={item.id} className={cn("rounded-2xl border px-4 py-3", item.role === "learner" ? "border-emerald-400/18 bg-emerald-500/[0.08]" : "border-white/10 bg-white/[0.035]")}>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">{item.speakerLabel}</div>
                <div className="mt-1 text-[15px] font-semibold text-zinc-100">{item.text}</div>
                {item.textEn ? <div className="mt-0.5 text-[12px] text-zinc-500">{item.textEn}</div> : null}
              </div>
            ))}
          </div>
        ) : null}

        {!complete && step ? (
          <div className="flex flex-1 flex-col gap-4">
            <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
              {step.sceneDirection ? <div className="mb-3 text-[12px] italic leading-snug text-zinc-500">{step.sceneDirection}</div> : null}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">{speakerLabel}</div>
                  <div className="mt-1 text-[20px] font-semibold leading-snug text-zinc-100">{step.speakerText}</div>
                  {step.speakerTextEn ? <div className="mt-1 text-[13px] leading-snug text-zinc-500">{step.speakerTextEn}</div> : null}
                </div>
                <AudioIconButton text={step.speakerText} playText={playText} label="Hear line" />
              </div>
            </div>

            {step.helperText ? (
              <div className="rounded-2xl border border-sky-400/20 bg-sky-500/[0.06] px-4 py-3 text-[12px] leading-snug text-sky-100">
                {step.helperText}
              </div>
            ) : null}

            <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.035] px-4 py-4">
              {step.learnerPrompt ? <div className="mb-3 text-[14px] font-semibold leading-snug text-zinc-100">{step.learnerPrompt}</div> : null}
              <div className="grid gap-2">
                {options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    data-press
                    onClick={() => handleOption(option)}
                    disabled={!!selectedOption}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3 text-left transition",
                      selectedOption?.id === option.id ? "border-emerald-400/25 bg-emerald-500/[0.08]" : "border-white/15 bg-white/[0.06] hover:border-white/25 hover:bg-white/[0.08]",
                      selectedOption && selectedOption.id !== option.id ? "opacity-50" : ""
                    )}
                  >
                    <div className="text-[15px] font-semibold text-zinc-100">{option.text}</div>
                    {option.textEn ? <div className="mt-0.5 text-[12px] text-zinc-500">{option.textEn}</div> : null}
                  </button>
                ))}
              </div>
            </div>

            {selectedOption ? (
              <ScenarioV2FeedbackPanel option={selectedOption} onRetry={() => setSelectedOption(null)} onContinue={handleContinue} />
            ) : null}
          </div>
        ) : null}

        {complete ? (
          <div className="mt-auto space-y-3">
            {finalLine ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] px-4 py-4">
                {finalLine.sceneDirection ? <div className="mb-3 text-[12px] italic leading-snug text-zinc-500">{finalLine.sceneDirection}</div> : null}
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">{finalLine.speakerLabel || "Speaker"}</div>
                <div className="mt-1 text-[20px] font-semibold leading-snug text-zinc-100">{finalLine.speakerText}</div>
                {finalLine.speakerTextEn ? <div className="mt-1 text-[13px] leading-snug text-zinc-500">{finalLine.speakerTextEn}</div> : null}
              </div>
            ) : null}
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.08] px-4 py-4">
              <div className="text-[15px] font-semibold text-emerald-200">Scenario complete</div>
              <div className="mt-1 text-[13px] text-zinc-400">You completed the conversation naturally.</div>
              <ActionButton onClick={onComplete} className="mt-3 w-full">Continue</ActionButton>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

export default function ScenarioV2Block({ block, playText, onComplete, onWrongAnswer, onAdvance }) {
  const [focused, setFocused] = useState(false);
  const focusItems = Array.isArray(block?.focus) ? block.focus : [];

  function handleFocusedComplete() {
    setFocused(false);
    onComplete?.();
    onAdvance?.();
  }

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-white/10 bg-black/15 px-4 py-4">
        <div className="text-[11px] uppercase tracking-widest text-zinc-600">Scenario V2</div>
        <div className="mt-2 text-[20px] font-semibold leading-snug text-zinc-100">{block?.title || "Scenario"}</div>
        {block?.sceneIntro ? <div className="mt-2 text-[13px] leading-snug text-zinc-400">{block.sceneIntro}</div> : null}
        {block?.goal ? (
          <div className="mt-3 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.06] px-3 py-2 text-[12px] leading-snug text-emerald-100">
            {block.goal}
          </div>
        ) : null}
        {focusItems.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {focusItems.map((item) => <SmallMetaPill key={item}>{item}</SmallMetaPill>)}
          </div>
        ) : null}
        <ActionButton onClick={() => setFocused(true)} className="mt-4 w-full">Start scenario</ActionButton>
      </div>

      {focused ? (
        <ScenarioV2FocusedMode
          block={block}
          playText={playText}
          onWrongAnswer={onWrongAnswer}
          onExit={() => setFocused(false)}
          onComplete={handleFocusedComplete}
        />
      ) : null}
    </div>
  );
}

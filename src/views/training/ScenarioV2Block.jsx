import React, { useEffect, useRef, useState } from "react";
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

function formatParticipantName(participant, fallback = "Speaker") {
  const base = participant?.name || participant?.label || fallback;
  return participant?.gender ? `${base} (${participant.gender})` : base;
}

function getParticipant(block, speakerId) {
  if (!Array.isArray(block?.participants)) return null;
  return block.participants.find((p) => p.id === speakerId) || null;
}

function getSpeakerLabel(block, turn) {
  const participant = getParticipant(block, turn?.speakerId);
  return formatParticipantName(participant, turn?.speakerLabel || "Speaker");
}

function ParticipantPill({ participant }) {
  const label = formatParticipantName(participant, participant?.label || "Participant");
  const role = participant?.role || participant?.label || "";
  return (
    <SmallMetaPill>
      {role ? `${label} - ${role}` : label}
    </SmallMetaPill>
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

function ScenarioV2FeedbackSheet({ option, onRetry, onContinue }) {
  if (!option) return null;
  const meta = resultMeta(option);
  const progresses = optionCanProgress(option);

  return (
    <div className="fixed inset-0 z-[12020] flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" aria-hidden="true" />
      <div className="scenario-v2-pop relative w-full max-w-sm">
        <div className={cn("rounded-[28px] border px-4 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl", meta.tone)}>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold">{meta.label}</div>
              <div className="mt-1 rounded-2xl border border-white/10 bg-black/15 px-3 py-2">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Your answer</div>
                <div className="mt-0.5 text-[14px] font-semibold text-zinc-100">{option.text}</div>
              </div>
              {option.feedback ? <div className="mt-2 text-[13px] leading-snug text-zinc-200">{option.feedback}</div> : null}
              {option.betterAnswer ? (
                <div className="mt-2 rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">Better answer</div>
                  <div className="mt-0.5 text-[13px] font-semibold text-zinc-100">{option.betterAnswer}</div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-3">
            {progresses ? (
              <ActionButton onClick={onContinue} className="w-full">Continue</ActionButton>
            ) : (
              <ActionButton variant="secondary" onClick={onRetry} className="w-full">Try another answer</ActionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioV2SystemTurn({ block, turn, phase = "speaker", playText, final = false }) {
  if (!turn) return null;
  const showScene = !!turn.sceneDirection && (phase === "scene" || phase === "speaker");
  const showSpeaker = phase === "speaker";
  const speakerLabel = getSpeakerLabel(block, turn);

  return (
    <div className="space-y-2">
      {showScene ? (
        <div className="scenario-v2-fade px-1 text-[12px] italic leading-snug text-zinc-500">
          {turn.sceneDirection}
        </div>
      ) : null}

      {showSpeaker ? (
        <div className="scenario-v2-fade flex justify-start">
          <div className={cn("max-w-[86%] rounded-[22px] border px-4 py-3", final ? "border-emerald-400/18 bg-emerald-500/[0.08]" : "border-white/10 bg-white/[0.045]")}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="min-w-0 text-[11px] font-semibold text-zinc-400">{speakerLabel}</div>
              <AudioIconButton text={turn.speakerText} playText={playText} label="Replay speaker line" />
            </div>
            <div className="text-[17px] font-semibold leading-snug text-zinc-100">{turn.speakerText}</div>
          </div>
        </div>
      ) : null}

      {showSpeaker && (turn.supportText || turn.meaningText) ? (
        <div className="scenario-v2-fade max-w-[86%] rounded-2xl border border-sky-400/15 bg-sky-500/[0.055] px-3 py-2">
          <div className="text-[10px] uppercase tracking-widest text-sky-300/80">Meaning</div>
          <div className="mt-0.5 text-[12px] leading-snug text-sky-100">{turn.supportText || turn.meaningText}</div>
        </div>
      ) : null}
    </div>
  );
}

function ScenarioV2UserBubble({ item }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[84%] rounded-[22px] border border-emerald-400/18 bg-emerald-500/[0.09] px-4 py-3">
        <div className="text-[11px] font-semibold text-emerald-200">You</div>
        <div className="mt-1 text-[15px] font-semibold leading-snug text-zinc-100">{item.text}</div>
      </div>
    </div>
  );
}

function ScenarioV2HistoryItem({ block, item, playText }) {
  if (item.role === "learner") return <ScenarioV2UserBubble item={item} />;
  return (
    <ScenarioV2SystemTurn
      block={block}
      turn={item}
      phase="speaker"
      playText={playText}
    />
  );
}

function ScenarioV2CompleteAction({ onComplete }) {
  return (
    <div className="border-t border-white/10 bg-black/35 px-4 py-3">
      <div className="mb-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.08] px-3 py-2">
        <div className="text-[14px] font-semibold text-emerald-200">Scenario complete</div>
        <div className="mt-0.5 text-[12px] text-zinc-400">You completed the conversation naturally.</div>
      </div>
      <ActionButton onClick={onComplete} className="w-full">Continue</ActionButton>
    </div>
  );
}

function ScenarioV2FocusedMode({ block, playText, onWrongAnswer, onExit, onComplete }) {
  const steps = Array.isArray(block?.steps) ? block.steps : [];
  const timersRef = useRef([]);
  const feedRef = useRef(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [turnPhase, setTurnPhase] = useState("scene");
  const [followUpTurn, setFollowUpTurn] = useState(null);
  const [followUpPhase, setFollowUpPhase] = useState("scene");
  const [finalTurn, setFinalTurn] = useState(null);
  const [finalPhase, setFinalPhase] = useState("scene");
  const [complete, setComplete] = useState(false);

  const step = steps[stepIndex] || null;
  const options = Array.isArray(step?.options) ? step.options : [];
  const participant = Array.isArray(block?.participants)
    ? block.participants.find((p) => p.id === step?.speakerId)
    : null;
  const speakerLabel = step?.speakerLabel || participant?.label || "Speaker";

  function clearTimers() {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }

  function queueTimeout(fn, delay) {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  }

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      try {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      } catch {
        el.scrollTop = el.scrollHeight;
      }
    });
  }, [history, turnPhase, finalPhase, finalTurn, complete]);

  useEffect(() => {
    clearTimers();
    if (!step || followUpTurn || finalTurn || complete) return;
    setTurnPhase(step.sceneDirection ? "scene" : "speaker");
    const delay = step.sceneDirection ? 650 : 120;
    queueTimeout(() => setTurnPhase("speaker"), delay);
  }, [step?.id, followUpTurn, finalTurn, complete]);

  useEffect(() => {
    if (turnPhase !== "speaker" || followUpTurn || finalTurn || complete || !step?.speakerText) return;
    Promise.resolve(playText?.(step.speakerText)).catch(() => {});
  }, [turnPhase, followUpTurn, finalTurn, complete, step?.id, step?.speakerText, playText]);

  useEffect(() => {
    if (!followUpTurn) return;
    clearTimers();
    setFollowUpPhase(followUpTurn.sceneDirection ? "scene" : "speaker");
    const delay = followUpTurn.sceneDirection ? 650 : 120;
    queueTimeout(() => setFollowUpPhase("speaker"), delay);
    queueTimeout(() => {
      setHistory((prev) => [
        ...prev,
        {
          id: `${followUpTurn.speakerId || "speaker"}_${Date.now()}`,
          role: "speaker",
          speakerId: followUpTurn.speakerId,
          speakerLabel: followUpTurn.speakerLabel,
          speakerText: followUpTurn.speakerText || "",
          sceneDirection: null,
          supportText: followUpTurn.supportText || followUpTurn.meaningText || "",
        },
      ]);
      setFollowUpTurn(null);
      advanceAfterProgressingAnswer();
    }, delay + 1250);
  }, [followUpTurn?.speakerText]);

  useEffect(() => {
    if (followUpPhase !== "speaker" || !followUpTurn?.speakerText) return;
    Promise.resolve(playText?.(followUpTurn.speakerText)).catch(() => {});
  }, [followUpPhase, followUpTurn?.speakerText, playText]);

  useEffect(() => {
    if (!finalTurn) return;
    clearTimers();
    setFinalPhase(finalTurn.sceneDirection ? "scene" : "speaker");
    const delay = finalTurn.sceneDirection ? 650 : 120;
    queueTimeout(() => setFinalPhase("speaker"), delay);
    queueTimeout(() => setComplete(true), delay + 950);
  }, [finalTurn?.speakerText]);

  useEffect(() => {
    if (finalPhase !== "speaker" || !finalTurn?.speakerText) return;
    Promise.resolve(playText?.(finalTurn.speakerText)).catch(() => {});
  }, [finalPhase, finalTurn?.speakerText, playText]);

  function addCurrentExchange(option) {
    setHistory((prev) => [
      ...prev,
      {
        id: `${step?.id || "step"}_speaker`,
        role: "speaker",
        speakerId: step?.speakerId,
        speakerLabel,
        text: step?.speakerText || "",
        speakerText: step?.speakerText || "",
        sceneDirection: null,
        supportText: step?.supportText || step?.meaningText || "",
      },
      {
        id: `${step?.id || "step"}_${option?.id || "option"}`,
        role: "learner",
        speakerLabel: "You",
        text: option?.text || "",
      },
    ]);
  }

  function handleOption(option) {
    if (selectedOption || complete) return;
    setSelectedOption(option);
    if (!optionCanProgress(option)) onWrongAnswer?.();
  }

  function handleFeedbackContinue() {
    if (!selectedOption || !optionCanProgress(selectedOption)) return;
    const option = selectedOption;
    addCurrentExchange(selectedOption);
    setSelectedOption(null);

    if (option?.followUp?.speakerText) {
      setFollowUpTurn(option.followUp);
      return;
    }

    advanceAfterProgressingAnswer();
  }

  function advanceAfterProgressingAnswer() {
    if (step?.finalSystemLine) {
      setFinalTurn(step.finalSystemLine);
      return;
    }

    if (stepIndex >= steps.length - 1) {
      setComplete(true);
      return;
    }

    setStepIndex((prev) => prev + 1);
  }

  const activeSpeakerReady = turnPhase === "speaker" && !followUpTurn && !finalTurn && !complete;
  const activeTurn = step
    ? {
      speakerId: step.speakerId,
      speakerLabel: step.speakerLabel,
      speakerText: step.speakerText,
      sceneDirection: step.sceneDirection,
      supportText: step.supportText || step.meaningText,
    }
    : null;

  const content = (
    <div className="fixed inset-0 z-[12000] bg-zinc-950 text-zinc-100">
      <style>{`
        @keyframes scenarioV2Fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scenarioV2Pop {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .scenario-v2-fade { animation: scenarioV2Fade 260ms ease-out both; }
        .scenario-v2-pop { animation: scenarioV2Pop 180ms ease-out both; }
      `}</style>
      <div className="mx-auto flex h-[100dvh] max-w-xl flex-col px-4 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">Scenario</div>
            <div className="truncate text-[18px] font-semibold text-zinc-100">{block?.title || "Scenario"}</div>
            {block?.goal ? <div className="mt-0.5 truncate text-[12px] text-zinc-500">{block.goal}</div> : null}
          </div>
          <button type="button" data-press onClick={onExit} className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-200">
            Exit
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-black/25 shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
          <div ref={feedRef} className={cn("h-full overflow-y-auto px-4 py-4 space-y-4", selectedOption ? "pb-44" : "")}>
            {history.map((item) => (
              <ScenarioV2HistoryItem key={item.id} block={block} item={item} playText={playText} />
            ))}

            {!complete && !followUpTurn && !finalTurn && step ? (
              <ScenarioV2SystemTurn block={block} turn={activeTurn} phase={turnPhase} playText={playText} />
            ) : null}

            {followUpTurn ? (
              <ScenarioV2SystemTurn block={block} turn={followUpTurn} phase={followUpPhase} playText={playText} />
            ) : null}

            {finalTurn ? (
              <ScenarioV2SystemTurn block={block} turn={finalTurn} phase={finalPhase} playText={playText} final />
            ) : null}
          </div>
        </div>

        {!complete && !followUpTurn && !finalTurn && step ? (
          <div className={cn("mt-3 rounded-[24px] border border-white/10 bg-black/35 px-4 py-3 transition", activeSpeakerReady ? "opacity-100" : "opacity-60")}>
            {step.helperText && activeSpeakerReady ? (
              <div className="mb-3 rounded-2xl border border-sky-400/15 bg-sky-500/[0.055] px-3 py-2 text-[12px] leading-snug text-sky-100">
                {step.helperText}
              </div>
            ) : null}
            {step.learnerPrompt ? <div className="mb-3 text-[14px] font-semibold leading-snug text-zinc-100">{step.learnerPrompt}</div> : null}
            <div className="grid gap-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  data-press
                  onClick={() => handleOption(option)}
                  disabled={!activeSpeakerReady || !!selectedOption}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    selectedOption?.id === option.id ? "border-emerald-400/25 bg-emerald-500/[0.08]" : "border-white/15 bg-white/[0.06] hover:border-white/25 hover:bg-white/[0.08]",
                    selectedOption && selectedOption.id !== option.id ? "opacity-45" : "",
                    !activeSpeakerReady ? "cursor-wait" : ""
                  )}
                >
                  <div className="text-[15px] font-semibold text-zinc-100">{option.text}</div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {complete ? (
          <ScenarioV2CompleteAction onComplete={onComplete} />
        ) : null}
      </div>

      {selectedOption ? (
        <ScenarioV2FeedbackSheet
          option={selectedOption}
          onRetry={() => setSelectedOption(null)}
          onContinue={handleFeedbackContinue}
        />
      ) : null}
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

export default function ScenarioV2Block({ block, playText, onComplete, onWrongAnswer, onAdvance }) {
  const [focused, setFocused] = useState(false);
  const focusItems = Array.isArray(block?.focus) ? block.focus : [];
  const participants = Array.isArray(block?.participants) ? block.participants : [];

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
        {participants.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {participants.map((participant) => (
              <ParticipantPill key={participant.id || participant.name || participant.label} participant={participant} />
            ))}
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

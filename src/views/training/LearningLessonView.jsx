// src/views/training/LearningLessonView.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function collectAudioTexts(blocks) {
  const texts = [];
  for (const block of blocks) {
    if (!block) continue;
    // learn block items
    if (Array.isArray(block.items)) {
      for (const item of block.items) {
        if (item?.audioText) texts.push(item.audioText);
      }
    }
    // choice/listen block prompt audio
    if (block.prompt?.audioText) texts.push(block.prompt.audioText);
    // speak block
    if (block.audioText) texts.push(block.audioText);
    // scenario steps
    if (Array.isArray(block.steps)) {
      for (const step of block.steps) {
        if (step?.audioText) texts.push(step.audioText);
      }
    }
  }
  // deduplicate
  return [...new Set(texts.filter(Boolean))];
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function BackCircle({ onClick }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      className={cn(
        "h-10 w-10 rounded-full border flex items-center justify-center shrink-0",
        "bg-white/[0.06] border-white/10",
        "shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
        "hover:bg-white/[0.08] active:scale-[0.99] transition"
      )}
      aria-label="Back"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
      </svg>
    </button>
  );
}

function SurfaceCard({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-black/20 backdrop-blur",
        "shadow-[0_0_24px_rgba(0,0,0,0.18)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function SmallMetaPill({ children, accent = "default" }) {
  const tone =
    accent === "emerald"
      ? "border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-200"
      : accent === "red"
      ? "border-rose-400/18 bg-rose-500/[0.08] text-rose-200"
      : "border-white/10 bg-white/[0.03] text-zinc-300";
  return (
    <div className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-1",
      "text-[11px] font-medium tracking-tight",
      tone
    )}>
      {children}
    </div>
  );
}

function ActionButton({ children, onClick, disabled = false, variant = "primary", className }) {
  const tone =
    variant === "primary"
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
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
        tone,
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className
      )}
    >
      {children}
    </button>
  );
}

function AudioIconButton({ text, playText, label = "Play audio" }) {
  return (
    <button
      type="button"
      data-press
      aria-label={label}
      onClick={async () => { try { await playText?.(text); } catch {} }}
      className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.04] text-zinc-200 flex items-center justify-center hover:bg-white/[0.07] transition shrink-0"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M11 5L6.8 9H4v6h2.8L11 19V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 9.5C15.667 10.167 16 11 16 12C16 13 15.667 13.833 15 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M17.5 7C18.833 8.333 19.5 10 19.5 12C19.5 14 18.833 15.667 17.5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </button>
  );
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function LessonLoadingScreen({ lesson, module, section, lessonDisplayLabel, onReady }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in
    const raf = requestAnimationFrame(() => setVisible(true));

    // Animate the loading bar smoothly to ~85% over 1.2s
    // then jump to 100% and call onReady
    let start = null;
    let animId = null;

    function step(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      // ease-out curve to 85% over 1200ms
      const pct = Math.min(85, Math.round(85 * (1 - Math.exp(-elapsed / 600))));
      setProgress(pct);
      if (pct < 85) {
        animId = requestAnimationFrame(step);
      }
    }

    animId = requestAnimationFrame(step);

    // Complete after 1.4s max — audio preloading is fire-and-forget
    const completeTimer = setTimeout(() => {
      setProgress(100);
      // Brief pause at 100% before transitioning
      setTimeout(() => {
        onReady?.();
      }, 320);
    }, 1400);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(animId);
      clearTimeout(completeTimer);
    };
  }, [onReady]);

  return (
    <div
      className={cn(
        "flex flex-col h-full px-6 transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
      style={{ paddingTop: "15vh" }}
    >
      {/* Breadcrumb */}
      <div className="text-[12px] text-zinc-500 tracking-wide">
        Section {section?.code} · Module {module?.code}
      </div>

      {/* Lesson label */}
      <div className="mt-2 text-[13px] font-medium text-zinc-400 uppercase tracking-widest">
        {lessonDisplayLabel}
      </div>

      {/* Lesson title */}
      <div className="mt-3 text-[28px] font-semibold text-zinc-100 leading-snug">
        {lesson?.title || "Loading…"}
      </div>

      {/* Purpose */}
      {lesson?.purpose ? (
        <div className="mt-3 text-[14px] text-zinc-400 leading-relaxed max-w-xs">
          {lesson.purpose}
        </div>
      ) : null}

      {/* Loading bar */}
      <div className="mt-10 max-w-xs">
        <div className="h-[3px] rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full bg-emerald-500/70 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-[11px] text-zinc-600">
          Preparing lesson…
        </div>
      </div>
    </div>
  );
}

// ─── Feedback panel ───────────────────────────────────────────────────────────

function FeedbackPanel({ isCorrect, correctText, feedbackNote, onContinue }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={cn(
      "mt-3 rounded-2xl border px-4 py-4 transition-all duration-250",
      isCorrect
        ? "border-emerald-400/25 bg-emerald-500/[0.08]"
        : "border-white/10 bg-white/[0.03]",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "mt-[1px] h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold",
          isCorrect ? "bg-emerald-500/20 text-emerald-300" : "bg-white/[0.06] text-zinc-400"
        )}>
          {isCorrect ? "✓" : "→"}
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn(
            "text-[14px] font-semibold",
            isCorrect ? "text-emerald-200" : "text-zinc-200"
          )}>
            {isCorrect ? "Correct!" : `Correct answer: ${correctText}`}
          </div>
          {feedbackNote ? (
            <div className="mt-1 text-[12px] text-zinc-400 leading-snug">
              {feedbackNote}
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-3">
        <ActionButton
          onClick={onContinue}
          variant={isCorrect ? "primary" : "secondary"}
          className="w-full"
        >
          Continue
        </ActionButton>
      </div>
    </div>
  );
}

// ─── Pattern note ─────────────────────────────────────────────────────────────

function PatternNote({ notes }) {
  if (!notes?.pattern && !Array.isArray(notes?.usage)) return null;
  return (
    <div className="mt-4">
      <SurfaceCard className="p-4">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">
          Pattern note
        </div>
        {notes.pattern ? (
          <div className="mt-2 text-[13px] text-zinc-300 leading-snug">
            {notes.pattern}
          </div>
        ) : null}
        {Array.isArray(notes.usage) && notes.usage.length > 0 ? (
          <div className="mt-3 space-y-2">
            {notes.usage.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-zinc-300 leading-snug"
              >
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );
}

// ─── Block renderers ──────────────────────────────────────────────────────────

function LearnBlock({ block, playText, onComplete, completed }) {
  const items = Array.isArray(block?.items) ? block.items : [];
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[17px] font-semibold text-zinc-100">{item.lt}</div>
              <div className="text-[13px] text-zinc-400 mt-0.5">{item.en}</div>
            </div>
            {item.audioText ? (
              <AudioIconButton text={item.audioText} playText={playText} />
            ) : null}
          </div>
        </div>
      ))}
      <div className="pt-2">
        <ActionButton
          onClick={onComplete}
          variant={completed ? "secondary" : "primary"}
          className="w-full"
        >
          {completed ? "Reviewed ✓" : "I've reviewed these"}
        </ActionButton>
      </div>
    </div>
  );
}

function ChoiceOption({ option, selected, revealState, onClick }) {
  const stateClass =
    revealState === "idle"
      ? selected
        ? "border-white/20 bg-white/[0.07] text-zinc-100"
        : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.05]"
      : option.isCorrect
      ? "border-emerald-400/20 bg-emerald-500/[0.10] text-emerald-100"
      : selected
      ? "border-rose-400/20 bg-rose-500/[0.08] text-rose-200 line-through opacity-60"
      : "border-white/[0.06] bg-white/[0.02] text-zinc-500";

  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      disabled={revealState !== "idle"}
      className={cn(
        "w-full text-left rounded-2xl border px-4 py-3 text-[14px] transition",
        stateClass,
        revealState !== "idle" ? "cursor-default" : ""
      )}
    >
      {option.text}
    </button>
  );
}

function ChoiceBlock({ block, playText, onComplete, onAdvance }) {
  const [selectedId, setSelectedId] = useState(null);
  const [revealState, setRevealState] = useState("idle");

  const options = Array.isArray(block?.options) ? block.options : [];
  const selected = options.find((o) => o.id === selectedId) || null;
  const correctOption = options.find((o) => o.isCorrect) || null;

  const promptText = block?.prompt?.text || "Choose the best answer";
  const audioText = block?.prompt?.audioText || "";

  const handleSelect = (option) => {
    if (revealState !== "idle") return;
    setSelectedId(option.id);
    setRevealState("revealed");
    onComplete?.();
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="text-[15px] font-semibold text-zinc-100 leading-snug">
          {promptText}
        </div>
        {audioText ? (
          <AudioIconButton text={audioText} playText={playText} />
        ) : null}
      </div>

      <div className="grid gap-2">
        {options.map((option) => (
          <ChoiceOption
            key={option.id}
            option={option}
            selected={selectedId === option.id}
            revealState={revealState}
            onClick={() => handleSelect(option)}
          />
        ))}
      </div>

      {revealState === "revealed" ? (
        <FeedbackPanel
          isCorrect={!!selected?.isCorrect}
          correctText={correctOption?.text || ""}
          feedbackNote={selected?.isCorrect ? (block?.feedback?.correct || null) : null}
          onContinue={onAdvance}
        />
      ) : null}
    </div>
  );
}

function SpeakSelfCheckBlock({ block, playText, onComplete, completed }) {
  return (
    <div>
      <div className="text-[15px] font-semibold text-zinc-100 mb-3">
        {block?.prompt || "Say it out loud"}
      </div>
      {block?.targetText ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[20px] font-semibold text-zinc-100">
              {block.targetText}
            </div>
            {block?.audioText ? (
              <AudioIconButton text={block.audioText} playText={playText} />
            ) : null}
          </div>
        </div>
      ) : null}
      <ActionButton
        variant={completed ? "secondary" : "primary"}
        onClick={onComplete}
        className="w-full"
      >
        {completed ? "Spoken ✓" : "I said it out loud"}
      </ActionButton>
    </div>
  );
}

function BuildPhraseBlock({ block, onComplete, completed }) {
  const tokens = Array.isArray(block?.tokens) ? block.tokens : [];
  const sortedTokens = [...tokens].sort((a, b) => a.correctIndex - b.correctIndex);
  const correctAnswer = block?.answerText || sortedTokens.map((t) => t.text).join(" ");

  const [built, setBuilt] = useState([]);
  const [revealed, setRevealed] = useState(false);

  const remaining = tokens.filter((token) => !built.includes(token.id));

  const checkPhrase = () => {
    if (built.length !== tokens.length) return;
    setRevealed(true);
    onComplete?.();
  };

  return (
    <div>
      <div className="text-[15px] font-semibold text-zinc-100 mb-3">
        {block?.prompt?.text || "Build the phrase"}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 min-h-[60px] mb-3">
        <div className="flex flex-wrap gap-2">
          {built.length ? (
            built.map((id) => {
              const token = tokens.find((t) => t.id === id);
              return (
                <button
                  key={id}
                  type="button"
                  data-press
                  onClick={() => { if (revealed) return; setBuilt((prev) => prev.filter((x) => x !== id)); }}
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-zinc-100"
                >
                  {token?.text}
                </button>
              );
            })
          ) : (
            <div className="text-sm text-zinc-500">Tap words below to build the phrase.</div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {remaining.map((token) => (
          <button
            key={token.id}
            type="button"
            data-press
            onClick={() => { if (revealed) return; setBuilt((prev) => [...prev, token.id]); }}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-300"
          >
            {token.text}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <ActionButton
          onClick={checkPhrase}
          disabled={built.length !== tokens.length || revealed}
          className="flex-1"
        >
          {revealed ? "Phrase built ✓" : "Check phrase"}
        </ActionButton>
        <ActionButton
          variant="ghost"
          onClick={() => { if (revealed) return; setBuilt([]); }}
          className="px-4"
        >
          Reset
        </ActionButton>
      </div>

      {revealed ? (
        <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] px-4 py-3">
          <div className="text-[13px] text-emerald-300 font-semibold">{correctAnswer}</div>
        </div>
      ) : null}
    </div>
  );
}

function ConversationBubble({ role, text }) {
  const isAssistant = role === "other";
  return (
    <div className={cn("flex", isAssistant ? "justify-start" : "justify-end")}>
      <div className={cn(
        "max-w-[80%] rounded-[20px] border px-4 py-2.5",
        isAssistant
          ? "border-white/10 bg-white/[0.035]"
          : "border-emerald-400/18 bg-emerald-500/[0.09]"
      )}>
        <div className="text-[14px] font-medium leading-snug text-zinc-100">{text}</div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-[20px] border border-white/10 bg-white/[0.035] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500/80 animate-pulse" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500/60 animate-pulse [animation-delay:120ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500/40 animate-pulse [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  );
}

function ScenarioTrayOption({ option, selectedId, revealState, onClick }) {
  const stateClass =
    revealState === "idle"
      ? "border-white/10 bg-white/[0.03] text-zinc-200 hover:border-white/20 hover:bg-white/[0.05]"
      : option.isCorrect
      ? "border-emerald-400/20 bg-emerald-500/[0.10] text-emerald-100"
      : selectedId === option.id
      ? "border-rose-400/20 bg-rose-500/[0.08] text-rose-200 line-through opacity-60"
      : "border-white/[0.06] bg-white/[0.02] text-zinc-500";

  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      disabled={revealState !== "idle"}
      className={cn(
        "w-full text-left rounded-2xl border px-4 py-3 text-[14px] transition",
        stateClass,
        revealState !== "idle" ? "cursor-default" : ""
      )}
    >
      {option.text}
    </button>
  );
}

function ScenarioChainBlock({ block, playText, onComplete }) {
  const steps = Array.isArray(block?.steps) ? block.steps : [];
  const timeoutsRef = useRef([]);
  const feedRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [assistantVisible, setAssistantVisible] = useState(false);
  const [assistantTyping, setAssistantTyping] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [revealState, setRevealState] = useState("idle");
  const [conversationComplete, setConversationComplete] = useState(false);

  const step = steps[stepIndex] || null;
  const options = Array.isArray(step?.options) ? step.options : [];
  const isLastStep = stepIndex >= steps.length - 1;

  useEffect(() => {
    return () => { timeoutsRef.current.forEach((id) => clearTimeout(id)); };
  }, []);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [history, assistantTyping, assistantVisible, conversationComplete]);

  const queueTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const showAssistantStep = (index) => {
    const nextStep = steps[index];
    if (!nextStep) return;
    setAssistantTyping(true);
    setAssistantVisible(false);
    setSelectedId(null);
    setRevealState("idle");
    queueTimeout(async () => {
      setAssistantTyping(false);
      setAssistantVisible(true);
      setHistory((prev) => [...prev, { role: "other", text: nextStep.text }]);
      try { await playText?.(nextStep.audioText || nextStep.text); } catch {}
    }, 850);
  };

  const startConversation = () => {
    if (started) return;
    setStarted(true);
    showAssistantStep(0);
  };

  const handleSelect = (option) => {
    if (!assistantVisible || revealState !== "idle") return;
    setSelectedId(option.id);
    setRevealState("revealed");
    setHistory((prev) => [...prev, { role: "you", text: option.text }]);
    if (isLastStep) {
      queueTimeout(() => { setConversationComplete(true); onComplete?.(); }, 250);
      return;
    }
    queueTimeout(() => {
      setStepIndex((prev) => prev + 1);
      showAssistantStep(stepIndex + 1);
    }, 850);
  };

  return (
    <div className="flex flex-col gap-3">
      {block?.description ? (
        <div className="text-[13px] text-zinc-400 leading-snug">
          {block.description}
        </div>
      ) : null}

      {/* Chat feed */}
      <div className="rounded-[24px] border border-white/10 bg-black/25 overflow-hidden">
        <div
          ref={feedRef}
          className="overflow-y-auto px-4 py-4 space-y-3"
          style={{ minHeight: 200, maxHeight: "38vh" }}
        >
          {!started ? (
            <div className="flex items-center justify-center" style={{ minHeight: 160 }}>
              <ActionButton onClick={startConversation}>
                Start conversation
              </ActionButton>
            </div>
          ) : (
            <>
              {history.map((item, index) => (
                <ConversationBubble
                  key={`${item.role}-${index}-${item.text}`}
                  role={item.role}
                  text={item.text}
                />
              ))}
              {assistantTyping ? <TypingBubble /> : null}
            </>
          )}
        </div>

        {/* Response tray */}
        {started && assistantVisible && !conversationComplete ? (
          <div className="border-t border-white/10 bg-black/25 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">
              Your response
            </div>
            <div className="grid gap-2">
              {options.map((option) => (
                <ScenarioTrayOption
                  key={option.id}
                  option={option}
                  selectedId={selectedId}
                  revealState={revealState}
                  onClick={() => handleSelect(option)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {conversationComplete ? (
        <SmallMetaPill accent="emerald">Conversation complete</SmallMetaPill>
      ) : null}
    </div>
  );
}

function BlockRenderer({ block, playText, onComplete, completed, onAdvance }) {
  switch (block?.type) {
    case "learn":
      return <LearnBlock block={block} playText={playText} onComplete={onComplete} completed={completed} />;
    case "recognise_mcq":
    case "listen_mcq":
    case "best_response":
      return <ChoiceBlock block={block} playText={playText} onComplete={onComplete} onAdvance={onAdvance} />;
    case "speak_self_check":
      return <SpeakSelfCheckBlock block={block} playText={playText} onComplete={onComplete} completed={completed} />;
    case "build_phrase":
      return <BuildPhraseBlock block={block} onComplete={onComplete} completed={completed} />;
    case "scenario_chain":
      return <ScenarioChainBlock block={block} playText={playText} onComplete={onComplete} />;
    default:
      return <div className="text-sm text-zinc-500">Unknown block type.</div>;
  }
}

// ─── Lesson complete card ─────────────────────────────────────────────────────

function LessonCompleteCard({ lessonTitle, onBack, onBrowseCourse }) {
  return (
    <SurfaceCard className="p-5">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">
        Lesson complete
      </div>
      <div className="mt-2 text-[22px] font-semibold text-zinc-100 leading-snug">
        {lessonTitle}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <SmallMetaPill accent="emerald">✓ Done</SmallMetaPill>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <ActionButton onClick={onBack} className="w-full">
          Back to training
        </ActionButton>
        {typeof onBrowseCourse === "function" ? (
          <ActionButton variant="ghost" onClick={onBrowseCourse} className="w-full">
            Browse course
          </ActionButton>
        ) : null}
      </div>
    </SurfaceCard>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function LearningLessonView({
  section,
  module,
  lesson,
  lessonIndex,
  playText,
  onBack,
  onBrowseCourse,
}) {
  const blocks = useMemo(
    () => (Array.isArray(lesson?.blocks) ? lesson.blocks : []),
    [lesson]
  );

  // "loading" | "running"
  const [phase, setPhase] = useState("loading");
  const [blockIndex, setBlockIndex] = useState(0);
  const [completedBlockIds, setCompletedBlockIds] = useState({});

  // Reset when lesson changes
  useEffect(() => {
    setPhase("loading");
    setBlockIndex(0);
    setCompletedBlockIds({});
  }, [lesson?.id]);

  // Preload audio fire-and-forget when loading screen mounts
  useEffect(() => {
    if (phase !== "loading") return;
    if (typeof playText !== "function") return;
    const texts = collectAudioTexts(blocks);
    // We call preloadText if available — playText is the one we have
    // so we silently attempt to warm the cache via playText with a
    // zero-volume trick isn't possible here; just fire preload attempts
    // via the existing hook's preload path if exposed.
    // For now this is fire-and-forget — the loading screen timer handles UX.
  }, [phase, blocks, playText]);

  const handleLoadingReady = useCallback(() => {
    setPhase("running");
  }, []);

  const currentBlock = blocks[blockIndex] || null;
  const totalBlocks = blocks.length;
  const progressPct = totalBlocks
    ? Math.round(((blockIndex + 1) / totalBlocks) * 100)
    : 0;

  const isCurrentCompleted = !!currentBlock?.id && !!completedBlockIds[currentBlock.id];
  const isLastBlock = blockIndex === totalBlocks - 1;
  const lessonComplete = isLastBlock && isCurrentCompleted;
  const isChoiceBlock =
    currentBlock?.type === "recognise_mcq" ||
    currentBlock?.type === "listen_mcq" ||
    currentBlock?.type === "best_response";
  const isScenarioBlock = currentBlock?.type === "scenario_chain";

  // Pattern note shows only after completing block 1
  const showPatternNote = blockIndex === 0 && isCurrentCompleted;

  // Nav bar hidden for choice blocks (feedback panel handles advance)
  const showNavBar = !lessonComplete && !isChoiceBlock;

  const advanceBlock = useCallback(() => {
    setBlockIndex((prev) => Math.min(totalBlocks - 1, prev + 1));
  }, [totalBlocks]);

  const markCurrentComplete = useCallback(() => {
    if (!currentBlock?.id) return;
    setCompletedBlockIds((prev) => {
      if (prev[currentBlock.id]) return prev;
      return { ...prev, [currentBlock.id]: true };
    });
  }, [currentBlock?.id]);

  const lessonDisplayLabel =
    typeof lessonIndex === "number"
      ? `Lesson ${lessonIndex + 1}`
      : "Lesson";

  if (!lesson) {
    return (
      <div className="max-w-xl mx-auto px-4 py-5">
        <div className="text-zinc-100">No lesson found.</div>
      </div>
    );
  }

  // ── Loading phase ────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="max-w-xl mx-auto h-full flex flex-col">
        {/* Back button stays visible during loading */}
        <div className="px-4 pt-5">
          <BackCircle onClick={onBack} />
        </div>
        <LessonLoadingScreen
          lesson={lesson}
          module={module}
          section={section}
          lessonDisplayLabel={lessonDisplayLabel}
          onReady={handleLoadingReady}
        />
      </div>
    );
  }

  // ── Running phase ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-6 flex flex-col">

      {/* Minimal header — no meta, just navigation */}
      <div className="grid grid-cols-[44px_1fr_44px] items-center mb-3">
        <BackCircle onClick={onBack} />

        <div className="text-center">
          <div className="text-[15px] font-semibold text-zinc-100">
            {lessonDisplayLabel}
          </div>
        </div>

        {typeof onBrowseCourse === "function" ? (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onBrowseCourse}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition leading-tight text-right"
              aria-label="Browse course"
            >
              Browse<br />course
            </button>
          </div>
        ) : (
          <div className="h-10 w-10" aria-hidden="true" />
        )}
      </div>

      {/* Progress bar + block counter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[11px] text-zinc-600">
            Block {Math.min(blockIndex + 1, totalBlocks)} / {totalBlocks}
          </div>
          <div className="text-[11px] text-zinc-600">
            {progressPct}%
          </div>
        </div>
        <div className="h-[3px] rounded-full bg-white/[0.07] overflow-hidden">
          <div
            className="h-full bg-emerald-500/80 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Block content */}
      {lessonComplete ? (
        <LessonCompleteCard
          lessonTitle={lesson.title}
          onBack={onBack}
          onBrowseCourse={onBrowseCourse}
        />
      ) : (
        <SurfaceCard className={cn(isScenarioBlock ? "p-3" : "p-4")}>
          {!isScenarioBlock ? (
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">
              {currentBlock?.title || ""}
            </div>
          ) : null}

          {currentBlock ? (
            <BlockRenderer
              key={currentBlock.id}
              block={currentBlock}
              playText={playText}
              onComplete={markCurrentComplete}
              completed={isCurrentCompleted}
              onAdvance={advanceBlock}
            />
          ) : (
            <div className="text-sm text-zinc-500">No block available.</div>
          )}
        </SurfaceCard>
      )}

      {/* Pattern note — only after block 1 complete */}
      {showPatternNote ? <PatternNote notes={lesson?.notes} /> : null}

      {/* Nav bar — hidden for choice blocks */}
      {showNavBar ? (
        <div className="mt-4 flex items-center gap-3">
          <ActionButton
            variant="ghost"
            onClick={() => setBlockIndex((prev) => Math.max(0, prev - 1))}
            disabled={blockIndex === 0}
            className="flex-1"
          >
            Back
          </ActionButton>
          <ActionButton
            onClick={advanceBlock}
            disabled={!isCurrentCompleted || isLastBlock}
            className="flex-1"
          >
            Next
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}

// src/views/training/LearningLessonView.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSpeechToTextHold from "../../hooks/useSpeechToTextHold";
import { useGameStore } from "../../stores/gameStore";
import { matchPairsCss } from "./matchPairs/matchPairsStyles";

const cn = (...xs) => xs.filter(Boolean).join(" ");

// ─── Audio feedback tones ─────────────────────────────────────────────────────

function playMicStart() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.08);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
    setTimeout(() => { try { ctx.close(); } catch {} }, 400);
  } catch {}
}

function playMicStop() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.1);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
    setTimeout(() => { try { ctx.close(); } catch {} }, 400);
  } catch {}
}

// ─── Phrase matching ──────────────────────────────────────────────────────────

function normaliseForMatch(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[.,!?;:"""''„"–—\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function phraseMatches(captured, target) {
  if (!captured || !target) return false;
  const c = normaliseForMatch(captured);
  const t = normaliseForMatch(target);
  if (!c || !t) return false;
  if (c === t) return true;
  if (c.includes(t)) return true;
  if (t.includes(c)) return true;
  const targetWords = t.split(" ").filter(Boolean);
  const capturedWords = c.split(" ").filter(Boolean);
  if (targetWords.length === 0) return false;
  const matched = targetWords.filter((w) => capturedWords.includes(w));
  return matched.length / targetWords.length >= 0.8;
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function BackCircle({ onClick }) {
  return (
    <button type="button" data-press onClick={onClick}
      className={cn("h-10 w-10 rounded-full border flex items-center justify-center shrink-0",
        "bg-white/[0.06] border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
        "hover:bg-white/[0.08] active:scale-[0.99] transition")}
      aria-label="Back">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
      </svg>
    </button>
  );
}

function SurfaceCard({ children, className }) {
  return (
    <div className={cn("rounded-3xl border border-white/10 bg-black/20 backdrop-blur", "shadow-[0_0_24px_rgba(0,0,0,0.18)]", className)}>
      {children}
    </div>
  );
}

function SmallMetaPill({ children, accent = "default" }) {
  const tone = accent === "emerald" ? "border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-200"
    : accent === "red" ? "border-rose-400/18 bg-rose-500/[0.08] text-rose-200"
    : "border-white/10 bg-white/[0.03] text-zinc-300";
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-1", "text-[11px] font-medium tracking-tight", tone)}>
      {children}
    </div>
  );
}

function ActionButton({ children, onClick, disabled = false, variant = "primary", className }) {
  const tone = variant === "primary" ? "bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black"
    : variant === "secondary" ? "bg-white/[0.05] hover:bg-white/[0.08] border-white/10 text-zinc-100"
    : "bg-transparent hover:bg-white/[0.05] border-white/10 text-zinc-300";
  return (
    <button type="button" data-press onClick={onClick} disabled={disabled}
      className={cn("rounded-2xl border px-4 py-3 text-sm font-semibold transition", tone, disabled ? "opacity-50 cursor-not-allowed" : "", className)}>
      {children}
    </button>
  );
}

function AudioIconButton({ text, playText, label = "Play audio" }) {
  return (
    <button type="button" data-press aria-label={label}
      onClick={() => { try { playText?.(text); } catch {} }}
      className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.04] text-zinc-200 flex items-center justify-center hover:bg-white/[0.07] transition shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M11 5L6.8 9H4v6h2.8L11 19V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 9.5C15.667 10.167 16 11 16 12C16 13 15.667 13.833 15 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M17.5 7C18.833 8.333 19.5 10 19.5 12C19.5 14 18.833 15.667 17.5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </button>
  );
}

// ─── Loading screen ───────────────────────────────────────────────────────────
// Bar fills then always auto-advances into the lesson.

function LessonLoadingScreen({ lesson, module, section, lessonDisplayLabel, onReady }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    let start = null;
    let animId = null;
    function step(ts) {
      if (!start) start = ts;
      const pct = Math.min(85, Math.round(85 * (1 - Math.exp(-(ts - start) / 600))));
      setProgress(pct);
      if (pct < 85) animId = requestAnimationFrame(step);
    }
    animId = requestAnimationFrame(step);
    const completeTimer = setTimeout(() => {
      setProgress(100);
      // Always auto-advance — user has already chosen to continue
      setTimeout(() => onReady?.(), 320);
    }, 1400);
    return () => { cancelAnimationFrame(raf); cancelAnimationFrame(animId); clearTimeout(completeTimer); };
  }, [onReady]);

  return (
    <div className={cn("flex flex-col h-full px-6 transition-opacity duration-300", visible ? "opacity-100" : "opacity-0")} style={{ paddingTop: "15vh" }}>
      <div className="text-[12px] text-zinc-500 tracking-wide">{section?.title || "First Contact"}</div>
      <div className="mt-2 text-[13px] font-medium text-zinc-400 uppercase tracking-widest">{lessonDisplayLabel}</div>
      <div className="mt-3 text-[28px] font-semibold text-zinc-100 leading-snug">{lesson?.title || "Loading…"}</div>
      {lesson?.purpose ? <div className="mt-3 text-[14px] text-zinc-400 leading-relaxed max-w-xs">{lesson.purpose}</div> : null}

      <div className="mt-10 max-w-xs">
        <div className="h-[3px] rounded-full bg-white/[0.08] overflow-hidden">
          <div className="h-full bg-emerald-500/70 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}/>
        </div>
        <div className="mt-2 text-[11px] text-zinc-600">Preparing lesson…</div>
      </div>
    </div>
  );
}

// ─── Feedback panel ───────────────────────────────────────────────────────────

function FeedbackPanel({ isCorrect, correctText, feedbackNote, onContinue }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const raf = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(raf); }, []);
  return (
    <div className={cn("mt-3 rounded-2xl border px-4 py-4 transition-all duration-250",
      isCorrect ? "border-emerald-400/25 bg-emerald-500/[0.08]" : "border-white/10 bg-white/[0.03]",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      <div className="flex items-start gap-3">
        <div className={cn("mt-[1px] h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold",
          isCorrect ? "bg-emerald-500/20 text-emerald-300" : "bg-white/[0.06] text-zinc-400")}>
          {isCorrect ? "✓" : "→"}
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn("text-[14px] font-semibold", isCorrect ? "text-emerald-200" : "text-zinc-200")}>
            {isCorrect ? "Correct!" : `Correct answer: ${correctText}`}
          </div>
          {feedbackNote ? <div className="mt-1 text-[12px] text-zinc-400 leading-snug">{feedbackNote}</div> : null}
        </div>
      </div>
      <div className="mt-3">
        <ActionButton onClick={onContinue} variant={isCorrect ? "primary" : "secondary"} className="w-full">Continue</ActionButton>
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
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">Pattern note</div>
        {notes.pattern ? <div className="mt-2 text-[13px] text-zinc-300 leading-snug">{notes.pattern}</div> : null}
        {Array.isArray(notes.usage) && notes.usage.length > 0 ? (
          <div className="mt-3 space-y-2">
            {notes.usage.map((item, index) => (
              <div key={`${item}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-zinc-300 leading-snug">{item}</div>
            ))}
          </div>
        ) : null}
      </SurfaceCard>
    </div>
  );
}

// ─── Block renderers ──────────────────────────────────────────────────────────

function LearnBlock({ block, playText, onComplete, completed, navBarRef }) {
  const items = Array.isArray(block?.items) ? block.items : [];
  const handleComplete = () => {
    onComplete?.();
    setTimeout(() => { navBarRef?.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, 120);
  };
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[17px] font-semibold text-zinc-100">{item.lt}</div>
              <div className="text-[13px] text-zinc-400 mt-0.5">{item.en}</div>
            </div>
            {item.audioText ? <AudioIconButton text={item.audioText} playText={playText} /> : null}
          </div>
        </div>
      ))}
      <div className="pt-2">
        <ActionButton onClick={completed ? undefined : handleComplete} variant={completed ? "secondary" : "primary"} className="w-full" disabled={completed}>
          {completed ? "Reviewed ✓" : "I've reviewed these"}
        </ActionButton>
      </div>
    </div>
  );
}

function ChoiceOption({ option, selected, revealState, onClick, playText, playAudio }) {
  const stateClass = revealState === "idle"
    ? selected ? "border-white/20 bg-white/[0.07] text-zinc-100"
      : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.05]"
    : option.isCorrect ? "border-emerald-400/20 bg-emerald-500/[0.10] text-emerald-100"
    : selected ? "border-rose-400/20 bg-rose-500/[0.08] text-rose-200 line-through opacity-60"
    : "border-white/[0.06] bg-white/[0.02] text-zinc-500";

  const handleClick = () => {
    // Only play audio immediately if this is the correct answer
    // Wrong answer audio (playing the correct option) is handled by ChoiceBlock
    if (playAudio && playText && option.text && option.isCorrect) {
      try { playText(option.text); } catch {}
    }
    onClick();
  };

  return (
    <button type="button" data-press onClick={handleClick} disabled={revealState !== "idle"}
      className={cn("w-full text-left rounded-2xl border px-4 py-3 text-[14px] transition", stateClass, revealState !== "idle" ? "cursor-default" : "")}>
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

  const isListen = block?.type === "listen_mcq";
  const isBestResponse = block?.type === "best_response";

  const promptText = block?.prompt?.text || "";
  const audioText = block?.prompt?.audioText || "";

  // Instruction label shown above the prompt
  const instructionLabel = isListen
    ? "Listen and choose"
    : isBestResponse
    ? "Choose the best response"
    : "Choose the correct answer";

  const handleSelect = (option) => {
    if (revealState !== "idle") return;
    setSelectedId(option.id);
    setRevealState("revealed");
    onComplete?.();
    if (isBestResponse) {
      // best_response: options are Lithuanian — play selected option if correct,
      // or play correct option after delay if wrong
      if (option.isCorrect) {
        try { playText?.(option.text); } catch {}
      } else {
        const correct = options.find((o) => o.isCorrect);
        if (correct?.text && playText) {
          setTimeout(() => { try { playText(correct.text); } catch {} }, 600);
        }
      }
    } else if (block?.type === "recognise_mcq") {
      // recognise_mcq comes in two forms:
      // A) Lithuanian prompt + English options → play prompt.audioText on correct
      // B) English prompt + Lithuanian options → play correct option text
      // Detect by whether prompt.audioText exists
      if (audioText) {
        // Form A: prompt is Lithuanian — play it on correct answer
        if (option.isCorrect) {
          try { playText?.(audioText); } catch {}
        } else {
          setTimeout(() => { try { playText?.(audioText); } catch {} }, 600);
        }
      } else {
        // Form B: options are Lithuanian — play correct option text
        if (option.isCorrect) {
          try { playText?.(option.text); } catch {}
        } else {
          const correct = options.find((o) => o.isCorrect);
          if (correct?.text && playText) {
            setTimeout(() => { try { playText(correct.text); } catch {} }, 600);
          }
        }
      }
    }
    // listen_mcq: options are English — never play audio on option tap
  };

  return (
    <div>
      {/* Instruction */}
      <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">
        {instructionLabel}
      </div>

      {/* For listen_mcq: show the Lithuanian text prominently with audio alongside */}
      {isListen && promptText ? (
        <div className="flex items-center justify-between gap-3 mb-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="text-[22px] font-semibold text-zinc-100">{promptText}</div>
          {audioText ? <AudioIconButton text={audioText} playText={playText} label="Hear the word" /> : null}
        </div>
      ) : isListen && audioText ? (
        // Fallback: no text, just a prominent audio button
        <div className="flex items-center justify-center mb-4">
          <button
            type="button"
            data-press
            aria-label="Play audio"
            onClick={() => { try { playText?.(audioText); } catch {} }}
            className="h-14 w-14 rounded-full border border-white/15 bg-white/[0.05] text-zinc-200 flex items-center justify-center hover:bg-white/[0.08] transition"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M11 5L6.8 9H4v6h2.8L11 19V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 9.5C15.667 10.167 16 11 16 12C16 13 15.667 13.833 15 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M17.5 7C18.833 8.333 19.5 10 19.5 12C19.5 14 18.833 15.667 17.5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      ) : promptText ? (
        // recognise_mcq and best_response: text prompt with optional audio
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="text-[15px] font-semibold text-zinc-100 leading-snug">{promptText}</div>
          {audioText ? <AudioIconButton text={audioText} playText={playText} /> : null}
        </div>
      ) : null}

      <div className="grid gap-2">
        {options.map((option) => (
          <ChoiceOption
            key={option.id}
            option={option}
            selected={selectedId === option.id}
            revealState={revealState}
            onClick={() => handleSelect(option)}
            playText={playText}
            playAudio={block?.type === "best_response"}
          />
        ))}
      </div>
      {revealState === "revealed" ? (
        <FeedbackPanel isCorrect={!!selected?.isCorrect} correctText={correctOption?.text || ""}
          feedbackNote={selected?.isCorrect ? (block?.feedback?.correct || null) : null} onContinue={onAdvance}/>
      ) : null}
    </div>
  );
}

function SpeakSelfCheckBlock({ block, playText, showToast, onComplete, completed }) {
  const [attemptState, setAttemptState] = useState("idle");
  const [capturedText, setCapturedText] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const targetText = block?.targetText || "";

  const { sttState, sttSupported, startRecording, stopRecording, cancelStt } = useSpeechToTextHold({
    showToast,
    blurTextarea: () => {},
    translating: false,
    setInput: (text) => {
      const captured = String(text || "").trim();
      setCapturedText(captured);
      if (phraseMatches(captured, targetText)) {
        setAttemptState("result_pass");
        onComplete?.();
      } else {
        setAttemptState("result_fail");
        setFailedAttempts((n) => n + 1);
      }
    },
    autoTranslate: false,
    onTranslateText: async () => {},
    onSpeechCaptured: () => { setCapturedText(""); setAttemptState("idle"); },
    language: "lt",
  });

  const isRecording = sttState === "recording";
  const isProcessing = sttState === "transcribing" || sttState === "translating";
  const isBusy = isRecording || isProcessing;
  const supported = sttSupported();
  const handleStart = () => { if (isBusy || completed) return; playMicStart(); startRecording(); };
  const handleStop = () => { if (!isRecording) return; playMicStop(); stopRecording(); };
  const micLabel = isRecording ? "Listening…" : isProcessing ? "Checking…" : supported ? "Hold to speak" : "Microphone unavailable";

  if (completed) {
    return (
      <div>
        <div className="text-[15px] font-semibold text-zinc-100 mb-3">{block?.prompt || "Say it out loud"}</div>
        {block?.targetText ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[20px] font-semibold text-zinc-100">{block.targetText}</div>
              {block?.audioText ? <AudioIconButton text={block.audioText} playText={playText} label="Hear the phrase" /> : null}
            </div>
          </div>
        ) : null}
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] px-4 py-3">
          <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] font-bold text-emerald-300 shrink-0">✓</div>
          <div className="text-[13px] text-emerald-200 font-medium">Spoken</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-[15px] font-semibold text-zinc-100 mb-3">{block?.prompt || "Say it out loud"}</div>
      {block?.targetText ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 mb-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[20px] font-semibold text-zinc-100">{block.targetText}</div>
            {block?.audioText ? <AudioIconButton text={block.audioText} playText={playText} label="Hear the phrase" /> : null}
          </div>
        </div>
      ) : null}
      {attemptState === "result_pass" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] px-4 py-3">
          <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] font-bold text-emerald-300 shrink-0">✓</div>
          <div className="text-[13px] text-emerald-200 font-medium">{capturedText ? `"${capturedText}"` : "Spoken"}</div>
        </div>
      ) : null}
      {attemptState === "result_fail" ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">We heard</div>
            <div className="text-[16px] font-semibold text-zinc-300">{capturedText || "—"}</div>
          </div>
          <div className="text-[12px] text-zinc-500 text-center">Expected: <span className="text-zinc-300">{targetText}</span></div>
          <div className="flex gap-2">
            <ActionButton variant="secondary" onClick={() => { setCapturedText(""); setAttemptState("idle"); }} className="flex-1">Try again</ActionButton>
            {failedAttempts >= 2 ? (
              <ActionButton variant="ghost" onClick={() => { onComplete?.(); }} className="flex-1">Skip</ActionButton>
            ) : null}
          </div>
        </div>
      ) : null}
      {attemptState !== "result_pass" ? (
        <div className={cn("flex flex-col items-center gap-3", attemptState === "result_fail" ? "mt-3" : "")}>
          {!supported ? (
            <ActionButton variant="secondary" onClick={() => onComplete?.()} className="w-full">Mark as spoken</ActionButton>
          ) : (
            <>
              <button type="button" disabled={isProcessing}
                onMouseDown={(e) => { e.preventDefault(); handleStart(); }}
                onMouseUp={(e) => { e.preventDefault(); handleStop(); }}
                onMouseLeave={(e) => { e.preventDefault(); handleStop(); }}
                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); handleStart(); }}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleStop(); }}
                onTouchCancel={(e) => { e.preventDefault(); cancelStt(); }}
                className={cn("h-20 w-20 rounded-full border-2 flex items-center justify-center transition-all select-none",
                  isRecording ? "bg-emerald-500/25 border-emerald-400/60 scale-105 shadow-[0_0_32px_rgba(16,185,129,0.3)]"
                  : isProcessing ? "bg-white/[0.06] border-white/10 opacity-70"
                  : "bg-white/[0.06] border-white/15 hover:bg-white/[0.09] active:scale-95")}
                aria-label={micLabel}>
                {isProcessing ? (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-400 animate-pulse" />
                    <span className="h-2 w-2 rounded-full bg-zinc-400 animate-pulse [animation-delay:120ms]" />
                    <span className="h-2 w-2 rounded-full bg-zinc-400 animate-pulse [animation-delay:240ms]" />
                  </div>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={isRecording ? "text-emerald-300" : "text-zinc-300"}>
                    <path d="M12 14.25c1.656 0 3-1.344 3-3V6.75c0-1.656-1.344-3-3-3s-3 1.344-3 3v4.5c0 1.656 1.344 3 3 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.5 10.5v.75c0 2.485 2.015 4.5 4.5 4.5s4.5-2.015 4.5-4.5v-.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15.75V19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M9.75 19.5h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
              <div className={cn("text-[12px] transition-colors", isRecording ? "text-emerald-300" : isProcessing ? "text-zinc-400" : "text-zinc-500")}>{micLabel}</div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ─── Build phrase ─────────────────────────────────────────────────────────────
//
// All tokens are shown and tappable — including distractors (isDistractor:true).
// "Check phrase" enables once the user has placed exactly as many tokens as
// the correct answer requires (answerTokens.length).
// On check: compare built text against correctAnswer.
//   Correct → green, mark complete.
//   Wrong   → red, show correct answer, allow retry.
// Tapping a built token removes it back to the source row (ghost stays).

function BuildPhraseBlock({ block, playText, onComplete, completed }) {
  const tokens = Array.isArray(block?.tokens) ? block.tokens : [];

  const answerTokens = tokens
    .filter((t) => !t.isDistractor)
    .sort((a, b) => a.correctIndex - b.correctIndex);

  const correctAnswer = block?.answerText || answerTokens.map((t) => t.text).join(" ");
  const requiredLength = answerTokens.length;

  const [built, setBuilt] = useState([]);
  const [checkState, setCheckState] = useState("idle"); // "idle" | "correct" | "wrong"
  const [revealed, setRevealed] = useState(false);

  const placedIds = new Set(built);
  const isReady = built.length === requiredLength && requiredLength > 0;

  const checkPhrase = () => {
    if (!isReady || revealed) return;
    const builtText = built
      .map((id) => tokens.find((t) => t.id === id)?.text || "")
      .join(" ")
      .trim();
    if (builtText === correctAnswer.trim()) {
      setCheckState("correct");
      setRevealed(true);
      // Play the phrase audio on correct answer
      if (playText) { try { playText(correctAnswer.trim()); } catch {} }
      onComplete?.();
    } else {
      setCheckState("wrong");
    }
  };

  const handleRetry = () => {
    setBuilt([]);
    setCheckState("idle");
  };

  return (
    <div>
      <div className="text-[15px] font-semibold text-zinc-100 mb-3">{block?.prompt?.text || "Build the phrase"}</div>

      {/* Answer area */}
      <div className={cn(
        "rounded-2xl border px-4 py-4 min-h-[60px] mb-4 transition",
        checkState === "correct" ? "border-emerald-400/20 bg-emerald-500/[0.06]"
        : checkState === "wrong" ? "border-rose-400/20 bg-rose-500/[0.05]"
        : "border-white/10 bg-white/[0.03]"
      )}>
        <div className="flex flex-wrap gap-2">
          {built.length ? (
            built.map((id) => {
              const token = tokens.find((t) => t.id === id);
              return (
                <button key={id} type="button" data-press
                  onClick={() => { if (revealed) return; setBuilt((prev) => prev.filter((x) => x !== id)); setCheckState("idle"); }}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm transition",
                    checkState === "correct"
                      ? "border-emerald-400/20 bg-emerald-500/[0.10] text-emerald-100 cursor-default"
                      : checkState === "wrong"
                      ? "border-rose-400/20 bg-rose-500/[0.10] text-rose-200"
                      : "border-white/10 bg-white/[0.06] text-zinc-100 hover:bg-white/[0.09]"
                  )}>
                  {token?.text}
                </button>
              );
            })
          ) : (
            <div className="text-sm text-zinc-500">Tap words below to build the phrase.</div>
          )}
        </div>
      </div>

      {/* Source tokens — ghost placeholder keeps positions stable */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tokens.map((token) => {
          const isPlaced = placedIds.has(token.id);
          return isPlaced ? (
            <div key={token.id}
              className="rounded-xl border border-white/[0.04] px-3 py-2 text-sm text-transparent select-none pointer-events-none"
              aria-hidden="true">
              {token.text}
            </div>
          ) : (
            <button key={token.id} type="button" data-press
              onClick={() => {
                if (revealed) return;
                setBuilt((prev) => [...prev, token.id]);
                if (checkState !== "idle") setCheckState("idle");
              }}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:border-white/20">
              {token.text}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {checkState === "wrong" ? (
        <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="text-[11px] uppercase tracking-widest text-zinc-600 mb-1">Correct phrase</div>
          <div className="text-[14px] font-semibold text-zinc-200">{correctAnswer}</div>
        </div>
      ) : null}

      {checkState === "correct" ? (
        <div className="mb-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] px-4 py-3">
          <div className="text-[13px] text-emerald-300 font-semibold">{correctAnswer}</div>
        </div>
      ) : null}

      <div className="flex gap-2">
        {checkState === "wrong" ? (
          <ActionButton onClick={handleRetry} variant="secondary" className="flex-1">Try again</ActionButton>
        ) : (
          <ActionButton onClick={checkPhrase} disabled={!isReady || revealed} className="flex-1">
            {revealed ? "Phrase built ✓" : "Check phrase"}
          </ActionButton>
        )}
        {!revealed ? (
          <ActionButton variant="ghost" onClick={() => { setBuilt([]); setCheckState("idle"); }} className="px-4">Reset</ActionButton>
        ) : null}
      </div>
    </div>
  );
}

function ConversationBubble({ role, text }) {
  const isAssistant = role === "other";
  return (
    <div className={cn("flex", isAssistant ? "justify-start" : "justify-end")}>
      <div className={cn("max-w-[80%] rounded-[20px] border px-4 py-2.5",
        isAssistant ? "border-white/10 bg-white/[0.035]" : "border-emerald-400/18 bg-emerald-500/[0.09]")}>
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
  const stateClass = revealState === "idle"
    ? "border-white/10 bg-white/[0.03] text-zinc-200 hover:border-white/20 hover:bg-white/[0.05]"
    : option.isCorrect ? "border-emerald-400/20 bg-emerald-500/[0.10] text-emerald-100"
    : selectedId === option.id ? "border-rose-400/20 bg-rose-500/[0.08] text-rose-200 line-through opacity-60"
    : "border-white/[0.06] bg-white/[0.02] text-zinc-500";

  return (
    <button type="button" data-press onClick={onClick} disabled={revealState !== "idle"}
      className={cn("w-full text-left rounded-2xl border px-4 py-3 text-[14px] transition", stateClass, revealState !== "idle" ? "cursor-default" : "")}>
      {option.text}
    </button>
  );
}

// ─── Scenario chain — description shown ABOVE chat window, never read by TTS ──

function ScenarioChainBlock({ block, playText, onComplete, onAdvance }) {
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

  useEffect(() => { return () => { timeoutsRef.current.forEach((id) => clearTimeout(id)); }; }, []);
  useEffect(() => { const el = feedRef.current; if (!el) return; el.scrollTop = el.scrollHeight; }, [history, assistantTyping, assistantVisible, conversationComplete]);

  const queueTimeout = (fn, delay) => { const id = setTimeout(fn, delay); timeoutsRef.current.push(id); return id; };

  const showAssistantStep = (index) => {
    const nextStep = steps[index];
    if (!nextStep) return;
    setAssistantTyping(true); setAssistantVisible(false); setSelectedId(null); setRevealState("idle");
    queueTimeout(async () => {
      setAssistantTyping(false); setAssistantVisible(true);
      setHistory((prev) => [...prev, { role: "other", text: nextStep.text }]);
      // Only play audioText — never the description or any English text
      const audio = nextStep.audioText || null;
      if (audio) { try { await playText?.(audio); } catch {} }
    }, 850);
  };

  const startConversation = () => { if (started) return; setStarted(true); showAssistantStep(0); };

  const handleSelect = (option) => {
    if (!assistantVisible || revealState !== "idle") return;
    setSelectedId(option.id); setRevealState("revealed");
    setHistory((prev) => [...prev, { role: "you", text: option.text }]);
    if (isLastStep) {
      // Show celebration panel — user taps Continue to call onComplete
      queueTimeout(() => setConversationComplete(true), 400);
      return;
    }
    queueTimeout(() => { setStepIndex((prev) => prev + 1); showAssistantStep(stepIndex + 1); }, 850);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Description — outside chat window, never touched by TTS */}
      {block?.description ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <div className="text-[11px] uppercase tracking-widest text-zinc-600 mb-1">Scenario</div>
          <div className="text-[13px] text-zinc-400 leading-snug">{block.description}</div>
        </div>
      ) : null}

      <div className="rounded-[24px] border border-white/10 bg-black/25 overflow-hidden">
        <div ref={feedRef} className="overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 200, maxHeight: "38vh" }}>
          {!started ? (
            <div className="flex items-center justify-center" style={{ minHeight: 160 }}>
              <ActionButton onClick={startConversation}>Start conversation</ActionButton>
            </div>
          ) : (
            <>
              {history.map((item, index) => <ConversationBubble key={`${item.role}-${index}-${item.text}`} role={item.role} text={item.text} />)}
              {assistantTyping ? <TypingBubble /> : null}
            </>
          )}
        </div>
        {started && assistantVisible && !conversationComplete ? (
          <div className="border-t border-white/10 bg-black/25 px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Your response</div>
            <div className="grid gap-2">
              {options.map((option) => <ScenarioTrayOption key={option.id} option={option} selectedId={selectedId} revealState={revealState} onClick={() => handleSelect(option)}/>)}
            </div>
          </div>
        ) : null}
      </div>
      {/* Celebration panel — user taps Continue to proceed */}
      {conversationComplete ? (
        <ScenarioCompletePanel onContinue={() => {
          onComplete?.();
          // Always try to advance — advanceBlock clamps to last block,
          // so for the final block this is safe and lessonComplete renders.
          onAdvance?.();
        }} />
      ) : null}
    </div>
  );
}

function ScenarioCompletePanel({ onContinue }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={cn(
      "rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.08] px-4 py-4",
      "transition-all duration-300",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
    )}>
      <div className="flex items-start gap-3 mb-4">
        <div className="h-6 w-6 rounded-full bg-emerald-500/25 flex items-center justify-center shrink-0 text-[13px] font-bold text-emerald-300">
          ✓
        </div>
        <div>
          <div className="text-[15px] font-semibold text-emerald-200">Well done!</div>
          <div className="text-[13px] text-zinc-400 mt-0.5 leading-snug">
            You completed the conversation correctly.
          </div>
        </div>
      </div>
      <ActionButton onClick={onContinue} className="w-full">Continue</ActionButton>
    </div>
  );
}


// ─── Word match block ─────────────────────────────────────────────────────────
// Uses the same CSS as the practice mode MatchPairsView.
// Session logic is inlined so no new import is needed.
// Audio plays on correct match. Wrong match also plays the correct pair's audio.


function tileTextClass(text) {
  const t = String(text || "").trim();
  if (!t) return "text-base";
  if (t.length >= 22) return "text-sm";
  return "text-base";
}

function useWordMatchSession({ rawPairs, pagePairs, rightSelectAmberMs, correctPulseMs, wrongPulseMs, pageFadeOutMs, pageFadeInMs }) {
  function shuffleArr(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const totalPairs = rawPairs.length;
  const requiredPages = Math.ceil(totalPairs / pagePairs);

  const [pages, setPages] = React.useState([]);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [selected, setSelected] = React.useState(null);
  const [matchedPairIds, setMatchedPairIds] = React.useState(() => new Set());
  const [busy, setBusy] = React.useState(false);
  const [phase, setPhase] = React.useState("ready");
  const [mistakes, setMistakes] = React.useState(0);
  const [overallMatched, setOverallMatched] = React.useState(0);
  const [showDone, setShowDone] = React.useState(false);
  const [pulse, setPulse] = React.useState(null);
  const [lastCorrectMatchAudio, setLastCorrectMatchAudio] = React.useState(null);
  const timersRef = React.useRef([]);

  function clearTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }

  React.useEffect(() => {
    if (!rawPairs || rawPairs.length === 0) return;
    const shuffled = shuffleArr(rawPairs);
    const builtPages = [];
    let idx = 0;
    for (let p = 0; p < requiredPages; p++) {
      const chunk = shuffled.slice(idx, idx + pagePairs);
      idx += pagePairs;
      if (!chunk.length) break;
      const left = shuffleArr(chunk.map((x) => ({ id: `t_lt_${x.id}_${p}`, pairId: x.id, side: "lt", text: x.lt, audioText: x.audioText || x.lt })));
      const right = shuffleArr(chunk.map((x) => ({ id: `t_en_${x.id}_${p}`, pairId: x.id, side: "en", text: x.en })));
      builtPages.push({ pageIndex: p, left, right });
    }
    setPages(builtPages);
    setPageIndex(0); setSelected(null); setMatchedPairIds(new Set());
    setBusy(false); setPhase("ready"); setMistakes(0);
    setOverallMatched(0); setShowDone(false); setPulse(null); setLastCorrectMatchAudio(null);
    return () => clearTimers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentPage = React.useMemo(() => pages[pageIndex] || null, [pages, pageIndex]);
  const tileById = React.useMemo(() => {
    const map = new Map();
    (currentPage?.left || []).forEach((t) => map.set(t.id, t));
    (currentPage?.right || []).forEach((t) => map.set(t.id, t));
    return map;
  }, [currentPage]);

  const progress = React.useMemo(() => ({
    matched: overallMatched, total: totalPairs, page: pageIndex + 1, pages: requiredPages,
  }), [overallMatched, totalPairs, pageIndex, requiredPages]);

  function startPageFadeTo(nextIndex) {
    setPhase("pageFadeOut"); setBusy(true); setPulse(null);
    const t1 = setTimeout(() => {
      setPageIndex(nextIndex); setMatchedPairIds(new Set()); setSelected(null); setPulse(null); setPhase("pageFadeIn");
      const t2 = setTimeout(() => { setPhase("ready"); setBusy(false); }, pageFadeInMs);
      timersRef.current.push(t2);
    }, pageFadeOutMs);
    timersRef.current.push(t1);
  }

  function tap(tileId) {
    if (busy || showDone || !currentPage) return;
    const tile = tileById.get(tileId);
    if (!tile || matchedPairIds.has(tile.pairId)) return;
    if (!selected) { setSelected({ side: tile.side, id: tile.id }); setPulse(null); return; }
    if (selected.id === tile.id) { setSelected(null); setPulse(null); return; }
    const first = tileById.get(selected.id);
    const second = tile;
    if (first?.side === second.side) { setSelected({ side: second.side, id: second.id }); setPulse(null); return; }
    if (!first || !second) { setSelected(null); setPulse(null); return; }
    setBusy(true);
    const firstId = first.id; const secondId = second.id;
    setSelected({ side: second.side, id: secondId });
    const tAmber = setTimeout(() => {
      const correct = first.pairId === second.pairId;
      if (correct) {
        setPulse({ kind: "correct", ids: [firstId, secondId] });
        const tPulse = setTimeout(() => {
          const next = new Set(matchedPairIds);
          next.add(first.pairId);
          setMatchedPairIds(next);
          const newOverall = overallMatched + 1;
          setOverallMatched(newOverall);
          const audioText = first.side === "lt" ? (first.audioText || first.text) : (second.side === "lt" ? (second.audioText || second.text) : first.text);
          setLastCorrectMatchAudio({ key: `${first.pairId}_${Date.now()}`, text: audioText });
          setSelected(null); setPulse(null);
          const pageSize = Math.min(pagePairs, (currentPage?.left || []).length);
          if (next.size >= pageSize) {
            const nextPage = pageIndex + 1;
            if (nextPage >= pages.length) {
              setTimeout(() => { setShowDone(true); setBusy(false); setPhase("ready"); setPulse(null); setSelected(null); }, pageFadeOutMs);
            } else { startPageFadeTo(nextPage); }
          } else { setBusy(false); }
        }, correctPulseMs);
        timersRef.current.push(tPulse);
        return;
      }
      // Wrong — play correct pair's audio
      setPulse({ kind: "wrong", ids: [firstId, secondId] });
      setMistakes((m) => m + 1);
      const correctAudio = first.side === "lt" ? (first.audioText || first.text) : (second.side === "lt" ? (second.audioText || second.text) : "");
      if (correctAudio) setLastCorrectMatchAudio({ key: `wrong_${first.pairId}_${Date.now()}`, text: correctAudio });
      const tPulse = setTimeout(() => { setPulse(null); setSelected(null); setBusy(false); }, wrongPulseMs);
      timersRef.current.push(tPulse);
    }, rightSelectAmberMs);
    timersRef.current.push(tAmber);
  }

  return { progress, leftTiles: currentPage?.left || [], rightTiles: currentPage?.right || [], selected, matchedPairIds, pulse, busy, phase, mistakes, showDone, tap, lastCorrectMatchAudio };
}

function WordMatchBlock({ block, playText, onComplete, onAdvance, completed }) {
  const rawPairs = Array.isArray(block?.pairs) ? block.pairs : [];

  const s = useWordMatchSession({
    rawPairs,
    pagePairs: 5,
    rightSelectAmberMs: 140,
    correctPulseMs: 520,
    wrongPulseMs: 420,
    pageFadeOutMs: 280,
    pageFadeInMs: 220,
  });

  const lastPlayedRef = React.useRef("");

  React.useEffect(() => {
    const payload = s.lastCorrectMatchAudio;
    if (!payload) return;
    const key = String(payload.key || "").trim();
    const text = String(payload.text || "").trim();
    if (!key || !text || key === lastPlayedRef.current) return;
    if (typeof playText !== "function") return;
    lastPlayedRef.current = key;
    try { playText(text); } catch {}
  }, [playText, s.lastCorrectMatchAudio]);

  React.useEffect(() => {
    if (s.showDone) {
      onComplete?.();
      // Advance to next block (triggers lessonDone if this is the last block)
      onAdvance?.();
    }
  }, [s.showDone, onComplete, onAdvance]);

  const pct = s.progress.total ? Math.min(100, Math.round((s.progress.matched / s.progress.total) * 100)) : 0;
  const gridPhaseClass = s.phase === "pageFadeOut" ? "mp-grid-fadeout" : "mp-grid-fadein";
  const pulseIds = s.pulse?.ids || [];
  const pulseKind = s.pulse?.kind || null;
  const selectedId = s.selected?.id || null;
  const TILE_H = 56;
  const COL_GAP = 8;
  const tileStyle = { height: TILE_H, minHeight: TILE_H, padding: "10px 12px", margin: 0 };

  if (completed && s.showDone) {
    return (
      <>
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] px-4 py-3">
          <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] font-bold text-emerald-300 shrink-0">✓</div>
          <div className="text-[13px] text-emerald-200 font-medium">All pairs matched</div>
        </div>
        <style>{matchPairsCss}</style>
      </>
    );
  }

  return (
    <div className="mp-root">
      <div className="mb-3">
        <div className="mp-progress-track">
          <div className="mp-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-zinc-500">
          <div>{s.progress.matched}/{s.progress.total} matched · Page {s.progress.page}/{s.progress.pages}</div>
          <div>{s.mistakes} mistake{s.mistakes === 1 ? "" : "s"}</div>
        </div>
      </div>

      <div className={cn("mp-grid-wrap", gridPhaseClass)}>
        <div className="mp-cols" style={{ gap: COL_GAP }}>
          <div className="mp-col" style={{ gap: COL_GAP }}>
            {s.leftTiles.map((t) => {
              const matched = s.matchedPairIds.has(t.pairId);
              const amber = selectedId === t.id;
              const pulse = pulseIds.includes(t.id) && pulseKind ? (pulseKind === "correct" ? "mp-pulse-correct" : "mp-pulse-wrong") : "";
              return (
                <button key={t.id} type="button" style={tileStyle}
                  className={cn("mp-tile", tileTextClass(t.text), amber ? "mp-tile-amber" : "", matched ? "mp-tile-cleared" : "", pulse)}
                  onClick={() => s.tap(t.id)} disabled={matched || s.busy} aria-pressed={amber}>
                  {t.text}
                </button>
              );
            })}
          </div>
          <div className="mp-col" style={{ gap: COL_GAP }}>
            {s.rightTiles.map((t) => {
              const matched = s.matchedPairIds.has(t.pairId);
              const amber = selectedId === t.id;
              const pulse = pulseIds.includes(t.id) && pulseKind ? (pulseKind === "correct" ? "mp-pulse-correct" : "mp-pulse-wrong") : "";
              return (
                <button key={t.id} type="button" style={tileStyle}
                  className={cn("mp-tile", tileTextClass(t.text), amber ? "mp-tile-amber" : "", matched ? "mp-tile-cleared" : "", pulse)}
                  onClick={() => s.tap(t.id)} disabled={matched || s.busy}>
                  {t.text}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <style>{matchPairsCss}</style>
    </div>
  );
}

function BlockRenderer({ block, playText, showToast, onComplete, completed, onAdvance, navBarRef }) {
  switch (block?.type) {
    case "learn": return <LearnBlock block={block} playText={playText} onComplete={onComplete} completed={completed} navBarRef={navBarRef}/>;
    case "recognise_mcq": case "listen_mcq": case "best_response":
      return <ChoiceBlock block={block} playText={playText} onComplete={onComplete} onAdvance={onAdvance}/>;
    case "speak_self_check":
      return <SpeakSelfCheckBlock block={block} playText={playText} showToast={showToast} onComplete={onComplete} completed={completed}/>;
    case "build_phrase": return <BuildPhraseBlock block={block} playText={playText} onComplete={onComplete} completed={completed}/>;
    case "word_match": return <WordMatchBlock block={block} playText={playText} onComplete={onComplete} onAdvance={onAdvance} completed={completed}/>;
    case "scenario_chain": return <ScenarioChainBlock block={block} playText={playText} onComplete={onComplete} onAdvance={onAdvance}/>;
    default: return <div className="text-sm text-zinc-500">Unknown block type.</div>;
  }
}

// ─── Lesson complete card ─────────────────────────────────────────────────────

function NailedItCard({ lessonTitle, xpEarned, onContinue, nextLessonLabel, onBack }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={cn("flex flex-col transition-all duration-400", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
      style={{ paddingTop: "12vh" }}
    >
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-full border border-emerald-400/30 bg-emerald-500/[0.12] flex items-center justify-center text-[28px]">
          ✓
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <div className="text-[26px] font-semibold text-emerald-200 leading-tight">Nailed it!</div>
        <div className="mt-2 text-[14px] text-zinc-400">{lessonTitle}</div>
        {xpEarned ? (
          <div className="mt-3 flex justify-center">
            <SmallMetaPill accent="emerald">+{xpEarned} XP earned</SmallMetaPill>
          </div>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 px-2">
        {typeof onContinue === "function" ? (
          <ActionButton onClick={onContinue} className="w-full">
            {nextLessonLabel ? `${nextLessonLabel} →` : "Continue →"}
          </ActionButton>
        ) : null}
        <ActionButton
          variant={typeof onContinue === "function" ? "ghost" : "primary"}
          onClick={onBack}
          className="w-full"
        >
          Learning home
        </ActionButton>
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function LearningLessonView({
  section, module, lesson, lessonIndex, playText, showToast,
  userId, onBack, onBrowseCourse, onLessonComplete, onNextLesson,
  onNailedItContinue, // called when user taps Continue on NailedItCard
  nextLessonLabel,
  preloadText,
}) {
  const blocks = useMemo(() => (Array.isArray(lesson?.blocks) ? lesson.blocks : []), [lesson]);
  const [phase, setPhase] = useState("loading");
  const [blockIndex, setBlockIndex] = useState(0);
  const [completedBlockIds, setCompletedBlockIds] = useState({});
  const [xpEarned, setXpEarned] = useState(null);
  const [lessonDone, setLessonDone] = useState(false); // true only after user taps Continue/advance on last block
  const navBarRef = useRef(null);
  const completionFiredRef = useRef(false);

  const completeLesson = useGameStore((s) => s.completeLesson);
  const earnXP = useGameStore((s) => s.earnXP);

  useEffect(() => {
    setPhase("loading");
    setBlockIndex(0);
    setCompletedBlockIds({});
    setXpEarned(null);
    setLessonDone(false);
    completionFiredRef.current = false;
  }, [lesson?.id]);

  const handleLoadingReady = useCallback(() => setPhase("running"), []);

  // Preload all audio from this lesson while loading screen shows
  useEffect(() => {
    if (!lesson || typeof preloadText !== "function") return;
    const texts = new Set();
    (lesson.blocks || []).forEach((block) => {
      if (block?.prompt?.audioText) texts.add(block.prompt.audioText);
      if (block?.audioText) texts.add(block.audioText);
      if (block?.targetText) texts.add(block.targetText);
      if (Array.isArray(block?.items)) {
        block.items.forEach((item) => { if (item?.audioText) texts.add(item.audioText); });
      }
      if (Array.isArray(block?.steps)) {
        block.steps.forEach((step) => { if (step?.audioText) texts.add(step.audioText); });
      }
      if (Array.isArray(block?.pairs)) {
        block.pairs.forEach((pair) => { if (pair?.audioText) texts.add(pair.audioText); });
      }
      if (Array.isArray(block?.options)) {
        block.options.forEach((opt) => { if (opt?.audioText) texts.add(opt.audioText); });
      }
    });
    // Stagger preload calls to avoid bursting the TTS endpoint
    Array.from(texts).forEach((text, i) => {
      setTimeout(() => {
        try { preloadText(text).catch?.(() => {}); } catch {}
      }, i * 120);
    });
  }, [lesson, preloadText]);

  const currentBlock = blocks[blockIndex] || null;
  const totalBlocks = blocks.length;
  const progressPct = totalBlocks ? Math.round(((blockIndex + 1) / totalBlocks) * 100) : 0;
  const isCurrentCompleted = !!currentBlock?.id && !!completedBlockIds[currentBlock.id];
  const isLastBlock = blockIndex === totalBlocks - 1;
  const isLastBlockComplete = isLastBlock && isCurrentCompleted;
  const lessonComplete = lessonDone;
  const isChoiceBlock = ["recognise_mcq", "listen_mcq", "best_response"].includes(currentBlock?.type);
  const isScenarioBlock = currentBlock?.type === "scenario_chain";
  const showPatternNote = blockIndex === 0 && isCurrentCompleted;
  const showNavBar = !lessonComplete && !isLastBlockComplete && !isChoiceBlock && !isScenarioBlock;

  // Fire completion once when lessonDone becomes true
  useEffect(() => {
    if (!lessonDone || completionFiredRef.current) return;
    completionFiredRef.current = true;
    if (lesson?.id) {
      const { wasAlreadyComplete } = completeLesson(lesson.id, userId);
      if (!wasAlreadyComplete) {
        const result = earnXP("complete_lesson", userId);
        if (result?.xpGained) setXpEarned(result.xpGained);
      }
    }
    onLessonComplete?.();
  }, [lessonComplete, lesson?.id, userId, completeLesson, earnXP, onLessonComplete]);

  const advanceBlock = useCallback(() => {
    setBlockIndex((prev) => {
      if (prev >= totalBlocks - 1) {
        // Last block — trigger lesson done instead of advancing
        setLessonDone(true);
        return prev;
      }
      return prev + 1;
    });
  }, [totalBlocks]);

  const markCurrentComplete = useCallback(() => {
    if (!currentBlock?.id) return;
    setCompletedBlockIds((prev) => prev[currentBlock.id] ? prev : { ...prev, [currentBlock.id]: true });
  }, [currentBlock?.id]);

  // "Lesson 3" — clean label without nested numbering codes
  const lessonDisplayLabel = typeof lessonIndex === "number" ? `Lesson ${lessonIndex + 1}` : "Lesson";

  if (!lesson) return <div className="max-w-xl mx-auto px-4 py-5"><div className="text-zinc-100">No lesson found.</div></div>;

  if (phase === "loading") {
    return (
      <div className="max-w-xl mx-auto h-full flex flex-col" data-swipe-block="true">
        <div className="px-4 pt-5"><BackCircle onClick={onBack} /></div>
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

  return (
    <div className="max-w-xl mx-auto px-4 pt-4 pb-6 flex flex-col" data-swipe-block="true">

      {/* ── Lesson complete — full screen NailedItCard, no header/progress ── */}
      {lessonComplete ? (
        <NailedItCard
          lessonTitle={lesson.title}
          xpEarned={xpEarned}
          onContinue={typeof onNailedItContinue === "function" ? onNailedItContinue : onNextLesson}
          nextLessonLabel={nextLessonLabel}
          onBack={onBack}
        />
      ) : (
        <>
          {/* Header */}
          <div className="grid grid-cols-[44px_1fr_44px] items-center mb-3">
            <BackCircle onClick={onBack} />
            <div className="text-center">
                <div className="text-[11px] text-zinc-500 tracking-wide">{section?.title || ""}</div>
                <div className="text-[15px] font-semibold text-zinc-100 leading-tight">{lessonDisplayLabel}</div>
              </div>
            {typeof onBrowseCourse === "function" ? (
              <div className="flex items-center justify-end">
                <button type="button" onClick={onBrowseCourse} className="text-[11px] text-zinc-500 hover:text-zinc-300 transition leading-tight text-right" aria-label="Browse course">
                  Browse<br />course
                </button>
              </div>
            ) : <div className="h-10 w-10" aria-hidden="true" />}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[11px] text-zinc-600">Block {Math.min(blockIndex + 1, totalBlocks)} / {totalBlocks}</div>
              <div className="text-[11px] text-zinc-600">{progressPct}%</div>
            </div>
            <div className="h-[3px] rounded-full bg-white/[0.07] overflow-hidden">
              <div className="h-full bg-emerald-500/80 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }}/>
            </div>
          </div>

          {/* Block content */}
          <SurfaceCard className={cn(isScenarioBlock ? "p-3" : "p-4")}>
            {!isScenarioBlock && !isChoiceBlock ? <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">{currentBlock?.title || ""}</div> : null}
            {currentBlock ? (
              <BlockRenderer
                key={currentBlock.id}
                block={currentBlock}
                playText={playText}
                showToast={showToast}
                onComplete={markCurrentComplete}
                completed={isCurrentCompleted}
                onAdvance={advanceBlock}
                navBarRef={navBarRef}
              />
            ) : <div className="text-sm text-zinc-500">No block available.</div>}
          </SurfaceCard>
        </>
      )}

      {showPatternNote ? <PatternNote notes={lesson?.notes} /> : null}

      {showNavBar ? (
        <div ref={navBarRef} className="mt-4 flex items-center gap-3">
          <ActionButton variant="ghost" onClick={() => setBlockIndex((prev) => Math.max(0, prev - 1))} disabled={blockIndex === 0} className="flex-1">Back</ActionButton>
          <ActionButton onClick={advanceBlock} disabled={!isCurrentCompleted || isLastBlock} className="flex-1">Next</ActionButton>
        </div>
      ) : null}
    </div>
  );
}

// src/views/training/LearningLessonView.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useSpeechToTextHold from "../../hooks/useSpeechToTextHold";
import { useGameStore } from "../../stores/gameStore";
import { matchPairsCss } from "./matchPairs/matchPairsStyles";
import InteractivePhraseText from "../../components/audio/InteractivePhraseText";
import TrainingBackButton from "./TrainingBackButton";

const cn = (...xs) => xs.filter(Boolean).join(" ");

// ─── Helper text glow animation ───────────────────────────────────────────────
// Injected once into the DOM so it's available in scenario blocks (which don't
// render WordMatchBlock and therefore don't get matchPairsCss injected).

const HELPER_STYLE_ID = "z-helper-glow-style";
function ensureHelperStyles() {
  if (document.getElementById(HELPER_STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = HELPER_STYLE_ID;
  el.textContent = `
    @keyframes helperGlowFade {
      0%   { color: var(--z-accent-bright, rgba(110,231,183,0.95)); text-shadow: 0 0 14px rgba(52,211,153,0.55), 0 0 5px rgba(52,211,153,0.35); }
      45%  { color: var(--z-accent-muted, rgba(110,231,183,0.60)); text-shadow: 0 0 8px rgba(52,211,153,0.20); }
      100% { color: rgba(161,161,170,0.75); text-shadow: none; }
    }
    .helper-glow-fade {
      animation: helperGlowFade 2s ease-out both;
    }
  `;
  document.head.appendChild(el);
}

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
  // Strip Lithuanian diacritics before matching so STT transcriptions without
  // diacritics (š→s, ž→z, č→c, ė→e, ų→u, ū→u, etc.) still match correctly.
  const stripped = String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return stripped
    .toLowerCase()
    .replace(/[.,!?;:"""''„"–—\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Character-level similarity (Levenshtein ratio) for fuzzy single-word matching.
// Handles speech recognition transcribing š as š/s/sh, ž as ž/z, č as č/c etc.
function charSimilarity(a, b) {
  if (a === b) return 1;
  const la = a.length, lb = b.length;
  if (!la || !lb) return 0;
  // Build DP matrix
  const dp = Array.from({ length: la + 1 }, (_, i) => [i]);
  for (let j = 0; j <= lb; j++) dp[0][j] = j;
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  const dist = dp[la][lb];
  return 1 - dist / Math.max(la, lb);
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

  // Exact word match — ≥75% of target words found anywhere in capture
  const matched = targetWords.filter((w) => capturedWords.includes(w));
  if (matched.length / targetWords.length >= 0.75) return true;

  // Positional fuzzy match for phrases up to 5 words.
  // Pairs each target word with the capture word at the same position.
  // Requires: avg similarity ≥ 0.70 AND every word ≥ 0.60.
  // The minimum check prevents "Per šalta" matching "Per karšta" (per/per=1.0
  // inflates avg, but šalta/karšta=0.43 fails the minimum).
  if (targetWords.length <= 5) {
    const sims = targetWords.map((w, i) => charSimilarity(w, capturedWords[i] ?? ""));
    const avgSim = sims.reduce((a, b) => a + b, 0) / sims.length;
    const minSim = Math.min(...sims);
    if (avgSim >= 0.70 && minSim >= 0.60) return true;

    // Whole-phrase character similarity fallback for very short phrases (≤3 words)
    if (targetWords.length <= 3 && charSimilarity(c, t) >= 0.78) return true;
  }

  return false;
}

// ─── Shared primitives ────────────────────────────────────────────────────────

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

function FeedbackPanel({ isCorrect, correctText, correctTranslation, feedbackNote, onContinue }) {
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
          {/* On wrong answer: show English meaning of the correct answer to aid retention */}
          {!isCorrect && correctTranslation ? (
            <div className="mt-0.5 text-[12px] text-zinc-400 leading-snug">{correctTranslation}</div>
          ) : null}
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
              <div className="text-[17px] font-semibold text-zinc-100">
                <InteractivePhraseText
                  text={item.lt}
                  playText={playText}
                  wordClassName="hover:text-emerald-300"
                />
              </div>
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

function ChoiceOption({ option, selected, revealState, onClick, playText, playAudio, isLithuanian }) {
  const stateClass = revealState === "idle"
    ? selected ? "border-white/20 bg-white/[0.07] text-zinc-100"
      : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.05]"
    : option.isCorrect ? "border-emerald-400/20 bg-emerald-500/[0.10] text-emerald-100"
    : selected ? "border-rose-400/20 bg-rose-500/[0.08] text-rose-200 line-through opacity-60"
    : "border-white/[0.06] bg-white/[0.02] text-zinc-500";

  const handleClick = () => {
    // Audio handled entirely by ChoiceBlock.handleSelect — prevents double-playback
    onClick();
  };

  // Word-tap only available on LT options after the answer is revealed
  const showWordTap = isLithuanian && revealState !== "idle";

  return (
    <button type="button" data-press onClick={handleClick} disabled={revealState !== "idle"}
      className={cn("w-full text-left rounded-2xl border px-4 py-3 text-[14px] transition", stateClass, revealState !== "idle" ? "cursor-default" : "")}>
      {showWordTap
        ? <InteractivePhraseText text={option.text} playText={playText} wordClassName="hover:text-emerald-300" />
        : option.text}
    </button>
  );
}

function ChoiceBlock({ block, playText, onComplete, onWrongAnswer, onAdvance }) {
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
    if (!option.isCorrect) onWrongAnswer?.();
    if (isBestResponse && !block?.noOptionAudio) {
      // best_response: options are Lithuanian — play selected option if correct,
      // or play correct option after delay if wrong.
      // Skipped when noOptionAudio is set (English-only option blocks).
      if (option.isCorrect) {
        try { playText?.(option.text); } catch {}
      } else {
        const correct = options.find((o) => o.isCorrect);
        if (correct?.text && playText) {
          setTimeout(() => { try { playText(correct.text); } catch {} }, 600);
        }
      }
    } else if (block?.type === "recognise_mcq" && !audioText) {
      // Form B only: English prompt, Lithuanian options — play correct option text
      // Form A (Lithuanian prompt + English options) stays completely silent
      if (option.isCorrect) {
        try { playText?.(option.text); } catch {}
      } else {
        const correct = options.find((o) => o.isCorrect);
        if (correct?.text && playText) {
          setTimeout(() => { try { playText(correct.text); } catch {} }, 600);
        }
      }
    }
    // listen_mcq and recognise_mcq Form A: never play audio
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
          <div className="text-[22px] font-semibold text-zinc-100">
            <InteractivePhraseText text={promptText} playText={playText} wordClassName="hover:text-emerald-300" />
          </div>
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
          <div className="text-[15px] font-semibold text-zinc-100 leading-snug">
            <InteractivePhraseText text={promptText} playText={playText} wordClassName="hover:text-emerald-300" />
          </div>
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
            isLithuanian={
              !block?.noOptionAudio && (
                block?.type === "best_response" ||
                (block?.type === "recognise_mcq" && !audioText)
              )
            }
          />
        ))}
      </div>
      {revealState === "revealed" ? (
        <FeedbackPanel
          isCorrect={!!selected?.isCorrect}
          correctText={correctOption?.text || ""}
          correctTranslation={
            // recognise_mcq Form B (EN prompt → LT options): prompt text IS the translation
            (!selected?.isCorrect && block?.type === "recognise_mcq" && !audioText)
              ? (block?.prompt?.text || null)
              : null
          }
          feedbackNote={block?.feedback?.correct || null}
          onContinue={onAdvance}
        />
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

  const isRecording  = sttState === "recording";
  const isPending    = sttState === "pending";
  const isProcessing = sttState === "transcribing" || sttState === "translating";
  const isActive     = isRecording || isPending;
  const isBusy       = isActive || isProcessing;
  const supported    = sttSupported();

  const pointerIdRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const handleMicPointerDown = (event) => {
    if (completed || isBusy || !supported) return;
    event.preventDefault();
    pointerIdRef.current = event.pointerId;
    buttonRef.current?.setPointerCapture?.(event.pointerId);
    playMicStart();
    startRecording();
  };
  const finishMicHold = (event) => {
    if (pointerIdRef.current !== event.pointerId) return;
    event.preventDefault();
    pointerIdRef.current = null;
    buttonRef.current?.releasePointerCapture?.(event.pointerId);
    playMicStop();
    stopRecording();
  };
  const cancelMicHold = (event) => {
    if (pointerIdRef.current !== event.pointerId) return;
    event.preventDefault();
    pointerIdRef.current = null;
    buttonRef.current?.releasePointerCapture?.(event.pointerId);
    playMicStop();
    cancelStt();
  };

  const micLabel = isActive ? "Listening... release when done" : isProcessing ? "Checking..." : supported ? "Hold to speak" : "Microphone unavailable";
  const statusLabel = attemptState === "result_pass" ? "Nice, spoken" : attemptState === "result_fail" ? "Not quite yet" : micLabel;
  const statusTone = attemptState === "result_pass" ? "success" : attemptState === "result_fail" ? "fail" : isActive ? "recording" : isProcessing ? "checking" : "idle";

  if (completed) {
    return (
      <div>
        <div className="text-[15px] font-semibold text-zinc-100 mb-3">{block?.prompt || "Say it out loud"}</div>
        {block?.targetText ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[20px] font-semibold text-zinc-100">
                <InteractivePhraseText text={block.targetText} playText={playText} wordClassName="hover:text-emerald-300" />
              </div>
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
            <div className="text-[20px] font-semibold text-zinc-100">
              <InteractivePhraseText text={block.targetText} playText={playText} wordClassName="hover:text-emerald-300" />
            </div>
            {block?.audioText ? <AudioIconButton text={block.audioText} playText={playText} label="Hear the phrase" /> : null}
          </div>
        </div>
      ) : null}
      {attemptState === "result_pass" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] px-4 py-3">
          <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] font-bold text-emerald-300 shrink-0">✓</div>
          <div className="text-[13px] text-emerald-200 font-medium">Nice, spoken</div>
        </div>
      ) : null}
      {attemptState === "result_fail" ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3 text-center">
            <div className="text-[14px] font-semibold text-amber-200">Not quite yet</div>
            <div className="mt-1 text-[12px] text-zinc-500">Try again</div>
          </div>
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
              <div className={cn("rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                statusTone === "recording" ? "border-emerald-400/30 bg-emerald-500/[0.08] text-emerald-200"
                : statusTone === "checking" ? "border-white/10 bg-white/[0.05] text-zinc-300"
                : statusTone === "fail" ? "border-amber-400/25 bg-amber-500/[0.06] text-amber-200"
                : "border-white/10 bg-white/[0.04] text-zinc-400")}>
                {statusLabel}
              </div>
              <button type="button" disabled={isProcessing}
                ref={buttonRef}
                onPointerDown={handleMicPointerDown}
                onPointerUp={finishMicHold}
                onPointerCancel={cancelMicHold}
                onPointerLeave={finishMicHold}
                className={cn("h-20 w-20 rounded-full border-2 flex items-center justify-center transition-all select-none",
                  isActive ? "bg-emerald-500/25 border-emerald-400/60 scale-105 shadow-[0_0_32px_rgba(16,185,129,0.3)]"
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
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={isActive ? "text-emerald-300" : "text-zinc-300"}>
                    <path d="M12 14.25c1.656 0 3-1.344 3-3V6.75c0-1.656-1.344-3-3-3s-3 1.344-3 3v4.5c0 1.656 1.344 3 3 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.5 10.5v.75c0 2.485 2.015 4.5 4.5 4.5s4.5-2.015 4.5-4.5v-.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15.75V19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M9.75 19.5h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
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

function BuildPhraseBlock({ block, playText, onComplete, onAdvance, completed }) {
  const rawTokens = Array.isArray(block?.tokens) ? block.tokens : [];
  const tokens = React.useMemo(() => {
    const arr = [...rawTokens];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const answerTokens = tokens
    .filter((t) => !t.isDistractor)
    .sort((a, b) => a.correctIndex - b.correctIndex);

  const correctAnswer = block?.answerText || answerTokens.map((t) => t.text).join(" ");
  const requiredLength = answerTokens.length;

  const [built, setBuilt] = useState([]);
  const [checkState, setCheckState] = useState("idle"); // "idle" | "correct" | "wrong"
  const [revealed, setRevealed] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [floatingDrag, setFloatingDrag] = useState(null);
  const chipRefs = React.useRef(new Map());
  const dragRef = React.useRef({
    id: null,
    pointerId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    width: 0,
    height: 0,
    active: false,
  });

  const placedIds = new Set(built);
  const isReady = built.length === requiredLength && requiredLength > 0;
  const dragThreshold = 7;

  const setChipRef = (id) => (node) => {
    if (node) chipRefs.current.set(id, node);
    else chipRefs.current.delete(id);
  };

  const resetDrag = (event) => {
    const node = chipRefs.current.get(dragRef.current.id);
    try {
      if (node && dragRef.current.pointerId != null) {
        node.releasePointerCapture?.(dragRef.current.pointerId);
      }
    } catch {}
    dragRef.current = {
      id: null,
      pointerId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      width: 0,
      height: 0,
      active: false,
    };
    setDraggedId(null);
    setFloatingDrag(null);
  };

  useEffect(() => {
    return () => resetDrag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!dragRef.current.id) return;
    if (!built.includes(dragRef.current.id)) resetDrag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [built]);

  const reorderDraggedChip = (id, clientX, clientY) => {
    setBuilt((prev) => {
      const currentIndex = prev.indexOf(id);
      if (currentIndex === -1) return prev;

      const orderedOthers = prev
        .map((tokenId, index) => ({ tokenId, index, node: chipRefs.current.get(tokenId) }))
        .filter((item) => item.tokenId !== id && item.node);

      let targetIndex = 0;
      for (const item of orderedOthers) {
        const rect = item.node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const sameRow = Math.abs(clientY - centerY) <= rect.height * 0.65;
        const isAfter =
          clientY > centerY + rect.height * 0.65 ||
          (sameRow && clientX > centerX);
        if (isAfter) targetIndex += 1;
      }

      const withoutDragged = prev.filter((tokenId) => tokenId !== id);
      const next = [...withoutDragged];
      next.splice(Math.max(0, Math.min(targetIndex, next.length)), 0, id);

      if (next.length === prev.length && next.every((tokenId, index) => tokenId === prev[index])) {
        return prev;
      }

      if (checkState === "wrong") setCheckState("idle");
      return next;
    });
  };

  const handleBuiltPointerDown = (event, id) => {
    if (revealed || completed) return;
    dragRef.current = {
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: 0,
      offsetY: 0,
      width: 0,
      height: 0,
      active: false,
    };
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {}
  };

  const handleBuiltPointerMove = (event, id) => {
    const drag = dragRef.current;
    if (revealed || completed || drag.id !== id || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const distance = Math.hypot(dx, dy);

    if (!drag.active) {
      if (distance < dragThreshold) return;
      const rect = event.currentTarget.getBoundingClientRect();
      drag.offsetX = event.clientX - rect.left;
      drag.offsetY = event.clientY - rect.top;
      drag.width = rect.width;
      drag.height = rect.height;
      drag.active = true;
      setDraggedId(id);
      setFloatingDrag({
        id,
        x: event.clientX,
        y: event.clientY,
        width: rect.width,
        height: rect.height,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        active: true,
      });
    } else {
      setFloatingDrag((prev) =>
        prev && prev.id === id
          ? { ...prev, x: event.clientX, y: event.clientY }
          : prev
      );
    }

    event.preventDefault();
    reorderDraggedChip(id, event.clientX, event.clientY);
  };

  const handleBuiltPointerUp = (event, id) => {
    const drag = dragRef.current;
    if (drag.id !== id || drag.pointerId !== event.pointerId) return;

    const wasDragging = drag.active;
    resetDrag(event);

    if (!wasDragging && !revealed && !completed) {
      setBuilt((prev) => prev.filter((x) => x !== id));
      setCheckState("idle");
    }
  };

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
    resetDrag();
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
              const isDragging = draggedId === id;
              const isFloating = floatingDrag?.id === id;
              const placeholderStyle = isFloating
                ? {
                    width: floatingDrag.width,
                    height: floatingDrag.height,
                    touchAction: revealed || completed ? "auto" : "none",
                  }
                : { touchAction: revealed || completed ? "auto" : "none" };
              return (
                <button key={id} type="button" data-press
                  ref={setChipRef(id)}
                  onPointerDown={(event) => handleBuiltPointerDown(event, id)}
                  onPointerMove={(event) => handleBuiltPointerMove(event, id)}
                  onPointerUp={(event) => handleBuiltPointerUp(event, id)}
                  onPointerCancel={(event) => resetDrag(event)}
                  onLostPointerCapture={(event) => {
                    if (dragRef.current.id === id && dragRef.current.pointerId === event.pointerId) resetDrag(event);
                  }}
                  aria-label="Drag to reorder or tap to remove"
                  title="Drag to reorder or tap to remove"
                  style={placeholderStyle}
                  className={cn(
                    "relative rounded-xl border px-3 py-2 text-sm transition select-none",
                    isFloating ? "opacity-0 pointer-events-none" : "",
                    checkState === "correct"
                      ? "border-emerald-400/20 bg-emerald-500/[0.10] text-emerald-100 cursor-default"
                      : checkState === "wrong"
                      ? "border-rose-400/20 bg-rose-500/[0.10] text-rose-200"
                      : completed
                      ? "border-white/10 bg-white/[0.06] text-zinc-100 cursor-default"
                      : "border-white/10 bg-white/[0.06] text-zinc-100 hover:bg-white/[0.09] cursor-grab active:cursor-grabbing",
                    isDragging
                      ? "z-10 scale-[1.04] border-white/30 shadow-[0_12px_28px_rgba(0,0,0,0.32)] cursor-grabbing"
                      : "z-0"
                  )}>
                  {token?.text}
                </button>
              );
            })
          ) : (
            <div className="text-sm text-zinc-500">Tap words below to build the phrase.</div>
          )}
        </div>
        {floatingDrag && typeof document !== "undefined" ? createPortal((() => {
          const token = tokens.find((t) => t.id === floatingDrag.id);
          return (
            <div
              className="
                fixed pointer-events-none select-none rounded-xl border border-white/30
                bg-zinc-900/95 px-3 py-2 text-sm text-zinc-100
                shadow-[0_18px_42px_rgba(0,0,0,0.42)]
                scale-[1.04]
              "
              style={{
                zIndex: 14000,
                width: floatingDrag.width,
                height: floatingDrag.height,
                left: floatingDrag.x - floatingDrag.offsetX,
                top: floatingDrag.y - floatingDrag.offsetY,
                transform: "translate3d(0, 0, 0) scale(1.04)",
                transformOrigin: "center center",
                transition: "none",
                willChange: "transform",
              }}
              aria-hidden="true"
            >
              {token?.text}
            </div>
          );
        })(), document.body) : null}
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
          <ActionButton onClick={revealed ? onAdvance : checkPhrase} disabled={!isReady && !revealed} className="flex-1">
            {revealed ? "Continue" : "Check phrase"}
          </ActionButton>
        )}
        {!revealed ? (
          <ActionButton variant="ghost" onClick={() => { resetDrag(); setBuilt([]); setCheckState("idle"); }} className="px-4">Reset</ActionButton>
        ) : null}
      </div>
    </div>
  );
}

function ConversationBubble({ role, text, helperText, translation, playText }) {
  const isAssistant = role === "other";
  useEffect(() => { if (isAssistant && helperText) ensureHelperStyles(); }, [isAssistant, helperText]);
  return (
    <div className={cn("flex flex-col", isAssistant ? "items-start" : "items-end")}>
      {/* Helper text — system bubbles only, glows green on load then fades to normal */}
      {isAssistant && helperText ? (
        <div className="mb-1 px-1 max-w-[82%]">
          <span className="helper-glow-fade text-[11px] leading-snug italic">
            {helperText}
          </span>
        </div>
      ) : null}
      <div className={cn("max-w-[80%] rounded-[20px] border px-4 py-2.5",
        isAssistant ? "border-white/10 bg-white/[0.035]" : "border-emerald-400/18 bg-emerald-500/[0.09]")}>
        <div className="text-[14px] font-medium leading-snug text-zinc-100">
          <InteractivePhraseText
            text={text}
            playText={playText}
            wordClassName="hover:text-emerald-300"
          />
        </div>
      </div>
      {/* Translation hint — user bubbles only, shown after correct selection */}
      {!isAssistant && translation ? (
        <div className="mt-1 px-1 max-w-[80%]">
          <div className="text-[11px] text-zinc-500 leading-snug italic text-right">
            {translation}
          </div>
        </div>
      ) : null}
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
  const isWrongFlash = revealState === "wrong_flash" && selectedId === option.id;
  const stateClass = isWrongFlash
    ? "border-rose-400/20 bg-rose-500/[0.08] text-rose-200"
    : "border-white/10 bg-white/[0.03] text-zinc-200 hover:border-white/20 hover:bg-white/[0.05]";
  const isDisabled = revealState !== "idle";

  return (
    <button type="button" data-press onClick={onClick} disabled={isDisabled}
      className={cn("w-full text-left rounded-2xl border px-4 py-3 text-[14px] transition", stateClass, isDisabled ? "cursor-default" : "")}>
      {option.text}
    </button>
  );
}

// ─── Scenario chain — description shown ABOVE chat window, never read by TTS ──

function ScenarioChainBlock({ block, playText, onComplete, onWrongAnswer, onAdvance }) {
  const steps = Array.isArray(block?.steps) ? block.steps : [];
  const timeoutsRef = useRef([]);
  const feedRef = useRef(null);
  const trayRef = useRef(null);
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

  // Scroll the options tray into view when it becomes visible
  useEffect(() => {
    if (!assistantVisible || conversationComplete) return;
    const el = trayRef.current;
    if (!el) return;
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  }, [assistantVisible, conversationComplete]);

  const queueTimeout = (fn, delay) => { const id = setTimeout(fn, delay); timeoutsRef.current.push(id); return id; };

  const showAssistantStep = (index) => {
    const nextStep = steps[index];
    if (!nextStep) return;
    setAssistantTyping(true); setAssistantVisible(false); setSelectedId(null); setRevealState("idle");
    queueTimeout(async () => {
      setAssistantTyping(false); setAssistantVisible(true);
      setHistory((prev) => [...prev, { role: "other", text: nextStep.text, helperText: nextStep.helperText || null }]);
      // Only play audioText — never the description or any English text
      const audio = nextStep.audioText || null;
      if (audio) { try { await playText?.(audio); } catch {} }
    }, 850);
  };

  const startConversation = () => { if (started) return; setStarted(true); showAssistantStep(0); };

  const handleSelect = (option) => {
    if (!assistantVisible || revealState !== "idle") return;
    if (!option.isCorrect) {
      // Wrong — brief red flash, count against score, then reset so user can retry
      onWrongAnswer?.();
      setSelectedId(option.id);
      setRevealState("wrong_flash");
      queueTimeout(() => { setSelectedId(null); setRevealState("idle"); }, 600);
      return;
    }
    setSelectedId(option.id); setRevealState("revealed");
    // Show translation of what the user said — only if option has an en field
    setHistory((prev) => [...prev, { role: "you", text: option.text, translation: option.en || null }]);
    if (isLastStep) {
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
              {history.map((item, index) => <ConversationBubble key={`${item.role}-${index}-${item.text}`} role={item.role} text={item.text} helperText={item.helperText} translation={item.translation || null} playText={playText} />)}
              {assistantTyping ? <TypingBubble /> : null}
            </>
          )}
        </div>
        {started && assistantVisible && !conversationComplete ? (
          <div ref={trayRef} className="border-t border-white/10 bg-black/25 px-4 py-3">
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
      // Wrong — no audio, just the red flash
      setPulse({ kind: "wrong", ids: [firstId, secondId] });
      setMistakes((m) => m + 1);
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

// ─── context_gap_select ───────────────────────────────────────────────────────
// Sentence or short dialogue with one blank. Any words as options.

function ContextGapSelect({ block, playText, onComplete, onWrongAnswer, onAdvance }) {
  const [selectedId, setSelectedId] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const options = Array.isArray(block?.options) ? block.options : [];
  const correctOption = options.find((o) => o.isCorrect) || null;
  const selected = options.find((o) => o.id === selectedId) || null;
  const isCorrect = !!selected?.isCorrect;

  const GAP = "___";

  function renderWithGap(text) {
    if (!text) return null;
    const parts = String(text).split(GAP);
    if (parts.length < 2) return <span>{text}</span>;
    return (
      <>
        {parts[0]}
        <span className={cn(
          "inline-block min-w-[80px] text-center border-b-2 mx-1 font-semibold",
          !revealed ? "border-zinc-400 text-transparent select-none" :
          isCorrect ? "border-emerald-400 text-emerald-200" : "border-rose-400 text-rose-300"
        )}>
          {revealed ? (correctOption?.text || GAP) : "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0"}
        </span>
        {parts[1]}
      </>
    );
  }

  function handleSelect(option) {
    if (revealed) return;
    setSelectedId(option.id);
    setRevealed(true);
    onComplete?.();
    if (!option.isCorrect) {
      onWrongAnswer?.();
    } else {
      if (playText && correctOption?.text) {
        try { playText(correctOption.text); } catch {}
      }
    }
  }

  const lines = block?.context_mode === "dialogue" && Array.isArray(block?.lines)
    ? block.lines
    : null;

  return (
    <div className="space-y-4">
      {/* Prompt */}
      {block?.prompt ? (
        <div className="text-[13px] text-zinc-500 uppercase tracking-wide">{block.prompt}</div>
      ) : null}

      {/* Sentence or dialogue */}
      <SurfaceCard className="px-4 py-4">
        {lines ? (
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="flex gap-2">
                {line.speaker ? (
                  <span className="text-[12px] text-zinc-500 shrink-0 mt-[2px] w-16 truncate">{line.speaker}:</span>
                ) : null}
                <div className="text-[16px] leading-snug text-zinc-100">
                  {line.hasGap ? renderWithGap(line.text) : line.text}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[18px] leading-snug text-zinc-100 font-medium">
            {renderWithGap(block?.sentence || "")}
          </div>
        )}
        {block?.translation_en ? (
          <div className="mt-2 text-[12px] text-zinc-500 italic">{block.translation_en}</div>
        ) : null}
      </SurfaceCard>

      {/* Options */}
      {!revealed ? (
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              data-press
              onClick={() => handleSelect(option)}
              className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-zinc-200 hover:border-white/20 hover:bg-white/[0.06] transition"
            >
              {option.text}
            </button>
          ))}
        </div>
      ) : null}

      {/* Feedback */}
      {revealed ? (
        <FeedbackPanel
          isCorrect={isCorrect}
          correctText={correctOption?.text || ""}
          feedbackNote={block?.explanation || null}
          onContinue={onAdvance}
        />
      ) : null}
    </div>
  );
}

// ─── choose_correct_form ──────────────────────────────────────────────────────
// Base word shown above sentence with blank. All options are forms of that word.

function ChooseCorrectForm({ block, playText, onComplete, onWrongAnswer, onAdvance }) {
  const [selectedId, setSelectedId] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const options = Array.isArray(block?.options) ? block.options : [];
  const correctOption = options.find((o) => o.isCorrect) || null;
  const selected = options.find((o) => o.id === selectedId) || null;
  const isCorrect = !!selected?.isCorrect;

  const GAP = "___";

  function renderSentenceWithGap(sentence) {
    if (!sentence) return null;
    const parts = String(sentence).split(GAP);
    if (parts.length < 2) return <span>{sentence}</span>;
    const filledForm = revealed ? (correctOption?.text || GAP) : null;
    return (
      <>
        {parts[0]}
        <span className={cn(
          "inline-block min-w-[80px] text-center border-b-2 mx-1 font-semibold",
          !revealed ? "border-zinc-400 text-transparent select-none" :
          isCorrect ? "border-emerald-400 text-emerald-200" : "border-rose-400 text-rose-300"
        )}>
          {filledForm || "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0"}
        </span>
        {parts[1]}
      </>
    );
  }

  function handleSelect(option) {
    if (revealed) return;
    setSelectedId(option.id);
    setRevealed(true);
    onComplete?.();
    if (!option.isCorrect) {
      onWrongAnswer?.();
    } else {
      if (playText && correctOption?.text) {
        try { playText(correctOption.text); } catch {}
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Base word */}
      <SurfaceCard className="px-4 py-3">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">Base word</div>
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[20px] font-semibold text-zinc-100">{block?.base_word || ""}</div>
            {block?.word_gloss_en ? (
              <div className="text-[13px] text-zinc-400">{block.word_gloss_en}</div>
            ) : null}
          </div>
          {block?.base_word && playText ? (
            <AudioIconButton text={block.base_word} playText={playText} />
          ) : null}
        </div>
      </SurfaceCard>

      {/* Sentence with gap */}
      <SurfaceCard className="px-4 py-4">
        {block?.prompt ? (
          <div className="text-[12px] text-zinc-500 uppercase tracking-wide mb-2">{block.prompt}</div>
        ) : null}
        <div className="text-[18px] leading-snug text-zinc-100 font-medium">
          {renderSentenceWithGap(block?.sentence || "")}
        </div>
        {block?.translation_en ? (
          <div className="mt-2 text-[12px] text-zinc-500 italic">{block.translation_en}</div>
        ) : null}
      </SurfaceCard>

      {/* Options */}
      {!revealed ? (
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              data-press
              onClick={() => handleSelect(option)}
              className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-zinc-200 hover:border-white/20 hover:bg-white/[0.06] transition font-medium"
            >
              {option.text}
            </button>
          ))}
        </div>
      ) : null}

      {/* Feedback */}
      {revealed ? (
        <FeedbackPanel
          isCorrect={isCorrect}
          correctText={correctOption?.text || ""}
          feedbackNote={block?.explanation || null}
          onContinue={onAdvance}
        />
      ) : null}
    </div>
  );
}

// ─── conversation_turn_fill ───────────────────────────────────────────────────
// Short dialogue transcript with one gap in one line. Options below.

function ConversationTurnFill({ block, playText, onComplete, onWrongAnswer, onAdvance }) {
  const [selectedId, setSelectedId] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const options = Array.isArray(block?.options) ? block.options : [];
  const lines = Array.isArray(block?.lines) ? block.lines : [];
  const correctOption = options.find((o) => o.isCorrect) || null;
  const selected = options.find((o) => o.id === selectedId) || null;
  const isCorrect = !!selected?.isCorrect;

  function handleSelect(option) {
    if (revealed) return;
    setSelectedId(option.id);
    setRevealed(true);
    onComplete?.();
    if (!option.isCorrect) {
      onWrongAnswer?.();
    } else {
      if (playText && correctOption?.text) {
        try { playText(correctOption.text); } catch {}
      }
    }
  }

  function renderLineText(line) {
    if (!line.hasGap) return line.text;
    if (!revealed) {
      const parts = String(line.text).split("___");
      return (
        <>
          {parts[0]}
          <span className="inline-block min-w-[80px] border-b-2 border-zinc-400 mx-1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          {parts[1] || ""}
        </>
      );
    }
    // After reveal, show the filled version
    const filled = String(line.text).replace("___", correctOption?.text || "___");
    return (
      <span className={isCorrect ? "text-emerald-200" : "text-rose-200"}>
        {filled}
      </span>
    );
  }

  return (
    <div className="space-y-4">
      {/* Scene label */}
      {block?.scene_label ? (
        <div className="text-[12px] uppercase tracking-widest text-zinc-500">{block.scene_label}</div>
      ) : null}

      {/* Prompt */}
      {block?.prompt ? (
        <div className="text-[13px] text-zinc-500">{block.prompt}</div>
      ) : null}

      {/* Dialogue transcript */}
      <SurfaceCard className="px-4 py-4">
        <div className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-3 items-start">
              {line.speaker ? (
                <div className="text-[11px] uppercase tracking-wide text-zinc-500 shrink-0 w-14 pt-[3px]">
                  {line.speaker}
                </div>
              ) : null}
              <div className={cn(
                "text-[15px] leading-snug flex-1",
                line.hasGap ? "text-zinc-100" : "text-zinc-300"
              )}>
                {renderLineText(line)}
              </div>
              {line.audioText && playText && !line.hasGap ? (
                <AudioIconButton text={line.audioText} playText={playText} />
              ) : null}
            </div>
          ))}
        </div>
        {revealed && block?.translation_en ? (
          <div className="mt-3 pt-3 border-t border-white/8 text-[12px] text-zinc-500 italic">
            {block.translation_en}
          </div>
        ) : null}
      </SurfaceCard>

      {/* Options */}
      {!revealed ? (
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              data-press
              onClick={() => handleSelect(option)}
              className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-zinc-200 hover:border-white/20 hover:bg-white/[0.06] transition"
            >
              {option.text}
            </button>
          ))}
        </div>
      ) : null}

      {/* Feedback */}
      {revealed ? (
        <FeedbackPanel
          isCorrect={isCorrect}
          correctText={correctOption?.text || ""}
          feedbackNote={block?.explanation || null}
          onContinue={onAdvance}
        />
      ) : null}
    </div>
  );
}


function BlockRenderer({ block, playText, showToast, onComplete, onWrongAnswer, completed, onAdvance, navBarRef }) {
  switch (block?.type) {
    case "learn": return <LearnBlock block={block} playText={playText} onComplete={onComplete} completed={completed} navBarRef={navBarRef}/>;
    case "recognise_mcq": case "listen_mcq": case "best_response":
      return <ChoiceBlock block={block} playText={playText} onComplete={onComplete} onWrongAnswer={onWrongAnswer} onAdvance={onAdvance}/>;
    case "speak_self_check":
      return <SpeakSelfCheckBlock block={block} playText={playText} showToast={showToast} onComplete={onComplete} completed={completed}/>;
    case "build_phrase": return <BuildPhraseBlock block={block} playText={playText} onComplete={onComplete} onAdvance={onAdvance} completed={completed}/>;
    case "word_match": return <WordMatchBlock block={block} playText={playText} onComplete={onComplete} onAdvance={onAdvance} completed={completed}/>;
    case "scenario_chain": return <ScenarioChainBlock block={block} playText={playText} onComplete={onComplete} onWrongAnswer={onWrongAnswer} onAdvance={onAdvance}/>;
    case "context_gap_select": return <ContextGapSelect block={block} playText={playText} onComplete={onComplete} onWrongAnswer={onWrongAnswer} onAdvance={onAdvance}/>;
    case "choose_correct_form": return <ChooseCorrectForm block={block} playText={playText} onComplete={onComplete} onWrongAnswer={onWrongAnswer} onAdvance={onAdvance}/>;
    case "conversation_turn_fill": return <ConversationTurnFill block={block} playText={playText} onComplete={onComplete} onWrongAnswer={onWrongAnswer} onAdvance={onAdvance}/>;
    default: return <div className="text-sm text-zinc-500">Unknown block type.</div>;
  }
}

// ─── Lesson complete card ─────────────────────────────────────────────────────

function NailedItCard({ lessonTitle, xpEarned, accuracyPct, onContinue, nextLessonLabel, onBack }) {
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
        <div className="text-[26px] font-semibold text-emerald-200 leading-tight">
          {accuracyPct === null || accuracyPct === undefined || accuracyPct >= 90 ? "Nailed it!" : "Well done!"}
        </div>
        <div className="mt-2 text-[14px] text-zinc-400">{lessonTitle}</div>
        <div className="mt-3 flex justify-center gap-2 flex-wrap">
          {xpEarned ? <SmallMetaPill accent="emerald">+{xpEarned} XP</SmallMetaPill> : null}
          {accuracyPct !== null && accuracyPct !== undefined
            ? <SmallMetaPill accent={accuracyPct >= 90 ? "emerald" : "default"}>{accuracyPct}% correct</SmallMetaPill>
            : null}
        </div>
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
  const [wrongAnswerCount, setWrongAnswerCount] = useState(0);
  const [accuracyPct, setAccuracyPct] = useState(null);
  const [lessonDone, setLessonDone] = useState(false); // true only after user taps Continue/advance on last block
  const navBarRef = useRef(null);
  const completionFiredRef = useRef(false);

  const completeLesson = useGameStore((s) => s.completeLesson);
  const earnLessonXP = useGameStore((s) => s.earnLessonXP);

  useEffect(() => {
    setPhase("loading");
    setBlockIndex(0);
    setCompletedBlockIds({});
    setXpEarned(null);
    setAccuracyPct(null);
    setWrongAnswerCount(0);
    setLessonDone(false);
    completionFiredRef.current = false;
  }, [lesson?.id]);

  const handleLoadingReady = useCallback(() => setPhase("running"), []);

  // Preload all audio from this lesson while loading screen shows
  useEffect(() => {
    if (!lesson || typeof preloadText !== "function") return;

    const blockTexts = (lesson.blocks || []).map((block) => {
      const set = new Set();
      if (block?.prompt?.audioText) set.add(block.prompt.audioText);
      if (block?.audioText) set.add(block.audioText);
      if (block?.targetText) set.add(block.targetText);
      if (block?.base_word) set.add(block.base_word);
      if (Array.isArray(block?.items)) {
        block.items.forEach((item) => { if (item?.audioText) set.add(item.audioText); });
      }
      if (Array.isArray(block?.pairs)) {
        block.pairs.forEach((pair) => { if (pair?.audioText) set.add(pair.audioText); });
      }
      if (Array.isArray(block?.options)) {
        block.options.forEach((opt) => {
          if (opt?.audioText) set.add(opt.audioText);
          if (opt?.text && !opt?.audioText && !opt?.en) set.add(opt.text);
        });
      }
      if (Array.isArray(block?.steps)) {
        block.steps.forEach((step) => {
          if (step?.audioText) set.add(step.audioText);
          if (Array.isArray(step?.options)) {
            step.options.forEach((opt) => { if (opt?.text && !opt?.en) set.add(opt.text); });
          }
        });
      }
      if (Array.isArray(block?.lines)) {
        block.lines.forEach((line) => { if (line?.audioText) set.add(line.audioText); });
      }
      return Array.from(set);
    });

    const priorityTexts = blockTexts.slice(0, 3).flat();
    const restTexts = blockTexts.slice(3).flat();
    const ordered = [...new Set([...priorityTexts, ...restTexts])];

    ordered.forEach((text, i) => {
      setTimeout(() => {
        try { preloadText(text).catch?.(() => {}); } catch {}
      }, i * 30);
    });
  }, [lesson, preloadText]);

  const currentBlock = blocks[blockIndex] || null;
  const totalBlocks = blocks.length;
  const progressPct = totalBlocks ? Math.round(((blockIndex + 1) / totalBlocks) * 100) : 0;
  const isCurrentCompleted = !!currentBlock?.id && !!completedBlockIds[currentBlock.id];
  const isLastBlock = blockIndex === totalBlocks - 1;
  const isLastBlockComplete = isLastBlock && isCurrentCompleted;
  const lessonComplete = lessonDone;
  const isChoiceBlock = ["recognise_mcq", "listen_mcq", "best_response", "context_gap_select", "choose_correct_form", "conversation_turn_fill"].includes(currentBlock?.type);
  const isScenarioBlock = currentBlock?.type === "scenario_chain";
  const showPatternNote = blockIndex === 0 && isCurrentCompleted;
  const showNavBar = !lessonComplete && !isLastBlockComplete && !isChoiceBlock && !isScenarioBlock;

  // Fire completion once when lessonDone becomes true
  useEffect(() => {
    if (!lessonDone || completionFiredRef.current) return;
    completionFiredRef.current = true;
    if (lesson?.id) {
      completeLesson(lesson.id, userId);
      const scoreableBlocks = (lesson.blocks || []).filter(b =>
        ["recognise_mcq", "listen_mcq", "best_response", "scenario_chain"].includes(b.type)
      ).length;
      const accuracy = scoreableBlocks > 0
        ? Math.round(((scoreableBlocks - Math.min(wrongAnswerCount, scoreableBlocks)) / scoreableBlocks) * 100)
        : 100;
      setAccuracyPct(accuracy);
      const base = 30;
      const earned = Math.max(10, base - wrongAnswerCount * 2);
      const result = earnLessonXP(lesson.id, earned, userId);
      if (result?.xpGained) setXpEarned(result.xpGained);
      onLessonComplete?.({ wrongAnswers: wrongAnswerCount, scoreableBlocks, xpAwarded: result?.xpGained || 0 });
    } else {
      onLessonComplete?.({ wrongAnswers: 0, scoreableBlocks: 0, xpAwarded: 0 });
    }
  }, [lessonComplete, lesson?.id, userId, completeLesson, earnLessonXP, onLessonComplete, wrongAnswerCount]);

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
        <div className="px-4 pt-5"><TrainingBackButton onClick={onBack} /></div>
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
          accuracyPct={accuracyPct}
          onContinue={typeof onNailedItContinue === "function"
            ? () => onNailedItContinue(lesson.id)
            : onNextLesson}
          nextLessonLabel={nextLessonLabel}
          onBack={onBack}
        />
      ) : (
        <>
          {/* Header */}
          <div className="grid grid-cols-[44px_1fr_44px] items-center mb-3">
            <TrainingBackButton onClick={onBack} />
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
                onWrongAnswer={() => setWrongAnswerCount((n) => n + 1)}
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

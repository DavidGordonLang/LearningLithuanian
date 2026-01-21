// src/views/training/RecallFlipView.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

/**
 * Tool A — Recall Flip (Active Recall)
 *
 * - Card-based reveal (3D flip)
 * - EN ↔ LT direction toggle
 * - Self-grade AFTER reveal:
 *    - "Got it right" (Correct) => successGlow(strong)
 *    - "I was close" (Near-miss) => successGlow(soft)
 *    - "Got it wrong" (Incorrect) => ghostFade()
 *
 * Audio (LT only):
 * - Always plays Lithuanian text only
 * - EN → LT: LT is the answer, so audio is enabled only AFTER reveal
 * - LT → EN: LT is the prompt, so audio is enabled immediately
 *
 * Phase 1: no persistence yet. This view only runs the UX.
 *
 * Props:
 * - rows: visible rows (already excludes _deleted in App)
 * - focus: "phrases" | "words" | "numbers" | "all"  (phrases includes Questions)
 * - onBack: () => void
 * - playText?: (text: string, opts?: any) => Promise<any> | any   (existing TTS hook)
 */
export default function RecallFlipView({ rows, focus, onBack, playText }) {
  const list = Array.isArray(rows) ? rows : [];

  // Direction: prompt -> answer
  // default: EN -> LT (intention in English, recall Lithuanian)
  const [direction, setDirection] = useState("en_to_lt"); // "en_to_lt" | "lt_to_en"

  // Card state
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false); // blocks double taps during fx
  const [fx, setFx] = useState(null); // "flip" | "correct" | "close" | "wrong"
  const fxTimerRef = useRef(null);

  // Audio state
  const [audioBusy, setAudioBusy] = useState(false);

  // Session queue
  const eligible = useMemo(() => filterByFocus(list, focus), [list, focus]);
  const [queue, setQueue] = useState(() => buildQueue(eligible, 20));
  const [idx, setIdx] = useState(0);

  // Keep queue fresh if focus changes or library changes substantially
  useEffect(() => {
    setQueue(buildQueue(eligible, 20));
    setIdx(0);
    setRevealed(false);
    setFx(null);
    setBusy(false);
    setAudioBusy(false);
  }, [focus, eligible.length]); // intentional: avoid deep deps

  useEffect(() => {
    return () => {
      if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
    };
  }, []);

  const current = queue[idx] || null;

  const canReveal = !!current && !revealed && !busy;
  const canGrade = !!current && revealed && !busy;

  const prompt = useMemo(
    () => getPromptText(current, direction),
    [current, direction]
  );
  const answer = useMemo(
    () => getAnswerText(current, direction),
    [current, direction]
  );

  // LT-only audio text (never English)
  const ltText = useMemo(() => {
    if (!current) return "";
    return safeStr(
      current?.LT ??
        current?.Lithuanian ??
        current?.lt ??
        current?.lithuanian ??
        ""
    );
  }, [current]);

  // Audio rule:
  // - EN→LT: LT is the answer -> only after reveal
  // - LT→EN: LT is the prompt -> anytime
  const canPlayLt =
    !!ltText &&
    typeof playText === "function" &&
    !audioBusy &&
    !busy &&
    (direction === "lt_to_en" || revealed);

  function triggerFx(kind, ms = 520) {
    setFx(kind);
    if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
    fxTimerRef.current = setTimeout(() => setFx(null), ms);
  }

  function handleReveal() {
    if (!canReveal) return;
    setRevealed(true);
    triggerFx("flip", 520);
  }

  function nextCard() {
    // reset for next
    setRevealed(false);
    setFx(null);
    setBusy(false);
    setAudioBusy(false);

    setIdx((prev) => {
      const next = prev + 1;
      if (next < queue.length) return next;

      // Session end: rebuild a new queue and start over
      const fresh = buildQueue(eligible, 20);
      setQueue(fresh);
      return 0;
    });
  }

  function handleGrade(outcome) {
    if (!canGrade) return;

    // outcome: "correct" | "close" | "wrong"
    setBusy(true);

    if (outcome === "correct") {
      triggerFx("correct", 700);
      setTimeout(nextCard, 420);
      return;
    }

    if (outcome === "close") {
      triggerFx("close", 650);
      setTimeout(nextCard, 420);
      return;
    }

    triggerFx("wrong", 700);
    setTimeout(nextCard, 420);
  }

  async function handlePlayLt() {
    if (!canPlayLt) return;

    try {
      setAudioBusy(true);
      const res = playText(ltText);
      // support both promise + sync implementations
      if (res && typeof res.then === "function") await res;
    } catch {
      // silent fail (no regression / no noisy alerts from a practice tool)
    } finally {
      setAudioBusy(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-sm text-zinc-300 hover:text-zinc-100"
          onClick={onBack}
        >
          ← Back
        </button>
        <div className="text-sm text-zinc-400">Recall Flip</div>
      </div>

      {/* Direction toggle */}
      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-2">
        <div className="grid grid-cols-2 gap-2">
          <ToggleButton
            active={direction === "en_to_lt"}
            label="EN → LT"
            sub="Recall Lithuanian"
            onClick={() => {
              if (busy || audioBusy) return;
              setDirection("en_to_lt");
              setRevealed(false);
              setFx(null);
            }}
          />
          <ToggleButton
            active={direction === "lt_to_en"}
            label="LT → EN"
            sub="Recall English"
            onClick={() => {
              if (busy || audioBusy) return;
              setDirection("lt_to_en");
              setRevealed(false);
              setFx(null);
            }}
          />
        </div>
      </div>

      {/* Empty state */}
      {!current && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="text-lg font-semibold">Nothing to train</div>
          <div className="text-sm text-zinc-300 mt-2">
            Add a few entries first, or switch focus.
          </div>
        </div>
      )}

      {/* Card */}
      {!!current && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-zinc-500">
              {Math.min(idx + 1, queue.length)} / {queue.length}
            </div>

            <button
              type="button"
              className={cn(
                "rf-audio-btn",
                canPlayLt
                  ? "rf-audio-enabled"
                  : "rf-audio-disabled"
              )}
              onClick={handlePlayLt}
              disabled={!canPlayLt}
              aria-label="Play Lithuanian audio"
              title={
                typeof playText !== "function"
                  ? "Audio unavailable"
                  : direction === "en_to_lt" && !revealed
                  ? "Reveal first"
                  : "Play Lithuanian"
              }
            >
              <span className="rf-audio-icon" aria-hidden="true">
                🔊
              </span>
              <span className="text-xs font-semibold">
                {audioBusy ? "Playing…" : "Listen"}
              </span>
            </button>
          </div>

          <div className="relative">
            {/* successGlow / ghostFade overlays (anchored to the card) */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 rounded-3xl",
                fx === "correct" ? "rf-success-strong" : "",
                fx === "close" ? "rf-success-soft" : "",
                fx === "wrong" ? "rf-ghost-fade" : ""
              )}
            />

            <div
              className={cn(
                "rf-perspective",
                busy ? "pointer-events-none select-none" : ""
              )}
            >
              <div
                className={cn(
                  "rf-card rounded-3xl border border-zinc-800 bg-zinc-950/70 shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
                  revealed ? "rf-flipped" : "",
                  fx === "flip" ? "rf-flip-pulse" : ""
                )}
              >
                {/* FRONT */}
                <div className="rf-face rf-front p-6">
                  <div className="text-sm text-zinc-400">Prompt</div>
                  <div className="mt-2 text-xl font-semibold leading-snug whitespace-pre-wrap break-words">
                    {prompt || "—"}
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      className={cn(
                        "w-full rounded-2xl px-4 py-3 text-sm font-medium transition",
                        canReveal
                          ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                          : "bg-zinc-800 text-zinc-400 cursor-not-allowed"
                      )}
                      onClick={handleReveal}
                      disabled={!canReveal}
                    >
                      Reveal
                    </button>
                  </div>

                  <div className="mt-4 text-xs text-zinc-500">
                    {direction === "en_to_lt"
                      ? "Try to recall Lithuanian before revealing."
                      : "Hear the Lithuanian if you need it."}
                  </div>
                </div>

                {/* BACK */}
                <div className="rf-face rf-back p-6">
                  <div className="text-sm text-zinc-400">Answer</div>
                  <div className="mt-2 text-xl font-semibold leading-snug whitespace-pre-wrap break-words">
                    {answer || "—"}
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm font-semibold transition border",
                        canGrade
                          ? "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950/70 text-zinc-100"
                          : "border-zinc-900 bg-zinc-950/20 text-zinc-500 cursor-not-allowed"
                      )}
                      onClick={() => handleGrade("wrong")}
                      disabled={!canGrade}
                    >
                      Got it wrong
                    </button>

                    <button
                      type="button"
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm font-semibold transition border",
                        canGrade
                          ? "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15 text-zinc-100"
                          : "border-zinc-900 bg-zinc-950/20 text-zinc-500 cursor-not-allowed"
                      )}
                      onClick={() => handleGrade("close")}
                      disabled={!canGrade}
                    >
                      I was close
                    </button>

                    <button
                      type="button"
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                        canGrade
                          ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                          : "bg-zinc-800 text-zinc-400 cursor-not-allowed"
                      )}
                      onClick={() => handleGrade("correct")}
                      disabled={!canGrade}
                    >
                      Got it right
                    </button>
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      className={cn(
                        "w-full text-xs text-zinc-400 hover:text-zinc-200 py-2",
                        busy || audioBusy ? "cursor-not-allowed opacity-60" : ""
                      )}
                      onClick={() => {
                        if (busy || audioBusy) return;
                        setRevealed(false);
                        setFx(null);
                      }}
                      disabled={busy || audioBusy}
                    >
                      Hide answer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-zinc-500">
            Self-grade only. No auto-checking in this tool.
          </div>
        </div>
      )}

      {/* Local CSS for the 3 primitives */}
      <style>{css}</style>
    </div>
  );
}

/* ----------------------------- helpers ----------------------------- */

function filterByFocus(rows, focus) {
  const sheet = (r) => String(r?.Sheet || "Phrases");

  return rows.filter((r) => {
    const s = sheet(r);

    if (focus === "all") return true;
    if (focus === "phrases") return s === "Phrases" || s === "Questions";
    if (focus === "words") return s === "Words";
    if (focus === "numbers") return s === "Numbers";

    return true;
  });
}

function buildQueue(eligible, n = 20) {
  const list = Array.isArray(eligible) ? eligible : [];
  if (!list.length) return [];

  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.max(1, Math.min(n, shuffled.length)));
}

function getPromptText(row, direction) {
  if (!row) return "";

  if (direction === "en_to_lt") {
    return safeStr(
      row?.EN ??
        row?.English ??
        row?.en ??
        row?.english ??
        ""
    );
  }

  return safeStr(
    row?.LT ??
      row?.Lithuanian ??
      row?.lt ??
      row?.lithuanian ??
      ""
  );
}

function getAnswerText(row, direction) {
  if (!row) return "";

  if (direction === "en_to_lt") {
    return safeStr(
      row?.LT ??
        row?.Lithuanian ??
        row?.lt ??
        row?.lithuanian ??
        ""
    );
  }

  return safeStr(
    row?.EN ??
      row?.English ??
      row?.en ??
      row?.english ??
      ""
  );
}

function safeStr(v) {
  return String(v ?? "").trim();
}

function ToggleButton({ active, label, sub, onClick }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-2xl border px-3 py-2 text-left transition select-none",
        active
          ? "border-emerald-500/60 bg-emerald-500/10"
          : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950/60"
      )}
      onClick={onClick}
    >
      <div className="text-xs font-semibold">{label}</div>
      <div className="text-[11px] text-zinc-400 mt-0.5">{sub}</div>
    </button>
  );
}

/* ----------------------------- motion primitives ----------------------------- */
/**
 * Allowed primitives only:
 * - cardFlip3D()
 * - successGlow(level)
 * - ghostFade()
 *
 * Implemented here as scoped CSS classes:
 * - rf-card / rf-flipped (cardFlip3D)
 * - rf-success-strong (successGlow strong)
 * - rf-success-soft (successGlow soft)
 * - rf-ghost-fade (ghostFade)
 */
const css = `
.rf-perspective{
  perspective: 1200px;
}
.rf-card{
  position: relative;
  transform-style: preserve-3d;
  transition: transform 520ms cubic-bezier(.2,.9,.2,1);
  min-height: 270px;
}
.rf-face{
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.rf-front{
  transform: rotateY(0deg);
}
.rf-back{
  transform: rotateY(180deg);
}
.rf-flipped{
  transform: rotateY(180deg);
}

/* still within cardFlip3D primitive */
.rf-flip-pulse{
  will-change: transform;
}

/* audio pill */
.rf-audio-btn{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(39,39,42,1);
  background: rgba(9,9,11,0.35);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: transform 140ms ease, background 140ms ease, opacity 140ms ease;
}
.rf-audio-icon{
  line-height: 1;
  transform: translateY(-0.5px);
}
.rf-audio-enabled{
  cursor: pointer;
  opacity: 1;
}
.rf-audio-enabled:hover{
  background: rgba(9,9,11,0.55);
  transform: translateY(-1px);
}
.rf-audio-disabled{
  cursor: not-allowed;
  opacity: 0.45;
}

/* successGlow(strong) */
.rf-success-strong{
  box-shadow:
    0 0 0 0 rgba(52, 211, 153, 0.0),
    0 0 40px 8px rgba(52, 211, 153, 0.18),
    0 0 90px 24px rgba(52, 211, 153, 0.10);
  animation: rfGlowStrong 700ms ease-out forwards;
}
@keyframes rfGlowStrong{
  0%{ opacity: 0.0; transform: scale(0.995); filter: blur(0px); }
  25%{ opacity: 1.0; transform: scale(1.01); filter: blur(0.2px); }
  100%{ opacity: 0.0; transform: scale(1.02); filter: blur(0.6px); }
}

/* successGlow(soft) */
.rf-success-soft{
  box-shadow:
    0 0 0 0 rgba(52, 211, 153, 0.0),
    0 0 26px 6px rgba(52, 211, 153, 0.12),
    0 0 60px 16px rgba(52, 211, 153, 0.07);
  animation: rfGlowSoft 620ms ease-out forwards;
}
@keyframes rfGlowSoft{
  0%{ opacity: 0.0; transform: scale(0.996); filter: blur(0px); }
  30%{ opacity: 0.85; transform: scale(1.008); filter: blur(0.2px); }
  100%{ opacity: 0.0; transform: scale(1.015); filter: blur(0.55px); }
}

/* ghostFade() */
.rf-ghost-fade{
  animation: rfGhost 700ms ease-out forwards;
}
@keyframes rfGhost{
  0%{ opacity: 0.0; transform: scale(1); filter: blur(0px) saturate(1); }
  30%{ opacity: 0.6; transform: scale(0.995); filter: blur(0.6px) saturate(0.85); }
  100%{ opacity: 0.0; transform: scale(0.985); filter: blur(1.0px) saturate(0.65); }
}
`;

// src/views/training/RecallFlipView.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

const SESSION_SIZE = 10;
const LONG_PRESS_MS = 550;

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
 * - Long-press plays slow audio using the app's existing slow mode (opts: { slow: true })
 *
 * Session:
 * - 10 cards per run
 * - At end: summary modal (Right / Close / Wrong)
 *   - Review mistakes (close+wrong)
 *   - Let’s do another 10 (fresh)
 *   - Finish (back)
 *
 * Phase 1: no persistence. Session scoring only, resets every run.
 */
export default function RecallFlipView({ rows, focus, onBack, playText }) {
  const list = Array.isArray(rows) ? rows : [];

  // Direction: prompt -> answer
  const [direction, setDirection] = useState("en_to_lt"); // "en_to_lt" | "lt_to_en"

  // Card state
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fx, setFx] = useState(null); // "flip" | "correct" | "close" | "wrong"
  const fxTimerRef = useRef(null);

  // Audio state
  const [audioBusy, setAudioBusy] = useState(false);

  // Session state
  const eligible = useMemo(() => filterByFocus(list, focus), [list, focus]);
  const [queue, setQueue] = useState(() => buildQueue(eligible, SESSION_SIZE));
  const [idx, setIdx] = useState(0);

  const [countRight, setCountRight] = useState(0);
  const [countClose, setCountClose] = useState(0);
  const [countWrong, setCountWrong] = useState(0);

  const mistakesRef = useRef([]); // store row objects for "close" + "wrong" in this session
  const [showSummary, setShowSummary] = useState(false);

  // Long-press handling for audio
  const pressTimerRef = useRef(null);
  const longPressFiredRef = useRef(false);
  const pressActiveRef = useRef(false);

  // Keep queue fresh if focus changes or library changes substantially
  useEffect(() => {
    resetSession(buildQueue(eligible, SESSION_SIZE));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, eligible.length]);

  useEffect(() => {
    return () => {
      if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
      clearPressTimer();
    };
  }, []);

  const current = queue[idx] || null;

  const canReveal = !!current && !revealed && !busy && !showSummary;
  const canGrade = !!current && revealed && !busy && !showSummary;

  const prompt = useMemo(() => getPromptText(current, direction), [current, direction]);
  const answer = useMemo(() => getAnswerText(current, direction), [current, direction]);

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
    !showSummary &&
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

  function resetSession(nextQueue) {
    setShowSummary(false);
    setQueue(Array.isArray(nextQueue) ? nextQueue : []);
    setIdx(0);
    setRevealed(false);
    setFx(null);
    setBusy(false);
    setAudioBusy(false);

    setCountRight(0);
    setCountClose(0);
    setCountWrong(0);
    mistakesRef.current = [];
  }

  function finishSession() {
    setBusy(false);
    setAudioBusy(false);
    setRevealed(false);
    setFx(null);
    setShowSummary(true);
  }

  function nextCardOrFinish() {
    // reset for next card
    setRevealed(false);
    setFx(null);
    setBusy(false);
    setAudioBusy(false);

    const next = idx + 1;
    if (next < queue.length) {
      setIdx(next);
      return;
    }

    // End of this run
    finishSession();
  }

  function noteMistake(rowObj) {
    if (!rowObj) return;
    mistakesRef.current = [...(mistakesRef.current || []), rowObj];
  }

  function handleGrade(outcome) {
    if (!canGrade) return;

    // outcome: "correct" | "close" | "wrong"
    setBusy(true);

    if (outcome === "correct") {
      setCountRight((n) => n + 1);
      triggerFx("correct", 700);
      setTimeout(nextCardOrFinish, 420);
      return;
    }

    if (outcome === "close") {
      setCountClose((n) => n + 1);
      noteMistake(current);
      triggerFx("close", 650);
      setTimeout(nextCardOrFinish, 420);
      return;
    }

    setCountWrong((n) => n + 1);
    noteMistake(current);
    triggerFx("wrong", 700);
    setTimeout(nextCardOrFinish, 420);
  }

  async function playLt(opts) {
    if (!canPlayLt) return;

    try {
      setAudioBusy(true);
      const res = playText(ltText, opts);
      if (res && typeof res.then === "function") await res;
    } catch {
      // silent fail (practice tool should not scream)
    } finally {
      setAudioBusy(false);
    }
  }

  function clearPressTimer() {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }

  function startAudioPress() {
    if (!canPlayLt) return;
    if (pressActiveRef.current) return;

    pressActiveRef.current = true;
    longPressFiredRef.current = false;

    clearPressTimer();
    pressTimerRef.current = setTimeout(() => {
      if (!pressActiveRef.current) return;
      longPressFiredRef.current = true;
      playLt({ slow: true });
    }, LONG_PRESS_MS);
  }

  function endAudioPress() {
    if (!pressActiveRef.current) return;

    pressActiveRef.current = false;
    clearPressTimer();

    // If long-press already fired, do nothing else.
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }

    // Otherwise: normal tap behaviour
    playLt(undefined);
  }

  function cancelAudioPress() {
    pressActiveRef.current = false;
    longPressFiredRef.current = false;
    clearPressTimer();
  }

  function buildMistakeRun() {
    const mistakes = Array.isArray(mistakesRef.current) ? mistakesRef.current : [];
    const unique = uniqById(mistakes);
    return buildQueue(unique, Math.min(SESSION_SIZE, unique.length || 0));
  }

  const progressLabel = useMemo(() => {
    const total = queue.length;
    if (!total) return "0 / 0";
    return `${Math.min(idx + 1, total)} / ${total}`;
  }, [idx, queue.length]);

  const summaryTotal = countRight + countClose + countWrong;

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="rf-top-btn"
          onClick={() => {
            if (busy || audioBusy) return;
            onBack?.();
          }}
          disabled={busy || audioBusy}
        >
          <span aria-hidden="true">←</span>
          <span>Back</span>
        </button>

        <div className="text-sm text-zinc-400">Recall Flip</div>

        {/* spacer for symmetry */}
        <div className="w-[82px]" aria-hidden="true" />
      </div>

      {/* Direction toggle */}
      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-2">
        <div className="grid grid-cols-2 gap-2">
          <ToggleButton
            active={direction === "en_to_lt"}
            label="EN → LT"
            sub="Recall Lithuanian"
            onClick={() => {
              if (busy || audioBusy || showSummary) return;
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
              if (busy || audioBusy || showSummary) return;
              setDirection("lt_to_en");
              setRevealed(false);
              setFx(null);
            }}
          />
        </div>
      </div>

      {/* Empty state */}
      {!current && !showSummary && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="text-lg font-semibold">Nothing to train</div>
          <div className="text-sm text-zinc-300 mt-2">
            Add a few entries first, or switch focus.
          </div>
        </div>
      )}

      {/* Card */}
      {!!current && !showSummary && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-zinc-500">{progressLabel}</div>

            <div className="text-xs text-zinc-500">
              Right {countRight} · Close {countClose} · Wrong {countWrong}
            </div>
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

            <div className={cn("rf-perspective", busy ? "pointer-events-none select-none" : "")}>
              <div
                className={cn(
                  "rf-card rounded-3xl border border-zinc-800 bg-zinc-950/70 shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
                  revealed ? "rf-flipped" : "",
                  fx === "flip" ? "rf-flip-pulse" : ""
                )}
              >
                {/* FRONT */}
                <div className="rf-face rf-front p-6">
                  <div className="rf-card-top">
                    <div className="text-sm text-zinc-400">Prompt</div>

                    <AudioInsideCard
                      canPlayLt={canPlayLt}
                      audioBusy={audioBusy}
                      direction={direction}
                      revealed={revealed}
                      onPressStart={startAudioPress}
                      onPressEnd={endAudioPress}
                      onPressCancel={cancelAudioPress}
                      disabledReason={
                        typeof playText !== "function"
                          ? "Audio unavailable"
                          : direction === "en_to_lt" && !revealed
                          ? "Reveal first"
                          : "Play Lithuanian"
                      }
                    />
                  </div>

                  <div className="mt-3 text-xl font-semibold leading-snug whitespace-pre-wrap break-words">
                    {prompt || "—"}
                  </div>

                  <div className="mt-7">
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
                  <div className="rf-card-top">
                    <div className="text-sm text-zinc-400">Answer</div>

                    <AudioInsideCard
                      canPlayLt={canPlayLt}
                      audioBusy={audioBusy}
                      direction={direction}
                      revealed={revealed}
                      onPressStart={startAudioPress}
                      onPressEnd={endAudioPress}
                      onPressCancel={cancelAudioPress}
                      disabledReason={
                        typeof playText !== "function"
                          ? "Audio unavailable"
                          : direction === "en_to_lt" && !revealed
                          ? "Reveal first"
                          : "Play Lithuanian"
                      }
                    />
                  </div>

                  <div className="mt-3 text-xl font-semibold leading-snug whitespace-pre-wrap break-words">
                    {answer || "—"}
                  </div>

                  <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                  <div className="mt-4">
                    <button
                      type="button"
                      className={cn(
                        "w-full rf-secondary-btn",
                        busy || audioBusy ? "opacity-60 cursor-not-allowed" : ""
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

      {/* Summary modal */}
      {showSummary && (
        <div
          className="rf-modal-backdrop"
          onClick={() => {
            // keep it stable: click-out does nothing (user chooses)
          }}
        >
          <div className="rf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-semibold">Session complete</div>
            <div className="mt-1 text-sm text-zinc-400">
              {summaryTotal} {summaryTotal === 1 ? "card" : "cards"}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <StatPill label="Right" value={countRight} />
              <StatPill label="Close" value={countClose} />
              <StatPill label="Wrong" value={countWrong} />
            </div>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                className={cn(
                  "rf-primary-btn",
                  (countClose + countWrong) === 0 ? "opacity-50 cursor-not-allowed" : ""
                )}
                onClick={() => {
                  if ((countClose + countWrong) === 0) return;
                  const next = buildMistakeRun();
                  resetSession(next);
                }}
                disabled={(countClose + countWrong) === 0}
              >
                Review mistakes
              </button>

              <button
                type="button"
                className="rf-secondary-btn"
                onClick={() => {
                  resetSession(buildQueue(eligible, SESSION_SIZE));
                }}
              >
                Let’s do another 10
              </button>

              <button
                type="button"
                className="rf-ghost-btn"
                onClick={() => onBack?.()}
              >
                Finish
              </button>
            </div>

            <div className="mt-5 text-xs text-zinc-500">
              Tip: long-press the speaker icon for slow playback.
            </div>
          </div>
        </div>
      )}

      {/* Local CSS for the 3 primitives + tool UI */}
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

function uniqById(list) {
  const arr = Array.isArray(list) ? list : [];
  const seen = new Set();
  const out = [];
  for (const r of arr) {
    const id = String(r?._id ?? r?.id ?? "");
    const key = id || JSON.stringify(r);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

function buildQueue(eligible, n = SESSION_SIZE) {
  const list = Array.isArray(eligible) ? eligible : [];
  if (!list.length) return [];

  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const want = Math.max(1, Math.min(n, shuffled.length));
  return shuffled.slice(0, want);
}

function getPromptText(row, direction) {
  if (!row) return "";

  if (direction === "en_to_lt") {
    return safeStr(row?.EN ?? row?.English ?? row?.en ?? row?.english ?? "");
  }

  return safeStr(row?.LT ?? row?.Lithuanian ?? row?.lt ?? row?.lithuanian ?? "");
}

function getAnswerText(row, direction) {
  if (!row) return "";

  if (direction === "en_to_lt") {
    return safeStr(row?.LT ?? row?.Lithuanian ?? row?.lt ?? row?.lithuanian ?? "");
  }

  return safeStr(row?.EN ?? row?.English ?? row?.en ?? row?.english ?? "");
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

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3 text-center">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function AudioInsideCard({
  canPlayLt,
  audioBusy,
  onPressStart,
  onPressEnd,
  onPressCancel,
  disabledReason,
}) {
  const disabled = !canPlayLt;

  return (
    <button
      type="button"
      className={cn(
        "rf-audio-chip",
        disabled ? "rf-audio-disabled" : "rf-audio-enabled"
      )}
      disabled={disabled}
      aria-label="Play Lithuanian audio"
      title={disabledReason}
      onMouseDown={(e) => {
        e.preventDefault();
        if (disabled) return;
        onPressStart?.();
      }}
      onMouseUp={(e) => {
        e.preventDefault();
        if (disabled) return;
        onPressEnd?.();
      }}
      onMouseLeave={(e) => {
        e.preventDefault();
        onPressCancel?.();
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        if (disabled) return;
        onPressStart?.();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        if (disabled) return;
        onPressEnd?.();
      }}
      onTouchCancel={(e) => {
        e.preventDefault();
        onPressCancel?.();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="rf-audio-icon" aria-hidden="true">
        🔊
      </span>
      <span className="text-xs font-semibold">
        {audioBusy ? "Playing…" : "Listen"}
      </span>
    </button>
  );
}

/* ----------------------------- motion primitives + tool UI ----------------------------- */
/**
 * Allowed outcome primitives only:
 * - cardFlip3D()
 * - successGlow(level)
 * - ghostFade()
 *
 * Modal uses simple layout; outcome FX remains limited to the above.
 */
const css = `
.rf-perspective{
  perspective: 1200px;
}
.rf-card{
  position: relative;
  transform-style: preserve-3d;
  transition: transform 520ms cubic-bezier(.2,.9,.2,1);
  min-height: 340px; /* taller to avoid cramped layout */
}
.rf-face{
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  flex-direction: column;
}
.rf-front{ transform: rotateY(0deg); }
.rf-back{ transform: rotateY(180deg); }
.rf-flipped{ transform: rotateY(180deg); }

.rf-card-top{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* still within cardFlip3D primitive */
.rf-flip-pulse{ will-change: transform; }

/* top/back buttons */
.rf-top-btn{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(39,39,42,1);
  background: rgba(9,9,11,0.35);
  color: rgba(228,228,231,1);
  transition: transform 140ms ease, background 140ms ease, opacity 140ms ease;
}
.rf-top-btn:hover{
  background: rgba(9,9,11,0.55);
  transform: translateY(-1px);
}
.rf-top-btn:disabled{ opacity: 0.6; cursor: not-allowed; transform: none; }

.rf-primary-btn{
  width: 100%;
  border-radius: 16px;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 700;
  background: rgba(52, 211, 153, 1);
  color: rgba(9,9,11,1);
  transition: filter 140ms ease, transform 140ms ease, opacity 140ms ease;
}
.rf-primary-btn:hover{ filter: brightness(1.03); transform: translateY(-1px); }
.rf-primary-btn:disabled{ opacity: 0.55; cursor: not-allowed; transform: none; }

.rf-secondary-btn{
  width: 100%;
  border-radius: 16px;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 650;
  border: 1px solid rgba(39,39,42,1);
  background: rgba(9,9,11,0.35);
  color: rgba(244,244,245,1);
  transition: transform 140ms ease, background 140ms ease, opacity 140ms ease;
}
.rf-secondary-btn:hover{ background: rgba(9,9,11,0.55); transform: translateY(-1px); }
.rf-secondary-btn:disabled{ opacity: 0.6; cursor: not-allowed; transform: none; }

.rf-ghost-btn{
  width: 100%;
  border-radius: 16px;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 650;
  border: 1px solid rgba(39,39,42,1);
  background: transparent;
  color: rgba(161,161,170,1);
  transition: transform 140ms ease, opacity 140ms ease, color 140ms ease;
}
.rf-ghost-btn:hover{ transform: translateY(-1px); color: rgba(244,244,245,1); }

/* audio chip inside card */
.rf-audio-chip{
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
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}
.rf-audio-icon{ line-height: 1; transform: translateY(-0.5px); }
.rf-audio-enabled{ cursor: pointer; opacity: 1; }
.rf-audio-enabled:hover{ background: rgba(9,9,11,0.55); transform: translateY(-1px); }
.rf-audio-disabled{ cursor: not-allowed; opacity: 0.45; transform: none; }

/* modal */
.rf-modal-backdrop{
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(0,0,0,0.62);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.rf-modal{
  width: 100%;
  max-width: 420px;
  border-radius: 22px;
  border: 1px solid rgba(39,39,42,1);
  background: rgba(9,9,11,0.90);
  box-shadow: 0 22px 70px rgba(0,0,0,0.65);
  padding: 18px;
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

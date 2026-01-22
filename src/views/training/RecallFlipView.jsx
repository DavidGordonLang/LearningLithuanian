// src/views/training/RecallFlipView.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRecallFlipSession } from "../../hooks/training/useRecallFlipSession";

const cn = (...xs) => xs.filter(Boolean).join(" ");

const SESSION_SIZE = 10;

/**
 * Tool A — Recall Flip (Active Recall)
 *
 * Interaction:
 * - Tap anywhere on the card to flip (front <-> back)
 * - No Reveal button
 * - No Hide Answer button
 *
 * Audio (LT only):
 * - Two buttons: Play + Slow (slow uses opts: { slow: true })
 * - Audio controls ONLY appear when Lithuanian is visible on the card:
 *    - EN → LT: LT is on the back => visible AFTER reveal
 *    - LT → EN: LT is on the front => visible BEFORE reveal
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

  // Visual FX (kept in-view)
  const [fx, setFx] = useState(null); // "flip" | "correct" | "close" | "wrong"
  const fxTimerRef = useRef(null);

  // Audio state (kept in-view)
  const [audioBusy, setAudioBusy] = useState(false);

  // Eligible list
  const eligible = useMemo(() => filterByFocus(list, focus), [list, focus]);

  // Session hook owns: queue/idx/revealed/busy/summary/scoring/mistakes
  const s = useRecallFlipSession({ eligible, sessionSize: SESSION_SIZE });

  // Cleanup FX timer
  useEffect(() => {
    return () => {
      if (fxTimerRef.current) {
        clearTimeout(fxTimerRef.current);
        fxTimerRef.current = null;
      }
    };
  }, []);

  const current = s.current;

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

  // Determine which side currently contains Lithuanian
  // - EN→LT: LT is answer => visible AFTER reveal (back)
  // - LT→EN: LT is prompt => visible BEFORE reveal (front)
  const isLtVisible = useMemo(() => {
    if (!current) return false;
    if (direction === "en_to_lt") return !!s.revealed;
    return !s.revealed;
  }, [current, direction, s.revealed]);

  const canPlayLt =
    !!ltText &&
    typeof playText === "function" &&
    !audioBusy &&
    !s.busy &&
    !s.showSummary &&
    isLtVisible;

  function triggerFx(kind, ms = 520) {
    setFx(kind);
    if (fxTimerRef.current) clearTimeout(fxTimerRef.current);
    fxTimerRef.current = setTimeout(() => setFx(null), ms);
  }

  async function playLt(opts) {
    if (!canPlayLt) return;

    try {
      setAudioBusy(true);
      const res = playText(ltText, opts);
      if (res && typeof res.then === "function") await res;
    } catch {
      // silent fail
    } finally {
      setAudioBusy(false);
    }
  }

  function hardExit() {
    // Back must ALWAYS work.
    if (fxTimerRef.current) {
      clearTimeout(fxTimerRef.current);
      fxTimerRef.current = null;
    }
    s.clearTimers?.();
    setAudioBusy(false);
    setFx(null);
    onBack?.();
  }

  function toggleCardFlip() {
    if (!current) return;
    if (s.showSummary) return;
    if (s.busy || audioBusy) return;

    if (!s.revealed) {
      s.setRevealed(true);
      triggerFx("flip", 520);
    } else {
      s.setRevealed(false);
      // calm flip-back (no pulse)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 rf-root">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button type="button" className="rf-top-btn" onClick={hardExit}>
          <span aria-hidden="true">←</span>
          <span>Back</span>
        </button>

        <div className="text-sm text-zinc-400">Recall Flip</div>

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
              if (s.busy || audioBusy || s.showSummary) return;
              setDirection("en_to_lt");
              s.setRevealed(false);
              setFx(null);
            }}
          />
          <ToggleButton
            active={direction === "lt_to_en"}
            label="LT → EN"
            sub="Recall English"
            onClick={() => {
              if (s.busy || audioBusy || s.showSummary) return;
              setDirection("lt_to_en");
              s.setRevealed(false);
              setFx(null);
            }}
          />
        </div>
      </div>

      {/* Empty state */}
      {!current && !s.showSummary && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="text-lg font-semibold">Nothing to train</div>
          <div className="text-sm text-zinc-300 mt-2">
            Add a few entries first, or switch focus.
          </div>
        </div>
      )}

      {/* Card */}
      {!!current && !s.showSummary && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-zinc-500">{s.progressLabel}</div>

            <div className="text-xs text-zinc-500">
              Right {s.countRight} · Close {s.countClose} · Wrong {s.countWrong}
            </div>
          </div>

          <div className="relative">
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
                s.busy ? "pointer-events-none select-none" : ""
              )}
            >
              <div
                className={cn(
                  "rf-card rounded-3xl border border-zinc-800 bg-zinc-950/70 shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
                  s.revealed ? "rf-flipped" : "",
                  fx === "flip" ? "rf-flip-pulse" : ""
                )}
                role="button"
                tabIndex={0}
                aria-label="Flip card"
                onClick={toggleCardFlip}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleCardFlip();
                  }
                }}
              >
                {/* FRONT (Prompt) */}
                <div className="rf-face rf-front p-6">
                  <div className="rf-card-top-min">
                    <div className="rf-top-spacer" aria-hidden="true" />

                    {/* Audio only if LT is visible on this side (LT→EN front) */}
                    {isLtVisible && (
                      <AudioButtons
                        canPlayLt={canPlayLt}
                        audioBusy={audioBusy}
                        onPlay={() => playLt(undefined)}
                        onPlaySlow={() => playLt({ slow: true })}
                        disabledReason={
                          typeof playText !== "function"
                            ? "Audio unavailable"
                            : "Play Lithuanian"
                        }
                      />
                    )}
                  </div>

                  <div className="rf-center-zone">
                    <div className="rf-hero-text">{prompt || "—"}</div>

                    {!s.revealed && <div className="rf-hint">Tap the card to reveal</div>}
                  </div>

                  <div className="rf-bottom-spacer" aria-hidden="true" />
                </div>

                {/* BACK (Answer) */}
                <div className="rf-face rf-back p-6">
                  <div className="rf-card-top-min">
                    <div className="rf-top-spacer" aria-hidden="true" />

                    {/* Audio only if LT is visible on this side (EN→LT back) */}
                    {isLtVisible && (
                      <AudioButtons
                        canPlayLt={canPlayLt}
                        audioBusy={audioBusy}
                        onPlay={() => playLt(undefined)}
                        onPlaySlow={() => playLt({ slow: true })}
                        disabledReason={
                          typeof playText !== "function"
                            ? "Audio unavailable"
                            : "Play Lithuanian"
                        }
                      />
                    )}
                  </div>

                  <div className="rf-center-zone">
                    {/* Lithuanian as hero */}
                    <div className="rf-hero-text">{answer || "—"}</div>

                    {/* English shown underneath (smaller + lighter) */}
                    <div className="rf-sub-text">{prompt || ""}</div>
                  </div>

                  <div className="rf-grade-zone" onClick={(e) => e.stopPropagation()}>
                    <div className="rf-grade-grid">
                      <button
                        type="button"
                        className={cn(
                          "rf-grade-btn rf-grade-wrong",
                          s.canGrade ? "" : "rf-grade-disabled"
                        )}
                        onClick={() =>
                          s.grade("wrong", {
                            row: current,
                            onFx: () => triggerFx("wrong", 700),
                            advanceDelayMs: 420,
                          })
                        }
                        disabled={!s.canGrade}
                      >
                        Wrong
                      </button>

                      <button
                        type="button"
                        className={cn(
                          "rf-grade-btn rf-grade-close",
                          s.canGrade ? "" : "rf-grade-disabled"
                        )}
                        onClick={() =>
                          s.grade("close", {
                            row: current,
                            onFx: () => triggerFx("close", 650),
                            advanceDelayMs: 420,
                          })
                        }
                        disabled={!s.canGrade}
                      >
                        Close
                      </button>

                      <button
                        type="button"
                        className={cn(
                          "rf-grade-btn rf-grade-right",
                          s.canGrade ? "" : "rf-grade-disabled"
                        )}
                        onClick={() =>
                          s.grade("correct", {
                            row: current,
                            onFx: () => triggerFx("correct", 700),
                            advanceDelayMs: 420,
                          })
                        }
                        disabled={!s.canGrade}
                      >
                        Right
                      </button>
                    </div>

                    <div className="rf-footnote">(Tap the card to flip back.)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary modal */}
      {s.showSummary && (
        <SummaryModal
          title="Session complete"
          subtitle={`${s.summaryTotal} ${s.summaryTotal === 1 ? "card" : "cards"}`}
          right={s.countRight}
          close={s.countClose}
          wrong={s.countWrong}
          canReview={s.countClose + s.countWrong > 0}
          onReview={() => {
            if (s.countClose + s.countWrong === 0) return;
            s.reviewMistakes();
          }}
          onAgain={() => s.runAgain()}
          onFinish={hardExit}
        />
      )}

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

function AudioButtons({ canPlayLt, audioBusy, onPlay, onPlaySlow, disabledReason }) {
  const disabled = !canPlayLt;

  return (
    <div
      className="rf-audio-wrap"
      aria-label="Lithuanian audio controls"
      onClick={(e) => e.stopPropagation()} // don’t flip card when tapping audio
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={cn("rf-audio-btn", disabled ? "rf-audio-disabled" : "rf-audio-enabled")}
        disabled={disabled}
        title={disabledReason}
        onClick={() => {
          if (disabled) return;
          onPlay?.();
        }}
      >
        <span className="rf-audio-icon" aria-hidden="true">
          🔊
        </span>
        <span className="text-xs font-semibold">{audioBusy ? "…" : "Play"}</span>
      </button>

      <button
        type="button"
        className={cn("rf-audio-btn", disabled ? "rf-audio-disabled" : "rf-audio-enabled")}
        disabled={disabled}
        title={disabledReason}
        onClick={() => {
          if (disabled) return;
          onPlaySlow?.();
        }}
      >
        <span className="rf-audio-icon" aria-hidden="true">
          🐢
        </span>
        <span className="text-xs font-semibold">{audioBusy ? "…" : "Slow"}</span>
      </button>
    </div>
  );
}

function SummaryModal({
  title,
  subtitle,
  right,
  close,
  wrong,
  canReview,
  onReview,
  onAgain,
  onFinish,
}) {
  const modal = (
    <div className="rf-modal-backdrop" role="dialog" aria-modal="true">
      <div className="rf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-semibold">{title}</div>
        <div className="mt-1 text-sm text-zinc-400">{subtitle}</div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatPill label="Right" value={right} />
          <StatPill label="Close" value={close} />
          <StatPill label="Wrong" value={wrong} />
        </div>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            className={cn("rf-primary-btn", !canReview ? "opacity-50 cursor-not-allowed" : "")}
            onClick={() => {
              if (!canReview) return;
              onReview?.();
            }}
            disabled={!canReview}
          >
            Review mistakes
          </button>

          <button type="button" className="rf-secondary-btn" onClick={() => onAgain?.()}>
            Let’s do another 10
          </button>

          <button type="button" className="rf-ghost-btn" onClick={() => onFinish?.()}>
            Finish
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3 text-center">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

/* ----------------------------- CSS ----------------------------- */

const css = `
.rf-root{
  position: relative;
}

.rf-perspective{
  perspective: 1200px;
}
.rf-card{
  position: relative;
  transform-style: preserve-3d;
  transition: transform 520ms cubic-bezier(.2,.9,.2,1);
  min-height: 420px;
  cursor: pointer;
  outline: none;
}
.rf-card:focus{
  box-shadow: 0 0 0 2px rgba(52,211,153,0.22);
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

.rf-flip-pulse{ will-change: transform; }

.rf-card-top-min{
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 40px;
}
.rf-top-spacer{
  flex: 1;
}

.rf-center-zone{
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 6px;
  text-align: center;
}

.rf-hero-text{
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  white-space: pre-wrap;
  word-break: break-word;
}
@media (min-width: 640px){
  .rf-hero-text{ font-size: 30px; }
}

.rf-sub-text{
  margin-top: 12px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(161,161,170,1);
  white-space: pre-wrap;
  word-break: break-word;
}

.rf-hint{
  margin-top: 18px;
  font-size: 12px;
  color: rgba(113,113,122,1);
}

.rf-bottom-spacer{
  min-height: 84px;
}

.rf-grade-zone{
  padding-top: 8px;
}

.rf-grade-grid{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.rf-grade-btn{
  border-radius: 16px;
  padding: 12px 10px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid rgba(39,39,42,1);
  background: rgba(9,9,11,0.30);
  color: rgba(244,244,245,1);
  transition: transform 140ms ease, background 140ms ease, opacity 140ms ease, filter 140ms ease;
}
.rf-grade-btn:hover{
  background: rgba(9,9,11,0.52);
  transform: translateY(-1px);
}
.rf-grade-disabled{
  opacity: 0.55;
  cursor: not-allowed;
  transform: none !important;
}

.rf-grade-right{
  border-color: rgba(52, 211, 153, 0.55);
  background: rgba(52, 211, 153, 0.12);
  color: rgba(244,244,245,1);
}
.rf-grade-right:hover{
  background: rgba(52, 211, 153, 0.16);
}

.rf-grade-close{
  border-color: rgba(52, 211, 153, 0.30);
  background: rgba(52, 211, 153, 0.06);
}

.rf-grade-wrong{
  border-color: rgba(39,39,42,1);
}

.rf-footnote{
  margin-top: 10px;
  font-size: 11px;
  color: rgba(113,113,122,1);
  text-align: center;
}

/* Top button */
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

/* Buttons (modal) */
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

/* Audio */
.rf-audio-wrap{
  display: inline-flex;
  gap: 8px;
}
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
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}
.rf-audio-icon{ line-height: 1; transform: translateY(-0.5px); }
.rf-audio-enabled{ cursor: pointer; opacity: 1; }
.rf-audio-enabled:hover{ background: rgba(9,9,11,0.55); transform: translateY(-1px); }
.rf-audio-disabled{ cursor: not-allowed; opacity: 0.45; transform: none; }

/* Modal */
.rf-modal-backdrop{
  position: fixed;
  inset: 0;
  z-index: 9999;
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

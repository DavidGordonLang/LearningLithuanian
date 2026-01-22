// src/views/training/RecallFlipView.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRecallFlipSession } from "../../hooks/training/useRecallFlipSession";
import { useRecallFlipAudio } from "../../hooks/training/useRecallFlipAudio";
import { AudioButtons, SummaryModal, ToggleButton } from "./recallFlip/RecallFlipParts";
import { recallFlipCss } from "./recallFlip/recallFlipStyles";

const cn = (...xs) => xs.filter(Boolean).join(" ");

const SESSION_SIZE = 10;

/**
 * Tool A — Recall Flip (Active Recall)
 *
 * Interaction:
 * - Tap anywhere on the card to flip (front <-> back)
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

  // Visual FX (allowed primitives only)
  const [fx, setFx] = useState(null); // "flip" | "correct" | "close" | "wrong"
  const fxTimerRef = useRef(null);

  // Eligible rows by focus
  const eligible = useMemo(() => filterByFocus(list, focus), [list, focus]);

  // Session hook
  const s = useRecallFlipSession({ eligible, sessionSize: SESSION_SIZE });

  // Audio hook (MATCHES your actual useRecallFlipAudio.js)
  const a = useRecallFlipAudio({
    current: s.current,
    direction,
    revealed: s.revealed,
    busy: s.busy,
    showSummary: s.showSummary,
    playText,
  });

  // Derived texts for current card
  const prompt = useMemo(() => getPromptText(s.current, direction), [s.current, direction]);
  const answer = useMemo(() => getAnswerText(s.current, direction), [s.current, direction]);

  // Use the audio hook’s own truth for LT visibility
  const isLtVisible = !!a.isLtVisible;
  const canPlayLt = !!a.canPlayLt;

  function clearFxTimer() {
    if (fxTimerRef.current) {
      clearTimeout(fxTimerRef.current);
      fxTimerRef.current = null;
    }
  }

  function triggerFx(kind, ms = 520) {
    setFx(kind);
    clearFxTimer();
    fxTimerRef.current = setTimeout(() => setFx(null), ms);
  }

  useEffect(() => {
    return () => {
      clearFxTimer();
    };
  }, []);

  function hardExit() {
    // Back must ALWAYS work.
    clearFxTimer();
    s.clearTimers?.();
    a.resetAudio?.();
    setFx(null);
    onBack?.();
  }

  function toggleCardFlip() {
    if (!s.current) return;
    if (s.showSummary) return;
    if (s.busy || a.audioBusy) return;

    // Use session hook’s helper
    if (!s.revealed) triggerFx("flip", 520);
    s.toggleReveal?.();
  }

  function handleGrade(outcome) {
    // s.grade guards internally via canGrade
    s.grade(outcome, {
      row: s.current,
      advanceDelayMs: 420,
      onFx: (o) => {
        if (o === "correct") triggerFx("correct", 700);
        else if (o === "close") triggerFx("close", 650);
        else triggerFx("wrong", 700);
      },
    });
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
              if (s.busy || a.audioBusy || s.showSummary) return;
              setDirection("en_to_lt");
              s.setRevealed?.(false);
              setFx(null);
              a.resetAudio?.();
            }}
          />
          <ToggleButton
            active={direction === "lt_to_en"}
            label="LT → EN"
            sub="Recall English"
            onClick={() => {
              if (s.busy || a.audioBusy || s.showSummary) return;
              setDirection("lt_to_en");
              s.setRevealed?.(false);
              setFx(null);
              a.resetAudio?.();
            }}
          />
        </div>
      </div>

      {/* Empty state */}
      {!s.current && !s.showSummary && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="text-lg font-semibold">Nothing to train</div>
          <div className="text-sm text-zinc-300 mt-2">Add a few entries first, or switch focus.</div>
        </div>
      )}

      {/* Card */}
      {!!s.current && !s.showSummary && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-zinc-500">{s.progressLabel}</div>
            <div className="text-xs text-zinc-500">
              Right {s.countRight} · Close {s.countClose} · Wrong {s.countWrong}
            </div>
          </div>

          <div className="relative">
            {/* FX overlay */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 rounded-3xl",
                fx === "correct" ? "rf-success-strong" : "",
                fx === "close" ? "rf-success-soft" : "",
                fx === "wrong" ? "rf-ghost-fade" : ""
              )}
            />

            <div className={cn("rf-perspective", s.busy ? "pointer-events-none select-none" : "")}>
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
                {/* FRONT */}
                <div className="rf-face rf-front p-6">
                  <div className="rf-card-top-min">
                    <div className="rf-top-spacer" aria-hidden="true" />
                    {isLtVisible && (
                      <AudioButtons
                        canPlayLt={canPlayLt}
                        audioBusy={a.audioBusy}
                        onPlay={() => a.playNormal?.()}
                        onPlaySlow={() => a.playSlow?.()}
                        disabledReason={
                          typeof playText !== "function" ? "Audio unavailable" : "Play Lithuanian"
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

                {/* BACK */}
                <div className="rf-face rf-back p-6">
                  <div className="rf-card-top-min">
                    <div className="rf-top-spacer" aria-hidden="true" />
                    {isLtVisible && (
                      <AudioButtons
                        canPlayLt={canPlayLt}
                        audioBusy={a.audioBusy}
                        onPlay={() => a.playNormal?.()}
                        onPlaySlow={() => a.playSlow?.()}
                        disabledReason={
                          typeof playText !== "function" ? "Audio unavailable" : "Play Lithuanian"
                        }
                      />
                    )}
                  </div>

                  <div className="rf-center-zone">
                    <div className="rf-hero-text">{answer || "—"}</div>
                    <div className="rf-sub-text">{prompt || ""}</div>
                  </div>

                  <div className="rf-grade-zone" onClick={(e) => e.stopPropagation()}>
                    <div className="rf-grade-grid">
                      <button
                        type="button"
                        className={cn("rf-grade-btn rf-grade-wrong", s.canGrade ? "" : "rf-grade-disabled")}
                        onClick={() => handleGrade("wrong")}
                        disabled={!s.canGrade}
                      >
                        Wrong
                      </button>

                      <button
                        type="button"
                        className={cn("rf-grade-btn rf-grade-close", s.canGrade ? "" : "rf-grade-disabled")}
                        onClick={() => handleGrade("close")}
                        disabled={!s.canGrade}
                      >
                        Close
                      </button>

                      <button
                        type="button"
                        className={cn("rf-grade-btn rf-grade-right", s.canGrade ? "" : "rf-grade-disabled")}
                        onClick={() => handleGrade("correct")}
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
          onReview={() => s.reviewMistakes?.()}
          onAgain={() => s.runAgain?.()}
          onFinish={hardExit}
        />
      )}

      <style>{recallFlipCss}</style>
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
  if (direction === "en_to_lt") return safeStr(row?.EN ?? row?.English ?? row?.en ?? row?.english ?? "");
  return safeStr(row?.LT ?? row?.Lithuanian ?? row?.lt ?? row?.lithuanian ?? "");
}

function getAnswerText(row, direction) {
  if (!row) return "";
  if (direction === "en_to_lt") return safeStr(row?.LT ?? row?.Lithuanian ?? row?.lt ?? row?.lithuanian ?? "");
  return safeStr(row?.EN ?? row?.English ?? row?.en ?? row?.english ?? "");
}

function safeStr(v) {
  return String(v ?? "").trim();
}

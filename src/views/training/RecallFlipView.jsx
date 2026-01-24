// src/views/training/RecallFlipView.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRecallFlipSession } from "../../hooks/training/useRecallFlipSession";
import { useRecallFlipAudio } from "../../hooks/training/useRecallFlipAudio";
import { AudioButtons, SummaryModal } from "./recallFlip/RecallFlipParts";
import { recallFlipCss } from "./recallFlip/recallFlipStyles";

const cn = (...xs) => xs.filter(Boolean).join(" ");

const SESSION_SIZE = 10;

export default function RecallFlipView({ rows, focus, onBack, playText }) {
  const list = Array.isArray(rows) ? rows : [];

  // Direction stays in code (you’ll wire it to Settings later), but UI is removed for now.
  const [direction, setDirection] = useState("en_to_lt"); // "en_to_lt" | "lt_to_en"

  // Visual FX (allowed primitives only)
  const [fx, setFx] = useState(null); // "flip" | "correct" | "close" | "wrong"
  const fxTimerRef = useRef(null);

  // Eligible rows by focus
  const eligible = useMemo(() => filterByFocus(list, focus), [list, focus]);

  // Session hook
  const s = useRecallFlipSession({ eligible, sessionSize: SESSION_SIZE });

  // Audio hook
  const a = useRecallFlipAudio({
    current: s.current,
    direction,
    revealed: s.revealed,
    busy: s.busy,
    showSummary: s.showSummary,
    playText,
  });

  // Derived texts for current card
  const prompt = useMemo(
    () => getPromptText(s.current, direction),
    [s.current, direction]
  );
  const answer = useMemo(
    () => getAnswerText(s.current, direction),
    [s.current, direction]
  );

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

    if (!s.revealed) triggerFx("flip", 520);
    s.toggleReveal?.();
  }

  function handleGrade(outcome) {
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
      {/* Header row: centered title with equal side weights */}
      <div className="grid grid-cols-[48px_1fr_48px] items-center">
        <button
          type="button"
          onClick={hardExit}
          aria-label="Back"
          className={cn(
            "h-12 w-12 rounded-full",
            "border border-white/10 bg-white/[0.06] backdrop-blur",
            "shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
            "flex items-center justify-center",
            "text-zinc-200 hover:bg-white/[0.09] active:scale-[0.99] transition"
          )}
        >
          {/* Premium arrow: SVG (optically centered) */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="translate-x-[-0.5px]" // optical centering (glyphs often look right-shifted)
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="text-center">
          <div className="text-[16px] sm:text-[17px] font-semibold text-zinc-100 tracking-tight">
            Recognise
          </div>
        </div>

        {/* right spacer to keep title perfectly centered */}
        <div className="h-12 w-12" aria-hidden="true" />
      </div>

      {/* (Direction UI removed for now — kept in code for later settings wiring) */}

      {/* Empty state */}
      {!s.current && !s.showSummary && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="text-lg font-semibold">Nothing to train</div>
          <div className="text-sm text-zinc-300 mt-2">
            Add a few entries first, or switch focus.
          </div>
        </div>
      )}

      {/* Card */}
      {!!s.current && !s.showSummary && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-zinc-500">{s.progressLabel}</div>
            <div className="text-xs text-zinc-500">
              Right {s.countRight} · Close enough {s.countClose} · Wrong{" "}
              {s.countWrong}
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
                          typeof playText !== "function"
                            ? "Audio unavailable"
                            : "Play Lithuanian"
                        }
                      />
                    )}
                  </div>

                  <div className="rf-center-zone">
                    <div className="rf-hero-text">{prompt || "—"}</div>
                    {!s.revealed && (
                      <div className="rf-hint">Tap the card to reveal</div>
                    )}
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
                          typeof playText !== "function"
                            ? "Audio unavailable"
                            : "Play Lithuanian"
                        }
                      />
                    )}
                  </div>

                  <div className="rf-center-zone">
                    <div className="rf-hero-text">{answer || "—"}</div>
                    <div className="rf-sub-text">{prompt || ""}</div>
                  </div>

                  <div
                    className="rf-grade-zone"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="rf-grade-grid">
                      <button
                        type="button"
                        className={cn(
                          "rf-grade-btn rf-grade-wrong",
                          s.canGrade ? "" : "rf-grade-disabled"
                        )}
                        onClick={() => handleGrade("wrong")}
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
                        onClick={() => handleGrade("close")}
                        disabled={!s.canGrade}
                      >
                        Close enough
                      </button>

                      <button
                        type="button"
                        className={cn(
                          "rf-grade-btn rf-grade-right",
                          s.canGrade ? "" : "rf-grade-disabled"
                        )}
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
          subtitle={`${s.summaryTotal} ${
            s.summaryTotal === 1 ? "card" : "cards"
          }`}
          right={s.countRight}
          close={s.countClose}
          wrong={s.countWrong}
          labels={{ right: "Right", close: "Close...", wrong: "Wrong" }}
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
  if (direction === "en_to_lt")
    return safeStr(row?.EN ?? row?.English ?? row?.en ?? row?.english ?? "");
  return safeStr(row?.LT ?? row?.Lithuanian ?? row?.lt ?? row?.lithuanian ?? "");
}

function getAnswerText(row, direction) {
  if (!row) return "";
  if (direction === "en_to_lt")
    return safeStr(row?.LT ?? row?.Lithuanian ?? row?.lt ?? row?.lithuanian ?? "");
  return safeStr(row?.EN ?? row?.English ?? row?.en ?? row?.english ?? "");
}

function safeStr(v) {
  return String(v ?? "").trim();
}

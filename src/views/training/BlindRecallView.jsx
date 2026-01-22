// src/views/training/BlindRecallView.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import useSpeechToTextHold from "../../hooks/useSpeechToTextHold";
import { useRecallFlipSession } from "../../hooks/training/useRecallFlipSession";
import { useRecallFlipAudio } from "../../hooks/training/useRecallFlipAudio";
import { AudioButtons, SummaryModal } from "./recallFlip/RecallFlipParts";
import { recallFlipCss } from "./recallFlip/recallFlipStyles";

const cn = (...xs) => xs.filter(Boolean).join(" ");

const SESSION_SIZE = 10;

/**
 * Module 2 — Blind Recall (Production)
 *
 * Flow:
 * - Show English intention
 * - User types OR uses press-and-hold STT to produce Lithuanian
 * - User can edit STT output
 * - Reveal correct Lithuanian (+ notes)
 * - Self-grade: Right / Close enough / Missed it
 * - End summary: review mistakes, another 10, finish
 *
 * Phase 1: no persistence.
 */
export default function BlindRecallView({ rows, focus, onBack, playText, showToast }) {
  const list = Array.isArray(rows) ? rows : [];

  // Eligible rows by focus (same rules as Recall Flip)
  const eligible = useMemo(() => filterByFocus(list, focus), [list, focus]);

  // Session hook (reuse the stable session engine)
  const s = useRecallFlipSession({ eligible, sessionSize: SESSION_SIZE });

  // We are always EN -> LT in Module 2
  const direction = "en_to_lt";

  // Audio hook (LT only; becomes available once revealed)
  const a = useRecallFlipAudio({
    current: s.current,
    direction,
    revealed: s.revealed,
    busy: s.busy,
    showSummary: s.showSummary,
    playText,
  });

  // Prompt + answer + notes
  const promptEn = useMemo(() => getEnglish(s.current), [s.current]);
  const answerLt = useMemo(() => getLithuanian(s.current), [s.current]);
  const notes = useMemo(() => getNotes(s.current), [s.current]);

  // User attempt
  const [attempt, setAttempt] = useState("");
  const inputRef = useRef(null);

  const blurInput = () => {
    try {
      inputRef.current?.blur?.();
    } catch {}
  };

  // Visual FX (reuse allowed primitives)
  const [fx, setFx] = useState(null); // "flip" | "correct" | "close" | "wrong"
  const fxTimerRef = useRef(null);

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

  // STT (press-and-hold). Reuse the proven hook but disable auto-translate.
  const {
    sttState,
    sttSupported,
    startRecording,
    stopRecording,
    cancelStt,
    forceResetStt,
  } = useSpeechToTextHold({
    showToast,
    blurTextarea: blurInput,
    translating: false,
    setInput: (txt) => setAttempt(String(txt || "")),
    autoTranslate: false,
    onTranslateText: async () => {},
    onSpeechCaptured: () => {},
  });

  const micDisabled =
    s.busy || s.showSummary || sttState === "transcribing" || sttState === "translating";

  const micLabel =
    sttState === "recording"
      ? "Listening…"
      : sttState === "transcribing"
      ? "Transcribing…"
      : "Hold to speak";

  useEffect(() => {
    return () => {
      clearFxTimer();
    };
  }, []);

  // Reset per-card attempt when we advance
  useEffect(() => {
    setAttempt("");
    setFx(null);
    a.resetAudio?.();
    forceResetStt?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.idx]);

  function hardExit() {
    clearFxTimer();
    s.clearTimers?.();
    a.resetAudio?.();
    forceResetStt?.();
    setFx(null);
    onBack?.();
  }

  function reveal() {
    if (!s.current) return;
    if (s.showSummary) return;
    if (s.busy) return;

    try {
      cancelStt?.();
    } catch {}
    blurInput();

    if (!s.revealed) triggerFx("flip", 520);
    s.setRevealed?.(true);
  }

  function hide() {
    if (s.busy || s.showSummary) return;
    s.setRevealed?.(false);
    a.resetAudio?.();
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

  const isLtVisible = !!a.isLtVisible;
  const canPlayLt = !!a.canPlayLt;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 rf-root">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button type="button" className="rf-top-btn" onClick={hardExit}>
          <span aria-hidden="true">←</span>
          <span>Back</span>
        </button>

        <div className="text-sm text-zinc-400">Blind Recall</div>

        <div className="w-[82px]" aria-hidden="true" />
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
              Right {s.countRight} · Close enough {s.countClose} · Missed {s.countWrong}
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
                role="group"
                aria-label="Blind recall card"
              >
                {/* FRONT: prompt + attempt + bottom actions */}
                <div className="rf-face rf-front p-6 flex flex-col">
                  {/* Top spacer only (keep clean) */}
                  <div className="rf-card-top-min">
                    <div className="rf-top-spacer" aria-hidden="true" />
                  </div>

                  {/* Scrollable content area (prevents layout squeeze on small screens) */}
                  <div className="rf-center-zone flex-1 min-h-0 overflow-y-auto pr-1">
                    <div className="rf-hero-text">{promptEn || "—"}</div>

                    <div className="mt-6">
                      <div className="text-xs text-zinc-400 mb-2">Your Lithuanian</div>
                      <textarea
                        ref={inputRef}
                        rows={3}
                        value={attempt}
                        onChange={(e) => setAttempt(e.target.value)}
                        className={cn(
                          "w-full rounded-2xl border bg-zinc-950/40 px-4 py-3 text-sm",
                          "border-zinc-800 focus:border-emerald-500/60 focus:outline-none",
                          s.busy ? "opacity-70" : ""
                        )}
                        placeholder="Type here…"
                        disabled={s.busy || s.showSummary}
                        onFocus={() => {
                          a.resetAudio?.();
                        }}
                      />
                      <div className="mt-2 text-[11px] text-zinc-500">
                        Tip: speak, then edit. You’re training production, not perfection.
                      </div>
                    </div>
                  </div>

                  {/* Bottom thumb bar */}
                  <div
                    className={cn(
                      "mt-4 pt-3",
                      "sticky bottom-0",
                      "bg-gradient-to-t from-black/70 via-black/30 to-transparent"
                    )}
                    style={{
                      paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6px)",
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className={cn(
                          "flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition select-none",
                          micDisabled || !sttSupported()
                            ? "border-zinc-800 bg-zinc-950/30 text-zinc-500 cursor-not-allowed"
                            : "border-zinc-700 bg-zinc-950/55 text-zinc-200 hover:bg-zinc-950/75"
                        )}
                        disabled={micDisabled || !sttSupported()}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          if (micDisabled || !sttSupported()) return;
                          startRecording();
                        }}
                        onMouseUp={(e) => {
                          e.preventDefault();
                          stopRecording();
                        }}
                        onMouseLeave={(e) => {
                          e.preventDefault();
                          stopRecording();
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          if (micDisabled || !sttSupported()) return;
                          startRecording();
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          stopRecording();
                        }}
                        onTouchCancel={(e) => {
                          e.preventDefault();
                          cancelStt();
                        }}
                        title={!sttSupported() ? "Speech input not supported" : "Press and hold"}
                      >
                        <span className="mr-2" aria-hidden="true">
                          🎤
                        </span>
                        {micLabel}
                      </button>

                      <button
                        type="button"
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-sm font-semibold transition select-none",
                          s.busy || s.showSummary
                            ? "border-zinc-800 bg-zinc-950/30 text-zinc-500 cursor-not-allowed"
                            : "border-emerald-500/40 bg-emerald-500/10 text-zinc-100 hover:bg-emerald-500/15"
                        )}
                        onClick={() => {
                          if (s.busy || s.showSummary) return;
                          reveal();
                        }}
                        disabled={s.busy || s.showSummary}
                      >
                        Reveal
                      </button>
                    </div>
                  </div>
                </div>

                {/* BACK: correct answer + (scrollable) notes + grade */}
                <div className="rf-face rf-back p-6 flex flex-col">
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

                  {/* Make center area scroll so long notes never overlap the grade zone */}
                  <div className="rf-center-zone flex-1 min-h-0 overflow-y-auto pr-1">
                    <div className="rf-hero-text">{answerLt || "—"}</div>
                    <div className="rf-sub-text">{promptEn || ""}</div>

                    {!!attempt?.trim() && (
                      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3">
                        <div className="text-[11px] text-zinc-500">Your answer</div>
                        <div className="mt-1 text-sm text-zinc-200 whitespace-pre-wrap">
                          {attempt.trim()}
                        </div>
                      </div>
                    )}

                    {!!notes && (
                      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3">
                        <div className="text-[11px] text-zinc-500">Notes</div>

                        {/* Notes scroll internally to keep the box visually stable */}
                        <div className="mt-2 max-h-[200px] overflow-y-auto pr-1">
                          <div className="text-sm text-zinc-200 whitespace-pre-wrap">{notes}</div>
                        </div>
                      </div>
                    )}

                    {/* Spacer so the last line never sits under the grade zone */}
                    <div className="h-3" />
                  </div>

                  <div className="rf-grade-zone" onClick={(e) => e.stopPropagation()}>
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
                        Missed it
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

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-[11px] text-zinc-500">(You can flip back.)</div>
                      <button
                        type="button"
                        className="text-[11px] text-zinc-300 hover:text-zinc-100 underline underline-offset-4"
                        onClick={() => {
                          if (s.busy || s.showSummary) return;
                          hide();
                        }}
                      >
                        Edit answer
                      </button>
                    </div>
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
          labels={{ right: "Right", close: "Close enough", wrong: "Missed it" }}
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

function safeStr(v) {
  return String(v ?? "").trim();
}

function getEnglish(row) {
  if (!row) return "";
  return safeStr(row?.EN ?? row?.English ?? row?.en ?? row?.english ?? "");
}

function getLithuanian(row) {
  if (!row) return "";
  return safeStr(row?.LT ?? row?.Lithuanian ?? row?.lt ?? row?.lithuanian ?? "");
}

function getNotes(row) {
  if (!row) return "";
  return safeStr(row?.Notes ?? row?.notes ?? "");
}

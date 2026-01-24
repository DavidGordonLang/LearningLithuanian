// src/views/training/BlindRecallView.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import useSpeechToTextHold from "../../hooks/useSpeechToTextHold";
import { useRecallFlipSession } from "../../hooks/training/useRecallFlipSession";
import { useRecallFlipAudio } from "../../hooks/training/useRecallFlipAudio";
import { AudioButtons, SummaryModal } from "./recallFlip/RecallFlipParts";
import { recallFlipCss } from "./recallFlip/recallFlipStyles";

const cn = (...xs) => xs.filter(Boolean).join(" ");

const SESSION_SIZE = 10;

export default function BlindRecallView({ rows, focus, onBack, playText, showToast }) {
  const list = Array.isArray(rows) ? rows : [];

  const eligible = useMemo(() => filterByFocus(list, focus), [list, focus]);
  const s = useRecallFlipSession({ eligible, sessionSize: SESSION_SIZE });

  const direction = "en_to_lt";

  const a = useRecallFlipAudio({
    current: s.current,
    direction,
    revealed: s.revealed,
    busy: s.busy,
    showSummary: s.showSummary,
    playText,
  });

  const promptEn = useMemo(() => getEnglish(s.current), [s.current]);
  const answerLt = useMemo(() => getLithuanian(s.current), [s.current]);

  const [attempt, setAttempt] = useState("");
  const inputRef = useRef(null);

  const blurInput = () => {
    try {
      inputRef.current?.blur?.();
    } catch {}
  };

  const [fx, setFx] = useState(null);
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

  const sttBusy = sttState === "transcribing" || sttState === "translating";
  const micDisabled = s.busy || s.showSummary || !sttSupported() || sttBusy;
  const micActive = sttState === "recording" || sttBusy;

  const toggleMic = () => {
    if (!sttSupported()) {
      showToast?.("Speech input not supported on this device");
      return;
    }
    if (s.busy || s.showSummary) return;

    if (sttState === "recording") {
      stopRecording?.();
      return;
    }
    if (sttBusy) return;

    blurInput();
    startRecording?.();
  };

  useEffect(() => {
    return () => {
      clearFxTimer();
    };
  }, []);

  useEffect(() => {
    setAttempt("");
    setFx(null);
    a.resetAudio?.();
    try {
      cancelStt?.();
    } catch {}
    forceResetStt?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.idx]);

  function hardExit() {
    clearFxTimer();
    s.clearTimers?.();
    a.resetAudio?.();
    try {
      cancelStt?.();
    } catch {}
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

  function editAnswer() {
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

  const hasAttempt = !!attempt?.trim();

  const BackCircle = (
    <button
      type="button"
      data-press
      onClick={hardExit}
      className={cn(
        "h-10 w-10 rounded-full border flex items-center justify-center",
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

  return (
    <div className="max-w-xl mx-auto px-4 py-5 rf-root">
      {/* Header */}
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <div className="flex items-center justify-start">{BackCircle}</div>

        <div className="text-center">
          <div className="text-[16px] font-semibold text-zinc-100">Produce</div>
        </div>

        <div aria-hidden="true" />
      </div>

      {!s.current && !s.showSummary && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="text-lg font-semibold">Nothing to train</div>
          <div className="text-sm text-zinc-300 mt-2">
            Add a few entries first, or switch focus.
          </div>
        </div>
      )}

      {!!s.current && !s.showSummary && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-zinc-500">{s.progressLabel}</div>
            <div className="text-xs text-zinc-500">
              Right {s.countRight} · Close enough {s.countClose} · Missed {s.countWrong}
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

            <div className={cn("rf-perspective", s.busy ? "pointer-events-none select-none" : "")}>
              <div
                className={cn(
                  "rf-card rounded-3xl border border-zinc-800 bg-zinc-950/70 shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
                  s.revealed ? "rf-flipped" : "",
                  fx === "flip" ? "rf-flip-pulse" : ""
                )}
                role="group"
                aria-label="Produce card"
              >
                {/* FRONT */}
                <div className="rf-face rf-front p-6 flex flex-col">
                  <div className="rf-card-top-min">
                    <div className="rf-top-spacer" aria-hidden="true" />
                  </div>

                  <div className="rf-center-zone flex-1 min-h-0">
                    <div className="rf-hero-text">{promptEn || "—"}</div>

                    {/* BIGGER input block: full width, taller textarea */}
                    <div className="mt-6 w-full">
                      <div className="text-xs text-zinc-400 mb-2 text-center">
                        Your Lithuanian
                      </div>

                      <div className="relative w-full">
                        <textarea
                          ref={inputRef}
                          rows={4}
                          value={attempt}
                          onChange={(e) => setAttempt(e.target.value)}
                          className={cn(
                            "w-full rounded-2xl border bg-zinc-950/40 text-sm",
                            "border-zinc-800 focus:border-emerald-500/60 focus:outline-none",
                            // taller + feels “premium”
                            "px-4 py-4",
                            "min-h-[124px]",
                            s.busy ? "opacity-70" : ""
                          )}
                          placeholder="Type here…"
                          disabled={s.busy || s.showSummary}
                          onFocus={() => a.resetAudio?.()}
                        />

                        {/* ICON-ONLY mic (no circle). pushed into corner */}
                        <button
                          type="button"
                          data-press
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (micDisabled) return;
                            toggleMic();
                          }}
                          disabled={micDisabled}
                          className={cn(
                            "absolute bottom-2 right-2",
                            "h-9 w-9",
                            "flex items-center justify-center",
                            "bg-transparent border-0",
                            micDisabled ? "opacity-45 cursor-not-allowed" : "opacity-80 hover:opacity-100",
                            "transition"
                          )}
                          title={
                            !sttSupported()
                              ? "Speech input not supported"
                              : sttBusy
                              ? "Working…"
                              : sttState === "recording"
                              ? "Tap to stop"
                              : "Tap to speak"
                          }
                          aria-label="Tap to speak"
                        >
                          {/* pulse ring */}
                          {micActive && (
                            <span className="absolute inset-0 rounded-full br-mic-pulse-ring" aria-hidden="true" />
                          )}

                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity={micDisabled ? "0.60" : "0.92"}
                            />
                            <path
                              d="M19 11a7 7 0 0 1-14 0"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity={micDisabled ? "0.50" : "0.85"}
                            />
                            <path
                              d="M12 18v3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity={micDisabled ? "0.50" : "0.85"}
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Centred Reveal */}
                  <div className="mt-5 flex justify-center">
                    <button
                      type="button"
                      data-press
                      className={cn(
                        "z-btn z-home-pillBtn",
                        "bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black font-semibold",
                        s.busy || s.showSummary ? "z-disabled" : ""
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

                {/* BACK */}
                <div className="rf-face rf-back p-6 flex flex-col">
                  <div className="text-center">
                    <div className="rf-hero-text">{answerLt || "—"}</div>
                    <div className="rf-sub-text mt-2">{promptEn || ""}</div>

                    <div className="mt-3 flex justify-center">
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
                  </div>

                  <div className="flex-1 min-h-0 mt-5 flex items-start justify-center">
                    {hasAttempt ? (
                      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/35 p-3">
                        <div className="text-[11px] text-zinc-500 text-center">Your answer</div>
                        <div className="mt-2 max-h-[160px] overflow-y-auto pr-1">
                          <div className="text-sm text-zinc-200 whitespace-pre-wrap text-center">
                            {attempt.trim()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-500 text-center mt-1">(No answer entered)</div>
                    )}
                  </div>

                  <div className="rf-grade-zone" onClick={(e) => e.stopPropagation()}>
                    <div className="rf-grade-grid">
                      <button
                        type="button"
                        className={cn(
                          "rf-grade-btn rf-grade-wrong",
                          "py-4",
                          s.canGrade ? "" : "rf-grade-disabled"
                        )}
                        onClick={() => handleGrade("wrong")}
                        disabled={!s.canGrade}
                      >
                        I was wrong
                      </button>

                      <button
                        type="button"
                        className={cn(
                          "rf-grade-btn rf-grade-close",
                          "py-4",
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
                          "py-4",
                          s.canGrade ? "" : "rf-grade-disabled"
                        )}
                        onClick={() => handleGrade("correct")}
                        disabled={!s.canGrade}
                      >
                        I was right
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-end">
                      <button
                        type="button"
                        className="text-[11px] text-zinc-300 hover:text-zinc-100 underline underline-offset-4"
                        onClick={() => {
                          if (s.busy || s.showSummary) return;
                          editAnswer();
                        }}
                      >
                        Edit answer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Local pulse CSS */}
            <style>{`
              @keyframes brMicPulse {
                0%   { transform: scale(1); opacity: 0.55; }
                55%  { transform: scale(1.18); opacity: 0.95; }
                100% { transform: scale(1); opacity: 0.55; }
              }
              .br-mic-pulse-ring {
                box-shadow:
                  0 0 0 2px rgba(16,185,129,0.28),
                  0 0 18px rgba(16,185,129,0.20);
                animation: brMicPulse 1.15s ease-in-out infinite;
              }
            `}</style>
          </div>
        </div>
      )}

      {s.showSummary && (
        <SummaryModal
          title="Session complete"
          subtitle={`${s.summaryTotal} ${s.summaryTotal === 1 ? "card" : "cards"}`}
          right={s.countRight}
          close={s.countClose}
          wrong={s.countWrong}
          labels={{ right: "I was right", close: "Close...", wrong: "I was wrong" }}
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

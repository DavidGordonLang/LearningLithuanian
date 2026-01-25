// src/hooks/training/useRecallFlipSession.js
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * useRecallFlipSession
 *
 * Owns:
 * - session queue (shuffle + slice)
 * - idx progression
 * - revealed state
 * - busy lock during grading transitions
 * - scoring (right / close / wrong)
 * - mistakes collection (close + wrong)
 * - end-of-run summary state
 *
 * Does NOT own:
 * - audio state
 * - visual fx (glows / flip pulse)
 * - prompt/answer text mapping (direction logic)
 * - UI layout
 *
 * Intended usage:
 * const s = useRecallFlipSession({ eligible, sessionSize: 10 });
 * - use s.current, s.queue, s.idx, s.revealed, s.showSummary, etc.
 * - call s.toggleReveal() on card tap (optional)
 * - call s.grade("correct"|"close"|"wrong", { onBeforeAdvance, onAdvanceFx })
 * - call s.runAgain() / s.reviewMistakes() / s.finish()
 */
export function useRecallFlipSession({ eligible, sessionSize = 10 }) {
  const safeEligible = Array.isArray(eligible) ? eligible : [];

  // Session queue + position
  const [queue, setQueue] = useState(() => buildQueue(safeEligible, sessionSize));
  const [idx, setIdx] = useState(0);

  // Card state
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);

  // Summary + scoring
  const [showSummary, setShowSummary] = useState(false);
  const [countRight, setCountRight] = useState(0);
  const [countClose, setCountClose] = useState(0);
  const [countWrong, setCountWrong] = useState(0);

  // Mistakes within a run (close + wrong)
  const mistakesRef = useRef([]);

  // Timers we must be able to cancel (prevents “stuck busy”)
  const gradeTimerRef = useRef(null);

  const current = queue[idx] || null;

  const progressLabel = useMemo(() => {
    const total = queue.length;
    if (!total) return "0 / 0";
    return `${Math.min(idx + 1, total)} / ${total}`;
  }, [idx, queue.length]);

  const summaryTotal = countRight + countClose + countWrong;

  const canGrade = !!current && revealed && !busy && !showSummary;

  function clearTimers() {
    if (gradeTimerRef.current) {
      clearTimeout(gradeTimerRef.current);
      gradeTimerRef.current = null;
    }
  }

  function resetCountsAndMistakes() {
    setCountRight(0);
    setCountClose(0);
    setCountWrong(0);
    mistakesRef.current = [];
  }

  function resetSession(nextQueue) {
    clearTimers();

    setShowSummary(false);
    setQueue(Array.isArray(nextQueue) ? nextQueue : []);
    setIdx(0);

    setRevealed(false);
    setBusy(false);

    resetCountsAndMistakes();
  }

  function finishSession() {
    clearTimers();

    setBusy(false);
    setRevealed(false);
    setShowSummary(true);
  }

  function nextCardOrFinish() {
    setRevealed(false);
    setBusy(false);

    const next = idx + 1;
    if (next < queue.length) {
      setIdx(next);
      return;
    }
    finishSession();
  }

  function scheduleNext(ms = 420) {
    clearTimers();
    gradeTimerRef.current = setTimeout(() => {
      gradeTimerRef.current = null;
      nextCardOrFinish();
    }, ms);
  }

  function noteMistake(rowObj) {
    if (!rowObj) return;
    mistakesRef.current = [...(mistakesRef.current || []), rowObj];
  }

  /**
   * grade(outcome, opts)
   *
   * outcome: "correct" | "close" | "wrong"
   * opts:
   * - row: pass current row (so mistakes can be recorded)
   * - onFx: (outcome) => void   // view can trigger glow/fx here
   * - advanceDelayMs: number   // default 420
   */
  function grade(outcome, opts = {}) {
    if (!canGrade) return;

    const row = opts.row ?? current;
    const onFx = typeof opts.onFx === "function" ? opts.onFx : null;
    const advanceDelayMs = Number.isFinite(opts.advanceDelayMs) ? opts.advanceDelayMs : 420;

    setBusy(true);

    if (outcome === "correct") setCountRight((n) => n + 1);
    if (outcome === "close") setCountClose((n) => n + 1);
    if (outcome === "wrong") setCountWrong((n) => n + 1);

    if (outcome === "close" || outcome === "wrong") noteMistake(row);

    if (onFx) onFx(outcome);

    scheduleNext(advanceDelayMs);
  }

  function buildMistakeRun() {
    const mistakes = Array.isArray(mistakesRef.current) ? mistakesRef.current : [];
    const unique = uniqById(mistakes);
    if (!unique.length) return [];
    return buildQueue(unique, Math.min(sessionSize, unique.length));
  }

  function reviewMistakes() {
    const next = buildMistakeRun();
    resetSession(next);
  }

  function runAgain() {
    resetSession(buildQueue(safeEligible, sessionSize));
  }

  function finish() {
    // just show summary (caller can call onBack separately if desired)
    finishSession();
  }

  // Optional helper for tap-to-flip behaviour
  function toggleReveal() {
    if (!current) return;
    if (showSummary) return;
    if (busy) return;

    setRevealed((r) => !r);
  }

  // Keep queue fresh if eligible changes materially
  // (using length as the intentionally-light dependency, consistent with your current approach)
  useEffect(() => {
    resetSession(buildQueue(safeEligible, sessionSize));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeEligible.length, sessionSize]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  return {
    // data
    queue,
    idx,
    current,

    // card state
    revealed,
    setRevealed,
    toggleReveal,

    // session locks + summary
    busy,
    showSummary,

    // scoring
    countRight,
    countClose,
    countWrong,
    progressLabel,
    summaryTotal,

    // guards
    canGrade,

    // actions
    grade,
    resetSession,
    finish,
    finishSession, // sometimes handy
    nextCardOrFinish, // sometimes handy
    reviewMistakes,
    runAgain,

    // misc
    clearTimers,
  };
}

/* ----------------------------- helpers ----------------------------- */

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

function buildQueue(eligible, n = 10) {
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

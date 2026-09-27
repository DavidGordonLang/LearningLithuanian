import React, { useEffect, useMemo, useState } from "react";
import { examContent } from "../../content/exam";
import TrainingBackButton from "./TrainingBackButton";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function Header({ onBack, title, subtitle }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <TrainingBackButton onClick={onBack} />

        <div>
          <div className="text-xl font-semibold text-zinc-100">{title}</div>
          <div className="text-sm text-zinc-400 mt-1">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function KeywordBlock({ items, onPlayWord, activeWordKey }) {
  if (!Array.isArray(items) || !items.length) return null;

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur p-4">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">
        Useful words
      </div>

      <div className="mt-3 space-y-2">
        {items.map((item, idx) => {
          const key = `${item.lt}-${idx}`;
          const isActive = activeWordKey === key;

          return (
            <button
              key={key}
              type="button"
              data-press
              onClick={() => onPlayWord?.(item.lt, key)}
              className={cn(
                "w-full text-left rounded-xl px-3 py-3 transition-all duration-200",
                isActive
                  ? "border border-emerald-400/60 bg-emerald-500/18 shadow-[0_0_0_1px_rgba(52,211,153,0.18),0_0_26px_rgba(16,185,129,0.35)]"
                  : "border border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"
              )}
            >
              <div className="text-sm text-zinc-100 select-text">{item.lt}</div>
              <div className="text-[12px] text-zinc-400 mt-1">{item.en}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ExamListeningTaskView({
  playText,
  preloadText,
  stopText,
  showToast,
  onBack,
}) {
  const items = examContent?.ii_kategorija?.listening?.true_false || [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [audioBusy, setAudioBusy] = useState(false);
  const [activeWordKey, setActiveWordKey] = useState(null);

  const item = items[index] || null;
  const questions = item?.questions || [];

  useEffect(() => {
    const text = String(item?.audio?.textLt || "").trim();
    if (!text || typeof preloadText !== "function") return;
    preloadText(text);
  }, [item, preloadText]);

  const score = useMemo(() => {
    return questions.reduce((sum, q) => {
      return sum + (answers[q.id] === q.correctAnswer ? 1 : 0);
    }, 0);
  }, [answers, questions]);

  if (!item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-5 pb-8">
        <Header
          onBack={onBack}
          title="Listening Practice"
          subtitle="No content added yet."
        />
      </div>
    );
  }

  const allAnswered = questions.every((q) =>
    Object.prototype.hasOwnProperty.call(answers, q.id)
  );

  function setAnswer(questionId, value) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handlePlay() {
    const text = String(item?.audio?.textLt || "").trim();
    if (!text || typeof playText !== "function") return;

    try {
      setAudioBusy(true);
      await playText(text);
      setPlayCount((n) => n + 1);
    } catch {
      showToast?.("Could not play audio");
    } finally {
      setAudioBusy(false);
    }
  }

  async function handlePlayWord(text, wordKey) {
    const safeText = String(text || "").trim();
    if (!safeText || typeof playText !== "function") return;

    const startedAt = Date.now();
    const minVisibleMs = 650;

    try {
      setActiveWordKey(wordKey);
      await playText(safeText);
    } catch {
      showToast?.("Could not play audio");
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, minVisibleMs - elapsed);

      window.setTimeout(() => {
        setActiveWordKey((current) => (current === wordKey ? null : current));
      }, remaining);
    }
  }

  function handleStop() {
    try {
      stopText?.();
    } finally {
      setAudioBusy(false);
      setActiveWordKey(null);
    }
  }

  function nextTask() {
    stopText?.();
    const nextIndex = (index + 1) % items.length;
    setIndex(nextIndex);
    setAnswers({});
    setSubmitted(false);
    setPlayCount(0);
    setAudioBusy(false);
    setActiveWordKey(null);
  }

  function retryTask() {
    stopText?.();
    setAnswers({});
    setSubmitted(false);
    setPlayCount(0);
    setAudioBusy(false);
    setActiveWordKey(null);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
      <Header
        onBack={onBack}
        title="Listening Practice"
        subtitle="II kategorija · True / False"
      />

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 backdrop-blur p-4">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">
          Task
        </div>
        <div className="text-sm text-zinc-100 font-medium mt-1">
          {item.title}
        </div>
        <div className="text-[13px] text-zinc-400 mt-2 leading-snug select-text">
          {item.instructionLt}
        </div>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            data-press
            onClick={handlePlay}
            disabled={audioBusy || typeof playText !== "function"}
            className={cn(
              "z-btn px-5 py-3 rounded-2xl text-sm font-semibold",
              audioBusy || typeof playText !== "function"
                ? "bg-white/[0.05] border border-white/10 text-zinc-500 cursor-not-allowed"
                : "bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-300/20 text-black"
            )}
          >
            {audioBusy ? "Playing…" : playCount > 0 ? "Play again" : "Play audio"}
          </button>

          <button
            type="button"
            data-press
            onClick={handleStop}
            disabled={typeof stopText !== "function"}
            className={cn(
              "z-btn z-btn-secondary px-5 py-3 rounded-2xl text-sm",
              typeof stopText !== "function"
                ? "opacity-50 cursor-not-allowed"
                : ""
            )}
          >
            Stop audio
          </button>

          <div className="text-[12px] text-zinc-500">
            Played {playCount} {playCount === 1 ? "time" : "times"}
          </div>
        </div>
      </div>

      <KeywordBlock
        items={item?.support?.keywords}
        onPlayWord={handlePlayWord}
        activeWordKey={activeWordKey}
      />

      <div className="mt-4 space-y-3">
        {questions.map((q, qIdx) => {
          const picked = answers[q.id];
          const isCorrect = picked === q.correctAnswer;

          return (
            <div
              key={q.id}
              className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur p-4"
            >
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                Statement {qIdx + 1}
              </div>

              <div className="text-[14px] text-zinc-100 mt-2 leading-snug select-text">
                {q.promptLt}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  data-press
                  onClick={() => setAnswer(q.id, true)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-sm font-medium transition",
                    picked === true
                      ? "bg-emerald-500/20 border-emerald-400/35 text-emerald-200"
                      : "bg-white/[0.03] border-white/10 text-zinc-300 hover:bg-white/[0.05]"
                  )}
                >
                  Teisingas
                </button>

                <button
                  type="button"
                  data-press
                  onClick={() => setAnswer(q.id, false)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-sm font-medium transition",
                    picked === false
                      ? "bg-emerald-500/20 border-emerald-400/35 text-emerald-200"
                      : "bg-white/[0.03] border-white/10 text-zinc-300 hover:bg-white/[0.05]"
                  )}
                >
                  Neteisingas
                </button>
              </div>

              {submitted ? (
                <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isCorrect ? "text-emerald-300" : "text-amber-300"
                    )}
                  >
                    {isCorrect
                      ? "Correct"
                      : `Correct answer: ${
                          q.correctAnswer ? "Teisingas" : "Neteisingas"
                        }`}
                  </div>

                  <div className="text-[13px] text-zinc-400 mt-2 leading-snug select-text">
                    {q.explanationLt}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {submitted ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Transcript
          </div>
          <div className="mt-3 text-[15px] leading-7 text-zinc-100 whitespace-pre-wrap select-text">
            {item.transcriptLt}
          </div>

          <div className="mt-4 text-lg font-semibold text-zinc-100">
            {score} / {questions.length}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {!submitted ? (
          <button
            type="button"
            data-press
            onClick={() => setSubmitted(true)}
            disabled={!allAnswered}
            className={cn(
              "z-btn px-5 py-3 rounded-2xl text-sm font-semibold",
              allAnswered
                ? "bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-300/20 text-black"
                : "bg-white/[0.05] border border-white/10 text-zinc-500 cursor-not-allowed"
            )}
          >
            Check answers
          </button>
        ) : (
          <>
            <button
              type="button"
              data-press
              onClick={retryTask}
              className="z-btn z-btn-secondary px-5 py-3 rounded-2xl text-sm"
            >
              Retry
            </button>

            <button
              type="button"
              data-press
              onClick={nextTask}
              className="z-btn px-5 py-3 rounded-2xl text-sm font-semibold bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-300/20 text-black"
            >
              Next task
            </button>
          </>
        )}
      </div>
    </div>
  );
}

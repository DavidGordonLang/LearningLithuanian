import React, { useMemo, useState } from "react";
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

function KeywordBlock({ items }) {
  if (!Array.isArray(items) || !items.length) return null;

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur p-4">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">
        Useful words
      </div>

      <div className="mt-3 space-y-2">
        {items.map((item, idx) => (
          <div
            key={`${item.lt}-${idx}`}
            className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3"
          >
            <div className="text-sm text-zinc-100 select-text">{item.lt}</div>
            <div className="text-[12px] text-zinc-400 mt-1">{item.en}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExamReadingTaskView({ onBack }) {
  const items = examContent?.ii_kategorija?.reading?.true_false || [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const item = items[index] || null;
  const questions = item?.questions || [];

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
          title="Reading Practice"
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

  function nextTask() {
    const nextIndex = (index + 1) % items.length;
    setIndex(nextIndex);
    setAnswers({});
    setSubmitted(false);
  }

  function retryTask() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
      <Header
        onBack={onBack}
        title="Reading Practice"
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
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur p-4">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">
          Text
        </div>
        <div className="mt-3 text-[15px] leading-7 text-zinc-100 whitespace-pre-wrap select-text">
          {item.sourceText}
        </div>
      </div>

      <KeywordBlock items={item?.support?.keywords} />

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
            Result
          </div>
          <div className="text-lg font-semibold text-zinc-100 mt-2">
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

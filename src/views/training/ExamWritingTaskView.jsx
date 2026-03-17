import React, { useEffect, useMemo, useRef, useState } from "react";
import { examContent } from "../../content/exam";

function Header({ onBack, title, subtitle }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-press
          onClick={onBack}
          className="
            h-10 w-10 rounded-xl
            border border-white/10
            bg-black/20 backdrop-blur
            text-zinc-200
            flex items-center justify-center
            hover:bg-black/25
          "
          aria-label="Back"
        >
          ←
        </button>

        <div>
          <div className="text-xl font-semibold text-zinc-100">{title}</div>
          <div className="text-sm text-zinc-400 mt-1">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function UsefulPhrases({ items }) {
  if (!Array.isArray(items) || !items.length) return null;

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur p-4">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">
        Useful phrases
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

export default function ExamWritingTaskView({ onBack }) {
  const items = examContent?.ii_kategorija?.writing?.guided_letter || [];
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [showChecklist, setShowChecklist] = useState(false);
  const [showSample, setShowSample] = useState(false);

  const sampleAnswerRef = useRef(null);

  const item = items[index] || null;

  const wordCount = useMemo(() => {
    return String(draft || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }, [draft]);

  useEffect(() => {
    if (!showSample) return;
    const el = sampleAnswerRef.current;
    if (!el) return;

    const raf = requestAnimationFrame(() => {
      try {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      } catch {
        try {
          el.scrollIntoView(true);
        } catch {}
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [showSample]);

  if (!item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-5 pb-8">
        <Header
          onBack={onBack}
          title="Writing Practice"
          subtitle="No content added yet."
        />
      </div>
    );
  }

  function nextTask() {
    const nextIndex = (index + 1) % items.length;
    setIndex(nextIndex);
    setDraft("");
    setShowChecklist(false);
    setShowSample(false);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
      <Header
        onBack={onBack}
        title="Writing Practice"
        subtitle="II kategorija · Guided letter"
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

      <UsefulPhrases items={item?.support?.usefulPhrases} />

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Your draft
          </div>
          <div className="text-[12px] text-zinc-500">
            {wordCount} words · target {item.recommendedWordCount}
          </div>
        </div>

        <textarea
          rows={10}
          className="z-input w-full !rounded-2xl !px-4 !py-3 text-sm mt-3"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write in Lithuanian…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="text"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          data-press
          onClick={() => setShowChecklist((v) => !v)}
          className="z-btn z-btn-secondary px-4 py-3 rounded-2xl text-sm"
        >
          {showChecklist ? "Hide checklist" : "Check requirements"}
        </button>

        <button
          type="button"
          data-press
          onClick={() => setShowSample((v) => !v)}
          className="z-btn px-4 py-3 rounded-2xl text-sm font-semibold bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-300/20 text-black"
        >
          {showSample ? "Hide sample answer" : "Reveal sample answer"}
        </button>
      </div>

      {showChecklist ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Requirements
          </div>

          <div className="mt-3 space-y-2">
            {(item.requirements || []).map((req, idx) => (
              <div
                key={`${req}-${idx}`}
                className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-[13px] text-zinc-200 leading-snug select-text"
              >
                {idx + 1}. {req}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {Array.isArray(item?.support?.structureHints) &&
      item.support.structureHints.length ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Structure hint
          </div>

          <div className="mt-3 space-y-2">
            {item.support.structureHints.map((hint, idx) => (
              <div
                key={`${hint}-${idx}`}
                className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-[13px] text-zinc-200 leading-snug select-text"
              >
                {hint}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {showSample ? (
        <div
          ref={sampleAnswerRef}
          className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-500/[0.08] backdrop-blur p-4"
        >
          <div className="text-[11px] uppercase tracking-wide text-emerald-300/80">
            Sample answer
          </div>
          <div className="mt-3 text-[14px] leading-7 text-zinc-100 whitespace-pre-wrap select-text">
            {item.sampleAnswer}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          data-press
          onClick={nextTask}
          className="z-btn px-4 py-3 rounded-2xl text-sm font-semibold"
        >
          Next task
        </button>
      </div>
    </div>
  );
}

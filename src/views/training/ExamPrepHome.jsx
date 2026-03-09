import React from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function SkillCard({ title, desc, icon, onClick, hint }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl border px-4 py-4 transition",
        "bg-black/20 backdrop-blur border-white/10",
        "hover:border-white/15 hover:bg-black/25"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="
            h-10 w-10 rounded-xl
            bg-white/[0.04] border border-white/10
            flex items-center justify-center
            shrink-0
          "
          aria-hidden="true"
        >
          <span className="text-[18px]">{icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="text-[15px] font-semibold text-zinc-100">
              {title}
            </div>
            <div className="text-sm text-zinc-500">→</div>
          </div>

          <div className="text-[13px] text-zinc-300 mt-1 leading-snug">
            {desc}
          </div>

          {hint ? (
            <div className="text-[12px] text-zinc-500 mt-2 leading-snug">
              {hint}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export default function ExamPrepHome({
  onBack,
  onOpenReading,
  onOpenListening,
  onOpenWriting,
}) {
  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
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
          <div className="text-xl font-semibold text-zinc-100">
            Exam Prep
          </div>
          <div className="text-sm text-zinc-400 mt-1">
            Foreigners’ Lithuanian exam practice with reviewed task formats.
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">
          Skills
        </div>
        <div className="text-xs text-zinc-400 mt-1">
          Start with one skill at a time. No portal clone, just focused practice.
        </div>

        <div className="mt-3 space-y-3">
          <SkillCard
            title="Reading"
            desc="Read short Lithuanian texts and answer objective questions."
            icon="📖"
            onClick={onOpenReading}
            hint="Starter slice: True / False"
          />

          <SkillCard
            title="Listening"
            desc="Listen in Lithuanian, then answer questions."
            icon="🎧"
            onClick={onOpenListening}
            hint="Uses the existing cached audio path"
          />

          <SkillCard
            title="Writing"
            desc="Practise guided written responses with structure support."
            icon="✍️"
            onClick={onOpenWriting}
            hint="Starter slice: Guided letter"
          />
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}
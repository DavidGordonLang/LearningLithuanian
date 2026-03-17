// src/views/training/LearningHome.jsx
import React from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function BackCircle({ onClick }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
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
}

function SurfaceCard({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-black/20 backdrop-blur",
        "shadow-[0_0_24px_rgba(0,0,0,0.18)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function LearningHome({ onBack }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <div className="flex items-center justify-start">
          <BackCircle onClick={onBack} />
        </div>

        <div className="text-center">
          <div className="text-[16px] font-semibold text-zinc-100">
            Learning
          </div>
        </div>

        <div className="h-10 w-10" aria-hidden="true" />
      </div>

      <div className="mt-5">
        <div className="text-xl font-semibold text-zinc-100">
          Guided course
        </div>
        <div className="text-sm text-zinc-400 mt-1 leading-snug">
          This is where the structured Lithuanian course will live. Lessons,
          checkpoints, progression, and phrase unlocks will be built here next.
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <SurfaceCard className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="
                h-10 w-10 rounded-xl
                bg-emerald-500/12 border border-emerald-400/20
                flex items-center justify-center
                shrink-0
              "
              aria-hidden="true"
            >
              <span className="text-[18px]">📚</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-zinc-100">
                Section 1 — First Contact
              </div>
              <div className="text-[13px] text-zinc-300 mt-1 leading-snug">
                The first guided section will focus on greetings, politeness,
                first responses, and simple real-world interaction.
              </div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Next build target
          </div>
          <div className="text-[15px] font-semibold text-zinc-100 mt-2">
            Module 1.1 — Greeting and Politeness
          </div>
          <div className="text-[13px] text-zinc-300 mt-1 leading-snug">
            This module will become the reference implementation for the wider
            lesson system.
          </div>

          <div className="mt-4 grid gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-zinc-300">
              Lesson 1 — Hello and Goodbye
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-zinc-300">
              Lesson 2 — Yes, No, Please, Thank You
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-zinc-300">
              Lesson 3 — Sorry and Excuse Me
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-zinc-300">
              Lesson 4 — Polite Mini Exchanges
            </div>
            <div className="rounded-2xl border border-emerald-400/18 bg-emerald-500/[0.06] px-3 py-2 text-[13px] text-emerald-200">
              Checkpoint — First Interaction
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Status
          </div>
          <div className="text-[13px] text-zinc-300 mt-2 leading-snug">
            Entry point is now wired. The next step is building the actual
            learning system behind this screen rather than decorating it further.
          </div>
        </SurfaceCard>
      </div>

      <div className="h-6" />
    </div>
  );
}

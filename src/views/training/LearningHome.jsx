// src/views/training/LearningHome.jsx
import React from "react";
import { useGameStore } from "../../stores/gameStore";
import section1 from "../../content/learning/section1";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function BackCircle({ onClick }) {
  return (
    <button type="button" data-press onClick={onClick}
      className={cn("h-10 w-10 rounded-full border flex items-center justify-center",
        "bg-white/[0.06] border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
        "hover:bg-white/[0.08] active:scale-[0.99] transition")}
      aria-label="Back">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
      </svg>
    </button>
  );
}

function SurfaceCard({ children, className }) {
  return (
    <div className={cn("rounded-3xl border border-white/10 bg-black/20 backdrop-blur",
      "shadow-[0_0_24px_rgba(0,0,0,0.18)]", className)}>
      {children}
    </div>
  );
}

function SmallMetaPill({ children, accent = "default" }) {
  const tone = accent === "emerald"
    ? "border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-200"
    : "border-white/10 bg-white/[0.03] text-zinc-300";
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-1",
      "text-[11px] font-medium tracking-tight", tone)}>
      {children}
    </div>
  );
}

export default function LearningHome({ onBack, onOpenSection1 }) {
  const completedLessonIds = useGameStore((s) => s.completedLessonIds);
  const completed = new Set(Array.isArray(completedLessonIds) ? completedLessonIds : []);

  // Find current lesson across all modules
  const allSections = [section1];
  let currentLesson = null;
  let currentSection = null;
  let currentLessonIndex = 0;

  outer: for (const sec of allSections) {
    for (const mod of (sec.modules || [])) {
      if (mod.status !== "active") continue;
      for (let i = 0; i < (mod.lessons || []).length; i++) {
        const l = mod.lessons[i];
        if (!completed.has(l.id)) {
          currentLesson = l;
          currentSection = sec;
          currentLessonIndex = i;
          break outer;
        }
      }
    }
  }

  const allDone = !currentLesson;

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <BackCircle onClick={onBack} />
        <div className="text-center">
          <div className="text-[16px] font-semibold text-zinc-100">Learning</div>
        </div>
        <div className="h-10 w-10" aria-hidden="true" />
      </div>

      <div className="mt-5">
        <div className="text-xl font-semibold text-zinc-100">
          {allDone ? "All lessons complete" : "Continue learning"}
        </div>
        <div className="text-sm text-zinc-400 mt-1 leading-snug">
          {allDone
            ? "You've finished all available lessons. More coming soon."
            : "Pick up where you left off or browse the course."}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {!allDone && currentLesson ? (
          <button type="button" data-press onClick={onOpenSection1} className="w-full text-left">
            <SurfaceCard className="p-4">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">Current lesson</div>
              <div className="mt-2">
                <div className="text-[16px] font-semibold text-zinc-100">
                  Lesson {currentLessonIndex + 1} — {currentLesson.title}
                </div>
                <div className="text-[13px] text-zinc-400 mt-1">
                  {currentSection?.title || ""}
                </div>
              </div>
              <div className="mt-3">
                <SmallMetaPill accent="emerald">Continue</SmallMetaPill>
              </div>
            </SurfaceCard>
          </button>
        ) : null}

        <button type="button" data-press onClick={onOpenSection1} className="w-full text-left">
          <SurfaceCard className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">Browse course</div>
            <div className="mt-2 text-[15px] font-semibold text-zinc-100">
              {section1.title}
            </div>
            <div className="text-[13px] text-zinc-400 mt-1">{section1.purpose || ""}</div>
          </SurfaceCard>
        </button>
      </div>

      <div className="h-6" />
    </div>
  );
}

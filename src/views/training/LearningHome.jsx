// src/views/training/LearningHome.jsx
import React from "react";
import { useGameStore } from "../../stores/gameStore";
import TrainingBackButton from "./TrainingBackButton";

const cn = (...xs) => xs.filter(Boolean).join(" ");

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

export default function LearningHome({ onBack, allSections = [], onOpenSection }) {
  const completedLessonIds = useGameStore((s) => s.completedLessonIds);
  const seenSectionCompleteIds = useGameStore((s) => s.seenSectionCompleteIds) || [];
  const completed = new Set(Array.isArray(completedLessonIds) ? completedLessonIds : []);

  // Find the next uncompleted lesson across all sections
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

  // Calculate completion stats per section
  function getSectionStats(sec) {
    const allLessons = (sec.modules || []).flatMap(m => {
      if (Array.isArray(m.lessons)) return m.lessons;
      if (m.blocks && m.id) return [m]; // checkpoint
      return [];
    });
    const completedCount = allLessons.filter(l => completed.has(l.id)).length;
    const total = allLessons.length;
    const pct = total ? Math.round((completedCount / total) * 100) : 0;
    const sectionDone = seenSectionCompleteIds.includes(sec.id);
    return { completedCount, total, pct, sectionDone };
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <TrainingBackButton onClick={onBack} />
        <div className="text-center">
          <div className="text-[16px] font-semibold text-zinc-100">Learning</div>
        </div>
        <div className="h-10 w-10" aria-hidden="true" />
      </div>

      <div className="mt-5">
        <div className="text-xl font-semibold text-zinc-100">
          {allDone ? "All lessons complete" : "Browse course"}
        </div>
        <div className="text-sm text-zinc-400 mt-1 leading-snug">
          {allDone
            ? "You've finished all available lessons. More coming soon."
            : "Select a section to browse lessons."}
        </div>
      </div>

      {/* Current lesson card */}
      {!allDone && currentLesson && currentSection ? (
        <div className="mt-5">
          <button type="button" data-press
            onClick={() => onOpenSection?.(currentSection.id)}
            className="w-full text-left">
            <SurfaceCard className="p-4">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">Current lesson</div>
              <div className="mt-2">
                <div className="text-[16px] font-semibold text-zinc-100">
                  Lesson {currentLessonIndex + 1} — {currentLesson.title}
                </div>
                <div className="text-[13px] text-zinc-400 mt-1">
                  {currentSection.title}
                </div>
              </div>
              <div className="mt-3">
                <SmallMetaPill accent="emerald">Continue</SmallMetaPill>
              </div>
            </SurfaceCard>
          </button>
        </div>
      ) : null}

      {/* All sections */}
      <div className="mt-5 space-y-3">
        <div className="text-[11px] uppercase tracking-widest text-zinc-600 px-1">Sections</div>
        {allSections.map((sec) => {
          const { completedCount, total, pct, sectionDone } = getSectionStats(sec);
          return (
            <button key={sec.id} type="button" data-press
              onClick={() => onOpenSection?.(sec.id)}
              className="w-full text-left">
              <SurfaceCard className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                      Section {sec.code}
                    </div>
                    <div className="text-[15px] font-semibold text-zinc-100 mt-1">
                      {sec.title}
                    </div>
                    <div className="text-[12px] text-zinc-500 mt-0.5">
                      {sec.moduleCount} modules · {sec.checkpointCount} checkpoint
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    {sectionDone ? (
                      <SmallMetaPill accent="emerald">Complete</SmallMetaPill>
                    ) : pct > 0 ? (
                      <SmallMetaPill>{pct}%</SmallMetaPill>
                    ) : (
                      <SmallMetaPill>Start</SmallMetaPill>
                    )}
                  </div>
                </div>
                {pct > 0 && !sectionDone ? (
                  <div className="mt-3 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500/60 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                ) : null}
              </SurfaceCard>
            </button>
          );
        })}
      </div>

      <div className="h-6" />
    </div>
  );
}

// src/views/training/LearningModuleView.jsx
import React from "react";
import { useGameStore } from "../../stores/gameStore";

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

// ─── Lesson card ──────────────────────────────────────────────────────────────
// status: "completed" | "current" | "locked"

function LessonCard({ index, lesson, status, onClick }) {
  const isCompleted = status === "completed";
  const isCurrent = status === "current";
  const isLocked = status === "locked";

  const shell = isCompleted
    ? "border-emerald-400/15 bg-emerald-500/[0.05]"
    : isCurrent
    ? "border-emerald-400/25 bg-emerald-500/[0.09]"
    : "border-white/10 bg-white/[0.03]";

  const titleColor = isCompleted
    ? "text-emerald-200"
    : isCurrent
    ? "text-emerald-100"
    : isLocked
    ? "text-zinc-500"
    : "text-zinc-100";

  const pill = isCompleted ? (
    <SmallMetaPill accent="emerald">✓ Done</SmallMetaPill>
  ) : isCurrent ? (
    <SmallMetaPill accent="emerald">Next up</SmallMetaPill>
  ) : (
    // Lock icon for locked lessons
    <div className="h-7 w-7 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" className="text-zinc-600"/>
        <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-600"/>
      </svg>
    </div>
  );

  const inner = (
    <div className={cn("rounded-2xl border px-4 py-4 transition", shell,
      isLocked ? "opacity-60" : "",
      !isLocked ? "hover:brightness-110" : "")}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className={cn("text-[15px] font-semibold leading-snug", titleColor)}>
            Lesson {index + 1} — {lesson.title}
          </div>
          {lesson.purpose ? (
            <div className="mt-0.5 text-[12px] text-zinc-500 leading-snug line-clamp-1">
              {lesson.purpose}
            </div>
          ) : null}
        </div>
        <div className="shrink-0">{pill}</div>
      </div>
    </div>
  );

  if (isLocked || typeof onClick !== "function") return inner;

  return (
    <button type="button" data-press onClick={onClick} className="w-full text-left">
      {inner}
    </button>
  );
}

// ─── Checkpoint card ──────────────────────────────────────────────────────────

function CheckpointCard({ lesson, status, onClick }) {
  const isCompleted = status === "completed";
  const isCurrent = status === "current";
  const isLocked = status === "locked";

  const shell = isCompleted
    ? "border-emerald-400/20 bg-emerald-500/[0.07]"
    : isCurrent
    ? "border-emerald-400/30 bg-emerald-500/[0.10]"
    : "border-white/[0.08] bg-white/[0.02]";

  const inner = (
    <div className={cn("rounded-2xl border px-4 py-4 transition", shell,
      isLocked ? "opacity-50" : "",
      !isLocked ? "hover:brightness-110" : "")}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className={cn("text-[15px] font-semibold",
            isCompleted ? "text-emerald-200" : isCurrent ? "text-emerald-100" : "text-zinc-500")}>
            Checkpoint
          </div>
          <div className="mt-0.5 text-[12px] text-zinc-500">
            {isLocked ? "Complete all lessons to unlock" : lesson?.purpose || "Test your recall without support"}
          </div>
        </div>
        <div className="shrink-0">
          {isCompleted ? (
            <SmallMetaPill accent="emerald">✓ Done</SmallMetaPill>
          ) : isCurrent ? (
            <SmallMetaPill accent="emerald">Unlocked</SmallMetaPill>
          ) : (
            <div className="h-7 w-7 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" className="text-zinc-600"/>
                <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-600"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLocked || typeof onClick !== "function") return inner;

  return (
    <button type="button" data-press onClick={onClick} className="w-full text-left">
      {inner}
    </button>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function LearningModuleView({ section, module, onBack, onOpenLesson }) {
  const completedLessonIds = useGameStore((s) => s.completedLessonIds);
  const completed = new Set(Array.isArray(completedLessonIds) ? completedLessonIds : []);

  const lessons = Array.isArray(module?.lessons) ? module.lessons : [];

  // Find the first uncompleted lesson — that's the "current" one
  const firstUncompletedIndex = lessons.findIndex((l) => !completed.has(l.id));

  const getLessonStatus = (lesson, index) => {
    if (completed.has(lesson.id)) return "completed";
    if (index === firstUncompletedIndex) return "current";
    return "locked";
  };

  const completedCount = lessons.filter((l) => completed.has(l.id)).length;
  const totalCount = lessons.length;

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
      {/* Header */}
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <BackCircle onClick={onBack} />
        <div className="text-center">
          <div className="text-[16px] font-semibold text-zinc-100">
            {module?.title || ""}
          </div>
        </div>
        <div className="h-10 w-10" aria-hidden="true" />
      </div>

      {/* Module meta */}
      <div className="mt-5">
        <div className="text-sm text-zinc-500">{section?.title || ""}</div>
        <div className="text-xl font-semibold text-zinc-100 mt-1">
          {module?.title || "Learning module"}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 flex flex-wrap gap-2">
        <SmallMetaPill accent={completedCount === totalCount ? "emerald" : "default"}>
          {completedCount}/{totalCount} lessons done
        </SmallMetaPill>
      </div>

      <div className="mt-3">
        <div className="h-[3px] rounded-full bg-white/[0.07] overflow-hidden">
          <div
            className="h-full bg-emerald-500/70 rounded-full transition-all duration-300"
            style={{ width: totalCount ? `${Math.round((completedCount / totalCount) * 100)}%` : "0%" }}
          />
        </div>
      </div>

      {/* Lesson list */}
      <div className="mt-5">
        <SurfaceCard className="p-4">
          <div className="grid gap-3">
            {lessons.map((lesson, index) => {
              // Separate checkpoint from regular lessons
              if (lesson.isCheckpoint) {
                const allLessonsDone = lessons
                  .filter((l) => !l.isCheckpoint)
                  .every((l) => completed.has(l.id));
                const checkpointStatus = completed.has(lesson.id)
                  ? "completed"
                  : allLessonsDone
                  ? "current"
                  : "locked";

                return (
                  <CheckpointCard
                    key={lesson.id}
                    lesson={lesson}
                    status={checkpointStatus}
                    onClick={checkpointStatus !== "locked"
                      ? () => onOpenLesson?.(lesson.id)
                      : undefined}
                  />
                );
              }

              const status = getLessonStatus(lesson, index);
              return (
                <LessonCard
                  key={lesson.id}
                  index={index}
                  lesson={lesson}
                  status={status}
                  onClick={status !== "locked"
                    ? () => onOpenLesson?.(lesson.id)
                    : undefined}
                />
              );
            })}
          </div>
        </SurfaceCard>
      </div>

      <div className="h-6" />
    </div>
  );
}

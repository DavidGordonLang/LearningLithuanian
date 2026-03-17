// src/views/training/LearningModuleView.jsx
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

function SmallMetaPill({ children, accent = "default" }) {
  const tone =
    accent === "emerald"
      ? "border-emerald-400/18 bg-emerald-500/[0.08] text-emerald-200"
      : "border-white/10 bg-white/[0.03] text-zinc-300";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1",
        "text-[11px] font-medium tracking-tight",
        tone
      )}
    >
      {children}
    </div>
  );
}

function LessonCard({
  title,
  purpose,
  supportLevel,
  newLanguageLoad,
  active = false,
  onClick,
}) {
  const shell = active
    ? "border-emerald-400/20 bg-emerald-500/[0.07]"
    : "border-white/10 bg-white/[0.03]";

  const content = (
    <div className={cn("rounded-2xl border px-4 py-4", shell)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={cn(
              "text-[15px] font-semibold leading-snug",
              active ? "text-emerald-100" : "text-zinc-100"
            )}
          >
            {title}
          </div>
          <div className="text-[13px] text-zinc-300 mt-1 leading-snug">
            {purpose}
          </div>
        </div>

        {active ? (
          <SmallMetaPill accent="emerald">Current</SmallMetaPill>
        ) : (
          <SmallMetaPill>Lesson</SmallMetaPill>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {supportLevel ? (
          <SmallMetaPill>Support: {supportLevel}</SmallMetaPill>
        ) : null}
        {newLanguageLoad ? (
          <SmallMetaPill>Load: {newLanguageLoad}</SmallMetaPill>
        ) : null}
      </div>
    </div>
  );

  if (typeof onClick !== "function") return content;

  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      className="w-full text-left"
    >
      {content}
    </button>
  );
}

function CheckpointCard({ title, purpose }) {
  return (
    <div className="rounded-2xl border border-emerald-400/18 bg-emerald-500/[0.06] px-4 py-4">
      <div className="text-[15px] font-semibold text-emerald-200">{title}</div>
      <div className="text-[13px] text-zinc-300 mt-1 leading-snug">
        {purpose}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <SmallMetaPill accent="emerald">Module checkpoint path</SmallMetaPill>
      </div>
    </div>
  );
}

export default function LearningModuleView({
  section,
  module,
  onBack,
  onOpenLesson,
}) {
  const lessons = Array.isArray(module?.lessons) ? module.lessons : [];
  const currentLesson = lessons[0] || null;
  const checkpoint = module?.checkpoint || null;

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <div className="flex items-center justify-start">
          <BackCircle onClick={onBack} />
        </div>

        <div className="text-center">
          <div className="text-[16px] font-semibold text-zinc-100">
            Module {module?.code || ""}
          </div>
        </div>

        <div className="h-10 w-10" aria-hidden="true" />
      </div>

      <div className="mt-5">
        <div className="text-sm text-zinc-500">
          Section {section?.code} — {section?.title}
        </div>
        <div className="text-xl font-semibold text-zinc-100 mt-1">
          {module?.title || "Learning module"}
        </div>
        <div className="text-sm text-zinc-400 mt-1 leading-snug">
          {module?.purpose || ""}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <SmallMetaPill accent="emerald">
          {module?.lessonCount || lessons.length || 0} lessons
        </SmallMetaPill>
        {checkpoint ? <SmallMetaPill>1 checkpoint</SmallMetaPill> : null}
      </div>

      {currentLesson ? (
        <div className="mt-5">
          <button
            type="button"
            data-press
            onClick={() => onOpenLesson?.(currentLesson.id)}
            className="w-full text-left"
          >
            <SurfaceCard className="p-4">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">
                Current lesson
              </div>
              <div className="text-[15px] font-semibold text-zinc-100 mt-2">
                Lesson {currentLesson.code} — {currentLesson.title}
              </div>
              <div className="text-[13px] text-zinc-300 mt-1 leading-snug">
                {currentLesson.purpose}
              </div>
            </SurfaceCard>
          </button>
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        <SurfaceCard className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Lessons
          </div>

          <div className="mt-3 grid gap-3">
            {lessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                title={`Lesson ${index + 1} — ${lesson.title}`}
                purpose={lesson.purpose}
                supportLevel={lesson.supportLevel}
                newLanguageLoad={lesson.newLanguageLoad}
                active={index === 0}
                onClick={index === 0 ? () => onOpenLesson?.(lesson.id) : undefined}
              />
            ))}
          </div>
        </SurfaceCard>

        {checkpoint ? (
          <SurfaceCard className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
              Checkpoint
            </div>

            <div className="mt-3">
              <CheckpointCard
                title={`${checkpoint.code} — ${checkpoint.title}`}
                purpose={checkpoint.purpose}
              />
            </div>
          </SurfaceCard>
        ) : null}

        {Array.isArray(module?.outcome) && module.outcome.length > 0 ? (
          <SurfaceCard className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
              Module outcome
            </div>

            <div className="mt-3 space-y-2">
              {module.outcome.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-zinc-300 leading-snug"
                >
                  {item}
                </div>
              ))}
            </div>
          </SurfaceCard>
        ) : null}

        <SurfaceCard className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Status
          </div>
          <div className="text-[13px] text-zinc-300 mt-2 leading-snug">
            Lesson 1 is now the first playable slice. After that works, we can
            make the rest of the lesson stack and progression feel real.
          </div>
        </SurfaceCard>
      </div>

      <div className="h-6" />
    </div>
  );
}
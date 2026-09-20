// src/views/training/LearningSectionView.jsx
import React from "react";
import { useGameStore } from "../../stores/gameStore";
import TrainingBackButton from "./TrainingBackButton";
import { getSectionBrowseState } from "./learningProgress";

const cn = (...xs) => xs.filter(Boolean).join(" ");

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

function moduleStatusLabel(status, progress) {
  if (status === "completed") return "Complete";
  if (status === "locked") return "Locked";
  if (progress?.teachingDone && !progress?.checkpointCompleted) return "Checkpoint ready";
  if ((progress?.teachingCompleted || 0) > 0) return "In progress";
  return "Next up";
}

function ModuleCard({ module, status, progress, onClick }) {
  const isCompleted = status === "completed";
  const isCurrent = status === "current";
  const isLocked = status === "locked";

  const shell = isCompleted
    ? "border-emerald-400/18 bg-emerald-500/[0.06]"
    : isCurrent
    ? "border-emerald-400/25 bg-emerald-500/[0.09]"
    : "border-white/10 bg-white/[0.03]";

  const titleColor = isCompleted
    ? "text-emerald-200"
    : isCurrent
    ? "text-emerald-100"
    : "text-zinc-500";

  const content = (
    <div className={cn("rounded-2xl border px-4 py-4 transition", shell, isLocked ? "opacity-60" : "")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn("text-[15px] font-semibold leading-snug", titleColor)}>
            {module?.title || ""}
          </div>
        </div>

        <SmallMetaPill accent={isCompleted || isCurrent ? "emerald" : "default"}>
          {moduleStatusLabel(status, progress)}
        </SmallMetaPill>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <SmallMetaPill>
          {progress?.teachingCompleted || 0}/{progress?.teachingTotal || 0} lessons complete
        </SmallMetaPill>
        {progress?.checkpointCompleted ? (
          <SmallMetaPill accent="emerald">Checkpoint complete</SmallMetaPill>
        ) : progress?.teachingDone && !isLocked ? (
          <SmallMetaPill>Checkpoint unlocked</SmallMetaPill>
        ) : null}
      </div>
    </div>
  );

  if (isLocked || typeof onClick !== "function") return content;

  return (
    <button type="button" data-press onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}

function SectionCheckpointCard({ checkpoint, status, onClick }) {
  const isCompleted = status === "completed";
  const isUnlocked = status === "unlocked";
  const isLocked = status === "locked";

  const shell = isCompleted
    ? "border-emerald-400/20 bg-emerald-500/[0.07]"
    : isUnlocked
    ? "border-emerald-400/30 bg-emerald-500/[0.10]"
    : "border-white/[0.08] bg-white/[0.02]";

  const content = (
    <div className={cn("rounded-2xl border px-4 py-4 transition", shell, isLocked ? "opacity-55" : "")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn(
            "text-[15px] font-semibold leading-snug",
            isCompleted || isUnlocked ? "text-emerald-100" : "text-zinc-500"
          )}>
            Section checkpoint — {checkpoint?.title || "Checkpoint"}
          </div>
          <div className="mt-1 text-[12px] text-zinc-500 leading-snug">
            {isLocked
              ? "Complete all modules and their checkpoints to unlock."
              : checkpoint?.purpose || "Bring the whole section together."}
          </div>
        </div>
        <SmallMetaPill accent={isCompleted || isUnlocked ? "emerald" : "default"}>
          {isCompleted ? "Complete" : isUnlocked ? "Unlocked" : "Locked"}
        </SmallMetaPill>
      </div>
    </div>
  );

  if (isLocked || typeof onClick !== "function") return content;

  return (
    <button type="button" data-press onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
}

export default function LearningSectionView({
  section,
  onBack,
  onOpenModule,
  onOpenCheckpoint,
}) {
  const completedLessonIds = useGameStore((s) => s.completedLessonIds);
  const {
    moduleStates,
    sectionCheckpoint,
    sectionCheckpointStatus,
  } = getSectionBrowseState(section, completedLessonIds);

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <div className="flex items-center justify-start">
          <TrainingBackButton onClick={onBack} />
        </div>

        <div className="text-center">
          <div className="text-[16px] font-semibold text-zinc-100">
            {section?.title || ""}
          </div>
        </div>

        <div className="h-10 w-10" aria-hidden="true" />
      </div>

      <div className="mt-5">
        <div className="text-xl font-semibold text-zinc-100">
          {section?.title || "Learning section"}
        </div>
        <div className="text-sm text-zinc-400 mt-1 leading-snug">
          {section?.purpose || section?.description || ""}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <SmallMetaPill accent="emerald">
          {section?.moduleCount || moduleStates.length || 0} modules
        </SmallMetaPill>
        <SmallMetaPill>{section?.checkpointCount || 1} checkpoint</SmallMetaPill>
      </div>

      <div className="mt-5 space-y-4">
        <SurfaceCard className="p-4">
          <div className="grid gap-3">
            {moduleStates.map(({ module, status, progress }) => (
              <ModuleCard
                key={module.id}
                module={module}
                status={status}
                progress={progress}
                onClick={status !== "locked" ? () => onOpenModule?.(module.id) : undefined}
              />
            ))}
          </div>
        </SurfaceCard>

        {sectionCheckpoint ? (
          <SurfaceCard className="p-4">
            <SectionCheckpointCard
              checkpoint={sectionCheckpoint}
              status={sectionCheckpointStatus}
              onClick={sectionCheckpointStatus !== "locked"
                ? () => onOpenCheckpoint?.(sectionCheckpoint.id)
                : undefined}
            />
          </SurfaceCard>
        ) : null}
      </div>

      <div className="h-6" />
    </div>
  );
}

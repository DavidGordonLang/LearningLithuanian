// src/views/training/LearningSectionView.jsx
import React from "react";
import TrainingBackButton from "./TrainingBackButton";

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

function ModuleCard({
  title,
  status = "planned",
  lessonCount = 0,
  onClick,
}) {
  const active = status === "active";
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
        </div>

        {active ? (
          <SmallMetaPill accent="emerald">Current</SmallMetaPill>
        ) : (
          <SmallMetaPill>Planned</SmallMetaPill>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <SmallMetaPill>{lessonCount} lessons</SmallMetaPill>
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

function CheckpointCard({ title }) {
  return (
    <div className="rounded-2xl border border-emerald-400/18 bg-emerald-500/[0.06] px-4 py-4">
      <div className="text-[15px] font-semibold text-emerald-200">{title}</div>

      <div className="mt-3 flex flex-wrap gap-2">
        <SmallMetaPill accent="emerald">Checkpoint</SmallMetaPill>
      </div>
    </div>
  );
}

export default function LearningSectionView({
  section,
  onBack,
  onOpenModule,
}) {
  const modules = Array.isArray(section?.modules) ? section.modules : [];

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
          {section?.purpose || ""}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <SmallMetaPill accent="emerald">
          {section?.moduleCount || modules.length || 0} modules
        </SmallMetaPill>
        <SmallMetaPill>{section?.checkpointCount || 1} checkpoint</SmallMetaPill>
      </div>

      <div className="mt-5 space-y-4">
        <SurfaceCard className="p-4">
          <div className="grid gap-3">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                title={`${module.title}`}
                status={module.status}
                lessonCount={module.lessonCount}
                onClick={
                  module.status === "active"
                    ? () => onOpenModule?.(module.id)
                    : undefined
                }
              />
            ))}
          </div>
        </SurfaceCard>

        {modules[0]?.checkpoint ? (
          <SurfaceCard className="p-4">
            <CheckpointCard
              title={`${modules[0].checkpoint.code} — ${modules[0].checkpoint.title}`}
            />
          </SurfaceCard>
        ) : null}
      </div>

      <div className="h-6" />
    </div>
  );
}

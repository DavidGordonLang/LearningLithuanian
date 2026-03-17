// src/views/training/LearningSectionView.jsx
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

function ModuleCard({ title, purpose, status = "planned", lessonCount = 0 }) {
  const active = status === "active";
  const shell = active
    ? "border-emerald-400/20 bg-emerald-500/[0.07]"
    : "border-white/10 bg-white/[0.03]";

  return (
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
          <SmallMetaPill>Planned</SmallMetaPill>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <SmallMetaPill>{lessonCount} lessons</SmallMetaPill>
      </div>
    </div>
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
        <SmallMetaPill accent="emerald">Section checkpoint</SmallMetaPill>
      </div>
    </div>
  );
}

export default function LearningSectionView({ section, onBack }) {
  const modules = Array.isArray(section?.modules) ? section.modules : [];
  const activeModule =
    modules.find((m) => m?.status === "active") || modules[0] || null;

  return (
    <div className="max-w-xl mx-auto px-4 py-5 pb-8">
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <div className="flex items-center justify-start">
          <BackCircle onClick={onBack} />
        </div>

        <div className="text-center">
          <div className="text-[16px] font-semibold text-zinc-100">
            Section {section?.code || ""}
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
        <SmallMetaPill>
          {section?.checkpointCount || 1} checkpoint
        </SmallMetaPill>
      </div>

      {activeModule ? (
        <div className="mt-5">
          <SurfaceCard className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
              Current module
            </div>
            <div className="text-[15px] font-semibold text-zinc-100 mt-2">
              Module {activeModule.code} — {activeModule.title}
            </div>
            <div className="text-[13px] text-zinc-300 mt-1 leading-snug">
              {activeModule.purpose}
            </div>
          </SurfaceCard>
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        <SurfaceCard className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Modules
          </div>

          <div className="mt-3 grid gap-3">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                title={`Module ${module.code} — ${module.title}`}
                purpose={module.purpose}
                status={module.status}
                lessonCount={module.lessonCount}
              />
            ))}
          </div>
        </SurfaceCard>

        {modules[0]?.checkpoint ? (
          <SurfaceCard className="p-4">
            <div className="text-[11px] uppercase tracking-wide text-zinc-500">
              Checkpoint
            </div>

            <div className="mt-3">
              <CheckpointCard
                title={`${modules[0].checkpoint.code} — ${modules[0].checkpoint.title}`}
                purpose={modules[0].checkpoint.purpose}
              />
            </div>
          </SurfaceCard>
        ) : null}

        <SurfaceCard className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Status
          </div>
          <div className="text-[13px] text-zinc-300 mt-2 leading-snug">
            Section 1 is now being read from real course data. The next step is
            making Module 1.1 open into its lesson list.
          </div>
        </SurfaceCard>
      </div>

      <div className="h-6" />
    </div>
  );
}
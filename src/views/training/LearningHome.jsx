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

function SectionListItem({
  title,
  subtitle,
  active = false,
  locked = false,
  modules = 4,
  checkpointLabel = "Checkpoint",
}) {
  const shell = active
    ? "border-emerald-400/20 bg-emerald-500/[0.07]"
    : "border-white/10 bg-white/[0.03]";

  return (
    <div className={cn("rounded-2xl border px-3 py-3", shell)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={cn(
              "text-[14px] font-semibold leading-snug",
              active ? "text-emerald-100" : "text-zinc-100"
            )}
          >
            {title}
          </div>
          <div className="text-[12px] text-zinc-400 mt-1 leading-snug">
            {subtitle}
          </div>
        </div>

        {active ? (
          <SmallMetaPill accent="emerald">Current</SmallMetaPill>
        ) : locked ? (
          <SmallMetaPill>Upcoming</SmallMetaPill>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <SmallMetaPill>{modules} modules</SmallMetaPill>
        <SmallMetaPill>{checkpointLabel}</SmallMetaPill>
      </div>
    </div>
  );
}

function ModuleListItem({ title, active = false, checkpoint = false }) {
  const shell = checkpoint
    ? "border-emerald-400/18 bg-emerald-500/[0.06] text-emerald-200"
    : active
    ? "border-white/12 bg-white/[0.05] text-zinc-100"
    : "border-white/10 bg-white/[0.03] text-zinc-300";

  return (
    <div
      className={cn(
        "rounded-2xl border px-3 py-2.5 text-[13px] leading-snug",
        shell
      )}
    >
      {title}
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
          Learn through a structured course built around real conversational
          Lithuanian. The course is organised by sections, modules, lessons, and
          checkpoints.
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <SmallMetaPill accent="emerald">12 sections</SmallMetaPill>
        <SmallMetaPill>4 modules per section</SmallMetaPill>
        <SmallMetaPill>1 checkpoint per section</SmallMetaPill>
      </div>

      <div className="mt-5 space-y-4">
        <SurfaceCard className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Continue
          </div>

          <div className="mt-2 flex items-start gap-3">
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
                Section 1 — First Contact and Survival Basics
              </div>
              <div className="text-[13px] text-zinc-300 mt-1 leading-snug">
                Start with greetings, politeness, first responses, and the
                language needed to survive the opening moments of real
                interaction.
              </div>
              <div className="mt-3">
                <SmallMetaPill accent="emerald">
                  Module 1.1 — Greeting and Politeness
                </SmallMetaPill>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Current section
          </div>

          <div className="text-[15px] font-semibold text-zinc-100 mt-2">
            Section 1 — First Contact and Survival Basics
          </div>
          <div className="text-[13px] text-zinc-300 mt-1 leading-snug">
            This section is about getting through the first minute of real
            interaction without freezing.
          </div>

          <div className="mt-4 grid gap-2">
            <ModuleListItem
              title="Module 1.1 — Greeting and Politeness"
              active
            />
            <ModuleListItem title="Module 1.2 — Who I Am" />
            <ModuleListItem title="Module 1.3 — I Don’t Understand" />
            <ModuleListItem title="Module 1.4 — Help and Contact" />
            <ModuleListItem
              title="Checkpoint 1 — First Interaction"
              checkpoint
            />
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Course structure
          </div>

          <div className="mt-3 grid gap-3">
            <SectionListItem
              title="Section 1 — First Contact and Survival Basics"
              subtitle="Open interaction, be polite, introduce yourself, and ask for help."
              active
            />
            <SectionListItem
              title="Section 2 — Core Conversation Patterns"
              subtitle="Need, want, have, simple questions, and basic action language."
              locked
            />
            <SectionListItem
              title="Sections 3–12"
              subtitle="Numbers, food, directions, shopping, people, transport, accommodation, health, work/admin, and final reinforcement."
              locked
            />
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500">
            Status
          </div>
          <div className="text-[13px] text-zinc-300 mt-2 leading-snug">
            The course entry structure is now aligned to the real hierarchy.
            Next, we build the actual section, module, and lesson flow using
            Section 1 as the first working implementation.
          </div>
        </SurfaceCard>
      </div>

      <div className="h-6" />
    </div>
  );
}

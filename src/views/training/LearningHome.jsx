// Journey v1: visual course browser. Curriculum and completion are read-only here.
// The current lesson is opened through TrainingView's existing lesson route.
import React from "react";
import { useGameStore } from "../../stores/gameStore";
import TrainingBackButton from "./TrainingBackButton";
import { findLatestInProgressLesson, getCourseBrowseState, getSectionBrowseState } from "./learningProgress";
import { Companion, JOURNEY_COMPANIONS, useJourneyCompanion } from "./JourneyCompanion";

const THEMES = [
  { icon: "🏘️", landmark: "🌳", place: "The town square", detail: "Meet people and find your feet", gradient: "from-emerald-700/70 via-teal-800/70 to-slate-900" },
  { icon: "💬", landmark: "🏡", place: "Everyday encounters", detail: "Ask, answer and make yourself understood", gradient: "from-sky-800/80 via-teal-900/70 to-slate-900" },
  { icon: "🛍️", landmark: "🏪", place: "The market district", detail: "Numbers, prices and everyday plans", gradient: "from-amber-900/70 via-emerald-950/70 to-slate-900" },
  { icon: "☕", landmark: "🥐", place: "The café quarter", detail: "Order and enjoy real conversations", gradient: "from-orange-900/70 via-rose-950/50 to-slate-900" },
  { icon: "🗺️", landmark: "🚏", place: "The city streets", detail: "Find places and move with confidence", gradient: "from-indigo-900/80 via-cyan-950/60 to-slate-900" },
];

function findCurrent(sections, completedLessonIds, lessonProgress) {
  const saved = findLatestInProgressLesson(sections, completedLessonIds, lessonProgress);
  if (saved) return saved;
  const completed = new Set(completedLessonIds || []);
  for (const section of sections) {
    for (const module of section.modules || []) {
      if (module.isSectionCheckpoint) {
        if (!completed.has(module.id)) return { section, module, lesson: module };
        continue;
      }
      if (module.status !== "active") continue;
      const lesson = (module.lessons || []).find(item => !completed.has(item.id));
      if (lesson) return { section, module, lesson };
    }
  }
  return null;
}

function SectionJourney({ section, sectionIndex, state, target, completed, companion, onOpenLesson, onOpenSection }) {
  const theme = THEMES[sectionIndex] || THEMES[0];
  const focused = state.status === "current";
  const { moduleStates, sectionCheckpoint, sectionCheckpointStatus } = getSectionBrowseState(section, [...completed]);
  const currentModule = moduleStates.find(m => m.status === "current")?.module;
  const isSectionCheckpointCurrent = focused && !currentModule && sectionCheckpointStatus === "unlocked";
  return (
    <section className={`relative overflow-hidden rounded-[27px] border ${focused ? "border-emerald-400/60 shadow-[0_12px_42px_rgba(4,120,87,0.24)]" : "border-white/10"} bg-gradient-to-br ${theme.gradient}`}>
      <div className="relative px-5 pt-5 pb-4">
        <span className="pointer-events-none absolute right-3 top-3 text-[69px] opacity-25" aria-hidden="true">{theme.icon}</span>
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/80">Destination {section.code} of 5 · {theme.place}</div>
        <div className="relative mt-2 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/20 text-[34px]" aria-hidden="true">{theme.landmark}</div>
          <div className="min-w-0">
            <h2 className="text-[19px] font-bold leading-snug text-white">{section.title}</h2>
            <p className="mt-0.5 text-xs leading-snug text-zinc-200">{theme.detail}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-100/90">
          <span>{state.progress.completedCount} of {state.progress.total} units</span>
          <span>{state.status === "completed" ? "✓ Completed" : state.status === "locked" ? "🔒 Ahead on your path" : "Your current destination"}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label={`${section.title} completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={state.progress.pct}>
          <div className="h-full rounded-full bg-emerald-300 transition-[width] duration-500" style={{width:`${state.progress.pct}%`}} />
        </div>
      </div>

      {focused ? (
        <div className="relative border-t border-white/10 bg-slate-950/40 px-4 pb-4 pt-3">
          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-200">Your route through this destination</div>
          <div className="relative ml-4 border-l-2 border-dashed border-emerald-400/30 pl-5">
            {moduleStates.map(({module, status, progress}, i) => {
              const open = status === "current";
              return (
                <div key={module.id} className="relative mb-3">
                  <div className={`absolute -left-[29px] top-3 h-4 w-4 rounded-full border-[3px] ${status === "completed" ? "border-emerald-300 bg-emerald-500" : open ? "border-emerald-200 bg-emerald-300" : "border-zinc-600 bg-zinc-800"}`} />
                  <button type="button" disabled={status === "locked"} onClick={() => onOpenSection?.(section.id)} className={`w-full rounded-xl border p-3 text-left ${open ? "border-emerald-400/45 bg-emerald-500/15" : "border-white/10 bg-black/20"} ${status === "locked" ? "opacity-60" : ""}`}>
                    <div className="flex justify-between gap-2"><span className="text-sm font-semibold text-zinc-50">{module.title}</span><span className="shrink-0 text-xs text-emerald-200">{status === "completed" ? "✓" : open ? "Now" : "🔒"}</span></div>
                    <div className="mt-1 text-[11px] text-zinc-300">{progress.teachingCompleted}/{progress.teachingTotal} lessons · checkpoint {progress.checkpointCompleted ? "complete" : "ahead"}</div>
                  </button>
                  {open ? (
                    <div className="ml-2 mt-2 space-y-2">
                      {(module.lessons || []).map((lesson) => {
                        const done = completed.has(lesson.id);
                        const here = target?.lesson?.id === lesson.id;
                        const available = done || here;
                        return (
                          <button key={lesson.id} type="button" disabled={!available} onClick={() => onOpenLesson?.(lesson.id)} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left ${here ? "border-emerald-300/60 bg-emerald-500/20" : "border-white/10 bg-slate-950/30"} ${available ? "" : "opacity-55"}`}>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                              {here ? <Companion companion={companion} size="text-[27px]" animated/> : <span aria-hidden="true">{done ? "✓" : lesson.isCheckpoint ? "🏁" : "🔒"}</span>}
                            </div>
                            <div className="min-w-0 flex-1"><div className="text-xs font-semibold text-zinc-50">{lesson.title}</div><div className="mt-1 text-[10px] text-zinc-300">{done ? "Review lesson" : here ? "Tap to continue" : "Next on your route"}</div></div>
                            {here ? <span className="text-lg text-emerald-300" aria-hidden="true">→</span> : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {sectionCheckpoint ? (
              <div className="relative">
                <div className={`absolute -left-[29px] top-3 h-4 w-4 rounded-full border-[3px] ${sectionCheckpointStatus === "unlocked" ? "border-amber-200 bg-amber-300" : "border-zinc-600 bg-zinc-800"}`} />
                <button type="button" disabled={!isSectionCheckpointCurrent} onClick={() => onOpenLesson?.(sectionCheckpoint.id)} className={`w-full rounded-xl border border-amber-300/25 bg-amber-500/10 p-3 text-left ${isSectionCheckpointCurrent ? "" : "opacity-60"}`}>
                  <div className="text-sm font-semibold text-amber-100">🏆 Final destination challenge</div>
                  <div className="mt-1 text-[11px] text-zinc-300">{sectionCheckpoint.title} · {sectionCheckpointStatus === "unlocked" ? "Ready to begin" : "Complete the route to unlock"}</div>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : state.status === "completed" ? (
        <button type="button" onClick={() => onOpenSection?.(section.id)} className="w-full border-t border-white/10 bg-black/20 px-5 py-3 text-left text-xs font-semibold text-emerald-200">Revisit this destination →</button>
      ) : null}
    </section>
  );
}

export default function LearningHome({ onBack, allSections = [], onOpenSection, onOpenLesson, userId }) {
  const completedLessonIds = useGameStore(s => s.completedLessonIds);
  const lessonProgress = useGameStore(s => s.lessonProgress);
  const streakDays = useGameStore(s => s.streakDays);
  const sectionStates = getCourseBrowseState(allSections, completedLessonIds);
  const target = findCurrent(allSections, completedLessonIds, lessonProgress);
  const { selected, choose } = useJourneyCompanion(userId);
  const completed = new Set(completedLessonIds || []);
  const done = !target;
  return (
    <div className="mx-auto max-w-xl px-4 pb-10 pt-5">
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <TrainingBackButton onClick={onBack}/>
        <div className="text-center text-[16px] font-semibold text-zinc-100">Your Journey</div>
        <span className="text-right text-[12px] font-medium text-amber-300" aria-label={`${streakDays || 0} day streak`}>🔥 {streakDays || 0}</span>
      </div>
      <div className="relative mt-5 overflow-hidden rounded-[27px] border border-emerald-300/30 bg-gradient-to-br from-teal-700 via-emerald-950 to-slate-950 p-5">
        <div className="pointer-events-none absolute -right-4 top-0 text-[110px] opacity-20" aria-hidden="true">🌲</div>
        <div className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">Žodis · Learn it. Say it. Live it.</div>
        <h1 className="relative mt-2 font-serif text-[28px] font-bold leading-tight text-white">Every phrase takes you further.</h1>
        <p className="relative mt-2 max-w-[300px] text-[13px] leading-relaxed text-emerald-50/85">Travel through everyday Lithuanian, one useful conversation at a time.</p>
        <div className="relative mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-black/25 px-4 py-3">
          <div><div className="text-[10px] uppercase tracking-wider text-emerald-200">Your companion</div><div className="mt-1 text-sm font-semibold text-white">{selected.name}</div><div className="text-[11px] text-zinc-200">Choose who walks with you</div></div>
          <Companion companion={selected} size="text-5xl" animated/>
        </div>
        <div className="relative mt-3 flex gap-2" role="group" aria-label="Choose your journey companion">
          {JOURNEY_COMPANIONS.map(item => (
            <button type="button" key={item.id} title={item.name} aria-label={`Choose ${item.name}`} aria-pressed={selected.id === item.id} onClick={() => choose(item.id)} className={`flex h-11 flex-1 items-center justify-center rounded-xl border text-2xl transition-colors ${selected.id === item.id ? "border-emerald-200 bg-emerald-400/25" : "border-white/20 bg-black/20"}`}>{item.symbol}</button>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-emerald-100/75">Companion selection is saved on this device for your account during the prototype.</div>
      </div>
      {target ? (
        <button type="button" onClick={() => onOpenLesson?.(target.lesson.id)} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-emerald-400/45 bg-emerald-500/15 px-4 py-4 text-left shadow-lg">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl" aria-hidden="true">▶</span>
          <span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-200">Continue your adventure</span><span className="mt-1 block text-[16px] font-bold text-white">{target.lesson.title}</span><span className="block text-[11px] text-zinc-300">{target.section.title}</span></span>
          <span className="text-xl text-emerald-200" aria-hidden="true">→</span>
        </button>
      ) : (
        <div className="mt-4 rounded-2xl border border-emerald-300/40 bg-emerald-500/15 p-4 text-center text-emerald-50">🏆 Every available lesson is complete. Explore a destination to review what you've learned.</div>
      )}
      <div className="mb-3 mt-7 px-1 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">Explore your five destinations</div>
      <div className="space-y-4">
        {sectionStates.map((state, index) => (
          <SectionJourney key={state.section.id} section={state.section} sectionIndex={index} state={state} target={target} completed={completed} companion={selected} onOpenSection={onOpenSection} onOpenLesson={onOpenLesson}/>
        ))}
      </div>
    </div>
  );
}

// Map-first Journey: read-only curriculum navigation; gameStore stays the
// single authority for lessons, XP, checkpoints and resume.
import React, { useState } from "react";
import { useGameStore } from "../../stores/gameStore";
import TrainingBackButton from "./TrainingBackButton";
import { findLatestInProgressLesson, getCourseBrowseState, getSectionBrowseState } from "./learningProgress";
import { Companion, JOURNEY_COMPANIONS, useJourneyCompanion } from "./JourneyCompanion";
import JourneyMap from "./JourneyMap";

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
export default function LearningHome({ onBack, allSections = [], onOpenSection, onOpenLesson, userId }) {
  const completedLessonIds = useGameStore(s => s.completedLessonIds);
  const lessonProgress = useGameStore(s => s.lessonProgress);
  const streakDays = useGameStore(s => s.streakDays);
  const sectionStates = getCourseBrowseState(allSections, completedLessonIds);
  const target = findCurrent(allSections, completedLessonIds, lessonProgress);
  const { selected, choose, hasChosen } = useJourneyCompanion(userId);
  const completed = new Set(completedLessonIds || []);
  const [showRegionMap, setShowRegionMap] = useState(false);
  const [reviewModuleId, setReviewModuleId] = useState(null);
  const unlockedReview = allSections.flatMap(s => {
    const state = getSectionBrowseState(s, completedLessonIds);
    return [...state.moduleStates.filter(item => item.status === "completed").map(item => ({ section:s, module:item.module })),
      ...(state.sectionCheckpointStatus === "completed" ? [{section:s,module:state.sectionCheckpoint}] : [])];
  });
  const reviewRoute = unlockedReview.find(item => item.module.id === reviewModuleId);
  const activeSection = reviewRoute?.section || target?.section || allSections[allSections.length-1] || null;
  const activeModule = reviewRoute?.module || target?.module || activeSection?.modules?.find(m=>!m.isSectionCheckpoint) || null;
  const onCurrentRoute = activeModule?.id === target?.module?.id;
  const moduleStops = activeModule?.isSectionCheckpoint ? [activeModule] : (activeModule?.lessons || []);
  const routeComplete = moduleStops.length && moduleStops.every(item => completed.has(item.id));
  if (!hasChosen) return <div className="mx-auto max-w-xl px-4 pb-12 pt-5">
    <div className="flex items-center gap-3"><TrainingBackButton onClick={onBack}/><div className="text-lg font-semibold">Choose your journey companion</div></div>
    <div className="z-journey-picker mt-5 rounded-[27px] border border-emerald-400/30 px-4 py-6">
      <h1 className="font-serif text-[25px] font-semibold">Who will explore Lithuania with you?</h1>
      <p className="mt-2 text-sm text-zinc-300">Choose one of our four original companions. Your existing lessons and progress stay exactly where they are.</p>
      <div className="mt-5 grid grid-cols-2 gap-3" role="group" aria-label="Choose your journey companion">
        {JOURNEY_COMPANIONS.map(item=><button key={item.id} type="button" onClick={()=>choose(item.id)}
          className="z-journey-picker-option flex min-h-[142px] flex-col items-center justify-center gap-2 rounded-2xl border p-3"
          aria-label={"Begin journey with "+item.name}>
          <Companion companion={item} size="text-[66px]" label={false}/>
          <span className="text-center text-xs font-bold">{item.name}</span>
        </button>)}
      </div>
      <p className="mt-4 text-center text-xs text-zinc-400">Your selection is remembered on this device for this account.</p>
    </div>
  </div>;
  return <div className="z-map-home mx-auto max-w-xl px-3 pb-8 pt-3">
    <header className="flex items-center gap-3">
      <TrainingBackButton onClick={onBack}/>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Your Journey · {activeSection?.title || "Žodis"}</div>
        <h1 className="truncate font-serif text-[19px] font-semibold">{showRegionMap ? "Explore Lithuania" : activeModule?.title || "Your learning trail"}</h1>
      </div>
      <span className="text-xs font-medium text-amber-400" aria-label={(streakDays||0)+" day streak"}>🔥 {streakDays||0}</span>
    </header>
    <div className="mt-3 flex gap-2">
      <button type="button" onClick={()=>setShowRegionMap(false)} className={"z-map-tab "+(!showRegionMap?"is-active":"")}>🗺️ Current route</button>
      <button type="button" onClick={()=>setShowRegionMap(true)} className={"z-map-tab "+(showRegionMap?"is-active":"")}>Regions & review</button>
    </div>
    {showRegionMap ? <div className="mt-3 space-y-3">
      {sectionStates.map((state,index)=>{
        const browse=getSectionBrowseState(state.section,completedLessonIds);
        return <section key={state.section.id} className="z-map-region-card rounded-[24px] border p-4">
          <div className="text-[10px] uppercase tracking-widest text-emerald-300">Region {index+1} of {sectionStates.length}</div>
          <h2 className="mt-1 text-lg font-bold">{state.section.title}</h2>
          <p className="mt-1 text-xs opacity-75">{state.progress.completedCount} of {state.progress.total} units complete</p>
          <div className="mt-3 grid gap-2">
            {browse.moduleStates.map(({module,status,progress})=><button key={module.id} type="button"
              disabled={status==="locked"}
              onClick={()=>{setReviewModuleId(status==="completed"?module.id:null);setShowRegionMap(false);}}
              className="z-map-region-link flex min-h-[48px] items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left disabled:opacity-50">
              <span className="text-sm font-semibold">{module.title}</span>
              <span className="text-xs">{status==="completed"?"✓ Review":status==="current"?"Explore →":"🔒"} {progress.teachingCompleted}/{progress.teachingTotal}</span>
            </button>)}
            {browse.sectionCheckpoint && <button type="button" disabled={browse.sectionCheckpointStatus==="locked"}
              className="z-map-region-link min-h-[48px] rounded-xl border px-3 py-2 text-left text-sm disabled:opacity-50"
              onClick={()=>{setReviewModuleId(browse.sectionCheckpointStatus==="completed"?browse.sectionCheckpoint.id:null);setShowRegionMap(false);}}>
              ★ {browse.sectionCheckpoint.title} · {browse.sectionCheckpointStatus==="completed"?"Review":browse.sectionCheckpointStatus==="unlocked"?"Ready":"🔒"}
            </button>}
          </div>
          {state.status==="completed" && <button type="button" onClick={()=>onOpenSection?.(state.section.id)} className="mt-3 text-xs font-semibold text-emerald-300">Review completed lessons →</button>}
        </section>;
      })}
    </div> : <>
      <div className="mt-3">
        {activeModule ? <JourneyMap key={activeModule.id} module={activeModule} completed={completed}
          targetId={onCurrentRoute?target?.lesson?.id:null} companion={selected} onOpenLesson={onOpenLesson}/> : null}
      </div>
      {reviewRoute && <p className="mt-2 text-center text-xs opacity-75">Reviewing {activeModule?.title}. <button type="button" onClick={()=>setReviewModuleId(null)} className="underline">Return to current route</button></p>}
      {target ? <button type="button" onClick={() => onOpenLesson?.(target.lesson.id)}
        className="z-journey-dark z-journey-continue mt-3 w-full rounded-2xl border border-emerald-400/45 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
        aria-label={"Go to next lesson: "+target.lesson.title}>
        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Next destination · Tap to begin →</div>
        <div className="mt-1 text-[16px] font-bold text-white">{target.lesson.title}</div>
      </button> : <div className="mt-3 rounded-xl border border-emerald-400/30 p-4 text-sm">All available lessons completed. Open Regions & review to revisit your path.</div>}
      <p className="mt-2 text-center text-[11px] opacity-65">{routeComplete?"Route complete · Explore another region":"Tap the highlighted lesson or use your next destination above."}</p>
    </>}
  </div>;
}

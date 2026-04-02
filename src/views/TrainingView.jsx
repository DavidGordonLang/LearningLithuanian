// src/views/TrainingView.jsx
import React, { useMemo, useState } from "react";
import TrainingHome from "./training/TrainingHome";
import LearningHome from "./training/LearningHome";
import LearningSectionView from "./training/LearningSectionView";
import LearningModuleView from "./training/LearningModuleView";
import LearningLessonView from "./training/LearningLessonView";
import ModuleCompleteView from "./training/ModuleCompleteView";
import SectionCompleteView from "./training/SectionCompleteView";
import VocabSaveView from "./training/VocabSaveView";
import RecallFlipView from "./training/RecallFlipView";
import BlindRecallView from "./training/BlindRecallView";
import MatchPairsView from "./training/MatchPairsView";
import ExamPrepHome from "./training/ExamPrepHome";
import ExamReadingTaskView from "./training/ExamReadingTaskView";
import ExamListeningTaskView from "./training/ExamListeningTaskView";
import ExamWritingTaskView from "./training/ExamWritingTaskView";
import { useTrainingFocus } from "../hooks/training/useTrainingFocus";
import { useGameStore } from "../stores/gameStore";
import { useAuthStore } from "../stores/authStore";
import { useSettingsStore } from "../stores/settingsStore";
import createSection1 from "../content/learning/section1";
import { buildSection1Profile } from "../content/learning/section1/profile";
import createSection2 from "../content/learning/section2";
import createSection3 from "../content/learning/section3";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findNextLesson(sections, completedLessonIds) {
  const completed = new Set(Array.isArray(completedLessonIds) ? completedLessonIds : []);
  for (const section of sections) {
    const modules = Array.isArray(section?.modules) ? section.modules : [];
    for (const module of modules) {
      if (module?.status !== "active") continue;
      const lessons = Array.isArray(module?.lessons) ? module.lessons : [];
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        if (!lesson?.id) continue;
        if (!completed.has(lesson.id)) {
          return { section, module, lesson, lessonIndex: i };
        }
      }
    }
  }
  return null;
}

function findLessonAfter(sections, lessonId) {
  const allLessons = [];
  for (const section of sections) {
    const modules = Array.isArray(section?.modules) ? section.modules : [];
    for (const module of modules) {
      if (module?.status !== "active") continue;
      const lessons = Array.isArray(module?.lessons) ? module.lessons : [];
      lessons.forEach((lesson, i) => {
        allLessons.push({ section, module, lesson, lessonIndex: i });
      });
    }
  }
  const currentIdx = allLessons.findIndex((l) => l.lesson?.id === lessonId);
  if (currentIdx === -1 || currentIdx >= allLessons.length - 1) return null;
  return allLessons[currentIdx + 1];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrainingView({ T, rows, setRows, playText, preloadText, stopText, showToast }) {
  const [screen, setScreen] = useState("home");
  const [moduleCompletePayload, setModuleCompletePayload] = useState(null);
  const [sectionCompletePayload, setSectionCompletePayload] = useState(null);
  const [pendingSectionComplete, setPendingSectionComplete] = useState(false);
  const [vocabSaveModule, setVocabSaveModule] = useState(null);
  const [moduleWrongAnswers, setModuleWrongAnswers] = React.useState(0);
  const [moduleScoreableBlocks, setModuleScoreableBlocks] = React.useState(0);
  const [moduleXpEarned, setModuleXpEarned] = React.useState(0);
  const [devMode, setDevMode] = React.useState(() => {
    try { return localStorage.getItem("zodis_dev_mode") === "true"; } catch { return false; }
  });

  const toggleDevMode = () => {
    setDevMode((prev) => {
      const next = !prev;
      try { localStorage.setItem("zodis_dev_mode", String(next)); } catch {}
      return next;
    });
  };

  const [focus, setFocus] = useTrainingFocus();
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [lessonReturnScreen, setLessonReturnScreen] = useState("home");

  const user = useAuthStore((s) => s.user);
  const completedLessonIds = useGameStore((s) => s.completedLessonIds);
  const hasSeenModuleComplete = useGameStore((s) => s.hasSeenModuleComplete);
  const markModuleCompleteSeen = useGameStore((s) => s.markModuleCompleteSeen);
  const hasSeenSectionComplete = useGameStore((s) => s.hasSeenSectionComplete);
  const markSectionCompleteSeen = useGameStore((s) => s.markSectionCompleteSeen);
  const completeLesson = useGameStore((s) => s.completeLesson);

  const userName = useSettingsStore((s) => s.userName);
  const fromCountryCode = useSettingsStore((s) => s.fromCountryCode);
  const livesInCountryCode = useSettingsStore((s) => s.livesInCountryCode);

  const section1Profile = useMemo(
    () => buildSection1Profile({ userName, fromCountryCode, livesInCountryCode }),
    [userName, fromCountryCode, livesInCountryCode]
  );

  const counts = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    const sheet = (r) => String(r?.Sheet || "Phrases");
    const phrases = list.filter((r) => { const s = sheet(r); return s === "Phrases" || s === "Questions"; }).length;
    const words = list.filter((r) => sheet(r) === "Words").length;
    const numbers = list.filter((r) => sheet(r) === "Numbers").length;
    return { phrases, words, numbers, all: phrases + words };
  }, [rows]);

  const eligibleCount = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    const s = (r) => String(r?.Sheet || "Phrases");
    const matchFocus = (r) => {
      if (focus === "all") return s(r) === "Phrases" || s(r) === "Questions" || s(r) === "Words";
      if (focus === "phrases") return s(r) === "Phrases" || s(r) === "Questions";
      if (focus === "words") return s(r) === "Words";
      if (focus === "numbers") return s(r) === "Numbers";
      return s(r) === "Phrases" || s(r) === "Questions";
    };
    return list.filter(matchFocus).length;
  }, [rows, focus]);

  const allSections = useMemo(
    () => [createSection1(section1Profile), createSection2(section1Profile), createSection3(section1Profile)],
    [section1Profile]
  );

  const nextLesson = useMemo(
    () => findNextLesson(allSections, completedLessonIds),
    [allSections, completedLessonIds]
  );

  const allComplete = !nextLesson;

  const learningSection = useMemo(() => {
    if (selectedLessonId || selectedModuleId) {
      for (const sec of allSections) {
        const modules = Array.isArray(sec?.modules) ? sec.modules : [];
        for (const mod of modules) {
          if (selectedModuleId && mod.id === selectedModuleId) return sec;
          if (selectedLessonId) {
            const found = (mod.lessons || []).find((l) => l.id === selectedLessonId);
            if (found) return sec;
          }
        }
      }
    }
    return nextLesson?.section || allSections[0];
  }, [allSections, selectedModuleId, selectedLessonId, nextLesson]);

  const learningModule = useMemo(() => {
    const modules = Array.isArray(learningSection?.modules) ? learningSection.modules : [];
    if (selectedModuleId) return modules.find((m) => m?.id === selectedModuleId) || null;
    if (selectedLessonId) {
      for (const mod of modules) {
        const found = (mod.lessons || []).find((l) => l.id === selectedLessonId);
        if (found) return mod;
      }
    }
    if (nextLesson?.module) return nextLesson.module;
    return modules.find((m) => m?.status === "active") || modules[0] || null;
  }, [learningSection, selectedModuleId, selectedLessonId, nextLesson]);

  const learningLesson = useMemo(() => {
    const lessons = Array.isArray(learningModule?.lessons) ? learningModule.lessons : [];
    if (selectedLessonId) {
      const found = lessons.find((l) => l?.id === selectedLessonId);
      if (found) return found;
      // Section checkpoint: module has blocks but no lessons — the module IS the lesson
      if (learningModule?.blocks && learningModule.id === selectedLessonId) return learningModule;
      return null;
    }
    if (nextLesson?.lesson) return nextLesson.lesson;
    return lessons[0] || null;
  }, [learningModule, selectedLessonId, nextLesson]);

  const learningLessonIndex = useMemo(() => {
    const lessons = Array.isArray(learningModule?.lessons) ? learningModule.lessons : [];
    if (!learningLesson) return 0;
    if (nextLesson?.lesson?.id === learningLesson.id) return nextLesson.lessonIndex;
    const idx = lessons.findIndex((l) => l?.id === learningLesson.id);
    return idx >= 0 ? idx : 0;
  }, [learningModule, learningLesson, nextLesson]);

  const nextLessonAfterCurrent = useMemo(() => {
    if (!learningLesson?.id) return null;
    return findLessonAfter(allSections, learningLesson.id);
  }, [allSections, learningLesson]);

  const isModuleFullyComplete = (mod) => {
    if (!mod) return false;
    if (Array.isArray(mod.lessons)) return mod.lessons.every((l) => completedLessonIds.includes(l.id));
    if (mod.blocks && mod.id) return completedLessonIds.includes(mod.id); // checkpoint module
    return false;
  };

  const isSectionFullyComplete = (sec) => {
    if (!sec?.modules) return false;
    return sec.modules.every((m) => isModuleFullyComplete(m));
  };

  const nextLessonLabel = nextLessonAfterCurrent
    ? `Lesson ${nextLessonAfterCurrent.lessonIndex + 1} — ${nextLessonAfterCurrent.lesson.title}`
    : null;

  const handleNextLesson = nextLessonAfterCurrent ? () => {
    const { module, lesson } = nextLessonAfterCurrent;
    setSelectedLessonId(lesson.id);
    setSelectedModuleId(module.id);
    setLessonReturnScreen("home");
    setScreen("learningLesson");
  } : null;

  const learningCardTitle = allComplete
    ? "All lessons complete"
    : nextLesson
    ? `${nextLesson.lesson.title}`
    : "Start learning";

  const learningCardMeta = allComplete
    ? "Browse course to review any lesson"
    : nextLesson
    ? `${nextLesson.section.title} · Lesson ${nextLesson.lessonIndex + 1}`
    : "";

  if (screen === "learningHome") {
    return (
      <LearningHome
        onBack={() => setScreen("home")}
        allSections={allSections}
        onOpenSection={(sectionId) => {
          const sec = allSections.find((s) => s.id === sectionId);
          if (!sec) return;
          const firstMod = sec.modules?.[0];
          if (firstMod) setSelectedModuleId(firstMod.id);
          setSelectedLessonId(null);
          setScreen("learningSection");
        }}
      />
    );
  }

  if (screen === "learningSection") {
    return (
      <LearningSectionView
        section={learningSection}
        onBack={() => { setSelectedModuleId(null); setScreen("learningHome"); }}
        onOpenModule={(moduleId) => {
          if (!moduleId) return;
          setSelectedModuleId(moduleId);
          setSelectedLessonId(null);
          setScreen("learningModule");
        }}
      />
    );
  }

  if (screen === "learningModule") {
    return (
      <LearningModuleView
        section={learningSection}
        module={learningModule}
        devMode={devMode}
        onBack={() => setScreen("learningSection")}
        onOpenLesson={(lessonId) => {
          if (!lessonId) return;
          setSelectedLessonId(lessonId);
          setLessonReturnScreen("learningModule");
          setScreen("learningLesson");
        }}
      />
    );
  }

  if (screen === "vocabSave" && vocabSaveModule) {
    return (
      <div className="h-full overflow-y-auto overscroll-contain">
        <VocabSaveView
          module={vocabSaveModule}
          rows={rows}
          setRows={setRows}
          showToast={showToast}
          onDone={() => {
            setVocabSaveModule(null);
            // If section just completed, fire celebration screen
            if (pendingSectionComplete && sectionCompletePayload) {
              setPendingSectionComplete(false);
              setScreen("sectionComplete");
              return;
            }
            const next = findNextLesson(allSections, completedLessonIds);
            if (next) {
              setSelectedLessonId(next.lesson.id);
              setSelectedModuleId(next.module.id);
              setModuleWrongAnswers(0);
              setModuleScoreableBlocks(0);
              setModuleXpEarned(0);
              setLessonReturnScreen("home");
              setScreen("learningLesson");
            } else {
              setSelectedLessonId(null);
              setSelectedModuleId(null);
              setScreen("home");
            }
          }}
        />
      </div>
    );
  }

  if (screen === "sectionComplete" && sectionCompletePayload) {
    return (
      <SectionCompleteView
        section={sectionCompletePayload.section}
        modules={sectionCompletePayload.modules}
        xpEarned={sectionCompletePayload.xpEarned}
        accuracyPct={sectionCompletePayload.accuracyPct}
        onContinue={() => {
          setSectionCompletePayload(null);
          const next = findNextLesson(allSections, completedLessonIds);
          if (next) {
            setSelectedLessonId(next.lesson.id);
            setSelectedModuleId(next.module.id);
            setModuleWrongAnswers(0);
            setModuleScoreableBlocks(0);
            setModuleXpEarned(0);
            setLessonReturnScreen("home");
            setScreen("learningLesson");
          } else {
            setSelectedLessonId(null);
            setSelectedModuleId(null);
            setScreen("home");
          }
        }}
        onHome={() => {
          setSectionCompletePayload(null);
          setSelectedLessonId(null);
          setSelectedModuleId(null);
          setScreen("home");
        }}
      />
    );
  }

  if (screen === "moduleComplete" && moduleCompletePayload) {
    return (
      <ModuleCompleteView
        section={moduleCompletePayload.section}
        module={moduleCompletePayload.module}
        xpEarned={moduleCompletePayload.xpEarned}
        accuracyPct={moduleCompletePayload.accuracyPct}
        onSaveVocab={() => {
          const mod = moduleCompletePayload?.module;
          setModuleCompletePayload(null);
          setVocabSaveModule(mod);
          setScreen("vocabSave");
        }}
        onContinue={() => {
          setModuleCompletePayload(null);
          const next = findNextLesson(allSections, completedLessonIds);
          if (next) {
            setSelectedLessonId(next.lesson.id);
            setSelectedModuleId(next.module.id);
            setModuleWrongAnswers(0);
            setModuleScoreableBlocks(0);
            setModuleXpEarned(0);
            setLessonReturnScreen("home");
            setScreen("learningLesson");
          } else {
            setSelectedLessonId(null);
            setSelectedModuleId(null);
            setScreen("home");
          }
        }}
        onHome={() => {
          setModuleCompletePayload(null);
          setSelectedLessonId(null);
          setSelectedModuleId(null);
          setScreen("home");
        }}
      />
    );
  }

  if (screen === "learningLesson") {
    return (
      <LearningLessonView
        key={learningLesson?.id}
        section={learningSection}
        module={learningModule}
        lesson={learningLesson}
        lessonIndex={learningLessonIndex}
        playText={playText}
        showToast={showToast}
        userId={user?.id}
        onBack={() => {
          if (lessonReturnScreen === "learningModule") {
            setScreen(lessonReturnScreen);
          } else {
            setSelectedLessonId(null);
            setSelectedModuleId(null);
            setScreen(lessonReturnScreen);
          }
        }}
        onBrowseCourse={() => {
          setSelectedLessonId(null);
          setSelectedModuleId(null);
          setScreen("learningHome");
        }}
        onLessonComplete={(metrics) => {
          if (metrics?.scoreableBlocks > 0) {
            setModuleWrongAnswers((n) => n + (metrics.wrongAnswers || 0));
            setModuleScoreableBlocks((n) => n + (metrics.scoreableBlocks || 0));
          }
          setModuleXpEarned((n) => n + (metrics?.xpAwarded || 0));
        }}
        preloadText={preloadText}
        onNailedItContinue={(completedLessonId) => {
          let mod = learningModule;
          let sec = learningSection;
          if (completedLessonId) {
            outer: for (const s of allSections) {
              for (const m of (s.modules || [])) {
                if ((m.lessons || []).find(l => l.id === completedLessonId)) { mod = m; sec = s; break outer; }
                if (m.blocks && m.id === completedLessonId) { mod = m; sec = s; break outer; } // checkpoint
              }
            }
          }
          const modComplete = mod && isModuleFullyComplete(mod);
          const secComplete = sec && isSectionFullyComplete(sec) && !hasSeenSectionComplete(sec.id);
          const modAccuracy = moduleScoreableBlocks > 0
            ? Math.round(((moduleScoreableBlocks - moduleWrongAnswers) / moduleScoreableBlocks) * 100)
            : null;

          // Section complete check runs independently — fires even if module
          // complete screen was previously seen (e.g. via dev mode or earlier playthrough)
          if (modComplete && secComplete) {
            if (!hasSeenModuleComplete(mod.id)) markModuleCompleteSeen(mod.id, user?.id);
            markSectionCompleteSeen(sec.id, user?.id);
            setSectionCompletePayload({
              section: sec,
              modules: sec.modules || [],
              accuracyPct: modAccuracy,
              xpEarned: moduleXpEarned > 0 ? moduleXpEarned : null,
            });
            setPendingSectionComplete(true);
            const checkpoint = (sec.modules || []).find((m) => m.isSectionCheckpoint) || mod;
            setVocabSaveModule(checkpoint);
            setSelectedLessonId(null);
            setSelectedModuleId(null);
            setScreen("vocabSave");
          } else if (modComplete && !hasSeenModuleComplete(mod.id)) {
            markModuleCompleteSeen(mod.id, user?.id);
            setModuleCompletePayload({
              module: mod,
              section: sec,
              accuracyPct: modAccuracy,
              xpEarned: moduleXpEarned > 0 ? moduleXpEarned : null,
            });
            setSelectedLessonId(null);
            setSelectedModuleId(null);
            setScreen("moduleComplete");
          } else if (typeof handleNextLesson === "function") {
            handleNextLesson();
          } else {
            setSelectedLessonId(null);
            setSelectedModuleId(null);
            setScreen("home");
          }
        }}
        nextLessonLabel={nextLessonLabel}
      />
    );
  }

  if (screen === "recallFlip") return <RecallFlipView rows={rows} focus={focus} playText={playText} onBack={() => setScreen("home")} />;
  if (screen === "blindRecall") return <BlindRecallView rows={rows} focus={focus} playText={playText} showToast={showToast} onBack={() => setScreen("home")} />;
  if (screen === "matchPairs") return <MatchPairsView rows={rows} focus={focus} playText={playText} preloadText={preloadText} onBack={() => setScreen("home")} />;

  if (screen === "examPrepHome") {
    return (
      <ExamPrepHome
        onBack={() => setScreen("home")}
        onOpenReading={() => setScreen("examReading")}
        onOpenListening={() => setScreen("examListening")}
        onOpenWriting={() => setScreen("examWriting")}
      />
    );
  }
  if (screen === "examReading") return <ExamReadingTaskView onBack={() => setScreen("examPrepHome")} />;
  if (screen === "examListening") {
    return <ExamListeningTaskView playText={playText} preloadText={preloadText} stopText={stopText} showToast={showToast} onBack={() => setScreen("examPrepHome")} />;
  }
  if (screen === "examWriting") return <ExamWritingTaskView onBack={() => setScreen("examPrepHome")} />;

  return (
    <TrainingHome
      T={T}
      focus={focus}
      setFocus={setFocus}
      counts={counts}
      eligibleCount={eligibleCount}
      learningEntryMode={completedLessonIds?.length > 0 ? "continue" : "start"}
      learningCurrentTitle={learningCardTitle}
      learningCurrentMeta={learningCardMeta}
      onStartLearning={allComplete ? null : () => {
        const lessonToPinId = nextLesson?.lesson?.id || null;
        const moduleToPinId = nextLesson?.module?.id || null;
        setSelectedLessonId(lessonToPinId);
        setSelectedModuleId(moduleToPinId);
        setLessonReturnScreen("home");
        setModuleWrongAnswers(0);
        setModuleScoreableBlocks(0);
        setModuleXpEarned(0);
        setScreen("learningLesson");
      }}
      devMode={devMode}
      onToggleDevMode={toggleDevMode}
      devTestModules={devMode
        ? [
            ...allSections.flatMap((section) =>
              (section.modules || [])
                .filter((module) => module.status === "active")
                .map((module) => ({
                  id: module.id,
                  label: `⚡ Test Module ${module.code} Complete`,
                  onClick: () => {
                    setModuleCompletePayload({
                      module,
                      section,
                      xpEarned: 142,
                      accuracyPct: 87,
                    });
                    setScreen("moduleComplete");
                  },
                }))
            ),
            ...allSections.map((section) => ({
              id: `section_complete_${section.id}`,
              label: `⚡ Test Section ${section.code} Complete (screen only)`,
              onClick: () => {
                setSectionCompletePayload({
                  section,
                  modules: section.modules || [],
                  xpEarned: 580,
                  accuracyPct: 89,
                });
                setScreen("sectionComplete");
              },
            })),
            ...allSections.map((section) => ({
              id: `section_prime_flow_${section.id}`,
              label: `⚡ Prime Section ${section.code} for Flow Test`,
              onClick: () => {
                // Marks all non-checkpoint lessons complete + clears section-seen flag.
                // Then navigate to the checkpoint so you can play it live and verify
                // NailedIt → VocabSave → SectionComplete fires for real.
                const nonCheckpointIds = (section.modules || []).flatMap((m) =>
                  Array.isArray(m.lessons) ? m.lessons.map((l) => l.id) : []
                );
                nonCheckpointIds.forEach((id) => completeLesson(id, user?.id));
                // Clear section-seen so hasSeenSectionComplete returns false
                useGameStore.setState((state) => ({
                  seenSectionCompleteIds: state.seenSectionCompleteIds.filter(
                    (id) => id !== section.id
                  ),
                }));
                // Navigate to the checkpoint lesson directly
                const checkpoint = (section.modules || []).find((m) => m.isSectionCheckpoint);
                if (checkpoint) {
                  setSelectedModuleId(checkpoint.id);
                  setSelectedLessonId(checkpoint.id);
                  setModuleWrongAnswers(0);
                  setModuleScoreableBlocks(0);
                  setModuleXpEarned(0);
                  setLessonReturnScreen("home");
                  setScreen("learningLesson");
                }
              },
            })),
            ...allSections.map((section) => ({
              id: `section_full_flow_${section.id}`,
              label: `⚡ Complete Section ${section.code} Full Flow`,
              onClick: () => {
                // Mark every lesson in every module of this section as complete
                // then trigger the real NailedItContinue flow so vocab save fires
                const allLessonIds = (section.modules || []).flatMap((m) => {
                  if (Array.isArray(m.lessons)) return m.lessons.map((l) => l.id);
                  if (m.blocks && m.id) return [m.id]; // checkpoint
                  return [];
                });
                allLessonIds.forEach((id) => completeLesson(id, user?.id));
                // Also mark all module completes as seen so only section fires
                (section.modules || []).forEach((m) => {
                  if (!hasSeenModuleComplete(m.id)) markModuleCompleteSeen(m.id, user?.id);
                });
                // Reset section seen so it fires again
                // Then trigger via the last lesson id
                const lastLessonId = allLessonIds[allLessonIds.length - 1];
                if (lastLessonId) {
                  setModuleWrongAnswers(0);
                  setModuleScoreableBlocks(0);
                  setModuleXpEarned(120);
                  // Simulate NailedItContinue with the checkpoint id
                  const mod = section.modules?.[section.modules.length - 1];
                  const sec = section;
                  const modAccuracy = 88;
                  setSectionCompletePayload({
                    section: sec,
                    modules: sec.modules || [],
                    accuracyPct: modAccuracy,
                    xpEarned: 120,
                  });
                  setPendingSectionComplete(true);
                  const checkpoint = (sec.modules || []).find((m) => m.isSectionCheckpoint) || mod;
                  setVocabSaveModule(checkpoint);
                  setSelectedLessonId(null);
                  setSelectedModuleId(null);
                  setScreen("vocabSave");
                }
              },
            })),
          ]
        : []}
      onBrowseCourse={() => setScreen("learningHome")}
      onStartRecallFlip={() => setScreen("recallFlip")}
      onStartBlindRecall={() => setScreen("blindRecall")}
      onStartMatchPairs={() => setScreen("matchPairs")}
      onStartExamPrep={() => setScreen("examPrepHome")}
    />
  );
}

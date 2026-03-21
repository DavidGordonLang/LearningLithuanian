// src/views/TrainingView.jsx
import React, { useMemo, useState } from "react";
import TrainingHome from "./training/TrainingHome";
import LearningHome from "./training/LearningHome";
import LearningSectionView from "./training/LearningSectionView";
import LearningModuleView from "./training/LearningModuleView";
import LearningLessonView from "./training/LearningLessonView";
import ModuleCompleteView from "./training/ModuleCompleteView";
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
import section1 from "../content/learning/section1";

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
  return null; // all lessons complete
}

// Find the lesson AFTER a given lesson id — used for "Continue to next" CTA
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
  const [moduleCompletePayload, setModuleCompletePayload] = useState(null); // { module, section, xpEarned, accuracyPct }
  const [vocabSaveModule, setVocabSaveModule] = useState(null);
  const [moduleWrongAnswers, setModuleWrongAnswers] = React.useState(0);
  const [moduleScoreableBlocks, setModuleScoreableBlocks] = React.useState(0);
  const [moduleXpEarned, setModuleXpEarned] = React.useState(0);
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
  }; // { module, section, xpEarned }
  const [focus, setFocus] = useTrainingFocus();
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [lessonReturnScreen, setLessonReturnScreen] = useState("home");

  const user = useAuthStore((s) => s.user);
  const completedLessonIds = useGameStore((s) => s.completedLessonIds);
  const hasSeenModuleComplete = useGameStore((s) => s.hasSeenModuleComplete);
  const markModuleCompleteSeen = useGameStore((s) => s.markModuleCompleteSeen);

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

  const allSections = useMemo(() => [section1], []);

  // Next uncompleted lesson
  const nextLesson = useMemo(
    () => findNextLesson(allSections, completedLessonIds),
    [allSections, completedLessonIds]
  );

  const allComplete = !nextLesson;

  // Resolve current lesson view targets
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
    if (selectedLessonId) return lessons.find((l) => l?.id === selectedLessonId) || null;
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

  // "Continue to next lesson" — find the lesson AFTER the current one
  // Only provided if there is actually a next lesson (prevents looping)
  const nextLessonAfterCurrent = useMemo(() => {
    if (!learningLesson?.id) return null;
    return findLessonAfter(allSections, learningLesson.id);
  }, [allSections, learningLesson]);



  // "Lesson 2", "Lesson 3" etc — 1-based index of the next lesson
  // Check if all lessons in a module are done — used to trigger celebration
  const isModuleFullyComplete = (mod) => {
    if (!mod?.lessons) return false;
    return mod.lessons.every((l) => completedLessonIds.includes(l.id));
  };

  const nextLessonLabel = nextLessonAfterCurrent
    ? `Lesson ${nextLessonAfterCurrent.lessonIndex + 1} — ${nextLessonAfterCurrent.lesson.title}`
    : null;

  const handleNextLesson = nextLessonAfterCurrent ? () => {
    const { module, lesson } = nextLessonAfterCurrent;
    // Set the new lesson explicitly so learningLesson re-derives correctly
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

  // ─── Browse path ─────────────────────────────────────────────────────────────

  if (screen === "learningHome") {
    return (
      <LearningHome
        onBack={() => setScreen("home")}
        onOpenSection1={() => setScreen("learningSection")}
      />
    );
  }

  if (screen === "learningSection") {
    return (
      <LearningSectionView
        section={learningSection}
        onBack={() => setScreen("learningHome")}
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

  // ─── Module complete ──────────────────────────────────────────────────────────

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
            setSelectedLessonId(null);
            setSelectedModuleId(null);
            setScreen("home");
          }}
        />
      </div>
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
          setSelectedLessonId(null);
          setSelectedModuleId(null);
          setScreen("home");
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

  // ─── Lesson ───────────────────────────────────────────────────────────────────

  if (screen === "learningLesson") {
    return (
      <LearningLessonView
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
        onNailedItContinue={() => {
          const mod = learningModule;
          const sec = learningSection;
          if (mod && isModuleFullyComplete(mod) && !hasSeenModuleComplete(mod.id)) {
            markModuleCompleteSeen(mod.id, user?.id);
            const modAccuracy = moduleScoreableBlocks > 0
              ? Math.round(((moduleScoreableBlocks - moduleWrongAnswers) / moduleScoreableBlocks) * 100)
              : null;
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

  // ─── Practice modes ───────────────────────────────────────────────────────────

  if (screen === "recallFlip") return <RecallFlipView rows={rows} focus={focus} playText={playText} onBack={() => setScreen("home")} />;
  if (screen === "blindRecall") return <BlindRecallView rows={rows} focus={focus} playText={playText} showToast={showToast} onBack={() => setScreen("home")} />;
  if (screen === "matchPairs") return <MatchPairsView rows={rows} focus={focus} playText={playText} preloadText={preloadText} onBack={() => setScreen("home")} />;

  // ─── Exam prep ────────────────────────────────────────────────────────────────

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

  // ─── Training home ────────────────────────────────────────────────────────────

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
      // If all complete, still allow entry via browse course
      // If lessons remain, start next uncompleted
      onStartLearning={allComplete ? null : () => {
        // Pin the lesson explicitly so re-deriving from nextLesson
        // doesn't fire when completedLessonIds updates mid-lesson
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
      onTestModuleComplete={devMode ? () => {
        const mod = allSections[0]?.modules?.[0];
        const sec = allSections[0];
        if (mod && sec) {
          setModuleCompletePayload({ module: mod, section: sec, xpEarned: 142, accuracyPct: 87 });
          setScreen("moduleComplete");
        }
      } : null}
      onBrowseCourse={() => setScreen("learningHome")}
      onStartRecallFlip={() => setScreen("recallFlip")}
      onStartBlindRecall={() => setScreen("blindRecall")}
      onStartMatchPairs={() => setScreen("matchPairs")}
      onStartExamPrep={() => setScreen("examPrepHome")}
    />
  );
}

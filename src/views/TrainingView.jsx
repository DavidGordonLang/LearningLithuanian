// src/views/TrainingView.jsx
import React, { useMemo, useState } from "react";
import TrainingHome from "./training/TrainingHome";
import LearningHome from "./training/LearningHome";
import LearningSectionView from "./training/LearningSectionView";
import LearningModuleView from "./training/LearningModuleView";
import LearningLessonView from "./training/LearningLessonView";
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

export default function TrainingView({ T, rows, playText, preloadText, stopText, showToast }) {
  const [screen, setScreen] = useState("home");
  const [focus, setFocus] = useTrainingFocus();
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [lessonReturnScreen, setLessonReturnScreen] = useState("home");

  const user = useAuthStore((s) => s.user);
  const completedLessonIds = useGameStore((s) => s.completedLessonIds);

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

  const handleNextLesson = nextLessonAfterCurrent ? () => {
    const { section, module, lesson } = nextLessonAfterCurrent;
    setSelectedLessonId(lesson.id);
    setSelectedModuleId(module.id);
    setLessonReturnScreen("home");
    setScreen("learningLesson");
  } : null;

  const learningCardTitle = allComplete
    ? "All lessons complete"
    : nextLesson
    ? `Lesson ${nextLesson.lessonIndex + 1} — ${nextLesson.lesson.title}`
    : "Start learning";

  const learningCardMeta = allComplete
    ? "Browse course to review any lesson"
    : nextLesson
    ? `Section ${nextLesson.section.code} · Module ${nextLesson.module.code}`
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
          setSelectedLessonId(null);
          setScreen(lessonReturnScreen);
        }}
        onBrowseCourse={() => setScreen("learningHome")}
        onLessonComplete={() => {
          setSelectedLessonId(null);
          setSelectedModuleId(null);
        }}
        onNextLesson={handleNextLesson}
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
        setSelectedModuleId(null);
        setSelectedLessonId(null);
        setLessonReturnScreen("home");
        setScreen("learningLesson");
      }}
      onBrowseCourse={() => setScreen("learningHome")}
      onStartRecallFlip={() => setScreen("recallFlip")}
      onStartBlindRecall={() => setScreen("blindRecall")}
      onStartMatchPairs={() => setScreen("matchPairs")}
      onStartExamPrep={() => setScreen("examPrepHome")}
    />
  );
}

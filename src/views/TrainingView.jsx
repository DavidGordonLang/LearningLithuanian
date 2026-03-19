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

// Walk all sections/modules/lessons to find the first lesson that is not
// yet in completedLessonIds. Returns { section, module, lesson, lessonIndex }
// or null if everything is complete.
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrainingView({
  T,
  rows,
  playText,
  preloadText,
  stopText,
  showToast,
}) {
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
    const phrases = list.filter((r) => {
      const s = sheet(r);
      return s === "Phrases" || s === "Questions";
    }).length;
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

  // All content sections (only section1 right now, expand later)
  const allSections = useMemo(() => [section1], []);

  // Find the next uncompleted lesson — this drives the "Continue" card
  const nextLesson = useMemo(
    () => findNextLesson(allSections, completedLessonIds),
    [allSections, completedLessonIds]
  );

  const learningSection = nextLesson?.section || section1;

  const learningModule = useMemo(() => {
    const modules = Array.isArray(learningSection?.modules) ? learningSection.modules : [];
    if (selectedModuleId) return modules.find((m) => m?.id === selectedModuleId) || null;
    // Use the next lesson's module, or fall back to first active
    if (nextLesson?.module) return nextLesson.module;
    return modules.find((m) => m?.status === "active") || modules[0] || null;
  }, [learningSection, selectedModuleId, nextLesson]);

  const learningLesson = useMemo(() => {
    const lessons = Array.isArray(learningModule?.lessons) ? learningModule.lessons : [];
    if (selectedLessonId) return lessons.find((l) => l?.id === selectedLessonId) || null;
    // Use the next uncompleted lesson
    if (nextLesson?.lesson) return nextLesson.lesson;
    return lessons[0] || null;
  }, [learningModule, selectedLessonId, nextLesson]);

  const learningLessonIndex = useMemo(() => {
    const lessons = Array.isArray(learningModule?.lessons) ? learningModule.lessons : [];
    if (!learningLesson) return 0;
    // Use pre-computed index if available
    if (nextLesson?.lesson?.id === learningLesson.id) return nextLesson.lessonIndex;
    const idx = lessons.findIndex((l) => l?.id === learningLesson.id);
    return idx >= 0 ? idx : 0;
  }, [learningModule, learningLesson, nextLesson]);

  // Derive label and meta for the TrainingHome "Continue" card
  const hasAnyCompleted = completedLessonIds && completedLessonIds.length > 0;
  const learningEntryMode = hasAnyCompleted ? "continue" : "start";

  const learningCardTitle = nextLesson
    ? `Lesson ${learningLessonIndex + 1} — ${nextLesson.lesson.title}`
    : "All lessons complete";

  const learningCardMeta = nextLesson
    ? `Section ${nextLesson.section.code} · Module ${nextLesson.module.code}`
    : "Well done!";

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
          // After completion, clear selected so next entry uses the updated
          // "next lesson" derived from gameStore
          setSelectedLessonId(null);
          setSelectedModuleId(null);
        }}
        onNextLesson={nextLesson && nextLesson.lesson?.id !== learningLesson?.id ? () => {
          // Clear selection so the view re-derives the next uncompleted lesson
          setSelectedLessonId(null);
          setSelectedModuleId(null);
          setLessonReturnScreen("home");
          setScreen("learningLesson");
        } : null}
      />
    );
  }

  // ─── Practice modes ───────────────────────────────────────────────────────────

  if (screen === "recallFlip") {
    return <RecallFlipView rows={rows} focus={focus} playText={playText} onBack={() => setScreen("home")} />;
  }

  if (screen === "blindRecall") {
    return <BlindRecallView rows={rows} focus={focus} playText={playText} showToast={showToast} onBack={() => setScreen("home")} />;
  }

  if (screen === "matchPairs") {
    return <MatchPairsView rows={rows} focus={focus} playText={playText} preloadText={preloadText} onBack={() => setScreen("home")} />;
  }

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
    return (
      <ExamListeningTaskView
        playText={playText}
        preloadText={preloadText}
        stopText={stopText}
        showToast={showToast}
        onBack={() => setScreen("examPrepHome")}
      />
    );
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
      learningEntryMode={learningEntryMode}
      learningCurrentTitle={learningCardTitle}
      learningCurrentMeta={learningCardMeta}
      onStartLearning={nextLesson ? () => {
        setSelectedModuleId(null);
        setSelectedLessonId(null);
        setLessonReturnScreen("home");
        setScreen("learningLesson");
      } : null}
      onStartRecallFlip={() => setScreen("recallFlip")}
      onStartBlindRecall={() => setScreen("blindRecall")}
      onStartMatchPairs={() => setScreen("matchPairs")}
      onStartExamPrep={() => setScreen("examPrepHome")}
    />
  );
}

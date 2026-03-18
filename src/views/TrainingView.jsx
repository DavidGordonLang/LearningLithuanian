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
import section1 from "../content/learning/section1";

export default function TrainingView({
  T,
  rows,
  playText,
  preloadText,
  stopText,
  showToast,
}) {
  const [screen, setScreen] = useState("home");
  // "home" | "learningHome" | "learningSection" | "learningModule" | "learningLesson"
  // | "recallFlip" | "blindRecall" | "matchPairs"
  // | "examPrepHome" | "examReading" | "examListening" | "examWriting"

  const [focus, setFocus] = useTrainingFocus();
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  // Track where the browse path should return to after coming from the lesson
  // "home" = came from TrainingHome card (default)
  // "learningModule" = came from browse path
  const [lessonReturnScreen, setLessonReturnScreen] = useState("home");

  const counts = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    const sheet = (r) => String(r?.Sheet || "Phrases");

    const phrases = list.filter((r) => {
      const s = sheet(r);
      return s === "Phrases" || s === "Questions";
    }).length;

    const words = list.filter((r) => sheet(r) === "Words").length;
    const numbers = list.filter((r) => sheet(r) === "Numbers").length;

    return {
      phrases,
      words,
      numbers,
      all: phrases + words,
    };
  }, [rows]);

  const eligibleCount = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    const s = (r) => String(r?.Sheet || "Phrases");

    const matchFocus = (r) => {
      if (focus === "all") {
        return s(r) === "Phrases" || s(r) === "Questions" || s(r) === "Words";
      }
      if (focus === "phrases") {
        return s(r) === "Phrases" || s(r) === "Questions";
      }
      if (focus === "words") return s(r) === "Words";
      if (focus === "numbers") return s(r) === "Numbers";
      return s(r) === "Phrases" || s(r) === "Questions";
    };

    return list.filter(matchFocus).length;
  }, [rows, focus]);

  const learningSection = section1;

  const learningModule = useMemo(() => {
    const modules = Array.isArray(learningSection?.modules)
      ? learningSection.modules
      : [];

    if (selectedModuleId) {
      return modules.find((m) => m?.id === selectedModuleId) || null;
    }

    return modules.find((m) => m?.status === "active") || modules[0] || null;
  }, [learningSection, selectedModuleId]);

  const learningLesson = useMemo(() => {
    const lessons = Array.isArray(learningModule?.lessons)
      ? learningModule.lessons
      : [];

    if (selectedLessonId) {
      return lessons.find((l) => l?.id === selectedLessonId) || null;
    }

    return lessons[0] || null;
  }, [learningModule, selectedLessonId]);

  // ─── Browse path (still reachable from lesson header) ──────────────────────

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

  // ─── Lesson — default entry point from TrainingHome card ───────────────────

  if (screen === "learningLesson") {
    return (
      <LearningLessonView
        section={learningSection}
        module={learningModule}
        lesson={learningLesson}
        playText={playText}
        showToast={showToast}
        onBack={() => setScreen(lessonReturnScreen)}
        onBrowseCourse={() => setScreen("learningHome")}
      />
    );
  }

  // ─── Practice modes ────────────────────────────────────────────────────────

  if (screen === "recallFlip") {
    return (
      <RecallFlipView
        rows={rows}
        focus={focus}
        playText={playText}
        onBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "blindRecall") {
    return (
      <BlindRecallView
        rows={rows}
        focus={focus}
        playText={playText}
        showToast={showToast}
        onBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "matchPairs") {
    return (
      <MatchPairsView
        rows={rows}
        focus={focus}
        playText={playText}
        preloadText={preloadText}
        onBack={() => setScreen("home")}
      />
    );
  }

  // ─── Exam prep ─────────────────────────────────────────────────────────────

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

  if (screen === "examReading") {
    return <ExamReadingTaskView onBack={() => setScreen("examPrepHome")} />;
  }

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

  if (screen === "examWriting") {
    return <ExamWritingTaskView onBack={() => setScreen("examPrepHome")} />;
  }

  // ─── Training home (default) ───────────────────────────────────────────────

  return (
    <TrainingHome
      T={T}
      focus={focus}
      setFocus={setFocus}
      counts={counts}
      eligibleCount={eligibleCount}
      onStartLearning={() => {
        // Direct entry — skip browse screens entirely
        setSelectedModuleId(null);
        setSelectedLessonId(null);
        setLessonReturnScreen("home");
        setScreen("learningLesson");
      }}
      onStartRecallFlip={() => setScreen("recallFlip")}
      onStartBlindRecall={() => setScreen("blindRecall")}
      onStartMatchPairs={() => setScreen("matchPairs")}
      onStartExamPrep={() => setScreen("examPrepHome")}
    />
  );
}

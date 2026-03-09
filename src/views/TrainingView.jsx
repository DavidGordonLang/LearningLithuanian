// src/views/TrainingView.jsx
import React, { useMemo, useState } from "react";
import TrainingHome from "./training/TrainingHome";
import RecallFlipView from "./training/RecallFlipView";
import BlindRecallView from "./training/BlindRecallView";
import MatchPairsView from "./training/MatchPairsView";
import ExamPrepHome from "./training/ExamPrepHome";
import ExamReadingTaskView from "./training/ExamReadingTaskView";
import ExamListeningTaskView from "./training/ExamListeningTaskView";
import ExamWritingTaskView from "./training/ExamWritingTaskView";
import { useTrainingFocus } from "../hooks/training/useTrainingFocus";

export default function TrainingView({
  T,
  rows,
  playText,
  preloadText,
  showToast,
}) {
  // Behaviour frozen: these screen IDs are internal routing only.
  const [screen, setScreen] = useState("home"); // "home" | "recallFlip" | "blindRecall" | "matchPairs" | "examPrepHome" | "examReading" | "examListening" | "examWriting"
  const [focus, setFocus] = useTrainingFocus();

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
      all: phrases + words, // numbers intentionally excluded from "all"
    };
  }, [rows]);

  const eligibleCount = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    const s = (r) => String(r?.Sheet || "Phrases");

    const matchFocus = (r) => {
      if (focus === "all")
        return s(r) === "Phrases" || s(r) === "Questions" || s(r) === "Words";
      if (focus === "phrases") return s(r) === "Phrases" || s(r) === "Questions";
      if (focus === "words") return s(r) === "Words";
      if (focus === "numbers") return s(r) === "Numbers";
      return s(r) === "Phrases" || s(r) === "Questions";
    };

    return list.filter(matchFocus).length;
  }, [rows, focus]);

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
    return (
      <ExamReadingTaskView
        onBack={() => setScreen("examPrepHome")}
      />
    );
  }

  if (screen === "examListening") {
    return (
      <ExamListeningTaskView
        playText={playText}
        preloadText={preloadText}
        showToast={showToast}
        onBack={() => setScreen("examPrepHome")}
      />
    );
  }

  if (screen === "examWriting") {
    return (
      <ExamWritingTaskView
        onBack={() => setScreen("examPrepHome")}
      />
    );
  }

  return (
    <TrainingHome
      T={T}
      focus={focus}
      setFocus={setFocus}
      counts={counts}
      eligibleCount={eligibleCount}
      onStartRecallFlip={() => setScreen("recallFlip")}
      onStartBlindRecall={() => setScreen("blindRecall")}
      onStartMatchPairs={() => setScreen("matchPairs")}
      onStartExamPrep={() => setScreen("examPrepHome")}
    />
  );
}
// src/views/TrainingView.jsx
import React, { useMemo, useState } from "react";
import TrainingHome from "./training/TrainingHome";
import RecallFlipView from "./training/RecallFlipView";
import { useTrainingFocus } from "../hooks/training/useTrainingFocus";

export default function TrainingView({ T, rows }) {
  const [screen, setScreen] = useState("home"); // "home" | "recallFlip"
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

    return { phrases, words, numbers, all: list.length };
  }, [rows]);

  const eligibleCount = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    const s = (r) => String(r?.Sheet || "Phrases");

    const matchFocus = (r) => {
      if (focus === "all") return true;
      if (focus === "phrases") return s(r) === "Phrases" || s(r) === "Questions";
      if (focus === "words") return s(r) === "Words";
      if (focus === "numbers") return s(r) === "Numbers";
      return true;
    };

    return list.filter(matchFocus).length;
  }, [rows, focus]);

  if (screen === "recallFlip") {
    return (
      <RecallFlipView
        rows={rows}
        focus={focus}
        onBack={() => setScreen("home")}
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
    />
  );
}

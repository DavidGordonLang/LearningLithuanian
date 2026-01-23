// src/views/TrainingView.jsx
import React, { useMemo, useState } from "react";
import TrainingHome from "./training/TrainingHome";
import RecallFlipView from "./training/RecallFlipView";
import BlindRecallView from "./training/BlindRecallView";
import MatchPairsView from "./training/MatchPairsView";
import { useTrainingFocus } from "../hooks/training/useTrainingFocus";

export default function TrainingView({ T, rows, playText, showToast }) {
  // Behaviour frozen: these screen IDs are internal routing only.
  const [screen, setScreen] = useState("home"); // "home" | "recallFlip" | "blindRecall" | "matchPairs"
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
    return <MatchPairsView rows={rows} onBack={() => setScreen("home")} />;
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
    />
  );
}

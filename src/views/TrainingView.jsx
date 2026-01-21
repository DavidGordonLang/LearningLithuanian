// src/views/TrainingView.jsx
import React, { useMemo, useState } from "react";
import TrainingHome from "./training/TrainingHome";
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
    // Placeholder — Tool A implementation lands next step.
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-zinc-300 hover:text-zinc-100"
            onClick={() => setScreen("home")}
          >
            ← Back
          </button>
          <div className="text-sm text-zinc-400">Training</div>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="text-lg font-semibold">Recall Flip</div>
          <div className="text-sm text-zinc-300 mt-2">
            Stub screen. The full card flow ships next.
          </div>
        </div>
      </div>
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

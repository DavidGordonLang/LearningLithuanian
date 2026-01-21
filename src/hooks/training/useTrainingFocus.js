// src/hooks/training/useTrainingFocus.js
import { useEffect, useState } from "react";

const LSK_TRAINING_FOCUS = "lt_training_focus_v1";

/**
 * Focus values:
 * - "phrases" (default; includes Questions)
 * - "words"
 * - "numbers"
 * - "all"
 */
export function useTrainingFocus() {
  const [focus, setFocusState] = useState(() => {
    const raw = localStorage.getItem(LSK_TRAINING_FOCUS);
    if (raw === "phrases" || raw === "words" || raw === "numbers" || raw === "all") {
      return raw;
    }
    return "phrases";
  });

  const setFocus = (next) => {
    const v =
      next === "phrases" || next === "words" || next === "numbers" || next === "all"
        ? next
        : "phrases";
    setFocusState(v);
  };

  useEffect(() => {
    localStorage.setItem(LSK_TRAINING_FOCUS, focus);
  }, [focus]);

  return [focus, setFocus];
}

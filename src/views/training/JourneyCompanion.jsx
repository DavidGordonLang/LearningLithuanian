// A small, device-local companion preference for the Journey prototype.
// Account-scoped so switching learners on a shared browser cannot leak choices.
// No lesson scoring or cloud-progress data is written here.
import React, { useState } from "react";

export const JOURNEY_COMPANIONS = [
  { id: "fox", name: "Fox", symbol: "🦊" },
  { id: "owl", name: "Owl", symbol: "🦉" },
  { id: "deer", name: "Deer", symbol: "🦌" },
  { id: "traveller", name: "Traveller", symbol: "🧑‍🎒" },
];

const STORAGE_PREFIX = "zodis:journey-companion:v1:";

function readChoice(userId) {
  if (!userId) return "fox";
  try {
    const value = window.localStorage.getItem(STORAGE_PREFIX + userId);
    return JOURNEY_COMPANIONS.some((item) => item.id === value) ? value : "fox";
  } catch {
    return "fox";
  }
}

export function useJourneyCompanion(userId) {
  const [choice, setChoice] = useState(() => readChoice(userId));
  const selected = JOURNEY_COMPANIONS.find((item) => item.id === choice) || JOURNEY_COMPANIONS[0];
  const choose = (next) => {
    if (!userId || !JOURNEY_COMPANIONS.some((item) => item.id === next)) return;
    setChoice(next);
    try { window.localStorage.setItem(STORAGE_PREFIX + userId, next); } catch {}
  };
  return { selected, choose };
}

export function Companion({ companion, animated = false, size = "text-4xl", label = true }) {
  return (
    <span
      role="img"
      aria-label={label ? `Your ${companion?.name || "Fox"} companion` : undefined}
      aria-hidden={label ? undefined : true}
      className={`inline-flex select-none items-center justify-center drop-shadow-md ${size} ${animated ? "motion-safe:animate-bounce" : ""}`}
    >
      {companion?.symbol || "🦊"}
    </span>
  );
}

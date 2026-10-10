// Žodis companions preserve the four approved character identities.
// Normal/smiling lesson heads use the original head atlas; Journey maps use
// separate transparent full-body idle art. Walking is intentionally deferred.
import React, { useEffect, useState } from "react";

export const JOURNEY_COMPANIONS = [
  { id: "fox", name: "Fox", row: 0 },
  { id: "wolf", name: "Wolf", row: 1 },
  { id: "forest-fairy-male", name: "Male Forest Fairy", row: 2 },
  { id: "forest-fairy-female", name: "Female Forest Fairy", row: 3 },
];
const STORAGE_PREFIX = "zodis:journey-companion:v1:";
const HEADS = "/assets/journey/approved-heads.webp";
const BODY_IMAGES = {
  fox: "/assets/journey/fox-idle.webp",
  wolf: "/assets/journey/wolf-idle.webp",
  "forest-fairy-male": "/assets/journey/forest-fairy-male-idle.webp",
  "forest-fairy-female": "/assets/journey/forest-fairy-female-idle.webp",
};
function readSavedChoice(userId) {
  try {
    const value = window.localStorage.getItem(STORAGE_PREFIX + userId);
    return JOURNEY_COMPANIONS.some(item => item.id === value) ? value : null;
  } catch { return null; }
}
export function useJourneyCompanion(userId) {
  const [choice, setChoice] = useState(() => userId ? readSavedChoice(userId) : null);
  useEffect(() => { setChoice(userId ? readSavedChoice(userId) : null); }, [userId]);
  const selected = JOURNEY_COMPANIONS.find(item => item.id === choice) || JOURNEY_COMPANIONS[0];
  const choose = (next) => {
    if (!userId || !JOURNEY_COMPANIONS.some(item => item.id === next)) return;
    setChoice(next);
    try { window.localStorage.setItem(STORAGE_PREFIX + userId, next); } catch {}
  };
  return { selected, choose, hasChosen: choice !== null };
}
export function Companion({ companion, celebrating = false, size = "text-4xl", label = true }) {
  const row = companion?.row ?? 0;
  const position = celebrating ? "100%" : "0%";
  return <span role={label ? "img" : undefined}
    aria-label={label ? "Your " + (companion?.name || "Fox") + " companion" : undefined}
    aria-hidden={label ? undefined : true}
    className={"inline-flex select-none items-center justify-center " + size}>
    <span className="z-companion-face" data-face={celebrating ? "smile" : "normal"}
      style={{ backgroundImage: "url(" + HEADS + ")", backgroundPosition: position + " " + (row * 100 / 3) + "%" }} />
  </span>;
}
export function FullBodyCompanion({ companion }) {
  const name = companion?.name || "Fox";
  const src = BODY_IMAGES[companion?.id] || BODY_IMAGES.fox;
  return <img src={src} alt={"Your " + name + " companion"}
    className="z-companion-fullbody" draggable={false} decoding="async" />;
}

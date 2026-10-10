// Žodis character masters: these atlases are CROPS of the four approved
// original concept sheets, never alternative generated character designs.
// Sprite motion is intentionally deferred; map markers jump to earned stops.
import React, { useEffect, useState } from "react";

export const JOURNEY_COMPANIONS = [
  { id: "fox", name: "Fox", row: 0 },
  { id: "wolf", name: "Wolf", row: 1 },
  { id: "forest-fairy-male", name: "Male Forest Fairy", row: 2 },
  { id: "forest-fairy-female", name: "Female Forest Fairy", row: 3 },
];
const STORAGE_PREFIX = "zodis:journey-companion:v1:";
const HEADS = "/assets/journey/approved-heads.webp";
const BODIES = "/assets/journey/approved-fullbody.webp";
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
  const column = companion?.row ?? 0;
  return <span role="img" aria-label={"Your " + (companion?.name || "Fox") + " companion"}
    className="z-companion-fullbody"
    style={{ backgroundImage: "url(" + BODIES + ")", backgroundPosition: (column * 100 / 3) + "% 0%" }} />;
}

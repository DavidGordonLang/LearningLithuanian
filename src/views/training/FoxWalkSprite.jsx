import React from "react";

// Fixed-position visual QA, not full route traversal.
// Mirroring changes the artwork only, never the playback order.
export const FOX_WALK_DIRECTIONS = [
  { value: "up-left", label: "↖ Up-left", atlas: "up-left", mirror: false },
  { value: "up", label: "↑ Away", atlas: "up", mirror: false },
  { value: "up-right", label: "↗ Up-right", atlas: "up-left", mirror: true },
  { value: "left", label: "← Left", atlas: "left", mirror: false },
  { value: "right", label: "→ Right", atlas: "left", mirror: true },
  { value: "down-left", label: "↙ Down-left", atlas: "down-left", mirror: false },
  { value: "down", label: "↓ Toward", atlas: "down", mirror: false },
  { value: "down-right", label: "↘ Down-right", atlas: "down-left", mirror: true },
];

export default function FoxWalkSprite({ frame = 0, facing = "up-left" }) {
  const index = Math.max(0, Math.floor(Number(frame) || 0)) % 8;
  const direction = FOX_WALK_DIRECTIONS.find(x => x.value === facing)
    || FOX_WALK_DIRECTIONS[0];
  const column = index % 4;
  const row = Math.floor(index / 4);
  return <span className="z-gate-fox-walk-probe" aria-hidden="true"
    style={{
      backgroundImage: `url("/assets/journey/fox-walk-${direction.atlas}-fixed-probe.avif")`,
      backgroundPosition: `${column * 100 / 3}% ${row * 100}%`,
      transform: direction.mirror ? "scaleX(-1)" : "none",
    }}/>;
}

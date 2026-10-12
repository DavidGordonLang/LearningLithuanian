import React from "react";

// Visual-only MVP proof. Eight frames in a 4×2 optimized AVIF atlas.
// Flip the ARTWORK for up-right; never reverse frame playback.
export default function FoxWalkSprite({frame = 0, facing = "up-left"}) {
  const index = Math.max(0, Math.floor(Number(frame) || 0)) % 8;
  const column = index % 4;
  const row = Math.floor(index / 4);
  return <span className="z-gate-fox-walk-probe" aria-hidden="true"
    style={{
      backgroundPosition: `${column * 100 / 3}% ${row * 100}%`,
      transform: facing === "up-right" ? "scaleX(-1)" : "none",
    }}/>;
}

// src/views/training/matchPairs/matchPairsStyles.js
export const matchPairsCss = `
.mp-root .mp-title {
  letter-spacing: 0.2px;
}

.mp-progress-track {
  height: 10px;
  border-radius: 999px;
  border: 1px solid rgba(39,39,42,0.9);
  background: rgba(9,9,11,0.35);
  overflow: hidden;
}

.mp-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: rgba(16,185,129,0.75);
  width: 0%;
  transition: width 260ms ease;
}

.mp-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: start;
}

.mp-col {
  display: grid;
  grid-auto-rows: minmax(54px, auto);
  gap: 12px;
}

.mp-tile {
  border-radius: 18px;
  border: 1px solid rgba(39,39,42,0.9);
  background: rgba(9,9,11,0.35);
  padding: 14px 14px;
  min-height: 54px;

  display: flex;
  align-items: center;
  justify-content: center;

  text-align: center;
  font-weight: 650;

  /* no truncation */
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.15;

  transition:
    transform 120ms ease,
    background 160ms ease,
    border-color 160ms ease,
    opacity 220ms ease,
    box-shadow 220ms ease;

  user-select: none;
}

.mp-tile:active {
  transform: scale(0.985);
}

/* Amber select (soft, pale) */
.mp-tile-amber {
  border-color: rgba(251,191,36,0.42);
  background: rgba(251,191,36,0.07);
  box-shadow: 0 0 0 1px rgba(251,191,36,0.08), 0 10px 26px rgba(0,0,0,0.25);
}

.mp-tile-cleared {
  opacity: 0.08;
  border-color: rgba(39,39,42,0.35);
  background: rgba(9,9,11,0.10);
  pointer-events: none;
}

/* Pulses (correct larger than wrong) */
@keyframes mp-green-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.00); border-color: rgba(39,39,42,0.9); }
  35%  { box-shadow: 0 0 0 6px rgba(16,185,129,0.16), 0 0 28px rgba(16,185,129,0.18); border-color: rgba(16,185,129,0.62); }
  70%  { box-shadow: 0 0 0 12px rgba(16,185,129,0.10), 0 0 38px rgba(16,185,129,0.16); border-color: rgba(16,185,129,0.58); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.00); border-color: rgba(39,39,42,0.9); }
}

@keyframes mp-red-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(244,63,94,0.00); border-color: rgba(39,39,42,0.9); }
  40%  { box-shadow: 0 0 0 5px rgba(244,63,94,0.14), 0 0 18px rgba(244,63,94,0.10); border-color: rgba(244,63,94,0.48); }
  100% { box-shadow: 0 0 0 0 rgba(244,63,94,0.00); border-color: rgba(39,39,42,0.9); }
}

.mp-pulse-correct {
  animation: mp-green-pulse 520ms ease;
}

.mp-pulse-wrong {
  animation: mp-red-pulse 420ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .mp-tile:active { transform: none; }
  .mp-pulse-correct, .mp-pulse-wrong { animation: none; }
}

/* Page fades */
.mp-grid-wrap {
  transition: opacity 260ms ease;
}

.mp-grid-fadeout {
  opacity: 0.0;
}

.mp-grid-fadein {
  opacity: 1.0;
}

.mp-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 9999;
}

.mp-modal {
  width: 100%;
  max-width: 420px;
  border-radius: 22px;
  border: 1px solid rgba(39,39,42,0.9);
  background: rgba(9,9,11,0.92);
  padding: 18px;
}

.mp-btn-primary {
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(16,185,129,0.5);
  background: rgba(16,185,129,0.14);
  padding: 12px 14px;
  font-weight: 800;
}

.mp-btn-secondary {
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(39,39,42,0.9);
  background: rgba(9,9,11,0.5);
  padding: 12px 14px;
  font-weight: 800;
}

.mp-btn-ghost {
  width: 100%;
  border-radius: 16px;
  padding: 10px 14px;
  font-weight: 650;
  color: rgba(212,212,216,0.85);
}

`;
// src/views/training/matchPairs/matchPairsStyles.js
export const matchPairsCss = `
.mp-root .mp-title { letter-spacing: 0.2px; }

.mp-progress-track{
  height:10px;border-radius:999px;border:1px solid rgba(39,39,42,0.9);
  background:rgba(9,9,11,0.35);overflow:hidden;
}
.mp-progress-fill{
  height:100%;border-radius:999px;background:rgba(16,185,129,0.75);
  width:0%;transition:width 260ms ease;
}

.mp-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;}
.mp-col{display:grid;grid-auto-rows:minmax(54px,auto);gap:12px;}

.mp-tile{
  border-radius:18px;border:1px solid rgba(39,39,42,0.9);
  background:rgba(9,9,11,0.35);
  padding:14px 14px;min-height:54px;
  display:flex;align-items:center;justify-content:center;
  text-align:center;font-weight:650;
  white-space:normal;overflow-wrap:anywhere;word-break:break-word;line-height:1.15;
  transition:transform 120ms ease, background 160ms ease, border-color 160ms ease, opacity 220ms ease, box-shadow 220ms ease;
  user-select:none;
}
.mp-tile:active{transform:scale(0.985);}

/* Amber select (soft pale) */
.mp-tile-amber{
  border-color:rgba(251,191,36,0.42);
  background:rgba(251,191,36,0.07);
  box-shadow:
    0 0 0 6px rgba(251,191,36,0.10),
    0 0 22px rgba(251,191,36,0.10),
    0 10px 26px rgba(0,0,0,0.25);
}

.mp-tile-cleared{
  opacity:0.08;
  border-color:rgba(39,39,42,0.35);
  background:rgba(9,9,11,0.10);
  pointer-events:none;
}

/**
 * Smooth takeover pulses:
 * - Frame 0 matches amber "peak" (same ring)
 * - Hue shifts into red/green and expands outward
 * - Green expands ~50% further than amber baseline (6px -> ~9px)
 * - Red expands ~25% further than amber baseline (6px -> ~7.5px)
 */
@keyframes mp-green-takeover{
  0%{
    border-color:rgba(251,191,36,0.42);
    box-shadow:
      0 0 0 6px rgba(251,191,36,0.10),
      0 0 22px rgba(251,191,36,0.10);
  }
  35%{
    border-color:rgba(16,185,129,0.62);
    box-shadow:
      0 0 0 7px rgba(16,185,129,0.16),
      0 0 28px rgba(16,185,129,0.16);
  }
  70%{
    border-color:rgba(16,185,129,0.60);
    box-shadow:
      0 0 0 9px rgba(16,185,129,0.11),
      0 0 38px rgba(16,185,129,0.14);
  }
  100%{
    border-color:rgba(39,39,42,0.9);
    box-shadow:0 0 0 0 rgba(0,0,0,0);
  }
}

@keyframes mp-red-takeover{
  0%{
    border-color:rgba(251,191,36,0.42);
    box-shadow:
      0 0 0 6px rgba(251,191,36,0.10),
      0 0 22px rgba(251,191,36,0.10);
  }
  45%{
    border-color:rgba(244,63,94,0.50);
    box-shadow:
      0 0 0 6.8px rgba(244,63,94,0.14),
      0 0 18px rgba(244,63,94,0.10);
  }
  100%{
    border-color:rgba(39,39,42,0.9);
    box-shadow:0 0 0 0 rgba(0,0,0,0);
  }
}

.mp-pulse-correct{
  animation: mp-green-takeover 520ms cubic-bezier(0.18,0.8,0.25,1) both;
}
.mp-pulse-wrong{
  animation: mp-red-takeover 420ms cubic-bezier(0.2,0.75,0.25,1) both;
}

@media (prefers-reduced-motion: reduce){
  .mp-tile:active{transform:none;}
  .mp-pulse-correct,.mp-pulse-wrong{animation:none;}
}

/* Page fades */
.mp-grid-wrap{transition:opacity 260ms ease;}
.mp-grid-fadeout{opacity:0.0;}
.mp-grid-fadein{opacity:1.0;}

/* Modal */
.mp-modal-backdrop{
  position:fixed;inset:0;background:rgba(0,0,0,0.68);
  display:flex;align-items:center;justify-content:center;padding:18px;z-index:9999;
}
.mp-modal{
  width:100%;max-width:420px;border-radius:22px;border:1px solid rgba(39,39,42,0.9);
  background:rgba(9,9,11,0.92);padding:18px;
}
.mp-btn-primary{
  width:100%;border-radius:16px;border:1px solid rgba(16,185,129,0.5);
  background:rgba(16,185,129,0.14);padding:12px 14px;font-weight:800;
}
.mp-btn-secondary{
  width:100%;border-radius:16px;border:1px solid rgba(39,39,42,0.9);
  background:rgba(9,9,11,0.5);padding:12px 14px;font-weight:800;
}
.mp-btn-ghost{
  width:100%;border-radius:16px;padding:10px 14px;font-weight:650;color:rgba(212,212,216,0.85);
}
`;
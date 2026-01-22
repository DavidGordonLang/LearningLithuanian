// src/views/training/MatchPairsView.jsx
import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import { useMatchPairsSession } from "../../hooks/training/useMatchPairsSession";
import { matchPairsCss } from "./matchPairs/matchPairsStyles";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function filterWordsNumbers(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const sheet = (r) => String(r?.Sheet || "");
  return list.filter((r) => {
    const s = sheet(r);
    return s === "Words" || s === "Numbers";
  });
}

// light heuristic: if it's only digits (or digits/spaces), allow slightly larger font;
// if it contains letters, keep default.
// For very long number-words, we still allow wrapping instead of truncation.
function tileTextClass(text) {
  const t = String(text || "").trim();
  if (!t) return "text-base";
  const digitsOnly = /^[0-9\s.,-]+$/.test(t);
  if (digitsOnly) return "text-lg";
  // long-ish words: nudge down slightly to fit better without truncation
  if (t.length >= 18) return "text-sm";
  return "text-base";
}

function DoneModal({ pairs, mistakes, elapsedSec, onAgain, onFinish }) {
  const modal = (
    <div className="mp-modal-backdrop" role="dialog" aria-modal="true">
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-semibold">All pairs matched</div>
        <div className="mt-1 text-sm text-zinc-400">
          {pairs} pairs · {mistakes} mistake{mistakes === 1 ? "" : "s"} · {elapsedSec}s
        </div>

        <div className="mt-5 grid gap-3">
          <button type="button" className="mp-btn-primary" onClick={onAgain}>
            Do another 10
          </button>
          <button type="button" className="mp-btn-secondary" onClick={onFinish}>
            Finish
          </button>
        </div>

        <button type="button" className="mp-btn-ghost mt-3" onClick={onFinish}>
          Back to Training
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default function MatchPairsView({ rows, onBack }) {
  const eligible = useMemo(() => filterWordsNumbers(rows), [rows]);

  const s = useMatchPairsSession({
    eligibleRows: eligible,
    pairCount: 10,
  });

  const pct = s.progress.total
    ? Math.min(100, Math.round((s.progress.done / s.progress.total) * 100))
    : 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-6 mp-root">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button type="button" className="rf-top-btn" onClick={onBack}>
          <span aria-hidden="true">←</span>
          <span>Back</span>
        </button>

        <div className="text-sm text-zinc-400">Match Pairs</div>

        <div className="w-[82px]" aria-hidden="true" />
      </div>

      {/* Title + progress (pinned) */}
      <div className="mt-5">
        <div className="text-xl font-semibold mp-title">Tap the matching pairs</div>
        <div className="mt-3 mp-progress-track">
          <div className="mp-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
          <div>
            {s.progress.done}/{s.progress.total} matched
          </div>
          <div>{s.mistakes} mistake{s.mistakes === 1 ? "" : "s"}</div>
        </div>
      </div>

      {/* Not enough entries */}
      {!s.canStart && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="text-lg font-semibold">Not enough items</div>
          <div className="text-sm text-zinc-300 mt-2">
            Match Pairs uses <b>Words + Numbers</b> only. Add at least <b>10</b> entries to use this
            module.
          </div>
        </div>
      )}

      {/* Grid (scrolls only when needed) */}
      {s.canStart && (
        <div
          className="mt-6"
          style={{
            // Keep header stable; grid scrolls if needed.
            // This is tuned to feel like Duolingo: tight, but readable.
            maxHeight: "calc(100vh - 280px)",
            overflowY: "auto",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
          }}
        >
          <div className="mp-grid">
            {s.tiles.map((t) => {
              const matched = s.matchedPairIds.has(t.pairId);
              const selected = s.selectedId === t.id;
              const mismatched = s.mismatchIds.includes(t.id);

              return (
                <button
                  key={t.id}
                  type="button"
                  className={cn(
                    "mp-tile",
                    tileTextClass(t.text),
                    selected ? "mp-tile-selected" : "",
                    matched ? "mp-tile-matched mp-tile-locked" : "",
                    mismatched ? "mp-tile-mismatch" : ""
                  )}
                  onClick={() => s.tapTile(t.id)}
                  disabled={matched || s.busy}
                  aria-pressed={selected}
                >
                  {t.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {s.showDone && (
        <DoneModal
          pairs={s.progress.total}
          mistakes={s.mistakes}
          elapsedSec={s.elapsedSec}
          onAgain={() => s.runAgain()}
          onFinish={onBack}
        />
      )}

      <style>{matchPairsCss}</style>
    </div>
  );
}

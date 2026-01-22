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

function tileTextClass(text) {
  const t = String(text || "").trim();
  if (!t) return "text-base";
  const digitsOnly = /^[0-9\s.,-]+$/.test(t);
  if (digitsOnly) return "text-lg";
  if (t.length >= 22) return "text-sm";
  return "text-base";
}

function DoneModal({ mistakes, elapsedSec, onAgain, onFinish }) {
  const modal = (
    <div className="mp-modal-backdrop" role="dialog" aria-modal="true">
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-semibold">Session complete</div>
        <div className="mt-1 text-sm text-zinc-400">
          20 pairs · {mistakes} mistake{mistakes === 1 ? "" : "s"} · {elapsedSec}s
        </div>

        <div className="mt-5 grid gap-3">
          <button type="button" className="mp-btn-primary" onClick={onAgain}>
            Do another 20
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
    totalPairs: 20,
    pagePairs: 5,
  });

  const pct = s.progress.total
    ? Math.min(100, Math.round((s.progress.matched / s.progress.total) * 100))
    : 0;

  const gridPhaseClass =
    s.phase === "pageFadeOut"
      ? "mp-grid-fadeout"
      : s.phase === "pageFadeIn"
      ? "mp-grid-fadein"
      : "mp-grid-fadein";

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

      {/* Title + progress */}
      <div className="mt-5">
        <div className="text-xl font-semibold mp-title">Match from left to right</div>
        <div className="mt-1 text-sm text-zinc-400">
          English on the left · Lithuanian on the right
        </div>

        <div className="mt-3 mp-progress-track">
          <div className="mp-progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
          <div>
            {s.progress.matched}/{s.progress.total} matched · Page {s.progress.page}/{s.progress.pages}
          </div>
          <div>{s.mistakes} mistake{s.mistakes === 1 ? "" : "s"}</div>
        </div>
      </div>

      {/* Not enough entries */}
      {!s.canStart && (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="text-lg font-semibold">Not enough items</div>
          <div className="text-sm text-zinc-300 mt-2">
            Match Pairs uses <b>Words + Numbers</b> only and needs <b>20</b> entries to run a full
            session.
          </div>
        </div>
      )}

      {/* Columns (scrolls only when needed) */}
      {s.canStart && (
        <div
          className={cn("mt-6 mp-grid-wrap", gridPhaseClass)}
          style={{
            maxHeight: "calc(100vh - 290px)",
            overflowY: "auto",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
          }}
        >
          <div className="mp-cols">
            {/* LEFT: EN */}
            <div className="mp-col">
              {s.leftTiles.map((t) => {
                const matched = s.matchedPairIds.has(t.pairId);
                const selected = s.selectedLeftId === t.id;
                const mismatched = s.mismatchIds.includes(t.id);

                return (
                  <button
                    key={t.id}
                    type="button"
                    className={cn(
                      "mp-tile",
                      tileTextClass(t.text),
                      selected ? "mp-tile-selected" : "",
                      matched ? "mp-tile-cleared" : "",
                      mismatched ? "mp-tile-mismatch" : ""
                    )}
                    onClick={() => s.tapLeft(t.id)}
                    disabled={matched || s.busy}
                    aria-pressed={selected}
                  >
                    {t.text}
                  </button>
                );
              })}
            </div>

            {/* RIGHT: LT */}
            <div className="mp-col">
              {s.rightTiles.map((t) => {
                const matched = s.matchedPairIds.has(t.pairId);
                const mismatched = s.mismatchIds.includes(t.id);

                return (
                  <button
                    key={t.id}
                    type="button"
                    className={cn(
                      "mp-tile",
                      tileTextClass(t.text),
                      matched ? "mp-tile-cleared" : "",
                      mismatched ? "mp-tile-mismatch" : ""
                    )}
                    onClick={() => s.tapRight(t.id)}
                    disabled={matched || s.busy}
                  >
                    {t.text}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {s.showDone && (
        <DoneModal
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

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

function DoneModal({ mistakes, elapsedSec, wrongPairs, onAgain, onFinish }) {
  const modal = (
    <div className="mp-modal-backdrop" role="dialog" aria-modal="true">
      <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-semibold">Session complete</div>
        <div className="mt-1 text-sm text-zinc-400">
          20 pairs · {mistakes} mistake{mistakes === 1 ? "" : "s"} · {elapsedSec}s
        </div>

        {Array.isArray(wrongPairs) && wrongPairs.length > 0 && (
          <div className="mt-5">
            <div className="text-sm font-semibold">Review mistakes</div>
            <div className="text-xs text-zinc-400 mt-1">
              Correct pairs for anything involved in a mismatch.
            </div>

            <div
              className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3"
              style={{ maxHeight: "38vh", overflowY: "auto" }}
            >
              <div className="grid gap-2">
                {wrongPairs.map((p, i) => (
                  <div
                    key={`${p.en}-${p.lt}-${i}`}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/30 px-3 py-2"
                  >
                    <div className="grid grid-cols-2 gap-3 items-start">
                      <div className="text-sm text-zinc-200 whitespace-pre-wrap break-words">
                        {p.en}
                      </div>
                      <div className="text-sm text-zinc-200 whitespace-pre-wrap break-words text-right">
                        {p.lt}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
    rightSelectAmberMs: 140,
    correctPulseMs: 520,
    wrongPulseMs: 420,
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

  const pulseIds = s.pulse?.ids || [];
  const pulseKind = s.pulse?.kind || null;
  const selectedId = s.selected?.id || null;

  // Tuned: a bit taller than the "collapsed" version, but we CLOSE GAPS hard.
  const TILE_H = 60;
  const COL_GAP = 10;

  const tileStyle = {
    height: TILE_H,
    minHeight: TILE_H,
    padding: "10px 12px",
    margin: 0, // kills any mp-tile margin spacing unless CSS uses !important
  };

  const BackCircle = (
    <button
      type="button"
      data-press
      onClick={onBack}
      className={cn(
        "h-10 w-10 rounded-full border flex items-center justify-center",
        "bg-white/[0.06] border-white/10",
        "shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
        "hover:bg-white/[0.08] active:scale-[0.99] transition"
      )}
      aria-label="Back"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
      </svg>
    </button>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-5 mp-root">
      {/* Header */}
      <div className="grid grid-cols-[44px_1fr_44px] items-center">
        <div className="flex items-center justify-start">{BackCircle}</div>
        <div className="text-center">
          <div className="text-[16px] font-semibold text-zinc-100">Reinforce</div>
        </div>
        <div aria-hidden="true" />
      </div>

      {/* Title + progress */}
      <div className="mt-4">
        <div className="text-[15px] font-semibold mp-title">Match either way</div>
        <div className="mt-1 text-[12px] text-zinc-400">
          Tap a tile, then match it with the opposite side
        </div>

        <div className="mt-3 mp-progress-track">
          <div className="mp-progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
          <div>
            {s.progress.matched}/{s.progress.total} matched · Page {s.progress.page}/{s.progress.pages}
          </div>
          <div>{s.mistakes} mistake{s.mistakes === 1 ? "" : "s"}</div>
        </div>
      </div>

      {!s.canStart && (
        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="text-lg font-semibold">Not enough items</div>
          <div className="text-sm text-zinc-300 mt-2">
            Reinforce uses <b>Words + Numbers</b> only and needs <b>20</b> entries to run a full session.
          </div>
        </div>
      )}

      {s.canStart && (
        <div
          className={cn("mt-4", "mp-grid-wrap", gridPhaseClass)}
          style={{
            height: "calc(100vh - 260px)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
            overflow: "hidden",
          }}
        >
          <div className="mp-cols" style={{ height: "100%", alignItems: "stretch" }}>
            {/* LEFT: EN */}
            <div
              className="mp-col"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: COL_GAP,
              }}
            >
              {s.leftTiles.map((t) => {
                const matched = s.matchedPairIds.has(t.pairId);
                const amber = selectedId === t.id;
                const pulse =
                  pulseIds.includes(t.id) && pulseKind
                    ? pulseKind === "correct"
                      ? "mp-pulse-correct"
                      : "mp-pulse-wrong"
                    : "";

                return (
                  <button
                    key={t.id}
                    type="button"
                    style={tileStyle}
                    className={cn(
                      "mp-tile",
                      tileTextClass(t.text),
                      amber ? "mp-tile-amber" : "",
                      matched ? "mp-tile-cleared" : "",
                      pulse
                    )}
                    onClick={() => s.tap(t.id)}
                    disabled={matched || s.busy}
                    aria-pressed={amber}
                  >
                    {t.text}
                  </button>
                );
              })}
            </div>

            {/* RIGHT: LT */}
            <div
              className="mp-col"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: COL_GAP,
              }}
            >
              {s.rightTiles.map((t) => {
                const matched = s.matchedPairIds.has(t.pairId);
                const amber = selectedId === t.id;
                const pulse =
                  pulseIds.includes(t.id) && pulseKind
                    ? pulseKind === "correct"
                      ? "mp-pulse-correct"
                      : "mp-pulse-wrong"
                    : "";

                return (
                  <button
                    key={t.id}
                    type="button"
                    style={tileStyle}
                    className={cn(
                      "mp-tile",
                      tileTextClass(t.text),
                      amber ? "mp-tile-amber" : "",
                      matched ? "mp-tile-cleared" : "",
                      pulse
                    )}
                    onClick={() => s.tap(t.id)}
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
          wrongPairs={s.wrongPairs}
          onAgain={() => s.runAgain()}
          onFinish={onBack}
        />
      )}

      <style>{matchPairsCss}</style>
    </div>
  );
}
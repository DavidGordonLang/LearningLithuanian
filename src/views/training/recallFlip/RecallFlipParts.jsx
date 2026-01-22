// src/views/training/recallFlip/RecallFlipParts.jsx
import React from "react";
import { createPortal } from "react-dom";

const cn = (...xs) => xs.filter(Boolean).join(" ");

export function ToggleButton({ active, label, sub, onClick }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-2xl border px-3 py-2 text-left transition select-none",
        active
          ? "border-emerald-500/60 bg-emerald-500/10"
          : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950/60"
      )}
      onClick={onClick}
    >
      <div className="text-xs font-semibold">{label}</div>
      <div className="text-[11px] text-zinc-400 mt-0.5">{sub}</div>
    </button>
  );
}

export function AudioButtons({
  canPlayLt,
  audioBusy,
  onPlay,
  onPlaySlow,
  disabledReason,
}) {
  const disabled = !canPlayLt;

  return (
    <div
      className="rf-audio-wrap"
      aria-label="Lithuanian audio controls"
      onClick={(e) => e.stopPropagation()} // don’t flip card when tapping audio
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={cn(
          "rf-audio-btn",
          disabled ? "rf-audio-disabled" : "rf-audio-enabled"
        )}
        disabled={disabled}
        title={disabledReason}
        onClick={() => {
          if (disabled) return;
          onPlay?.();
        }}
      >
        <span className="rf-audio-icon" aria-hidden="true">
          🔊
        </span>
        <span className="text-xs font-semibold">{audioBusy ? "…" : "Play"}</span>
      </button>

      <button
        type="button"
        className={cn(
          "rf-audio-btn",
          disabled ? "rf-audio-disabled" : "rf-audio-enabled"
        )}
        disabled={disabled}
        title={disabledReason}
        onClick={() => {
          if (disabled) return;
          onPlaySlow?.();
        }}
      >
        <span className="rf-audio-icon" aria-hidden="true">
          🐢
        </span>
        <span className="text-xs font-semibold">{audioBusy ? "…" : "Slow"}</span>
      </button>
    </div>
  );
}

export function SummaryModal({
  title,
  subtitle,
  right,
  close,
  wrong,
  labels,
  canReview,
  onReview,
  onAgain,
  onFinish,
}) {
  const rightLabel = String(labels?.right || "Right");
  const closeLabel = String(labels?.close || "Close");
  const wrongLabel = String(labels?.wrong || "Wrong");

  const modal = (
    <div className="rf-modal-backdrop" role="dialog" aria-modal="true">
      <div className="rf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-semibold">{title}</div>
        <div className="mt-1 text-sm text-zinc-400">{subtitle}</div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatPill label={rightLabel} value={right} />
          <StatPill label={closeLabel} value={close} />
          <StatPill label={wrongLabel} value={wrong} />
        </div>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            className={cn(
              "rf-primary-btn",
              !canReview ? "opacity-50 cursor-not-allowed" : ""
            )}
            onClick={() => {
              if (!canReview) return;
              onReview?.();
            }}
            disabled={!canReview}
          >
            Review mistakes
          </button>

          <button
            type="button"
            className="rf-secondary-btn"
            onClick={() => onAgain?.()}
          >
            Let’s do another 10
          </button>

          <button type="button" className="rf-ghost-btn" onClick={() => onFinish?.()}>
            Finish
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-3 text-center">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

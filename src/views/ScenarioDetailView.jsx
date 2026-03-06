// src/views/ScenarioDetailView.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import { useScenarioStore } from "../stores/scenarioStore";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function EmptyState({ onBack }) {
  return (
    <section
      className={cn(
        "z-card",
        "p-5 sm:p-6",
        "min-h-[240px]",
        "flex flex-col items-center justify-center text-center",
        "bg-[radial-gradient(120%_140%_at_50%_0%,rgba(16,185,129,0.10),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)]"
      )}
    >
      <div className="max-w-sm space-y-3">
        <div className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-zinc-100">
          Scenario not found
        </div>

        <p className="text-sm sm:text-[15px] leading-relaxed text-zinc-400">
          This scenario may have been deleted or is no longer available.
        </p>

        <div className="pt-2">
          <button
            type="button"
            data-press
            className="
              z-btn px-5 py-3 rounded-2xl
              bg-emerald-600/90 hover:bg-emerald-500
              border border-emerald-300/20
              text-black font-semibold
            "
            onClick={onBack}
          >
            Back to scenarios
          </button>
        </div>
      </div>
    </section>
  );
}

function PlayButton({ text, playText }) {
  const timerRef = useRef(0);
  const longFiredRef = useRef(false);
  const [pressing, setPressing] = useState(false);

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = 0;
  };

  const start = (e) => {
    if (e?.button != null && e.button !== 0) return;

    try {
      if (e?.currentTarget?.setPointerCapture && e?.pointerId != null) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    } catch {}

    longFiredRef.current = false;
    setPressing(true);
    clearTimer();

    timerRef.current = window.setTimeout(() => {
      longFiredRef.current = true;
      playText?.(text || "", { slow: true });
    }, 420);
  };

  const finish = (e) => {
    try {
      if (e?.currentTarget?.releasePointerCapture && e?.pointerId != null) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    setPressing(false);
    clearTimer();
  };

  const handleClick = (e) => {
    e.stopPropagation();

    if (longFiredRef.current) {
      longFiredRef.current = false;
      return;
    }

    playText?.(text || "");
  };

  return (
    <button
      type="button"
      aria-label="Play phrase"
      data-swipe-block="true"
      className={cn(
        "select-none",
        "w-11 h-11 rounded-full shrink-0",
        "border border-emerald-300/20",
        "bg-emerald-900/20 hover:bg-emerald-900/30",
        "flex items-center justify-center",
        "shadow-[0_0_0_1px_rgba(16,185,129,0.10),0_0_22px_rgba(16,185,129,0.10),0_12px_30px_rgba(0,0,0,0.45)]",
        "transition-transform duration-150",
        pressing ? "scale-[0.98]" : null
      )}
      onPointerDown={start}
      onPointerUp={finish}
      onPointerCancel={finish}
      onPointerLeave={finish}
      onClick={handleClick}
    >
      <span className="text-emerald-200 text-base">▶</span>
    </button>
  );
}

function RowMenuButton() {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/[0.04]">
      <span className="relative w-[3px] h-[3px] rounded-full bg-zinc-300">
        <span className="absolute -top-[7px] left-0 w-[3px] h-[3px] rounded-full bg-zinc-300" />
        <span className="absolute top-[7px] left-0 w-[3px] h-[3px] rounded-full bg-zinc-300" />
      </span>
    </span>
  );
}

function DragHandleVisual() {
  return (
    <div
      className="
        w-8 h-11 rounded-xl shrink-0
        flex items-center justify-center
        text-zinc-500
      "
      aria-hidden="true"
    >
      <span className="inline-flex flex-col gap-[3px]">
        <span className="block w-1 h-1 rounded-full bg-current" />
        <span className="block w-1 h-1 rounded-full bg-current" />
        <span className="block w-1 h-1 rounded-full bg-current" />
        <span className="block w-1 h-1 rounded-full bg-current" />
      </span>
    </div>
  );
}

function ScenarioPhraseRow({
  scenarioId,
  row,
  rowIndex,
  totalRows,
  playText,
  phoneticsMode,
  showToast,
  onOpenPhraseInLibrary,
}) {
  const removePhraseFromScenario = useScenarioStore((s) => s.removePhraseFromScenario);
  const reorderPhraseInScenario = useScenarioStore((s) => s.reorderPhraseInScenario);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onDoc = (e) => {
      const btn = menuBtnRef.current;
      const menu = menuRef.current;

      if (btn && btn.contains(e.target)) return;
      if (menu && menu.contains(e.target)) return;

      setMenuOpen(false);
    };

    document.addEventListener("click", onDoc, true);
    document.addEventListener("touchstart", onDoc, true);

    return () => {
      document.removeEventListener("click", onDoc, true);
      document.removeEventListener("touchstart", onDoc, true);
    };
  }, [menuOpen]);

  const rowId = row?.id || row?._id;

  const displayedPhonetic =
    phoneticsMode === "ipa"
      ? String(row?.PhoneticIPA || row?.Phonetic || "").trim()
      : String(row?.Phonetic || "").trim();

  function handleMoveUp() {
    const result = reorderPhraseInScenario(scenarioId, rowIndex, rowIndex - 1);
    if (!result?.ok) {
      alert(result?.error || "Could not move phrase.");
      return;
    }
    setMenuOpen(false);
    showToast?.("Moved up");
  }

  function handleMoveDown() {
    const result = reorderPhraseInScenario(scenarioId, rowIndex, rowIndex + 1);
    if (!result?.ok) {
      alert(result?.error || "Could not move phrase.");
      return;
    }
    setMenuOpen(false);
    showToast?.("Moved down");
  }

  return (
    <div className="z-inset p-4 flex items-start gap-3">
      <DragHandleVisual />

      <PlayButton text={row?.Lithuanian || ""} playText={playText} />

      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold text-emerald-200 leading-snug break-words">
          {row?.Lithuanian || "—"}
        </div>

        <div className="text-sm text-zinc-300 mt-1 leading-snug break-words">
          {row?.English || "—"}
        </div>

        {displayedPhonetic ? (
          <div className="text-xs text-zinc-500 mt-1 italic leading-snug break-words">
            {displayedPhonetic}
          </div>
        ) : null}
      </div>

      <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          ref={menuBtnRef}
          type="button"
          data-press
          className="select-none"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          aria-label="Phrase actions"
        >
          <RowMenuButton />
        </button>

        {menuOpen ? (
          <div
            ref={menuRef}
            className="
              absolute right-0 mt-2 w-52
              z-[40]
              rounded-2xl border border-white/10
              bg-zinc-950/85 backdrop-blur
              shadow-[0_16px_50px_rgba(0,0,0,0.65)]
              overflow-hidden
            "
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={cn(
                "w-full text-left px-4 py-3 text-sm",
                rowIndex === 0
                  ? "text-zinc-600"
                  : "text-zinc-100 hover:bg-white/5"
              )}
              onClick={handleMoveUp}
              disabled={rowIndex === 0}
            >
              Move up
            </button>

            <button
              type="button"
              className={cn(
                "w-full text-left px-4 py-3 text-sm",
                rowIndex === totalRows - 1
                  ? "text-zinc-600"
                  : "text-zinc-100 hover:bg-white/5"
              )}
              onClick={handleMoveDown}
              disabled={rowIndex === totalRows - 1}
            >
              Move down
            </button>

            <button
              type="button"
              className="w-full text-left px-4 py-3 text-sm text-zinc-100 hover:bg-white/5"
              onClick={() => {
                setMenuOpen(false);
                onOpenPhraseInLibrary?.(rowId);
              }}
            >
              Open in library
            </button>

            <button
              type="button"
              className="w-full text-left px-4 py-3 text-sm text-rose-300 hover:bg-rose-500/10"
              onClick={() => {
                setMenuOpen(false);
                const result = removePhraseFromScenario(scenarioId, rowId);
                if (!result?.ok) {
                  alert(result?.error || "Could not remove phrase from scenario.");
                  return;
                }
                showToast?.("Removed from scenario");
              }}
            >
              Remove from scenario
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ScenarioDetailView({
  scenario,
  rows,
  playText,
  onBack,
  onOpenPhraseInLibrary,
  showToast,
}) {
  const phoneticsMode = useSettingsStore((s) => s.data?.phoneticsMode || "en");

  const linkedRows = useMemo(() => {
    if (!scenario) return [];

    const phraseIds = Array.isArray(scenario.phraseIds) ? scenario.phraseIds : [];
    const allRows = Array.isArray(rows) ? rows : [];

    return phraseIds
      .map((id) => allRows.find((r) => (r?.id || r?._id) === id))
      .filter(Boolean);
  }, [scenario, rows]);

  if (!scenario) {
    return <EmptyState onBack={onBack} />;
  }

  return (
    <div className="pb-28 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          data-press
          className="z-btn z-btn-secondary px-4 py-2 rounded-2xl text-sm"
          onClick={onBack}
        >
          ← Back
        </button>
      </div>

      <div className="space-y-1">
        <h2 className="z-title">{scenario.title || "Untitled scenario"}</h2>
        <p className="z-subtitle">Curated phrases for one real-life situation.</p>
      </div>

      <section
        className={cn(
          "z-card",
          "p-5 sm:p-6",
          "space-y-4",
          "bg-[radial-gradient(120%_140%_at_50%_0%,rgba(16,185,129,0.10),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)]"
        )}
      >
        <div>
          <div className="text-sm font-semibold text-zinc-100">Scenario phrases</div>
          <div className="text-xs text-zinc-500 mt-1">
            Reordering is available from the row menu.
          </div>
        </div>

        {linkedRows.length === 0 ? (
          <div className="z-inset p-5 text-center">
            <div className="text-sm font-semibold text-zinc-200">
              No phrases in this scenario yet
            </div>
            <div className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Add phrases from translation or library.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {linkedRows.map((row, index) => {
              const rowId = row?.id || row?._id;

              return (
                <ScenarioPhraseRow
                  key={rowId}
                  scenarioId={scenario.id}
                  row={row}
                  rowIndex={index}
                  totalRows={linkedRows.length}
                  playText={playText}
                  phoneticsMode={phoneticsMode}
                  showToast={showToast}
                  onOpenPhraseInLibrary={onOpenPhraseInLibrary}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
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

function DragHandle({ onPointerDown, dragging }) {
  return (
    <button
      type="button"
      aria-label="Reorder phrase"
      data-swipe-block="true"
      className={cn(
        "shrink-0 select-none touch-none",
        "w-8 h-11 rounded-xl",
        "flex items-center justify-center",
        "text-zinc-500 hover:text-zinc-200",
        dragging ? "text-emerald-300" : null
      )}
      onPointerDown={onPointerDown}
    >
      <span className="inline-flex flex-col gap-[3px]">
        <span className="block w-1 h-1 rounded-full bg-current" />
        <span className="block w-1 h-1 rounded-full bg-current" />
        <span className="block w-1 h-1 rounded-full bg-current" />
        <span className="block w-1 h-1 rounded-full bg-current" />
      </span>
    </button>
  );
}

function ScenarioPhraseRow({
  scenarioId,
  row,
  rowIndex,
  playText,
  phoneticsMode,
  showToast,
  onOpenPhraseInLibrary,
  registerRowRef,
  isDragging,
  dragOver,
  onDragStart,
}) {
  const removePhraseFromScenario = useScenarioStore((s) => s.removePhraseFromScenario);

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

  return (
    <div className="space-y-2">
      {dragOver ? (
        <div className="h-[2px] rounded-full bg-emerald-400/70 shadow-[0_0_12px_rgba(52,211,153,0.45)]" />
      ) : null}

      <div
        ref={(el) => registerRowRef(rowIndex, el)}
        className={cn(
          "z-inset p-4 flex items-start gap-3 transition-all",
          isDragging
            ? "opacity-70 scale-[0.985] ring-1 ring-emerald-400/30"
            : null
        )}
      >
        <DragHandle
          dragging={isDragging}
          onPointerDown={(e) => onDragStart?.(e, rowIndex)}
        />

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
  const reorderPhraseInScenario = useScenarioStore((s) => s.reorderPhraseInScenario);

  const rowRefs = useRef([]);
  const dragRef = useRef({
    active: false,
    fromIndex: -1,
    toIndex: -1,
    pointerId: null,
  });

  const [dragState, setDragState] = useState({
    active: false,
    fromIndex: -1,
    toIndex: -1,
  });

  const linkedRows = useMemo(() => {
    if (!scenario) return [];

    const phraseIds = Array.isArray(scenario.phraseIds) ? scenario.phraseIds : [];
    const allRows = Array.isArray(rows) ? rows : [];

    return phraseIds
      .map((id) => allRows.find((r) => (r?.id || r?._id) === id))
      .filter(Boolean);
  }, [scenario, rows]);

  useEffect(() => {
    return () => {
      dragRef.current = {
        active: false,
        fromIndex: -1,
        toIndex: -1,
        pointerId: null,
      };
    };
  }, []);

  const registerRowRef = useCallback((index, el) => {
    rowRefs.current[index] = el;
  }, []);

  const getTargetIndexFromPointer = useCallback(
    (clientY) => {
      const items = rowRefs.current;
      if (!Array.isArray(items) || !items.length) return -1;

      for (let i = 0; i < items.length; i += 1) {
        const el = items[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        if (clientY < midpoint) return i;
      }

      return items.length - 1;
    },
    []
  );

  useEffect(() => {
    const onPointerMove = (e) => {
      if (!dragRef.current.active) return;
      if (
        dragRef.current.pointerId != null &&
        e.pointerId != null &&
        dragRef.current.pointerId !== e.pointerId
      ) {
        return;
      }

      e.preventDefault();

      const nextIndex = getTargetIndexFromPointer(e.clientY);
      if (nextIndex < 0) return;

      dragRef.current.toIndex = nextIndex;
      setDragState((prev) => ({
        ...prev,
        toIndex: nextIndex,
      }));
    };

    const endDrag = () => {
      if (!dragRef.current.active) return;

      const fromIndex = dragRef.current.fromIndex;
      const toIndex = dragRef.current.toIndex;

      dragRef.current = {
        active: false,
        fromIndex: -1,
        toIndex: -1,
        pointerId: null,
      };

      setDragState({
        active: false,
        fromIndex: -1,
        toIndex: -1,
      });

      if (!scenario?.id) return;
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

      const result = reorderPhraseInScenario(scenario.id, fromIndex, toIndex);
      if (!result?.ok) {
        alert(result?.error || "Could not reorder phrases.");
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [getTargetIndexFromPointer, reorderPhraseInScenario, scenario?.id]);

  const handleDragStart = useCallback(
    (e, rowIndex) => {
      if (!scenario?.id) return;

      e.preventDefault();
      e.stopPropagation();

      try {
        if (e.currentTarget?.setPointerCapture && e.pointerId != null) {
          e.currentTarget.setPointerCapture(e.pointerId);
        }
      } catch {}

      dragRef.current = {
        active: true,
        fromIndex: rowIndex,
        toIndex: rowIndex,
        pointerId: e.pointerId ?? null,
      };

      setDragState({
        active: true,
        fromIndex: rowIndex,
        toIndex: rowIndex,
      });
    },
    [scenario?.id]
  );

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
            Drag the handle to reorder phrases.
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
              const isDragging =
                dragState.active && dragState.fromIndex === index;
              const dragOver =
                dragState.active &&
                dragState.toIndex === index &&
                dragState.fromIndex !== index;

              return (
                <ScenarioPhraseRow
                  key={rowId}
                  scenarioId={scenario.id}
                  row={row}
                  rowIndex={index}
                  playText={playText}
                  phoneticsMode={phoneticsMode}
                  showToast={showToast}
                  onOpenPhraseInLibrary={onOpenPhraseInLibrary}
                  registerRowRef={registerRowRef}
                  isDragging={isDragging}
                  dragOver={dragOver}
                  onDragStart={handleDragStart}
                />
              );
            })}
          </div>
        )}

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            type="button"
            data-press
            className="
              z-btn px-4 py-2 rounded-2xl text-sm font-semibold
              bg-emerald-600/90 hover:bg-emerald-500
              border border-emerald-300/20
              text-black
            "
            onClick={() => showToast?.("Add phrases to scenario is next")}
          >
            Add phrases
          </button>
        </div>
      </section>
    </div>
  );
}
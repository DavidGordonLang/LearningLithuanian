// src/views/DuplicateScannerView.jsx
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function DuplicateScannerView({
  T,
  rows,
  removePhrase,
  onBack,
}) {
  const toastRoot =
    typeof document !== "undefined"
      ? document.getElementById("toast-root")
      : null;

  const [groups, setGroups] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Skip + exit
  const [skipped, setSkipped] = useState({});
  const [exitingGroups, setExitingGroups] = useState({});

  // Single Undo memory
  const undoRef = useRef(null);

  // Toast
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  /* ============================================================
     Toast Helpers (Portal)
     ============================================================ */
  function showToast({ message, onUndo, durationMs }) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setToast({ message, onUndo });

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, durationMs ?? 2000);
  }

  function handleToastUndo() {
    if (toast?.onUndo) toast.onUndo();
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastRefNull();
    setToast(null);
  }

  function toastRefNull() {
    undoRef.current = null;
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  /* ============================================================
     Duplicate scan
     ============================================================ */
  function scanDuplicates() {
    setIsScanning(true);

    const map = new Map();

    for (const r of rows) {
      const en = (r.English || "").trim().toLowerCase();
      const lt = (r.Lithuanian || "").trim().toLowerCase();
      if (!en && !lt) continue;
      const key = `${en}||${lt}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }

    const groupsOut = [];
    for (const [key, items] of map.entries()) {
      if (items.length > 1) groupsOut.push({ key, items });
    }

    setGroups(groupsOut);
    setSkipped({});
    setExitingGroups({});
    undoRef.current = null;
    setHasScanned(true);
    setIsScanning(false);
  }

  /* ============================================================
     Delete + Undo (with group-index restore)
     ============================================================ */
  function performDelete(item, groupKey, itemIndex) {
    const groupIndex = groups.findIndex((g) => g.key === groupKey);

    // Save undo snapshot
    undoRef.current = {
      item,
      groupKey,
      itemIndex,
      groupIndex,
    };

    removePhrase(item._id);

    setGroups((prev) => {
      const updated = prev.map((g) => {
        if (g.key !== groupKey) return g;
        const items = g.items.filter((_, i) => i !== itemIndex);
        return { ...g, items };
      });

      const targetGroup = updated.find((g) => g.key === groupKey);

      if (targetGroup && targetGroup.items.length <= 1) {
        setExitingGroups((pr) => ({ ...pr, [groupKey]: true }));

        setTimeout(() => {
          setGroups((current) => current.filter((g) => g.key !== groupKey));
          setExitingGroups((pr) => {
            const next = { ...pr };
            delete next[groupKey];
            return next;
          });
          setSkipped((pr) => {
            const next = { ...pr };
            delete next[groupKey];
            return next;
          });
        }, 300);
      }

      return updated;
    });

    showToast({
      message: `Deleted “${item.English || "—"} / ${item.Lithuanian || "—"}”`,
      durationMs: 3000,
      onUndo: restoreLastDelete,
    });
  }

  /* ============================================================
     Undo Restore (Item + Group Index Exact Restore)
     ============================================================ */
  function restoreLastDelete() {
  const undo = undoRef.current;
  if (!undo) return;

  const { item, groupKey, itemIndex, groupIndex } = undo;

  // restore globally
  window.dispatchEvent(
    new CustomEvent("restorePhrase", { detail: { item } })
  );

  setGroups((prev) => {
    let group = prev.find((g) => g.key === groupKey);
    let newGroups = [...prev];

    // 1) Ensure the group slot exists
    if (!group) {
      group = { key: groupKey, items: [] };
      newGroups.splice(groupIndex, 0, group);
    }

    // 2) Restore the item inside the group
    const items = [...group.items];
    const insertPos = Math.min(itemIndex, items.length);
    items.splice(insertPos, 0, item);

    // 3) Completely rebuild and reinsert the group
    const updatedGroup = { ...group, items };

    newGroups = newGroups.filter((g) => g.key !== groupKey);
    newGroups.splice(groupIndex, 0, updatedGroup);

    return newGroups;
  });

  // 4) Clear skip/exiting if present
  setSkipped((pr) => {
    if (!pr[groupKey]) return pr;
    const next = { ...pr };
    delete next[groupKey];
    return next;
  });

  setExitingGroups((pr) => {
    if (!pr[groupKey]) return pr;
    const next = { ...pr };
    delete next[groupKey];
    return next;
  });

  // clear undo memory
  undoRef.current = null;
}
  /* ============================================================
     Skip group + Undo
     ============================================================ */
  function skipGroup(groupKey) {
    const group = groups.find((g) => g.key === groupKey);
    const count = group.items.length;

    setSkipped((pr) => ({ ...pr, [groupKey]: count }));

    showToast({
      message: `Skipped group (${count} item${count > 1 ? "s" : ""})`,
      durationMs: 2000,
      onUndo: () =>
        setSkipped((pr) => {
          const next = { ...pr };
          delete next[groupKey];
          return next;
        }),
    });
  }

  /* ============================================================
     Swipeable row — distance-only, stable
     ============================================================ */
  function SwipeableDuplicateItem({ item, T, onDelete }) {
    const ref = useRef(null);
    const startX = useRef(0);
    const lastX = useRef(0);
    const draggingRef = useRef(false);

    const [translateX, setTranslateX] = useState(0);
    const [isFading, setIsFading] = useState(false);

    function pointerDown(e) {
      draggingRef.current = true;
      startX.current = e.clientX;
      lastX.current = e.clientX;

      if (ref.current?.setPointerCapture) {
        try {
          ref.current.setPointerCapture(e.pointerId);
        } catch {}
      }
    }

    function pointerMove(e) {
      if (!draggingRef.current) return;

      const dx = e.clientX - startX.current;
      lastX.current = e.clientX;

      const width = ref.current?.offsetWidth || 300;
      const max = width * 1.2;

      setTranslateX(Math.max(-max, Math.min(max, dx)));
    }

    function pointerEnd(e) {
      if (!draggingRef.current) return;
      draggingRef.current = false;

      const dx = lastX.current - startX.current;
      const width = ref.current?.offsetWidth || 300;
      const threshold = width * 0.25;

      if (Math.abs(dx) >= threshold) {
        // delete
        const dir = dx > 0 ? 1 : -1;
        setIsFading(true);
        setTranslateX(dir * width * 1.2);
        setTimeout(() => onDelete(), 400);
      } else {
        // restore
        setTranslateX(0);
      }
    }

    const absX = Math.abs(translateX);

    return (
      <div className="relative overflow-hidden rounded-lg border border-zinc-800">
        {/* Delete track */}
        <div
          className="absolute inset-0 bg-zinc-800 flex items-center justify-center"
          style={{
            opacity:
              isFading || absX > 10 ? 0.4 + Math.min(absX / 300, 0.6) : 0,
            transition: "opacity 0.25s ease",
          }}
        >
          <span
            className="text-red-500 text-sm font-semibold"
            style={{
              opacity: isFading ? 1 : 0,
              transform: isFading
                ? "translateY(0px)"
                : "translateY(6px)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            Deleting…
          </span>
        </div>

        {/* Foreground card */}
        <article
          ref={ref}
          className="relative z-10 bg-zinc-950 p-3 touch-pan-y"
          style={{
            transform: `translateX(${translateX}px) scale(${
              isFading ? 0.96 : 1
            })`,
            opacity: isFading ? 0 : 1,
            filter: isFading ? "blur(4px)" : "blur(0px)",
            transition: isFading
              ? "transform 0.4s ease, opacity 0.4s ease, filter 0.4s ease"
              : "transform 0.18s ease-out",
          }}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerEnd}
          onPointerCancel={pointerEnd}
        >
          <div className="text-sm font-semibold truncate">
            {item.English || "—"}
          </div>
          <div className="text-sm text-emerald-300 truncate">
            {item.Lithuanian || "—"}
          </div>
          {item.Phonetic && (
            <div className="text-[11px] text-zinc-400 italic truncate">
              {item.Phonetic}
            </div>
          )}
          {(item.Usage || item.Notes) && (
            <div className="mt-1 text-[11px] text-zinc-300 space-y-1">
              {item.Usage && (
                <div>
                  <span className="text-zinc-500">{T.usage}: </span>
                  {item.Usage}
                </div>
              )}
              {item.Notes && (
                <div>
                  <span className="text-zinc-500">{T.notes}: </span>
                  {item.Notes}
                </div>
              )}
            </div>
          )}
        </article>
      </div>
    );
  }

  /* ============================================================
     Group Section — stable, fade-out only
     ============================================================ */
  function DuplicateGroupSection({
    group,
    index,
    isSkipped,
    skippedCount,
    onSkip,
    onUndoSkip,
    onDeleteItem,
    isExiting,
  }) {
    const style = {
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? "scale(0.98)" : "scale(1)",
      transition: "opacity 0.3s ease, transform 0.3s ease",
    };

    if (isSkipped) {
      const count = skippedCount ?? group.items.length;
      return (
        <section
          style={style}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="text-sm text-zinc-300">
            Group {index + 1} —{" "}
            <span className="font-semibold">skipped</span> ({count}{" "}
            item{count > 1 ? "s" : ""})
          </div>
          <button
            className="text-xs px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700"
            onClick={onUndoSkip}
          >
            Undo skip
          </button>
        </section>
      );
    }

    if (group.items.length <= 1) {
      return (
        <section
          style={style}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-500 italic"
        >
          Group resolved.
        </section>
      );
    }

    return (
      <section
        style={style}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">
            Group {index + 1} • {group.items.length} items
          </div>
          <button
            className="text-xs px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700"
            onClick={onSkip}
          >
            Skip group
          </button>
        </div>

        <div className="space-y-2">
          {group.items.map((item, itemIdx) => (
            <SwipeableDuplicateItem
              key={item._id}
              item={item}
              T={T}
              onDelete={() => onDeleteItem(item, group.key, itemIdx)}
            />
          ))}
        </div>
      </section>
    );
  }

  /* ============================================================
     Render
     ============================================================ */
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-28 relative">
      {/* Toast Portal */}
      {toast &&
        toastRoot &&
        createPortal(
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-zinc-100 px-4 py-2 rounded-lg shadow-lg z-[9999] flex items-center gap-3">
            <span className="text-sm">{toast.message}</span>
            {toast.onUndo && (
              <button
                className="text-emerald-400 text-sm font-semibold"
                onClick={handleToastUndo}
              >
                Undo
              </button>
            )}
          </div>,
          toastRoot
        )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4 mt-2">
        <button
          type="button"
          className="px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm"
          onClick={onBack}
        >
          ← Back to settings
        </button>

        <button
          type="button"
          className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-black text-sm font-semibold"
          onClick={scanDuplicates}
          disabled={isScanning}
        >
          {isScanning ? "Scanning…" : "Scan for duplicates"}
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-1">Duplicate scanner</h2>
      <p className="text-sm text-zinc-400 mb-4">
        Finds exact duplicates where{" "}
        <span className="font-semibold">{T.english}</span> and{" "}
        <span className="font-semibold">{T.lithuanian}</span> match.
      </p>

      {hasScanned && (
        <div className="mb-4 text-sm text-zinc-300">
          {groups.length === 0
            ? "No duplicates found."
            : `Found ${groups.filter((g) => g.items.length > 1).length} active groups.`}
        </div>
      )}

      {/* Groups */}
      <div className="space-y-4 mt-4">
        {groups.map((g, idx) => (
          <DuplicateGroupSection
            key={g.key}
            group={g}
            index={idx}
            isSkipped={!!skipped[g.key]}
            skippedCount={skipped[g.key]}
            onSkip={() => skipGroup(g.key)}
            onUndoSkip={() =>
              setSkipped((pr) => {
                const next = { ...pr };
                delete next[g.key];
                return next;
              })
            }
            onDeleteItem={performDelete}
            isExiting={!!exitingGroups[g.key]}
          />
        ))}
      </div>
    </div>
  );
}

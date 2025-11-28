// src/views/DuplicateScannerView.jsx
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function DuplicateScannerView({ T, rows, removePhrase, onBack }) {
  const toastRoot =
    typeof document !== "undefined"
      ? document.getElementById("toast-root")
      : null;

  // All duplicate groups: [{ key, items: [row,row,...] }]
  const [groups, setGroups] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Single undo snapshot: either a delete or a skipped group
  const undoRef = useRef(null);

  // Toast state
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  /* ============================================================
     Toast helpers
     ============================================================ */
  function showToast({ message, durationMs = 2000 }) {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, durationMs);
  }

  function showUndoToast(message) {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, undo: true });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      // if user does nothing, we just forget the undo ref
      undoRef.current = null;
    }, 3000);
  }

  function handleToastUndo() {
    if (!undoRef.current) {
      setToast(null);
      return;
    }

    const snapshot = undoRef.current;
    undoRef.current = null;
    setToast(null);

    if (snapshot.type === "delete") {
      const { item, groupKey, itemIndex, groupIndex } = snapshot;

      // Restore globally (if app listens for this)
      window.dispatchEvent(
        new CustomEvent("restorePhrase", { detail: { item } })
      );

      // Restore into local groups
      setGroups((prev) => {
        const next = [...prev];
        let gIndex = next.findIndex((g) => g.key === groupKey);

        if (gIndex === -1) {
          // Recreate group shell at its original index
          const insertIndex = Math.min(groupIndex, Math.max(next.length, 0));
          next.splice(insertIndex, 0, { key: groupKey, items: [] });
          gIndex = insertIndex;
        }

        const group = next[gIndex];
        const items = group.items ? [...group.items] : [];
        const pos = Math.min(itemIndex, items.length);
        items.splice(pos, 0, item);
        next[gIndex] = { ...group, items };
        return next;
      });
    } else if (snapshot.type === "skip") {
      const { group, groupIndex } = snapshot;
      setGroups((prev) => {
        const next = [...prev];
        const insertIndex = Math.min(groupIndex, next.length);
        next.splice(insertIndex, 0, group);
        return next;
      });
    }
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  /* ============================================================
     Scan duplicates
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

    const out = [];
    for (const [key, items] of map.entries()) {
      if (items.length > 1) out.push({ key, items });
    }

    setGroups(out);
    undoRef.current = null;
    setHasScanned(true);
    setIsScanning(false);
  }

  /* ============================================================
     Delete + Skip handlers
     ============================================================ */
  function handleDelete(item, groupKey, itemIndex) {
    const groupIndex = groups.findIndex((g) => g.key === groupKey);
    if (groupIndex === -1) return;

    // Snapshot for undo
    undoRef.current = {
      type: "delete",
      item,
      groupKey,
      itemIndex,
      groupIndex,
    };

    // Remove globally
    removePhrase(item._id);

    // Update local groups
    setGroups((prev) => {
      const next = [...prev];
      const gIndex = next.findIndex((g) => g.key === groupKey);
      if (gIndex === -1) return prev;
      const group = next[gIndex];
      const items = group.items.filter((_, i) => i !== itemIndex);

      if (items.length > 1) {
        next[gIndex] = { ...group, items };
      } else {
        // Group no longer a duplicate set -> remove from list
        next.splice(gIndex, 1);
      }
      return next;
    });

    showUndoToast(
      `Deleted “${item.English || "—"} / ${item.Lithuanian || "—"}”`
    );
  }

  function handleSkipGroup(groupKey) {
    const idx = groups.findIndex((g) => g.key === groupKey);
    if (idx === -1) return;

    const group = groups[idx];

    // Snapshot for undo
    undoRef.current = {
      type: "skip",
      group,
      groupIndex: idx,
    };

    setGroups((prev) => prev.filter((g) => g.key !== groupKey));

    showUndoToast(
      `Skipped group (${group.items.length} item${
        group.items.length > 1 ? "s" : ""
      } kept)`
    );
  }

  /* ============================================================
     Swipeable item
     ============================================================ */
  function SwipeableDuplicateItem({ item, T, onDelete }) {
    const ref = useRef(null);
    const startX = useRef(0);
    const lastX = useRef(0);
    const draggingRef = useRef(false);

    const [translateX, setTranslateX] = useState(0);
    const [isFading, setIsFading] = useState(false);

    function onPointerDown(e) {
      draggingRef.current = true;
      startX.current = e.clientX;
      lastX.current = e.clientX;

      if (ref.current?.setPointerCapture) {
        try {
          ref.current.setPointerCapture(e.pointerId);
        } catch {}
      }
    }

    function onPointerMove(e) {
      if (!draggingRef.current) return;
      const dx = e.clientX - startX.current;
      lastX.current = e.clientX;

      const width = ref.current?.offsetWidth || 300;
      const limit = width * 1.2;
      const clamped = Math.max(-limit, Math.min(limit, dx));
      setTranslateX(clamped);
    }

    function onPointerEnd(e) {
      if (!draggingRef.current) return;
      draggingRef.current = false;

      if (ref.current?.releasePointerCapture) {
        try {
          ref.current.releasePointerCapture(e.pointerId);
        } catch {}
      }

      const dx = lastX.current - startX.current;
      const width = ref.current?.offsetWidth || 300;
      const threshold = width * 0.25; // medium sensitivity

      if (Math.abs(dx) >= threshold) {
        const dir = dx > 0 ? 1 : -1;
        setIsFading(true);
        setTranslateX(dir * width * 1.2);
        setTimeout(() => onDelete(), 350);
      } else {
        setTranslateX(0);
      }
    }

    const absX = Math.abs(translateX);

    const cardStyle = {
      transform: `translateX(${translateX}px) scale(${isFading ? 0.96 : 1})`,
      opacity: isFading ? 0 : 1,
      filter: isFading ? "blur(4px)" : "blur(0px)",
      transition: isFading
        ? "transform 0.35s ease, opacity 0.35s ease, filter 0.35s ease"
        : "transform 0.18s ease-out",
    };

    const trackOpacity =
      isFading || absX > 10
        ? 0.4 + Math.min(absX / 300, 0.6)
        : 0;

    return (
      <div className="relative overflow-hidden rounded-lg border border-zinc-800">
        {/* Delete track */}
        <div
          className="absolute inset-0 bg-zinc-800 flex items-center justify-center"
          style={{
            opacity: trackOpacity,
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
          style={cardStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
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
     Group section
     ============================================================ */
  function DuplicateGroupSection({ group, index }) {
    return (
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">
            Group {index + 1} • {group.items.length} items
          </div>
          <button
            type="button"
            className="text-xs px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700"
            onClick={() => handleSkipGroup(group.key)}
          >
            Skip group
          </button>
        </div>

        <div className="space-y-2">
          {group.items.map((item, idx) => (
            <SwipeableDuplicateItem
              key={item._id}
              item={item}
              T={T}
              onDelete={() => handleDelete(item, group.key, idx)}
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
      {/* Toast via portal */}
      {toast &&
        toastRoot &&
        createPortal(
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-zinc-100 px-4 py-2 rounded-lg shadow-lg z-[9999] flex items-center gap-3">
            <span className="text-sm">{toast.message}</span>
            {toast.undo && (
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
            : `Found ${groups.length} active group${
                groups.length !== 1 ? "s" : ""
              }.`}
        </div>
      )}

      <div className="space-y-4 mt-4">
        {groups.map((g, idx) => (
          <DuplicateGroupSection key={g.key} group={g} index={idx} />
        ))}
      </div>
    </div>
  );
}

// src/views/DuplicateScannerView.jsx
import React, { useMemo, useState, useRef } from "react";

export default function DuplicateScannerView({
  T,
  rows,
  removePhrase,
  onBack,
}) {
  const [groups, setGroups] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Toast + undo
  const [toast, setToast] = useState(null);
  const undoTimerRef = useRef(null);
  const lastDeletedRef = useRef(null);

  /* ============================================================
     Toast / Undo
     ============================================================ */
  function showUndoToast(item) {
    lastDeletedRef.current = item;

    setToast({
      message: `Deleted "${item.English || "—"} / ${item.Lithuanian || "—"}"`,
    });

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    undoTimerRef.current = setTimeout(() => {
      setToast(null);
      lastDeletedRef.current = null;
    }, 3000);
  }

  function undoDelete() {
    const item = lastDeletedRef.current;
    if (!item) return;

    // restore into the global store
    // reinsert exactly as before
    setGroups((prev) => {
      // Restore item into the correct group
      const key = `${(item.English || "").toLowerCase()}||${(item.Lithuanian ||
        "").toLowerCase()}`;

      return prev.map((g) => {
        if (g.key !== key) return g;
        return { ...g, items: [...g.items, item] };
      });
    });

    // Put back into phraseStore via callback
    // `removePhrase` only removes; we need to reinsert manually here

    // Because removePhrase is one-way, we patch rows directly using an event
    // We'll dispatch a custom event the App listens to — cleaner separation
    window.dispatchEvent(
      new CustomEvent("restorePhrase", { detail: { item } })
    );

    setToast(null);
    lastDeletedRef.current = null;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }

  /* ============================================================
     Duplicate Scan
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

    const grouped = [];
    for (const [key, items] of map.entries()) {
      if (items.length > 1) {
        grouped.push({ key, items });
      }
    }

    setGroups(grouped);
    setHasScanned(true);
    setIsScanning(false);
  }

  /* ============================================================
     Delete + Undoable Logic
     ============================================================ */
  function performDelete(item) {
    // Remove from global store
    removePhrase(item._id);

    // Remove from local stale snapshot
    setGroups((prev) =>
      prev
        .map((g) => ({
          ...g,
          items: g.items.filter((x) => x._id !== item._id),
        }))
        .filter((g) => g.items.length > 1)
    );

    showUndoToast(item);
  }

  /* ============================================================
     Swipe System
     ============================================================ */
  function useSwipeableRow(item) {
    const ref = useRef(null);
    const startX = useRef(0);
    const currentX = useRef(0);
    const isDragging = useRef(false);
    const [translateX, setTranslateX] = useState(0);

    function onPointerDown(e) {
      startX.current = e.clientX;
      currentX.current = e.clientX;
      isDragging.current = true;
      ref.current.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e) {
      if (!isDragging.current) return;
      const dx = e.clientX - startX.current;
      currentX.current = e.clientX;

      // Only allow left-swipe
      if (dx >= 0) {
        setTranslateX(0);
        return;
      }

      // Cap swipe distance
      const maxSwipe = -200;
      setTranslateX(Math.max(dx, maxSwipe));
    }

    function onPointerUp(e) {
      if (!isDragging.current) return;
      isDragging.current = false;

      const dx = currentX.current - startX.current;

      const rowWidth = ref.current?.offsetWidth || 300;
      const threshold = -rowWidth * 0.4; // 40% swipe = auto-delete
      const reveal = -rowWidth * 0.25; // reveal delete zone

      if (dx <= threshold) {
        // HARD DELETE (auto-delete)
        setTranslateX(-rowWidth);
        setTimeout(() => performDelete(item), 150);
      } else if (dx <= reveal) {
        // Keep row partially open, showing delete area
        setTranslateX(-100);
      } else {
        // Snap closed
        setTranslateX(0);
      }

      try {
        ref.current.releasePointerCapture(e.pointerId);
      } catch {}
    }

    function close() {
      setTranslateX(0);
    }

    // When tapping DELETE area
    function onDeleteTap() {
      performDelete(item);
    }

    return {
      ref,
      translateX,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onDeleteTap,
    };
  }

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-28 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-zinc-100 px-4 py-2 rounded-lg shadow-lg z-[200] flex items-center gap-3">
          <span className="text-sm">{toast.message}</span>
          <button
            className="text-emerald-400 text-sm font-semibold"
            onClick={undoDelete}
          >
            Undo
          </button>
        </div>
      )}

      {/* Top Controls */}
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
        Looks for exact duplicates where both <span className="font-semibold">{T.english}</span> and{" "}
        <span className="font-semibold">{T.lithuanian}</span> match.
      </p>

      {/* Summary */}
      {hasScanned && (
        <div className="mb-4 text-sm text-zinc-300">
          {groups.length === 0 ? (
            <span>No duplicates found.</span>
          ) : (
            <>
              Found <strong>{groups.length}</strong> duplicate groups.
            </>
          )}
        </div>
      )}

      {/* Groups */}
      <div className="space-y-4 mt-4">
        {groups.map((g, idx) => (
          <section
            key={g.key}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
          >
            <div className="text-sm font-semibold mb-2">
              Group {idx + 1} • {g.items.length} items
            </div>

            <div className="space-y-2">
              {g.items.map((item) => {
                const swipe = useSwipeableRow(item);

                return (
                  <div key={item._id} className="relative overflow-hidden">
                    {/* DELETE background */}
                    <div className="absolute inset-0 bg-red-600 flex items-center pl-4 text-white font-semibold text-sm">
                      DELETE
                    </div>

                    {/* Swipeable foreground */}
                    <article
                      ref={swipe.ref}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 relative z-10 touch-pan-y"
                      style={{
                        transform: `translateX(${swipe.translateX}px)`,
                        transition:
                          swipe.translateX === 0
                            ? "transform 0.2s ease-out"
                            : "none",
                      }}
                      onPointerDown={swipe.onPointerDown}
                      onPointerMove={swipe.onPointerMove}
                      onPointerUp={swipe.onPointerUp}
                      onPointerCancel={swipe.onPointerUp}
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

                      <div className="mt-1 space-y-1 text-[11px] text-zinc-300">
                        {item.Usage && (
                          <div>
                            <span className="text-zinc-500">
                              {T.usage}:{" "}
                            </span>
                            {item.Usage}
                          </div>
                        )}
                        {item.Notes && (
                          <div>
                            <span className="text-zinc-500">
                              {T.notes}:{" "}
                            </span>
                            {item.Notes}
                          </div>
                        )}
                        {item.Category && (
                          <div>
                            <span className="text-zinc-500">
                              {T.category}:{" "}
                            </span>
                            {item.Category}
                          </div>
                        )}
                      </div>
                    </article>

                    {/* Tap delete manually if partially open */}
                    {swipe.translateX <= -100 && swipe.translateX > -400 && (
                      <button
                        className="absolute inset-0 z-20"
                        onClick={swipe.onDeleteTap}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

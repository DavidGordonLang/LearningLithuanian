// src/views/DuplicateScannerView.jsx
import React, { useState, useRef, useEffect } from "react";

export default function DuplicateScannerView({
  T,
  rows,
  removePhrase,
  onBack,
}) {
  const [groups, setGroups] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Map of skipped group keys -> item count (for summary)
  const [skipped, setSkipped] = useState({});

  // Toast state (shared for delete + skip)
  const [toast, setToast] = useState(null); // { message, onUndo }
  const toastTimerRef = useRef(null);

  /* ============================================================
     Toast helpers
     ============================================================ */
  function showToast({ message, onUndo, durationMs }) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, onUndo: onUndo || null });

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, durationMs ?? 2000);
  }

  function handleToastUndo() {
    if (toast?.onUndo) {
      toast.onUndo();
    }
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

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
      if (items.length > 1) grouped.push({ key, items });
    }

    setGroups(grouped);
    setSkipped({});
    setHasScanned(true);
    setIsScanning(false);
  }

  /* ============================================================
     Delete logic (with undo)
     ============================================================ */
  function performDelete(item, groupKey, indexInGroup) {
    // Remove from global store
    removePhrase(item._id);

    // Remove from local snapshot
    setGroups((prev) =>
      prev.map((g) =>
        g.key === groupKey
          ? {
              ...g,
              items: g.items.filter((_, i) => i !== indexInGroup),
            }
          : g
      )
    );

    // Toast + undo
    showToast({
      message: `Deleted “${item.English || "—"} / ${
        item.Lithuanian || "—"
      }”`,
      durationMs: 3000,
      onUndo: () => {
        // Restore into global store
        window.dispatchEvent(
          new CustomEvent("restorePhrase", { detail: { item } })
        );

        // Restore into local duplicate groups at the same position
        setGroups((prev) =>
          prev.map((g) => {
            if (g.key !== groupKey) return g;
            const insertPos = Math.min(indexInGroup, g.items.length);
            const newItems = [...g.items];
            newItems.splice(insertPos, 0, item);
            return { ...g, items: newItems };
          })
        );
      },
    });
  }

  /* ============================================================
     Skip group logic (collapsed summary)
     ============================================================ */
  function skipGroup(groupKey) {
    const group = groups.find((g) => g.key === groupKey);
    if (!group) return;
    const count = group.items.length;

    setSkipped((prev) => ({ ...prev, [groupKey]: count }));

    showToast({
      message: `Skipped group (${count} item${count > 1 ? "s" : ""} kept)`,
      durationMs: 2000,
      onUndo: () => {
        setSkipped((prev) => {
          const next = { ...prev };
          delete next[groupKey];
          return next;
        });
      },
    });
  }

  /* ============================================================
     Swipeable Row Component
     ============================================================ */
  function SwipeableDuplicateItem({ item, T, onDelete }) {
    const ref = useRef(null);
    const startX = useRef(0);
    const currentX = useRef(0);
    const isDragging = useRef(false);
    const [translateX, setTranslateX] = useState(0);

    function onPointerDown(e) {
      startX.current = e.clientX;
      currentX.current = e.clientX;
      isDragging.current = true;
      if (ref.current?.setPointerCapture) {
        try {
          ref.current.setPointerCapture(e.pointerId);
        } catch {}
      }
    }

    function onPointerMove(e) {
      if (!isDragging.current) return;
      const dx = e.clientX - startX.current;
      currentX.current = e.clientX;

      // Allow both left and right swipes
      if (!ref.current) return;
      const max = ref.current.offsetWidth || 260;
      const limit = Math.min(max, 260);

      const clamped = Math.max(-limit, Math.min(limit, dx));
      setTranslateX(clamped);
    }

    function onPointerEnd(e) {
      if (!isDragging.current) return;
      isDragging.current = false;

      if (ref.current?.releasePointerCapture) {
        try {
          ref.current.releasePointerCapture(e.pointerId);
        } catch {}
      }

      const dx = currentX.current - startX.current;
      const width = ref.current?.offsetWidth || 300;
      const threshold = width * 0.25; // 25% for delete

      if (Math.abs(dx) >= threshold) {
        // Auto delete in direction of swipe
        const dir = dx > 0 ? 1 : -1;
        setTranslateX(dir * width);
        setTimeout(() => onDelete(), 140);
      } else {
        // Snap back
        setTranslateX(0);
      }
    }

    return (
      <div className="relative overflow-hidden rounded-lg border border-zinc-800">
        {/* DELETE track */}
        <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
          <span className="text-red-500 text-sm font-semibold">
            Deleting…
          </span>
        </div>

        {/* Foreground card */}
        <article
          ref={ref}
          className="relative z-10 bg-zinc-950 p-3 touch-pan-y"
          style={{
            transform: `translateX(${translateX}px)`,
            transition:
              translateX === 0 ? "transform 0.18s ease-out" : "none",
          }}
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

          <div className="mt-1 space-y-1 text-[11px] text-zinc-300">
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
            {item.Category && (
              <div>
                <span className="text-zinc-500">{T.category}: </span>
                {item.Category}
              </div>
            )}
          </div>
        </article>
      </div>
    );
  }

  /* ============================================================
     RENDER
     ============================================================ */
  const visibleGroups = groups.filter(
    (g) => g.items.length > 1 // hide solved groups
  );

  const visibleNotSkippedCount = visibleGroups.filter(
    (g) => !skipped[g.key]
  ).length;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-28 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 text-zinc-100 px-4 py-2 rounded-lg shadow-lg z-[200] flex items-center gap-3">
          <span className="text-sm">{toast.message}</span>
          {toast.onUndo && (
            <button
              className="text-emerald-400 text-sm font-semibold"
              onClick={handleToastUndo}
            >
              Undo
            </button>
          )}
        </div>
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
        Finds exact duplicates where both{" "}
        <span className="font-semibold">{T.english}</span> and{" "}
        <span className="font-semibold">{T.lithuanian}</span> match.
      </p>

      {hasScanned && (
        <div className="mb-4 text-sm text-zinc-300">
          {visibleGroups.length === 0 ? (
            "No duplicates found."
          ) : (
            <>
              Found{" "}
              <strong>{visibleGroups.length}</strong> duplicate group
              {visibleGroups.length > 1 ? "s" : ""}.{" "}
              {visibleNotSkippedCount !== visibleGroups.length && (
                <>
                  ({visibleNotSkippedCount} active,{" "}
                  {visibleGroups.length - visibleNotSkippedCount} skipped)
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Groups */}
      <div className="space-y-4 mt-4">
        {visibleGroups.map((g, idx) => {
          const isSkipped = !!skipped[g.key];

          if (isSkipped) {
            const count = skipped[g.key] ?? g.items.length;
            return (
              <section
                key={g.key}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="text-sm text-zinc-300">
                  Group {idx + 1} —{" "}
                  <span className="font-semibold">skipped</span> (
                  {count} item{count > 1 ? "s" : ""} kept)
                </div>
                <button
                  className="text-xs px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700"
                  onClick={() =>
                    setSkipped((prev) => {
                      const next = { ...prev };
                      delete next[g.key];
                      return next;
                    })
                  }
                >
                  Undo skip
                </button>
              </section>
            );
          }

          return (
            <section
              key={g.key}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">
                  Group {idx + 1} • {g.items.length} items
                </div>
                <button
                  type="button"
                  className="text-xs px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700"
                  onClick={() => skipGroup(g.key)}
                >
                  Skip group
                </button>
              </div>

              <div className="space-y-2">
                {g.items.map((item, itemIdx) => (
                  <SwipeableDuplicateItem
                    key={item._id}
                    item={item}
                    T={T}
                    onDelete={() =>
                      performDelete(item, g.key, itemIdx)
                    }
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

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

  const [skipped, setSkipped] = useState({});

  // Toast { message, onUndo }
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  /* ============================================================
     Toast helpers
     ============================================================ */
  function showToast({ message, onUndo, durationMs }) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setToast({ message, onUndo });

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, durationMs);
  }

  function handleToastUndo() {
    if (toast?.onUndo) toast.onUndo();
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
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
     Delete + Undo
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

    // Toast + Undo logic
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

        // Restore locally
        setGroups((prev) =>
          prev.map((g) => {
            if (g.key !== groupKey) return g;
            const insertPos = Math.min(indexInGroup, g.items.length);
            const items = [...g.items];
            items.splice(insertPos, 0, item);
            return { ...g, items };
          })
        );
      },
    });
  }

  /* ============================================================
     Skip group logic
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
     Swipeable row component
     ============================================================ */
  function SwipeableDuplicateItem({ item, T, onDelete }) {
    const ref = useRef(null);
    const startX = useRef(0);
    const currentX = useRef(0);
    const isDragging = useRef(false);

    const [translateX, setTranslateX] = useState(0);
    const [isFading, setIsFading] = useState(false);

    function onPointerDown(e) {
      startX.current = e.clientX;
      currentX.current = e.clientX;
      isDragging.current = true;
      if (ref.current?.setPointerCapture)
        try {
          ref.current.setPointerCapture(e.pointerId);
        } catch {}
    }

    function onPointerMove(e) {
      if (!isDragging.current) return;
      const dx = e.clientX - startX.current;
      currentX.current = e.clientX;

      const width = ref.current?.offsetWidth || 300;
      const limit = width * 0.9;
      const clamped = Math.max(-limit, Math.min(limit, dx));
      setTranslateX(clamped);
    }

    function onPointerEnd(e) {
      if (!isDragging.current) return;
      isDragging.current = false;

      if (ref.current?.releasePointerCapture)
        try {
          ref.current.releasePointerCapture(e.pointerId);
        } catch {}

      const dx = currentX.current - startX.current;
      const width = ref.current?.offsetWidth || 300;
      const threshold = width * 0.25;

      if (Math.abs(dx) >= threshold) {
        // Auto-delete: slide + fade + shrink
        const dir = dx > 0 ? 1 : -1;

        // Trigger fade + shrink
        setIsFading(true);

        // Slide away
        setTranslateX(dir * width);

        // Delay removal until fade completes (1 second)
        setTimeout(() => onDelete(), 1000);
      } else {
        setTranslateX(0); // snap back
      }
    }

    // Calculate animation visuals
    const absX = Math.abs(translateX);
    const fadeFactor = isFading
      ? 0
      : 1 - Math.min(absX / 260, 1); // fading with swipe

    const scale = isFading
      ? 0.96
      : 1 - Math.min(absX / 260, 0.04); // shrink slightly

    const blur = isFading
      ? "blur(4px)"
      : `blur(${Math.min(absX / 200, 4)}px)`;

    return (
      <div className="relative overflow-hidden rounded-lg border border-zinc-800">
        {/* DELETE track: with fade/slide in */}
        <div
          className="absolute inset-0 bg-zinc-800 flex items-center justify-center"
          style={{
            opacity: isFading ? 1 : 0.35 + Math.min(absX / 300, 0.65),
            transition: "opacity 0.3s ease",
          }}
        >
          <span
            className="text-red-500 text-sm font-semibold"
            style={{
              transform: isFading
                ? "translateY(0px)"
                : "translateY(8px)",
              opacity: isFading ? 1 : 0,
              transition: "opacity 0.4s ease, transform 0.4s ease",
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
            transform: `translateX(${translateX}px) scale(${scale})`,
            opacity: fadeFactor,
            filter: blur,
            transition:
              translateX === 0 && !isFading
                ? "transform 0.18s ease-out, opacity 0.18s ease-out"
                : "opacity 1s ease, transform 1s ease, filter 1s ease",
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
  const visibleGroups = groups.filter((g) => g.items.length > 1);

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
        Finds exact duplicates where{" "}
        <span className="font-semibold">{T.english}</span> and{" "}
        <span className="font-semibold">{T.lithuanian}</span> match.
      </p>

      {hasScanned && (
        <div className="mb-4 text-sm text-zinc-300">
          {visibleGroups.length === 0
            ? "No duplicates found."
            : `Found ${visibleGroups.length} duplicate group${
                visibleGroups.length > 1 ? "s" : ""
              }.`}
        </div>
      )}

      {/* Group list */}
      <div className="space-y-4 mt-4">
        {visibleGroups.map((g, idx) => {
          const isSkipped = !!skipped[g.key];

          if (isSkipped) {
            const count = skipped[g.key];
            return (
              <section
                key={g.key}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="text-sm text-zinc-300">
                  Group {idx + 1} —{" "}
                  <span className="font-semibold">skipped</span> ({count}{" "}
                  item{count > 1 ? "s" : ""})
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
                    onDelete={() => performDelete(item, g.key, itemIdx)}
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

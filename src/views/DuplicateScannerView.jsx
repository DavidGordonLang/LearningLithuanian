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

  // groupKey -> itemCount for skipped groups
  const [skipped, setSkipped] = useState({});
  // groupKey -> true while fading out
  const [exitingGroups, setExitingGroups] = useState({});

  // Toast { message, onUndo }
  const [toast, setToast] = useState(null);
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
    setExitingGroups({});
    setHasScanned(true);
    setIsScanning(false);
  }

  /* ============================================================
     Delete + Undo
     ============================================================ */
  function performDelete(item, groupKey, indexInGroup) {
    // remove from global store
    removePhrase(item._id);

    // update local groups
    setGroups((prev) => {
      const newGroups = prev.map((g) => {
        if (g.key !== groupKey) return g;
        const items = g.items.filter((_, i) => i !== indexInGroup);
        return { ...g, items };
      });

      const updatedGroup = newGroups.find((g) => g.key === groupKey);
      if (updatedGroup && updatedGroup.items.length <= 1) {
        // trigger fade-out for this group
        setExitingGroups((prevExit) => ({
          ...prevExit,
          [groupKey]: true,
        }));

        // after fade, actually remove the group
        setTimeout(() => {
          setGroups((current) =>
            current.filter((g) => g.key !== groupKey)
          );
          setExitingGroups((prevExit2) => {
            const next = { ...prevExit2 };
            delete next[groupKey];
            return next;
          });
          setSkipped((prevSkip) => {
            const next = { ...prevSkip };
            delete next[groupKey];
            return next;
          });
        }, 300);
      }

      return newGroups;
    });

    // toast + undo
    showToast({
      message: `Deleted “${item.English || "—"} / ${
        item.Lithuanian || "—"
      }”`,
      durationMs: 3000,
      onUndo: () => {
        // restore into global store
        window.dispatchEvent(
          new CustomEvent("restorePhrase", { detail: { item } })
        );

        // restore into groups at original position
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
     Skip group + Undo
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
     Swipeable row (fast + hybrid delete)
     ============================================================ */
  function SwipeableDuplicateItem({ item, T, onDelete }) {
    const ref = useRef(null);
    const startX = useRef(0);
    const lastX = useRef(0);
    const startTime = useRef(0);
    const isDragging = useRef(false);

    const [translateX, setTranslateX] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const [isDraggingState, setIsDraggingState] = useState(false);

    function onPointerDown(e) {
      startX.current = e.clientX;
      lastX.current = e.clientX;
      startTime.current = e.timeStamp || performance.now();
      isDragging.current = true;
      setIsDraggingState(true);
      setIsFading(false);

      if (ref.current?.setPointerCapture) {
        try {
          ref.current.setPointerCapture(e.pointerId);
        } catch {}
      }
    }

    function onPointerMove(e) {
      if (!isDragging.current) return;
      const x = e.clientX;
      const dx = x - startX.current;
      lastX.current = x;

      const width = ref.current?.offsetWidth || 300;
      const limit = width * 1.2;
      const clamped = Math.max(-limit, Math.min(limit, dx));
      setTranslateX(clamped);
    }

    function triggerDelete(dx) {
      const width = ref.current?.offsetWidth || 300;
      const dir = dx >= 0 ? 1 : -1;

      setIsFading(true);
      // quick slide off
      setTranslateX(dir * width * 1.1);

      // delay actual removal for fade/shrink/blur
      setTimeout(() => {
        onDelete();
      }, 300);
    }

    function onPointerEnd(e) {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsDraggingState(false);

      if (ref.current?.releasePointerCapture) {
        try {
          ref.current.releasePointerCapture(e.pointerId);
        } catch {}
      }

      const endTime = e.timeStamp || performance.now();
      const dt = Math.max(endTime - startTime.current, 1);
      const dx = lastX.current - startX.current;
      const width = ref.current?.offsetWidth || 300;
      const threshold = width * 0.25;

      const velocity = Math.abs(dx) / dt; // px per ms

      const isBeyondDistance = Math.abs(dx) >= threshold;
      const isFastSwipe = velocity > 1.0 && Math.abs(dx) > 20; // hybrid feel

      if (isBeyondDistance || isFastSwipe) {
        // delete path
        triggerDelete(dx);
      } else {
        // snap back quickly
        setTranslateX(0);
      }
    }

    // Visuals: fade/shrink/blur only when isFading = true
    const style = (() => {
      const width = ref.current?.offsetWidth || 300;
      const absX = Math.abs(translateX);
      const swipeFraction = Math.min(absX / width, 1);

      const isDeleting = isFading;

      const opacity = isDeleting ? 0 : 1;
      const scale = isDeleting ? 0.96 : 1;
      const blur = isDeleting ? "blur(4px)" : "blur(0px)";

      let transition = "none";
      if (!isDraggingState) {
        transition = isDeleting
          ? "transform 0.7s ease, opacity 0.7s ease, filter 0.7s ease"
          : "transform 0.18s ease-out";
      }

      return {
        transform: `translateX(${translateX}px) scale(${scale})`,
        opacity,
        filter: blur,
        transition,
      };
    })();

    const trackOpacity =
      isFading || Math.abs(translateX) > 10
        ? 0.4 + Math.min(Math.abs(translateX) / 300, 0.6)
        : 0;

    return (
      <div className="relative overflow-hidden rounded-lg border border-zinc-800">
        {/* DELETE track */}
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
          style={style}
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
     Group section with fade-in / fade-out
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      // trigger fade-in
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }, []);

    const style = {
      opacity: isExiting ? 0 : mounted ? 1 : 0,
      transform: isExiting
        ? "scale(0.98)"
        : mounted
        ? "scale(1)"
        : "scale(0.98)",
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

    const isResolved = group.items.length <= 1;

    return (
      <section
        style={style}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">
            Group {index + 1} • {group.items.length} items
          </div>
          {!isResolved && (
            <button
              className="text-xs px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700"
              onClick={onSkip}
            >
              Skip group
            </button>
          )}
        </div>

        {isResolved ? (
          <div className="text-xs text-zinc-500 italic">
            Group resolved.
          </div>
        ) : (
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
        )}
      </section>
    );
  }

  /* ============================================================
     RENDER
     ============================================================ */
  const activeGroups = groups.filter(
    (g) => g.items.length > 1 && !exitingGroups[g.key]
  );

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
          {groups.length === 0
            ? "No duplicates found."
            : `Found ${activeGroups.length} active duplicate group${
                activeGroups.length !== 1 ? "s" : ""
              }.`}
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
              setSkipped((prev) => {
                const next = { ...prev };
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

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function DuplicateScannerView({ T, rows, removePhrase, onBack }) {
  const toastRoot =
    typeof document !== "undefined"
      ? document.getElementById("toast-root")
      : null;

  const [groups, setGroups] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const undoRef = useRef(null);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  /* ============================================================
     Toast helpers
     ============================================================ */
  function showToast({ message, durationMs = 2000 }) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, undo: false });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, durationMs);
  }

  function showUndoToast(message) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, undo: true });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      undoRef.current = null;
    }, 3000);
  }

  function handleToastUndo() {
    const snapshot = undoRef.current;
    if (!snapshot) {
      setToast(null);
      return;
    }
    undoRef.current = null;
    setToast(null);

    if (snapshot.type === "delete") {
      window.dispatchEvent(
        new CustomEvent("restorePhrase", {
          detail: { item: snapshot.deletedItem },
        })
      );

      setGroups((prev) => {
        const next = [...prev];
        const existingIndex = next.findIndex(
          (g) => g.key === snapshot.groupSnapshot.key
        );
        if (existingIndex !== -1) {
          next.splice(existingIndex, 1);
        }
        const insertIndex = Math.min(
          snapshot.groupIndex,
          Math.max(next.length, 0)
        );
        next.splice(insertIndex, 0, {
          key: snapshot.groupSnapshot.key,
          items: [...snapshot.groupSnapshot.items],
        });

        return next;
      });
    } else if (snapshot.type === "skip") {
      setGroups((prev) => {
        const next = [...prev];
        const existingIndex = next.findIndex(
          (g) => g.key === snapshot.group.key
        );
        if (existingIndex !== -1) {
          next.splice(existingIndex, 1);
        }
        const insertIndex = Math.min(
          snapshot.groupIndex,
          Math.max(next.length, 0)
        );
        next.splice(insertIndex, 0, {
          key: snapshot.group.key,
          items: [...snapshot.group.items],
        });
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
     Normalisation + Fuzzy Matching Helpers
     ============================================================ */

  // Strip accents: ą → a, č → c, etc.
  function stripDiacritics(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // Remove punctuation, collapse spaces, lowercase
  function normalise(str) {
    if (!str) return "";
    return stripDiacritics(str)
      .toLowerCase()
      .replace(/[!?,.:;…“”"'(){}\[\]\-–—*@#\/\\]/g, "") // strip punctuation
      .replace(/\s+/g, " ") // collapse spaces
      .trim();
  }

  // Lightweight Levenshtein distance
  function levenshtein(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 1) return 99; // too different, skip early

    const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
    dp[0] = Array.from({ length: n + 1 }, (_, j) => j);

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  }

  // Determine whether two entries should be grouped as duplicates
  function areNearDuplicates(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;

    const na = normalise(a);
    const nb = normalise(b);

    if (na === nb) return true;

    // Fuzzy match with small tolerance
    return levenshtein(na, nb) <= 1;
  }

  /* ============================================================
     Scan duplicates (enhanced)
     ============================================================ */
  function scanDuplicates() {
    setIsScanning(true);

    // We'll build groups of items that have matching (or near-matching) EN+LT pairs.
    const visited = new Set();
    const groupsOut = [];

    for (let i = 0; i < rows.length; i++) {
      if (visited.has(i)) continue;

      const r1 = rows[i];
      const en1 = normalise(r1.English || "");
      const lt1 = normalise(r1.Lithuanian || "");

      // Start a group with the first item
      const group = [r1];

      for (let j = i + 1; j < rows.length; j++) {
        if (visited.has(j)) continue;

        const r2 = rows[j];
        const en2 = normalise(r2.English || "");
        const lt2 = normalise(r2.Lithuanian || "");

        // Both English and Lithuanian must be near-duplicate for grouping.
        const enMatch = areNearDuplicates(en1, en2);
        const ltMatch = areNearDuplicates(lt1, lt2);

        if (enMatch && ltMatch) {
          group.push(r2);
          visited.add(j);
        }
      }

      if (group.length > 1) {
        groupsOut.push({
          key: `${en1}||${lt1}`,
          items: group,
        });
      }
    }

    setGroups(groupsOut);
    undoRef.current = null;
    setHasScanned(true);
    setIsScanning(false);
  }

  /* ============================================================
     Delete + Skip handlers (unchanged)
     ============================================================ */
  function handleDelete(item, groupKey, itemIndex) {
    const groupIndex = groups.findIndex((g) => g.key === groupKey);
    if (groupIndex === -1) return;

    const groupSnapshot = groups[groupIndex];

    undoRef.current = {
      type: "delete",
      deletedItem: item,
      groupSnapshot: {
        key: groupSnapshot.key,
        items: [...groupSnapshot.items],
      },
      groupIndex,
    };

    removePhrase(item._id);

    setGroups((prev) => {
      const next = [...prev];
      const gIndex = next.findIndex((g) => g.key === groupKey);
      if (gIndex === -1) return prev;

      const group = next[gIndex];
      const items = group.items.filter((_, i) => i !== itemIndex);

      if (items.length > 1) {
        next[gIndex] = { ...group, items };
      } else {
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

    undoRef.current = {
      type: "skip",
      group: {
        key: group.key,
        items: [...group.items],
      },
      groupIndex: idx,
    };

    setGroups((prev) => prev.filter((g) => g.key !== groupKey));

    showUndoToast(
      `Skipped group (${group.items.length} item${group.items.length > 1 ? "s" : ""} kept)`
    );
  }

  /* ============================================================
     Swipeable Duplicate Item (unchanged)
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
      const threshold = width * 0.25;

      if (Math.abs(dx) >= threshold) {
        const dir = dx > 0 ? 1 : -1;
        setIsFading(true);
        setTranslateX(dir * width * 1.2);
        setTimeout(() => onDelete(), 350);
      } else {
        setTranslateX(0);
      }
    }

    function onPointerCancelHandler() {
      draggingRef.current = false;
      setTranslateX(0);
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
      isFading || absX > 10 ? 0.4 + Math.min(absX / 300, 0.6) : 0;

    return (
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800">
        {/* Track */}
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
              transform: isFading ? "translateY(0px)" : "translateY(6px)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            Deleting…
          </span>
        </div>

        {/* Foreground card */}
        <article
          ref={ref}
          className="
            relative z-10 
            bg-zinc-900/95 border border-zinc-800 rounded-2xl 
            p-3 shadow-[0_0_12px_rgba(0,0,0,0.15)]
            touch-pan-y
          "
          style={cardStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerLeave={onPointerCancelHandler}
          onPointerCancel={onPointerCancelHandler}
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
     Duplicate group section (unchanged)
     ============================================================ */
  function DuplicateGroupSection({ group, index }) {
    return (
      <section
        className="
          bg-zinc-900/95 border border-zinc-800 
          rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.25)]
        "
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">
            Group {index + 1} • {group.items.length} items
          </div>

          <button
            type="button"
            className="
              bg-zinc-800 text-zinc-200 rounded-full 
              px-4 py-1.5 text-xs font-medium
              hover:bg-zinc-700 active:bg-zinc-600
              select-none
            "
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
      {/* Toast portal */}
      {toast &&
        toastRoot &&
        createPortal(
          <div
            className="
              fixed bottom-24 left-1/2 -translate-x-1/2 
              bg-zinc-900/95 border border-zinc-800 
              text-zinc-100 px-4 py-2 
              rounded-2xl shadow-lg z-[9999] 
              flex items-center gap-3
            "
          >
            <span className="text-sm">{toast.message}</span>

            {toast.undo && (
              <button
                className="
                  text-emerald-400 text-sm font-semibold 
                  hover:text-emerald-300 active:text-emerald-200
                  select-none
                "
                onClick={handleToastUndo}
              >
                Undo
              </button>
            )}
          </div>,
          toastRoot
        )}

      {/* Header + Scan */}
      <div className="flex items-center justify-between gap-2 mb-4 mt-2">
        <button
          type="button"
          className="
            bg-zinc-800 text-zinc-200 rounded-full 
            px-4 py-2 text-sm font-medium
            hover:bg-zinc-700 active:bg-zinc-600
            select-none
          "
          onClick={onBack}
        >
          ← Back to settings
        </button>

        <button
          type="button"
          className="
            bg-emerald-500 text-black rounded-full 
            px-5 py-2 font-semibold shadow 
            hover:bg-emerald-400 active:bg-emerald-300
            select-none
          "
          onClick={scanDuplicates}
          disabled={isScanning}
        >
          {isScanning ? "Scanning…" : "Scan for duplicates"}
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-1">Duplicate scanner</h2>
      <p className="text-sm text-zinc-400 mb-4">
        Finds near-identical duplicates where{" "}
        <span className="font-semibold">{T.english}</span> and{" "}
        <span className="font-semibold">{T.lithuanian}</span> match after
        punctuation/diacritic normalisation.
      </p>

      {hasScanned && (
        <div className="mb-4 text-sm text-zinc-300">
          {groups.length === 0
            ? "No duplicates found."
            : `Found ${groups.length} active group${groups.length !== 1 ? "s" : ""}.`}
        </div>
      )}

      {/* GROUPS */}
      <div className="space-y-4 mt-4">
        {groups.map((g, idx) => (
          <DuplicateGroupSection key={g.key} group={g} index={idx} />
        ))}
      </div>
    </div>
  );
}

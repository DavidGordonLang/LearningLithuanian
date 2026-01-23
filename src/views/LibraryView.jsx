// src/views/LibraryView.jsx
import React, { useMemo, useState, useSyncExternalStore, useEffect } from "react";
import { searchStore } from "../searchStore";
import { CATEGORIES, DEFAULT_CATEGORY } from "../constants/categories";

export default function LibraryView({
  T,
  rows,
  setRows,
  normalizeRag,
  sortMode,
  playText,
  removePhrase,
  onEditRow,
  onOpenAddForm,
}) {
  const [expanded, setExpanded] = useState(new Set());
  const [category, setCategory] = useState("ALL");

  const qFilter = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );
  const qNorm = (qFilter || "").trim().toLowerCase();

  /* SEARCH OVERRIDES CATEGORY */
  useEffect(() => {
    if (qNorm && category !== "ALL") setCategory("ALL");
  }, [qNorm, category]);

  /* FILTER + SORT */
  const filteredRows = useMemo(() => {
    let base = rows;

    if (qNorm) {
      base = base.filter((r) => {
        const en = (r.English || "").toLowerCase();
        const lt = (r.Lithuanian || "").toLowerCase();
        return en.includes(qNorm) || lt.includes(qNorm);
      });
    } else if (category !== "ALL") {
      base = base.filter((r) => (r.Category || DEFAULT_CATEGORY) === category);
    }

    if (sortMode === "Newest")
      return [...base].sort((a, b) => (b._ts || 0) - (a._ts || 0));
    if (sortMode === "Oldest")
      return [...base].sort((a, b) => (a._ts || 0) - (b._ts || 0));

    const order = { "🔴": 0, "🟠": 1, "🟢": 2 };
    return [...base].sort(
      (a, b) =>
        (order[normalizeRag(a["RAG Icon"])] ?? 1) -
        (order[normalizeRag(b["RAG Icon"])] ?? 1)
    );
  }, [rows, qNorm, category, sortMode, normalizeRag]);

  /* AUDIO (tap = normal, long press = slow, BUT cancel if finger moves) */
  function blurActiveInput() {
    const ae = document.activeElement;
    if (!ae) return;
    const tag = (ae.tagName || "").toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
      try {
        ae.blur();
      } catch {}
    }
  }

  function pressHandlers(text) {
    // All state per-press lives in refs so rerenders don't break timing
    const state = {
      timer: null,
      firedSlow: false,
      pressed: false,
      moved: false,
      startX: 0,
      startY: 0,
    };

    const cancelAll = () => {
      state.pressed = false;
      if (state.timer) clearTimeout(state.timer);
      state.timer = null;
    };

    const start = (e) => {
      // Prevent text selection + prevent focus changes on the button itself
      e.preventDefault();
      e.stopPropagation();

      if (!text) return;

      blurActiveInput();

      state.pressed = true;
      state.firedSlow = false;
      state.moved = false;

      // PointerEvent preferred; fall back to touches if needed
      const x = e?.clientX ?? e?.touches?.[0]?.clientX ?? 0;
      const y = e?.clientY ?? e?.touches?.[0]?.clientY ?? 0;
      state.startX = x;
      state.startY = y;

      state.timer = setTimeout(() => {
        if (!state.pressed || state.moved) return;
        state.firedSlow = true;
        playText(text, { slow: true });
      }, 550);
    };

    const move = (e) => {
      if (!state.pressed) return;

      const x = e?.clientX ?? e?.touches?.[0]?.clientX ?? 0;
      const y = e?.clientY ?? e?.touches?.[0]?.clientY ?? 0;

      const dx = x - state.startX;
      const dy = y - state.startY;

      // If the finger moves, treat it as swipe/scroll and cancel play
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        state.moved = true;
        if (state.timer) clearTimeout(state.timer);
        state.timer = null;
      }
    };

    const finish = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!state.pressed) return;

      state.pressed = false;
      if (state.timer) clearTimeout(state.timer);
      state.timer = null;

      // If user moved finger, do NOTHING (swipe/scroll)
      if (state.moved) return;

      // If slow already fired, do not also fire normal
      if (!state.firedSlow) playText(text);
    };

    const cancel = () => cancelAll();

    return {
      onPointerDown: start,
      onPointerMove: move,
      onPointerUp: finish,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      // Extra safety for long-press menu
      onContextMenu: (e) => e.preventDefault(),
      // Mobile Safari callout suppression
      onTouchStart: (e) => e.preventDefault(),
    };
  }

  return (
    <div className="z-page pb-28">
      {/* Header */}
      <div className="pt-4 sm:pt-5 mb-4">
        <h2 className="z-title">{T.libraryTitle}</h2>
        <p className="z-subtitle mt-1">
          Browse, search, and manage your saved entries.
        </p>

        {typeof onOpenAddForm === "function" && (
          <div className="mt-4">
            <button
              type="button"
              className="
                z-btn px-5 py-3 rounded-2xl
                bg-emerald-500 text-black font-semibold
                hover:bg-emerald-400 active:bg-emerald-300
                border border-emerald-300/20
              "
              onClick={onOpenAddForm}
              data-press
            >
              + Add Entry
            </button>
          </div>
        )}
      </div>

      {/* Controls (Utility layout — quiet) */}
      <div className="z-card p-4 sm:p-5 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-400">Category</label>
            <select
              className="z-input !w-auto !py-2 !px-3 !rounded-2xl text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!!qNorm}
            >
              <option value="ALL">All</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-zinc-400">
            {filteredRows.length} / {rows.length} entries
          </div>
        </div>

        {qNorm && (
          <div className="mt-3 z-inset px-4 py-3">
            <div className="text-sm text-zinc-200 font-medium">
              Search active
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">
              Showing all categories while searching.
            </div>
          </div>
        )}
      </div>

      {/* List */}
      {filteredRows.length === 0 ? (
        <div className="z-card p-4 sm:p-5">
          <div className="text-sm text-zinc-300 font-medium">No entries found</div>
          <div className="z-subtitle mt-1">
            Try clearing search or selecting a different category.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRows.map((r) => {
            const isOpen = expanded.has(r._id);

            return (
              <article key={r._id} className="z-card p-4 sm:p-5">
                {/* Header */}
                <div
                  className="flex gap-3 cursor-pointer"
                  onClick={() =>
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      next.has(r._id) ? next.delete(r._id) : next.add(r._id);
                      return next;
                    })
                  }
                >
                  {/* RAG (semantic colour lives in emoji only; button stays quiet) */}
                  <button
                    type="button"
                    className="
                      w-9 h-9 rounded-full
                      border border-white/10
                      bg-white/[0.06] hover:bg-white/10
                      flex items-center justify-center text-sm
                      select-none shrink-0
                    "
                    onClick={(e) => {
                      e.stopPropagation();
                      setRows((prev) =>
                        prev.map((x) =>
                          x._id === r._id
                            ? {
                                ...x,
                                "RAG Icon":
                                  normalizeRag(x["RAG Icon"]) === "🔴"
                                    ? "🟠"
                                    : normalizeRag(x["RAG Icon"]) === "🟠"
                                    ? "🟢"
                                    : "🔴",
                              }
                            : x
                        )
                      );
                    }}
                    data-press
                  >
                    {normalizeRag(r["RAG Icon"])}
                  </button>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] sm:text-[16px] font-semibold text-zinc-100 break-words">
                      {r.Lithuanian || "—"}
                    </div>

                    <div className="text-sm text-zinc-400 mt-1 break-words">
                      {r.English || "—"}
                    </div>

                    {!isOpen && r.Phonetic && (
                      <div className="text-xs text-zinc-500 italic mt-1 break-words">
                        {r.Phonetic}
                      </div>
                    )}
                  </div>

                  {/* Chevron */}
                  <div className="shrink-0 text-zinc-500 pt-1">
                    {isOpen ? "▾" : "▸"}
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4 text-sm text-zinc-300">
                    {r.Phonetic && (
                      <div className="z-inset px-4 py-3 italic text-zinc-300">
                        {r.Phonetic}
                      </div>
                    )}

                    {r.Usage && (
                      <div className="z-inset px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
                          {T.usage}
                        </div>
                        <div className="leading-relaxed">{r.Usage}</div>
                      </div>
                    )}

                    {r.Notes && (
                      <div className="z-inset px-4 py-3">
                        <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
                          {T.notes}
                        </div>
                        <div className="whitespace-pre-line leading-[1.75] space-y-4">
                          {r.Notes}
                        </div>
                      </div>
                    )}

                    {r.Category && (
                      <div className="text-xs text-zinc-500">
                        {T.category}:{" "}
                        <span className="text-zinc-300">{r.Category}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="
                      z-btn !px-4 !py-2 !rounded-2xl
                      bg-emerald-500 text-black font-semibold
                      hover:bg-emerald-400 active:bg-emerald-300
                      border border-emerald-300/20
                    "
                    style={{
                      WebkitUserSelect: "none",
                      userSelect: "none",
                      WebkitTouchCallout: "none",
                      touchAction: "manipulation",
                    }}
                    {...pressHandlers(r.Lithuanian || "")}
                    data-press
                  >
                    ▶ Play
                  </button>

                  <button
                    type="button"
                    className="z-btn z-btn-secondary !px-4 !py-2 !rounded-2xl text-sm"
                    onClick={() => onEditRow(r._id)}
                    data-press
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="
                      z-btn !px-4 !py-2 !rounded-2xl text-sm
                      bg-red-500 text-white border border-red-400/20
                      hover:bg-red-400 active:bg-red-300
                    "
                    onClick={() => {
                      if (window.confirm(T.confirm)) removePhrase(r._id);
                    }}
                    data-press
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

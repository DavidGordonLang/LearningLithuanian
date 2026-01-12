// src/views/LibraryView.jsx
import React, { useMemo, useState, useSyncExternalStore, useEffect, useRef } from "react";
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

    if (sortMode === "Newest") return [...base].sort((a, b) => (b._ts || 0) - (a._ts || 0));
    if (sortMode === "Oldest") return [...base].sort((a, b) => (a._ts || 0) - (b._ts || 0));

    const order = { "🔴": 0, "🟠": 1, "🟢": 2 };
    return [...base].sort(
      (a, b) =>
        (order[normalizeRag(a["RAG Icon"])] ?? 1) - (order[normalizeRag(b["RAG Icon"])] ?? 1)
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
    <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-28">
      <h2 className="text-2xl font-bold">{T.libraryTitle}</h2>

      {typeof onOpenAddForm === "function" && (
        <button
          className="mt-3 mb-4 bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold shadow hover:bg-emerald-400 active:bg-emerald-300 transition-transform active:scale-95 select-none"
          onClick={onOpenAddForm}
        >
          + Add Entry
        </button>
      )}

      {/* CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Category</label>
          <select
            className="bg-zinc-900 border border-zinc-700 rounded-full px-3 py-1.5 text-sm"
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

        {qNorm && <div className="text-xs text-zinc-500">Search active – showing all categories</div>}
      </div>

      <div className="mb-3 text-sm text-zinc-400">
        {filteredRows.length} / {rows.length} entries
      </div>

      {filteredRows.length === 0 ? (
        <p className="text-sm text-zinc-400">No entries found.</p>
      ) : (
        <div className="space-y-4">
          {filteredRows.map((r) => {
            const isOpen = expanded.has(r._id);

            return (
              <article
                key={r._id}
                className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 shadow-[0_0_12px_rgba(0,0,0,0.15)]"
              >
                {/* HEADER */}
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
                  {/* RAG */}
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-sm bg-zinc-950/60 hover:bg-zinc-800/60 select-none shrink-0"
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
                  >
                    {normalizeRag(r["RAG Icon"])}
                  </button>

                  {/* TEXT */}
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-emerald-300 break-words">
                      {r.Lithuanian || "—"}
                    </div>

                    <div className="text-sm text-zinc-400 mt-0.5 break-words">{r.English || "—"}</div>

                    {!isOpen && r.Phonetic && (
                      <div className="text-xs text-zinc-500 italic mt-0.5 break-words">
                        {r.Phonetic}
                      </div>
                    )}
                  </div>
                </div>

                {/* EXPANDED CONTENT */}
                {isOpen && (
                  <div className="mt-5 border-t border-zinc-800 pt-4 space-y-6 text-sm text-zinc-300">
                    {r.Phonetic && <div className="italic text-zinc-400">{r.Phonetic}</div>}

                    {r.Usage && (
                      <div className="leading-relaxed">
                        <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                          {T.usage}
                        </div>
                        <div className="leading-relaxed">{r.Usage}</div>
                      </div>
                    )}

                    {r.Notes && (
                      <div className="leading-relaxed">
                        <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
                          {T.notes}
                        </div>

                        <div className="whitespace-pre-line leading-[1.75] space-y-4">{r.Notes}</div>
                      </div>
                    )}

                    {r.Category && (
                      <div className="text-xs text-zinc-500 pt-2">
                        {T.category}: <span className="text-zinc-300">{r.Category}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex justify-center gap-4 mt-5">
                  <button
                    type="button"
                    className="bg-emerald-500 text-black rounded-full px-5 py-2 text-[18px] select-none"
                    style={{
                      WebkitUserSelect: "none",
                      userSelect: "none",
                      WebkitTouchCallout: "none",
                      touchAction: "manipulation",
                    }}
                    {...pressHandlers(r.Lithuanian || "")}
                  >
                    ▶
                  </button>

                  <button
                    className="bg-zinc-800 text-zinc-200 rounded-full px-4 py-2 text-sm"
                    onClick={() => onEditRow(r._id)}
                  >
                    Edit
                  </button>

                  <button
                    className="bg-red-500 text-white rounded-full px-4 py-2 text-sm"
                    onClick={() => {
                      if (window.confirm(T.confirm)) removePhrase(r._id);
                    }}
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

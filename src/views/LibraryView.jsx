// src/views/LibraryView.jsx
import React, { useMemo, useState, useSyncExternalStore, useEffect } from "react";
import { searchStore } from "../searchStore";
import { DEFAULT_CATEGORY } from "../constants/categories";

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
  const [category, setCategory] = useState("ALL"); // UI hidden for now (render alignment)

  const qFilter = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );
  const qNorm = (qFilter || "").trim().toLowerCase();

  /* SEARCH OVERRIDES CATEGORY (behaviour unchanged) */
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
      e.preventDefault();
      e.stopPropagation();
      if (!text) return;

      blurActiveInput();

      state.pressed = true;
      state.firedSlow = false;
      state.moved = false;

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

      if (state.moved) return;
      if (!state.firedSlow) playText(text);
    };

    const cancel = () => cancelAll();

    return {
      onPointerDown: start,
      onPointerMove: move,
      onPointerUp: finish,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onContextMenu: (e) => e.preventDefault(),
      onTouchStart: (e) => e.preventDefault(),
    };
  }

  return (
    <div className="z-page z-page-y pb-28">
      <div className="z-stack-lg">
        <div className="z-stack">
          <div className="z-title">{T.libraryTitle}</div>
          <div className="z-subtitle">
            Browse, search, and manage your saved entries.
          </div>

          {typeof onOpenAddForm === "function" && (
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
                onClick={onOpenAddForm}
              >
                + Add Entry
              </button>
            </div>
          )}
        </div>

        <div className="text-sm text-zinc-400">
          {filteredRows.length} / {rows.length} entries
        </div>

        {filteredRows.length === 0 ? (
          <div className="z-card p-5">
            <div className="text-sm text-zinc-400">No entries found.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRows.map((r) => {
              const isOpen = expanded.has(r._id);
              const rag = normalizeRag(r["RAG Icon"]);

              return (
                <article key={r._id} className="z-card p-4">
                  {/* Header row (tap to expand) */}
                  <button
                    type="button"
                    data-press
                    className="w-full text-left"
                    onClick={() =>
                      setExpanded((prev) => {
                        const next = new Set(prev);
                        next.has(r._id) ? next.delete(r._id) : next.add(r._id);
                        return next;
                      })
                    }
                  >
                    <div className="flex items-start gap-3">
                      {/* RAG */}
                      <button
                        type="button"
                        data-press
                        className="
                          w-9 h-9 rounded-full
                          border border-white/10
                          bg-zinc-950/50
                          flex items-center justify-center
                          text-sm
                          shrink-0
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
                        aria-label="Cycle RAG icon"
                        title="Cycle RAG icon"
                      >
                        {rag}
                      </button>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-semibold text-emerald-200 break-words">
                          {r.Lithuanian || "—"}
                        </div>
                        <div className="text-sm text-zinc-400 mt-0.5 break-words">
                          {r.English || "—"}
                        </div>

                        {!isOpen && r.Phonetic && (
                          <div className="text-xs text-zinc-500 italic mt-1 break-words">
                            {r.Phonetic}
                          </div>
                        )}
                      </div>

                      <div className="text-zinc-500 text-lg pt-0.5">
                        {isOpen ? "▾" : "▸"}
                      </div>
                    </div>
                  </button>

                  {/* Expanded */}
                  {isOpen && (
                    <div className="mt-4 border-t border-white/10 pt-4 z-stack">
                      {r.Phonetic && (
                        <div className="text-sm text-zinc-400 italic">
                          {r.Phonetic}
                        </div>
                      )}

                      {r.Usage && (
                        <div className="z-stack">
                          <div className="z-section-title">{T.usage}</div>
                          <div className="text-sm text-zinc-300 leading-relaxed">
                            {r.Usage}
                          </div>
                        </div>
                      )}

                      {r.Notes && (
                        <div className="z-stack">
                          <div className="z-section-title">{T.notes}</div>
                          <div className="text-sm text-zinc-300 whitespace-pre-line leading-[1.75]">
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
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      data-press
                      className="
                        z-btn px-4 py-2 rounded-full text-sm
                        bg-emerald-600/90 hover:bg-emerald-500
                        border border-emerald-300/20
                        text-black font-semibold
                      "
                      {...pressHandlers(r.Lithuanian || "")}
                    >
                      ▶ Play
                    </button>

                    <button
                      type="button"
                      data-press
                      className="z-btn z-btn-secondary px-4 py-2 rounded-full text-sm"
                      onClick={() => onEditRow(r._id)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      data-press
                      className="
                        z-btn px-4 py-2 rounded-full text-sm
                        bg-red-500/90 hover:bg-red-500
                        border border-white/10
                        text-white font-semibold
                      "
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
    </div>
  );
}

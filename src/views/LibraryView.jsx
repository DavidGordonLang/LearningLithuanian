// src/views/LibraryView.jsx
import React, { useMemo, useState, useSyncExternalStore, useEffect } from "react";
import { searchStore } from "../searchStore";

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

  const qFilter = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );
  const qNorm = (qFilter || "").trim().toLowerCase();

  /* FILTER + SORT */
  const filteredRows = useMemo(() => {
    let base = rows;

    if (qNorm) {
      base = base.filter((r) => {
        const en = (r.English || "").toLowerCase();
        const lt = (r.Lithuanian || "").toLowerCase();
        return en.includes(qNorm) || lt.includes(qNorm);
      });
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
  }, [rows, qNorm, sortMode, normalizeRag]);

  /* If search active, collapse expanded for sanity (presentation only) */
  useEffect(() => {
    if (qNorm) setExpanded(new Set());
  }, [qNorm]);

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
        <div>
          <div className="z-title">{T.libraryTitle}</div>
          <div className="z-subtitle mt-1">
            Browse, search, and manage your saved entries.
          </div>
        </div>

        {typeof onOpenAddForm === "function" ? (
          <div>
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
        ) : null}

        <div className="z-helper">
          {filteredRows.length} / {rows.length} entries
          {qNorm ? (
            <span className="text-zinc-600"> • search active</span>
          ) : null}
        </div>

        {filteredRows.length === 0 ? (
          <div className="z-inset p-4">
            <div className="text-sm text-zinc-300">No entries found.</div>
            <div className="z-helper mt-1">
              Try a different search term, or add a new entry.
            </div>
          </div>
        ) : (
          <div className="z-stack">
            {filteredRows.map((r) => {
              const isOpen = expanded.has(r._id);

              return (
                <article key={r._id} className="z-card p-4 sm:p-5">
                  {/* HEADER */}
                  <div
                    className="flex items-start gap-3 cursor-pointer"
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
                      data-press
                      className="
                        w-10 h-10 rounded-2xl
                        bg-white/5 border border-white/10
                        flex items-center justify-center text-sm
                        shrink-0
                        hover:bg-white/10
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
                    >
                      {normalizeRag(r["RAG Icon"])}
                    </button>

                    {/* TEXT */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold text-emerald-200 break-words">
                        {r.Lithuanian || "—"}
                      </div>

                      <div className="text-[13px] text-zinc-400 mt-0.5 break-words">
                        {r.English || "—"}
                      </div>

                      {!isOpen && r.Phonetic ? (
                        <div className="text-[12px] text-zinc-500 italic mt-1 break-words">
                          {r.Phonetic}
                        </div>
                      ) : null}
                    </div>

                    <div className="text-zinc-600 pt-1">›</div>
                  </div>

                  {/* EXPANDED */}
                  {isOpen ? (
                    <div className="mt-4 z-inset p-4 space-y-4">
                      {r.Phonetic ? (
                        <div className="text-sm italic text-zinc-400">
                          {r.Phonetic}
                        </div>
                      ) : null}

                      {r.Usage ? (
                        <div>
                          <div className="z-section-title mb-1">{T.usage}</div>
                          <div className="text-sm text-zinc-300 leading-relaxed">
                            {r.Usage}
                          </div>
                        </div>
                      ) : null}

                      {r.Notes ? (
                        <div>
                          <div className="z-section-title mb-2">{T.notes}</div>
                          <div className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">
                            {r.Notes}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {/* ACTIONS */}
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      data-press
                      className="
                        z-btn px-4 py-2 rounded-2xl
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
                      className="z-btn z-btn-secondary px-4 py-2 rounded-2xl"
                      onClick={() => onEditRow(r._id)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      data-press
                      className="z-btn px-4 py-2 rounded-2xl bg-red-500/90 hover:bg-red-500 border border-white/10 text-white"
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

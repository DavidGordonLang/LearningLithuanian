// src/views/LibraryView.jsx
import React, { useMemo, useState, useSyncExternalStore, useEffect, useRef } from "react";
import { searchStore } from "../searchStore";
import { CATEGORIES, DEFAULT_CATEGORY } from "../constants/categories";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function KebabIcon() {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/5">
      <span className="text-zinc-300 leading-none">···</span>
    </span>
  );
}

function PlayCircle({ children }) {
  return (
    <span
      className="
        inline-flex items-center justify-center
        w-10 h-10 rounded-full
        border border-emerald-300/20
        bg-emerald-500/10
        shadow-[0_0_22px_rgba(16,185,129,0.18)]
      "
    >
      {children}
    </span>
  );
}

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

  // menu state
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const menuRef = useRef(null);

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

  /* CLOSE MENU ON OUTSIDE TAP (but NOT when tapping the same kebab toggle) */
  useEffect(() => {
    if (!menuOpenFor) return;

    const onDown = (e) => {
      // If user tapped the kebab button for the open row, don't auto-close here.
      // Let the button's onClick toggle it closed cleanly.
      const toggleEl = e.target?.closest?.(`[data-menu-toggle="${menuOpenFor}"]`);
      if (toggleEl) return;

      const el = menuRef.current;
      if (el && el.contains(e.target)) return;

      setMenuOpenFor(null);
    };

    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, [menuOpenFor]);

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
      {/* Header */}
      <div className="z-stack">
        <div>
          <div className="z-title">{T.libraryTitle}</div>
          <div className="z-subtitle mt-1">Browse, search, and manage your saved entries.</div>
        </div>

        {typeof onOpenAddForm === "function" && (
          <button
            type="button"
            data-press
            className="
              z-btn
              w-fit
              px-5 py-3 rounded-2xl
              bg-emerald-600/90 hover:bg-emerald-500
              border border-emerald-300/20
              text-black font-semibold
            "
            onClick={onOpenAddForm}
          >
            + Add Entry
          </button>
        )}
      </div>

      {/* Controls surface */}
      <div className="mt-4 z-card p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="z-section-title">Category</div>
              <select
                className="z-input !py-2 !px-3 !rounded-2xl w-auto"
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

          {qNorm ? (
            <div className="text-xs text-zinc-500">Search active – showing all categories</div>
          ) : null}
        </div>
      </div>

      {/* List */}
      <div className="mt-4 z-card overflow-hidden">
        {filteredRows.length === 0 ? (
          <div className="p-5 text-sm text-zinc-400">No entries found.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredRows.map((r) => {
              const isOpen = expanded.has(r._id);
              const rag = normalizeRag(r["RAG Icon"]);
              const rowOpen = menuOpenFor === r._id;

              return (
                <div key={r._id} className="relative">
                  <button
                    type="button"
                    className="
                      w-full text-left
                      px-4 sm:px-5 py-4
                      hover:bg-white/[0.03]
                      transition
                      select-none
                    "
                    onClick={() =>
                      setExpanded((prev) => {
                        const next = new Set(prev);
                        next.has(r._id) ? next.delete(r._id) : next.add(r._id);
                        return next;
                      })
                    }
                  >
                    <div className="flex items-start gap-3">
                      {/* LEFT: Play only */}
                      <div className="shrink-0 pt-0.5">
                        <button
                          type="button"
                          aria-label="Play"
                          className="select-none"
                          {...pressHandlers(r.Lithuanian || "")}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <PlayCircle>
                            <span className="text-emerald-200 text-[16px] leading-none">▶</span>
                          </PlayCircle>
                        </button>
                      </div>

                      {/* TEXT */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[15px] font-semibold text-emerald-200 break-words">
                              {r.Lithuanian || "—"}
                            </div>
                            <div className="text-[13px] text-zinc-400 mt-0.5 break-words">
                              {r.English || "—"}
                            </div>
                            {r.Phonetic ? (
                              <div className="text-[12px] text-zinc-500 italic mt-0.5 break-words">
                                {r.Phonetic}
                              </div>
                            ) : null}
                          </div>

                          {/* RIGHT: kebab + rag under it */}
                          <div className="shrink-0 flex flex-col items-end gap-2">
                            <button
                              type="button"
                              className="shrink-0"
                              data-menu-toggle={r._id}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMenuOpenFor((cur) => (cur === r._id ? null : r._id));
                              }}
                              aria-label="More"
                            >
                              <KebabIcon />
                            </button>

                            <button
                              type="button"
                              aria-label="RAG"
                              className="
                                w-7 h-7 rounded-full
                                border border-white/10
                                bg-white/5
                                text-[13px]
                                hover:bg-white/[0.07]
                              "
                              onClick={(e) => {
                                e.preventDefault();
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
                              title="RAG"
                            >
                              {rag}
                            </button>
                          </div>
                        </div>

                        {/* Expanded */}
                        {isOpen ? (
                          <div className="mt-3 text-sm text-zinc-300">
                            {r.Usage ? (
                              <div className="mt-3">
                                <div className="z-section-title mb-1">{T.usage}</div>
                                <div className="text-sm text-zinc-300 leading-relaxed">
                                  {r.Usage}
                                </div>
                              </div>
                            ) : null}

                            {r.Notes ? (
                              <div className="mt-3">
                                <div className="z-section-title mb-2">{T.notes}</div>
                                <div className="whitespace-pre-line leading-[1.75] text-zinc-300">
                                  {r.Notes}
                                </div>
                              </div>
                            ) : null}

                            {r.Category ? (
                              <div className="mt-3 text-xs text-zinc-500">
                                {T.category}: <span className="text-zinc-300">{r.Category}</span>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>

                  {/* Kebab menu */}
                  {rowOpen ? (
                    <div
                      ref={menuRef}
                      className="
                        absolute right-4 sm:right-5 top-16
                        z-20
                        w-40
                        rounded-2xl
                        border border-white/10
                        bg-zinc-950/85
                        backdrop-blur
                        shadow-[0_20px_50px_rgba(0,0,0,0.6)]
                        overflow-hidden
                      "
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        data-press
                        className="w-full text-left px-4 py-3 text-sm text-zinc-100 hover:bg-white/[0.06]"
                        onClick={() => {
                          setMenuOpenFor(null);
                          onEditRow?.(r._id);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        data-press
                        className="w-full text-left px-4 py-3 text-sm text-red-200 hover:bg-red-500/10"
                        onClick={() => {
                          setMenuOpenFor(null);
                          if (window.confirm(T.confirm)) removePhrase(r._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-8" />
    </div>
  );
}

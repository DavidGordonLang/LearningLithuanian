// src/views/LibraryView.jsx
import React, {
  useMemo,
  useState,
  useSyncExternalStore,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { searchStore } from "../searchStore";
import { CATEGORIES, DEFAULT_CATEGORY } from "../constants/categories";
import SearchDock from "../components/SearchDock";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function KebabIcon() {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-white/[0.04]">
      <span className="relative w-[3px] h-[3px] rounded-full bg-zinc-300">
        <span className="absolute -top-[7px] left-0 w-[3px] h-[3px] rounded-full bg-zinc-300" />
        <span className="absolute top-[7px] left-0 w-[3px] h-[3px] rounded-full bg-zinc-300" />
      </span>
    </span>
  );
}

function normalize(s) {
  return String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* ---------- Mobile friendly long-press play (slow playback) ---------- */
const LONG_PRESS_MS = 420;

function useBlurActiveInput() {
  return () => {
    const ae = document.activeElement;
    if (!ae) return;
    const tag = (ae.tagName || "").toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
      try {
        ae.blur();
      } catch {}
    }
  };
}

export default function LibraryView({
  T,
  rows,
  setRows,
  normalizeRag,
  playText,
  removePhrase,
  onEditRow,
  onOpenAddForm,

  // passed from App (exists already, just wasn’t used)
  SearchBox,
  searchPlaceholder,
}) {
  // subscribe so search updates re-render
  useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );

  // IMPORTANT: searchStore.getSnapshot() returns the debounced string, not { q }
  const search = searchStore.getSnapshot() || "";

  const [category, setCategory] = useState(DEFAULT_CATEGORY);

  // Sort mode (only Oldest/Newest). Keep local to avoid needing App changes.
  const [sortMode, setSortMode] = useState("Newest");

  // Per-row details open state
  const [openDetails, setOpenDetails] = useState(() => new Set());

  const toggleDetails = useCallback((id) => {
    if (!id) return;
    setOpenDetails((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Context menu / row actions
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuBtnRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!menuOpenId) return;
      const btn = menuBtnRef.current;
      if (btn && btn.contains(e.target)) return;
      setMenuOpenId(null);
    };
    document.addEventListener("click", onDoc, true);
    document.addEventListener("touchstart", onDoc, true);
    return () => {
      document.removeEventListener("click", onDoc, true);
      document.removeEventListener("touchstart", onDoc, true);
    };
  }, [menuOpenId]);

  const blurActiveInput = useBlurActiveInput();

  // Long-press handler that does NOT get overridden by click on release
  const usePlayPressHandlers = (onLongPress) => {
    const timerRef = useRef(0);
    const longFiredRef = useRef(false);
    const [pressing, setPressing] = useState(false);

    const clearTimer = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    };

    const start = (e) => {
      // only primary button / touch
      if (e?.button != null && e.button !== 0) return;

      blurActiveInput();
      longFiredRef.current = false;
      setPressing(true);
      clearTimer();

      timerRef.current = window.setTimeout(() => {
        longFiredRef.current = true;
        onLongPress?.();
      }, LONG_PRESS_MS);
    };

    const finish = () => {
      setPressing(false);
      clearTimer();
    };

    const shouldSuppressClick = () => {
      return longFiredRef.current;
    };

    const resetSuppress = () => {
      // allow normal clicks again immediately after this interaction completes
      longFiredRef.current = false;
    };

    return {
      pressProps: {
        onPointerDown: start,
        onPointerUp: finish,
        onPointerCancel: finish,
        onPointerLeave: finish,
        "data-pressing": pressing ? "1" : "0",
      },
      shouldSuppressClick,
      resetSuppress,
    };
  };

  function sortRows(list) {
    const copy = Array.isArray(list) ? [...list] : [];

    if (String(sortMode).toLowerCase() === "oldest") {
      copy.sort((a, b) => (a?._ts || 0) - (b?._ts || 0));
      return copy;
    }

    // Newest default
    copy.sort((a, b) => (b?._ts || 0) - (a?._ts || 0));
    return copy;
  }

  const filtered = useMemo(() => {
    const q = normalize(search);

    const inCat = (r) =>
      category === "All" || (r?.Category || DEFAULT_CATEGORY) === category;

    const matches = (r) => {
      if (!q) return true;
      const e = normalize(r?.English);
      const l = normalize(r?.Lithuanian);
      const p = normalize(r?.Phonetic);
      const n = normalize(r?.Notes);
      return e.includes(q) || l.includes(q) || p.includes(q) || n.includes(q);
    };

    const base = (Array.isArray(rows) ? rows : [])
      .filter((r) => !r?._deleted)
      .filter(inCat)
      .filter(matches);

    return sortRows(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, category, sortMode]);

  const totalActive = rows?.filter?.((r) => !r._deleted)?.length || 0;
  const countLabel = `${filtered.length} / ${totalActive} entries`;

  return (
    <div className="z-page z-page-y pb-28 space-y-4">
      {/* Header + CTA */}
      <div className="space-y-2">
        <div>
          <h2 className="z-title">{T.libraryTitle || "Library"}</h2>
          <p className="z-subtitle mt-1">
            Browse, search, and manage your saved entries.
          </p>
        </div>

        <button
          type="button"
          data-press
          className="
            z-btn px-5 py-3 rounded-2xl
            bg-emerald-600/90 hover:bg-emerald-500
            border border-emerald-300/20
            text-black font-semibold
            w-fit
          "
          onClick={onOpenAddForm}
        >
          + {T.addEntry || "Add Entry"}
        </button>
      </div>

      {/* Search + Sort (restored) */}
      <SearchDock
        SearchBox={SearchBox}
        placeholder={searchPlaceholder || T.search || "Search…"}
        sortMode={sortMode}
        setSortMode={setSortMode}
        T={T}
        page="library"
      />

      {/* Category selector (tighter) */}
      <div className="z-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[12px] uppercase tracking-wide text-zinc-400">
            {T.category || "Category"}
          </div>

          <div className="flex items-center gap-3">
            <select
              className="z-input !py-2 !px-3 !rounded-2xl w-auto"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {["All", ...CATEGORIES].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <div className="text-sm text-zinc-400">{countLabel}</div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((r) => {
          const id = r?.id || r?._id;
          const isMenuOpen = menuOpenId === id;
          const detailsOpen = openDetails.has(id);
          const hasNotes = !!String(r?.Notes || "").trim();

          const lt = r?.Lithuanian || "";

          // long-press triggers slow playback
          const {
            pressProps,
            shouldSuppressClick,
            resetSuppress,
          } = usePlayPressHandlers(() => playText?.(lt, { slow: true }));

          return (
            <div key={id} className="z-card p-4">
              <div className="flex items-start gap-3">
                {/* Play */}
                <button
                  type="button"
                  aria-label="Play"
                  data-swipe-block="true"
                  className={cn(
                    "select-none",
                    "w-12 h-12 rounded-full",
                    "border border-emerald-300/20",
                    "bg-emerald-900/20 hover:bg-emerald-900/30",
                    "shadow-[0_0_0_1px_rgba(16,185,129,0.10),0_0_26px_rgba(16,185,129,0.12),0_14px_40px_rgba(0,0,0,0.60)]",
                    "flex items-center justify-center shrink-0",
                    "transition-transform duration-150",
                    pressProps["data-pressing"] === "1" ? "scale-[0.98]" : null
                  )}
                  {...pressProps}
                  onClick={(e) => {
                    e.stopPropagation();

                    // If long-press already fired, do not override it with normal click.
                    if (shouldSuppressClick()) {
                      resetSuppress();
                      return;
                    }

                    playText?.(lt);
                  }}
                >
                  <span className="text-emerald-200 text-lg">▶</span>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-emerald-200 truncate">
                    {r?.Lithuanian || "—"}
                  </div>
                  <div className="text-sm text-zinc-300 mt-0.5 truncate">
                    {r?.English || "—"}
                  </div>
                  {r?.Phonetic ? (
                    <div className="text-xs text-zinc-500 mt-1 truncate italic">
                      {r.Phonetic}
                    </div>
                  ) : null}

                  {/* Inline details toggle */}
                  {hasNotes ? (
                    <button
                      type="button"
                      data-press
                      className="mt-3 text-xs text-zinc-300 underline underline-offset-4"
                      onClick={() => toggleDetails(id)}
                    >
                      {detailsOpen
                        ? T.hideDetails || "Hide"
                        : T.showDetails || "Details"}
                    </button>
                  ) : null}
                </div>

                {/* Menu */}
                <div className="relative">
                  <button
                    ref={isMenuOpen ? menuBtnRef : null}
                    type="button"
                    data-press
                    className="select-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId((prev) => (prev === id ? null : id));
                    }}
                    aria-label="Row menu"
                  >
                    <KebabIcon />
                  </button>

                  {isMenuOpen ? (
                    <div
                      className="
                        absolute right-0 mt-2 w-44
                        z-[40]
                        rounded-2xl border border-white/10
                        bg-zinc-950/85 backdrop-blur
                        shadow-[0_16px_50px_rgba(0,0,0,0.65)]
                        overflow-hidden
                      "
                      onClick={(e) => e.stopPropagation()}
                    >
                      {hasNotes ? (
                        <button
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm text-zinc-100 hover:bg-white/5"
                          onClick={() => {
                            setMenuOpenId(null);
                            toggleDetails(id);
                          }}
                        >
                          {detailsOpen
                            ? T.hideDetails || "Hide"
                            : T.showDetails || "Details"}
                        </button>
                      ) : null}

                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 text-sm text-zinc-100 hover:bg-white/5"
                        onClick={() => {
                          setMenuOpenId(null);
                          onEditRow?.(id);
                        }}
                      >
                        {T.edit || "Edit Entry"}
                      </button>

                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 text-sm text-red-300 hover:bg-red-500/10"
                        onClick={() => {
                          setMenuOpenId(null);
                          removePhrase?.(id);
                        }}
                      >
                        {T.delete || "Delete"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Details */}
              {hasNotes && detailsOpen ? (
                <div className="mt-3 text-sm text-zinc-400 whitespace-pre-wrap">
                  {String(r.Notes)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

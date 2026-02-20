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
import { useSettingsStore } from "../stores/settingsStore";

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

function PlayButton({ text, playText, blurActiveInput }) {
  const timerRef = useRef(0);
  const longFiredRef = useRef(false);
  const [pressing, setPressing] = useState(false);

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = 0;
  };

  const start = (e) => {
    if (e?.button != null && e.button !== 0) return;

    // Capture the pointer so small finger drift doesn't cancel long-press
    try {
      if (e?.currentTarget?.setPointerCapture && e?.pointerId != null) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    } catch {}

    blurActiveInput?.();
    longFiredRef.current = false;
    setPressing(true);
    clearTimer();

    timerRef.current = window.setTimeout(() => {
      longFiredRef.current = true;
      playText?.(text || "", { slow: true });
    }, LONG_PRESS_MS);
  };

  const finish = (e) => {
    // Release pointer capture (safe no-op if not captured)
    try {
      if (e?.currentTarget?.releasePointerCapture && e?.pointerId != null) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    setPressing(false);
    clearTimer();
  };

  const handleClick = (e) => {
    e.stopPropagation();

    if (longFiredRef.current) {
      longFiredRef.current = false;
      return;
    }

    playText?.(text || "");
  };

  return (
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
        pressing ? "scale-[0.98]" : null
      )}
      onPointerDown={start}
      onPointerUp={finish}
      onPointerCancel={finish}
      onPointerLeave={finish}
      onClick={handleClick}
    >
      <span className="text-emerald-200 text-lg">▶</span>
    </button>
  );
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
  SearchBox,
  searchPlaceholder,
}) {
  useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );

  const phoneticsMode = useSettingsStore((s) => s.data?.phoneticsMode || "en");

  const search = searchStore.getSnapshot() || "";
  const [category, setCategory] = useState(DEFAULT_CATEGORY);

  // Local sort: "Newest" | "Oldest"
  const [sortMode, setSortMode] = useState("Newest");
  const toggleSort = () =>
    setSortMode((m) => (m === "Newest" ? "Oldest" : "Newest"));

  // Details open state
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
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!menuOpenId) return;

      const btn = menuBtnRef.current;
      if (btn && btn.contains(e.target)) return;

      const menu = menuRef.current;
      if (menu && menu.contains(e.target)) return;

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

  function sortRows(list) {
    const copy = Array.isArray(list) ? [...list] : [];
    if (String(sortMode).toLowerCase() === "oldest") {
      copy.sort((a, b) => (a?._ts || 0) - (b?._ts || 0));
      return copy;
    }
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
      const pIpa = normalize(r?.PhoneticIPA);
      const n = normalize(r?.Notes);
      return (
        e.includes(q) ||
        l.includes(q) ||
        p.includes(q) ||
        pIpa.includes(q) ||
        n.includes(q)
      );
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
      {/* Title + subtitle */}
      <div className="space-y-1">
        <h2 className="z-title">{T.libraryTitle || "Library"}</h2>
        <p className="z-subtitle">Browse, search, and manage your saved entries.</p>
      </div>

      {/* Search */}
      {SearchBox ? (
        <div className="w-full">
          <SearchBox placeholder={searchPlaceholder || T.search || "Search…"} />
        </div>
      ) : null}

      {/* Sort left (glass) + Add Entry right (CTA emerald) */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-xs sm:text-sm">{T.sort}</span>

          <button
            type="button"
            data-press
            onClick={toggleSort}
            className={cn(
              "z-btn",
              "px-3 py-1.5 rounded-full",
              "text-xs sm:text-sm",
              "bg-white/[0.04] hover:bg-white/[0.06]",
              "border border-white/10",
              "text-zinc-100"
            )}
            aria-label="Toggle sort order"
          >
            {sortMode === "Oldest" ? T.oldest : T.newest}
          </button>
        </div>

        <button
          type="button"
          data-press
          onClick={onOpenAddForm}
          className={cn(
            "z-btn",
            "px-3 py-1.5 rounded-full",
            "text-xs sm:text-sm font-semibold",
            "bg-emerald-600/40 hover:bg-emerald-600/50",
            "text-emerald-200",
            "border border-emerald-500/25"
          )}
          aria-label="Add entry"
        >
          {T.addEntry || "Add Entry"}
        </button>
      </div>

      {/* Category row (tighter) */}
      <div className="z-card px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] uppercase tracking-wide text-zinc-400">
            {T.category || "Category"}
          </div>

          <div className="flex items-center gap-3">
            <select
              className="z-input !py-1 !px-3 !rounded-2xl w-auto"
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

          const displayedPhonetic =
            phoneticsMode === "ipa"
              ? String(r?.PhoneticIPA || r?.Phonetic || "").trim()
              : String(r?.Phonetic || "").trim();

          // card tap toggles details (only if has notes)
          const onCardTap = () => {
            if (!hasNotes) return;
            toggleDetails(id);
          };

          return (
            <div
              key={id}
              className="z-card p-4"
              role={hasNotes ? "button" : undefined}
              tabIndex={hasNotes ? 0 : undefined}
              onClick={onCardTap}
              onKeyDown={(e) => {
                if (!hasNotes) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCardTap();
                }
              }}
            >
              <div className="flex items-start gap-3">
                {/* Play (safe zone) */}
                <div onClick={(e) => e.stopPropagation()}>
                  <PlayButton
                    text={r?.Lithuanian || ""}
                    playText={playText}
                    blurActiveInput={blurActiveInput}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* NO TRUNCATION: wrap naturally */}
                  <div className="text-[15px] font-semibold text-emerald-200 leading-snug break-words whitespace-normal">
                    {r?.Lithuanian || "—"}
                  </div>

                  <div className="text-sm text-zinc-300 mt-1 leading-snug break-words whitespace-normal">
                    {r?.English || "—"}
                  </div>

                  {displayedPhonetic ? (
                    <div className="text-xs text-zinc-500 mt-1 italic leading-snug break-words whitespace-normal">
                      {displayedPhonetic}
                    </div>
                  ) : null}
                </div>

                {/* Menu (safe zone) */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
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
                      ref={menuRef}
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
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 text-sm text-zinc-100 hover:bg-white/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                          onEditRow?.(id);
                        }}
                      >
                        {T.edit || "Edit Entry"}
                      </button>

                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 text-sm text-red-300 hover:bg-red-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
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
import React, { useEffect, useMemo, useRef, useState } from "react";

import EntryCard from "../components/EntryCard";
import SearchBox from "../components/SearchBox";

import { CATEGORIES, DEFAULT_CATEGORY } from "../constants/categories";
import { useSettingsStore } from "../stores/settingsStore";

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function LibraryView({
  T,
  rows,
  setRows,
  normalizeRag,
  playText,
  SearchBox: SearchBoxProp,
  searchPlaceholder,
  removePhrase,
  onEditRow,
  onOpenAddForm,
}) {
  const SearchBoxImpl = SearchBoxProp || SearchBox;

  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState("newest");
  const [category, setCategory] = useState("All");

  // Phonetics display mode (EN vs IPA)
  const phoneticsMode = useSettingsStore(
    (s) => s.phoneticsMode || s.data?.phoneticsMode || "en"
  );

  const queryNorm = useMemo(() => normalize(query), [query]);

  const allCategories = useMemo(() => {
    const set = new Set();
    (rows || []).forEach((r) => {
      const c = String(r?.Category || "").trim();
      if (c) set.add(c);
    });

    const base = ["All", ...CATEGORIES];
    // Add any user categories not in constants
    const extras = Array.from(set).filter((c) => !base.includes(c));
    return [...base, ...extras.sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  const filtered = useMemo(() => {
    const arr = Array.isArray(rows) ? rows : [];
    return arr.filter((r) => {
      if (!r || r._deleted) return false;

      if (category !== "All") {
        const c = String(r?.Category || DEFAULT_CATEGORY).trim() || DEFAULT_CATEGORY;
        if (c !== category) return false;
      }

      if (!queryNorm) return true;

      const lt = normalize(r?.Lithuanian);
      const en = normalize(r?.English);
      const p = normalize(r?.Phonetic);
      const n = normalize(r?.Notes);

      return (
        lt.includes(queryNorm) ||
        en.includes(queryNorm) ||
        p.includes(queryNorm) ||
        n.includes(queryNorm)
      );
    });
  }, [rows, category, queryNorm]);

  const sorted = useMemo(() => {
    const arr = Array.isArray(filtered) ? [...filtered] : [];
    arr.sort((a, b) => {
      const ta = Number(a?._ts || 0);
      const tb = Number(b?._ts || 0);
      return sortDir === "oldest" ? ta - tb : tb - ta;
    });
    return arr;
  }, [filtered, sortDir]);

  const totalCount = Array.isArray(rows) ? rows.filter((r) => !r?._deleted).length : 0;
  const shownCount = sorted.length;

  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = 0;
  }, [queryNorm, sortDir, category]);

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="z-page z-page-y flex-1 overflow-hidden flex flex-col">
        <div className="shrink-0">
          <div className="z-title mt-2">{T.libraryTitle || "Library"}</div>
          <div className="text-sm text-zinc-400 mt-1">
            Browse, search, and manage your saved entries.
          </div>

          <div className="mt-4">
            <SearchBoxImpl
              value={query}
              onChange={setQuery}
              placeholder={searchPlaceholder || "Search…"}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="text-sm text-zinc-400">{T.sort || "Sort:"}</div>
              <button
                type="button"
                className={
                  "z-pill " +
                  (sortDir === "newest" ? "z-pill-active" : "z-pill-muted")
                }
                onClick={() => setSortDir("newest")}
              >
                {T.newest || "Newest"}
              </button>
              <button
                type="button"
                className={
                  "z-pill " +
                  (sortDir === "oldest" ? "z-pill-active" : "z-pill-muted")
                }
                onClick={() => setSortDir("oldest")}
              >
                {T.oldest || "Oldest"}
              </button>
            </div>

            <button
              type="button"
              className="z-btn z-btn-primary"
              onClick={onOpenAddForm}
            >
              {T.addEntry || "Add Entry"}
            </button>
          </div>

          <div className="mt-5 z-card p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-zinc-400 tracking-wider">CATEGORY</div>

              <div className="flex items-center gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="z-select"
                  aria-label="Category filter"
                >
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <div className="text-sm text-zinc-400 whitespace-nowrap">
                  {shownCount} / {totalCount} entries
                </div>
              </div>
            </div>

            <div className="mt-3 text-sm text-zinc-400">
              Tip: Lithuanian often changes word endings instead of adding extra words. You
              don’t need to memorise the rules — focus on recognising patterns over time.
            </div>
          </div>
        </div>

        {/* LIST */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto overscroll-contain mt-4 pb-24"
        >
          {sorted.length === 0 ? (
            <div className="text-sm text-zinc-400 mt-6">
              No entries match your search.
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((r) => {
                const id = r?.id || r?._id;

                const hasNotes = !!String(r?.Notes || "").trim();

                const displayedPhonetic =
                  phoneticsMode === "ipa"
                    ? (String(r?.PhoneticIPA || "").trim() ||
                        String(r?.Phonetic || "").trim())
                    : String(r?.Phonetic || "").trim();

                // Compact list style: we keep the existing card shell here
                // (EntryCard is used elsewhere too, but this view has a bespoke layout)
                return (
                  <div key={id} className="z-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-lg font-semibold text-emerald-300">
                          {String(r?.Lithuanian || "").trim()}
                        </div>
                        <div className="text-sm text-zinc-200 mt-1">
                          {String(r?.English || "").trim()}
                        </div>

                        {displayedPhonetic ? (
                          <div className="mt-2 text-sm text-zinc-400 italic">
                            {displayedPhonetic}
                          </div>
                        ) : null}

                        {hasNotes ? (
                          <div className="mt-3 text-sm text-zinc-400 line-clamp-3">
                            {String(r?.Notes || "").trim()}
                          </div>
                        ) : null}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          type="button"
                          className="z-iconbtn"
                          onClick={() => playText?.(String(r?.Lithuanian || "").trim())}
                          aria-label="Play"
                          title="Play"
                        >
                          ▶
                        </button>

                        <button
                          type="button"
                          className="z-iconbtn"
                          onClick={() => onEditRow?.(id)}
                          aria-label="Edit"
                          title="Edit"
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          className="z-iconbtn"
                          onClick={() => removePhrase?.(id)}
                          aria-label="Delete"
                          title="Delete"
                        >
                          ⋯
                        </button>
                      </div>
                    </div>

                    {/* Full EntryCard expansion (optional) */}
                    {/* If you want the full expand/collapse behaviour here instead of preview,
                        swap this custom shell for <EntryCard ... /> later. */}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
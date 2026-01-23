import React, { useMemo, useState } from "react";

function safeStr(v) {
  return String(v || "").trim();
}

function normForSearch(s) {
  return safeStr(s).toLowerCase();
}

function CategoryPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      data-press
      onClick={onClick}
      className={
        "z-pill " +
        (active ? "z-pill-active" : "hover:bg-white/5 hover:text-zinc-100")
      }
    >
      {label}
    </button>
  );
}

export default function LibraryView({
  T,
  rows,
  setRows,
  normalizeRag,
  SearchBox,
  searchPlaceholder,
  playText,
  removePhrase,
  onEditRow,
  onOpenAddForm,
}) {
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    const set = new Set();
    (rows || []).forEach((r) => {
      const c = safeStr(r.category);
      if (c) set.add(c);
    });
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return ["All", ...list];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const base = Array.isArray(rows) ? rows : [];

    const byCategory =
      category === "All"
        ? base
        : base.filter((r) => safeStr(r.category) === category);

    // Hard-lock: Oldest -> Newest
    return [...byCategory].sort((a, b) => (a._ts || 0) - (b._ts || 0));
  }, [rows, category]);

  const countLabel = useMemo(() => {
    const total = Array.isArray(rows) ? rows.length : 0;
    const shown = Array.isArray(filteredRows) ? filteredRows.length : 0;
    return `${shown} / ${total} entries`;
  }, [rows, filteredRows]);

  const CategoryRow = () => (
    <div className="z-card p-3 sm:p-4">
      <div className="z-inset p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-xs text-zinc-400 uppercase tracking-wide">
              {T.category || "Category"}
            </div>

            <select
              className="z-input !py-1.5 !px-3 !rounded-2xl w-auto min-w-[180px]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-zinc-400">{countLabel}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="z-page z-page-y pb-28 space-y-4">
      {/* Title + Add */}
      <div className="pt-3">
        <h2 className="z-title">{T.libraryTitle || "Library"}</h2>
        <p className="z-subtitle mt-1">
          Browse, search, and manage your saved entries.
        </p>

        <div className="mt-4">
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
            + {T.addEntry || "Add Entry"}
          </button>
        </div>
      </div>

      {/* Search (moved under title/add, above category) */}
      <div className="mt-2 z-card p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          {SearchBox ? (
            <SearchBox placeholder={searchPlaceholder || T.search || "Search…"} />
          ) : null}

          {/* No sort UI (locked to Oldest -> Newest) */}
          <div className="text-xs text-zinc-500">
            Showing entries from oldest to newest.
          </div>
        </div>
      </div>

      {/* Category */}
      <CategoryRow />

      {/* List */}
      <div className="space-y-3">
        {filteredRows.map((r) => (
          <EntryCard
            key={r._id || r.id}
            row={r}
            normalizeRag={normalizeRag}
            T={T}
            playText={playText}
            removePhrase={removePhrase}
            onEditRow={onEditRow}
          />
        ))}
      </div>
    </div>
  );
}

function EntryCard({
  row,
  normalizeRag,
  T,
  playText,
  removePhrase,
  onEditRow,
}) {
  const [expanded, setExpanded] = useState(false);

  const id = row._id || row.id;
  const en = row.english || row.en || "";
  const lt = row.lithuanian || row.lt || "";
  const phon = row.phonetic || row.phon || "";
  const notes = row.notes || "";

  const rag = normalizeRag ? normalizeRag(row.rag) : row.rag;

  const hasDetails =
    safeStr(phon).length > 0 || safeStr(notes).length > 0 || safeStr(rag).length > 0;

  return (
    <div className="z-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <button
          type="button"
          data-press
          className="
            w-12 h-12 rounded-2xl
            bg-emerald-600/20 hover:bg-emerald-600/30
            border border-emerald-500/20
            flex items-center justify-center
            shrink-0
          "
          onClick={() => playText?.(lt)}
          aria-label="Play Lithuanian"
        >
          <div className="text-emerald-200 text-lg">▶</div>
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-[16px] font-semibold text-emerald-200 leading-snug">
            {safeStr(lt) || "—"}
          </div>
          <div className="text-sm text-zinc-200 mt-1">{safeStr(en) || "—"}</div>

          {safeStr(phon) ? (
            <div className="text-xs text-zinc-500 italic mt-1">
              {safeStr(phon)}
            </div>
          ) : null}
        </div>

        <div className="flex items-start gap-2 shrink-0">
          {hasDetails ? (
            <button
              type="button"
              data-press
              className="z-btn z-btn-quiet px-3 py-2 rounded-2xl text-xs"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? T.hideDetails || "Hide" : T.showDetails || "Details"}
            </button>
          ) : null}

          <button
            type="button"
            data-press
            className="z-btn z-btn-quiet px-3 py-2 rounded-2xl text-xs"
            onClick={() => onEditRow?.(id)}
          >
            {T.edit || "Edit"}
          </button>

          <button
            type="button"
            data-press
            className="z-btn z-btn-quiet px-3 py-2 rounded-2xl text-xs text-red-300 hover:text-red-200"
            onClick={() => removePhrase?.(id)}
          >
            {T.delete || "Delete"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 z-inset p-4 space-y-3">
          {safeStr(rag) ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-400">
                {T.ragLabel || "RAG"}
              </div>
              <div className="text-sm text-zinc-200 mt-1">{safeStr(rag)}</div>
            </div>
          ) : null}

          {safeStr(notes) ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-400">
                {T.notes || "Notes"}
              </div>
              <div className="text-sm text-zinc-200 mt-1 whitespace-pre-wrap">
                {safeStr(notes)}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
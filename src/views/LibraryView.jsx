// src/views/LibraryView.jsx
import React, { useMemo, useState } from "react";
import { useSyncExternalStore } from "react";
import { searchStore } from "../searchStore";

/**
 * LibraryView
 *
 * Combines:
 * - Starter packs / import / clear / duplicate tools
 * - Full phrase list with RAG, audio and delete
 *
 * This lives under the "Library" tab. Search + sort are controlled globally by
 * SearchDock via `searchStore` + the `sortMode` prop.
 */
export default function LibraryView({
  T,
  rows,
  setRows,
  fetchStarter,
  installNumbersOnly,
  importJsonFile,
  clearLibrary,
  dupeResults,
  scanDupes,
  normalizeRag,
  sortMode,
  direction,
  playText,
  removePhrase,
}) {
  const [activeSheet, setActiveSheet] = useState("Phrases");

  // Global search text from SearchDock
  const qFilter = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );
  const qNorm = (qFilter || "").trim().toLowerCase();

  const filteredRows = useMemo(() => {
    let base = rows;
    if (activeSheet) {
      base = base.filter((r) => r.Sheet === activeSheet);
    }
    if (qNorm) {
      base = base.filter((r) => {
        const en = (r.English || "").toLowerCase();
        const lt = (r.Lithuanian || "").toLowerCase();
        return en.includes(qNorm) || lt.includes(qNorm);
      });
    }

    if (sortMode === "Newest") {
      return [...base].sort((a, b) => (b._ts || 0) - (a._ts || 0));
    }
    if (sortMode === "Oldest") {
      return [...base].sort((a, b) => (a._ts || 0) - (b._ts || 0));
    }

    const order = { "🔴": 0, "🟠": 1, "🟢": 2 };
    return [...base].sort(
      (a, b) =>
        (order[normalizeRag(a["RAG Icon"])] ?? 1) -
        (order[normalizeRag(b["RAG Icon"])] ?? 1)
    );
  }, [rows, activeSheet, qNorm, sortMode, normalizeRag]);

  const totalCount = rows.length;
  const sheetCounts = useMemo(() => {
    const counts = { Phrases: 0, Questions: 0, Words: 0, Numbers: 0 };
    for (const r of rows) {
      const s = r.Sheet || "Phrases";
      if (counts[s] != null) counts[s]++;
    }
    return counts;
  }, [rows]);

  function onImportClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) importJsonFile(file);
    };
    input.click();
  }

  function toggleRag(id) {
    setRows((prev) =>
      prev.map((r) => {
        if (r._id !== id) return r;
        const current = normalizeRag(r["RAG Icon"]);
        const next = current === "🔴" ? "🟠" : current === "🟠" ? "🟢" : "🔴";
        return { ...r, "RAG Icon": next };
      })
    );
  }

  const showLtAudio = direction === "EN2LT";

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-24">
      {/* spacer for header + dock */}
      <div style={{ height: 56 + 112 }} />

      {/* Header row */}
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold">{T.libraryTitle}</h2>
          <p className="text-sm text-zinc-400">
            {totalCount} {T.phrases.toLowerCase()} total
          </p>
        </div>
      </div>

      {/* Sheet tabs */}
      <div className="inline-flex rounded-full bg-zinc-900 border border-zinc-800 p-1 mb-4">
        {["Phrases", "Questions", "Words", "Numbers"].map((sheet) => {
          const active = activeSheet === sheet;
          return (
            <button
              key={sheet}
              type="button"
              className={
                "px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-full transition " +
                (active
                  ? "bg-emerald-500 text-black font-semibold"
                  : "text-zinc-300 hover:bg-zinc-800")
              }
              onClick={() => setActiveSheet(sheet)}
            >
              {T[sheet.toLowerCase()] || sheet}{" "}
              <span className="text-[11px] text-zinc-300/80">
                ({sheetCounts[sheet] || 0})
              </span>
            </button>
          );
        })}
      </div>

      {/* Starter / import tools */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-sm font-semibold mb-2">{T.installEN}</h3>
          <p className="text-xs text-zinc-400 mb-2">
            EN → LT core phrases for everyday practice.
          </p>
          <button
            type="button"
            onClick={() => fetchStarter("EN2LT")}
            className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm font-medium"
          >
            {T.installEN}
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-sm font-semibold mb-2">{T.installLT}</h3>
          <p className="text-xs text-zinc-400 mb-2">
            LT → EN phrases for reverse practice.
          </p>
          <button
            type="button"
            onClick={() => fetchStarter("LT2EN")}
            className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm font-medium"
          >
            {T.installLT}
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-sm font-semibold mb-2">{T.installNums}</h3>
          <p className="text-xs text-zinc-400 mb-2">
            Numbers pack only – handy if you already have phrases.
          </p>
          <button
            type="button"
            onClick={installNumbersOnly}
            className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm font-medium"
          >
            {T.installNums}
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-sm font-semibold mb-2">{T.importJSON}</h3>
          <p className="text-xs text-zinc-400 mb-3">
            Import or merge another JSON library export.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onImportClick}
              className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm"
            >
              {T.importJSON}
            </button>
            <button
              type="button"
              onClick={clearLibrary}
              className="px-3 py-2 rounded-md bg-red-600/80 hover:bg-red-500 text-sm"
            >
              {T.clearAll}
            </button>
          </div>
        </div>
      </div>

      {/* Duplicate finder */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3 gap-3">
          <div>
            <h3 className="text-sm font-semibold">{T.dupFinder}</h3>
            <p className="text-xs text-zinc-400">
              Scan for exact or near-duplicate entries.
            </p>
          </div>
          <button
            type="button"
            onClick={scanDupes}
            className="px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-xs font-medium"
          >
            {T.scan}
          </button>
        </div>

        {dupeResults.exact.length === 0 &&
          dupeResults.close.length === 0 && (
            <p className="text-xs text-zinc-500">
              No duplicates found yet. Run a scan after importing or adding
              more phrases.
            </p>
          )}

        {dupeResults.exact.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold mb-1">
              {T.exactGroups} ({dupeResults.exact.length})
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
              {dupeResults.exact.map((group, idx) => (
                <div
                  key={idx}
                  className="border border-zinc-800 rounded-md p-2"
                >
                  {group.map((i) => {
                    const r = rows[i];
                    if (!r) return null;
                    return (
                      <div key={r._id || i} className="flex items-center gap-2">
                        <span className="text-zinc-400 text-[11px]">
                          #{i}
                        </span>
                        <span className="flex-1">
                          {(r.English || "").slice(0, 80)}
                          {r.English && r.English.length > 80 && "…"}
                        </span>
                        <button
                          type="button"
                          className="text-[11px] text-red-400 hover:text-red-300"
                          onClick={() =>
                            removePhrase(r._id || i)
                          }
                        >
                          {T.delete}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {dupeResults.close.length > 0 && (
          <div className="mt-3">
            <div className="text-xs font-semibold mb-1">
              {T.closeMatches} ({dupeResults.close.length})
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-[11px]">
              {dupeResults.close.map(([ai, bi, sim], idx) => {
                const A = rows[ai];
                const B = rows[bi];
                if (!A || !B) return null;
                return (
                  <div
                    key={idx}
                    className="border border-zinc-800 rounded-md p-2 space-y-1"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-zinc-400">
                        {T.similarity}: {(sim * 100).toFixed(0)}%
                      </span>
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => removePhrase(B._id || bi)}
                      >
                        {T.removeSelected}
                      </button>
                    </div>
                    <div>
                      <span className="text-emerald-400">A:</span>{" "}
                      {(A.English || "").slice(0, 80)}
                    </div>
                    <div>
                      <span className="text-amber-400">B:</span>{" "}
                      {(B.English || "").slice(0, 80)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Phrase list */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">
          {T[activeSheet.toLowerCase()] || activeSheet} ·{" "}
          {filteredRows.length} / {sheetCounts[activeSheet] || 0}
        </h3>
        <p className="text-xs text-zinc-400">
          {sortMode === "Newest"
            ? T.newest
            : sortMode === "Oldest"
            ? T.oldest
            : T.rag}
        </p>
      </div>

      {filteredRows.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No entries here yet. Try installing a starter pack or adding a new
          entry from the Home view.
        </p>
      ) : (
        <div className="space-y-2">
          {filteredRows.map((r) => (
            <article
              key={r._id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <button
                    type="button"
                    className="w-6 h-6 rounded-full border border-zinc-700 text-sm flex items-center justify-center"
                    title={T.ragLabel}
                    onClick={() => toggleRag(r._id)}
                  >
                    {normalizeRag(r["RAG Icon"])}
                  </button>
                  {r.Category && (
                    <span className="text-[11px] uppercase tracking-wide text-zinc-400">
                      {r.Category}
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold truncate">
                  {r.English || "—"}
                </div>
                <div className="text-sm text-emerald-300 truncate">
                  {r.Lithuanian || "—"}
                </div>
                {r.Phonetic && (
                  <div className="text-[11px] text-zinc-400 italic truncate">
                    {r.Phonetic}
                  </div>
                )}
                {(r.Usage || r.Notes) && (
                  <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                    {r.Usage || r.Notes}
                  </div>
                )}
              </div>

              <div className="flex flex-row sm:flex-col gap-1 items-end sm:items-stretch mt-1 sm:mt-0">
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-xs font-medium"
                  onClick={() =>
                    playText(
                      showLtAudio ? r.Lithuanian || "" : r.English || ""
                    )
                  }
                >
                  ▶ {showLtAudio ? "LT" : "EN"}
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-medium"
                  onClick={() => removePhrase(r._id)}
                >
                  {T.delete}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

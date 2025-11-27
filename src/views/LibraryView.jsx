import React, { useMemo, useState, useSyncExternalStore } from "react";
import { searchStore } from "../searchStore";

export default function LibraryView({
  T,
  rows,
  setRows,
  normalizeRag,
  sortMode,
  direction,
  playText,
  removePhrase,
  onEditRow, // provided by App.jsx
}) {
  const [expanded, setExpanded] = useState(new Set());

  const qFilter = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );
  const qNorm = (qFilter || "").trim().toLowerCase();

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

  function toggleExpand(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function cycleRag(id) {
    setRows((prev) =>
      prev.map((r) => {
        if (r._id !== id) return r;
        const current = normalizeRag(r["RAG Icon"]);
        const next = current === "🔴" ? "🟠" : current === "🟠" ? "🟢" : "🔴";
        return { ...r, "RAG Icon": next };
      })
    );
  }

  // Long-press handler for audio, with extra guards to avoid text selection.
  function pressHandlers(text) {
    let timer = null;
    let firedSlow = false;
    let pressed = false;

    const start = (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const ae = document.activeElement;
        if (ae && typeof ae.blur === "function") ae.blur();
      } catch {}
      firedSlow = false;
      pressed = true;
      timer = setTimeout(() => {
        if (!pressed) return;
        firedSlow = true;
        playText(text, { slow: true });
      }, 550);
    };

    const finish = (e) => {
      e.preventDefault();
      e.stopPropagation();
      pressed = false;
      if (timer) clearTimeout(timer);
      timer = null;
      if (!firedSlow) playText(text);
    };

    const cancel = (e) => {
      e.preventDefault?.();
      e.stopPropagation?.();
      pressed = false;
      if (timer) clearTimeout(timer);
      timer = null;
    };

    return {
      onPointerDown: start,
      onPointerUp: finish,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onContextMenu: (e) => e.preventDefault(),
    };
  }

  const showLtAudio = direction === "EN2LT";

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-28">
      <h2 className="text-2xl font-bold mb-4">{T.libraryTitle}</h2>

      <div className="mb-3 text-sm text-zinc-400">
        {filteredRows.length} / {rows.length} {T.phrases.toLowerCase()}
      </div>

      {filteredRows.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No entries match your search.
        </p>
      ) : (
        <div className="space-y-2">
          {filteredRows.map((r) => {
            const isOpen = expanded.has(r._id);
            const textToPlay = showLtAudio
              ? r.Lithuanian || ""
              : r.English || "";

            return (
              <article
                key={r._id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"
              >
                {/* Top Row */}
                <div className="flex items-start gap-3">
                  {/* RAG */}
                  <button
                    type="button"
                    className="w-6 h-6 rounded-full border border-zinc-700 text-sm flex items-center justify-center select-none"
                    onClick={() => cycleRag(r._id)}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                  >
                    {normalizeRag(r["RAG Icon"])}
                  </button>

                  {/* Text */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => toggleExpand(r._id)}
                  >
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
                    {(r.Usage || r.Notes) && !isOpen && (
                      <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                        {r.Usage || r.Notes}
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-1 items-end">
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-xs font-medium select-none"
                      onMouseDown={(e) => e.preventDefault()}
                      {...pressHandlers(textToPlay)}
                    >
                      ▶ {showLtAudio ? "LT" : "EN"}
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-medium select-none"
                      onClick={() => onEditRow && onEditRow(r._id)}
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.preventDefault()}
                    >
                      {T.edit}
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-md bg-red-600/80 hover:bg-red-500 text-xs font-medium select-none"
                      onClick={() => {
                        if (window.confirm(T.confirm)) {
                          removePhrase(r._id);
                        }
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.preventDefault()}
                    >
                      {T.delete}
                    </button>
                  </div>
                </div>

                {/* Expanded Section */}
                {isOpen && (
                  <div className="mt-3 text-xs text-zinc-300 space-y-2 border-t border-zinc-800 pt-2">
                    {r.Usage && (
                      <div>
                        <span className="text-zinc-500">
                          {T.usage}:{" "}
                        </span>
                        {r.Usage}
                      </div>
                    )}
                    {r.Notes && (
                      <div>
                        <span className="text-zinc-500">
                          {T.notes}:{" "}
                        </span>
                        {r.Notes}
                      </div>
                    )}
                    {r.Category && (
                      <div>
                        <span className="text-zinc-500">
                          {T.category}:{" "}
                        </span>
                        {r.Category}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

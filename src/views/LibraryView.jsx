import React, { useMemo, useState, useSyncExternalStore } from "react";
import { searchStore } from "../searchStore";
import { CATEGORIES } from "../constants/categories";

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
  const [tab, setTab] = useState("Phrases");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const qFilter = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );
  const qNorm = (qFilter || "").trim().toLowerCase();

  /* FILTERING LOGIC */
  const filteredRows = useMemo(() => {
    let base = rows;

    // Search filter
    if (qNorm) {
      base = base.filter((r) => {
        const en = (r.English || "").toLowerCase();
        const lt = (r.Lithuanian || "").toLowerCase();
        return en.includes(qNorm) || lt.includes(qNorm);
      });
    }

    // Sheet filter
    base = base.filter((r) => r.Sheet === tab);

    // Category filter
    if (categoryFilter !== "ALL") {
      base = base.filter(
        (r) => (r.Category || "General") === categoryFilter
      );
    }

    // Sorting
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
  }, [rows, qNorm, sortMode, tab, categoryFilter, normalizeRag]);

  /* SHEET TABS */
  function TabControl() {
    const options = ["Phrases", "Questions", "Words", "Numbers"];

    return (
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] p-1 flex">
        {options.map((opt) => {
          const active = tab === opt;
          return (
            <button
              key={opt}
              type="button"
              className={
                "flex-1 px-3 py-2 text-sm font-medium rounded-full transition select-none " +
                (active
                  ? "bg-emerald-500 text-black shadow"
                  : "text-zinc-300 hover:bg-zinc-800/60")
              }
              onClick={() => setTab(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  /* CATEGORY FILTER */
  function CategoryFilter() {
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className={
            "px-3 py-1.5 text-xs rounded-full border transition select-none " +
            (categoryFilter === "ALL"
              ? "bg-emerald-500 text-black border-emerald-500"
              : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800")
          }
          onClick={() => setCategoryFilter("ALL")}
        >
          All
        </button>

        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={
              "px-3 py-1.5 text-xs rounded-full border transition select-none " +
              (categoryFilter === cat
                ? "bg-emerald-500 text-black border-emerald-500"
                : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800")
            }
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    );
  }

  /* AUDIO HANDLERS */
  function pressHandlers(text) {
    let timer = null;
    let firedSlow = false;
    let pressed = false;

    const start = (e) => {
      e.preventDefault();
      e.stopPropagation();
      pressed = true;
      firedSlow = false;
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

    const cancel = () => {
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

  function getAudioText(r) {
    return r.Lithuanian || "";
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-28">
      <h2 className="text-2xl font-bold">{T.libraryTitle}</h2>

      {typeof onOpenAddForm === "function" && (
        <button
          className="mt-3 mb-3 bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold shadow hover:bg-emerald-400 active:bg-emerald-300 transition-transform active:scale-95 select-none"
          onClick={onOpenAddForm}
        >
          + Add Entry
        </button>
      )}

      <div className="mt-1 mb-3 text-sm text-zinc-400">
        {filteredRows.length} / {rows.length} entries
      </div>

      <div className="mb-4">
        <TabControl />
        <CategoryFilter />
      </div>

      {filteredRows.length === 0 ? (
        <p className="text-sm text-zinc-400">No entries match your filters.</p>
      ) : (
        <div className="space-y-3">
          {filteredRows.map((r) => {
            const isOpen = expanded.has(r._id);
            const textToPlay = getAudioText(r);

            return (
              <article
                key={r._id}
                className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 shadow-[0_0_12px_rgba(0,0,0,0.15)]"
              >
                {/* TEXT + EXPANSION */}
                <div
                  className="flex flex-col md:flex-row gap-3 cursor-pointer"
                  onClick={() =>
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      next.has(r._id) ? next.delete(r._id) : next.add(r._id);
                      return next;
                    })
                  }
                >
                  {/* RAG ICON */}
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full border border-zinc-700 text-sm flex items-center justify-center bg-zinc-950/60 hover:bg-zinc-800/60 select-none shrink-0"
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
                    <div className="text-sm font-semibold break-words">
                      {r.English || "—"}
                    </div>
                    <div className="text-sm text-emerald-300 break-words">
                      {r.Lithuanian || "—"}
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-3 text-xs text-zinc-300 space-y-2 border-t border-zinc-800 pt-2">
                    {r.Usage && (
                      <div>
                        <span className="text-zinc-500">{T.usage}: </span>
                        {r.Usage}
                      </div>
                    )}
                    {r.Notes && (
                      <div>
                        <span className="text-zinc-500">{T.notes}: </span>
                        {r.Notes}
                      </div>
                    )}
                    {r.Category && (
                      <div>
                        <span className="text-zinc-500">{T.category}: </span>
                        {r.Category}
                      </div>
                    )}
                  </div>
                )}

                {/* MOBILE ACTION BAR */}
                <div className="md:hidden flex justify-center gap-4 mt-5">
                  <button
                    className="bg-emerald-500 text-black rounded-full px-5 py-2 text-[18px]"
                    {...pressHandlers(textToPlay)}
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

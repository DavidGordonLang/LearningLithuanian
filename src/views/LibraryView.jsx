import React, { useMemo, useState, useSyncExternalStore } from "react";
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
  const [tab, setTab] = useState("Phrases");

  const qFilter = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );
  const qNorm = (qFilter || "").trim().toLowerCase();

  /* FILTERING: search → sheet → sort */
  const filteredRows = useMemo(() => {
    let base = rows;

    if (qNorm) {
      base = base.filter((r) => {
        const en = (r.English || "").toLowerCase();
        const lt = (r.Lithuanian || "").toLowerCase();
        return en.includes(qNorm) || lt.includes(qNorm);
      });
    }

    base = base.filter((r) => r.Sheet === tab);

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
  }, [rows, qNorm, sortMode, tab, normalizeRag]);

  /* TAB CONTROL */
  function TabControl() {
    const options = ["Phrases", "Questions", "Words", "Numbers"];
    return (
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] p-1 flex">
        {options.map((opt, idx) => {
          const active = tab === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setTab(opt)}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              className={
                "flex-1 px-3 py-2 rounded-xl text-sm font-medium transition select-none " +
                (active
                  ? "bg-emerald-600 text-black shadow"
                  : "text-zinc-300 hover:bg-zinc-800/60")
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  /* AUDIO HANDLERS (tap = normal, long press = slow) */
  function pressHandlers(text) {
    let timer = null;
    let firedSlow = false;
    let pressed = false;

    const start = (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        document.activeElement?.blur?.();
      } catch {}
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

  function getAudioText(r) {
    return r.Lithuanian || "";
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-28">
      <h2 className="text-2xl font-bold">{T.libraryTitle}</h2>

      {/* Add Entry button */}
      {typeof onOpenAddForm === "function" && (
        <button
          className="mt-3 mb-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-semibold select-none shadow"
          onClick={() => onOpenAddForm()}
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
        >
          + Add Entry
        </button>
      )}

      <div className="mt-1 mb-3 text-sm text-zinc-400">
        {filteredRows.length} / {rows.length} entries
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <TabControl />
      </div>

      {filteredRows.length === 0 ? (
        <p className="text-sm text-zinc-400">No entries match your search.</p>
      ) : (
        <div className="space-y-3">
          {filteredRows.map((r) => {
            const isOpen = expanded.has(r._id);
            const textToPlay = getAudioText(r);

            return (
              <article
                key={r._id}
                className="
                  bg-zinc-900/95 
                  border border-zinc-800 
                  rounded-2xl 
                  p-3 
                  shadow-[0_0_12px_rgba(0,0,0,0.15)]
                "
              >
                <div className="flex items-start gap-3">
                  {/* RAG ICON */}
                  <button
                    type="button"
                    className="w-7 h-7 rounded-full border border-zinc-700 text-sm flex items-center justify-center select-none bg-zinc-950/60 hover:bg-zinc-800/60"
                    onClick={() =>
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
                      )
                    }
                  >
                    {normalizeRag(r["RAG Icon"])}
                  </button>

                  {/* TEXT */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() =>
                      setExpanded((prev) => {
                        const next = new Set(prev);
                        next.has(r._id) ? next.delete(r._id) : next.add(r._id);
                        return next;
                      })
                    }
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

                  {/* ACTIONS */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Play */}
                    <button
                      type="button"
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-lg select-none shadow-sm"
                      {...pressHandlers(textToPlay)}
                    >
                      ▶
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-base select-none"
                      onClick={() => onEditRow(r._id)}
                    >
                      ✏️
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-600/80 hover:bg-red-500 text-white text-lg select-none"
                      onClick={() => {
                        if (window.confirm(T.confirm)) removePhrase(r._id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* EXPANDED CONTENT */}
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
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

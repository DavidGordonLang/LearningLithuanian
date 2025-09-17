// src/components/EntryCard.jsx
import React, { useEffect } from "react";

let flashStylesInjected = false;
function ensureFlashStyles() {
  if (flashStylesInjected) return;
  const css = `
  /* Quick ramp-up (~12%), long fade-out */
  @keyframes ll-flash-soft {
    0%   { background-color: rgba(16,185,129,0); }
    12%  { background-color: rgba(16,185,129,0.20); } /* fast in */
    100% { background-color: rgba(16,185,129,0); }    /* slow out */
  }
  .ll-flash-soft {
    animation: ll-flash-soft 1200ms cubic-bezier(.2,.8,.2,1) forwards;
  }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
  flashStylesInjected = true;
}

export default function EntryCard({
  r,
  idx,
  rows,
  setRows,
  editIdx,
  setEditIdx,
  editDraft,
  setEditDraft,
  expanded,
  setExpanded,
  T,
  direction, // "EN2LT" or "LT2EN"
  startEdit,
  saveEdit,
  remove,
  normalizeRag,
  pressHandlers,
  cn,
  flashId, // id to flash when just added
}) {
  const isEditing = editIdx === idx;
  const isExpanded = expanded?.has?.(idx);

  const rag = normalizeRag(r["RAG Icon"]);
  const sheet = r.Sheet || "Phrases";

  // Which side are we "learning"? (what the big play button should speak)
  const learnLT = direction === "EN2LT";
  const sourceText = learnLT ? r.English : r.Lithuanian;
  const targetText = learnLT ? r.Lithuanian : r.English;

  function toggleExpanded() {
    const next = new Set(expanded);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpanded(next);
  }

  // Simple premium flash (soft tint only, no ring/pulse)
  const isFlashing = r._id && flashId && r._id === flashId;
  useEffect(() => {
    if (isFlashing) ensureFlashStyles();
  }, [isFlashing]);

  // --- EDITING VIEW ---
  if (isEditing) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-zinc-400 mb-1">{T.english}</div>
            <input
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={editDraft.English}
              onChange={(e) =>
                setEditDraft((d) => ({ ...d, English: e.target.value }))
              }
            />
          </div>
          <div>
            <div className="text-xs text-zinc-400 mb-1">{T.lithuanian}</div>
            <input
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={editDraft.Lithuanian}
              onChange={(e) =>
                setEditDraft((d) => ({ ...d, Lithuanian: e.target.value }))
              }
            />
          </div>
          <div>
            <div className="text-xs text-zinc-400 mb-1">{T.phonetic}</div>
            <input
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={editDraft.Phonetic}
              onChange={(e) =>
                setEditDraft((d) => ({ ...d, Phonetic: e.target.value }))
              }
            />
          </div>
          <div>
            <div className="text-xs text-zinc-400 mb-1">{T.category}</div>
            <input
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={editDraft.Category}
              onChange={(e) =>
                setEditDraft((d) => ({ ...d, Category: e.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs text-zinc-400 mb-1">{T.usage}</div>
            <input
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={editDraft.Usage}
              onChange={(e) =>
                setEditDraft((d) => ({ ...d, Usage: e.target.value }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs text-zinc-400 mb-1">{T.notes}</div>
            <textarea
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              rows={3}
              value={editDraft.Notes}
              onChange={(e) =>
                setEditDraft((d) => ({ ...d, Notes: e.target.value }))
              }
            />
          </div>
          <div>
            <div className="text-xs text-zinc-400 mb-1">{T.ragLabel}</div>
            <select
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-2"
              value={editDraft["RAG Icon"]}
              onChange={(e) =>
                setEditDraft((d) => ({ ...d, "RAG Icon": e.target.value }))
              }
            >
              {["🔴", "🟠", "🟢"].map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs text-zinc-400 mb-1">{T.sheet}</div>
            <select
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-2"
              value={editDraft.Sheet}
              onChange={(e) =>
                setEditDraft((d) => ({ ...d, Sheet: e.target.value }))
              }
            >
              {["Phrases", "Questions", "Words", "Numbers"].map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md text-sm font-semibold"
            onClick={() => saveEdit(idx)}
          >
            {T.save}
          </button>
          <button
            className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
            onClick={() => setEditIdx(null)}
          >
            {T.cancel}
          </button>
        </div>
      </div>
    );
  }

  // --- READ-ONLY VIEW ---
  return (
    <div className={cn("relative bg-zinc-900 border border-zinc-800 rounded-xl p-3 transition-colors")}>
      {/* Soft highlight overlay (no ring, no pulse) */}
      {isFlashing && (
        <>
          {ensureFlashStyles()}
          <span className="pointer-events-none absolute inset-0 rounded-xl ll-flash-soft" />
        </>
      )}

      <div className="flex items-start gap-3">
        {/* RAG + Sheet */}
        <div className="mt-0.5 shrink-0">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800">
            {rag}
          </span>
        </div>

        {/* Texts */}
        <div className="flex-1">
          {/* Row: source → target */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="text-xs text-zinc-400">
                {learnLT ? T.english : T.lithuanian}
              </div>
              <div className="text-sm">{sourceText || "—"}</div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-zinc-400">
                {learnLT ? T.lithuanian : T.english}
              </div>
              <div className="text-sm font-medium">{targetText || "—"}</div>
            </div>

            {/* Primary play button -> always speak TARGET side */}
            <button
              className={cn(
                "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-semibold",
                targetText
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
              title={
                targetText
                  ? "Tap = play, long-press = slow"
                  : "No text to play"
              }
              disabled={!targetText}
              {...(targetText ? pressHandlers(targetText) : {})}
            >
              ►
            </button>
          </div>

          {/* Details */}
          {isExpanded && (
            <div className="mt-2 text-xs text-zinc-300 space-y-1">
              {r.Phonetic && (
                <div>
                  <span className="text-zinc-500">{T.phonetic}: </span>
                  {r.Phonetic}
                </div>
              )}
              {r.Category && (
                <div>
                  <span className="text-zinc-500">{T.category}: </span>
                  {r.Category}
                </div>
              )}
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
              <div className="text-zinc-500">
                {T.sheet}: <span className="text-zinc-300">{sheet}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        <button
          className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
          onClick={toggleExpanded}
        >
          {isExpanded ? T.hideDetails : T.showDetails}
        </button>
        <button
          className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
          onClick={() => startEdit(idx)}
        >
          {T.edit}
        </button>
        <button
          className="bg-red-800/40 border border-red-600 text-red-300 px-3 py-2 rounded-md text-sm"
          onClick={() => remove(idx)}
        >
          {T.delete}
        </button>
      </div>
    </div>
  );
}

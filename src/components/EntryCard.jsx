// src/components/EntryCard.jsx
import React from "react";

export default function EntryCard({
  r,
  idx,
  editIdx,
  editDraft,
  setEditIdx,
  setEditDraft,
  expanded,
  setExpanded,
  T,
  direction,
  startEdit,
  saveEdit,
  remove,
  normalizeRag,
  pressHandlers,
  cn,
}) {
  const isEditing = editIdx === idx;
  const rag = normalizeRag(r["RAG Icon"]);
  const primary = direction === "EN2LT" ? r.Lithuanian : r.English;
  const secondary = direction === "EN2LT" ? r.English : r.Lithuanian;
  const speakText = direction === "EN2LT" ? r.Lithuanian : r.English;

  function PlayButton({ text, rag }) {
    const color =
      rag === "🔴"
        ? "bg-red-600 hover:bg-red-500"
        : rag === "🟢"
        ? "bg-green-600 hover:bg-green-500"
        : "bg-amber-500 hover:bg-amber-400";
    return (
      <button
        className={cn(
          "shrink-0 w-10 h-10 rounded-xl transition flex items-center justify-center font-semibold text-zinc-900",
          color
        )}
        title="Tap = play, long-press = slow"
        {...pressHandlers(text)}
      >
        ►
      </button>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      {!isEditing ? (
        <div className="flex items-start gap-2">
          <PlayButton text={speakText} rag={rag} />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-zinc-400 truncate">{secondary}</div>
            <div className="text-lg leading-tight font-medium break-words">{primary}</div>
            <div className="mt-1">
              <button
                onClick={() =>
                  setExpanded((prev) => {
                    const n = new Set(prev);
                    n.has(idx) ? n.delete(idx) : n.add(idx);
                    return n;
                  })
                }
                className="text-[11px] px-2 py-0.5 rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
              >
                {expanded.has(idx) ? T.hideDetails : T.showDetails}
              </button>
            </div>
            {expanded.has(idx) && (
              <>
                {r.Phonetic && <div className="text-xs text-zinc-400 mt-1">{r.Phonetic}</div>}
                {(r.Usage || r.Notes) && (
                  <div className="text-xs text-zinc-500 mt-1">
                    {r.Usage && (
                      <div className="mb-0.5">
                        <span className="text-zinc-400">{T.usage}: </span>
                        {r.Usage}
                      </div>
                    )}
                    {r.Notes && (
                      <div className="opacity-80">
                        <span className="text-zinc-400">{T.notes}: </span>
                        {r.Notes}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex flex-col gap-1 ml-2">
            <button
              onClick={() => startEdit(idx)}
              className="text-xs bg-zinc-800 px-2 py-1 rounded-md"
            >
              {T.edit}
            </button>
            <button
              onClick={() => remove(idx)}
              className="text-xs bg-zinc-800 text-red-400 px-2 py-1 rounded-md"
            >
              {T.delete}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
            <label className="col-span-2">
              {T.english}
              <input
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                value={editDraft.English}
                onChange={(e) => setEditDraft({ ...editDraft, English: e.target.value })}
              />
            </label>
            <label className="col-span-2">
              {T.lithuanian}
              <input
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                value={editDraft.Lithuanian}
                onChange={(e) => setEditDraft({ ...editDraft, Lithuanian: e.target.value })}
              />
            </label>
            <label>
              {T.phonetic}
              <input
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                value={editDraft.Phonetic}
                onChange={(e) => setEditDraft({ ...editDraft, Phonetic: e.target.value })}
              />
            </label>
            <label>
              {T.category}
              <input
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                value={editDraft.Category}
                onChange={(e) => setEditDraft({ ...editDraft, Category: e.target.value })}
              />
            </label>
            <label className="col-span-2">
              {T.usage}
              <input
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                value={editDraft.Usage}
                onChange={(e) => setEditDraft({ ...editDraft, Usage: e.target.value })}
              />
            </label>
            <label className="col-span-2">
              {T.notes}
              <input
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                value={editDraft.Notes}
                onChange={(e) => setEditDraft({ ...editDraft, Notes: e.target.value })}
              />
            </label>
            <label>
              {T.ragLabel}
              <select
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                value={editDraft["RAG Icon"]}
                onChange={(e) =>
                  setEditDraft({ ...editDraft, "RAG Icon": normalizeRag(e.target.value) })
                }
              >
                {["🔴", "🟠", "🟢"].map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {T.sheet}
              <select
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                value={editDraft.Sheet}
                onChange={(e) => setEditDraft({ ...editDraft, Sheet: e.target.value })}
              >
                {["Phrases", "Questions", "Words", "Numbers"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => saveEdit(idx)}
              className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md text-sm font-semibold"
            >
              {T.save}
            </button>
            <button
              onClick={() => setEditIdx(null)}
              className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
            >
              {T.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

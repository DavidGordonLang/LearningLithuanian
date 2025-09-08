import React from "react";

/**
 * EntryCard.jsx
 * Receives all handlers/state from App to keep this component dumb.
 *
 * Props:
 * - r, idx
 * - rows, setRows
 * - editIdx, setEditIdx, editDraft, setEditDraft
 * - expanded (Set), setExpanded
 * - T, direction
 * - startEdit(idx), saveEdit(idx), remove(idx)
 * - normalizeRag, pressHandlers, cn
 */
export default function EntryCard(props) {
  const {
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
    direction,
    startEdit,
    saveEdit,
    remove,
    normalizeRag,
    pressHandlers,
    cn,
  } = props;

  const keyId = r._id || String(idx);
  const isExpanded = expanded.has(keyId);
  const isEditing = editIdx === idx;

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) next.delete(keyId);
      else next.add(keyId);
      return next;
    });
  };

  const setField = (k) => (e) => setEditDraft((d) => ({ ...d, [k]: e.target.value }));

  const headerLangA = direction === "LT2EN" ? r.Lithuanian : r.English;
  const headerLangB = direction === "LT2EN" ? r.English : r.Lithuanian;

  const rag = normalizeRag(r["RAG Icon"]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
      {/* Header row */}
      <div className="flex items-center gap-2">
        <span className="shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-zinc-800">
          {rag}
        </span>

        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{headerLangA || <span className="text-zinc-500">—</span>}</div>
          <div className="text-sm text-zinc-400 truncate">{headerLangB || <span className="text-zinc-600">—</span>}</div>
        </div>

        {/* Play Lithuanian */}
        {r.Lithuanian ? (
          <button
            className="shrink-0 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center font-semibold"
            title="Tap = play, long-press = slow"
            {...pressHandlers(r.Lithuanian)}
          >
            ►
          </button>
        ) : null}
      </div>

      {/* Details / edit */}
      {!isEditing ? (
        <>
          {(r.Phonetic || r.Category || r.Usage || r.Notes) && (
            <div className={cn("mt-2 text-sm", isExpanded ? "" : "line-clamp-2")}>
              {r.Phonetic && (
                <div className="text-zinc-300">
                  <span className="text-zinc-500">{T.phonetic}: </span>
                  {r.Phonetic}
                </div>
              )}
              {r.Category && (
                <div className="text-zinc-300">
                  <span className="text-zinc-500">{T.category}: </span>
                  {r.Category}
                </div>
              )}
              {r.Usage && (
                <div className="text-zinc-300">
                  <span className="text-zinc-500">{T.usage}: </span>
                  {r.Usage}
                </div>
              )}
              {r.Notes && (
                <div className="text-zinc-300">
                  <span className="text-zinc-500">{T.notes}: </span>
                  {r.Notes}
                </div>
              )}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={toggleExpanded}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-md"
            >
              {isExpanded ? T.hideDetails : T.showDetails}
            </button>
            <div className="flex-1" />
            <button
              onClick={() => startEdit(idx)}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-md"
            >
              {T.edit}
            </button>
            <button
              onClick={() => remove(idx)}
              className="text-xs bg-red-800/40 border border-red-600 px-2 py-1 rounded-md text-red-200"
            >
              {T.delete}
            </button>
          </div>
        </>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <div className="text-xs mb-1">{T.english}</div>
              <input
                value={editDraft.English}
                onChange={setField("English")}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <div className="text-xs mb-1">{T.lithuanian}</div>
              <input
                value={editDraft.Lithuanian}
                onChange={setField("Lithuanian")}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <div className="text-xs mb-1">{T.phonetic}</div>
              <input
                value={editDraft.Phonetic}
                onChange={setField("Phonetic")}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <div className="text-xs mb-1">{T.category}</div>
              <input
                value={editDraft.Category}
                onChange={setField("Category")}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs mb-1">{T.usage}</div>
              <input
                value={editDraft.Usage}
                onChange={setField("Usage")}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs mb-1">{T.notes}</div>
              <textarea
                value={editDraft.Notes}
                onChange={setField("Notes")}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 min-h-[80px]"
              />
            </div>
            <div>
              <div className="text-xs mb-1">{T.ragLabel}</div>
              <select
                value={editDraft["RAG Icon"]}
                onChange={setField("RAG Icon")}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              >
                <option value="🔴">🔴 Red</option>
                <option value="🟠">🟠 Amber</option>
                <option value="🟢">🟢 Green</option>
              </select>
            </div>
            <div>
              <div className="text-xs mb-1">{T.sheet}</div>
              <select
                value={editDraft.Sheet}
                onChange={setField("Sheet")}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              >
                {["Phrases", "Questions", "Words", "Numbers"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => saveEdit(idx)}
              className="text-sm bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md font-semibold"
            >
              {T.save}
            </button>
            <button
              onClick={() => setEditIdx(null)}
              className="text-sm bg-zinc-800 px-3 py-2 rounded-md"
            >
              {T.cancel}
            </button>
            <div className="flex-1" />
            <button
              onClick={() => remove(idx)}
              className="text-xs bg-red-800/40 border border-red-600 px-2 py-1 rounded-md text-red-200"
            >
              {T.delete}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

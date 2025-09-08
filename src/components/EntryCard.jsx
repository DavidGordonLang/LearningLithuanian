import React from "react";

/**
 * EntryCard.jsx
 * - Shows one vocabulary row
 * - View mode: compact header + expandable details
 * - Edit mode: inline form, Save / Cancel / Delete
 * - Uses pressHandlers from parent for TTS (tap = normal, long-press = slow)
 */
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
  direction,
  startEdit,
  saveEdit,
  remove,
  normalizeRag,
  pressHandlers,
  cn,
}) {
  const isEditing = editIdx === idx;
  const isExpanded = expanded.has(idx);
  const rag = normalizeRag(r["RAG Icon"]);

  // UI helpers
  const ragClasses =
    rag === "🔴"
      ? "bg-red-600"
      : rag === "🟢"
      ? "bg-green-600"
      : "bg-amber-500";

  const displayLeft = direction === "EN2LT" ? r.English : r.Lithuanian;
  const displayRight = direction === "EN2LT" ? r.Lithuanian : r.English;

  const speakTarget =
    (direction === "EN2LT" ? r.Lithuanian : r.English) || r.Lithuanian || r.English || "";

  function toggleExpanded() {
    setExpanded((prev) => {
      const s = new Set(prev);
      if (s.has(idx)) s.delete(idx);
      else s.add(idx);
      return s;
    });
  }

  // ----- EDIT MODE -----
  if (isEditing) {
    const onChange = (field) => (e) =>
      setEditDraft({ ...editDraft, [field]: e.target.value });

    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={cn(
              "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs",
              ragClasses
            )}
            title={T.ragLabel}
          >
            {normalizeRag(editDraft["RAG Icon"])}
          </span>
          <div className="text-xs text-zinc-400">
            {T.sheet}: <span className="text-zinc-200">{r.Sheet}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => saveEdit(idx)}
              className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold"
            >
              {T.save}
            </button>
            <button
              onClick={() => setEditIdx(null)}
              className="px-3 py-1.5 rounded-md bg-zinc-800 text-sm"
            >
              {T.cancel}
            </button>
            <button
              onClick={() => remove(idx)}
              className="px-3 py-1.5 rounded-md bg-red-800/40 border border-red-600 text-red-200 text-sm"
            >
              {T.delete}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs">
            <div className="mb-1 text-zinc-400">{T.english}</div>
            <input
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={editDraft.English}
              onChange={onChange("English")}
              placeholder={T.english}
            />
          </label>
          <label className="text-xs">
            <div className="mb-1 text-zinc-400">{T.lithuanian}</div>
            <input
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={editDraft.Lithuanian}
              onChange={onChange("Lithuanian")}
              placeholder={T.lithuanian}
            />
          </label>

          <label className="text-xs">
            <div className="mb-1 text-zinc-400">{T.phonetic}</div>
            <input
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={editDraft.Phonetic}
              onChange={onChange("Phonetic")}
              placeholder={T.phonetic}
            />
          </label>
          <label className="text-xs">
            <div className="mb-1 text-zinc-400">{T.category}</div>
            <input
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={editDraft.Category}
              onChange={onChange("Category")}
              placeholder={T.category}
            />
          </label>

          <label className="text-xs sm:col-span-2">
            <div className="mb-1 text-zinc-400">{T.usage}</div>
            <textarea
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={editDraft.Usage}
              onChange={onChange("Usage")}
              placeholder={T.usage}
              rows={2}
            />
          </label>

          <label className="text-xs sm:col-span-2">
            <div className="mb-1 text-zinc-400">{T.notes}</div>
            <textarea
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={editDraft.Notes}
              onChange={onChange("Notes")}
              placeholder={T.notes}
              rows={2}
            />
          </label>

          <label className="text-xs">
            <div className="mb-1 text-zinc-400">{T.ragLabel}</div>
            <select
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={editDraft["RAG Icon"]}
              onChange={(e) =>
                setEditDraft({ ...editDraft, "RAG Icon": normalizeRag(e.target.value) })
              }
            >
              <option value="🔴">🔴</option>
              <option value="🟠">🟠</option>
              <option value="🟢">🟢</option>
            </select>
          </label>

          <label className="text-xs">
            <div className="mb-1 text-zinc-400">{T.sheet}</div>
            <select
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={editDraft.Sheet}
              onChange={(e) =>
                setEditDraft({ ...editDraft, Sheet: e.target.value })
              }
            >
              {["Phrases", "Questions", "Words", "Numbers"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    );
  }

  // ----- VIEW MODE -----
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
      {/* Header row */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs",
            ragClasses
          )}
          title={T.ragLabel}
        >
          {rag}
        </span>

        <div className="flex-1">
          <div className="font-medium">
            {displayLeft || <span className="text-zinc-500">—</span>}
          </div>
          <div className="text-sm text-zinc-300">
            {displayRight || <span className="text-zinc-600">—</span>}
          </div>
        </div>

        {/* TTS button (tap = normal, long-press = slow) */}
        <button
          className="shrink-0 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center font-semibold text-zinc-900"
          title="Tap = play, long-press = slow"
          {...pressHandlers(speakTarget)}
        >
          ►
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              startEdit(idx);
            }}
            className="px-3 py-1.5 rounded-md bg-zinc-800 text-sm"
          >
            {T.edit}
          </button>
          <button
            onClick={() => remove(idx)}
            className="px-3 py-1.5 rounded-md bg-red-800/40 border border-red-600 text-red-200 text-sm"
          >
            {T.delete}
          </button>
          <button
            onClick={toggleExpanded}
            className="px-3 py-1.5 rounded-md bg-zinc-800 text-sm"
          >
            {isExpanded ? T.hideDetails : T.showDetails}
          </button>
        </div>
      </div>

      {/* Details */}
      {isExpanded && (
        <div className="mt-3 text-sm text-zinc-300 space-y-2">
          {!!r.Phonetic && (
            <div>
              <span className="text-zinc-500">{T.phonetic}: </span>
              {r.Phonetic}
            </div>
          )}
          {!!r.Category && (
            <div>
              <span className="text-zinc-500">{T.category}: </span>
              {r.Category}
            </div>
          )}
          {!!r.Usage && (
            <div>
              <span className="text-zinc-500">{T.usage}: </span>
              {r.Usage}
            </div>
          )}
          {!!r.Notes && (
            <div>
              <span className="text-zinc-500">{T.notes}: </span>
              {r.Notes}
            </div>
          )}
          <div className="text-xs text-zinc-500">
            {T.sheet}: <span className="text-zinc-300">{r.Sheet}</span>
          </div>
        </div>
      )}
    </div>
  );
}

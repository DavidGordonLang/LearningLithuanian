import React from "react";

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
  const isExpanded = expanded.has(idx);
  const isEditing = editIdx === idx;

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const rag = normalizeRag(r["RAG Icon"]);
  const ragBadge =
    rag === "🔴"
      ? "bg-red-700/30 border-red-600"
      : rag === "🟢"
      ? "bg-emerald-700/30 border-emerald-600"
      : "bg-amber-700/30 border-amber-500";

  // What to speak: pick LT when direction is EN→LT, else EN.
  const speakText = direction === "EN2LT" ? r.Lithuanian : r.English;

  return (
    <div className="border border-zinc-800 rounded-xl p-3 bg-zinc-900">
      {/* Top row */}
      <div className="flex items-center gap-2">
        <button
          className={cn(
            "shrink-0 w-10 h-10 rounded-xl transition flex items-center justify-center font-semibold text-zinc-900",
            rag === "🔴"
              ? "bg-red-600 hover:bg-red-500"
              : rag === "🟢"
              ? "bg-green-600 hover:bg-green-500"
              : "bg-amber-500 hover:bg-amber-400"
          )}
          title="Tap = play, long-press = slow"
          {...pressHandlers(speakText)}
        >
          ►
        </button>

        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">
            {direction === "EN2LT" ? r.English : r.Lithuanian}
          </div>
          <div className="text-sm text-zinc-400 truncate">
            {direction === "EN2LT" ? r.Lithuanian : r.English}
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border",
            ragBadge
          )}
          title={T.ragLabel}
        >
          {rag}
        </span>

        <button
          className="text-xs px-2 py-1 rounded-md border border-zinc-700 bg-zinc-800"
          onClick={toggleExpanded}
        >
          {isExpanded ? T.hideDetails : T.showDetails}
        </button>
      </div>

      {/* Details */}
      {isExpanded && !isEditing && (
        <div className="mt-3 text-sm space-y-1">
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
          <div className="text-zinc-400 text-xs">
            <span className="text-zinc-500">{T.sheet}: </span>
            {r.Sheet}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              className="text-xs px-2 py-1 rounded-md border border-zinc-700 bg-zinc-800"
              onClick={() => startEdit(idx)}
            >
              {T.edit}
            </button>
            <button
              className="text-xs px-2 py-1 rounded-md border border-red-600 text-red-400 bg-red-800/30"
              onClick={() => remove(idx)}
            >
              {T.delete}
            </button>
          </div>
        </div>
      )}

      {/* Edit mode */}
      {isEditing && (
        <div className="mt-3 space-y-2">
          {[
            ["English", T.english],
            ["Lithuanian", T.lithuanian],
            ["Phonetic", T.phonetic],
            ["Category", T.category],
            ["Usage", T.usage],
            ["Notes", T.notes],
          ].map(([key, label]) => (
            <div key={key}>
              <div className="text-xs text-zinc-400 mb-1">{label}</div>
              <input
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                value={editDraft[key] ?? ""}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, [key]: e.target.value }))
                }
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-zinc-400 mb-1">{T.ragLabel}</div>
              <select
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                value={editDraft["RAG Icon"] ?? "🟠"}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, "RAG Icon": e.target.value }))
                }
              >
                <option value="🔴">🔴</option>
                <option value="🟠">🟠</option>
                <option value="🟢">🟢</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-zinc-400 mb-1">{T.sheet}</div>
              <select
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                value={editDraft.Sheet ?? "Phrases"}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, Sheet: e.target.value }))
                }
              >
                {["Phrases", "Questions", "Words", "Numbers"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              className="text-xs px-3 py-2 rounded-md border border-emerald-600 bg-emerald-700/40 font-semibold"
              onClick={() => saveEdit(idx)}
            >
              {T.save}
            </button>
            <button
              className="text-xs px-3 py-2 rounded-md border border-zinc-600 bg-zinc-800"
              onClick={() => setEditIdx(null)}
            >
              {T.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

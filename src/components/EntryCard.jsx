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
  lastAddedId,
  showRagLabels = false,
}) {
  // Compute a stable index from the source of truth (rows) using r._id (fallback to original idx)
  const stableId = r?._id ?? r?.id ?? r?.key ?? null;
  const myIdx = stableId != null
    ? rows.findIndex(x => (x?._id ?? x?.id ?? x?.key ?? null) === stableId)
    : idx;

  const isEditing = editIdx === myIdx;
  const isExpanded = expanded?.has?.(r._id || idx);

  // RAG color map
  const rag = normalizeRag(r["RAG Icon"]);
  const ragMap = {
    "🔴": { bg: "bg-red-600", text: "Red" },
    "🟠": { bg: "bg-amber-500", text: "Amber" },
    "🟢": { bg: "bg-green-600", text: "Green" },
  };

  function toggleExpanded() {
    setExpanded((s) => {
      const next = new Set(s);
      const key = r._id || idx;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function beginEdit() {
    startEdit(myIdx);
  }

  function commitSave() {
    saveEdit(myIdx);
  }

  function cancelEdit() {
    setEditIdx(null);
  }

  return (
    <div
      className={cn(
        "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3",
        lastAddedId && (r._id === lastAddedId) ? "ring-2 ring-emerald-500/70" : ""
      )}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center justify-center h-5 px-2 rounded-md text-xs ${ragMap[rag]?.bg || "bg-zinc-700"}`}>
              {showRagLabels ? (ragMap[rag]?.text || "—") : rag}
            </span>
            <div className="font-semibold truncate">{r.Lithuanian}</div>
          </div>
          <div className="text-xs text-zinc-400 mt-0.5 break-words">
            {r.English}
          </div>
          {r.Phonetic ? (
            <div className="text-xs text-zinc-500 mt-0.5 italic break-words">
              {r.Phonetic}
            </div>
          ) : null}
        </div>
        <button
          className="shrink-0 h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-black font-bold"
          title="Play"
          aria-label={`Play '${r.Lithuanian || ""}'`}
          {...pressHandlers(r.Lithuanian || "")}
        >
          ▶
        </button>
      </div>

      {/* Usage preview */}
      {r.Usage && (
        <div className={cn("text-xs text-zinc-400", isExpanded ? "" : "line-clamp-2")}>
          <span className="text-zinc-500">{T.usage}: </span>
          {r.Usage}
        </div>
      )}

      {/* Notes (expanded) */}
      {isExpanded && r.Notes && (
        <div className="text-xs text-zinc-300 whitespace-pre-wrap border-t border-zinc-800 pt-2">
          {r.Notes}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 pt-2">
        <button
          className="text-xs px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700"
          onClick={toggleExpanded}
        >
          {isExpanded ? T.hideDetails || "Hide details" : T.details || "Details"}
        </button>
        <button
          className="text-xs px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700"
          onClick={beginEdit}
        >
          {T.edit}
        </button>
        <button
          className="text-xs px-2 py-1 rounded-md bg-red-800/40 border border-red-600"
          onClick={()=>remove(myIdx)}
        >
          {T.delete}
        </button>
      </div>

      {/* Edit block */}
      {isEditing && (
        <div className="border-t border-zinc-800 pt-3 space-y-2">
          {[
            ["English", "text"],
            ["Lithuanian", "text"],
            ["Phonetic", "text"],
            ["Category", "text"],
            ["Usage", "textarea"],
            ["Notes", "textarea"],
          ].map(([key, kind]) => (
            <div key={key}>
              <div className="text-xs text-zinc-400 mb-1">{T[key.toLowerCase()] || key}</div>
              {kind === "textarea" ? (
                <textarea
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                  rows={3}
                  value={editDraft[key] || ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, [key]: e.target.value }))}
                />
              ) : (
                <input
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                  value={editDraft[key] || ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, [key]: e.target.value }))}
                />
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <button
              className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700"
              onClick={cancelEdit}
            >
              {T.cancel}
            </button>
            <button
              className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-black font-semibold"
              onClick={commitSave}
            >
              {T.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

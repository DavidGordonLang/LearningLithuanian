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
  showRagLabels = false, // NEW
}) {
  const isEditing = editIdx === idx;
  const isExpanded = expanded?.has?.(r._id || idx);

  // RAG color map
  const rag = normalizeRag(r["RAG Icon"]);
  const ragMap = {
    "🔴": { bg: "bg-red-600", text: "Red" },
    "🟠": { bg: "bg-amber-500", text: "Amber" },
    "🟢": { bg: "bg-green-600", text: "Green" },
  };
  const ragCfg = ragMap[rag] || { bg: "bg-zinc-700", text: "" };

  function toggleExpand() {
    setExpanded((prev) => {
      const next = new Set(prev);
      const key = r._id || idx;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function commitSave() {
    saveEdit(idx);
  }
  function cancelEdit() {
    setEditIdx(null);
  }

  return (
    <div
      className={cn(
        "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3",
        lastAddedId && (r._id === lastAddedId) ? "ring-2 ring-emerald-500" : ""
      )}
    >
      {/* Top: LT / EN / Phonetic + Play */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-semibold leading-tight break-words">
            {r.Lithuanian}
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
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                  rows={3}
                  value={editDraft[key] || ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, [key]: e.target.value }))}
                />
              ) : (
                <input
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm"
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

      {/* Footer: pills (RAG left-most), actions right */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* RAG pill */}
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full px-2",
              // Make it pill-height even with no text
              "h-5 min-w-[1.5rem]",
              ragCfg.bg
            )}
            aria-label={`RAG status ${ragCfg.text || ""}`}
          >
            {/* visible text only when accessibility toggle is ON */}
            {showRagLabels ? (
              <span className="text-[11px] leading-none font-medium text-white">
                {ragCfg.text}
              </span>
            ) : (
              <span className="sr-only">{ragCfg.text}</span>
            )}
          </span>

          {/* Sheet tag */}
          {r.Sheet && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
              {r.Sheet}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="text-xs text-zinc-300 hover:text-white px-2 py-1 rounded-md bg-zinc-800/60 border border-zinc-700"
            onClick={toggleExpand}
            aria-expanded={isExpanded}
          >
            {isExpanded ? T.hideDetails : T.showDetails}
          </button>
          <button
            className="text-xs px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700"
            onClick={()=>startEdit(idx)}
          >
            {T.edit}
          </button>
          <button
            className="text-xs px-2 py-1 rounded-md bg-red-800/40 border border-red-600"
            onClick={()=>remove(idx)}
          >
            {T.delete}
          </button>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { usePhraseStore } from "../stores/phraseStore";

export default function EntryCard({
  r,
  idx,
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
  // ---- Pull rows from zustand store ----
  const rows = usePhraseStore((s) => s.phrases);

  // Compute stable row index using _id fallback
  const stableId = r?._id ?? r?.id ?? r?.key ?? null;
  const myIdx =
    stableId != null
      ? rows.findIndex((x) => (x?._id ?? x?.id ?? x?.key ?? null) === stableId)
      : idx;

  const isEditing = editIdx === myIdx;
  const isExpanded = expanded?.has?.(r._id || idx);

  // RAG
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
        // Surface + border (“felt, not seen”)
        "z-card p-4 sm:p-5 flex flex-col gap-3",
        lastAddedId && r._id === lastAddedId ? "ring-2 ring-emerald-500/60" : ""
      )}
    >
      {/* TOP ROW */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center justify-center h-5 px-2 rounded-md text-xs",
                ragMap[rag]?.bg || "bg-zinc-700"
              )}
              title={showRagLabels ? ragMap[rag]?.text || "—" : undefined}
            >
              {showRagLabels ? ragMap[rag]?.text || "—" : rag}
            </span>

            <div className="font-semibold truncate text-zinc-100">
              {r.Lithuanian}
            </div>
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

        {/* Play (keep semantic green, but calmer + consistent shape) */}
        <button
          type="button"
          data-press
          className="
            shrink-0 h-10 w-10 rounded-2xl
            bg-emerald-600/90 hover:bg-emerald-500
            text-black font-bold
            shadow-[0_10px_30px_rgba(0,0,0,0.35)]
            active:scale-[0.99] transition
            flex items-center justify-center
          "
          title="Play"
          aria-label={`Play '${r.Lithuanian || ""}'`}
          {...pressHandlers(r.Lithuanian || "")}
        >
          ▶
        </button>
      </div>

      {/* USAGE PREVIEW */}
      {r.Usage && (
        <div
          className={cn(
            "text-xs text-zinc-400 leading-snug",
            isExpanded ? "" : "line-clamp-2"
          )}
        >
          <span className="text-zinc-500">{T.usage}: </span>
          {r.Usage}
        </div>
      )}

      {/* NOTES */}
      {isExpanded && r.Notes && (
        <div className="text-xs text-zinc-200 whitespace-pre-wrap border-t border-white/8 pt-3">
          {r.Notes}
        </div>
      )}

      {/* CONTROLS */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          data-press
          className="
            text-xs px-2.5 py-1.5 rounded-xl
            bg-white/5 hover:bg-white/8
            border border-white/10
            text-zinc-300
          "
          onClick={toggleExpanded}
        >
          {isExpanded ? T.hideDetails : T.showDetails}
        </button>

        <button
          type="button"
          data-press
          className="
            text-xs px-2.5 py-1.5 rounded-xl
            bg-white/5 hover:bg-white/8
            border border-white/10
            text-zinc-300
          "
          onClick={beginEdit}
        >
          {T.edit}
        </button>

        <button
          type="button"
          data-press
          className="
            text-xs px-2.5 py-1.5 rounded-xl
            bg-red-500/10 hover:bg-red-500/15
            border border-red-400/30
            text-red-200
          "
          onClick={() => remove(myIdx)}
        >
          {T.delete}
        </button>
      </div>

      {/* EDIT MODE UI */}
      {isEditing && (
        <div className="border-t border-white/8 pt-4 space-y-3">
          {[
            ["English", "text"],
            ["Lithuanian", "text"],
            ["Phonetic", "text"],
            ["Category", "text"],
            ["Usage", "textarea"],
            ["Notes", "textarea"],
          ].map(([key, type]) => (
            <div key={key}>
              <div className="text-xs text-zinc-400 mb-1">
                {T[key.toLowerCase()] || key}
              </div>

              {type === "textarea" ? (
                <textarea
                  rows={3}
                  className="z-input rounded-2xl"
                  value={editDraft[key] || ""}
                  onChange={(e) =>
                    setEditDraft((d) => ({
                      ...d,
                      [key]: e.target.value,
                    }))
                  }
                />
              ) : (
                <input
                  className="z-input rounded-2xl"
                  value={editDraft[key] || ""}
                  onChange={(e) =>
                    setEditDraft((d) => ({
                      ...d,
                      [key]: e.target.value,
                    }))
                  }
                />
              )}
            </div>
          ))}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              data-press
              className="z-btn z-btn-secondary px-3 py-2 rounded-xl"
              onClick={cancelEdit}
            >
              {T.cancel}
            </button>

            <button
              type="button"
              data-press
              className="
                z-btn px-3 py-2 rounded-xl
                bg-emerald-600/90 hover:bg-emerald-500
                border border-emerald-300/20
                text-black font-semibold
              "
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
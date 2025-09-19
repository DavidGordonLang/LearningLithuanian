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
}) {
  const isEditing = editIdx === idx;
  const isExpanded = expanded.has(idx);

  // color-only RAG chip (no emoji/text; a11y label only)
  const rag = normalizeRag(r["RAG Icon"]);
  const ragBg =
    rag === "🔴"
      ? "bg-red-600"
      : rag === "🟢"
      ? "bg-green-600"
      : "bg-amber-500"; // 🔴/🟠/🟢 → red/amber/green

  function toggleExpand() {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function onEditField(k, v) {
    setEditDraft((d) => ({ ...d, [k]: v }));
  }

  const englishLabel = direction === "EN2LT" ? T.english : T.lithuanian;
  const lithuanianLabel = direction === "EN2LT" ? T.lithuanian : T.english;

  // pills (order: RAG → Variant → Tone). We don’t have variant/tone stored yet,
  // so they’ll be hidden if missing. Future fields can map here.
  const variant = r._variant; // e.g. Neutral / Female / Male / Respectful
  const tone = r._tone; // e.g. Friendly, Formal, etc.

  return (
    <div
      className={cn(
        "bg-zinc-900 border border-zinc-800 rounded-2xl p-4",
        lastAddedId && r._id === lastAddedId
          ? "ring-2 ring-emerald-600"
          : "ring-0"
      )}
    >
      {!isEditing ? (
        <div className="flex flex-col gap-3">
          {/* Top row: LT side + play button on the right */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* Language headings */}
              <div className="grid grid-cols-2 gap-4 text-xs text-zinc-500 mb-1">
                <div className="truncate">{englishLabel}</div>
                <div className="truncate">{lithuanianLabel}</div>
              </div>

              {/* Main lines: EN (left), LT (right) */}
              <div className="grid grid-cols-2 gap-4 items-start">
                <div className="min-w-0">
                  <div className="text-base text-zinc-200 break-words">
                    {r.English || "—"}
                  </div>
                  {/* Phonetic directly under English for quick reference */}
                  {r.Phonetic ? (
                    <div className="text-xs text-zinc-500 italic mt-0.5 break-words">
                      {r.Phonetic}
                    </div>
                  ) : null}
                </div>

                <div className="min-w-0">
                  <div className="text-lg font-semibold leading-tight break-words">
                    {r.Lithuanian || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Play button (keeps long-press slow play behaviour via pressHandlers) */}
            <button
              className="shrink-0 h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-zinc-900 font-bold"
              title="Play"
              aria-label={`Play: ${r.Lithuanian || ""}`}
              {...pressHandlers(r.Lithuanian || "")}
            >
              ▶
            </button>
          </div>

          {/* Usage preview (never sent to TTS), collapsed by default */}
          {r.Usage ? (
            <div
              className={cn(
                "text-xs text-zinc-400",
                isExpanded ? "" : "line-clamp-2"
              )}
            >
              <span className="text-zinc-500">{T.usage}: </span>
              {r.Usage}
            </div>
          ) : null}

          {/* Notes, visible when expanded */}
          {r.Notes && isExpanded ? (
            <div className="text-xs text-zinc-300 whitespace-pre-wrap border-t border-zinc-800 pt-2">
              {r.Notes}
            </div>
          ) : null}

          {/* Footer: pills bottom-left; actions bottom-right */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* color-only RAG chip with a11y label; sized like a pill */}
              <span
                className={cn(
                  "inline-flex h-6 w-8 rounded-full",
                  "border border-zinc-800",
                  ragBg
                )}
              >
                <span className="sr-only">
                  RAG status{" "}
                  {rag === "🔴" ? "red" : rag === "🟢" ? "green" : "amber"}
                </span>
              </span>

              {/* Future: show variant/tone when present */}
              {variant ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                  {variant}
                </span>
              ) : null}
              {tone ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                  {tone}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                className="text-xs text-zinc-300 hover:text-white px-2 py-1 rounded-md bg-zinc-800/60 border border-zinc-700"
                onClick={toggleExpand}
                aria-expanded={isExpanded}
              >
                {isExpanded ? "Less" : "More"}
              </button>
              <button
                className="text-xs px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700"
                onClick={() => startEdit(idx)}
              >
                {T.edit}
              </button>
              <button
                className="text-xs px-2 py-1 rounded-md bg-red-900/40 border border-red-600 text-red-200"
                onClick={() => remove(idx)}
              >
                {T.delete}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Inline edit view (unchanged logic, just compact styling)
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-zinc-500 mb-1">{T.english}</div>
              <input
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                value={editDraft.English || ""}
                onChange={(e) => onEditField("English", e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">{T.lithuanian}</div>
              <input
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                value={editDraft.Lithuanian || ""}
                onChange={(e) => onEditField("Lithuanian", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <div className="text-xs text-zinc-500 mb-1">{T.phonetic}</div>
              <input
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                value={editDraft.Phonetic || ""}
                onChange={(e) => onEditField("Phonetic", e.target.value)}
              />
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">{T.category}</div>
              <select
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                value={editDraft.Sheet || "Phrases"}
                onChange={(e) => onEditField("Sheet", e.target.value)}
              >
                <option value="Phrases">{T.phrases}</option>
                <option value="Questions">{T.questions}</option>
                <option value="Words">{T.words}</option>
                <option value="Numbers">{T.numbers}</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">{T.ragLabel}</div>
              <select
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                value={normalizeRag(editDraft["RAG Icon"] || "🟠")}
                onChange={(e) => onEditField("RAG Icon", e.target.value)}
              >
                <option value="🔴">🔴</option>
                <option value="🟠">🟠</option>
                <option value="🟢">🟢</option>
              </select>
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-500 mb-1">{T.usage}</div>
            <textarea
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              rows={2}
              value={editDraft.Usage || ""}
              onChange={(e) => onEditField("Usage", e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs text-zinc-500 mb-1">{T.notes}</div>
            <textarea
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              rows={3}
              value={editDraft.Notes || ""}
              onChange={(e) => onEditField("Notes", e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm"
              onClick={() => setEditIdx(null)}
            >
              {T.cancel}
            </button>
            <button
              className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold"
              onClick={() => saveEdit(idx)}
            >
              {T.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

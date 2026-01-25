import React, { useEffect, useMemo, useState } from "react";
import { CATEGORIES, DEFAULT_CATEGORY } from "../constants/categories";

export default function AddForm({
  T,
  genId,
  nowTs,
  normalizeRag,
  mode = "add",
  initialRow,
  onSubmit,
  onCancel,
}) {
  const isEdit = mode === "edit" && !!initialRow;

  const safeCategory =
    initialRow?.Category && CATEGORIES.includes(initialRow.Category)
      ? initialRow.Category
      : DEFAULT_CATEGORY;

  const [english, setEnglish] = useState(initialRow?.English || "");
  const [lithuanian, setLithuanian] = useState(initialRow?.Lithuanian || "");
  const [phonetic, setPhonetic] = useState(initialRow?.Phonetic || "");
  const [category, setCategory] = useState(safeCategory);
  const [usage, setUsage] = useState(initialRow?.Usage || "");
  const [notes, setNotes] = useState(initialRow?.Notes || "");
  const [rag, setRag] = useState(
    normalizeRag(initialRow?.["RAG Icon"] || "🟠")
  );

  useEffect(() => {
    if (!isEdit || !initialRow) return;

    setEnglish(initialRow.English || "");
    setLithuanian(initialRow.Lithuanian || "");
    setPhonetic(initialRow.Phonetic || "");
    setCategory(
      initialRow.Category && CATEGORIES.includes(initialRow.Category)
        ? initialRow.Category
        : DEFAULT_CATEGORY
    );
    setUsage(initialRow.Usage || "");
    setNotes(initialRow.Notes || "");
    setRag(normalizeRag(initialRow["RAG Icon"] || "🟠"));
  }, [isEdit, initialRow, normalizeRag]);

  const canSave = useMemo(
    () => english.trim() !== "" && lithuanian.trim() !== "",
    [english, lithuanian]
  );

  function reset() {
    setEnglish("");
    setLithuanian("");
    setPhonetic("");
    setCategory(DEFAULT_CATEGORY);
    setUsage("");
    setNotes("");
    setRag("🟠");
  }

  function buildRow() {
    const base = initialRow || {};
    const _id = isEdit && base._id ? base._id : genId();
    const _ts = nowTs();

    const _qstat =
      isEdit && base._qstat
        ? base._qstat
        : {
            red: { ok: 0, bad: 0 },
            amb: { ok: 0, bad: 0 },
            grn: { ok: 0, bad: 0 },
          };

    return {
      ...base,
      English: english.trim(),
      Lithuanian: lithuanian.trim(),
      Phonetic: phonetic.trim(),
      Category: category,
      Usage: usage.trim(),
      Notes: notes.trim(),
      "RAG Icon": normalizeRag(rag),
      _id,
      _ts,
      _qstat,
    };
  }

  function handleSave(e) {
    e?.preventDefault?.();
    if (!canSave) return;
    onSubmit?.(buildRow());
    if (!isEdit) reset();
  }

  return (
    <form className="z-stack-lg" onSubmit={handleSave}>
      <div>
        <label className="block text-xs text-zinc-400 mb-1">
          {T.english} <span className="text-zinc-500">*</span>
        </label>
        <input
          className="z-input"
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">
          {T.lithuanian} <span className="text-zinc-500">*</span>
        </label>
        <input
          className="z-input"
          value={lithuanian}
          onChange={(e) => setLithuanian(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">{T.phonetic}</label>
        <input
          className="z-input"
          value={phonetic}
          onChange={(e) => setPhonetic(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">{T.category}</label>
        <select
          className="z-input appearance-none"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">{T.usage}</label>
        <textarea
          rows={3}
          className="z-input resize-none"
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">{T.notes}</label>
        <textarea
          rows={3}
          className="z-input resize-none"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* RAG + Actions row */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">{T.ragLabel}</label>
          <select
            className="z-input appearance-none"
            value={rag}
            onChange={(e) => setRag(e.target.value)}
          >
            <option value="🔴">🔴 Red</option>
            <option value="🟠">🟠 Amber</option>
            <option value="🟢">🟢 Green</option>
          </select>
        </div>

        <div className="flex justify-end items-center gap-2 pt-5">
          <button
            type="button"
            data-press
            className="z-btn z-btn-quiet px-4 py-2 rounded-xl"
            onClick={() => {
              if (!isEdit) reset();
              onCancel?.();
            }}
          >
            {T.cancel}
          </button>

          <button
            type="submit"
            data-press
            className={
              "z-btn px-4 py-2 rounded-xl " +
              "bg-emerald-600/90 hover:bg-emerald-500 " +
              "border border-emerald-300/20 text-black font-semibold " +
              (canSave ? "" : " z-disabled")
            }
            disabled={!canSave}
          >
            {T.save}
          </button>
        </div>
      </div>

      {/* Bottom breathing room — matches top spacing */}
      <div className="h-10" />
    </form>
  );
}
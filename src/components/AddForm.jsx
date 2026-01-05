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
    <form className="space-y-4" onSubmit={handleSave}>
      <div>
        <label className="block text-xs mb-1">{T.english} *</label>
        <input
          className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl px-3 py-2 text-sm"
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs mb-1">{T.lithuanian} *</label>
        <input
          className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl px-3 py-2 text-sm"
          value={lithuanian}
          onChange={(e) => setLithuanian(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs mb-1">{T.phonetic}</label>
        <input
          className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl px-3 py-2 text-sm"
          value={phonetic}
          onChange={(e) => setPhonetic(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs mb-1">{T.category}</label>
        <select
          className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl px-3 py-2 text-sm"
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
        <label className="block text-xs mb-1">{T.usage}</label>
        <textarea
          rows={3}
          className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl px-3 py-2 text-sm"
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs mb-1">{T.notes}</label>
        <textarea
          rows={3}
          className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl px-3 py-2 text-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* RAG + Actions row */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <label className="block text-xs mb-1">{T.ragLabel}</label>
          <select
            className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl px-3 py-2 text-sm"
            value={rag}
            onChange={(e) => setRag(e.target.value)}
          >
            <option value="🔴">🔴 Red</option>
            <option value="🟠">🟠 Amber</option>
            <option value="🟢">🟢 Green</option>
          </select>
        </div>

        <div className="flex justify-end items-center gap-3 pt-5">
          <button
            type="button"
            className="bg-zinc-800 text-zinc-200 rounded-full px-5 py-2 font-medium"
            onClick={() => {
              if (!isEdit) reset();
              onCancel?.();
            }}
          >
            {T.cancel}
          </button>

          <button
            type="submit"
            className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold disabled:opacity-60"
            disabled={!canSave}
          >
            {T.save}
          </button>
        </div>
      </div>

      {/* ✅ Bottom breathing room — matches top spacing */}
      <div className="h-10" />
    </form>
  );
}

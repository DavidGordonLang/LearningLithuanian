// src/components/AddForm.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * AddForm
 *
 * Props:
 *  - T
 *  - genId
 *  - nowTs
 *  - normalizeRag
 *  - mode: "add" | "edit"
 *  - initialRow?: phrase row (when editing)
 *  - onSubmit: (row) => void
 *  - onCancel: () => void
 */
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

  const [english, setEnglish] = useState(initialRow?.English || "");
  const [lithuanian, setLithuanian] = useState(initialRow?.Lithuanian || "");
  const [phonetic, setPhonetic] = useState(initialRow?.Phonetic || "");
  const [category, setCategory] = useState(initialRow?.Category || "");
  const [usage, setUsage] = useState(initialRow?.Usage || "");
  const [notes, setNotes] = useState(initialRow?.Notes || "");
  const [rag, setRag] = useState(normalizeRag(initialRow?.["RAG Icon"] || "🟠"));

  // Determine initial sheet value (no direction, no tabs passed in)
  const sheetValue = useMemo(() => {
    const allowed = ["Phrases", "Questions", "Words", "Numbers"];
    if (initialRow && allowed.includes(initialRow.Sheet)) return initialRow.Sheet;
    return "Phrases";
  }, [initialRow]);

  const [sheet, setSheet] = useState(sheetValue);

  useEffect(() => {
    if (!isEdit || !initialRow) return;
    setEnglish(initialRow.English || "");
    setLithuanian(initialRow.Lithuanian || "");
    setPhonetic(initialRow.Phonetic || "");
    setCategory(initialRow.Category || "");
    setUsage(initialRow.Usage || "");
    setNotes(initialRow.Notes || "");
    setRag(normalizeRag(initialRow["RAG Icon"] || "🟠"));
    setSheet(initialRow.Sheet || "Phrases");
  }, [isEdit, initialRow, normalizeRag]);

  const canSave = useMemo(
    () =>
      english.trim() !== "" &&
      lithuanian.trim() !== "",
    [english, lithuanian]
  );

  function reset() {
    setEnglish("");
    setLithuanian("");
    setPhonetic("");
    setCategory("");
    setUsage("");
    setNotes("");
    setRag("🟠");
    setSheet("Phrases");
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
      Category: category.trim(),
      Usage: usage.trim(),
      Notes: notes.trim(),
      "RAG Icon": normalizeRag(rag),
      Sheet: sheet,
      _id,
      _ts,
      _qstat,
    };
  }

  function handleSave(e) {
    e?.preventDefault?.();
    if (!canSave) return;
    const row = buildRow();
    onSubmit?.(row);
    if (!isEdit) reset();
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave(e);
      }}
    >
      {/* English */}
      <div>
        <label className="block text-xs mb-1" htmlFor="add-en">
          {T.english} <span className="text-red-400">*</span>
        </label>
        <input
          id="add-en"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
        />
      </div>

      {/* Lithuanian */}
      <div>
        <label className="block text-xs mb-1" htmlFor="add-lt">
          {T.lithuanian} <span className="text-red-400">*</span>
        </label>
        <input
          id="add-lt"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          value={lithuanian}
          onChange={(e) => setLithuanian(e.target.value)}
        />
      </div>

      {/* Phonetic */}
      <div>
        <label className="block text-xs mb-1" htmlFor="add-ph">
          {T.phonetic}
        </label>
        <input
          id="add-ph"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          value={phonetic}
          onChange={(e) => setPhonetic(e.target.value)}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs mb-1" htmlFor="add-cat">
          {T.category}
        </label>
        <input
          id="add-cat"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      {/* Usage */}
      <div>
        <label className="block text-xs mb-1" htmlFor="add-usage">
          {T.usage}
        </label>
        <textarea
          id="add-usage"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          rows={3}
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs mb-1" htmlFor="add-notes">
          {T.notes}
        </label>
        <textarea
          id="add-notes"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* RAG */}
        <div>
          <label className="block text-xs mb-1" htmlFor="add-rag">
            {T.ragLabel}
          </label>
          <select
            id="add-rag"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
            value={rag}
            onChange={(e) => setRag(e.target.value)}
          >
            <option value="🔴">🔴 Red</option>
            <option value="🟠">🟠 Amber</option>
            <option value="🟢">🟢 Green</option>
          </select>
        </div>

        {/* Sheet dropdown */}
        <div>
          <label className="block text-xs mb-1" htmlFor="add-sheet">
            {T.sheet}
          </label>
          <select
            id="add-sheet"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
            value={sheet}
            onChange={(e) => setSheet(e.target.value)}
          >
            <option value="Phrases">Phrases</option>
            <option value="Questions">Questions</option>
            <option value="Words">Words</option>
            <option value="Numbers">Numbers</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700"
          onClick={() => {
            if (!isEdit) reset();
            onCancel?.();
          }}
        >
          {T.cancel}
        </button>
        <button
          type="submit"
          className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-black font-semibold disabled:opacity-60"
          disabled={!canSave}
        >
          {T.save}
        </button>
      </div>

      {!canSave && (
        <div className="text-xs text-red-400">
          Please enter both {T.english.toLowerCase()} and{" "}
          {T.lithuanian.toLowerCase()}.
        </div>
      )}
    </form>
  );
}

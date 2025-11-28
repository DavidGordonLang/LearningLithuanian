// src/components/AddForm.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * AddForm
 *
 * Props:
 *  - tab
 *  - T
 *  - genId
 *  - nowTs
 *  - normalizeRag
 *  - direction
 *  - mode: "add" | "edit"
 *  - initialRow?: phrase row (when editing)
 *  - onSubmit: (row) => void
 *  - onCancel: () => void
 */
export default function AddForm({
  tab,
  T,
  genId,
  nowTs,
  normalizeRag,
  direction,
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

  // -------------------------
  // NEW: sheet dropdown state
  // -------------------------
  const sheetValue = useMemo(() => {
    const allowed = ["Phrases", "Questions", "Words", "Numbers"];
    if (initialRow && allowed.includes(initialRow.Sheet)) return initialRow.Sheet;
    if (allowed.includes(tab)) return tab;
    return "Phrases";
  }, [initialRow, tab]);

  const [sheet, setSheet] = useState(sheetValue);

  // Sync sheet when editing row changes
  useEffect(() => {
    if (isEdit && initialRow?.Sheet) {
      setSheet(initialRow.Sheet);
    }
  }, [isEdit, initialRow]);

  const canSave = useMemo(
    () =>
      String(english).trim() !== "" &&
      String(lithuanian).trim() !== "",
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
      English: String(english || "").trim(),
      Lithuanian: String(lithuanian || "").trim(),
      Phonetic: String(phonetic || "").trim(),
      Category: String(category || "").trim(),
      Usage: String(usage || "").trim(),
      Notes: String(notes || "").trim(),
      "RAG Icon": normalizeRag(rag || base["RAG Icon"] || "🟠"),

      // NEW: actual selected sheet
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
      <div className="text-xs text-zinc-400">
        {direction === "EN2LT" ? T.en2lt : T.lt2en}
      </div>

      {/* ENGLISH */}
      <div>
        <label className="block text-xs mb-1">{T.english} *</label>
        <input
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
        />
      </div>

      {/* LITHUANIAN */}
      <div>
        <label className="block text-xs mb-1">{T.lithuanian} *</label>
        <input
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          value={lithuanian}
          onChange={(e) => setLithuanian(e.target.value)}
        />
      </div>

      {/* PHONETIC */}
      <div>
        <label className="block text-xs mb-1">{T.phonetic}</label>
        <input
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          value={phonetic}
          onChange={(e) => setPhonetic(e.target.value)}
        />
      </div>

      {/* CATEGORY */}
      <div>
        <label className="block text-xs mb-1">{T.category}</label>
        <input
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      {/* USAGE */}
      <div>
        <label className="block text-xs mb-1">{T.usage}</label>
        <textarea
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
        />
      </div>

      {/* NOTES */}
      <div>
        <label className="block text-xs mb-1">{T.notes}</label>
        <textarea
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* RAG + SHEET */}
      <div className="grid grid-cols-2 gap-3">
        {/* RAG SELECTOR */}
        <div>
          <label className="block text-xs mb-1">{T.ragLabel}</label>
          <select
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
            value={rag}
            onChange={(e) => setRag(e.target.value)}
          >
            <option value="🔴">🔴 Red</option>
            <option value="🟠">🟠 Amber</option>
            <option value="🟢">🟢 Green</option>
          </select>
        </div>

        {/* NEW — SHEET DROPDOWN */}
        <div>
          <label className="block text-xs mb-1">{T.sheet}</label>
          <select
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

      {/* ACTION BUTTONS */}
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
          disabled={!canSave}
          className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-black font-semibold disabled:opacity-60"
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

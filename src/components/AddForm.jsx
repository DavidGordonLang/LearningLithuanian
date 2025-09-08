import React, { useMemo, useState } from "react";

/**
 * AddForm.jsx
 * Props:
 * - tab            : current Sheet ("Phrases" | "Questions" | "Words" | "Numbers")
 * - setRows        : setter from App
 * - T              : i18n strings
 * - genId, nowTs   : utility fns from App
 * - normalizeRag   : utility fn from App
 */
export default function AddForm({ tab, setRows, T, genId, nowTs, normalizeRag }) {
  const initialDraft = useMemo(
    () => ({
      English: "",
      Lithuanian: "",
      Phonetic: "",
      Category: "",
      Usage: "",
      Notes: "",
      "RAG Icon": "🟠",
      Sheet: tab || "Phrases",
    }),
    [tab]
  );

  const [draft, setDraft] = useState(initialDraft);
  const [touched, setTouched] = useState(false);

  const update = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  const canSave = (draft.English.trim() || draft.Lithuanian.trim());

  function resetForm() {
    setDraft({
      English: "",
      Lithuanian: "",
      Phonetic: "",
      Category: "",
      Usage: "",
      Notes: "",
      "RAG Icon": "🟠",
      Sheet: tab || "Phrases",
    });
    setTouched(false);
  }

  function closeDetails(e) {
    // This form lives inside a <details> element in App.jsx
    const details = e.currentTarget.closest("details");
    if (details && details.hasAttribute("open")) details.removeAttribute("open");
  }

  function onSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!canSave) return;

    const newRow = {
      English: draft.English.trim(),
      Lithuanian: draft.Lithuanian.trim(),
      Phonetic: draft.Phonetic.trim(),
      Category: draft.Category.trim(),
      Usage: draft.Usage.trim(),
      Notes: draft.Notes.trim(),
      "RAG Icon": normalizeRag(draft["RAG Icon"] || "🟠"),
      Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(draft.Sheet)
        ? draft.Sheet
        : "Phrases",
      _id: genId(),
      _ts: nowTs(),
      _qstat: { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } },
    };

    // Prepend the new row (you’ll still get correct order when sorting by Newest)
    setRows((prev) => [newRow, ...prev]);

    resetForm();
    closeDetails(e);
  }

  return (
    <form onSubmit={onSubmit} className="mt-2 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* English */}
        <div>
          <label className="block text-xs mb-1">{T.english}</label>
          <input
            value={draft.English}
            onChange={update("English")}
            placeholder={T.english}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          />
        </div>

        {/* Lithuanian */}
        <div>
          <label className="block text-xs mb-1">{T.lithuanian}</label>
          <input
            value={draft.Lithuanian}
            onChange={update("Lithuanian")}
            placeholder={T.lithuanian}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          />
        </div>

        {/* Phonetic */}
        <div>
          <label className="block text-xs mb-1">{T.phonetic}</label>
          <input
            value={draft.Phonetic}
            onChange={update("Phonetic")}
            placeholder="e.g. labás"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs mb-1">{T.category}</label>
          <input
            value={draft.Category}
            onChange={update("Category")}
            placeholder="e.g. Greetings"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          />
        </div>

        {/* Usage */}
        <div className="sm:col-span-2">
          <label className="block text-xs mb-1">{T.usage}</label>
          <input
            value={draft.Usage}
            onChange={update("Usage")}
            placeholder="Context or usage example"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-xs mb-1">{T.notes}</label>
          <textarea
            value={draft.Notes}
            onChange={update("Notes")}
            placeholder="Any extra notes"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 min-h-[80px]"
          />
        </div>

        {/* RAG + Sheet */}
        <div>
          <label className="block text-xs mb-1">{T.ragLabel}</label>
          <select
            value={draft["RAG Icon"]}
            onChange={update("RAG Icon")}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          >
            <option value="🔴">🔴 Red</option>
            <option value="🟠">🟠 Amber</option>
            <option value="🟢">🟢 Green</option>
          </select>
        </div>

        <div>
          <label className="block text-xs mb-1">{T.sheet}</label>
          <select
            value={draft.Sheet}
            onChange={update("Sheet")}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          >
            {["Phrases", "Questions", "Words", "Numbers"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Helper / errors */}
      {!canSave && touched && (
        <div className="text-xs text-red-400">
          Enter at least {T.english.toLowerCase()} or {T.lithuanian.toLowerCase()}.
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!canSave}
          className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-sm font-semibold"
        >
          {T.addEntry}
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="px-3 py-2 rounded-md bg-zinc-800 text-sm"
        >
          {T.cancel}
        </button>
      </div>
    </form>
  );
}

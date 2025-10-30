import React, { useMemo, useState } from "react";

/**
 * AddForm
 *
 * Props (as used by App.jsx):
 *  - tab: "Phrases" | "Questions" | "Words" | "Numbers"
 *  - setRows: (updater) => void    // App wraps this to also close the modal
 *  - T: i18n strings object (EN2LT/LT2EN)
 *  - genId: () => string
 *  - nowTs: () => number
 *  - normalizeRag: (icon) => "🔴"|"🟠"|"🟢"
 *  - direction: "EN2LT" | "LT2EN"
 *  - onSave?: (newId: string) => void
 */
export default function AddForm({
  tab,
  setRows,
  T,
  genId,
  nowTs,
  normalizeRag,
  direction,
  onSave,
}) {
  const [english, setEnglish] = useState("");
  const [lithuanian, setLithuanian] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [category, setCategory] = useState("");
  const [usage, setUsage] = useState("");
  const [notes, setNotes] = useState("");
  const [rag, setRag] = useState("🟠");

  const canSave = useMemo(() => {
    // Minimal requirement: one side + the other side
    // For EN→LT learners, prefer English+Lithuanian; same for the inverse.
    return String(english).trim() !== "" && String(lithuanian).trim() !== "";
  }, [english, lithuanian]);

  function reset() {
    setEnglish("");
    setLithuanian("");
    setPhonetic("");
    setCategory("");
    setUsage("");
    setNotes("");
    setRag("🟠");
  }

  function buildRow() {
    const _id = genId();
    const _ts = nowTs();
    return {
      English: String(english || "").trim(),
      Lithuanian: String(lithuanian || "").trim(),
      Phonetic: String(phonetic || "").trim(),
      Category: String(category || "").trim(),
      Usage: String(usage || "").trim(),
      Notes: String(notes || "").trim(),
      "RAG Icon": normalizeRag(rag || "🟠"),
      Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(tab)
        ? tab
        : "Phrases",
      _id,
      _ts,
      _qstat: {
        red: { ok: 0, bad: 0 },
        amb: { ok: 0, bad: 0 },
        grn: { ok: 0, bad: 0 },
      },
    };
  }

  function handleSave(e) {
    e?.preventDefault?.();
    if (!canSave) return;

    const row = buildRow();
    setRows((prev) => [row, ...prev]); // persist immediately
    onSave?.(row._id);                  // let App toast/scroll and highlight
    reset();                            // clear the form (modal will close via App)
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      {/* Direction hint */}
      <div className="text-xs text-zinc-400">
        {direction === "EN2LT" ? T.en2lt : T.lt2en}
      </div>

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
          placeholder={direction === "EN2LT" ? "Good evening" : "Labas vakaras — English"}
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
          placeholder={direction === "EN2LT" ? "Labas vakaras" : "Hello — Lietuviškai"}
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
          placeholder="lah-bahs vah-kah-ras"
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
          placeholder="Greetings"
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
          placeholder="Used in the evening as a greeting."
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
          placeholder="Any extra memory tips or distinctions."
        />
      </div>

      {/* RAG + Sheet (Sheet is shown read-only for clarity) */}
      <div className="grid grid-cols-2 gap-3">
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

        <div>
          <label className="block text-xs mb-1" htmlFor="add-sheet">
            {T.sheet}
          </label>
          <input
            id="add-sheet"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-zinc-400"
            value={["Phrases", "Questions", "Words", "Numbers"].includes(tab) ? tab : "Phrases"}
            readOnly
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700"
          onClick={reset}
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
          Please enter both {T.english.toLowerCase()} and {T.lithuanian.toLowerCase()}.
        </div>
      )}
    </form>
  );
}

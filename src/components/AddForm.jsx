import React, { useState } from "react";

/**
 * AddForm (manual translate)
 * - Click "Translate" to fill the missing side + phonetic/usage/notes.
 * - Save requires BOTH English and Lithuanian to be present.
 * - If Translate was used, new item defaults to RAG 🔴, else RAG 🟠.
 * - After saving:
 *    • switches sort mode to "Newest" (if setSortMode provided),
 *    • calls onClose() if provided (modal), else clears the form.
 *
 * Props:
 *  - tab: string ("Phrases" | "Questions" | "Words" | "Numbers")
 *  - setRows: fn
 *  - T: i18n labels
 *  - genId: fn
 *  - nowTs: fn
 *  - normalizeRag: fn
 *  - onClose?: fn
 *  - setSortMode?: fn
 */
export default function AddForm({
  tab = "Phrases",
  setRows,
  T,
  genId,
  nowTs,
  normalizeRag,
  onClose,
  setSortMode,
}) {
  const [english, setEnglish] = useState("");
  const [lithuanian, setLithuanian] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [category, setCategory] = useState("");
  const [usage, setUsage] = useState("");
  const [notes, setNotes] = useState("");
  const [sheet, setSheet] = useState(tab || "Phrases");

  const [loading, setLoading] = useState(false);
  const [usedTranslate, setUsedTranslate] = useState(false);

  function simplifyUsage(u) {
    const s = String(u || "").trim();
    if (!s) return "";
    const first = s.split(/(?<=\.)\s+|;|\n/)[0];
    return first.length <= 140 ? first : first.slice(0, 140) + "…";
    // keep it short & “equating out”
  }

  async function onTranslate() {
    if (loading) return;

    const en = english.trim();
    const lt = lithuanian.trim();

    if (!en && !lt) {
      alert("Type something in English or Lithuanian first.");
      return;
    }

    const from = en && !lt ? "en" : !en && lt ? "lt" : "auto";
    const to = from === "en" ? "lt" : from === "lt" ? "en" : "lt";

    try {
      setLoading(true);

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: en || lt,
          from,
          to,
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Translation failed.");
      }

      const json = await res.json();
      if (!json?.ok || !json?.data) throw new Error("Translation service returned an unexpected response.");

      const d = json.data;

      // API returns fields: english, lithuanian, phonetic, usage, notes
      if (!en && d.english) setEnglish(d.english);
      if (!lt && d.lithuanian) setLithuanian(d.lithuanian);
      if (d.phonetic) setPhonetic(d.phonetic);
      if (d.usage) setUsage((prev) => prev || simplifyUsage(d.usage));
      if (d.notes) setNotes((prev) => prev || d.notes);

      setUsedTranslate(true);
    } catch (err) {
      alert(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  function onCancel() {
    if (typeof onClose === "function") onClose();
  }

  function resetForm() {
    setEnglish("");
    setLithuanian("");
    setPhonetic("");
    setCategory("");
    setUsage("");
    setNotes("");
    setSheet(tab || "Phrases");
    setUsedTranslate(false);
  }

  function onSave(e) {
    e.preventDefault();
    if (loading) return;

    const en = english.trim();
    const lt = lithuanian.trim();

    if (!en || !lt) {
      alert("Please fill both English and Lithuanian before saving (use Translate if needed).");
      return;
    }

    const entry = {
      English: en,
      Lithuanian: lt,
      Phonetic: phonetic.trim(),
      Category: category.trim(),
      Usage: simplifyUsage(usage),
      Notes: notes.trim(),
      "RAG Icon": normalizeRag(usedTranslate ? "🔴" : "🟠"),
      Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(sheet) ? sheet : "Phrases",
      _id: genId(),
      _ts: nowTs(),
      _qstat: { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } },
    };

    // Prepend so it visibly appears first, then flip sort
    setRows((prev) => [entry, ...prev]);
    if (typeof setSortMode === "function") setSortMode("Newest");

    if (typeof onClose === "function") {
      onClose();
    } else {
      resetForm();
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <div className="text-xs mb-1">{T.english}</div>
          <textarea
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="e.g. Could I get the bill, please?"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 min-h-[60px]"
          />
        </div>
        <div>
          <div className="text-xs mb-1">{T.lithuanian}</div>
          <textarea
            value={lithuanian}
            onChange={(e) => setLithuanian(e.target.value)}
            placeholder="e.g. Ar galėčiau gauti sąskaitą?"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 min-h-[60px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <div className="text-xs mb-1">{T.phonetic}</div>
          <input
            value={phonetic}
            onChange={(e) => setPhonetic(e.target.value)}
            placeholder="Optional — phonetic hint"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <div className="text-xs mb-1">{T.category}</div>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Optional — e.g. Restaurant"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div>
        <div className="text-xs mb-1">{T.usage}</div>
        <textarea
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          placeholder="Short usage/context (kept concise on save)"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 min-h-[48px]"
        />
      </div>

      <div>
        <div className="text-xs mb-1">{T.notes}</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional — alternatives, register, grammar note…"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 min-h-[48px]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <div className="text-xs mb-1">{T.sheet}</div>
          <select
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
            value={sheet}
            onChange={(e) => setSheet(e.target.value)}
          >
            <option value="Phrases">{T.phrases}</option>
            <option value="Questions">{T.questions}</option>
            <option value="Words">{T.words}</option>
            <option value="Numbers">{T.numbers}</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={onTranslate}
            disabled={loading}
            className={`bg-zinc-800 rounded-md px-3 py-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            title="Fill the missing side + phonetic/usage/notes"
          >
            {loading ? "Translating…" : "Translate"}
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-md px-3 py-2 font-semibold ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {T.save}
          </button>

          <button type="button" onClick={onCancel} className="bg-zinc-800 rounded-md px-3 py-2">
            {T.cancel}
          </button>
        </div>
      </div>
    </form>
  );
}

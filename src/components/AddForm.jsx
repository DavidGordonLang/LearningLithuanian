import React, { useState } from "react";

/**
 * AddForm
 * - If only EN or LT is provided, calls /api/translate to fill the other side on Save.
 * - Defaults new entries to RAG 🔴 when translation was used.
 * - After successful save:
 *    • switches sort mode to "Newest" (if setSortMode is provided),
 *    • calls onClose() if provided (for modal),
 *    • otherwise clears the form.
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

  function simplifyUsage(u) {
    const s = String(u || "").trim();
    if (!s) return "";
    // Simple heuristic: keep the first short clause/sentence.
    const first = s.split(/(?<=\.)\s+|;|\n/)[0];
    return first.length <= 140 ? first : first.slice(0, 140) + "…";
  }

  async function translateIfNeeded(en, lt) {
    // If both sides exist, no call needed
    if (en && lt) return { en, lt, ph: phonetic, us: usage, nt: notes, viaApi: false };

    const text = en || lt;
    if (!text) throw new Error("Please enter English or Lithuanian.");

    const from = en ? "en" : "lt";
    const to = en ? "lt" : "en";

    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, from, to }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || "Translation failed.");
    }

    const data = await res.json();
    if (!data?.ok || !data?.data) throw new Error("Translation service returned an unexpected response.");

    const d = data.data;
    // API returns: english, lithuanian, phonetic, usage, notes (all optional except the pair)
    const apiEn = String(d.english || "").trim();
    const apiLt = String(d.lithuanian || "").trim();
    const apiPh = String(d.phonetic || "");
    const apiUsage = simplifyUsage(d.usage || "");
    const apiNotes = String(d.notes || "");

    return {
      en: en || apiEn,
      lt: lt || apiLt,
      ph: phonetic || apiPh,
      us: usage || apiUsage,
      nt: notes || apiNotes,
      viaApi: true,
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const { en, lt, ph, us, nt, viaApi } = await translateIfNeeded(
        english.trim(),
        lithuanian.trim()
      );

      if (!en || !lt) {
        throw new Error("Could not determine both sides. Please fill at least one side.");
      }

      const entry = {
        English: en,
        Lithuanian: lt,
        Phonetic: ph || "",
        Category: category.trim(),
        Usage: simplifyUsage(us || ""),
        Notes: nt || "",
        // Default RAG to red if we had to translate; otherwise keep amber as safe default
        "RAG Icon": normalizeRag(viaApi ? "🔴" : "🟠"),
        Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(sheet) ? sheet : "Phrases",
        _id: genId(),
        _ts: nowTs(),
        _qstat: { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } },
      };

      // Prepend new entry so it shows first even before sort switch
      setRows((prev) => [entry, ...prev]);

      // Switch view to "Newest" so the item is clearly first
      if (typeof setSortMode === "function") setSortMode("Newest");

      // Close modal if provided; else clear form
      if (typeof onClose === "function") {
        onClose();
      } else {
        setEnglish("");
        setLithuanian("");
        setPhonetic("");
        setCategory("");
        setUsage("");
        setNotes("");
        setSheet(tab || "Phrases");
      }
    } catch (err) {
      alert(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
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
          placeholder="Short usage/context (auto-simplified on save)"
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
            type="submit"
            disabled={loading}
            className={`flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-md px-3 py-2 font-semibold ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving…" : T.save}
          </button>
          <button
            type="button"
            onClick={() => (typeof onClose === "function" ? onClose() : null)}
            className="bg-zinc-800 rounded-md px-3 py-2"
          >
            {T.cancel}
          </button>
        </div>
      </div>
    </form>
  );
}

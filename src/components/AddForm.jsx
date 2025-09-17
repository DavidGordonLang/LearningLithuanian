import React, { useMemo, useState } from "react";

export default function AddForm({
  tab,
  setRows,
  T,
  genId,
  nowTs,
  normalizeRag,
  onClose, // optional – parent can pass this when using a modal
}) {
  const [english, setEnglish] = useState("");
  const [lithuanian, setLithuanian] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [category, setCategory] = useState("");
  const [usage, setUsage] = useState("");
  const [notes, setNotes] = useState("");
  const [sheet, setSheet] = useState(tab || "Phrases");

  const [busy, setBusy] = useState(false);
  const canSave = useMemo(
    () => english.trim() && (lithuanian.trim() || !busy),
    [english, lithuanian, busy]
  );

  function normalizeApi(obj) {
    // Make all keys lower-case for tolerant access
    const lower = {};
    for (const [k, v] of Object.entries(obj || {})) lower[String(k).toLowerCase()] = v;

    // Support both camelCase and lowercase snake-ish keys
    return {
      ok: !!(obj && (obj.ok === true || String(lower.ok) === "true")),
      sourcelang:
        String(lower.sourcelang ?? lower.sourcelanguage ?? lower.sourcelangauge ?? lower.sourcelan ?? lower.sourcelangue ?? lower.sourcelangage ?? lower.sourcelangug ?? "").toLowerCase(),
      targetlang:
        String(lower.targetlang ?? lower.targetlanguage ?? lower.targetlan ?? "").toLowerCase(),
      translation: String(lower.translation ?? lower.lt ?? lower.lithuanian ?? "").trim(),
      phonetic: String(lower.phonetic ?? lower.pronunciation ?? "").trim(),
      usage: String(lower.usage ?? "").trim(),
      notes: String(lower.notes ?? "").trim(),
    };
  }

  async function translate() {
    const text = english.trim();
    if (!text) {
      alert("Type something in the English field first.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from: "en", to: "lt" }),
      });

      // Be lenient: try JSON first; if that fails, try text→JSON.
      let raw;
      try {
        raw = await r.json();
      } catch {
        const t = await r.text();
        raw = JSON.parse(t);
      }

      if (!r.ok) {
        const msg = raw?.error || `HTTP ${r.status}`;
        throw new Error(msg);
      }

      const out = normalizeApi(raw);
      if (!out.translation) throw new Error("Missing translation in response.");

      setLithuanian(out.translation);
      if (out.phonetic) setPhonetic(out.phonetic);
      if (out.usage) setUsage((u) => u || out.usage);
      if (out.notes) setNotes((n) => n || out.notes);
    } catch (e) {
      console.error("[AddForm] translate error:", e);
      alert("Translation service returned an unexpected response.");
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setEnglish("");
    setLithuanian("");
    setPhonetic("");
    setCategory("");
    setUsage("");
    setNotes("");
    setSheet(tab || "Phrases");
  }

  function save() {
    const eng = english.trim();
    const lt = lithuanian.trim();
    if (!eng) return alert("Please add English.");
    if (!lt) return alert("Please translate first.");

    const row = {
      English: eng,
      Lithuanian: lt,
      Phonetic: phonetic.trim(),
      Category: category.trim(),
      Usage: usage.trim(),
      Notes: notes.trim(),
      "RAG Icon": normalizeRag("🔴"), // default new/translated items to RED
      Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(sheet) ? sheet : "Phrases",
      _id: genId(),
      _ts: nowTs(),
      _qstat: { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } },
    };

    setRows((prev) => [row, ...prev]); // prepend so it surfaces immediately
    resetForm();
    if (onClose) onClose();
  }

  return (
    <div className="space-y-3">
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="text-xs mb-1">{T.english}</div>
          <input
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="e.g. Hello"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
            autoFocus
          />
        </div>
        <div>
          <div className="text-xs mb-1">{T.lithuanian}</div>
          <input
            value={lithuanian}
            onChange={(e) => setLithuanian(e.target.value)}
            placeholder="e.g. Labas / Sveiki"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <input
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          placeholder="Short usage/context (kept concise on save)"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
        />
      </div>

      <div>
        <div className="text-xs mb-1">{T.notes}</div>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional — alternatives, register, grammar note…"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
        <div>
          <div className="text-xs mb-1">{T.sheet}</div>
          <select
            value={sheet}
            onChange={(e) => setSheet(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          >
            {["Phrases", "Questions", "Words", "Numbers"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={translate}
            disabled={busy || !english.trim()}
            className={`px-3 py-2 rounded-md border ${
              busy ? "opacity-60 cursor-not-allowed" : ""
            } bg-zinc-800 border-zinc-700`}
            title="Translate English → Lithuanian"
          >
            {busy ? "Translating…" : "Translate"}
          </button>
          <button
            onClick={save}
            disabled={!canSave || !lithuanian.trim()}
            className={`px-4 py-2 rounded-md font-semibold ${
              !lithuanian.trim() || !canSave
                ? "bg-emerald-600/50 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {T.save}
          </button>
          <button
            onClick={() => (onClose ? onClose() : resetForm())}
            className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700"
          >
            {T.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";

/**
 * AddForm
 * Props:
 * - tab: "Phrases" | "Questions" | "Words" | "Numbers"
 * - setRows: (updater) => void   // parent will close modal after save
 * - T: i18n strings
 * - genId: () => string
 * - nowTs: () => number
 * - normalizeRag: (str) => "🔴" | "🟠" | "🟢"
 * - direction: "EN2LT" | "LT2EN"
 * - onSaved: (id: string) => void
 */
export default function AddForm({
  tab,
  setRows,
  T,
  genId,
  nowTs,
  normalizeRag,
  direction,
  onSaved,
}) {
  // core fields
  const [english, setEnglish] = useState("");
  const [lithuanian, setLithuanian] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [usage, setUsage] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("");

  // translation helpers (UI-only for now)
  const [tone, setTone] = useState("neutral"); // neutral | friendly | formal | reserved
  const [audience, setAudience] = useState("respectful"); // general | peer | respectful | intimate
  const [register, setRegister] = useState("natural"); // natural | balanced | literal
  const [genGeneral, setGenGeneral] = useState(true);
  const [genFemale, setGenFemale] = useState(false);
  const [genMale, setGenMale] = useState(false);

  const [busy, setBusy] = useState(false);

  const sheet = useMemo(() => {
    return ["Phrases", "Questions", "Words", "Numbers"].includes(tab)
      ? tab
      : "Phrases";
  }, [tab]);

  /* -------------------------- translate (fixed) -------------------------- */
  async function handleTranslate() {
    if (!english.trim()) {
      alert("Please enter an English prompt first.");
      return;
    }

    setBusy(true);
    try {
      const body = {
        direction,           // "EN2LT" | "LT2EN"
        english: english.trim(),
        tone,                // neutral | friendly | formal | reserved
        audience,            // general | peer | respectful | intimate
        register,            // natural | balanced | literal
        variants: {          // UI flags only for now
          general: genGeneral,
          female: genFemale,
          male: genMale,
        },
      };

      // ✅ Point to the API route (not "/translate")
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const ct = res.headers.get("content-type") || "";
      if (!res.ok) {
        const txt = ct.includes("application/json")
          ? JSON.stringify(await res.json())
          : await res.text();
        throw new Error(`HTTP ${res.status} — ${txt || "translate error"}`);
      }
      if (!ct.includes("application/json")) {
        const txt = await res.text();
        throw new Error(
          "Expected JSON but got HTML/text. Check the API route and deployment.\n\n" +
            txt.slice(0, 200)
        );
      }

      const data = await res.json();
      // Expected minimal shape for now: { lt, ph, usage, notes }
      if (!data || typeof data !== "object") {
        throw new Error("Malformed response from /api/translate");
      }

      if (data.lt) setLithuanian(data.lt);
      if (data.ph) setPhonetic(data.ph);
      if (data.usage) setUsage(data.usage);
      if (data.notes) setNotes(data.notes);
    } catch (err) {
      console.error(err);
      alert(
        "Translate failed. You can still fill the fields manually.\n\n" +
          (err?.message || err)
      );
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------ save row ------------------------------ */
  function handleSave() {
    const en = english.trim();
    const lt = lithuanian.trim();

    if (!en || !lt) {
      alert("Please fill English and Lithuanian first.");
      return;
    }

    const row = {
      _id: genId(),
      _ts: nowTs(),
      English: en,
      Lithuanian: lt,
      Phonetic: phonetic.trim(),
      Category: category.trim(),
      Usage: usage.trim(),
      Notes: notes.trim(),
      Sheet: sheet,
      "RAG Icon": normalizeRag("🟠"), // default Amber
      _qstat: { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } },
    };

    setRows((prev) => [row, ...prev]);
    onSaved?.(row._id);

    // reset inputs for a new entry
    setEnglish("");
    setLithuanian("");
    setPhonetic("");
    setUsage("");
    setNotes("");
    setCategory("");
    setTone("neutral");
    setAudience("respectful");
    setRegister("natural");
    setGenGeneral(true);
    setGenFemale(false);
    setGenMale(false);
  }

  /* ------------------------------- UI ------------------------------- */
  const toneBtns = [
    { key: "neutral", label: "Neutral" },
    { key: "friendly", label: "Friendly" },
    { key: "formal", label: "Formal" },
    { key: "reserved", label: "Reserved" },
  ];

  const audienceBtns = [
    { key: "general", label: "General" },
    { key: "peer", label: "Peer" },
    { key: "respectful", label: "Respectful" },
    { key: "intimate", label: "Intimate" },
  ];

  const registerBtns = [
    { key: "natural", label: "Natural" },
    { key: "balanced", label: "Balanced" },
    { key: "literal", label: "Literal" },
  ];

  const pill = (active) =>
    `px-3 py-2 rounded-xl border ${
      active
        ? "bg-emerald-700/30 border-emerald-600 text-emerald-300"
        : "bg-zinc-900 border-zinc-700"
    }`;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      {/* English */}
      <div>
        <div className="text-sm text-zinc-400 mb-1">English</div>
        <input
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          placeholder="e.g. Hello"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-3"
        />
      </div>

      {/* Lithuanian */}
      <div>
        <div className="text-sm text-zinc-400 mb-1">Lithuanian</div>
        <input
          value={lithuanian}
          onChange={(e) => setLithuanian(e.target.value)}
          placeholder="e.g. Labas / Sveiki"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-3"
        />
      </div>

      {/* Phonetic */}
      <div>
        <div className="text-sm text-zinc-400 mb-1">Phonetic</div>
        <input
          value={phonetic}
          onChange={(e) => setPhonetic(e.target.value)}
          placeholder="Optional — phonetic hint"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-3"
        />
      </div>

      {/* Tone */}
      <fieldset className="rounded-2xl border border-zinc-800 p-4">
        <legend className="px-2 text-sm text-zinc-400">Tone</legend>
        <div className="flex flex-wrap gap-3">
          {toneBtns.map((b) => (
            <button
              type="button"
              key={b.key}
              className={pill(tone === b.key)}
              onClick={() => setTone(b.key)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Audience */}
      <fieldset className="rounded-2xl border border-zinc-800 p-4">
        <legend className="px-2 text-sm text-zinc-400">Audience</legend>
        <div className="flex flex-wrap gap-3">
          {audienceBtns.map((b) => (
            <button
              type="button"
              key={b.key}
              className={pill(audience === b.key)}
              onClick={() => setAudience(b.key)}
            >
              {b.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Register */}
      <fieldset className="rounded-2xl border border-zinc-800 p-4">
        <legend className="px-2 text-sm text-zinc-400">Register</legend>
        <div className="flex flex-wrap gap-3">
          {registerBtns.map((b) => (
            <button
              type="button"
              key={b.key}
              className={pill(register === b.key)}
              onClick={() => setRegister(b.key)}
            >
              {b.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Natural is the default; Balanced/Literal are “peek” aids (saved in
          Notes later).
        </p>
      </fieldset>

      {/* Generate variants (UI-only for now) */}
      <fieldset className="rounded-2xl border border-zinc-800 p-4">
        <legend className="px-2 text-sm text-zinc-400">Generate variants</legend>
        <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={genGeneral}
              onChange={(e) => setGenGeneral(e.target.checked)}
            />
            <span>General / plural</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={genFemale}
              onChange={(e) => setGenFemale(e.target.checked)}
            />
            <span>Addressing female</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={genMale}
              onChange={(e) => setGenMale(e.target.checked)}
            />
            <span>Addressing male</span>
          </label>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          For now this keeps a single card; future steps will generate distinct
          outputs per variant.
        </p>
      </fieldset>

      {/* Usage */}
      <div>
        <div className="text-sm text-zinc-400 mb-1">Usage</div>
        <input
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          placeholder="Short usage/context (kept concise on save)"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-3"
        />
      </div>

      {/* Notes */}
      <div>
        <div className="text-sm text-zinc-400 mb-1">Notes</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional — alternatives, register, grammar, nuance"
          rows={4}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-3"
        />
      </div>

      {/* Category (optional free text for now) */}
      <div className="hidden">
        {/* Keep the wire; we may surface this later as a select */}
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={T.category}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-3"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleTranslate}
          disabled={busy}
          className="px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 disabled:opacity-60"
        >
          {busy ? "Translating…" : "Translate"}
        </button>
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded-md font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
        >
          {T.save}
        </button>
      </div>
    </form>
  );
}

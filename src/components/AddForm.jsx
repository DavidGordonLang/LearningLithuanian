import React, { useMemo, useState } from "react";

export default function AddForm({
  tab,
  setRows,
  T,
  genId,
  nowTs,
  normalizeRag,
  onClose,       // optional – parent can pass this when using a modal
  direction,     // "EN2LT" | "LT2EN"
  onAdded,       // NEW: parent callback to highlight & resort
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
    () => english.trim() && lithuanian.trim() && !busy,
    [english, lithuanian, busy]
  );

  function normalizeApi(obj) {
    const lower = {};
    for (const [k, v] of Object.entries(obj || {})) lower[String(k).toLowerCase()] = v;
    return {
      ok: !!(obj && (obj.ok === true || String(lower.ok) === "true")),
      sourcelang: String(
        lower.sourcelang ??
          lower.sourcelanguage ??
          lower.sourcelangauge ??
          lower.sourcelan ??
          lower.sourcelangue ??
          lower.sourcelangage ??
          lower.sourcelangug ??
          ""
      ).toLowerCase(),
      targetlang: String(lower.targetlang ?? lower.targetlanguage ?? lower.targetlan ?? "").toLowerCase(),
      translation: String(lower.translation ?? lower.lt ?? lower.lithuanian ?? "").trim(),
      phonetic: String(lower.phonetic ?? lower.pronunciation ?? "").trim(),
      usage: String(lower.usage ?? "").trim(),
      notes: String(lower.notes ?? "").trim(),
    };
  }

  function decideDirection() {
    const e = english.trim();
    const l = lithuanian.trim();

    if (e && !l) return { from: "en", to: "lt", text: e, target: "lt" };
    if (l && !e) return { from: "lt", to: "en", text: l, target: "en" };

    if (e && l) {
      const prefer = direction === "LT2EN" ? "en" : "lt";
      const which = prefer === "lt" ? T.lithuanian : T.english;
      const ok = window.confirm(`Overwrite the ${which} field with a fresh translation?`);
      if (!ok) return null;
      if (prefer === "lt") return { from: "en", to: "lt", text: e, target: "lt" };
      return { from: "lt", to: "en", text: l, target: "en" };
    }

    alert("Type in either the English or Lithuanian field, then Translate.");
    return null;
  }

  async function translate() {
    const plan = decideDirection();
    if (!plan) return;

    setBusy(true);
    try {
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: plan.text, from: plan.from, to: plan.to }),
      });

      let raw;
      try { raw = await r.json(); }
      catch { raw = JSON.parse(await r.text()); }

      if (!r.ok) throw new Error(raw?.error || `HTTP ${r.status}`);

      const out = normalizeApi(raw);
      if (!out.translation) throw new Error("Missing translation in response.");

      if (plan.target === "lt") {
        setLithuanian(out.translation);
        if (out.phonetic) setPhonetic(out.phonetic);
      } else {
        setEnglish(out.translation);
      }
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

    const id = genId();
    const row = {
      English: eng,
      Lithuanian: lt,
      Phonetic: phonetic.trim(),
      Category: category.trim(),
      Usage: usage.trim(),
      Notes: notes.trim(),
      "RAG Icon": normalizeRag("🔴"),
      Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(sheet) ? sheet : "Phrases",
      _id: id,
      _ts: nowTs(),
      _qstat: { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } },
    };

    setRows((prev) => [row, ...prev]);
    // Tell parent AFTER state is queued to ensure the card renders
    queueMicrotask(() => onAdded?.(id));
    resetForm();
    onClose?.();
  }

  function swapFields() {
    setEnglish((e) => {
      const e2 = lithuanian;
      setLithuanian(e);
      return e2;
    });
  }

  return (
    <div className="space-y-3">
      {/* Row 1 with swap */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 items-end">
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

        <div className="pb-0.5 flex justify-center">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()} // keep keyboard up
            onClick={swapFields}
            title="Swap English ↔ Lithuanian"
            className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-lg leading-none"
          >
            ⇄
          </button>
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

      <div className="grid grid-cols-3 gap-2 items-center">
        {/* Cancel – left */}
        <div className="justify-self-start">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => (onClose ? onClose() : resetForm())}
            className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700"
          >
            {T.cancel}
          </button>
        </div>

        {/* Translate – center (amber) */}
        <div className="justify-self-center">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={translate}
            disabled={busy || (!english.trim() && !lithuanian.trim())}
            className={`px-3 py-2 rounded-md font-semibold ${
              busy || (!english.trim() && !lithuanian.trim())
                ? "bg-amber-600/50 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-500"
            }`}
            title="Smart translate (EN↔LT)"
          >
            {busy ? "Translating…" : "Translate"}
          </button>
        </div>

        {/* Save – right (green) */}
        <div className="justify-self-end">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={save}
            disabled={!canSave}
            className={`px-4 py-2 rounded-md font-semibold ${
              !canSave ? "bg-emerald-600/50 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {T.save}
          </button>
        </div>
      </div>

      <div>
        <div className="text-xs mb-1">{T.sheet}</div>
        <select
          value={sheet}
          onChange={(e) => setSheet(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
        >
          {["Phrases", "Questions", "Words", "Numbers"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";

/* Local copies of pref keys used in App.jsx (read-only here) */
const LSK_DEF_TONE = "lt_def_tone"; // "Neutral" | "Friendly" | "Formal" | "Reserved"
const LSK_DEF_AUDIENCE = "lt_def_audience"; // "General" | "Peer" | "Respectful" | "Intimate"
const LSK_DEF_REGISTER = "lt_def_register"; // "Natural" | "Balanced" | "Literal"
const LSK_DEF_ADDR_GENDER = "lt_def_addr_gender"; // "unspecified" | "female" | "male" | "general_plural"

const toneOptions = ["Neutral", "Friendly", "Formal", "Reserved"];
const audienceOptions = ["General", "Peer", "Respectful", "Intimate"]; // UI-only; "Intimate" future
const registerOptions = ["Natural", "Balanced", "Literal"];

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
  // Base fields
  const [english, setEnglish] = useState("");
  const [lithuanian, setLithuanian] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [category, setCategory] = useState(tab || "Phrases");
  const [usage, setUsage] = useState("");
  const [notes, setNotes] = useState("");
  const [ragIcon, setRagIcon] = useState("🟠");

  // Step 3 — UI-only controls
  const [tone, setTone] = useState(
    () => localStorage.getItem(LSK_DEF_TONE) || "Neutral"
  );
  const [audience, setAudience] = useState(
    () => localStorage.getItem(LSK_DEF_AUDIENCE) || "General"
  );
  const [register, setRegister] = useState(
    () => localStorage.getItem(LSK_DEF_REGISTER) || "Natural"
  );

  // Default addressed-person (speaker’s target) used to seed variant checkboxes
  const defaultAddr = useMemo(
    () => localStorage.getItem(LSK_DEF_ADDR_GENDER) || "unspecified",
    []
  );

  // Variant checkboxes — nothing server-driven yet; just UI and local logic
  const [wantGeneral, setWantGeneral] = useState(
    defaultAddr === "general_plural" || defaultAddr === "unspecified"
  );
  const [wantFemale, setWantFemale] = useState(defaultAddr === "female");
  const [wantMale, setWantMale] = useState(defaultAddr === "male");

  // Keep a stable category if user navigated tabs while modal is open
  useEffect(() => {
    setCategory((prev) => prev || tab || "Phrases");
  }, [tab]);

  // Translate: still the current simple call — no new options sent yet
  async function handleTranslate() {
    const text = english.trim();
    if (!text) return;
    try {
      // Keep backward-compatible payload for Step 4 upgrade later.
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          direction, // "EN2LT" or "LT2EN"
          // Step 3: we DO NOT rely on these server-side yet; UI-only
          // tone, audience, register, variants ...
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Be defensive: support either a single string or an object
      // Expected current shape: { lt, ph, usage, notes }
      const lt =
        data.lt ||
        data.lithuanian ||
        (direction === "EN2LT" ? data.target : "") ||
        "";
      const ph = data.ph || data.phonetic || "";
      const use = data.usage || "";
      const nts = data.notes || "";

      if (lt) setLithuanian(lt);
      if (ph) setPhonetic(ph);
      if (use) setUsage(use);
      if (nts) setNotes(nts);
    } catch (e) {
      alert("Translate failed. You can still fill the fields manually.");
      console.error(e);
    }
  }

  function resetForm() {
    setEnglish("");
    setLithuanian("");
    setPhonetic("");
    setCategory(tab || "Phrases");
    setUsage("");
    setNotes("");
    setRagIcon("🟠");

    // Keep user’s temporary UI choices
  }

  function makeRowFromState(overrides = {}) {
    return {
      _id: genId(),
      _ts: nowTs(),
      English: english.trim(),
      Lithuanian: (overrides.Lithuanian ?? lithuanian).trim(),
      Phonetic: (overrides.Phonetic ?? phonetic).trim(),
      Category: category.trim(),
      Usage: (overrides.Usage ?? usage).trim(),
      Notes: (overrides.Notes ?? notes).trim(),
      "RAG Icon": normalizeRag(ragIcon),
      Sheet: category,
      // We can stash UI-only metadata in notes (for now) or future fields later
      // For Step 3, no new persistent fields beyond the standard ones.
    };
  }

  function saveSingle() {
    if (!english.trim() || !lithuanian.trim()) {
      alert("Please provide both English and Lithuanian.");
      return;
    }
    const row = makeRowFromState();
    setRows((prev) => [row, ...prev]);
    onSaved?.(row._id);
    resetForm();
  }

  function saveMultiple() {
    // UI-only interpretation:
    // If multiple variants are ticked but the form only holds one LT line,
    // we still create multiple cards duplicating LT, just labeled via Notes.
    // Once Step 4/5 land, this will be fed with distinct outputs.
    const picks = [
      wantGeneral && "general",
      wantFemale && "female",
      wantMale && "male",
    ].filter(Boolean);

    if (picks.length <= 1) {
      saveSingle();
      return;
    }
    if (!english.trim() || !lithuanian.trim()) {
      alert("Please provide both English and Lithuanian.");
      return;
    }

    const rowsToAdd = picks.map((p) => {
      const label =
        p === "general"
          ? "General"
          : p === "female"
          ? "Female"
          : "Male";
      const extra =
        notes.trim()
          ? `${notes.trim()}`
          : "";

      // Tag the note with the chosen variant so you can see which is which
      const prefixedNotes = `[Variant: ${label}; Tone: ${tone}; Audience: ${audience}; Register: ${register}]${extra ? " " + extra : ""}`;

      return makeRowFromState({ Notes: prefixedNotes });
    });

    setRows((prev) => [...rowsToAdd, ...prev]);
    onSaved?.(rowsToAdd[0]._id);
    resetForm();
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        // Decide single vs multi by variant selection
        const many =
          (wantGeneral ? 1 : 0) + (wantFemale ? 1 : 0) + (wantMale ? 1 : 0) > 1;
        many ? saveMultiple() : saveSingle();
      }}
    >
      {/* Category tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {["Phrases", "Questions", "Words", "Numbers"].map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => setCategory(s)}
            className={[
              "px-3 py-1.5 rounded-full text-sm border",
              category === s
                ? "bg-emerald-600 border-emerald-600"
                : "bg-zinc-900 border-zinc-800",
            ].join(" ")}
          >
            {s}
          </button>
        ))}
      </div>

      {/* English */}
      <div>
        <label className="text-xs text-zinc-400 block mb-1">
          {T.english}
        </label>
        <input
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          placeholder="e.g. Hello"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
        />
      </div>

      {/* Lithuanian */}
      <div>
        <label className="text-xs text-zinc-400 block mb-1">
          {T.lithuanian}
        </label>
        <input
          value={lithuanian}
          onChange={(e) => setLithuanian(e.target.value)}
          placeholder="e.g. Labas / Sveiki"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
        />
      </div>

      {/* Phonetic */}
      <div>
        <label className="text-xs text-zinc-400 block mb-1">
          {T.phonetic}
        </label>
        <input
          value={phonetic}
          onChange={(e) => setPhonetic(e.target.value)}
          placeholder="Optional — phonetic hint"
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
        />
      </div>

      {/* Tone / Audience / Register — UI only */}
      <div className="grid sm:grid-cols-3 gap-3">
        {/* Tone */}
        <fieldset className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
          <legend className="text-xs text-zinc-400 px-1">Tone</legend>
          <div className="flex flex-wrap gap-2 mt-1">
            {toneOptions.map((t) => (
              <label key={t} className="cursor-pointer">
                <input
                  type="radio"
                  name="tone"
                  className="peer sr-only"
                  checked={tone === t}
                  onChange={() => setTone(t)}
                />
                <span className="px-2.5 py-1.5 rounded-md border border-zinc-700 bg-zinc-900 text-sm peer-checked:bg-emerald-600 peer-checked:border-emerald-600">
                  {t}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Audience */}
        <fieldset className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
          <legend className="text-xs text-zinc-400 px-1">Audience</legend>
          <div className="flex flex-wrap gap-2 mt-1">
            {audienceOptions.map((a) => (
              <label key={a} className="cursor-pointer">
                <input
                  type="radio"
                  name="aud"
                  className="peer sr-only"
                  checked={audience === a}
                  onChange={() => setAudience(a)}
                />
                <span className="px-2.5 py-1.5 rounded-md border border-zinc-700 bg-zinc-900 text-sm peer-checked:bg-emerald-600 peer-checked:border-emerald-600">
                  {a}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Register */}
        <fieldset className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
          <legend className="text-xs text-zinc-400 px-1">Register</legend>
          <div className="flex flex-wrap gap-2 mt-1">
            {registerOptions.map((r) => (
              <label key={r} className="cursor-pointer">
                <input
                  type="radio"
                  name="reg"
                  className="peer sr-only"
                  checked={register === r}
                  onChange={() => setRegister(r)}
                />
                <span className="px-2.5 py-1.5 rounded-md border border-zinc-700 bg-zinc-900 text-sm peer-checked:bg-emerald-600 peer-checked:border-emerald-600">
                  {r}
                </span>
              </label>
            ))}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">
            Natural is the default; Balanced/Literal are “peek” aids (saved in Notes later).
          </div>
        </fieldset>
      </div>

      {/* Variants (UI only for Step 3) */}
      <fieldset className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
        <legend className="text-xs text-zinc-400 px-1">Generate variants</legend>
        <div className="flex flex-wrap gap-3 mt-1">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={wantGeneral}
              onChange={(e) => setWantGeneral(e.target.checked)}
            />
            <span className="text-sm">General / plural</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={wantFemale}
              onChange={(e) => setWantFemale(e.target.checked)}
            />
            <span className="text-sm">Addressing female</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={wantMale}
              onChange={(e) => setWantMale(e.target.checked)}
            />
            <span className="text-sm">Addressing male</span>
          </label>
        </div>
        <div className="text-[11px] text-zinc-500 mt-2">
          For now this just saves multiple cards with your current LT line; Step 4/5 will generate distinct outputs.
        </div>
      </fieldset>

      {/* Usage */}
      <div>
        <label className="text-xs text-zinc-400 block mb-1">{T.usage}</label>
        <textarea
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          placeholder="Short usage/context (kept concise on save)"
          rows={2}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs text-zinc-400 block mb-1">{T.notes}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional — alternatives, register, grammar, nuance"
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700"
          onClick={handleTranslate}
          title="Ask the translator to fill Lithuanian/phonetic/usage/notes"
        >
          Translate
        </button>
        <button
          type="submit"
          className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 font-semibold"
          title="Save"
        >
          {T.save}
        </button>
      </div>
    </form>
  );
}

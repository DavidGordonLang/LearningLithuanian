import React, { useMemo, useState } from "react";

function pill(on, label, onClick) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3 py-1 rounded-md border " +
        (on
          ? "bg-emerald-700/30 border-emerald-600 text-emerald-200"
          : "bg-zinc-900 border-zinc-700 text-zinc-200")
      }
    >
      {label}
    </button>
  );
}

const normalize = (s = "") => s.trim().replace(/\s+/g, " ");
const ltKey = (lt) => normalize(lt).toLowerCase();

export default function AddForm({
  tab,
  setRows,
  T,
  genId,
  nowTs,
  normalizeRag,
  direction, // "EN2LT" | "LT2EN"
  onSaved,
}) {
  // core fields
  const [english, setEnglish] = useState("");
  const [lithuanian, setLithuanian] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [usage, setUsage] = useState("");
  const [notes, setNotes] = useState("");

  // style controls
  const [tone, setTone] = useState("Neutral"); // Neutral | Friendly | Formal | Reserved
  const [audience, setAudience] = useState("Respectful"); // General | Peer | Respectful | Intimate
  const [register, setRegister] = useState("Natural"); // Natural | Balanced | Literal

  // variant checkboxes
  const [genVariant, setGenVariant] = useState(true);
  const [femaleVariant, setFemaleVariant] = useState(false);
  const [maleVariant, setMaleVariant] = useState(false);

  // translate status
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Preview list; each item: { key, lt, ph, usage, notes, include }
  const [preview, setPreview] = useState([]);

  const sheet = tab || "Phrases";

  const toneOptions = ["Neutral", "Friendly", "Formal", "Reserved"];
  const audienceOptions = ["General", "Peer", "Respectful", "Intimate"];
  const registerOptions = ["Natural", "Balanced", "Literal"];

  function setPreviewFromResponse(variants, balanced) {
    // Convert to preview items and collapse duplicates (same LT across variants)
    const items = variants.map((v) => ({
      key: v.key,
      lt: normalize(v.lt),
      ph: normalize(v.ph),
      usage: normalize(v.usage),
      notes: normalize(v.notes),
      include: true,
    }));

    // If nothing usable, tell the user
    const anyLt = items.some((i) => i.lt);
    if (!anyLt) {
      alert(
        "Translate returned, but no usable Lithuanian was found.\n\n" +
          "Tip: ensure the API returns { lt, ph, usage, notes } per variant."
      );
      return;
    }

    // De-dup by LT for preview display, but remember which variants collapsed
    const groups = new Map(); // ltNorm -> array of items
    for (const it of items) {
      const k = ltKey(it.lt || "");
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(it);
    }

    const collapsed = [];
    for (const [_, group] of groups) {
      // Keep the first (prefer "general" if present)
      const first =
        group.find((g) => g.key === "general") ||
        group.find((g) => g.key === "addressing_female") ||
        group[0];

      // If duplicates collapsed, append a tiny hint to notes (for preview only)
      const others = group.filter((g) => g !== first);
      let hint = "";
      if (others.length > 0) {
        const labels = others.map((g) =>
          g.key === "addressing_female" ? "female" : g.key === "addressing_male" ? "male" : g.key
        );
        hint = `Same form also covers: ${labels.join(", ")}.`;
      }

      collapsed.push({
        ...first,
        notes:
          first.notes && hint ? `${first.notes} ${hint}` : first.notes || hint,
      });
    }

    setPreview(collapsed);

    // also populate the main fields from the first preview (for visibility/edit)
    const seed = collapsed[0] || items[0];
    if (seed) {
      if (seed.lt) setLithuanian(seed.lt);
      if (seed.ph) setPhonetic(seed.ph);
      if (seed.usage) setUsage(seed.usage);
      // Balanced peek: append into Notes if provided
      if (balanced && balanced.notes) {
        setNotes((prev) =>
          prev ? `${prev}\n\nBalanced: ${balanced.notes}` : `Balanced: ${balanced.notes}`
        );
      } else if (seed.notes) {
        setNotes(seed.notes);
      }
    }
  }

  async function doTranslate() {
    setBusy(true);
    setError("");

    try {
      const payload = {
        english: english.trim(),
        direction,
        options: {
          tone: tone.toLowerCase(), // neutral/friendly/formal/reserved
          audience: audience.toLowerCase(), // general/peer/respectful/intimate
          register: register.toLowerCase(), // natural/balanced/literal
          variants: {
            general: !!genVariant,
            female: !!femaleVariant,
            male: !!maleVariant,
          },
          // Balanced is a "peek" – request it only if user picked Balanced
          includeBalanced: register === "Balanced",
        },
      };

      if (!payload.english) {
        alert('Please enter an English phrase in the "English" field first.');
        return;
      }

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        alert(
          "Translate failed. You can still fill the fields manually.\n\n" +
            (msg || `HTTP ${res.status}`)
        );
        return;
      }

      const data = await res.json();
      if (!data?.ok) {
        alert(
          "Translate returned an error. You can still fill the fields manually.\n\n" +
            (data?.error || "Unknown error")
        );
        return;
      }

      const variants = Array.isArray(data.variants) ? data.variants : [];
      setPreviewFromResponse(variants, data.balanced);
    } catch (e) {
      console.error(e);
      alert("Translate failed. You can still fill the fields manually.");
    } finally {
      setBusy(false);
    }
  }

  // Save: commit selected previews, with in-batch de-dup and “same form” annotation
  function onSave() {
    const selected = preview.filter((p) => p.include);

    // If no preview yet, save the manual fields as a single card
    if (selected.length === 0 && !lithuanian.trim()) {
      alert("Nothing to save yet. Translate first or fill the Lithuanian field.");
      return;
    }

    if (selected.length === 0) {
      // manual single
      const id = genId();
      setRows((prev) => [
        {
          English: normalize(english),
          Lithuanian: normalize(lithuanian),
          Phonetic: normalize(phonetic),
          Category: "",
          Usage: normalize(usage),
          Notes: normalize(notes),
          "RAG Icon": "🟠",
          Sheet: sheet,
          _id: id,
          _ts: nowTs(),
        },
        ...prev,
      ]);
      onSaved?.(id);
      return;
    }

    // In-batch collapse by Lithuanian string
    const groups = new Map(); // lt -> array of previews
    for (const it of selected) {
      const key = ltKey(it.lt || "");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(it);
    }

    const toSave = [];
    for (const [_k, group] of groups) {
      // Keep first; if multiple variants share the same LT, annotate in notes
      const first = group[0];
      const others = group.slice(1);
      let n = first.notes || "";
      if (others.length > 0) {
        const labels = others.map((g) =>
          g.key === "addressing_female" ? "female" : g.key === "addressing_male" ? "male" : g.key
        );
        const line = `Same Lithuanian form for: ${labels.join(", ")}.`;
        n = n ? `${n} ${line}` : line;
      }

      toSave.push({
        English: normalize(english),
        Lithuanian: normalize(first.lt),
        Phonetic: normalize(first.ph),
        Category: "",
        Usage: normalize(first.usage),
        Notes: normalize(n),
        "RAG Icon": "🟠",
        Sheet: sheet,
        _id: genId(),
        _ts: nowTs(),
      });
    }

    setRows((prev) => [...toSave, ...prev]);
    onSaved?.(toSave[0]?._id);
  }

  const previewCount = preview.length;
  const anyPreview = previewCount > 0;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      {/* English */}
      <div>
        <div className="text-sm mb-1">English</div>
        <input
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          placeholder="e.g. Hello"
        />
      </div>

      {/* Lithuanian */}
      <div>
        <div className="text-sm mb-1">Lithuanian</div>
        <input
          value={lithuanian}
          onChange={(e) => setLithuanian(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          placeholder="e.g. Labas / Sveiki"
        />
      </div>

      {/* Phonetic */}
      <div>
        <div className="text-sm mb-1">Phonetic</div>
        <input
          value={phonetic}
          onChange={(e) => setPhonetic(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          placeholder="Optional — phonetic hint"
        />
      </div>

      {/* Tone */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        <div className="text-sm mb-2">Tone</div>
        <div className="flex flex-wrap gap-2">
          {toneOptions.map((t) =>
            pill(tone === t, t, () => setTone(t))
          )}
        </div>
      </div>

      {/* Audience */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        <div className="text-sm mb-2">Audience</div>
        <div className="flex flex-wrap gap-2">
          {audienceOptions.map((a) =>
            pill(audience === a, a, () => setAudience(a))
          )}
        </div>
      </div>

      {/* Register */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        <div className="text-sm mb-2">Register</div>
        <div className="flex flex-wrap gap-2">
          {registerOptions.map((r) =>
            pill(register === r, r, () => setRegister(r))
          )}
        </div>
        <div className="text-xs text-zinc-500 mt-2">
          Natural is the default; Balanced/Literal are “peek” aids (saved in Notes later).
        </div>
      </div>

      {/* Generate variants */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        <div className="text-sm mb-2">Generate variants</div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={genVariant}
              onChange={(e) => setGenVariant(e.target.checked)}
            />
            <span>General / plural</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={femaleVariant}
              onChange={(e) => setFemaleVariant(e.target.checked)}
            />
            <span>Addressing female</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={maleVariant}
              onChange={(e) => setMaleVariant(e.target.checked)}
            />
            <span>Addressing male</span>
          </label>
        </div>
        <div className="text-xs text-zinc-500 mt-2">
          If variants end up identical in Lithuanian, they’ll be collapsed automatically.
        </div>
      </div>

      {/* Usage */}
      <div>
        <div className="text-sm mb-1">Usage</div>
        <input
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          placeholder="Short usage/context (kept concise on save)"
        />
      </div>

      {/* Notes */}
      <div>
        <div className="text-sm mb-1">Notes</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full min-h-[96px] bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          placeholder="Optional — alternatives, register, grammar, nuance"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={doTranslate}
          className={
            "px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 " +
            (busy ? "opacity-60 cursor-not-allowed" : "")
          }
        >
          {busy ? "Translating…" : "Translate"}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 font-semibold"
        >
          {T.save}
        </button>
      </div>

      {/* Preview */}
      {anyPreview && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
          <div className="text-sm font-medium mb-2">Preview ({previewCount} selected)</div>
          <div className="space-y-2">
            {preview.map((p, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold leading-tight">
                      {p.lt || "(no Lithuanian yet)"}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">{english || "(English…)"}</div>
                    {p.ph && <div className="text-xs text-zinc-500 italic mt-0.5">{p.ph}</div>}
                    {p.usage && (
                      <div className="text-xs text-zinc-400 mt-2">
                        <span className="text-zinc-500">Usage:</span> {p.usage}
                      </div>
                    )}
                    {p.notes && (
                      <div className="text-xs text-zinc-400 mt-1 whitespace-pre-wrap">{p.notes}</div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                        {p.key === "general"
                          ? "general"
                          : p.key === "addressing_female"
                          ? "female"
                          : p.key === "addressing_male"
                          ? "male"
                          : p.key}
                      </span>
                      <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                        {register.toLowerCase()}
                      </span>
                      <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                        {tone.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={p.include}
                      onChange={(e) => {
                        const next = [...preview];
                        next[i] = { ...next[i], include: e.target.checked };
                        setPreview(next);
                      }}
                    />
                    <span className="text-sm">Include</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
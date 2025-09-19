import React, { useMemo, useState } from "react";

/**
 * Props:
 * - tab: "Phrases" | "Questions" | "Words" | "Numbers"
 * - setRows(updater)
 * - T: strings
 * - genId()
 * - nowTs()
 * - normalizeRag()
 * - direction: "EN2LT" | "LT2EN"
 */
export default function AddForm({
  tab,
  setRows,
  T,
  genId,
  nowTs,
  normalizeRag,
  direction = "EN2LT",
}) {
  // Core fields
  const [en, setEn] = useState("");
  const [lt, setLt] = useState("");
  const [ph, setPh] = useState("");
  const [usage, setUsage] = useState("");
  const [notes, setNotes] = useState("");

  // Style selectors
  const [tone, setTone] = useState("neutral"); // neutral|friendly|formal|reserved
  const [audience, setAudience] = useState("respectful"); // general|peer|respectful|intimate
  const [register, setRegister] = useState("natural"); // natural|balanced|literal

  // Variant checkboxes (preview & save multiple)
  const [vGeneral, setVGeneral] = useState(true);
  const [vFemale, setVFemale] = useState(false);
  const [vMale, setVMale] = useState(false);

  const variants = useMemo(() => {
    const arr = [];
    if (vGeneral) arr.push("general");
    if (vFemale) arr.push("female");
    if (vMale) arr.push("male");
    return arr;
  }, [vGeneral, vFemale, vMale]);

  // Preview list derived from variants + current fields
  const [previews, setPreviews] = useState([]); // [{id, include, rag, meta, en, lt, ph, usage, notes}]
  const [translating, setTranslating] = useState(false);

  // Helpers
  const pillsTone = ["neutral", "friendly", "formal", "reserved"];
  const pillsAudience = ["general", "peer", "respectful", "intimate"];
  const pillsRegister = ["natural", "balanced", "literal"];

  function mkPreviewBase(variant) {
    return {
      id: `${variant}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      include: true,
      rag: "🟠",
      meta: { variant, tone, register },
      en: en.trim(),
      lt: "",
      ph: "",
      usage: "",
      notes: "",
    };
  }

  function ensurePreviewsFor(variantList) {
    // Create or update a preview row per variant
    setPreviews((prev) => {
      const map = new Map(prev.map((p) => [p.meta?.variant, p]));
      const out = [];
      for (const v of variantList) {
        const existing = map.get(v);
        if (existing) {
          out.push({
            ...existing,
            meta: { ...existing.meta, tone, register },
            en: en.trim(),
          });
        } else {
          out.push(mkPreviewBase(v));
        }
      }
      // Keep previous items only if still selected
      return out;
    });
  }

  // Update previews whenever variants or EN/tone/register change
  React.useEffect(() => {
    ensurePreviewsFor(variants);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants, tone, register, en]);

  async function handleTranslate() {
    const english = en.trim();
    if (!english) {
      alert("Please fill the English field first.");
      return;
    }
    if (variants.length === 0) {
      alert("Select at least one variant (e.g., General).");
      return;
    }

    setTranslating(true);
    try {
      // Send BOTH keys: `english` (for server schema) and `en` (back-compat client schema)
      const payload = {
        english,         // <- server expects this (per your 400 error)
        en: english,     // <- belt & braces
        tone,
        audience,
        register,
        variants,        // ["general","female","male"] subset
        direction,       // harmless if server ignores it
      };

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const ct = res.headers.get("content-type") || "";
      if (!res.ok) {
        const text = ct.includes("application/json") ? JSON.stringify(await res.json()) : await res.text();
        alert(
          `Translate failed. You can still fill the fields manually.\n\n` +
          `${text || res.statusText || "Unknown error"}`
        );
        return;
      }
      if (!ct.includes("application/json")) {
        const text = await res.text();
        alert(
          "Translate returned, but no usable fields were found.\n" +
          "Check the console for the raw response.\n\n" +
          "Tip: make the API return { lt, ph, usage, notes } or map to those keys."
        );
        console.log("Unexpected non-JSON response from /api/translate:", text);
        return;
      }

      const data = await res.json();
      // Expected shapes supported:
      // 1) Single: { lt, ph, usage, notes }
      // 2) Multi:  { variants: [ { variant, lt, ph, usage, notes }, ... ] }
      // 3) Fallback string: { lt: "..." }

      const fromSingle = (obj) => ({
        lt: (obj?.lt ?? "").trim(),
        ph: (obj?.ph ?? "").trim(),
        usage: (obj?.usage ?? "").trim(),
        notes: (obj?.notes ?? "").trim(),
      });

      if (Array.isArray(data?.variants) && data.variants.length) {
        // Map server variants back into our preview rows
        setPreviews((prev) => {
          const map = new Map(prev.map((p) => [p.meta?.variant, p]));
          const out = [...prev];
          for (const v of data.variants) {
            const key = (v?.variant || "").toLowerCase(); // "general" | "female" | "male"
            if (!key) continue;
            const found = map.get(key);
            const mapped = fromSingle(v);
            if (found) {
              Object.assign(found, {
                lt: mapped.lt || found.lt,
                ph: mapped.ph || found.ph,
                usage: mapped.usage || found.usage,
                notes: mapped.notes || found.notes,
              });
            }
          }
          return out;
        });
      } else {
        const mapped = fromSingle(data);
        // Fill the main LT/PH/Usage/Notes fields as a convenience
        if (mapped.lt) setLt(mapped.lt);
        if (mapped.ph) setPh(mapped.ph);
        if (mapped.usage) setUsage(mapped.usage);
        if (mapped.notes) setNotes(mapped.notes);

        // Put the same result into all selected previews that lack a value
        setPreviews((prev) =>
          prev.map((p) =>
            p.lt
              ? p
              : {
                  ...p,
                  lt: mapped.lt || p.lt,
                  ph: mapped.ph || p.ph,
                  usage: mapped.usage || p.usage,
                  notes: mapped.notes || p.notes,
                }
          )
        );
      }
    } catch (e) {
      console.error(e);
      alert("Translate failed. You can still fill the fields manually.");
    } finally {
      setTranslating(false);
    }
  }

  function handleSave() {
    const selected = previews.filter((p) => p.include);
    if (!selected.length) {
      alert("Nothing selected to save.");
      return;
    }

    const base = {
      English: en.trim(),
      Phonetic: ph.trim(),
      Usage: usage.trim(),
      Notes: notes.trim(),
      "RAG Icon": "🟠",
      Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(tab)
        ? tab
        : "Phrases",
    };

    const toSave =
      selected.length > 0
        ? selected.map((p) => ({
            ...base,
            Lithuanian: (p.lt || lt).trim(),
            _id: genId(),
            _ts: nowTs(),
          }))
        : [
            {
              ...base,
              Lithuanian: lt.trim(),
              _id: genId(),
              _ts: nowTs(),
            },
          ];

    setRows((prev) => [...toSave, ...prev]);
  }

  /* ----------------------------- UI ----------------------------- */

  const Chip = ({ active, onClick, children }) => (
    <button
      type="button"
      className={
        "px-3 py-1 rounded-md border " +
        (active
          ? "bg-emerald-700 border-emerald-600"
          : "bg-zinc-900 border-zinc-700 hover:border-zinc-600")
      }
      onClick={onClick}
    >
      {children}
    </button>
  );

  const Checkbox = ({ checked, onChange, label }) => (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );

  return (
    <div className="space-y-4">
      {/* Category tabs are outside in the parent dock; this form just respects `tab` */}

      {/* English */}
      <div>
        <div className="text-sm mb-1">English</div>
        <input
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
          placeholder="e.g. Hello"
          value={en}
          onChange={(e) => setEn(e.target.value)}
        />
      </div>

      {/* Lithuanian (can be typed or filled via Translate) */}
      <div>
        <div className="text-sm mb-1">Lithuanian</div>
        <input
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
          placeholder="e.g. Labas / Sveiki"
          value={lt}
          onChange={(e) => setLt(e.target.value)}
        />
      </div>

      {/* Phonetic */}
      <div>
        <div className="text-sm mb-1">Phonetic</div>
        <input
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
          placeholder="Optional — phonetic hint"
          value={ph}
          onChange={(e) => setPh(e.target.value)}
        />
      </div>

      {/* Tone */}
      <div className="rounded-2xl border border-zinc-800 p-3">
        <div className="text-sm mb-2">Tone</div>
        <div className="flex flex-wrap gap-2">
          {pillsTone.map((t) => (
            <Chip key={t} active={tone === t} onClick={() => setTone(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </Chip>
          ))}
        </div>
      </div>

      {/* Audience */}
      <div className="rounded-2xl border border-zinc-800 p-3">
        <div className="text-sm mb-2">Audience</div>
        <div className="flex flex-wrap gap-2">
          {pillsAudience.map((a) => (
            <Chip
              key={a}
              active={audience === a}
              onClick={() => setAudience(a)}
            >
              {a[0].toUpperCase() + a.slice(1)}
            </Chip>
          ))}
        </div>
      </div>

      {/* Register */}
      <div className="rounded-2xl border border-zinc-800 p-3">
        <div className="text-sm mb-2">Register</div>
        <div className="flex flex-wrap gap-2">
          {pillsRegister.map((r) => (
            <Chip
              key={r}
              active={register === r}
              onClick={() => setRegister(r)}
            >
              {r[0].toUpperCase() + r.slice(1)}
            </Chip>
          ))}
        </div>
        <div className="text-xs text-zinc-500 mt-2">
          Natural is the default; Balanced/Literal are “peek” aids (saved in Notes later).
        </div>
      </div>

      {/* Variants */}
      <div className="rounded-2xl border border-zinc-800 p-3">
        <div className="text-sm mb-2">Generate variants</div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-6">
            <Checkbox
              checked={vGeneral}
              onChange={setVGeneral}
              label="General / plural"
            />
            <Checkbox
              checked={vFemale}
              onChange={setVFemale}
              label="Addressing female"
            />
            <Checkbox
              checked={vMale}
              onChange={setVMale}
              label="Addressing male"
            />
          </div>
          <div className="text-xs text-zinc-500">
            For now this keeps a single card; later we’ll generate distinct outputs per variant.
          </div>
        </div>
      </div>

      {/* Usage */}
      <div>
        <div className="text-sm mb-1">Usage</div>
        <input
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
          placeholder="Short usage/context (kept concise on save)"
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
        />
      </div>

      {/* Notes */}
      <div>
        <div className="text-sm mb-1">Notes</div>
        <textarea
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
          placeholder="Optional — alternatives, register, grammar, nuance"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 disabled:opacity-50"
          onClick={handleTranslate}
          disabled={translating || !en.trim() || variants.length === 0}
        >
          {translating ? "Translating…" : "Translate"}
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 font-semibold"
          onClick={handleSave}
        >
          Save
        </button>
      </div>

      {/* Preview */}
      <div className="pt-2">
        <div className="text-sm text-zinc-400 mb-2">
          Preview ({previews.length} selected)
        </div>
        <div className="space-y-3">
          {previews.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-zinc-800 p-3 bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-sm text-zinc-400">
                    {p.lt ? p.lt : "(no Lithuanian yet)"}
                  </div>
                  <div className="text-xs text-zinc-500">{p.en}</div>
                  {p.ph && (
                    <div className="text-xs text-zinc-500 italic mt-0.5">
                      {p.ph}
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2 text-xs shrink-0">
                  <input
                    type="checkbox"
                    checked={p.include}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setPreviews((prev) =>
                        prev.map((x) =>
                          x.id === p.id ? { ...x, include: checked } : x
                        )
                      );
                    }}
                  />
                  Include
                </label>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                  {p.meta?.variant || "general"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                  {p.meta?.tone || tone}
                </span>
                <button
                  type="button"
                  className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700"
                  onClick={() => {
                    const more = [
                      p.usage ? `Usage: ${p.usage}` : null,
                      p.notes ? `Notes: ${p.notes}` : null,
                    ]
                      .filter(Boolean)
                      .join("\n");
                    alert(more || "No extra details yet.");
                  }}
                >
                  More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

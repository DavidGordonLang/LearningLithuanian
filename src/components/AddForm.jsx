// src/components/AddForm.jsx
import React, { useMemo, useRef, useState } from "react";

/**
 * Tiny label
 */
function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-md bg-zinc-800/80 px-2.5 py-0.5 text-xs text-zinc-200">
      {children}
    </span>
  );
}

/**
 * Toggle-like button
 */
function SegBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-md border transition",
        active
          ? "bg-emerald-600/90 border-emerald-500 text-white"
          : "bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

const initialFlags = { general: true, female: true, male: true };

export default function AddForm({ onSave }) {
  const [english, setEnglish] = useState("");
  const [lt, setLt] = useState("");
  const [ph, setPh] = useState("");
  const [usage, setUsage] = useState("");
  const [notes, setNotes] = useState("");

  const [tone, setTone] = useState("neutral");
  const [audience, setAudience] = useState("general");
  const [register, setRegister] = useState("natural");

  const [flags, setFlags] = useState(initialFlags);

  const [busy, setBusy] = useState(false);
  const [variants, setVariants] = useState([]); // raw variants from API
  const dlgRef = useRef(null);

  // Collapse logic: only collapse if the API says neutral=true OR notes include "gender-neutral"
  const collapsed = useMemo(() => {
    if (!variants.length) return [];

    // Group by Lithuanian string
    const groups = new Map();
    for (const v of variants) {
      const key = (v.lt || "").trim().toLowerCase();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(v);
    }

    const out = [];
    for (const [_, group] of groups) {
      // If ALL marked neutral OR all notes include gender-neutral → collapse to one
      const allNeutral =
        group.length > 1 &&
        group.every(
          (v) =>
            v.neutral === true ||
            /gender-?neutral in lithuanian/i.test(v.notes || "")
        );

      if (allNeutral) {
        // Pick the first but keep a merged note that it’s neutral
        const first = { ...group[0] };
        if (!/gender-?neutral in lithuanian/i.test(first.notes || "")) {
          first.notes = `${first.notes ? first.notes + " " : ""}Gender-neutral in Lithuanian.`;
        }
        out.push(first);
      } else {
        // Keep them all (distinct forms)
        out.push(...group);
      }
    }

    return out;
  }, [variants]);

  async function handleTranslate() {
    if (!english.trim()) {
      alert("Please enter an English phrase first.");
      return;
    }
    setBusy(true);
    setVariants([]);

    try {
      const resp = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          english: english.trim(),
          tone,
          audience,
          register,
          variants: flags,
        }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || !data?.ok) {
        // Show helpful message + dump raw if present
        const tip =
          "Tip: ensure the API returns { variants: [{ key, lt, ph, usage, notes, neutral }] } per requested variant.";
        const msg = data?.error
          ? `${data.error}\n\n${tip}`
          : `Translate failed.\n\n${tip}`;
        alert(msg);
        setBusy(false);
        return;
      }

      const arr = Array.isArray(data.variants) ? data.variants : [];

      if (!arr.length || !arr.some((v) => v.lt)) {
        alert(
          "Translate returned, but no usable Lithuanian was found.\n\nTip: ensure the API returns { lt, ph, usage, notes } per variant."
        );
        setBusy(false);
        return;
      }

      // Pre-fill top-level fields with the first (for convenience)
      setLt(arr[0].lt || "");
      setPh(arr[0].ph || "");
      setUsage(arr[0].usage || "");
      setNotes(arr[0].notes || "");
      setVariants(arr);
    } catch (e) {
      alert("A server error occurred while translating.");
    } finally {
      setBusy(false);
    }
  }

  function handleSave() {
    if (!lt.trim()) {
      alert("Please translate first (or fill Lithuanian manually).");
      return;
    }
    // Caller persists one or many (we pass collapsed preview)
    onSave?.({
      english: english.trim(),
      tone,
      audience,
      register,
      variants: collapsed.length
        ? collapsed
        : [
            {
              key: "general",
              lt: lt.trim(),
              ph: ph.trim(),
              usage: usage.trim(),
              notes: notes.trim(),
              neutral: true,
            },
          ],
    });
    // Reset minimal fields
    setEnglish("");
    setLt("");
    setPh("");
    setUsage("");
    setNotes("");
    setVariants([]);
  }

  return (
    <div className="relative">
      {/* Fields */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">English</label>
          <input
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100"
            placeholder="e.g. How are you?"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Lithuanian</label>
          <input
            value={lt}
            onChange={(e) => setLt(e.target.value)}
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100"
            placeholder="e.g. Kaip sekasi?"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Phonetic</label>
          <input
            value={ph}
            onChange={(e) => setPh(e.target.value)}
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100"
            placeholder="ASCII phonetic — e.g. kaiyp se-ka-see?"
          />
        </div>

        {/* Tone */}
        <div>
          <div className="text-sm text-zinc-400 mb-2">Tone</div>
          <div className="flex gap-2 flex-wrap">
            {["neutral", "friendly", "formal", "reserved"].map((t) => (
              <SegBtn key={t} active={tone === t} onClick={() => setTone(t)}>
                {t[0].toUpperCase() + t.slice(1)}
              </SegBtn>
            ))}
          </div>
        </div>

        {/* Audience */}
        <div>
          <div className="text-sm text-zinc-400 mb-2">Audience</div>
          <div className="flex gap-2 flex-wrap">
            {["general", "peer", "respectful", "intimate"].map((t) => (
              <SegBtn
                key={t}
                active={audience === t}
                onClick={() => setAudience(t)}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </SegBtn>
            ))}
          </div>
        </div>

        {/* Register */}
        <div>
          <div className="text-sm text-zinc-400 mb-2">Register</div>
          <div className="flex gap-2 flex-wrap">
            {["natural", "balanced", "literal"].map((t) => (
              <SegBtn
                key={t}
                active={register === t}
                onClick={() => setRegister(t)}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </SegBtn>
            ))}
          </div>
        </div>

        {/* Variant checkboxes */}
        <div>
          <div className="text-sm text-zinc-400 mb-2">Generate variants</div>
          <div className="space-y-2">
            {[
              ["general", "General / plural"],
              ["female", "Addressing female"],
              ["male", "Addressing male"],
            ].map(([k, label]) => (
              <label key={k} className="flex items-center gap-3 text-zinc-200">
                <input
                  type="checkbox"
                  checked={!!flags[k]}
                  onChange={(e) =>
                    setFlags((f) => ({ ...f, [k]: e.target.checked }))
                  }
                />
                {label}
              </label>
            ))}
            <p className="text-xs text-zinc-400">
              If variants end up identical in Lithuanian, they’ll be collapsed
              automatically.
            </p>
          </div>
        </div>

        {/* Usage & Notes */}
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Usage</label>
          <input
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100"
            placeholder="Short usage/context (kept concise on save)"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100"
            placeholder="Optional — alternatives, register, grammar, nuance"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={handleTranslate}
            className="px-4 py-2 rounded-md bg-zinc-800 text-zinc-100 border border-zinc-700 disabled:opacity-60"
          >
            {busy ? "Translating…" : "Translate"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-emerald-600 text-white"
          >
            Save
          </button>
        </div>

        {/* Preview */}
        {!!collapsed.length && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-3">
            <div className="text-sm text-zinc-400 mb-2">
              Preview ({collapsed.length} selected)
            </div>
            {collapsed.map((v, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-800 bg-black/30 p-3"
              >
                <div className="text-zinc-100 font-semibold">{v.lt}</div>
                <div className="text-zinc-400 text-sm">{english}</div>
                {v.ph && <div className="italic text-zinc-500 text-sm">{v.ph}</div>}
                {v.usage && (
                  <div className="text-zinc-400 text-sm mt-1">
                    Usage: {v.usage}
                  </div>
                )}
                {v.notes && (
                  <div className="text-zinc-400 text-xs mt-1">{v.notes}</div>
                )}
                <div className="mt-2 flex gap-2">
                  {v.key && <Chip>{v.key}</Chip>}
                  {v.neutral ? <Chip>neutral</Chip> : <Chip>gendered</Chip>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
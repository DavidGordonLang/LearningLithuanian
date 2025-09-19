import React, { useMemo, useRef, useState } from "react";

/**
 * Props:
 * - tab: "Phrases" | "Questions" | "Words" | "Numbers" (sheet)
 * - setRows: (updater) => void   // parent handles close-after-save
 * - T: strings
 * - genId: () => string
 * - nowTs: () => number
 * - normalizeRag: (emojiOrColor) => "🔴"|"🟠"|"🟢"
 * - direction: "EN2LT" | "LT2EN"
 */
export default function AddForm({
  tab,
  setRows,
  T,
  genId,
  nowTs,
  normalizeRag,
  direction,
}) {
  // Base fields
  const [en, setEn] = useState("");
  const [lt, setLt] = useState("");
  const [ph, setPh] = useState("");
  const [usage, setUsage] = useState("");
  const [notes, setNotes] = useState("");

  // Controls
  const [tone, setTone] = useState("Neutral"); // Neutral | Friendly | Formal | Reserved
  const [aud, setAud] = useState("Respectful"); // General | Peer | Respectful | Intimate
  const [register, setRegister] = useState("Natural"); // Natural | Balanced | Literal

  // Variant selection (what to generate)
  const [vGeneral, setVGeneral] = useState(true);
  const [vFemale, setVFemale] = useState(false);
  const [vMale, setVMale] = useState(false);

  // UX
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // ---- NEW: Translate previews state ----
  const [previews, setPreviews] = useState([]); // array of { id, lt, en, ph, usage, notes, variant, tone, aud, register, include }

  // Helpers
  const selectedVariants = useMemo(() => {
    const list = [];
    if (vGeneral) list.push({ key: "general", label: "General / plural" });
    if (vFemale) list.push({ key: "female", label: "Addressing female" });
    if (vMale) list.push({ key: "male", label: "Addressing male" });
    return list;
  }, [vGeneral, vFemale, vMale]);

  function pillButton(active, onClick, label) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={
          "px-3 py-2 rounded-md border text-sm " +
          (active
            ? "bg-emerald-600 border-emerald-500"
            : "bg-zinc-900 border-zinc-700")
        }
      >
        {label}
      </button>
    );
  }

  async function onTranslate() {
    setError("");
    setBusy(true);
    setPreviews([]);

    try {
      const payload = {
        direction,
        en: en.trim(),
        lt: lt.trim(),
        tone,
        audience: aud,
        register,
        // In step 4 (future), we’ll pass variants to API. For now, single call.
        variants: selectedVariants.map((v) => v.key),
      };

      if (!payload.en) {
        setBusy(false);
        alert("Please enter an English prompt/phrase first.");
        return;
      }

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const ctype = res.headers.get("content-type") || "";
      if (!ctype.includes("application/json")) {
        const txt = await res.text();
        console.warn("Translate non-JSON:", txt);
        alert(
          "Translate returned, but no usable fields were found.\nCheck the console for the raw response.\n\nTip: make the API return { lt, ph, usage, notes } or map to those keys."
        );
        setBusy(false);
        return;
      }

      const data = await res.json();
      // Accept several shapes; prefer simple { lt, ph, usage, notes }
      const baseLt = (data?.lt ?? "").trim();
      const basePh = (data?.ph ?? "").trim();
      const baseUsage = (data?.usage ?? "").trim();
      const baseNotes = (data?.notes ?? "").trim();

      // Update the form fields with what we got
      if (baseLt) setLt(baseLt);
      if (basePh) setPh(basePh);
      if (baseUsage) setUsage(baseUsage);
      if (baseNotes) setNotes(baseNotes);

      // Build previews for every selected variant (use base result for now)
      const pv = selectedVariants.map((v) => ({
        id: genId(),
        lt: baseLt || lt.trim(),
        en: en.trim(),
        ph: basePh || ph.trim(),
        usage: baseUsage || usage.trim(),
        notes: baseNotes || notes.trim(),
        variant: v.label, // label for the chip
        tone,
        aud,
        register,
        include: true,
      }));

      // If nothing selected, don’t create previews (user can still save one manual card)
      setPreviews(pv);
    } catch (e) {
      console.error(e);
      alert(
        "Translate failed. You can still fill the fields manually.\n\n" +
          (e?.message || e)
      );
    } finally {
      setBusy(false);
    }
  }

  function saveRowsFromPreviews() {
    const selected = previews.filter((p) => p.include);
    if (!selected.length) {
      alert("Nothing selected to save. Toggle at least one preview.");
      return;
    }

    const rowsToAdd = selected.map((p) => ({
      _id: genId(),
      _ts: nowTs(),
      English: p.en || "",
      Lithuanian: p.lt || "",
      Phonetic: p.ph || "",
      Category: "", // left blank; user can edit later
      Usage: p.usage || "",
      Notes: p.notes || "",
      Sheet: tab,
      "RAG Icon": normalizeRag("🟠"),
      // Optional: we can embed structured meta into notes or a future field
      _meta: {
        tone: p.tone,
        audience: p.aud,
        register: p.register,
        variant: p.variant,
      },
    }));

    setRows((prev) => [...rowsToAdd, ...prev]);
  }

  function saveSingleRow() {
    const row = {
      _id: genId(),
      _ts: nowTs(),
      English: en.trim(),
      Lithuanian: lt.trim(),
      Phonetic: ph.trim(),
      Category: "",
      Usage: usage.trim(),
      Notes: notes.trim(),
      Sheet: tab,
      "RAG Icon": normalizeRag("🟠"),
      _meta: {
        tone,
        audience: aud,
        register,
        variant: "General / single",
      },
    };

    if (!row.English || !row.Lithuanian) {
      alert("Please provide at least English and Lithuanian before saving.");
      return;
    }

    setRows((prev) => [row, ...prev]);
  }

  function onSave() {
    if (previews.length) {
      saveRowsFromPreviews();
    } else {
      saveSingleRow();
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      {/* Tabs already shown above in the modal header */}

      {/* English */}
      <div>
        <div className="text-sm text-zinc-400 mb-1">English</div>
        <input
          value={en}
          onChange={(e) => setEn(e.target.value)}
          placeholder="e.g. Hello"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
        />
      </div>

      {/* Lithuanian */}
      <div>
        <div className="text-sm text-zinc-400 mb-1">Lithuanian</div>
        <input
          value={lt}
          onChange={(e) => setLt(e.target.value)}
          placeholder="e.g. Labas / Sveiki"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
        />
      </div>

      {/* Phonetic */}
      <div>
        <div className="text-sm text-zinc-400 mb-1">Phonetic</div>
        <input
          value={ph}
          onChange={(e) => setPh(e.target.value)}
          placeholder="Optional — phonetic hint"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
        />
      </div>

      {/* Tone */}
      <fieldset className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
        <legend className="px-1 text-sm text-zinc-300">Tone</legend>
        <div className="flex flex-wrap gap-2">
          {pillButton(tone === "Neutral", () => setTone("Neutral"), "Neutral")}
          {pillButton(tone === "Friendly", () => setTone("Friendly"), "Friendly")}
          {pillButton(tone === "Formal", () => setTone("Formal"), "Formal")}
          {pillButton(tone === "Reserved", () => setTone("Reserved"), "Reserved")}
        </div>
      </fieldset>

      {/* Audience */}
      <fieldset className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
        <legend className="px-1 text-sm text-zinc-300">Audience</legend>
        <div className="flex flex-wrap gap-2">
          {pillButton(aud === "General", () => setAud("General"), "General")}
          {pillButton(aud === "Peer", () => setAud("Peer"), "Peer")}
          {pillButton(aud === "Respectful", () => setAud("Respectful"), "Respectful")}
          {pillButton(aud === "Intimate", () => setAud("Intimate"), "Intimate")}
        </div>
      </fieldset>

      {/* Register */}
      <fieldset className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
        <legend className="px-1 text-sm text-zinc-300">Register</legend>
        <div className="flex flex-wrap gap-2">
          {pillButton(
            register === "Natural",
            () => setRegister("Natural"),
            "Natural"
          )}
          {pillButton(
            register === "Balanced",
            () => setRegister("Balanced"),
            "Balanced"
          )}
          {pillButton(
            register === "Literal",
            () => setRegister("Literal"),
            "Literal"
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Natural is the default; Balanced/Literal are “peek” aids (saved in
          Notes later).
        </p>
      </fieldset>

      {/* Generate variants */}
      <fieldset className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
        <legend className="px-1 text-sm text-zinc-300">Generate variants</legend>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={vGeneral}
              onChange={(e) => setVGeneral(e.target.checked)}
            />
            <span>General / plural</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={vFemale}
              onChange={(e) => setVFemale(e.target.checked)}
            />
            <span>Addressing female</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={vMale}
              onChange={(e) => setVMale(e.target.checked)}
            />
            <span>Addressing male</span>
          </label>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          For now this saves multiple cards with your current LT line; later we’ll
          generate distinct outputs per variant.
        </p>
      </fieldset>

      {/* Usage */}
      <div>
        <div className="text-sm text-zinc-400 mb-1">Usage</div>
        <input
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          placeholder="Short usage/context (kept concise on save)"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
        />
      </div>

      {/* Notes */}
      <div>
        <div className="text-sm text-zinc-400 mb-1">Notes</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional — alternatives, register, grammar, nuance"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 min-h-[96px]"
        />
      </div>

      {/* Translate / Save */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onTranslate}
          disabled={busy}
          className="px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 disabled:opacity-60"
        >
          {busy ? "Translating…" : "Translate"}
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md font-semibold bg-emerald-600 hover:bg-emerald-500"
        >
          Save
        </button>
      </div>

      {/* ---- NEW: Previews list ---- */}
      {previews.length > 0 && (
        <div className="mt-3 border-t border-zinc-800 pt-3">
          <div className="text-sm font-semibold mb-2">
            Preview ({previews.filter((p) => p.include).length} selected)
          </div>
          <div className="space-y-3">
            {previews.map((p, i) => (
              <PreviewCard
                key={p.id}
                pv={p}
                onToggleInclude={() =>
                  setPreviews((old) =>
                    old.map((x) =>
                      x.id === p.id ? { ...x, include: !x.include } : x
                    )
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      {error && <div className="text-sm text-red-400">{error}</div>}
    </form>
  );
}

/** Small preview card used inside the Add Form modal */
function PreviewCard({ pv, onToggleInclude }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold leading-tight">{pv.lt}</div>
          <div className="text-xs text-zinc-400 mt-0.5">{pv.en}</div>
          {pv.ph && (
            <div className="text-xs text-zinc-500 mt-0.5 italic">{pv.ph}</div>
          )}
        </div>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={pv.include}
            onChange={onToggleInclude}
          />
          Include
        </label>
      </div>

      {pv.usage && (
        <div className="text-xs text-zinc-400 mt-2">
          <span className="text-zinc-500">Usage:</span> {pv.usage}
        </div>
      )}

      {pv.notes && open && (
        <div className="text-xs text-zinc-300 mt-2 whitespace-pre-wrap border-t border-zinc-800 pt-2">
          {pv.notes}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {/* RAG chip (amber default) */}
          <span
            className="inline-flex h-5 px-2 items-center text-[11px] rounded-full bg-amber-500"
            aria-label="RAG amber"
          />
          {/* Variant, Tone chips */}
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
            {pv.variant}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
            {pv.tone}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs text-zinc-300 hover:text-white px-2 py-1 rounded-md bg-zinc-800/60 border border-zinc-700"
        >
          {open ? "Less" : "More"}
        </button>
      </div>
    </div>
  );
}

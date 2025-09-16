// src/components/AddTranslateModal.jsx
import React, { useEffect, useRef, useState } from "react";

const SHEETS = ["Phrases", "Questions", "Words", "Numbers"];
const RAGS = ["🔴", "🟠", "🟢"];

export default function AddTranslateModal({
  open,
  onClose,
  onAdd,
  defaultSheet = "Phrases",
  direction,
  setDirection,
  genId,
  nowTs,
}) {
  const [english, setEnglish] = useState("");
  const [lithuanian, setLithuanian] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [usage, setUsage] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("");
  const [sheet, setSheet] = useState(defaultSheet);
  const [rag, setRag] = useState("🟠");

  const [loading, setLoading] = useState(false);
  const [usedAI, setUsedAI] = useState(false);
  const [error, setError] = useState("");

  const firstInputRef = useRef(null);

  // keep sheet in sync with current tab
  useEffect(() => setSheet(defaultSheet), [defaultSheet]);

  // focus first input when modal opens (no blur hacks on mobile)
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => firstInputRef.current?.focus({ preventScroll: true }));
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const reset = () => {
    setEnglish("");
    setLithuanian("");
    setPhonetic("");
    setUsage("");
    setNotes("");
    setCategory("");
    setSheet(defaultSheet);
    setRag("🟠");
    setLoading(false);
    setUsedAI(false);
    setError("");
  };

  const close = () => {
    reset();
    onClose?.();
  };

  async function translate() {
    setError("");
    const text = direction === "EN2LT" ? english.trim() : lithuanian.trim();
    if (!text) {
      setError("Type something to translate first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, direction }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Translate failed");
      const data = await res.json();

      // only fill fields that are empty so we don't clobber user typing
      if (!english) setEnglish(data.english || "");
      if (!lithuanian) setLithuanian(data.lithuanian || "");
      if (!phonetic) setPhonetic(data.phonetic || "");
      if (!usage) setUsage(data.usage || "");
      if (!notes) setNotes(data.notes || "");
      if (!category) setCategory(data.category || "");

      setUsedAI(true);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  function save() {
    if (!english.trim() && !lithuanian.trim()) {
      setError("Enter English or Lithuanian (or both).");
      return;
    }
    const row = {
      English: english.trim(),
      Lithuanian: lithuanian.trim(),
      Phonetic: phonetic.trim(),
      Usage: usage.trim(),
      Notes: notes.trim(),
      Category: category.trim(),
      "RAG Icon": rag,
      Sheet: SHEETS.includes(sheet) ? sheet : "Phrases",
      _id: genId(),
      _ts: nowTs(),
      source: usedAI ? "ai" : "user",
      verified: false,
    };
    onAdd?.(row);
    close();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onPointerDown={close}
    >
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl
                   p-4 sm:p-5 shadow-2xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Add & Translate</div>
          <button
            onClick={close}
            className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Direction */}
        <div className="flex items-center gap-2 mb-3">
          <button
            className={`px-3 py-1.5 rounded-md text-sm border ${direction === "EN2LT" ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-700"}`}
            onClick={() => setDirection("EN2LT")}
          >
            EN → LT
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm border ${direction === "LT2EN" ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-700"}`}
            onClick={() => setDirection("LT2EN")}
          >
            LT → EN
          </button>

          <div className="ml-auto flex items-center gap-2">
            <select
              className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1"
              value={sheet}
              onChange={(e) => setSheet(e.target.value)}
              title="Sheet"
            >
              {SHEETS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1"
              value={rag}
              onChange={(e) => setRag(e.target.value)}
              title="RAG"
            >
              {RAGS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-xs mb-1">English</div>
            <input
              ref={firstInputRef}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
            />
          </div>
          <div>
            <div className="text-xs mb-1">Lithuanian</div>
            <input
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={lithuanian}
              onChange={(e) => setLithuanian(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
            />
          </div>

          <div>
            <div className="text-xs mb-1">Phonetic</div>
            <input
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              placeholder="e.g., svei-KEE / ah-choo"
            />
          </div>
          <div>
            <div className="text-xs mb-1">Category</div>
            <input
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              autoComplete="off"
              inputMode="text"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="text-xs mb-1">Usage</div>
            <textarea
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 min-h-[64px]"
              value={usage}
              onChange={(e) => setUsage(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="sm:col-span-2">
            <div className="text-xs mb-1">Notes</div>
            <textarea
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 min-h-[64px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-2 text-sm text-red-400">{error}</div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={translate}
            disabled={loading}
            className={`px-3 py-2 rounded-md border text-sm ${loading ? "opacity-60 cursor-wait" : ""} bg-zinc-800 border-zinc-700`}
            title="Fill fields with a GPT translation"
          >
            {loading ? "Translating…" : "Translate with GPT"}
          </button>

          <div className="flex items-center gap-2">
            <button onClick={close} className="px-3 py-2 rounded-md border text-sm bg-zinc-800 border-zinc-700">
              Cancel
            </button>
            <button
              onClick={save}
              className="px-3 py-2 rounded-md text-sm font-semibold bg-emerald-600 hover:bg-emerald-500"
            >
              Save entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

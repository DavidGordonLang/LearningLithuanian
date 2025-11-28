import React, { useState } from "react";

export default function HomeView({
  playText,
  onOpenAddForm,
  setRows,
  genId,
  nowTs,
  showToast,
  rows,
}) {
  const [input, setInput] = useState("");
  const [translating, setTranslating] = useState(false);

  const [ltOut, setLtOut] = useState("");
  const [enLiteral, setEnLiteral] = useState("");
  const [enNatural, setEnNatural] = useState("");
  const [phonetics, setPhonetics] = useState("");

  const [gender, setGender] = useState("neutral");
  const [tone, setTone] = useState("friendly");

  async function handleTranslate() {
    const text = input.trim();
    if (!text) return;

    setTranslating(true);
    setLtOut("");
    setEnLiteral("");
    setEnNatural("");
    setPhonetics("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          tone,
          gender,
        }),
      });

      const data = await res.json();

      if (data?.lt && data?.en_literal) {
        setLtOut(data.lt);
        setEnLiteral(data.en_literal);
        setEnNatural(data.en_natural || data.en_literal);
        setPhonetics(data.phonetics || "");
      } else {
        setLtOut("Translation error.");
      }
    } catch (err) {
      console.error(err);
      setLtOut("Translation error.");
    } finally {
      setTranslating(false);
    }
  }

  function handleClear() {
    setInput("");
    setLtOut("");
    setEnLiteral("");
    setEnNatural("");
    setPhonetics("");
  }

  function handleSaveToLibrary() {
    if (!ltOut || !enLiteral) return;

    const englishInput = input.trim();
    if (!englishInput) return;

    const already = rows.some(
      (r) =>
        (r.EnglishOriginal || r.English || "").trim().toLowerCase() ===
          englishInput.toLowerCase() &&
        (r.Lithuanian || "").trim().toLowerCase() === ltOut.trim().toLowerCase()
    );

    if (already) {
      showToast?.("Already in library");
      return;
    }

    const row = {
      English: englishInput,
      EnglishOriginal: englishInput,
      EnglishLiteral: enLiteral,
      EnglishNatural: enNatural || enLiteral,
      Lithuanian: ltOut,
      Phonetic: phonetics || "",
      Category: "",
      Usage: "",
      Notes: "",
      "RAG Icon": "🟠",
      Sheet: "Phrases",
      _id: genId(),
      _ts: nowTs(),
      _qstat: {
        red: { ok: 0, bad: 0 },
        amb: { ok: 0, bad: 0 },
        grn: { ok: 0, bad: 0 },
      },
    };

    setRows((prev) => [row, ...prev]);
    showToast?.("Entry saved to library");
  }

  function Segmented({ value, onChange, options }) {
    return (
      <div className="flex w-full bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] overflow-hidden">
        {options.map((opt, idx) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              className={
                "flex-1 px-3 py-2 text-sm font-medium transition-colors select-none " +
                (active
                  ? "bg-emerald-600 text-black"
                  : "bg-zinc-950/60 text-zinc-200 hover:bg-zinc-800/60") +
                (idx !== options.length - 1
                  ? " border-r border-zinc-800"
                  : "")
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Say it right — then save it.</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Draft the phrase, tune the tone, hear it spoken, then save it to your library.
        </p>
      </div>

      {/* Speaking to */}
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] p-4 mb-5">
        <div className="text-sm font-semibold mb-2">Speaking to…</div>
        <Segmented
          value={gender}
          onChange={setGender}
          options={[
            { value: "neutral", label: "Neutral" },
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ]}
        />
      </div>

      {/* Tone */}
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] p-4 mb-5">
        <div className="text-sm font-semibold mb-2">Tone</div>
        <Segmented
          value={tone}
          onChange={setTone}
          options={[
            { value: "friendly", label: "Friendly" },
            { value: "neutral", label: "Neutral" },
            { value: "polite", label: "Polite" },
          ]}
        />
      </div>

      {/* Input */}
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] p-4 mb-5">
        <label className="block text-sm mb-2">What would you like to say?</label>

        <textarea
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm mb-3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex gap-3 flex-wrap">
          {/* Translate (PRIMARY PILL) */}
          <button
            type="button"
            className="
              bg-emerald-500 text-black rounded-full px-5 py-2 
              font-semibold shadow hover:bg-emerald-400 active:bg-emerald-300 
              transition-all select-none
            "
            onClick={handleTranslate}
            disabled={translating || !input.trim()}
          >
            {translating ? "Translating…" : "Translate"}
          </button>

          {/* Clear (SECONDARY PILL) */}
          <button
            type="button"
            className="
              bg-zinc-800 text-zinc-200 rounded-full px-5 py-2 
              font-medium hover:bg-zinc-700 active:bg-zinc-600 
              transition-all select-none
            "
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Output */}
      {ltOut && (
        <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] p-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">Lithuanian</label>
            <div className="text-lg font-semibold break-words">{ltOut}</div>

            {phonetics && (
              <div className="text-sm text-zinc-400 mt-1">{phonetics}</div>
            )}
          </div>

          <div className="border-t border-zinc-800 pt-3 space-y-1 text-sm">
            <div>
              <span className="font-semibold">English meaning (literal): </span>
              <span>{enLiteral}</span>
            </div>
            <div>
              <span className="font-semibold">English meaning (natural): </span>
              <span>{enNatural}</span>
            </div>
          </div>

          {/* Play buttons */}
          <div className="flex items-center gap-3 flex-wrap pt-2">
            {/* Normal play */}
            <button
              type="button"
              className="
                bg-emerald-500 text-black rounded-full 
                px-5 py-2 text-[18px] shadow 
                hover:bg-emerald-400 active:bg-emerald-300 
                select-none
              "
              onClick={() => playText(ltOut)}
            >
              ▶ Normal
            </button>

            {/* Slow play */}
            <button
              type="button"
              className="
                bg-emerald-700 text-black rounded-full 
                px-5 py-2 text-[18px] shadow 
                hover:bg-emerald-600 active:bg-emerald-500 
                select-none
              "
              onClick={() => playText(ltOut, { slow: true })}
            >
              🐢 Slow
            </button>

            {/* Save to Library */}
            <button
              type="button"
              className="
                bg-zinc-800 text-zinc-200 rounded-full 
                px-5 py-2 text-sm font-medium
                hover:bg-zinc-700 active:bg-zinc-600
                select-none
              "
              onClick={handleSaveToLibrary}
            >
              Save to library
            </button>
          </div>
        </div>
      )}

      {/* Add Entry manually */}
      {typeof onOpenAddForm === "function" && (
        <button
          className="
            w-full mt-6 bg-emerald-500 text-black rounded-full 
            px-5 py-3 font-semibold shadow text-center
            hover:bg-emerald-400 active:bg-emerald-300 
            select-none
          "
          onClick={onOpenAddForm}
        >
          + Add Entry Manually
        </button>
      )}
    </div>
  );
}

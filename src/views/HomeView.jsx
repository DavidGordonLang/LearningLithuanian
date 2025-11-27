import React, { useState } from "react";

export default function HomeView({
  direction,
  setDirection,
  playText,
  onOpenAddForm, // optional
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

  const [gender, setGender] = useState("neutral"); // neutral | male | female
  const [tone, setTone] = useState("friendly");    // friendly | neutral | polite

  const isEnToLt = direction === "EN2LT";

  /* -------------------------------------------------------------
     API CALL
  ------------------------------------------------------------- */
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
          direction,
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

  /* -------------------------------------------------------------
     CLEAR
  ------------------------------------------------------------- */
  function handleClear() {
    setInput("");
    setLtOut("");
    setEnLiteral("");
    setEnNatural("");
    setPhonetics("");
  }

  /* -------------------------------------------------------------
     SAVE TO LIBRARY
  ------------------------------------------------------------- */
  function handleSaveToLibrary() {
    if (!ltOut || !enLiteral) return;
    if (!setRows || !genId || !nowTs) return;

    const englishInput = input.trim();
    if (!englishInput) return;

    const already = rows.some(
      (r) =>
        (r.EnglishOriginal || r.English || "").trim().toLowerCase() ===
          englishInput.toLowerCase() &&
        (r.Lithuanian || "").trim().toLowerCase() ===
          ltOut.trim().toLowerCase()
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
    showToast?.("Saved to library ✓");
  }

  /* -------------------------------------------------------------
     SEGMENTED CONTROL COMPONENT
  ------------------------------------------------------------- */
  function Segmented({ value, onChange, options }) {
    return (
      <div className="flex w-full bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
        {options.map((opt, idx) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={
                "flex-1 px-3 py-2 text-sm font-medium transition-colors " +
                (active
                  ? "bg-emerald-600 text-black"
                  : "bg-zinc-900 text-zinc-200 hover:bg-zinc-700") +
                (idx !== options.length - 1
                  ? " border-r border-zinc-700"
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

  /* =============================================================
     RENDER
  ============================================================= */
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28">
      <div style={{ height: 56 + 112 }} />

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Say it right — then save it.</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Draft the phrase, tune the tone, hear it spoken, then save it to your library.
        </p>
      </div>

      {/* Optional Add Phrase button */}
      {typeof onOpenAddForm === "function" && (
        <button
          className="mb-6 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-black font-semibold"
          onClick={() => onOpenAddForm()}
        >
          + Add Phrase
        </button>
      )}

      {/* Learning direction */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
        <div className="text-sm font-semibold mb-2">Learning direction</div>
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            className={
              "px-3 py-1.5 rounded-md text-sm border " +
              (direction === "EN2LT"
                ? "bg-emerald-600 border-emerald-500 text-black font-semibold"
                : "bg-zinc-950 border-zinc-700 text-zinc-200")
            }
            onClick={() => setDirection("EN2LT")}
          >
            English → Lithuanian
          </button>
          <button
            type="button"
            className={
              "px-3 py-1.5 rounded-md text-sm border " +
              (direction === "LT2EN"
                ? "bg-emerald-600 border-emerald-500 text-black font-semibold"
                : "bg-zinc-950 border-zinc-700 text-zinc-200")
            }
            onClick={() => setDirection("LT2EN")}
          >
            Lithuanian → English
          </button>
        </div>
      </div>

      {/* Speaking to… */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
        <label className="block text-sm mb-2">
          {direction === "EN2LT"
            ? "What do you want to say in English?"
            : "Ką norite pasakyti lietuviškai?"}
        </label>
        <textarea
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm mb-3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 font-semibold disabled:opacity-60"
            onClick={handleTranslate}
            disabled={translating || !input.trim()}
          >
            {translating ? "Translating…" : "Translate"}
          </button>

          <button
            type="button"
            className="px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 font-semibold"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Output */}
      {ltOut && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">
              {direction === "EN2LT" ? "Lithuanian" : "Lithuanian (base phrase)"}
            </label>
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

          <div className="flex items-center gap-3 flex-wrap pt-2">
            <button
              type="button"
              className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-black"
              onClick={() => playText(ltOut)}
            >
              ▶ Normal
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-md bg-emerald-700 hover:bg-emerald-600 text-black"
              onClick={() => playText(ltOut, { slow: true })}
            >
              🐢 Slow
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm"
              onClick={handleSaveToLibrary}
            >
              Save to library
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

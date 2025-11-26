import React, { useState } from "react";

export default function HomeView({
  direction,
  setDirection,
  playText,
  onOpenAddForm, // optional: if provided, shows "+ Add Phrase" button
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [translating, setTranslating] = useState(false);

  // tone: "friendly" | "neutral" | "formal"
  const [tone, setTone] = useState("friendly");
  // gender: "neutral" | "female" | "male"
  const [gender, setGender] = useState("neutral");

  const isEnToLt = direction === "EN2LT";

  async function handleTranslate() {
    const text = input.trim();
    if (!text) return;

    setTranslating(true);
    setOutput("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          direction,
          // Only meaningful into LT; backend can ignore when not EN2LT
          tone,
          gender,
        }),
      });

      const data = await res.json();
      if (data?.translated) {
        setOutput(data.translated);
      } else {
        setOutput("Translation failed.");
      }
    } catch (err) {
      console.error(err);
      setOutput("Translation error.");
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28">
      {/* offset for header + dock */}
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

      {/* Direction toggle */}
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
        {!isEnToLt && (
          <p className="mt-2 text-xs text-zinc-500">
            Tone and gender options mainly affect Lithuanian output. When translating to English,
            they are ignored.
          </p>
        )}
      </div>

      {/* Speaking to... (gender) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="text-sm font-semibold">Speaking to…</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["neutral", "female", "male"].map((g) => {
            const label =
              g === "neutral" ? "Neutral" : g === "female" ? "Female" : "Male";
            const selected = gender === g;
            return (
              <button
                key={g}
                type="button"
                disabled={!isEnToLt}
                className={
                  "px-3 py-1.5 rounded-md text-sm border select-none " +
                  (selected
                    ? "bg-emerald-600 border-emerald-500 text-black font-semibold"
                    : "bg-zinc-950 border-zinc-700 text-zinc-200") +
                  (!isEnToLt ? " opacity-50 cursor-not-allowed" : "")
                }
                onClick={() => isEnToLt && setGender(g)}
              >
                {label}
              </button>
            );
          })}
        </div>
        {!isEnToLt && (
          <p className="mt-2 text-xs text-zinc-500">
            Gender choice is only used when translating into Lithuanian.
          </p>
        )}
      </div>

      {/* Tone */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
        <div className="text-sm font-semibold mb-2">Tone</div>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "friendly", label: "Friendly / familiar" },
            { id: "neutral", label: "Neutral" },
            { id: "formal", label: "Polite / formal" },
          ].map((t) => {
            const selected = tone === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={!isEnToLt}
                className={
                  "px-3 py-1.5 rounded-md text-sm border select-none " +
                  (selected
                    ? "bg-emerald-600 border-emerald-500 text-black font-semibold"
                    : "bg-zinc-950 border-zinc-700 text-zinc-200") +
                  (!isEnToLt ? " opacity-50 cursor-not-allowed" : "")
                }
                onClick={() => isEnToLt && setTone(t.id)}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {isEnToLt && (
          <p className="mt-2 text-xs text-zinc-500">
            Friendly/neutral will use informal “tu”. Polite/formal will use respectful “jūs”.
          </p>
        )}
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
          placeholder={
            direction === "EN2LT"
              ? "For example: I really appreciate your help with this."
              : "Pavyzdžiui: Labai vertinu tavo pagalbą su tuo."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          type="button"
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 font-semibold disabled:opacity-60"
          onClick={handleTranslate}
          disabled={translating || !input.trim()}
        >
          {translating ? "Translating…" : "Translate"}
        </button>
      </div>

      {/* Output */}
      {output && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <label className="block text-sm mb-2">
            {direction === "EN2LT" ? "Lithuanian" : "English"}
          </label>
          <div className="text-lg font-semibold mb-3 break-words">
            {output}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-black"
              onClick={() => playText(output)}
            >
              ▶ Normal
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-md bg-emerald-700 hover:bg-emerald-600 text-black"
              onClick={() => playText(output, { slow: true })}
            >
              🐢 Slow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
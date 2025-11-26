import React, { useState } from "react";

export default function HomeView({
  direction,
  setDirection,
  playText,
  onOpenAddForm, // new prop from App.jsx to open AddForm modal
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [translating, setTranslating] = useState(false);

  async function handleTranslate() {
    const text = input.trim();
    if (!text) return;
    setTranslating(true);
    setOutput("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, direction }),
      });

      const data = await res.json();

      if (data.translated) {
        setOutput(data.translated);
      } else {
        setOutput("Translation failed.");
      }
    } catch (err) {
      console.error(err);
      setOutput("Translation error.");
    }

    setTranslating(false);
  }

  const showAddButton = true;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28">
      <div style={{ height: 56 + 112 }} />

      <h2 className="text-2xl font-bold mb-4">Learn Lithuanian</h2>

      {/* Add Phrase */}
      {showAddButton && (
        <button
          className="mb-6 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-black font-semibold"
          onClick={() => onOpenAddForm?.()}
        >
          + Add Phrase
        </button>
      )}

      {/* Direction toggle */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-6">
        <div className="text-sm font-semibold mb-2">Learning direction</div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="direction"
              checked={direction === "EN2LT"}
              onChange={() => setDirection("EN2LT")}
            />
            <span>English → Lithuanian</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="direction"
              checked={direction === "LT2EN"}
              onChange={() => setDirection("LT2EN")}
            />
            <span>Lithuanian → English</span>
          </label>
        </div>
      </div>

      {/* Translation Input */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <label className="block text-sm mb-2">
          {direction === "EN2LT" ? "Enter English" : "Įveskite lietuviškai"}
        </label>
        <input
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 mb-3"
          placeholder={
            direction === "EN2LT"
              ? "Good evening"
              : "Labas vakaras"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 font-semibold"
          onClick={handleTranslate}
          disabled={translating || !input.trim()}
        >
          {translating ? "Translating..." : "Translate"}
        </button>
      </div>

      {/* Output */}
      {output && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <label className="block text-sm mb-2">
            {direction === "EN2LT"
              ? "Lithuanian"
              : "English"}
          </label>
          <div className="text-lg font-semibold mb-3">{output}</div>

          {/* Audio buttons */}
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-black"
              onClick={() => playText(output)}
            >
              ▶ Normal
            </button>
            <button
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

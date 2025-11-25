// src/views/HomeView.jsx
import React, { useState, useRef, useMemo } from "react";

/**
 * HomeView – clean, modular translator view.
 * This version contains:
 * - translator UI
 * - audio playback triggers
 * - tone & gender UI
 * - translation call to /api/translate
 * - save button logic
 * - result panel
 *
 * It does NOT contain the phrase list below.
 * App.jsx controls the phrase list separately.
 */

export default function HomeView({
  direction,
  setDirection,
  playText,
  setRows,
  genId,
  nowTs,
  STR,
  cn,
}) {
  const T = STR[direction];

  // Translator UI state
  const [srcText, setSrcText] = useState("");
  const [targetGender, setTargetGender] = useState("neutral");
  const [tone, setTone] = useState("friendly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [justSaved, setJustSaved] = useState(false);

  async function handleTranslate() {
    setError("");
    setJustSaved(false);

    const text = srcText.trim();
    if (!text) {
      setError("Type something to translate first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text,
          direction,
          gender: targetGender,
          tone,
        }),
      });

      if (!res.ok) {
        let msg = "Translate failed";
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      const english =
        data.english ||
        (direction === "EN2LT" ? text : data.english || "");
      const lithuanian =
        data.lithuanian ||
        (direction === "LT2EN" ? text : data.lithuanian || "");

      setResult({
        english: english || "",
        lithuanian: lithuanian || "",
        phonetic: data.phonetic || "",
        usage: data.usage || "",
        notes: data.notes || "",
        category: data.category || "",
      });
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!result) {
      setError("Translate something first.");
      return;
    }

    const english = (result.english || "").trim();
    const lithuanian = (result.lithuanian || "").trim();
    if (!english && !lithuanian) {
      setError("Nothing to save yet.");
      return;
    }

    const row = {
      English: english,
      Lithuanian: lithuanian,
      Phonetic: (result.phonetic || "").trim(),
      Usage: (result.usage || "").trim(),
      Notes: (result.notes || "").trim(),
      Category: (result.category || "").trim(),
      "RAG Icon": "🟠",
      Sheet: "Phrases",
      _id: genId(),
      _ts: nowTs(),
      source: "ai",
      verified: false,
    };

    setRows((prev) => [row, ...prev]);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  }

  function handlePlay() {
    if (!result) return;
    const targetPhrase =
      direction === "EN2LT"
        ? result.lithuanian || result.english
        : result.english || result.lithuanian;

    if (!targetPhrase || !targetPhrase.trim()) return;
    playText(targetPhrase, { slow: false });
  }

  const directionLabel =
    direction === "EN2LT" ? "EN → LT" : "LT → EN";

  const srcPlaceholder =
    direction === "EN2LT"
      ? "Type your English phrase…"
      : "Įrašykite lietuvišką frazę…";

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-10">
      {/* Translation card */}
      <div className="mt-3 mb-6">
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl">

          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-1">
                Live translator
              </div>
              <div className="text-xl sm:text-2xl font-semibold">
                Say it right — then save it.
              </div>
            </div>
            <div className="sm:ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDirection("EN2LT")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs border",
                  direction === "EN2LT"
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-zinc-950 border-zinc-700 text-zinc-200"
                )}
              >
                EN → LT
              </button>
              <button
                type="button"
                onClick={() => setDirection("LT2EN")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs border",
                  direction === "LT2EN"
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-zinc-950 border-zinc-700 text-zinc-200"
                )}
              >
                LT → EN
              </button>
            </div>
          </div>

          {/* Input area */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-zinc-400">
                What do you want to say?
              </div>
              <div className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 uppercase tracking-[0.18em]">
                {directionLabel}
              </div>
            </div>
            <textarea
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm min-h-[72px] resize-y"
              value={srcText}
              onChange={(e) => {
                setSrcText(e.target.value);
                setError("");
              }}
              placeholder={srcPlaceholder}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          {/* Tone + Gender */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">

            {/* Gender */}
            <div className="flex-1">
              <div className="text-xs text-zinc-400 mb-1">Speaking to…</div>
              <div className="inline-flex gap-1 rounded-full bg-zinc-950 p-1 border border-zinc-700/70">
                {[
                  { value: "neutral", label: "Neutral" },
                  { value: "female", label: "Female" },
                  { value: "male", label: "Male" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTargetGender(opt.value)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full",
                      targetGender === opt.value
                        ? "bg-emerald-600 text-white"
                        : "text-zinc-200"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div className="flex-1">
              <div className="text-xs text-zinc-400 mb-1">Tone</div>
              <div className="inline-flex gap-1 rounded-full bg-zinc-950 p-1 border border-zinc-700/70">
                {[
                  { value: "friendly", label: "Friendly / familiar" },
                  { value: "neutral", label: "Neutral" },
                  { value: "formal", label: "Polite / formal" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTone(opt.value)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full whitespace-nowrap",
                      tone === opt.value
                        ? "bg-emerald-600 text-white"
                        : "text-zinc-200"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 text-sm text-red-400">{error}</div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <button
              type="button"
              onClick={handleTranslate}
              disabled={loading}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2",
                "bg-emerald-600 hover:bg-emerald-500",
                loading && "opacity-60 cursor-wait"
              )}
            >
              {loading ? "Translating…" : "Translate with GPT"}
            </button>

            <div className="flex-1 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePlay}
                disabled={!result}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm flex items-center gap-2",
                  "bg-zinc-900 border border-zinc-700",
                  !result && "opacity-50 cursor-default"
                )}
              >
                <span className="text-lg leading-none">▶</span>
                <span>
                  {direction === "EN2LT"
                    ? "Play Lithuanian"
                    : "Play English"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!result}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm font-semibold",
                  "bg-zinc-900 border border-zinc-700",
                  !result && "opacity-50 cursor-default"
                )}
              >
                Save to library
              </button>

              {justSaved && (
                <span className="text-xs text-emerald-400">Saved ✓</span>
              )}
            </div>
          </div>

          {/* Result card */}
          {result && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-1">
                  English
                </div>
                <div className="font-medium">
                  {result.english || "—"}
                </div>

                {result.usage && (
                  <div className="mt-2 text-xs text-zinc-400">
                    <span className="text-zinc-500">Usage: </span>
                    {result.usage}
                  </div>
                )}

                {result.category && (
                  <div className="mt-1 text-xs text-zinc-400">
                    <span className="text-zinc-500">Category: </span>
                    {result.category}
                  </div>
                )}
              </div>

              <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-1">
                  Lithuanian
                </div>
                <div className="font-medium">
                  {result.lithuanian || "—"}
                </div>

                {result.phonetic && (
                  <div className="mt-2 text-xs text-zinc-400">
                    <span className="text-zinc-500">Phonetic: </span>
                    {result.phonetic}
                  </div>
                )}

                {result.notes && (
                  <div className="mt-1 text-xs text-zinc-400">
                    <span className="text-zinc-500">Notes: </span>
                    {result.notes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

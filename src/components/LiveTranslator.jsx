import React, { useState } from "react";

/**
 * LiveTranslator
 *
 * Frontend for /api/translate
 * - Sends { english, tone, audience, register } to your serverless fn
 * - Receives { ok, variants: [{key, lt, ph, usage, notes}, ...] }
 * - Lets you preview variants, play audio, and save a card to the library
 */
export default function LiveTranslator({
  T,
  direction,
  playText,
  setRows,
  genId,
  nowTs,
}) {
  const [english, setEnglish] = useState("");
  const [tone, setTone] = useState("friendly"); // friendly | neutral | formal
  const [audience, setAudience] = useState("general"); // general | female | male
  const [register, setRegister] = useState("natural"); // natural / neutral / formal, etc.

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [variants, setVariants] = useState([]);
  const [selectedKey, setSelectedKey] = useState("general");

  const current =
    variants.find((v) => v.key === selectedKey) || variants[0] || null;

  const canTranslate = english.trim().length > 0 && !loading;
  const canPlay = !!current?.lt && !loading;
  const canSave = !!current?.lt && !loading;

  async function handleTranslate() {
    const text = english.trim();
    if (!text) {
      setError('Please enter an English phrase first.');
      setVariants([]);
      return;
    }

    setLoading(true);
    setError("");
    setVariants([]);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          english: text,
          tone,
          audience,
          register,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || data.ok === false) {
        const msg =
          (data && data.error) ||
          `Translation error (${res.status || "unknown"})`;
        setError(msg);
        setVariants([]);
        return;
      }

      const vs = Array.isArray(data.variants) ? data.variants : [];
      if (!vs.length) {
        setError("The model did not return any usable variants.");
        setVariants([]);
        return;
      }

      setVariants(vs);
      setSelectedKey("general");
    } catch (err) {
      console.error(err);
      setError("Network or server error. Please try again.");
      setVariants([]);
    } finally {
      setLoading(false);
    }
  }

  function handlePlay() {
    if (!current?.lt) return;
    playText(current.lt, { slow: false });
  }

  function handleSave() {
    if (!current?.lt) return;
    const text = english.trim();
    if (!text) return;

    const now = nowTs();
    const id = genId();

    const newRow = {
      _id: id,
      _ts: now,
      English: text,
      Lithuanian: current.lt,
      Phonetic: current.ph || "",
      Category: "",
      Usage: current.usage || "",
      Notes: current.notes || "",
      "RAG Icon": "🟠",
      Sheet: "Phrases",
      _qstat: {
        red: { ok: 0, bad: 0 },
        amb: { ok: 0, bad: 0 },
        grn: { ok: 0, bad: 0 },
      },
    };

    setRows((prev) => [newRow, ...prev]);
    alert("Saved to library.");
  }

  const toneOptions = [
    { id: "friendly", label: "Friendly / familiar" },
    { id: "neutral", label: "Neutral" },
    { id: "formal", label: "Polite / formal" },
  ];

  const audienceOptions = [
    { id: "general", label: "Neutral" },
    { id: "female", label: "Female" },
    { id: "male", label: "Male" },
  ];

  const registerOptions = [
    { id: "natural", label: "Natural" },
    { id: "neutral", label: "Neutral" },
    { id: "formal", label: "Formal" },
  ];

  return (
    <section className="mt-4 mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-zinc-500">
            Live translator
          </div>
          <div className="text-lg sm:text-xl font-semibold text-zinc-50">
            Say it right — then save it.
          </div>
        </div>
        <div className="hidden sm:flex text-xs text-zinc-400 items-center gap-1">
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700">
            EN → LT
          </span>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2 mb-4">
        <div className="text-sm text-zinc-400">
          What do you want to say?
        </div>
        <textarea
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          rows={2}
          placeholder="Type your English phrase…"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm sm:text-base resize-none focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Audience */}
      <div className="grid gap-3 sm:grid-cols-3 mb-3">
        <div className="space-y-1">
          <div className="text-xs text-zinc-500">Speaking to…</div>
          <div className="inline-flex rounded-full bg-zinc-950 p-1 border border-zinc-800">
            {audienceOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAudience(opt.id)}
                className={
                  "px-3 py-1 text-xs rounded-full transition-colors " +
                  (audience === opt.id
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-300")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-zinc-500">Tone</div>
          <div className="inline-flex rounded-full bg-zinc-950 p-1 border border-zinc-800">
            {toneOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTone(opt.id)}
                className={
                  "px-3 py-1 text-xs rounded-full transition-colors " +
                  (tone === opt.id
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-300")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-zinc-500">Register</div>
          <div className="inline-flex rounded-full bg-zinc-950 p-1 border border-zinc-800">
            {registerOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRegister(opt.id)}
                className={
                  "px-3 py-1 text-xs rounded-full transition-colors " +
                  (register === opt.id
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-300")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-3 text-xs sm:text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Translate button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleTranslate}
          disabled={!canTranslate}
          className={
            "w-full py-2.5 rounded-xl text-sm font-semibold transition-colors " +
            (canTranslate
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed")
          }
        >
          {loading ? "Translating…" : "Translate with GPT"}
        </button>
      </div>

      {/* Variants + actions */}
      <div className="space-y-3">
        {variants.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-zinc-500">Variants:</span>
              {["general", "female", "male"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  className={
                    "px-2.5 py-1 rounded-full border text-xs " +
                    (selectedKey === key
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-200")
                  }
                >
                  {key === "general"
                    ? "General"
                    : key === "female"
                    ? "Speaking as female"
                    : "Speaking as male"}
                </button>
              ))}
            </div>

            {current && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm space-y-1">
                <div className="font-semibold text-zinc-50">
                  {current.lt || "—"}
                </div>
                {current.ph && (
                  <div className="text-xs text-zinc-400">
                    Phonetic: {current.ph}
                  </div>
                )}
                {current.usage && (
                  <div className="text-xs text-zinc-400">
                    Usage: {current.usage}
                  </div>
                )}
                {current.notes && (
                  <div className="text-xs text-zinc-500">
                    Notes: {current.notes}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handlePlay}
            disabled={!canPlay}
            className={
              "flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm border " +
              (canPlay
                ? "bg-zinc-900 border-zinc-700 text-zinc-50"
                : "bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed")
            }
          >
            ▶ Play Lithuanian
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={
              "flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold " +
              (canSave
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed")
            }
          >
            Save to library
          </button>
        </div>
      </div>
    </section>
  );
}

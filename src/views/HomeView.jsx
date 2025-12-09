import React, { useState } from "react";

function stripDiacritics(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalise(str) {
  if (!str) return "";
  return stripDiacritics(str)
    .toLowerCase()
    .replace(/[!?,.:;…“”"'(){}\[\]\-–—*@#\/\\]/g, "") // punctuation
    .replace(/\s+/g, " ")
    .trim();
}

// Lightweight Levenshtein distance with early bailout
function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  // If lengths differ by more than 1, we treat as "too far"
  if (Math.abs(m - n) > 1) return 99;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
      // small optimisation: if distance already > 1 we can stop caring,
      // but we keep full calc for clarity here
    }
  }
  return dp[m][n];
}

function areNearDuplicatesText(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  const na = normalise(a);
  const nb = normalise(b);
  if (!na && !nb) return true;
  if (!na || !nb) return false;
  if (na === nb) return true;
  return levenshtein(na, nb) <= 1;
}

function findDuplicateInLibrary(inputText, rows) {
  const target = normalise(inputText);
  if (!target) return null;

  for (const r of rows) {
    const candidateEn = r.EnglishOriginal || r.English || "";
    if (areNearDuplicatesText(candidateEn, target)) {
      return r;
    }
  }
  return null;
}

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

  const [duplicateEntry, setDuplicateEntry] = useState(null);

  async function handleTranslate(force = false) {
    const text = input.trim();
    if (!text) return;

    // Pre-translation duplicate check (unless forced)
    if (!force) {
      const dup = findDuplicateInLibrary(text, rows);
      if (dup) {
        setDuplicateEntry(dup);
        // Clear any previous translation result
        setLtOut("");
        setEnLiteral("");
        setEnNatural("");
        setPhonetics("");
        showToast?.("Similar entry already in your library");
        return;
      }
    }

    setDuplicateEntry(null);
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
    setDuplicateEntry(null);
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
          Draft the phrase, tune the tone, hear it spoken, then save it to your
          library.
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
          {/* Translate */}
          <button
            type="button"
            className="
              bg-emerald-500 text-black rounded-full px-5 py-2 
              font-semibold shadow hover:bg-emerald-400 active:bg-emerald-300 
              transition-transform duration-150 active:scale-95
              select-none
            "
            onClick={() => handleTranslate(false)}
            disabled={translating || !input.trim()}
          >
            {translating ? "Translating…" : "Translate"}
          </button>

          {/* Clear */}
          <button
            type="button"
            className="
              bg-zinc-800 text-zinc-200 rounded-full px-5 py-2 
              font-medium hover:bg-zinc-700 active:bg-zinc-600 
              transition-transform duration-150 active:scale-95
              select-none
            "
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Duplicate warning / existing entry view */}
      {duplicateEntry && (
        <div className="bg-amber-950/70 border border-amber-500/70 rounded-2xl p-4 mb-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="text-sm font-semibold text-amber-300">
                Similar entry already in your library
              </div>
              <div className="text-xs text-amber-200/80 mt-0.5">
                You can use this one, or translate anyway if you really want a new
                version.
              </div>
            </div>
            <button
              type="button"
              className="
                text-xs px-3 py-1 rounded-full 
                bg-zinc-900/80 text-zinc-200 
                hover:bg-zinc-800 active:bg-zinc-700
              "
              onClick={() => setDuplicateEntry(null)}
            >
              Dismiss
            </button>
          </div>

          <div className="text-sm font-semibold truncate">
            {duplicateEntry.English || "—"}
          </div>
          <div className="text-sm text-emerald-300 truncate">
            {duplicateEntry.Lithuanian || "—"}
          </div>

          {duplicateEntry.Phonetic && (
            <div className="text-[11px] text-zinc-300 italic mt-1 truncate">
              {duplicateEntry.Phonetic}
            </div>
          )}

          {(duplicateEntry.Usage || duplicateEntry.Notes) && (
            <div className="mt-2 text-[11px] text-zinc-200 space-y-1">
              {duplicateEntry.Usage && (
                <div>
                  <span className="text-zinc-500">Usage: </span>
                  {duplicateEntry.Usage}
                </div>
              )}
              {duplicateEntry.Notes && (
                <div>
                  <span className="text-zinc-500">Notes: </span>
                  {duplicateEntry.Notes}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 flex-wrap pt-3">
            <button
              type="button"
              className="
                bg-emerald-500 text-black rounded-full 
                px-4 py-2 text-sm font-semibold shadow 
                hover:bg-emerald-400 active:bg-emerald-300 
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={() =>
                duplicateEntry.Lithuanian &&
                playText(duplicateEntry.Lithuanian)
              }
            >
              ▶ Play
            </button>

            <button
              type="button"
              className="
                bg-zinc-800 text-zinc-200 rounded-full 
                px-4 py-2 text-sm font-medium
                hover:bg-zinc-700 active:bg-zinc-600
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={() => handleTranslate(true)}
            >
              Translate anyway
            </button>
          </div>
        </div>
      )}

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

          {/* Play + Copy + Save */}
          <div className="flex items-center gap-3 flex-wrap pt-2">
            {/* Normal play */}
            <button
              type="button"
              className="
                bg-emerald-500 text-black rounded-full 
                px-5 py-2 text-[18px] shadow 
                hover:bg-emerald-400 active:bg-emerald-300 
                transition-transform duration-150 active:scale-95
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
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={() => playText(ltOut, { slow: true })}
            >
              🐢 Slow
            </button>

            {/* Copy button */}
            <button
              type="button"
              className="
                bg-zinc-800 text-zinc-200 rounded-full 
                px-5 py-2 text-sm font-medium
                hover:bg-zinc-700 active:bg-zinc-600
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={() => {
                navigator.clipboard.writeText(ltOut);
                showToast?.("Copied");
              }}
            >
              Copy
            </button>

            {/* Save */}
            <button
              className="
                bg-zinc-800 text-zinc-200 rounded-full 
                px-5 py-2 text-sm font-medium
                hover:bg-zinc-700 active:bg-zinc-600
                transition-transform duration-150 active:scale-95
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
            transition-transform duration-150 active:scale-95
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

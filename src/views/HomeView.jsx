// src/views/HomeView.jsx
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { DEFAULT_CATEGORY } from "../constants/categories";

function stripDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

/**
 * Pre-translation duplicate check:
 * We don't assume source language, so we check BOTH:
 * - Input ≈ any saved English (EnglishOriginal/English)
 * - Input ≈ any saved Lithuanian (Lithuanian/LithuanianOriginal)
 */
function findDuplicateInLibrary(inputText, rows) {
  const target = normalise(inputText);
  if (!target) return null;

  for (const r of rows) {
    const candidateEn = r.EnglishOriginal || r.English || "";
    const candidateLt = r.LithuanianOriginal || r.Lithuanian || "";

    if (areNearDuplicatesText(candidateEn, target)) return r;
    if (areNearDuplicatesText(candidateLt, target)) return r;
  }
  return null;
}

/**
 * Map enrich-controlled vocab → your current app categories (to avoid dropdown mismatch)
 * We only map when needed; otherwise keep as-is.
 */
function mapEnrichCategoryToApp(category) {
  const c = String(category || "").trim();

  const map = {
    Food: "Food & Drink",
    Emergencies: "Emergency",
    "Daily life": "General",
    Emotions: "General",
    Relationships: "Social",
  };

  return map[c] || c || DEFAULT_CATEGORY;
}

const EMPTY_RESULT = {
  ltOut: "",
  enLiteral: "",
  enNatural: "",
  phonetics: "",
  // Translate no longer produces these; kept for compatibility if ever populated.
  usageOut: "",
  notesOut: "",
  categoryOut: DEFAULT_CATEGORY,
  // Inferred: if input ≈ ltOut, source is Lithuanian
  sourceLang: "en", // "en" | "lt"
};

const Segmented = memo(function Segmented({ value, onChange, options }) {
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
              (idx !== options.length - 1 ? " border-r border-zinc-800" : "")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
});

export default function HomeView({
  playText,
  onOpenAddForm,
  setRows,
  genId,
  nowTs,
  showToast,
  rows,
}) {
  const textareaRef = useRef(null);

  const blurTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Only blur if it's actually focused
    if (document.activeElement === el) {
      try {
        el.blur();
      } catch {}
    }
  }, []);

  const [input, setInput] = useState("");
  const [translating, setTranslating] = useState(false);

  const [result, setResult] = useState(EMPTY_RESULT);

  const [gender, setGender] = useState("neutral");
  const [tone, setTone] = useState("friendly");

  const [duplicateEntry, setDuplicateEntry] = useState(null);

  const canTranslate = useMemo(() => !!input.trim(), [input]);
  const canSave = useMemo(
    () => !!result.ltOut && !!(result.enNatural || result.enLiteral),
    [result.ltOut, result.enNatural, result.enLiteral]
  );

  const resetResult = useCallback(() => {
    setResult(EMPTY_RESULT);
  }, []);

  async function handleTranslate(force = false) {
    const text = input.trim();
    if (!text) return;

    // Pre-translation duplicate check (unless forced)
    if (!force) {
      const dup = findDuplicateInLibrary(text, rows);
      if (dup) {
        setDuplicateEntry(dup);
        resetResult();
        showToast?.("Similar entry already in your library");
        return;
      }
    }

    setDuplicateEntry(null);
    setTranslating(true);
    resetResult();

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

      if (data?.lt && (data?.en_literal || data?.en_natural)) {
        const lt = String(data.lt || "").trim();
        const lit = String(data.en_literal || "").trim();
        const nat = String(data.en_natural || "").trim();
        const pho = String(data.phonetics || "").trim();

        // Infer source language (no brittle diacritics rules)
        const inferred =
          areNearDuplicatesText(normalise(text), normalise(lt)) ? "lt" : "en";

        // Translate must NOT provide usage/notes/category — we ignore if present.
        setResult({
          ltOut: lt,
          enLiteral: lit,
          enNatural: nat || lit,
          phonetics: pho,
          usageOut: "",
          notesOut: "",
          categoryOut: DEFAULT_CATEGORY,
          sourceLang: inferred,
        });
      } else {
        setResult({
          ...EMPTY_RESULT,
          ltOut: "Translation error.",
        });
      }
    } catch (err) {
      console.error(err);
      setResult({
        ...EMPTY_RESULT,
        ltOut: "Translation error.",
      });
    } finally {
      setTranslating(false);
    }
  }

  const handleClear = useCallback(() => {
    blurTextarea();
    setInput("");
    resetResult();
    setDuplicateEntry(null);
  }, [blurTextarea, resetResult]);

  async function enrichSavedRowSilently(row) {
    try {
      if (!row?._id) return;

      // One-time guard: if Usage/Notes already exist, do nothing.
      if (
        (row.Usage && String(row.Usage).trim()) ||
        (row.Notes && String(row.Notes).trim())
      ) {
        return;
      }

      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lt: row.Lithuanian,
          phonetics: row.Phonetic,
          en_natural: row.EnglishNatural || row.English || "",
          en_literal: row.EnglishLiteral || row.English || "",
        }),
      });

      if (!res.ok) return;

      const data = await res.json();
      const CategoryRaw = String(data?.Category || "").trim();
      const Usage = String(data?.Usage || "").trim();
      const Notes = String(data?.Notes || "").trim();

      if (!CategoryRaw || !Usage || !Notes) return;

      const Category = mapEnrichCategoryToApp(CategoryRaw);

      // Patch ONLY additive fields, matched by _id
      setRows((prev) =>
        prev.map((r) =>
          r._id === row._id
            ? {
                ...r,
                Category: Category || r.Category || DEFAULT_CATEGORY,
                Usage,
                Notes,
              }
            : r
        )
      );
    } catch (err) {
      // Silent by design
      console.error("Enrich failed (silent):", err);
    }
  }

  const handleSaveToLibrary = useCallback(() => {
    blurTextarea();

    if (!canSave) return;

    const rawInput = input.trim();
    if (!rawInput) return;

    const englishToSave = (result.enNatural || result.enLiteral || "").trim();
    const lithuanianToSave = (result.ltOut || "").trim();
    if (!englishToSave || !lithuanianToSave) return;

    // Prevent exact duplicates (case/spacing-insensitive)
    const already = rows.some((r) => {
      const en = (r.EnglishNatural || r.EnglishLiteral || r.English || "").trim();
      const lt = (r.Lithuanian || "").trim();
      return (
        en.toLowerCase() === englishToSave.toLowerCase() &&
        lt.toLowerCase() === lithuanianToSave.toLowerCase()
      );
    });

    if (already) {
      showToast?.("Already in library");
      return;
    }

    const row = {
      English: englishToSave,
      EnglishOriginal: result.sourceLang === "en" ? rawInput : englishToSave,
      EnglishLiteral: (result.enLiteral || "").trim(),
      EnglishNatural: englishToSave,

      Lithuanian: lithuanianToSave,
      LithuanianOriginal:
        result.sourceLang === "lt" ? rawInput : lithuanianToSave,

      Phonetic: result.phonetics || "",

      // Enrich will overwrite these later (additive only)
      Category: DEFAULT_CATEGORY,
      Usage: "",
      Notes: "",

      SourceLang: result.sourceLang, // optional metadata (harmless if unused)

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

    // Silent enrich (runs once, guarded) — fire-and-forget
    enrichSavedRowSilently(row);
  }, [
    blurTextarea,
    canSave,
    genId,
    input,
    nowTs,
    result.enLiteral,
    result.enNatural,
    result.ltOut,
    result.phonetics,
    result.sourceLang,
    rows,
    setRows,
    showToast,
  ]);

  const handleGenderChange = useCallback(
    (v) => {
      blurTextarea();
      setGender(v);
    },
    [blurTextarea]
  );

  const handleToneChange = useCallback(
    (v) => {
      blurTextarea();
      setTone(v);
    },
    [blurTextarea]
  );

  const handleTranslateClick = useCallback(() => {
    blurTextarea();
    handleTranslate(false);
  }, [blurTextarea, input, tone, gender, rows]); // dependencies for lint friendliness

  const handleTranslateAnywayClick = useCallback(() => {
    blurTextarea();
    handleTranslate(true);
  }, [blurTextarea, input, tone, gender, rows]);

  const handlePlay = useCallback(
    (text, opts) => {
      blurTextarea();
      if (!text) return;
      playText(text, opts);
    },
    [blurTextarea, playText]
  );

  const handleCopy = useCallback(() => {
    blurTextarea();
    if (!result.ltOut) return;
    navigator.clipboard.writeText(result.ltOut);
    showToast?.("Copied");
  }, [blurTextarea, result.ltOut, showToast]);

  const handleOpenAdd = useCallback(() => {
    blurTextarea();
    onOpenAddForm?.();
  }, [blurTextarea, onOpenAddForm]);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28">
      {/* Speaking to */}
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] p-4 mb-5">
        <div className="text-sm font-semibold mb-2">Speaking to…</div>
        <Segmented
          value={gender}
          onChange={handleGenderChange}
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
          onChange={handleToneChange}
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
          ref={textareaRef}
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm mb-3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            className="
              bg-emerald-500 text-black rounded-full px-5 py-2
              font-semibold shadow hover:bg-emerald-400 active:bg-emerald-300
              transition-transform duration-150 active:scale-95
              select-none
            "
            onClick={handleTranslateClick}
            disabled={translating || !canTranslate}
          >
            {translating ? "Translating…" : "Translate"}
          </button>

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
                You can use this one, or translate anyway if you really want a
                new version.
              </div>
            </div>
            <button
              type="button"
              className="
                text-xs px-3 py-1 rounded-full
                bg-zinc-900/80 text-zinc-200
                hover:bg-zinc-800 active:bg-zinc-700
              "
              onClick={() => {
                blurTextarea();
                setDuplicateEntry(null);
              }}
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
            <div className="mt-2 text-[11px] text-zinc-200 space-y-2">
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
                handlePlay(duplicateEntry.Lithuanian)
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
              onClick={handleTranslateAnywayClick}
            >
              Translate anyway
            </button>
          </div>
        </div>
      )}

      {/* Output */}
      {result.ltOut && (
        <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] p-4 space-y-3">
          <div className="text-xs text-zinc-500">
            Detected input:{" "}
            <span className="text-zinc-300">
              {result.sourceLang === "lt" ? "Lithuanian" : "English"}
            </span>
          </div>

          <div>
            <label className="block text-sm mb-1">Lithuanian</label>
            <div className="text-lg font-semibold break-words">
              {result.ltOut}
            </div>

            {result.phonetics && (
              <div className="text-sm text-zinc-400 mt-1">
                {result.phonetics}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800 pt-3 space-y-1 text-sm">
            <div>
              <span className="font-semibold">English meaning (natural): </span>
              <span>{result.enNatural || result.enLiteral}</span>
            </div>
            {result.enLiteral && (
              <div className="text-zinc-400">
                <span className="font-semibold text-zinc-300">
                  Literal meaning:{" "}
                </span>
                <span>{result.enLiteral}</span>
              </div>
            )}
          </div>

          {/* (Translate does not populate these; kept for compatibility) */}
          {(result.usageOut || result.notesOut || result.categoryOut) && (
            <div className="border-t border-zinc-800 pt-3 space-y-2 text-sm">
              {result.categoryOut && (
                <div>
                  <span className="font-semibold">Category: </span>
                  <span>{result.categoryOut}</span>
                </div>
              )}
              {result.usageOut && (
                <div>
                  <span className="font-semibold">Usage: </span>
                  <span>{result.usageOut}</span>
                </div>
              )}
              {result.notesOut && (
                <div>
                  <span className="font-semibold">Notes: </span>
                  <span className="whitespace-pre-line">{result.notesOut}</span>
                </div>
              )}
            </div>
          )}

          {/* Play + Copy + Save */}
          <div className="flex items-center gap-3 flex-wrap pt-2">
            <button
              type="button"
              className="
                bg-emerald-500 text-black rounded-full
                px-5 py-2 text-[18px] shadow
                hover:bg-emerald-400 active:bg-emerald-300
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={() => handlePlay(result.ltOut)}
            >
              ▶ Normal
            </button>

            <button
              type="button"
              className="
                bg-emerald-700 text-black rounded-full
                px-5 py-2 text-[18px] shadow
                hover:bg-emerald-600 active:bg-emerald-500
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={() => handlePlay(result.ltOut, { slow: true })}
            >
              🐢 Slow
            </button>

            <button
              type="button"
              className="
                bg-zinc-800 text-zinc-200 rounded-full
                px-5 py-2 text-sm font-medium
                hover:bg-zinc-700 active:bg-zinc-600
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={handleCopy}
            >
              Copy
            </button>

            <button
              className="
                bg-zinc-800 text-zinc-200 rounded-full
                px-5 py-2 text-sm font-medium
                hover:bg-zinc-700 active:bg-zinc-600
                transition-transform duration-150 active:scale-95
                select-none
                disabled:opacity-60
              "
              onClick={handleSaveToLibrary}
              disabled={!canSave}
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
          onClick={handleOpenAdd}
        >
          + Add Entry Manually
        </button>
      )}
    </div>
  );
}

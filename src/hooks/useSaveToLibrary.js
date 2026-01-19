// src/hooks/useSaveToLibrary.js
import { DEFAULT_CATEGORY } from "../constants/categories";

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

export default function useSaveToLibrary({
  blurTextarea,
  canSave,
  input,
  result,
  rows,
  setRows,
  genId,
  nowTs,
  showToast,
} = {}) {
  async function enrichSavedRowSilently(row) {
    try {
      if (!row?._id) return;

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

      setRows?.((prev) =>
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
      console.error("Enrich failed (silent):", err);
    }
  }

  function handleSaveToLibrary() {
    blurTextarea?.();

    if (!canSave) return;

    const rawInput = String(input || "").trim();
    if (!rawInput) return;

    const englishToSave = String(result?.enNatural || result?.enLiteral || "").trim();
    const lithuanianToSave = String(result?.ltOut || "").trim();
    if (!englishToSave || !lithuanianToSave) return;

    const already = (rows || []).some((r) => {
      const en = String(r.EnglishNatural || r.EnglishLiteral || r.English || "").trim();
      const lt = String(r.Lithuanian || "").trim();
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
      EnglishOriginal: result?.sourceLang === "en" ? rawInput : englishToSave,
      EnglishLiteral: String(result?.enLiteral || "").trim(),
      EnglishNatural: englishToSave,

      Lithuanian: lithuanianToSave,
      LithuanianOriginal:
        result?.sourceLang === "lt" ? rawInput : lithuanianToSave,

      Phonetic: String(result?.phonetics || ""),

      Category: DEFAULT_CATEGORY,
      Usage: "",
      Notes: "",

      SourceLang: result?.sourceLang,

      "RAG Icon": "🟠",
      Sheet: "Phrases",

      _id: genId?.(),
      _ts: nowTs?.(),
      _qstat: {
        red: { ok: 0, bad: 0 },
        amb: { ok: 0, bad: 0 },
        grn: { ok: 0, bad: 0 },
      },
    };

    setRows?.((prev) => [row, ...prev]);
    showToast?.("Entry saved to library");
    enrichSavedRowSilently(row);
  }

  return {
    handleSaveToLibrary,
  };
}

// src/hooks/useSaveToLibrary.js
import { useCallback } from "react";

// Match phraseStore contentKey logic (diacritics removed + alnum only)
function normalizeForKey(input = "") {
  return String(input)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function buildContentKeyFromLt(lt) {
  return normalizeForKey(lt || "");
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
  const handleSaveToLibrary = useCallback(() => {
    blurTextarea?.();

    if (!canSave) return;

    const lt = String(result?.ltOut || "").trim();
    const enLit = String(result?.enLiteral || "").trim();
    const enNat = String(result?.enNatural || "").trim();
    const phoEn = String(result?.phonetics || "").trim();
    const phoIpa = String(result?.phoneticsIpa || "").trim();

    if (!lt) return;

    const now = typeof nowTs === "function" ? nowTs() : Date.now();
    const id = typeof genId === "function" ? genId() : Math.random().toString(36).slice(2);

    const sourceLang = result?.sourceLang === "lt" ? "lt" : "en";

    const newRow = {
      _id: id,
      _ts: now,

      Sheet: "Phrases",
      Category: result?.categoryOut || "General",

      // Core content
      Lithuanian: lt,
      English: enNat || enLit || String(input || "").trim(),

      // Keep originals (you already use these fields in some rows)
      SourceLang: sourceLang,
      EnglishLiteral: enLit || (enNat || ""),
      EnglishNatural: enNat || (enLit || ""),
      EnglishOriginal: String(input || "").trim(),
      LithuanianOriginal: lt,

      // Phonetics (both)
      Phonetic: phoEn,
      PhoneticIPA: phoIpa,

      // Enrichment placeholders (we’ll fill later)
      Usage: String(result?.usageOut || "").trim(),
      Notes: String(result?.notesOut || "").trim(),

      // Default RAG + stats
      "RAG Icon": "🟠",
      _qstat: {
        red: { ok: 0, bad: 0 },
        amb: { ok: 0, bad: 0 },
        grn: { ok: 0, bad: 0 },
      },

      // Ownership / lifecycle
      Source: "user",
      Touched: true,
      _deleted: false,
      _deleted_ts: null,

      // Identity key (used by sync/merge logic)
      contentKey: buildContentKeyFromLt(lt),
    };

    // Insert at top (latest first)
    setRows?.((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return [newRow, ...arr];
    });

    showToast?.("Saved to library");
  }, [
    blurTextarea,
    canSave,
    genId,
    input,
    nowTs,
    result,
    setRows,
    showToast,
  ]);

  return { handleSaveToLibrary };
}

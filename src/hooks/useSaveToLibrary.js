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
  const saveToLibrary = useCallback(
    ({ suppressToast = false } = {}) => {
      blurTextarea?.();

      if (!canSave) return { ok: false, error: "Nothing to save." };

      const lt = String(result?.ltOut || "").trim();
      const enLit = String(result?.enLiteral || "").trim();
      const enNat = String(result?.enNatural || "").trim();
      const phoEn = String(result?.phonetics || "").trim();
      const phoIpa = String(result?.phoneticsIpa || "").trim();

      if (!lt) return { ok: false, error: "Missing Lithuanian output." };

      const contentKey = buildContentKeyFromLt(lt);
      const existingRows = Array.isArray(rows) ? rows : [];
      const existing = existingRows.find(
        (r) => !r?._deleted && String(r?.contentKey || "") === contentKey
      );

      if (existing) {
        if (!suppressToast) showToast?.("Saved to library");
        return { ok: true, row: existing, alreadyExisted: true };
      }

      const now = typeof nowTs === "function" ? nowTs() : Date.now();
      const id =
        typeof genId === "function"
          ? genId()
          : Math.random().toString(36).slice(2);

      const sourceLang = result?.sourceLang === "lt" ? "lt" : "en";

      const newRow = {
        _id: id,
        _ts: now,

        Sheet: "Phrases",
        Category: result?.categoryOut || "General",

        Lithuanian: lt,
        English: enNat || enLit || String(input || "").trim(),

        SourceLang: sourceLang,
        EnglishLiteral: enLit || enNat || "",
        EnglishNatural: enNat || enLit || "",
        EnglishOriginal: String(input || "").trim(),
        LithuanianOriginal: lt,

        Phonetic: phoEn,
        PhoneticIPA: phoIpa,

        Usage: String(result?.usageOut || "").trim(),
        Notes: String(result?.notesOut || "").trim(),

        "RAG Icon": "🟠",
        _qstat: {
          red: { ok: 0, bad: 0 },
          amb: { ok: 0, bad: 0 },
          grn: { ok: 0, bad: 0 },
        },

        Source: "user",
        Touched: true,
        _deleted: false,
        _deleted_ts: null,

        contentKey,
      };

      setRows?.((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return [newRow, ...arr];
      });

      if (!suppressToast) showToast?.("Saved to library");

      return { ok: true, row: newRow, alreadyExisted: false };
    },
    [
      blurTextarea,
      canSave,
      genId,
      input,
      nowTs,
      result,
      rows,
      setRows,
      showToast,
    ]
  );

  const handleSaveToLibrary = useCallback(() => {
    saveToLibrary();
  }, [saveToLibrary]);

  return { handleSaveToLibrary, saveToLibrary };
}
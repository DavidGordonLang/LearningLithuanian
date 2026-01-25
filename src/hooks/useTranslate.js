// src/hooks/useTranslate.js
import { useState } from "react";
import { DEFAULT_CATEGORY } from "../constants/categories";
import {
  areNearDuplicatesText,
  findDuplicateInLibrary,
  normalise,
} from "../utils/textNormalise";

const EMPTY_RESULT = {
  ltOut: "",
  enLiteral: "",
  enNatural: "",
  phonetics: "",
  usageOut: "",
  notesOut: "",
  categoryOut: DEFAULT_CATEGORY,
  sourceLang: "en", // "en" | "lt"
};

export default function useTranslate({ rows, tone, gender, showToast } = {}) {
  const [translating, setTranslating] = useState(false);
  const [result, setResult] = useState(EMPTY_RESULT);
  const [duplicateEntry, setDuplicateEntry] = useState(null);

  function resetTranslation() {
    setResult(EMPTY_RESULT);
    setDuplicateEntry(null);
  }

  // IMPORTANT: translate *a specific string* to avoid React state race when STT sets input then translates.
  async function translateText(text, force = false) {
    const cleaned = (text || "").trim();
    if (!cleaned) return;

    if (!force) {
      const dup = findDuplicateInLibrary(cleaned, rows);
      if (dup) {
        setDuplicateEntry(dup);
        setResult(EMPTY_RESULT);
        showToast?.("Similar entry already in your library");
        return;
      }
    }

    setDuplicateEntry(null);
    setTranslating(true);
    setResult(EMPTY_RESULT);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleaned,
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

        const inferred =
          areNearDuplicatesText(normalise(cleaned), normalise(lt)) ? "lt" : "en";

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

  return {
    translating,
    result,

    duplicateEntry,
    setDuplicateEntry,

    translateText,
    resetTranslation,
  };
}

// src/hooks/useTranslate.js
import { useCallback, useRef, useState } from "react";
import { makeLtKey } from "../utils/contentKey";

const EMPTY_RESULT = {
  ltOut: "",
  categoryOut: "",
  phonetics: "",
  phoneticsIpa: "",
  enLiteral: "",
  enNatural: "",
  usageOut: "",
  notesOut: "",
  sourceLang: "en",
};

function buildInputKey(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export default function useTranslate({
  rows = [],
  tone = "friendly",
  gender = "male",
  speakerGender = "male",
  onTranslated,
  setIsTranslating,
  showToast,
  appVersion,
} = {}) {
  const [result, setResult] = useState(EMPTY_RESULT);

  // Compatibility: HomeView expects `translating` state from the hook.
  const [translating, setTranslating] = useState(false);

  // Prevent stale finally() from flipping state if a newer translate started.
  const inFlightIdRef = useRef(0);

  const [duplicateEntry, setDuplicateEntry] = useState(null);

  const translate = useCallback(
    async (
      text,
      {
        tone: overrideTone,
        gender: overrideGender,
        speakerGender: overrideSpeakerGender,
        force = false,
      } = {}
    ) => {
      const input = String(text || "").trim();
      if (!input) return;

      const resolvedTone = overrideTone || tone || "friendly";
      const resolvedGender = overrideGender || gender || "male";
      const resolvedSpeakerGender = overrideSpeakerGender || speakerGender || "male";

      const inputKey = buildInputKey(input);
      const activeRows = Array.isArray(rows) ? rows.filter((r) => !r?._deleted) : [];

      // Duplicate detection before translate:
      // - If user typed English, match against saved English variants
      // - If user typed Lithuanian, match against Lithuanian/contentKey
      if (!force && inputKey) {
        const existing = activeRows.find((r) => {
          const ltKey = String(
            r?.contentKey || makeLtKey({ Lithuanian: r?.Lithuanian || "" })
          ).trim();

          const englishKeys = [
            String(r?.English || ""),
            String(r?.EnglishNatural || ""),
            String(r?.EnglishLiteral || ""),
            String(r?.EnglishOriginal || ""),
          ]
            .map(buildInputKey)
            .filter(Boolean);

          return ltKey === inputKey || englishKeys.includes(inputKey);
        });

        if (existing) {
          setDuplicateEntry(existing);
          setResult(EMPTY_RESULT);
          showToast?.("Similar entry found in your library");
          return {
            duplicate: true,
            entry: existing,
          };
        }
      }

      const myId = ++inFlightIdRef.current;

      try {
        setDuplicateEntry(null);
        setIsTranslating?.(true);
        setTranslating(true);

        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: input,
            tone: resolvedTone,
            gender: resolvedGender,
            speakerGender: resolvedSpeakerGender,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const msg = String(data?.error || "Translate failed");
          showToast?.(msg);
          throw new Error(msg);
        }

        const lt = String(data.lt || "").trim();
        const cat = String(data.category || "").trim();

        // Backwards compatibility:
        // - server returns `phonetics` (EN-style) + `phonetics_ipa` (IPA)
        // - some older builds may have only `phonetics`
        const pho = String(data.phonetics || "").trim();
        const ipa = String(data.phonetics_ipa || "").trim();

        // Server returns snake_case for English meanings
        const enLit = String(data.en_literal || "").trim();
        const enNat = String(data.en_natural || "").trim();

        // If lt is empty, treat as failure (contract)
        if (!lt || !pho || !enLit || !enNat) {
          const msg = "Translate returned incomplete data";
          showToast?.(msg);
          throw new Error(msg);
        }

        // Enrichment is optional for a usable translation result
        let usageOut = "";
        let notesOut = "";
        let categoryOut = cat || "";

        try {
          const enrichRes = await fetch("/api/enrich", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lt,
              phonetics: pho,
              en_natural: enNat,
              en_literal: enLit,
              tone: resolvedTone,
              gender: resolvedGender,
              speakerGender: resolvedSpeakerGender,
            }),
          });

          const enrichData = await enrichRes.json().catch(() => ({}));

          if (enrichRes.ok) {
            categoryOut = String(
              enrichData?.Category || categoryOut || ""
            ).trim();
            usageOut = String(enrichData?.Usage || "").trim();
            notesOut = String(enrichData?.Notes || "").trim();
          }
        } catch {
          // swallow enrich errors; translation is still valid
        }

        const next = {
          ltOut: lt,
          categoryOut,
          phonetics: pho,
          phoneticsIpa: ipa,
          enLiteral: enLit,
          enNatural: enNat,
          usageOut,
          notesOut,
          sourceLang:
            String(data.source_lang || data.sourceLang || "en") === "lt"
              ? "lt"
              : "en",
        };

        if (inFlightIdRef.current === myId) {
          setResult(next);
          onTranslated?.(next);
        }

        try {
          // kept to preserve signature usage
          appVersion;
        } catch {}

        return next;
      } finally {
        if (inFlightIdRef.current === myId) {
          setIsTranslating?.(false);
          setTranslating(false);
        }
      }
    },
    [appVersion, gender, speakerGender, onTranslated, rows, setIsTranslating, showToast, tone]
  );

  const reset = useCallback(() => {
    inFlightIdRef.current++;
    setResult(EMPTY_RESULT);
    setDuplicateEntry(null);
    setIsTranslating?.(false);
    setTranslating(false);
  }, [setIsTranslating]);

  const translateText = useCallback(
    async (text, force = false, opts = undefined) => {
      return translate(text, {
        force: !!force,
        ...(opts || {}),
      });
    },
    [translate]
  );

  const resetTranslation = useCallback(() => {
    reset();
  }, [reset]);

  return {
    // current API
    result,
    setResult,
    translate,
    reset,

    // compat API
    translating,
    translateText,
    resetTranslation,
    duplicateEntry,
    setDuplicateEntry,
  };
}

// src/views/training/VocabSaveView.jsx
//
// Shown after the module celebration screen.
// Lets the user select vocabulary pairs to save to their library.
// Duplicates are shown but marked — silently skipped on save.
// Each saved phrase gets phonetics via /api/translate and
// enrichment (Notes/Usage/Category) via /api/enrich in the background.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { makeLtKey } from "../../utils/contentKey";
import { genId, nowTs } from "../../utils/ids";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function buildContentKey(lt) {
  return makeLtKey({ Lithuanian: String(lt || "").trim() });
}

function BackCircle({ onClick }) {
  return (
    <button type="button" data-press onClick={onClick}
      className={cn("h-10 w-10 rounded-full border flex items-center justify-center shrink-0",
        "bg-white/[0.06] border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
        "hover:bg-white/[0.08] active:scale-[0.99] transition")}
      aria-label="Back">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
      </svg>
    </button>
  );
}

function ActionButton({ children, onClick, disabled = false, variant = "primary", className }) {
  const tone = variant === "primary"
    ? "bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black"
    : variant === "secondary"
    ? "bg-white/[0.05] hover:bg-white/[0.08] border-white/10 text-zinc-100"
    : "bg-transparent hover:bg-white/[0.05] border-white/10 text-zinc-300";
  return (
    <button type="button" data-press onClick={onClick} disabled={disabled}
      className={cn("rounded-2xl border px-4 py-3 text-sm font-semibold transition",
        tone, disabled ? "opacity-50 cursor-not-allowed" : "", className)}>
      {children}
    </button>
  );
}

// ─── Background enrichment ────────────────────────────────────────────────────
// Calls /api/translate to get phonetics, then /api/enrich for Notes/Usage/Category.
// Patches the row in the store when each call returns.

async function enrichSavedRow(lt, en, rowId, setRows) {
  try {
    // Step 1: translate to get phonetics
    const transResp = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: en, sourceLang: "en" }),
    });

    if (transResp.ok) {
      const transData = await transResp.json();
      const phonetic = String(transData?.phonetics || "").trim();
      const phoneticIPA = String(transData?.phonetics_ipa || "").trim();
      const enNatural = String(transData?.en_natural || en).trim();
      const enLiteral = String(transData?.en_literal || en).trim();

      setRows((prev) => Array.isArray(prev) ? prev.map((r) => {
        if ((r._id || r.id) === rowId) {
          return { ...r, Phonetic: phonetic, PhoneticIPA: phoneticIPA,
            EnglishNatural: enNatural, EnglishLiteral: enLiteral,
            English: enNatural || enLiteral || en };
        }
        return r;
      }) : prev);

      // Step 2: enrich for Notes/Usage/Category
      try {
        const enrichResp = await fetch("/api/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lt,
            en_natural: enNatural || en,
            en_literal: enLiteral || en,
            phonetics: phonetic,
          }),
        });

        if (enrichResp.ok) {
          const enrichData = await enrichResp.json();
          const category = String(enrichData?.Category || "General").trim();
          const usage = String(enrichData?.Usage || "").trim();
          const notes = String(enrichData?.Notes || "").trim();

          setRows((prev) => Array.isArray(prev) ? prev.map((r) => {
            if ((r._id || r.id) === rowId) {
              return { ...r, Category: category, Usage: usage, Notes: notes };
            }
            return r;
          }) : prev);
        }
      } catch {}
    }
  } catch {}
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function VocabSaveView({
  module,       // module object with lessons
  rows,         // current library rows for dupe detection
  setRows,      // phrase store setter
  showToast,
  onDone,       // called when user taps Done/Skip
}) {
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Extract pairs from checkpoint word_match block
  const pairs = useMemo(() => {
    const checkpoint = Array.isArray(module?.lessons)
      ? module.lessons.find((l) => l.isCheckpoint)
      : null;
    if (!checkpoint) return [];
    const wordMatch = Array.isArray(checkpoint.blocks)
      ? checkpoint.blocks.find((b) => b.type === "word_match")
      : null;
    return Array.isArray(wordMatch?.pairs) ? wordMatch.pairs : [];
  }, [module]);

  // Check each pair against library
  const pairsWithStatus = useMemo(() => {
    const existingKeys = new Set(
      (Array.isArray(rows) ? rows : [])
        .filter((r) => !r._deleted)
        .map((r) => String(r.contentKey || buildContentKey(r.Lithuanian || "")))
    );
    return pairs.map((pair) => ({
      ...pair,
      contentKey: buildContentKey(pair.lt),
      isDuplicate: existingKeys.has(buildContentKey(pair.lt)),
    }));
  }, [pairs, rows]);

  const selectablePairs = pairsWithStatus.filter((p) => !p.isDuplicate);
  const allSelected = selectablePairs.length > 0 &&
    selectablePairs.every((p) => selected.has(p.id));

  const togglePair = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectablePairs.map((p) => p.id)));
    }
  };

  const handleSave = async () => {
    if (saving || saved) return;
    const toSave = pairsWithStatus.filter((p) => selected.has(p.id) && !p.isDuplicate);
    if (toSave.length === 0) { onDone?.(); return; }

    setSaving(true);

    // Save all selected pairs immediately with basic fields
    const newRows = [];
    const now = nowTs();

    toSave.forEach((pair) => {
      const id = genId();
      const newRow = {
        _id: id,
        _ts: now,
        Sheet: "Phrases",
        Category: "General",
        Lithuanian: pair.lt,
        English: pair.en,
        SourceLang: "lt",
        EnglishLiteral: pair.en,
        EnglishNatural: pair.en,
        EnglishOriginal: pair.en,
        LithuanianOriginal: pair.lt,
        Phonetic: "",
        PhoneticIPA: "",
        Usage: "",
        Notes: "",
        "RAG Icon": "🟠",
        _qstat: { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } },
        Source: "user",
        Touched: true,
        _deleted: false,
        _deleted_ts: null,
        contentKey: pair.contentKey,
      };
      newRows.push({ row: newRow, pair });
    });

    // Add all to store at once
    setRows((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return [...newRows.map((x) => x.row), ...arr];
    });

    setSaved(true);
    setSaving(false);
    showToast?.(`${toSave.length} phrase${toSave.length === 1 ? "" : "s"} saved to library`);

    // Background enrichment — staggered to avoid API bursts
    newRows.forEach(({ row, pair }, i) => {
      setTimeout(() => {
        enrichSavedRow(pair.lt, pair.en, row._id, setRows);
      }, i * 800);
    });

    onDone?.();
  };

  const selectedCount = [...selected].filter(
    (id) => !pairsWithStatus.find((p) => p.id === id)?.isDuplicate
  ).length;

  return (
    <div className={cn(
      "max-w-xl mx-auto px-4 pt-4 pb-8 flex flex-col transition-all duration-400",
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      {/* Header */}
      <div className="grid grid-cols-[44px_1fr_44px] items-center mb-5">
        <BackCircle onClick={onDone} />
        <div className="text-center">
          <div className="text-[15px] font-semibold text-zinc-100">Save to library</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">{module?.title || ""}</div>
        </div>
        <div className="h-10 w-10" aria-hidden="true" />
      </div>

      {/* Intro */}
      <div className="mb-4">
        <p className="text-[13px] text-zinc-400 leading-snug">
          Select the words and phrases you'd like to add to your library for practice.
          Words already in your library are shown below.
        </p>
      </div>

      {/* Select all */}
      {selectablePairs.length > 0 ? (
        <button
          type="button"
          data-press
          onClick={toggleAll}
          className="mb-3 flex items-center gap-2 text-[13px] text-emerald-400 hover:text-emerald-300 transition"
        >
          <div className={cn(
            "h-5 w-5 rounded border-2 flex items-center justify-center transition",
            allSelected ? "bg-emerald-500 border-emerald-500" : "border-zinc-600 bg-transparent"
          )}>
            {allSelected ? (
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : null}
          </div>
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      ) : null}

      {/* Pair list */}
      <div className="flex flex-col gap-2 mb-6">
        {pairsWithStatus.map((pair) => {
          const isSelected = selected.has(pair.id);
          const isDupe = pair.isDuplicate;

          return (
            <button
              key={pair.id}
              type="button"
              data-press
              onClick={() => !isDupe && togglePair(pair.id)}
              disabled={isDupe}
              className={cn(
                "w-full text-left rounded-2xl border px-4 py-3 transition flex items-center gap-3",
                isDupe
                  ? "border-white/[0.06] bg-white/[0.02] opacity-50 cursor-default"
                  : isSelected
                  ? "border-emerald-400/25 bg-emerald-500/[0.08]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              )}
            >
              {/* Checkbox */}
              <div className={cn(
                "h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition",
                isDupe ? "border-zinc-700 bg-transparent" :
                isSelected ? "bg-emerald-500 border-emerald-500" : "border-zinc-600 bg-transparent"
              )}>
                {isSelected && !isDupe ? (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : null}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className={cn("text-[15px] font-semibold leading-snug",
                  isDupe ? "text-zinc-500" : "text-zinc-100")}>
                  {pair.lt}
                </div>
                <div className={cn("text-[12px] mt-0.5",
                  isDupe ? "text-zinc-600" : "text-zinc-400")}>
                  {pair.en}
                </div>
              </div>

              {/* Dupe badge */}
              {isDupe ? (
                <div className="shrink-0 text-[10px] uppercase tracking-wide text-zinc-600 border border-zinc-700 rounded-full px-2 py-0.5">
                  In library
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <ActionButton
          onClick={handleSave}
          disabled={saving || selectedCount === 0}
          className="w-full"
        >
          {saving ? "Saving…" : selectedCount > 0
            ? `Save ${selectedCount} phrase${selectedCount === 1 ? "" : "s"} →`
            : "Select phrases to save"}
        </ActionButton>
        <ActionButton variant="ghost" onClick={onDone} className="w-full">
          Skip for now
        </ActionButton>
      </div>
    </div>
  );
}

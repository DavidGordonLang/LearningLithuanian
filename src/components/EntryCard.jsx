import React from "react";
import { usePhraseStore } from "../stores/phraseStore";

export default function EntryCard({
  r,
  idx,
  editIdx,
  setEditIdx,
  editDraft,
  setEditDraft,
  expanded,
  setExpanded,
  T,
  direction,
  startEdit,
  saveEdit,
  remove,
  normalizeRag,
  pressHandlers,
  cn,
  lastAddedId,
  showRagLabels = false,
}) {
  // ---- Pull rows from zustand store ----
  const rows = usePhraseStore((s) => s.phrases);

  // Compute stable row index using _id fallback
  const stableId = r?._id ?? r?.id ?? r?.key ?? null;
  const myIdx =
    stableId != null
      ? rows.findIndex(
          (x) => (x?._id ?? x?.id ?? x?.key ?? null) === stableId
        )
      : idx;

  const isEditing = editIdx === myIdx;
  const isExpanded = expanded?.has?.(r._id || idx);

  // RAG
  const rag = normalizeRag(r["RAG Icon"]);
  const ragMap = {
    "🔴": { bg: "bg-red-600", text: "Red" },
    "🟠": { bg: "bg-amber-500", text: "Amber" },
    "🟢": { bg: "bg-green-600", text: "Green" },
  };

  function toggleExpanded() {
    setExpanded((s) => {
      con

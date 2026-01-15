// src/components/ConflictReviewModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

function getRowLabel(row) {
  const lt = row?.Lithuanian ? String(row.Lithuanian).trim() : "";
  const en = row?.English ? String(row.English).trim() : "";
  if (lt && en) return `${lt} / ${en}`;
  if (lt) return lt;
  if (en) return en;
  return row?._id ? `Entry ${row._id}` : "Entry";
}

function defaultConflictSelections(conflicts) {
  const initial = {};
  for (const conflict of conflicts || []) {
    if (conflict.type === "delete_vs_edit") {
      const preferCloud = conflict.local?._deleted === true;
      initial[conflict.key] = { pick: preferCloud ? "cloud" : "local" };
      continue;
    }

    if (conflict.type === "field_conflict") {
      const fields = {};
      for (const field of conflict.fields || []) {
        let pick = "chosen";
        if (field.chosen === field.cloud) pick = "cloud";
        if (field.chosen === field.local) pick = "local";
        fields[field.field] = pick;
      }
      initial[conflict.key] = { fields };
    }
  }
  return initial;
}

function ChoiceChip({ checked, onChange, label, sublabel, tone = "zinc" }) {
  const toneMap = {
    zinc: "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/80",
    emerald:
      "border-emerald-800/60 bg-emerald-950/20 hover:bg-emerald-950/30",
    sky: "border-sky-800/60 bg-sky-950/20 hover:bg-sky-950/30",
    amber: "border-amber-800/60 bg-amber-950/20 hover:bg-amber-950/30",
  };

  return (
    <button
      type="button"
      onClick={onChange}
      className={
        "group w-full text-left rounded-xl border px-3 py-2.5 transition " +
        (toneMap[tone] || toneMap.zinc) +
        (checked ? " ring-1 ring-emerald-500/60" : "")
      }
      aria-pressed={checked}
    >
      <div className="flex items-start gap-3">
        <span
          className={
            "mt-0.5 inline-flex h-4 w-4 rounded-full border transition " +
            (checked
              ? "border-emerald-400 bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
              : "border-zinc-700 bg-zinc-950/40")
          }
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-100">{label}</div>
          {sublabel ? (
            <div className="text-xs text-zinc-400 mt-0.5">{sublabel}</div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export default function ConflictReviewModal({
  open,
  conflicts = [],
  onClose,
  onFinish,
}) {
  const hostRef = useRef(null);
  const [selections, setSelections] = useState(() =>
    defaultConflictSelections(conflicts)
  );

  useEffect(() => {
    if (!open) {
      if (hostRef.current) {
        try {
          document.body.removeChild(hostRef.current);
        } catch {}
        hostRef.current = null;
      }
      return;
    }

    const host = document.createElement("div");
    host.setAttribute("id", "conflict-review-host");
    host.style.position = "fixed";
    host.style.top = "0";
    host.style.left = "0";
    host.style.right = "0";
    host.style.bottom = "0";
    host.style.zIndex = "9999";
    host.style.pointerEvents = "auto";

    hostRef.current = host;
    document.body.appendChild(host);

    return () => {
      if (hostRef.current) {
        try {
          document.body.removeChild(hostRef.current);
        } catch {}
        hostRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSelections(defaultConflictSelections(conflicts));
  }, [open, conflicts]);

  const conflictList = useMemo(() => conflicts || [], [conflicts]);

  const updateFieldChoice = (key, field, value) => {
    setSelections((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        fields: {
          ...(prev[key]?.fields || {}),
          [field]: value,
        },
      },
    }));
  };

  const updateRowChoice = (key, value) => {
    setSelections((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        pick: value,
      },
    }));
  };

  if (!open || !hostRef.current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start sm:items-center justify-center px-3 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="w-full max-w-3xl rounded-3xl border border-emerald-900/30 bg-zinc-950/80 shadow-2xl overflow-hidden"
        style={{
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(16,185,129,0.08), 0 0 40px rgba(16,185,129,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950/70 to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xl font-semibold text-zinc-100">
                Resolve sync conflicts
              </div>
              <div className="text-sm text-zinc-400 mt-1">
                {conflictList.length} item(s) need a choice before we can finish
                syncing. Nothing has been overwritten yet.
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:bg-zinc-900 flex items-center justify-center text-zinc-200"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">
          {conflictList.map((conflict, index) => {
            const label = getRowLabel(conflict.local || conflict.cloud || {});
            return (
              <div
                key={conflict.key || index}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-zinc-100 truncate">
                      {label}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {conflict.reason}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 shrink-0">
                    #{index + 1}
                  </div>
                </div>

                {/* Delete vs edit */}
                {conflict.type === "delete_vs_edit" ? (
                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    <ChoiceChip
                      checked={selections[conflict.key]?.pick === "local"}
                      onChange={() => updateRowChoice(conflict.key, "local")}
                      label="Keep local"
                      sublabel={
                        conflict.local?._deleted
                          ? "Local version is deleted"
                          : "Keep local edits"
                      }
                      tone="emerald"
                    />
                    <ChoiceChip
                      checked={selections[conflict.key]?.pick === "cloud"}
                      onChange={() => updateRowChoice(conflict.key, "cloud")}
                      label="Keep cloud"
                      sublabel={
                        conflict.cloud?._deleted
                          ? "Cloud version is deleted"
                          : "Keep cloud edits"
                      }
                      tone="sky"
                    />
                  </div>
                ) : null}

                {/* Field conflicts */}
                {conflict.type === "field_conflict" ? (
                  <div className="mt-4 space-y-4">
                    {(conflict.fields || []).map((field) => {
                      const current =
                        selections[conflict.key]?.fields?.[field.field] ||
                        "chosen";
                      return (
                        <div
                          key={`${conflict.key}-${field.field}`}
                          className="rounded-2xl border border-zinc-800/70 bg-zinc-950/30 p-4"
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <div className="text-xs font-semibold tracking-wide text-zinc-300 uppercase">
                              {field.field}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              Choose the value you want to keep
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-3 mt-3">
                            <ChoiceChip
                              checked={current === "local"}
                              onChange={() =>
                                updateFieldChoice(
                                  conflict.key,
                                  field.field,
                                  "local"
                                )
                              }
                              label="Local"
                              sublabel={field.local || "—"}
                              tone="emerald"
                            />
                            <ChoiceChip
                              checked={current === "cloud"}
                              onChange={() =>
                                updateFieldChoice(
                                  conflict.key,
                                  field.field,
                                  "cloud"
                                )
                              }
                              label="Cloud"
                              sublabel={field.cloud || "—"}
                              tone="sky"
                            />
                          </div>

                          <div className="mt-3">
                            <ChoiceChip
                              checked={current === "chosen"}
                              onChange={() =>
                                updateFieldChoice(
                                  conflict.key,
                                  field.field,
                                  "chosen"
                                )
                              }
                              label="Keep auto-merge"
                              sublabel={field.chosen || "—"}
                              tone="zinc"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}

          {!conflictList.length ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-5 text-sm text-zinc-400">
              No conflicts to review.
            </div>
          ) : null}
        </div>

        {/* Sticky footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/70 sticky bottom-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-zinc-500">
              Tip: “Auto-merge” uses the merge engine’s best guess (usually newer
              / more complete). You can override field-by-field.
            </div>
            <div className="flex items-center gap-3">
              <button
                className="bg-zinc-900/70 border border-zinc-800 text-zinc-200 rounded-full px-4 py-2 text-sm hover:bg-zinc-900"
                onClick={onClose}
              >
                Close
              </button>
              <button
                className="bg-emerald-500 text-black rounded-full px-5 py-2 text-sm font-semibold hover:bg-emerald-400 active:bg-emerald-300"
                onClick={() => onFinish?.(selections)}
              >
                Finish sync
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    hostRef.current
  );
}

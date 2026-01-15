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

  // Create the portal host ONLY when the modal is open.
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
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="w-full max-w-3xl rounded-3xl border border-emerald-900/30 bg-zinc-950/80 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-24px)] sm:max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-800/80">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-zinc-100">
              Resolve sync conflicts
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {conflictList.length} item(s) need a choice before we can finish
              syncing. Nothing has been overwritten yet.
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 shrink-0 rounded-full bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-200"
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5 space-y-4">
          {conflictList.map((conflict, index) => {
            const label = getRowLabel(conflict.local || conflict.cloud || {});
            return (
              <div
                key={conflict.key || index}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-200 truncate">
                      {label}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {conflict.reason}
                    </div>
                  </div>
                </div>

                {conflict.type === "delete_vs_edit" ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="group flex items-start gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 hover:border-zinc-700">
                      <input
                        type="radio"
                        name={`delete-${conflict.key}`}
                        checked={selections[conflict.key]?.pick === "local"}
                        onChange={() => updateRowChoice(conflict.key, "local")}
                      />
                      <div className="min-w-0">
                        <div className="text-xs text-zinc-400">Keep local</div>
                        <div className="text-sm text-zinc-200">
                          {conflict.local?._deleted
                            ? "Deleted locally"
                            : "Keep local edits"}
                        </div>
                      </div>
                    </label>

                    <label className="group flex items-start gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 hover:border-zinc-700">
                      <input
                        type="radio"
                        name={`delete-${conflict.key}`}
                        checked={selections[conflict.key]?.pick === "cloud"}
                        onChange={() => updateRowChoice(conflict.key, "cloud")}
                      />
                      <div className="min-w-0">
                        <div className="text-xs text-zinc-400">Keep cloud</div>
                        <div className="text-sm text-zinc-200">
                          {conflict.cloud?._deleted
                            ? "Deleted in cloud"
                            : "Keep cloud edits"}
                        </div>
                      </div>
                    </label>
                  </div>
                ) : null}

                {conflict.type === "field_conflict"
                  ? (conflict.fields || []).map((field) => (
                      <div key={`${conflict.key}-${field.field}`}>
                        <div className="text-xs uppercase tracking-wide text-zinc-500">
                          {field.field}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 mt-2">
                          <label className="relative rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950/60 to-zinc-900/40 p-3 hover:border-zinc-700">
                            <div className="flex items-start gap-2">
                              <input
                                type="radio"
                                name={`${conflict.key}-${field.field}`}
                                checked={
                                  selections[conflict.key]?.fields?.[
                                    field.field
                                  ] === "local"
                                }
                                onChange={() =>
                                  updateFieldChoice(
                                    conflict.key,
                                    field.field,
                                    "local"
                                  )
                                }
                              />
                              <div className="min-w-0">
                                <div className="text-xs text-zinc-400">
                                  Local
                                </div>
                                <div className="text-sm text-zinc-200 break-words mt-1">
                                  {field.local || "—"}
                                </div>
                              </div>
                            </div>
                          </label>

                          <label className="relative rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-emerald-950/30 to-zinc-900/40 p-3 hover:border-emerald-800/60">
                            <div className="flex items-start gap-2">
                              <input
                                type="radio"
                                name={`${conflict.key}-${field.field}`}
                                checked={
                                  selections[conflict.key]?.fields?.[
                                    field.field
                                  ] === "cloud"
                                }
                                onChange={() =>
                                  updateFieldChoice(
                                    conflict.key,
                                    field.field,
                                    "cloud"
                                  )
                                }
                              />
                              <div className="min-w-0">
                                <div className="text-xs text-zinc-400">
                                  Cloud
                                </div>
                                <div className="text-sm text-zinc-200 break-words mt-1">
                                  {field.cloud || "—"}
                                </div>
                              </div>
                            </div>
                          </label>
                        </div>

                        <label className="mt-3 block rounded-2xl border border-zinc-700 bg-zinc-900/60 p-3 hover:border-zinc-600">
                          <div className="flex items-start gap-2">
                            <input
                              type="radio"
                              name={`${conflict.key}-${field.field}`}
                              checked={
                                selections[conflict.key]?.fields?.[
                                  field.field
                                ] === "chosen"
                              }
                              onChange={() =>
                                updateFieldChoice(
                                  conflict.key,
                                  field.field,
                                  "chosen"
                                )
                              }
                            />
                            <div className="min-w-0">
                              <div className="text-xs text-zinc-400">
                                Keep auto-merge
                              </div>
                              <div className="text-sm text-zinc-200 break-words mt-1">
                                {field.chosen || "—"}
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))
                  : null}
              </div>
            );
          })}
        </div>

        <div className="px-5 sm:px-6 py-3 sm:py-4 border-t border-zinc-800/80 bg-zinc-950/70">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-zinc-500 leading-snug sm:pr-6">
              Tip:{" "}
              <span className="text-zinc-400">
                “Auto-merge” uses the merge engine’s best guess (usually newer /
                more complete). You can override it field-by-field.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                className="bg-zinc-800 text-zinc-200 rounded-full px-4 py-2 text-sm hover:bg-zinc-700"
                onClick={onClose}
                type="button"
              >
                Close
              </button>
              <button
                className="bg-emerald-500 text-black rounded-full px-5 py-2 text-sm font-semibold hover:bg-emerald-400"
                onClick={() => onFinish?.(selections)}
                type="button"
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

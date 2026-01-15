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
      // Ensure any previous host is removed
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
    // Important: allow clicks to reach the modal content we portal in
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

  // If not open, render nothing (and host is removed by effect above)
  if (!open || !hostRef.current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center px-3 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <div className="text-lg font-semibold">Review conflicts</div>
            <div className="text-xs text-zinc-400">
              {conflictList.length} conflict(s) need resolution to finish sync.
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-4">
          {conflictList.map((conflict, index) => {
            const label = getRowLabel(conflict.local || conflict.cloud || {});
            return (
              <div
                key={conflict.key || index}
                className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-3"
              >
                <div>
                  <div className="text-sm font-semibold text-zinc-200">
                    {label}
                  </div>
                  <div className="text-xs text-zinc-500">{conflict.reason}</div>
                </div>

                {conflict.type === "delete_vs_edit" ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
                      <input
                        type="radio"
                        name={`delete-${conflict.key}`}
                        checked={selections[conflict.key]?.pick === "local"}
                        onChange={() => updateRowChoice(conflict.key, "local")}
                      />
                      <div>
                        <div className="text-xs text-zinc-400">Keep local</div>
                        <div className="text-sm text-zinc-200">
                          {conflict.local?._deleted
                            ? "Deleted locally"
                            : "Keep local edits"}
                        </div>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
                      <input
                        type="radio"
                        name={`delete-${conflict.key}`}
                        checked={selections[conflict.key]?.pick === "cloud"}
                        onChange={() => updateRowChoice(conflict.key, "cloud")}
                      />
                      <div>
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
                        <div className="text-xs uppercase text-zinc-400">
                          {field.field}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 mt-2">
                          <label className="flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
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
                            <div>
                              <div className="text-xs text-zinc-400">Local</div>
                              <div className="text-sm text-zinc-200 break-words">
                                {field.local || "—"}
                              </div>
                            </div>
                          </label>

                          <label className="flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
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
                            <div>
                              <div className="text-xs text-zinc-400">Cloud</div>
                              <div className="text-sm text-zinc-200 break-words">
                                {field.cloud || "—"}
                              </div>
                            </div>
                          </label>
                        </div>

                        <label className="mt-2 flex items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
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
                          <div>
                            <div className="text-xs text-zinc-400">
                              Keep auto-merge
                            </div>
                            <div className="text-sm text-zinc-200 break-words">
                              {field.chosen || "—"}
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

        <div className="flex flex-wrap items-center justify-end gap-3 px-5 py-4 border-t border-zinc-800">
          <button
            className="bg-zinc-800 text-zinc-200 rounded-full px-4 py-2 text-sm"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="bg-emerald-500 text-black rounded-full px-5 py-2 text-sm font-semibold"
            onClick={() => onFinish?.(selections)}
          >
            Finish sync
          </button>
        </div>
      </div>
    </div>,
    hostRef.current
  );
}

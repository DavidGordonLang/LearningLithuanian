// src/components/ConflictReviewModal.jsx
import React, { useEffect, useMemo, useState } from "react";

function Pill({ active, children, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        select-none whitespace-nowrap
        px-3 py-1.5 rounded-full text-xs font-semibold
        border transition
        ${
          active
            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
            : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
        }
        ${disabled ? "opacity-60 pointer-events-none" : ""}
      `}
    >
      {children}
    </button>
  );
}

function compact(v) {
  const s = (v ?? "").toString().trim();
  if (!s) return "—";
  return s.length > 180 ? s.slice(0, 177) + "…" : s;
}

export default function ConflictReviewModal({
  open,
  conflicts,
  mergedRows,
  onClose,
  onConfirm,
  busy = false,
  topOffset = 0,
}) {
  const list = Array.isArray(conflicts) ? conflicts : [];

  const mergedById = useMemo(() => {
    const m = new Map();
    const rows = Array.isArray(mergedRows) ? mergedRows : [];
    for (const r of rows) if (r?._id) m.set(r._id, r);
    return m;
  }, [mergedRows]);

  const [selections, setSelections] = useState({});

  useEffect(() => {
    if (!open) return;

    const initial = {};
    for (const c of list) {
      const key = c?.key;
      if (!key) continue;

      if (c.type === "delete_vs_edit") {
        const reason = (c?.reason || "").toLowerCase();
        const defaultPick = reason.includes("cloud has newer") ? "cloud" : "local";
        initial[key] = { type: "delete_vs_edit", pick: defaultPick };
        continue;
      }

      if (c.type === "field_conflict") {
        const fields = {};
        for (const f of Array.isArray(c.fields) ? c.fields : []) {
          if (f?.field) fields[f.field] = "chosen";
        }
        initial[key] = { type: "field_conflict", fields };
      }
    }

    setSelections(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const padTop = topOffset ? topOffset + 16 : 16;

  function setDeletePick(key, pick) {
    setSelections((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), type: "delete_vs_edit", pick },
    }));
  }

  function setFieldPick(key, field, pick) {
    setSelections((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        type: "field_conflict",
        fields: { ...((prev[key] || {}).fields || {}), [field]: pick },
      },
    }));
  }

  return (
    <div
      className="fixed inset-0 z-[230] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ paddingTop: padTop }}
      // IMPORTANT: use onClick not onPointerDown so the opening tap can’t immediately close it on mobile/tablet
      onClick={() => {
        if (!busy) onClose?.();
      }}
    >
      <div
        className="w-full max-w-3xl max-h-[82vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-[0_0_24px_rgba(0,0,0,0.35)] p-5"
        // Stop backdrop click from firing when interacting with the modal panel
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="text-xl font-bold">Review sync conflicts</h2>
            <div className="text-xs text-zinc-400 mt-0.5">
              {list.length} item{list.length === 1 ? "" : "s"} need a decision.
            </div>
          </div>

          <button
            type="button"
            className="bg-zinc-800 text-zinc-200 rounded-full px-3 py-1 text-xs font-medium hover:bg-zinc-700 active:bg-zinc-600 select-none"
            onClick={() => onClose?.()}
            disabled={busy}
          >
            Close
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 px-4 py-3 text-sm text-zinc-300 mb-4">
          Nothing has been overwritten yet. Choose what should win for each conflict, then finish the sync.
        </div>

        <div className="space-y-3">
          {list.map((c, idx) => {
            const key = c?.key || `c_${idx}`;
            const merged = c?.key ? mergedById.get(c.key) : null;

            const lt = merged?.Lithuanian || c?.local?.Lithuanian || c?.cloud?.Lithuanian || "";
            const en = merged?.English || c?.local?.English || c?.cloud?.English || "";

            return (
              <div key={key} className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">
                      {compact(lt) || "(missing Lithuanian)"}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">{compact(en)}</div>
                  </div>

                  <div className="text-[11px] text-zinc-500">#{idx + 1}</div>
                </div>

                {c.type === "delete_vs_edit" ? (
                  <div className="mt-3">
                    <div className="text-xs text-zinc-400 mb-2">Delete vs edit</div>

                    <div className="flex flex-wrap gap-2">
                      <Pill
                        active={(selections[key]?.pick || "local") === "local"}
                        onClick={() => setDeletePick(key, "local")}
                        disabled={busy}
                      >
                        Use local{c?.local?._deleted ? " (deleted)" : ""}
                      </Pill>

                      <Pill
                        active={(selections[key]?.pick || "local") === "cloud"}
                        onClick={() => setDeletePick(key, "cloud")}
                        disabled={busy}
                      >
                        Use cloud{c?.cloud?._deleted ? " (deleted)" : ""}
                      </Pill>
                    </div>

                    {c?.reason ? <div className="text-xs text-zinc-500 mt-2">{c.reason}</div> : null}
                  </div>
                ) : c.type === "field_conflict" ? (
                  <div className="mt-3">
                    <div className="text-xs text-zinc-400 mb-2">Field differences</div>

                    <div className="space-y-3">
                      {(Array.isArray(c.fields) ? c.fields : []).map((f) => {
                        const field = f?.field;
                        if (!field) return null;

                        const pick = selections[key]?.fields?.[field] || "chosen";

                        return (
                          <div key={field} className="rounded-xl border border-zinc-800 bg-zinc-950/10 p-3">
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <div className="text-xs font-semibold text-zinc-200">{field}</div>
                              <div className="flex gap-2">
                                <Pill
                                  active={pick === "local"}
                                  onClick={() => setFieldPick(key, field, "local")}
                                  disabled={busy}
                                >
                                  Local
                                </Pill>
                                <Pill
                                  active={pick === "chosen"}
                                  onClick={() => setFieldPick(key, field, "chosen")}
                                  disabled={busy}
                                >
                                  Auto
                                </Pill>
                                <Pill
                                  active={pick === "cloud"}
                                  onClick={() => setFieldPick(key, field, "cloud")}
                                  disabled={busy}
                                >
                                  Cloud
                                </Pill>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="rounded-lg border border-zinc-800 bg-zinc-950/30 p-2">
                                <div className="text-[11px] text-zinc-500 mb-1">Local</div>
                                <div className="text-zinc-200 whitespace-pre-wrap">{compact(f?.local)}</div>
                              </div>
                              <div className="rounded-lg border border-zinc-800 bg-zinc-950/30 p-2">
                                <div className="text-[11px] text-zinc-500 mb-1">Cloud</div>
                                <div className="text-zinc-200 whitespace-pre-wrap">{compact(f?.cloud)}</div>
                              </div>
                            </div>

                            <div className="text-[11px] text-zinc-500 mt-2">
                              Auto picks the best guess (usually newest / more complete). You can override it.
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {c?.reason ? <div className="text-xs text-zinc-500 mt-2">{c.reason}</div> : null}
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-zinc-500">Unknown conflict type.</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-end flex-wrap mt-5">
          <button
            type="button"
            className="bg-zinc-800 text-zinc-200 rounded-full px-4 py-2 text-sm font-medium hover:bg-zinc-700 active:bg-zinc-600 select-none"
            onClick={() => onClose?.()}
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="button"
            className="bg-emerald-600 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-emerald-500 active:bg-emerald-700 select-none"
            onClick={() => onConfirm?.(selections)}
            disabled={busy}
          >
            {busy ? "Finishing…" : "Finish sync"}
          </button>
        </div>
      </div>
    </div>
  );
}
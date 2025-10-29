import React, { useState } from "react";

/**
 * Props:
 *  - row (required): item object with stable id
 *  - onSave(patch)
 *  - onDelete()
 *  - settings (for audio playback later)
 *
 * Edit mode is now **scoped per-card** and saves by id (passed from parent).
 * This eliminates index-based corruption (FIX for BUG-2).
 */
export default function EntryCard({ row, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => ({
    en: row.en || "",
    lt: row.lt || "",
    notes: row.notes || "",
    tone: row.tone || "",
    audience: row.audience || "",
    register: row.register || "",
    status: row.status || "red",
  }));

  function startEdit() {
    setDraft({
      en: row.en || "",
      lt: row.lt || "",
      notes: row.notes || "",
      tone: row.tone || "",
      audience: row.audience || "",
      register: row.register || "",
      status: row.status || "red",
    });
    setIsEditing(true);
  }

  function save() {
    onSave?.({ ...draft });
    setIsEditing(false);
  }

  return (
    <article
      className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
      aria-labelledby={`h-${row.id}`}
    >
      {!isEditing ? (
        <>
          <header className="flex items-center justify-between gap-3">
            <h3 id={`h-${row.id}`} className="font-medium">
              {row.en} <span className="text-neutral-500">→</span> {row.lt}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{row.status}</span>
              <button
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring"
                onClick={startEdit}
              >
                Edit
              </button>
              <button
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring"
                onClick={onDelete}
              >
                Delete
              </button>
            </div>
          </header>
          {row.notes ? (
            <p className="mt-2 text-neutral-300">{row.notes}</p>
          ) : null}
        </>
      ) : (
        <div className="grid gap-2">
          <label className="text-sm text-neutral-300">
            English
            <input
              className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
              value={draft.en}
              onChange={(e) => setDraft({ ...draft, en: e.target.value })}
            />
          </label>

          <label className="text-sm text-neutral-300">
            Lithuanian
            <input
              className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
              value={draft.lt}
              onChange={(e) => setDraft({ ...draft, lt: e.target.value })}
            />
          </label>

          <label className="text-sm text-neutral-300">
            Notes
            <textarea
              className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
              rows={3}
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="text-sm text-neutral-300">
              Tone
              <input
                className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
                value={draft.tone}
                onChange={(e) => setDraft({ ...draft, tone: e.target.value })}
              />
            </label>
            <label className="text-sm text-neutral-300">
              Audience
              <input
                className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
                value={draft.audience}
                onChange={(e) => setDraft({ ...draft, audience: e.target.value })}
              />
            </label>
            <label className="text-sm text-neutral-300">
              Register
              <input
                className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
                value={draft.register}
                onChange={(e) => setDraft({ ...draft, register: e.target.value })}
              />
            </label>
          </div>

          <label className="text-sm text-neutral-300">
            Status (R/A/G)
            <select
              className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            >
              <option value="red">Red (learning)</option>
              <option value="amber">Amber (okay)</option>
              <option value="green">Green (mastered)</option>
            </select>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring"
              onClick={save}
            >
              Save
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

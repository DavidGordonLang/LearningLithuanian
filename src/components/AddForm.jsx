import React, { useState } from "react";

/**
 * Props:
 *  - onSave(payload)  REQUIRED
 *  - onCancel()       OPTIONAL
 *
 * This emits a minimal, normalised payload. App assigns id/timestamps and persists.
 * (Fix for BUG-1: ensure the wired prop is `onSave`, and call it on submit.)
 */
export default function AddForm({ onSave, onCancel }) {
  const [en, setEn] = useState("");
  const [lt, setLt] = useState("");
  const [dir, setDir] = useState("EN→LT");
  const [notes, setNotes] = useState("");
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [register, setRegister] = useState("");
  const [status, setStatus] = useState("red");

  const canSave = en.trim() && lt.trim();

  function submit(e) {
    e.preventDefault();
    if (!canSave) return;
    onSave?.({
      en,
      lt,
      dir,
      notes,
      tone,
      audience,
      register,
      status,
      variants: [],
    });
    // Clear locally; parent closes the panel and shows toast
    setEn("");
    setLt("");
    setNotes("");
    setTone("");
    setAudience("");
    setRegister("");
    setStatus("red");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-2">
        <label htmlFor="dir" className="text-sm text-neutral-300">
          Direction
        </label>
        <select
          id="dir"
          className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
          value={dir}
          onChange={(e) => setDir(e.target.value)}
        >
          <option>EN→LT</option>
          <option>LT→EN</option>
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="en" className="text-sm text-neutral-300">
          English <span className="text-red-400">*</span>
        </label>
        <input
          id="en"
          className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
          placeholder="Good evening"
          value={en}
          onChange={(e) => setEn(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="lt" className="text-sm text-neutral-300">
          Lithuanian <span className="text-red-400">*</span>
        </label>
        <input
          id="lt"
          className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
          placeholder="Labas vakaras"
          value={lt}
          onChange={(e) => setLt(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="notes" className="text-sm text-neutral-300">
          Notes
        </label>
        <textarea
          id="notes"
          className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
          placeholder="Context, usage, variants..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="grid gap-2">
          <label htmlFor="tone" className="text-sm text-neutral-300">
            Tone
          </label>
          <input
            id="tone"
            className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="audience" className="text-sm text-neutral-300">
            Audience
          </label>
          <input
            id="audience"
            className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="register" className="text-sm text-neutral-300">
            Register
          </label>
          <input
            id="register"
            className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
            value={register}
            onChange={(e) => setRegister(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="status" className="text-sm text-neutral-300">
          Status (R/A/G)
        </label>
        <select
          id="status"
          className="rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="red">Red (learning)</option>
          <option value="amber">Amber (okay)</option>
          <option value="green">Green (mastered)</option>
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring disabled:opacity-60"
          disabled={!canSave}
        >
          Save
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

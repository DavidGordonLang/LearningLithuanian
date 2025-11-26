// src/views/LibraryView.jsx
import React, {
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { searchStore } from "../searchStore";

// simple classnames helper (duplicated from App)
const cn = (...xs) => xs.filter(Boolean).join(" ");

// Long-press / tap handler for audio
function makePressHandlers(text, playText) {
  let timer = null;
  let firedSlow = false;
  let pressed = false;

  const start = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const ae = document.activeElement;
      if (ae && typeof ae.blur === "function") ae.blur();
    } catch {}
    firedSlow = false;
    pressed = true;
    timer = window.setTimeout(() => {
      if (!pressed) return;
      firedSlow = true;
      playText(text, { slow: true });
    }, 550);
  };

  const finish = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!pressed) return;
    pressed = false;
    if (timer) window.clearTimeout(timer);
    timer = null;
    if (!firedSlow) playText(text, { slow: false });
  };

  const cancel = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    pressed = false;
    if (timer) window.clearTimeout(timer);
    timer = null;
  };

  return {
    "data-press": "1",
    onPointerDown: start,
    onPointerUp: finish,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: (e) => e.preventDefault(),
  };
}

function RagBadge({ icon, normalizeRag }) {
  const rag = normalizeRag(icon);
  let label = "Amber";
  let dotClass = "bg-amber-400";
  if (rag === "🔴") {
    label = "Red";
    dotClass = "bg-red-500";
  } else if (rag === "🟢") {
    label = "Green";
    dotClass = "bg-emerald-500";
  }

  return (
    <div className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700">
      <span className={cn("w-2 h-2 rounded-full", dotClass)} />
      <span>{label}</span>
    </div>
  );
}

const EMPTY_DRAFT = {
  English: "",
  Lithuanian: "",
  Phonetic: "",
  Category: "",
  Usage: "",
  Notes: "",
  "RAG Icon": "🟠",
  Sheet: "Phrases",
};

export default function LibraryView({
  T,
  rows,
  setRows,
  fetchStarter,
  installNumbersOnly,
  importJsonFile,
  clearLibrary,
  dupeResults,
  scanDupes,
  normalizeRag,
  removePhrase,
  sortMode,
  direction,
  playText,
}) {
  const fileInputRef = useRef(null);

  const [activeSheet, setActiveSheet] = useState("Phrases");
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  // --- search / sort wiring (uses the same global store as SearchDock) ---
  const qFilter = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );
  const qNorm = (qFilter || "").trim().toLowerCase();

  const entryMatchesQuery = (r) =>
    !!qNorm &&
    ((r.English || "").toLowerCase().includes(qNorm) ||
      (r.Lithuanian || "").toLowerCase().includes(qNorm) ||
      (r.Category || "").toLowerCase().includes(qNorm) ||
      (r.Usage || "").toLowerCase().includes(qNorm));

  const filtered = useMemo(() => {
    const base = qNorm
      ? rows.filter(entryMatchesQuery)
      : rows.filter((r) => (r.Sheet || "Phrases") === activeSheet);

    if (sortMode === "Newest") {
      return [...base].sort((a, b) => (b._ts || 0) - (a._ts || 0));
    }
    if (sortMode === "Oldest") {
      return [...base].sort((a, b) => (a._ts || 0) - (b._ts || 0));
    }

    const order = { "🔴": 0, "🟠": 1, "🟢": 2 };
    return [...base].sort(
      (a, b) =>
        (order[normalizeRag(a["RAG Icon"])] ?? 1) -
        (order[normalizeRag(b["RAG Icon"])] ?? 1)
    );
  }, [rows, qNorm, sortMode, activeSheet, normalizeRag]);

  // --- counts per sheet for the small tabs ---
  const sheetCounts = useMemo(() => {
    const counts = { Phrases: 0, Questions: 0, Words: 0, Numbers: 0 };
    for (const r of rows) {
      const s = r.Sheet || "Phrases";
      if (counts[s] != null) counts[s]++;
    }
    return counts;
  }, [rows]);

  // --- editing helpers ------------------------------------------------------

  function beginEditRow(row) {
    const idx = rows.findIndex(
      (r) =>
        r === row ||
        (r._id && row._id && r._id === row._id) ||
        (r.English === row.English &&
          r.Lithuanian === row.Lithuanian &&
          r.Sheet === row.Sheet)
    );
    if (idx === -1) return;
    setEditingIndex(idx);
    setDraft({
      ...EMPTY_DRAFT,
      ...rows[idx],
      "RAG Icon": normalizeRag(rows[idx]["RAG Icon"] || "🟠"),
      Sheet: rows[idx].Sheet || "Phrases",
    });
  }

  function cancelEdit() {
    setEditingIndex(null);
    setDraft(EMPTY_DRAFT);
  }

  function saveEdit() {
    if (editingIndex == null || editingIndex < 0) return;
    const clean = {
      ...rows[editingIndex],
      ...draft,
      "RAG Icon": normalizeRag(draft["RAG Icon"]),
      Sheet: draft.Sheet || "Phrases",
    };
    setRows((prev) => prev.map((r, i) => (i === editingIndex ? clean : r)));
    setEditingIndex(null);
    setDraft(EMPTY_DRAFT);
  }

  function handleDelete(row) {
    const idx = rows.findIndex(
      (r) =>
        r === row ||
        (r._id && row._id && r._id === row._id) ||
        (r.English === row.English &&
          r.Lithuanian === row.Lithuanian &&
          r.Sheet === row.Sheet)
    );
    if (idx === -1) return;
    if (!window.confirm(T.confirm)) return;

    const target = rows[idx];
    const id = target._id;

    if (id && typeof removePhrase === "function") {
      removePhrase(id);
    } else {
      setRows((prev) => prev.filter((_, i) => i !== idx));
    }
  }

  function handleAddBlank() {
    // simple quick-add: create a blank entry on current sheet and go straight into edit
    const newRow = {
      ...EMPTY_DRAFT,
      Sheet: activeSheet,
      _id: Math.random().toString(36).slice(2),
      _ts: Date.now(),
    };
    setRows((prev) => [newRow, ...prev]);
    const idx = 0; // new row at top
    setEditingIndex(idx);
    setDraft(newRow);
  }

  // --- import / export ------------------------------------------------------

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    await importJsonFile(file);
    e.target.value = "";
  }

  function handleExport() {
    try {
      const blob = new Blob([JSON.stringify(rows, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lithuanian_trainer_library.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed.");
    }
  }

  // Which side should be spoken on tap?
  const speakField = direction === "EN2LT" ? "Lithuanian" : "English";

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-24">
      {/* spacer for header + dock */}
      <div style={{ height: 56 + 112 }} />

      {/* Starter / import buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          type="button"
          className="px-4 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-sm hover:bg-zinc-800"
          onClick={() => fetchStarter("EN2LT")}
        >
          {T.installEN}
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-sm hover:bg-zinc-800"
          onClick={() => fetchStarter("LT2EN")}
        >
          {T.installLT}
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-sm hover:bg-zinc-800"
          onClick={installNumbersOnly}
        >
          {T.installNums}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="flex gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-sm hover:bg-zinc-800"
            onClick={handleImportClick}
          >
            {T.importJSON}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-zinc-900 border border-zinc-700 text-sm hover:bg-zinc-800"
            onClick={handleExport}
          >
            Export JSON
          </button>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-md bg-red-900/60 border border-red-700 text-sm text-red-100 hover:bg-red-900"
          onClick={clearLibrary}
        >
          {T.clearAll}
        </button>

        <button
          type="button"
          className="ml-auto px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold"
          onClick={handleAddBlank}
        >
          {T.addEntry}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          accept="application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Sheet tabs */}
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        {["Phrases", "Questions", "Words", "Numbers"].map((sheet) => (
          <button
            key={sheet}
            type="button"
            onClick={() => setActiveSheet(sheet)}
            className={cn(
              "px-3 py-1.5 rounded-full border text-xs sm:text-sm",
              activeSheet === sheet
                ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                : "bg-zinc-900 text-zinc-200 border-zinc-700 hover:bg-zinc-800"
            )}
          >
            {T[sheet.toLowerCase()] || sheet} ·{" "}
            {sheetCounts[sheet] ?? 0}
          </button>
        ))}
      </div>

      {/* Library list */}
      <h2 className="text-xl font-semibold mb-3">{T.libraryTitle}</h2>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No entries found for this view.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => {
            const idx = rows.findIndex(
              (r) =>
                r === row ||
                (r._id && row._id && r._id === row._id) ||
                (r.English === row.English &&
                  r.Lithuanian === row.Lithuanian &&
                  r.Sheet === row.Sheet)
            );
            const isEditing = editingIndex === idx;
            const speakText = row[speakField] || "";

            return (
              <div
                key={row._id || `${row.English}__${row.Lithuanian}__${idx}`}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 flex flex-col gap-2"
              >
                {/* Top row */}
                <div className="flex gap-3 items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <>
                        <div className="flex flex-col sm:flex-row gap-2 mb-2">
                          <input
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-1.5 text-sm"
                            placeholder={T.english}
                            value={draft.English}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                English: e.target.value,
                              }))
                            }
                          />
                          <input
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-1.5 text-sm"
                            placeholder={T.lithuanian}
                            value={draft.Lithuanian}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                Lithuanian: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mb-2">
                          <input
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-1.5 text-xs"
                            placeholder={T.phonetic}
                            value={draft.Phonetic}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                Phonetic: e.target.value,
                              }))
                            }
                          />
                          <input
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-1.5 text-xs"
                            placeholder={T.category}
                            value={draft.Category}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                Category: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mb-2">
                          <input
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-1.5 text-xs"
                            placeholder={T.usage}
                            value={draft.Usage}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                Usage: e.target.value,
                              }))
                            }
                          />
                          <input
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-1.5 text-xs"
                            placeholder={T.notes}
                            value={draft.Notes}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                Notes: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="text-left"
                        {...makePressHandlers(speakText, playText)}
                      >
                        <div className="text-sm font-semibold truncate">
                          {row.English || "—"}{" "}
                          <span className="text-zinc-500">—</span>{" "}
                          {row.Lithuanian || "—"}
                        </div>
                        {row.Phonetic && (
                          <div className="text-xs text-zinc-400 mt-0.5">
                            {row.Phonetic}
                          </div>
                        )}
                      </button>
                    )}

                    {!isEditing && (
                      <div className="mt-1 text-xs text-zinc-400 space-x-4">
                        <span>
                          Sheet: {row.Sheet || "Phrases"}
                        </span>
                        {row.Category && (
                          <span>Category: {row.Category}</span>
                        )}
                        {row.Usage && (
                          <span>Usage: {row.Usage}</span>
                        )}
                        {row.Notes && (
                          <span>Notes: {row.Notes}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {isEditing ? (
                      <select
                        className="bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1 text-xs"
                        value={draft["RAG Icon"] || "🟠"}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            "RAG Icon": e.target.value,
                          }))
                        }
                      >
                        <option value="🔴">🔴 Red</option>
                        <option value="🟠">🟠 Amber</option>
                        <option value="🟢">🟢 Green</option>
                      </select>
                    ) : (
                      <RagBadge
                        icon={row["RAG Icon"]}
                        normalizeRag={normalizeRag}
                      />
                    )}

                    <div className="flex gap-1">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            className="px-2 py-1 rounded-md bg-emerald-600 text-xs"
                            onClick={saveEdit}
                          >
                            {T.save}
                          </button>
                          <button
                            type="button"
                            className="px-2 py-1 rounded-md bg-zinc-800 text-xs"
                            onClick={cancelEdit}
                          >
                            {T.cancel}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="px-2 py-1 rounded-md bg-zinc-800 text-xs"
                            onClick={() => beginEditRow(row)}
                          >
                            {T.edit}
                          </button>
                          <button
                            type="button"
                            className="px-2 py-1 rounded-md bg-red-900/70 text-xs text-red-100"
                            onClick={() => handleDelete(row)}
                          >
                            {T.delete}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Duplicate finder */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">{T.dupFinder}</h3>
          <button
            type="button"
            className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-700 text-xs hover:bg-zinc-800"
            onClick={scanDupes}
          >
            {T.scan}
          </button>
        </div>
        <div className="text-xs text-zinc-400 space-y-1">
          <div>
            {T.exactGroups}: {dupeResults.exact?.length || 0} group(s)
          </div>
          <div>
            {T.closeMatches}: {dupeResults.close?.length || 0} pair(s)
          </div>
        </div>
      </div>
    </div>
  );
}

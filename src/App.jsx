import React, { useEffect, useMemo, useRef, useState } from "react";
import AddForm from "./components/AddForm";
import EntryCard from "./components/EntryCard";
import Settings from "./components/Settings";

/**
 * ------- STORAGE KEYS -------
 */
const LS_KEY_ITEMS = "ll_items_v2"; // bump schema to v2 for id-based edits
const LS_KEY_SETTINGS = "ll_settings_v2";

/**
 * ------- HELPERS -------
 */
const uuid = () =>
  (globalThis.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : "id_" + Math.random().toString(36).slice(2) + Date.now().toString(36);

const nowISO = () => new Date().toISOString();

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors for now */
  }
}

/**
 * ------- SIMPLE TOAST -------
 */
function Toast({ message, onDone, timeout = 2000 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, timeout);
    return () => clearTimeout(t);
  }, [message, onDone, timeout]);
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-xl shadow-lg"
    >
      {message}
    </div>
  );
}

/**
 * ------- APP -------
 */
export default function App() {
  // items: array of { id, en, lt, dir, notes, tone, audience, register, createdAt, updatedAt, status }
  const [items, setItems] = useState(() => loadJSON(LS_KEY_ITEMS, []));
  // settings: { ttsProvider: 'browser' | 'azure', azureRegion, azureKey, voiceName }
  const [settings, setSettings] = useState(() =>
    loadJSON(LS_KEY_SETTINGS, { ttsProvider: "browser", azureRegion: "", azureKey: "", voiceName: "" })
  );
  // ui
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");

  // Persist
  useEffect(() => saveJSON(LS_KEY_ITEMS, items), [items]);
  useEffect(() => saveJSON(LS_KEY_SETTINGS, settings), [settings]);

  // Derived / search (simple, case-insensitive; diacritics left as-is)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) =>
      (r.en || "").toLowerCase().includes(q) ||
      (r.lt || "").toLowerCase().includes(q) ||
      (r.notes || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  /**
   * ------- CRUD by stable id (FIX for BUG-2) -------
   */
  function addItem(payload) {
    // payload is expected to have at least { en, lt }
    const newItem = {
      id: uuid(),
      en: (payload.en ?? "").trim(),
      lt: (payload.lt ?? "").trim(),
      dir: payload.dir || "EN→LT",
      notes: normNotes(payload.notes),
      tone: payload.tone || "",
      audience: payload.audience || "",
      register: payload.register || "",
      status: payload.status || "red", // keep legacy R/A/G idea
      createdAt: nowISO(),
      updatedAt: nowISO(),
      variants: Array.isArray(payload.variants) ? payload.variants : [],
      audio: payload.audio || null,
    };
    setItems((prev) => [newItem, ...prev]);
    setToast("Saved ✓");
    setShowAdd(false);
  }

  function updateItem(id, patch) {
    setItems((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...patch, notes: normNotes(patch.notes ?? r.notes), updatedAt: nowISO() } : r
      )
    );
    setToast("Updated ✓");
  }

  function deleteItem(id) {
    setItems((prev) => prev.filter((r) => r.id !== id));
    setToast("Deleted");
  }

  function normNotes(n) {
    // FIX for BUG-5 (avoid NaN showing up)
    if (n === null || n === undefined) return "";
    if (typeof n === "number" && Number.isNaN(n)) return "";
    return String(n);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-20 bg-neutral-950/80 backdrop-blur border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <h1 className="text-xl font-semibold">Lithuanian Trainer</h1>
          <nav className="ml-auto flex items-center gap-2">
            <button
              className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring"
              onClick={() => setShowAdd(true)}
              aria-label="Add new card"
            >
              + Add
            </button>
            <Settings
              value={settings}
              onChange={setSettings}
            />
          </nav>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <label htmlFor="search" className="sr-only">
            Search phrases
          </label>
          <input
            id="search"
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
            placeholder="Search English, Lithuanian, or notes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <p className="text-neutral-400">No items yet. Add your first card.</p>
        ) : (
          <ul className="grid gap-3">
            {filtered.map((row) => (
              <li key={row.id}>
                <EntryCard
                  row={row}
                  onSave={(patch) => updateItem(row.id, patch)} // FIX for BUG-2
                  onDelete={() => deleteItem(row.id)}
                  settings={settings}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Slide-over add panel (with Esc + focus handling) — FIX for BUG-4 in Batch 2, but we add Esc now */}
      {showAdd && (
        <AddOverlay onClose={() => setShowAdd(false)}>
          <AddForm
            onSave={(payload) => addItem(payload)} // FIX for BUG-1 (wire the correct handler name)
            onCancel={() => setShowAdd(false)}
          />
        </AddOverlay>
      )}

      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}

/**
 * Accessible slide-over overlay with Esc handling and initial focus.
 * (Focus trapping will be added in Batch 2 with a small lib; here we at least add Esc + autofocus.)
 */
function AddOverlay({ children, onClose }) {
  const panelRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-30 bg-black/60"
      aria-modal="true"
      role="dialog"
      aria-label="Add new card"
      onMouseDown={(e) => {
        // click backdrop to close
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        ref={panelRef}
        tabIndex={-1}
        className="absolute right-0 top-0 h-full w-full max-w-lg bg-neutral-925 border-l border-neutral-800 p-4 overflow-auto focus:outline-none"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Add a new card</h2>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring"
            aria-label="Close add panel"
          >
            ✕
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

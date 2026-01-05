// src/stores/phraseStore.js
import { create } from "zustand";

const LS_KEY = "lt_phrasebook_v3";

/* --------------------------- Normalisation --------------------------- */

/**
 * Remove Lithuanian diacritics and normalise text for identity matching
 */
function normalizeText(input = "") {
  return String(input)
    .toLowerCase()
    .trim()
    .normalize("NFD") // split accents
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, ""); // remove punctuation & spaces
}

/**
 * Deterministic identity for a phrase
 * DO NOT CHANGE once in use
 *
 * Identity rule:
 * - Lithuanian ONLY
 * - English is NOT identity
 * - Category / Sheet are NOT identity
 */
function buildContentKey(row) {
  const lt = normalizeText(row?.Lithuanian || "");
  return lt;
}

/* --------------------------- Storage --------------------------- */

const loadRows = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const saveRows = (rows) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rows));
  } catch (err) {
    console.error("Failed saving rows", err);
  }
};

/* --------------------------- Guards --------------------------- */

const ensureIdTs = (r) => {
  const out = { ...r };

  if (!out._id || typeof out._id !== "string") {
    out._id = Math.random().toString(36).slice(2);
  }

  if (!out._ts || typeof out._ts !== "number") {
    out._ts = Date.now();
  }

  return out;
};

const ensureDeletionFields = (r) => {
  const out = { ...r };

  if (out._deleted === true) {
    if (typeof out._deleted_ts !== "number") {
      out._deleted_ts = Date.now();
    }
  } else {
    out._deleted = false;
    out._deleted_ts = null;
  }

  return out;
};

const ensureContentKey = (r) => {
  const out = { ...r };

  if (!out.contentKey || typeof out.contentKey !== "string") {
    out.contentKey = buildContentKey(out);
  }

  return out;
};

/**
 * Ensure ownership fields exist.
 *
 * Rules:
 * - Starter rows: Source="starter", Touched defaults false
 * - Everything else: Source defaults "user", Touched defaults true
 *
 * (This fixes legacy cloud rows that predate Source/Touched.)
 */
const ensureOwnershipFields = (r) => {
  const out = { ...r };

  const src = typeof out.Source === "string" ? out.Source : "";

  if (!src) {
    out.Source = "user";
  }

  if (typeof out.Touched !== "boolean") {
    out.Touched = out.Source === "starter" ? false : true;
  }

  return out;
};

const ensureAll = (r) =>
  ensureOwnershipFields(ensureContentKey(ensureDeletionFields(ensureIdTs(r))));

/* ------------------------ Zustand Store ------------------------ */

export const usePhraseStore = create((set, get) => ({
  phrases: loadRows(),

  /* ---------- Migration ---------- */

  _migrateRows: () => {
    const rows = get().phrases || [];
    let changed = false;

    const migrated = rows.map((r) => {
      const before = JSON.stringify(r);
      const next = ensureAll(r);
      if (JSON.stringify(next) !== before) changed = true;
      return next;
    });

    if (changed) {
      set({ phrases: migrated });
      saveRows(migrated);
    }
  },

  /* ---------- Core ---------- */

  setPhrases: (update) => {
    set((state) => {
      const next =
        typeof update === "function" ? update(state.phrases) : update;

      const safe = Array.isArray(next) ? next.map(ensureAll) : [];

      saveRows(safe);
      return { phrases: safe };
    });
  },

  /* ---------- Add ---------- */

  addPhrase: (row) =>
    set((state) => {
      const merged = {
        ...row,
        // Manual add is always user-owned
        Source: "user",
        Touched: true,
        _ts: Date.now(),
      };

      const safeRow = ensureAll(merged);
      const next = [safeRow, ...state.phrases];
      saveRows(next);
      return { phrases: next };
    }),

  /* ---------- Edit (CRITICAL: starter → user handoff) ---------- */

  saveEditedPhrase: (index, updated) =>
    set((state) => {
      const next = state.phrases.map((r, i) => {
        if (i !== index) return r;

        const wasStarter = r.Source === "starter";

        const merged = {
          ...r,
          ...updated,
          _ts: Date.now(),

          // ✅ Any edit makes it user-owned + touched
          Source: wasStarter ? "user" : (r.Source || "user"),
          Touched: true,
        };

        return ensureAll(merged);
      });

      saveRows(next);
      return { phrases: next };
    }),

  /* ---------- Delete (tombstone) ---------- */

  removePhrase: (index) =>
    set((state) => {
      const next = state.phrases.map((r, i) =>
        i === index
          ? ensureAll({ ...r, _deleted: true, _deleted_ts: Date.now() })
          : r
      );

      saveRows(next);
      return { phrases: next };
    }),

  /* ---------- Patch by ID ---------- */

  patchPhraseById: (id, patch) =>
    set((state) => {
      if (!id) return { phrases: state.phrases };

      const next = state.phrases.map((r) => {
        if (r._id !== id || r._deleted) return r;

        const merged = { ...r, ...patch };
        return ensureAll(merged);
      });

      saveRows(next);
      return { phrases: next };
    }),
}));

// Run migration immediately
usePhraseStore.getState()._migrateRows();

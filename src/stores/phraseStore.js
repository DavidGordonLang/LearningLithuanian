// src/stores/phraseStore.js
import { create } from "zustand";

const LS_KEY = "lt_phrasebook_v3";

/* --------------------------- Helpers --------------------------- */
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

const genId = () => Math.random().toString(36).slice(2);

const ensureIdTs = (r) => {
  const out = { ...(r || {}) };
  if (!out._id || typeof out._id !== "string") out._id = genId();
  if (!out._ts || typeof out._ts !== "number") out._ts = Date.now();
  return out;
};

const markDeleted = (row) => {
  const base = ensureIdTs(row);
  const now = Date.now();

  // IMPORTANT:
  // - Keep the row so it can sync as a tombstone
  // - Keep _id stable forever
  // - _ts is set to "now" to represent the latest change
  return {
    ...base,
    _deleted: true,
    _deletedAt: now,
    _ts: now,
  };
};

/* ------------------------ Zustand Store ------------------------ */

export const usePhraseStore = create((set, get) => ({
  // initial state
  phrases: loadRows(),

  // ensure each row has an ID and timestamp
  _migrateRows: () => {
    const rows = get().phrases || [];
    let changed = false;

    const migrated = rows.map((r) => {
      const beforeId = r?._id;
      const beforeTs = r?._ts;

      const next = ensureIdTs(r);

      // Backfill tombstone fields if partially present (defensive)
      if (next._deleted && typeof next._deletedAt !== "number") {
        next._deletedAt = next._ts || Date.now();
        changed = true;
      }

      if (beforeId !== next._id || beforeTs !== next._ts) changed = true;
      return next;
    });

    if (changed) {
      set({ phrases: migrated });
      saveRows(migrated);
    }
  },

  // replace entire list
  setPhrases: (update) => {
    set((state) => {
      const next = typeof update === "function" ? update(state.phrases) : update;
      const safe = Array.isArray(next) ? next : [];
      saveRows(safe);
      return { phrases: safe };
    });
  },

  // add entry
  addPhrase: (row) =>
    set((state) => {
      const safeRow = ensureIdTs(row);
      const next = [safeRow, ...state.phrases];
      saveRows(next);
      return { phrases: next };
    }),

  // update a phrase by index (existing behaviour)
  saveEditedPhrase: (index, updated) =>
    set((state) => {
      const next = state.phrases.map((r, i) =>
        i === index
          ? { ...ensureIdTs(r), ...updated, _ts: r._ts || Date.now() }
          : r
      );
      saveRows(next);
      return { phrases: next };
    }),

  // remove phrase by index
  // NEW BEHAVIOUR: tombstone instead of hard delete
  removePhrase: (index) =>
    set((state) => {
      const target = state.phrases[index];
      if (!target) return { phrases: state.phrases };

      // If already deleted, keep as-is (idempotent)
      if (target._deleted) return { phrases: state.phrases };

      const next = state.phrases.map((r, i) => (i === index ? markDeleted(r) : r));
      saveRows(next);
      return { phrases: next };
    }),

  // OPTIONAL: delete by _id (useful for future merge + UI)
  tombstonePhraseById: (id) =>
    set((state) => {
      if (!id) return { phrases: state.phrases };

      const next = state.phrases.map((r) => {
        if ((r?._id ?? null) !== id) return r;
        if (r?._deleted) return r;
        return markDeleted(r);
      });

      saveRows(next);
      return { phrases: next };
    }),

  // PATCH by _id (for async enrich)
  patchPhraseById: (id, patch) =>
    set((state) => {
      if (!id) return { phrases: state.phrases };

      const now = Date.now();

      const next = state.phrases.map((r) => {
        if ((r?._id ?? null) !== id) return r;

        // If it's deleted, we generally should NOT "revive" it via enrich.
        // We still allow patching fields if you ever want to display deleted items,
        // but we keep the tombstone flags intact.
        const merged = { ...r, ...(patch || {}) };

        // Ensure metadata stays sane
        if (!merged._id) merged._id = id;
        merged._ts = typeof merged._ts === "number" ? merged._ts : now;

        if (merged._deleted) {
          if (typeof merged._deletedAt !== "number") merged._deletedAt = merged._ts;
          // Do not clear _deleted/_deletedAt here.
          return merged;
        }

        return merged;
      });

      saveRows(next);
      return { phrases: next };
    }),
}));

// Run migration on startup
usePhraseStore.getState()._migrateRows();

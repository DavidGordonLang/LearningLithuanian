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

/**
 * Ensure tombstone fields exist and are sane
 */
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

/**
 * Ensure Source + Touched exist
 */
const ensureSourceTouched = (r) => {
  const out = { ...r };

  if (!out.Source) {
    // Heuristic:
    // - If phrase has no enrich / qstat and looks like bulk data → starter
    // - Otherwise default to user
    out.Source = out._qstat ? "user" : "starter";
  }

  if (typeof out.Touched !== "boolean") {
    // If user ever interacted (qstat / usage / notes), treat as touched
    out.Touched =
      !!out._qstat ||
      !!out.Usage ||
      !!out.Notes ||
      out.Source === "user";
  }

  return out;
};

/**
 * Mark phrase as touched (used on edit / enrich)
 */
const markTouched = (r) => ({
  ...r,
  Touched: true,
});

/* ------------------------ Zustand Store ------------------------ */

export const usePhraseStore = create((set, get) => ({
  // initial state
  phrases: loadRows(),

  /* ---------- Migration ---------- */

  _migrateRows: () => {
    const rows = get().phrases || [];
    let changed = false;

    const migrated = rows.map((r) => {
      const before = JSON.stringify(r);

      let next = ensureIdTs(r);
      next = ensureDeletionFields(next);
      next = ensureSourceTouched(next);

      if (JSON.stringify(next) !== before) {
        changed = true;
      }

      return next;
    });

    if (changed) {
      set({ phrases: migrated });
      saveRows(migrated);
    }
  },

  /* ---------- Core setters ---------- */

  setPhrases: (update) => {
    set((state) => {
      const next =
        typeof update === "function" ? update(state.phrases) : update;

      const safe = Array.isArray(next)
        ? next.map((r) =>
            ensureSourceTouched(
              ensureDeletionFields(ensureIdTs(r))
            )
          )
        : [];

      saveRows(safe);
      return { phrases: safe };
    });
  },

  /* ---------- Add ---------- */

  addPhrase: (row) =>
    set((state) => {
      const safeRow = ensureSourceTouched(
        ensureDeletionFields(
          ensureIdTs({
            ...row,
            Source: "user",
            Touched: true,
          })
        )
      );

      const next = [safeRow, ...state.phrases];
      saveRows(next);
      return { phrases: next };
    }),

  /* ---------- Edit (by index) ---------- */

  saveEditedPhrase: (index, updated) =>
    set((state) => {
      const next = state.phrases.map((r, i) => {
        if (i !== index) return r;

        return ensureSourceTouched(
          ensureDeletionFields(
            markTouched({
              ...ensureIdTs(r),
              ...updated,
              _ts: Date.now(),
            })
          )
        );
      });

      saveRows(next);
      return { phrases: next };
    }),

  /* ---------- Delete (TOMBSTONE) ---------- */

  removePhrase: (index) =>
    set((state) => {
      const next = state.phrases.map((r, i) => {
        if (i !== index) return r;

        return {
          ...r,
          _deleted: true,
          _deleted_ts: Date.now(),
        };
      });

      saveRows(next);
      return { phrases: next };
    }),

  /* ---------- Patch by _id (enrich / async updates) ---------- */

  patchPhraseById: (id, patch) =>
    set((state) => {
      if (!id) return { phrases: state.phrases };

      const next = state.phrases.map((r) => {
        if ((r?._id ?? null) !== id) return r;
        if (r._deleted) return r;

        return ensureSourceTouched(
          ensureDeletionFields(
            markTouched({
              ...r,
              ...patch,
            })
          )
        );
      });

      saveRows(next);
      return { phrases: next };
    }),
}));

// Run migration immediately on load
usePhraseStore.getState()._migrateRows();

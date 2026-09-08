import { create } from "zustand";
import { createAccountStorage, bindAccountActions } from "./accountStorage.js";

const storage = createAccountStorage("lt_scenarios_v1");
const saveScenarios = (rows) => storage.save(rows);

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeTitle(s = "") {
  return String(s).trim().replace(/\s+/g, " ");
}

function ensureScenario(row) {
  const now = Date.now();
  const title = normalizeTitle(row?.title || "");
  const phraseIds = Array.isArray(row?.phraseIds)
    ? row.phraseIds.filter((x) => typeof x === "string" && x.trim())
    : [];

  return {
    id: typeof row?.id === "string" && row.id ? row.id : makeId(),
    title,
    phraseIds,
    createdAt: typeof row?.createdAt === "number" ? row.createdAt : now,
    updatedAt: typeof row?.updatedAt === "number" ? row.updatedAt : now,
    _deleted: row?._deleted === true,
    _deleted_ts:
      row?._deleted === true && typeof row?._deleted_ts === "number"
        ? row._deleted_ts
        : null,
  };
}

function sortScenarios(list) {
  return [...list].sort((a, b) =>
    String(a.title || "").localeCompare(String(b.title || ""), undefined, {
      sensitivity: "base",
    })
  );
}

function activeScenarios(records) {
  return sortScenarios((records || []).filter((row) => row?._deleted !== true));
}

function moveItem(list, fromIndex, toIndex) {
  const arr = Array.isArray(list) ? [...list] : [];
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= arr.length ||
    toIndex >= arr.length
  ) {
    return arr;
  }

  const [moved] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, moved);
  return arr;
}

export const useScenarioStore = create((set, get) => ({
  scenarios: [],
  scenarioRecords: [],
  accountId: null,
  storageError: null,

  setScenarios: (update) => {
    set((state) => {
      const next =
        typeof update === "function" ? update(state.scenarios) : update;

      const active = Array.isArray(next)
        ? sortScenarios(next.map(ensureScenario))
        : [];
      const activeIds = new Set(active.map((row) => row.id));
      const tombstones = (state.scenarioRecords || []).filter(
        (row) => row?._deleted === true && !activeIds.has(row.id)
      );
      const safe = [...active, ...tombstones];

      saveScenarios(safe);
      return { scenarioRecords: safe, scenarios: activeScenarios(safe) };
    });
  },

  setScenarioRecords: (update) => {
    set((state) => {
      const next =
        typeof update === "function" ? update(state.scenarioRecords) : update;
      const safe = Array.isArray(next) ? next.map(ensureScenario) : [];
      saveScenarios(safe);
      return { scenarioRecords: safe, scenarios: activeScenarios(safe) };
    });
  },

  createScenario: (title) => {
    const clean = normalizeTitle(title);
    if (!clean) {
      return { ok: false, error: "Title is required." };
    }

    const existing = get().scenarioRecords || [];
    const dupe = existing.some(
      (s) => s?._deleted !== true && String(s.title || "").toLowerCase() === clean.toLowerCase()
    );

    if (dupe) {
      return { ok: false, error: "A scenario with that title already exists." };
    }

    const nextRow = ensureScenario({
      title: clean,
      phraseIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const next = sortScenarios([nextRow, ...existing]);
    saveScenarios(next);
    set({ scenarioRecords: next, scenarios: activeScenarios(next) });

    return { ok: true, scenario: nextRow };
  },

  renameScenario: (id, title) => {
    const clean = normalizeTitle(title);
    if (!id) {
      return { ok: false, error: "Scenario id is required." };
    }
    if (!clean) {
      return { ok: false, error: "Title is required." };
    }

    const existing = get().scenarioRecords || [];

    const dupe = existing.some(
      (s) =>
        s.id !== id && s?._deleted !== true &&
        String(s.title || "").toLowerCase() === clean.toLowerCase()
    );

    if (dupe) {
      return { ok: false, error: "A scenario with that title already exists." };
    }

    const next = sortScenarios(
      existing.map((s) =>
        s.id === id
          ? ensureScenario({
              ...s,
              title: clean,
              updatedAt: Date.now(),
            })
          : s
      )
    );

    saveScenarios(next);
    set({ scenarioRecords: next, scenarios: activeScenarios(next) });

    return { ok: true };
  },

  deleteScenario: (id) => {
    if (!id) return;

    const now = Date.now();
    const next = (get().scenarioRecords || []).map((s) =>
      s.id === id && s?._deleted !== true
        ? ensureScenario({ ...s, updatedAt: now, _deleted: true, _deleted_ts: now })
        : s
    );
    saveScenarios(next);
    set({ scenarioRecords: next, scenarios: activeScenarios(next) });
  },

  addPhraseToScenario: (scenarioId, phraseId) => {
    if (!scenarioId) {
      return { ok: false, error: "Scenario id is required." };
    }
    if (!phraseId) {
      return { ok: false, error: "Phrase id is required." };
    }

    const existing = get().scenarioRecords || [];
    const target = existing.find((s) => s.id === scenarioId && s?._deleted !== true);

    if (!target) {
      return { ok: false, error: "Scenario not found." };
    }

    if ((target.phraseIds || []).includes(phraseId)) {
      return { ok: false, error: "This phrase is already in that scenario." };
    }

    const next = sortScenarios(
      existing.map((s) =>
        s.id === scenarioId
          ? ensureScenario({
              ...s,
              phraseIds: [...(s.phraseIds || []), phraseId],
              updatedAt: Date.now(),
            })
          : s
      )
    );

    saveScenarios(next);
    set({ scenarioRecords: next, scenarios: activeScenarios(next) });

    return { ok: true };
  },

  removePhraseFromScenario: (scenarioId, phraseId) => {
    if (!scenarioId) {
      return { ok: false, error: "Scenario id is required." };
    }
    if (!phraseId) {
      return { ok: false, error: "Phrase id is required." };
    }

    const existing = get().scenarioRecords || [];
    const target = existing.find((s) => s.id === scenarioId && s?._deleted !== true);

    if (!target) {
      return { ok: false, error: "Scenario not found." };
    }

    const currentIds = Array.isArray(target.phraseIds) ? target.phraseIds : [];
    if (!currentIds.includes(phraseId)) {
      return { ok: false, error: "Phrase is not in this scenario." };
    }

    const next = sortScenarios(
      existing.map((s) =>
        s.id === scenarioId
          ? ensureScenario({
              ...s,
              phraseIds: currentIds.filter((id) => id !== phraseId),
              updatedAt: Date.now(),
            })
          : s
      )
    );

    saveScenarios(next);
    set({ scenarioRecords: next, scenarios: activeScenarios(next) });

    return { ok: true };
  },

  reorderPhraseInScenario: (scenarioId, fromIndex, toIndex) => {
    if (!scenarioId) {
      return { ok: false, error: "Scenario id is required." };
    }

    const existing = get().scenarioRecords || [];
    const target = existing.find((s) => s.id === scenarioId && s?._deleted !== true);

    if (!target) {
      return { ok: false, error: "Scenario not found." };
    }

    const currentIds = Array.isArray(target.phraseIds) ? target.phraseIds : [];

    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= currentIds.length ||
      toIndex >= currentIds.length
    ) {
      return { ok: false, error: "Invalid reorder indexes." };
    }

    if (fromIndex === toIndex) {
      return { ok: true };
    }

    const nextIds = moveItem(currentIds, fromIndex, toIndex);

    const next = sortScenarios(
      existing.map((s) =>
        s.id === scenarioId
          ? ensureScenario({
              ...s,
              phraseIds: nextIds,
              updatedAt: Date.now(),
            })
          : s
      )
    );

    saveScenarios(next);
    set({ scenarioRecords: next, scenarios: activeScenarios(next) });

    return { ok: true };
  },
}));

const actions = Object.fromEntries(Object.entries(useScenarioStore.getState()).filter(([, value]) => typeof value === "function"));

export function selectScenarioAccount(userId) {
  let scenarioRecords = [];
  let storageError = null;
  try { scenarioRecords = storage.select(userId).map(ensureScenario); }
  catch (error) { storageError = error?.message || "Could not read your saved scenarios."; }
  useScenarioStore.setState({
    scenarioRecords,
    scenarios: activeScenarios(scenarioRecords),
    accountId: userId || null,
    storageError,
    ...bindAccountActions(actions, storage),
  });
}

selectScenarioAccount(null);

// src/stores/scenarioStore.js
import { create } from "zustand";

const LS_KEY = "lt_scenarios_v1";

function loadScenarios() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveScenarios(rows) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rows));
  } catch (err) {
    console.error("Failed saving scenarios", err);
  }
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function normalizeTitle(s = "") {
  return String(s).trim().replace(/\s+/g, " ");
}

function ensureScenario(row) {
  const now = Date.now();
  const title = normalizeTitle(row?.title || "");

  return {
    id: typeof row?.id === "string" && row.id ? row.id : makeId(),
    title,
    createdAt:
      typeof row?.createdAt === "number" ? row.createdAt : now,
    updatedAt:
      typeof row?.updatedAt === "number" ? row.updatedAt : now,
  };
}

function sortScenarios(list) {
  return [...list].sort((a, b) =>
    String(a.title || "").localeCompare(String(b.title || ""), undefined, {
      sensitivity: "base",
    })
  );
}

export const useScenarioStore = create((set, get) => ({
  scenarios: sortScenarios(loadScenarios()),

  setScenarios: (update) => {
    set((state) => {
      const next =
        typeof update === "function" ? update(state.scenarios) : update;

      const safe = Array.isArray(next)
        ? sortScenarios(next.map(ensureScenario))
        : [];

      saveScenarios(safe);
      return { scenarios: safe };
    });
  },

  createScenario: (title) => {
    const clean = normalizeTitle(title);
    if (!clean) {
      return { ok: false, error: "Title is required." };
    }

    const existing = get().scenarios || [];
    const dupe = existing.some(
      (s) => String(s.title || "").toLowerCase() === clean.toLowerCase()
    );

    if (dupe) {
      return { ok: false, error: "A scenario with that title already exists." };
    }

    const nextRow = ensureScenario({
      title: clean,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const next = sortScenarios([nextRow, ...existing]);
    saveScenarios(next);
    set({ scenarios: next });

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

    const existing = get().scenarios || [];

    const dupe = existing.some(
      (s) =>
        s.id !== id &&
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
    set({ scenarios: next });

    return { ok: true };
  },

  deleteScenario: (id) => {
    if (!id) return;

    const next = (get().scenarios || []).filter((s) => s.id !== id);
    saveScenarios(next);
    set({ scenarios: next });
  },
}));
import { usePhraseStore } from "./phraseStore.js";
import { useScenarioStore } from "./scenarioStore.js";

const OWNER = "zodis_legacy_library_owner_v1";
const DONE = "zodis_legacy_library_recovered_v1";

function readArray(key) {
  const raw = localStorage.getItem(key);
  const rows = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(rows)) throw new Error("Previous data could not be read. The original copy has been preserved.");
  return rows;
}

export function hasRecoverableLibrary(userId) {
  if (!userId) return false;
  try {
    const owner = localStorage.getItem(OWNER);
    if ((owner && owner !== userId) || localStorage.getItem(DONE)) return false;
    return readArray("lt_phrasebook_v3").length > 0 || readArray("lt_scenarios_v1").length > 0;
  } catch { return true; } // Keep the recovery entry point visible; never discard unreadable data.
}

export function recoverLegacyLibrary(userId) {
  const phrases = usePhraseStore.getState();
  const scenarios = useScenarioStore.getState();
  if (!userId || phrases.accountId !== userId || scenarios.accountId !== userId) {
    throw new Error("Your account changed. Please retry from the current account.");
  }
  const owner = localStorage.getItem(OWNER);
  if (owner && owner !== userId) throw new Error("Previous data has already been assigned to another account.");
  if (localStorage.getItem(DONE)) return;
  const oldPhrases = readArray("lt_phrasebook_v3");
  const oldScenarios = readArray("lt_scenarios_v1");
  // Preserve existing entries and IDs so collections keep their phrase links.
  const mergedPhrases = [...phrases.phrases];
  for (const row of oldPhrases) {
    const existing = row._id && mergedPhrases.find((r) => r._id === row._id);
    if (existing && existing.Lithuanian !== row.Lithuanian) {
      throw new Error("A previous phrase conflicts with this library. Nothing was replaced; please contact support for recovery.");
    }
    if (!existing) mergedPhrases.push(row);
  }
  const mergedScenarios = [...scenarios.scenarios];
  for (const row of oldScenarios) {
    if (!mergedScenarios.some((s) => s.id === row.id)) mergedScenarios.push(row);
  }
  // Reserve ownership before writing. A failed write remains retryable by this
  // account; the original arrays remain untouched as the recovery copy.
  localStorage.setItem(OWNER, userId);
  phrases.setPhrases(mergedPhrases);
  scenarios.setScenarios(mergedScenarios);
  localStorage.setItem(DONE, userId);
}

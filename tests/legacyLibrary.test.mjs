import test from "node:test";
import assert from "node:assert/strict";
import { usePhraseStore, selectPhraseAccount } from "../src/stores/phraseStore.js";
import { useScenarioStore, selectScenarioAccount } from "../src/stores/scenarioStore.js";
import { hasRecoverableLibrary, recoverLegacyLibrary } from "../src/stores/legacyLibrary.js";

const memory = new Map();
let failScenarios = false;
globalThis.localStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => {
    if (failScenarios && key.includes("lt_scenarios_v1:account:")) throw new Error("Storage full");
    memory.set(key, value);
  },
};

test("explicit recovery preserves identities and existing data, and can retry a partial failure", () => {
  const legacy = JSON.stringify([{ _id: "old", Lithuanian: "Labas" }]);
  memory.set("lt_phrasebook_v3", legacy);
  memory.set("lt_scenarios_v1", JSON.stringify([{ id: "old-list", title: "My phrases", phraseIds: ["old"] }]));
  selectPhraseAccount("A");
  selectScenarioAccount("A");
  usePhraseStore.getState().addPhrase({ _id: "new", Lithuanian: "Ačiū" });
  assert.equal(hasRecoverableLibrary("A"), true);
  failScenarios = true;
  assert.throws(() => recoverLegacyLibrary("A"), /Storage full/);
  assert.equal(memory.get("lt_phrasebook_v3"), legacy);
  assert.equal(hasRecoverableLibrary("A"), true);
  assert.equal(hasRecoverableLibrary("B"), false);
  failScenarios = false;
  recoverLegacyLibrary("A");
  assert.deepEqual(usePhraseStore.getState().phrases.map((r) => r._id), ["new", "old"]);
  assert.deepEqual(useScenarioStore.getState().scenarios[0].phraseIds, ["old"]);
  assert.equal(hasRecoverableLibrary("A"), false);
  selectPhraseAccount("B");
  selectScenarioAccount("B");
  assert.throws(() => recoverLegacyLibrary("B"), /another account/);
  assert.deepEqual(usePhraseStore.getState().phrases, []);
});

import test from "node:test";
import assert from "node:assert/strict";
import { usePhraseStore, selectPhraseAccount } from "../src/stores/phraseStore.js";
import { useScenarioStore, selectScenarioAccount } from "../src/stores/scenarioStore.js";

const memory = new Map();
let failWrites = false;
globalThis.localStorage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => {
    if (failWrites) throw new Error("Storage is full");
    memory.set(key, value);
  },
};

test("accounts cannot see each other's phrases or collections; late writes stay rejected after A → B → A", () => {
  const legacy = JSON.stringify([{ _id: "legacy", Lithuanian: "Senas" }]);
  memory.set("lt_phrasebook_v3", legacy);
  selectPhraseAccount("A");
  selectScenarioAccount("A");
  assert.deepEqual(usePhraseStore.getState().phrases, []);
  usePhraseStore.getState().addPhrase({ _id: "a", Lithuanian: "Labas" });
  const lateWrite = usePhraseStore.getState().setPhrases;
  const collection = useScenarioStore.getState().createScenario("Café").scenario;
  useScenarioStore.getState().addPhraseToScenario(collection.id, "a");
  selectPhraseAccount(null);
  selectScenarioAccount(null);
  assert.deepEqual(usePhraseStore.getState().phrases, []);
  assert.throws(() => lateWrite([]), /account changed/);
  selectPhraseAccount("B");
  selectScenarioAccount("B");
  assert.deepEqual(usePhraseStore.getState().phrases, []);
  assert.deepEqual(useScenarioStore.getState().scenarios, []);
  usePhraseStore.getState().addPhrase({ _id: "b", Lithuanian: "Ačiū" });
  assert.throws(() => lateWrite([]), /account changed/);
  selectPhraseAccount("A");
  selectScenarioAccount("A");
  assert.equal(usePhraseStore.getState().phrases[0]._id, "a");
  assert.deepEqual(useScenarioStore.getState().scenarios[0].phraseIds, ["a"]);
  assert.throws(() => lateWrite([]), /account changed/);
  assert.equal(memory.get("lt_phrasebook_v3"), legacy);
});

test("a failed save does not update memory; corrupt stored data is not overwritten", () => {
  selectPhraseAccount("A");
  const before = usePhraseStore.getState().phrases;
  failWrites = true;
  assert.throws(() => usePhraseStore.getState().setPhrases([]), /Storage is full/);
  assert.equal(usePhraseStore.getState().phrases, before);
  failWrites = false;
  memory.set("lt_phrasebook_v3:account:broken", "not json");
  selectPhraseAccount("broken");
  assert.ok(usePhraseStore.getState().storageError);
  assert.deepEqual(usePhraseStore.getState().phrases, []);
  assert.throws(() => usePhraseStore.getState().setPhrases([]), /unavailable/);
  assert.equal(memory.get("lt_phrasebook_v3:account:broken"), "not json");
});

import test from "node:test";
import assert from "node:assert/strict";
import { mergeUserScenarios } from "../src/stores/mergeUserScenarios.js";
import { createCloudLearningLibrary } from "../src/stores/cloudLibrary.js";

const row = (overrides = {}) => ({
  id: "cafe",
  title: "Café",
  phraseIds: ["hello"],
  createdAt: 1,
  updatedAt: 1,
  _deleted: false,
  _deleted_ts: null,
  ...overrides,
});

test("scenario merge keeps additions and uses the latest ordered record", () => {
  const result = mergeUserScenarios(
    [row({ updatedAt: 20, phraseIds: ["hello", "coffee"] }), row({ id: "local", title: "Local" })],
    [row({ updatedAt: 10, phraseIds: ["hello"] }), row({ id: "cloud", title: "Cloud" })]
  );
  assert.deepEqual(result.mergedRows.find((item) => item.id === "cafe").phraseIds, ["hello", "coffee"]);
  assert.deepEqual(result.mergedRows.map((item) => item.id), ["cafe", "cloud", "local"]);
});

test("a newer deletion wins and an older deletion does not resurrect over a newer edit", () => {
  const deleted = row({ updatedAt: 30, _deleted: true, _deleted_ts: 30 });
  assert.equal(mergeUserScenarios([deleted], [row({ updatedAt: 20 })]).mergedRows[0]._deleted, true);
  assert.equal(mergeUserScenarios([deleted], [row({ updatedAt: 40, title: "Edited" })]).mergedRows[0].title, "Edited");
  assert.equal(mergeUserScenarios([deleted], [row({ updatedAt: 40, title: "Edited" })]).mergedRows[0]._deleted, false);
});

test("scenario merge rejects missing and duplicate identities", () => {
  assert.throws(() => mergeUserScenarios([{ title: "No ID" }], []), /stable ID/);
  assert.throws(() => mergeUserScenarios([row(), row()], []), /duplicate ID/);
});

test("combined cloud replacement submits phrases, scenarios and the expected revision", async () => {
  const account = { id: "A", version: 1 };
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return name === "zodis_learning_snapshot"
      ? { data: { phrases: [], scenarios: [], revision: "r1" } }
      : { data: { phrases: [{ _id: "p" }], scenarios: [row()], revision: "r2" } };
  } };
  const cloud = createCloudLearningLibrary(client, () => account);
  assert.equal((await cloud.read(account)).revision, "r1");
  await cloud.replace([{ _id: "p" }], [row()], "r1", account);
  assert.deepEqual(calls[1], {
    name: "zodis_replace_learning_snapshot",
    args: { p_phrases: [{ _id: "p" }], p_scenarios: [row()], p_expected_revision: "r1" },
  });
});

test("combined cloud reads reject incomplete data and stale account responses", async () => {
  const account = { id: "A", version: 1 };
  const incomplete = createCloudLearningLibrary(
    { rpc: async () => ({ data: { phrases: [], revision: "r" } }) },
    () => account
  );
  await assert.rejects(incomplete.read(account), /incomplete/);

  let current = account;
  let resolve;
  const delayed = createCloudLearningLibrary(
    { rpc: () => new Promise((done) => { resolve = done; }) },
    () => current
  );
  const reading = delayed.read(account);
  current = { id: "A", version: 2 };
  resolve({ data: { phrases: [], scenarios: [], revision: "r" } });
  await assert.rejects(reading, /account changed/);
});

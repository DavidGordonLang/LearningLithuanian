import test from "node:test";
import assert from "node:assert/strict";
import { createCloudLibrary } from "../src/stores/cloudLibrary.js";

test("cloud replacement carries a revision and never falls back to destructive calls", async () => {
  const account = { id: "A", version: 1 };
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { error: { code: "40001", message: "changed" } };
  } };
  const cloud = createCloudLibrary(client, () => account);
  await assert.rejects(cloud.replace([{ _id: "one" }], "revision-one", account), /another device/);
  assert.deepEqual(calls, [{ name: "zodis_replace_phrase_snapshot", args: { p_rows: [{ _id: "one" }], p_expected_revision: "revision-one" } }]);
});

test("a read returning after an account switch cannot be used, including A → B → A", async () => {
  let account = { id: "A", version: 1 };
  let resolve;
  const cloud = createCloudLibrary({ rpc: () => new Promise((r) => { resolve = r; }) }, () => account);
  const reading = cloud.read(account);
  account = { id: "A", version: 3 };
  resolve({ data: { rows: [{ _id: "A-only" }], revision: "old" } });
  await assert.rejects(reading, /account changed/);
});

test("an incomplete snapshot or missing migration cannot trigger replacement", async () => {
  const account = { id: "A", version: 1 };
  const incomplete = createCloudLibrary({ rpc: async () => ({ data: { rows: [] } }) }, () => account);
  await assert.rejects(incomplete.read(account), /incomplete/);
  const missing = createCloudLibrary({ rpc: async () => ({ error: { message: "Function not found" } }) }, () => account);
  await assert.rejects(missing.read(account), /Function not found/);
  await assert.rejects(missing.replace([], undefined, account), /before replacing/);
});

test("the RPC client is bound to the captured account credentials", async () => {
  const account = { id: "A", version: 1, accessToken: "synthetic-token-A" };
  let captured;
  const cloud = createCloudLibrary((owner) => {
    captured = owner;
    return { rpc: async () => ({ data: { rows: [], revision: "empty" } }) };
  }, () => account);
  await cloud.read(account);
  assert.equal(captured, account);
  assert.equal(captured.accessToken, "synthetic-token-A");
});

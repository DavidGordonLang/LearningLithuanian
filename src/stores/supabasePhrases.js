// src/stores/supabasePhrases.js
import { createAccountClient } from "../supabaseClient";
import { useAuthStore } from "./authStore";
import { mergeUserPhrases as mergeEngine } from "./mergeUserPhrases";
import { createCloudLibrary } from "./cloudLibrary.js";

export function captureSyncAccount() {
  const state = useAuthStore.getState();
  return { id: state.user?.id, version: state._accountVersion, accessToken: state.session?.access_token };
}

const cloud = createCloudLibrary((account) => createAccountClient(account.accessToken), captureSyncAccount);
export const fetchCloudRecovery = (account = captureSyncAccount()) => cloud.readForRecovery(account);
export const assertSyncAccount = cloud.assertAccount;
export const fetchUserSnapshot = (account = captureSyncAccount()) => cloud.read(account);

export async function replaceUserPhrases(rows, revision, account = captureSyncAccount()) {
  return cloud.replace(rows, revision, account);
}

/**
 * Fetch ALL phrases for the current user
 * (cloud → local)
 */
export async function fetchUserPhrases(account = captureSyncAccount()) {
  return (await cloud.read(account)).rows;
}

/**
 * Merge local rows with cloud rows (SAFE; returns conflicts + stats)
 *
 * Behaviour:
 * - Fetch cloud
 * - Run pure merge engine
 * - If conflicts exist: DO NOT write to cloud (yet) — return conflicts for UI resolution
 * - If no conflicts: write merged set back to cloud (full replace), return result
 *
 * NOTE:
 * Persisting unresolved conflicts server-side is a later step (schema + UI).
 */
export async function mergeUserPhrases(localRows, account = captureSyncAccount()) {
  const { rows: cloudRows, revision } = await cloud.read(account);

  const { mergedRows, conflicts, stats } = mergeEngine(localRows, cloudRows);

  // If conflicts exist, don't write merged result yet.
  // (Later: we’ll persist conflicts to Supabase so they show up on future merges.)
  if (conflicts.length) {
    return { mergedRows, conflicts, stats, revision, account, wroteToCloud: false };
  }

  await cloud.replace(mergedRows, revision, account);

  return { mergedRows, conflicts, stats, wroteToCloud: true };
}

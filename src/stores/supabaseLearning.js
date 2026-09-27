import { createAccountClient } from "../supabaseClient";
import { createCloudLearningLibrary } from "./cloudLibrary.js";
import { mergeUserPhrases as mergePhrases } from "./mergeUserPhrases.js";
import { mergeUserScenarios as mergeScenarios } from "./mergeUserScenarios.js";
import { captureSyncAccount } from "./supabasePhrases.js";

const cloud = createCloudLearningLibrary(
  (account) => createAccountClient(account.accessToken),
  captureSyncAccount
);

export const assertLearningSyncAccount = cloud.assertAccount;
export const fetchLearningSnapshot = (account = captureSyncAccount()) => cloud.read(account);
export const replaceUserLearningSnapshot = (
  phrases,
  scenarios,
  revision,
  account = captureSyncAccount()
) => cloud.replace(phrases, scenarios, revision, account);

export async function mergeUserLearningSnapshot(
  localPhrases,
  localScenarios,
  account = captureSyncAccount()
) {
  const snapshot = await cloud.read(account);
  const phraseResult = mergePhrases(localPhrases, snapshot.phrases);
  const scenarioResult = mergeScenarios(localScenarios, snapshot.scenarios);

  if (phraseResult.conflicts.length) {
    return {
      mergedPhrases: phraseResult.mergedRows,
      mergedScenarios: scenarioResult.mergedRows,
      conflicts: phraseResult.conflicts,
      phraseStats: phraseResult.stats,
      scenarioStats: scenarioResult.stats,
      revision: snapshot.revision,
      wroteToCloud: false,
    };
  }

  await cloud.replace(
    phraseResult.mergedRows,
    scenarioResult.mergedRows,
    snapshot.revision,
    account
  );

  return {
    mergedPhrases: phraseResult.mergedRows,
    mergedScenarios: scenarioResult.mergedRows,
    conflicts: [],
    phraseStats: phraseResult.stats,
    scenarioStats: scenarioResult.stats,
    wroteToCloud: true,
  };
}

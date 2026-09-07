// The server replaces the whole snapshot atomically and rejects stale revisions.
// Deliberately no delete/insert fallback when the migration is unavailable.
export function createCloudLibrary(client, getAccount) {
  const assertAccount = (account) => {
    const current = getAccount();
    if (!account?.id || current?.id !== account.id || current?.version !== account.version) {
      throw new Error("Your account changed. Please retry sync from the current account.");
    }
  };
  const read = async (account) => {
    assertAccount(account);
    const requestClient = typeof client === "function" ? client(account) : client;
    const { data, error } = await requestClient.rpc("zodis_phrase_snapshot");
    assertAccount(account);
    if (error) throw new Error(error.message || "Could not read the cloud library.");
    if (!Array.isArray(data?.rows) || typeof data?.revision !== "string") throw new Error("The cloud library response was incomplete. Nothing was replaced.");
    return data;
  };
  const replace = async (rows, revision, account) => {
    assertAccount(account);
    if (!Array.isArray(rows) || typeof revision !== "string") throw new Error("Read the cloud library before replacing it.");
    const requestClient = typeof client === "function" ? client(account) : client;
    const { data, error } = await requestClient.rpc("zodis_replace_phrase_snapshot", {
      p_rows: rows,
      p_expected_revision: revision,
    });
    assertAccount(account);
    if (error) {
      if (error.code === "40001") throw new Error("Your cloud library changed on another device. Please sync again to review the latest entries.");
      throw new Error(error.message || "Cloud save failed. The previous cloud library has been preserved.");
    }
    return data;
  };
  return { read, replace, assertAccount };
}

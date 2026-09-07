export const SYNC_SETUP_MESSAGE = "Cloud sync setup is not complete for this preview. You can load cloud phrases onto this device below; uploading and merging will be available after setup.";
function cloudError(error) {
  const missing = error?.code === "PGRST202" || error?.code === "42883";
  return Object.assign(new Error(missing ? SYNC_SETUP_MESSAGE : error?.message || "Cloud request failed"), { code: missing ? "SYNC_SETUP_REQUIRED" : error?.code });
}
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
    if (error) throw cloudError(error);
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
      throw cloudError(error);
    }
    return data;
  };
  const readForRecovery = async (account) => {
    assertAccount(account);
    const requestClient = typeof client === "function" ? client(account) : client;
    // Existing table contract; count prevents silently importing a server-capped result.
    const { data, count, error } = await requestClient.from("phrases")
      .select("data", { count: "exact" }).eq("user_id", account.id);
    assertAccount(account);
    if (error) throw cloudError(error);
    if (!Array.isArray(data) || !Number.isInteger(count) || count !== data.length) {
      throw new Error("The full cloud library could not be downloaded. Nothing was changed. Database setup is needed to load this library safely.");
    }
    const rows = data.map((entry) => entry.data);
    if (rows.some((row) => !row || typeof row !== "object" || !(row._id || row.id))) {
      throw new Error("The cloud library contains entries without an identity. Nothing was changed.");
    }
    return rows;
  };
  return { read, replace, readForRecovery, assertAccount };
}

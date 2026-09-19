function normalizeScenario(row) {
  if (!row || typeof row !== "object" || typeof row.id !== "string" || !row.id.trim()) {
    throw new Error("Each scenario must have a stable ID.");
  }

  const updatedAt = typeof row.updatedAt === "number" ? row.updatedAt : 0;
  const deleted = row._deleted === true;
  return {
    ...row,
    id: row.id,
    title: typeof row.title === "string" ? row.title.trim() : "",
    phraseIds: Array.isArray(row.phraseIds)
      ? [...new Set(row.phraseIds.filter((id) => typeof id === "string" && id.trim()))]
      : [],
    createdAt: typeof row.createdAt === "number" ? row.createdAt : updatedAt,
    updatedAt,
    _deleted: deleted,
    _deleted_ts:
      deleted && typeof row._deleted_ts === "number"
        ? row._deleted_ts
        : null,
  };
}

function versionOf(row) {
  if (row._deleted === true && typeof row._deleted_ts === "number") {
    return Math.max(row.updatedAt || 0, row._deleted_ts);
  }
  return row.updatedAt || 0;
}

function indexById(rows, label) {
  const result = new Map();
  for (const input of Array.isArray(rows) ? rows : []) {
    const row = normalizeScenario(input);
    if (result.has(row.id)) {
      throw new Error(`${label} scenarios contain a duplicate ID.`);
    }
    result.set(row.id, row);
  }
  return result;
}

// Scenario edits are intentionally merged as one ordered record. A title,
// removal, or reorder is meaningful as a whole; combining phrase arrays can
// silently undo a removal. The latest record therefore wins by updatedAt.
export function mergeUserScenarios(localRows, cloudRows) {
  const local = indexById(localRows, "Local");
  const cloud = indexById(cloudRows, "Cloud");
  const ids = new Set([...local.keys(), ...cloud.keys()]);
  const mergedRows = [];
  const stats = { localCount: local.size, cloudCount: cloud.size, matched: 0, mergedCount: 0 };

  for (const id of ids) {
    const localRow = local.get(id);
    const cloudRow = cloud.get(id);
    let chosen;

    if (!localRow) chosen = cloudRow;
    else if (!cloudRow) chosen = localRow;
    else {
      stats.matched += 1;
      const localVersion = versionOf(localRow);
      const cloudVersion = versionOf(cloudRow);
      chosen = cloudVersion > localVersion ? cloudRow : localRow;
    }

    mergedRows.push(chosen);
  }

  mergedRows.sort((a, b) => a.id.localeCompare(b.id));
  stats.mergedCount = mergedRows.length;
  return { mergedRows, stats };
}

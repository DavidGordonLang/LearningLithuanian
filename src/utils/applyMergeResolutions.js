// src/utils/applyMergeResolutions.js

function put(map, key, value) {
  if (!key) return;
  if (!map.has(key)) map.set(key, value);
}

export default function applyMergeResolutions(mergedRows, conflicts, resolutions) {
  if (!Array.isArray(mergedRows) || !Array.isArray(conflicts)) return mergedRows || [];

  const resolutionMap = resolutions || {};

  // Conflicts map back to rows primarily by _id (conflict.key is aligned to row._id)
  // Add safe fallbacks by contentKey as well (does not create new rows).
  const conflictMap = new Map();
  for (const c of conflicts) {
    if (!c) continue;
    put(conflictMap, c.key, c);
    put(conflictMap, c.local?._id, c);
    put(conflictMap, c.cloud?._id, c);
    put(conflictMap, c.local?.contentKey, c);
    put(conflictMap, c.cloud?.contentKey, c);
  }

  return mergedRows.map((row) => {
    if (!row) return row;

    const rowKey = row._id || row.contentKey;
    const conflict = conflictMap.get(rowKey);
    if (!conflict) return row;

    const key = conflict.key || conflict.local?._id || conflict.cloud?._id || rowKey;
    const resolution = resolutionMap[key] || {};

    // delete_vs_edit: choose entire row side, but keep identity + tombstone semantics safe
    if (conflict.type === "delete_vs_edit") {
      const pick = resolution.pick;
      const chosen = pick === "cloud" ? conflict.cloud : conflict.local;
      if (!chosen) return row;

      // Keep merged row as base; overlay chosen values.
      // Never invent blanks; preserve identity & tombstone fields unless explicitly present.
      const next = { ...row, ...chosen };

      // Ensure identity is preserved
      next._id = row._id || chosen._id || next._id;
      next.contentKey = row.contentKey || chosen.contentKey || next.contentKey;

      // Preserve timestamps/tombstones carefully
      if (typeof row._deleted === "boolean") next._deleted = row._deleted;
      if (typeof row._deleted_ts === "number") next._deleted_ts = row._deleted_ts;
      if (typeof row._ts === "number") next._ts = row._ts;

      if (typeof chosen._deleted === "boolean") next._deleted = chosen._deleted;
      if (typeof chosen._deleted_ts === "number") next._deleted_ts = chosen._deleted_ts;
      if (typeof chosen._ts === "number") next._ts = chosen._ts;

      return next;
    }

    // field_conflict: per-field pick between local/cloud/chosen (auto-merge)
    if (conflict.type === "field_conflict") {
      const next = { ...row };
      const fields = resolution.fields || {};

      for (const f of conflict.fields || []) {
        const pick = fields[f.field];

        if (pick === "local") {
          if (f.local !== undefined && f.local !== null) next[f.field] = f.local;
        } else if (pick === "cloud") {
          if (f.cloud !== undefined && f.cloud !== null) next[f.field] = f.cloud;
        } else if (pick === "chosen") {
          if (f.chosen !== undefined && f.chosen !== null) next[f.field] = f.chosen;
        }
        // If nothing chosen / missing values, leave existing next[f.field] untouched.
      }

      // Re-assert identity fields
      if (!next._id) next._id = row._id || conflict.local?._id || conflict.cloud?._id;
      if (!next.contentKey) {
        next.contentKey =
          row.contentKey || conflict.local?.contentKey || conflict.cloud?.contentKey;
      }

      return next;
    }

    return row;
  });
}

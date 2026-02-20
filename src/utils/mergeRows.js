// src/utils/mergeRows.js

/**
 * Structured row merge with latent conflict detection.
 * Deterministic today, conflict-aware tomorrow.
 */

/**
 * @typedef {Object} MergeResult
 * @property {Array} rows
 * @property {Array} conflicts
 */

export function mergeRows(localRows = [], incomingRows = []) {
  const byKey = new Map();
  const conflicts = [];

  // Seed with local rows first (local has precedence)
  for (const row of localRows) {
    if (!row?.contentKey) continue;
    byKey.set(row.contentKey, row);
  }

  for (const incoming of incomingRows) {
    if (!incoming?.contentKey) continue;

    const key = incoming.contentKey;
    const existing = byKey.get(key);

    // No existing → accept incoming
    if (!existing) {
      byKey.set(key, incoming);
      continue;
    }

    // ----- Deletion logic -----
    if (existing._deleted || incoming._deleted) {
      const chosen =
        (incoming._deleted_ts || 0) > (existing._deleted_ts || 0)
          ? incoming
          : existing;

      byKey.set(key, chosen);
      continue;
    }

    // ----- Ownership logic -----
    const existingIsUser = existing.Source === "user" || existing.Touched;
    const incomingIsUser = incoming.Source === "user" || incoming.Touched;

    // User always beats starter
    if (existingIsUser && !incomingIsUser) {
      continue;
    }

    if (!existingIsUser && incomingIsUser) {
      byKey.set(key, incoming);
      continue;
    }

    // ----- Both starter -----
    if (!existingIsUser && !incomingIsUser) {
      // Keep the newer starter (rare, but deterministic)
      const chosen = (incoming._ts || 0) > (existing._ts || 0) ? incoming : existing;

      byKey.set(key, chosen);
      continue;
    }

    // ----- Both user-owned -----
    // Potential conflict
    const fieldsDiffer =
      existing.English !== incoming.English ||
      existing.Lithuanian !== incoming.Lithuanian ||
      existing.Usage !== incoming.Usage ||
      existing.Notes !== incoming.Notes ||
      existing.Phonetic !== incoming.Phonetic ||
      // ✅ include IPA
      existing.PhoneticIPA !== incoming.PhoneticIPA ||
      existing.Category !== incoming.Category ||
      existing["RAG Icon"] !== incoming["RAG Icon"];

    if (fieldsDiffer) {
      conflicts.push({
        contentKey: key,
        local: existing,
        incoming,
        resolvedBy: "timestamp",
      });
    }

    // Deterministic resolution for now: newer wins
    const chosen =
      (incoming._ts || 0) > (existing._ts || 0) ? incoming : existing;

    byKey.set(key, chosen);
  }

  return {
    rows: Array.from(byKey.values()),
    conflicts,
  };
}
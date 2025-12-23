// src/utils/mergeRows.js

/**
 * Deterministic merge for phrase rows.
 *
 * Rules (current):
 * - contentKey is the identity
 * - _deleted always wins
 * - user > starter
 * - newer _ts wins between equals
 * - starter never overwrites user-edited rows
 * - no conflicts are raised (yet)
 *
 * This function is intentionally conservative and predictable.
 */

/**
 * Decide which of two rows wins.
 * Both rows MUST have the same contentKey.
 */
function resolveRow(a, b) {
  // 1. Deletion always wins
  if (a._deleted && !b._deleted) return a;
  if (b._deleted && !a._deleted) return b;
  if (a._deleted && b._deleted) {
    return (a._deleted_ts || 0) >= (b._deleted_ts || 0) ? a : b;
  }

  // 2. User beats starter
  const aIsUser = a.Source === "user";
  const bIsUser = b.Source === "user";

  if (aIsUser && !bIsUser) return a;
  if (bIsUser && !aIsUser) return b;

  // 3. Both same class → newest timestamp wins
  return (a._ts || 0) >= (b._ts || 0) ? a : b;
}

/**
 * Merge two row arrays.
 *
 * @param {Array} localRows  - existing rows (local)
 * @param {Array} incomingRows - rows from import / cloud / starter
 *
 * @returns {Array} merged rows
 */
export function mergeRows(localRows = [], incomingRows = []) {
  const byKey = new Map();

  // Seed with local rows first
  for (const row of localRows) {
    if (!row || !row.contentKey) continue;
    byKey.set(row.contentKey, row);
  }

  // Merge incoming rows
  for (const incoming of incomingRows) {
    if (!incoming || !incoming.contentKey) continue;

    const existing = byKey.get(incoming.contentKey);

    if (!existing) {
      // New identity
      byKey.set(incoming.contentKey, incoming);
      continue;
    }

    // Resolve deterministically
    const resolved = resolveRow(existing, incoming);
    byKey.set(incoming.contentKey, resolved);
  }

  return Array.from(byKey.values());
}

// src/stores/mergeUserPhrases.js

/**
 * Pure merge engine for Žodis phrases.
 *
 * Inputs: localRows[], cloudRows[]
 * Output:
 * {
 *   mergedRows: Phrase[],
 *   conflicts: Conflict[],
 *   stats: {...}
 * }
 *
 * Alignment notes (Dec 2025):
 * - Primary identity is _id when present on both sides.
 * - Secondary identity is contentKey, which MUST match phraseStore.js:
 *     contentKey = normalize(Lithuanian)   (Lithuanian-only)
 * - If a row already has contentKey (from phraseStore), we trust it.
 * - Deletions are tombstones: _deleted=true + _deleted_ts (number).
 * - We never overwrite meaningful data with blanks / placeholders.
 * - If both sides have meaningful, different values for the same field, we surface a conflict.
 */

const PLACEHOLDERS = new Set(["nan", "null", "nul", "none", "n/a", "na", ""]);

/* --------------------------- Meaningfulness --------------------------- */

function isMeaningful(v) {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  if (!s) return false;
  return !PLACEHOLDERS.has(s.toLowerCase());
}

function meaningfulText(v) {
  const s = (v ?? "").toString().trim();
  return isMeaningful(s) ? s : "";
}

/* --------------------------- Guards --------------------------- */

function ensureDeletionFields(r) {
  const out = { ...(r || {}) };
  if (out._deleted !== true) {
    out._deleted = false;
    out._deleted_ts = null;
  } else if (typeof out._deleted_ts !== "number") {
    out._deleted_ts = Date.now();
  }
  return out;
}

function ensureIdTs(r) {
  const out = { ...(r || {}) };
  if (!out._id || typeof out._id !== "string")
    out._id = Math.random().toString(36).slice(2);
  if (!out._ts || typeof out._ts !== "number") out._ts = Date.now();
  return out;
}

/* --------------------------- Key normalisation --------------------------- */

/**
 * Remove Lithuanian diacritics & normalise to a safe ASCII-ish key.
 * This must mirror phraseStore.js normalization behaviour as closely as possible.
 */
function normaliseForKey(input) {
  let s = (input ?? "").toString().trim().toLowerCase();
  if (!s) return "";

  // Unicode NFD + strip combining marks
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Remove punctuation/symbols/spaces entirely for compact key
  s = s.replace(/[^a-z0-9]+/g, "");

  return s;
}

/**
 * Secondary identity: Lithuanian-only content key.
 * IMPORTANT:
 * - We do NOT use English for identity.
 * - We do NOT include Sheet/Category for identity.
 * - Prefer row.contentKey when present (phraseStore is source of truth).
 */
export function makeContentKeyFromRow(row) {
  const existing = row?.contentKey;
  if (typeof existing === "string" && existing.trim()) return existing.trim();

  const lt = meaningfulText(row?.Lithuanian);
  if (!lt) return "";

  return normaliseForKey(lt);
}

/* --------------------------- Merge helpers --------------------------- */

function chooseBestText(fieldName, localRow, cloudRow) {
  const lv = meaningfulText(localRow?.[fieldName]);
  const cv = meaningfulText(cloudRow?.[fieldName]);

  if (lv && !cv) return lv;
  if (cv && !lv) return cv;
  if (!lv && !cv) return "";

  if (lv === cv) return lv;

  const lts = typeof localRow?._ts === "number" ? localRow._ts : 0;
  const cts = typeof cloudRow?._ts === "number" ? cloudRow._ts : 0;

  if (lts !== cts) return lts > cts ? lv : cv;

  // Same timestamp: prefer longer (often more comprehensive notes/usage)
  return lv.length >= cv.length ? lv : cv;
}

function computeCompletenessScore(r) {
  let score = 0;
  if (isMeaningful(r?.Lithuanian)) score += 3;
  if (isMeaningful(r?.English)) score += 1;
  if (isMeaningful(r?.Phonetic)) score += 1;
  if (isMeaningful(r?.Category)) score += 1;
  if (isMeaningful(r?.Usage)) score += 2;
  if (isMeaningful(r?.Notes)) score += 2;
  if (isMeaningful(r?.["RAG Icon"])) score += 1;
  if (isMeaningful(r?.Sheet)) score += 1;
  return score;
}

/**
 * Merge two rows known to refer to the same “thing”.
 * Returns { merged, conflict } where conflict can be null.
 */
function mergePair(localIn, cloudIn) {
  const localRow = ensureDeletionFields(ensureIdTs(localIn));
  const cloudRow = ensureDeletionFields(ensureIdTs(cloudIn));

  // Preserve / derive keys (do not let them drift)
  const localKey = makeContentKeyFromRow(localRow);
  const cloudKey = makeContentKeyFromRow(cloudRow);

  // Tombstones
  const lDel = localRow._deleted === true;
  const cDel = cloudRow._deleted === true;
  const lDelTs =
    typeof localRow._deleted_ts === "number" ? localRow._deleted_ts : 0;
  const cDelTs =
    typeof cloudRow._deleted_ts === "number" ? cloudRow._deleted_ts : 0;

  const lEditTs = typeof localRow._ts === "number" ? localRow._ts : 0;
  const cEditTs = typeof cloudRow._ts === "number" ? cloudRow._ts : 0;

  if (lDel && !cDel) {
    if (lDelTs >= cEditTs) {
      return {
        merged: {
          ...cloudRow,
          ...localRow,
          _deleted: true,
          _deleted_ts: lDelTs,
          contentKey: localKey || cloudKey || cloudRow.contentKey,
        },
        conflict: null,
      };
    }
    return {
      merged: cloudRow,
      conflict: {
        type: "delete_vs_edit",
        key: localRow._id,
        local: localRow,
        cloud: cloudRow,
        reason: "Local shows deleted, but cloud has newer edits.",
      },
    };
  }

  if (cDel && !lDel) {
    if (cDelTs >= lEditTs) {
      return {
        merged: {
          ...localRow,
          ...cloudRow,
          _deleted: true,
          _deleted_ts: cDelTs,
          contentKey: localKey || cloudKey || localRow.contentKey,
        },
        conflict: null,
      };
    }
    return {
      merged: localRow,
      conflict: {
        type: "delete_vs_edit",
        key: localRow._id,
        local: localRow,
        cloud: cloudRow,
        reason: "Cloud shows deleted, but local has newer edits.",
      },
    };
  }

  if (lDel && cDel) {
    const newestDelTs = Math.max(lDelTs, cDelTs, Date.now());
    const base =
      computeCompletenessScore(localRow) >=
      computeCompletenessScore(cloudRow)
        ? localRow
        : cloudRow;

    return {
      merged: {
        ...base,
        _deleted: true,
        _deleted_ts: newestDelTs,
        contentKey: localKey || cloudKey || base.contentKey,
      },
      conflict: null,
    };
  }

  // Neither deleted → resolve field-by-field
  const tsGap = Math.abs(lEditTs - cEditTs);
  const base =
    tsGap > 10_000
      ? lEditTs >= cEditTs
        ? localRow
        : cloudRow
      : computeCompletenessScore(localRow) >=
        computeCompletenessScore(cloudRow)
      ? localRow
      : cloudRow;

  const other = base === localRow ? cloudRow : localRow;

  const merged = {
    ...base,

    // identity (keep _id stable if possible)
    _id: base._id || other._id,

    // keep latest edit time as _ts
    _ts: Math.max(lEditTs, cEditTs, base._ts || 0, other._ts || 0),

    _deleted: false,
    _deleted_ts: null,

    // keep contentKey stable and aligned with phraseStore behaviour
    contentKey: localKey || cloudKey || base.contentKey || other.contentKey,
  };

  const FIELDS = [
    "English",
    "Lithuanian",
    "Phonetic",
    "Category",
    "Usage",
    "Notes",
    "RAG Icon",
    "Sheet",
  ];

  const fieldConflicts = [];

  for (const f of FIELDS) {
    const baseVal = meaningfulText(base[f]);
    const otherVal = meaningfulText(other[f]);

    if (!baseVal && otherVal) {
      merged[f] = otherVal;
      continue;
    }

    if (baseVal && otherVal && baseVal === otherVal) {
      merged[f] = baseVal;
      continue;
    }

    if (baseVal && otherVal && baseVal !== otherVal) {
      const chosen = chooseBestText(f, localRow, cloudRow);
      merged[f] = chosen;

      fieldConflicts.push({
        field: f,
        local: meaningfulText(localRow[f]),
        cloud: meaningfulText(cloudRow[f]),
        chosen,
      });
    }
  }

  // Preserve _qstat sensibly
  if (base._qstat || other._qstat) merged._qstat = base._qstat || other._qstat;

  if (fieldConflicts.length) {
    return {
      merged,
      conflict: {
        type: "field_conflict",
        key: merged._id,
        local: localRow,
        cloud: cloudRow,
        fields: fieldConflicts,
        reason: "Both sides have meaningful differences in one or more fields.",
      },
    };
  }

  return { merged, conflict: null };
}

/* --------------------------- Main API --------------------------- */

export function mergeUserPhrases(localRows, cloudRows) {
  const local = Array.isArray(localRows)
    ? localRows.map((r) => ensureDeletionFields(ensureIdTs(r)))
    : [];
  const cloud = Array.isArray(cloudRows)
    ? cloudRows.map((r) => ensureDeletionFields(ensureIdTs(r)))
    : [];

  const stats = {
    localCount: local.length,
    cloudCount: cloud.length,
    matchedById: 0,
    matchedByContentKey: 0,
    createdFromLocal: 0,
    createdFromCloud: 0,
    deletionsApplied: 0,
    conflictsCount: 0,
    mergedCount: 0,

    // useful extra signals (won’t break callers)
    cloudKeyCollisions: 0,
    localKeyCollisions: 0,
  };

  const conflicts = [];

  const cloudById = new Map();
  const cloudByKey = new Map();

  // Track collisions (same key appears multiple times)
  const cloudKeyCounts = new Map();

  for (const r of cloud) {
    if (r?._id) cloudById.set(r._id, r);

    const key = makeContentKeyFromRow(r);
    if (key) {
      cloudKeyCounts.set(key, (cloudKeyCounts.get(key) || 0) + 1);

      // If collision, keep the most recently edited as primary
      if (!cloudByKey.has(key)) cloudByKey.set(key, r);
      else {
        const existing = cloudByKey.get(key);
        const et = typeof existing?._ts === "number" ? existing._ts : 0;
        const rt = typeof r?._ts === "number" ? r._ts : 0;
        if (rt > et) cloudByKey.set(key, r);
      }
    }
  }

  stats.cloudKeyCollisions = Array.from(cloudKeyCounts.values()).filter(
    (n) => n > 1
  ).length;

  const usedCloudIds = new Set();
  const merged = [];

  // First pass: merge local against cloud
  for (const l of local) {
    let c = null;

    // 1) Match by _id
    if (l?._id && cloudById.has(l._id)) {
      c = cloudById.get(l._id);
      stats.matchedById++;
    } else {
      // 2) Match by contentKey (Lithuanian-only)
      const lk = makeContentKeyFromRow(l);
      if (lk && cloudByKey.has(lk)) {
        c = cloudByKey.get(lk);
        stats.matchedByContentKey++;
      }
    }

    if (c) {
      usedCloudIds.add(c._id);
      const { merged: m, conflict } = mergePair(l, c);
      if (m?._deleted) stats.deletionsApplied++;
      if (conflict) conflicts.push(conflict);
      merged.push(m);
    } else {
      if (l?._deleted) stats.deletionsApplied++;
      // Ensure key exists if possible (helps downstream even if phraseStore missed it)
      const lk = makeContentKeyFromRow(l);
      merged.push(lk ? { ...l, contentKey: lk } : l);
      stats.createdFromLocal++;
    }
  }

  // Second pass: add remaining cloud-only rows
  for (const c of cloud) {
    if (!c?._id) continue;
    if (usedCloudIds.has(c._id)) continue;

    const ck = makeContentKeyFromRow(c);
    merged.push(ck ? { ...c, contentKey: ck } : c);

    stats.createdFromCloud++;
    if (c?._deleted) stats.deletionsApplied++;
  }

  // Final: stable sort (non-deleted first, then newest)
  merged.sort((a, b) => {
    const ad = a?._deleted === true ? 1 : 0;
    const bd = b?._deleted === true ? 1 : 0;
    if (ad !== bd) return ad - bd;
    const at = typeof a?._ts === "number" ? a._ts : 0;
    const bt = typeof b?._ts === "number" ? b._ts : 0;
    return bt - at;
  });

  stats.conflictsCount = conflicts.length;
  stats.mergedCount = merged.length;

  return { mergedRows: merged, conflicts, stats };
}

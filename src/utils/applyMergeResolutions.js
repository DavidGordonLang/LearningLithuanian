// src/utils/applyMergeResolutions.js

/**
 * Apply user-selected merge conflict resolutions to a mergedRows[] array.
 *
 * mergeUserPhrases() already produces mergedRows (with heuristic choices),
 * but it also returns conflicts when meaningful differences exist.
 *
 * This helper lets the UI overwrite specific fields (or whole rows) according
 * to the user's choices, producing a final rows[] that can be written to cloud
 * and adopted locally.
 */

const PLACEHOLDERS = new Set(["nan", "null", "nul", "none", "n/a", "na", ""]);

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

function normaliseForKey(input) {
  let s = (input ?? "").toString().trim().toLowerCase();
  if (!s) return "";
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/[^a-z0-9]+/g, "");
  return s;
}

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
  if (!out._id || typeof out._id !== "string") {
    out._id = Math.random().toString(36).slice(2);
  }
  if (!out._ts || typeof out._ts !== "number") out._ts = Date.now();
  return out;
}

function ensureContentKey(r) {
  const out = { ...(r || {}) };
  if (typeof out.contentKey === "string" && out.contentKey.trim()) return out;
  const lt = meaningfulText(out.Lithuanian);
  out.contentKey = lt ? normaliseForKey(lt) : "";
  return out;
}

function rowPreviewKey(r) {
  if (!r) return "";
  return (
    r._id ||
    (typeof r.contentKey === "string" ? r.contentKey : "") ||
    normaliseForKey(r.Lithuanian)
  );
}

/**
 * @param {Array} mergedRows
 * @param {Array} conflicts
 * @param {Object} selections
 * selections shape:
 * {
 *   [conflictKey]:
 *     { type: 'field_conflict', fields: { [field]: 'local'|'cloud'|'chosen' } }
 *   | { type: 'delete_vs_edit', pick: 'local'|'cloud' }
 * }
 */
export default function applyMergeResolutions(mergedRows, conflicts, selections) {
  const rows = Array.isArray(mergedRows) ? mergedRows.map((r) => ({ ...r })) : [];
  const confs = Array.isArray(conflicts) ? conflicts : [];
  const sel = selections && typeof selections === "object" ? selections : {};

  const byId = new Map();
  for (const r of rows) {
    if (r?._id) byId.set(r._id, r);
  }

  for (const c of confs) {
    const key = c?.key || rowPreviewKey(c?.local) || rowPreviewKey(c?.cloud);
    if (!key) continue;

    // Locate target row
    let target = byId.get(key) || null;
    if (!target) {
      // Fallback: match by contentKey
      const ck =
        (typeof c?.local?.contentKey === "string" && c.local.contentKey) ||
        (typeof c?.cloud?.contentKey === "string" && c.cloud.contentKey) ||
        "";
      if (ck) {
        target = rows.find((r) => r?.contentKey === ck) || null;
      }
    }
    if (!target) continue;

    const choice = sel[key] || {};

    if (c.type === "delete_vs_edit") {
      const pick = choice.pick === "cloud" ? "cloud" : "local";
      const pickedRow = pick === "cloud" ? c.cloud : c.local;
      const safe = ensureContentKey(ensureDeletionFields(ensureIdTs(pickedRow)));

      // Replace in-place
      Object.keys(target).forEach((k) => delete target[k]);
      Object.assign(target, safe);
      continue;
    }

    if (c.type === "field_conflict") {
      const fieldsChoice = choice.fields || {};
      const local = c.local || {};
      const cloud = c.cloud || {};
      const fieldList = Array.isArray(c.fields) ? c.fields : [];

      for (const f of fieldList) {
        const fieldName = f?.field;
        if (!fieldName) continue;

        const pick = fieldsChoice[fieldName] || "chosen";

        if (pick === "local") {
          target[fieldName] = meaningfulText(local[fieldName]);
        } else if (pick === "cloud") {
          target[fieldName] = meaningfulText(cloud[fieldName]);
        } else {
          // keep current (heuristic "chosen")
        }
      }

      // Ensure identity stays stable
      const safe = ensureContentKey(ensureDeletionFields(ensureIdTs(target)));
      Object.assign(target, safe);
    }
  }

  return rows;
}

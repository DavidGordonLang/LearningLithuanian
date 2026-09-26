import createSection1 from '../content/learning/section1/index.js';
import createSection2 from '../content/learning/section2/index.js';
import createSection3 from '../content/learning/section3/index.js';
import createSection4 from '../content/learning/section4/index.js';
import createSection5 from '../content/learning/section5/index.js';
import { isScoreableBlock } from './trainingScoring.js';

// Bump this epoch when the meaning of an existing lesson/block ID changes.
// Structural changes also invalidate progress automatically. Never renumber IDs
// to mean different learning without changing this epoch.
export const CURRICULUM_EPOCH = 'beta3-1';
export const curriculumSections = [createSection1(), createSection2(), createSection3(), createSection4(), createSection5()];
export const curriculumLessons = Object.fromEntries(curriculumSections.flatMap(s => s.modules.flatMap(m => m.isSectionCheckpoint ? [m] : m.lessons || [])).map(l => [l.id, l]));
const structure = JSON.stringify(Object.values(curriculumLessons).map(l => [l.id, l.blocks.map(b => [b.id, b.type])]));
let hash = 2166136261;
for (const char of structure) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
export const CURRICULUM_ID = `${CURRICULUM_EPOCH}-${hash.toString(16)}`;
const strings = value => Array.isArray(value) ? [...new Set(value.filter(v => typeof v === 'string'))] : [];
const number = value => Number.isFinite(value) && value >= 0 ? value : 0;
export function emptyGameData() {
  return { curriculumId: CURRICULUM_ID, resetEpoch: '0', totalXP: 0, streakDays: 0, lastActivityDate: null, graceUsedThisWeek: false,
    completedLessonIds: [], seenModuleCompleteIds: [], seenSectionCompleteIds: [], lessonXP: {}, lessonMetrics: {}, lessonProgress: {} };
}
export function validAttempt(lesson, saved) {
  if (!lesson?.blocks?.length || saved?.curriculumId !== CURRICULUM_ID || !Number.isFinite(saved.updatedAt) || saved.updatedAt <= 0) return null;
  const ids = lesson.blocks.map(b => b.id);
  const index = ids.indexOf(saved.blockId);
  if (index < 0 || !Array.isArray(saved.completedBlockIds) || !Array.isArray(saved.wrongBlockIds)) return null;
  const completed = strings(saved.completedBlockIds), wrong = strings(saved.wrongBlockIds);
  if (completed.some(id => !ids.includes(id)) || wrong.some(id => !lesson.blocks.some(b => b.id === id && isScoreableBlock(b)))) return null;
  // A cursor alone is not evidence of work. Never skip an uncompleted earlier block.
  if (ids.slice(0, index).some(id => !completed.includes(id))) return null;
  return { curriculumId: CURRICULUM_ID, blockId: saved.blockId, updatedAt: saved.updatedAt, completedBlockIds: completed, wrongBlockIds: wrong };
}
export function resumeAttempt(lesson, saved, alreadyComplete = false) {
  const attempt = !alreadyComplete && validAttempt(lesson, saved);
  const blockIndex = attempt ? lesson.blocks.findIndex(b => b.id === attempt.blockId) : 0;
  // Reopen at the current block boundary, not halfway through transient answer UI.
  // Previously earned blocks and every wrong block survive; current block is replayed.
  return { blockIndex, completedBlockIds: Object.fromEntries((attempt?.completedBlockIds || []).filter(id => id !== attempt.blockId).map(id => [id, true])),
    wrongBlockIds: Object.fromEntries((attempt?.wrongBlockIds || []).map(id => [id, true])) };
}
export function sanitiseGameData(raw) {
  const out = emptyGameData();
  if (raw?.curriculumId !== CURRICULUM_ID) return out;
  out.resetEpoch = typeof raw.resetEpoch === 'string' ? raw.resetEpoch : '0';
  out.totalXP = number(raw.totalXP); out.streakDays = number(raw.streakDays);
  out.lastActivityDate = /^\d{4}-\d{2}-\d{2}$/.test(raw.lastActivityDate) ? raw.lastActivityDate : null;
  out.graceUsedThisWeek = raw.graceUsedThisWeek === true;
  out.completedLessonIds = strings(raw.completedLessonIds).filter(id => curriculumLessons[id]);
  const modules = curriculumSections.flatMap(s => s.modules.map(m => m.id));
  out.seenModuleCompleteIds = strings(raw.seenModuleCompleteIds).filter(id => modules.includes(id));
  out.seenSectionCompleteIds = strings(raw.seenSectionCompleteIds).filter(id => curriculumSections.some(s => s.id === id));
  for (const [id, lesson] of Object.entries(curriculumLessons)) {
    if (number(raw.lessonXP?.[id])) out.lessonXP[id] = number(raw.lessonXP[id]);
    const m = raw.lessonMetrics?.[id];
    if (out.completedLessonIds.includes(id) && m && Number.isFinite(m.completedAt) && Number.isInteger(m.wrongBlocks) && m.wrongBlocks >= 0 && m.scoreableBlocks === lesson.blocks.filter(isScoreableBlock).length && m.wrongBlocks <= m.scoreableBlocks) {
      out.lessonMetrics[id] = { ...m, accuracyPct: m.scoreableBlocks ? Math.round(100 * (m.scoreableBlocks - m.wrongBlocks) / m.scoreableBlocks) : null };
    }
    const attempt = validAttempt(lesson, raw.lessonProgress?.[id]);
    if (attempt && !out.completedLessonIds.includes(id)) out.lessonProgress[id] = attempt;
  }
  return out;
}
const union = (a, b) => [...new Set([...a, ...b])].sort();
export function mergeGameData(left, right) {
  const a = sanitiseGameData(left), b = sanitiseGameData(right);
  // Explicit user resets form a new generation; old offline state cannot resurrect it.
  if (a.resetEpoch !== b.resetEpoch) return a.resetEpoch > b.resetEpoch ? a : b;
  const out = { ...a, completedLessonIds: union(a.completedLessonIds, b.completedLessonIds),
    seenModuleCompleteIds: union(a.seenModuleCompleteIds, b.seenModuleCompleteIds), seenSectionCompleteIds: union(a.seenSectionCompleteIds, b.seenSectionCompleteIds),
    lessonXP: {}, lessonMetrics: {}, lessonProgress: {} };
  for (const [id, lesson] of Object.entries(curriculumLessons)) {
    const xp = Math.max(a.lessonXP[id] || 0, b.lessonXP[id] || 0); if (xp) out.lessonXP[id] = xp;
    const metrics = [a.lessonMetrics[id], b.lessonMetrics[id]].filter(Boolean).sort((x,y) => x.completedAt-y.completedAt || JSON.stringify(x).localeCompare(JSON.stringify(y)));
    if (metrics[0]) out.lessonMetrics[id] = metrics[0];
    if (out.completedLessonIds.includes(id)) continue;
    const x=a.lessonProgress[id], y=b.lessonProgress[id];
    if (!x || !y) { if (x || y) out.lessonProgress[id]=x || y; continue; }
    const index = p => lesson.blocks.findIndex(block => block.id === p.blockId);
    const furthest = index(x) >= index(y) ? x : y;
    out.lessonProgress[id] = { ...furthest, updatedAt: Math.max(x.updatedAt,y.updatedAt), completedBlockIds: union(x.completedBlockIds,y.completedBlockIds), wrongBlockIds: union(x.wrongBlockIds,y.wrongBlockIds) };
  }
  const nonLessonXP = d => Math.max(0, d.totalXP - Object.values(d.lessonXP).reduce((s,v)=>s+v,0));
  out.totalXP = Math.max(nonLessonXP(a),nonLessonXP(b)) + Object.values(out.lessonXP).reduce((s,v)=>s+v,0);
  const activity = (a.lastActivityDate || '') > (b.lastActivityDate || '') ? a : b;
  out.lastActivityDate = activity.lastActivityDate; out.streakDays = activity.streakDays; out.graceUsedThisWeek = activity.graceUsedThisWeek;
  return out;
}

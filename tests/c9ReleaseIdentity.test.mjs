import test from 'node:test';
import assert from 'node:assert/strict';
import createSection1 from '../src/content/learning/section1/index.js';
import createSection2 from '../src/content/learning/section2/index.js';
import createSection3 from '../src/content/learning/section3/index.js';
import createSection4 from '../src/content/learning/section4/index.js';
import createSection5 from '../src/content/learning/section5/index.js';
import { buildSection1Profile } from '../src/content/learning/section1/profile.js';
import { CURRICULUM_EPOCH, CURRICULUM_ID, curriculumSections, curriculumLessons, emptyGameData, sanitiseGameData, validAttempt, resumeAttempt } from '../src/lib/curriculumProgress.js';
import { cloudGameData, gameCacheKey } from '../src/lib/gamePersistence.js';
import { createGameStore, database, memoryStorage } from './helpers/gameHarness.mjs';

const catalogue = sections => sections.flatMap(section => section.modules.flatMap(module => module.isSectionCheckpoint ? [module] : module.lessons));
const shape = sections => catalogue(sections).map(lesson => [lesson.id, lesson.blocks.map(block => [block.id, block.type])]);

test('final structural inventory and male/female profile factories agree', () => {
  const units = catalogue(curriculumSections), blocks = units.flatMap(unit => unit.blocks);
  const scenarios = blocks.filter(block => block.type === 'scenario_v2');
  assert.deepEqual({ sections: curriculumSections.length, modules: curriculumSections.reduce((n, s) => n + s.modules.filter(m => !m.isSectionCheckpoint).length, 0),
    units: units.length, teaching: units.filter(l => !l.isCheckpoint).length, moduleCheckpoints: units.filter(l => l.isCheckpoint && !l.isSectionCheckpoint).length,
    sectionCheckpoints: units.filter(l => l.isSectionCheckpoint).length, blocks: blocks.length, scenarios: scenarios.length,
    decisions: scenarios.reduce((n, s) => n + s.steps.filter(step => step.options?.length).length, 0),
    patterns: units.filter(l => l.notes?.pattern).length, matches: blocks.filter(b => b.type === 'word_match').length },
  { sections: 5, modules: 20, units: 115, teaching: 90, moduleCheckpoints: 20, sectionCheckpoints: 5,
    blocks: 777, scenarios: 108, decisions: 352, patterns: 82, matches: 27 });
  assert.equal(new Set(units.map(l => l.id)).size, units.length);
  assert.equal(new Set(blocks.map(b => b.id)).size, blocks.length);
  assert.equal(Object.keys(curriculumLessons).length, units.length);
  const factories = [createSection1, createSection2, createSection3, createSection4, createSection5];
  const standard = JSON.stringify(shape(curriculumSections));
  for (const speakerGender of ['male', 'female']) {
    const profile = buildSection1Profile({ userName: speakerGender === 'female' ? 'Barbora' : 'Davidas', speakerGender,
      dateOfBirth: speakerGender === 'female' ? '1992-01-01' : '1981-04-04', fromCountryCode: speakerGender === 'female' ? 'lithuania' : 'scotland' }, new Date(2026, 8, 27));
    assert.equal(JSON.stringify(shape(factories.map(create => create(profile)))), standard, speakerGender);
  }
});

test('one semantic epoch bump preserves the C8 structure and rejects every older namespace', () => {
  assert.equal(CURRICULUM_EPOCH, 'beta3-2');
  assert.equal(CURRICULUM_ID, 'beta3-2-62733640');
  assert.equal(emptyGameData().curriculumId, CURRICULUM_ID);
  const lesson = curriculumLessons.section_3_module_4_lesson_5;
  const current = { ...emptyGameData(), completedLessonIds: [lesson.id], totalXP: 50 };
  assert.deepEqual(sanitiseGameData(current).completedLessonIds, [lesson.id]);
  for (const oldId of ['beta3-1-62733640', 'beta3-1-8c71686f', 'beta3-1-8cf80a6d', 'beta3-1-4a9a0f2', 'beta3-1-692cd95b']) {
    const stale = { ...current, curriculumId: oldId };
    assert.deepEqual(sanitiseGameData(stale).completedLessonIds, [], oldId);
    const saved = { curriculumId: oldId, blockId: lesson.blocks[2].id, completedBlockIds: lesson.blocks.slice(0, 2).map(b => b.id), wrongBlockIds: [lesson.blocks[1].id], updatedAt: 100 };
    assert.equal(validAttempt(lesson, saved), null, oldId);
    assert.equal(resumeAttempt(lesson, saved).blockIndex, 0, oldId);
  }
  assert.notEqual(gameCacheKey('A'), 'zodis:game:beta3-1-62733640:A');
});

test('loading an old epoch does not delete old JSON or unrelated Library/settings data; current progress writes normally', async () => {
  const db = database(), storage = memoryStorage();
  const old = { ...emptyGameData(), curriculumId: 'beta3-1-62733640', completedLessonIds: ['section_3_module_4_lesson_5'], totalXP: 42 };
  const library = { savedPhrases: [{ _id: 'phrase-1', Lithuanian: 'Labas' }] };
  const settings = { speaker: 'female' };
  db.rows.set('A', { user_id: 'A', updated_at: '2026-09-27T08:00:00.000Z', data: { learningCurricula: { [old.curriculumId]: old }, library, settings } });
  storage.setItem('zodis:game:beta3-1-62733640:A', JSON.stringify({ userId: 'A', game: old, dirty: false }));
  const store = createGameStore({ client: db.client, storage });
  await store.getState().ensureLoadedForUser('A');
  assert.deepEqual(store.getState().completedLessonIds, []);
  assert.equal(db.writes.length, 0);
  assert.deepEqual(cloudGameData(db.rows.get('A')).completedLessonIds, []);
  store.getState().completeLesson('section_3_module_4_lesson_5', 'A');
  await store.getState().retrySync();
  const data = db.rows.get('A').data;
  assert.deepEqual(data.learningCurricula[old.curriculumId], old);
  assert.deepEqual(data.library, library);
  assert.deepEqual(data.settings, settings);
  assert.deepEqual(data.learningCurricula[CURRICULUM_ID].completedLessonIds, ['section_3_module_4_lesson_5']);
  assert.ok(storage.getItem('zodis:game:beta3-1-62733640:A'));
  store.getState().reset();
  await store.getState().ensureLoadedForUser('B');
  assert.deepEqual(store.getState().completedLessonIds, []);
  store.getState().reset();
  await store.getState().ensureLoadedForUser('A');
  assert.deepEqual(store.getState().completedLessonIds, ['section_3_module_4_lesson_5']);
});

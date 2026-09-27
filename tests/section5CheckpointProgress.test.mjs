import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameStore, database, memoryStorage } from './helpers/gameHarness.mjs';
import { cloudGameData } from '../src/lib/gamePersistence.js';
import { CURRICULUM_EPOCH, CURRICULUM_ID, curriculumLessons, curriculumSections, emptyGameData, resumeAttempt, sanitiseGameData, mergeGameData, validAttempt } from '../src/lib/curriculumProgress.js';
import { countScoreableBlocks, getSectionLessonIds } from '../src/lib/trainingScoring.js';
import { findLatestInProgressLesson, getCourseBrowseState, getSectionBrowseState } from '../src/views/training/learningProgress.js';
import { componentHarness, nodes } from './helpers/componentHarness.mjs';

const section = curriculumSections.at(-1);
const checkpoint = section.modules.at(-1);
const id = 'section_5_checkpoint';
const allIds = Object.keys(curriculumLessons);
const beforeCheckpoint = allIds.filter(lessonId => lessonId !== id);
const attempt = (index = 2) => ({
  curriculumId: CURRICULUM_ID,
  blockId: checkpoint.blocks[index].id,
  completedBlockIds: checkpoint.blocks.slice(0, index).map(block => block.id),
  wrongBlockIds: [checkpoint.blocks[0].id],
  updatedAt: 100,
});

test('real Section 5 checkpoint is the unique active final catalogue item with stable scoreable blocks', () => {
  assert.equal(CURRICULUM_EPOCH, 'beta3-2');
  assert.equal(CURRICULUM_ID, 'beta3-2-62733640');
  assert.equal(allIds.length, 115);
  assert.equal(allIds.at(-1), id);
  assert.equal(curriculumLessons[id], checkpoint);
  assert.equal(checkpoint.isCheckpoint, true);
  assert.equal(checkpoint.isSectionCheckpoint, true);
  assert.equal(checkpoint.status, 'active');
  assert.equal(section.modules.filter(module => module.id === id).length, 1);
  assert.equal(section.modules.filter(module => module.isSectionCheckpoint).length, 1);
  assert.equal(getSectionLessonIds(section).at(-1), id);
  assert.equal(new Set(checkpoint.blocks.map(block => block.id)).size, checkpoint.blocks.length);
  assert.ok(countScoreableBlocks(checkpoint) > 0);
  for (let i = 0; i < 4; i++) {
    const previous = curriculumSections[i].modules.at(-1);
    assert.equal(previous.isSectionCheckpoint, true);
    assert.equal(curriculumLessons[previous.id], previous);
  }
});

test('real course traversal unlocks, launches, resumes and completes the final checkpoint without a next section', () => {
  const sectionBefore = getSectionBrowseState(section, beforeCheckpoint);
  assert.equal(sectionBefore.sectionCheckpoint, checkpoint);
  assert.equal(sectionBefore.sectionCheckpointStatus, 'unlocked');
  assert.equal(getCourseBrowseState(curriculumSections, beforeCheckpoint).at(-1).status, 'current');
  assert.equal(findLatestInProgressLesson(curriculumSections, beforeCheckpoint, { [id]: attempt() })?.lesson, checkpoint);
  assert.equal(findLatestInProgressLesson(curriculumSections, beforeCheckpoint, { [id]: { ...attempt(), blockId: 'removed' } }), null);
  const finished = [...beforeCheckpoint, id];
  assert.equal(getSectionBrowseState(section, finished).sectionCheckpointStatus, 'completed');
  assert.ok(getCourseBrowseState(curriculumSections, finished).every(item => item.status === 'completed'));
  assert.equal(findLatestInProgressLesson(curriculumSections, finished, { [id]: attempt() }), null);
  assert.equal(curriculumSections.at(-1), section);
  assert.equal(curriculumSections[curriculumSections.indexOf(section) + 1], undefined);
  assert.equal(allIds.find(lessonId => !finished.includes(lessonId)), undefined);
});

test('Section 5 browse opens its real final checkpoint and completed Review remains available', async () => {
  let completedLessonIds = beforeCheckpoint, opened = null;
  const view = await componentHarness('src/views/training/LearningSectionView.jsx', 'default', {
    '../../stores/gameStore': { useGameStore: selector => selector({ completedLessonIds }) },
    './TrainingBackButton': () => null,
    './learningProgress': { getSectionBrowseState },
  });
  const props = { section, onOpenCheckpoint: checkpointId => { opened = checkpointId; } };
  const checkpointCard = tree => nodes(tree, node => node.type?.name === 'SectionCheckpointCard')[0];
  let tree = view.render(props);
  assert.equal(checkpointCard(tree).props.status, 'unlocked');
  checkpointCard(tree).props.onClick();
  assert.equal(opened, id);
  completedLessonIds = [...beforeCheckpoint, id];
  tree = view.render(props);
  assert.equal(checkpointCard(tree).props.status, 'completed');
  checkpointCard(tree).props.onClick();
  assert.equal(opened, id);
});

test('checkpoint partial attempt survives journal/cloud hydration and completion survives review, reload and account switch', async () => {
  const db = database(), storage = memoryStorage();
  const first = createGameStore({ client: db.client, storage });
  await first.getState().ensureLoadedForUser('A');
  const record = attempt();
  assert.deepEqual(validAttempt(checkpoint, record), record);
  first.getState().setLessonProgress(id, record.blockId, 2, 'A', {
    completedBlockIds: Object.fromEntries(record.completedBlockIds.map(blockId => [blockId, true])),
    wrongBlockIds: { [record.wrongBlockIds[0]]: true },
  });
  await first.getState().retrySync();
  const reopened = createGameStore({ client: db.client, storage });
  await reopened.getState().ensureLoadedForUser('A');
  const saved = reopened.getState().lessonProgress[id];
  assert.equal(resumeAttempt(checkpoint, saved).blockIndex, 2);
  assert.equal(resumeAttempt(checkpoint, saved).wrongBlockIds[record.wrongBlockIds[0]], true);
  assert.equal(findLatestInProgressLesson(curriculumSections, [], reopened.getState().lessonProgress)?.lesson.id, id);
  const scoreableBlocks = countScoreableBlocks(checkpoint);
  reopened.getState().completeLesson(id, 'A', { wrongBlocks: 1, scoreableBlocks });
  await reopened.getState().retrySync();
  const originalMetrics = reopened.getState().lessonMetrics[id];
  assert.equal(originalMetrics.scoreableBlocks, scoreableBlocks);
  assert.equal(originalMetrics.wrongBlocks, 1);
  assert.equal(reopened.getState().lessonProgress[id], undefined);
  const cloud = cloudGameData(db.rows.get('A'));
  assert.ok(cloud.completedLessonIds.includes(id));
  assert.equal(cloud.lessonProgress[id], undefined);
  assert.ok(sanitiseGameData(cloud).completedLessonIds.includes(id));
  assert.ok(mergeGameData(cloud, { ...emptyGameData(), lessonProgress: { [id]: record } }).completedLessonIds.includes(id));
  assert.equal(mergeGameData(cloud, { ...emptyGameData(), lessonProgress: { [id]: record } }).lessonProgress[id], undefined);
  assert.equal(resumeAttempt(checkpoint, record, true).blockIndex, 0);
  reopened.getState().completeLesson(id, 'A', { wrongBlocks: 0, scoreableBlocks });
  assert.deepEqual(reopened.getState().lessonMetrics[id], originalMetrics);
  reopened.getState().reset();
  await reopened.getState().ensureLoadedForUser('B');
  assert.equal(reopened.getState().isLessonComplete(id), false);
  reopened.getState().reset();
  await reopened.getState().ensureLoadedForUser('A');
  assert.equal(reopened.getState().isLessonComplete(id), true);
  assert.deepEqual(reopened.getState().lessonMetrics[id], originalMetrics);
  assert.equal(findLatestInProgressLesson(curriculumSections, reopened.getState().completedLessonIds, reopened.getState().lessonProgress), null);
});

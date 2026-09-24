import test from "node:test";
import assert from "node:assert/strict";
import {
  findLatestInProgressLesson,
  getCourseBrowseState,
  getSectionBrowseState,
} from "../src/views/training/learningProgress.js";

function section(id, prefix) {
  return {
    id,
    modules: [
      {
        id: `${prefix}_m1`,
        lessons: [
          { id: `${prefix}_l1` },
          { id: `${prefix}_l2` },
          { id: `${prefix}_m1c`, isCheckpoint: true },
        ],
      },
      {
        id: `${prefix}_m2`,
        lessons: [
          { id: `${prefix}_l3` },
          { id: `${prefix}_m2c`, isCheckpoint: true },
        ],
      },
      {
        id: `${prefix}_section_c`,
        isSectionCheckpoint: true,
        blocks: [],
      },
    ],
  };
}

test("section browse state shows completed, current, locked and gates the section checkpoint", () => {
  const sec = section("s1", "s1");

  let state = getSectionBrowseState(sec, ["s1_l1", "s1_l2", "s1_m1c"]);
  assert.deepEqual(state.moduleStates.map((item) => item.status), ["completed", "current"]);
  assert.equal(state.sectionCheckpointStatus, "locked");

  state = getSectionBrowseState(sec, ["s1_l1", "s1_l2", "s1_m1c", "s1_l3", "s1_m2c"]);
  assert.deepEqual(state.moduleStates.map((item) => item.status), ["completed", "completed"]);
  assert.equal(state.sectionCheckpointStatus, "unlocked");

  state = getSectionBrowseState(sec, [
    "s1_l1", "s1_l2", "s1_m1c", "s1_l3", "s1_m2c", "s1_section_c",
  ]);
  assert.equal(state.sectionCheckpointStatus, "completed");
});

test("course browse state locks later sections until the current section is complete", () => {
  const s1 = section("s1", "s1");
  const s2 = section("s2", "s2");

  let state = getCourseBrowseState([s1, s2], ["s1_l1"]);
  assert.deepEqual(state.map((item) => item.status), ["current", "locked"]);

  state = getCourseBrowseState([s1, s2], [
    "s1_l1", "s1_l2", "s1_m1c", "s1_l3", "s1_m2c", "s1_section_c",
  ]);
  assert.deepEqual(state.map((item) => item.status), ["completed", "current"]);
});


test("latest unfinished lesson progress wins over the first incomplete lesson", () => {
  const s1 = section("s1", "s1");
  const s2 = section("s2", "s2");
  const target = findLatestInProgressLesson(
    [s1, s2],
    ["s1_l1"],
    {
      s1_l2: { blockId: "older", blockIndex: 2, updatedAt: 100 },
      s2_l3: { blockId: "newer", blockIndex: 3, updatedAt: 200 },
    }
  );
  assert.equal(target.section.id, "s2");
  assert.equal(target.module.id, "s2_m2");
  assert.equal(target.lesson.id, "s2_l3");
});

test("resume helper ignores completed and stale lesson ids", () => {
  const s1 = section("s1", "s1");
  const target = findLatestInProgressLesson(
    [s1],
    ["s1_l2"],
    {
      missing_lesson: { blockId: "x", blockIndex: 1, updatedAt: 300 },
      s1_l2: { blockId: "y", blockIndex: 2, updatedAt: 200 },
      s1_l1: { blockId: "z", blockIndex: 1, updatedAt: 100 },
    }
  );
  assert.equal(target.lesson.id, "s1_l1");
});

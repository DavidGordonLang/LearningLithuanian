import test from "node:test";
import assert from "node:assert/strict";

import {
  SCOREABLE_BLOCK_TYPES,
  aggregateSectionMetrics,
  calculateAccuracyPct,
  countScoreableBlocks,
  isSoftPassChoiceOption,
} from "../src/lib/trainingScoring.js";

test("objective training blocks are scoreable, including the newer exercise types", () => {
  for (const type of [
    "recognise_mcq",
    "listen_mcq",
    "best_response",
    "build_phrase",
    "word_match",
    "scenario_chain",
    "scenario_v2",
    "context_gap_select",
    "choose_correct_form",
    "conversation_turn_fill",
  ]) {
    assert.equal(SCOREABLE_BLOCK_TYPES.has(type), true, type);
  }
  assert.equal(SCOREABLE_BLOCK_TYPES.has("learn"), false);
  assert.equal(SCOREABLE_BLOCK_TYPES.has("speak_self_check"), false);
});

test("acceptable and awkward authored choice outcomes are soft passes rather than misses", () => {
  assert.equal(isSoftPassChoiceOption({ result: "acceptable" }), true);
  assert.equal(isSoftPassChoiceOption({ result: "awkward" }), true);
  assert.equal(isSoftPassChoiceOption({ result: "wrong" }), false);
  assert.equal(isSoftPassChoiceOption({ isCorrect: false }), false);
});

test("lesson accuracy counts a block with mistakes once, not once per wrong tap", () => {
  const lesson = {
    blocks: [
      { type: "learn" },
      { type: "build_phrase" },
      { type: "recognise_mcq" },
      { type: "word_match" },
      { type: "speak_self_check" },
    ],
  };
  assert.equal(countScoreableBlocks(lesson), 3);
  assert.equal(calculateAccuracyPct(1, 3), 67);
  assert.equal(calculateAccuracyPct(3, 3), 0);
  assert.equal(calculateAccuracyPct(99, 3), 0);
});

test("section accuracy aggregates every lesson and checkpoint metric", () => {
  const section = {
    modules: [
      {
        id: "m1",
        lessons: [{ id: "l1" }, { id: "l2" }],
      },
      {
        id: "m2",
        lessons: [{ id: "l3" }],
      },
      {
        id: "cp",
        isSectionCheckpoint: true,
        blocks: [],
      },
    ],
  };
  const metrics = {
    l1: { wrongBlocks: 1, scoreableBlocks: 4 },
    l2: { wrongBlocks: 0, scoreableBlocks: 3 },
    l3: { wrongBlocks: 1, scoreableBlocks: 3 },
    cp: { wrongBlocks: 0, scoreableBlocks: 2 },
  };

  const result = aggregateSectionMetrics(section, metrics);
  assert.equal(result.metricsComplete, true);
  assert.equal(result.wrongBlocks, 2);
  assert.equal(result.scoreableBlocks, 12);
  assert.equal(result.accuracyPct, 83);
});

test("section accuracy is withheld when legacy lessons have no persisted metrics", () => {
  const section = {
    modules: [
      { id: "m1", lessons: [{ id: "l1" }, { id: "l2" }] },
      { id: "cp", isSectionCheckpoint: true, blocks: [] },
    ],
  };
  const result = aggregateSectionMetrics(section, {
    l1: { wrongBlocks: 0, scoreableBlocks: 2 },
    cp: { wrongBlocks: 0, scoreableBlocks: 2 },
  });

  assert.equal(result.metricsComplete, false);
  assert.equal(result.accuracyPct, null);
});

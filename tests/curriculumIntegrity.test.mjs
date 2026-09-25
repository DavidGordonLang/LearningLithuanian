import test from "node:test";
import assert from "node:assert/strict";

import module11 from "../src/content/learning/section1/module_1_1.js";
import createModule12 from "../src/content/learning/section1/module_1_2.js";
import createModule13 from "../src/content/learning/section1/module_1_3.js";
import createModule14 from "../src/content/learning/section1/module_1_4.js";
import createCheckpoint1 from "../src/content/learning/section1/checkpoint_1.js";

import createModule21 from "../src/content/learning/section2/module_2_1.js";
import createModule22 from "../src/content/learning/section2/module_2_2.js";
import createModule23 from "../src/content/learning/section2/module_2_3.js";
import createModule24 from "../src/content/learning/section2/module_2_4.js";
import createCheckpoint2 from "../src/content/learning/section2/checkpoint_2.js";

import createModule31 from "../src/content/learning/section3/module_3_1.js";
import createModule32 from "../src/content/learning/section3/module_3_2.js";
import createModule33 from "../src/content/learning/section3/module_3_3.js";
import createModule34 from "../src/content/learning/section3/module_3_4.js";
import createCheckpoint3 from "../src/content/learning/section3/checkpoint_3.js";

import createModule41 from "../src/content/learning/section4/module_4_1.js";
import createModule42 from "../src/content/learning/section4/module_4_2.js";
import createModule43 from "../src/content/learning/section4/module_4_3.js";
import createModule44 from "../src/content/learning/section4/module_4_4.js";
import createCheckpoint4 from "../src/content/learning/section4/checkpoint_4.js";

import createModule51 from "../src/content/learning/section5/module_5_1.js";
import createModule52 from "../src/content/learning/section5/module_5_2.js";
import createModule53 from "../src/content/learning/section5/module_5_3.js";
import createModule54 from "../src/content/learning/section5/module_5_4.js";
import createCheckpoint5 from "../src/content/learning/section5/checkpoint_5.js";
import { getBuildPhraseDistractorMeaning } from "../src/lib/buildPhraseFeedback.js";

import { buildSection1Profile } from "../src/content/learning/section1/profile.js";

const profile = buildSection1Profile({
  userName: "Davidas", speakerGender: "male", dateOfBirth: "1981-09-25",
  fromCountryCode: "scotland",
}, new Date(2026, 8, 25));

const modules = [
  module11,
  createModule12(profile), createModule13(profile), createModule14(profile),
  createModule21(profile), createModule22(profile), createModule23(profile), createModule24(profile),
  createModule31(profile), createModule32(profile), createModule33(profile), createModule34(profile),
  createModule41(profile), createModule42(profile), createModule43(profile), createModule44(profile),
  createModule51(profile), createModule52(profile), createModule53(profile), createModule54(profile),
];

const checkpoints = [
  createCheckpoint1(profile), createCheckpoint2(profile), createCheckpoint3(profile),
  createCheckpoint4(profile), createCheckpoint5(profile),
];

test("module metadata matches the actual lesson arrays after curriculum restructuring", () => {
  for (const module of modules) {
    const teachingLessons = module.lessons.filter((lesson) => !lesson.isCheckpoint);
    const moduleCheckpoints = module.lessons.filter((lesson) => lesson.isCheckpoint);
    assert.equal(module.lessonCount, teachingLessons.length, `${module.code} teaching lesson count`);
    assert.equal(moduleCheckpoints.length, 1, `${module.code} checkpoint count`);
    assert.equal(new Set(module.lessons.map((lesson) => lesson.id)).size, module.lessons.length, `${module.code} duplicate lesson id`);
    assert.equal(new Set(module.lessons.map((lesson) => lesson.code)).size, module.lessons.length, `${module.code} duplicate lesson code`);
  }
});

test("block IDs remain unique across Sections 1–5", () => {
  const ids = [];
  for (const module of modules) {
    for (const lesson of module.lessons) {
      for (const block of lesson.blocks || []) ids.push(block.id);
    }
  }
  for (const cp of checkpoints) {
    for (const block of cp.blocks || []) ids.push(block.id);
  }
  assert.equal(new Set(ids).size, ids.length);
});

test("every authored Scenario V2 decision retains a progressing answer", () => {
  const units = [
    ...modules.flatMap((module) => module.lessons),
    ...checkpoints,
  ];
  for (const unit of units) {
    for (const scenario of (unit.blocks || []).filter((block) => block.type === "scenario_v2")) {
      for (const step of scenario.steps || []) {
        if (!step.options?.length) continue;
        assert.ok(
          step.options.some((option) => ["best", "acceptable", "awkward"].includes(option.result) && option.progresses !== false),
          `${scenario.id}:${step.id}`
        );
        for (const level of step.help?.levels || []) {
          if (level.spokenLanguage === "en") assert.equal(level.audio, false, `${scenario.id} English helper audio`);
        }
      }
    }
  }
});

test("Section 2 defers time, prices and plural-comparison shopping while Section 3 owns time and prices", () => {
  const section2 = JSON.stringify([createModule21(profile), createModule22(profile), createModule23(profile), createModule24(profile), createCheckpoint2(profile)]);
  for (const deferred of ["Kada pradedame?", "Kiek tai kainuoja?", "Tas geresnis.", "Noriu šitų."]) {
    assert.equal(section2.includes(deferred), false, deferred);
  }

  const section3 = JSON.stringify([createModule31(profile), createModule32(profile), createModule33(profile), createModule34(profile), createCheckpoint3(profile)]);
  assert.ok(section3.includes("Kiek tai kainuoja?"));
  assert.ok(section3.includes("Kada"));
});


test("Match Pairs is always the final recap block and stays recap-sized", () => {
  const units = [
    ...modules.flatMap((module) => module.lessons),
    ...checkpoints,
  ];

  for (const unit of units) {
    const blocks = unit.blocks || [];
    const matches = blocks
      .map((block, index) => ({ block, index }))
      .filter(({ block }) => block.type === "word_match");

    for (const { block, index } of matches) {
      assert.equal(index, blocks.length - 1, `${unit.code || unit.id} word_match must be final`);
      assert.ok(
        Array.isArray(block.pairs) && block.pairs.length >= 18 && block.pairs.length <= (block.pairPages ? 24 : 22),
        `${unit.code || unit.id} word_match should contain about 20 pairs (up to 24 with authored groups)`
      );
      if (block.pairPages) {
        const groupedIds = block.pairPages.flatMap(page => page.pairIds);
        assert.deepEqual([...groupedIds].sort(), block.pairs.map(pair => pair.id).sort(), `${block.id} groups cover each pair exactly once`);
        for (const page of block.pairPages) {
          assert.ok(page.label?.trim(), `${block.id} group has a meaningful label`);
          assert.ok(page.pairIds.length >= 1 && page.pairIds.length <= 5, `${block.id} group fits one page without filler`);
        }
      }
    }
  }
});

test("learner-facing authored prose is not written as all-caps shouting", () => {
  const units = [
    ...modules.flatMap((module) => module.lessons),
    ...checkpoints,
  ];
  const proseKeys = new Set([
    "prompt", "learnerPrompt", "description", "sceneIntro", "sceneDirection",
    "supportText", "meaningText", "feedback", "explanation",
  ]);
  const offenders = [];

  function inspect(value, key = "", path = "root") {
    if (typeof value === "string") {
      const text = value.trim();
      const sentenceLike = text.length >= 12 && /\s/.test(text) && /[A-Za-z]/.test(text);
      const allCaps = sentenceLike && text === text.toUpperCase() && text !== text.toLowerCase();
      if (proseKeys.has(key) && allCaps) offenders.push(`${path}: ${text}`);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => inspect(item, key, `${path}[${index}]`));
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [childKey, childValue] of Object.entries(value)) {
      if (childKey === "prompt" && childValue && typeof childValue === "object") {
        inspect(childValue.text, "prompt", `${path}.prompt.text`);
      } else {
        inspect(childValue, childKey, `${path}.${childKey}`);
      }
    }
  }

  units.forEach((unit, index) => inspect(unit, "", `unit[${index}]`));
  assert.deepEqual(offenders, []);
});

test("Learn blocks introduce each Lithuanian item only once", () => {
  const seen = new Map();
  const duplicates = [];

  const normalize = (value) =>
    String(value || "")
      .toLocaleLowerCase("lt")
      .replace(/[„“”"'’?!.,;:()[\]…]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  for (const module of modules) {
    for (const lesson of module.lessons || []) {
      for (const block of (lesson.blocks || []).filter((candidate) => candidate.type === "learn")) {
        for (const item of block.items || []) {
          const key = normalize(item.lt);
          if (!key) continue;
          if (seen.has(key)) {
            duplicates.push(
              `${lesson.code}:${block.id} repeats "${item.lt}" first introduced at ${seen.get(key)}`
            );
          } else {
            seen.set(key, `${lesson.code}:${block.id}`);
          }
        }
      }
    }
  }

  assert.deepEqual(duplicates, []);
});

test("learner-facing curriculum avoids unexplained grammar jargon", () => {
  const curriculumText = JSON.stringify([...modules, ...checkpoints]);
  const jargon = /\b(genitive|accusative|instrumental|dative|nominative|locative|vocative|imperative|ordinal|declension|conjugation|possessive|preposition|adverbial|adjective|demonstrative|subject)\b/i;
  const match = curriculumText.match(jargon);
  assert.equal(match, null, `learner-facing grammar label should be explained in plain language: ${match?.[0] || ""}`);
});

test("pattern and consolidation lessons use retrieval/application instead of Learn cards", () => {
  const applicationOnlyCodes = new Set([
    "1.4.5",
    "4.2.4",
    "5.1.1",
    "5.2.3",
    "5.4.2",
    "5.4.3",
  ]);

  for (const module of modules) {
    for (const lesson of module.lessons || []) {
      if (!applicationOnlyCodes.has(lesson.code)) continue;
      assert.equal(
        (lesson.blocks || []).some((block) => block.type === "learn"),
        false,
        `${lesson.code} should retrieve/apply known language rather than re-teach it`
      );
    }
  }
});

test("every Build Phrase supports deterministic token diagnostics", () => {
  const buildBlocks = [];

  for (const module of modules) {
    for (const lesson of module.lessons || []) {
      for (const block of lesson.blocks || []) {
        if (block.type === "build_phrase") buildBlocks.push({ owner: lesson.code, block });
      }
    }
  }
  for (const checkpoint of checkpoints) {
    for (const block of checkpoint.blocks || []) {
      if (block.type === "build_phrase") buildBlocks.push({ owner: checkpoint.code || checkpoint.id, block });
    }
  }

  assert.ok(buildBlocks.length >= 50, "expected the full Build Phrase curriculum to be covered");

  for (const { owner, block } of buildBlocks) {
    const tokens = Array.isArray(block.tokens) ? block.tokens : [];
    const answerTokens = tokens.filter((token) => !token.isDistractor);
    const indexes = answerTokens.map((token) => token.correctIndex).sort((a, b) => a - b);

    assert.ok(answerTokens.length > 0, `${owner}:${block.id} has no answer tokens`);
    assert.deepEqual(
      indexes,
      Array.from({ length: answerTokens.length }, (_, index) => index),
      `${owner}:${block.id} needs contiguous correctIndex metadata for token diagnostics`
    );

    const normalizePhrase = (value) =>
      String(value || "")
        .toLocaleLowerCase("lt")
        .replace(/[„“”"'’?!.,;:()[\\]…]/g, "")
        .replace(/\\s+/g, " ")
        .trim();
    const rebuiltAnswer = [...answerTokens]
      .sort((a, b) => a.correctIndex - b.correctIndex)
      .map((token) => token.text)
      .join(" ");

    assert.equal(
      normalizePhrase(rebuiltAnswer),
      normalizePhrase(block.answerText),
      `${owner}:${block.id} correct tokens must rebuild answerText`
    );

    for (const token of tokens) {
      if (token.repairHint !== undefined) {
        assert.equal(typeof token.repairHint, "string", `${owner}:${block.id} repairHint must be text`);
        assert.ok(token.repairHint.trim().length > 0, `${owner}:${block.id} repairHint cannot be empty`);
      }
    }
  }
});

test("Scenario V2 nextStepId branches always target an authored step", () => {
  const owners = [
    ...modules.flatMap((module) => module.lessons || []),
    ...checkpoints,
  ];

  for (const owner of owners) {
    for (const block of owner.blocks || []) {
      if (block.type !== "scenario_v2") continue;
      const stepIds = new Set((block.steps || []).map((step) => step.id));
      for (const step of block.steps || []) {
        for (const option of step.options || []) {
          if (!option.nextStepId) continue;
          assert.ok(
            stepIds.has(option.nextStepId),
            `${block.id}:${step.id} points to missing nextStepId ${option.nextStepId}`
          );
        }
      }
    }
  }
});

test("Scenario V2 branch steps may use finalSystemLine only when explicit branches bypass it", () => {
  const m=createModule32();
  const lesson=m.lessons.find((l)=>l.code==="3.2.4");
  const scenario=lesson.blocks.find((b)=>b.id==="s3m2l4_b6_v2");
  const offer=scenario.steps.find((s)=>s.id==="step_2_offer");

  assert.ok(offer.finalSystemLine);
  assert.ok(offer.options.some((option)=>option.nextStepId==="step_3"));
  assert.ok(offer.options.some((option)=>option.progresses===true && !option.nextStepId));
});

test("Scenario V2 finalSystemLine is terminal unless an option explicitly branches onward", () => {
  const owners = [
    ...modules.flatMap((module) => module.lessons || []),
    ...checkpoints,
  ];

  for (const owner of owners) {
    for (const block of owner.blocks || []) {
      if (block.type !== "scenario_v2") continue;
      const steps = Array.isArray(block.steps) ? block.steps : [];
      steps.forEach((step, index) => {
        if (!step.finalSystemLine || index === steps.length - 1) return;
        const progressing = (step.options || []).filter((option) =>
          option?.result === "best" ||
          option?.result === "acceptable" ||
          option?.result === "awkward" ||
          (option?.result === "repair" && option?.progresses === true)
        );
        assert.ok(
          progressing.some((option) => option.nextStepId),
          `${block.id} uses finalSystemLine before the last step without an explicit onward branch`
        );
        assert.ok(
          progressing.some((option) => !option.nextStepId),
          `${block.id} has an unreachable intermediate finalSystemLine because every progressing answer branches onward`
        );
      });
    }
  }
});

test("every Build Phrase distractor has a learner-facing meaning", () => {
  const owners = [
    ...modules.flatMap((module) => module.lessons || []),
    ...checkpoints,
  ];
  const missing = [];

  for (const owner of owners) {
    for (const block of owner.blocks || []) {
      if (block.type !== "build_phrase") continue;
      for (const token of block.tokens || []) {
        if (!token.isDistractor) continue;
        if (!getBuildPhraseDistractorMeaning(token.text)) {
          missing.push(`${owner.code || owner.id}:${block.id} “${token.text}”`);
        }
      }
    }
  }

  assert.deepEqual(missing, []);
});


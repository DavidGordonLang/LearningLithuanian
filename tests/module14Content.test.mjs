import test from "node:test";
import assert from "node:assert/strict";
import createModule_1_4 from "../src/content/learning/section1/module_1_4.js";

function getLesson(module, code) {
  return module.lessons.find((lesson) => lesson.code === code);
}

function getBlock(lesson, id) {
  return lesson.blocks.find((block) => block.id === id);
}

function scenarioBlocks(module) {
  return module.lessons.flatMap((lesson) => lesson.blocks).filter((block) => block.type === "scenario_v2");
}

test("1.4.2 resolves this/that ambiguity through physical čia/ten context", () => {
  const module = createModule_1_4();
  const lesson = getLesson(module, "1.4.2");
  const learn = getBlock(lesson, "s1m4l2_b1");
  const phrases = learn.items.map((item) => item.lt);

  assert.ok(phrases.includes("Ar čia…?"));
  assert.ok(phrases.includes("Ar ten…?"));
  assert.equal(phrases.some((text) => text.startsWith("Ar tai")), false);

  const here = getBlock(lesson, "s1m4l2_b2");
  const there = getBlock(lesson, "s1m4l2_b3");
  assert.equal(here.type, "context_gap_select");
  assert.equal(here.options.find((o) => o.isCorrect).text, "Ar čia");
  assert.equal(there.type, "context_gap_select");
  assert.equal(there.options.find((o) => o.isCorrect).text, "Ar ten");
});

test("1.4.2 scenario stays on identification rather than borrowing the next directions lesson", () => {
  const module = createModule_1_4();
  const scenario = getBlock(getLesson(module, "1.4.2"), "s1m4l2_b7_v2");
  const serialized = JSON.stringify(scenario);

  assert.equal(serialized.includes("Kur yra restoranas"), false);
  assert.match(scenario.steps[1].speakerText, /ten parduotuvė/);
  assert.match(scenario.steps[1].speakerText, /Restoranas čia/);
});

test("1.4.3 teaches full Kur yra first, recognises omission later, and uses Va ten", () => {
  const module = createModule_1_4();
  const lesson = getLesson(module, "1.4.3");
  assert.match(lesson.notes.pattern, /without yra/);
  assert.ok(getBlock(lesson, "s1m4l3_b1").items.some((item) => item.lt === "Va ten"));

  const scenario = getBlock(lesson, "s1m4l3_b7_v2");
  assert.equal(scenario.participants[0].name, "Austėja");
  assert.equal(scenario.objects[0].lt, "viešbutis");
  assert.equal(scenario.steps[1].speakerText, "Viešbutis — va ten.");
  assert.equal(scenario.steps[1].help.levels.at(-1).spokenLanguage, "en");
  assert.equal(scenario.steps[1].help.levels.at(-1).audio, false);
});

test("1.4.4 uses a café server and treats declining coffee as a valid answer", () => {
  const module = createModule_1_4();
  const scenario = getBlock(getLesson(module, "1.4.4"), "s1m4l4_b7_v2");
  assert.equal(scenario.participants[0].role, "server");
  assert.equal(scenario.objects.length, 1);
  assert.equal(scenario.steps[2].speakerText, "Ar norite kavos?");
  assert.ok(scenario.steps[2].help);
  assert.ok(scenario.steps[2].options.some((option) => option.text === "Ne, ačiū." && option.result === "acceptable"));
  assert.equal(scenario.steps[2].help.levels.at(-1).audio, false);
});

test("1.4.5 uses a recognition mechanic instead of the contrived introduction scenario", () => {
  const module = createModule_1_4();
  const lesson = getLesson(module, "1.4.5");
  const finalBlock = getBlock(lesson, "s1m4l5_b6_v2");

  assert.equal(finalBlock.type, "conversation_turn_fill");
  assert.equal(finalBlock.options.find((option) => option.isCorrect).text, "jūsų");
  assert.match(lesson.notes.pattern, /unfamiliar adult/);
  assert.equal(lesson.notes.pattern.includes("older people"), false);
});

test("Module 1.4 scenarios use Nesuprantu through authored help rather than wrong-answer distractors", () => {
  const module = createModule_1_4();

  for (const scenario of scenarioBlocks(module)) {
    for (const step of scenario.steps || []) {
      for (const option of step.options || []) {
        assert.equal(/nesuprantu/i.test(option.text || ""), false, `${scenario.id} should not author Nesuprantu as a normal option`);
        assert.notEqual(option.result, "repair", `${scenario.id} should not use legacy repair results`);
      }
    }
  }
});

test("Module 1.4 checkpoint retrieves čia/ten, Va ten and escalating help", () => {
  const module = createModule_1_4();
  const checkpoint = getLesson(module, "1.4.C");
  const spatial = getBlock(checkpoint, "s1m4c_b3");
  assert.equal(spatial.options.find((option) => option.isCorrect).text, "Ar ten stotis?");

  const scenario = getBlock(checkpoint, "s1m4c_b7_v2");
  assert.equal(scenario.steps[1].speakerText, "Bankas — va ten.");
  assert.equal(scenario.steps[1].help.levels.length, 3);
  assert.equal(scenario.steps[1].help.levels.at(-1).spokenLanguage, "en");
  assert.equal(scenario.steps[1].help.levels.at(-1).audio, false);

  const pairs = getBlock(checkpoint, "s1m4c_b8").pairs;
  assert.ok(pairs.some((pair) => pair.lt === "Va ten"));
  assert.ok(pairs.some((pair) => pair.lt === "Ar čia…?"));
  assert.equal(pairs.some((pair) => pair.lt === "Ar tai…?"), false);
});

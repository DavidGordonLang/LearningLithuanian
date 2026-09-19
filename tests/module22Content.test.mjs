import test from "node:test";
import assert from "node:assert/strict";
import createModule_2_2 from "../src/content/learning/section2/module_2_2.js";

function getLesson(module, code) {
  return module.lessons.find((lesson) => lesson.code === code);
}
function getBlock(lesson, id) {
  return lesson.blocks.find((block) => block.id === id);
}
function scenarios(module) {
  return module.lessons.flatMap((lesson) => lesson.blocks).filter((block) => block.type === "scenario_v2");
}

test("Module 2.2 is consolidated to four lessons plus checkpoint", () => {
  const module = createModule_2_2();
  assert.equal(module.lessonCount, 4);
  assert.deepEqual(module.lessons.map((lesson) => lesson.code), ["2.2.1", "2.2.2", "2.2.3", "2.2.4", "2.2.C"]);
});

test("2.2.1 treats Can I and Can We as applied retrieval rather than two repeated lessons", () => {
  const module = createModule_2_2();
  const lesson = getLesson(module, "2.2.1");
  assert.equal(lesson.title, "Can I or Can We?");
  assert.deepEqual(
    lesson.blocks.map((block) => block.type),
    ["learn", "context_gap_select", "context_gap_select", "listen_mcq", "conversation_turn_fill", "speak_self_check"]
  );
  assert.equal(getBlock(lesson, "s2m2l1_b2").options.find((o) => o.isCorrect).text, "galiu");
  assert.equal(getBlock(lesson, "s2m2l1_b3").options.find((o) => o.isCorrect).text, "galime");
});

test("2.2.2 keeps Can You as the public request frame without unrelated transport vocabulary", () => {
  const module = createModule_2_2();
  const lesson = getLesson(module, "2.2.2");
  const items = getBlock(lesson, "s2m2l3_b1").items.map((item) => item.lt);
  assert.ok(items.includes("Ar galite parodyti?"));
  assert.ok(items.includes("Ar galite pakartoti?"));
  assert.equal(items.includes("Kelias"), false);
  assert.equal(items.includes("Taksi"), false);
});

test("2.2.3 uses concise galiu and negaliu production forms and Nesuprantu help", () => {
  const module = createModule_2_2();
  const lesson = getLesson(module, "2.2.3");
  const items = getBlock(lesson, "s2m2l4_b1").items.map((item) => item.lt);
  assert.ok(items.includes("Galiu…"));
  assert.ok(items.includes("Negaliu…"));
  assert.equal(items.includes("Aš negaliu suprasti."), false);

  const scenario = getBlock(lesson, "s2m2l4_b7_v2");
  assert.equal(scenario.steps[0].help.levels.length, 3);
  assert.equal(scenario.steps[0].help.levels.at(-1).spokenLanguage, "en");
  assert.equal(scenario.steps[0].help.levels.at(-1).audio, false);
});

test("2.2.4 distinguishes impersonal Ar galima from personal Ar galiu", () => {
  const module = createModule_2_2();
  const lesson = getLesson(module, "2.2.4");
  assert.match(lesson.notes.pattern, /without focusing on a particular person/);
  const contrast = getBlock(lesson, "s2m2l5_b3");
  assert.equal(contrast.type, "context_gap_select");
  assert.equal(contrast.options.find((o) => o.isCorrect).text, "Ar galima");
  assert.equal(lesson.notes.usage.some((line) => line.includes("Ar galima dabar?")), false);
});

test("Module 2.2 scenarios never author Nesuprantu as a wrong answer", () => {
  const module = createModule_2_2();
  for (const scenario of scenarios(module)) {
    for (const step of scenario.steps || []) {
      for (const option of step.options || []) {
        assert.equal(/nesuprantu/i.test(option.text || ""), false, `${scenario.id} should use authored help rather than a normal Nesuprantu option`);
        assert.notEqual(option.result, "repair");
      }
    }
  }
});

test("2.2 checkpoint retrieves I/we and you distinctions without payment dominating the scenario", () => {
  const module = createModule_2_2();
  const checkpoint = getLesson(module, "2.2.C");
  const scenario = getBlock(checkpoint, "s2m2c_b6_v2");
  const serialized = JSON.stringify(scenario);

  assert.equal(getBlock(checkpoint, "s2m2c_b1").options.find((o) => o.isCorrect).text, "galime");
  assert.match(scenario.steps[0].options.find((o) => o.result === "best").text, /Ar galime/);
  assert.match(scenario.steps[1].options.find((o) => o.result === "best").text, /Ar galite parodyti/);
  assert.equal(serialized.includes("grynųjų"), false);
  assert.equal(serialized.includes("bilieto"), false);
});

test("2.2 checkpoint word match reflects the consolidated curriculum", () => {
  const module = createModule_2_2();
  const pairs = getBlock(getLesson(module, "2.2.C"), "s2m2c_b7").pairs;
  const texts = pairs.map((pair) => pair.lt);
  assert.equal(pairs.length, 20);
  assert.ok(texts.includes("Ar galiu…?"));
  assert.ok(texts.includes("Ar galime…?"));
  assert.ok(texts.includes("Ar galite parodyti?"));
  assert.ok(texts.includes("Galiu…"));
  assert.ok(texts.includes("Negaliu…"));
  assert.ok(texts.includes("Ar galima…?"));
  assert.equal(new Set(texts).size, texts.length);
});

import test from "node:test";
import assert from "node:assert/strict";
import createModule_2_3 from "../src/content/learning/section2/module_2_3.js";

function getLesson(module, code) {
  return module.lessons.find((lesson) => lesson.code === code);
}
function getBlock(lesson, id) {
  return lesson.blocks.find((block) => block.id === id);
}
function scenarios(module) {
  return module.lessons.flatMap((lesson) => lesson.blocks).filter((block) => block.type === "scenario_v2");
}

test("Module 2.3 is reduced to singular demonstratives, singular selection and checkpoint", () => {
  const module = createModule_2_3();
  assert.equal(module.lessonCount, 3);
  assert.deepEqual(module.lessons.map((lesson) => lesson.code), ["2.3.1", "2.3.2", "2.3.C"]);
});

test("2.3.1 grounds this/that in physical distance and noun gender", () => {
  const module = createModule_2_3();
  const lesson = getLesson(module, "2.3.1");
  const items = getBlock(lesson, "s2m3l1_b1").items.map((item) => item.lt);

  assert.ok(items.includes("Šitas obuolys"));
  assert.ok(items.includes("Tas obuolys"));
  assert.ok(items.includes("Šita duona"));
  assert.ok(items.includes("Ta duona"));

  assert.equal(getBlock(lesson, "s2m3l1_b2").options.find((o) => o.isCorrect).text, "Šitas");
  assert.equal(getBlock(lesson, "s2m3l1_b3").options.find((o) => o.isCorrect).text, "Ta");
});

test("2.3.2 makes masculine and feminine singular selection forms explicit", () => {
  const module = createModule_2_3();
  const lesson = getLesson(module, "2.3.2");
  const items = getBlock(lesson, "s2m3l2_b1").items.map((item) => item.lt);

  for (const phrase of ["Noriu šito.", "Noriu to.", "Noriu šitos.", "Noriu tos."]) {
    assert.ok(items.includes(phrase), `missing ${phrase}`);
  }

  assert.equal(getBlock(lesson, "s2m3l2_b2").options.find((o) => o.isCorrect).text, "šito");
  assert.equal(getBlock(lesson, "s2m3l2_b3").options.find((o) => o.isCorrect).text, "tos");
});

test("2.3 defers plural demonstratives and comparison-heavy shopping language", () => {
  const module = createModule_2_3();
  const serialized = JSON.stringify(module);

  for (const deferred of ["Šitie", "Tie", "šitų", "tų", "Kurie?", "geresnis", "Geresnis", "Batai", "Dydis"]) {
    assert.equal(serialized.includes(deferred), false, `Module 2.3 should defer ${deferred}`);
  }
});

test("2.3 selection scenario uses explicit feminine context and authored Nesuprantu help", () => {
  const module = createModule_2_3();
  const scenario = getBlock(getLesson(module, "2.3.2"), "s2m3l2_b7_v2");

  assert.equal(scenario.objects[0].lt, "duona");
  assert.equal(scenario.objects[0].gender, "feminine");
  assert.ok(scenario.steps[0].options.some((o) => o.text === "Noriu tos, prašau." && o.result === "best"));
  assert.equal(scenario.steps[1].help.levels.length, 3);
  assert.equal(scenario.steps[1].help.levels.at(-1).spokenLanguage, "en");
  assert.equal(scenario.steps[1].help.levels.at(-1).audio, false);
});

test("2.3 checkpoint retrieves the masculine counterpart and current result semantics", () => {
  const module = createModule_2_3();
  const checkpoint = getLesson(module, "2.3.C");
  const scenario = getBlock(checkpoint, "s2m3c_b6_v2");

  assert.equal(scenario.objects[0].lt, "obuolys");
  assert.equal(scenario.objects[0].gender, "masculine");
  assert.ok(scenario.steps[0].options.some((o) => o.text === "Noriu šito, prašau." && o.result === "best"));
  assert.ok(scenario.steps[2].options.some((o) => o.text === "Viso gero!" && o.result === "acceptable"));
});

test("Module 2.3 scenarios never author Nesuprantu as a normal answer", () => {
  const module = createModule_2_3();
  for (const scenario of scenarios(module)) {
    for (const step of scenario.steps || []) {
      for (const option of step.options || []) {
        assert.equal(/nesuprantu/i.test(option.text || ""), false);
        assert.notEqual(option.result, "repair");
      }
    }
  }
});

test("2.3 checkpoint vocabulary contains only singular near/far and selection forms", () => {
  const module = createModule_2_3();
  const pairs = getBlock(getLesson(module, "2.3.C"), "s2m3c_b7").pairs;
  const texts = pairs.map((pair) => pair.lt);

  assert.equal(pairs.length, 16);
  assert.ok(texts.includes("Šitas"));
  assert.ok(texts.includes("Šita"));
  assert.ok(texts.includes("Noriu šito."));
  assert.ok(texts.includes("Noriu šitos."));
  assert.equal(new Set(texts).size, texts.length);
});

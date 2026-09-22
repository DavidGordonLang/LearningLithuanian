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
  assert.equal(module.lessonCount, 2);
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

test("2.3.1 teaches a usable noun-gender clue before the first scored form choice", () => {
  const module = createModule_2_3();
  const lesson = getLesson(module, "2.3.1");
  const learn = getBlock(lesson, "s2m3l1_b1");

  assert.match(lesson.notes.pattern, /-as, -ys and -us are commonly masculine/);
  assert.match(lesson.notes.pattern, /-a is commonly feminine/);
  assert.match(lesson.notes.pattern, /shortcut, not a perfect rule/);
  assert.ok(lesson.notes.usage.some((line) => /Barbora.*-a.*feminine/.test(line)));
  assert.ok(lesson.notes.usage.some((line) => /Rokas.*-as.*masculine/.test(line)));
  assert.ok(lesson.notes.usage.some((line) => /Vanduo.*masculine/.test(line)));

  assert.ok(learn.items.some((item) =>
    item.lt === "Obuolys" && /masculine \(-ys ending\)/.test(item.en)
  ));
  assert.ok(learn.items.some((item) =>
    item.lt === "Duona" && /feminine \(-a ending\)/.test(item.en)
  ));

  assert.equal(lesson.blocks[0].id, "s2m3l1_b1");
  assert.equal(lesson.blocks[1].id, "s2m3l1_b2");
});

test("2.3.2 adds feminine selection forms and retrieves the already-taught masculine forms", () => {
  const module = createModule_2_3();
  const lesson = getLesson(module, "2.3.2");
  const items = getBlock(lesson, "s2m3l2_b1").items.map((item) => item.lt);

  assert.ok(items.includes("Noriu šitos."));
  assert.ok(items.includes("Noriu tos."));
  assert.equal(items.includes("Noriu šito."), false);
  assert.equal(items.includes("Noriu to."), false);

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

test("2.3 confirmation prompts state the physical choice directly without blaming the learner", () => {
  const module = createModule_2_3();
  const loaf = getBlock(getLesson(module, "2.3.2"), "s2m3l2_b7_v2");
  const apple = getBlock(getLesson(module, "2.3.C"), "s2m3c_b6_v2");

  assert.match(loaf.steps[1].learnerPrompt, /nearby loaf/);
  assert.match(loaf.steps[1].learnerPrompt, /Bread = duona/);
  assert.match(loaf.steps[1].learnerPrompt, /farther away/);
  assert.match(loaf.steps[1].learnerPrompt, /Say no/);
  assert.doesNotMatch(loaf.steps[1].learnerPrompt, /Correct the choice|Nesuprantu|feminine/);

  assert.match(apple.steps[1].learnerPrompt, /nearby apple/);
  assert.match(apple.steps[1].learnerPrompt, /Apple = obuolys/);
  assert.match(apple.steps[1].learnerPrompt, /confirm it/i);
  assert.doesNotMatch(apple.steps[1].learnerPrompt, /Nesuprantu|masculine/);
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

test("2.3 checkpoint ends with a 20-pair recap including spaced retrieval", () => {
  const module = createModule_2_3();
  const checkpoint = getLesson(module, "2.3.C");
  const pairs = getBlock(checkpoint, "s2m3c_b7").pairs;
  const texts = pairs.map((pair) => pair.lt);

  assert.equal(checkpoint.blocks.at(-1).type, "word_match");
  assert.equal(pairs.length, 20);
  assert.ok(texts.includes("Šitas"));
  assert.ok(texts.includes("Šita"));
  assert.ok(texts.includes("Noriu šito."));
  assert.ok(texts.includes("Noriu šitos."));
  for (const retained of [
    "Man reikia bilieto.",
    "Ar galite parodyti?",
    "Negaliu eiti.",
    "Ar galima mokėti kortele?",
  ]) {
    assert.ok(texts.includes(retained), `2.3 recap should retrieve ${retained}`);
  }
  assert.equal(new Set(texts).size, texts.length);
});

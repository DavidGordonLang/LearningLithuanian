import test from "node:test";
import assert from "node:assert/strict";
import createModule_2_4 from "../src/content/learning/section2/module_2_4.js";

function getLesson(module, code) {
  return module.lessons.find((lesson) => lesson.code === code);
}
function getBlock(lesson, id) {
  return lesson.blocks.find((block) => block.id === id);
}
function scenarios(module) {
  return module.lessons.flatMap((lesson) => lesson.blocks).filter((block) => block.type === "scenario_v2");
}

test("Module 2.4 is reduced to What, Where, Who and checkpoint", () => {
  const module = createModule_2_4();
  assert.equal(module.lessonCount, 3);
  assert.deepEqual(module.lessons.map((lesson) => lesson.code), ["2.4.1", "2.4.2", "2.4.3", "2.4.C"]);
});

test("2.4.1 removes Ko jums reikia from the service teaching and uses Kuo galėčiau padėti", () => {
  const module = createModule_2_4();
  const lesson = getLesson(module, "2.4.1");
  const serialized = JSON.stringify(lesson);

  assert.equal(serialized.includes("Ko jums reikia"), false);
  assert.ok(getBlock(lesson, "s2m4l1_b1").items.some((item) => item.lt === "Kuo galėčiau padėti?"));

  const scenario = getBlock(lesson, "s2m4l1_b5_v2");
  assert.equal(scenario.steps[0].speakerText, "Laba diena! Kuo galėčiau padėti?");
  assert.equal(scenario.steps[0].help.levels.at(-1).spokenLanguage, "en");
  assert.equal(scenario.steps[0].help.levels.at(-1).audio, false);
});

test("2.4.1 help-desk scenario gives the learner a concrete need before asking for a response", () => {
  const module = createModule_2_4();
  const lesson = getLesson(module, "2.4.1");
  const scenario = getBlock(lesson, "s2m4l1_b5_v2");

  assert.match(scenario.description, /need a ticket/i);
  assert.match(scenario.sceneIntro, /need a ticket/i);
  assert.match(scenario.steps[0].sceneDirection, /need a ticket/i);
  assert.equal(scenario.steps[0].learnerPrompt, "You need a ticket. Tell her what you need.");
  assert.doesNotMatch(scenario.steps[0].learnerPrompt, /Nesuprantu/);
  assert.ok(scenario.steps[0].options.some((option) =>
    option.text === "Man reikia bilieto." && option.result === "best"
  ));
});


test("2.4.2 foregrounds natural Kur gyvenate while keeping explicit jūs as valid", () => {
  const module = createModule_2_4();
  const lesson = getLesson(module, "2.4.2");

  assert.ok(getBlock(lesson, "s2m4l2_b1").items.some((item) => item.lt === "Kur gyvenate?"));
  assert.match(lesson.notes.pattern, /Kur jūs gyvenate\? is also correct/);

  const scenario = getBlock(lesson, "s2m4l2_b6_v2");
  assert.ok(scenario.steps[0].options.some((o) => o.text.includes("Kur gyvenate?") && o.result === "best"));
  assert.ok(scenario.steps[0].options.some((o) => o.text.includes("Kur jūs gyvenate?") && o.result === "acceptable"));
});

test("2.4.3 uses Kas jis and Kas ji for people, not Kas čia", () => {
  const module = createModule_2_4();
  const lesson = getLesson(module, "2.4.3");
  const items = getBlock(lesson, "s2m4l3_b1").items.map((item) => item.lt);

  assert.ok(items.includes("Kas jis?"));
  assert.ok(items.includes("Kas ji?"));
  assert.equal(items.includes("Kas čia?"), false);
  assert.match(lesson.notes.pattern, /do not use them as the beginner person-identification target/);
  assert.ok(items.includes("Jis mano kaimynas."));
  assert.ok(items.includes("Ji mano kaimynė."));
});

test("Module 2.4 defers When and How Much to Section 3", () => {
  const module = createModule_2_4();
  const serialized = JSON.stringify(module);

  for (const deferred of ["Kada?", "Kada pradedame?", "Kiek?", "Kiek tai kainuoja?", "Brangu.", "Nebrangiai."]) {
    assert.equal(serialized.includes(deferred), false, `Module 2.4 should defer ${deferred}`);
  }
});

test("Module 2.4 scenarios use authored help rather than normal Nesuprantu answers", () => {
  const module = createModule_2_4();
  for (const scenario of scenarios(module)) {
    for (const step of scenario.steps || []) {
      for (const option of step.options || []) {
        assert.equal(/nesuprantu/i.test(option.text || ""), false);
        assert.notEqual(option.result, "repair");
      }
    }
  }
});

test("2.4 checkpoint keeps What, Where and Who as the core and ends with a 20-pair recap", () => {
  const module = createModule_2_4();
  const checkpoint = getLesson(module, "2.4.C");
  const serialized = JSON.stringify(checkpoint);

  assert.equal(serialized.includes("Kada"), false);
  assert.equal(serialized.includes("Kiek"), false);
  assert.equal(serialized.includes("Ko jums reikia"), false);

  const scenario = getBlock(checkpoint, "s2m4c_b6_v2");
  assert.equal(scenario.steps[0].speakerText, "Laba diena! Kuo galėčiau padėti?");
  assert.equal(scenario.steps[2].options.find((o) => o.result === "best").text, "Kas jis?");
  assert.equal(scenario.steps[0].help.levels.at(-1).audio, false);

  const pairs = getBlock(checkpoint, "s2m4c_b7").pairs;
  const texts = pairs.map((pair) => pair.lt);
  assert.equal(checkpoint.blocks.at(-1).type, "word_match");
  assert.equal(pairs.length, 20);
  assert.ok(texts.includes("Kur gyvenate?"));
  assert.ok(texts.includes("Kas ji?"));
  for (const retained of [
    "Noriu kavos.",
    "Man reikia bilieto.",
    "Ar galite parodyti?",
    "Negaliu eiti.",
    "Ar galima mokėti kortele?",
    "Šitas obuolys",
    "Noriu šitos.",
    "Tos, prašau.",
  ]) {
    assert.ok(texts.includes(retained), `2.4 recap should retrieve ${retained}`);
  }
  assert.equal(new Set(texts).size, texts.length);
});

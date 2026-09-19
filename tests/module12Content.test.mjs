import test from "node:test";
import assert from "node:assert/strict";
import createModule_1_2 from "../src/content/learning/section1/module_1_2.js";

function getLesson(module, code) {
  return module.lessons.find((lesson) => lesson.code === code);
}

function getBlock(lesson, id) {
  return lesson.blocks.find((block) => block.id === id);
}

test("Module 1.2 adds People Around You with the intended learning mechanics", () => {
  const module = createModule_1_2();
  assert.equal(module.lessonCount, 6);

  const lesson = getLesson(module, "1.2.5");
  assert.ok(lesson);
  assert.deepEqual(
    lesson.blocks.map((block) => block.type),
    ["learn", "word_match", "listen_mcq", "context_gap_select", "build_phrase", "speak_self_check"]
  );

  const taught = getBlock(lesson, "s1m2l5_b1").items.map((item) => item.lt);
  assert.deepEqual(taught, ["Vyras", "Moteris", "Berniukas", "Mergaitė", "Brolis", "Sesuo"]);
});

test("personalised origin questions never duplicate the learner's own country", () => {
  const module = createModule_1_2({
    userFromPhrase: "Aš esu iš Lietuvos",
    userFromCountryLtGenitive: "Lietuvos",
    userFromCountryLabelEn: "Lithuania",
  });
  const lesson = getLesson(module, "1.2.2");

  const listenOptions = getBlock(lesson, "s1m2l2_b2").options.map((option) => option.text);
  assert.equal(new Set(listenOptions).size, listenOptions.length);

  const buildTokens = getBlock(lesson, "s1m2l2_b5").tokens.map((token) => token.text);
  assert.equal(new Set(buildTokens).size, buildTokens.length);
  assert.ok(buildTokens.includes("Lietuvos"));
});

test("origin scenario has a conversational bridge before the goodbye", () => {
  const module = createModule_1_2();
  const lesson = getLesson(module, "1.2.2");
  const scenario = getBlock(lesson, "s1m2l2_b7_v2");

  assert.equal(scenario.steps.length, 3);
  assert.equal(scenario.steps[1].speakerText, "Kaip sekasi?");
  assert.equal(scenario.steps[2].speakerText, "Viso gero!");
});

test("Module 1.2 checkpoint retrieves people language without growing the checkpoint", () => {
  const module = createModule_1_2();
  const checkpoint = getLesson(module, "1.2.C");
  assert.equal(checkpoint.blocks.length, 10);

  assert.equal(getBlock(checkpoint, "s1m2c_b2").prompt.text, "Moteris");
  assert.equal(getBlock(checkpoint, "s1m2c_b3").type, "context_gap_select");
  assert.equal(getBlock(checkpoint, "s1m2c_b4").prompt.text, "Ji yra mano sesuo");

  const matchPairs = getBlock(checkpoint, "s1m2c_b10").pairs;
  assert.equal(matchPairs.length, 20);
  for (const noun of ["Vyras", "Moteris", "Berniukas", "Mergaitė", "Brolis", "Sesuo"]) {
    assert.ok(matchPairs.some((pair) => pair.lt === noun), `checkpoint should contain ${noun}`);
  }
  assert.ok(matchPairs.some((pair) => pair.lt === "Labai malonu susipažinti"));
  assert.equal(matchPairs.some((pair) => pair.lt === "Labai malonu"), false);
});

test("Module 1.2 checkpoint scenario reuses the new people vocabulary naturally", () => {
  const module = createModule_1_2();
  const checkpoint = getLesson(module, "1.2.C");
  const scenario = getBlock(checkpoint, "s1m2c_b9_v2");

  assert.match(scenario.steps[2].speakerText, /mano sesuo/);
  assert.equal(scenario.steps[2].finalSystemLine.speakerText, "Man irgi!");
});


test("Module 1.2 scenarios do not use Pakartokite as a generic scenario distractor", () => {
  const module = createModule_1_2();
  const scenarioOptions = module.lessons
    .flatMap((lesson) => lesson.blocks)
    .filter((block) => block.type === "scenario_v2")
    .flatMap((block) => block.steps)
    .flatMap((step) => step.options || [])
    .map((option) => option.text);

  assert.equal(scenarioOptions.includes("Pakartokite, prašau"), false);
});

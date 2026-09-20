import test from "node:test";
import assert from "node:assert/strict";
import createModule_2_1 from "../src/content/learning/section2/module_2_1.js";

function getLesson(module, code) {
  return module.lessons.find((lesson) => lesson.code === code);
}

function getBlock(lesson, id) {
  return lesson.blocks.find((block) => block.id === id);
}

function scenarios(module) {
  return module.lessons.flatMap((lesson) => lesson.blocks).filter((block) => block.type === "scenario_v2");
}

test("2.1.1 keeps polite and casual want questions distinct and uses authored help", () => {
  const module = createModule_2_1();
  const lesson = getLesson(module, "2.1.1");
  const learn = getBlock(lesson, "s2m1l1_b1");
  const phrases = learn.items.map((item) => item.lt);

  assert.ok(phrases.includes("Ko norėtumėte?"));
  assert.ok(phrases.includes("Ko nori?"));
  assert.match(lesson.notes.pattern, /Aš noriu/);

  const scenario = getBlock(lesson, "s2m1l1_b6_v2");
  assert.equal(scenario.steps[0].speakerText, "Laba diena! Ko norėtumėte?");
  assert.equal(scenario.steps[0].help.levels.length, 3);
  assert.equal(scenario.steps[0].help.levels.at(-1).spokenLanguage, "en");
  assert.equal(scenario.steps[0].help.levels.at(-1).audio, false);
  assert.match(scenario.steps[1].sceneDirection, /places the coffee/);
});

test("2.1.2 makes Prašau a visible ticket handover", () => {
  const module = createModule_2_1();
  const scenario = getBlock(getLesson(module, "2.1.2"), "s2m1l2_b7_v2");

  assert.equal(scenario.steps[1].speakerText, "Prašau.");
  assert.match(scenario.steps[1].sceneDirection, /hands you the ticket/);
  assert.equal(scenario.steps.length, 2);
});

test("2.1.3 does not pull Ar galima payment language forward from Module 2.2", () => {
  const module = createModule_2_1();
  const lesson = getLesson(module, "2.1.3");
  const scenario = getBlock(lesson, "s2m1l3_b7_v2");
  const serialized = JSON.stringify(scenario);

  assert.equal(serialized.includes("Ar galima"), false);
  assert.equal(scenario.steps[0].speakerText, "Bilietas?");
  assert.ok(scenario.steps[0].options.some((option) => option.text === "Turiu bilietą." && option.result === "best"));
  const learnItems = getBlock(lesson, "s2m1l3_b1").items;
  assert.ok(learnItems.some((item) => item.lt === "Pinigai"));
  assert.ok(learnItems.some((item) => item.lt === "Tik" && item.en === "Only / just"));

  const testedAnswer = getBlock(lesson, "s2m1l3_b4").options.find((option) => option.isCorrect)?.text || "";
  assert.match(testedAnswer, /tik kortelę/i);
});

test("2.1.4 explains Ar as the beginner-safe frame without claiming it is always mandatory", () => {
  const module = createModule_2_1();
  const lesson = getLesson(module, "2.1.4");

  assert.match(lesson.notes.pattern, /beginner-safe/);
  assert.match(lesson.notes.pattern, /sometimes be omitted/);

  const scenario = getBlock(lesson, "s2m1l4_b7_v2");
  assert.equal(scenario.location, "café");
  assert.match(scenario.steps[2].sceneDirection, /places the coffee/);
});

test("2.1.4 teaches raktas in a hotel context instead of as orphan vocabulary", () => {
  const module = createModule_2_1();
  const lesson = getLesson(module, "2.1.4");
  const genericLearn = getBlock(lesson, "s2m1l4_b1");
  const hotelLearn = getBlock(lesson, "s2m1l4_b8");
  const hotelScenario = getBlock(lesson, "s2m1l4_b9_v2");

  assert.equal(genericLearn.items.some((item) => /rakt/i.test(item.lt)), false);
  assert.ok(hotelLearn.items.some((item) => item.lt === "Raktas" && item.en === "Key"));
  assert.ok(hotelLearn.items.some((item) => item.lt === "Kambario raktas" && item.en === "Room key"));
  assert.equal(hotelScenario.location, "hotel reception");
  assert.match(hotelScenario.steps[0].speakerText, /kambario raktas/i);
  assert.match(hotelScenario.steps[0].sceneDirection, /room key/i);
});

test("Module 2.1 scenarios no longer author Nesuprantu as a wrong answer", () => {
  const module = createModule_2_1();

  for (const scenario of scenarios(module)) {
    for (const step of scenario.steps || []) {
      for (const option of step.options || []) {
        assert.equal(/nesuprantu/i.test(option.text || ""), false, `${scenario.id} should use the help system instead of an authored Nesuprantu option`);
        assert.notEqual(option.result, "repair");
      }
    }
  }
});

test("2.1 checkpoint contains no untaught room/reservation/payment frame and uses help for the card question", () => {
  const module = createModule_2_1();
  const scenario = getBlock(getLesson(module, "2.1.C"), "s2m1c_b6_v2");
  const serialized = JSON.stringify(scenario);

  assert.equal(serialized.includes("rezervacij"), false);
  assert.equal(serialized.includes("kambari"), false);
  assert.equal(serialized.includes("Ar galima"), false);
  assert.equal(scenario.steps[1].speakerText, "Ar turite kortelę?");
  assert.equal(scenario.steps[1].help.levels.length, 3);
  assert.equal(scenario.steps[1].help.levels.at(-1).spokenLanguage, "en");
  assert.equal(scenario.steps[1].help.levels.at(-1).audio, false);
});

test("Module 2.1 checkpoint still keeps the workbook-reviewed polite water answer", () => {
  const module = createModule_2_1();
  const block = getBlock(getLesson(module, "2.1.C"), "s2m1c_b1");
  assert.equal(block.options.find((option) => option.isCorrect).text, "Noriu vandens, prašau.");
});


test("2.1.4 Say It Out Loud uses neutral STT vocabulary rather than the target phrase", () => {
  const lesson = getLesson(module, "2.1.4");
  const block = getBlock(lesson, "s2m1l4_b6");

  assert.deepEqual(block.transcriptionKeywords, [
    "Ar",
    "turite",
    "turi",
    "vandens",
    "kavos",
    "meniu",
    "turime",
    "neturime",
  ]);
  assert.equal(block.transcriptionKeywords.includes(block.targetText), false);
  assert.equal(block.transcriptionKeywords.includes("turi"), true);
  assert.equal(block.transcriptionKeywords.includes("kavos"), true);
});

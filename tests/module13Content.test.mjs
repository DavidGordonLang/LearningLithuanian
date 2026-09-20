import test from "node:test";
import assert from "node:assert/strict";
import createModule_1_3 from "../src/content/learning/section1/module_1_3.js";

function getLesson(module, code) {
  return module.lessons.find((lesson) => lesson.code === code);
}

function getBlock(lesson, id) {
  return lesson.blocks.find((block) => block.id === id);
}

function scenarioBlocks(module) {
  return module.lessons.flatMap((lesson) => lesson.blocks).filter((block) => block.type === "scenario_v2");
}

test("1.3.1 keeps both full and short Nesuprantu forms legitimate", () => {
  const module = createModule_1_3();
  const lesson = getLesson(module, "1.3.1");
  const learn = getBlock(lesson, "s1m3l1_b1");
  assert.ok(learn.items.some((item) => item.lt === "Aš nesuprantu"));
  assert.ok(learn.items.some((item) => item.lt === "Nesuprantu"));
  assert.match(getBlock(lesson, "s1m3l1_b4").feedback.correct, /Aš nesuprantu is also natural/);
});

test("1.3.1 introduces escalating Nesuprantu help with English audio suppressed at the last resort", () => {
  const module = createModule_1_3();
  const scenario = getBlock(getLesson(module, "1.3.1"), "s1m3l1_b7_v2");
  const levels = scenario.steps[0].help.levels;
  assert.equal(levels.length, 3);
  assert.equal(levels[0].speakerText, "Trečias aukštas.");
  assert.equal(levels[2].spokenLanguage, "en");
  assert.equal(levels[2].audio, false);
});

test("1.3.4 English fallback ends by continuing in English and reuses translation reveal", () => {
  const module = createModule_1_3();
  const lesson = getLesson(module, "1.3.4");
  const scenario = getBlock(lesson, "s1m3l4_b7_v2");
  const finalLine = scenario.steps.at(-1).finalSystemLine;

  assert.equal(finalLine.sceneDirection, "She switches to English and the conversation continues there.");
  assert.equal(finalLine.spokenLanguage, "en");
  assert.equal(finalLine.audio, false);
  assert.equal(finalLine.translationReveal.length, 2);
  assert.equal(finalLine.translationReveal[0].lt, "Laba diena. Kuo galiu padėti?");
  assert.equal(finalLine.translationReveal[0].en, "Good afternoon. How can I help you?");
  assert.equal(finalLine.translationReveal[1].lt, "Taip, truputį.");
  assert.equal(finalLine.translationReveal[1].en, "Yes, a little.");
});

test("1.3.2 separates pace repair from genuine comprehension repair", () => {
  const module = createModule_1_3();
  const lesson = getLesson(module, "1.3.2");
  assert.match(getBlock(lesson, "s1m3l2_b4").prompt.text, /speed is still the problem/);

  const scenario = getBlock(lesson, "s1m3l2_b8_v2");
  assert.equal(scenario.steps.length, 2);

  const paceStep = scenario.steps[0];
  assert.equal(paceStep.help, undefined);
  assert.ok(paceStep.options.some((option) => option.text === "Prašau kalbėkite lėčiau." && option.result === "best"));
  assert.ok(paceStep.options.some((option) => option.text === "Pakartokite, prašau." && option.result === "wrong"));

  const comprehensionStep = scenario.steps[1];
  assert.equal(comprehensionStep.speakerText, "Du kartus per dieną.");
  assert.equal(comprehensionStep.help.levels.length, 2);
  assert.equal(comprehensionStep.help.levels[0].speakerText, "Du kartus. Per dieną.");
  assert.match(comprehensionStep.help.levels[0].sceneDirection, /holds up two fingers/);
  assert.equal(comprehensionStep.help.levels.at(-1).spokenLanguage, "en");
  assert.equal(comprehensionStep.help.levels.at(-1).audio, false);
  assert.equal(comprehensionStep.help.levels.at(-1).translationReveal.length, 2);
  assert.ok(comprehensionStep.options.some((option) => option.text === "Supratau, ačiū!" && option.result === "best"));
});

test("1.3.3 teaches this versus that through physical context", () => {
  const module = createModule_1_3();
  const lesson = getLesson(module, "1.3.3");
  const far = getBlock(lesson, "s1m3l3_b3");
  const near = getBlock(lesson, "s1m3l3_b4");

  assert.equal(far.type, "context_gap_select");
  assert.match(far.prompt, /across the room/);
  assert.equal(far.options.find((option) => option.isCorrect).text, "Kas ten?");

  assert.equal(near.type, "context_gap_select");
  assert.match(near.prompt, /holding an unfamiliar object/);
  assert.equal(near.options.find((option) => option.isCorrect).text, "Kas tai?");
});

test("1.3.3 English fallback speech is text-only", () => {
  const module = createModule_1_3();
  const scenario = getBlock(getLesson(module, "1.3.3"), "s1m3l3_b7_v2");
  const helpLast = scenario.steps[1].help.levels.at(-1);
  const englishFollowUp = scenario.steps[1].options.find((option) => option.text === "Ką tai reiškia angliškai?").followUp;

  assert.equal(helpLast.spokenLanguage, "en");
  assert.equal(helpLast.audio, false);
  assert.equal(englishFollowUp.spokenLanguage, "en");
  assert.equal(englishFollowUp.audio, false);
});

test("1.3.4 stays on language fallback and does not jump ahead to directions", () => {
  const module = createModule_1_3();
  const scenario = getBlock(getLesson(module, "1.3.4"), "s1m3l4_b7_v2");
  const serialized = JSON.stringify(scenario);

  assert.equal(serialized.includes("Kur norite eiti"), false);
  assert.equal(serialized.includes("stotis"), false);
  assert.ok(scenario.steps[0].options.some((option) => option.text === "Ar jūs kalbate angliškai?" && option.result === "best"));
  assert.equal(scenario.steps[0].help.levels.length, 2);
});

test("Module 1.3 scenarios use the help system rather than legacy repair results", () => {
  const module = createModule_1_3();
  for (const scenario of scenarioBlocks(module)) {
    for (const step of scenario.steps) {
      for (const option of step.options || []) {
        assert.notEqual(option.result, "repair", `${scenario.id} should not use legacy repair result`);
      }
    }
  }
});

test("Module 1.3 checkpoint stays within taught content and uses text-only English when explicitly requested", () => {
  const module = createModule_1_3();
  const checkpoint = getLesson(module, "1.3.C");
  const scenario = getBlock(checkpoint, "s1m3c_b9_v2");
  const serialized = JSON.stringify(scenario);

  assert.equal(serialized.includes("autobusų stotelė"), false);
  assert.equal(serialized.includes("Kur yra"), false);
  assert.match(scenario.steps[2].speakerText, /Išėjimas/);
  const followUp = scenario.steps[2].options.find((option) => option.text === "Ką tai reiškia angliškai?").followUp;
  assert.equal(followUp.speakerText, "Exit.");
  assert.equal(followUp.spokenLanguage, "en");
  assert.equal(followUp.audio, false);
});

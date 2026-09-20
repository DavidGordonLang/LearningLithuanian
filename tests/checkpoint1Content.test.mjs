import test from "node:test";
import assert from "node:assert/strict";
import createCheckpoint1 from "../src/content/learning/section1/checkpoint_1.js";

function getBlock(checkpoint, id) {
  return checkpoint.blocks.find((block) => block.id === id);
}

test("Section 1 checkpoint retrieves the new people foundation", () => {
  const checkpoint = createCheckpoint1();
  assert.equal(getBlock(checkpoint, "s1c_b3").prompt.text, "Ji yra mano sesuo");

  const pairs = getBlock(checkpoint, "s1c_b17").pairs;
  for (const noun of ["Brolis", "Sesuo", "Moteris"]) {
    assert.ok(pairs.some((pair) => pair.lt === noun), `section checkpoint should contain ${noun}`);
  }
  assert.equal(pairs.length, 20);
});

test("Section 1 personalised origin speaking audio matches the learner", () => {
  const checkpoint = createCheckpoint1({
    userFromPhrase: "Aš esu iš Lietuvos",
    userFromCountryLabelEn: "Lithuania",
  });
  const block = getBlock(checkpoint, "s1c_b10");
  assert.equal(block.targetText, "Aš esu iš Lietuvos");
  assert.equal(block.audioText, "Aš esu iš Lietuvos");
});

test("Section 1 speed judgement is specific and does not overrule general Nesuprantu use", () => {
  const checkpoint = createCheckpoint1();
  const block = getBlock(checkpoint, "s1c_b12");
  assert.match(block.prompt.text, /speed is still the problem/);
  assert.equal(block.options.find((option) => option.isCorrect).text, "Prašau kalbėkite lėčiau.");
  assert.match(block.feedback.correct, /Nesuprantu remains your general fallback/);
});

test("Section 1 uses current čia/ten and tu/jūs guidance", () => {
  const checkpoint = createCheckpoint1();
  const spatial = getBlock(checkpoint, "s1c_b15");
  assert.equal(spatial.options.find((option) => option.isCorrect).text, "Ar ten restoranas?");
  assert.ok(spatial.options.some((option) => option.text === "Ar čia restoranas?"));

  const register = getBlock(checkpoint, "s1c_b14");
  assert.match(register.feedback.correct, /safe polite starting point/);
});

test("Section 1 scenario stays inside taught material and uses escalating Nesuprantu help", () => {
  const checkpoint = createCheckpoint1({ userNameSafe: "Davidas", userFromPhrase: "Aš esu iš Škotijos" });
  const scenario = getBlock(checkpoint, "s1c_b16_v2");
  const serialized = JSON.stringify(scenario);

  assert.equal(serialized.includes("Kur jūs einate"), false);
  assert.equal(scenario.steps.length, 5);
  assert.match(scenario.steps[2].speakerText, /mano sesuo/);
  assert.equal(scenario.steps[2].finalSystemLine, undefined);
  assert.equal(scenario.steps[2].options.find((option) => option.result === "best").followUp.speakerText, "Man irgi!");
  assert.equal(scenario.steps[3].speakerText, "Ar galiu jums padėti?");
  assert.match(scenario.steps[3].options.find((option) => option.result === "best").text, /Kur yra viešbutis/);
  assert.equal(scenario.steps[4].speakerText, "Viešbutis — va ten.");
  assert.equal(scenario.steps[4].help.levels.length, 3);
  assert.equal(scenario.steps[4].help.levels.at(-1).spokenLanguage, "en");
  assert.equal(scenario.steps[4].help.levels.at(-1).audio, false);

  for (const step of scenario.steps) {
    for (const option of step.options || []) {
      assert.equal(/nesuprantu/i.test(option.text || ""), false, "Nesuprantu should come from the help system, not a normal option");
      assert.notEqual(option.result, "repair");
    }
  }
});

test("Section 1 checkpoint vocabulary uses current high-value forms", () => {
  const checkpoint = createCheckpoint1();
  const pairs = getBlock(checkpoint, "s1c_b17").pairs;
  const texts = pairs.map((pair) => pair.lt);

  assert.ok(texts.includes("Nesuprantu"));
  assert.ok(texts.includes("Va ten"));
  assert.equal(texts.includes("Aš nesuprantu"), false);
  assert.equal(new Set(texts).size, texts.length);
});

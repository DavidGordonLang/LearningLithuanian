import test from "node:test";
import assert from "node:assert/strict";
import createSection1 from "../src/content/learning/section1/index.js";
import createSection2 from "../src/content/learning/section2/index.js";
import { buildSection1Profile } from "../src/content/learning/section1/profile.js";
import { choiceOptionsAreEnglish, getChoiceAnswerAudio, isSoftPassChoiceOption, isCorrectChoiceOption } from "../src/lib/trainingScoring.js";

const lessons = (section) => section.modules.flatMap((module) => module.isSectionCheckpoint ? [module] : module.lessons);
const lesson = (section, code) => lessons(section).find((item) => item.code === code);
const block = (unit, id) => unit.blocks.find((item) => item.id === id);

test("Section 1 origin bridges the profile's base form before its changed form without assigning it to Barbora", () => {
  for (const fromCountryCode of ["scotland", "lithuania", "england"]) {
    const profile = buildSection1Profile({ userName: "Milda", fromCountryCode });
    const section = createSection1(profile);
    const origin = lesson(section, "1.2.2");
    const learn = block(origin, "s1m2l2_b1");
    const base = learn.items.findIndex((item) => item.lt === profile.userFromCountryLtNominative);
    const from = learn.items.findIndex((item) => item.lt === profile.userFromPhrase);
    assert.ok(base >= 0 && from > base, `base before from-form for ${fromCountryCode}`);
    assert.match(origin.notes.pattern, new RegExp(profile.userFromCountryLtNominative));

    const friend = block(lesson(section, "1.2.4"), "s1m2l4_b8_v2");
    assert.match(friend.sceneIntro, /Barbora.*Lithuania/);
    assert.equal(friend.steps[1].options.find((option) => option.result === "best").text, "Ji yra iš Lietuvos.");
    assert.ok(friend.steps[1].options.some((option) => option.result === "wrong" && /Jis/.test(option.text)));
  }
});

test("early changed noun forms have a visible base anchor before the first changed Learn item", () => {
  const first = createSection1();
  const help = block(lesson(first, "1.4.1"), "s1m4l1_b1").items.map((item) => item.lt);
  assert.ok(help.indexOf("Pagalba") < help.indexOf("Man reikia pagalbos"));

  const second = createSection2();
  const wants = block(lesson(second, "2.1.1"), "s2m1l1_b1").items;
  assert.match(wants[0].en, /Coffee is kava; water is vanduo/);
  assert.ok(wants.findIndex((item) => item.lt === "Noriu kavos.") > 0);
  const has = block(lesson(second, "2.1.3"), "s2m1l3_b1").items;
  assert.match(has[0].en, /Cash is grynieji/);
  assert.ok(has.findIndex((item) => item.lt === "Laikas") < has.findIndex((item) => item.lt === "Neturiu laiko."));
  const pointing = block(lesson(second, "2.3.1"), "s2m3l1_b1").items.map((item) => item.lt);
  assert.ok(pointing.indexOf("Obuolys") < pointing.indexOf("Šitas obuolys"));
  assert.ok(pointing.indexOf("Duona") < pointing.indexOf("Šita duona"));
});

test("instruction comprehension assesses English meanings while authored Lithuanian stays in dialogue/audio", () => {
  const first = createSection1();
  for (const [code, id, bestMeaning] of [
    ["1.3.1", "s1m3l1_b7_v2", "Your room is on the third floor."],
    ["1.3.2", "s1m3l2_b8_v2", "Take the medicine twice a day."],
  ]) {
    const scenario = block(lesson(first, code), id);
    const step = scenario.steps.find((item) => item.interactionMode === "comprehension");
    const best = step.options.find((option) => option.result === "best");
    assert.equal(best.text, bestMeaning);
    assert.equal(best.learnerText, "Suprantu, ačiū!");
    assert.ok(step.options.filter((option) => option.result === "wrong").every((option) =>
      option.text !== best.text && option.feedback && !option.learnerText
    ));
    assert.ok(step.help?.levels?.length >= 2);
  }
  assert.ok(lessons(first).flatMap((unit) => unit.blocks).filter((item) => item.type === "scenario_v2")
    .flatMap((item) => item.steps).flatMap((item) => item.options || [])
    .every((option) => !/Supratau/.test(option.text || "")));
});

test("valid full replies progress softly; real meaning errors still fail", () => {
  const first = createSection1();
  const second = createSection2();
  for (const [unit, id] of [
    [lesson(first, "1.1.3"), "s1m1l3_b3b"],
    [lesson(first, "1.1.C"), "s1m1c_b5"],
    [lesson(first, "1.4.5"), "s1m4l5_b6_v2"],
    [lesson(second, "2.2.1"), "s2m2l1_b5"],
    [lesson(second, "2.4.2"), "s2m4l2_b5"],
  ]) {
    const options = block(unit, id).options;
    assert.equal(options.filter(isCorrectChoiceOption).length, 1, id);
    assert.equal(options.filter(isSoftPassChoiceOption).length, 1, id);
    assert.ok(options.some((option) => option.result === "wrong" || option.isCorrect === false), id);
    assert.ok(options.find(isSoftPassChoiceOption).feedback, id);
  }
  const intro = block(lesson(first, "1.2.1"), "s1m2l1_b7_v2");
  assert.equal(intro.steps[0].options.find((option) => option.text.includes("Aš esu")).result, "acceptable");
});

test("Section 1–2 authored English answer options have post-evaluation Lithuanian audio", () => {
  const sections = [createSection1(), createSection2()];
  for (const section of sections) for (const unit of lessons(section)) for (const item of unit.blocks) {
    if (!item.options || !["best_response", "recognise_mcq", "listen_mcq"].includes(item.type)) continue;
    const best = item.options.find(isCorrectChoiceOption);
    if (!best) continue;
    if (!choiceOptionsAreEnglish(item)) continue;
    const audio = getChoiceAnswerAudio(item, best, best);
    assert.ok(audio, `${unit.code}:${item.id}`);
    assert.notEqual(audio, best.text, `${unit.code}:${item.id} must not speak English option text`);
  }
  const checkpoint = block(lesson(sections[0], "1.C"), "s1c_b13");
  assert.equal(checkpoint.noOptionAudio, true);
  assert.equal(getChoiceAnswerAudio(checkpoint, checkpoint.options[1], checkpoint.options[1]), "Ar galiu jums padėti?");
});

test("early scenario feedback explains choices and changed full-response blocks retain IDs", () => {
  const first = createSection1();
  const second = createSection2();
  const scenarios = lessons(first).flatMap((unit) => unit.blocks).filter((item) => item.type === "scenario_v2");
  assert.ok(scenarios.flatMap((item) => item.steps).flatMap((step) => step.options || [])
    .filter((option) => option.result === "wrong").every((option) =>
      option.feedback !== "This does not fit the situation. Choose the response that matches the speaker."
    ));
  for (const [unit, id] of [
    [lesson(first, "1.4.5"), "s1m4l5_b6_v2"],
    [lesson(second, "2.2.1"), "s2m2l1_b5"],
    [lesson(second, "2.4.2"), "s2m4l2_b5"],
  ]) assert.equal(block(unit, id).type, "best_response");
});

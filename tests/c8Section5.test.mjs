import test from 'node:test';
import assert from 'node:assert/strict';
import create51 from '../src/content/learning/section5/module_5_1.js';
import create52 from '../src/content/learning/section5/module_5_2.js';
import create53 from '../src/content/learning/section5/module_5_3.js';
import create54 from '../src/content/learning/section5/module_5_4.js';
import create5c from '../src/content/learning/section5/checkpoint_5.js';

const units = [create51(), create52(), create53(), create54(), create5c()];
const lessons = units.flatMap(unit => unit.lessons ?? [unit]);
const blocks = lessons.flatMap(lesson => lesson.blocks);
const byId = id => {
  const block = blocks.find(item => item.id === id);
  assert.ok(block, `Missing ${id}`);
  return block;
};
const scenario = id => byId(id);
const lexical = text => text.toLocaleLowerCase('lt').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

test('Section 5 retains 25 chronological scenarios with local wrong feedback', () => {
  const scenes = blocks.filter(block => block.type === 'scenario_v2');
  assert.equal(scenes.length, 25);
  for (const scene of scenes) {
    assert.ok(scene.sceneIntro && scene.steps.length >= 2, scene.id);
    for (const [index, step] of scene.steps.entries()) {
      assert.ok(step.speakerText && step.learnerPrompt, `${scene.id} step ${index}`);
      assert.ok(step.options?.some(option => option.progresses), `${scene.id} step ${index}`);
      for (const option of step.options) {
        if (option.result !== 'wrong') continue;
        assert.ok(option.feedback?.trim(), `${scene.id} ${step.id} ${option.id}`);
        assert.doesNotMatch(option.feedback, /does not fit the situation|doesn't fit here|try another response/i);
      }
    }
  }
  const pharmacy = scenario('s5m2l2_b6_v2');
  assert.equal(pharmacy.location, 'street');
  assert.equal(pharmacy.participants[0].role, 'passer-by');
});

test('early receptive route decisions assess ordered English meanings, then insert Lithuanian', () => {
  const turns = [
    ['s5m1l4_b6_v2', 1], ['s5m1l5_b6_v2', 1], ['s5m1c_b6_v2', 1],
    ['s5m2l5_b5_v2', 1], ['s5m2c_b6_v2', 1], ['s5m3l2_b5_v2', 1],
    ['s5m4l1_b6_v2', 1], ['s5m4l4_b6_v2', 2],
  ];
  for (const [id, index] of turns) {
    const step = scenario(id).steps[index];
    assert.equal(step.interactionMode, 'comprehension', `${id} mode`);
    assert.doesNotMatch(`${step.sceneDirection} ${step.learnerPrompt}`, /straight.{0,25}(left|right)|left.{0,25}right|right.{0,25}left|turn (left|right)/i, `${id} spoiler`);
    const best = step.options.find(option => option.result === 'best');
    assert.ok(best, id);
    assert.match(best.text, /^(Go |Turn |The |Over )/i, `${id} assessment meaning`);
    assert.match(best.learnerText, /[ĄČĘĖĮŠŲŪŽąčęėįšųūž]|Ačiū|Suprantu/, `${id} Lithuanian dialogue`);
    assert.notEqual(best.learnerText, best.text);
    assert.ok(step.options.filter(option => option.result === 'wrong').every(option => !option.learnerText && !option.progresses));
    assert.ok(step.options.some(option => /then|left|right|straight/i.test(option.text) && option.result === 'wrong'), id);
  }
  // The learner still produces the route when a traveller asks them to give directions.
  const give = scenario('s5m4l3_b6_v2').steps[0];
  assert.notEqual(give.interactionMode, 'comprehension');
  assert.match(give.options.find(option => option.result === 'best').text, /Eikite tiesiai/);
  for (const id of ['s5m4l5_b5_v2', 's5m4c_b6_v2', 's5cp_b8_v2']) {
    const turn = scenario(id).steps[1];
    assert.equal(turn.interactionMode, 'comprehension');
    assert.ok(turn.options.find(option => option.result === 'best').learnerText);
  }
});

test('place/form assessment avoids incidental unseen language and grounds register', () => {
  const first = JSON.stringify(create51());
  assert.doesNotMatch(first, /autobusų stotis|traukinių stotis|Kur yra vaistinė/);
  for (const absent of ['stotyje', 'prie', 'Tai čia pat']) {
    assert.equal(JSON.stringify(units).includes(absent), false, absent);
  }
  assert.ok(lessons.find(lesson => lesson.code === '5.4.5').blocks.findIndex(block => block.id === 's5m4l5_b0') <
    lessons.find(lesson => lesson.code === '5.4.5').blocks.findIndex(block => block.id === 's5m4l5_b1'));
  assert.match(byId('s5m4l5_b0').items[0].en, /or/);
  const polite = byId('s5m3l4_b4');
  assert.match(polite.translation_en, /politely asking a stranger/i);
  assert.equal(polite.options.find(option => option.isCorrect).text, 'einate');
  assert.equal(JSON.stringify(byId('s5m3l5_b4')).includes('stotyje'), false);
});

test('valid thanks soft-pass while wrong destinations and roles fail', () => {
  for (const id of ['s5m1l3_b6_v2', 's5m2l4_b5_v2']) {
    const turn = scenario(id).steps[1];
    const thanks = turn.options.find(option => option.text === 'Ačiū!' || option.text === 'Ačiū labai!');
    assert.equal(thanks.result, 'awkward');
    assert.equal(thanks.progresses, true);
    assert.match(thanks.feedback, /distance|station|far/i);
    assert.ok(thanks.betterAnswer);
  }
  const airport = byId('s5cp_b6');
  assert.match(airport.prompt.text, /You are the traveller/);
  assert.equal(airport.options.find(option => option.isCorrect).text, 'Kur yra autobusų stotelė?');
  assert.equal(airport.options.find(option => option.text === 'Galite važiuoti autobusu.').isCorrect, false);
  assert.match(airport.feedback.correct, /traveller/i);
});

test('distance stance and beginner Pattern notes remain explicit', () => {
  assert.match(byId('s5m4l4_b3').prompt.text, /prefer not to walk for 20 minutes/i);
  assert.equal(byId('s5m4l4_b3').options.find(option => option.isCorrect).text, 'Galite važiuoti autobusu.');
  for (const id of ['s5m1l3_b6_v2', 's5m1c_b6_v2', 's5m2l1_b6_v2', 's5m2l3_b6_v2', 's5m2c_b6_v2']) {
    assert.match(scenario(id).sceneIntro, /walk/i, id);
  }
  const note = lessons.find(lesson => lesson.code === '5.3.3').notes.pattern;
  assert.match(note, /miestas means city; mieste means in the city/i);
  assert.doesNotMatch(note, /should not be tested|has not been taught/i);
  assert.equal(byId('s5m3c_b4').targetText, 'Aš einu iš viešbučio į stotį');
  assert.match(byId('s5m3c_b4').prompt, /from the hotel to the station/i);
  assert.match(byId('s5m4c_b4').targetText, /autobusų stotį\? Ar toli\?/);
});

test('displayed short distance questions agree lexically with authored audio', () => {
  const pairIds = [
    ['s5m1l3_b1', 'i3'], ['s5m1l3_b1', 'i4'],
    ['s5m1c_b7', 'm12'], ['s5m4c_b7', 'm4'], ['s5m4c_b7', 'm5'],
  ];
  for (const [blockId, itemId] of pairIds) {
    const block = byId(blockId);
    const item = [...(block.items ?? []), ...(block.pairs ?? [])].find(entry => entry.id === itemId);
    assert.ok(item, `${blockId}/${itemId}`);
    assert.equal(lexical(item.lt), lexical(item.audioText), `${blockId}/${itemId}`);
  }
  const spoken = byId('s5m1l3_b5');
  assert.equal(lexical(spoken.targetText), lexical(spoken.audioText));
});

test('English answer audio and Lithuanian choice metadata use the existing C2 path', () => {
  for (const id of ['s5m1l5_b4', 's5m2l5_b3']) {
    const block = byId(id);
    assert.equal(block.optionsLanguage, 'en');
    assert.equal(block.noOptionAudio, true);
    assert.match(block.answerAudioText, /[ĄČĘĖĮŠŲŪŽąčęėįšųūž]|Tualetas|Eikite/);
    assert.ok(block.options.every(option => /^[A-Za-z]/.test(option.text)));
  }
  const lt = byId('s5m2l5_b4');
  assert.equal(lt.optionsLanguage, 'lt');
  assert.notEqual(lt.noOptionAudio, true);
  assert.ok(lt.options.every(option => /^Kur yra/.test(option.text)));
});

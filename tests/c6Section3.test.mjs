import test from 'node:test';
import assert from 'node:assert/strict';
import createSection3 from '../src/content/learning/section3/index.js';
import { choiceOptionsAreEnglish, getChoiceAnswerAudio } from '../src/lib/trainingScoring.js';

const section = createSection3();
const lessons = section.modules.flatMap(module => module.isSectionCheckpoint ? [module] : module.lessons);
const lesson = code => lessons.find(item => item.code === code);
const block = (code, id) => lesson(code).blocks.find(item => item.id === id);
const scenario = (code, id) => block(code, id);
const progressing = step => step.options.filter(option => option.progresses);

test('all four deferred English choices have a Lithuanian post-answer source', () => {
  for (const [code, id, expected] of [
    ['3.C', 's3c_b1', 'penkiolika eurų'],
    ['3.1.2', 's3m1l2_b6', 'aštuoniolika'],
    ['3.1.3', 's3m1l3_b6', 'penkiasdešimt eurų'],
    ['3.2.2', 's3m2l2_b5', 'trisdešimt eurų'],
  ]) {
    const item = block(code, id);
    const correct = item.options.find(option => option.isCorrect);
    assert.equal(choiceOptionsAreEnglish(item), true, id);
    assert.equal(item.noOptionAudio, true, id);
    assert.equal(getChoiceAnswerAudio(item, correct, correct), expected, id);
    assert.notEqual(expected, correct.text);
  }
});

test('Section 3 time checkpoints assess meanings and speak only authored Lithuanian replies', () => {
  for (const [code, id, stepId, time] of [
    ['3.3.3', 's3m3l3_b6_v2', 'step_2', 'five'],
    ['3.3.C', 's3m3c_b6_v2', 'step_2', 'three'],
    ['3.C', 's3c_b10_v2', 'step_4', 'five'],
  ]) {
    const step = scenario(code, id).steps.find(item => item.id === stepId);
    const correct = progressing(step).find(option => option.result === 'best');
    assert.equal(step.interactionMode, 'comprehension');
    assert.match(correct.text, new RegExp(`At ${time} o'clock`, 'i'));
    assert.match(correct.learnerText, /Gerai, ačiū/);
    assert.ok(step.options.every(option => /^At (two|three|five) o'clock\.$/.test(option.text)));
    assert.ok(step.options.filter(option => option.result === 'wrong')
      .every(option => !option.learnerText && /at (two|three|five)/i.test(option.feedback)));
    assert.ok(step.help.levels.some(level => level.spokenLanguage === 'en' && level.audio === false));
  }
});

test('ticket scenes state quantity, destination, budget and payment intent before testing them', () => {
  const quantity = scenario('3.4.2', 's3m4l2_b6_v2');
  assert.match(quantity.sceneIntro, /two tickets.*one for yourself and one for a friend/i);
  assert.match(quantity.sceneIntro, /twenty euros is fine.*pay by card/i);
  assert.match(quantity.steps[0].sceneDirection, /two tickets/i);
  assert.match(quantity.steps[0].options.find(option => option.result === 'wrong').feedback, /three tickets/i);
  assert.match(quantity.steps[1].sceneDirection, /pay by card/i);

  const early = scenario('3.1.C', 's3m1c_b6_v2');
  assert.match(early.sceneIntro, /twenty euros is fine/i);
  assert.match(early.steps[1].sceneDirection, /Twenty euros works/i);
  assert.ok(early.steps[0].options.some(option => option.text.includes('trijų bilietų') && option.result === 'wrong'));
  assert.ok(early.steps[1].options.some(option => option.text.includes('Trisdešimt') && option.result === 'wrong'));
  const card = scenario('3.2.3', 's3m2l3_b6_v2');
  assert.match(card.sceneIntro, /want to use your card/i);
  assert.match(card.steps[0].sceneDirection, /pay by card/i);
  const bill = scenario('3.2.5', 's3m2l5_b6_v2');
  assert.match(bill.sceneIntro, /pay by card.*Fourteen euros is fine/i);
  assert.match(bill.steps[1].sceneDirection, /Fourteen euros is fine.*pay by card/i);

  const final = scenario('3.C', 's3c_b10_v2');
  assert.match(final.sceneIntro, /two train tickets to Kaunas.*Twenty euros fits your budget.*pay by card/i);
  assert.match(final.steps[0].sceneDirection, /two tickets to Kaunas/i);
  assert.match(final.steps[0].options.find(option => option.result === 'best').text, /Man reikia dviejų bilietų į Kauną/);
  assert.equal(JSON.stringify(final).includes('Man reikėtų'), false);
  assert.match(final.steps[1].sceneDirection, /Twenty euros is fine.*pay by card/);
  assert.match(final.steps[2].sceneDirection, /when the train leaves/);
  assert.equal(final.steps[4].supportText, 'geros kelionės — have a good journey');
  assert.equal(final.steps[4].options.find(option => option.text === 'Ačiū! Iki!').result, 'acceptable');
  assert.ok(final.steps[1].options.some(option => option.text.includes('Grynaisiais') && option.result === 'wrong'));
});

test('changed forms and café location are bridged before their assessed use', () => {
  const context = lesson('3.1.4');
  assert.match(context.notes.pattern, /same number, different job/i);
  assert.match(context.notes.pattern, /trys.*trijų bilietų/);
  const quantity = lesson('3.4.6');
  assert.equal(section.modules.find(module => module.code === '3.4').lessonCount, 6);
  assert.match(quantity.notes.pattern, /viena kava.*vieną kavą/);
  assert.match(quantity.notes.usage.join(' '), /trys → trise/);
  assert.ok(block('3.4.6', 's3m4l6_b1').items.some(item => item.lt === 'Mes esame trise' && item.en === 'There are three of us'));
  assert.equal(scenario('3.4.C', 's3m4c_b6_v2').steps[0].options.find(option => option.result === 'best').text, 'Mes esame trise');

  const meeting = lesson('3.3.4');
  assert.match(meeting.notes.usage.join(' '), /kavinė — café → kavinėje — in the café/);
  assert.match(scenario('3.3.4', 's3m3l4_b6_v2').steps[2].supportText, /kavinėje.*kavinė/);
  const bus = scenario('3.3.C', 's3m3c_b6_v2');
  assert.match(bus.sceneIntro, /Kaunas → į Kauną means 'to Kaunas'/);
  assert.match(bus.steps[0].options.find(option => option.result === 'best').text, /į Kauną/);
  const price = lesson('3.2.1').notes.usage;
  assert.equal(price.filter(line => line.startsWith('Kiek kainuoja knyga?')).length, 1);
});

test('Section 3 close choices can be natural alternatives without a wrong penalty', () => {
  const coffee = scenario('3.1.4', 's3m1l4_b6_v2');
  assert.match(coffee.steps[0].options.find(option => option.result === 'wrong').feedback, /tickets/i);
  assert.ok(coffee.steps[0].options.some(option => option.text.includes('Vieną kavą') && option.result === 'wrong'));
  assert.equal(coffee.steps[2].options.find(option => option.text === 'Viso gero').result, 'acceptable');
  assert.ok(progressing(coffee.steps[2]).every(option => option.progresses));
  assert.equal(scenario('3.2.1', 's3m2l1_b6_v2').steps[0].options.find(option => option.text === 'Kiek kainuoja knyga?').result, 'acceptable');
  assert.match(scenario('3.4.3', 's3m4l3_b6_v2').sceneIntro, /one more coffee and some water/i);
  const drinks = scenario('3.4.C', 's3m4c_b6_v2');
  assert.ok(drinks.steps[0].options.some(option => option.text === 'Mes esame dviese' && option.result === 'wrong'));
  assert.ok(drinks.steps[1].options.some(option => option.text.includes('dvi arbatas') && option.result === 'wrong'));
  assert.ok(drinks.steps[2].options.some(option => option.text.includes('kavą') && option.result === 'wrong'));
  const order = scenario('3.4.6', 's3m4l6_b6_v2');
  assert.ok(order.steps[0].options.some(option => option.text === 'Mes esame trise' && option.result === 'wrong'));
  assert.ok(order.steps[1].options.some(option => option.text.includes('vieną arbatą') && option.result === 'wrong'));
  assert.match(order.steps[2].sceneDirection, /wants nothing else/i);
});

test('Section 3 wrong scenario choices explain their local distinction', () => {
  const scenarios = lessons.flatMap(unit => unit.blocks.filter(item => item.type === 'scenario_v2'));
  assert.equal(scenarios.length, 22);
  for (const item of scenarios) for (const step of item.steps) for (const option of step.options || []) {
    if (option.result !== 'wrong') continue;
    assert.ok(option.feedback && option.feedback !== 'This does not fit the situation. Choose the response that matches the speaker.', `${item.id}:${step.id}:${option.id}`);
  }
});

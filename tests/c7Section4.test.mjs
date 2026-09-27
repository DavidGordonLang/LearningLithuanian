import test from 'node:test';
import assert from 'node:assert/strict';
import createModule41 from '../src/content/learning/section4/module_4_1.js';
import createModule42 from '../src/content/learning/section4/module_4_2.js';
import createModule43 from '../src/content/learning/section4/module_4_3.js';
import createModule44 from '../src/content/learning/section4/module_4_4.js';
import createCheckpoint4 from '../src/content/learning/section4/checkpoint_4.js';
import { choiceOptionsAreEnglish, getChoiceAnswerAudio, isSoftPassChoiceOption } from '../src/lib/trainingScoring.js';

const units = [createModule41(), createModule42(), createModule43(), createModule44(), createCheckpoint4()];
const lessons = units.flatMap(unit => unit.lessons ?? [unit]);
const lesson = code => lessons.find(item => item.code === code);
const block = (code, id) => lesson(code).blocks.find(item => item.id === id);
const step = (code, id, stepId) => block(code, id).steps.find(item => item.id === stepId);
const option = (s, text) => s.options.find(item => item.text === text);
const normalise = text => text.toLocaleLowerCase('lt').replace(/[.!?,;:—–…]/g, '').replace(/\s+/g, ' ').trim();

test('Section 4 anchors new food and ingredient base forms before changed chunks', () => {
  for (const [code, id, bases, changed] of [
    ['4.1.1', 's4m1l1_b1', ['sriuba', 'tortas', 'ledai'], ['Noriu sriubos.', 'Noriu torto.', 'Noriu ledų.']],
    ['4.3.2', 's4m3l2_b1', ['mėsa'], ['Nevalgau mėsos.']],
    ['4.2.3', 's4m2l3_b1', ['pienas', 'cukrus', 'citrina'], ['su pienu', 'be cukraus', 'su citrina']],
  ]) {
    const items = block(code, id).items.map(item => item.lt);
    for (const base of bases) assert.ok(items.includes(base), `${code} ${base}`);
    for (const phrase of changed) assert.ok(items.indexOf(phrase) > Math.max(...bases.map(base => items.indexOf(base))), `${code} ${phrase}`);
  }
  assert.doesNotMatch(lesson('4.3.2').notes.pattern, /Section 2|alkanas/i);
  assert.match(lesson('4.4.3').notes.pattern, /Section 3/);
});

test('ordering notes and practice agree without flattening distinct quantity and glass frames', () => {
  const pointing = lesson('4.1.3');
  assert.match(pointing.notes.pattern, /Šito\/To.*Šitą\/Tą/);
  assert.equal(block('4.1.3', 's4m1l3_b4').targetText, 'Šito, prašau');
  const quantity = lesson('4.1.4');
  assert.match(quantity.notes.pattern, /stiklinę vandens/);
  assert.doesNotMatch(quantity.notes.pattern, /vanduo.*vandenį/);
  const correction = lesson('4.3.3');
  const cards = block('4.3.3', 's4m3l3_b1').items;
  for (const phrase of ['Aš užsisakiau kavos.', 'Aš užsisakiau arbatos.']) {
    assert.ok(correction.notes.usage.some(line => line.startsWith(phrase.slice(0, -1))), phrase);
    assert.equal(normalise(cards.find(item => item.lt === phrase).audioText), normalise(phrase));
    assert.ok(block('4.3.C', 's4m3c_b10').pairs.some(pair => pair.lt === phrase && normalise(pair.audioText) === normalise(phrase)));
  }
  assert.equal(block('4.2.3', 's4m2l3_b5').type, 'best_response');
  assert.match(lesson('4.2.3').notes.pattern, /pienas → su pienu.*cukrus → be cukraus/);
  assert.equal(block('4.2.3', 's4m2l3_b5').notes, undefined);
});

test('valid but less preferred service replies progress while meaning errors still fail', () => {
  const ordinary = block('4.1.2', 's4m1l2_b3');
  assert.ok(isSoftPassChoiceOption(option(ordinary, 'Noriu kavos.')));
  assert.ok(isSoftPassChoiceOption(option(ordinary, 'Kavos.')));
  const price = step('4.3.2', 's4m3l2_b5_v2', 'step_3');
  assert.equal(option(price, 'Kiek tai kainuoja?').result, 'acceptable');
  assert.equal(option(price, 'Kiek tai kainuoja?').progresses, true);
  const cold = block('4.3.C', 's4m3c_b5');
  assert.equal(option(cold, 'Nelabai gerai.').result, 'awkward');
  assert.match(option(cold, 'Nelabai gerai.').feedback, /Per šalta/);
  assert.equal(option(cold, 'Per karšta.').result, undefined);
  assert.equal(option(cold, 'Per karšta.').isCorrect, false);
  assert.equal(option(step('4.4.2', 's4m4l2_b5_v2', 'step_1'), 'Labas! Ar norite sumuštinio?').result, 'awkward');
});

test('all 24 Section 4 scenarios have local feedback and the corrected café facts precede their answers', () => {
  const scenarios = lessons.flatMap(item => item.blocks.filter(b => b.type === 'scenario_v2'));
  assert.equal(scenarios.length, 24);
  for (const scenario of scenarios) for (const decision of scenario.steps) {
    for (const answer of decision.options) {
      if (answer.result !== 'wrong') continue;
      assert.ok(answer.feedback?.length > 20, `${scenario.id}/${decision.id}/${answer.id}`);
      assert.doesNotMatch(answer.feedback, /This does not fit the situation|This does not answer the speaker here/);
    }
  }
  const cafe = block('4.2.5', 's4m2l5_b5_v2');
  assert.match(cafe.sceneIntro, /coffee at the café.*without milk/i);
  assert.match(cafe.steps[1].sceneDirection, /drink.*here/i);
  assert.match(cafe.steps[2].sceneDirection, /without milk/i);
  assert.equal(cafe.steps.length, 5, 'remove the duplicate goodbye after payment');
  assert.equal(option(cafe.steps[3], 'Kiek tai kainuoja?').result, 'awkward');
  const recap = block('4.2.C', 's4m2c_b6_v2');
  assert.match(recap.sceneIntro, /tea to take away.*lemon.*cash/i);
  assert.match(recap.steps[1].sceneDirection, /taking the tea with you/i);
  assert.match(recap.steps[2].sceneDirection, /want lemon/i);
  assert.match(recap.steps[3].sceneDirection, /cash you brought/i);
  assert.match(lesson('4.2.3').notes.usage.join(' '), /be citrinos/);
});

test('tea, wrong-drink, temperature and satisfaction scenes follow visible chronology', () => {
  const refusal = block('4.3.1', 's4m3l1_b5_v2');
  assert.match(refusal.steps[0].sceneDirection, /arrived to order tea/i);
  assert.doesNotMatch(JSON.stringify(refusal), /coffee is noticeably cold|Accept the coffee for now/i);
  assert.match(refusal.steps[1].sceneDirection, /do not want sugar/i);
  assert.match(refusal.steps[3].speakerText, /arbata be cukraus/i);
  const wrong = block('4.3.3', 's4m3l3_b5_v2');
  assert.match(wrong.sceneIntro, /ordered coffee with milk.*waiting/i);
  assert.match(wrong.steps[0].speakerText, /Arbata su pienu/);
  assert.match(wrong.steps[2].sceneDirection, /replacement coffee with milk/i);
  assert.match(wrong.steps[3].sceneDirection, /taste.*good/i);
  const checkpoint = block('4.3.C', 's4m3c_b9_v2');
  assert.match(checkpoint.steps[2].sceneDirection, /sip.*too cold/i);
  assert.match(checkpoint.steps[3].sceneDirection, /hot one.*satisfied/i);
  assert.match(checkpoint.steps[4].sceneDirection, /six-euro bill is fine/i);
  assert.match(block('4.3.2', 's4m3l2_b5_v2').sceneIntro, /want soup.*do not eat meat/i);
  const social = block('4.4.5', 's4m4l5_b5_v2');
  assert.match(social.sceneIntro, /tastes good.*full.*do not want more/i);
  assert.match(social.steps[1].sceneDirection, /eaten enough/i);
  assert.equal(option(social.steps[1], 'Ačiū!').result, 'awkward');
});

test('reviewed Lithuanian models and authored audio agree, with the 4.4.2 option flag corrected', () => {
  for (const [code, id, pairs] of [
    ['4.2.C', 's4m2c_b7', ['m17']],
    ['4.C', 's4c_b13', ['m10']],
    ['4.3.C', 's4m3c_b10', ['m10', 'm11']],
  ]) for (const pairId of pairs) {
    const pair = block(code, id).pairs.find(item => item.id === pairId);
    assert.equal(normalise(pair.audioText), normalise(pair.lt), `${code}/${pairId}`);
  }
  for (const item of block('4.3.3', 's4m3l3_b1').items.filter(item => ['co2', 'co3'].includes(item.id)))
    assert.equal(normalise(item.audioText), normalise(item.lt), item.id);
  const offer = block('4.4.2', 's4m4l2_b3');
  assert.equal(offer.optionsLanguage, 'lt');
  assert.equal(offer.noOptionAudio, undefined);
  assert.equal(choiceOptionsAreEnglish(offer), false);
  assert.equal(getChoiceAnswerAudio(offer, offer.options[0], offer.options[0]), 'Ar nori sausainio?');
  for (const [code, id] of [
    ['4.1.C', 's4m1c_b8'], ['4.3.C', 's4m3c_b7'], ['4.3.C', 's4m3c_b8'], ['4.C', 's4c_b11'],
  ]) assert.equal(block(code, id).type, 'speak_self_check', `${id} is deliberate spaced pronunciation retrieval`);
  assert.deepEqual(block('4.2.C', 's4m2c_b7').pairPages.map(p => p.pairIds.length), [4, 5, 4, 4, 3]);
});

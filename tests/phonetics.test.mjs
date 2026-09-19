import test from 'node:test';
import assert from 'node:assert/strict';
import { phoneticsDisplay } from '../src/utils/phoneticsDisplay.js';
import { enrichSavedRow } from '../src/services/enrichSavedRow.js';
test('IPA mode never silently displays English phonetics', () => {
  assert.equal(phoneticsDisplay('en', 'English hint', 'IPA'), 'English hint');
  assert.equal(phoneticsDisplay('ipa', 'English hint', 'IPA'), 'IPA');
  assert.match(phoneticsDisplay('ipa', 'English hint', ''), /IPA unavailable.*English phonetics/);
});
test('enrichment uses exact Lithuanian, preserves meaning and refuses rewritten responses', async (t) => {
  const savedFetch = globalThis.fetch; t.after(() => { globalThis.fetch = savedFetch; });
  let rows = [{ _id: 'one', Lithuanian: 'Truputį', English: 'A little', Notes: '' }];
  const setRows = fn => { rows = fn(rows); };
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push(JSON.parse(options.body));
    return { ok: true, json: async () => url === '/api/translate'
      ? { lt: 'Šiek tiek', phonetics: 'wrong phrase', en_natural: 'changed' } : {} };
  };
  await enrichSavedRow('Truputį', 'A little', 'one', setRows);
  assert.equal(calls[0].text, 'Truputį');
  assert.equal(calls.length, 1);
  assert.equal(rows[0].Phonetic, undefined);
  assert.equal(rows[0].English, 'A little');
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ lt: 'Truputį', phonetics: 'hint', phonetics_ipa: 'ipa', en_natural: 'changed' }) });
  await enrichSavedRow('Truputį', 'A little', 'one', setRows);
  assert.equal(rows[0].Phonetic, 'hint'); assert.equal(rows[0].English, 'A little');
  rows = [{ _id: 'one', Lithuanian: 'Edited', Phonetic: 'my hint' }];
  await enrichSavedRow('Truputį', 'A little', 'one', setRows);
  assert.deepEqual(rows, [{ _id: 'one', Lithuanian: 'Edited', Phonetic: 'my hint' }]);
});

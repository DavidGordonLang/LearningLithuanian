import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudioPlayback } from '../src/utils/audioPlayback.js';
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
function setup() {
  const played = [], revoked = [], audios = [];
  const player = createAudioPlayback({ urls: { createObjectURL: b => b, revokeObjectURL: u => revoked.push(u) }, createAudio: url => {
    const audio = { play: async () => { played.push(url); }, pause: () => {} };
    audios.push(audio); return audio;
  } });
  return { player, played, revoked, audios };
}
test('latest audio wins when older responses arrive late; stop invalidates pending audio', async () => {
  const { player, played, revoked, audios } = setup();
  const old = deferred(), recent = deferred();
  const a = player.play(() => old.promise), b = player.play(() => recent.promise);
  recent.resolve('water'); await Promise.resolve(); await Promise.resolve();
  old.resolve('coffee'); await a;
  assert.deepEqual(played, ['water']);
  audios[0].onended(); await b;
  assert.deepEqual(revoked, ['water']);
  const pending = deferred(); const c = player.play(() => pending.promise);
  player.stop(); pending.resolve('late'); await c;
  assert.deepEqual(played, ['water']);
});
test('interrupting active audio releases its URL and settles the playback promise', async () => {
  const { player, played, revoked } = setup();
  const a = player.play(async () => 'normal'); await Promise.resolve(); await Promise.resolve();
  const b = player.play(async () => 'slow'); await a;
  assert.deepEqual(played, ['normal', 'slow']);
  player.stop(); await b;
  assert.deepEqual(revoked, ['normal', 'slow']);
});
test('current errors are reported once and stale request errors are ignored', async () => {
  const errors = []; const { player } = setup();
  await player.play(async () => { throw new Error('offline'); }, e => errors.push(e.message));
  let reject; const a = player.play(() => new Promise((_, r) => { reject = r; }), e => errors.push(e.message));
  player.stop(); reject(new Error('old')); await a;
  assert.deepEqual(errors, ['offline']);
});

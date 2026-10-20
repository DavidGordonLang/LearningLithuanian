import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canShowDevJourneyEntry,wantsDevJourneyFromUrl}
  from '../src/views/training/journeyDevEntry.js';

const page=readFileSync(new URL('../src/views/training/LearningHome.jsx',import.meta.url),'utf8');

test('DEV editor entry is available on unique preview deployments after OAuth drops the query',()=>{
  assert.equal(canShowDevJourneyEntry('learning-lithuanian-q8f2dupau-davids-projects-25f8617a.vercel.app'),true);
  assert.equal(canShowDevJourneyEntry('learning-lithuanian-git-dev-davids-projects-25f8617a.vercel.app'),true);
  assert.equal(canShowDevJourneyEntry('localhost'),true);
  assert.equal(wantsDevJourneyFromUrl('?journeyDev=1'),true);
  assert.equal(wantsDevJourneyFromUrl(''),false);
  assert.match(page,/data-testid="open-dev-journey-editor"/);
  assert.match(page,/onClick=\{\(\)=>setDevWorkbenchOpen\(true\)\}/);
  assert.match(page,/onBack=\{\(\)=>setDevWorkbenchOpen\(false\)\}/);
});

test('DEV controls are absent from production and other domains',()=>{
  for(const host of ['zodis.app','learning-lithuanian.vercel.app',
    'learning-lithuanian-davids-projects-25f8617a.vercel.app',
    'learning-lithuanian-git-main-davids-projects-25f8617a.vercel.app',
    'other-app-q8f2dupau-davids-projects-25f8617a.vercel.app',
    'learning-lithuanian-q8f2dupau-davids-projects-25f8617a.vercel.app.evil.example'])
      assert.equal(canShowDevJourneyEntry(host),false,host);
  assert.equal(wantsDevJourneyFromUrl('?legacyEditor=1&journeyDev=1'),false);
  assert.match(page,/const workbenchActive = devHost && devWorkbenchOpen/);
  assert.match(page,/\{devHost && <button/);
});

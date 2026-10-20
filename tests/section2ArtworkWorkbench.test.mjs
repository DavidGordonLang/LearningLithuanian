import test from 'node:test';
import assert from 'node:assert/strict';
import {SECTION2_ARTWORK_MAPS,SECTION2_TOTAL_DESTINATIONS,
  emptySection2ArtworkDraft,validateSection2ArtworkDraft}
  from '../src/views/training/section2ArtworkMaps.js';

test('Amber Coast artwork covers four actual teaching modules and 18 stops',()=>{
  assert.deepEqual(SECTION2_ARTWORK_MAPS.map(m=>m.stopIds.length),[5,5,3,5]);
  assert.equal(SECTION2_ARTWORK_MAPS.reduce((n,m)=>n+m.stopIds.length,0),SECTION2_TOTAL_DESTINATIONS);
  assert.equal(new Set(SECTION2_ARTWORK_MAPS.flatMap(m=>m.stopIds)).size,18);
  assert.deepEqual(SECTION2_ARTWORK_MAPS.at(-1).stopIds.slice(-2),
    ['section_2_module_4_checkpoint','section_2_checkpoint']);
  assert.deepEqual(SECTION2_ARTWORK_MAPS[1].stopIds.slice(0,4),[
    'section_2_module_2_lesson_1','section_2_module_2_lesson_3',
    'section_2_module_2_lesson_4','section_2_module_2_lesson_5']);
  assert.ok(SECTION2_ARTWORK_MAPS.every(m=>m.asset.endsWith('.avif')));
});

test('new drafts are isolated and cannot silently introduce extra lessons',()=>{
  const draft=emptySection2ArtworkDraft('module_2_3');
  assert.deepEqual(validateSection2ArtworkDraft('module_2_3',draft),draft);
  const stop=SECTION2_ARTWORK_MAPS[2].stopIds[0];
  const placed={...draft,markers:[{id:stop,x:125,y:125}],route:[{x:0,y:1536},{x:1000,y:20}]};
  assert.deepEqual(validateSection2ArtworkDraft('module_2_3',placed),placed);
  assert.equal(validateSection2ArtworkDraft('module_2_3',{...placed,
    markers:[...placed.markers,{id:'wrong_lesson',x:250,y:250}]}),null);
  assert.equal(validateSection2ArtworkDraft('module_2_3',{...placed,
    route:[{x:1025,y:300}]}),null);
  assert.equal(validateSection2ArtworkDraft('module_2_4',placed),null);
});

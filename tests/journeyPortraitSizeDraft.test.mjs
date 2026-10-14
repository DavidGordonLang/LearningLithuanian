import test from 'node:test';
import assert from 'node:assert/strict';
import {SIZE_MIN_PERCENT,SIZE_MAX_PERCENT,DEFAULT_SIZE_ANCHORS,
  defaultSizeAnchors,sizeAtProgress,validateSizeAnchors,setSizeAnchor,
  removeSizeAnchor,buildSizeDraft,restoreSizeDraft,sizeStorageKey,
} from '../src/views/training/journeyPortraitSizeDraft.js';
import {approvedPortraitRoutePoints} from '../src/views/training/section1PortraitRoutes.js';

test('size starts with one key and holds until another saved change',()=>{
  assert.equal(SIZE_MIN_PERCENT,12);
  assert.equal(SIZE_MAX_PERCENT,240);
  const initial=defaultSizeAnchors();
  assert.deepEqual(initial,[{at:0,size:145}]);
  for(const at of [0,1,200,500,999,1000])assert.equal(sizeAtProgress(initial,at),145);
  const next=setSizeAnchor(initial,500,32);
  assert.equal(sizeAtProgress(next,499),145);
  assert.equal(sizeAtProgress(next,500),32);
  assert.equal(sizeAtProgress(next,700),32);
  assert.equal(sizeAtProgress(next,1000),32);
  assert.equal(sizeAtProgress(setSizeAnchor(next,810,12),800),32);
  assert.equal(sizeAtProgress(setSizeAnchor(next,810,12),810),12);
  assert.deepEqual(removeSizeAnchor(next,500),initial);
});

test('size keys are bounded, sorted and cannot delete initial size',()=>{
  const base=defaultSizeAnchors();
  assert.deepEqual(removeSizeAnchor(base,0),base);
  assert.deepEqual(setSizeAnchor(base,750,400),[{at:0,size:145},{at:750,size:240}]);
  assert.equal(validateSizeAnchors([{at:0,size:20},{at:0,size:30}]),null);
  assert.equal(validateSizeAnchors([{at:0,size:10}]),null);
  assert.deepEqual(base,[{at:0,size:145}]);
  assert.ok(Object.isFrozen(DEFAULT_SIZE_ANCHORS));
});

test('v2 drafts require exact map, route, and optionally direction plan',()=>{
  const a=approvedPortraitRoutePoints('module_1_1');
  const b=approvedPortraitRoutePoints('module_1_2');
  const sizes=setSizeAnchor(defaultSizeAnchors(),600,22);
  const json=JSON.stringify(buildSizeDraft('module_1_1',a,sizes,'direction-hash'));
  assert.deepEqual(restoreSizeDraft(json,'module_1_1',a,'direction-hash'),sizes);
  assert.equal(restoreSizeDraft(json,'module_1_1',a,'changed'),null);
  assert.equal(restoreSizeDraft(json,'module_1_2',a,'direction-hash'),null);
  assert.equal(restoreSizeDraft(json,'module_1_1',b,'direction-hash'),null);
  assert.ok(sizeStorageKey('user','module_1_1').includes('stage3:v2'));
});
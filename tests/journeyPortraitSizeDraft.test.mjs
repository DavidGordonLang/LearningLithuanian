import test from 'node:test';
import assert from 'node:assert/strict';
import {
 SIZE_MIN_PERCENT,SIZE_MAX_PERCENT,DEFAULT_SIZE_ANCHORS,
 defaultSizeAnchors,sizeAtProgress,validateSizeAnchors,
 setSizeAnchor,removeSizeAnchor,buildSizeDraft,restoreSizeDraft,
 sizeStorageKey,sizeRouteSignature,
} from '../src/views/training/journeyPortraitSizeDraft.js';
import {approvedPortraitRoutePoints} from '../src/views/training/section1PortraitRoutes.js';

test('new portrait perspective spans extremely near to far without the old 40–100% clamp',()=>{
 assert.equal(SIZE_MIN_PERCENT,12);
 assert.equal(SIZE_MAX_PERCENT,240);
 assert.deepEqual(defaultSizeAnchors(),[{at:0,size:145},{at:1000,size:22}]);
 assert.equal(sizeAtProgress(defaultSizeAnchors(),0),145);
 assert.equal(sizeAtProgress(defaultSizeAnchors(),1000),22);
 assert.equal(sizeAtProgress(defaultSizeAnchors(),500),83.5);
 assert.equal(sizeAtProgress(defaultSizeAnchors(),250)>sizeAtProgress(defaultSizeAnchors(),750),true);
});

test('authored size points are sorted, bounded, interpolated and removable',()=>{
 const base=defaultSizeAnchors();
 const keys=setSizeAnchor(base,500,200);
 assert.deepEqual(keys,[{at:0,size:145},{at:500,size:200},{at:1000,size:22}]);
 assert.equal(sizeAtProgress(keys,500),200);
 assert.equal(sizeAtProgress(keys,250),172.5);
 assert.deepEqual(removeSizeAnchor(keys,500),base);
 assert.deepEqual(removeSizeAnchor(base,0),base);
 assert.deepEqual(setSizeAnchor(base,750,400),[
   {at:0,size:145},{at:750,size:240},{at:1000,size:22}]);
 assert.deepEqual(base,[{at:0,size:145},{at:1000,size:22}]);
 assert.equal(validateSizeAnchors([{at:0,size:12},{at:0,size:20},{at:1000,size:30}]),null);
 assert.equal(validateSizeAnchors([{at:0,size:10},{at:1000,size:20}]),null);
});

test('stage-3 local drafts are map-bound and tied to the exact route',()=>{
 const first=approvedPortraitRoutePoints('module_1_1');
 const second=approvedPortraitRoutePoints('module_1_2');
 const anchors=setSizeAnchor(defaultSizeAnchors(),480,42);
 const draft=buildSizeDraft('module_1_1',first,anchors);
 assert.deepEqual(restoreSizeDraft(JSON.stringify(draft),'module_1_1',first),anchors);
 assert.equal(restoreSizeDraft(JSON.stringify(draft),'module_1_2',first),null);
 assert.equal(restoreSizeDraft(JSON.stringify(draft),'module_1_1',second),null);
 assert.equal(restoreSizeDraft('invalid','module_1_1',first),null);
 assert.ok(sizeStorageKey('u','module_1_1').includes(':u:module_1_1'));
 assert.notEqual(sizeRouteSignature(first),sizeRouteSignature(second));
 const modified=first.map(p=>({...p}));modified[2].x+=1;
 assert.equal(restoreSizeDraft(JSON.stringify(draft),'module_1_1',modified),null);
 assert.ok(Object.isFrozen(DEFAULT_SIZE_ANCHORS));
});

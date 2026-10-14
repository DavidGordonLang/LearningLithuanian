import test from 'node:test';
import assert from 'node:assert/strict';
import {approvedPortraitRoutePoints} from '../src/views/training/section1PortraitRoutes.js';
import {defaultSizeAnchors,setSizeAnchor,sizeAtProgress} from '../src/views/training/journeyPortraitSizeDraft.js';
import {companionStorageKey,savePlacement,clearPlacement,previewPlacement,
  buildCompanionDraft,restoreCompanionDraft,validPlacements} from '../src/views/training/journeyPortraitCompanionDraft.js';
import {gateRouteAt} from '../src/views/training/journeyGateRouteEditor.js';

const route=approvedPortraitRoutePoints('module_1_1');
test('independent companion JSON includes both size anchors and paw placements',()=>{
 const sizes=setSizeAnchor(defaultSizeAnchors(),500,64);
 const placements=savePlacement([],500,{x:250,y:800});
 const fox=buildCompanionDraft('module_1_1',route,'fox',sizes,placements,'automatic');
 const json=JSON.stringify(fox);
 assert.equal(fox.version,3);assert.equal(fox.companion,'fox');
 assert.deepEqual(fox.anchors,sizes);
 assert.deepEqual(fox.placements,[{at:500,x:250,y:800}]);
 assert.deepEqual(restoreCompanionDraft(json,'module_1_1',route,'fox','automatic'),{anchors:sizes,placements});
 assert.equal(restoreCompanionDraft(json,'module_1_1',route,'wolf','automatic'),null);
 assert.equal(restoreCompanionDraft(json,'module_1_1',route,'fox','changed'),null);
 assert.equal(restoreCompanionDraft(json,'module_1_2',route,'fox','automatic'),null);
 assert.notEqual(companionStorageKey('u','module_1_1','fox'),companionStorageKey('u','module_1_1','wolf'));
});
test('paws can be placed away from the road without editing approved route',()=>{
 const snapshot=JSON.stringify(route);
 const normal=gateRouteAt(route,.5);
 const placements=savePlacement([],500,{x:normal.x+50,y:normal.y+30});
 assert.ok(Math.abs(previewPlacement(route,placements,500).x-placements[0].x)<1);
 assert.equal(previewPlacement(route,[],500).x,normal.x);
 assert.deepEqual(clearPlacement(placements,500),[]);
 assert.equal(JSON.stringify(route),snapshot);
 assert.equal(sizeAtProgress(defaultSizeAnchors(),500),145);
});
test('placement bounds, duplicates and replacement validation',()=>{
 assert.equal(validPlacements([{at:20,x:-1,y:10}]),null);
 assert.equal(validPlacements([{at:20,x:1,y:10},{at:20,x:2,y:9}]),null);
 assert.deepEqual(savePlacement([{at:300,x:20,y:30}],300,{x:45,y:50}),[{at:300,x:45,y:50}]);
 assert.deepEqual(savePlacement([],100,{x:2024,y:-30}),[{at:100,x:1024,y:0}]);
});

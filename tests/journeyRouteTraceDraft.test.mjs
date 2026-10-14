import test from 'node:test';
import assert from 'node:assert/strict';
import {routeStorageKey,buildRouteDraft,restoreRouteDraft,validRoutePoint,
  nearestRouteProgress,routeStopReview} from '../src/views/training/journeyRouteTraceDraft.js';

test('route draft saves and restores only the requested map at native portrait resolution',()=>{
  const points=[{x:0,y:1530},{x:310,y:1220},{x:900,y:400},{x:1024,y:0}];
  const raw=buildRouteDraft('module_1_2',points);
  assert.deepEqual(raw,{version:1,mapId:'module_1_2',
    dimensions:{width:1024,height:1536},points});
  assert.deepEqual(restoreRouteDraft(JSON.stringify(raw),'module_1_2'),points);
  assert.deepEqual(restoreRouteDraft(JSON.stringify(raw),'module_1_1'),[]);
  assert.deepEqual(restoreRouteDraft('garbage','module_1_2'),[]);
  assert.deepEqual(restoreRouteDraft(JSON.stringify({...raw,dimensions:{width:1536,height:1024}}),'module_1_2'),[]);
  assert.ok(routeStorageKey('david','module_1_1').includes(':david:module_1_1'));
});

test('bad or out-of-bounds coordinates cannot be loaded as valid routes',()=>{
  for(const p of [{x:-1,y:500},{x:0,y:1537},{x:Infinity,y:400},{x:10,y:NaN}])
    assert.equal(validRoutePoint(p),false);
  const raw=buildRouteDraft('module_1_1',[{x:10,y:15}]);
  raw.points.push({x:-1,y:5});
  assert.deepEqual(restoreRouteDraft(JSON.stringify(raw),'module_1_1'),[]);
});

test('advisory marker distance and order check are computed against the traced polyline',()=>{
  const route=[{x:500,y:1500},{x:500,y:800},{x:800,y:500},{x:800,y:0}];
  const near=[{x:550,y:1200},{x:490,y:800},{x:790,y:350}];
  const r=routeStopReview(route,near,100);
  assert.deepEqual(r,{near:3,total:3,outOfOrder:false});
  assert.ok(nearestRouteProgress(route,near[2]).progress>nearestRouteProgress(route,near[1]).progress);
  assert.equal(routeStopReview(route,near.slice().reverse(),100).outOfOrder,true);
});
import test from 'node:test';
import assert from 'node:assert/strict';
import {approvedPortraitRoutePoints} from '../src/views/training/section1PortraitRoutes.js';
import {WALK_DIRECTIONS,automaticDirection,directionForSegment,
  directionStorageKey,validDirectionOverrides,buildDirectionDraft,
  restoreDirectionDraft,directionPlanSignature} from '../src/views/training/journeyPortraitDirectionDraft.js';

test('manual directions apply to the chosen route segment and never change geometry',()=>{
  const route=approvedPortraitRoutePoints('module_1_1');
  assert.equal(WALK_DIRECTIONS.length,8);
  const before=JSON.stringify(route);
  const custom={1:'right',3:'down-left'};
  assert.equal(directionForSegment(route,1,custom),'right');
  assert.equal(directionForSegment(route,2,custom),automaticDirection(route,2));
  assert.equal(directionForSegment(route,3,custom),'down-left');
  assert.equal(JSON.stringify(route),before);
  assert.equal(validDirectionOverrides(route,custom),true);
  assert.equal(validDirectionOverrides(route,{'13':'left'}),false);
  assert.equal(validDirectionOverrides(route,{'1':'sideways'}),false);
});

test('drafts save per map and invalidate when the approved route changes',()=>{
  const a=approvedPortraitRoutePoints('module_1_1');
  const b=approvedPortraitRoutePoints('module_1_2');
  const overrides={0:'down',7:'up-right'};
  const draft=buildDirectionDraft('module_1_1',a,overrides);
  assert.deepEqual(restoreDirectionDraft(JSON.stringify(draft),'module_1_1',a),overrides);
  assert.deepEqual(restoreDirectionDraft(JSON.stringify(draft),'module_1_2',a),{});
  assert.deepEqual(restoreDirectionDraft(JSON.stringify(draft),'module_1_1',b),{});
  assert.deepEqual(restoreDirectionDraft('invalid','module_1_1',a),{});
  assert.equal(directionStorageKey('u','module_1_1').includes(':u:module_1_1'),true);
  assert.notEqual(directionPlanSignature(a,overrides),directionPlanSignature(a,{}));
});
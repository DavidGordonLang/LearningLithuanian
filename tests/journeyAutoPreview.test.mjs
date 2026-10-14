import test from 'node:test';
import assert from 'node:assert/strict';
import {approvedPortraitRoutePoints} from '../src/views/training/section1PortraitRoutes.js';
import {gateRouteAt,gateAutomaticDirection} from '../src/views/training/journeyGateRouteEditor.js';
import {automaticPreviewScale,automaticJourneyFrame,automaticJourneyFacing,
  journeyTotalMs,PREVIEW_WALK_MS,PREVIEW_HOLD_MS} from '../src/views/training/journeyAutoPreview.js';

test('both Fox and Wolf shrink gradually without a manual size draft',()=>{
  for(const companion of ['fox','wolf']){
    const samples=Array.from({length:101},(_,i)=>
      automaticPreviewScale(companion,i/100));
    assert.ok(samples[0]>1.3);
    assert.ok(samples.at(-1)<.35);
    assert.ok(samples.every((n,i)=>i===0||n<=samples[i-1]),'must never grow while walking away');
    assert.ok(samples.slice(1,-1).some((n,i)=>n<samples[i]),
      'scale should visibly change throughout playback');
  }
  assert.ok(automaticPreviewScale('wolf',0)>automaticPreviewScale('fox',0));
});

test('automatic facing follows the actual segment for all portrait routes',()=>{
  for(const id of ['module_1_1','module_1_2','module_1_3','module_1_4']){
    const route=approvedPortraitRoutePoints(id);
    const directions=new Set();
    for(let n=0;n<1000;n++){
      const t=(n+.5)/1000;
      const point=gateRouteAt(route,t);
      const expected=gateAutomaticDirection(
        route[point.segmentIndex],route[point.segmentIndex+1]);
      const actual=automaticJourneyFacing(route,t);
      assert.equal(actual,expected);
      directions.add(actual);
    }
    assert.ok(directions.size>=3,id+' must visibly change direction');
  }
});

test('one Play Journey run faces camera at start and checkpoints then resumes automatically',()=>{
  const start=automaticJourneyFrame(0,[.5,.8]);
  assert.equal(start.progress,0);
  assert.equal(start.facingCamera,true);
  const walking=automaticJourneyFrame(PREVIEW_HOLD_MS+1000,[.5,.8]);
  assert.equal(walking.facingCamera,false);
  assert.ok(walking.progress>0);
  const firstArrival=PREVIEW_HOLD_MS+.5*PREVIEW_WALK_MS;
  const paused=automaticJourneyFrame(firstArrival+100,[.5,.8]);
  assert.equal(paused.facingCamera,true);
  assert.equal(paused.progress,.5);
  const resumed=automaticJourneyFrame(firstArrival+PREVIEW_HOLD_MS+2000,[.5,.8]);
  assert.equal(resumed.facingCamera,false);
  assert.ok(resumed.progress>.5);
  const finish=automaticJourneyFrame(journeyTotalMs([.5,.8]),[.5,.8]);
  assert.equal(finish.complete,true);
  assert.equal(finish.progress,1);
});

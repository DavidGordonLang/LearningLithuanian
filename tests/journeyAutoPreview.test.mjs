import test from 'node:test';
import assert from 'node:assert/strict';
import {approvedPortraitRoutePoints} from '../src/views/training/section1PortraitRoutes.js';
import {gateRouteAt,gateAutomaticDirection} from '../src/views/training/journeyGateRouteEditor.js';
import {approvedPortraitMarkerPositions} from '../src/views/training/section1PortraitMarkers.js';
import {automaticPreviewScale,automaticJourneyFrame,automaticJourneyFacing,
  journeyTotalMs,PREVIEW_WALK_MS,PREVIEW_HOLD_MS,
  previewCheckpointStops,PREVIEW_SCALE} from '../src/views/training/journeyAutoPreview.js';

test('both Fox and Wolf shrink gradually without a manual size draft',()=>{
  for(const companion of ['fox','wolf']){
    const samples=Array.from({length:101},(_,i)=>
      automaticPreviewScale(companion,i/100));
    assert.ok(samples[0]>=1.7,'foreground should be larger');
    assert.ok(samples.at(-1)>=.58-1e-9,'distant character should remain visible');
    assert.ok(samples[50]>1.4,'retain more scale through the middle');
    assert.ok(samples[75]>1.0,'do not become tiny three-quarters up the map');
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

test('gold checkpoint pins mark the exact route position where playback pauses',()=>{
  for(const [id,count] of Object.entries({
    module_1_1:1,module_1_2:1,module_1_3:1,module_1_4:2,
  })){
    const route=approvedPortraitRoutePoints(id);
    const number=id.slice(-1);
    const stopIds=['section_1_module_'+number+'_checkpoint'];
    if(id==='module_1_4')stopIds.push('section_1_checkpoint');
    const stops=stopIds.map(id=>({id}));
    const pins=approvedPortraitMarkerPositions(id,stopIds);
    const checkpoints=previewCheckpointStops(route,stops,pins);
    assert.equal(checkpoints.length,count);
    assert.deepEqual(checkpoints.map(c=>c.kind),
      id==='module_1_4'?['module','section']:['module']);
    for(const stop of checkpoints){
      assert.ok(stop.progress>=0&&stop.progress<=1);
      assert.ok(Number.isInteger(stop.x)&&Number.isInteger(stop.y));
      assert.ok(stop.x>=0&&stop.x<=1024);
      assert.ok(stop.y>=0&&stop.y<=1536);
      const p=gateRouteAt(route,stop.progress);
      assert.ok(Math.hypot(p.x-stop.x,p.y-stop.y)<1);
      assert.ok(Math.abs(stop.progress*10000-Math.round(stop.progress*10000))<1e-8);
      const arrival=PREVIEW_HOLD_MS+stop.progress*PREVIEW_WALK_MS;
      // Stop positioning shares the exact four-decimal progress used by playback.
      const held=automaticJourneyFrame(arrival+10,
        checkpoints.map(c=>c.progress));
      assert.ok(held.progress>=0&&held.progress<=1);
    }
  }
});

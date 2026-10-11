import test from "node:test";
import assert from "node:assert/strict";
import { GATE_ROUTE_POINTS, GATE_ROUTE_LENGTH, GATE_STAGE_PROGRESS, gateTraverseAt } from "../src/views/training/journeyGateTraverse.js";

test("gate frames preserve exact accepted A, B and C paw anchors and dimensions",()=>{
  const anchors=[
    ["approach",{x:170,y:1100},82,112],
    ["passage",{x:240,y:1022},82,112],
    ["emerge",{x:450,y:832},78,106],
  ];
  anchors.forEach(([stage,point,width,height])=>{
    const actual=gateTraverseAt(GATE_STAGE_PROGRESS[stage]);
    assert.ok(Math.abs(actual.point.x-point.x)<1e-8,stage+" x");
    assert.ok(Math.abs(actual.point.y-point.y)<1e-8,stage+" y");
    assert.ok(Math.abs(actual.dimensions.width-width)<1e-8,stage+" width");
    assert.ok(Math.abs(actual.dimensions.height-height)<1e-8,stage+" height");
    assert.equal(actual.tilt,0,"approved anchor is unrotated");
    assert.equal(actual.squash,1,"approved anchor is unsquashed");
  });
});
test("route stays in map and proceeds toward village without jumps or overshoot",()=>{
  assert.equal(GATE_ROUTE_POINTS.length,15);
  assert.ok(GATE_ROUTE_LENGTH>250);
  for(let i=1;i<GATE_ROUTE_POINTS.length;i++){
    const a=GATE_ROUTE_POINTS[i-1],b=GATE_ROUTE_POINTS[i];
    assert.ok(Math.hypot(b.x-a.x,b.y-a.y)<57,"no abrupt hop between painted cobbles");
  }
  let previous=gateTraverseAt(0);
  const facing=new Set();
  for(let frame=1;frame<=120;frame++){
    const at=gateTraverseAt(frame/120);
    assert.ok(at.point.x>=170&&at.point.x<=450);
    assert.ok(at.point.y>=825&&at.point.y<=1100);
    assert.ok(Math.hypot(at.point.x-previous.point.x,at.point.y-previous.point.y)<GATE_ROUTE_LENGTH/115);
    facing.add(at.direction);
    assert.ok(Math.abs(at.tilt)<=1.35+1e-6);
    assert.ok(at.squash>=.99&&at.squash<=1);
    previous=at;
  }
  assert.deepEqual([...facing].sort(),["up-left","up-right"]);
});
test("input is safely clamped; A and B are the same apparent size",()=>{
  assert.deepEqual(gateTraverseAt(-1).point,gateTraverseAt(0).point);
  assert.deepEqual(gateTraverseAt(2).point,gateTraverseAt(1).point);
  assert.deepEqual(gateTraverseAt(NaN).point,gateTraverseAt(0).point);
  assert.ok(GATE_STAGE_PROGRESS.passage>0&&GATE_STAGE_PROGRESS.passage<1);
});

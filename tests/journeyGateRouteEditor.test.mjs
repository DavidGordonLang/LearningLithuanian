import test from "node:test";
import assert from "node:assert/strict";
import {
  gateWorldPoint,gateClosestSegment,gateInsertPoint,gateMovePoint,gateRouteJson
} from "../src/views/training/journeyGateRouteEditor.js";

test("pointer translation respects pan, zoom and bounds on mobile",()=>{
  const rect={left:20,top:100};
  const camera={x:-120,y:-320};
  assert.deepEqual(gateWorldPoint(190,430,rect,camera,.85),{x:341,y:765});
  assert.deepEqual(gateWorldPoint(190,430,rect,camera,1.7),{x:171,y:382});
  assert.deepEqual(gateWorldPoint(-900,-900,rect,camera,1),{x:0,y:0});
  assert.deepEqual(gateWorldPoint(9000,9000,rect,camera,1),{x:850,y:1120});
  assert.equal(gateWorldPoint(0,0,rect,camera,0),null);
});
test("add, insert, move and copy preserve order without affecting learning data",()=>{
  const a={x:170,y:1100},c={x:450,y:832},b={x:240,y:1022};
  const draft=gateInsertPoint(gateInsertPoint([],a,"add"),c,"add");
  assert.equal(gateClosestSegment(draft,b),1);
  const inserted=gateInsertPoint(draft,b,"insert");
  assert.deepEqual(inserted,[a,b,c]);
  assert.deepEqual(gateMovePoint(inserted,1,{x:235,y:1019}),[a,{x:235,y:1019},c]);
  assert.deepEqual(draft,[a,c],"draft is immutable");
  assert.deepEqual(JSON.parse(gateRouteJson(inserted)),inserted);
  assert.equal(gateClosestSegment([],b),0);
});

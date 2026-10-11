import test from "node:test";
import assert from "node:assert/strict";
import {nextFoxPreviewPath,fullFoxPreviewPath,foxRouteAt,foxRouteLength} from "../src/views/training/journeyFoxRoutePreview.js";

const stops=[{x:145,y:1090},{x:450,y:610},{x:350,y:605},{x:568,y:468},{x:425,y:333}];
test("four visual-only next-stop legs, no path beyond checkpoint",()=>{
  for(let i=0;i<4;i++){
    const path=nextFoxPreviewPath(stops,i);
    assert.deepEqual(path[0],stops[i]);
    assert.deepEqual(path.at(-1),stops[i+1]);
    assert.ok(path.length>=4);
    assert.ok(foxRouteLength(path)>100);
  }
  assert.equal(nextFoxPreviewPath(stops,4),null);
});
test("route is continuous and stable from start to destination",()=>{
  const path=nextFoxPreviewPath(stops,0), start=foxRouteAt(path,0),end=foxRouteAt(path,1);
  assert.deepEqual(start.point,stops[0]);
  assert.deepEqual(end.point,stops[1]);
  let prev=start.point;
  for(let i=1;i<=100;i++){
    const sample=foxRouteAt(path,i/100);
    assert.ok(["up-left","up-right"].includes(sample.direction));
    assert.ok(Math.hypot(sample.point.x-prev.x,sample.point.y-prev.y)<20);
    prev=sample.point;
  }
});
test("bad input and out of range progress are safe",()=>{
  assert.equal(nextFoxPreviewPath(stops,-1),null);
  assert.equal(foxRouteAt(null,.5),null);
  const path=nextFoxPreviewPath(stops,2);
  assert.deepEqual(foxRouteAt(path,-10).point,path[0]);
  assert.deepEqual(foxRouteAt(path,10).point,path.at(-1));
});


test("one Follow route action visits all five path positions",()=>{
  const route=fullFoxPreviewPath(stops,0);
  assert.deepEqual(route[0],stops[0]);
  assert.deepEqual(route.at(-1),stops[4]);
  for(const point of stops){
    assert.ok(route.some(p=>p.x===point.x&&p.y===point.y),
      "each lesson approach is visited");
  }
  assert.ok(route.length>20);
  assert.deepEqual(fullFoxPreviewPath(stops,2)?.at(-1),stops[4]);
  assert.equal(fullFoxPreviewPath(stops,4),null);
});

test("no route segment crosses the fountain stream hazard",()=>{
  // The stream is east of the western main lane at low elevations.
  const path=fullFoxPreviewPath(stops,0);
  for(let i=0;i<=250;i++){
    const {point:p}=foxRouteAt(path,i/250);
    assert.ok(!(p.y>=650&&p.y<=900&&p.x>475&&p.x<650),
      "fox stays out of the stream before the fountain");
  }
});

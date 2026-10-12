import test from "node:test";
import assert from "node:assert/strict";
import {
  gateWorldPoint,gateClosestSegment,gateInsertPoint,gateMovePoint,gateRouteJson,
  USER_TRACED_VILLAGE_ROUTE,gateRoutePreviewPoint,
  gateAutomaticDirection,gateRouteAt,gateSegmentMidpointProgress,gateDirectionPlan
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


test("Android-authored full village path is retained verbatim as a draft",()=>{
  const points=USER_TRACED_VILLAGE_ROUTE;
  assert.equal(points.length,27);
  assert.deepEqual(points[0],{x:143,y:1070});
  assert.deepEqual(points[10],{x:375,y:636});
  assert.deepEqual(points[14],{x:632,y:513});
  assert.deepEqual(points[15],{x:588,y:486});
  assert.deepEqual(points[26],{x:455,y:182});
  points.forEach(p=>{
    assert.ok(Number.isInteger(p.x)&&p.x>=0&&p.x<=850);
    assert.ok(Number.isInteger(p.y)&&p.y>=0&&p.y<=1120);
  });
  assert.equal(new Set(points.map(p=>p.x+","+p.y)).size,27);
});
test("ground marker stays on the path and moves by cumulative distance",()=>{
  const path=USER_TRACED_VILLAGE_ROUTE;
  assert.deepEqual(gateRoutePreviewPoint(path,0),path[0]);
  assert.deepEqual(gateRoutePreviewPoint(path,1),path.at(-1));
  assert.deepEqual(gateRoutePreviewPoint(path,-1),path[0]);
  assert.deepEqual(gateRoutePreviewPoint(path,9),path.at(-1));
  assert.equal(gateRoutePreviewPoint([],0),null);
  assert.deepEqual(gateRoutePreviewPoint([{x:1,y:2}],.5),{x:1,y:2});
  const segLen=path.slice(1).map((p,i)=>Math.hypot(p.x-path[i].x,p.y-path[i].y));
  const total=segLen.reduce((a,b)=>a+b,0);
  let walked=0;
  path.forEach((node,i)=>{
    if(i)walked+=segLen[i-1];
    const at=gateRoutePreviewPoint(path,walked/total);
    assert.ok(Math.hypot(node.x-at.x,node.y-at.y)<1e-8,
      "authored node "+i+" must be exactly reachable");
  });
  let previous=path[0];
  for(let i=1;i<=200;i++){
    const p=gateRoutePreviewPoint(path,i/200);
    assert.ok(Math.hypot(previous.x-p.x,previous.y-p.y)<=total/200+1e-6);
    previous=p;
  }
});


test("automatic fox direction includes all eight headings",()=>{
  const base={x:100,y:100};
  const directions=[
    [{x:100,y:60},"up"],[{x:140,y:60},"up-right"],
    [{x:140,y:100},"right"],[{x:140,y:140},"down-right"],
    [{x:100,y:140},"down"],[{x:60,y:140},"down-left"],
    [{x:60,y:100},"left"],[{x:60,y:60},"up-left"],
  ];
  directions.forEach(([p,d])=>assert.equal(gateAutomaticDirection(base,p),d));
  assert.equal(gateAutomaticDirection(base,base),"up");
});
test("section locator, jumping and individual overrides preserve the route",()=>{
  const p=USER_TRACED_VILLAGE_ROUTE;
  const sections=gateDirectionPlan(p,{});
  assert.equal(sections.length,26);
  assert.equal(sections[0].segment,1);
  assert.equal(sections[25].to,27);
  for(let i=0;i<26;i++){
    const progress=gateSegmentMidpointProgress(p,i);
    const found=gateRouteAt(p,progress);
    assert.equal(found.segmentIndex,i);
    assert.equal(sections[i].direction,gateAutomaticDirection(p[i],p[i+1]));
    assert.equal(sections[i].mode,"auto");
  }
  assert.equal(gateRouteAt(p,1).segmentIndex,25);
  const overwritten=gateDirectionPlan(p,{2:"down-right",25:"up",4:"nonsense"});
  assert.equal(overwritten[2].direction,"down-right");
  assert.equal(overwritten[2].mode,"manual");
  assert.equal(overwritten[25].mode,"manual");
  assert.equal(overwritten[4].mode,"auto");
  assert.deepEqual(p,USER_TRACED_VILLAGE_ROUTE);
  assert.deepEqual(gateDirectionPlan([],{}),[]);
  assert.equal(gateRouteAt([],0),null);
});

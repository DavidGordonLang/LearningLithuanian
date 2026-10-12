import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {FOX_APPROVED_FAR_SIZE,FOX_APPROVED_SIZE_STOPS,FOX_SIZE_DRAFT_KEY} from "../src/views/training/foxSizeDraftStorage.js";
import {USER_TRACED_VILLAGE_ROUTE,gateFoxScaleWithStops,gateFoxSizePlan} from "../src/views/training/journeyGateRouteEditor.js";

const accepted=[
  {marker:447,progressPercent:44.7,x:393,y:627,section:11,sizePercent:90},
  {marker:454,progressPercent:45.4,x:402,y:622,section:11,sizePercent:83},
  {marker:475,progressPercent:47.5,x:430,y:608,section:11,sizePercent:84},
  {marker:486,progressPercent:48.6,x:445,y:603,section:12,sizePercent:100},
  {marker:552,progressPercent:55.2,x:539,y:588,section:13,sizePercent:88},
];

test("David's approved five fox size anchors reproduce the exact Android export",()=>{
  assert.equal(FOX_APPROVED_FAR_SIZE,65);
  assert.equal(FOX_SIZE_DRAFT_KEY,"zodis:journey-fox-size-draft:1.1:v2");
  assert.deepEqual(gateFoxSizePlan(USER_TRACED_VILLAGE_ROUTE,FOX_APPROVED_FAR_SIZE,FOX_APPROVED_SIZE_STOPS),
    {farSizePercent:65,adjustments:accepted});
  for(const point of accepted){
    const value=gateFoxScaleWithStops(USER_TRACED_VILLAGE_ROUTE,point.marker/1000,.65,FOX_APPROVED_SIZE_STOPS);
    assert.ok(Math.abs(value-point.sizePercent/100)<1e-9,"exact marker "+point.marker);
  }
});
test("five saved sizes remain editable and interpolate without discontinuities",()=>{
  const route=USER_TRACED_VILLAGE_ROUTE,stops=FOX_APPROVED_SIZE_STOPS;
  assert.equal(route.length,27);
  assert.equal(gateFoxScaleWithStops(route,0,.65,stops),1);
  assert.equal(gateFoxScaleWithStops(route,1,.65,stops),.65);
  for(const point of accepted){
    const left=gateFoxScaleWithStops(route,(point.marker-.1)/1000,.65,stops);
    const mid=gateFoxScaleWithStops(route,point.marker/1000,.65,stops);
    const right=gateFoxScaleWithStops(route,(point.marker+.1)/1000,.65,stops);
    assert.ok(Math.abs(left-mid)<.004,"left continuity "+point.marker);
    assert.ok(Math.abs(right-mid)<.004,"right continuity "+point.marker);
  }
  const map=readFileSync(new URL("../src/views/training/JourneyMap.jsx",import.meta.url),"utf8");
  assert.match(map,/FOX_APPROVED_SIZE_STOPS\.map\(stop=>\(\{\.\.\.stop\}\)\)/);
  assert.match(map,/Save size here/);
  assert.match(map,/Copy size adjustments/);
  assert.ok(map.indexOf("Adjust fox size at current route position")<
    map.indexOf("Section {gateSection.segment}"));
});

import test from "node:test";
import assert from "node:assert/strict";
import { SECTION1_PORTRAIT_MARKERS, approvedPortraitMarkerPositions } from "../src/views/training/section1PortraitMarkers.js";

const expected = {
  module_1_1: [
    ["section_1_module_1_lesson_1",535,1271],
    ["section_1_module_1_lesson_2",577,898],
    ["section_1_module_1_lesson_3",793,648],
    ["section_1_module_1_lesson_4",92,445],
    ["section_1_module_1_checkpoint",693,186],
  ],
  module_1_2: [
    ["section_1_module_2_lesson_1",937,1252],
    ["section_1_module_2_lesson_2",576,948],
    ["section_1_module_2_lesson_3",762,714],
    ["section_1_module_2_lesson_4",229,462],
    ["section_1_module_2_lesson_5",566,279],
    ["section_1_module_2_checkpoint",279,82],
  ],
  module_1_3: [
    ["section_1_module_3_lesson_1",209,1076],
    ["section_1_module_3_lesson_2",733,786],
    ["section_1_module_3_lesson_3",345,509],
    ["section_1_module_3_lesson_4",602,257],
    ["section_1_module_3_checkpoint",874,115],
  ],
  module_1_4: [
    ["section_1_module_4_lesson_1",654,1362],
    ["section_1_module_4_lesson_2",411,1100],
    ["section_1_module_4_lesson_3",799,889],
    ["section_1_module_4_lesson_4",237,650],
    ["section_1_module_4_lesson_5",789,535],
    ["section_1_module_4_checkpoint",443,263],
    ["section_1_checkpoint",789,148],
  ],
};

test("banked Section 1 portrait coordinates match all 23 user-approved marker positions exactly",()=>{
  assert.deepEqual(Object.keys(SECTION1_PORTRAIT_MARKERS),Object.keys(expected));
  assert.equal(Object.values(expected).reduce((n,x)=>n+x.length,0),23);
  for(const [mapId,rows] of Object.entries(expected)){
    const actual=SECTION1_PORTRAIT_MARKERS[mapId];
    assert.equal(actual.version,2);
    assert.equal(actual.mapId,mapId);
    assert.deepEqual(actual.dimensions,{width:1024,height:1536});
    assert.deepEqual(actual.markers,rows.map(([id,x,y])=>({id,x,y})));
    assert.equal(new Set(actual.markers.map(m=>m.id)).size,rows.length);
    for(const marker of actual.markers) {
      assert.ok(marker.x>=0 && marker.x<=1024,`${mapId}: x outside artwork`);
      assert.ok(marker.y>=0 && marker.y<=1536,`${mapId}: y outside artwork`);
    }
  }
});

test("editor seeding derives independent editable x/y values without mutating banked baseline",()=>{
  for(const [mapId,rows] of Object.entries(expected)){
    const ids=rows.map(([id])=>id);
    const points=approvedPortraitMarkerPositions(mapId,ids);
    assert.deepEqual(points,Object.fromEntries(rows.map(([id,x,y])=>[id,{x,y}])));
    points[ids[0]].x=-999;
    assert.equal(SECTION1_PORTRAIT_MARKERS[mapId].markers[0].x,rows[0][1]);
    assert.deepEqual(approvedPortraitMarkerPositions(mapId,[ids[0]]),{
      [ids[0]]:{x:rows[0][1],y:rows[0][2]}
    });
    assert.deepEqual(approvedPortraitMarkerPositions(mapId,["nonexistent"]),{});
  }
});
test("no default markers for maps outside approved Section 1",()=>{
  assert.deepEqual(approvedPortraitMarkerPositions("module_2_1",["someId"]),{});
});

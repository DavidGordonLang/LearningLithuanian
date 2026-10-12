import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map=readFileSync(new URL("../src/views/training/JourneyMap.jsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/index.css",import.meta.url),"utf8");

test("the gate frame proof preserves the same three grounded anchor positions",()=>{
  for(const text of [
    'approach: { x: 170, y: 1100 }',
    'passage: { x: 240, y: 1022 }',
    'emerge: { x: 450, y: 832 }',
    'A · Approach','B · Under arch','C · Emerge'
  ]) assert.ok(map.includes(text),text);
  assert.match(map,/setGateProgress\(GATE_STAGE_PROGRESS\[stage\]\)/);
  assert.doesNotMatch(map,/requestAnimationFrame|followFoxRoute/);
  assert.match(map,/aria-label="Scrub fox through gate"/);
  assert.match(map,/GATE_ROUTE_POINTS.map/);
});

test("Fixed arch 2 alpha mask reuses native painted gate tiles without scaling",()=>{
  const cutout=readFileSync(new URL("../public/assets/journey/gate-foreground-fixed-arch-2-mask.png",import.meta.url));
  assert.deepEqual([...cutout.subarray(0,8)],[137,80,78,71,13,10,26,10],"valid PNG signature");
  assert.equal(cutout.readUInt32BE(16),377);
  assert.equal(cutout.readUInt32BE(20),399);
  assert.equal(cutout[25],6,"RGBA PNG mask supports alpha");
  assert.ok(cutout.length>4000,"mask preserves corrected arch silhouette");
  assert.match(map,/const GATE_FOREGROUND_CUTOUT = \{/);
  assert.match(map,/gate-foreground-fixed-arch-2-mask\.png/);
  for(const token of ["left: 121","top: 721","width: 377","height: 399"]){
    assert.ok(map.includes(token),token);
  }
  assert.match(map,/foxPreviewEnabled && \(!editingGate \|\| gateEditMode==="preview"\)/);
  assert.match(map,/className="z-gate-foreground-cutout"/);
  assert.match(map,/maskImage:/);
  assert.match(map,/WebkitMaskImage:/);
  assert.match(map,/FIRST_CONTACT_TILES\.slice\(2\)\.map/);
  assert.match(map,/className="z-gate-foreground-tile"/);
  assert.match(css,/\.z-gate-foreground-tile\{position:absolute;display:block;width:850px;height:280px/);
  assert.doesNotMatch(map,/z-gate-masonry-refinement|clipPath=|<svg className="z-gate-foreground-cutout"/);
  assert.match(css,/\.z-gate-foreground-cutout\{position:absolute;z-index:4;pointer-events:none/);
  assert.match(css,/\.z-local-map-character\.is-approaching\{transform:translate\(-50%,-100%\);z-index:2/);
});

test("zoom, lessons and other companions remain connected",()=>{
  assert.match(map,/pinchView\(\{/);
  assert.match(map,/data-swipe-block="true"/);
  assert.match(map,/foxPreviewEnabled = illustrated && companion\?\.id === "fox"/);
  assert.match(map,/onOpenLesson\?\.\(stop\.id\)/);
  assert.match(map,/: <FullBodyCompanion companion=\{companion\}/);
  assert.doesNotMatch(map,/localStorage\.setItem|awardXp|markComplete/);
});


test("gate depth proof anchors fox on the paved ground and scales into the arch",()=>{
  assert.match(map,/passage: \{ x: 240, y: 1022 \}/);
  assert.match(map,/passage: \{ width: 82, height: 112 \}/);
  assert.match(map,/approach: \{ width: 82, height: 112 \}/);
  assert.match(map,/emerge: \{ width: 78, height: 106 \}/);
  assert.match(map,/is-gate-test/);
  assert.match(css,/\.z-local-map-character\.is-approaching\.is-gate-test \.z-companion-fullbody/);
});
test("hideable gate marker reveals occlusion without altering learner progress",()=>{
  assert.match(map,/const \[gateShowMarker, setGateShowMarker\] = useState\(false\)/);
  assert.match(map,/const hideForGateProof=foxPreviewEnabled && \(editingGate \|\| \(i===0 && !gateShowMarker\)\)/);
  assert.match(map,/setGateShowMarker\(v=>!v\)/);
  assert.match(css,/\.z-local-map-stop\.is-gate-marker-hidden\{visibility:hidden;pointer-events:none\}/);
  assert.match(map,/onOpenLesson\?\.\(stop.id\)/);
  assert.doesNotMatch(map,/localStorage\.setItem/);
});


test("route editor stays isolated to the illustrated fox proof and does not save learning progress",()=>{
  assert.match(map,/const editingGate = illustrated && companion\?\.id === "fox" && gateEditorEnabled/);
  assert.match(map,/const \[gateRoutePoints, setGateRoutePoints\] = useState\(/);
  assert.match(map,/aria-label="Gate visual path editor"/);
  assert.match(map,/aria-label="Route coordinates"/);
  assert.match(map,/gateInsertPoint\(points,world,edit.mode\)/);
  assert.match(map,/gateMovePoint\(points,edit.index,world\)/);
  assert.match(map,/!editingGate && <span className="z-gate-foot-shadow"/);
  assert.match(map,/setGateRoutePoints\(\[\]\)/);
  assert.match(map,/onOpenLesson\?\.\(stop.id\)/);
  assert.doesNotMatch(map,/localStorage\.setItem|awardXp|markComplete/);
});

test("traced village preview shows feet marker, keeps fox off, and preserves accepted gate art",()=>{
  assert.match(map,/USER_TRACED_VILLAGE_ROUTE/);
  assert.match(map,/gateRouteAt\(gateRoutePoints,gateMarkerProgress\)/);
  assert.match(map,/gateMarkerPoint && <span className="z-gate-depth-reference"/);
  assert.match(map,/className="z-gate-depth-reference-fox"/);
  assert.match(map,/className="z-gate-depth-paw-dot"/);
  assert.match(map,/gateDepthShowFox && <img src=\{FOX_DIRECTIONAL_PREVIEW\["up-right"\]\}/);
  assert.match(map,/gateDepthShowGuide/);
  assert.match(css,/\.z-gate-depth-reference\{position:absolute;z-index:2/);
  assert.match(css,/\.z-gate-foreground-cutout\{position:absolute;z-index:4/);
  assert.match(css,/\.z-gate-route-editor-art\{position:absolute;inset:0;z-index:7/);
  assert.match(map,/aria-label="Scrub ground marker on traced route"/);
  assert.match(map,/gateEditMode!=="preview" && gateRoutePoints.map/);
  assert.match(map,/setGateMarkerProgress\(Number\(e.target.value\)\/1000\)/);
  assert.match(map,/gateMarkerPoint\|\|gateRoutePoints.at\(-1\)/);
  assert.match(map,/gateEditorEnabled/);
  assert.match(map,/gate-foreground-fixed-arch-2-mask\.png/);
  assert.doesNotMatch(map,/requestAnimationFrame/);
});

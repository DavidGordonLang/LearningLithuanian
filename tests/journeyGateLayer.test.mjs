import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map=readFileSync(new URL("../src/views/training/JourneyMap.jsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/index.css",import.meta.url),"utf8");

test("the gate proof provides three grounded static positions",()=>{
  for(const text of [
    'approach: { x: 170, y: 1100 }',
    'passage: { x: 240, y: 1022 }',
    'emerge: { x: 450, y: 832 }',
    'A · Approach','B · Under arch','C · Emerge'
  ]) assert.ok(map.includes(text),text);
  assert.match(map,/setGateStage\(stage\)/);
  assert.doesNotMatch(map,/requestAnimationFrame|followFoxRoute/);
});

test("the original-art arch and FULL right pier overlay the fox; left pier stays in base",()=>{
  const cutout=readFileSync(new URL("../public/assets/journey/gate-foreground-cutout.webp",import.meta.url));
  assert.equal(cutout.subarray(0,4).toString("ascii"),"RIFF");
  assert.equal(cutout.subarray(8,12).toString("ascii"),"WEBP");
  assert.ok(cutout.length>5000,"cutout contains detailed original art pixels");
  assert.match(map,/const GATE_FOREGROUND_CUTOUT = \{/);
  assert.match(map,/gate-foreground-cutout\.webp/);
  for(const token of ["left: 104","top: 731","width: 226","height: 329"]){
    assert.ok(map.includes(token),token);
  }
  assert.match(map,/foxPreviewEnabled && <svg className="z-gate-foreground-cutout"/);
  assert.match(map,/clipPath id="z-gate-masonry-refinement"/);
  assert.match(map,/clipPath="url\(#z-gate-masonry-refinement\)"/);
  assert.match(map,/href=\{GATE_FOREGROUND_CUTOUT\.src\}/);
  assert.doesNotMatch(map,/GATE_OCCLUSION_POLYGONS|clipPath id="z-gate-foreground-cutout"/);
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
  assert.match(map,/const hideForGateProof=foxPreviewEnabled && i===0 && !gateShowMarker/);
  assert.match(map,/setGateShowMarker\(v=>!v\)/);
  assert.match(css,/\.z-local-map-stop\.is-gate-marker-hidden\{visibility:hidden;pointer-events:none\}/);
  assert.match(map,/onOpenLesson\?\.\(stop.id\)/);
  assert.doesNotMatch(map,/localStorage\.setItem/);
});

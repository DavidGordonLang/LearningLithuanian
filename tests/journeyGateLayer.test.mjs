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

test("arch and right pier are clipped above fox, while left pier remains in base",()=>{
  assert.match(map,/const GATE_OCCLUSION_POLYGONS = \[/);
  assert.match(map,/108,790 118,768/);
  assert.match(map,/265,842 282,841/);
  assert.match(map,/clipPath id="z-gate-foreground-cutout"/);
  assert.match(map,/clipPath="url\(#z-gate-foreground-cutout\)"/);
  assert.match(map,/href=\{FIRST_CONTACT_TILES\[2\]\}/);
  assert.match(map,/href=\{FIRST_CONTACT_TILES\[3\]\}/);
  assert.match(map,/foxPreviewEnabled && <svg/);
  assert.match(css,/\.z-gate-foreground-mask\{position:absolute;inset:0;z-index:4/);
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

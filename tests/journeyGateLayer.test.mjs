import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map=readFileSync(new URL("../src/views/training/JourneyMap.jsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/index.css",import.meta.url),"utf8");

test("the gate proof provides three grounded static positions",()=>{
  for(const text of [
    'approach: { x: 199, y: 1047 }',
    'passage: { x: 234, y: 951 }',
    'emerge: { x: 392, y: 817 }',
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

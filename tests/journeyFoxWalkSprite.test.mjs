import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const map=readFileSync(new URL("../src/views/training/JourneyMap.jsx",import.meta.url),"utf8");
const sprite=readFileSync(new URL("../src/views/training/FoxWalkSprite.jsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/index.css",import.meta.url),"utf8");
const bytes=readFileSync(new URL("../public/assets/journey/fox-walk-up-left-fixed-probe.avif",import.meta.url));

test("isolated map animation has eight frames and frame-stepping controls",()=>{
  assert.match(map,/gateDepthAnimateFox/);
  assert.match(map,/setGateWalkFrame\(f => \(f \+ 1\) % 8\), 140/);
  assert.match(map,/Preview walking fox/);
  assert.match(map,/Next fox walk pose/);
  assert.match(map,/Change fox walking direction/);
  assert.match(map,/gateMarkerPoint && <span className="z-gate-depth-reference"/);
  assert.match(sprite,/index % 4/);
  assert.match(sprite,/Math.floor\(index \/ 4\)/);
  assert.match(sprite,/scaleX\(-1\)/);
  assert.match(css,/background-size:400% 200%/);
  assert.match(css,/z-gate-fox-walk-probe/);
});
test("walking proof uses compact real AVIF sprite atlas, not GIF preview",()=>{
  assert.equal(bytes.toString("ascii",4,12),"ftypavif");
  assert.ok(bytes.length<80000);
  assert.match(css,/fox-walk-up-left-fixed-probe\.avif/);
  assert.doesNotMatch(map,/localStorage\.setItem|awardXp|markComplete/);
});


test("all eight headings use valid AVIF atlases at fixed paw anchor",()=>{
  const atlases=["up-left","up","left","down","down-left"];
  for(const name of atlases){
    const buffer=readFileSync(new URL(`../public/assets/journey/fox-walk-${name}-fixed-probe.avif`,import.meta.url));
    assert.equal(buffer.toString("ascii",4,12),"ftypavif",name);
    assert.ok(buffer.length>10000&&buffer.length<80000,name+" mobile budget");
  }
  for(const heading of ["up-left","up","up-right","left","right","down-left","down","down-right"]){
    assert.ok(sprite.includes(`value: "${heading}"`),heading);
  }
  assert.equal((sprite.match(/mirror: true/g)||[]).length,3);
  assert.match(sprite,/backgroundImage:/);
  assert.match(sprite,/transform: direction.mirror/);
  assert.match(map,/role="group" aria-label="Change fox walking direction"/);
  assert.match(map,/aria-pressed=\{gateWalkFacing===value\}/);
  assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
});

test("each authored route section has automated tangent and independent manual choice",()=>{
  const source=readFileSync(new URL("../src/views/training/journeyGateRouteEditor.js",import.meta.url),"utf8");
  assert.match(source,/gateAutomaticDirection/);
  assert.match(source,/gateSegmentMidpointProgress/);
  assert.match(map,/gateSectionIndex/);
  assert.match(map,/Previous section/);
  assert.match(map,/Next section/);
  assert.match(map,/Copy all section directions/);
  assert.match(map,/gateDirectionExport/);
  assert.match(map,/setGateSegmentDirections/);
  assert.match(map,/Auto direction/);
  assert.match(map,/gateRouteAt\(gateRoutePoints,gateMarkerProgress\)/);
  assert.doesNotMatch(map,/awardXp|markComplete/);
});

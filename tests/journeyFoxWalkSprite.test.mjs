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

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const src=readFileSync(resolve(root,'src/views/training/JourneyMapWorkbench.jsx'),'utf8');
const css=readFileSync(resolve(root,'src/views/training/JourneyMapWorkbenchDirection.css'),'utf8');

test('sizing panel uses fixed automated directions and locked journey sources',()=>{
  assert.match(src,/Adjust companion size/);
  assert.match(src,/Copy sizing JSON/);
  assert.match(src,/sizeAtProgress\(anchors,position\)/);
  assert.match(src,/directionPlanSignature\(route,\{\}\)/);
  assert.match(src,/approvedPortraitRoutePoints\(mapId\)/);
  assert.match(src,/approvedPortraitMarkerPositions\(mapId,stops\.map/);
  for(const old of ['Choose walking directions','Trace walking route','Place lesson markers','Clear route'])
    assert.ok(!src.includes(old),old);
});

test('sizing workbench preserves pan/pinch and front-facing checkpoints without changing pages',()=>{
  assert.match(src,/data-swipe-block="true"/);
  assert.match(src,/kind:'pinch'/);
  assert.match(src,/gateRouteAt\(route,position\/1000\)/);
  assert.match(src,/FoxWalkSprite frame=\{frame\}/);
  assert.match(src,/fox-idle.webp/);
  assert.match(src,/wolf-idle.webp/);
  assert.match(src,/currentCheckpoint/);
  assert.match(src,/checkpointStops.map/);
  assert.match(src,/setPlaying\(false\)/);
  assert.doesNotMatch(src,/useGameStore|saveLessonProgress|setCompleted/);
});
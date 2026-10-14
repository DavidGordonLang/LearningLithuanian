import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const src=readFileSync(resolve(root,'src/views/training/JourneyMapWorkbench.jsx'),'utf8');
const css=readFileSync(resolve(root,'src/views/training/JourneyMapWorkbenchDirection.css'),'utf8');

test('direction-only authoring panel is displayed before sizing',()=>{
  assert.match(src,/Choose walking directions/);
  assert.match(src,/Copy directions JSON/);
  assert.match(src,/WALK_DIRECTIONS\.map/);
  assert.match(src,/directionForSegment\(route,segment,overrides\)/);
  assert.match(src,/approvedPortraitRoutePoints\(mapId\)/);
  assert.match(src,/approvedPortraitMarkerPositions\(mapId,stops\.map/);
  for(const retired of ['Save size point','Size at this position','Adjust companion size',
      'Trace walking route','Place lesson markers','setPlaced','Clear route'])
    assert.ok(!src.includes(retired),retired);
});

test('direction authoring preserves pan and pinch without changing app pages',()=>{
  assert.match(src,/data-swipe-block="true"/);
  assert.match(src,/kind:'pinch'/);
  assert.match(src,/gateRouteAt\(route,position\/1000\)/);
  assert.match(src,/FoxWalkSprite frame=\{frame\}/);
  assert.match(css,/z-direction-grid/);
  assert.doesNotMatch(src,/useGameStore|saveLessonProgress|setCompleted/);
});
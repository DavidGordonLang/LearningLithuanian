import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const src=readFileSync(resolve(root,'src/views/training/JourneyMapWorkbench.jsx'),'utf8');
test('combined size/placement authoring retains locked approved map geometry',()=>{
  assert.match(src,/Adjust companion size/);
  assert.match(src,/Copy \{companion\} size \+ placement JSON/);
  assert.match(src,/sizeAtProgress\(anchors,position\)/);
  assert.match(src,/directionPlanSignature\(route,\{\}\)/);
  assert.match(src,/approvedPortraitRoutePoints\(mapId\)/);
  assert.match(src,/approvedPortraitMarkerPositions\(mapId,stops\.map/);
  for(const retired of ['Choose walking directions','Trace walking route',
    'Place lesson markers','Clear route'])
    assert.ok(!src.includes(retired),retired);
});
test('direct avatar drag and empty-background pan coexist with pinch and checkpoints',()=>{
  assert.match(src,/data-swipe-block="true"/);
  assert.match(src,/kind:'pinch'/);
  assert.match(src,/kind:hit\?'sprite':'single'/);
  assert.match(src,/g.kind==='sprite'/);
  assert.match(src,/savePlacement\(placementsRef.current,positionRef.current/);
  assert.match(src,/previewPlacement\(route,placements,position\)/);
  assert.match(src,/FoxWalkSprite frame=\{frame\}/);
  assert.match(src,/fox-idle.webp/);
  assert.match(src,/wolf-idle.webp/);
  assert.match(src,/checkpointStops.map/);
  assert.doesNotMatch(src,/useGameStore|saveLessonProgress|setCompleted/);
});
test('Fox and Wolf profiles independently export placement and held sizes',()=>{
  assert.match(src,/companionStorageKey\(userId,mapId,companion\)/);
  assert.match(src,/buildCompanionDraft\(mapId,route,companion/);
  assert.match(src,/restoreCompanionDraft\(raw,mapId,route,companion,facingSignature\)/);
  assert.match(src,/sizeStorageKey\(userId,mapId\)/);
});

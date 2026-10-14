import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const src=readFileSync(resolve(root,'src/views/training/JourneyMapWorkbench.jsx'),'utf8');
const css=readFileSync(resolve(root,'src/views/training/JourneyMapWorkbench.css'),'utf8');

test('beta workbench shows a single Play Journey action, no sliders or manual controls',()=>{
  assert.match(src,/Automatic journey preview/);
  assert.match(src,/▶ Play Journey/);
  assert.equal((src.match(/<button /g)||[]).length,4); // Back, Fox, Wolf, Play
  assert.doesNotMatch(src,/type="range"|Save size point|Copy sizing JSON|Copy .*JSON/);
  assert.doesNotMatch(src,/onPointerDown=\{touchStart\}|kind:'sprite'|savePlacement\(/);
  assert.doesNotMatch(src,/setSizeAnchor\(|buildCompanionDraft\(|setPlacements\(/);
  assert.match(src,/MAPS\.map\(/);
});
test('automatic direction uses the traced route, never the detached sprite position',()=>{
  assert.match(src,/automaticJourneyFacing\(route,progress\)/);
  assert.match(src,/gateRouteAt\(route,progress\)/);
  assert.match(src,/approvedPortraitRoutePoints\(mapId\)/);
  assert.match(src,/approvedPortraitMarkerPositions\(mapId,stops\.map/);
  assert.match(src,/FoxWalkSprite frame=\{frame\} facing=\{facing\}/);
  assert.match(src,/companionId=\{companion\}/);
});
test('original front-facing art and gesture protections remain',()=>{
  assert.match(src,/fox-idle.webp/);
  assert.match(src,/wolf-idle.webp/);
  assert.match(src,/automaticJourneyFrame\(clock\.current,holds\)/);
  assert.match(src,/data-swipe-block="true"/);
  assert.match(css,/touch-action:none/);
  assert.match(src,/mode:'pinch'/);
  assert.match(src,/mode:'pan'/);
  assert.doesNotMatch(src,/useGameStore|saveLessonProgress|setCompleted/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=path=>readFileSync(resolve(root,path),'utf8');
const src=source('src/views/training/JourneyMapWorkbench.jsx');

test('size workbench owns touch gestures and blocks page swipe',()=>{
 const css=source('src/views/training/JourneyMapWorkbench.css');
 assert.match(src,/data-swipe-block="true"/);
 assert.match(src,/kind:'pinch'/);
 assert.match(css,/touch-action:none/);
 assert.match(source('src/components/SwipePager.jsx'),/data-swipe-block/);
});

test('four portraits and approved markers and routes remain read only',()=>{
 assert.equal((src.match(/w:1024,h:1536/g)||[]).length,4);
 for(const id of ['1.1','1.2','1.3','1.4'])
   assert.ok(src.includes('section-1-map-'+id+'-portrait.avif'));
 assert.ok(src.includes('approvedPortraitMarkerPositions(mapId,stops.map(s=>s.id))'));
 assert.ok(src.includes('approvedPortraitRoutePoints(mapId)'));
 assert.ok(src.includes('z-size-locked-marker'));
});

test('only sizing stage controls real Fox and Wolf sprites',()=>{
 for(const term of ['Adjust companion size','FoxWalkSprite frame={frame}',
    'sizeAtProgress(anchors,position)','Save size point','Play walk',
    'Copy sizing JSON','sizeStorageKey(userId,mapId)',
    'localStorage.setItem(key','SIZE_MAX_PERCENT','SIZE_MIN_PERCENT'])
   assert.ok(src.includes(term),term);
 for(const retired of ['Trace walking route','Place lesson markers',
    'Clear route','Remove bend','Undo last','Clear selected','setPlaced',
    'useGameStore','setCompleted'])
   assert.ok(!src.includes(retired),retired);
});

test('sizing drafts remain isolated from marker/route authoring',()=>{
 assert.ok(src.includes('buildSizeDraft(mapId,route,next)'));
 assert.ok(src.includes('restoreSizeDraft(localStorage.getItem(key),mapId,route)'));
 assert.ok(!src.includes('setPoints('));
 assert.ok(!src.includes('buildRouteDraft('));
});

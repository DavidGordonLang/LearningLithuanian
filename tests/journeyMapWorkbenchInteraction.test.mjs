import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(root,path),'utf8');

test('route editor blocks horizontal page swipe and preserves touch-action none for pinch',()=>{
 const src=read('src/views/training/JourneyMapWorkbench.jsx');
 const css=read('src/views/training/JourneyMapWorkbench.css');
 assert.match(src,/data-swipe-block="true"/);
 assert.match(src,/kind:'pinch'/);
 assert.match(src,/kind:index>=0\?'vertex':'single'/);
 assert.match(src,/if\(g\?\.kind==='pinch'\)/);
 assert.match(css,/touch-action:none/);
});

test('all four original 1024×1536 assets and immutable approved markers remain',()=>{
 const src=read('src/views/training/JourneyMapWorkbench.jsx');
 assert.equal((src.match(/w:1024,h:1536/g)||[]).length,4);
 for(const m of ['1.1','1.2','1.3','1.4'])
  assert.ok(src.includes(`section-1-map-${m}-portrait.avif`));
 assert.match(src,/approvedPortraitMarkerPositions\(map\.id,ids\)/);
 assert.match(src,/z-route-locked-marker/);
 assert.doesNotMatch(src,/setPlaced|clearSelected|markerJson|Place lesson markers|Lesson destinations, in order/);
});

test('one authoring panel traces polylines, supports pan, vertex edits and export',()=>{
 const src=read('src/views/training/JourneyMapWorkbench.jsx');
 assert.match(src,/Trace walking route/);
 assert.match(src,/tap along the open road/);
 assert.match(src,/setMapId\(e\.target\.value\)/);
 assert.match(src,/setPoints\(clean\)/);
 assert.match(src,/localStorage\.setItem\(key/);
 assert.match(src,/const undo=/);
 assert.match(src,/const deleteSelected=/);
 assert.match(src,/const clear=/);
 assert.match(src,/const copy=async/);
 assert.match(src,/navigator\.clipboard\.writeText\(exportData\)/);
 assert.match(src,/polyline/);
 assert.doesNotMatch(src,/Place marker|Clear selected|Sprite size editor|Fit whole map|setTool/);
 assert.doesNotMatch(src,/useGameStore|saveLessonProgress|addXP|setCompleted/);
});
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname, resolve} from "node:path";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=path=>readFileSync(resolve(root,path),"utf8");

test("DEV map editor keeps touch gestures inside itself instead of swiping between app pages",()=>{
  const map=read("src/views/training/JourneyMapWorkbench.jsx");
  const pager=read("src/components/SwipePager.jsx");
  assert.match(map, /<div data-swipe-block="true" className="z-marker-workbench/);
  assert.match(map, /className="z-marker-viewport mt-2" ref=\{viewport\} data-swipe-block="true"/);
  assert.match(pager, /el\.closest\?\.\('\[data-swipe-block="true"\]'\)/);
  assert.match(pager, /if \(isTextFieldEl\(target\)\) return;/);
});

test("marker editor supports one-finger drag, two-finger pinch and deliberate tap placement without manual mode controls",()=>{
  const map=read("src/views/training/JourneyMapWorkbench.jsx");
  const css=read("src/views/training/JourneyMapWorkbench.css");
  assert.match(map,/const active=pointers\.current/);
  assert.match(map,/kind:'single'/);
  assert.match(map,/kind:'pinch'/);
  assert.match(map,/g\.startZoom\*\(distance\/g\.startDistance\)/);
  assert.match(map,/if\(g\.moved\)updateView/);
  assert.match(map,/g\.moved\|\|\s*!g\.canPlace/);
  assert.match(map,/const x=Math\.round\(clamp/);
  assert.match(map,/record\(\{\.\.\.placed,\[selectedId\]:\{x,y\}\}\)/);
  assert.match(css,/touch-action:none/);
  assert.doesNotMatch(map,/✋ Pan|＋ Zoom|－ Zoom|Fit whole map|setTool|changeZoom/);
});

test("map switching and lesson coordinate drafts remain separate from learning progression",()=>{
  const map=read("src/views/training/JourneyMapWorkbench.jsx");
  assert.match(map,/setMapId\(e\.target\.value\)/);
  assert.match(map,/storageKey\(userId,mapId\)/);
  assert.match(map,/localStorage\.setItem/);
  assert.match(map,/markers:ids\.filter\(id=>placed\[id\]\)/);
  assert.doesNotMatch(map,/useGameStore|setCompleted|saveLessonProgress/);
});

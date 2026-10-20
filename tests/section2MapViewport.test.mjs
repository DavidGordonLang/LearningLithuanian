import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {section2FitScale,section2StageLayout}
  from '../src/views/training/section2MapViewport.js';

test('Section 2 fits an entire map on a narrow portrait phone and centres it',()=>{
  const z=section2FitScale(330,450);
  assert.equal(z,450/1536);
  const view=section2StageLayout(330,450,z);
  assert.ok(Math.abs(view.imageHeight-450)<1e-8);
  assert.ok(view.left>0);
  assert.equal(view.top,0);
  assert.equal(view.stageWidth,330);
  assert.equal(view.stageHeight,450);
});

test('wide viewports centre the portrait on both axes if there is spare space',()=>{
  const z=section2FitScale(950,750);
  const view=section2StageLayout(950,750,z);
  assert.equal(view.stageWidth,950);
  assert.equal(view.stageHeight,750);
  assert.equal(view.left,(950-1024*z)/2);
  assert.equal(view.top,0);
  const zoomedOut=section2StageLayout(950,750,.25);
  assert.equal(zoomedOut.left,(950-256)/2);
  assert.equal(zoomedOut.top,(750-384)/2);
});

test('zooming in keeps a scrollable map and original 1024 × 1536 point geometry',()=>{
  const view=section2StageLayout(310,470,1.2);
  assert.equal(view.left,0);
  assert.equal(view.top,0);
  assert.equal(view.stageWidth,1228.8);
  assert.ok(Math.abs(view.stageHeight-1843.2)<1e-8);
  const cursor={x:314,y:640},imageRect={left:37,top:82};
  assert.equal(Math.round((cursor.x-imageRect.left)/1.2),231);
  assert.equal(Math.round((cursor.y-imageRect.top)/1.2),465);
});

test('DEV authoring measures and recentres without resetting saved marker or route coordinates',()=>{
  const src=readFileSync(new URL('../src/views/training/Section2ArtworkWorkbench.jsx',import.meta.url),'utf8');
  assert.match(src,/new ResizeObserver\(measure\)/);
  assert.match(src,/ref=\{viewportRef\}/);
  assert.match(src,/section2StageLayout\(/);
  assert.match(src,/left:layout\.left,top:layout\.top/);
  assert.match(src,/min=\{fitZoom\}/);
  assert.match(src,/>Fit map<\/button>/);
  assert.match(src,/const b=e\.currentTarget\.getBoundingClientRect\(\)/);
  assert.match(src,/localStorage\.setItem\(section2ArtworkStorageKey/);
  assert.match(src,/markers:\[\.\.\.old\.markers\.filter/);
  assert.match(src,/route:\[\.\.\.old\.route,p\]/);
});

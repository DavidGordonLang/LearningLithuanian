import test from "node:test";
import assert from "node:assert/strict";
import { clampCamera, fitMapScale, pinchView, MAP_MAX_ZOOM } from "../src/views/training/journeyMapGestures.js";

test("fully zoomed-out map centres within viewport instead of sticking to its edge", () => {
  const fit = fitMapScale(360, 610, .87);
  assert.ok(Math.abs(fit - 360/850) < 1e-10);
  const camera = clampCamera(-500, -500, 360, 610, fit);
  assert.equal(camera.x, 0);
  assert.ok(camera.y > 0);
});

test("pinching outward and inward preserves the focal world coordinate", () => {
  const startScale = .8, anchor = {x:410,y:560}, midpoint = {x:180,y:310};
  const out = pinchView({startScale,startDistance:130,distance:170,anchor,midpoint,width:360,height:610,minScale:.35});
  assert.ok(out.scale > startScale);
  assert.ok(out.scale <= MAP_MAX_ZOOM);
  assert.ok(Math.abs((midpoint.x-out.camera.x)/out.scale-anchor.x) < 1e-10);
  assert.ok(Math.abs((midpoint.y-out.camera.y)/out.scale-anchor.y) < 1e-10);
  const smaller = pinchView({startScale,startDistance:130,distance:95,anchor,midpoint,width:360,height:610,minScale:.35});
  assert.ok(smaller.scale < startScale);
});

test("zoom is limited to full-map overview and maximum detail", () => {
  const base = {startScale:.87,startDistance:100,anchor:{x:350,y:500},
    midpoint:{x:150,y:250},width:360,height:610,minScale:fitMapScale(360,610,.87)};
  const minimum = pinchView({...base,distance:2});
  const maximum = pinchView({...base,distance:2000});
  assert.ok(Math.abs(minimum.scale-base.minScale)<1e-10);
  assert.equal(maximum.scale,MAP_MAX_ZOOM);
  assert.deepEqual(clampCamera(900,-900,360,610,.8),{x:0,y:610-1120*.8});
});

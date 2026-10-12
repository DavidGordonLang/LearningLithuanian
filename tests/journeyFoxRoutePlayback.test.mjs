import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {USER_TRACED_VILLAGE_ROUTE as p,gateRouteAt,gateDirectionPlan} from "../src/views/training/journeyGateRouteEditor.js";
import {foxRouteTotalDistance as total,foxRouteAdvance as advance,foxRouteFrame as pose,foxRouteNearestProgress as nearest} from "../src/views/training/journeyFoxRoutePlayback.js";
test("fox walk follows all 27 points and ends without looping",()=>{
 const d=total(p);assert.equal(p.length,27);assert.ok(d>1000);
 assert.equal(advance(p,0,d/95),1);assert.equal(advance(p,1,3),1);
 assert.equal(gateRouteAt(p,1).x,p.at(-1).x);
 assert.equal(gateDirectionPlan(p).length,26);
 for(let i=0;i<32;i++)assert.equal(pose(p,i*13/d),i%8);
 assert.equal(nearest(p,p.at(-1)),1);
});
test("route controls preserve lesson-free visual QA",()=>{
 const s=readFileSync(new URL("../src/views/training/JourneyMap.jsx",import.meta.url),"utf8");
 for(const name of ["Play route","Pause route","Restart route","requestAnimationFrame","foxRouteAdvance","gateFoxScale","gateWalkFacing"])assert.ok(s.includes(name),name);
});

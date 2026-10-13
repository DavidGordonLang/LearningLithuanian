import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {preloadFoxWalkAtlases} from "../src/views/training/foxWalkAtlasPreload.js";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("direction atlases predecode and failures are explicit",async()=>{
 const previous=globalThis.Image;
 globalThis.Image=class {
   set src(v){this.uri=v;}
   decode(){return this.uri.includes("up-fixed")?Promise.reject(Error("failed")):Promise.resolve();}
 };
 try{
   const results=await preloadFoxWalkAtlases();
   assert.equal(results.length,5);
   assert.equal(results.find(x=>x.name==="up").ready,false);
   assert.equal(results.filter(x=>x.ready).length,4);
 }finally{if(previous===undefined)delete globalThis.Image;else globalThis.Image=previous;}
});
test("fox gap route replay does not alter lesson progress",()=>{
 const map=read("src/views/training/JourneyMap.jsx");
 for(const term of ['get("journeyQA")==="fox-gap"',"{start:0.395,moving:true}",
   "!journeyAtlasLoaded","!walkAtlasState.complete",
   'src="/assets/journey/fox-idle.webp"'])
   assert.ok(map.includes(term),term);
 assert.ok(!map.includes("awardXp("));
 assert.ok(!map.includes("completeLesson("));
 assert.ok(map.includes("wolfRouteReplay"));
 assert.ok(!map.includes("Replay complete wolf village walk"));
 assert.ok(map.includes("Developer-only wolf route diagnostics"));
 assert.ok(map.includes("Developer-only fox route diagnostics"));
 assert.ok(map.includes("/assets/journey/wolf-idle.webp"));
});

test("ordinary Journey hides all replay controls while URL-only diagnostics remain available",()=>{
 const home=read("src/views/training/LearningHome.jsx");
 const map=read("src/views/training/JourneyMap.jsx");
 assert.ok(home.includes("reviewRoute"));
 assert.ok(home.includes("key={activeModule.id}"));
 assert.ok(home.includes("onOpenLesson={onOpenLesson}"));
 assert.ok(!home.includes("Replay Bakery"));
 assert.ok(!home.includes("Replay complete wolf village walk"));
 assert.ok(!home.includes("setFoxReplayCount"));
 assert.ok(!home.includes("setWolfReplayCount"));
 assert.ok(!home.includes("replayFoxGap="));
 assert.ok(!home.includes("replayWolfRoute="));
 assert.ok(!map.includes("Replay Bakery"));
 assert.ok(!map.includes("Replay complete wolf village walk"));
 assert.ok(map.includes('get("journeyQA")==="fox-gap"'));
 assert.ok(map.includes('get("journeyQA")==="wolf-route"'));
 assert.ok(map.includes("foxGapReplay ? {at:673}"));
 assert.ok(map.includes("{start:0.395,moving:true}"));
 assert.ok(map.includes("wolfRouteReplay ? {at:1000}"));
 assert.ok(map.includes("Developer-only fox route diagnostics"));
 assert.ok(map.includes("Developer-only wolf route diagnostics"));
});

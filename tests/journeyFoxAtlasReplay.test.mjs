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
 for(const term of ['get("journeyQA")==="fox-gap"',"{start:0.255,moving:true}",
   "Replay Fountain","!journeyAtlasLoaded","!foxAtlasState.complete",
   'src="/assets/journey/fox-idle.webp"'])
   assert.ok(map.includes(term),term);
 assert.ok(!map.includes("awardXp("));
 assert.ok(!map.includes("completeLesson("));
});

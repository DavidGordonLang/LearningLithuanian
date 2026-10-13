import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {preloadJourneyWalkAtlases,FOX_WALK_ATLAS_NAMES,WOLF_WALK_ATLAS_NAMES}
  from "../src/views/training/foxWalkAtlasPreload.js";

const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("all eight approved wolf headings map to six real transparent AVIF atlases",()=>{
  assert.deepEqual(WOLF_WALK_ATLAS_NAMES,
    ["up-left","up","left","down-left","down","down-right"]);
  for(const name of WOLF_WALK_ATLAS_NAMES){
    const bytes=readFileSync(new URL("../public/assets/journey/wolf-walk-"+name+"-fixed.avif",import.meta.url));
    assert.equal(bytes.toString("ascii",4,12),"ftypavif",name);
    assert.ok(bytes.length>20000 && bytes.length<80000,name+" size/quality");
  }
  assert.deepEqual(FOX_WALK_ATLAS_NAMES,["up-left","up","left","down-left","down"]);
  const sprite=source("src/views/training/FoxWalkSprite.jsx");
  assert.match(sprite,/companionId === "wolf"/);
  assert.match(sprite,/facing === "down-right"/);
  assert.match(sprite,/atlas:"down-right",mirror:false/);
  assert.match(sprite,/transform: direction.mirror/);
});

test("fox and wolf preloads keep their own atlas lists and decode",async()=>{
  const saved=globalThis.Image;
  const uris=[];
  globalThis.Image=class {
    set src(value){this._src=value;uris.push(value);}
    decode(){return Promise.resolve();}
  };
  try{
    const wolf=await preloadJourneyWalkAtlases("wolf");
    assert.equal(wolf.length,6);
    assert.ok(wolf.every(item=>item.ready&&item.frames.length===8));
    assert.ok(uris.every(u=>u.includes("/wolf-walk-")&&u.endsWith("-fixed.avif")));
    uris.length=0;
    const fox=await preloadJourneyWalkAtlases("fox");
    assert.equal(fox.length,5);
    assert.ok(uris.every(u=>u.includes("/fox-walk-")&&u.endsWith("-fixed-probe.avif")));
  }finally{
    if(saved===undefined)delete globalThis.Image;
    else globalThis.Image=saved;
  }
});

test("wolf reuses approved village route, lesson stops and perspective without mutating progress",()=>{
  const map=source("src/views/training/JourneyMap.jsx");
  assert.ok(map.includes('companion?.id==="fox" || companion?.id==="wolf"'));
  assert.ok(map.includes('get("journeyQA")==="wolf-route"'));
  assert.ok(map.includes("Replay complete wolf village walk"));
  assert.ok(map.includes("wolfRouteReplay ? {at:1000}"));
  assert.ok(map.includes('wolfRouteReplay || foxGapReplay || !targetId) return'));
  assert.ok(map.includes("gateRouteAt(USER_TRACED_VILLAGE_ROUTE,journeyProgress)"));
  assert.ok(map.includes("gateFoxScaleWithStops(USER_TRACED_VILLAGE_ROUTE"));
  assert.ok(map.includes("FOX_APPROVED_LESSON_STOPS.find"));
  assert.ok(map.includes('companionId={companion?.id}'));
  assert.ok(map.includes('"/assets/journey/wolf-idle.webp"'));
  assert.doesNotMatch(map,/awardXp\(|markComplete\(|completeLesson\(/);
});

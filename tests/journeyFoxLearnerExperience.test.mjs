import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {FOX_APPROVED_LESSON_STOPS,foxLessonRouteAdvance} from "../src/views/training/foxLessonStopDraft.js";
import {USER_TRACED_VILLAGE_ROUTE} from "../src/views/training/journeyGateRouteEditor.js";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("the first lesson renders the camera-facing fox before moving",()=>{
 const src=read("src/views/training/JourneyMap.jsx");
 for(const snippet of ["journeyInitial","journeyFacing = !journeyMoving",
    'src="/assets/journey/fox-idle.webp"',"z-journey-learner-fox"])
   assert.ok(src.includes(snippet),snippet);
 assert.equal(FOX_APPROVED_LESSON_STOPS[0].at,0);
});
test("the next real unlocked lesson automatically starts the route walk",()=>{
 const src=read("src/views/training/JourneyMap.jsx");
 for(const snippet of [
   "window.sessionStorage.getItem(journeySessionKey)",
   "window.sessionStorage.setItem(journeySessionKey,targetId)",
   "completed.has(journeyPreviousStop?.lessonId)",
   "lastTarget===journeyPreviousStop?.lessonId",
   "foxLessonRouteAdvance(USER_TRACED_VILLAGE_ROUTE",
   "if(result.arrived){setJourneyMoving(false);return;}",
   "updateView(next,zoom)"])assert.ok(src.includes(snippet),snippet);
 const s=FOX_APPROVED_LESSON_STOPS;
 assert.deepEqual(foxLessonRouteAdvance(USER_TRACED_VILLAGE_ROUTE,s[0].at/1000,90,s[1].at),
   {progress:.263,arrived:true});
});
test("learner mode hides editor and keeps all authoring features opt-in",()=>{
 const src=read("src/views/training/JourneyMap.jsx");
 assert.ok(src.includes('get("journeyDev")==="1"'));
 assert.ok(src.includes("useState(showMapDevTools)"));
 assert.ok(src.includes('showMapDevTools && !editingGate && <div className="z-fox-pose-preview"'));
 assert.ok(src.includes("foxPreviewEnabled && showMapDevTools && (editingGate"));
 for(const feature of ["Gate visual path editor","Save lesson stop here",
    "Play route","Restart route","Copy lesson stop plan"])
   assert.ok(src.includes(feature),feature);
 assert.ok(!src.includes("completeLesson("));
});

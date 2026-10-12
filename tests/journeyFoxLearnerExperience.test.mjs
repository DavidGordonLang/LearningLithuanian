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
   "if(isExitingVillage) onExitComplete?.();",
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


test("Module 1.1 exit waits for fox to finish the final 15.2% before next map",()=>{
 const map=read("src/views/training/JourneyMap.jsx");
 const learning=read("src/views/training/LearningHome.jsx");
 const training=read("src/views/TrainingView.jsx");
 assert.ok(map.includes("start:FOX_APPROVED_LESSON_STOPS.at(-1).at/1000,moving:true"));
 assert.ok(map.includes("const journeyStop = isExitingVillage ? {at:1000}"));
 assert.ok(map.includes("if(isExitingVillage) onExitComplete?.();"));
 assert.ok(learning.includes('journeyExitModuleId==="module_1_1"'));
 assert.ok(learning.includes("departureRoute?.module || reviewRoute?.module || target?.module"));
 assert.ok(learning.includes("exitToNextMap={isLeavingVillage}"));
 assert.ok(learning.includes("Following the fox towards the next map"));
 assert.ok(training.includes('setJourneyExitModuleId(moduleCompletePayload?.module?.id==="module_1_1"'));
 assert.ok(training.includes('setJourneyExitModuleId(mod?.id==="module_1_1"'));
 assert.ok(training.includes("onJourneyExitComplete={()=>setJourneyExitModuleId(null)}"));
 const points=FOX_APPROVED_LESSON_STOPS;
 assert.equal(points.at(-1).at,848);
 assert.deepEqual(foxLessonRouteAdvance(USER_TRACED_VILLAGE_ROUTE,.848,10,1000),
   {progress:1,arrived:true});
});
test("only the first completed pin disappears; landmark pins move independently of fox route",()=>{
 const map=read("src/views/training/JourneyMap.jsx");
 const coords=map.match(/const FIRST_CONTACT_POINTS = \[([\s\S]*?)\];/)?.[1]||"";
 assert.ok(coords.includes("{ x: 183, y: 880 }"));
 assert.ok(coords.includes("{ x: 575, y: 725 }"));
 assert.ok(!map.includes("hideCompletedFirst"));
 assert.ok(map.includes("return <button type=\"button\" key={stop.id} disabled={!available}"));
 assert.ok(map.includes("{ x: 183, y: 880 }"));
 assert.ok(map.includes("{ x: 575, y: 725 }"));
 assert.deepEqual(FOX_APPROVED_LESSON_STOPS.map(x=>x.at),[0,263,395,673,848]);
});


test("gate-only foreground mask no longer hides the fox on the fountain-to-bakery road",()=>{
 const map=read("src/views/training/JourneyMap.jsx");
 assert.ok(map.includes('(editingGate || journeyProgress<0.25)'));
 assert.ok(map.includes('className="z-gate-foreground-cutout"'));
 assert.ok(map.includes('className="z-journey-learner-fox"') ||
   map.includes('z-gate-depth-reference z-journey-learner-fox'));
 // Real lesson 2 begins at 26.3%, safely beyond the gate-mask threshold.
 assert.ok(FOX_APPROVED_LESSON_STOPS[1].at/1000>.25);
});

test("next module card fades in while the fox is still walking, never waits at path end",()=>{
 const map=read("src/views/training/JourneyMap.jsx");
 const home=read("src/views/training/LearningHome.jsx");
 const css=read("src/index.css");
 assert.ok(map.includes('Math.min(1,(journeyProgress-0.885)/0.103)'));
 assert.ok(map.includes('onExitProgress?.(departureBlend)'));
 assert.ok(map.includes('if(isExitingVillage) onExitComplete?.()'));
 assert.ok(home.includes('nextMapDuringExit'));
 assert.ok(home.includes('onExitProgress={setExitBlend}'));
 assert.ok(home.includes('className="z-journey-next-map-preview"'));
 assert.ok(home.includes('style={{opacity:exitBlend,pointerEvents:"none"}}'));
 assert.ok(home.includes('inert=""'));
 assert.ok(css.includes('.z-journey-exit-stage{position:relative}'));
 assert.ok(css.includes('position:absolute;inset:0;z-index:10'));
 const start=.885,end=.988;
 assert.ok(start>.848 && end<1);
});

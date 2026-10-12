import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import module11 from "../src/content/learning/section1/module_1_1.js";
import {USER_TRACED_VILLAGE_ROUTE as route,gateRouteAt} from "../src/views/training/journeyGateRouteEditor.js";
import {FOX_APPROVED_LESSON_STOPS,foxLessonRouteAdvance,
  foxLessonStopOrderProblem,foxLessonStopPlan} from "../src/views/training/foxLessonStopDraft.js";

const markers=[0,263,395,673,848];
const positions=[[143,1070,1],[458,853,7],[367,693,10],
  [581,482,16],[415,326,20]];
const ids=["section_1_module_1_lesson_1","section_1_module_1_lesson_2",
  "section_1_module_1_lesson_3","section_1_module_1_lesson_4",
  "section_1_module_1_checkpoint"];

test("five user-authored lesson markers are exact and follow real curriculum IDs",()=>{
  assert.equal(route.length,27);
  assert.deepEqual(FOX_APPROVED_LESSON_STOPS.map(s=>s.at),markers);
  assert.deepEqual(FOX_APPROVED_LESSON_STOPS.map(s=>s.lessonId),ids);
  assert.deepEqual(module11.lessons.map(s=>s.id),ids);
  assert.equal(foxLessonStopOrderProblem(FOX_APPROVED_LESSON_STOPS,ids),"");
  FOX_APPROVED_LESSON_STOPS.forEach((stop,i)=>{
    const point=gateRouteAt(route,stop.at/1000);
    assert.deepEqual([Math.round(point.x),Math.round(point.y),point.segmentIndex+1],
      positions[i]);
  });
  assert.equal(foxLessonStopPlan(route,module11.lessons,FOX_APPROVED_LESSON_STOPS)
    .status,"ready for approval");
});
test("fox halts exactly at target without overshoot and does not loop",()=>{
  const start=.25,stop=263;
  const halted=foxLessonRouteAdvance(route,start,2,stop);
  assert.equal(halted.progress,.263);
  assert.equal(halted.arrived,true);
  assert.deepEqual(foxLessonRouteAdvance(route,0,0,0),
    {progress:0,arrived:true});
  const intermediate=foxLessonRouteAdvance(route,.263,1,395);
  assert.ok(intermediate.progress>.263 && intermediate.progress<.395);
  const complete=foxLessonRouteAdvance(route,.848,200,1000);
  assert.equal(complete.progress,1);
  assert.equal(complete.arrived,true);
  assert.equal(foxLessonRouteAdvance(route,.848,1,-1).arrived,false);
});
test("front-facing arrival and future exit are preview-only, not XP mutations",()=>{
  const map=readFileSync(new URL("../src/views/training/JourneyMap.jsx",import.meta.url),"utf8");
  const css=readFileSync(new URL("../src/index.css",import.meta.url),"utf8");
  for(const needle of ["Start guided lesson walk","Walk to lesson",
    "Walk towards next map","Pause guided walk","Return to free walk",
    "Fox stopped and facing you","foxLessonRouteAdvance",
    "Open {guidedNextLesson.title}","onOpenLesson?.(guidedNextLesson.id)",
    "Next map not built yet."]) assert.ok(map.includes(needle),needle);
  assert.match(map,/FOX_APPROVED_LESSON_STOPS\.map\(stop=>\(\{\.\.\.stop\}\)\)/);
  assert.ok(css.includes(".z-fox-lesson-facing-still"));
  assert.ok(existsSync(new URL("../public/assets/journey/fox-idle.webp",import.meta.url)));
  assert.ok(map.includes("onOpenLesson?.(stop.id)"));
  assert.ok(!map.includes("completeLesson("),"arrival cannot award lesson completion");
});

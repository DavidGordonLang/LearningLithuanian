import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {USER_TRACED_VILLAGE_ROUTE as route,gateRouteAt,gateRouteJson} from
  "../src/views/training/journeyGateRouteEditor.js";
import {
  FOX_LESSON_STOPS_DRAFT_KEY,normaliseFoxLessonStops,
  foxLessonStopOrderProblem,foxLessonStopPlan,
  readFoxLessonStopDraft,saveFoxLessonStopDraft,
} from "../src/views/training/foxLessonStopDraft.js";

const lessons=[
  {id:"hello",title:"Hello and Goodbye"},
  {id:"fountain",title:"Yes, No, Please, Thank You"},
  {id:"bakery",title:"Sorry and Excuse Me"},
  {id:"lantern",title:"Polite Mini Exchanges"},
  {id:"checkpoint",title:"Module Checkpoint"},
];
const ids=lessons.map(s=>s.id);
const at=[0,420,610,810,995];
const placements=ids.map((lessonId,i)=>({lessonId,at:at[i]}));

test("lesson stops use real IDs and exact arc-length route position, without changing geometry",()=>{
  assert.equal(route.length,27);
  assert.equal(foxLessonStopOrderProblem(placements,ids),"");
  const plan=foxLessonStopPlan(route,lessons,placements,
    ["Village Gate","Village Fountain","The Bakery","Lantern Corner","Town Hall"]);
  assert.equal(plan.approval,"pending user approval");
  assert.equal(plan.status,"ready for approval");
  assert.equal(plan.route,gateRouteJson(route));
  assert.deepEqual(plan.lessonStops.map(s=>s.lessonId),ids);
  assert.deepEqual(plan.lessonStops.map(s=>s.marker),at);
  for(let i=0;i<ids.length;i++){
    const point=gateRouteAt(route,at[i]/1000);
    assert.equal(plan.lessonStops[i].worldX,Math.round(point.x));
    assert.equal(plan.lessonStops[i].worldY,Math.round(point.y));
    assert.equal(plan.lessonStops[i].section,point.segmentIndex+1);
  }
});
test("incomplete, unordered, duplicate and invalid stops cannot be approved",()=>{
  assert.match(foxLessonStopOrderProblem(placements.slice(0,4),ids),/Place 1 more/);
  const invalid=[...placements];
  invalid[2]={lessonId:"bakery",at:300};
  assert.match(foxLessonStopOrderProblem(invalid,ids),/increase along the route/);
  assert.match(foxLessonStopOrderProblem([...placements.slice(0,4),
    {lessonId:"checkpoint",at:810}],ids),/increase along the route/);
  assert.deepEqual(normaliseFoxLessonStops([
    {lessonId:"hello",at:400},{lessonId:"hello",at:500},
    {lessonId:"other",at:700},{lessonId:"fountain",at:1001},
    {lessonId:"bakery",at:600.5}],ids),[{lessonId:"hello",at:400}]);
  assert.equal(foxLessonStopPlan(route,lessons,invalid).status,"draft");
});
test("local author draft is scoped to exact route and lesson identities",()=>{
  const data=new Map();
  const previous=globalThis.window;
  globalThis.window={localStorage:{
    getItem:key=>data.get(key)||null,
    setItem:(key,value)=>data.set(key,value),
  }};
  try{
    const routeJson=gateRouteJson(route);
    saveFoxLessonStopDraft(routeJson,ids,placements);
    assert.ok(data.has(FOX_LESSON_STOPS_DRAFT_KEY));
    assert.deepEqual(readFoxLessonStopDraft(routeJson,ids),placements);
    assert.equal(readFoxLessonStopDraft(routeJson+" ",ids),null);
    assert.equal(readFoxLessonStopDraft(routeJson,[...ids].reverse()),null);
    assert.equal(readFoxLessonStopDraft(routeJson,["hello"]),null);
  } finally {if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});
test("the visual authoring UI preserves route QA and learner contract",()=>{
  const content=readFileSync(new URL("../src/views/training/JourneyMap.jsx",
    import.meta.url),"utf8");
  for(const needle of [
    "Lesson stop placement","Save lesson stop here","Update lesson stop here",
    "Remove this stop","Copy lesson stop plan","Lesson stop plan export",
    "readFoxLessonStopDraft","saveFoxLessonStopDraft",
    "setGateLessonStops([])","foxLessonStopOrderProblem",
    "Play route","Pause route","Restart route","onOpenLesson?.(stop.id)",
  ])assert.ok(content.includes(needle),needle);
});

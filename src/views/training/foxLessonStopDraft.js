// Dev-only lesson-stop authoring for the approved Module 1.1 fox route.
// This stores editor drafts, never learner progress or lesson completion.
import {gateRouteAt,gateRouteJson} from "./journeyGateRouteEditor.js";

export const FOX_LESSON_STOPS_DRAFT_KEY="zodis:fox-lesson-stops:module-1-1:v1";

export function normaliseFoxLessonStops(value,lessonIds) {
  if(!Array.isArray(value) || !Array.isArray(lessonIds))return [];
  const allowed=new Set(lessonIds);
  const seen=new Set();
  const result=[];
  for(const item of value) {
    if(!item || !allowed.has(item.lessonId) || seen.has(item.lessonId) ||
       !Number.isInteger(item.at) || item.at<0 || item.at>1000)continue;
    result.push({lessonId:item.lessonId,at:item.at});
    seen.add(item.lessonId);
  }
  return result;
}

export function foxLessonStopOrderProblem(value,lessonIds) {
  if(!lessonIds?.length)return "No lessons found for this module.";
  const stops=normaliseFoxLessonStops(value,lessonIds);
  if(stops.length!==lessonIds.length)
    return "Place "+(lessonIds.length-stops.length)+" more lesson stop(s) before approval.";
  let previous=-1;
  for(const id of lessonIds) {
    const current=stops.find(s=>s.lessonId===id);
    if(current.at<=previous)
      return "Stop locations must increase along the route in lesson order.";
    previous=current.at;
  }
  return "";
}

export function foxLessonStopPlan(routePoints,lessons,positions,landmarks=[]) {
  const ids=lessons.map(lesson=>lesson.id);
  const saved=normaliseFoxLessonStops(positions,ids);
  const issue=foxLessonStopOrderProblem(saved,ids);
  return {
    version:1,
    moduleId:"module_1_1",
    approval:"pending user approval",
    route:gateRouteJson(routePoints),
    routePointCount:routePoints.length,
    status:issue?"draft":"ready for approval",
    validationMessage:issue||"All lesson stops are placed in curriculum order.",
    lessonStops:lessons.map((lesson,index)=>{
      const stop=saved.find(s=>s.lessonId===lesson.id);
      const world=stop ? gateRouteAt(routePoints,stop.at/1000) : null;
      return {
        lessonId:lesson.id,
        lessonTitle:lesson.title,
        landmark:landmarks[index]||"",
        marker:stop?.at??null,
        routePercent:stop?Number((stop.at/10).toFixed(1)):null,
        worldX:world?Math.round(world.x):null,
        worldY:world?Math.round(world.y):null,
        section:world?world.segmentIndex+1:null,
      };
    }),
  };
}

export function readFoxLessonStopDraft(route,lessonIds) {
  try {
    const saved=JSON.parse(window.localStorage.getItem(FOX_LESSON_STOPS_DRAFT_KEY)||"null");
    if(saved?.route!==route || JSON.stringify(saved.lessonIds)!==JSON.stringify(lessonIds))
      return null;
    if(!Array.isArray(saved.positions))return null;
    return normaliseFoxLessonStops(saved.positions,lessonIds);
  } catch {return null;}
}

export function saveFoxLessonStopDraft(route,lessonIds,positions) {
  try {
    window.localStorage.setItem(FOX_LESSON_STOPS_DRAFT_KEY,JSON.stringify({
      route,lessonIds,positions:normaliseFoxLessonStops(positions,lessonIds),
    }));
  } catch { /* The visual editor must work even if storage is unavailable. */ }
}

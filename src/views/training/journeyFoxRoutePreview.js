// Temporary illustrated-village movement test. Path points are world pixels,
// separate from lesson-completion state, XP and the saved learner route.
const COBBLESTONE_BENDS = [
  [{x:171,y:1005},{x:264,y:915},{x:379,y:838}],
  [{x:464,y:788},{x:402,y:760},{x:357,y:725}],
  [{x:406,y:656},{x:461,y:590},{x:520,y:538}],
  [{x:523,y:469},{x:491,y:422},{x:447,y:397}],
];

export function nextFoxPreviewPath(approachPoints, stopIndex) {
  if (!Array.isArray(approachPoints) || stopIndex < 0 ||
      stopIndex >= COBBLESTONE_BENDS.length || !approachPoints[stopIndex+1]) return null;
  return [approachPoints[stopIndex],...COBBLESTONE_BENDS[stopIndex],approachPoints[stopIndex+1]];
}

export function foxRouteLength(path) {
  if (!path || path.length < 2) return 0;
  return path.slice(1).reduce((length,p,i)=>length+Math.hypot(p.x-path[i].x,p.y-path[i].y),0);
}

export function foxRouteAt(path,progress) {
  if (!path?.length) return null;
  if (path.length === 1) return {point:path[0],direction:"up-right"};
  const target=Math.max(0,Math.min(1,progress))*foxRouteLength(path);
  let passed=0;
  for(let i=0;i<path.length-1;i++){
    const a=path[i],b=path[i+1],segment=Math.hypot(b.x-a.x,b.y-a.y);
    if(passed+segment>=target || i===path.length-2){
      const fraction=segment>0 ? Math.max(0,Math.min(1,(target-passed)/segment)) : 0;
      return {
        point:{x:a.x+(b.x-a.x)*fraction,y:a.y+(b.y-a.y)*fraction},
        direction:b.x<a.x?"up-left":"up-right",
      };
    }
    passed+=segment;
  }
  return {point:path[path.length-1],direction:"up-right"};
}

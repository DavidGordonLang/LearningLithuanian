// Temporary illustrated-village movement test. Path points are world pixels,
// separate from lesson-completion state, XP and the saved learner route.
// Hand-traced against the 850 x 1120 painted scene. Routes stay on the
// visible cobbled carriageway, not the stream by the fountain.
const COBBLESTONE_BENDS = [
  [
    {x:154,y:1035},{x:174,y:984},{x:196,y:940},{x:195,y:888},
    {x:226,y:833},{x:274,y:792},{x:317,y:751},{x:341,y:704},
    {x:352,y:662},{x:394,y:624},
  ],
  [{x:403,y:607},{x:372,y:602}],
  [
    {x:355,y:567},{x:385,y:542},{x:429,y:522},
    {x:482,y:510},{x:528,y:492},
  ],
  [{x:555,y:435},{x:522,y:408},{x:479,y:374},{x:443,y:351}],
];

export function nextFoxPreviewPath(approachPoints, stopIndex) {
  if (!Array.isArray(approachPoints) || stopIndex < 0 ||
      stopIndex >= COBBLESTONE_BENDS.length || !approachPoints[stopIndex+1]) return null;
  return [approachPoints[stopIndex],...COBBLESTONE_BENDS[stopIndex],approachPoints[stopIndex+1]];
}

// A single Follow route action previews all remaining stops, rather than
// repeating only the first unfinished leg (which never changes in a demo).
export function fullFoxPreviewPath(approachPoints, startIndex=0) {
  if (!Array.isArray(approachPoints) ||
      !Number.isInteger(startIndex) || startIndex < 0 ||
      startIndex >= Math.min(COBBLESTONE_BENDS.length,approachPoints.length-1)) return null;
  const route=[approachPoints[startIndex]];
  for(let i=startIndex;i<approachPoints.length-1;i++){
    const leg=nextFoxPreviewPath(approachPoints,i);
    if (!leg) break;
    route.push(...leg.slice(1));
  }
  return route.length>=2 ? route : null;
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

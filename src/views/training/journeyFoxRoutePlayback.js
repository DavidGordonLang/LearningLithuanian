// Dev-only walk math. Stable arc-length progress allows future lesson stops.
// No lesson stopping or learner-progress changes are activated in this proof.
export const FOX_ROUTE_WORLD_PX_PER_SECOND = 95;
export const FOX_ROUTE_WORLD_PX_PER_FRAME = 13;

export function foxRouteTotalDistance(points) {
  if(!points || points.length<2)return 0;
  return points.slice(1).reduce((sum,p,i)=>
    sum+Math.hypot(p.x-points[i].x,p.y-points[i].y),0);
}

export function foxRouteAdvance(points,progress,elapsedSeconds,
  speed=FOX_ROUTE_WORLD_PX_PER_SECOND) {
  const length=foxRouteTotalDistance(points);
  const start=Math.max(0,Math.min(1,Number(progress)||0));
  if(!length || !Number.isFinite(elapsedSeconds) || elapsedSeconds<=0 ||
    !Number.isFinite(speed) || speed<=0)return start;
  return Math.min(1,start+speed*elapsedSeconds/length);
}

export function foxRouteFrame(points,progress,
  frameDistance=FOX_ROUTE_WORLD_PX_PER_FRAME) {
  const length=foxRouteTotalDistance(points);
  if(!length || !Number.isFinite(frameDistance) || frameDistance<=0)return 0;
  const p=Math.max(0,Math.min(1,Number(progress)||0));
  return Math.floor((p*length+1e-8)/frameDistance)%8;
}

// Future stop authoring: locate landmark on the same route-distance coordinate.
export function foxRouteNearestProgress(points,landmark) {
  if(!points?.length || !landmark)return 0;
  const length=foxRouteTotalDistance(points);
  if(!length)return 0;
  let walked=0,bestDistance=Infinity,bestWalked=0;
  for(let i=0;i<points.length-1;i++){
    const a=points[i],b=points[i+1];
    const dx=b.x-a.x,dy=b.y-a.y,span=Math.hypot(dx,dy);
    if(!span)continue;
    const t=Math.max(0,Math.min(1,
      ((landmark.x-a.x)*dx+(landmark.y-a.y)*dy)/(span*span)));
    const x=a.x+t*dx,y=a.y+t*dy;
    const dist=(landmark.x-x)**2+(landmark.y-y)**2;
    if(dist<bestDistance){bestDistance=dist;bestWalked=walked+span*t;}
    walked+=span;
  }
  return Math.min(1,bestWalked/length);
}

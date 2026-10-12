// Route-authoring utilities for the visual-only gate editor.
// Coordinates are always world pixels; camera transforms are irrelevant to the saved route.
const clamp = (n,low,high) => Math.min(high,Math.max(low,n));
export function gateWorldPoint(clientX,clientY,bounds,camera,scale) {
  if (!bounds || !Number.isFinite(scale) || scale<=0) return null;
  return {
    x:Math.round(clamp((clientX-bounds.left-camera.x)/scale,0,850)),
    y:Math.round(clamp((clientY-bounds.top-camera.y)/scale,0,1120)),
  };
}
export function gateClosestSegment(points,p) {
  if (points.length<2) return points.length;
  let nearest=0,distance=Infinity;
  for(let i=0;i<points.length-1;i++) {
    const a=points[i],b=points[i+1];
    const dx=b.x-a.x,dy=b.y-a.y;
    const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);
    const dist=(p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;
    if(dist<distance) {nearest=i+1;distance=dist;}
  }
  return nearest;
}
export function gateInsertPoint(points,point,mode) {
  if(!point||!["add","insert"].includes(mode)) return points;
  const index=mode==="insert"?gateClosestSegment(points,point):points.length;
  return [...points.slice(0,index),point,...points.slice(index)];
}
export function gateMovePoint(points,index,point) {
  if(!Number.isInteger(index)||index<0||index>=points.length||!point)return points;
  return points.map((p,i)=>i===index?point:p);
}
export function gateRouteJson(points) {
  return JSON.stringify(points.map(({x,y})=>({x,y})));
}


// Android-drawn proposal from 12 October. This is a *draft*, not the approved
// gate traversal or the previous rejected 15-point animation path.
export const USER_TRACED_VILLAGE_ROUTE = [
  {x:143,y:1070},{x:197,y:1033},{x:248,y:994},{x:328,y:952},
  {x:385,y:928},{x:428,y:893},{x:461,y:860},{x:441,y:808},
  {x:393,y:770},{x:362,y:727},{x:375,y:636},{x:440,y:603},
  {x:515,y:604},{x:580,y:561},{x:632,y:513},{x:588,y:486},{x:518,y:451},
  {x:466,y:423},{x:417,y:389},{x:399,y:352},{x:423,y:313},
  {x:456,y:286},{x:486,y:266},{x:508,y:246},{x:517,y:215},
  {x:487,y:194},{x:455,y:182},
];

// Uniform-distance interpolation returns a point on the authored polyline.
// Do not smooth corners across walls or scenery until a visual path is accepted.
export function gateRoutePreviewPoint(points,progress) {
  if (!points?.length) return null;
  if(points.length===1)return {...points[0]};
  const lengths=points.slice(1).map((p,i)=>
    Math.hypot(p.x-points[i].x,p.y-points[i].y));
  const total=lengths.reduce((sum,n)=>sum+n,0);
  if(total===0)return {...points[0]};
  const p=Number.isFinite(progress)?clamp(progress,0,1):0;
  const target=p*total;
  let walked=0;
  for(let i=0;i<lengths.length;i++) {
    const dist=lengths[i];
    if(walked+dist>=target || i===lengths.length-1) {
      const blend=dist?clamp((target-walked)/dist,0,1):0;
      const from=points[i],to=points[i+1];
      return {x:from.x+(to.x-from.x)*blend,
        y:from.y+(to.y-from.y)*blend};
    }
    walked+=dist;
  }
  return {...points.at(-1)};
}


// One direction per drawn route segment. The map is screen-up for away/up.
export const GATE_DIRECTIONS = [
  "up", "up-right", "right", "down-right",
  "down", "down-left", "left", "up-left",
];
export function gateAutomaticDirection(a,b) {
  if(!a||!b) return "up";
  const dx=b.x-a.x, dy=b.y-a.y;
  if(dx===0&&dy===0) return "up";
  const octant=Math.round(Math.atan2(dx,-dy)/(Math.PI/4));
  return GATE_DIRECTIONS[(octant+8)%8];
}
export function gateRouteAt(points,progress) {
  if(!points?.length)return null;
  if(points.length===1)return {...points[0],segmentIndex:0};
  const lengths=points.slice(1).map((p,i)=>
    Math.hypot(p.x-points[i].x,p.y-points[i].y));
  const total=lengths.reduce((sum,n)=>sum+n,0);
  if(!total)return {...points[0],segmentIndex:0};
  let remaining=clamp(Number.isFinite(progress)?progress:0,0,1)*total;
  for(let i=0;i<lengths.length;i++){
    const distance=lengths[i];
    if(remaining<=distance || i===lengths.length-1){
      const t=distance?clamp(remaining/distance,0,1):0;
      return {
        x:points[i].x+(points[i+1].x-points[i].x)*t,
        y:points[i].y+(points[i+1].y-points[i].y)*t,
        segmentIndex:i,
      };
    }
    remaining-=distance;
  }
}
export function gateSegmentMidpointProgress(points,index) {
  if(!points||points.length<2)return 0;
  const lengths=points.slice(1).map((p,i)=>
    Math.hypot(p.x-points[i].x,p.y-points[i].y));
  const total=lengths.reduce((a,b)=>a+b,0);
  if(!total)return 0;
  const i=Math.floor(clamp(index,0,lengths.length-1));
  return (lengths.slice(0,i).reduce((a,b)=>a+b,0)+lengths[i]/2)/total;
}
export function gateDirectionPlan(points,overrides={}) {
  if(!points?.length)return [];
  return points.slice(1).map((p,i)=>{
    const auto=gateAutomaticDirection(points[i],p);
    const requested=overrides[i];
    const manual=GATE_DIRECTIONS.includes(requested);
    return {segment:i+1,from:i+1,to:i+2,
      direction:manual?requested:auto,mode:manual?"manual":"auto"};
  });
}

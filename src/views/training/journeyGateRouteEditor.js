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

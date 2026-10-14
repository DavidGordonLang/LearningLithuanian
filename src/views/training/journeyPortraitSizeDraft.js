// DEV-only, per-map perspective sizing for approved 1024x1536 portrait routes.
// Completely separate from stage-1 marker and stage-2 route browser drafts.
export const SIZE_MIN_PERCENT=12;
export const SIZE_MAX_PERCENT=240;
export const SIZE_MAX_ANCHORS=40;
export const SIZE_DRAFT_VERSION=2;
export const DEFAULT_SIZE_ANCHORS=Object.freeze([
  Object.freeze({at:0,size:145}),
]);
export const sizeStorageKey=(user,map)=>
  `zodis:journey:portrait-size:stage3:v2:${user||'local'}:${map}`;
export function sizeRouteSignature(points){
  // All points, not just ends, must match: edits to the walked path invalidate sizes.
  let h=2166136261;
  for(const p of points){
    const fragment=p.x+','+p.y+';';
    for(let i=0;i<fragment.length;i++)
      h=Math.imul(h^fragment.charCodeAt(i),16777619);
  }
  return (h>>>0).toString(16);
}
export const defaultSizeAnchors=()=>DEFAULT_SIZE_ANCHORS.map(({at,size})=>({at,size}));
const validAnchor=p=>Number.isInteger(p?.at)&&p.at>=0&&p.at<=1000&&
  Number.isInteger(p?.size)&&p.size>=SIZE_MIN_PERCENT&&p.size<=SIZE_MAX_PERCENT;
export function validateSizeAnchors(points){
  if(!Array.isArray(points)||points.length<1||points.length>SIZE_MAX_ANCHORS||
    !points.every(validAnchor))return null;
  const sorted=points.slice().sort((a,b)=>a.at-b.at);
  if(sorted[0].at!==0 ||
    sorted.some((p,i)=>i>0&&p.at===sorted[i-1].at))return null;
  return sorted.map(({at,size})=>({at,size}));
}
export function sizeAtProgress(points,at){
  const keys=validateSizeAnchors(points)||defaultSizeAnchors();
  const p=Math.max(0,Math.min(1000,Number(at)||0));
  if(p<=keys[0].at)return keys[0].size;
  for(let i=1;i<keys.length;i++){
    if(p<=keys[i].at){
      const a=keys[i-1],b=keys[i],t=(p-a.at)/(b.at-a.at);
      // Smooth easing keeps resizing continuous at manually placed anchors.
      const eased=t*t*(3-2*t);
      return a.size+(b.size-a.size)*eased;
    }
  }
  return keys[keys.length-1].size;
}
export function setSizeAnchor(points,at,size){
  const keys=validateSizeAnchors(points)||defaultSizeAnchors();
  const point={at:Math.max(0,Math.min(1000,Math.round(at))),
    size:Math.max(SIZE_MIN_PERCENT,Math.min(SIZE_MAX_PERCENT,Math.round(size)))};
  if(!Number.isFinite(at)||!Number.isFinite(size))return keys;
  const existing=keys.some(p=>p.at===point.at);
  if(!existing&&keys.length>=SIZE_MAX_ANCHORS)return keys;
  return validateSizeAnchors([...keys.filter(p=>p.at!==point.at),point])||keys;
}
export function removeSizeAnchor(points,at){
  const keys=validateSizeAnchors(points)||defaultSizeAnchors();
  if(at===0||at===1000)return keys;
  return validateSizeAnchors(keys.filter(p=>p.at!==at))||keys;
}
export function buildSizeDraft(mapId,routePoints,anchors){
  return {version:SIZE_DRAFT_VERSION,mapId,
    dimensions:{width:1024,height:1536},
    routeSignature:sizeRouteSignature(routePoints),
    anchors:validateSizeAnchors(anchors)||defaultSizeAnchors()};
}
export function restoreSizeDraft(raw,mapId,routePoints){
  try{
    const d=JSON.parse(raw||'null');
    if(d?.version!==SIZE_DRAFT_VERSION||d.mapId!==mapId||
      d.dimensions?.width!==1024||d.dimensions?.height!==1536||
      d.routeSignature!==sizeRouteSignature(routePoints))return null;
    return validateSizeAnchors(d.anchors);
  }catch{return null;}
}

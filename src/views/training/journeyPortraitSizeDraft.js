// Future sizing stage: discrete, held perspective sizes on the approved portrait route.
// Size is constant from each saved key until the next saved key. No interpolation.
export const SIZE_MIN_PERCENT=12;
export const SIZE_MAX_PERCENT=240;
export const SIZE_MAX_ANCHORS=40;
export const SIZE_DRAFT_VERSION=2;
export const DEFAULT_SIZE_ANCHORS=Object.freeze([Object.freeze({at:0,size:145})]);
export const sizeStorageKey=(user,map)=>
  `zodis:journey:portrait-size:stage3:v2:${user||'local'}:${map}`;
export function sizeRouteSignature(points){
  let h=2166136261;
  for(const p of points){
    const fragment=p.x+','+p.y+';';
    for(let i=0;i<fragment.length;i++)h=Math.imul(h^fragment.charCodeAt(i),16777619);
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
  if(sorted[0].at!==0||sorted.some((p,i)=>i>0&&p.at===sorted[i-1].at))return null;
  return sorted.map(({at,size})=>({at,size}));
}
export function sizeAtProgress(points,at){
  const keys=validateSizeAnchors(points)||defaultSizeAnchors();
  const position=Math.max(0,Math.min(1000,Number(at)||0));
  let size=keys[0].size;
  for(const key of keys){if(key.at>position)break;size=key.size;}
  return size;
}
export function setSizeAnchor(points,at,size){
  const keys=validateSizeAnchors(points)||defaultSizeAnchors();
  if(!Number.isFinite(at)||!Number.isFinite(size))return keys;
  const key={at:Math.max(0,Math.min(1000,Math.round(at))),
    size:Math.max(SIZE_MIN_PERCENT,Math.min(SIZE_MAX_PERCENT,Math.round(size)))};
  if(!keys.some(p=>p.at===key.at)&&keys.length>=SIZE_MAX_ANCHORS)return keys;
  return validateSizeAnchors([...keys.filter(p=>p.at!==key.at),key])||keys;
}
export function removeSizeAnchor(points,at){
  const keys=validateSizeAnchors(points)||defaultSizeAnchors();
  if(at===0)return keys;
  return validateSizeAnchors(keys.filter(p=>p.at!==at))||keys;
}
export function buildSizeDraft(mapId,routePoints,anchors,directionSignature=''){
  return {version:SIZE_DRAFT_VERSION,mapId,
    dimensions:{width:1024,height:1536},routeSignature:sizeRouteSignature(routePoints),
    directionSignature,
    anchors:validateSizeAnchors(anchors)||defaultSizeAnchors()};
}
export function restoreSizeDraft(raw,mapId,routePoints,directionSignature=''){
  try{
    const d=JSON.parse(raw||'null');
    if(d?.version!==SIZE_DRAFT_VERSION||d.mapId!==mapId||
      d.dimensions?.width!==1024||d.dimensions?.height!==1536||
      d.routeSignature!==sizeRouteSignature(routePoints)||
      d.directionSignature!==directionSignature)return null;
    return validateSizeAnchors(d.anchors);
  }catch{return null;}
}
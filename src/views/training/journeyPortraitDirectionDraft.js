// DEV-only portrait journey direction overrides. The authored route is read-only.
import {gateAutomaticDirection} from './journeyGateRouteEditor.js';
import {sizeRouteSignature} from './journeyPortraitSizeDraft.js';

export const WALK_DIRECTIONS=Object.freeze([
  'up','up-right','right','down-right','down','down-left','left','up-left',
]);
export const directionStorageKey=(userId,mapId)=>
  `zodis:journey:portrait-directions:stage2b:v1:${userId||'local'}:${mapId}`;
export const automaticDirection=(route,segmentIndex)=>
  gateAutomaticDirection(route[segmentIndex],route[segmentIndex+1]);
export function directionForSegment(route,segmentIndex,overrides={}){
  if(WALK_DIRECTIONS.includes(overrides[segmentIndex]))return overrides[segmentIndex];
  return automaticDirection(route,segmentIndex);
}
export function validDirectionOverrides(route,overrides){
  if(!overrides || Array.isArray(overrides) || typeof overrides!=='object')return false;
  return Object.entries(overrides).every(([index,value])=>
    /^(0|[1-9][0-9]*)$/.test(index) && Number(index)<route.length-1 &&
    WALK_DIRECTIONS.includes(value));
}
export function buildDirectionDraft(mapId,route,overrides){
  return {version:1,mapId,dimensions:{width:1024,height:1536},
    routeSignature:sizeRouteSignature(route),overrides:{...overrides}};
}
export function restoreDirectionDraft(raw,mapId,route){
  try{
    const d=JSON.parse(raw||'null');
    if(d?.version!==1||d.mapId!==mapId||d.dimensions?.width!==1024||
      d.dimensions?.height!==1536||d.routeSignature!==sizeRouteSignature(route)||
      !validDirectionOverrides(route,d.overrides))return {};
    return {...d.overrides};
  }catch{return {};}
}
// Future size profiles can depend on facing choices without changing this draft.
export function directionPlanSignature(route,overrides){
  const serialized=Array.from({length:Math.max(0,route.length-1)},(_,i)=>
    directionForSegment(route,i,overrides)).join('|');
  let h=2166136261;
  for(let i=0;i<serialized.length;i++)h=Math.imul(h^serialized.charCodeAt(i),16777619);
  return (h>>>0).toString(16);
}
// DEV: separate Fox/Wolf authoring drafts; never edit the approved map path.
import {gateRouteAt} from './journeyGateRouteEditor.js';
import {buildSizeDraft,restoreSizeDraft} from './journeyPortraitSizeDraft.js';

export const COMPANION_DRAFT_VERSION=3;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const companionStorageKey=(user,map,companion)=>
  `zodis:journey:portrait-companion:v3:${user||'local'}:${map}:${companion}`;
export function validPlacements(input){
 if(!Array.isArray(input)||input.length>80)return null;
 if(!input.every(p=>Number.isInteger(p?.at)&&p.at>=0&&p.at<=1000&&
   Number.isInteger(p?.x)&&p.x>=0&&p.x<=1024&&
   Number.isInteger(p?.y)&&p.y>=0&&p.y<=1536))return null;
 const sorted=[...input].sort((a,b)=>a.at-b.at);
 if(sorted.some((p,i)=>i>0&&p.at===sorted[i-1].at))return null;
 return sorted.map(({at,x,y})=>({at,x,y}));
}
export function savePlacement(current,at,location){
 if(!Number.isFinite(at)||!Number.isFinite(location?.x)||!Number.isFinite(location?.y))
   return validPlacements(current)||[];
 const values=validPlacements(current)||[];
 const next={at:Math.round(clamp(at,0,1000)),
   x:Math.round(clamp(location.x,0,1024)),y:Math.round(clamp(location.y,0,1536))};
 if(values.length>=80&&!values.some(p=>p.at===next.at))return values;
 return validPlacements([...values.filter(p=>p.at!==next.at),next])||values;
}
export const clearPlacement=(current,at)=>(validPlacements(current)||[]).filter(p=>p.at!==at);
const road=(route,at)=>gateRouteAt(route,clamp(at,0,1000)/1000)||{x:0,y:0};
export function previewPlacement(route,placements,at){
 const p=clamp(Number(at)||0,0,1000),baseline=road(route,p);
 const valid=validPlacements(placements)||[];
 if(!valid.length)return {x:baseline.x,y:baseline.y};
 const nodes=valid.map(v=>{
   const center=road(route,v.at);return {at:v.at,dx:v.x-center.x,dy:v.y-center.y};
 });
 if(nodes[0].at!==0)nodes.unshift({at:0,dx:0,dy:0});
 if(nodes.at(-1).at!==1000)nodes.push({at:1000,dx:0,dy:0});
 let left=nodes[0];
 for(const right of nodes.slice(1)){
   if(p<=right.at){
     const t=right.at===left.at?0:clamp((p-left.at)/(right.at-left.at),0,1);
     const smooth=t*t*(3-2*t);
     return {x:clamp(baseline.x+left.dx+(right.dx-left.dx)*smooth,0,1024),
       y:clamp(baseline.y+left.dy+(right.dy-left.dy)*smooth,0,1536)};
   }
   left=right;
 }
 return {x:clamp(baseline.x+left.dx,0,1024),y:clamp(baseline.y+left.dy,0,1536)};
}
export function buildCompanionDraft(map,route,companion,sizes,placements,directions=''){
 const base=buildSizeDraft(map,route,sizes,directions);
 return {...base,version:COMPANION_DRAFT_VERSION,companion,
   placements:validPlacements(placements)||[]};
}
export function restoreCompanionDraft(raw,map,route,companion,directions=''){
 try{
   const draft=JSON.parse(raw||'null');
   if(draft?.version!==COMPANION_DRAFT_VERSION||draft.mapId!==map||
      draft.companion!==companion||!['fox','wolf'].includes(companion))return null;
   const anchors=restoreSizeDraft(JSON.stringify({...draft,version:2}),
     map,route,directions);
   const placements=validPlacements(draft.placements);
   return anchors&&placements?{anchors,placements}:null;
 }catch{return null;}
}

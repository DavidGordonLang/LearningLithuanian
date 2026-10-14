import {gateRouteAt} from './journeyGateRouteEditor.js';
import {nearestRouteProgress} from './journeyRouteTraceDraft.js';
import {foxRouteTotalDistance} from './journeyFoxRoutePlayback.js';
import {sizeRouteSignature} from './journeyPortraitSizeDraft.js';
export const GAP=75;
export const storageKey=(user,map)=>`zodis:journey:lesson-stops:v1:${user||'local'}:${map}`;
export const label=(id,index)=>id==='section_1_checkpoint'?'Section checkpoint':id.endsWith('_checkpoint')?'Module checkpoint':'Lesson '+(index+1);
export const shortLabel=(id,index)=>id==='section_1_checkpoint'?'S CP':id.endsWith('_checkpoint')?'M CP':'L'+(index+1);
export function seed(route,ids,markers){
 const total=foxRouteTotalDistance(route),n=ids.length;let previous=0;
 return ids.map((id,i)=>{
   const evenly=(i+1)*10000/(n+1),nearest=markers?.[id]?nearestRouteProgress(route,markers[id]):null;
   const proposal=nearest&&total?nearest.progress/total*10000:evenly;
   const at=Math.max(previous+GAP,Math.min(10000-(n-i)*GAP,Math.round(.65*proposal+.35*evenly)));
   previous=at;return {id,at};
 });
}
export function validate(stops,ids){
 if(!Array.isArray(stops)||stops.length!==ids.length||!ids.length||ids.length>30)return null;
 let prev=0;
 for(let i=0;i<stops.length;i++){
   const p=stops[i];if(p?.id!==ids[i]||!Number.isInteger(p.at)||p.at-prev<GAP||p.at>10000-GAP)return null;
   prev=p.at;
 }
 return stops.map(({id,at})=>({id,at}));
}
export function move(stops,ids,id,at){
 const valid=validate(stops,ids),i=ids.indexOf(id);if(!valid||i<0||!Number.isFinite(at))return null;
 at=Math.round(at);
 const lower=(i?valid[i-1].at:0)+GAP,upper=(i<valid.length-1?valid[i+1].at:10000)-GAP;
 return at<lower||at>upper?null:valid.map((p,n)=>n===i?{id,at}:p);
}
export function locations(route,stops,ids){
 return (validate(stops,ids)||[]).map((p,i)=>{
   const q=gateRouteAt(route,p.at/10000);
   return {...p,progress:p.at/10000,x:Math.round(q.x),y:Math.round(q.y),label:label(p.id,i),shortLabel:shortLabel(p.id,i)};
 });
}
export function exportDraft(mapId,route,stops,ids){
 return {version:1,mapId,dimensions:{width:1024,height:1536},
   routeSignature:sizeRouteSignature(route),
   stops:locations(route,stops,ids).map(({id,at,x,y})=>({id,at,x,y}))};
}
export function restore(raw,mapId,route,ids){
 try{
   const d=JSON.parse(raw||'null');
   if(d?.version!==1||d.mapId!==mapId||d.dimensions?.width!==1024||
      d.dimensions?.height!==1536||d.routeSignature!==sizeRouteSignature(route))return null;
   const valid=validate(d.stops,ids);
   if(!valid)return null;
   return locations(route,valid,ids).every((p,i)=>p.x===d.stops[i].x&&p.y===d.stops[i].y)?valid:null;
 }catch{return null;}
}

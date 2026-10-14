import {gateAutomaticDirection,gateRouteAt} from './journeyGateRouteEditor.js';
// DEV-only automated journey preview. No learner progress changes.
export const PREVIEW_WALK_MS=23000;
export const PREVIEW_HOLD_MS=1050;
// Larger at the foreground and still readable at the distant exit.
// Keep most of the size for the first half, then ease out gradually.
export const PREVIEW_SCALE={
  fox:Object.freeze({near:1.7,far:.58}),
  wolf:Object.freeze({near:1.8,far:.62}),
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function automaticPreviewScale(companion,progress){
  const p=clamp(Number(progress)||0,0,1);
  const {near,far}=PREVIEW_SCALE[companion]||PREVIEW_SCALE.fox;
  const eased=Math.pow(p,2.2);
  return near+(far-near)*eased;
}
export function previewHolds(checkpoints){
  return [0,...[...new Set((checkpoints||[])
    .filter(v=>Number.isFinite(v)&&v>0&&v<=1)
    .map(v=>Math.round(v*10000)/10000))].sort((a,b)=>a-b)];
}
// The front-facing original image is shown for ~1s at the start and
// each checkpoint; walking resumes automatically without another click.
export function automaticJourneyFrame(elapsedMs,checkpoints=[],
  walkMs=PREVIEW_WALK_MS,holdMs=PREVIEW_HOLD_MS){
  const elapsed=Math.max(0,Number(elapsedMs)||0);
  const holds=previewHolds(checkpoints);
  let previous=0,consumed=0;
  for(const at of holds){
    const arrival=consumed+(at-previous)*walkMs;
    if(elapsed<arrival)return {progress:clamp(previous+(elapsed-consumed)/walkMs,0,1),
      facingCamera:false,complete:false};
    if(elapsed<arrival+holdMs)return {progress:at,facingCamera:true,complete:false};
    consumed=arrival+holdMs;
    previous=at;
  }
  const remaining=Math.max(0,elapsed-consumed);
  const p=clamp(previous+remaining/walkMs,0,1);
  return {progress:p,facingCamera:false,complete:p>=1};
}
export const journeyTotalMs=(checkpoints=[],walkMs=PREVIEW_WALK_MS,
  holdMs=PREVIEW_HOLD_MS)=>walkMs+previewHolds(checkpoints).length*holdMs;

export function automaticJourneyFacing(route,progress){
  if(!Array.isArray(route)||route.length<2)return 'up';
  const point=gateRouteAt(route,clamp(Number(progress)||0,0,1));
  const segment=Math.min(point?.segmentIndex??0,route.length-2);
  return gateAutomaticDirection(route[segment],route[segment+1]);
}

// Mark the exact *preview* paw pause coordinates, not the original icon location.
// These are nearest-road projections and do not change the user's saved maps.
export function previewCheckpointStops(route,stops,markerPositions){
  if(!Array.isArray(route)||route.length<2)return [];
  const lengths=route.slice(1).map((p,i)=>
    Math.hypot(p.x-route[i].x,p.y-route[i].y));
  const length=lengths.reduce((sum,n)=>sum+n,0);
  if(!length)return [];
  return (stops||[]).filter(stop=>
    stop?.id?.endsWith('checkpoint')&&markerPositions?.[stop.id])
    .map(stop=>{
      const marker=markerPositions[stop.id];
      let distance=Infinity,along=0,walked=0;
      for(let i=0;i<lengths.length;i++){
        const a=route[i],b=route[i+1],dx=b.x-a.x,dy=b.y-a.y;
        const t=lengths[i]?clamp(((marker.x-a.x)*dx+(marker.y-a.y)*dy)/
          (lengths[i]*lengths[i]),0,1):0;
        const off=Math.hypot(marker.x-a.x-t*dx,marker.y-a.y-t*dy);
        if(off<distance){distance=off;along=walked+t*lengths[i];}
        walked+=lengths[i];
      }
      // Match the playback hold's 4-decimal progress exactly.
      const progress=Math.round(clamp(along/length,0,1)*10000)/10000;
      const road=gateRouteAt(route,progress);
      const section=stop.id==='section_1_checkpoint';
      return {id:stop.id,kind:section?'section':'module',
        label:section?'Section checkpoint':'Module checkpoint',
        progress,x:Math.round(road.x),y:Math.round(road.y),
        markerDistance:Math.round(distance)};
    }).sort((a,b)=>a.progress-b.progress);
}

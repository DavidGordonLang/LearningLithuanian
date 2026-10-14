// DEV-only automated journey preview. No learner progress changes.
export const PREVIEW_WALK_MS=23000;
export const PREVIEW_HOLD_MS=1050;
export const PREVIEW_SCALE={
  fox:Object.freeze({near:1.42,far:.25}),
  wolf:Object.freeze({near:1.5,far:.28}),
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function automaticPreviewScale(companion,progress){
  const p=clamp(Number(progress)||0,0,1);
  const {near,far}=PREVIEW_SCALE[companion]||PREVIEW_SCALE.fox;
  const eased=p*p*(3-2*p);
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

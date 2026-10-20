// DEV-only artwork authoring for Section 2. No learner navigation changes.
export const SECTION2_ARTWORK_MAPS = Object.freeze([
  {id:'module_2_1',title:'2.1 · The Arrival Quay',asset:'/assets/journey/section-2-map-2.1-portrait.avif',
   stopIds:['section_2_module_1_lesson_1','section_2_module_1_lesson_2','section_2_module_1_lesson_3','section_2_module_1_lesson_4','section_2_module_1_checkpoint']},
  {id:'module_2_2',title:"2.2 · The Shipwright's Yard",asset:'/assets/journey/section-2-map-2.2-portrait.avif',
   stopIds:['section_2_module_2_lesson_1','section_2_module_2_lesson_3','section_2_module_2_lesson_4','section_2_module_2_lesson_5','section_2_module_2_checkpoint']},
  {id:'module_2_3',title:'2.3 · The Whispering Dunes',asset:'/assets/journey/section-2-map-2.3-portrait.avif',
   stopIds:['section_2_module_3_lesson_1','section_2_module_3_lesson_2','section_2_module_3_checkpoint']},
  {id:'module_2_4',title:'2.4 · The Lighthouse Headland',asset:'/assets/journey/section-2-map-2.4-portrait.avif',
   stopIds:['section_2_module_4_lesson_1','section_2_module_4_lesson_2','section_2_module_4_lesson_3','section_2_module_4_checkpoint','section_2_checkpoint']},
]);
export const SECTION2_ARTWORK_DIMENSIONS=Object.freeze({width:1024,height:1536});
export const SECTION2_TOTAL_DESTINATIONS=18;
export const validArtworkCoordinate=p=>Number.isFinite(p?.x)&&Number.isFinite(p?.y)&&p.x>=0&&p.x<=1024&&p.y>=0&&p.y<=1536;
export function validateSection2ArtworkDraft(mapId,source){
  const map=SECTION2_ARTWORK_MAPS.find(m=>m.id===mapId);
  if(!map||source?.version!==1||source?.mapId!==mapId||source?.dimensions?.width!==1024||source?.dimensions?.height!==1536)return null;
  if(!Array.isArray(source.markers)||!Array.isArray(source.route)||source.route.length>500)return null;
  if(!source.route.every(validArtworkCoordinate))return null;
  const ids=new Set(map.stopIds),seen=new Set();
  for(const p of source.markers) {
    if(!ids.has(p?.id)||seen.has(p.id)||!validArtworkCoordinate(p))return null;
    seen.add(p.id);
  }
  return {version:1,mapId,dimensions:{width:1024,height:1536},
    markers:source.markers.map(({id,x,y})=>({id,x:Math.round(x),y:Math.round(y)})),
    route:source.route.map(({x,y})=>({x:Math.round(x),y:Math.round(y)}))};
}
export function emptySection2ArtworkDraft(mapId){
  return {version:1,mapId,dimensions:{width:1024,height:1536},markers:[],route:[]};
}
export const section2ArtworkStorageKey=(userId,mapId)=>
  'zodis:journey:section2:artwork-draft:v1:'+(userId||'local')+':'+mapId;

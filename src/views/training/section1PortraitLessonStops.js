// David-approved portrait lesson/checkpoint paw stops, 14 October 2026.
// Original 1024x1536 image coordinates and ordered route-distance ticks.
// Keep these coordinates unchanged. DEV authoring drafts may override locally.
// These are review baselines, NOT a production learner navigation switch.
import {sizeRouteSignature} from './journeyPortraitSizeDraft.js';
export const SECTION1_APPROVED_PORTRAIT_STOPS=Object.freeze({
  module_1_1:Object.freeze({
    version:1,mapId:'module_1_1',routeSignature:'a1158c35',
    dimensions:Object.freeze({width:1024,height:1536}),
    stops:Object.freeze([
      Object.freeze({id:'section_1_module_1_lesson_1',at:651,x:527,y:1386}),
      Object.freeze({id:'section_1_module_1_lesson_2',at:2561,x:653,y:1057}),
      Object.freeze({id:'section_1_module_1_lesson_3',at:4615,x:637,y:776}),
      Object.freeze({id:'section_1_module_1_lesson_4',at:5868,x:491,y:624}),
      Object.freeze({id:'section_1_module_1_checkpoint',at:7300,x:600,y:411}),
    ]),
  }),
  module_1_2:Object.freeze({
    version:1,mapId:'module_1_2',routeSignature:'529c244f',
    dimensions:Object.freeze({width:1024,height:1536}),
    stops:Object.freeze([
      Object.freeze({id:'section_1_module_2_lesson_1',at:654,x:721,y:1396}),
      Object.freeze({id:'section_1_module_2_lesson_2',at:2256,x:667,y:1137}),
      Object.freeze({id:'section_1_module_2_lesson_3',at:4005,x:676,y:885}),
      Object.freeze({id:'section_1_module_2_lesson_4',at:6067,x:366,y:650}),
      Object.freeze({id:'section_1_module_2_lesson_5',at:7406,x:451,y:402}),
      Object.freeze({id:'section_1_module_2_checkpoint',at:8635,x:270,y:234}),
    ]),
  }),
  module_1_3:Object.freeze({
    version:1,mapId:'module_1_3',routeSignature:'8cc74657',
    dimensions:Object.freeze({width:1024,height:1536}),
    stops:Object.freeze([
      Object.freeze({id:'section_1_module_3_lesson_1',at:1666,x:331,y:1271}),
      Object.freeze({id:'section_1_module_3_lesson_2',at:3870,x:590,y:971}),
      Object.freeze({id:'section_1_module_3_lesson_3',at:5511,x:504,y:720}),
      Object.freeze({id:'section_1_module_3_lesson_4',at:7349,x:620,y:409}),
      Object.freeze({id:'section_1_module_3_checkpoint',at:9296,x:937,y:232}),
    ]),
  }),
  module_1_4:Object.freeze({
    version:1,mapId:'module_1_4',routeSignature:'518898a9',
    dimensions:Object.freeze({width:1024,height:1536}),
    stops:Object.freeze([
      Object.freeze({id:'section_1_module_4_lesson_1',at:376,x:532,y:1428}),
      Object.freeze({id:'section_1_module_4_lesson_2',at:1337,x:490,y:1240}),
      Object.freeze({id:'section_1_module_4_lesson_3',at:3424,x:597,y:1042}),
      Object.freeze({id:'section_1_module_4_lesson_4',at:4683,x:497,y:807}),
      Object.freeze({id:'section_1_module_4_lesson_5',at:5879,x:623,y:626}),
      Object.freeze({id:'section_1_module_4_checkpoint',at:7330,x:585,y:391}),
      Object.freeze({id:'section_1_checkpoint',at:8465,x:788,y:294}),
    ]),
  }),
});
export function approvedPortraitLessonStops(mapId,stopIds,route){
  const source=SECTION1_APPROVED_PORTRAIT_STOPS[mapId];
  if(!source||!Array.isArray(stopIds)||!Array.isArray(route)||
    source.routeSignature!==sizeRouteSignature(route)||
    source.stops.length!==stopIds.length||
    source.stops.some((stop,i)=>stop.id!==stopIds[i]))return null;
  return source.stops.map(({id,at})=>({id,at}));
}

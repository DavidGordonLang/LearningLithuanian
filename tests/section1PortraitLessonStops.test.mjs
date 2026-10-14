import test from 'node:test';
import assert from 'node:assert/strict';
import {SECTION1_APPROVED_PORTRAIT_STOPS,approvedPortraitLessonStops} from '../src/views/training/section1PortraitLessonStops.js';
import {SECTION1_PORTRAIT_MARKERS} from '../src/views/training/section1PortraitMarkers.js';
import {approvedPortraitRoutePoints} from '../src/views/training/section1PortraitRoutes.js';
import {sizeRouteSignature} from '../src/views/training/journeyPortraitSizeDraft.js';
import {locations,restore,validate} from '../src/views/training/journeyLessonStops.js';

const expected={
 module_1_1:[[651,527,1386],[2561,653,1057],[4615,637,776],[5868,491,624],[7300,600,411]],
 module_1_2:[[654,721,1396],[2256,667,1137],[4005,676,885],[6067,366,650],[7406,451,402],[8635,270,234]],
 module_1_3:[[1666,331,1271],[3870,590,971],[5511,504,720],[7349,620,409],[9296,937,232]],
 module_1_4:[[376,532,1428],[1337,490,1240],[3424,597,1042],[4683,497,807],[5879,623,626],[7330,585,391],[8465,788,294]],
};
test('all 23 author-supplied paw stops are banked exactly on their original routes',()=>{
 assert.deepEqual(Object.keys(SECTION1_APPROVED_PORTRAIT_STOPS),Object.keys(expected));
 assert.equal(Object.values(expected).reduce((n,v)=>n+v.length,0),23);
 for(const [map,rows] of Object.entries(expected)){
   const b=SECTION1_APPROVED_PORTRAIT_STOPS[map];
   const ids=SECTION1_PORTRAIT_MARKERS[map].markers.map(x=>x.id);
   const route=approvedPortraitRoutePoints(map);
   assert.equal(b.version,1);
   assert.deepEqual(b.dimensions,{width:1024,height:1536});
   assert.equal(b.routeSignature,sizeRouteSignature(route));
   assert.deepEqual(b.stops.map(s=>s.id),ids);
   assert.deepEqual(b.stops.map(s=>[s.at,s.x,s.y]),rows);
   const copy=approvedPortraitLessonStops(map,ids,route);
   assert.ok(validate(copy,ids));
   assert.deepEqual(locations(route,copy,ids).map(s=>[s.at,s.x,s.y]),rows);
   assert.deepEqual(restore(JSON.stringify(b),map,route,ids),copy);
   copy[0].at=5;
   assert.equal(b.stops[0].at,rows[0][0]);
 }
});
test('wrong map, route, or reordered lesson identifiers do not apply',()=>{
 const route=approvedPortraitRoutePoints('module_1_2');
 const ids=SECTION1_PORTRAIT_MARKERS.module_1_2.markers.map(x=>x.id);
 assert.equal(approvedPortraitLessonStops('module_2_1',ids,route),null);
 assert.equal(approvedPortraitLessonStops('module_1_2',ids.reverse(),route),null);
 assert.equal(approvedPortraitLessonStops('module_1_2',
  SECTION1_PORTRAIT_MARKERS.module_1_2.markers.map(x=>x.id),
  approvedPortraitRoutePoints('module_1_1')),null);
});

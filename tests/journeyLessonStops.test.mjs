import test from 'node:test';
import assert from 'node:assert/strict';
import {SECTION1_PORTRAIT_MARKERS} from '../src/views/training/section1PortraitMarkers.js';
import {approvedPortraitRoutePoints} from '../src/views/training/section1PortraitRoutes.js';
import {storageKey,seed,validate,move,locations,exportDraft,restore,GAP} from '../src/views/training/journeyLessonStops.js';

test('all 23 lesson and checkpoint stops seed in curriculum order on approved roads',()=>{
 const counts=[5,6,5,7];
 let total=0;
 for(let i=1;i<=4;i++){
   const mapId='module_1_'+i,source=SECTION1_PORTRAIT_MARKERS[mapId];
   const ids=source.markers.map(m=>m.id),markers=Object.fromEntries(source.markers.map(m=>[m.id,m]));
   const route=approvedPortraitRoutePoints(mapId);
   const initial=seed(route,ids,markers);
   const checked=validate(initial,ids),placed=locations(route,initial,ids);
   assert.ok(checked,mapId+' must be chronological');
   assert.equal(initial.length,counts[i-1]);total+=initial.length;
   assert.equal(placed.length,counts[i-1]);
   assert.deepEqual(placed.map(p=>p.id),ids);
   assert.ok(placed.every(p=>p.x>=0&&p.x<=1024&&p.y>=0&&p.y<=1536));
   const json=JSON.stringify(exportDraft(mapId,route,initial,ids));
   assert.deepEqual(restore(json,mapId,route,ids),initial);
   assert.equal(restore(json,'module_2_1',route,ids),null);
 }
 assert.equal(total,23);
});

test('stop relocation updates one stop, rejects ordering mistakes and preserves route',()=>{
 const id='module_1_1',source=SECTION1_PORTRAIT_MARKERS[id],ids=source.markers.map(m=>m.id);
 const markers=Object.fromEntries(source.markers.map(m=>[m.id,m]));
 const route=approvedPortraitRoutePoints(id),snapshot=JSON.stringify(route);
 const initial=seed(route,ids,markers),at=initial[1].at+GAP;
 const changed=move(initial,ids,ids[1],at);
 assert.equal(changed[1].at,at);
 assert.deepEqual(changed.filter((p,i)=>i!==1),initial.filter((p,i)=>i!==1));
 assert.equal(move(initial,ids,ids[1],initial[2].at),null);
 assert.equal(move(initial,ids,ids[1],initial[0].at),null);
 assert.equal(JSON.stringify(route),snapshot);
});

test('tampered stop coordinates and route mismatches are rejected',()=>{
 const id='module_1_2',source=SECTION1_PORTRAIT_MARKERS[id],ids=source.markers.map(p=>p.id);
 const route=approvedPortraitRoutePoints(id);
 const markers=Object.fromEntries(source.markers.map(p=>[p.id,p]));
 const stops=seed(route,ids,markers);
 const original=exportDraft(id,route,stops,ids);
 const wrong=structuredClone(original);
 wrong.stops[0].x+=2;
 assert.equal(restore(JSON.stringify(wrong),id,route,ids),null);
 const out=structuredClone(original);
 out.stops[2].at=out.stops[1].at;
 assert.equal(restore(JSON.stringify(out),id,route,ids),null);
 const altered=route.map(x=>({...x}));altered[1].x+=1;
 assert.equal(restore(JSON.stringify(original),id,altered,ids),null);
 assert.notEqual(storageKey('user',id),storageKey('user','module_1_1'));
});

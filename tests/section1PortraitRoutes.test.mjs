import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {SECTION1_APPROVED_PORTRAIT_ROUTES,approvedPortraitRoutePoints} from '../src/views/training/section1PortraitRoutes.js';
import {restoreRouteDraft,buildRouteDraft} from '../src/views/training/journeyRouteTraceDraft.js';

const reference={
  module_1_1:{count:14,hash:'8f54b8b5',start:[476,1501],end:[204,85]},
  module_1_2:{count:16,hash:'cc900a4d',start:[836,1479],end:[0,130]},
  module_1_3:{count:14,hash:'bc3450e9',start:[55,1455],end:[1024,144]},
  module_1_4:{count:25,hash:'e87239e6',start:[519,1511],end:[1024,141]},
};
function fingerprint(points){
  const text=points.map(({x,y})=>x+','+y).join(' ');
  let hash=2166136261;
  for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
  return (hash>>>0).toString(16);
}
test('all 69 traced route coordinates match original user exports',()=>{
  assert.deepEqual(Object.keys(SECTION1_APPROVED_PORTRAIT_ROUTES),Object.keys(reference));
  assert.equal(Object.values(reference).reduce((n,v)=>n+v.count,0),69);
  for(const [id,expected] of Object.entries(reference)){
    const route=SECTION1_APPROVED_PORTRAIT_ROUTES[id];
    assert.equal(route.version,1);
    assert.equal(route.mapId,id);
    assert.deepEqual(route.dimensions,{width:1024,height:1536});
    assert.equal(route.points.length,expected.count);
    assert.equal(fingerprint(route.points),expected.hash);
    assert.deepEqual(Object.values(route.points[0]),expected.start);
    assert.deepEqual(Object.values(route.points.at(-1)),expected.end);
    assert.deepEqual(restoreRouteDraft(JSON.stringify(buildRouteDraft(id,route.points)),id),route.points);
  }
});
test('seed returns editable copies, committed baselines stay unchanged',()=>{
  for(const [id,ref] of Object.entries(reference)){
    const result=approvedPortraitRoutePoints(id);
    result[0].x=-100;
    result.push({x:0,y:0});
    assert.equal(fingerprint(approvedPortraitRoutePoints(id)),ref.hash);
  }
  assert.deepEqual(approvedPortraitRoutePoints('module_2_1'),[]);
});
test('stage-3 sizing reads the banked routes without changing them',()=>{
  const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
  const editor=readFileSync(resolve(root,'src/views/training/JourneyMapWorkbench.jsx'),'utf8');
  assert.match(editor,/approvedPortraitRoutePoints\(mapId\)/);
  assert.match(editor,/gateRouteAt\(route,position\/1000\)/);
  assert.doesNotMatch(editor,/restoreRouteDraft|buildRouteDraft|setPoints\(|Clear route|Remove bend/);
  const stage2=readFileSync(resolve(root,'src/views/training/journeyRouteTraceDraft.js'),'utf8');
  assert.match(stage2,/routeStorageKey/);
  assert.match(stage2,/restoreRouteDraft/);
});

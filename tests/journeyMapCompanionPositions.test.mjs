import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const text = readFileSync(new URL("../src/views/training/JourneyMap.jsx",import.meta.url),"utf8");
function coordinates(constantName) {
  const body=text.match(new RegExp("const "+constantName+" = \\[([\\s\\S]*?)\\];"))?.[1];
  assert.ok(body,constantName+" must be present");
  return [...body.matchAll(/\{ x: (\d+), y: (\d+) \}/g)].map(([,x,y])=>({x:Number(x),y:Number(y)}));
}
const nodes=coordinates("FIRST_CONTACT_POINTS");
const positions=coordinates("FIRST_CONTACT_APPROACH_POINTS");
test("companion has exactly one approaching spot for each village stop",()=>{
  assert.equal(nodes.length,5);
  assert.equal(positions.length,nodes.length);
});
test("companions stay in scene, separated from the lesson marker",()=>{
  positions.forEach((p,i)=>{
    assert.ok(p.x>40&&p.x<810&&p.y>=112&&p.y<=1100,"companion inside scene at "+i);
    assert.ok(Math.hypot(p.x-nodes[i].x,p.y-nodes[i].y)>=115,"companion must not obscure lesson "+(i+1));
    // The fountain is reached from its WEST cobbled lane, not from
    // beneath the marker (which would put the fox into the stream).
    assert.ok(p.y>nodes[i].y || p.x<nodes[i].x-115,
      "companion approaches the landmark from below or the safe western road");
  });
});


test("fountain approach is on dry paving west of the water",()=>{
  assert.ok(positions[1].x<=475);
  assert.ok(positions[1].y<=650);
});

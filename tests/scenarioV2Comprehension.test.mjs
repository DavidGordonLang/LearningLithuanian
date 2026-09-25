import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const src=fs.readFileSync(new URL("../src/views/training/ScenarioV2Block.jsx",import.meta.url),"utf8");

test("Scenario V2 supports comprehension choices without pretending English is learner dialogue",()=>{
  assert.match(src,/interactionMode === "comprehension"/);
  assert.match(src,/role: "comprehension"/);
  assert.match(src,/Meaning selected/);
  assert.match(src,/Comprehension check/);
  assert.match(src,/Choose meaning/);
  assert.match(src,/if \(isComprehensionStep\) addComprehensionExchange\(option\)/);
  assert.match(src,/plainText=\{isComprehensionStep\}/);
});

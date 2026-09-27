import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const src=fs.readFileSync(new URL("../src/views/training/ScenarioV2Block.jsx",import.meta.url),"utf8");

test("Scenario V2 comprehension keeps English selection out of dialogue and inserts authored Lithuanian learner text",()=>{
  assert.match(src,/interactionMode === "comprehension"/);
  assert.match(src,/const learnerText = String\(option\?\.learnerText/);
  assert.match(src,/role: "learner"/);
  assert.match(src,/text: learnerText/);
  assert.equal(src.includes('role: "comprehension"'),false);
  assert.equal(src.includes("Meaning selected"),false);
  assert.match(src,/Comprehension check/);
  assert.match(src,/Choose meaning/);
  assert.match(src,/if \(isComprehensionStep\) addComprehensionExchange\(option\)/);
  assert.match(src,/plainText=\{isComprehensionStep\}/);
});

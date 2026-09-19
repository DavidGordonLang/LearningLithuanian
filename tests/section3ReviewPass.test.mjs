import test from "node:test";
import assert from "node:assert/strict";
import createModule32 from "../src/content/learning/section3/module_3_2.js";
import createModule33 from "../src/content/learning/section3/module_3_3.js";
import createModule34 from "../src/content/learning/section3/module_3_4.js";
import createCheckpoint3 from "../src/content/learning/section3/checkpoint_3.js";

const allText=(x)=>JSON.stringify(x);

test("Section 3 price language avoids the reviewed gender mismatch and uses pigu",()=>{
  const m=createModule32();
  const s=allText(m);
  assert.equal(s.includes("Kiek šitas kainuoja?"),false);
  assert.ok(s.includes("Kiek kainuoja knyga?"));
  assert.ok(s.includes("Kokia kaina?"));
  assert.equal(s.includes("Nebrangiai"),false);
  assert.ok(s.includes("Pigu"));
});

test("Section 3 uses the polite bill request as the production target",()=>{
  const m=createModule32();
  const cp=createCheckpoint3();
  assert.ok(allText(m).includes("Ar galėčiau gauti sąskaitą, prašau?"));
  assert.ok(allText(cp).includes("Ar galėčiau gauti sąskaitą, prašau?"));
});

test("Section 3 distinguishes clock time from scheduled at-time forms",()=>{
  const m=createModule33();
  assert.match(m.lessons.find(l=>l.code==="3.3.1").notes.pattern,/trečią valandą means at three o'clock/);
});

test("Section 3 quantity examples keep service context coherent",()=>{
  const m=createModule34();
  const s=allText(m);
  assert.ok(s.includes("one more coffee"));
  assert.ok(s.includes("Taip, dar ir vandens, prašau."));
  assert.ok(s.includes("Ar dar ko nors norėtumėte?"));
  assert.ok(s.includes("asks your party size before seating you"));
});

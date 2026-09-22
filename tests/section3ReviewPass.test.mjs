import test from "node:test";
import assert from "node:assert/strict";
import createModule31 from "../src/content/learning/section3/module_3_1.js";
import createModule32 from "../src/content/learning/section3/module_3_2.js";
import createModule33 from "../src/content/learning/section3/module_3_3.js";
import createModule34 from "../src/content/learning/section3/module_3_4.js";
import createCheckpoint3 from "../src/content/learning/section3/checkpoint_3.js";

const allText=(x)=>JSON.stringify(x);

test("Section 3.1 keeps number practice inside taught material before price language",()=>{
  const m=createModule31();
  const lesson=m.lessons.find(l=>l.code==="3.1.2");
  const recap=lesson.blocks.at(-1);

  assert.equal(JSON.stringify(m).includes("Tai kainuoja"), false);
  assert.equal(recap.type, "word_match");
  assert.equal(recap.id, "s3m1l2_b7");
  assert.equal(recap.pairs.length, 20);
  assert.equal(recap.pairs[0].lt, "vienas");
  assert.equal(recap.pairs.at(-1).lt, "dvidešimt");
  assert.equal(new Set(recap.pairs.map(pair=>pair.lt)).size, 20);
});

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


test("Ar užtenka stays a sufficiency check and customer order quantities use request forms",()=>{
  const m=createModule34();
  const enough=m.lessons.find(l=>l.code==="3.4.4");
  assert.match(enough.notes.pattern,/should not be treated as the general service question 'Is that all\?'/);
  const enoughScenario=enough.blocks.find(b=>b.id==="s3m4l4_b6_v2");
  assert.match(enoughScenario.steps[0].sceneDirection,/pouring water/);
  assert.equal(enoughScenario.steps[0].help.levels.at(-1).audio,false);

  const quantities=m.lessons.find(l=>l.code==="3.4.5");
  assert.ok(JSON.stringify(quantities).includes("Vieną kavą ir dvi arbatas, prašau"));
});

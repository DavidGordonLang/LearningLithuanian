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

  assert.equal(JSON.stringify(lesson).includes("Tai kainuoja"), false);
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
  const clock=m.lessons.find(l=>l.code==="3.3.1");
  const scheduled=m.lessons.find(l=>l.code==="3.3.4");

  assert.match(clock.notes.pattern,/trečia valanda \(three o'clock\)/);
  assert.match(scheduled.notes.pattern,/penktą valandą means at five o'clock/);
  assert.ok(scheduled.notes.usage.some(line=>/penkta valanda.*penktą valandą/.test(line)));
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


test("Section 3 explains changing number forms in plain-language layers",()=>{
  const m31=createModule31();
  const m32=createModule32();
  const m33=createModule33();
  const m34=createModule34();

  const context=m31.lessons.find(l=>l.code==="3.1.4").notes;
  assert.match(context.pattern,/same number, different job/i);
  assert.ok(context.usage.some(line=>/trys.*trijų/.test(line)));
  assert.ok(context.usage.some(line=>/du.*dvi kavas/i.test(line)));
  assert.ok(context.usage.some(line=>/penki.*penktą valandą/.test(line)));

  const prices=m32.lessons.find(l=>l.code==="3.2.2").notes;
  assert.match(prices.pattern,/1–9 euros/);
  assert.ok(prices.usage.some(line=>/penki.*penkis eurus/.test(line)));
  assert.ok(prices.usage.some(line=>/dvidešimt.*dvidešimt eurų/.test(line)));

  const clock=m33.lessons.find(l=>l.code==="3.3.1");
  assert.match(clock.notes.pattern,/different number family/);
  assert.ok(clock.blocks[0].items.some(item=>item.lt==="Pirma valanda" && item.en==="One o'clock"));

  const quantities=m34.lessons.find(l=>l.code==="3.4.2").notes;
  assert.match(quantities.pattern,/du goes with masculine things/);
  assert.match(quantities.pattern,/dvi goes with feminine things/);
  assert.ok(quantities.usage.some(line=>/dviejų bilietų/.test(line)));
  assert.ok(quantities.usage.some(line=>/trijų bilietų/.test(line)));

  const numberNotes=[
    context.pattern,
    prices.pattern,
    clock.notes.pattern,
    m33.lessons.find(l=>l.code==="3.3.4").notes.pattern,
    quantities.pattern,
  ].join(" ");
  assert.doesNotMatch(numberNotes,/genitive|accusative|ordinal declension/i);
});


test("Section 3 does not ask learners to produce forms before they are surfaced",()=>{
  const m31=createModule31();
  const l314=m31.lessons.find(l=>l.code==="3.1.4");
  const learn314=l314.blocks.find(b=>b.type==="learn").items.map(i=>i.lt);
  assert.ok(learn314.includes("Mes esame"));
  assert.ok(learn314.includes("Man reikia dviejų bilietų"));
  assert.ok(learn314.includes("Dvi kavas, prašau"));
  assert.match(l314.notes.usage.join(" "),/Mes = we, esame = are/);

  const m32=createModule32();
  const l322=m32.lessons.find(l=>l.code==="3.2.2");
  const l324=m32.lessons.find(l=>l.code==="3.2.4");
  assert.equal(JSON.stringify(l322).includes('"Gerai, imu!"'),false);
  assert.ok(JSON.stringify(l324).includes('"Imu"'));

  const m33=createModule33();
  const l333=m33.lessons.find(l=>l.code==="3.3.3");
  const s333=JSON.stringify(l333);
  assert.equal(s333.includes("traukinys"),false);
  assert.equal(s333.includes("šeštą valandą"),false);
  assert.ok(s333.includes("Kada išvyksta autobusas?"));
  assert.ok(s333.includes("penktą valandą"));
});


test("3.1.4 coffee scenario establishes why the learner needs two coffees",()=>{
  const m=createModule31();
  const lesson=m.lessons.find(l=>l.code==="3.1.4");
  const scenario=lesson.blocks.find(b=>b.id==="s3m1l4_b6_v2");

  assert.match(scenario.description,/ordering two coffees/i);
  assert.match(scenario.sceneIntro,/one for you and one for a friend/i);
  assert.match(scenario.steps[0].sceneDirection,/one coffee for yourself and one for your friend/i);
  assert.equal(scenario.steps[0].learnerPrompt,"Tell the server you want two coffees.");
  assert.equal(scenario.steps[0].options.find(o=>o.result==="best").text,"Dvi kavas, prašau");
});


test("3.1.4 price helper deliberately isolates the six-euro amount",()=>{
  const m=createModule31();
  const lesson=m.lessons.find(l=>l.code==="3.1.4");
  const scenario=lesson.blocks.find(b=>b.id==="s3m1l4_b6_v2");
  const help=scenario.steps[1].help.levels;

  assert.match(help[0].sceneDirection,/holds up six fingers/i);
  assert.equal(help[0].speakerText,"Šešis eurus.");
  assert.equal(help[1].speakerText,"It costs six euros.");
  assert.equal(help[1].spokenLanguage,"en");
  assert.equal(help[1].audio,false);
});


test("3.1 checkpoint deliberately tests the different 'two' forms in context",()=>{
  const m=createModule31();
  const checkpoint=m.lessons.find(l=>l.code==="3.1.C");
  const block=checkpoint.blocks.find(b=>b.id==="s3m1c_b4");

  assert.match(block.prompt.text,/There are two of us/);
  assert.equal(block.options.find(o=>o.isCorrect).text,"Mes esame dviese.");
  assert.ok(block.options.some(o=>o.text==="Man reikia dviejų bilietų."));
  assert.ok(block.options.some(o=>o.text==="Dvi kavas, prašau."));
  assert.match(block.feedback.correct,/different jobs/i);
  assert.equal(JSON.stringify(block).includes("aštuoni"),false);
});

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

  const cafe=m.lessons.find(l=>l.code==="3.4.5").blocks.find(b=>b.id==="s3m4l5_b6_v2");
  assert.match(cafe.description,/You and a friend/);
  assert.match(cafe.description,/one coffee and two teas/i);

  const checkpoint=m.lessons.find(l=>l.code==="3.4.C").blocks.find(b=>b.id==="s3m4c_b6_v2");
  assert.match(checkpoint.description,/You and two friends/);
  assert.match(checkpoint.description,/two want coffee and one wants a glass of water/i);
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


test("Lithuanian best-response answers in Section 3 keep option audio enabled",()=>{
  const blocks=[
    createModule31().lessons.find(l=>l.code==="3.1.C").blocks.find(b=>b.id==="s3m1c_b4"),
    createModule32().lessons.find(l=>l.code==="3.2.C").blocks.find(b=>b.id==="s3m2c_b4"),
    createModule34().lessons.find(l=>l.code==="3.4.C").blocks.find(b=>b.id==="s3m4c_b4"),
  ];
  for(const block of blocks){
    assert.equal(block.noOptionAudio,undefined,block.id);
    assert.ok(block.options.every(o=>/[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]/.test(o.text)),block.id);
  }
});


test("Section 3 quantity scenarios establish the exact quantity before asking for it",()=>{
  const m31=createModule31();
  const ticket=m31.lessons.find(l=>l.code==="3.1.C").blocks.find(b=>b.id==="s3m1c_b6_v2");
  assert.match(ticket.description,/buying two tickets/i);
  assert.match(ticket.sceneIntro,/one for you and one for a friend/i);
  assert.match(ticket.steps[0].sceneDirection,/two tickets/i);
  assert.equal(ticket.steps[0].learnerPrompt,"Tell Rasa that you need two tickets.");

  const m34=createModule34();
  const cafe=m34.lessons.find(l=>l.code==="3.4.5").blocks.find(b=>b.id==="s3m4l5_b6_v2");
  assert.match(cafe.description,/one coffee and two teas/i);
  assert.match(cafe.steps[1].sceneDirection,/one coffee and two teas/i);

  const checkpoint=m34.lessons.find(l=>l.code==="3.4.C").blocks.find(b=>b.id==="s3m4c_b6_v2");
  assert.match(checkpoint.description,/two want coffee and one wants a glass of water/i);
  assert.match(checkpoint.steps[1].sceneDirection,/Two of you want coffee/i);
});


test("3.2.2 hat scenario grounds the general price question in a physical action",()=>{
  const m=createModule32();
  const lesson=m.lessons.find(l=>l.code==="3.2.2");
  const scenario=lesson.blocks.find(b=>b.id==="s3m2l2_b6_v2");
  const first=scenario.steps[0];

  assert.match(scenario.description,/hat at a market/i);
  assert.match(first.sceneDirection,/pick up the hat/i);
  assert.equal(first.learnerPrompt,"Ask how much it costs.");
  assert.equal(first.options.find(o=>o.result==="best").text,"Laba diena! Kiek tai kainuoja?");
  const book=first.options.find(o=>o.text.includes("knyga"));
  assert.equal(book.result,"wrong");
  assert.match(book.feedback,/Knyga means book/);
});


test("3.2.4 market scenario treats price objection as a valid negotiation branch",()=>{
  const m=createModule32();
  const lesson=m.lessons.find(l=>l.code==="3.2.4");
  const scenario=lesson.blocks.find(b=>b.id==="s3m2l4_b6_v2");
  const price=scenario.steps.find(s=>s.id==="step_2");
  const offer=scenario.steps.find(s=>s.id==="step_2_offer");
  assert.match(scenario.description,/book in your hand/i);
  assert.match(scenario.steps[0].sceneDirection,/hold up the book/i);

  const objection=price.options.find(o=>o.text==="Per brangu");
  assert.equal(objection.result,"acceptable");
  assert.equal(objection.progresses,true);
  assert.equal(objection.nextStepId,"step_2_offer");
  assert.equal(price.options.find(o=>o.text==="Gerai, imu!").nextStepId,"step_3");

  assert.equal(offer.speakerText,"Gerai, aštuoniolika eurų.");
  assert.match(offer.sceneDirection,/two euros off/i);
  assert.equal(offer.options.find(o=>o.text==="Gerai, imu!").nextStepId,"step_3");
  assert.equal(offer.options.find(o=>o.text==="Ne, ačiū").nextStepId,undefined);
  assert.equal(offer.finalSystemLine.speakerText,"Gerai. Viso gero!");
  assert.match(offer.finalSystemLine.sceneDirection,/not to buy the book/i);
  assert.equal(scenario.steps.some(s=>s.id==="step_decline"),false);
});


test("3.2.5 teaches Ar viskas gerai before using it in the scenario",()=>{
  const m=createModule32();
  const lesson=m.lessons.find(l=>l.code==="3.2.5");
  const learn=lesson.blocks.find(b=>b.id==="s3m2l5_b1");
  const speak=lesson.blocks.find(b=>b.id==="s3m2l5_b1b");
  const scenario=lesson.blocks.find(b=>b.id==="s3m2l5_b6_v2");

  assert.ok(learn.items.some(item=>item.lt==="Ar viskas gerai?" && item.en==="Is everything okay?"));
  assert.equal(speak.type,"speak_self_check");
  assert.equal(speak.targetText,"Ar viskas gerai?");
  assert.ok(lesson.blocks.indexOf(speak) < lesson.blocks.indexOf(scenario));
  assert.equal(scenario.steps[0].speakerText,"Ar viskas gerai?");
  assert.equal(scenario.steps[0].options.find(o=>o.result==="best").text,"Taip, ačiū. Ar galėčiau gauti sąskaitą, prašau?");
});


test("3.2 checkpoint grounds preference before best-response choices",()=>{
  const m=createModule32();
  const checkpoint=m.lessons.find(l=>l.code==="3.2.C");

  const cash=checkpoint.blocks.find(b=>b.id==="s3m2c_b3");
  assert.match(cash.prompt.text,/want to pay in cash/i);
  assert.equal(cash.options.find(o=>o.isCorrect).text,"Grynaisiais, prašau");

  const scenario=checkpoint.blocks.find(b=>b.id==="s3m2c_b6_v2");
  const price=scenario.steps.find(s=>s.id==="step_2");
  const payment=scenario.steps.find(s=>s.id==="step_3");

  assert.match(price.sceneDirection,/Three euros is fine for you/i);
  assert.equal(price.learnerPrompt,"Order one coffee.");
  assert.equal(price.options.find(o=>o.result==="best").text,"Gerai. Vieną kavą, prašau.");

  assert.match(payment.sceneDirection,/pay by card/i);
  assert.equal(payment.learnerPrompt,"Tell Rasa you want to pay by card.");
  assert.equal(payment.options.find(o=>o.result==="best").text,"Kortele, prašau");
});


test("3.3.2 explicitly teaches Kada and susitikimas before testing or scenario use",()=>{
  const m=createModule33();
  const lesson1=m.lessons.find(l=>l.code==="3.3.1");
  const lesson=m.lessons.find(l=>l.code==="3.3.2");
  const learn=lesson.blocks.find(b=>b.id==="s3m3l2_b1");
  const build=lesson.blocks.find(b=>b.id==="s3m3l2_b5");
  const scenario=lesson.blocks.find(b=>b.id==="s3m3l2_b6_v2");

  assert.equal(lesson1.blocks.find(b=>b.id==="s3m3l1_b1").items.some(item=>item.lt==="susitikimas"),false);
  assert.ok(learn.items.some(item=>item.lt==="Kada?" && item.en==="When?"));
  assert.ok(learn.items.some(item=>item.lt==="susitikimas" && item.en==="meeting"));
  assert.equal(learn.items.some(item=>item.lt==="dabar"),false);
  assert.ok(lesson.blocks.indexOf(learn) < lesson.blocks.indexOf(build));
  assert.ok(lesson.blocks.indexOf(learn) < lesson.blocks.indexOf(scenario));
  assert.ok(build.tokens.some(token=>token.text==="Kada?" && token.correctIndex===0));
  assert.ok(build.tokens.some(token=>token.text==="Dabar." && token.isDistractor===true));
  assert.equal(scenario.steps[0].options.find(o=>o.result==="best").text,"Labas! Kada susitikimas?");
  assert.match(lesson.notes.pattern,/Dabar \(now\) is already familiar/);
  assert.doesNotMatch(lesson.notes.pattern,/already know Kada|Section 2/i);
});


test("3.3.3 pattern note explains the action words before practice",()=>{
  const m=createModule33();
  const lesson=m.lessons.find(l=>l.code==="3.3.3");
  const learn=lesson.blocks.find(b=>b.id==="s3m3l3_b1");
  const speak=lesson.blocks.find(b=>b.id==="s3m3l3_b1b");
  const scenario=lesson.blocks.find(b=>b.id==="s3m3l3_b6_v2");

  assert.match(lesson.notes.pattern,/išvyksta means leaves\/departs/i);
  assert.match(lesson.notes.pattern,/pradedame means we start/i);
  assert.match(lesson.notes.pattern,/einame means we go\/are going/i);
  assert.match(lesson.notes.pattern,/prasideda means starts\/begins/i);
  assert.ok(lesson.notes.usage.includes("išvyksta — leaves / departs"));
  assert.equal(learn.items.some(item=>item.lt==="išvyksta"),false);
  assert.equal(speak.type,"speak_self_check");
  assert.equal(speak.targetText,"Kada išvyksta autobusas?");
  assert.equal(speak.prompt,"Say: When does the bus leave?");
  assert.ok(lesson.blocks.indexOf(speak) < lesson.blocks.indexOf(scenario));
  assert.equal(scenario.steps[0].options.find(o=>o.result==="best").text,"Laba diena. Kada išvyksta autobusas?");
  assert.equal(scenario.goal,"You're at a bus station and need to know departure time.");
});

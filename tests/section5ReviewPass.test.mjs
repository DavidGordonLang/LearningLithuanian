import test from "node:test";
import assert from "node:assert/strict";
import createModule51 from "../src/content/learning/section5/module_5_1.js";
import createModule52 from "../src/content/learning/section5/module_5_2.js";
import createModule53 from "../src/content/learning/section5/module_5_3.js";
import createModule54 from "../src/content/learning/section5/module_5_4.js";
import createCheckpoint5 from "../src/content/learning/section5/checkpoint_5.js";

const txt=x=>JSON.stringify(x);
const scenarios=x=>x.lessons?x.lessons.flatMap(l=>l.blocks).filter(b=>b.type==="scenario_v2"):x.blocks.filter(b=>b.type==="scenario_v2");

test("Section 5 removes corrupted text and reviewed terminology issues",()=>{
 const all=[createModule51(),createModule52(),createModule53(),createModule54(),createCheckpoint5()];
 const s=all.map(txt).join("\n");
 for(const bad of ["Aust?ja","vie?butis","vaistin?","geležinkelio stotis","Geležinkelio stotis","taksiu","Ar tai toli?","Ar tai netoli?"]){
   assert.equal(s.includes(bad),false,bad);
 }
 assert.ok(s.includes("traukinių stotis"));
 assert.ok(s.includes("Ar toli?"));
 assert.ok(s.includes("taksi"));
});

test("Section 5 location scenarios match their physical setting",()=>{
 const m=createModule51();
 const bank=m.lessons.flatMap(l=>l.blocks).find(b=>b.id==="s5m1l1_b6_v2");
 const hotel=m.lessons.flatMap(l=>l.blocks).find(b=>b.id==="s5m1l2_b6_v2");
 assert.equal(bank.location,"street");
 assert.equal(bank.participants[0].role,"passer-by");
 assert.equal(bank.objects[0].lt,"bankas");
 assert.equal(hotel.location,"street");
 assert.equal(hotel.steps[0].speakerText,"Kur yra viešbutis?");
 assert.equal(hotel.steps[1].speakerText,"Kur yra kavinė?");
 assert.equal(hotel.steps[3].speakerText,"Tualetas yra ten.");
});

test("Section 5 scenarios reinforce taught place and movement language without avoidable vocabulary leaks",()=>{
  const m1=createModule51();
  const l12=m1.lessons.find(l=>l.code==="5.1.2").blocks.find(b=>b.id==="s5m1l2_b6_v2");
  assert.equal(l12.steps.length,4);
  const l11=m1.lessons.find(l=>l.code==="5.1.1").blocks.find(b=>b.id==="s5m1l1_b6_v2");
  assert.equal(l11.steps[1].speakerText,"Bankas yra ten.");
  assert.equal(l11.steps[1].supportText,undefined);
  assert.equal(l12.steps[0].options.find(o=>o.result==="best").text,"Viešbutis yra ten.");
  assert.equal(l12.steps[1].options.find(o=>o.result==="best").text,"Kavinė yra čia.");
  assert.equal(l12.steps[3].speakerText,"Tualetas yra ten.");
  assert.equal(txt(m1).includes("Autobusų stotis yra ten."),false);
  assert.ok(txt(m1).includes("Autobusų stotelė yra ten."));
  assert.equal(txt(m1).includes("teisingai"),false);
  assert.equal(txt(m1).includes("Apie penkias minutes"),false);

  const m2=createModule52();
  assert.equal(txt(m2).includes("Geležinkelio stotis"),false);
  assert.ok(txt(m2).includes("Traukinių stotis yra ten. Eikite tiesiai."));
  assert.equal(txt(m2).includes("čia pat"),false);
  assert.equal(txt(m2).includes("netoli viešbučio"),false);
  assert.ok(txt(m2).includes("Kavinė yra ten."));
  assert.equal(txt(m2).includes("Kavinė yra ten. Viešbutis yra netoli."),false);
  const recognition=m2.lessons.find(l=>l.code==="5.2.5").blocks.find(b=>b.id==="s5m2l5_b5_v2");
  assert.equal(recognition.steps[0].speakerText,"Laba diena!");
  assert.match(recognition.steps[0].sceneDirection,/hotel address/i);

  const m3=createModule53();
  const going=m3.lessons.find(l=>l.code==="5.3.1").blocks.find(b=>b.id==="s5m3l1_b6_v2");
  assert.ok(JSON.stringify(going).includes("Ačiū! Ar toli?"));
  assert.equal(JSON.stringify(going).includes("Ar žinai"),false);
  assert.equal(JSON.stringify(going).includes("Manau"),false);
  const cp=m3.lessons.find(l=>l.code==="5.3.C").blocks.find(b=>b.id==="s5m3c_b6_v2");
  assert.equal(cp.steps[0].options.find(o=>o.result==="best").text,"Labas! Einu į kavinę.");
  assert.equal(cp.steps[1].speakerText,"Iš kur eini?");

  const m4=createModule54();
  assert.equal(txt(m4).includes("Ko ieškote?"),false);
  assert.equal(txt(m4).includes("Geriau važiuokite autobusu"),false);
  assert.ok(txt(m4).includes("Galite važiuoti autobusu."));
});

test("Section 5 clarifies police context and uses the common train-station term",()=>{
 const m=createModule52();
 const cp=m.lessons.find(l=>l.code==="5.2.C");
 const police=cp.blocks.find(b=>b.id==="s5m2c_b3");
 assert.match(police.prompt,/wallet has been stolen/);
 assert.equal(police.options.find(o=>o.isCorrect).text,"policija");
 assert.ok(txt(m).includes("traukinių stotis"));
});

test("Section 5 uses išeinu for explicitly leaving the hotel",()=>{
 const m=createModule53();
 assert.ok(txt(m).includes("Aš išeinu iš viešbučio."));
 assert.equal(txt(m).includes("Aš einu iš viešbučio."),false);
});

test("Section 5 added response alternatives remain natural and correctly cased",()=>{
  const all=JSON.stringify([createModule51(),createModule52(),createModule53(),createModule54(),createCheckpoint5()]);
  assert.equal(all.includes("Atsiprašau, Kur"),false);
  assert.equal(all.includes("Atsiprašau, Kaip"),false);
  assert.equal(all.includes("Tiesiai, prašau?"),false);
  assert.equal(all.includes('"einu į viešbutį."'),false);
});

test("Section 5 scenario options do not contain punctuation-only duplicates",()=>{
  const units=[createModule51(),createModule52(),createModule53(),createModule54(),createCheckpoint5()];
  const norm=s=>(s||"").toLowerCase().replace(/[.!?…,:;—–-]/g,"").replace(/\s+/g," ").trim();
  for(const unit of units){
    const lessons=unit.lessons||[{code:unit.code,blocks:unit.blocks||[]}];
    for(const lesson of lessons){
      for(const scenario of (lesson.blocks||[]).filter(b=>b.type==="scenario_v2")){
        for(const step of scenario.steps||[]){
          const values=(step.options||[]).map(o=>norm(o.text));
          assert.equal(new Set(values).size,values.length,`${lesson.code} ${scenario.id}/${step.id}`);
        }
      }
    }
  }
});

test("Section 5 scenario turns do not collapse to two-button choices",()=>{
  for(const unit of [createModule51(),createModule52(),createModule53(),createModule54(),createCheckpoint5()]){
    const lessons=unit.lessons||[{code:unit.code,blocks:unit.blocks||[]}];
    for(const lesson of lessons){
      for(const scenario of (lesson.blocks||[]).filter(b=>b.type==="scenario_v2")){
        for(const step of scenario.steps||[]) assert.ok(step.options.length>=3,`${lesson.code} ${scenario.id}/${step.id}`);
      }
    }
  }
});

test("Section 5 uses authored help and only narrow visible support for weakly introduced vocabulary",()=>{
 const visible=[];
 for(const unit of [createModule51(),createModule52(),createModule53(),createModule54(),createCheckpoint5()]){
   for(const s of scenarios(unit)){
     for(const step of s.steps||[]){
       if(step.supportText) visible.push(step.supportText);
       for(const o of step.options||[]){
         assert.equal(/nesuprantu/i.test(o.text||""),false,s.id);
       }
     }
   }
 }
 assert.deepEqual(visible,[
   "geros kelionės — have a good journey",
   "geros kelionės — have a good journey",
 ]);
 const final=createCheckpoint5().blocks.find(b=>b.id==="s5cp_b8_v2");
 assert.equal(final.steps[1].help.levels.at(-1).spokenLanguage,"en");
 assert.equal(final.steps[1].help.levels.at(-1).audio,false);
});

test("Section 5 final checkpoint is a coherent street route and uses Ar toli",()=>{
 const cp=createCheckpoint5();
 const s=cp.blocks.find(b=>b.id==="s5cp_b8_v2");
 assert.equal(s.location,"street outside the bus station");
 assert.equal(s.participants[0].role,"passer-by");
 assert.equal(s.steps[1].options.find(o=>o.result==="best").text,"Suprantu. Ar toli?");
 assert.match(s.steps[2].speakerText,/penkios minutės/);
});


test("Section 5 keeps future place vocabulary out of 5.1 production",()=>{
  const m1=createModule51();
  const s=txt(m1);
  assert.equal(s.includes("autobusų stotis"),false);
  assert.equal(s.includes("traukinių stotis"),false);
  assert.equal(s.includes("Kur yra vaistinė"),false);
  assert.ok(s.includes("autobusų stotelė"));
  assert.ok(s.includes("Kur yra bankas"));

  const m2=createModule52();
  const later=txt(m2);
  assert.ok(later.includes("autobusų stotis"));
  assert.ok(later.includes("traukinių stotis"));
  assert.ok(later.includes("vaistinė"));
});

test("5.3.3 practises only the in-forms taught in that lesson",()=>{
  const m=createModule53();
  const scenario=m.lessons.find(l=>l.code==="5.3.3").blocks.find(b=>b.id==="s5m3l3_b6_v2");
  assert.equal(scenario.steps[0].options.find(o=>o.result==="best").text,"Labas! Esu viešbutyje.");
  assert.equal(scenario.steps[1].speakerText,"Aš esu kavinėje.");
  assert.equal(scenario.steps[1].options.find(o=>o.result==="best").text,"Gerai! Einu į kavinę.");
  assert.equal(JSON.stringify(scenario).includes("stotyje"),false);
});

test("5.3 checkpoint match pairs contain taught or deliberately reviewed language",()=>{
  const m=createModule53();
  const cp=m.lessons.find(l=>l.code==="5.3.C");
  const pairs=cp.blocks.find(b=>b.id==="s5m3c_b7").pairs.map(p=>p.lt);
  for(const removed of ["Geros kelionės!","Iki pasimatymo.","prie stoties","Savaitę."]){
    assert.equal(pairs.includes(removed),false,removed);
  }
  for(const expected of ["Aš išeinu iš viešbučio.","Kur mes einame?","Aš einu į vaistinę.","Ar toli?"]){
    assert.ok(pairs.includes(expected),expected);
  }
});

test("5.3.5 retrieves the in-form after an explicit time jump",()=>{
  const m=createModule53();
  const lesson=m.lessons.find(l=>l.code==="5.3.5");
  const scenario=lesson.blocks.find(b=>b.id==="s5m3l5_b5_v2");
  assert.equal(txt(lesson).includes("Savaitę"),false);
  assert.equal(scenario.steps[2].speakerText,"Dabar viešbutyje?");
  assert.match(scenario.steps[2].sceneDirection,/Later, after you arrive/i);
  assert.equal(scenario.steps[2].options.find(o=>o.result==="best").text,"Taip, viešbutyje.");
});


test("Lithuanian best-response answers in Section 5 keep option audio enabled",()=>{
  const all=[
    ...createModule51().lessons.flatMap(l=>l.blocks),
    ...createModule52().lessons.flatMap(l=>l.blocks),
    ...createModule54().lessons.flatMap(l=>l.blocks),
    ...createCheckpoint5().blocks,
  ];
  for(const id of ["s5m1l2_b5","s5m1c_b3","s5m2l2_b4","s5m2l3_b4","s5m4l4_b3","s5m4l5_b2","s5cp_b6"]){
    const block=all.find(b=>b.id===id);
    assert.ok(block,id);
    assert.equal(block.noOptionAudio,undefined,id);
  }
});


test("5.1.2 tests here/there through place plus position rather than trivial one-word elimination",()=>{
  const m=createModule51();
  const lesson=m.lessons.find(l=>l.code==="5.1.2");
  const b3=lesson.blocks.find(b=>b.id==="s5m1l2_b3");
  const b4=lesson.blocks.find(b=>b.id==="s5m1l2_b4");
  const b5=lesson.blocks.find(b=>b.id==="s5m1l2_b5");
  const scenario=lesson.blocks.find(b=>b.id==="s5m1l2_b6_v2");

  assert.equal(b3.options.find(o=>o.isCorrect).text,"Viešbutis yra ten.");
  assert.equal(b4.options.find(o=>o.isCorrect).text,"Tualetas yra čia.");
  assert.match(b4.prompt.text,/door immediately beside you/i);
  assert.equal(b5.options.find(o=>o.isCorrect).text,"The hotel is across the street.");
  assert.match(b5.prompt.audioText,/Viešbutis yra ten/);

  assert.equal(scenario.participants.length,2);
  assert.equal(scenario.steps.length,4);
  assert.equal(scenario.steps[0].options.find(o=>o.result==="best").text,"Viešbutis yra ten.");
  assert.equal(scenario.steps[1].options.find(o=>o.result==="best").text,"Kavinė yra čia.");
  assert.equal(scenario.steps[2].options.filter(o=>o.progresses!==false).length,2);
  assert.equal(scenario.steps[3].options.find(o=>o.result==="best").text,"Ten. Ačiū labai!");

  const serialized=JSON.stringify(lesson);
  assert.equal(serialized.includes('"text":"Ten.","isCorrect":true'),false);
  assert.equal(serialized.includes('"text":"Ačiū.","isCorrect":false'),false);
});


test("5.1.4 teaches left/right bases before directional forms",()=>{
  const m=createModule51();
  const lesson=m.lessons.find(l=>l.code==="5.1.4");
  const learn=lesson.blocks.find(b=>b.id==="s5m1l4_b1");
  const items=learn.items.map(i=>i.lt);

  assert.deepEqual(items,["kairė","dešinė","tiesiai","paskui"]);
  assert.equal(items.includes("kairėn"),false);
  assert.equal(items.includes("dešinėn"),false);
  assert.equal(items.includes("Pasukite kairėn."),false);
  assert.equal(items.includes("Pasukite dešinėn."),false);

  assert.match(lesson.notes.pattern,/kairė means left \/ the left side/i);
  assert.match(lesson.notes.pattern,/dešinė means right \/ the right side/i);
  assert.match(lesson.notes.pattern,/kairėn — to the left/i);
  assert.match(lesson.notes.pattern,/dešinėn — to the right/i);
  assert.ok(lesson.notes.usage.includes("kairė → kairėn — left → to the left"));
  assert.ok(lesson.notes.usage.includes("dešinė → dešinėn — right → to the right"));

  // Later blocks continue to test the full movement phrases.
  assert.equal(lesson.blocks.find(b=>b.id==="s5m1l4_b2").prompt.text,"Pasukite kairėn.");
  assert.equal(lesson.blocks.find(b=>b.id==="s5m1l4_b4").options.find(o=>o.isCorrect).text,"dešinėn");
  assert.equal(lesson.blocks.find(b=>b.id==="s5m1l4_b5").targetText,"Eikite tiesiai");
});


test("5.1.5 location gap gives enough context to choose ten",()=>{
  const m=createModule51();
  const lesson=m.lessons.find(l=>l.code==="5.1.5");
  const block=lesson.blocks.find(b=>b.id==="s5m1l5_b3");

  assert.match(block.prompt,/hotel is just across the street/i);
  assert.match(block.prompt,/points directly at it/i);
  assert.equal(block.options.find(o=>o.isCorrect).text,"ten");
  assert.match(block.explanation,/čia would mean here/i);
  assert.match(block.explanation,/toli would mean far/i);
  assert.match(block.explanation,/only across the street/i);
});


test("5.1 checkpoint speaking block synthesises location and distance instead of repeating the earlier bank prompt",()=>{
  const m=createModule51();
  const checkpoint=m.lessons.find(l=>l.code==="5.1.C");
  const speak=checkpoint.blocks.find(b=>b.id==="s5m1c_b5");

  assert.match(speak.prompt,/need the station/i);
  assert.match(speak.prompt,/ask where it is/i);
  assert.match(speak.prompt,/if it's far/i);
  assert.equal(speak.targetText,"Atsiprašau, kur yra stotis? Ar toli?");
  assert.equal(speak.audioText,"Atsiprašau, kur yra stotis? Ar toli?");
  assert.notEqual(speak.targetText,"Kur yra bankas");

  const lesson5=m.lessons.find(l=>l.code==="5.1.5");
  assert.equal(lesson5.blocks.find(b=>b.id==="s5m1l5_b5").targetText,"Kur yra bankas");
});


test("5.1 checkpoint ends after the server's final goodbye without forcing another learner response",()=>{
  const m=createModule51();
  const checkpoint=m.lessons.find(l=>l.code==="5.1.C");
  const scenario=checkpoint.blocks.find(b=>b.id==="s5m1c_b6_v2");

  assert.equal(scenario.steps.length,3);
  const finalStep=scenario.steps.at(-1);
  assert.equal(finalStep.speakerText,"Ne, tai netoli. Penkios minutės.");
  assert.equal(finalStep.options.find(o=>o.result==="best").text,"Ačiū labai! Viso gero.");
  assert.ok(finalStep.finalSystemLine);
  assert.equal(finalStep.finalSystemLine.speakerText,"Prašom. Geros kelionės!");
  assert.equal(finalStep.finalSystemLine.supportText,"geros kelionės — have a good journey");
  assert.match(finalStep.finalSystemLine.sceneDirection,/exchange ends/i);
  assert.equal(scenario.steps.some(s=>s.speakerText==="Prašom. Geros kelionės!"),false);
});


test("5.2.3 cafe scenario asks distance only after distance is still unknown",()=>{
  const m=createModule52();
  const lesson=m.lessons.find(l=>l.code==="5.2.3");
  const scenario=lesson.blocks.find(b=>b.id==="s5m2l3_b6_v2");
  const step2=scenario.steps.find(s=>s.id==="step_2");
  const step3=scenario.steps.find(s=>s.id==="step_3");

  assert.equal(step2.speakerText,"Kavinė yra ten.");
  assert.match(step2.sceneDirection,/has not said how far/i);
  assert.match(step2.learnerPrompt,/Ask if it is far/i);
  assert.equal(step2.options.find(o=>o.result==="best").text,"Ačiū! Ar toli?");
  assert.equal(step2.options.find(o=>o.text==="Ačiū!").result,"awkward");
  assert.equal(step3.speakerText,"Ne, tai netoli. Eikite tiesiai.");
  assert.equal(JSON.stringify(scenario).includes("Viešbutis yra netoli."),false);
});


test("5.2.4 hotel question requires phrase construction rather than copying the shown base word",()=>{
  const m=createModule52();
  const lesson=m.lessons.find(l=>l.code==="5.2.4");
  const block=lesson.blocks.find(b=>b.id==="s5m2l4_b2");

  assert.equal(block.type,"build_phrase");
  assert.match(block.prompt.text,/Politely ask: Where is the hotel\?/i);
  assert.equal(block.answerText,"Atsiprašau, kur yra viešbutis?");
  assert.deepEqual(
    block.tokens.filter(t=>Number.isInteger(t.correctIndex)).map(t=>t.text),
    ["Atsiprašau,","kur","yra","viešbutis?"]
  );
  assert.ok(block.tokens.some(t=>t.text==="bankas?" && t.isDistractor));
  assert.ok(block.tokens.some(t=>t.text==="toli?" && t.isDistractor));
  assert.equal(JSON.stringify(block).includes("viešbučio"),false);
  assert.equal(JSON.stringify(block).includes("viešbutyje"),false);
});


test("5.2.5 explicitly bridges vaistai to vaistų before testing pharmacy context",()=>{
  const m=createModule52();
  const lesson=m.lessons.find(l=>l.code==="5.2.5");
  const teach=lesson.blocks.find(b=>b.id==="s5m2l5_b2");
  const apply=lesson.blocks.find(b=>b.id==="s5m2l5_b4");

  assert.equal(teach.type,"learn");
  assert.deepEqual(
    teach.items.map(i=>i.lt),
    ["vaistai","vaistų","Man reikia vaistų.","Kur yra vaistinė?"]
  );
  assert.match(lesson.notes.pattern,/already know vaistai/i);
  assert.match(lesson.notes.pattern,/After reikia.*vaistų/i);
  assert.match(lesson.notes.pattern,/useful chunk rather than a grammar table/i);

  assert.equal(apply.type,"best_response");
  assert.match(apply.prompt.text,/man reikia vaistų/i);
  assert.equal(apply.options.find(o=>o.isCorrect).text,"Kur yra vaistinė?");
  assert.ok(apply.options.some(o=>o.text==="Kur yra ligoninė?"));
  assert.equal(JSON.stringify(lesson).includes('"type":"conversation_turn_fill","scene_label":"In the street"'),false);
});


test("5.2 checkpoint speaking task synthesises place and distance instead of repeating bus station",()=>{
  const m=createModule52();
  const checkpoint=m.lessons.find(l=>l.code==="5.2.C");
  const speak=checkpoint.blocks.find(b=>b.id==="s5m2c_b4");

  assert.match(speak.prompt,/Politely ask where the train station is/i);
  assert.match(speak.prompt,/ask if it's far/i);
  assert.equal(speak.targetText,"Atsiprašau, kur yra traukinių stotis? Ar toli?");
  assert.equal(speak.audioText,"Atsiprašau, kur yra traukinių stotis? Ar toli?");

  const firstLesson=m.lessons.find(l=>l.code==="5.2.1");
  assert.equal(firstLesson.blocks.find(b=>b.id==="s5m2l1_b5").targetText,"Kur yra autobusų stotis");
  assert.notEqual(speak.targetText,firstLesson.blocks.find(b=>b.id==="s5m2l1_b5").targetText);
});

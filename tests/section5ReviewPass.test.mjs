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
  assert.equal(cp.steps[2].speakerText,"Kur tu esi?");
  assert.equal(cp.steps[2].options.find(o=>o.result==="best").text,"Aš esu kavinėje.");

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

test("Section 5 uses išeinu for explicitly leaving home",()=>{
 const m=createModule53();
 assert.ok(txt(m).includes("Aš išeinu iš namų."));
 assert.equal(txt(m).includes("Aš einu iš namų."),false);
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
 assert.equal(s.steps[1].options.find(o=>o.result==="best").text,"Tiesiai, paskui dešinėn? Ar toli?");
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
  assert.equal(scenario.steps[0].options.find(o=>o.result==="best").text,"Labas! Aš esu viešbutyje.");
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
  for(const expected of ["Aš išeinu iš namų.","Kur mes einame?","Einu namo.","Ar ieškote viešbučio?"]){
    assert.ok(pairs.includes(expected),expected);
  }
});

test("5.3.5 uses one clear journey to test to, from and in",()=>{
  const m=createModule53();
  const lesson=m.lessons.find(l=>l.code==="5.3.5");
  const scenario=lesson.blocks.find(b=>b.id==="s5m3l5_b5_v2");

  assert.equal(scenario.title,"Finding the hotel");
  assert.match(scenario.sceneIntro,/outside the station/i);
  assert.match(scenario.sceneIntro,/leaving the station for the hotel/i);

  assert.equal(scenario.steps[0].speakerText,"Ar ieškote viešbučio?");
  assert.equal(scenario.steps[0].options.find(o=>o.result==="best").text,"Taip. Aš einu į viešbutį.");

  assert.equal(scenario.steps[1].speakerText,"Iš stoties?");
  assert.equal(scenario.steps[1].options.find(o=>o.result==="best").text,"Taip, iš stoties.");

  assert.equal(scenario.steps[2].speakerText,"Kur jūs esate?");
  assert.match(scenario.steps[2].sceneDirection,/arrived at the hotel/i);
  assert.equal(scenario.steps[2].options.find(o=>o.result==="best").text,"Aš esu viešbutyje.");

  assert.equal(JSON.stringify(scenario).includes("Your starting point is the station."),false);
  assert.equal(JSON.stringify(scenario).includes("O iš kur jūs einate?"),false);
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


test("5.1.5 location task uses a full meaningful response instead of a one-word dialogue gap",()=>{
  const m=createModule51();
  const lesson=m.lessons.find(l=>l.code==="5.1.5");
  const block=lesson.blocks.find(b=>b.id==="s5m1l5_b3");

  assert.equal(block.type,"best_response");
  assert.match(block.prompt.text,/hotel is just across the street/i);
  assert.match(block.prompt.text,/points directly at it/i);
  assert.equal(block.options.find(o=>o.isCorrect).text,"Viešbutis yra ten.");
  assert.ok(block.options.some(o=>o.text==="Viešbutis yra čia."));
  assert.ok(block.options.some(o=>o.text==="Viešbutis yra toli."));
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


test("Section 5 avoids conversation-turn blank filling in favour of fuller recognition or production",()=>{
  const modules=[createModule51(),createModule52(),createModule53(),createModule54()];
  const allBlocks=modules.flatMap(m=>m.lessons.flatMap(l=>l.blocks));

  assert.equal(allBlocks.some(b=>b.type==="conversation_turn_fill"),false);

  const m2=createModule52();
  const cp2=m2.lessons.find(l=>l.code==="5.2.C");
  const routeBuild=cp2.blocks.find(b=>b.id==="s5m2c_b5");
  assert.equal(routeBuild.type,"build_phrase");
  assert.equal(routeBuild.answerText,"Parduotuvė yra ten. Eikite tiesiai.");

  const m3=createModule53();
  assert.equal(m3.lessons.find(l=>l.code==="5.3.4").blocks.find(b=>b.id==="s5m3l4_b3").type,"best_response");
  assert.equal(m3.lessons.find(l=>l.code==="5.3.C").blocks.find(b=>b.id==="s5m3c_b5").type,"build_phrase");

  const m4=createModule54();
  assert.equal(m4.lessons.find(l=>l.code==="5.4.2").blocks.find(b=>b.id==="s5m4l2_b3").type,"best_response");
  assert.equal(m4.lessons.find(l=>l.code==="5.4.5").blocks.find(b=>b.id==="s5m4l5_b3").type,"listen_mcq");
  assert.equal(m4.lessons.find(l=>l.code==="5.4.C").blocks.find(b=>b.id==="s5m4c_b5").type,"build_phrase");
});


test("5.2 checkpoint excludes untaught Ar ieškote and keeps only reviewed language",()=>{
  const m=createModule52();
  const cp=m.lessons.find(l=>l.code==="5.2.C");
  const pairs=cp.blocks.find(b=>b.id==="s5m2c_b7").pairs.map(p=>p.lt);

  assert.equal(pairs.includes("Ar ieškote…?"),false);
  assert.equal(pairs.some(p=>p.startsWith("Ar ieškote")),false);
  assert.ok(pairs.includes("Man reikia vaistų."));
  assert.equal(pairs.length,20);
});

test("5.3.5 introduces Ar ieškote only after viešbučio is already familiar",()=>{
  const m=createModule53();
  const lesson=m.lessons.find(l=>l.code==="5.3.5");
  const teach=lesson.blocks.find(b=>b.id==="s5m3l5_b1");
  const listen=lesson.blocks.find(b=>b.id==="s5m3l5_b1_listen");

  assert.equal(lesson.newLanguageLoad,"low");
  assert.deepEqual(teach.items.map(i=>i.lt),["ieškoti","ieškote","Ar ieškote viešbučio?"]);
  assert.match(lesson.notes.pattern,/already know viešbučio from iš viešbučio/i);
  assert.match(lesson.notes.pattern,/useful travel pattern rather than another grammar table/i);

  assert.equal(listen.type,"listen_mcq");
  assert.equal(listen.prompt.text,"Ar ieškote viešbučio?");
  assert.equal(listen.options.find(o=>o.isCorrect).text,"Are you looking for the hotel?");
  assert.ok(listen.options.some(o=>o.text==="Are you going to the hotel?"));
  assert.ok(listen.options.some(o=>o.text==="Are you coming from the hotel?"));

  const cp=m.lessons.find(l=>l.code==="5.3.C");
  const pairs=cp.blocks.find(b=>b.id==="s5m3c_b7").pairs.map(p=>p.lt);
  assert.ok(pairs.includes("Ar ieškote viešbučio?"));
});


test("5.3 early form practice avoids unseen-form distractors and uses fuller production",()=>{
  const m=createModule53();

  const l1=m.lessons.find(l=>l.code==="5.3.1");
  const toStation=l1.blocks.find(b=>b.id==="s5m3l1_b3");
  assert.equal(toStation.type,"build_phrase");
  assert.equal(toStation.answerText,"Aš einu į stotį.");
  assert.equal(JSON.stringify(toStation).includes("stoties"),false);

  const l3=m.lessons.find(l=>l.code==="5.3.3");
  const inCafe=l3.blocks.find(b=>b.id==="s5m3l3_b3");
  const inCity=l3.blocks.find(b=>b.id==="s5m3l3_b4");
  assert.equal(inCafe.type,"build_phrase");
  assert.equal(inCafe.answerText,"Ji yra kavinėje.");
  assert.equal(JSON.stringify(inCafe).includes("kavinės"),false);
  assert.equal(inCity.type,"best_response");
  assert.equal(inCity.options.find(o=>o.isCorrect).text,"Aš esu mieste.");
  assert.equal(JSON.stringify(inCity).includes("miesto"),false);
  assert.equal(JSON.stringify(inCity).includes("miestą"),false);

  const cp=m.lessons.find(l=>l.code==="5.3.C");
  const cpLocation=cp.blocks.find(b=>b.id==="s5m3c_b2");
  assert.equal(cpLocation.type,"best_response");
  assert.equal(cpLocation.options.find(o=>o.isCorrect).text,"Mes esame kavinėje.");
  assert.match(cpLocation.prompt.text,/Mes einame į kavinę/);
  assert.match(cpLocation.prompt.text,/You have arrived/);
  assert.equal(cpLocation.prompt.text.includes("inside a café"),false);
  assert.ok(cpLocation.options.some(o=>o.text==="Mes einame į kavinę." && !o.isCorrect));
  assert.ok(cpLocation.options.some(o=>o.text==="Mes esame viešbutyje." && !o.isCorrect));
  assert.equal(JSON.stringify(cpLocation).includes("kavinės"),false);
});


test("Section 5 replaces remaining base-word form guessing with useful full-language practice",()=>{
  const units=[createModule51(),createModule52(),createModule53(),createModule54(),createCheckpoint5()];
  const allBlocks=units.flatMap(unit=>(unit.lessons||[{blocks:unit.blocks||[]}]).flatMap(l=>l.blocks||[]));
  assert.equal(allBlocks.some(b=>b.type==="choose_correct_form"),false);

  const m=createModule53();
  const fromLesson=m.lessons.find(l=>l.code==="5.3.2");
  const fromTask=fromLesson.blocks.find(b=>b.id==="s5m3l2_b3");
  assert.equal(fromTask.type,"best_response");
  assert.equal(fromTask.options.find(o=>o.isCorrect).text,"Iš stoties. Einu į viešbutį.");
  assert.equal(JSON.stringify(fromTask).includes("base_word"),false);

  const patternLesson=m.lessons.find(l=>l.code==="5.3.5");
  const speak=patternLesson.blocks.find(b=>b.id==="s5m3l5_b2");
  const use=patternLesson.blocks.find(b=>b.id==="s5m3l5_b3");
  assert.equal(speak.type,"speak_self_check");
  assert.equal(speak.targetText,"Ar ieškote viešbučio");
  assert.equal(use.type,"best_response");
  assert.equal(use.options.find(o=>o.isCorrect).text,"Ar ieškote viešbučio?");

  const final=createCheckpoint5().blocks.find(b=>b.id==="s5cp_b3");
  assert.equal(final.type,"build_phrase");
  assert.equal(final.answerText,"Kaip man nusigauti į stotį?");
  assert.deepEqual(
    final.tokens.filter(t=>Number.isInteger(t.correctIndex)).map(t=>t.text),
    ["Kaip","man","nusigauti","į","stotį?"]
  );
});


test("Future Section 5 scenarios are grounded and use plausible near-miss choices",()=>{
  const m3=createModule53();
  const m4=createModule54();
  const final=createCheckpoint5();
  const future=[
    ...m3.lessons.filter(l=>["5.3.2","5.3.3","5.3.4","5.3.5","5.3.C"].includes(l.code)).flatMap(l=>l.blocks.filter(b=>b.type==="scenario_v2")),
    ...m4.lessons.flatMap(l=>l.blocks.filter(b=>b.type==="scenario_v2")),
    ...final.blocks.filter(b=>b.type==="scenario_v2"),
  ];
  const fillerWrong=new Set(["Viso gero.","Atsiprašau.","Laba diena.","Ne, ačiū.","Per brangu.","Kiek tai kainuoja?"]);
  for(const scenario of future){
    assert.notEqual(scenario.sceneIntro,"The exchange begins.",scenario.id);
    for(const step of scenario.steps){
      assert.notEqual(step.sceneDirection,"The exchange begins.",scenario.id+"/"+step.id);
      assert.notEqual(step.sceneDirection,"The conversation continues.",scenario.id+"/"+step.id);
      assert.equal(/^Choose the most natural response\.?$/i.test(step.learnerPrompt||""),false,scenario.id+"/"+step.id);
      for(const option of step.options.filter(o=>o.result==="wrong")){
        assert.equal(fillerWrong.has(option.text),false,scenario.id+"/"+step.id+" "+option.text);
      }
    }
  }

  const fromHotel=m3.lessons.find(l=>l.code==="5.3.2").blocks.find(b=>b.id==="s5m3l2_b5_v2");
  assert.match(fromHotel.sceneIntro,/left your hotel/i);
  assert.match(fromHotel.sceneIntro,/walking to the station/i);
  assert.deepEqual(
    fromHotel.steps[0].options.map(o=>o.text),
    [
      "Labas! Iš viešbučio. Einu į stotį.",
      "Labas! Iš stoties. Einu į viešbutį.",
      "Labas! Viešbutyje. Einu į stotį.",
    ]
  );

  const giveRoute=m4.lessons.find(l=>l.code==="5.4.3").blocks.find(b=>b.id==="s5m4l3_b6_v2");
  assert.match(giveRoute.sceneIntro,/straight ahead, then left/i);
  assert.equal(giveRoute.steps[0].options.find(o=>o.result==="best").text,"Eikite tiesiai, paskui pasukite kairėn.");

  const finalScenario=final.blocks.find(b=>b.id==="s5cp_b8_v2");
  assert.equal(finalScenario.steps[1].options.find(o=>o.result==="best").text,"Tiesiai, paskui dešinėn? Ar toli?");
  assert.ok(finalScenario.steps[1].options.some(o=>o.text==="Tiesiai, paskui kairėn? Ar toli?" && o.result==="wrong"));
});


test("5.3.3 teaches the base noun miestas before using mieste",()=>{
  const m=createModule53();
  const lesson=m.lessons.find(l=>l.code==="5.3.3");
  const learn=lesson.blocks.find(b=>b.id==="s5m3l3_b1");
  assert.equal(learn.items[0].lt,"miestas");
  assert.equal(learn.items[0].en,"city");
  assert.equal(learn.items.some(i=>i.lt==="mieste"),false);
  assert.ok(learn.items.some(i=>i.lt==="Aš esu mieste."));
  assert.match(lesson.notes.pattern,/base place word before learning a changed form/i);
  assert.match(lesson.notes.pattern,/Miestas means city/i);
  assert.match(lesson.notes.pattern,/Aš esu mieste/i);
});

test("Remaining Section 5 transformed place forms have had their base nouns introduced first",()=>{
  const earlier=createModule52();
  const earlierText=JSON.stringify(earlier);
  for(const base of ["viešbutis","kavinė","stotis","vaistinė","stotelė","oro uostas"]){
    assert.ok(earlierText.includes(base),base);
  }
  const m3=createModule53();
  const cityLesson=m3.lessons.find(l=>l.code==="5.3.3");
  assert.equal(cityLesson.blocks.find(b=>b.id==="s5m3l3_b1").items[0].lt,"miestas");
});


test("5.3 teaches the useful home forms in semantic order",()=>{
  const m=createModule53();
  const from=m.lessons.find(l=>l.code==="5.3.2");
  const inside=m.lessons.find(l=>l.code==="5.3.3");
  const going=m.lessons.find(l=>l.code==="5.3.4");

  const fromLearn=from.blocks.find(b=>b.id==="s5m3l2_b1").items;
  assert.equal(fromLearn[0].lt,"namai");
  assert.equal(fromLearn[0].en,"home");
  assert.ok(fromLearn.some(i=>i.lt==="iš namų"));
  assert.ok(fromLearn.some(i=>i.lt==="Aš išeinu iš namų."));

  const inLearn=inside.blocks.find(b=>b.id==="s5m3l3_b1").items;
  assert.ok(inLearn.some(i=>i.lt==="namuose" && i.en==="at home"));
  assert.ok(inLearn.some(i=>i.lt==="Aš esu namuose."));

  const goLearn=going.blocks.find(b=>b.id==="s5m3l4_b1").items;
  assert.ok(goLearn.some(i=>i.lt==="Einu namo."));
  const answer=going.blocks.find(b=>b.id==="s5m3l4_b3");
  assert.equal(answer.options.find(o=>o.isCorrect).text,"Einu namo.");
  assert.ok(answer.options.some(o=>o.text==="Einu iš namų." && !o.isCorrect));
  assert.ok(answer.options.some(o=>o.text==="Aš esu namuose." && !o.isCorrect));

  const scenario=going.blocks.find(b=>b.id==="s5m3l4_b6_v2");
  assert.match(scenario.sceneIntro,/heading home/i);
  assert.equal(scenario.steps[0].options.find(o=>o.result==="best").text,"Labas! Einu namo.");
  assert.ok(scenario.steps[0].options.some(o=>o.text==="Labas! Aš esu namuose." && o.result==="wrong"));
  assert.ok(scenario.steps[0].options.some(o=>o.text==="Labas! Einu iš namų." && o.result==="wrong"));
  assert.equal(scenario.steps[1].speakerText,"Kur tu esi?");
  assert.equal(scenario.steps[1].sceneDirection,"Later, you have arrived home.");
  assert.equal(scenario.steps[1].options.find(o=>o.result==="best").text,"Aš esu namuose.");
  assert.ok(scenario.steps[1].options.some(o=>o.text==="Einu namo." && o.result==="wrong"));
  assert.ok(scenario.steps[1].options.some(o=>o.text==="Einu iš namų." && o.result==="wrong"));

  const checkpoint=m.lessons.find(l=>l.code==="5.3.C");
  const pairs=checkpoint.blocks.find(b=>b.id==="s5m3c_b7").pairs.map(p=>p.lt);
  for(const expected of ["namai","iš namų","Aš išeinu iš namų.","Aš esu namuose.","Einu namo."]){
    assert.ok(pairs.includes(expected),expected);
  }

  assert.equal(JSON.stringify(m).includes("į namo"),false);
});


test("Future Section 5 scenarios do not make learners infer a subjective far/near threshold",()=>{
  const m3=createModule53();
  const m4=createModule54();
  const final=createCheckpoint5();
  const future=[
    ...m3.lessons.filter(l=>["5.3.4","5.3.5","5.3.C"].includes(l.code)).flatMap(l=>l.blocks.filter(b=>b.type==="scenario_v2")),
    ...m4.lessons.flatMap(l=>l.blocks.filter(b=>b.type==="scenario_v2")),
    ...final.blocks.filter(b=>b.type==="scenario_v2"),
  ];

  for(const scenario of future){
    for(const step of scenario.steps||[]){
      const speaker=step.speakerText||"";
      if(!/toli\?/i.test(speaker)) continue;
      const optionText=(step.options||[]).map(o=>o.text||"").join(" ");
      const asksLearnerToClassify=/netoli/i.test(optionText) && /labai toli|per toli/i.test(optionText);
      assert.equal(asksLearnerToClassify,false,scenario.id+"/"+step.id);
    }
  }

  const home=m3.lessons.find(l=>l.code==="5.3.4").blocks.find(b=>b.id==="s5m3l4_b6_v2");
  assert.equal(home.steps[1].speakerText,"Kur tu esi?");
  assert.equal(home.steps[1].options.find(o=>o.result==="best").text,"Aš esu namuose.");

  const checkpoint=m3.lessons.find(l=>l.code==="5.3.C").blocks.find(b=>b.id==="s5m3c_b6_v2");
  assert.equal(checkpoint.steps[2].speakerText,"Kur tu esi?");
  assert.equal(checkpoint.steps[2].options.find(o=>o.result==="best").text,"Aš esu kavinėje.");
});


test("5.3 keeps location answers on the explicitly taught Aš esu pattern",()=>{
  const m=createModule53();
  const json=JSON.stringify(m);
  for(const hidden of ["Esu namuose.","Esu kavinėje.","Esu viešbutyje.","Esu mieste."]){
    assert.equal(json.includes('\"'+hidden),false,hidden);
  }

  const l3=m.lessons.find(l=>l.code==="5.3.3");
  const l3Scenario=l3.blocks.find(b=>b.id==="s5m3l3_b6_v2");
  assert.equal(l3Scenario.steps[0].options.find(o=>o.result==="best").text,"Labas! Aš esu viešbutyje.");

  const l4=m.lessons.find(l=>l.code==="5.3.4");
  const home=l4.blocks.find(b=>b.id==="s5m3l4_b6_v2");
  assert.equal(home.steps[1].options.find(o=>o.result==="best").text,"Aš esu namuose.");

  const cp=m.lessons.find(l=>l.code==="5.3.C").blocks.find(b=>b.id==="s5m3c_b6_v2");
  assert.equal(cp.steps[2].options.find(o=>o.result==="best").text,"Aš esu kavinėje.");
});


test("5.3 checkpoint location question cannot be solved by English place matching alone",()=>{
  const m=createModule53();
  const cp=m.lessons.find(l=>l.code==="5.3.C");
  const block=cp.blocks.find(b=>b.id==="s5m3c_b2");
  assert.equal(block.title,"From movement to location");
  assert.match(block.prompt.text,/Mes einame į kavinę/);
  assert.match(block.prompt.text,/Kur jūs esate/);
  assert.equal(/inside a café|you are in a café/i.test(block.prompt.text),false);
  assert.deepEqual(
    block.options.map(o=>o.text),
    ["Mes esame kavinėje.","Mes einame į kavinę.","Mes esame viešbutyje."]
  );
});


test("5.3 checkpoint match pairs are grouped into semantic reinforcement sets",()=>{
  const m=createModule53();
  const cp=m.lessons.find(l=>l.code==="5.3.C");
  const block=cp.blocks.find(b=>b.id==="s5m3c_b7");

  assert.equal(block.title,"Match by pattern");
  assert.equal(block.pairs.length,24);
  assert.equal(block.pairPages.length,6);

  assert.deepEqual(
    block.pairPages.map(p=>p.label),
    [
      "Going to a place",
      "Coming from a place",
      "Being somewhere",
      "Location sentences",
      "Useful questions",
      "Home forms",
    ]
  );

  for(const page of block.pairPages){
    assert.equal(page.pairIds.length,4,page.id);
  }

  const allPageIds=block.pairPages.flatMap(p=>p.pairIds);
  assert.equal(new Set(allPageIds).size,24);
  assert.deepEqual(
    [...new Set(allPageIds)].sort(),
    block.pairs.map(p=>p.id).sort()
  );

  const byPage=Object.fromEntries(block.pairPages.map(p=>[p.id,p.pairIds.map(id=>block.pairs.find(x=>x.id===id).lt)]));
  assert.deepEqual(byPage.going_to,[
    "Aš einu į stotį.",
    "Aš einu į viešbutį.",
    "Mes einame į kavinę.",
    "Ar einate į stotį?",
  ]);
  assert.deepEqual(byPage.coming_from,["iš čia","iš viešbučio","iš stoties","iš namų"]);
  assert.deepEqual(byPage.being_somewhere,["mieste","viešbutyje","kavinėje","namuose"]);
  assert.deepEqual(byPage.home_forms,["namai","Aš išeinu iš namų.","Einu namo.","Aš esu namuose."]);

  assert.equal(block.pairs.some(p=>p.lt==="stotyje"),false);
  assert.equal(block.pairs.some(p=>p.lt==="į stotį"),false);
});


test("5.4.4 explains eiti versus važiuoti before testing transport choices",()=>{
  const m=createModule54();
  const lesson=m.lessons.find(l=>l.code==="5.4.4");
  assert.ok(lesson.notes);
  assert.match(lesson.notes.pattern,/Eiti means to go \/ walk on foot/i);
  assert.match(lesson.notes.pattern,/eikite.*polite command/i);
  assert.match(lesson.notes.pattern,/Važiuoti means to go \/ travel by a vehicle/i);
  assert.match(lesson.notes.pattern,/After galite/i);
  assert.ok(lesson.notes.usage.includes("eiti — to go / walk on foot"));
  assert.ok(lesson.notes.usage.includes("važiuoti — to go / travel by vehicle"));
  assert.ok(lesson.notes.usage.includes("Galite eiti pėsčiomis. — You can go on foot."));
  assert.ok(lesson.notes.usage.includes("Galite važiuoti autobusu. — You can go by bus."));
});

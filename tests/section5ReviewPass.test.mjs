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
 assert.equal(hotel.steps[1].speakerText,"Viešbutis yra ten.");
 assert.equal(hotel.steps[2].speakerText,"Kavinė yra čia.");
});

test("Section 5 scenarios reinforce taught place and movement language without avoidable vocabulary leaks",()=>{
  const m1=createModule51();
  const l12=m1.lessons.find(l=>l.code==="5.1.2").blocks.find(b=>b.id==="s5m1l2_b6_v2");
  assert.equal(l12.steps.length,3);
  const l11=m1.lessons.find(l=>l.code==="5.1.1").blocks.find(b=>b.id==="s5m1l1_b6_v2");
  assert.equal(l11.steps[1].speakerText,"Bankas yra ten.");
  assert.equal(l11.steps[1].supportText,undefined);
  assert.equal(l12.steps[1].speakerText,"Viešbutis yra ten.");
  assert.equal(l12.steps[2].speakerText,"Kavinė yra čia.");
  assert.equal(txt(m1).includes("Autobusų stotis yra ten."),false);
  assert.ok(txt(m1).includes("Autobusų stotelė yra ten."));
  assert.equal(txt(m1).includes("teisingai"),false);
  assert.equal(txt(m1).includes("Apie penkias minutes"),false);

  const m2=createModule52();
  assert.equal(txt(m2).includes("Geležinkelio stotis"),false);
  assert.ok(txt(m2).includes("Traukinių stotis yra ten. Eikite tiesiai."));
  assert.equal(txt(m2).includes("čia pat"),false);
  assert.equal(txt(m2).includes("netoli viešbučio"),false);
  assert.ok(txt(m2).includes("Kavinė yra ten. Viešbutis yra netoli."));
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

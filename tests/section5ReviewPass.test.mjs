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
 for(const bad of ["Aust?ja","vie?butis","vaistin?","geležinkelio stotis","taksiu","Ar tai toli?","Ar tai netoli?"]){
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
 assert.equal(hotel.steps[1].speakerText,"Viešbutis — va ten.");
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

test("Section 5 direction scenarios use authored help rather than wrong Nesuprantu answers or automatic meanings",()=>{
 for(const unit of [createModule51(),createModule52(),createModule53(),createModule54(),createCheckpoint5()]){
   for(const s of scenarios(unit)){
     assert.equal(txt(s).includes("supportText"),false,s.id);
     for(const step of s.steps||[]) for(const o of step.options||[]){
       assert.equal(/nesuprantu/i.test(o.text||""),false,s.id);
     }
   }
 }
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

test("5.3.5 does not require the untaught word Savaitę",()=>{
  const m=createModule53();
  const lesson=m.lessons.find(l=>l.code==="5.3.5");
  const s=txt(lesson);
  assert.equal(s.includes("Savaitę"),false);
  assert.ok(s.includes("Dabar viešbutyje?"));
  assert.ok(s.includes("Taip. Ačiū!"));
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

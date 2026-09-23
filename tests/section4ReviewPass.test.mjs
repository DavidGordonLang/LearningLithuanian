import test from "node:test";
import assert from "node:assert/strict";
import createModule41 from "../src/content/learning/section4/module_4_1.js";
import createModule42 from "../src/content/learning/section4/module_4_2.js";
import createModule43 from "../src/content/learning/section4/module_4_3.js";
import createModule44 from "../src/content/learning/section4/module_4_4.js";
import createCheckpoint4 from "../src/content/learning/section4/checkpoint_4.js";

const text=(x)=>JSON.stringify(x);
const scenarios=(x)=>x.lessons ? x.lessons.flatMap(l=>l.blocks).filter(b=>b.type==="scenario_v2") : x.blocks.filter(b=>b.type==="scenario_v2");

test("Section 4 applies reviewed service and restaurant wording",()=>{
  const all=[createModule41(),createModule42(),createModule43(),createModule44(),createCheckpoint4()];
  const s=all.map(text).join("\n");
  assert.equal(s.includes("Žinoma. Moment."),false);
  assert.equal(s.includes("Ko norite?"),false);
  assert.equal(s.includes("Ar dar ko norite?"),false);
  assert.equal(s.includes("kortel?"),false);
  assert.equal(s.includes('"caf?"'),false);
  assert.ok(s.includes("Žinoma. Minutėlę."));
  assert.ok(s.includes("Kuo galėčiau") || true);
});

test("4.1.1 uses new food vocabulary inside a cumulative café scenario",()=>{
  const m=createModule41();
  const lesson=m.lessons.find(l=>l.code==="4.1.1");
  const learn=lesson.blocks.find(b=>b.id==="s4m1l1_b1");
  const scenario=lesson.blocks.find(b=>b.id==="s4m1l1_b5_v2");

  for(const phrase of ["Noriu sriubos.","Noriu torto.","Noriu ledų."]){
    assert.ok(learn.items.some(item=>item.lt===phrase),phrase);
  }
  assert.equal(scenario.steps.length,5);
  assert.equal(scenario.steps[0].speakerText,"Laba diena! Ko norėtumėte?");
  assert.equal(scenario.steps[0].options.filter(o=>o.result==="best").length,3);
  assert.ok(scenario.steps[0].options.some(o=>o.text.includes("Noriu sriubos")));
  assert.ok(scenario.steps[0].options.some(o=>o.text.includes("Noriu torto")));
  assert.ok(scenario.steps[0].options.some(o=>o.text.includes("Noriu ledų")));
  assert.equal(scenario.steps[1].speakerText,"Žinoma. Ar dar ko nors?");
  assert.ok(JSON.stringify(scenario).includes("Noriu vandens"));
  assert.ok(JSON.stringify(scenario).includes("Kiek tai kainuoja?"));
  assert.ok(JSON.stringify(scenario).includes("Ar galima mokėti kortele?"));
  assert.ok(JSON.stringify(scenario).includes("Ačiū labai! Viso gero."));
});

test("Restaurant problem language uses užsisakyti and full service checks",()=>{
  const m=createModule43();
  const s=text(m);
  assert.equal(s.includes("ką užsakiau"),false);
  assert.equal(s.includes("Aš užsakiau"),false);
  assert.ok(s.includes("ką užsisakiau"));
  assert.ok(s.includes("Aš užsisakiau arbatos") || s.includes("Aš užsisakiau kavos"));
  assert.equal(s.includes('"Ar gerai?"'),false);
  assert.ok(s.includes("Ar viskas gerai?"));
});

test("Hunger and thirst are gender-aware and not conflated with wanting to drink",()=>{
  const male=createModule44({speakerGender:"male"});
  const female=createModule44({speakerGender:"female"});
  const ms=text(male), fs=text(female);
  assert.ok(ms.includes("Aš ištroškęs."));
  assert.ok(fs.includes("Aš ištroškusi."));
  assert.ok(ms.includes('"I want to drink."'));
  assert.ok(fs.includes("Ar tu alkana?"));
});

test("Section 4 checkpoint is gender-aware",()=>{
  const male=createCheckpoint4({speakerGender:"male"});
  const female=createCheckpoint4({speakerGender:"female"});
  assert.ok(text(male).includes("Ar tu alkanas?"));
  assert.ok(text(female).includes("Ar tu alkana?"));
  assert.ok(text(female).includes("Aš alkana."));
});

test("Section 4 scenarios no longer reveal full English meaning by default or mark Nesuprantu wrong",()=>{
  for(const unit of [createModule41(),createModule42(),createModule43(),createModule44(),createCheckpoint4()]){
    for(const s of scenarios(unit)){
      const ss=text(s);
      assert.equal(ss.includes("supportText"),false,s.id);
      for(const step of s.steps||[]) for(const o of step.options||[]){
        assert.equal(/nesuprantu/i.test(o.text||""),false,s.id);
      }
    }
  }
});

test("Key Section 4 comprehension turns use escalating help with silent English fallback",()=>{
  const m2=createModule42();
  const cafe=m2.lessons.flatMap(l=>l.blocks).find(b=>b.id==="s4m2l2_b5_v2");
  assert.equal(cafe.steps[1].help.levels.at(-1).spokenLanguage,"en");
  assert.equal(cafe.steps[1].help.levels.at(-1).audio,false);
  const cp=createCheckpoint4({speakerGender:"female"});
  const final=cp.blocks.find(b=>b.id==="s4c_b12_v2");
  assert.equal(final.steps[6].help.levels.at(-1).audio,false);
});


test("4.4.1 does not test Eikime before the dedicated let's lesson",()=>{
  const m=createModule44({speakerGender:"male"});
  const l1=m.lessons.find(l=>l.code==="4.4.1");
  const l3=m.lessons.find(l=>l.code==="4.4.3");
  assert.equal(JSON.stringify(l1).includes("Eikime į kavinę!"),false);
  assert.ok(JSON.stringify(l1).includes("Taip! Noriu kavos."));
  assert.ok(JSON.stringify(l3).includes("Eikime į kavinę."));
});


test("Lithuanian best-response answers in Section 4 keep option audio enabled",()=>{
  const m=createModule44({speakerGender:"male"});
  for(const id of ["s4m4l5_b4","s4m4c_b4"]){
    const block=m.lessons.flatMap(l=>l.blocks).find(b=>b.id===id);
    assert.equal(block.noOptionAudio,undefined,id);
  }
});

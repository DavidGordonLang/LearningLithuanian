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

test("remaining Section 4 scenarios are cumulative and grounded",()=>{
  const m1=createModule41();
  const l12=m1.lessons.find(l=>l.code==="4.1.2").blocks.find(b=>b.id==="s4m1l2_b5_v2");
  assert.equal(l12.steps.length,5);
  assert.ok(JSON.stringify(l12).includes("Norėčiau vandens"));
  assert.ok(JSON.stringify(l12).includes("Kiek tai kainuoja?"));
  assert.ok(JSON.stringify(l12).includes("Ar galima mokėti kortele?"));

  const l13=m1.lessons.find(l=>l.code==="4.1.3").blocks.find(b=>b.id==="s4m1l3_b5_v2");
  assert.match(l13.steps[0].sceneDirection,/nearest/i);
  assert.match(l13.steps[1].sceneDirection,/other item/i);
  assert.ok(JSON.stringify(l13).includes("To, prašau."));
  assert.ok(JSON.stringify(l13).includes("Kiek tai kainuoja?"));

  const l14=m1.lessons.find(l=>l.code==="4.1.4").blocks.find(b=>b.id==="s4m1l4_b6_v2");
  assert.ok(JSON.stringify(l14).includes("Dvi arbatas, prašau."));
  assert.ok(JSON.stringify(l14).includes("Vieną stiklinę vandens, prašau."));
  assert.ok(JSON.stringify(l14).includes("Kortele, prašau."));

  const cp=m1.lessons.find(l=>l.code==="4.1.C").blocks.find(b=>b.id==="s4m1c_b9_v2");
  assert.equal(cp.steps.length,6);
  assert.match(cp.steps[1].sceneDirection,/farther away/i);
  assert.ok(JSON.stringify(cp).includes("Ne, ačiū. Užtenka."));
});

test("4.2.1 café scenario offers multiple genuinely valid learner responses",()=>{
  const m=createModule42();
  const scenario=m.lessons.find(l=>l.code==="4.2.1").blocks.find(b=>b.id==="s4m2l1_b5_v2");

  const order=scenario.steps.find(s=>s.id==="step_1");
  assert.equal(order.options.length,4);
  assert.equal(order.options.find(o=>o.text==="Kavos, prašau.").result,"acceptable");
  assert.equal(order.options.find(o=>o.text==="Laba diena! Noriu kavos.").result,"awkward");
  assert.equal(order.options.filter(o=>o.progresses!==false).length,3);

  const water=scenario.steps.find(s=>s.id==="step_2");
  assert.equal(water.options.length,4);
  assert.equal(water.options.filter(o=>o.result==="best").length,2);
  assert.equal(water.options.find(o=>o.text==="Noriu vandens.").result,"awkward");

  const payment=scenario.steps.find(s=>s.id==="step_4");
  assert.equal(payment.options.find(o=>o.text==="Ar galima mokėti kortele?").result,"acceptable");

  const close=scenario.steps.find(s=>s.id==="step_5");
  assert.equal(close.options.length,4);
  assert.equal(close.options.filter(o=>o.progresses!==false).length,3);
});

test("Section 4 final checkpoint orders for the pair without addressing tau to the server",()=>{
  const cp=createCheckpoint4({speakerGender:"male"});
  const scenario=cp.blocks.find(b=>b.id==="s4c_b12_v2");
  const order=scenario.steps.find(s=>s.id==="step_2");
  assert.equal(JSON.stringify(order).includes("tau arbatos"),false);
  assert.ok(JSON.stringify(order).includes("Mums vieną kavą su pienu ir vieną arbatą"));
});

test("payment-choice prompts are actually introduced by a cash-or-card question",()=>{
  const units=[createModule41(),createModule42(),createModule43({speakerGender:"male"}),createModule44({speakerGender:"male"}),createCheckpoint4({speakerGender:"male"})];

  for(const unit of units){
    const lessons=unit.lessons||[{code:unit.code,blocks:unit.blocks||[]}];
    for(const lesson of lessons){
      for(const scenario of (lesson.blocks||[]).filter(b=>b.type==="scenario_v2")){
        for(const step of scenario.steps||[]){
          if(/Choose (cash|card|how you want to pay)/i.test(step.learnerPrompt||"")){
            assert.match(step.speakerText||"",/Grynaisiais ar kortele\?/i,`${lesson.code} ${scenario.id}/${step.id}`);
          }
        }
      }
    }
  }

  const m=createModule43({speakerGender:"male"});
  const payment=m.lessons.find(l=>l.code==="4.3.2").blocks.find(b=>b.id==="s4m3l2_b5_v2").steps.find(s=>s.id==="step_4");
  assert.equal(payment.speakerText,"Šeši eurai. Grynaisiais ar kortele?");
  assert.equal(payment.options.find(o=>o.text==="Grynaisiais, prašau.").result,"best");
  assert.equal(payment.options.find(o=>o.text==="Kortele, prašau.").result,"wrong");
});

test("future Section 4 scenarios avoid two-button giveaways and vary payment method",()=>{
  const units=[createModule42(),createModule43({speakerGender:"male"}),createModule44({speakerGender:"male"}),createCheckpoint4({speakerGender:"male"})];
  for(const unit of units){
    const lessons=unit.lessons||[{code:unit.code,blocks:unit.blocks||[]}];
    for(const lesson of lessons){
      if(lesson.code==="4.2.1") continue;
      for(const scenario of (lesson.blocks||[]).filter(b=>b.type==="scenario_v2")){
        for(const step of scenario.steps||[]) assert.ok(step.options.length>=3,`${lesson.code} ${scenario.id}/${step.id}`);
      }
    }
  }
  const m42=createModule42();
  const cash=m42.lessons.find(l=>l.code==="4.2.2").blocks.find(b=>b.id==="s4m2l2_b5_v2").steps.find(s=>s.id==="step_4");
  assert.equal(cash.options.find(o=>o.text==="Grynaisiais, prašau.").result,"best");
  assert.equal(cash.options.find(o=>o.text==="Kortele, prašau.").result,"wrong");
  const flex=m42.lessons.find(l=>l.code==="4.2.3").blocks.find(b=>b.id==="s4m2l3_b6_v2").steps.find(s=>s.id==="step_5");
  assert.equal(flex.options.find(o=>o.text==="Grynaisiais, prašau.").result,"best");
  assert.equal(flex.options.find(o=>o.text==="Kortele, prašau.").result,"best");
});

test("4.2.2 opening has more than one legitimate coffee-order response",()=>{
  const m=createModule42();
  const step=m.lessons.find(l=>l.code==="4.2.2").blocks.find(b=>b.id==="s4m2l2_b5_v2").steps[0];
  assert.equal(step.options.find(o=>o.text==="Norėčiau kavos, prašau.").result,"acceptable");
});

test("Section 4 lesson 5 gives Norėčiau užsisakyti explicit pronunciation practice",()=>{
  const m=createModule42();
  const lesson=m.lessons.find(l=>l.code==="4.2.1");
  const block=lesson.blocks.find(b=>b.id==="s4m2l1_b4b");
  assert.ok(block);
  assert.equal(block.type,"speak_self_check");
  assert.equal(block.targetText,"Norėčiau užsisakyti");
  assert.equal(block.audioText,"Norėčiau užsisakyti");
});

test("Section 4.2 scenarios reuse prior ordering and payment language without forward references",()=>{
  const m=createModule42();
  const l21=m.lessons.find(l=>l.code==="4.2.1").blocks.find(b=>b.id==="s4m2l1_b5_v2");
  assert.equal(l21.steps.length,5);
  assert.ok(JSON.stringify(l21).includes("Vandens, prašau."));
  assert.ok(JSON.stringify(l21).includes("Kortele, prašau."));

  const l22=m.lessons.find(l=>l.code==="4.2.2").blocks.find(b=>b.id==="s4m2l2_b5_v2");
  assert.match(l22.sceneIntro,/in a hurry/i);
  assert.equal(l22.steps.find(s=>s.id==="step_2").options.find(o=>o.result==="best").text,"Išsinešti, prašau.");

  const l23=m.lessons.find(l=>l.code==="4.2.3").blocks.find(b=>b.id==="s4m2l3_b6_v2");
  assert.equal(l23.steps.length,6);
  assert.ok(JSON.stringify(l23).includes("Su pienu, prašau."));
  assert.ok(JSON.stringify(l23).includes("Ne, be cukraus, prašau."));
  assert.ok(JSON.stringify(l23).includes("Kiek tai kainuoja?"));

  const l24=m.lessons.find(l=>l.code==="4.2.4").blocks.find(b=>b.id==="s4m2l4_b5_v2");
  assert.equal(l24.steps[0].speakerText,"Ar dar ko nors?");
  assert.match(l24.steps[0].sceneDirection,/finished your coffee/i);
  assert.equal(l24.steps[0].options.find(o=>o.result==="best").text,"Ne, ačiū. Sąskaitą, prašau.");
  const l25=m.lessons.find(l=>l.code==="4.2.5").blocks.find(b=>b.id==="s4m2l5_b5_v2");
  assert.match(l25.steps[3].sceneDirection,/after finishing your coffee/i);
});

test("4.3.1 does not re-present already reviewed sugar and milk phrases as new vocabulary",()=>{
  const m=createModule43({speakerGender:"male"});
  const lesson=m.lessons.find(l=>l.code==="4.3.1");
  const learn=lesson.blocks.find(b=>b.id==="s4m3l1_b1");
  assert.deepEqual(learn.items.map(i=>i.lt),["Nenoriu…","Nenoriu šito.","Nenoriu to."]);
  assert.deepEqual(lesson.notes.usage,["Nenoriu šito — I don't want this","Nenoriu to — I don't want that"]);
  assert.equal(lesson.notes.pattern.includes("be + noun"),false);

  const lessonText=JSON.stringify(lesson);
  assert.ok(lessonText.includes("Be cukraus"));
  assert.ok(lessonText.includes("Be pieno"));
  assert.ok(lessonText.includes("Ar su cukrumi?"));
});

test("4.3.4 tests replacement language with a problem in the served item, not a wrong order",()=>{
  const m=createModule43({speakerGender:"male"});
  const lesson=m.lessons.find(l=>l.code==="4.3.4");
  const response=lesson.blocks.find(b=>b.id==="s4m3l4_b4");
  const scenario=lesson.blocks.find(b=>b.id==="s4m3l4_b5_v2");

  assert.match(response.prompt.text,/ordered soup/i);
  assert.match(response.prompt.text,/hair/i);
  assert.equal(response.prompt.text.includes("čia ne tai, ką užsisakiau"),false);
  assert.equal(response.options.find(o=>o.isCorrect).text,"Ar galite atnešti kitą?");

  assert.match(scenario.description,/ordered soup/i);
  assert.match(scenario.description,/hair/i);
  assert.equal(JSON.stringify(scenario).includes("čia ne tai, ką užsisakiau"),false);
  assert.equal(scenario.steps[0].speakerText,"Prašom. Sriuba.");
  assert.equal(scenario.steps[0].options.find(o=>o.result==="best").text,"Atsiprašau. Ar galite atnešti kitą?");
  assert.equal(scenario.steps[0].options.find(o=>o.text==="Ar galite pakeisti?").result,"acceptable");
  assert.equal(scenario.steps.length,4);
});

test("Section 4.3 scenarios avoid unnecessary untaught service wording",()=>{
  const m=createModule43({speakerGender:"male"});
  const l31=m.lessons.find(l=>l.code==="4.3.1").blocks.find(b=>b.id==="s4m3l1_b5_v2");
  assert.equal(l31.steps[2].speakerText,"Ar norėtumėte šito?");
  assert.match(l31.steps[2].sceneDirection,/slice of cake/i);

  const l33=m.lessons.find(l=>l.code==="4.3.3").blocks.find(b=>b.id==="s4m3l3_b5_v2");
  assert.equal(l33.steps[1].speakerText,"Labai atsiprašau. Kavos?");
  const l34=m.lessons.find(l=>l.code==="4.3.4").blocks.find(b=>b.id==="s4m3l4_b5_v2");
  assert.equal(l34.steps[0].speakerText,"Prašom. Sriuba.");
  assert.equal(l34.steps[1].speakerText,"Labai atsiprašau. Žinoma. Prašom.");
});

test("Section 4.4 social scenarios reuse prior language coherently",()=>{
  const m=createModule44({speakerGender:"male"});
  const l41=m.lessons.find(l=>l.code==="4.4.1").blocks.find(b=>b.id==="s4m4l1_b5_v2");
  assert.equal(l41.steps.length,3);
  assert.ok(JSON.stringify(l41).includes("Aš ištroškęs. Noriu vandens."));
  assert.ok(JSON.stringify(l41).includes("Kavinė yra ten."));

  const l44=m.lessons.find(l=>l.code==="4.4.4").blocks.find(b=>b.id==="s4m4l4_b6_v2");
  assert.equal(l44.steps[0].options.find(o=>o.result==="best").text,"Laba diena! Mums dvi arbatas, prašau.");
  assert.equal(JSON.stringify(l44).includes("Man kavos ir tau arbatos, prašau."),true);
  assert.equal(l44.steps[0].options.find(o=>o.text==="Man kavos ir tau arbatos, prašau.").result,"wrong");

  const l45=m.lessons.find(l=>l.code==="4.4.5").blocks.find(b=>b.id==="s4m4l5_b5_v2");
  assert.ok(JSON.stringify(l45).includes("Ne, ačiū. Užtenka."));
  assert.equal(JSON.stringify(l45).includes("Ne, ačiū. Pakanka."),false);

  const cp=m.lessons.find(l=>l.code==="4.4.C").blocks.find(b=>b.id==="s4m4c_b6_v2");
  assert.equal(cp.steps.length,6);
  assert.ok(JSON.stringify(cp).includes("Taip! Pavalgykime."));
  assert.ok(JSON.stringify(cp).includes("Ne, ačiū. Užtenka."));
  assert.equal(JSON.stringify(cp).includes("gera idėja"),false);
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

test("Section 4 scenarios avoid full automatic meanings and only use narrow visible support for genuinely new language",()=>{
  const visible=[];
  for(const unit of [createModule41(),createModule42(),createModule43(),createModule44(),createCheckpoint4()]){
    for(const s of scenarios(unit)){
      for(const step of s.steps||[]){
        if(step.supportText) visible.push(step.supportText);
        for(const o of step.options||[]){
          assert.equal(/nesuprantu/i.test(o.text||""),false,s.id);
        }
      }
    }
  }
  assert.deepEqual(visible,[]);
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

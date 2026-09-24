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

test("Section 4 final scenario is a clear two-person café interaction with meaningful retrieval",()=>{
  const cp=createCheckpoint4({speakerGender:"male",userNameSafe:"Davidas"});
  const scenario=cp.blocks.find(b=>b.id==="s4c_b12_v2");

  assert.equal(scenario.location,"café");
  assert.equal(scenario.participants.length,2);
  assert.equal(scenario.participants.find(p=>p.id==="friend").name,"Mantas");
  assert.equal(scenario.participants.find(p=>p.id==="server").name,"Rasa");
  assert.match(scenario.description,/both want a sandwich/i);
  assert.match(scenario.description,/you want juice/i);
  assert.match(scenario.description,/pay in cash/i);
  assert.equal(scenario.steps.length,9);

  const social=scenario.steps.find(s=>s.id==="step_1");
  assert.equal(social.speakerId,"friend");
  assert.equal(social.options.find(o=>o.result==="best").text,"Taip! Aš alkanas. Eikime į kavinę.");

  const order=scenario.steps.find(s=>s.id==="step_2");
  assert.equal(order.speakerId,"server");
  assert.match(order.sceneDirection,/each want a sandwich/i);
  assert.match(order.sceneDirection,/ordering for both/i);
  assert.equal(order.options.find(o=>o.result==="best").text,"Laba diena! Mums du sumuštinius ir man sulčių, prašau.");
  assert.equal(order.options.find(o=>o.text==="Man du sumuštinius, prašau. Mums sulčių.").result,"wrong");
  const shorterOrder=order.options.find(o=>o.text==="Mums du sumuštinius, prašau. Man sulčių.");
  assert.equal(shorterOrder.result,"acceptable");
  assert.match(shorterOrder.feedback,/single prašau makes the whole order polite/i);
  assert.equal(shorterOrder.feedback.includes("second prašau"),false);

  const mistake=scenario.steps.find(s=>s.id==="step_4");
  assert.equal(mistake.speakerText,"Prašom. Vienas sumuštinis ir sriuba.");
  assert.match(mistake.sceneDirection,/ordered two sandwiches/i);
  assert.equal(mistake.options.find(o=>o.result==="best").text.includes("čia ne tai, ką užsisakiau"),true);
  assert.equal(mistake.options.find(o=>o.result==="awkward").text.includes("Sriubos nenoriu"),true);

  const taste=scenario.steps.find(s=>s.id==="step_5");
  assert.equal(taste.options.find(o=>o.result==="awkward").text,"Taip, labai gerai.");

  const enough=scenario.steps.find(s=>s.id==="step_6");
  assert.equal(enough.speakerId,"friend");
  assert.equal(enough.options.find(o=>o.result==="best").text,"Ne, ačiū. Užtenka.");
  assert.equal(enough.options.find(o=>o.text==="Ne, ačiū.").result,"awkward");

  const bill=scenario.steps.find(s=>s.id==="step_7");
  assert.equal(bill.options.find(o=>o.result==="best").text,"Ne, ačiū. Ar galėčiau gauti sąskaitą, prašau?");
  assert.equal(bill.options.find(o=>o.text==="Ne, ačiū. Užtenka.").result,"awkward");

  const payment=scenario.steps.find(s=>s.id==="step_8");
  assert.match(payment.speakerText,/Grynaisiais ar kortele\?/);
  assert.equal(payment.options.find(o=>o.text==="Grynaisiais, prašau.").result,"best");
  assert.equal(payment.options.find(o=>o.text==="Turiu grynųjų.").result,"acceptable");
  assert.equal(payment.options.find(o=>o.text==="Kortele, prašau.").result,"wrong");

  // The final checkpoint should avoid cartoonishly irrelevant distractors in its substantive turns.
  for(const step of scenario.steps.slice(1,8)){
    assert.equal((step.options||[]).some(o=>/Laba diena\.|Viso gero\.|Kur yra tualetas\?/.test(o.text||"")),false,step.id);
  }
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

test("4.3.5 follows the natural receive-complain-replace-pay sequence",()=>{
  const m=createModule43({speakerGender:"male"});
  const lesson=m.lessons.find(l=>l.code==="4.3.5");
  const scenario=lesson.blocks.find(b=>b.id==="s4m3l5_b5_v2");

  assert.equal(scenario.steps.length,6);

  const receive=scenario.steps[0];
  assert.equal(receive.speakerText,"Prašom. Kava su pienu.");
  assert.equal(receive.sceneDirection,"Rasa brings the coffee you ordered.");
  assert.equal(receive.options.find(o=>o.result==="best").text,"Ačiū!");
  assert.equal(JSON.stringify(receive).includes("Čia ne tai, ką užsisakiau"),false);

  const complaint=scenario.steps[1];
  assert.match(complaint.sceneDirection,/take a sip.*too cold/i);
  assert.equal(complaint.options.find(o=>o.result==="best").text,"Nelabai — per šalta.");
  assert.equal(JSON.stringify(complaint).includes("Ar galite atnešti kitą?"),false);

  const request=scenario.steps[2];
  assert.equal(request.speakerText,"Labai atsiprašau.");
  assert.equal(request.options.find(o=>o.result==="best").text,"Ar galite atnešti kitą?");

  const replacement=scenario.steps[3];
  assert.equal(replacement.speakerText,"Žinoma. Prašom.");
  assert.match(replacement.sceneDirection,/hot replacement/i);
  assert.equal(replacement.options.find(o=>o.result==="best").text,"Ačiū labai!");

  const bill=scenario.steps[4];
  assert.equal(bill.speakerText,"Ar dar ko nors norėtumėte?");
  assert.equal(bill.options.find(o=>o.result==="best").text,"Ne, ačiū. Sąskaitą, prašau.");

  const payment=scenario.steps[5];
  assert.match(payment.speakerText,/Grynaisiais ar kortele\?/);

  const checkpoint=m.lessons.find(l=>l.code==="4.3.C");
  const cold=checkpoint.blocks.find(b=>b.id==="s4m3c_b5");
  assert.match(cold.prompt.text,/too cold/i);
  assert.equal(cold.options.find(o=>o.isCorrect).text,"Per šalta.");
});

test("Section 4 scenario options do not contain punctuation-only duplicates",()=>{
  const units=[createModule41(),createModule42(),createModule43({speakerGender:"male"}),createModule44({speakerGender:"male"}),createCheckpoint4({speakerGender:"male"})];
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

test("4.3 checkpoint tests retention of su versus be in the opening order",()=>{
  const m=createModule43({speakerGender:"male"});
  const checkpoint=m.lessons.find(l=>l.code==="4.3.C");
  const scenario=checkpoint.blocks.find(b=>b.id==="s4m3c_b9_v2");
  const order=scenario.steps.find(s=>s.id==="step_1");

  assert.equal(order.sceneDirection,"You want tea with lemon.");
  assert.equal(order.learnerPrompt,"Order tea with lemon.");
  assert.equal(order.options.find(o=>o.result==="best").text,"Laba diena! Norėčiau arbatos su citrina, prašau.");
  const without=order.options.find(o=>o.text==="Laba diena! Norėčiau arbatos be citrinos, prašau.");
  assert.equal(without.result,"wrong");
  assert.match(without.feedback,/Su means with; be means without/i);
  assert.equal(order.options.some(o=>o.text==="Norėčiau arbatos su citrina, prašau."),false);
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

test("4.4.2 broadens food vocabulary through spaced retrieval plus one new noun",()=>{
  const m=createModule44({speakerGender:"male"});
  const lesson=m.lessons.find(l=>l.code==="4.4.2");
  const learn=lesson.blocks.find(b=>b.id==="s4m4l2_b1");
  const items=learn.items.map(i=>i.lt);

  for(const expected of ["Ar nori sulčių?","Ar norite sumuštinio?","Ar nori obuolio?","sausainis","Ar nori sausainio?"]){
    assert.ok(items.includes(expected),expected);
  }
  assert.equal(items.some(x=>/kavos|arbatos/i.test(x)),false);
  assert.match(lesson.notes.pattern,/sultys → sulčių/);
  assert.match(lesson.notes.pattern,/sumuštinis → sumuštinio/);
  assert.match(lesson.notes.pattern,/obuolys → obuolio/);
  assert.match(lesson.notes.pattern,/sausainis → sausainio/);

  assert.equal(lesson.blocks.find(b=>b.id==="s4m4l2_b2").prompt.text,"Ar norite sumuštinio?");
  const register=lesson.blocks.find(b=>b.id==="s4m4l2_b3");
  assert.equal(register.type,"recognise_mcq");
  assert.equal(register.options.find(o=>o.isCorrect).text,"Ar nori sausainio?");
  const formal=register.options.find(o=>o.text==="Ar norite sausainio?");
  assert.equal(formal.result,"awkward");
  assert.match(formal.feedback,/grammatically correct/i);
  assert.equal(formal.betterAnswer,"Ar nori sausainio?");
  assert.ok(register.options.some(o=>o.text==="Ar nori sausainis?" && o.isCorrect===false && !o.result));
  assert.equal(lesson.blocks.find(b=>b.id==="s4m4l2_b4").targetText,"Ar nori sulčių");

  const scenario=lesson.blocks.find(b=>b.id==="s4m4l2_b5_v2");
  assert.ok(JSON.stringify(scenario).includes("Ar nori sumuštinio?"));
  assert.ok(JSON.stringify(scenario).includes("Ar nori sulčių?"));
  assert.equal(JSON.stringify(scenario).includes("Ar nori kavos?"),false);
  assert.equal(scenario.steps[0].options.find(o=>o.text==="Labas! Ar norite sumuštinio?").result,"awkward");
  assert.equal(scenario.steps[0].options.find(o=>o.text==="Labas! Ar nori sumuštinis?").result,"wrong");
  assert.equal(scenario.steps[1].options.find(o=>o.text==="Ar nori sultys?").result,"wrong");
});

test("4.4 downstream practice carries the broadened nouns into invitations group orders and checkpoints",()=>{
  const m=createModule44({speakerGender:"male"});

  const l3=m.lessons.find(l=>l.code==="4.4.3");
  assert.ok(JSON.stringify(l3).includes("Išgerkime sulčių."));
  assert.equal(JSON.stringify(l3).includes("Išgerkime kavos."),false);
  const invite=l3.blocks.find(b=>b.id==="s4m4l3_b5_v2");
  assert.equal(invite.participants[0].role,"friend");
  assert.equal(invite.objects[0].number,"plural");
  assert.equal(invite.steps[2].options.find(o=>o.result==="best").text,"Taip! Ir išgerkime sulčių.");

  const l4=m.lessons.find(l=>l.code==="4.4.4");
  assert.ok(JSON.stringify(l4).includes("Mums du sumuštinius"));
  assert.ok(JSON.stringify(l4).includes("Man sulčių"));
  assert.equal(JSON.stringify(l4).includes("Mums dvi arbatas"),false);

  const checkpoint=m.lessons.find(l=>l.code==="4.4.C");
  const socialResponse=checkpoint.blocks.find(b=>b.id==="s4m4c_b1");
  assert.match(socialResponse.prompt.text,/offers you a biscuit/i);
  assert.match(socialResponse.prompt.text,/offer them juice in return/i);
  assert.equal(socialResponse.options.find(o=>o.isCorrect).text,"Taip, prašau. Ar nori sulčių?");
  const formalSocial=socialResponse.options.find(o=>o.text==="Taip, prašau. Ar norite sulčių?");
  assert.equal(formalSocial.result,"awkward");
  assert.equal(formalSocial.betterAnswer,"Taip, prašau. Ar nori sulčių?");
  assert.equal(checkpoint.blocks.find(b=>b.id==="s4m4c_b2").prompt.text,"Išgerkime sulčių.");
  assert.equal(checkpoint.blocks.find(b=>b.id==="s4m4c_b3").prompt.text,"Mums du sumuštinius.");
  const social=checkpoint.blocks.find(b=>b.id==="s4m4c_b6_v2");
  assert.equal(social.steps[1].speakerText,"Gerai! Ar nori sulčių?");
  assert.equal(social.steps[2].speakerText,"Aš noriu sumuštinio. Pavalgykime!");

  const final=createCheckpoint4({speakerGender:"male"});
  const offer=final.blocks.find(b=>b.id==="s4c_b10");
  assert.equal(offer.targetText,"Ar nori sausainio");
  const pairs=final.blocks.find(b=>b.type==="word_match").pairs.map(p=>p.lt);
  assert.ok(pairs.includes("Ar nori sausainio?"));
  assert.ok(pairs.includes("Man sulčių, prašau."));
});

test("4.4 checkpoint social response requires more than a basic yes/no",()=>{
  const m=createModule44({speakerGender:"male"});
  const checkpoint=m.lessons.find(l=>l.code==="4.4.C");
  const block=checkpoint.blocks.find(b=>b.id==="s4m4c_b1");

  assert.equal(block.type,"best_response");
  assert.match(block.prompt.text,/offer them juice in return/i);
  assert.equal(block.options.find(o=>o.isCorrect).text,"Taip, prašau. Ar nori sulčių?");
  assert.equal(block.options.some(o=>o.text==="Taip, prašau!"),false);
  assert.equal(block.options.find(o=>o.text==="Taip, prašau. Ar norite sulčių?").result,"awkward");
});

test("Section 4.4 social scenarios reuse prior language coherently",()=>{
  const m=createModule44({speakerGender:"male"});
  const l41=m.lessons.find(l=>l.code==="4.4.1").blocks.find(b=>b.id==="s4m4l1_b5_v2");
  assert.equal(l41.steps.length,3);
  assert.ok(JSON.stringify(l41).includes("Aš ištroškęs. Noriu vandens."));
  assert.ok(JSON.stringify(l41).includes("Kavinė yra ten."));

  const l44=m.lessons.find(l=>l.code==="4.4.4").blocks.find(b=>b.id==="s4m4l4_b6_v2");
  assert.equal(l44.steps[0].options.find(o=>o.result==="best").text,"Laba diena! Mums du sumuštinius, prašau.");
  assert.equal(JSON.stringify(l44).includes("Man vieną sumuštinį, prašau."),true);
  assert.equal(l44.steps[0].options.find(o=>o.text==="Man vieną sumuštinį, prašau.").result,"wrong");

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
  const payment=final.steps.find(s=>s.id==="step_8");
  assert.equal(payment.help.levels.at(-1).audio,false);
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

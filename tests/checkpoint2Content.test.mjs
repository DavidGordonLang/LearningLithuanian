import test from "node:test";
import assert from "node:assert/strict";
import createCheckpoint2 from "../src/content/learning/section2/checkpoint_2.js";

function block(cp,id){ return cp.blocks.find((b)=>b.id===id); }

test("Section 2 checkpoint reflects the restructured curriculum",()=>{
  const cp=createCheckpoint2();
  const serialized=JSON.stringify(cp);
  for(const deferred of ["Kada pradedame", "Kiek tai kainuoja", "Šitie tinka", "Tas geresnis"]) {
    assert.equal(serialized.includes(deferred), false, `deferred material leaked into Section 2 checkpoint: ${deferred}`);
  }
  assert.equal(block(cp,"s2c_b2").options.find(o=>o.isCorrect).text,"galime");
  assert.equal(block(cp,"s2c_b4").options.find(o=>o.isCorrect).text,"tos");
  assert.equal(block(cp,"s2c_b6").options.find(o=>o.isCorrect).text,"ji");
});

test("Section 2 final scenario uses authored help and no price material",()=>{
  const cp=createCheckpoint2();
  const s=block(cp,"s2c_b9_v2");
  assert.equal(s.steps[0].help.levels.at(-1).audio,false);
  assert.equal(s.steps[0].help.levels.at(-1).spokenLanguage,"en");
  assert.equal(JSON.stringify(s).includes("kainuoja"),false);
  for(const step of s.steps){
    for(const o of step.options||[]){
      assert.equal(/nesuprantu/i.test(o.text||""),false);
      assert.notEqual(o.result,"repair");
    }
  }
});

test("Section 2 save pool covers all revised modules without deferred language",()=>{
  const cp=createCheckpoint2();
  const pairs=block(cp,"s2c_b10").pairs;
  const texts=pairs.map(p=>p.lt);
  assert.equal(pairs.length,20);
  for(const wanted of ["Ar galima mokėti kortele?","Noriu tos.","Kuo galėčiau padėti?","Kur gyvenate?","Kas ji?"]){
    assert.ok(texts.includes(wanted),wanted);
  }
  for(const removed of ["Kiek tai kainuoja?","Kada pradedame?","Šitie tinka.","Tas geresnis."]){
    assert.equal(texts.includes(removed),false);
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import createModule31 from "../src/content/learning/section3/module_3_1.js";
import createModule32 from "../src/content/learning/section3/module_3_2.js";
import createModule33 from "../src/content/learning/section3/module_3_3.js";
import createModule34 from "../src/content/learning/section3/module_3_4.js";
import createCheckpoint3 from "../src/content/learning/section3/checkpoint_3.js";

const scenarios=(unit)=>unit.lessons
  ? unit.lessons.flatMap((lesson)=>lesson.blocks).filter((block)=>block.type==="scenario_v2")
  : unit.blocks.filter((block)=>block.type==="scenario_v2");

test("Section 3 Scenario V2 does not reveal English meaning by default or mark Nesuprantu wrong",()=>{
  for(const unit of [createModule31(),createModule32(),createModule33(),createModule34(),createCheckpoint3()]){
    for(const scenario of scenarios(unit)){
      for(const step of scenario.steps||[]){
        assert.equal(Object.prototype.hasOwnProperty.call(step,"supportText"),false,scenario.id);
        if(step.options?.length){
          assert.ok(step.options.some((option)=>["best","acceptable","awkward"].includes(option.result)), `${scenario.id}:${step.id} must retain a progressing answer`);
        }
        for(const option of step.options||[]){
          assert.equal(/nesuprantu/i.test(option.text||""),false,scenario.id);
          assert.notEqual(option.result,"repair",scenario.id);
        }
      }
    }
  }
});

test("Section 3 English helper speech is always silent Lithuanian-TTS-wise",()=>{
  for(const unit of [createModule31(),createModule32(),createModule33(),createModule34(),createCheckpoint3()]){
    for(const scenario of scenarios(unit)){
      for(const step of scenario.steps||[]){
        for(const level of step.help?.levels||[]){
          if(level.spokenLanguage==="en"){
            assert.equal(level.audio,false,scenario.id);
          }
        }
      }
    }
  }
});

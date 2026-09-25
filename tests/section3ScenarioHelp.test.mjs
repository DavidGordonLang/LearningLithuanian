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

test("Section 3 Scenario V2 limits visible support to the reviewed support lines and keeps help out of wrong answers",()=>{
  const supported = new Map([
    ["s3m3l4_b6_v2:step_3", ["Kavinėje. Iki!", "In the café. See you!"]],
    ["s3m3c_b6_v2:step_3", ["Dabar antra valanda — turite laiko.", "It's two o'clock now — you have time."]],
    ["s3m4l5_b10_v2:step_1", ["Ar užtenka laiko?", "Do we have enough time?"]],
    ["s3m4l5_b10_v2:step_2", ["Einame dabar?", "Shall we go now?"]],
    ["s3m4l5_b11_v2:step_1", ["Ar užtenka pinigų?", "Do you have enough money?"]],
    ["s3m4l5_b11_v2:step_2", ["Kiek turite?", "How much do you have?"]],
    ["s3c_b10_v2:step_5", ["Prašom. Viso gero ir geros kelionės!", "geros kelionės — have a good journey"]],
  ]);
  const seen = [];
  for(const unit of [createModule31(),createModule32(),createModule33(),createModule34(),createCheckpoint3()]){
    for(const scenario of scenarios(unit)){
      for(const step of scenario.steps||[]){
        const key = `${scenario.id}:${step.id}`;
        if (step.supportText) {
          assert.deepEqual([step.speakerText, step.supportText], supported.get(key), key);
          seen.push(key);
        }
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
  assert.deepEqual(seen.sort(), [...supported.keys()].sort());
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

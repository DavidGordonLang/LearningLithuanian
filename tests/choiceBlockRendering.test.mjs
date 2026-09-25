import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const src=fs.readFileSync(new URL("../src/views/training/LearningLessonView.jsx",import.meta.url),"utf8");

test("choice block instruction does not render literal escaped newlines",()=>{
  const instructionStart=src.indexOf("Instruction label shown above the prompt");
  assert.ok(instructionStart>=0);
  const snippet=src.slice(instructionStart,instructionStart+2200);
  assert.equal(snippet.includes(">\\n            {instructionLabel}\\n"),false);
  assert.ok(snippet.includes("{instructionLabel}"));
});

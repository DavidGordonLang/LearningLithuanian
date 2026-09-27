import test from "node:test";
import assert from "node:assert/strict";
import { lessonHarness } from "./helpers/lessonHarness.mjs";
import { textOf, nodes } from "./helpers/componentHarness.mjs";

test("choice block instructions render the correct label without literal escaped newlines", async () => {
  for (const [type, label] of [
    ["listen_mcq", "Listen and choose"],
    ["recognise_mcq", "Choose the correct answer"],
    ["best_response", "Choose the best response"],
  ]) {
    const view = await lessonHarness("ChoiceBlock");
    const tree = view.render({ block: { type, options: [] } });
    assert.ok(nodes(tree, n => n.type === "div" && textOf(n) === label).length, type);
    assert.equal(textOf(tree).includes("\\n"), false, type);
  }
});

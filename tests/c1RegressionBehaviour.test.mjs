import test from "node:test";
import assert from "node:assert/strict";
import { componentHarness, nodes, textOf, button } from "./helpers/componentHarness.mjs";
import { lessonHarness } from "./helpers/lessonHarness.mjs";
import * as contentKey from "../src/utils/contentKey.js";
import * as scenarioHelp from "../src/utils/scenarioHelp.js";
import * as scenarioAudio from "../src/utils/scenarioAudio.js";
import createModule44 from "../src/content/learning/section4/module_4_4.js";
import createModule52 from "../src/content/learning/section5/module_5_2.js";
import createModule53 from "../src/content/learning/section5/module_5_3.js";
import createModule54 from "../src/content/learning/section5/module_5_4.js";
import createCheckpoint5 from "../src/content/learning/section5/checkpoint_5.js";
import createModule21 from "../src/content/learning/section2/module_2_1.js";

const leaf = () => null;

test("end-of-module vocabulary save excludes already-saved Lithuanian at every UI/save boundary", async () => {
  let rows = [
    { Lithuanian: "Prašau!", English: "Please", _deleted: false },
    { Lithuanian: "Labas", _deleted: true },
  ];
  const view = await componentHarness("src/views/training/VocabSaveView.jsx", "default", {
    "../../services/enrichSavedRow": { enrichSavedRow: () => assert.fail("No enrichment during this test") },
    "../../utils/contentKey": contentKey,
    "../../utils/ids": { genId: () => "test-id", nowTs: () => 1 },
    "./TrainingBackButton": leaf,
  });
  const module = { lessons: [{ isCheckpoint: true, blocks: [{ type: "word_match", pairs: [
    { id: "m1", lt: "PRAŠAU", en: "You're welcome" },
    { id: "m1", lt: "Labas", en: "Hello" }, // reused local ID must not collide
    { id: "m2", lt: "labas!", en: "Hi" }, // duplicate course content is collapsed
  ] }] }] };
  const props = { module, rows, setRows: update => { rows = update(rows); } };
  let tree = view.render(props);
  const duplicate = nodes(tree, n => n.type === "button" && textOf(n).includes("PRAŠAU"))[0];
  assert.equal(duplicate.props.disabled, true);
  assert.match(textOf(duplicate), /In library/);
  duplicate.props.onClick(); // even an accidental handler call cannot select it
  tree = view.render(props);
  button(tree, "Select all").props.onClick();
  tree = view.render(props);
  const save = nodes(tree, n => n.props?.onClick && /^Save 1 phrase →$/.test(textOf(n)))[0];
  assert.ok(save, "only the tombstoned word is eligible");
  save.props.onClick();
  assert.equal(rows.filter(r => !r._deleted && contentKey.makeLtKey(r) === "prasau").length, 1);
  assert.equal(rows.filter(r => !r._deleted && contentKey.makeLtKey(r) === "labas").length, 1);
});

test("Build Phrase accepts non-empty incomplete and overfilled attempts and gives useful feedback", async () => {
  const block = createModule44().lessons.flatMap(l => l.blocks).find(b => b.id === "s4m4l4_b5");
  assert.ok(block);
  const view = await lessonHarness("BuildPhraseBlock");
  let wrong = 0, completed = 0, advanced = 0;
  const props = { block, onWrongAnswer: () => wrong++, onComplete: () => completed++, onAdvance: () => advanced++ };
  let tree = view.render(props);
  assert.equal(button(tree, "Check phrase").props.disabled, true);
  const ordered = block.tokens.filter(t => !t.isDistractor).sort((a,b) => a.correctIndex - b.correctIndex);
  button(tree, ordered[0].text).props.onClick();
  tree = view.render(props);
  assert.equal(button(tree, "Check phrase").props.disabled, false);
  button(tree, "Check phrase").props.onClick();
  tree = view.render(props);
  assert.match(textOf(tree), /You're missing \d+ words?\./);
  assert.equal(wrong, 1);
  for (const token of ordered.slice(1)) {
    button(tree, token.text).props.onClick();
    tree = view.render(props);
  }
  const extra = block.tokens.find(t => t.text === "sulčių.");
  button(tree, extra.text).props.onClick();
  tree = view.render(props);
  assert.equal(button(tree, "Check phrase").props.disabled, false);
  button(tree, "Check phrase").props.onClick();
  tree = view.render(props);
  assert.match(textOf(tree), /means “juice”/);
  assert.equal(wrong, 2);
  assert.equal(completed, 0);
  button(tree, "Reset").props.onClick();
  tree = view.render(props);
  for (const token of ordered) {
    button(tree, token.text).props.onClick();
    tree = view.render(props);
  }
  button(tree, "Check phrase").props.onClick();
  tree = view.render(props);
  assert.equal(completed, 1);
  button(tree, "Continue").props.onClick();
  assert.equal(advanced, 1);
});

test("all 13 repaired distractor occurrences expose their meaning in actual Build Phrase feedback", async () => {
  const expected = new Map([
    ["sulčių", "juice"], ["toli", "far"], ["kairėn", "to the left"],
    ["viešbutį", "hotel (the form used after į: to the hotel)"],
    ["kavinę", "café (the form used after į: to the café)"],
    ["viešbutyje", "in the hotel"], ["mieste", "in the city"], ["iš", "from / out of"],
    ["stotį", "station (the form used after į: to the station)"],
    ["vaistinę", "pharmacy (the form used after į: to the pharmacy)"],
  ]);
  const blocks = [createModule44(), createModule52(), createModule53(), createModule54()]
    .flatMap(m => m.lessons.flatMap(l => l.blocks)).concat(createCheckpoint5().blocks);
  const ids = new Set(["s4m4l4_b5", "s5m2l4_b2", "s5m2c_b5", "s5m3l1_b3", "s5m3l3_b3", "s5m3c_b5", "s5m4c_b5", "s5cp_b3"]);
  let checked = 0;
  for (const block of blocks.filter(b => ids.has(b.id))) {
    for (const token of block.tokens.filter(t => t.isDistractor)) {
      const bare = token.text.replace(/[.,!?;:]+$/g, "");
      if (!expected.has(bare)) continue;
      const view = await lessonHarness("BuildPhraseBlock");
      let tree = view.render({ block });
      button(tree, token.text).props.onClick();
      tree = view.render({ block });
      button(tree, "Check phrase").props.onClick();
      tree = view.render({ block });
      assert.ok(token.repairHint ? textOf(tree).includes(token.repairHint) : textOf(tree).includes(`means “${expected.get(bare)}”`), `${block.id}: ${token.text}`);
      checked++;
    }
  }
  assert.equal(checked, 13);
});

test("Scenario V2 reply and comprehension cards submit directly by click, Enter or Space without pre-answer word audio", async () => {
  for (const mode of ["reply", "comprehension"]) for (const method of ["click", "Enter", " "]) {
    const view = await componentHarness("src/views/training/ScenarioV2Block.jsx", "ScenarioV2FocusedMode", {
      "../../components/audio/InteractivePhraseText": leaf,
      "../../utils/scenarioAudio.js": scenarioAudio,
      "../../utils/scenarioHelp.js": scenarioHelp,
    });
    const option = { id: "a", text: mode === "comprehension" ? "Go straight." : "Ačiū!", learnerText: "Gerai, ačiū!", result: "best", progresses: true };
    const block = { id: "test", steps: [{ id: "s1", speakerText: "Eikite tiesiai.", sceneDirection: "Listen.", interactionMode: mode, options: [option] }] };
    const played = [];
    const props = { block, playText: text => played.push(text) };
    let tree = view.render(props);
    view.flushTimers();
    tree = view.render(props);
    const card = nodes(tree, n => n.props?.role === "button" && n.props["aria-label"]?.endsWith(`: ${option.text}`))[0];
    assert.ok(card);
    assert.equal(card.props["aria-label"], `Choose ${mode === "comprehension" ? "meaning" : "reply"}: ${option.text}`);
    assert.equal(card.props["aria-disabled"], false);
    assert.equal(nodes(card, n => typeof n.type === "function" || n.type === "button").length, 0, "plain option text, no audio child controls");
    assert.equal(button(tree, "Choose"), undefined);
    assert.deepEqual(played, ["Eikite tiesiai."], "only the speaker has played before selection");
    if (method === "click") card.props.onClick();
    else { let prevented = false; card.props.onKeyDown({ key: method, preventDefault: () => { prevented = true; } }); assert.equal(prevented, true); }
    tree = view.render(props);
    const learner = nodes(tree, n => n.props?.item?.role === "learner").map(n => n.props.item);
    assert.equal(learner.length, 1, "one direct selection records the answer");
    assert.equal(learner[0].text, mode === "comprehension" ? option.learnerText : option.text);
    if (mode === "comprehension") assert.equal(played.includes(option.text), false, "English assessment is not spoken as Lithuanian");
  }
});

test("bounded Section 5 fixes retrieve known here/near and vaistai while teaching the useful changed form", () => {
  const module = createModule52();
  const lesson = module.lessons.find(l => l.code === "5.2.5");
  const learn = lesson.blocks.find(b => b.type === "learn");
  assert.equal(learn.items.some(i => i.lt.toLowerCase() === "vaistai"), false);
  assert.match(lesson.notes.pattern, /You already know vaistai/);
  assert.ok(createModule21().lessons.flatMap(l => l.blocks).filter(b => b.type === "learn").some(b => b.items.some(i => i.lt.toLowerCase() === "vaistai")));
  assert.ok(learn.items.some(i => i.lt === "vaistų"));
  assert.ok(learn.items.some(i => i.lt === "Man reikia vaistų."));
  const comprehension = lesson.blocks.find(b => b.id === "s5m2l5_b3");
  assert.match(comprehension.prompt.text, /Tualetas yra čia/);
  assert.equal(comprehension.options.find(o => o.isCorrect).text, "The toilet is here.");
  assert.equal(comprehension.noOptionAudio, true);
  assert.doesNotMatch(JSON.stringify([module, createCheckpoint5()]), /čia pat/i);
  assert.ok(module.lessons.find(l => l.isCheckpoint).blocks.at(-1).pairs.some(p => p.lt === "Tualetas yra čia." && p.en === "The toilet is here."));
  assert.ok(createCheckpoint5().blocks.find(b => b.id === "s5cp_b6").options.some(o => o.text === "Tai netoli." && !o.isCorrect));
});

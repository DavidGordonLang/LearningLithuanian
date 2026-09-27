import test from "node:test";
import assert from "node:assert/strict";
import { curriculumLessons } from "../src/lib/curriculumProgress.js";
import { componentHarness, nodes, textOf } from "./helpers/componentHarness.mjs";
import { lessonHarness } from "./helpers/lessonHarness.mjs";

const sample = Array.from({ length: 6 }, (_, i) => ({ id: `p${i}`, lt: `žodis ${i}`, en: `word ${i}` }));

for (const mode of ["lesson", "standalone"]) {
  test(`${mode}: immediate select/reselect, correction, pulse, rapid next tap, page gate and once-only completion`, async () => {
    const h = mode === "lesson" ? await lessonHarness("useWordMatchSession")
      : await componentHarness("src/hooks/training/useMatchPairsSession.js", "useMatchPairsSession");
    const props = mode === "lesson"
      ? { rawPairs: sample, authoredPages: [
          { id: "first", label: "First", pairIds: sample.slice(0, 3).map(p => p.id) },
          { id: "second", label: "Second", pairIds: sample.slice(3).map(p => p.id) },
        ], pagePairs: 3, correctPulseMs: 520, wrongPulseMs: 420, pageFadeOutMs: 280, pageFadeInMs: 220 }
      : { eligibleRows: sample.map(p => ({ EN: p.en, LT: p.lt })), totalPairs: 6, pagePairs: 3,
          correctPulseMs: 520, wrongPulseMs: 420, pageFadeOutMs: 280, pageFadeInMs: 220 };
    const render = () => h.render(props);
    render(); let s = render();
    assert.equal(s.leftTiles.length, 3);
    const [first, another] = s.leftTiles;
    s.tap(first.id); s = render(); assert.equal(s.selected.id, first.id);
    s.tap(another.id); s = render(); assert.equal(s.selected.id, another.id, "same-side replaces selection");
    s.tap(another.id); s = render(); assert.equal(s.selected, null, "double selection toggles off");

    const wrongRight = s.rightTiles.find(t => t.pairId !== first.pairId);
    s.tap(first.id); s.tap(wrongRight.id); s = render();
    assert.equal(s.mistakes, 1); assert.equal(s.pulse.kind, "wrong"); assert.equal(s.selected, null);
    if (mode === "standalone") assert.equal(s.wrongPairs.length, 2);
    s.tap(first.id); s = render(); assert.equal(s.selected.id, first.id, "wrong animation does not swallow next tap");
    const right = s.rightTiles.find(t => t.pairId === first.pairId);
    s.tap(right.id); s = render();
    assert.equal(s.progress.matched, 1); assert.equal(s.matchedPairIds.size, 1);
    assert.equal(s.pulse.kind, "correct"); assert.equal(s.lastCorrectMatchAudio.text, [first, right].find(t => t.side === "lt").text);
    const audioKey = s.lastCorrectMatchAudio.key;
    s.tap(first.id); s.tap(right.id); s = render();
    assert.equal(s.progress.matched, 1, "matched tiles cannot double-count"); assert.equal(s.lastCorrectMatchAudio.key, audioKey);
    const next = s.leftTiles.find(t => t.pairId !== first.pairId);
    s.tap(next.id); s = render(); assert.equal(s.selected.id, next.id, "correct pulse does not swallow the next selection");

    // Fresh matches clear one page. While the transition is pending, stale tiles cannot act on the next page.
    s.tap(s.rightTiles.find(t => t.pairId === next.pairId).id);
    s = render(); const last = s.leftTiles.find(t => !s.matchedPairIds.has(t.pairId));
    s.tap(last.id); s.tap(s.rightTiles.find(t => t.pairId === last.pairId).id);
    s = render(); assert.equal(s.progress.matched, 3); assert.equal(s.busy, true);
    s.tap(first.id); assert.equal(render().selected, null);
    h.advanceTime(520); s = render(); assert.equal(s.phase, "pageFadeOut");
    s.tap(first.id); assert.equal(render().selected, null);
    h.advanceTime(280); s = render(); assert.equal(s.progress.page, 2);
    s.tap(s.leftTiles[0].id); assert.equal(render().selected, null, "fade-in rejects stale input");
    h.advanceTime(220); s = render();
    for (const left of s.leftTiles) {
      s = render(); s.tap(left.id); s.tap(s.rightTiles.find(t => t.pairId === left.pairId).id);
    }
    s = render(); assert.equal(s.progress.matched, 6); assert.equal(s.showDone, false);
    h.advanceTime(520); s = render(); assert.equal(s.showDone, true);
    s.tap(s.leftTiles[0].id); h.advanceTime(1000); assert.equal(render().progress.matched, 6);
    h.unmount();
  });
}

test("lesson renderer reports one wrong block, one completion and one audio per accepted pair", async () => {
  const block = Object.values(curriculumLessons).flatMap(l => l.blocks).find(b => b.type === "word_match" && b.pairPages?.length);
  const h = await lessonHarness("WordMatchBlock");
  let wrong = 0, complete = 0, advance = 0;
  const audio = [];
  const props = { block, playText: text => audio.push(text), onWrongAnswer: () => wrong++, onComplete: () => complete++, onAdvance: () => advance++, completed: false };
  const tiles = tree => nodes(tree, n => n.type === "button" && n.props.className?.includes("mp-tile"));
  h.render(props); let tree = h.render(props);
  // Use the hook's pair identity rather than English wording for deterministic matching.
  const pairs = block.pairPages[0].pairIds;
  const byId = id => block.pairs.find(p => p.id === id);
  const lt = label => tiles(tree).find(n => textOf(n) === label);
  const en = label => tiles(tree).find(n => textOf(n) === label);
  lt(byId(pairs[0]).lt).props.onClick(); en(byId(pairs[1]).en).props.onClick(); tree = h.render(props);
  assert.equal(wrong, 1); assert.equal(audio.length, 0);
  lt(byId(pairs[0]).lt).props.onClick(); en(byId(pairs[0]).en).props.onClick(); tree = h.render(props);
  assert.equal(audio.length, 1); assert.equal(audio[0], byId(pairs[0]).audioText || byId(pairs[0]).lt);
  lt(byId(pairs[0]).lt).props.onClick(); tree = h.render(props); assert.equal(audio.length, 1);
  for (const page of block.pairPages) {
    for (const id of page.pairIds) {
      if (id === pairs[0]) continue;
      const pair = byId(id);
      lt(pair.lt).props.onClick(); en(pair.en).props.onClick(); tree = h.render(props);
    }
    if (page !== block.pairPages.at(-1)) { h.advanceTime(1020); tree = h.render(props); }
  }
  h.advanceTime(520); tree = h.render(props); h.render(props);
  assert.equal(complete, 1); assert.equal(advance, 1); assert.equal(wrong, 1);
  h.unmount();
});

test("standalone renderer stays Words/Numbers only and speaks a correct Lithuanian match once", async () => {
  const h = await componentHarness("src/views/training/MatchPairsView.jsx", "default", {
    "../../hooks/training/useMatchPairsSession": { source: "src/hooks/training/useMatchPairsSession.js" },
    "./matchPairs/matchPairsStyles": { matchPairsCss: "" },
    "./TrainingBackButton": () => null,
  });
  const rows = Array.from({ length: 20 }, (_, i) => ({ EN: `word ${i}`, LT: `žodis ${i}`, Sheet: "Words" }));
  const audio = [];
  const base = { rows, playText: text => audio.push(text), preloadText: () => Promise.resolve(), onBack() {} };
  let tree = h.render({ ...base, focus: "phrases" });
  assert.ok(textOf(tree).includes("Reinforce does not use phrases"));
  tree = h.render({ ...base, focus: "words" }); tree = h.render({ ...base, focus: "words" });
  const tile = label => nodes(tree, n => n.type === "button" && n.props.className?.includes("mp-tile") && textOf(n) === label)[0];
  assert.ok(tile("word 1")); assert.ok(tile("žodis 1"));
  tile("word 1").props.onClick(); tile("žodis 1").props.onClick();
  tree = h.render({ ...base, focus: "words" });
  assert.deepEqual(audio, ["žodis 1"]);
  assert.equal(tile("word 1").props.disabled, true);
  assert.equal(tile("word 2").props.disabled, false, "other tiles remain available during green pulse");
  tile("word 1").props.onClick(); h.render({ ...base, focus: "words" });
  assert.deepEqual(audio, ["žodis 1"]);
  h.unmount();
});

test("a malformed six-pair authored page is fully completed, never skipped at five", async () => {
  const h = await lessonHarness("useWordMatchSession");
  const props = { rawPairs: sample, authoredPages: [{ id: "six", pairIds: sample.map(p => p.id) }], pagePairs: 5,
    correctPulseMs: 520, wrongPulseMs: 420, pageFadeOutMs: 280, pageFadeInMs: 220 };
  h.render(props); let s = h.render(props);
  for (let i = 0; i < 5; i++) {
    const left = s.leftTiles.find(t => t.pairId === sample[i].id);
    s.tap(left.id); s.tap(s.rightTiles.find(t => t.pairId === left.pairId).id); s = h.render(props);
  }
  assert.equal(s.progress.matched, 5); assert.equal(s.showDone, false); assert.equal(s.busy, false);
  const last = s.leftTiles.find(t => t.pairId === sample[5].id);
  s.tap(last.id); s.tap(s.rightTiles.find(t => t.pairId === last.pairId).id);
  h.advanceTime(520); s = h.render(props);
  assert.equal(s.progress.matched, 6); assert.equal(s.showDone, true);
  h.unmount();
});

test("Lithuanian and English tiles shuffle independently inside one authored family", async () => {
  const originalRandom = Math.random;
  try {
    const values = [0, 0, 0, 0.999, 0.999, 0.999];
    Math.random = () => values.shift() ?? 0.999;
    const h = await lessonHarness("useWordMatchSession");
    const props = { rawPairs: sample.slice(0, 4), authoredPages: [{ id: "family", pairIds: sample.slice(0, 4).map(p => p.id) }], pagePairs: 5,
      correctPulseMs: 520, wrongPulseMs: 420, pageFadeOutMs: 280, pageFadeInMs: 220 };
    h.render(props); const page = h.render(props);
    assert.deepEqual(new Set(page.leftTiles.map(t => t.pairId)), new Set(sample.slice(0, 4).map(p => p.id)));
    assert.deepEqual(new Set(page.rightTiles.map(t => t.pairId)), new Set(sample.slice(0, 4).map(p => p.id)));
    assert.notDeepEqual(page.leftTiles.map(t => t.pairId), page.rightTiles.map(t => t.pairId));
    h.unmount();
  } finally { Math.random = originalRandom; }
});

test("authored recap groups contain meaningfully related forms in multiple sections", () => {
  const blocks = Object.values(curriculumLessons).flatMap(l => l.blocks).filter(b => b.type === "word_match");
  const page = (blockId, label) => { const block = blocks.find(b => b.id === blockId); return block.pairPages.find(p => p.label === label).pairIds.map(id => block.pairs.find(pair => pair.id === id).lt); };
  assert.deepEqual(page("s2m3c_b7", "Masculine forms"), ["Šitas", "Tas", "Šitas obuolys", "Tas obuolys"]);
  assert.deepEqual(page("s3m1l2_b7", "Eleven to fifteen"), ["vienuolika", "dvylika", "trylika", "keturiolika", "penkiolika"]);
  assert.deepEqual(page("s4m2c_b7", "With and without"), ["su pienu", "be cukraus", "su citrina", "Su pienu ar be pieno?"]);
  assert.deepEqual(page("s5m4c_b7", "On foot or by bus"), ["pėsčiomis", "autobusu", "Galite eiti pėsčiomis.", "Galite važiuoti autobusu."]);
  const clock = blocks.find(b => b.id === "s3m3c_b7");
  assert.notEqual(clock.pairPages.findIndex(p => p.pairIds.includes("m1")), clock.pairPages.findIndex(p => p.pairIds.includes("m2")));
  assert.equal(blocks.find(b => b.id === "s4m1c_b10").pairs.filter(p => p.lt === "Ko norėtumėte?").length, 1);
  assert.deepEqual(blocks.find(b => b.id === "s5m3c_b7").pairPages.map(p => p.pairIds.length), [4,4,4,4,4,4]);
  assert.ok(blocks.some(b => b.pairPages.some(p => p.pairIds.length === 3)), "no filler for equal page size");
});

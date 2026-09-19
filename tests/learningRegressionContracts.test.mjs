import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { makeLtKey } from "../src/utils/contentKey.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const source = (path) => readFileSync(resolve(root, path), "utf8");

test("Lithuanian identity remains the duplicate key for lesson saves", () => {
  assert.equal(makeLtKey({ Lithuanian: "Prašau!" }), "prasau");
  assert.equal(makeLtKey({ Lithuanian: "  PRAŠAU  " }), "prasau");
  assert.equal(
    makeLtKey({ Lithuanian: "Labas", English: "Hello" }),
    makeLtKey({ Lithuanian: "Labas", English: "Good day" })
  );
  assert.notEqual(
    makeLtKey({ Lithuanian: "Labas" }),
    makeLtKey({ Lithuanian: "Ačiū" })
  );
});

test("end-of-module vocabulary save excludes already-saved Lithuanian at every UI/save boundary", () => {
  const src = source("src/views/training/VocabSaveView.jsx");

  assert.match(src, /filter\(\(r\) => !r\._deleted\)/);
  assert.match(src, /isDuplicate:\s*existingKeys\.has\(buildContentKey\(pair\.lt\)\)/);
  assert.match(src, /const selectablePairs = pairsWithStatus\.filter\(\(p\) => !p\.isDuplicate\)/);
  assert.match(src, /selected\.has\(p\.id\) && !p\.isDuplicate/);
  assert.match(src, /disabled=\{isDupe\}/);
  assert.match(src, /!isDupe && togglePair\(pair\.id\)/);
  assert.match(src, /In library/);
});

test("module and section completion still route through the vocabulary retention step", () => {
  const src = source("src/views/TrainingView.jsx");

  assert.match(
    src,
    /onSaveVocab=\{\(\) => \{[\s\S]*?setVocabSaveModule\(mod\);[\s\S]*?setScreen\("vocabSave"\);/
  );
  assert.match(
    src,
    /setVocabSaveModule\(buildSectionVocabModule\(sec, checkpoint\)\);[\s\S]*?setScreen\("vocabSave"\);/
  );
  assert.match(src, /Skip for now|onDone/);
});

test("lesson completion itself does not write directly to the phrase library", () => {
  const src = source("src/views/training/LearningLessonView.jsx");
  assert.doesNotMatch(src, /usePhraseStore|addPhrase|setPhrases/);
});

test("tap-word audio remains wired into core lesson Lithuanian", () => {
  const src = source("src/views/training/LearningLessonView.jsx");

  assert.match(src, /InteractivePhraseText/);
  assert.match(src, /text=\{item\.lt\}/);
  assert.match(src, /text=\{option\.text\}/);
});

test("Scenario V2 keeps tap-word and full-line audio on authored Lithuanian", () => {
  const src = source("src/views/training/ScenarioV2Block.jsx");

  assert.match(src, /text=\{turn\.speakerText\}/);
  assert.match(src, /text=\{item\.text\}/);
  assert.match(src, /text=\{option\.text\}/);
  assert.match(src, /text=\{option\.betterAnswer\}/);
  assert.match(src, /AudioIconButton text=\{turn\.speakerText\}/);
});

test("tap-word component remains backed by the shared word-audio interaction layer", () => {
  const src = source("src/components/audio/InteractivePhraseText.jsx");

  assert.match(src, /useWordAudio/);
  assert.match(src, /role="button"/);
  assert.match(src, /aria-label=\{\`Play word:/);
});

test("Scenario V2 progression semantics remain explicit", () => {
  const src = source("src/views/training/ScenarioV2Block.jsx");

  assert.match(src, /result === "best"/);
  assert.match(src, /result === "acceptable"/);
  assert.match(src, /result === "awkward"/);
  assert.match(src, /result === "repair" && option\?\.progresses === true/);
  assert.match(src, /Try another answer/);
});

import test from "node:test";
import assert from "node:assert/strict";

import {
  normaliseSpeechForMatch,
  phraseMatchesSpeech,
} from "../src/lib/speechMatch.js";

test("speech matching ignores Lithuanian diacritics and punctuation", () => {
  assert.equal(normaliseSpeechForMatch("Aš noriu kavos."), "as noriu kavos");
  assert.equal(phraseMatchesSpeech("As noriu kavos", "Aš noriu kavos."), true);
});

test("speech matching rejects partial phrases", () => {
  assert.equal(phraseMatchesSpeech("Noriu", "Noriu vandens."), false);
  assert.equal(phraseMatchesSpeech("vandens", "Noriu vandens."), false);
  assert.equal(phraseMatchesSpeech("Ar galite", "Ar galite man padėti?"), false);
});

test("speech matching rejects unrelated or rambling transcripts", () => {
  assert.equal(phraseMatchesSpeech("labas", "Noriu vandens."), false);
  assert.equal(phraseMatchesSpeech("triuksmas kambaryje", "Noriu vandens."), false);
  assert.equal(phraseMatchesSpeech("labas as kalbu ir dar kazka", "Noriu vandens."), false);
});

test("speech matching tolerates modest STT variation without becoming loose", () => {
  assert.equal(phraseMatchesSpeech("noriu vandens", "Noriu vandens."), true);
  assert.equal(phraseMatchesSpeech("noriu vandenss", "Noriu vandens."), true);
  assert.equal(phraseMatchesSpeech("noriu kavos", "Noriu vandens."), false);
});

test("speech matching rejects close grammatical substitutions in multi-word phrases", () => {
  assert.equal(phraseMatchesSpeech("Ar turite vandens", "Ar turite vandens?"), true);
  assert.equal(phraseMatchesSpeech("Ar turi vandens", "Ar turite vandens?"), false);
  assert.equal(phraseMatchesSpeech("Ar turite vandenss", "Ar turite vandens?"), true);
});

test("speech matching allows one harmless extra token only when the target remains intact and ordered", () => {
  assert.equal(phraseMatchesSpeech("na noriu vandens", "Noriu vandens."), true);
  assert.equal(phraseMatchesSpeech("noriu vandens na", "Noriu vandens."), true);
  assert.equal(phraseMatchesSpeech("noriu na vandens", "Noriu vandens."), true);
  assert.equal(phraseMatchesSpeech("noriu na visai vandens", "Noriu vandens."), false);
});


const LT_TEST_ONES = ["nulis", "vienas", "du", "trys", "keturi", "penki", "šeši", "septyni", "aštuoni", "devyni"];
const LT_TEST_TEENS = ["dešimt", "vienuolika", "dvylika", "trylika", "keturiolika", "penkiolika", "šešiolika", "septyniolika", "aštuoniolika", "devyniolika"];
const LT_TEST_TENS = ["", "", "dvidešimt", "trisdešimt", "keturiasdešimt", "penkiasdešimt", "šešiasdešimt", "septyniasdešimt", "aštuoniasdešimt", "devyniasdešimt"];

function ltCardinalForTest(value) {
  if (value < 10) return LT_TEST_ONES[value];
  if (value < 20) return LT_TEST_TEENS[value - 10];
  if (value === 100) return "šimtas";
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return ones ? `${LT_TEST_TENS[tens]} ${LT_TEST_ONES[ones]}` : LT_TEST_TENS[tens];
}

test("speech matching accepts digit formatting for every taught cardinal from 0 to 100", () => {
  for (let value = 0; value <= 100; value += 1) {
    assert.equal(
      phraseMatchesSpeech(String(value), ltCardinalForTest(value)),
      true,
      `numeric STT formatting should match Lithuanian cardinal ${value}`
    );
  }
});

test("speech matching accepts Speechmatics digit formatting for Lithuanian numbers", () => {
  assert.equal(phraseMatchesSpeech("30.", "trisdešimt"), true);
  assert.equal(phraseMatchesSpeech("18", "aštuoniolika"), true);
  assert.equal(phraseMatchesSpeech("100", "šimtas"), true);
  assert.equal(phraseMatchesSpeech("13", "trisdešimt"), false);
});

test("speech matching accepts digit formatting for numbers embedded in full phrases", () => {
  assert.equal(phraseMatchesSpeech("Man 45 metų.", "Man keturiasdešimt penki metų"), true);
  assert.equal(phraseMatchesSpeech("Tai kainuoja 30 eurų.", "Tai kainuoja trisdešimt eurų"), true);
  assert.equal(phraseMatchesSpeech("Susitinkame 6 valandą.", "Susitinkame šeštą valandą"), true);
  assert.equal(phraseMatchesSpeech("Man reikia 2 bilietų.", "Man reikia dviejų bilietų"), true);
  assert.equal(phraseMatchesSpeech("2 kavas, prašau.", "Dvi kavas, prašau"), true);
});

test("numeric transcript equivalence rejects the wrong number and does not loosen word-form grammar", () => {
  assert.equal(phraseMatchesSpeech("Man 44 metų.", "Man keturiasdešimt penki metų"), false);
  assert.equal(phraseMatchesSpeech("Tai kainuoja 13 eurų.", "Tai kainuoja trisdešimt eurų"), false);
  assert.equal(phraseMatchesSpeech("30 vandens", "Noriu vandens"), false);
  assert.equal(phraseMatchesSpeech("du kavas", "Dvi kavas"), false);
});

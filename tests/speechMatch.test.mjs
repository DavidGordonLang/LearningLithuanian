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


test("speech matching accepts Speechmatics digit formatting for single Lithuanian number targets", () => {
  assert.equal(phraseMatchesSpeech("30.", "trisdešimt"), true);
  assert.equal(phraseMatchesSpeech("18", "aštuoniolika"), true);
  assert.equal(phraseMatchesSpeech("100", "šimtas"), true);
  assert.equal(phraseMatchesSpeech("13", "trisdešimt"), false);
});

test("numeric transcript equivalence does not loosen ordinary phrase matching", () => {
  assert.equal(phraseMatchesSpeech("30", "Tai kainuoja trisdešimt eurų"), false);
  assert.equal(phraseMatchesSpeech("30 vandens", "Noriu vandens"), false);
});

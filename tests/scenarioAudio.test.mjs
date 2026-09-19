import test from "node:test";
import assert from "node:assert/strict";
import { isScenarioTurnAudioEnabled } from "../src/utils/scenarioAudio.js";

test("Scenario V2 audio remains enabled for existing Lithuanian turns", () => {
  assert.equal(isScenarioTurnAudioEnabled({ speakerText: "Laba diena!" }), true);
  assert.equal(isScenarioTurnAudioEnabled({ spokenLanguage: "lt", speakerText: "Stotis. Va ten." }), true);
  assert.equal(isScenarioTurnAudioEnabled({ spokenLanguage: "lt-LT", speakerText: "Ačiū." }), true);
});

test("English and mixed helper speech never uses Lithuanian TTS", () => {
  assert.equal(isScenarioTurnAudioEnabled({ spokenLanguage: "en", speakerText: "Station." }), false);
  assert.equal(isScenarioTurnAudioEnabled({ spokenLanguage: "en-GB", speakerText: "Train station." }), false);
  assert.equal(isScenarioTurnAudioEnabled({ spokenLanguage: "mixed", speakerText: "Stotis — station." }), false);
});

test("audio false is an explicit hard stop regardless of language", () => {
  assert.equal(isScenarioTurnAudioEnabled({ spokenLanguage: "lt", audio: false, speakerText: "Stotis." }), false);
  assert.equal(isScenarioTurnAudioEnabled({ audioEnabled: false, speakerText: "Laba diena." }), false);
});

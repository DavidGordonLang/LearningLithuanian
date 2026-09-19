import test from "node:test";
import assert from "node:assert/strict";
import {
  getScenarioHelpLevels,
  getScenarioHelpOption,
  getScenarioHelpTurn,
  withScenarioHelpOption,
} from "../src/utils/scenarioHelp.js";

const step = {
  id: "step_1",
  speakerId: "local",
  speakerLabel: "Local",
  help: {
    levels: [
      {
        sceneDirection: "She points towards the station sign.",
        speakerText: "Stotis. Va ten.",
      },
      {
        sceneDirection: "She points again and traces the direction with her hand.",
        speakerText: "Stotis — va ten.",
      },
      {
        speakerText: "Station. Over there.",
        spokenLanguage: "en",
        audio: false,
      },
    ],
  },
};

test("Scenario V2 help escalates one authored level at a time", () => {
  assert.equal(getScenarioHelpLevels(step).length, 3);

  const first = getScenarioHelpTurn(step, 0);
  assert.equal(first.helpLevel, 1);
  assert.equal(first.speakerText, "Stotis. Va ten.");
  assert.equal(first.speakerId, "local");

  const second = getScenarioHelpTurn(step, 1);
  assert.equal(second.helpLevel, 2);
  assert.match(second.sceneDirection, /points again/);

  const third = getScenarioHelpTurn(step, 2);
  assert.equal(third.helpLevel, 3);
  assert.equal(third.speakerText, "Station. Over there.");
  assert.equal(third.spokenLanguage, "en");
  assert.equal(third.audio, false);

  assert.equal(getScenarioHelpTurn(step, 3), null);
});

test("Nesuprantu is injected as the single help option while help remains", () => {
  const authored = [
    { id: "a", text: "Taip.", result: "best" },
    { id: "legacy", text: "Nesuprantu", result: "wrong" },
  ];

  const firstPass = withScenarioHelpOption(authored, step, 0);
  const helpOptions = firstPass.filter((option) => option.isScenarioHelp);
  assert.equal(helpOptions.length, 1);
  assert.equal(helpOptions[0].text, "Nesuprantu.");
  assert.equal(helpOptions[0].result, "help");
  assert.equal(firstPass.filter((option) => /^Nesuprantu[.]?$/.test(option.text)).length, 1);

  const exhausted = withScenarioHelpOption(authored, step, 3);
  assert.equal(exhausted.some((option) => /^Nesuprantu[.]?$/.test(option.text)), false);
  assert.equal(exhausted.some((option) => option.id === "a"), true);
});

test("help can be contextual only, without forcing spoken Lithuanian", () => {
  const contextualStep = {
    speakerId: "server",
    help: {
      optionText: "Nesuprantu",
      levels: [{ sceneDirection: "The server points to the picture on the menu." }],
    },
  };

  const option = getScenarioHelpOption(contextualStep, 0);
  const turn = getScenarioHelpTurn(contextualStep, 0);

  assert.equal(option.text, "Nesuprantu");
  assert.equal(turn.speakerText, undefined);
  assert.match(turn.sceneDirection, /points to the picture/);
  assert.equal(getScenarioHelpOption(contextualStep, 1), null);
});

test("steps without authored help remain unchanged", () => {
  const authored = [{ id: "a", text: "Ačiū.", result: "best" }];
  assert.deepEqual(withScenarioHelpOption(authored, { id: "step_no_help" }, 0), authored);
  assert.equal(getScenarioHelpOption({ id: "step_no_help" }, 0), null);
});

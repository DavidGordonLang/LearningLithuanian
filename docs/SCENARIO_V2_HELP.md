# Scenario V2 escalating help

Scenario V2 can give the learner one consistent survival option: **Nesuprantu.**

Help is authored per scenario step. It does not count as a wrong answer and it does not advance the conversation. Each selection reveals the next authored help level, then reopens the same decision. After the final level has been used, the help option is removed for that step.

## Step schema

```js
{
  id: "step_1",
  speakerId: "local",
  speakerLabel: "Local",
  speakerText: "Kur yra stotis?",
  options: [
    { id: "a", text: "...", result: "best", progresses: true },
    { id: "b", text: "...", result: "wrong", progresses: false },
  ],
  help: {
    optionText: "Nesuprantu.", // optional; defaults to this
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
}
```

## Authoring principles

- Add help only after `Nesuprantu` has been taught.
- Do not add it mechanically to every turn. Use it where misunderstanding is plausible.
- Level 1 should normally simplify, repeat the key idea, or use a natural gesture.
- Level 2 should make the context more explicit without simply translating the whole line.
- Level 3 may use a short English bridge as a last resort.
- If English or mixed-language words are shown as speaker text, set `spokenLanguage: "en"` (or `"mixed"`) and `audio: false`. Scenario V2 currently has Lithuanian speaker voices only, so non-Lithuanian speaker text must never be sent through TTS.
- A level may be scene-direction-only when a gesture is the most natural help.
- The learner remains on the same scenario step after help.
- If an old authored option already says `Nesuprantu`, the help system replaces it while help levels remain, preventing duplicate choices.
- Existing `best`, `acceptable`, `awkward`, `repair`, and `wrong` options remain backward compatible.

Lithuanian help text retains full-line replay and tap-word audio. English or mixed-language speaker text is rendered as plain text with no autoplay, replay button, or tap-word audio. English UI-only explanation can still use `supportText`, which has no audio.

# ZODIS_HANDOFF_V2.md
# Žodis PWA — Developer Handoff Document
# Last updated: Session ending ~April 2026

---

## PROJECT OVERVIEW

**Žodis** (zodis.app) — Lithuanian language learning PWA.  
**Stack:** React 18 + Vite + Zustand + Tailwind + Supabase + Azure TTS  
**Repo:** DavidGordonLang/LearningLithuanian, branch: `dev`  
**Auto-deploys:** Vercel on push to `dev`  
**Owner:** David (Edinburgh) + Barbora. David is the solo developer.

---

## BETA 3.0.0 RELEASE GOALS (DO NOT SCOPE CREEP)

1. All 12 sections complete and peer reviewed
2. Exam section — 10 examples each of reading, listening, writing — peer reviewed
3. Light/dark theme (Samsung Internet fix included)
4. UI polish pass

**Then:** Push to ~50 beta testers → gather analytics → investor pitch.

---

## WORKING STYLE

- Plan before code. David reviews plans before any code is written.
- Targeted patches only. Never refactor working code.
- Always validate content files with Node before packaging.
- Always use `present_files` tool.
- David commits via GitHub web UI, Vercel auto-deploys.
- David tests on Android (Samsung phone, Chrome + Samsung Internet).
- Voice transcription sometimes garbles David's messages — interpret charitably.
- David provides latest repo zip at the start of each session.

---

## CURRENT STATUS

### Sections built:
- **Section 1 — First Contact:** Complete. 4 modules + section checkpoint. Peer review pass pending (native speaker, after all 12 sections built).
- **Section 2 — Core Conversation Patterns:** Built. Needs David's full review pass (same sheet format as Section 1).
- **Sections 3–12:** Not yet built.

### Exam section: Not yet built.
### Light/dark theme: Not yet built. Palette agreed — see UI section below.

---

## CURRENT OPEN ISSUE (START HERE)

**Section complete screen is not firing after completing Section 1.**

### What should happen:
NailedIt (last lesson) → VocabSave → **Section Complete screen** → Continue to Section 2 / Learning Home

### What is actually happening:
After VocabSave, jumps straight to Section 2 Lesson 1. Section complete screen never appears.

### Root cause history:
This bug has been fixed and re-introduced multiple times due to merges. The core problem is that the section complete check gets nested inside a `!hasSeenModuleComplete(mod.id)` guard. When a module complete screen fires earlier in the section, `markModuleCompleteSeen` is called. Later, when the section checkpoint's NailedIt fires, the guard returns `true` and skips the entire block including the section complete check.

### The correct logic in `TrainingView.jsx` `onNailedItContinue`:

```js
const modComplete = mod && isModuleFullyComplete(mod);
const secComplete = sec && isSectionFullyComplete(sec) && !hasSeenSectionComplete(sec.id);
const modAccuracy = ...;

// Section complete MUST run independently of hasSeenModuleComplete
if (modComplete && secComplete) {
  if (!hasSeenModuleComplete(mod.id)) markModuleCompleteSeen(mod.id, user?.id);
  markSectionCompleteSeen(sec.id, user?.id);
  setSectionCompletePayload({ ... });
  setPendingSectionComplete(true);
  setVocabSaveModule(checkpoint);
  setScreen("vocabSave");
} else if (modComplete && !hasSeenModuleComplete(mod.id)) {
  markModuleCompleteSeen(mod.id, user?.id);
  setScreen("moduleComplete");
} else if (handleNextLesson) {
  handleNextLesson();
} else {
  setScreen("home");
}
```

Also check: `isModuleFullyComplete` must handle checkpoint modules (which have `blocks` not `lessons`):
```js
const isModuleFullyComplete = (mod) => {
  if (!mod) return false;
  if (Array.isArray(mod.lessons)) return mod.lessons.every(l => completedLessonIds.includes(l.id));
  if (mod.blocks && mod.id) return completedLessonIds.includes(mod.id); // checkpoint
  return false;
};
```

Also check: `onNailedItContinue` lookup must find checkpoint modules (which have no `lessons` array):
```js
outer: for (const s of allSections) {
  for (const m of (s.modules || [])) {
    if ((m.lessons || []).find(l => l.id === completedLessonId)) { mod = m; sec = s; break outer; }
    if (m.blocks && m.id === completedLessonId) { mod = m; sec = s; break outer; } // checkpoint
  }
}
```

### Testing: 
Dev mode button `⚡ Complete Section 1 Full Flow` exists in TrainingHome. It marks all lessons complete, marks all modules seen, then drops into vocabSave → sectionComplete flow. **Verify this button actually fires the section complete screen before testing manually.**

---

## ARCHITECTURE

### File structure:
```
src/
  content/learning/
    section1/
      index.js, module_1_1.js, module_1_2.js, module_1_3.js, module_1_4.js
      checkpoint_1.js, profile.js
    section2/
      index.js, module_2_1.js, module_2_2.js, module_2_3.js, module_2_4.js
      checkpoint_2.js
  stores/
    gameStore.js        — XP, streaks, completedLessonIds, seenModuleCompleteIds,
                          seenSectionCompleteIds, lessonXP
    settingsStore.js    — userName, fromCountryCode, livesInCountryCode, phoneticsMode
  views/
    TrainingView.jsx    — allSections = [section1, section2], all screen routing
    training/
      LearningHome.jsx        — section list (allSections prop, onOpenSection handler)
      LearningLessonView.jsx  — all block renderers
      ModuleCompleteView.jsx
      SectionCompleteView.jsx — portal-based, phases: burst → card
      VocabSaveView.jsx
  hooks/
    useWordAudio.js     — playing state ("normal"|"slow"|null)
    useDailyRecall.js   — excludes Numbers category and LT number words
  components/
    audio/InteractivePhraseText.jsx  — word-tap glow animations
```

### Section factory pattern:
Every section is a factory function `createSectionN(profile)`. Modules within are also factory functions. The profile carries `userNameSafe`, `userFromPhrase`, `userFromCountryLtGenitive`, `userLivesInCountryLtLocative` etc. Section 2 currently reuses section1Profile.

### Block types:
`learn`, `listen_mcq`, `recognise_mcq`, `best_response`, `speak_self_check`, `build_phrase`, `scenario_chain`, `word_match`

---

## AUDIO RULES BY BLOCK TYPE

| Block | Audio behaviour |
|---|---|
| `learn` | Audio icon plays full phrase. Word-tap on LT text. |
| `listen_mcq` | Audio icon plays prompt. Word-tap on LT prompt text. EN options — never play. |
| `recognise_mcq` Form A | LT prompt + EN options → silent on options |
| `recognise_mcq` Form B | EN prompt + LT options → play correct LT after reveal. Word-tap after reveal. |
| `best_response` | LT options → play correct on select, play correct after 600ms if wrong. Word-tap after reveal. `noOptionAudio: true` on block disables all option audio. |
| `speak_self_check` | Audio icon plays targetText. Word-tap on target phrase. |
| `build_phrase` | Play answerText on correct completion only. No token audio. |
| `scenario_chain` | System plays each step's audioText automatically. Word-tap in bubbles. |
| `word_match` | Play correct pair's LT audio on correct match only. No audio on wrong match. |

**NEVER play TTS on English text.**

---

## CONTENT RULES

- Lithuanian names only in content: Davidas, Barbora, Rokas, Ona
- Scenario step counts by lesson: 2→3→3→4→5 (L1→L2→L3→L4→Checkpoint)
- Word match: always last block in checkpoint, always exactly 20 pairs
- `helperText`: only on `other` (system) bubble steps, never on user response options
- Don't repeat vocabulary between section checkpoints (each module checkpoint tests that module only)
- Nouns: weave in 3–5 practical nouns per module in learn blocks (`core: false, saveable: true`)
- Option text: never mix LT words with English explanations using a dash (e.g. `"Jūs — polite form"`) — this causes TTS to read the English. Keep options clean.
- `Prašom` = you're welcome (response to ačiū). `Prašau` = please / here you go. Don't mix them.

---

## VOCABULARY TAUGHT — SECTION 1

Key phrases (not exhaustive): Laba diena, Labas, Labas rytas, Labas vakaras, Viso gero, Iki, Ačiū, Atsiprašau, Atleiskite, Prašau, Prašom, Taip, Ne, Kaip sekasi, Gerai, Puiku, Malonu susipažinti, Man irgi, Mano vardas, Koks jūsų/tavo vardas, Iš kur jūs esate/tu esi, Aš esu iš [country], Aš kalbu šiek tiek/truputį lietuviškai, Nesuprantu, Suprantu, Pakartokite prašau, Prašau kalbėkite lėčiau, Dar kartą prašau, Ką tai reiškia, Ar jūs kalbate angliškai, Ar galiu/galime/galite, Man reikia pagalbos, Kur yra [place], Ar tai/ten [place], Tu/Jūs distinction, Ar galiu čia atsisėsti, Norėčiau kavos.

Known nouns: restoranas, parduotuvė, viešbutis, bankas, vaistinė, autobusų stotelė, stotis, tualetas.

---

## VOCABULARY TAUGHT — SECTION 2

**2.1:** Noriu/Man reikia/Turiu/Neturiu/Ar turite. Nouns: kava, vanduo, bilietas, kortelė, meniu, arbata, sultys, sumuštinis, vaistai, pasas, raktas, laikraštis, kambario raktas.

**2.2:** Ar galiu/galime/galite (full), Aš galiu/negaliu, Ar galima. Nouns: kėdė, vieta, kelias, taksi, kavinė, grynaisiais, mokėti kortele.

**2.3:** Šitas/tas, šitie/tie, noriu šito/to/šitų/tų, kuris/kurie, geresnis, tinka, šito ne to. Nouns: duona, obuolys, sūris, gėlės, vaisiai, daržovės, batas, striukė, dydis.

**2.4:** Kas/Ko, Kur (expanded), Kas jis/ji/čia, Kada + dabar/vėliau/rytoj, Kiek…kainuoja, brangu, nebrangiai. Nouns: žuvis, mėsa, sriuba, kaimynas, šeima, kaina, turgus, eurai, centai.

---

## KEY BUGS FIXED (DO NOT RE-INTRODUCE)

1. **Section complete nested in module complete guard** — see CURRENT OPEN ISSUE above
2. **Checkpoint lookup** — `onNailedItContinue` must check `m.blocks && m.id === completedLessonId` for checkpoints (no `lessons` array)
3. **isModuleFullyComplete** — must handle checkpoint modules via `completedLessonIds.includes(mod.id)`
4. **Browse course** — `onBrowseCourse` goes to `"learningHome"` (section list), NOT `"learningSection"` directly
5. **IPT (InteractivePhraseText)** — `playText` always passed through regardless of whether audio icon is present. `noOptionAudio: true` on block disables option audio.
6. **Daily recall numbers** — excluded by both `Category === "Numbers"` AND `LT_NUMBER_WORDS` regex (starter pack has no Numbers category)
7. **Word match wrong match** — no audio on wrong, only on correct
8. **Samsung Internet dark mode** — deferred until light/dark theme build
9. **Phrase match** — Levenshtein character similarity fallback (≥0.82) for targets ≤3 words (handles diacritic mis-transcription by speech API)
10. **LearningHome** — fully rewritten to accept `allSections` prop, renders progress per section

---

## SECTION COMPLETE SCREEN

**File:** `src/views/training/SectionCompleteView.jsx`  
Portal-based (renders into `document.body` to escape swipe pager transforms).  
Phase 1: Full-screen emerald burst ~2s. Phase 2: Celebration card.  
Card shows: section badge, title, stats (XP/accuracy/modules), module pills with checkmarks, "Now you can…" highlights, two buttons only: **Continue to Section 2** and **Learning home** (no Save Vocabulary — that already happened).

**Flow:** NailedIt → VocabSave → (pendingSectionComplete flag) → SectionComplete

---

## UI / THEME (NOT YET BUILT)

Build after all 12 sections complete.

**Palette agreed:**
- Sage accent: `#6B8F6E`
- Background: `#EDE0C8` (warm parchment)
- Card: `#F5EDDA`
- Inset: `#E8E0CE`
- Header: `#E4D6BC`

Architecture: CSS custom properties + `prefers-color-scheme` media queries + `data-theme` attribute override. This will permanently fix Samsung Internet dark mode by providing genuine light/dark signals.

---

## SECTION 3 — NEXT TO BUILD

Once section complete is verified working, build Section 3. Before writing any code:
1. David provides Section 3 curriculum docs (content blueprint + delivery blueprint + Lithuanian draft)
2. Read all existing section content to audit what's already been taught
3. Plan before building — David reviews and approves before any files are created
4. Validate with Node before packaging
5. Package all new files + updated TrainingView.jsx (add section 3 to allSections)

Content rules for new sections: same factory pattern, same block types, same word match 20-pair requirement, weave in practical nouns, scenarios must make real-world sense.

---

## DEV MODE BUTTONS (in TrainingHome when dev toggle on)

- `⚡ Test Module X Complete (screen only)` — fires module complete screen with dummy stats
- `⚡ Test Section X Complete (screen only)` — fires section complete screen with dummy stats
- `⚡ Complete Section X Full Flow` — marks all lessons complete, marks all modules seen, drops into vocabSave → sectionComplete real flow

---

## KNOWN PARKED ISSUES

- Mic button clunky on some Android — Web Speech API timing, low priority
- Samsung Internet visual difference — deferred until light/dark theme
- Old saved Notes with `||` format showing both sides — pre-fix library data, unfixable without re-enriching
- Section 2 needs full review pass by David (same sheet format as Section 1)

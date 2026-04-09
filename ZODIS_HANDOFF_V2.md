# ZODIS_HANDOFF_V3.md
# Žodis PWA — Developer Handoff Document
# Last updated: April 2026 — post full sections 1–3 review pass

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

### Sections built and tested:
- **Section 1 — First Contact:** Complete. 4 modules (1.1–1.4) + section checkpoint (1.SCP). Full block-by-block testing complete. Section complete screen fires correctly. Peer review (native speaker) pending until all 12 sections built.
- **Section 2 — Core Conversation Patterns:** Complete. 4 modules (2.1–2.4) + section checkpoint (2.SCP). Full block-by-block testing complete. Section complete screen fires correctly.
- **Section 3 — Numbers and Quantities:** Complete. 4 modules (3.1–3.4) + section checkpoint (3.SCP). Full block-by-block testing complete. Section complete screen fires correctly.
- **Sections 4–12:** Not yet built.

### Exam section: Not yet built.
### Light/dark theme: Not yet built. Palette agreed — see UI section below.

---

## CURRENT OPEN BUGS — START HERE

Work through these in order. After each fix is confirmed working, move to the next.

### 1. Section Complete "Continue to Section X" — wrong number
After completing Section 2, the button reads "Continue to Section 2" instead of "Continue to Section 3". The next-section label is deriving from the current section number rather than incrementing it. Fix the label logic in `SectionCompleteView.jsx` or wherever that button text is generated.

### 2. TTS playing on English-only options (module 2.3.5, blocks 2, 3, 4)
The "Pattern to Notice" lesson has three blocks where all answer options are English. TTS is firing on these when it shouldn't. The `noOptionAudio: true` flag is set on block 4 but not blocks 2 and 3. Block 2 and 3 need `noOptionAudio: true` added to the content, OR the block renderer needs to detect English-only options and suppress audio automatically. Block 4 has a mixed LT/EN correct answer — only the LT portion should play.

**Location:** `src/content/learning/section2/module_2_3.js` — lesson 2.3.5, blocks 2 and 3.

### 3. Unsaved phrases not surfaced at section complete
When a user skips vocab save at module complete during a section, those phrases are never offered again. The section-level `VocabSaveView` only surfaces phrases from the final checkpoint module, not phrases from the full section that were never saved. The section vocab save should collect all saveable phrases across all modules in the section where `saved !== true`, and present them all in one pass.

**Files to review:** `VocabSaveView.jsx`, `TrainingView.jsx` (how `vocabSaveModule` is set before `sectionComplete` fires).

---

## KNOWN ISSUES — PARKED (not blocking, fix later)

### Content issues (require content file edits, no code change)
- **"Imu" used in 3.2.2 scenario before being taught** — "imu" introduced at 3.2.4. Add helper text in 3.2.2 scenario step or remove "Gerai, imu!" from that scenario.
- **"O" (and/but) used before being taught** — 1.4.2 scenario. User selects "Ačiū! O restoranas?" without "O" being introduced. Add a brief note in 1.4.2 learn block or replace the line.
- **"Prie" (near/by) used but never taught** — 1.4.3 and 1.SCP scenarios. It's system dialogue so user doesn't produce it, but it appears untranslated. Add `helperText` on those specific system steps.
- **"Dešimtą" in 2.4.4 scenario** — numbers are taught in Section 3; a specific time reference using a number shouldn't appear in Section 2. Replace with "vėliau" or restructure.
- **"Kambario" in 2.1.C scenario never taught** — hotel room scenario uses "kambario" (room) without it being introduced. Add to 2.1 intro vocab or replace scenario.
- **"Autobusų stotelė" in 1.3.C before formally taught** — formally introduced at 1.4.3. Replace in 1.3.C scenario with "stotis" (already known) or add helper text.
- **2.SCP Block 15 payment flow logically reversed** — user confirms card is possible, then correct response is "I don't have cash, I have a card." Steps are in wrong order. Rewrite final steps.
- **2.3.C Block 6 — system asks price question** — price question is placed on system side but should be user's line. Swap roles.
- **3.SCP Block 1 — holding up fifteen fingers is implausible** — replace with a price or age context.
- **3.3.4 scenario — Zodis has last word problem** — user says "Iki", Zodis responds "Iki", then user is forced to respond again. Final step should be a system line, not a user pick.
- **3.3.5 scenario — random extra question at end** — the final two steps don't follow naturally. Rewrite.
- **Several scenarios across 2.2–2.4 with poor flow or unclear user role** — noted in detail in the block review sheet. Flag for content rewrite pass before beta.
- **Number form changes not explained** — when numbers appear in sentences (trijų, dviejų, dvidešimt as "dvi" etc.) the forms change with no explanation. Add a "Pattern to Notice" style note in 3.1.4 or 3.1.C — plain language, no grammar terminology.

### UX improvements (require design decisions before coding)
- **Show translation after user selects correct scenario answer** — currently no feedback on what the user's selection meant. Show brief translation beneath selected bubble before conversation continues.
- **Helper text not prominent enough** — users skip it. Suggested fix: green left-border accent or subtle colour treatment to match existing visual language. Needs design sign-off.
- **Wrong answer should show English translation** — when incorrect and correct answer highlighted in green, show the English meaning beneath it for retention.
- **Word match UI too cramped** — needs more generous spacing between tiles. Dedicated CSS/layout pass on `WordMatchBlock`.
- **Nouns only appearing in match pairs** — practical nouns (kepurė, knyga, batas, etc.) only ever appear in checkpoint match pairs. Should be woven into scenarios and other blocks where possible.
- **User age in profile for personalisation** — "How old are you?" scenarios would feel more natural if the user's real age was reflected. Add DOB or age to `settingsStore` profile.
- **Scenario: system should have last word in natural closings** — when a farewell is the natural end, the final step should be a system line, not a user pick forcing an artificial continuation.

### Audio issues (Azure TTS quirks — low priority)
- **TTS splitting short words** — Iki, Čia, Dydis, Tie all pronounced with a mid-word pause. Test SSML phoneme overrides or `audioText` substitutions. Separate session.
- **STT near-match rejection** — "Ans esu iš Skotijos" for "Aš esu iš Škotijos", "Ar kalima mokyti kortele" for "Ar galima mokėti kortele", "Trys dešimt" for "trisdešimt" all rejected. Review Levenshtein similarity threshold — may need to be lowered slightly for longer phrases.
- **Audio preloading gaps** — noted at 2.SCP and 3.SCP. Some audio plays late or after user advances. Preload list for longer lessons isn't covering all blocks. Review preload logic in LessonLoadingScreen.
- **Mic jankiness on first attempt** — consistent across all speak blocks. Browser microphone initialisation delay. Consider silent audio context warmup on lesson load.

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
    section3/
      index.js, module_3_1.js, module_3_2.js, module_3_3.js, module_3_4.js
      checkpoint_3.js
  stores/
    gameStore.js        — XP, streaks, completedLessonIds, seenModuleCompleteIds,
                          seenSectionCompleteIds, lessonXP
    settingsStore.js    — userName, fromCountryCode, livesInCountryCode, phoneticsMode
  views/
    TrainingView.jsx    — allSections = [section1, section2, section3], all screen routing
    training/
      LearningHome.jsx        — section list (allSections prop, onOpenSection handler)
      LearningLessonView.jsx  — all block renderers
      ModuleCompleteView.jsx
      SectionCompleteView.jsx — portal-based, phases: burst → card
      VocabSaveView.jsx
      SequenceDebugView.jsx   — dev only, full lesson queue with jump-to buttons
  hooks/
    useWordAudio.js     — playing state ("normal"|"slow"|null)
    useDailyRecall.js   — excludes Numbers category and LT number words
  components/
    audio/InteractivePhraseText.jsx  — word-tap glow animations
```

### Section factory pattern:
Every section is a factory function `createSectionN(profile)`. Modules within are also factory functions. The profile carries `userNameSafe`, `userFromPhrase`, `userFromCountryLtGenitive`, `userLivesInCountryLtLocative` etc. Sections 2 and 3 currently reuse section1Profile.

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
- `Ačiū labai` is correct Lithuanian (confirmed). Do not change to "Labai ačiū".
- Never use `dešimtą` or specific number references in Section 2 scenarios — numbers aren't taught until Section 3.

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

## VOCABULARY TAUGHT — SECTION 3

**3.1:** Numbers 0–100 (nulis–šimtas). Numbers changing form in sentences introduced (trijų bilietų, dviejų bilietų, dvi kavas etc.) — note: the form-change rule is NOT yet explained to users; this is a known gap flagged for a "Pattern to Notice" block to be added. Nouns: minutė, valanda.

**3.2:** Kiek kainuoja/šitas/tas kainuoja, Tai kainuoja [amount], grynieji/kortelė, Turiu grynųjų/kortelę, Ar galima mokėti kortele, Grynaisiais ar kortele, brangu/per brangu/nebrangiai, tinka, imu, Noriu sumokėti, Sąskaitą prašau, Žinoma. Nouns: knyga, sąskaita, kepurė.

**3.3:** Kiek valandų, Kelinta valanda, ordinal time forms (viena/trečia/penkta/dešimta valanda), dabar/vėliau/šiandien/rytoj, Kada pradedame/einame/išvyksta autobusas/tai prasideda, Pradedame/Susitinkame/Autobusas išvyksta [time] valandą, Kada atsidaro/užsidaro, Palaukite prašau, Devintą valandą. Nouns: autobusas, traukinys, susitikimas.

**3.4:** Kiek jums/tau metų, Man [number] metų, Kiek bilietų/kavų, Du bilietai/Trys kavos prašau, daugiau/mažiau, Dar vieną prašau, Daugiau vandens prašau, Ar dar, Pakanka/Nepakanka/Užtenka, Ar užtenka, Nepakanka laiko/pinigų, Mes esame du, Viena kava ir dvi arbatos, Kiek jūsų. Nouns: pinigai, žmonės.

---

## KEY BUGS FIXED (DO NOT RE-INTRODUCE)

1. **Section complete nested in module complete guard** — `secComplete` check runs independently of `hasSeenModuleComplete`. See onNailedItContinue logic in TrainingView.
2. **Section checkpoint invisible to navigation** — `findNextLesson` and `findLessonAfter` both check `module.isSectionCheckpoint` before the `status !== "active"` guard. All three checkpoint files have `status: "active"` added explicitly.
3. **Checkpoint lookup in onNailedItContinue** — checks `m.blocks && m.id === completedLessonId` for checkpoint modules (no `lessons` array).
4. **isModuleFullyComplete** — handles checkpoint modules: `if (mod.blocks && mod.id) return completedLessonIds.includes(mod.id)`.
5. **learningSection / learningModule resolution for section checkpoints** — both useMemos check `mod.isSectionCheckpoint && mod.id === selectedLessonId`.
6. **Build phrase last-block blocker** — `showNavBar` no longer hides on `isLastBlockComplete`. Next button `disabled` no longer includes `|| isLastBlock`. Fixes any lesson whose last block is build_phrase, learn, or speak_self_check.
7. **Scenario answer tray not scrolling** — `trayRef` on options tray div + `scrollIntoView` effect fires when `assistantVisible` becomes true. Both in `ScenarioChainBlock`.
8. **Browse course** — `onBrowseCourse` goes to `"learningHome"` (section list), NOT `"learningSection"` directly.
9. **IPT (InteractivePhraseText)** — `playText` always passed through. `noOptionAudio: true` on block disables option audio.
10. **Daily recall numbers** — excluded by both `Category === "Numbers"` AND `LT_NUMBER_WORDS` regex.
11. **Word match wrong match** — no audio on wrong, only on correct.
12. **Phrase match** — Levenshtein character similarity fallback (≥0.82) for targets ≤3 words.
13. **LearningHome** — accepts `allSections` prop, renders progress per section.

---

## SECTION COMPLETE SCREEN

**File:** `src/views/training/SectionCompleteView.jsx`  
Portal-based (renders into `document.body` to escape swipe pager transforms).  
Phase 1: Full-screen emerald burst ~2s. Phase 2: Celebration card.  
Card shows: section badge, title, stats (XP/accuracy/modules), module pills with checkmarks, "Now you can…" highlights, two buttons: **Continue to Section [N+1]** and **Learning home** (no Save Vocabulary — that already happened).

**Flow:** NailedIt → VocabSave → (pendingSectionComplete flag) → SectionComplete

**Known bug:** Button currently says "Continue to Section 2" regardless of which section just completed. Fix needed — see Open Bugs above.

---

## DEV MODE (in TrainingHome when dev toggle on)

- `⚡ Test Module X Complete (screen only)` — fires module complete screen with dummy stats
- `⚡ Test Section X Complete (screen only)` — fires section complete screen with dummy stats
- `⚡ Prime Section X for Flow Test` — marks all non-checkpoint lessons complete, clears section-seen flag, navigates to section checkpoint — lets you play the checkpoint live and verify the full NailedIt → VocabSave → SectionComplete flow fires correctly
- `⚡ Sequence Walker` — opens `SequenceDebugView`: full list of every lesson in queue order with ✓ on completed ones and a **Jump here** button that marks all prior lessons complete and drops you into that lesson. Use this instead of manual full-section runs.

---

## UI / THEME (NOT YET BUILT)

Build after all 12 sections complete.

**Palette agreed:**
- Sage accent: `#6B8F6E`
- Background: `#EDE0C8` (warm parchment)
- Card: `#F5EDDA`
- Inset: `#E8E0CE`
- Header: `#E4D6BC`

Architecture: CSS custom properties + `prefers-color-scheme` media queries + `data-theme` attribute override. This will permanently fix Samsung Internet dark mode.

---

## SECTION 4+ — NEXT TO BUILD

After the open bugs above are fixed, build Section 4 onwards. Before writing any code:
1. David provides curriculum docs (content blueprint + delivery blueprint + Lithuanian draft)
2. Read all existing section content to audit what's already been taught
3. Plan before building — David reviews and approves before any files are created
4. Validate with Node before packaging
5. Package all new files + updated TrainingView.jsx (add new section to allSections)

Content rules for new sections: same factory pattern, same block types, same word match 20-pair requirement, weave in practical nouns, scenarios must make real-world sense, do not reference vocabulary not yet taught.

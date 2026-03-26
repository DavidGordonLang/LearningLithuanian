# Žodis — Full Development Handoff V2
## For: New Claude chat session
## Date: March 2026
## Prepared by: Claude Sonnet (previous session)

---

## HOW WE WORK

- The developer (David) tests on his Android phone and reports issues with screenshots and detailed block-by-block testing sheets
- Changes are made in targeted patches — never refactor working code, never touch files that aren't directly relevant to the change
- Before writing any code, discuss the plan first and get confirmation
- David sometimes uses voice transcription which can garble messages — read charitably and confirm understanding before acting
- David is learning Lithuanian himself as he builds this — language feedback is welcome but flag it clearly as a suggestion, not a correction
- When giving David files, always present them with `present_files` so he can download them directly
- Always validate content changes with node before presenting files
- A native speaker review pass is planned when all 12 sections are complete — don't get too hung up on linguistic perfection right now

---

## PROJECT OVERVIEW

**Žodis** — Lithuanian language learning PWA for English speakers. Real beta product with users.

**Stack:** React 18 + Vite + Zustand + Tailwind CSS + Supabase (auth + DB) + Azure TTS (lt-LT-LeonasNeural) + OpenAI GPT-4.1-mini

**Repo:** DavidGordonLang/LearningLithuanian — branch: `dev`

**Deployment:** Vercel (auto-deploys from dev branch)

---

## CRITICAL RULES — NEVER VIOLATE

### Audio Rules (ABSOLUTE)

**NEVER play TTS on English text. Only Lithuanian audio ever.**

| Block type | Audio behaviour |
|---|---|
| `learn` | Audio icon button plays `audioText` on tap only |
| `listen_mcq` | Audio icon plays `prompt.audioText`. Options are English — NEVER play on tap |
| `recognise_mcq` Form A | Lithuanian prompt + English options → **completely silent on tap** |
| `recognise_mcq` Form B | English prompt + Lithuanian options → play correct LT option on tap |
| `best_response` | Lithuanian options → play selected if correct; play correct after 600ms if wrong |
| `speak_self_check` | Audio icon plays `audioText`. No auto-play |
| `build_phrase` | Play `answerText` on correct completion only |
| `scenario_chain` | System plays each step's `audioText` automatically. NEVER play option text |
| `word_match` | Play correct pair's LT `audioText` on correct match |

**Form A vs Form B detection:**
- Form A: `block.prompt.audioText` exists → English options → SILENT
- Form B: `block.prompt.audioText` is absent → Lithuanian options → play audio

### Never Break These

1. **`key={learningLesson?.id}`** on `LearningLessonView` in `TrainingView.jsx` — prevents state bleed between lessons. GPT has removed this twice. It must stay.

2. **`earnLessonXP` not `earnXP`** — best-score logic in gameStore. Never replace.

3. **`[lesson?.id, preloadText]`** in preload useEffect deps — not `[lesson, preloadText]`

4. **`onLessonComplete({ wrongAnswers, scoreableBlocks, xpAwarded })`** — always passes metrics. Never simplify to `onLessonComplete?.()`.

5. **Scenario wrong answers** — brief red flash (600ms), retry until correct, wrong tap counts against XP via `onWrongAnswer?.()`. Never reveal the correct answer.

6. **`helperText` on scenario steps** — shown as small italic grey line above system bubbles only, never on user response options. Currently only used in Module 1.3 lessons 3 and 5 (checkpoint). The I Don't Understand module (lessons 1, 2, 4) intentionally has NO helper text — the point is the user should feel mild confusion and use repair phrases.

---

## FILE STRUCTURE

```
src/
  content/learning/
    section1.js              ← re-export: export { default } from "./section1/index.js"
    section1/
      index.js               ← factory: createSection1(profile) — must import all modules
      module_1_1.js          ← static export (COMPLETE)
      module_1_2.js          ← factory: createModule_1_2(profile) (COMPLETE)
      module_1_3.js          ← factory: createModule_1_3(profile) (COMPLETE)
      module_1_4.js          ← TO BUILD (see below)
      profile.js             ← buildSection1Profile({userName, fromCountryCode, livesInCountryCode})
  constants/
    countries.js             ← COUNTRIES array with codes + Lithuanian forms
  stores/
    gameStore.js             ← XP, streaks, lessonXP (best-score), completedLessonIds
    settingsStore.js         ← userName, fromCountryCode, livesInCountryCode, speakerGender
  views/
    TrainingView.jsx         ← Main router — has key prop, profile wiring, dev buttons
    SettingsView.jsx         ← Has "Your profile" section with name + country fields
    training/
      LearningLessonView.jsx ← All block renderers — ConversationBubble has helperText prop
      ModuleCompleteView.jsx ← Module celebration screen
      VocabSaveView.jsx      ← Post-module phrase save
      TrainingHome.jsx       ← XP strip + dev mode buttons
  index.css                  ← Custom mic CSS classes + cross-browser fixes
index.html                   ← PWA meta tags
```

---

## PROFILE PERSONALISATION

Settings store: `userName`, `fromCountryCode`, `livesInCountryCode`

`buildSection1Profile()` returns:
- `userNameSafe` — cleaned name, fallback "Davidas"
- `userFromPhrase` — e.g. "Aš esu iš Škotijos"
- `userFromCountryLtGenitive` — e.g. "Škotijos"
- `userFromCountryLabelEn` — e.g. "Scotland"
- `userLivesInCountryLtLocative` — e.g. "Lietuvoje"

**Where to use in module content:**
- `speak_self_check.targetText` containing "I am from" phrases
- Scenario option `.text` (not `.audioText`) for first-person "I am" / "I am from" responses
- Never substitute in `audioText` fields — those stay as fixed Lithuanian for TTS

Module factory pattern:
```js
export default function createModule_1_X(profile = {}) {
  const { userNameSafe = "Davidas", userFromPhrase = "Aš esu iš Škotijos" } = profile;
  return { ...module definition... };
}
```

---

## XP AND SCORING

- Base 30 XP per lesson, -2 per wrong answer, floor 10 XP
- Scoreable: `recognise_mcq`, `listen_mcq`, `best_response`, `scenario_chain`
- Exempt: `speak_self_check`, `build_phrase`, `learn`, `word_match`
- `earnLessonXP` — best-score only, awards positive delta
- Accuracy % shown on NailedItCard: "Nailed it!" ≥90%, "Well done!" <90%
- Module accuracy accumulated across all lessons, shown on ModuleCompleteView

---

## NAVIGATION FLOW

```
Training home
  → Continue → LearningLessonView (key={lesson.id})
  → NailedItCard → onNailedItContinue(lesson.id)
    → [module complete + not seen] → ModuleCompleteView
      → [Save vocab] → VocabSaveView → findNextLesson → LearningLessonView
      → [Continue] → findNextLesson → LearningLessonView
    → [else] → findNextLesson → LearningLessonView
```

`onNailedItContinue` receives `lesson.id` and walks `allSections` to find the correct module — this is important, do not simplify.

---

## DEV MODE

Toggle in TrainingHome. Persisted in localStorage as `zodis_dev_mode`.

When on:
- All lessons unlocked
- Separate "⚡ Test Module X.X Complete" button per active module
- Buttons built dynamically from `allSections.flatMap(...)` in TrainingView

---

## CONTENT RULES

### Names policy
- Lithuanian names only: Davidas (→ profile), Barbora, Rokas, Ona
- Names in learn blocks: NOT used (removed) — generic phrases only
- Names in scenarios: fine for context
- No Russian names or references anywhere

### Nouns policy
Always include useful nouns naturally in lessons. Already taught:
- kava, tualetas, stotis, autobusų stotelė, kolega/kolegė, draugas/draugė
- žodis (word — the app's own name!), ženklas (sign), vaistinė (pharmacy)
- cepelinai (introduced in 1.3 café scenario)

### Scenario rules
1. Only use phrases that have been taught in this lesson or earlier
2. Always include a `description` field — shown above chat
3. Use `helperText` on steps where the user needs context but the system speech is in Lithuanian they haven't learned yet — keeps it educational without blindsiding
4. Wrong taps: red flash, retry, count against XP
5. No correct answer reveal ever
6. Scenario length increases through a module: 2→3→3→4→5 steps (L1→L2→L3→L4→Checkpoint)

### helperText rules (IMPORTANT)
- Only on `other` (system) bubble steps
- Never on user response options
- Never in the "I Don't Understand" module scenarios (1.3 L1, L2, L4) — the point is the user should NOT understand. Only L3 (café) and L5 (checkpoint) have helpers in module 1.3
- Use format: "They say/ask [meaning] — but you don't understand." for IDU-adjacent scenarios
- Good for priming phrases that will be taught later — "Oh I recognise that" effect

### Word match
- Always last block in checkpoint
- Always exactly 20 pairs (module 1.3 has 22 — this was intentional to cover the extra vocabulary)
- No name-based pairs in word_match

### Block type token shuffling
`build_phrase` tokens shuffle on mount via `useMemo` — already implemented in `LearningLessonView.jsx`

---

## CURRENT OPEN BUG — SAMSUNG INTERNET UI DIFFERENCE

**Status:** Attempted fix deployed, issue persists. Needs fresh approach.

**What's happening:**
Samsung Internet renders the app differently from Chrome:
- Background appears pure black instead of the dark zinc + subtle teal gradient glow
- Card surfaces (which use `bg-black/20 backdrop-blur`) become invisible against pure black
- Mic button loses its ring/glow/disc appearance — looks flat and barely visible
- Overall the UI looks washed out and flat compared to Chrome

**What we've tried:**
1. Added `color-scheme: dark` to `:root`, `html`, `body`, `#root` in index.css
2. Added `<meta name="color-scheme" content="dark">` to index.html
3. Added `forced-color-adjust: none` on body
4. Added global `-webkit-backdrop-filter` patch via `[class*="backdrop-blur"]` selector
5. Added explicit `border` fallbacks to mic ring and iconBubble
6. Made mic disc background more opaque with solid `background-color` fallback
7. Added inline `style="background-color:#0a0a0b"` on body in index.html

**None of these fixed it fully.**

**Root cause hypothesis:**
Samsung Internet is likely stripping `rgba` alpha transparency on backgrounds — treating `bg-black/20` (rgba(0,0,0,0.20)) as fully transparent rather than 20% black. The body gradient in `body::before` uses large `radial-gradient` with rgba values which may also be getting dropped.

**Suggested next approaches to try:**
1. Replace `body::before` pseudo-element gradient with a real `<div>` element in `index.html` — pseudo-elements sometimes get stripped by aggressive browser themes
2. Change all `bg-black/20` card backgrounds to `bg-zinc-900` (fully opaque) — loses the glass effect but guarantees visibility everywhere
3. Try adding `@supports` blocks: `@supports not (backdrop-filter: blur(1px)) { .backdrop-blur { background-color: #18181b; } }`
4. Check Samsung Internet version on David's device — older versions may not support `forced-color-adjust`
5. Use Samsung Internet's built-in DevTools to inspect which specific properties are being overridden (Settings → About → tap version 5 times)

**Important note:** Chrome must remain pixel-perfect — David has spent significant time on the UI. Any fix must be tested in Chrome first to confirm no visual change before checking Samsung Internet.

---

## WHAT'S BUILT — SECTION 1 STATUS

| Module | Title | Status |
|---|---|---|
| 1.1 | Greeting and Politeness | ✅ Complete |
| 1.2 | Who I Am | ✅ Complete |
| 1.3 | I Don't Understand | ✅ Complete |
| 1.4 | Help and Contact | 🔲 TO BUILD |
| Section 1 Checkpoint | First Interaction | 🔲 TO BUILD |

---

## MODULE 1.4 — HELP AND CONTACT (TO BUILD)

### Lessons
1. **Can You Help Me?** — Ar galite man padėti?, Padėkite man prašau, Man reikia pagalbos
2. **What Is This? Is That…?** — Kas tai?, Kas ten?, Ar tai…?, Ar ten…?
3. **Where Is…?** — Kur yra tualetas?, Kur yra stotis?, Kur yra autobusų stotelė?
4. **Can I / Can We?** — Ar galiu?, Ar galime?, Ar galiu čia atsisėsti?, Ar galime pradėti?
5. **Tu / Jūs as a Pattern** — recognition only, not production mastery

### Key rules for 1.4
- Scenario steps: 2→3→3→4→5 (same pattern as 1.3)
- Lesson 5 (tu/jūs) is recognition-only — no speaking required, no scenarios that require production of tu/jūs forms
- "Ar galiu jums padėti?" appears in module 1.3 scenarios as a helper-text-explained phrase — in module 1.4 lesson 1 it gets properly taught
- Add useful nouns naturally: restoranas, viešbutis, parduotuvė, bankas
- Profile: use `userFromPhrase` where natural in scenarios
- Follow factory pattern: `export default function createModule_1_4(profile = {}) {...}`
- Add import to `section1/index.js`

### Content for 1.4 L3 (Where Is…?)
Per curriculum: keep places tight — tualetas, stotis, autobusų stotelė. Don't bloat into full places vocabulary yet.

---

## SECTION 1 CHECKPOINT — AFTER MODULE 1.4

Cross-module word_match pulling ~5 pairs from each of the 4 modules (best/most useful vocabulary). No verbatim repeats from module checkpoints.

Per curriculum, format:
1. Quick recognise warm-up (key phrases from all 4 modules)
2. Audio response selection
3. Guided produce (build phrase)
4. Speak prompt
5. Best response (situational)
6. Conversation chain (5-step scenario pulling from all modules)

---

## SECTION COMPLETE SCREEN — NEW FEATURE TO BUILD

**After** the Section 1 Checkpoint (which is the final lesson in section 1), instead of the standard `ModuleCompleteView`, a **Section Complete screen** should fire.

### What it needs to show
- Section title: "First Contact — Section 1 Complete"
- Total XP earned across the whole section
- Overall accuracy % across all modules
- A summary of what was learned (modules covered)
- Celebration feeling — bigger deal than a module complete
- Two actions: "Save vocabulary" (opens VocabSaveView for checkpoint word_match), "Continue" (goes to Section 2 when built, or home for now)

### How to detect it
In `TrainingView.jsx`, after `isModuleFullyComplete` fires for the Section 1 Checkpoint module:
- Check if ALL modules in the section are complete
- If yes → `isSectionFullyComplete` → fire SectionCompleteView instead of ModuleCompleteView
- Track with `hasSeenSectionComplete(section.id)` in gameStore (same pattern as `hasSeenModuleComplete`)

### Files to create/modify
- New: `src/views/training/SectionCompleteView.jsx`
- Modify: `TrainingView.jsx` — add `isSectionFullyComplete` check, `sectionCompletePayload` state, screen routing
- Modify: `gameStore.js` — add `seenSectionCompleteIds`, `hasSeenSectionComplete`, `markSectionCompleteSeen`

### Design direction
Similar to ModuleCompleteView but bigger — more prominent celebration, shows the 4 modules as a visual summary (each with a small checkmark), total section XP, total accuracy. Should feel like a genuine milestone.

---

## VOCAB SAVE

`VocabSaveView.jsx` — shown after module/section complete.

- Reads word_match pairs from checkpoint block
- Opt-in, nothing pre-selected
- Duplicate detection via `makeLtKey`
- API: `{ text: en, sourceLang: "en" }` (NOT `input`)
- Response fields: `phonetics`, `phonetics_ipa`, `en_natural`, `en_literal` (snake_case)
- After save: goes to next lesson via `findNextLesson`

---

## SETTINGS PERSONALISATION — ALREADY BUILT

SettingsView has "Your profile" section with:
- Name field → `userName` → `userNameSafe`
- "From" country dropdown → `fromCountryCode` → `userFromCountryLtGenitive`
- "Lives in" country dropdown → `livesInCountryCode` → `userLivesInCountryLtLocative`

All stored in Supabase `user_settings`. Module factories receive profile and substitute in self-referential phrases.

---

## THINGS PARKED FOR LATER

- Mic button clunky on some Android devices — timing issue with Web Speech API, low priority
- Light mode — parked until all lessons complete
- "Can't talk right now" skip on speak blocks
- Human audio recording to replace TTS — after all lessons complete
- Kas čia? vs Kas tai? — linguistic question flagged, leave for native speaker review

---

## PROMPT FOR NEW CHAT SESSION

Use this to start the new chat:

---

You are continuing development of Žodis, a Lithuanian language learning PWA. A full handoff document is in `ZODIS_HANDOFF_V2.md` in the repo root — read it entirely before writing any code.

I'm giving you the current repo zip. The handoff covers everything including critical audio rules, never-break rules, content structure, and what's next.

**Immediate priorities in order:**

1. **Fix Samsung Internet rendering** — the app looks different on Samsung Internet vs Chrome. Full details of what's been tried and what to try next are in the handoff Section "CURRENT OPEN BUG". Chrome must stay pixel-perfect — fix Samsung without breaking Chrome.

2. **Build module_1_4.js** — Help and Contact. Follow the exact same factory function pattern as module_1_3.js. Import it in section1/index.js. I'll give you the Section 1 curriculum documents for reference.

3. **Build Section 1 Checkpoint** — cross-module word_match + 5-step scenario. Details in handoff.

4. **Build SectionCompleteView** — fires after Section 1 Checkpoint completion. Bigger celebration than ModuleCompleteView. Shows total section XP and accuracy. Details in handoff.

**Rules:**
- Never touch audio logic
- Never remove key={learningLesson?.id} from TrainingView
- Always use factory pattern for new modules
- Test content with node before presenting files
- Discuss plan before writing code
- Make targeted changes only — do not refactor working code

The developer tests on Android (Samsung phone, Chrome and Samsung Internet). Screenshots and detailed testing sheets are provided after each build.

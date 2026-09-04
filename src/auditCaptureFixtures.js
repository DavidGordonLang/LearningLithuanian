import { IS_AUDIT_MODE } from "./auditMode";
import { useGameStore } from "./stores/gameStore";
import { usePhraseStore } from "./stores/phraseStore";
import { useScenarioStore } from "./stores/scenarioStore";
import { useSettingsStore } from "./stores/settingsStore";

export const IS_AUDIT_CAPTURE_MODE =
  IS_AUDIT_MODE &&
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("audit-capture") === "mobile";

const BASE_TS = Date.UTC(2026, 8, 4, 12, 0, 0);

function phrase({
  id,
  order,
  category,
  lithuanian,
  english,
  phonetic = "",
  phoneticIpa = "",
  usage = "",
  notes = "",
}) {
  return {
    _id: id,
    _ts: BASE_TS + order,
    Sheet: "Phrases",
    Category: category,
    Lithuanian: lithuanian,
    English: english,
    EnglishLiteral: english,
    EnglishNatural: english,
    EnglishOriginal: english,
    LithuanianOriginal: lithuanian,
    Phonetic: phonetic,
    PhoneticIPA: phoneticIpa,
    Usage: usage,
    Notes: notes,
    "RAG Icon": "🟢",
    _qstat: {
      red: { ok: 0, bad: 0 },
      amb: { ok: 0, bad: 0 },
      grn: { ok: 3, bad: 0 },
    },
    Source: "user",
    Touched: true,
    _deleted: false,
    _deleted_ts: null,
  };
}

export const AUDIT_CAPTURE_TRANSLATION = {
  input: "Laba diena.",
  result: {
    ltOut: "Laba diena.",
    categoryOut: "Social",
    phonetics: "lah-BAH dyeh-NAH",
    phoneticsIpa: "lɐˈbɐ dʲɪɛˈnɐ",
    enLiteral: "Good day.",
    enNatural: "Hello / good afternoon.",
    usageOut: "A polite daytime greeting suitable for shops, cafés, reception desks, and first meetings.",
    notesOut: "Tap either word to hear it on its own. Use Slow to hear the whole phrase at a reduced pace.",
    sourceLang: "lt",
  },
};

export const AUDIT_CAPTURE_PHRASES = [
  phrase({
    id: "audit-greeting-laba-diena",
    order: 160,
    category: "Social",
    lithuanian: "Laba diena.",
    english: "Hello / good afternoon.",
    phonetic: "lah-BAH dyeh-NAH",
    phoneticIpa: "lɐˈbɐ dʲɪɛˈnɐ",
    usage: "A polite daytime greeting for cafés, shops, reception desks, and first meetings.",
    notes: "Tap either word for individual audio. Long-press the play button for slower playback.",
  }),
  phrase({
    id: "audit-cafe-coffee",
    order: 150,
    category: "Food & Drink",
    lithuanian: "Norėčiau kavos, prašau.",
    english: "I’d like a coffee, please.",
    phonetic: "noh-REH-chow kah-VOHS prah-SHAU",
    phoneticIpa: "noːˈrʲeːt͡ʃʲɛʊ kɐˈvoːs prɐˈʃɐʊ",
    usage: "A natural, polite way to order coffee.",
  }),
  phrase({
    id: "audit-cafe-bill",
    order: 140,
    category: "Food & Drink",
    lithuanian: "Sąskaitą, prašau.",
    english: "The bill, please.",
    usage: "Use this when you are ready to pay in a café or restaurant.",
  }),
  phrase({
    id: "audit-cafe-card",
    order: 130,
    category: "Shopping",
    lithuanian: "Ar galima mokėti kortele?",
    english: "Can I pay by card?",
    usage: "A useful payment question in cafés, shops, and ticket offices.",
  }),
  phrase({
    id: "audit-cafe-water",
    order: 120,
    category: "Food & Drink",
    lithuanian: "Vandens, prašau.",
    english: "Water, please.",
  }),
  phrase({
    id: "audit-intro-name",
    order: 110,
    category: "Social",
    lithuanian: "Mano vardas Marta.",
    english: "My name is Marta.",
  }),
  phrase({
    id: "audit-intro-from",
    order: 100,
    category: "Social",
    lithuanian: "Aš esu iš Ukrainos.",
    english: "I am from Ukraine.",
  }),
  phrase({
    id: "audit-intro-meet",
    order: 90,
    category: "Social",
    lithuanian: "Malonu susipažinti.",
    english: "Nice to meet you.",
  }),
  phrase({
    id: "audit-directions-station",
    order: 80,
    category: "Travel",
    lithuanian: "Atsiprašau, kur yra autobusų stotis?",
    english: "Excuse me, where is the bus station?",
  }),
  phrase({
    id: "audit-directions-far",
    order: 70,
    category: "Travel",
    lithuanian: "Ar tai toli?",
    english: "Is it far?",
  }),
  phrase({
    id: "audit-directions-left",
    order: 60,
    category: "Travel",
    lithuanian: "Į kairę.",
    english: "To the left.",
  }),
  phrase({
    id: "audit-directions-straight",
    order: 50,
    category: "Travel",
    lithuanian: "Eikite tiesiai.",
    english: "Go straight.",
  }),
  phrase({
    id: "audit-rescue-understand",
    order: 40,
    category: "General",
    lithuanian: "Atsiprašau, nesuprantu.",
    english: "Sorry, I don’t understand.",
  }),
  phrase({
    id: "audit-rescue-again",
    order: 30,
    category: "General",
    lithuanian: "Dar kartą, prašau.",
    english: "Once again, please.",
  }),
  phrase({
    id: "audit-rescue-slowly",
    order: 20,
    category: "General",
    lithuanian: "Lėčiau, prašau.",
    english: "More slowly, please.",
  }),
  phrase({
    id: "audit-rescue-english",
    order: 10,
    category: "General",
    lithuanian: "Ar kalbate angliškai?",
    english: "Do you speak English?",
  }),
];

export const AUDIT_CAPTURE_SCENARIOS = [
  {
    id: "audit-scenario-cafe",
    title: "At a café",
    phraseIds: [
      "audit-cafe-coffee",
      "audit-cafe-water",
      "audit-cafe-bill",
      "audit-cafe-card",
    ],
    createdAt: BASE_TS,
    updatedAt: BASE_TS + 4,
  },
  {
    id: "audit-scenario-directions",
    title: "Finding your way",
    phraseIds: [
      "audit-directions-station",
      "audit-directions-far",
      "audit-directions-left",
      "audit-directions-straight",
    ],
    createdAt: BASE_TS + 1,
    updatedAt: BASE_TS + 5,
  },
  {
    id: "audit-scenario-introductions",
    title: "First introductions",
    phraseIds: [
      "audit-greeting-laba-diena",
      "audit-intro-name",
      "audit-intro-from",
      "audit-intro-meet",
    ],
    createdAt: BASE_TS + 2,
    updatedAt: BASE_TS + 6,
  },
  {
    id: "audit-scenario-rescue",
    title: "When words fail",
    phraseIds: [
      "audit-rescue-understand",
      "audit-rescue-again",
      "audit-rescue-slowly",
      "audit-rescue-english",
    ],
    createdAt: BASE_TS + 3,
    updatedAt: BASE_TS + 7,
  },
];

const AUDIT_COMPLETED_LESSON_IDS = [
  "section_1_module_1_lesson_1",
  "section_1_module_1_lesson_2",
  "section_1_module_1_lesson_3",
  "section_1_module_1_lesson_4",
  "section_1_module_1_checkpoint",
];

export function applyAuditCaptureFixtures() {
  if (!IS_AUDIT_CAPTURE_MODE) return;

  try {
    localStorage.setItem("lt_seen_user_guide", "true");
    localStorage.setItem("lt_last_seen_version", "3.0.0-beta");
    localStorage.setItem("lt_daily_recall_enabled", "0");
  } catch {}

  usePhraseStore.getState().setPhrases(AUDIT_CAPTURE_PHRASES);
  useScenarioStore.getState().setScenarios(AUDIT_CAPTURE_SCENARIOS);

  const settings = useSettingsStore.getState();
  settings.setSetting(null, "phoneticsMode", "en");
  settings.setSetting(null, "speakerGender", "female");
  settings.setSetting(null, "userName", "Marta");
  settings.setSetting(null, "fromCountryCode", "ukraine");
  settings.setSetting(null, "livesInCountryCode", "lithuania");
  settings.setSetting(null, "dateOfBirth", "1996-05-12");
  settings.setSetting(null, "profileOnboardingVersion", 2);
  settings.setSetting(null, "themeMode", "light");

  useGameStore.setState({
    totalXP: 685,
    streakDays: 12,
    lastActivityDate: "2026-09-04",
    completedLessonIds: AUDIT_COMPLETED_LESSON_IDS,
    seenModuleCompleteIds: ["module_1_1"],
    seenSectionCompleteIds: [],
    lessonXP: {
      section_1_module_1_lesson_1: 95,
      section_1_module_1_lesson_2: 90,
      section_1_module_1_lesson_3: 85,
      section_1_module_1_lesson_4: 95,
      section_1_module_1_checkpoint: 100,
    },
  });
}

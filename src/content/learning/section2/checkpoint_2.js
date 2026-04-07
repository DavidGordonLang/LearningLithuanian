// src/content/learning/section2/checkpoint_2.js
// Section 2 Checkpoint — Core Conversation Control

export default function createCheckpoint2(profile = {}) {
  const {
    userNameSafe = "Davidas",
    userFromPhrase = "Aš esu iš Škotijos",
  } = profile;

  return {
    id: "section_2_checkpoint",
    code: "2.C",
    title: "Core Conversation Control",
    purpose: "Bring the whole of Section 2 together. Real retrieval across all four modules.",
    isCheckpoint: true,
    isSectionCheckpoint: true,
    status: "active",
    supportLevel: "none",
    newLanguageLoad: "none",
    blocks: [

      // ── Block 1 — Quick Recognise Warm-Up ─────────────────────────────────
      {
        id: "s2c_b1",
        type: "recognise_mcq",
        title: "Choose the correct meaning",
        prompt: { text: "Noriu vandens.", audioText: "Noriu vandens" },
        options: [
          { id: "a", text: "I need water.", isCorrect: false },
          { id: "b", text: "I want water.", isCorrect: true },
          { id: "c", text: "I have water.", isCorrect: false },
        ],
      },

      {
        id: "s2c_b2",
        type: "recognise_mcq",
        title: "Choose the correct meaning",
        prompt: { text: "Aš negaliu suprasti.", audioText: "Aš negaliu suprasti" },
        options: [
          { id: "a", text: "I don't understand.", isCorrect: false },
          { id: "b", text: "I can't understand.", isCorrect: true },
          { id: "c", text: "I need to understand.", isCorrect: false },
        ],
      },

      {
        id: "s2c_b3",
        type: "recognise_mcq",
        title: "Choose the correct meaning",
        prompt: { text: "Kiek tai kainuoja?", audioText: "Kiek tai kainuoja" },
        options: [
          { id: "a", text: "What is this?", isCorrect: false },
          { id: "b", text: "Is this expensive?", isCorrect: false },
          { id: "c", text: "How much does this cost?", isCorrect: true },
        ],
      },

      // ── Block 2 — Guided Produce ───────────────────────────────────────────
      {
        id: "s2c_b4",
        type: "build_phrase",
        title: "Build the phrase",
        prompt: { text: "I need a ticket." },
        tokens: [
          { id: "t1", text: "Man", correctIndex: 0 },
          { id: "t2", text: "reikia", correctIndex: 1 },
          { id: "t3", text: "bilieto.", correctIndex: 2 },
          { id: "t4", text: "Noriu", isDistractor: true },
        ],
        answerText: "Man reikia bilieto.",
      },

      {
        id: "s2c_b5",
        type: "build_phrase",
        title: "Build the phrase",
        prompt: { text: "Do you have a menu?" },
        tokens: [
          { id: "t1", text: "Ar", correctIndex: 0 },
          { id: "t2", text: "turite", correctIndex: 1 },
          { id: "t3", text: "meniu?", correctIndex: 2 },
          { id: "t4", text: "galite", isDistractor: true },
        ],
        answerText: "Ar turite meniu?",
      },

      {
        id: "s2c_b6",
        type: "build_phrase",
        title: "Build the phrase",
        prompt: { text: "That one is better." },
        tokens: [
          { id: "t1", text: "Tas", correctIndex: 0 },
          { id: "t2", text: "geresnis.", correctIndex: 1 },
          { id: "t3", text: "Šitas", isDistractor: true },
        ],
        answerText: "Tas geresnis.",
      },

      // ── Block 3 — Audio Response Selection ────────────────────────────────
      {
        id: "s2c_b7",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Ar galite parodyti?", audioText: "Ar galite parodyti" },
        options: [
          { id: "a", text: "Can you repeat?", isCorrect: false },
          { id: "b", text: "Can you show me?", isCorrect: true },
          { id: "c", text: "Can you help?", isCorrect: false },
        ],
      },

      {
        id: "s2c_b8",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Neturiu grynųjų.", audioText: "Neturiu grynųjų" },
        options: [
          { id: "a", text: "I have cash.", isCorrect: false },
          { id: "b", text: "I need cash.", isCorrect: false },
          { id: "c", text: "I don't have cash.", isCorrect: true },
        ],
      },

      {
        id: "s2c_b9",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Kada pradedame?", audioText: "Kada pradedame" },
        options: [
          { id: "a", text: "Where do we start?", isCorrect: false },
          { id: "b", text: "When do we start?", isCorrect: true },
          { id: "c", text: "Can we start?", isCorrect: false },
        ],
      },

      // ── Block 4 — Speak Prompts ────────────────────────────────────────────
      {
        id: "s2c_b10",
        type: "speak_self_check",
        title: "Say it out loud",
        prompt: "Say: I want coffee",
        targetText: "Noriu kavos.",
        audioText: "Noriu kavos",
      },

      {
        id: "s2c_b11",
        type: "speak_self_check",
        title: "Say it out loud",
        prompt: "Ask: How much does this cost?",
        targetText: "Kiek tai kainuoja?",
        audioText: "Kiek tai kainuoja",
      },

      // ── Block 5 — Best Response ────────────────────────────────────────────
      {
        id: "s2c_b12",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "A cashier asks if you have cash. You have a card but no cash." },
        options: [
          { id: "a", text: "Turiu grynųjų.", isCorrect: false },
          { id: "b", text: "Neturiu grynųjų. Ar galima kortele?", isCorrect: true },
          { id: "c", text: "Man reikia pagalbos.", isCorrect: false },
        ],
        feedback: { correct: "State what you don't have, then offer what you do. Perfect combination." },
      },

      {
        id: "s2c_b13",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "Someone shows you two items and you want the one that's further away." },
        options: [
          { id: "a", text: "Šito, prašau.", isCorrect: false },
          { id: "b", text: "To, prašau.", isCorrect: true },
          { id: "c", text: "Šitie tinka.", isCorrect: false },
        ],
        feedback: { correct: "To, prašau — that one, please. For the item further away." },
      },

      {
        id: "s2c_b14",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "Someone is speaking too fast and you need them to slow down." },
        options: [
          { id: "a", text: "Ar galite padėti?", isCorrect: false },
          { id: "b", text: "Ar galite pakartoti?", isCorrect: false },
          { id: "c", text: "Ar galite kalbėti lėčiau?", isCorrect: true },
        ],
        feedback: { correct: "Ar galite kalbėti lėčiau? — the right tool when pace is the problem." },
      },

      // ── Block 6 — Conversation Chain ──────────────────────────────────────
      {
        id: "s2c_b15",
        type: "scenario_chain",
        title: "Conversation",
        description: "You're at a market in Vilnius. You want to buy something, ask the price, and pay by card.",
        steps: [
          {
            id: "step_1",
            actor: "other",
            text: "Laba diena! Ko norite?",
            audioText: "Laba diena! Ko norite",
            helperText: "Good day! What do you want?",
            options: [
              { id: "a", text: "Viso gero.", isCorrect: false },
              { id: "b", text: "Laba diena! Noriu šito. Kiek tai kainuoja?", isCorrect: true },
              { id: "c", text: "Nesuprantu.", isCorrect: false },
            ],
          },
          {
            id: "step_2",
            actor: "other",
            text: "Aštuoni eurai.",
            audioText: "Aštuoni eurai",
            helperText: "Eight euros.",
            options: [
              { id: "a", text: "Brangu!", isCorrect: false },
              { id: "b", text: "Gerai! Ar galima kortele?", isCorrect: true },
              { id: "c", text: "Man reikia pagalbos.", isCorrect: false },
            ],
          },
          {
            id: "step_3",
            actor: "other",
            text: "Taip, galima.",
            audioText: "Taip, galima",
            helperText: "Yes, that's fine.",
            options: [
              { id: "a", text: "Ko norite?", isCorrect: false },
              { id: "b", text: "Neturiu grynųjų. Turiu kortelę.", isCorrect: true },
              { id: "c", text: "Aš negaliu eiti.", isCorrect: false },
            ],
          },
          {
            id: "step_4",
            actor: "other",
            text: "Prašau. Ar norite šitų taip pat?",
            audioText: "Prašau. Ar norite šitų taip pat",
            helperText: "Here you go. Would you like these as well?",
            options: [
              { id: "a", text: "Brangu.", isCorrect: false },
              { id: "b", text: "Kada einame?", isCorrect: false },
              { id: "c", text: "Ne, ačiū. Viso gero!", isCorrect: true },
            ],
          },
          {
            id: "step_5",
            actor: "other",
            text: "Viso gero! Ačiū.",
            audioText: "Viso gero! Ačiū",
            options: [
              { id: "a", text: "Ko norite?", isCorrect: false },
              { id: "b", text: "Ačiū labai!", isCorrect: true },
              { id: "c", text: "Man reikia bilieto.", isCorrect: false },
            ],
          },
        ],
      },

      // ── Word Match — ~5 best pairs from each module ────────────────────────
      {
        id: "s2c_b16",
        type: "word_match",
        title: "Match the pairs",
        pairs: [
          // From 2.1 — I Want / I Need / I Have
          { id: "m1",  lt: "Noriu kavos.",           en: "I want coffee.",                audioText: "Noriu kavos" },
          { id: "m2",  lt: "Man reikia bilieto.",    en: "I need a ticket.",              audioText: "Man reikia bilieto" },
          { id: "m3",  lt: "Neturiu grynųjų.",       en: "I don't have cash.",            audioText: "Neturiu grynųjų" },
          { id: "m4",  lt: "Turiu kortelę.",         en: "I have a card.",                audioText: "Turiu kortelę" },
          { id: "m5",  lt: "Ar turite meniu?",       en: "Do you have a menu?",           audioText: "Ar turite meniu" },
          // From 2.2 — Can / Can't / Possible?
          { id: "m6",  lt: "Ar galiu pažiūrėti?",   en: "Can I have a look?",            audioText: "Ar galiu pažiūrėti" },
          { id: "m7",  lt: "Ar galite parodyti?",    en: "Can you show me?",              audioText: "Ar galite parodyti" },
          { id: "m8",  lt: "Aš negaliu suprasti.",   en: "I can't understand.",           audioText: "Aš negaliu suprasti" },
          { id: "m9",  lt: "Ar galima kortele?",     en: "Is it possible by card?",       audioText: "Ar galima kortele" },
          { id: "m10", lt: "Aš galiu palaukti.",     en: "I can wait.",                   audioText: "Aš galiu palaukti" },
          // From 2.3 — This / That / These / Those
          { id: "m11", lt: "Noriu šito.",            en: "I want this one.",              audioText: "Noriu šito" },
          { id: "m12", lt: "To, prašau.",            en: "That one, please.",             audioText: "To, prašau" },
          { id: "m13", lt: "Tas geresnis.",          en: "That one is better.",           audioText: "Tas geresnis" },
          { id: "m14", lt: "Kuris?",                 en: "Which one?",                    audioText: "Kuris" },
          { id: "m15", lt: "Šitie tinka.",           en: "These are fine.",               audioText: "Šitie tinka" },
          // From 2.4 — Basic Questions
          { id: "m16", lt: "Kiek tai kainuoja?",     en: "How much does this cost?",      audioText: "Kiek tai kainuoja" },
          { id: "m17", lt: "Kur einame?",            en: "Where are we going?",           audioText: "Kur einame" },
          { id: "m18", lt: "Kada pradedame?",        en: "When do we start?",             audioText: "Kada pradedame" },
          { id: "m19", lt: "Rytoj.",                 en: "Tomorrow.",                     audioText: "Rytoj" },
          { id: "m20", lt: "Brangu.",                en: "Expensive.",                    audioText: "Brangu" },
        ],
      },

    ],
  };
}

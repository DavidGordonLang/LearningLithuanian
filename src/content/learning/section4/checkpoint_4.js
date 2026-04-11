// src/content/learning/section4/checkpoint_4.js
// Section 4 Checkpoint — Food and Drink in Real Use

export default function createCheckpoint4(profile = {}) {
  const {
    userNameSafe = "Davidas",
    userFromPhrase = "Aš esu iš Škotijos",
  } = profile;

  return {
    id: "section_4_checkpoint",
    code: "4.C",
    title: "Food and Drink in Real Use",
    purpose: "Bring the whole of Section 4 together. Real retrieval across all four modules.",
    isCheckpoint: true,
    isSectionCheckpoint: true,
    status: "active",
    supportLevel: "none",
    newLanguageLoad: "none",
    blocks: [

      // ── Block 1 — Quick Recognition Warm-Up ───────────────────────────────────
      {
        id: "s4c_b1",
        type: "recognise_mcq",
        title: "Choose the correct meaning",
        prompt: { text: "Norėčiau kavos.", audioText: "Norėčiau kavos" },
        options: [
          { id: "a", text: "I want coffee.", isCorrect: false },
          { id: "b", text: "I would like coffee.", isCorrect: true },
          { id: "c", text: "Do you want coffee?", isCorrect: false },
        ],
      },

      {
        id: "s4c_b2",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Čia ar išsinešti?", audioText: "Čia ar išsinešti" },
        options: [
          { id: "a", text: "Cash or card?", isCorrect: false },
          { id: "b", text: "For here or to go?", isCorrect: true },
          { id: "c", text: "With milk or without?", isCorrect: false },
        ],
      },

      {
        id: "s4c_b3",
        type: "recognise_mcq",
        title: "Choose the correct meaning",
        prompt: { text: "Čia ne tai, ką užsakiau.", audioText: "Čia ne tai, ką užsakiau" },
        options: [
          { id: "a", text: "I would like to order.", isCorrect: false },
          { id: "b", text: "This is not what I ordered.", isCorrect: true },
          { id: "c", text: "Can you change it?", isCorrect: false },
        ],
      },

      // ── Block 2 — Guided Production ───────────────────────────────────────────
      {
        id: "s4c_b4",
        type: "build_phrase",
        title: "Build the phrase",
        prompt: { text: "Two teas, please." },
        tokens: [
          { id: "t1", text: "Dvi", correctIndex: 0 },
          { id: "t2", text: "arbatas,", correctIndex: 1 },
          { id: "t3", text: "prašau", correctIndex: 2 },
          { id: "t4", text: "Vieną", isDistractor: true },
          { id: "t5", text: "kavą,", isDistractor: true },
        ],
        answerText: "Dvi arbatas, prašau",
      },

      {
        id: "s4c_b5",
        type: "build_phrase",
        title: "Build the phrase",
        prompt: { text: "Tea without sugar, please." },
        tokens: [
          { id: "t1", text: "Arbatos", correctIndex: 0 },
          { id: "t2", text: "be", correctIndex: 1 },
          { id: "t3", text: "cukraus,", correctIndex: 2 },
          { id: "t4", text: "prašau", correctIndex: 3 },
          { id: "t5", text: "su", isDistractor: true },
          { id: "t6", text: "pienu,", isDistractor: true },
        ],
        answerText: "Arbatos be cukraus, prašau",
      },

      // ── Block 3 — Audio Service Response ──────────────────────────────────────
      {
        id: "s4c_b6",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "Staff asks: Grynaisiais ar kortele? You want to pay by card." },
        options: [
          { id: "a", text: "Sąskaitą, prašau.", isCorrect: false },
          { id: "b", text: "Kortele, prašau.", isCorrect: true },
          { id: "c", text: "Išsinešti, prašau.", isCorrect: false },
        ],
        feedback: { correct: "Kortele, prašau — By card, please. Direct and clear." },
      },

      {
        id: "s4c_b7",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Ar su cukrumi?", audioText: "Ar su cukrumi" },
        options: [
          { id: "a", text: "Is it too hot?", isCorrect: false },
          { id: "b", text: "With sugar?", isCorrect: true },
          { id: "c", text: "For here or to go?", isCorrect: false },
        ],
      },

      // ── Block 4 — Preference / Problem ────────────────────────────────────────
      {
        id: "s4c_b8",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "The wrong drink arrives. What do you say?" },
        options: [
          { id: "a", text: "Ačiū labai!", isCorrect: false },
          { id: "b", text: "Čia ne tai, ką užsakiau. Ar galite pakeisti?", isCorrect: true },
          { id: "c", text: "Sąskaitą, prašau.", isCorrect: false },
        ],
        feedback: { correct: "Čia ne tai, ką užsakiau. Ar galite pakeisti? — This is not what I ordered. Can you change it? Calm, clear, effective." },
      },

      {
        id: "s4c_b9",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "Staff asks: Ar gerai? Your coffee is too cold." },
        options: [
          { id: "a", text: "Taip, labai gerai.", isCorrect: false },
          { id: "b", text: "Nelabai gerai — per šalta.", isCorrect: true },
          { id: "c", text: "Norėčiau arbatos.", isCorrect: false },
        ],
        feedback: { correct: "Nelabai gerai — per šalta. Not very good — too cold." },
      },

      // ── Block 5 — Social Offer / Response ─────────────────────────────────────
      {
        id: "s4c_b10",
        type: "speak_self_check",
        title: "Say it out loud",
        prompt: "Offer someone coffee: Do you want coffee?",
        targetText: "Ar nori kavos",
        audioText: "Ar nori kavos",
      },

      {
        id: "s4c_b11",
        type: "speak_self_check",
        title: "Say it out loud",
        prompt: "Ask for the bill",
        targetText: "Sąskaitą, prašau",
        audioText: "Sąskaitą, prašau",
      },

      // ── Block 6 — Conversation Chain ──────────────────────────────────────────
            {
        id: "s4c_b12",
        type: "scenario_chain",
        title: "Conversation",
        description: "A complete Section 4 interaction — social opening, ordering for two, wrong drink, correction, compliment, payment. Uses vocabulary from all four modules.",
        steps: [
          {
            id: "step_1",
            actor: "other",
            text: "Labas! Ar tu alkanas?",
            audioText: "Labas! Ar tu alkanas",
            helperText: "Hi! Are you hungry?",
            options: [
              { id: "a", text: "Ne, ačiū.", isCorrect: false },
              { id: "b", text: "Taip! Aš alkanas. Eikime į kavinę.", en: "Yes! I'm hungry. Let's go to the café.", isCorrect: true },
              { id: "c", text: "Nesuprantu.", isCorrect: false },
            ],
          },
          {
            id: "step_2",
            actor: "other",
            text: "Laba diena! Ko norėtumėte?",
            audioText: "Laba diena! Ko norėtumėte",
            helperText: "Good day! What would you like?",
            options: [
              { id: "a", text: "Nesuprantu.", isCorrect: false },
              { id: "b", text: "Laba diena! Man kavos su pienu ir tau arbatos, prašau.", en: "Good day! Coffee with milk for me and tea for you, please.", isCorrect: true },
              { id: "c", text: "Viso gero.", isCorrect: false },
            ],
          },
          {
            id: "step_3",
            actor: "other",
            text: "Čia ar išsinešti?",
            audioText: "Čia ar išsinešti",
            helperText: "For here or to go?",
            options: [
              { id: "a", text: "Su pienu, prašau.", isCorrect: false },
              { id: "b", text: "Čia, prašau.", en: "For here, please.", isCorrect: true },
              { id: "c", text: "Nesuprantu.", isCorrect: false },
            ],
          },
          {
            id: "step_4",
            actor: "other",
            text: "Prašom. Dvi arbatos.",
            audioText: "Prašom. Dvi arbatos",
            helperText: "Here you go. Two teas. — The wrong order — you ordered one coffee.",
            options: [
              { id: "a", text: "Ačiū labai!", isCorrect: false },
              { id: "b", text: "Atsiprašau — čia ne tai, ką užsakiau. Man kavos, prašau. Ar galite pakeisti?", en: "Excuse me — this is not what I ordered. Coffee for me, please. Can you change it?", isCorrect: true },
              { id: "c", text: "Sąskaitą, prašau.", isCorrect: false },
            ],
          },
          {
            id: "step_5",
            actor: "other",
            text: "Labai atsiprašau. Prašom — kava su pienu. Ar skanu?",
            audioText: "Labai atsiprašau. Prašom — kava su pienu. Ar skanu",
            helperText: "Very sorry. Here you go — coffee with milk. Is it tasty?",
            options: [
              { id: "a", text: "Per karšta.", isCorrect: false },
              { id: "b", text: "Taip! Labai skanu. Man patinka.", en: "Yes! Very tasty. I like it.", isCorrect: true },
              { id: "c", text: "Nelabai gerai.", isCorrect: false },
            ],
          },
          {
            id: "step_6",
            actor: "other",
            text: "Puiku! Ar dar ko norite?",
            audioText: "Puiku! Ar dar ko norite",
            helperText: "Great! Anything else?",
            options: [
              { id: "a", text: "Taip, dar vieną.", isCorrect: false },
              { id: "b", text: "Ne, ačiū. Sąskaitą, prašau.", en: "No, thank you. The bill, please.", isCorrect: true },
              { id: "c", text: "Kur yra tualetas?", isCorrect: false },
            ],
          },
          {
            id: "step_7",
            actor: "other",
            text: "Žinoma. Dešimt eurų. Grynaisiais ar kortele?",
            audioText: "Žinoma. Dešimt eurų. Grynaisiais ar kortele",
            helperText: "Of course. Ten euros. Cash or card?",
            options: [
              { id: "a", text: "Per brangu.", isCorrect: false },
              { id: "b", text: "Kortele, prašau.", en: "By card, please.", isCorrect: true },
              { id: "c", text: "Nesuprantu.", isCorrect: false },
            ],
          },
          {
            id: "step_8",
            actor: "other",
            text: "Prašom. Viso gero!",
            audioText: "Prašom. Viso gero",
            helperText: "Here you go. Goodbye!",
            options: [
              { id: "a", text: "Atsiprašau.", isCorrect: false },
              { id: "b", text: "Ačiū labai! Viso gero!", en: "Thank you very much! Goodbye!", isCorrect: true },
              { id: "c", text: "Laba diena.", isCorrect: false },
            ],
          },
        ],
      },

      // ── Word Match — ~5 best pairs from each of the 4 modules ─────────────────
      {
        id: "s4c_b13",
        type: "word_match",
        title: "Match the pairs",
        pairs: [
          { id: "m1",  lt: "Norėčiau kavos.",            en: "I would like coffee.",             audioText: "Norėčiau kavos" },
          { id: "m2",  lt: "Dvi arbatas, prašau.",        en: "Two teas, please.",                audioText: "Dvi arbatas, prašau" },
          { id: "m3",  lt: "Šito, prašau.",               en: "This one, please.",                audioText: "Šito, prašau" },
          { id: "m4",  lt: "Dar vieną, prašau.",          en: "One more, please.",                audioText: "Dar vieną, prašau" },
          { id: "m5",  lt: "Čia ar išsinešti?",           en: "For here or to go?",               audioText: "Čia ar išsinešti" },
          { id: "m6",  lt: "Išsinešti, prašau.",          en: "To go, please.",                   audioText: "Išsinešti, prašau" },
          { id: "m7",  lt: "su pienu",                    en: "with milk",                        audioText: "su pienu" },
          { id: "m8",  lt: "be cukraus",                  en: "without sugar",                    audioText: "be cukraus" },
          { id: "m9",  lt: "Sąskaitą, prašau.",           en: "The bill, please.",                audioText: "Sąskaitą, prašau" },
          { id: "m10", lt: "Galima mokėti kortele?",       en: "Can I pay by card?",               audioText: "Galima mokėti kortele" },
          { id: "m11", lt: "Nenoriu šito.",               en: "I don't want this.",               audioText: "Nenoriu šito" },
          { id: "m12", lt: "Nevalgau mėsos.",             en: "I don't eat meat.",                audioText: "Nevalgau mėsos" },
          { id: "m13", lt: "Čia ne tai, ką užsakiau.",    en: "This is not what I ordered.",      audioText: "Čia ne tai, ką užsakiau" },
          { id: "m14", lt: "Ar galite pakeisti?",         en: "Can you change it?",               audioText: "Ar galite pakeisti" },
          { id: "m15", lt: "Per karšta.",                 en: "Too hot.",                         audioText: "Per karšta" },
          { id: "m16", lt: "Ar nori kavos?",              en: "Do you want coffee? (informal)",   audioText: "Ar nori kavos" },
          { id: "m17", lt: "Pavalgykime.",                en: "Let's eat.",                       audioText: "Pavalgykime" },
          { id: "m18", lt: "Man kavos, prašau.",          en: "Coffee for me, please.",           audioText: "Man kavos, prašau" },
          { id: "m19", lt: "Tai skanu.",                  en: "This is tasty / delicious.",       audioText: "Tai skanu" },
          { id: "m20", lt: "Man patinka.",                en: "I like it.",                       audioText: "Man patinka" },
        ],
      },
    ],
  };
}

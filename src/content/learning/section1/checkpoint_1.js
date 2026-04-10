// src/content/learning/section1/checkpoint_1.js
// Section 1 Checkpoint — First Interaction
// Factory function — uses profile data for personalised scenario options

export default function createCheckpoint1(profile = {}) {
  const {
    userNameSafe = "Davidas",
    userFromPhrase = "Aš esu iš Škotijos",
    userFromCountryLabelEn = "Scotland",
  } = profile;

  return {
    id: "section_1_checkpoint",
    code: "1.C",
    title: "First Interaction",
    purpose: "Bring the whole of Section 1 together. Real retrieval from all four modules — not just recognition.",
    isCheckpoint: true,
    isSectionCheckpoint: true,
    status: "active",
    supportLevel: "none",
    newLanguageLoad: "none",
    blocks: [

      // ── Block 1 — Quick Recognise Warm-Up ─────────────────────────────────
      // Fast recall across all 4 modules. Situational, not just translation.
      {
        id: "s1c_b1",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "It's morning. You walk into a hotel lobby. What do you say?" },
        options: [
          { id: "a", text: "Viso gero", isCorrect: false },
          { id: "b", text: "Labas rytas", isCorrect: true },
          { id: "c", text: "Iki", isCorrect: false },
        ],
        feedback: { correct: "Labas rytas — time-appropriate and natural. Viso gero would be a goodbye." },
      },

      {
        id: "s1c_b2",
        type: "recognise_mcq",
        title: "Choose the correct meaning",
        prompt: { text: "Malonu susipažinti", audioText: "Malonu susipažinti" },
        options: [
          { id: "a", text: "How are you?", isCorrect: false },
          { id: "b", text: "Nice to meet you", isCorrect: true },
          { id: "c", text: "I'm from Lithuania", isCorrect: false },
        ],
      },

      {
        id: "s1c_b3",
        type: "recognise_mcq",
        title: "Choose the correct meaning",
        prompt: { text: "Man reikia pagalbos", audioText: "Man reikia pagalbos" },
        options: [
          { id: "a", text: "Can you help me?", isCorrect: false },
          { id: "b", text: "Help me, please", isCorrect: false },
          { id: "c", text: "I need help", isCorrect: true },
        ],
      },

      // ── Block 2 — Audio Response Selection ────────────────────────────────
      // Listen and choose — tests comprehension under pressure
      {
        id: "s1c_b4",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Pakartokite, prašau", audioText: "Pakartokite, prašau" },
        options: [
          { id: "a", text: "Please speak more slowly", isCorrect: false },
          { id: "b", text: "One more time, please", isCorrect: false },
          { id: "c", text: "Please repeat", isCorrect: true },
        ],
      },

      {
        id: "s1c_b5",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Ar galiu čia atsisėsti?", audioText: "Ar galiu čia atsisėsti" },
        options: [
          { id: "a", text: "Can we sit here?", isCorrect: false },
          { id: "b", text: "Can I sit here?", isCorrect: true },
          { id: "c", text: "Is there a seat here?", isCorrect: false },
        ],
      },

      {
        id: "s1c_b6",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Kur yra stotis?", audioText: "Kur yra stotis" },
        options: [
          { id: "a", text: "Where is the hotel?", isCorrect: false },
          { id: "b", text: "Where is the bus stop?", isCorrect: false },
          { id: "c", text: "Where is the station?", isCorrect: true },
        ],
      },

      // ── Block 3 — Guided Produce ───────────────────────────────────────────
      // Build phrases from tiles — recall, not recognition
      {
        id: "s1c_b7",
        type: "build_phrase",
        title: "Build the phrase",
        prompt: { text: "I don't understand" },
        tokens: [
          { id: "t1", text: "Aš", correctIndex: 0 },
          { id: "t2", text: "nesuprantu", correctIndex: 1 },
          { id: "t3", text: "suprantu", isDistractor: true },
          { id: "t4", text: "kalbu", isDistractor: true },
        ],
        answerText: "Aš nesuprantu",
      },

      {
        id: "s1c_b8",
        type: "build_phrase",
        title: "Build the phrase",
        prompt: { text: "Where is the bank?" },
        tokens: [
          { id: "t1", text: "Kur", correctIndex: 0 },
          { id: "t2", text: "yra", correctIndex: 1 },
          { id: "t3", text: "bankas?", correctIndex: 2 },
          { id: "t4", text: "stotis?", isDistractor: true },
        ],
        answerText: "Kur yra bankas?",
      },

      {
        id: "s1c_b9",
        type: "build_phrase",
        title: "Build the phrase",
        prompt: { text: "Can you help me?" },
        tokens: [
          { id: "t1", text: "Ar", correctIndex: 0 },
          { id: "t2", text: "galite", correctIndex: 1 },
          { id: "t3", text: "man", correctIndex: 2 },
          { id: "t4", text: "padėti?", correctIndex: 3 },
          { id: "t5", text: "galiu", isDistractor: true },
        ],
        answerText: "Ar galite man padėti?",
      },

      // ── Block 4 — Speak Prompts ────────────────────────────────────────────
      {
        id: "s1c_b10",
        type: "speak_self_check",
        title: "Say it out loud",
        prompt: "Say: I'm from " + userFromCountryLabelEn,
        targetText: userFromPhrase,
        audioText: "Aš esu iš Škotijos",
      },

      {
        id: "s1c_b11",
        type: "speak_self_check",
        title: "Say it out loud",
        prompt: "Ask where the station is",
        targetText: "Kur yra stotis?",
        audioText: "Kur yra stotis",
      },

      // ── Block 5 — Best Response ────────────────────────────────────────────
      // Tests practical judgment across all modules
      {
        id: "s1c_b12",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "Someone speaks to you quickly in Lithuanian and you don't follow." },
        options: [
          { id: "a", text: "Viso gero", isCorrect: false },
          { id: "b", text: "Aš nesuprantu. Prašau kalbėkite lėčiau.", isCorrect: true },
          { id: "c", text: "Ar galiu čia atsisėsti?", isCorrect: false },
        ],
        feedback: { correct: "Signal non-understanding, then ask them to slow down — this is exactly what Module 1.3 built." },
      },

      {
        id: "s1c_b13",
        type: "best_response",
        noOptionAudio: true,
        title: "Choose the best response",
        prompt: { text: "A shop assistant asks: 'Ar galiu jums padėti?' What are they saying?" },
        options: [
          { id: "a", text: "They're asking if you can help them", isCorrect: false },
          { id: "b", text: "They're asking if you need help", isCorrect: true },
          { id: "c", text: "They're asking where you're from", isCorrect: false },
        ],
        feedback: { correct: "Ar galiu jums padėti? — Can I help you? Standard shop opening." },
      },

      {
        id: "s1c_b14",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "You're meeting your colleague's boss for the first time. How do you address them?" },
        options: [
          { id: "a", text: "Tu", isCorrect: false },
          { id: "b", text: "Jūs", isCorrect: true },
          { id: "c", text: "It doesn't matter in Lithuanian", isCorrect: false },
        ],
        feedback: { correct: "Jūs every time with strangers and people you've just met formally." },
      },

      {
        id: "s1c_b15",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "You spot a building in the distance and think it might be the restaurant. What do you say to check?" },
        options: [
          { id: "a", text: "Kas tai?", isCorrect: false },
          { id: "b", text: "Ar tai restoranas?", isCorrect: false },
          { id: "c", text: "Ar ten restoranas?", isCorrect: true },
        ],
        feedback: { correct: "Ar ten…? for something in the distance. Ar tai…? for something right in front of you." },
      },

      // ── Block 6 — Conversation Chain ──────────────────────────────────────
      // Full 5-step scenario pulling from all four modules
      {
        id: "s1c_b16",
        type: "scenario_chain",
        title: "Conversation",
        description: "You've just arrived in Vilnius. A local stops to welcome you — a full first interaction.",
        steps: [
          {
            id: "step_1",
            actor: "other",
            text: "Laba diena!",
            audioText: "Laba diena",
            options: [
              { id: "a", text: "Viso gero!", isCorrect: false },
              { id: "b", text: "Laba diena!", isCorrect: true },
              { id: "c", text: "Iki", isCorrect: false },
            ],
          },
          {
            id: "step_2",
            actor: "other",
            text: "Koks jūsų vardas?",
            audioText: "Koks jūsų vardas",
            helperText: "They're asking your name — politely, with jūs.",
            options: [
              { id: "a", text: "Malonu susipažinti", isCorrect: false },
              { id: "b", text: "Aš nesuprantu", isCorrect: false },
              { id: "c", text: `Mano vardas ${userNameSafe}. ${userFromPhrase}.`, isCorrect: true },
            ],
          },
          {
            id: "step_3",
            actor: "other",
            text: "Malonu susipažinti!",
            audioText: "Malonu susipažinti",
            options: [
              { id: "a", text: "Ne, ačiū", isCorrect: false },
              { id: "b", text: "Man irgi!", isCorrect: true },
              { id: "c", text: "Prašau dar kartą", isCorrect: false },
            ],
          },
          {
            id: "step_4",
            actor: "other",
            text: "Ar galiu jums padėti? Kur jūs einate?",
            audioText: "Ar galiu jums padėti? Kur jūs einate?",
            helperText: "They're offering help and asking where you're going — but you didn't catch it all.",
            options: [
              { id: "a", text: "Viso gero!", isCorrect: false },
              { id: "b", text: "Taip, man reikia pagalbos. Kur yra viešbutis?", isCorrect: true },
              { id: "c", text: "Ne, nesuprantu", isCorrect: false },
            ],
          },
          {
            id: "step_5",
            actor: "other",
            text: "Viešbutis yra ten, prie stoties. Viso gero!",
            audioText: "Viešbutis yra ten, prie stoties. Viso gero",
            helperText: "The hotel is over there, near the station.",
            options: [
              { id: "a", text: "Aš nesuprantu", isCorrect: false },
              { id: "b", text: "Atsiprašau", isCorrect: false },
              { id: "c", text: "Ačiū labai! Viso gero!", isCorrect: true },
            ],
          },
        ],
      },

      // ── Word Match — ~5 best pairs from each of the 4 modules ─────────────
      // No verbatim repeats from individual module checkpoints.
      // Highest-value / most useful vocabulary only.
      {
        id: "s1c_b17",
        type: "word_match",
        title: "Match the pairs",
        pairs: [
          // From 1.1 — Greeting and Politeness
          { id: "m1",  lt: "Laba diena",                en: "Good day / Hello (formal)",   audioText: "Laba diena" },
          { id: "m2",  lt: "Ačiū labai",                en: "Thank you very much",          audioText: "Ačiū labai" },
          { id: "m3",  lt: "Atsiprašau",                en: "Sorry / Excuse me",            audioText: "Atsiprašau" },
          { id: "m4",  lt: "Ne, ačiū",                  en: "No thank you",                 audioText: "Ne, ačiū" },
          { id: "m5",  lt: "Kaip sekasi?",              en: "How are you?",                 audioText: "Kaip sekasi" },
          // From 1.2 — Who I Am
          { id: "m6",  lt: "Mano vardas…",              en: "My name is…",                  audioText: "Mano vardas" },
          { id: "m7",  lt: "Malonu susipažinti",        en: "Nice to meet you",             audioText: "Malonu susipažinti" },
          { id: "m8",  lt: "Iš kur jūs esate?",        en: "Where are you from? (formal)", audioText: "Iš kur jūs esate" },
          { id: "m9",  lt: "Čia yra…",                  en: "This is…",                     audioText: "Čia yra" },
          { id: "m10", lt: "Jis yra mano kolega",       en: "He is my colleague",           audioText: "Jis yra mano kolega" },
          // From 1.3 — I Don't Understand
          { id: "m11", lt: "Aš nesuprantu",             en: "I don't understand",           audioText: "Aš nesuprantu" },
          { id: "m12", lt: "Prašau kalbėkite lėčiau",  en: "Please speak more slowly",     audioText: "Prašau kalbėkite lėčiau" },
          { id: "m13", lt: "Ką tai reiškia?",           en: "What does this mean?",         audioText: "Ką tai reiškia" },
          { id: "m14", lt: "Ar jūs kalbate angliškai?", en: "Do you speak English?",        audioText: "Ar jūs kalbate angliškai" },
          { id: "m15", lt: "Aš kalbu šiek tiek lietuviškai", en: "I speak a little Lithuanian", audioText: "Aš kalbu šiek tiek lietuviškai" },
          // From 1.4 — Help and Contact
          { id: "m16", lt: "Ar galite man padėti?",    en: "Can you help me?",             audioText: "Ar galite man padėti" },
          { id: "m17", lt: "Kur yra stotis?",          en: "Where is the station?",        audioText: "Kur yra stotis" },
          { id: "m18", lt: "Ar galiu čia atsisėsti?",  en: "Can I sit here?",              audioText: "Ar galiu čia atsisėsti" },
          { id: "m19", lt: "Viešbutis",                en: "Hotel",                        audioText: "Viešbutis" },
          { id: "m20", lt: "Jūs",                      en: "You (polite / plural)",        audioText: "Jūs" },
        ],
      },

    ],
  };
}

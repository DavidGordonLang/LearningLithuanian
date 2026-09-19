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
        prompt: { text: "Ji yra mano sesuo", audioText: "Ji yra mano sesuo" },
        options: [
          { id: "a", text: "She is my sister", isCorrect: true },
          { id: "b", text: "She is my friend", isCorrect: false },
          { id: "c", text: "He is my brother", isCorrect: false },
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
        audioText: userFromPhrase,
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
        prompt: { text: "They repeat the sentence, but the speed is still the problem." },
        options: [
          { id: "a", text: "Viso gero", isCorrect: false },
          { id: "b", text: "Prašau kalbėkite lėčiau.", isCorrect: true },
          { id: "c", text: "Ar galiu čia atsisėsti?", isCorrect: false },
        ],
        feedback: { correct: "Prašau kalbėkite lėčiau — use it when the problem is specifically the speed. Nesuprantu remains your general fallback when you are simply lost." },
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
        prompt: { text: "You're meeting your colleague's boss for the first time. Which form is the safe starting point?" },
        options: [
          { id: "a", text: "Tu", isCorrect: false },
          { id: "b", text: "Jūs", isCorrect: true },
          { id: "c", text: "Either — it doesn't matter", isCorrect: false },
        ],
        feedback: { correct: "Jūs — the safe polite starting point with someone you have just met in a formal relationship." },
      },

      {
        id: "s1c_b15",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "You spot a building across the street and think it might be the restaurant. What do you say to check?" },
        options: [
          { id: "a", text: "Ar čia restoranas?", isCorrect: false },
          { id: "b", text: "Kas tai?", isCorrect: false },
          { id: "c", text: "Ar ten restoranas?", isCorrect: true },
        ],
        feedback: { correct: "Ar ten…? fits the building across the street. Ar čia…? is for the place you are at." },
      },

      // ── Block 6 — Conversation Chain ──────────────────────────────────────
      // Full 5-step scenario pulling from all four modules
      {
  id: "s1c_b16_v2",
  type: "scenario_v2",
  title: "First interaction",
  description: "You arrive for a small language-exchange meetup in Vilnius. Rasa greets you outside the station with her sister Ieva, then helps you find your hotel.",
  sceneIntro: "You arrive for a small language-exchange meetup in Vilnius. Rasa greets you outside the station with her sister Ieva, then helps you find your hotel.",
  location: "outside the station",
  userRole: "learner",
  register: "polite_friendly",
  goal: "Bring together greetings, identity, people, help-seeking, location language and Nesuprantu without using untaught material.",
  focus: ["first contact", "people", "help", "Kur yra…?", "Nesuprantu"],
  participants: [
    {
      id: "local",
      label: "Rasa",
      name: "Rasa",
      role: "language-exchange host",
      gender: "female",
      relationshipToUser: "new acquaintance",
      register: "polite_friendly",
    },
    {
      id: "sister",
      label: "Ieva",
      name: "Ieva",
      role: "Rasa's sister",
      gender: "female",
      relationshipToUser: "new acquaintance",
      register: "polite_friendly",
    },
  ],
  objects: [
    {
      id: "hotel",
      lt: "viešbutis",
      en: "hotel",
      gender: "masculine",
      number: "singular",
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "local",
      speakerLabel: "Rasa",
      speakerText: "Laba diena! Aš esu Rasa. Koks jūsų vardas?",
      sceneDirection: "Rasa recognises you from the meetup and comes over to introduce herself.",
      learnerPrompt: "Introduce yourself.",
      options: [
        {
          id: "a",
          text: `Laba diena! Mano vardas ${userNameSafe}.`,
          result: "best",
          progresses: true,
        },
        {
          id: "b",
          text: "Viso gero!",
          result: "wrong",
          feedback: "Rasa has just introduced herself and asked your name.",
          progresses: false,
        },
        {
          id: "c",
          text: "Ne, ačiū.",
          result: "wrong",
          feedback: "Nothing is being offered. Introduce yourself.",
          progresses: false,
        },
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Rasa",
      speakerText: "Malonu susipažinti! Iš kur jūs esate?",
      sceneDirection: "Rasa keeps the first-meeting conversation going.",
      learnerPrompt: "Say where you are from.",
      options: [
        {
          id: "a",
          text: `${userFromPhrase}.`,
          result: "best",
          progresses: true,
        },
        {
          id: "b",
          text: "Taip, suprantu.",
          result: "wrong",
          feedback: "Rasa is asking where you are from.",
          progresses: false,
        },
        {
          id: "c",
          text: "Ačiū!",
          result: "wrong",
          feedback: "Answer the question about where you are from.",
          progresses: false,
        },
      ],
    },
    {
      id: "step_3",
      speakerId: "local",
      speakerLabel: "Rasa",
      speakerText: "Čia mano sesuo Ieva.",
      sceneDirection: "Rasa gestures to the woman standing beside her and introduces her sister.",
      learnerPrompt: "Respond to the introduction.",
      options: [
        {
          id: "a",
          text: "Malonu susipažinti!",
          result: "best",
          progresses: true,
        },
        {
          id: "b",
          text: "Ne, ačiū.",
          result: "wrong",
          feedback: "Rasa has introduced her sister. Greet Ieva rather than declining something.",
          progresses: false,
        },
        {
          id: "c",
          text: "Kur yra stotis?",
          result: "wrong",
          feedback: "You have just been introduced to Ieva.",
          progresses: false,
        },
      ],
      finalSystemLine: {
        speakerId: "sister",
        speakerLabel: "Ieva",
        speakerText: "Man irgi!",
        sceneDirection: "Ieva smiles and returns the greeting.",
      },
    },
    {
      id: "step_4",
      speakerId: "local",
      speakerLabel: "Rasa",
      speakerText: "Ar galiu jums padėti?",
      sceneDirection: "Rasa notices you still checking the map on your phone.",
      learnerPrompt: "Accept the help and ask where your hotel is.",
      options: [
        {
          id: "a",
          text: "Taip, man reikia pagalbos. Kur yra viešbutis?",
          result: "best",
          progresses: true,
        },
        {
          id: "b",
          text: "Viso gero!",
          result: "wrong",
          feedback: "Rasa has offered help and you still need to find the hotel.",
          progresses: false,
        },
        {
          id: "c",
          text: "Ar galiu čia atsisėsti?",
          result: "wrong",
          feedback: "You need to find your hotel, not ask for a seat.",
          progresses: false,
        },
      ],
    },
    {
      id: "step_5",
      speakerId: "local",
      speakerLabel: "Rasa",
      speakerText: "Viešbutis — va ten.",
      sceneDirection: "Rasa points across the street directly at the hotel entrance.",
      learnerPrompt: "If the answer is clear, thank her. If you still do not understand, use Nesuprantu.",
      help: {
        levels: [
          {
            sceneDirection: "Rasa points more clearly at the hotel sign.",
            speakerText: "Viešbutis. Va ten.",
          },
          {
            sceneDirection: "She traces the word VIEŠBUTIS on the sign with her finger, then points to the entrance.",
            speakerText: "Viešbutis.",
          },
          {
            speakerText: "Hotel. Over there.",
            spokenLanguage: "en",
            audio: false,
          },
        ],
      },
      options: [
        {
          id: "a",
          text: "Ačiū labai! Viso gero!",
          result: "best",
          progresses: true,
        },
        {
          id: "b",
          text: "Ne, ačiū.",
          result: "wrong",
          feedback: "Rasa has just shown you the hotel.",
          progresses: false,
        },
        {
          id: "c",
          text: "Man reikia pagalbos.",
          result: "wrong",
          feedback: "Rasa is already helping you. Thank her if the answer is clear, or use Nesuprantu if it is not.",
          progresses: false,
        },
      ],
      finalSystemLine: {
        speakerId: "local",
        speakerLabel: "Rasa",
        speakerText: "Prašom. Viso gero!",
        sceneDirection: "Rasa and Ieva wave goodbye as you head towards the hotel.",
      },
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
          // 1.1 — Greeting and politeness
          { id: "m1",  lt: "Laba diena",                 en: "Good day / Hello (formal)",    audioText: "Laba diena" },
          { id: "m2",  lt: "Ačiū labai",                 en: "Thank you very much",           audioText: "Ačiū labai" },
          { id: "m3",  lt: "Atsiprašau",                 en: "Sorry / Excuse me",             audioText: "Atsiprašau" },
          { id: "m4",  lt: "Ne, ačiū",                   en: "No thank you",                  audioText: "Ne, ačiū" },
          { id: "m5",  lt: "Kaip sekasi?",               en: "How are you?",                  audioText: "Kaip sekasi" },

          // 1.2 — Identity and people
          { id: "m6",  lt: "Mano vardas…",               en: "My name is…",                   audioText: "Mano vardas" },
          { id: "m7",  lt: "Iš kur jūs esate?",          en: "Where are you from? (formal)",  audioText: "Iš kur jūs esate" },
          { id: "m8",  lt: "Brolis",                     en: "Brother",                       audioText: "Brolis" },
          { id: "m9",  lt: "Sesuo",                      en: "Sister",                        audioText: "Sesuo" },
          { id: "m10", lt: "Moteris",                    en: "Woman",                         audioText: "Moteris" },

          // 1.3 — Understanding and repair
          { id: "m11", lt: "Nesuprantu",                 en: "I don't understand",            audioText: "Nesuprantu" },
          { id: "m12", lt: "Prašau kalbėkite lėčiau",   en: "Please speak more slowly",      audioText: "Prašau kalbėkite lėčiau" },
          { id: "m13", lt: "Ką tai reiškia?",            en: "What does this mean?",          audioText: "Ką tai reiškia" },
          { id: "m14", lt: "Ar jūs kalbate angliškai?", en: "Do you speak English?",         audioText: "Ar jūs kalbate angliškai" },
          { id: "m15", lt: "Suprantu",                   en: "I understand",                  audioText: "Suprantu" },

          // 1.4 — Help and location
          { id: "m16", lt: "Ar galite man padėti?",     en: "Can you help me?",              audioText: "Ar galite man padėti" },
          { id: "m17", lt: "Kur yra stotis?",           en: "Where is the station?",         audioText: "Kur yra stotis" },
          { id: "m18", lt: "Ar galiu čia atsisėsti?",   en: "Can I sit here?",               audioText: "Ar galiu čia atsisėsti" },
          { id: "m19", lt: "Va ten",                     en: "Over there",                    audioText: "Va ten" },
          { id: "m20", lt: "Jūs",                       en: "You (polite / plural)",          audioText: "Jūs" },
        ],
      },

    ],
  };
}

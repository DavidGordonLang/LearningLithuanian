// src/content/learning/section1/module_1_3.js
// Module 1.3 — I Don't Understand

export default function createModule_1_3(profile = {}) {
  const {
    userNameSafe = "Davidas",
    userFromPhrase = "Aš esu iš Škotijos",
  } = profile;

  return {
    id: "module_1_3",
    code: "1.3",
    title: "I Don't Understand",
    status: "active",
    lessonCount: 5,
    lessons: [

      // ── Lesson 1 ────────────────────────────────────────────────────────────
      {
        id: "section_1_module_3_lesson_1",
        code: "1.3.1",
        title: "I Don't Understand",
        purpose: "Teach the core comprehension breakdown phrase.",
        supportLevel: "high",
        newLanguageLoad: "low",
        notes: {
          pattern: "Nesuprantu and suprantu are the same verb — ne- makes it negative. Ar starts yes/no questions in Lithuanian. You don't need to produce Ar questions yet — just recognise them when you hear them.",
          usage: [
            "Aš nesuprantu — I don't understand (full form)",
            "Nesuprantu — I don't understand (shorter, equally natural)",
            "Suprantu — I understand",
            "Taip, suprantu — Yes, I understand",
            "Ne, nesuprantu — No, I don't understand",
            "Ar suprantate? — Do you understand? (formal) — Ar signals a yes/no question",
          ],
        },
        blocks: [
          {
            id: "s1m3l1_b1",
            type: "learn",
            title: "Understanding and not understanding",
            items: [
              { id: "u1", lt: "Aš nesuprantu", en: "I don't understand", audioText: "Aš nesuprantu", saveable: true, core: true },
              { id: "u2", lt: "Nesuprantu", en: "I don't understand (short form)", audioText: "Nesuprantu", saveable: true, core: true },
              { id: "u3", lt: "Suprantu", en: "I understand", audioText: "Suprantu", saveable: true, core: true },
              { id: "u4", lt: "Taip, suprantu", en: "Yes, I understand", audioText: "Taip, suprantu", saveable: true, core: true },
              { id: "u5", lt: "Ne, nesuprantu", en: "No, I don't understand", audioText: "Ne, nesuprantu", saveable: true, core: true },
              { id: "u6", lt: "Ar suprantate?", en: "Do you understand? (formal)", audioText: "Ar suprantate", saveable: true, core: true },
            ],
          },
          {
            id: "s1m3l1_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Nesuprantu", audioText: "Nesuprantu" },
            options: [
              { id: "a", text: "I understand", isCorrect: false },
              { id: "b", text: "I don't understand", isCorrect: true },
              { id: "c", text: "Please repeat", isCorrect: false },
            ],
          },
          {
            id: "s1m3l1_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Taip, suprantu", audioText: "Taip, suprantu" },
            options: [
              { id: "a", text: "No, I don't understand", isCorrect: false },
              { id: "b", text: "Yes, I understand", isCorrect: true },
              { id: "c", text: "Please repeat", isCorrect: false },
            ],
          },
          {
            id: "s1m3l1_b4",
            type: "recognise_mcq",
            title: "Choose the right phrase",
            prompt: { text: "Someone explains something quickly and you've lost track completely." },
            options: [
              { id: "a", text: "Nesuprantu", isCorrect: true },
              { id: "b", text: "Suprantu", isCorrect: false },
              { id: "c", text: "Taip", isCorrect: false },
            ],
            feedback: { correct: "Nesuprantu — I don't understand. Direct and clear. Never stay silent when you've lost the thread." },
          },
          {
            id: "s1m3l1_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "No, I don't understand" },
            tokens: [
              { id: "t1", text: "Ne,", correctIndex: 0 },
              { id: "t2", text: "nesuprantu", correctIndex: 1 },
              { id: "t3", text: "suprantu", isDistractor: true },
            ],
            answerText: "Ne, nesuprantu",
          },
          {
            id: "s1m3l1_b6",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Someone explains something — you've lost the thread. Say it in Lithuanian.",
            targetText: "Nesuprantu",
            audioText: "Nesuprantu",
          },
          {
  id: "s1m3l1_b7_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're checking into a hotel. The receptionist speaks quickly and you lose track.",
  sceneIntro: "You're checking into a hotel. The receptionist speaks quickly and you lose track.",
  location: "hotel reception",
  userRole: "guest",
  register: "polite_service",
  goal: "You're checking into a hotel. The receptionist speaks quickly and you lose track.",
  focus: ["directions"],
  participants: [
    {
      "id": "receptionist",
      "label": "Receptionist",
      "name": "Aust?ja",
      "role": "receptionist",
      "gender": "female",
      "relationshipToUser": "stranger",
      "register": "polite_service"
    },
  ],
  objects: [
    {
      "id": "hotel",
      "lt": "vie?butis",
      "en": "hotel",
      "gender": "masculine",
      "number": "singular"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Laba diena! Jūsų kambarys yra trečiame aukšte.",
      supportText: "They're greeting you and telling you your room is on the third floor — but it went too fast.",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Viso gero!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Nesuprantu. Atsiprašau.",
          result: "repair",
          feedback: "Good repair. This keeps the conversation going when you need clarification.",
          progresses: true,
          followUp: {
            speakerId: "receptionist",
            speakerLabel: "Speaker",
            speakerText: "Laba diena! Jūsų kambarys yra trečiame aukšte.",
            sceneDirection: "The speaker repeats or clarifies the line."
          },
        },
        {
          id: "c",
          text: "Taip, suprantu.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_2",
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Trečias aukštas.",
      supportText: "They slow down and hold up three fingers as they repeat — third floor.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Ne, ačiū.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Suprantu. Ačiū!",
          result: "best",
          progresses: true,
        }
      ],
    }
  ],
},
        ],
      },

      // ── Lesson 2 ────────────────────────────────────────────────────────────
      {
        id: "section_1_module_3_lesson_2",
        code: "1.3.2",
        title: "Please Repeat / More Slowly",
        purpose: "Give the learner control over conversation pace.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "These three phrases should feel automatic. Any time you don't catch something — reach for one of these immediately.",
          usage: [
            "Pakartokite, prašau — Please repeat (polite imperative form)",
            "Prašau kalbėkite lėčiau — Please speak more slowly",
            "Dar kartą, prašau — One more time, please",
            "Lėčiau, prašau — More slowly, please (shorter version)",
          ],
        },
        blocks: [
          {
            id: "s1m3l2_b1",
            type: "learn",
            title: "Repair phrases",
            items: [
              { id: "r1", lt: "Pakartokite, prašau", en: "Please repeat", audioText: "Pakartokite, prašau", saveable: true, core: true },
              { id: "r2", lt: "Prašau kalbėkite lėčiau", en: "Please speak more slowly", audioText: "Prašau kalbėkite lėčiau", saveable: true, core: true },
              { id: "r3", lt: "Dar kartą, prašau", en: "One more time, please", audioText: "Dar kartą, prašau", saveable: true, core: true },
              { id: "r4", lt: "Lėčiau, prašau", en: "More slowly, please", audioText: "Lėčiau, prašau", saveable: true, core: true },
              { id: "r5", lt: "Dabar", en: "Now", audioText: "Dabar", saveable: true, core: true },
            ],
          },
          {
            id: "s1m3l2_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Pakartokite, prašau", audioText: "Pakartokite, prašau" },
            options: [
              { id: "a", text: "Please speak more slowly", isCorrect: false },
              { id: "b", text: "I don't understand", isCorrect: false },
              { id: "c", text: "Please repeat", isCorrect: true },
            ],
          },
          {
            id: "s1m3l2_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Lėčiau, prašau", audioText: "Lėčiau, prašau" },
            options: [
              { id: "a", text: "Please repeat", isCorrect: false },
              { id: "b", text: "More slowly, please", isCorrect: true },
              { id: "c", text: "One more time", isCorrect: false },
            ],
            feedback: { correct: "Lėčiau means 'more slowly' — a useful short form when you just need the speed to drop." },
          },
          {
            id: "s1m3l2_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone speaks very fast and you caught nothing at all." },
            options: [
              { id: "a", text: "Dar kartą, prašau", isCorrect: false },
              { id: "b", text: "Prašau kalbėkite lėčiau", isCorrect: true },
              { id: "c", text: "Suprantu", isCorrect: false },
            ],
            feedback: { correct: "Prašau kalbėkite lėčiau — please speak more slowly. Use this when pace is the problem, not repetition." },
          },
          {
            id: "s1m3l2_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You heard most of it but missed the last word." },
            options: [
              { id: "a", text: "Prašau kalbėkite lėčiau", isCorrect: false },
              { id: "b", text: "Dar kartą, prašau", isCorrect: true },
              { id: "c", text: "Nesuprantu", isCorrect: false },
            ],
            feedback: { correct: "Dar kartą, prašau — one more time please. Good when you almost caught it." },
          },
          {
            id: "s1m3l2_b6",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Please speak more slowly" },
            tokens: [
              { id: "t1", text: "Prašau", correctIndex: 0 },
              { id: "t2", text: "kalbėkite", correctIndex: 1 },
              { id: "t3", text: "lėčiau", correctIndex: 2 },
              { id: "t4", text: "pakartokite", isDistractor: true },
            ],
            answerText: "Prašau kalbėkite lėčiau",
          },
          {
            id: "s1m3l2_b7",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask someone to repeat what they said",
            targetText: "Pakartokite, prašau",
            audioText: "Pakartokite, prašau",
          },
          {
  id: "s1m3l2_b8_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a pharmacy. The pharmacist hands you your medicine and gives instructions too quickly to follow.",
  sceneIntro: "You're at a pharmacy. The pharmacist hands you your medicine and gives instructions too quickly to follow.",
  location: "pharmacy",
  userRole: "customer",
  register: "polite_service",
  goal: "You're at a pharmacy. The pharmacist hands you your medicine and gives instructions too quickly to follow.",
  focus: ["directions"],
  participants: [
    {
      "id": "pharmacist",
      "label": "Pharmacist",
      "name": "Rasa",
      "role": "pharmacist",
      "gender": "female",
      "relationshipToUser": "stranger",
      "register": "polite_service"
    },
  ],
  objects: [
    {
      "id": "pharmacy",
      "lt": "vaistin?",
      "en": "pharmacy",
      "gender": "feminine",
      "number": "singular"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "pharmacist",
      speakerLabel: "Pharmacist",
      speakerText: "Laba diena! Šiuos vaistus reikia vartoti du kartus per dieną.",
      supportText: "They're greeting you and giving instructions — but it went past too fast.",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Ačiū labai!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Atsiprašau, nesuprantu.",
          result: "repair",
          feedback: "Good repair. This keeps the conversation going when you need clarification.",
          progresses: true,
          followUp: {
            speakerId: "pharmacist",
            speakerLabel: "Speaker",
            speakerText: "Laba diena! Šiuos vaistus reikia vartoti du kartus per dieną.",
            sceneDirection: "The speaker repeats or clarifies the line."
          },
        },
        {
          id: "c",
          text: "Viso gero.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_2",
      speakerId: "pharmacist",
      speakerLabel: "Pharmacist",
      speakerText: "Du kartus per dieną.",
      supportText: "They slow right down, hold up two fingers and tap the medicine box — twice a day.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Ne, ačiū.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Suprantu. Ačiū!",
          result: "best",
          progresses: true,
        }
      ],
    }
  ],
},
        ],
      },

      // ── Lesson 3 ────────────────────────────────────────────────────────────
      {
        id: "section_1_module_3_lesson_3",
        code: "1.3.3",
        title: "What Does This Mean?",
        purpose: "Bridge comprehension repair with pointing and reference language.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Tai means 'this / it' and ten means 'that / there'. These two words appear constantly — start noticing them in any Lithuanian you see.",
          usage: [
            "Ką tai reiškia? — What does this mean?",
            "Kas tai? — What is this?",
            "Kas ten? — What is that / what is there?",
            "Ką tai reiškia angliškai? — What does this mean in English?",
            "Tai reiškia… — It means… (how a Lithuanian speaker would reply)",
          ],
        },
        blocks: [
          {
            id: "s1m3l3_b1",
            type: "learn",
            title: "Asking what things mean",
            items: [
              { id: "m1", lt: "Ką tai reiškia?", en: "What does this mean?", audioText: "Ką tai reiškia", saveable: true, core: true },
              { id: "m2", lt: "Kas tai?", en: "What is this?", audioText: "Kas tai", saveable: true, core: true },
              { id: "m3", lt: "Kas ten?", en: "What is that?", audioText: "Kas ten", saveable: true, core: true },
              { id: "m4", lt: "Ką tai reiškia angliškai?", en: "What does this mean in English?", audioText: "Ką tai reiškia angliškai", saveable: true, core: true },
              { id: "m5", lt: "Žodis", en: "Word", audioText: "Žodis", saveable: true, core: true },
              { id: "m6", lt: "Ženklas", en: "Sign", audioText: "Ženklas", saveable: true, core: true },
            ],
          },
          {
            id: "s1m3l3_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ką tai reiškia?", audioText: "Ką tai reiškia" },
            options: [
              { id: "a", text: "What is that?", isCorrect: false },
              { id: "b", text: "What does this mean?", isCorrect: true },
              { id: "c", text: "What is this?", isCorrect: false },
            ],
          },
          {
            id: "s1m3l3_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kas ten?", audioText: "Kas ten" },
            options: [
              { id: "a", text: "What is this?", isCorrect: false },
              { id: "b", text: "What does this mean?", isCorrect: false },
              { id: "c", text: "What is that?", isCorrect: true },
            ],
            feedback: { correct: "Kas ten? — what is that? Ten points to something further away. Tai points to something near." },
          },
          {
            id: "s1m3l3_b4",
            type: "recognise_mcq",
            title: "Choose the right phrase",
            prompt: { text: "You see a sign you don't recognise and want to know what it says." },
            options: [
              { id: "a", text: "Ką tai reiškia angliškai?", isCorrect: true },
              { id: "b", text: "Nesuprantu", isCorrect: false },
              { id: "c", text: "Dar kartą, prašau", isCorrect: false },
            ],
            feedback: { correct: "Ką tai reiškia angliškai? — What does this mean in English? Precise and useful when you need a translation." },
          },
          {
            id: "s1m3l3_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "What does this mean?" },
            tokens: [
              { id: "t1", text: "Ką", correctIndex: 0 },
              { id: "t2", text: "tai", correctIndex: 1 },
              { id: "t3", text: "reiškia?", correctIndex: 2 },
              { id: "t4", text: "angliškai?", isDistractor: true },
            ],
            answerText: "Ką tai reiškia?",
          },
          {
            id: "s1m3l3_b6",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Point to something unfamiliar and ask what it means",
            targetText: "Ką tai reiškia?",
            audioText: "Ką tai reiškia",
          },
          {
  id: "s1m3l3_b7_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're in a Lithuanian café. You see words on the menu you don't recognise and ask the server for help.",
  sceneIntro: "You're in a Lithuanian café. You see words on the menu you don't recognise and ask the server for help.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You're in a Lithuanian café. You see words on the menu you don't recognise and ask the server for help.",
  focus: ["conversation practice"],
  participants: [
    {
      "id": "local",
      "label": "Local",
      "name": "Rasa",
      "role": "local speaker",
      "gender": "female",
      "relationshipToUser": "stranger",
      "register": "polite_neutral"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Laba diena! Ar galiu jums padėti?",
      supportText: "The server greets you and asks if they can help — but you don't understand yet.",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Ne, ačiū",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Laba diena! Prašau. Ką tai reiškia?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Viso gero",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Tai yra cepelinai — tradicinis lietuviškas patiekalas.",
      supportText: "The server explains what it is — a traditional Lithuanian dish.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Suprantu. Ačiū!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Nesuprantu. Ką tai reiškia angliškai?",
          result: "repair",
          feedback: "Good repair. This keeps the conversation going when you need clarification.",
          progresses: true,
          followUp: {
            speakerId: "local",
            speakerLabel: "Speaker",
            speakerText: "Tai yra cepelinai — tradicinis lietuviškas patiekalas.",
            sceneDirection: "The speaker repeats or clarifies the line."
          },
        },
        {
          id: "c",
          text: "Prašau kalbėkite lėčiau",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Ah — potato dumplings! Labai skanu.",
      supportText: "She says: very tasty!",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Nesuprantu",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ačiū labai! Suprantu.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Pakartokite, prašau",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    }
  ],
},
        ],
      },

      // ── Lesson 4 ────────────────────────────────────────────────────────────
      {
        id: "section_1_module_3_lesson_4",
        code: "1.3.4",
        title: "Do You Speak English?",
        purpose: "Teach fallback language for when comprehension fully breaks down.",
        supportLevel: "medium",
        newLanguageLoad: "low_to_medium",
        notes: {
          pattern: "This is a rescue tool, not a way to avoid Lithuanian. Use it when you genuinely need help — then try to get back to Lithuanian as soon as possible.",
          usage: [
            "Ar jūs kalbate angliškai? — Do you speak English? (formal)",
            "Ar tu kalbi angliškai? — Do you speak English? (informal)",
            "Truputį — a little (casual, conversational — what most Lithuanians say in everyday speech)",
            "Šiek tiek — a little (standard/neutral — equally correct, more common in written Lithuanian)",
            "Both are natural and interchangeable. When in doubt, truputį sounds more like a native speaker in conversation.",
          ],
        },
        blocks: [
          {
            id: "s1m3l4_b1",
            type: "learn",
            title: "Language fallback phrases",
            items: [
              { id: "lb1", lt: "Ar jūs kalbate angliškai?", en: "Do you speak English? (formal)", audioText: "Ar jūs kalbate angliškai", saveable: true, core: true },
              { id: "lb2", lt: "Taip, truputį", en: "Yes, a little (casual)", audioText: "Taip, truputį", saveable: true, core: true },
              { id: "lb2b", lt: "Taip, šiek tiek", en: "Yes, a little (standard)", audioText: "Taip, šiek tiek", saveable: true, core: true },
              { id: "lb4", lt: "Aš kalbu truputį lietuviškai", en: "I speak a little Lithuanian (casual)", audioText: "Aš kalbu truputį lietuviškai", saveable: true, core: true },
              { id: "lb4b", lt: "Aš kalbu šiek tiek lietuviškai", en: "I speak a little Lithuanian (standard)", audioText: "Aš kalbu šiek tiek lietuviškai", saveable: true, core: true },
              { id: "lb5", lt: "Truputį", en: "A little (casual)", audioText: "Truputį", saveable: true, core: true },
              { id: "lb5b", lt: "Šiek tiek", en: "A little (standard)", audioText: "Šiek tiek", saveable: true, core: true },
            ],
          },
          {
            id: "s1m3l4_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar jūs kalbate angliškai?", audioText: "Ar jūs kalbate angliškai" },
            options: [
              { id: "a", text: "I speak a little Lithuanian", isCorrect: false },
              { id: "b", text: "Do you speak English?", isCorrect: true },
              { id: "c", text: "A little", isCorrect: false },
            ],
          },
          {
            id: "s1m3l4_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Aš kalbu šiek tiek lietuviškai", audioText: "Aš kalbu šiek tiek lietuviškai" },
            options: [
              { id: "a", text: "Do you speak Lithuanian?", isCorrect: false },
              { id: "b", text: "Yes, a little", isCorrect: false },
              { id: "c", text: "I speak a little Lithuanian", isCorrect: true },
            ],
            feedback: { correct: "Aš kalbu means I speak. Šiek tiek = a little. Lietuviškai = Lithuanian (language form)." },
          },
          {
            id: "s1m3l4_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You've tried everything and really need English help." },
            options: [
              { id: "a", text: "Dar kartą, prašau", isCorrect: false },
              { id: "b", text: "Ar jūs kalbate angliškai?", isCorrect: true },
              { id: "c", text: "Kas tai?", isCorrect: false },
            ],
            feedback: { correct: "Ar jūs kalbate angliškai? — Do you speak English? The last resort that can save you." },
          },
          {
            id: "s1m3l4_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "I speak a little Lithuanian (casual)" },
            tokens: [
              { id: "t1", text: "Aš", correctIndex: 0 },
              { id: "t2", text: "kalbu", correctIndex: 1 },
              { id: "t3", text: "truputį", correctIndex: 2 },
              { id: "t4", text: "lietuviškai", correctIndex: 3 },
              { id: "t5", text: "angliškai", isDistractor: true },
              { id: "t6", text: "šiek", isDistractor: true },
            ],
            answerText: "Aš kalbu truputį lietuviškai",
          },
          {
            id: "s1m3l4_b6",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask someone if they speak English",
            targetText: "Ar jūs kalbate angliškai",
            audioText: "Ar jūs kalbate angliškai",
          },
          {
  id: "s1m3l4_b7_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're lost near Vilnius train station. You stop someone to ask for help — a full repair sequence.",
  sceneIntro: "You're lost near Vilnius train station. You stop someone to ask for help — a full repair sequence.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "You're lost near Vilnius train station. You stop someone to ask for help — a full repair sequence.",
  focus: ["directions"],
  participants: [
    {
      "id": "assistant",
      "label": "Assistant",
      "name": "Rasa",
      "role": "assistant",
      "gender": "female",
      "relationshipToUser": "stranger",
      "register": "polite_service"
    },
  ],
  objects: [
    {
      "id": "station",
      "lt": "stotis",
      "en": "station",
      "gender": "feminine",
      "number": "singular"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Laba diena!",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Laba diena! Atsiprašau, ar galite man padėti?",
          result: "best",
          progresses: true,
        },
        {
          id: "b",
          text: "Viso gero!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Ne, ačiū",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_2",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Taip. Kuo galiu padėti?",
      supportText: "They say yes and ask how they can help — but you don't understand.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Suprantu, ačiū",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Nesuprantu. Ar jūs kalbate angliškai?",
          result: "repair",
          feedback: "Good repair. This keeps the conversation going when you need clarification.",
          progresses: true,
          followUp: {
            speakerId: "assistant",
            speakerLabel: "Speaker",
            speakerText: "Taip. Kuo galiu padėti?",
            sceneDirection: "The speaker repeats or clarifies the line."
          },
        },
        {
          id: "c",
          text: "Labas rytas",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Taip, šiek tiek.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Ačiū! Aš kalbu truputį lietuviškai.",
          result: "best",
          progresses: true,
        },
        {
          id: "b",
          text: "Nesuprantu",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Dar kartą, prašau",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_4",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Gerai! Kur norite eiti?",
      supportText: "They ask where you want to go — but you don't understand.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Viso gero!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Pakartokite, prašau. Nesuprantu.",
          result: "repair",
          feedback: "Good repair. This keeps the conversation going when you need clarification.",
          progresses: true,
          followUp: {
            speakerId: "assistant",
            speakerLabel: "Speaker",
            speakerText: "Gerai! Kur norite eiti?",
            sceneDirection: "The speaker repeats or clarifies the line."
          },
        },
        {
          id: "c",
          text: "Taip, suprantu",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    }
  ],
},
        ],
      },

      // ── Checkpoint ────────────────────────────────────────────────────────
      {
        id: "section_1_module_3_checkpoint",
        code: "1.3.C",
        title: "Checkpoint",
        purpose: "Check you can repair a conversation and ask for what you need without panic.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s1m3c_b1",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone speaks to you very quickly and you didn't catch a single word." },
            options: [
              { id: "a", text: "Suprantu", isCorrect: false },
              { id: "b", text: "Prašau kalbėkite lėčiau", isCorrect: true },
              { id: "c", text: "Ačiū labai", isCorrect: false },
            ],
            feedback: { correct: "Prašau kalbėkite lėčiau — please speak more slowly. Speed is the problem here, not the words themselves." },
          },
          {
            id: "s1m3c_b2",
            type: "listen_mcq",
            title: "Listen and identify",
            prompt: { text: "Ką tai reiškia angliškai?", audioText: "Ką tai reiškia angliškai" },
            options: [
              { id: "a", text: "What is this?", isCorrect: false },
              { id: "b", text: "Please repeat", isCorrect: false },
              { id: "c", text: "What does this mean in English?", isCorrect: true },
            ],
          },
          {
            id: "s1m3c_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You need help and everything else has failed. What's your last resort?" },
            options: [
              { id: "a", text: "Dar kartą, prašau", isCorrect: false },
              { id: "b", text: "Ką tai reiškia?", isCorrect: false },
              { id: "c", text: "Ar jūs kalbate angliškai?", isCorrect: true },
            ],
            feedback: { correct: "Ar jūs kalbate angliškai? — Do you speak English? Save this for genuine breakdown moments." },
          },
          {
            id: "s1m3c_b4",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Ne, nesuprantu", audioText: "Ne, nesuprantu" },
            options: [
              { id: "a", text: "Yes, I understand", isCorrect: false },
              { id: "b", text: "No, I don't understand", isCorrect: true },
              { id: "c", text: "Please repeat", isCorrect: false },
            ],
          },
          {
            id: "s1m3c_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Please repeat" },
            tokens: [
              { id: "t1", text: "Pakartokite,", correctIndex: 0 },
              { id: "t2", text: "prašau", correctIndex: 1 },
              { id: "t3", text: "lėčiau", isDistractor: true },
            ],
            answerText: "Pakartokite, prašau",
          },
          {
            id: "s1m3c_b6",
            type: "listen_mcq",
            title: "Listen and identify",
            prompt: { text: "Aš kalbu šiek tiek lietuviškai", audioText: "Aš kalbu šiek tiek lietuviškai" },
            options: [
              { id: "a", text: "Do you speak Lithuanian?", isCorrect: false },
              { id: "b", text: "I speak a little Lithuanian", isCorrect: true },
              { id: "c", text: "Yes, a little", isCorrect: false },
            ],
          },
          {
            id: "s1m3c_b7",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Tell someone you don't understand",
            targetText: "Nesuprantu",
            audioText: "Nesuprantu",
          },
          {
            id: "s1m3c_b8",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You almost caught the sentence but missed one word near the end." },
            options: [
              { id: "a", text: "Prašau kalbėkite lėčiau", isCorrect: false },
              { id: "b", text: "Ar jūs kalbate angliškai?", isCorrect: false },
              { id: "c", text: "Dar kartą, prašau", isCorrect: true },
            ],
            feedback: { correct: "Dar kartą, prašau — one more time please. Use this when you nearly got it. Prašau kalbėkite lėčiau is for when the speed is the problem." },
          },
          {
            id: "s1m3c_b8b",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Truputį", audioText: "Truputį" },
            options: [
              { id: "a", text: "A little (standard written form)", isCorrect: false },
              { id: "b", text: "Please repeat", isCorrect: false },
              { id: "c", text: "A little (casual, conversational)", isCorrect: true },
            ],
            feedback: { correct: "Truputį is the casual, conversational form. Šiek tiek is the standard/written form. Both mean a little — your Lithuanian friends will likely say truputį." },
          },
          {
  id: "s1m3c_b9_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You've just arrived in Vilnius and you're looking for the bus stop. You meet Rokas, who offers to help. Use everything from Modules 1.1, 1.2, and 1.3.",
  sceneIntro: "You've just arrived in Vilnius and you're looking for the bus stop. You meet Rokas, who offers to help. Use everything from Modules 1.1, 1.2, and 1.3.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You've just arrived in Vilnius and you're looking for the bus stop. You meet Rokas, who offers to help. Use everything from Modules 1.1, 1.2, and 1.3.",
  focus: ["conversation practice"],
  participants: [
    {
      "id": "local",
      "label": "Local",
      "name": "Rokas",
      "role": "local speaker",
      "gender": "male",
      "relationshipToUser": "stranger",
      "register": "polite_neutral"
    },
  ],
  objects: [
    {
      "id": "station",
      "lt": "stotis",
      "en": "station",
      "gender": "feminine",
      "number": "singular"
    },
    {
      "id": "bus",
      "lt": "autobusas",
      "en": "bus",
      "gender": "masculine",
      "number": "singular"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Laba diena! Aš esu Rokas. Koks jūsų vardas?",
      supportText: "Rokas introduces himself and asks your name.",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Viso gero!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ne, ačiū",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: `Laba diena! Mano vardas ${userNameSafe}. Malonu susipažinti.`,
          result: "best",
          progresses: true,
        }
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Malonu susipažinti! Iš kur jūs esate?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Atsiprašau",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: `${userFromPhrase}.`,
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Taip, suprantu!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Puiku! Ar galiu jums padėti?",
      supportText: "He asks if he can help you.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Nesuprantu.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Viso gero!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Taip! Kur yra autobusų stotelė?",
          result: "best",
          progresses: true,
        }
      ],
    },
    {
      id: "step_4",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Autobusų stotelė yra ten.",
      supportText: "He points down the street — but you didn't catch the word for bus stop.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Ačiū labai!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Nesuprantu. Ką tai reiškia angliškai?",
          result: "repair",
          feedback: "Good repair. This keeps the conversation going when you need clarification.",
          progresses: true,
          followUp: {
            speakerId: "local",
            speakerLabel: "Speaker",
            speakerText: "Autobusų stotelė yra ten.",
            sceneDirection: "The speaker repeats or clarifies the line."
          },
        },
        {
          id: "c",
          text: "Atsiprašau",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_5",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Autobusų stotelė — bus stop!",
      supportText: "He points at a sign on the shelter ahead so you can see the word.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Nesuprantu.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Ah! Suprantu. Ačiū labai!",
          result: "best",
          progresses: true,
        }
      ],
    },
    {
      id: "step_6",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Prašom. Viso gero!",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Malonu susipažinti.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Nesuprantu.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Viso gero! Ačiū!",
          result: "best",
          progresses: true,
        }
      ],
    }
  ],
},
          {
            id: "s1m3c_b10",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "wm1",  lt: "Aš nesuprantu",               en: "I don't understand",                    audioText: "Aš nesuprantu" },
              { id: "wm2",  lt: "Nesuprantu",                   en: "I don't understand (short)",            audioText: "Nesuprantu" },
              { id: "wm3",  lt: "Suprantu",                     en: "I understand",                          audioText: "Suprantu" },
              { id: "wm4",  lt: "Taip, suprantu",               en: "Yes, I understand",                     audioText: "Taip, suprantu" },
              { id: "wm5",  lt: "Ne, nesuprantu",               en: "No, I don't understand",                audioText: "Ne, nesuprantu" },
              { id: "wm6",  lt: "Pakartokite, prašau",          en: "Please repeat",                         audioText: "Pakartokite, prašau" },
              { id: "wm7",  lt: "Prašau kalbėkite lėčiau",     en: "Please speak more slowly",              audioText: "Prašau kalbėkite lėčiau" },
              { id: "wm8",  lt: "Dar kartą, prašau",            en: "One more time, please",                 audioText: "Dar kartą, prašau" },
              { id: "wm9",  lt: "Lėčiau, prašau",               en: "More slowly, please",                   audioText: "Lėčiau, prašau" },
              { id: "wm10", lt: "Ką tai reiškia?",              en: "What does this mean?",                  audioText: "Ką tai reiškia" },
              { id: "wm11", lt: "Kas tai?",                     en: "What is this?",                         audioText: "Kas tai" },
              { id: "wm12", lt: "Kas ten?",                     en: "What is that?",                         audioText: "Kas ten" },
              { id: "wm13", lt: "Ką tai reiškia angliškai?",   en: "What does this mean in English?",       audioText: "Ką tai reiškia angliškai" },
              { id: "wm14", lt: "Ar jūs kalbate angliškai?",   en: "Do you speak English?",                 audioText: "Ar jūs kalbate angliškai" },
              { id: "wm15", lt: "Taip, šiek tiek",              en: "Yes, a little",                         audioText: "Taip, šiek tiek" },
              { id: "wm16", lt: "Aš kalbu šiek tiek lietuviškai", en: "I speak a little Lithuanian",        audioText: "Aš kalbu šiek tiek lietuviškai" },
              { id: "wm17", lt: "Šiek tiek",                    en: "A little",                              audioText: "Šiek tiek" },
              { id: "wm17b", lt: "Dabar",                        en: "Now",                                   audioText: "Dabar" },
              { id: "wm18", lt: "Žodis",                        en: "Word",                                  audioText: "Žodis" },
              { id: "wm19", lt: "Ženklas",                      en: "Sign",                                  audioText: "Ženklas" },
              { id: "wm20", lt: "Vaistinė",                     en: "Pharmacy",                              audioText: "Vaistinė" },
              { id: "wm21", lt: "Truputį",                       en: "A little (casual)",                     audioText: "Truputį" },
            ],
          },
        ],
      },
    ],
  };
}

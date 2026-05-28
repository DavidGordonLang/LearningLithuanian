// src/content/learning/section5/module_5_2.js
// Module 5.2 — Places That Matter

export default function createModule_5_2(profile = {}) {
  const { userNameSafe = "Davidas" } = profile;

  return {
    id: "module_5_2",
    code: "5.2",
    title: "Places That Matter",
    status: "active",
    lessonCount: 5,
    lessons: [

      // ── Lesson 1 — Transport and Movement Places ──────────────────────────
      {
        id: "section_5_module_2_lesson_1",
        code: "5.2.1",
        title: "Transport and Movement Places",
        purpose: "Teach the most useful movement-related places.",
        supportLevel: "high",
        newLanguageLoad: "low",
        blocks: [
          {
            id: "s5m2l1_b1",
            type: "learn",
            title: "Transport places",
            items: [
              { id: "i1", lt: "autobusų stotis",     en: "bus station",       audioText: "autobusų stotis",    saveable: true, core: true },
              { id: "i2", lt: "geležinkelio stotis", en: "train station",     audioText: "geležinkelio stotis",saveable: true, core: true },
              { id: "i3", lt: "stotelė",             en: "stop / bus stop",   audioText: "stotelė",            saveable: true, core: true },
              { id: "i4", lt: "oro uostas",          en: "airport",           audioText: "oro uostas",         saveable: true, core: false },
            ],
          },
          {
            id: "s5m2l1_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "autobusų stotis", audioText: "autobusų stotis" },
            options: [
              { id: "a", text: "train station", isCorrect: false },
              { id: "b", text: "bus station",   isCorrect: true  },
              { id: "c", text: "airport",       isCorrect: false },
            ],
          },
          {
            id: "s5m2l1_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "geležinkelio stotis", audioText: "geležinkelio stotis" },
            options: [
              { id: "a", text: "bus station",   isCorrect: false },
              { id: "b", text: "bus stop",      isCorrect: false },
              { id: "c", text: "train station", isCorrect: true  },
            ],
          },
          {
            id: "s5m2l1_b4",
            type: "context_gap_select",
            prompt: "Choose the correct place word",
            sentence: "Kur yra autobusų ___?",
            translation_en: "Where is the bus station?",
            options: [
              { id: "a", text: "stotelė",  isCorrect: false },
              { id: "b", text: "stotis",   isCorrect: true  },
              { id: "c", text: "uostas",   isCorrect: false },
            ],
            explanation: "Autobusų stotis is the full term for bus station. Stotelė is a single bus stop on a route.",
          },
          {
            id: "s5m2l1_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: Where is the bus station?",
            targetText: "Kur yra autobusų stotis",
            audioText: "Kur yra autobusų stotis",
          },
          {
  id: "s5m2l1_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You've just arrived and need to find the train station.",
  sceneIntro: "You've just arrived and need to find the train station.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "You've just arrived and need to find the train station.",
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
      speakerText: "Laba diena! Ar galiu jums padėti?",
      supportText: "Good day! Can I help you?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Viso gero.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip! Kur yra geležinkelio stotis?",
          textEn: "Yes! Where is the train station?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Nesuprantu.",
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
      speakerText: "Geležinkelio stotis yra ten. Eikite tiesiai.",
      supportText: "The train station is there. Go straight.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ar tai toli?",
          textEn: "Is it far?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Nesuprantu.",
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
      speakerText: "Ne, tai netoli. Dešimt minučių.",
      supportText: "No, it's near. Ten minutes.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Per toli.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ačiū labai! Viso gero.",
          textEn: "Thank you very much! Goodbye.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Nesuprantu.",
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

      // ── Lesson 2 — Essential Public Places ───────────────────────────────
      {
        id: "section_5_module_2_lesson_2",
        code: "5.2.2",
        title: "Essential Public Places",
        purpose: "Teach urgent-use public places.",
        supportLevel: "high",
        newLanguageLoad: "low",
        blocks: [
          {
            id: "s5m2l2_b1",
            type: "learn",
            title: "Public places",
            items: [
              { id: "i1", lt: "tualetas",  en: "toilet",   audioText: "tualetas",  saveable: true, core: true },
              { id: "i2", lt: "vaistinė",  en: "pharmacy", audioText: "vaistinė",  saveable: true, core: true },
              { id: "i3", lt: "ligoninė",  en: "hospital", audioText: "ligoninė",  saveable: true, core: true },
              { id: "i4", lt: "policija",  en: "police",   audioText: "policija",  saveable: true, core: true },
            ],
          },
          {
            id: "s5m2l2_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "ligoninė", audioText: "ligoninė" },
            options: [
              { id: "a", text: "pharmacy", isCorrect: false },
              { id: "b", text: "police",   isCorrect: false },
              { id: "c", text: "hospital", isCorrect: true  },
            ],
          },
          {
            id: "s5m2l2_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "policija", audioText: "policija" },
            options: [
              { id: "a", text: "pharmacy", isCorrect: false },
              { id: "b", text: "police",   isCorrect: true  },
              { id: "c", text: "hospital", isCorrect: false },
            ],
          },
          {
            id: "s5m2l2_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone feels unwell. They need urgent medical help. Which place do they need?", audioText: "" },
            noOptionAudio: true,
            options: [
              { id: "a", text: "vaistinė",  isCorrect: false },
              { id: "b", text: "ligoninė",  isCorrect: true  },
              { id: "c", text: "policija",  isCorrect: false },
            ],
            feedback: { correct: "Ligoninė — hospital. For urgent medical situations. Vaistinė (pharmacy) is better for minor needs." },
          },
          {
            id: "s5m2l2_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: Where is the pharmacy?",
            targetText: "Kur yra vaistinė",
            audioText: "Kur yra vaistinė",
          },
          {
  id: "s5m2l2_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You need to find the pharmacy quickly.",
  sceneIntro: "You need to find the pharmacy quickly.",
  location: "pharmacy",
  userRole: "customer",
  register: "polite_service",
  goal: "You need to find the pharmacy quickly.",
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
      speakerText: "Laba diena!",
      supportText: "Good day!",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Viso gero.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Laba diena! Atsiprašau, kur yra vaistinė?",
          textEn: "Good day! Excuse me, where is the pharmacy?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Nesuprantu.",
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
      speakerText: "Vaistinė? Ten, dešinėn.",
      supportText: "Pharmacy? There, on the right.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Prašau kalbėkite lėčiau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ačiū! Ar tai toli?",
          textEn: "Thank you! Is it far?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Nesuprantu.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "pharmacist",
      speakerLabel: "Pharmacist",
      speakerText: "Ne, tai čia pat.",
      supportText: "No, it's right here.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Puiku! Ačiū labai.",
          textEn: "Great! Thank you very much.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Nesuprantu.",
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

      // ── Lesson 3 — Daily Utility Places ──────────────────────────────────
      {
        id: "section_5_module_2_lesson_3",
        code: "5.2.3",
        title: "Daily Utility Places",
        purpose: "Teach a few everyday service places.",
        supportLevel: "high",
        newLanguageLoad: "low",
        blocks: [
          {
            id: "s5m2l3_b1",
            type: "learn",
            title: "Everyday places",
            items: [
              { id: "i1", lt: "parduotuvė", en: "shop / store", audioText: "parduotuvė", saveable: true, core: true },
              { id: "i2", lt: "kavinė",     en: "café",         audioText: "kavinė",     saveable: true, core: true },
              { id: "i3", lt: "viešbutis",  en: "hotel",        audioText: "viešbutis",  saveable: true, core: true },
              { id: "i4", lt: "bankas",     en: "bank",         audioText: "bankas",     saveable: true, core: true },
            ],
          },
          {
            id: "s5m2l3_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "parduotuvė", audioText: "parduotuvė" },
            options: [
              { id: "a", text: "café",  isCorrect: false },
              { id: "b", text: "hotel", isCorrect: false },
              { id: "c", text: "shop",  isCorrect: true  },
            ],
          },
          {
            id: "s5m2l3_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "kavinė", audioText: "kavinė" },
            options: [
              { id: "a", text: "shop",  isCorrect: false },
              { id: "b", text: "café",  isCorrect: true  },
              { id: "c", text: "bank",  isCorrect: false },
            ],
          },
          {
            id: "s5m2l3_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You want a coffee. Which place do you look for?", audioText: "" },
            noOptionAudio: true,
            options: [
              { id: "a", text: "bankas",     isCorrect: false },
              { id: "b", text: "kavinė",     isCorrect: true  },
              { id: "c", text: "parduotuvė", isCorrect: false },
            ],
            feedback: { correct: "Kavinė — café. The place you already know well from Section 4. Now you can also ask where to find one." },
          },
          {
            id: "s5m2l3_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: Where is the café?",
            targetText: "Kur yra kavinė",
            audioText: "Kur yra kavinė",
          },
          {
  id: "s5m2l3_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You want to find a café near your hotel.",
  sceneIntro: "You want to find a café near your hotel.",
  location: "hotel reception",
  userRole: "guest",
  register: "polite_service",
  goal: "You want to find a café near your hotel.",
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
      "id": "coffee",
      "lt": "kava",
      "en": "coffee",
      "gender": "feminine",
      "number": "singular"
    },
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
      speakerText: "Laba diena! Ko jums reikia?",
      supportText: "Good day! What do you need?",
      sceneDirection: "The exchange begins.",
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
          text: "Laba diena! Kur yra kavinė?",
          textEn: "Good day! Where is a café?",
          result: "best",
          progresses: true,
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
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Kavinė yra ten, netoli viešbučio.",
      supportText: "The café is there, near the hotel.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ačiū! Ar tai toli?",
          textEn: "Thank you! Is it far?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Kur yra parduotuvė?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Ne, tai netoli. Tiesiai.",
      supportText: "No, it's near. Straight ahead.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
          text: "Puiku! Ačiū labai.",
          textEn: "Great! Thank you very much.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Per brangu.",
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

      // ── Lesson 4 — Where Is the…? ─────────────────────────────────────────
      {
        id: "section_5_module_2_lesson_4",
        code: "5.2.4",
        title: "Where Is the…?",
        purpose: "Attach the high-value place set to the core location frame.",
        supportLevel: "medium",
        newLanguageLoad: "very_low",
        blocks: [
          {
            id: "s5m2l4_b1",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kur yra autobusų stotis?", audioText: "Kur yra autobusų stotis" },
            options: [
              { id: "a", text: "Where is the train station?", isCorrect: false },
              { id: "b", text: "Where is the bus station?",   isCorrect: true  },
              { id: "c", text: "Where is the bus stop?",      isCorrect: false },
            ],
          },
          {
            id: "s5m2l4_b2",
            type: "choose_correct_form",
            base_word: "viešbutis",
            word_gloss_en: "hotel",
            prompt: "Complete the question",
            sentence: "Kur yra ___?",
            translation_en: "Where is the hotel?",
            options: [
              { id: "a", text: "viešbučio", isCorrect: false },
              { id: "b", text: "viešbutyje", isCorrect: false },
              { id: "c", text: "viešbutis",  isCorrect: true  },
            ],
            explanation: "After Kur yra, the place word keeps its base form. Viešbutyje means in the hotel, and viešbučio means of the hotel — those come later.",
          },
          {
            id: "s5m2l4_b3",
            type: "context_gap_select",
            prompt: "Choose the correct place",
            sentence: "Man reikia pinigų. Kur yra ___?",
            translation_en: "I need money. Where is the bank?",
            options: [
              { id: "a", text: "kavinė",  isCorrect: false },
              { id: "b", text: "bankas",  isCorrect: true  },
              { id: "c", text: "vaistinė",isCorrect: false },
            ],
            explanation: "Pinigų means money, so a bankas (bank) is the logical place needed here.",
          },
          {
            id: "s5m2l4_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: Where is the bus station?",
            targetText: "Kur yra autobusų stotis",
            audioText: "Kur yra autobusų stotis",
          },
          {
  id: "s5m2l4_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You need cash from the bank before heading to the bus station.",
  sceneIntro: "You need cash from the bank before heading to the bus station.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "You need cash from the bank before heading to the bus station.",
  focus: ["payment","directions"],
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
      "id": "cash",
      "lt": "grynieji",
      "en": "cash",
      "gender": "masculine",
      "number": "plural"
    },
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
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Laba diena! Ar galiu jums padėti?",
      supportText: "Good day! Can I help you?",
      sceneDirection: "The exchange begins.",
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
          text: "Taip! Kur yra bankas?",
          textEn: "Yes! Where is the bank?",
          result: "best",
          progresses: true,
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
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Bankas yra ten, kairėn.",
      supportText: "The bank is there, on the left.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Ačiū!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ačiū! Ir kur yra autobusų stotis?",
          textEn: "Thank you! And where is the bus station?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Prašau kalbėkite lėčiau.",
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
      speakerText: "Autobusų stotis yra tiesiai, paskui dešinėn. Netoli.",
      supportText: "The bus station is straight ahead, then right. Not far.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ačiū labai! Viso gero.",
          textEn: "Thank you very much! Goodbye.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Nesuprantu.",
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

      // ── Lesson 5 — Place Recognition in Context ───────────────────────────
      {
        id: "section_5_module_2_lesson_5",
        code: "5.2.5",
        title: "Place Recognition in Context",
        purpose: "Stop place words existing only as isolated vocabulary.",
        supportLevel: "medium",
        newLanguageLoad: "very_low",
        blocks: [
          {
            id: "s5m2l5_b1",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Autobusų stotis ten.", audioText: "Autobusų stotis ten" },
            options: [
              { id: "a", text: "The café is there.",          isCorrect: false },
              { id: "b", text: "The bus station is there.",   isCorrect: true  },
              { id: "c", text: "The train station is there.", isCorrect: false },
            ],
          },
          {
            id: "s5m2l5_b2",
            type: "conversation_turn_fill",
            scene_label: "In the street",
            lines: [
              { speaker: "You",   text: "Atsiprašau, man reikia vaistų.", audioText: "Atsiprašau, man reikia vaistų", hasGap: false },
              { speaker: "Local", text: "___ yra ten, kairėn.",           hasGap: true },
            ],
            options: [
              { id: "a", text: "Kavinė",    isCorrect: false },
              { id: "b", text: "Vaistinė",  isCorrect: true  },
              { id: "c", text: "Ligoninė",  isCorrect: false },
            ],
            explanation: "Vaistų means medicine or medication — so the person needs a vaistinė (pharmacy), not a café or hospital.",
            translation_en: "Excuse me, I need medication. — The pharmacy is there, on the left.",
          },
          {
            id: "s5m2l5_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone says: Tualetas čia pat. What do they mean?", audioText: "" },
            noOptionAudio: true,
            options: [
              { id: "a", text: "The toilet is far from here.", isCorrect: false },
              { id: "b", text: "The toilet is right here.",    isCorrect: true  },
              { id: "c", text: "The hotel is right here.",     isCorrect: false },
            ],
            feedback: { correct: "Čia pat means right here. Tualetas čia pat — the toilet is right here. Pat adds immediacy." },
          },
          {
            id: "s5m2l5_b4",
            type: "context_gap_select",
            prompt: "Choose the correct place",
            sentence: "Aš noriu kavos. Kur yra ___?",
            translation_en: "I want a coffee. Where is the café?",
            options: [
              { id: "a", text: "bankas",    isCorrect: false },
              { id: "b", text: "kavinė",    isCorrect: true  },
              { id: "c", text: "ligoninė",  isCorrect: false },
            ],
            explanation: "If you want coffee, you need a kavinė (café). A bankas is a bank, ligoninė is a hospital.",
          },
          {
  id: "s5m2l5_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You hear a place word in a short exchange. Listen and respond correctly.",
  sceneIntro: "You hear a place word in a short exchange. Listen and respond correctly.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You hear a place word in a short exchange. Listen and respond correctly.",
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
      speakerText: "Laba diena! Ar ieškote viešbučio?",
      supportText: "Good day! Are you looking for the hotel?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Ne, kur yra kavinė?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip! Kur yra viešbutis?",
          textEn: "Yes! Where is the hotel?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Nesuprantu.",
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
      speakerText: "Viešbutis yra ten. Eikite tiesiai.",
      supportText: "The hotel is there. Go straight.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Suprantu. Ačiū!",
          textEn: "I understand. Thank you!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Kur yra stotis?",
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
      speakerText: "Prašom. Ar jums dar reikia pagalbos?",
      supportText: "You're welcome. Do you need any more help?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Taip, labai.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ne, ačiū. Viso gero!",
          textEn: "No, thank you. Goodbye!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Nesuprantu.",
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

      // ── Module 5.2 Checkpoint ─────────────────────────────────────────────
      {
        id: "section_5_module_2_checkpoint",
        code: "5.2.C",
        title: "Places Check",
        purpose: "Check that key place words are solid in context.",
        supportLevel: "low",
        newLanguageLoad: "none",
        blocks: [
          {
            id: "s5m2c_b1",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "geležinkelio stotis", audioText: "geležinkelio stotis" },
            options: [
              { id: "a", text: "bus station",   isCorrect: false },
              { id: "b", text: "train station", isCorrect: true  },
              { id: "c", text: "airport",       isCorrect: false },
            ],
          },
          {
            id: "s5m2c_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "ligoninė", audioText: "ligoninė" },
            options: [
              { id: "a", text: "pharmacy", isCorrect: false },
              { id: "b", text: "police",   isCorrect: false },
              { id: "c", text: "hospital", isCorrect: true  },
            ],
          },
          {
            id: "s5m2c_b3",
            type: "context_gap_select",
            prompt: "Choose the correct place",
            sentence: "Man reikia pagalbos. Kur yra ___?",
            translation_en: "I need help. Where is the police?",
            options: [
              { id: "a", text: "vaistinė",  isCorrect: false },
              { id: "b", text: "kavinė",    isCorrect: false },
              { id: "c", text: "policija",  isCorrect: true  },
            ],
            explanation: "Man reikia pagalbos means I need help — in a serious situation, that's the police (policija).",
          },
          {
            id: "s5m2c_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: Where is the bus station?",
            targetText: "Kur yra autobusų stotis",
            audioText: "Kur yra autobusų stotis",
          },
          {
            id: "s5m2c_b5",
            type: "conversation_turn_fill",
            scene_label: "In the street",
            lines: [
              { speaker: "You",   text: "Atsiprašau, kur yra parduotuvė?", audioText: "Atsiprašau, kur yra parduotuvė", hasGap: false },
              { speaker: "Local", text: "___, tiesiai.",                    hasGap: true },
            ],
            options: [
              { id: "a", text: "Toli",   isCorrect: false },
              { id: "b", text: "Ten",    isCorrect: true  },
              { id: "c", text: "Kairėn", isCorrect: false },
            ],
            explanation: "Ten, tiesiai — there, straight ahead. A short pointing reply combined with one direction cue.",
            translation_en: "Excuse me, where is the shop? — There, straight ahead.",
          },
          {
  id: "s5m2c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You need the pharmacy after arriving at the hotel. A full place-finding exchange.",
  sceneIntro: "You need the pharmacy after arriving at the hotel. A full place-finding exchange.",
  location: "hotel reception",
  userRole: "guest",
  register: "polite_service",
  goal: "You need the pharmacy after arriving at the hotel. A full place-finding exchange.",
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
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Laba diena! Ar galiu jums padėti?",
      supportText: "Good day! Can I help you?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Viso gero.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip! Kur yra vaistinė?",
          textEn: "Yes! Where is the pharmacy?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Nesuprantu.",
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
      speakerText: "Vaistinė yra ten. Pasukite dešinėn.",
      supportText: "The pharmacy is there. Turn right.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Suprantu. Ar tai toli?",
          textEn: "I understand. Is it far?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Kur yra ligoninė?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Ne, tai netoli. Trys minutės.",
      supportText: "No, it's near. Three minutes.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
          text: "Puiku! Ačiū labai. Viso gero.",
          textEn: "Great! Thank you very much. Goodbye.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Per brangu.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    }
  ],
},
          {
            id: "s5m2c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "autobusų stotis",     en: "bus station",      audioText: "autobusų stotis" },
              { id: "m2",  lt: "geležinkelio stotis", en: "train station",    audioText: "geležinkelio stotis" },
              { id: "m3",  lt: "stotelė",             en: "bus stop",         audioText: "stotelė" },
              { id: "m4",  lt: "oro uostas",          en: "airport",          audioText: "oro uostas" },
              { id: "m5",  lt: "tualetas",            en: "toilet",           audioText: "tualetas" },
              { id: "m6",  lt: "vaistinė",            en: "pharmacy",         audioText: "vaistinė" },
              { id: "m7",  lt: "ligoninė",            en: "hospital",         audioText: "ligoninė" },
              { id: "m8",  lt: "policija",            en: "police",           audioText: "policija" },
              { id: "m9",  lt: "parduotuvė",          en: "shop",             audioText: "parduotuvė" },
              { id: "m10", lt: "kavinė",              en: "café",             audioText: "kavinė" },
              { id: "m11", lt: "viešbutis",           en: "hotel",            audioText: "viešbutis" },
              { id: "m12", lt: "bankas",              en: "bank",             audioText: "bankas" },
              { id: "m13", lt: "Kur yra tualetas?",   en: "Where is the toilet?",   audioText: "Kur yra tualetas" },
              { id: "m14", lt: "Kur yra vaistinė?",   en: "Where is the pharmacy?", audioText: "Kur yra vaistinė" },
              { id: "m15", lt: "Kur yra viešbutis?",  en: "Where is the hotel?",    audioText: "Kur yra viešbutis" },
              { id: "m16", lt: "Kur yra kavinė?",     en: "Where is the café?",     audioText: "Kur yra kavinė" },
              { id: "m17", lt: "Kur yra bankas?",     en: "Where is the bank?",     audioText: "Kur yra bankas" },
              { id: "m18", lt: "Tai čia pat.",        en: "It's right here.",        audioText: "Tai čia pat" },
              { id: "m19", lt: "Ar ieškote…?",        en: "Are you looking for…?",  audioText: "Ar ieškote" },
              { id: "m20", lt: "paskui",              en: "then",                    audioText: "paskui" },
            ],
          },
        ],
      },
    ],
  };
}

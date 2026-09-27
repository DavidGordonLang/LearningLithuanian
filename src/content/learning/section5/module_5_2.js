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
              { id: "i2", lt: "traukinių stotis", en: "train station",     audioText: "traukinių stotis",saveable: true, core: true },
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
            prompt: { text: "traukinių stotis", audioText: "traukinių stotis" },
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
  sceneIntro: "You've just arrived and need to find the train station. A ten-minute walk suits you.",
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
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Taip! Kur yra autobusų stotis?",
          result: "wrong",
          feedback: "That asks for the bus station, but you need the train station.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip! Kur yra traukinių stotis?",
          textEn: "Yes! Where is the train station?",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Kur yra traukinių stotis?","result":"acceptable","feedback":"The shorter question is natural because the context is already clear.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Traukinių stotis yra ten. Eikite tiesiai.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Ar autobusų stotis toli?",
          result: "wrong",
          feedback: "You asked for the train station; this changes the destination to the bus station.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ar toli?",
          textEn: "Is it far?",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Ačiū. Ar toli?","result":"acceptable","feedback":"A quick thank-you before the distance question is natural.","progresses":true},
      ],
    },
    {
      id: "step_3",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Ne, tai netoli. Dešimt minučių.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Per toli.",
          result: "wrong",
          feedback: "Ten minutes is a walk you are comfortable with; Per toli contradicts your stated stance.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ačiū labai! Viso gero.",
          textEn: "Thank you very much! Goodbye.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is also natural.","progresses":true},
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
  location: "street",
  userRole: "traveller",
  register: "polite_service",
  goal: "You need to find the pharmacy quickly.",
  focus: ["directions"],
  participants: [
    {
      "id": "pharmacist",
      "label": "Local",
      "name": "Rasa",
      "role": "passer-by",
      "gender": "female",
      "relationshipToUser": "stranger",
      "register": "polite_service"
    },
  ],
  objects: [
    {
      "id": "pharmacy",
      "lt": "vaistinė",
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
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Laba diena! Atsiprašau, kur yra ligoninė?",
          result: "wrong",
          feedback: "You need the pharmacy, vaistinė, rather than the hospital, ligoninė.",
          progresses: false,
        },
        {
          id: "b",
          text: "Laba diena! Atsiprašau, kur yra vaistinė?",
          textEn: "Good day! Excuse me, where is the pharmacy?",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Atsiprašau, kur yra vaistinė?","result":"acceptable","feedback":"Natural and polite without repeating the greeting.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "pharmacist",
      speakerLabel: "Pharmacist",
      speakerText: "Vaistinė? Ten, dešinėn.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Ačiū! Ar ligoninė toli?",
          result: "wrong",
          feedback: "The local pointed out the pharmacy, so ask about that distance rather than the hospital.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ačiū! Ar toli?",
          textEn: "Thank you! Is it far?",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Ar toli?","result":"acceptable","feedback":"The shorter distance question is natural once the destination is clear.","progresses":true},
      ],
    },
    {
      id: "step_3",
      speakerId: "pharmacist",
      speakerLabel: "Pharmacist",
      speakerText: "Ne, tai netoli.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "The pharmacy is nearby and the local has answered; an apology does not close this exchange.",
          progresses: false,
        },
        {
          id: "b",
          text: "Puiku! Ačiū labai.",
          textEn: "Great! Thank you very much.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is also natural.","progresses":true},
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
        title: "Everyday Places in Context",
        purpose: "Retrieve and apply familiar everyday place vocabulary in location tasks.",
        supportLevel: "high",
        newLanguageLoad: "none",
        blocks: [
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
  sceneIntro: "You want to find a café near your hotel and are happy to walk a short distance.",
  location: "hotel reception",
  userRole: "guest",
  register: "polite_service",
  goal: "You want to find a café near your hotel.",
  focus: ["directions"],
  participants: [
    {
      "id": "receptionist",
      "label": "Receptionist",
      "name": "Austėja",
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
      "lt": "viešbutis",
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
      speakerText: "Laba diena! Kuo galėčiau padėti?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "Laba diena! Kur yra kavinė?",
          textEn: "Good day! Where is a café?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Laba diena! Kur yra parduotuvė?",
          result: "wrong",
          feedback: "You are looking for a café, not the shop.",
          progresses: false,
        }
      ,
        {"id":"z","text":"Atsiprašau, kur yra kavinė?","result":"acceptable","feedback":"A natural polite alternative using language you already know.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Kavinė yra ten.",
      sceneDirection: "Austėja points down the street towards the café, but she has not said how far away it is.",
      learnerPrompt: "You know where to go, but not the distance. Ask if it is far.",
      options: [
        {
          id: "a",
          text: "Ačiū! Ar toli?",
          textEn: "Thank you! Is it far?",
          result: "best",
          progresses: true,
        },
        {
          id: "b",
          text: "Ačiū!",
          textEn: "Thank you!",
          result: "awkward",
          feedback: "Natural, but the task is to check the distance as well.",
          betterAnswer: "Ačiū! Ar toli?",
          progresses: true,
        },
        {
          id: "c",
          text: "Kur yra parduotuvė?",
          result: "wrong",
          feedback: "You are looking for the café, not a shop.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Ne, tai netoli. Eikite tiesiai.",
      sceneDirection: "Austėja confirms that the café is nearby and gives one final direction.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
                {
          id: "b",
          text: "Puiku! Ačiū labai.",
          textEn: "Great! Thank you very much.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Per toli.",
          result: "wrong",
          feedback: "You are happy to walk the short distance to the nearby café; Per toli does not match that.",
          progresses: false,
        }
      ,
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is also natural.","progresses":true},
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
            type: "build_phrase",
            title: "Build the question",
            prompt: { text: "You're on the street. Politely ask: Where is the hotel?" },
            tokens: [
              { id: "t1", text: "Atsiprašau,", correctIndex: 0 },
              { id: "t2", text: "kur", correctIndex: 1 },
              { id: "t3", text: "yra", correctIndex: 2 },
              { id: "t4", text: "viešbutis?", correctIndex: 3 },
              { id: "t5", text: "bankas?", isDistractor: true, repairHint: "Bankas means bank. The prompt asks for the hotel." },
              { id: "t6", text: "toli?", isDistractor: true, repairHint: "Ar toli? asks whether something is far. Here you still need to ask where the hotel is." },
            ],
            answerText: "Atsiprašau, kur yra viešbutis?",
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
  description: "At the service desk, you need cash from the bank before heading to the bus station.",
  sceneIntro: "You told Rasa at the service desk that you need cash from the bank, then the bus station. Ask for the bank first.",
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
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "Taip! Kur yra bankas?",
          textEn: "Yes! Where is the bank?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Taip! Kur yra autobusų stotis?",
          result: "wrong",
          feedback: "You need cash from the bank first; ask for the bus station after finding it.",
          progresses: false,
        }
      ,
        {"id":"z","text":"Kur yra bankas?","result":"acceptable","feedback":"The shorter question is natural because the context is already clear.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Bankas yra ten, kairėn.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "You still need the bus station. Ask for it if you want to continue, or thank the local for the bank direction.",
      options: [
        {
          id: "a",
          text: "Ačiū!",
          result: "awkward",
          feedback: "Thanks is natural for the bank direction, but you still need to find the bus station. Ask for it while Rasa is here.",
          betterAnswer: "Ačiū! Ir kur yra autobusų stotis?",
          progresses: true,
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
          text: "Ačiū! Ir kur yra traukinių stotis?",
          result: "wrong",
          feedback: "Your next stop is the bus station, not the train station.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Autobusų stotis yra tiesiai, paskui dešinėn. Netoli.",
      sceneDirection: "Rasa knows the bus station is your next stop and gives its route, whether you asked for it or only thanked her for the bank direction.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "Rasa has given both directions; an apology does not acknowledge the help or end the conversation.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ačiū labai! Viso gero.",
          textEn: "Thank you very much! Goodbye.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is also natural.","progresses":true},
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
        notes: {
          pattern: "You already know vaistai — medicine / medication. After reikia, you will hear vaistų: Man reikia vaistų — I need medicine. For now, learn that as a useful chunk rather than a grammar table.",
          usage: [
            "vaistai — medicine / medication",
            "vaistai → vaistų — the form used after reikia",
            "Man reikia vaistų. — I need medicine.",
            "Kur yra vaistinė? — Where is the pharmacy?",
          ],
        },
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
            type: "learn",
            title: "From medicine to pharmacy",
            items: [
              { id: "v2", lt: "vaistų", en: "medicine / medication — used after reikia", audioText: "vaistų", saveable: false, core: true },
              { id: "v3", lt: "Man reikia vaistų.", en: "I need medicine / medication.", audioText: "Man reikia vaistų", saveable: true, core: true },
              { id: "v4", lt: "Kur yra vaistinė?", en: "Where is the pharmacy?", audioText: "Kur yra vaistinė", saveable: true, core: true },
            ],
          },
          {
            id: "s5m2l5_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone says: Tualetas yra čia. What do they mean?", audioText: "" },
            noOptionAudio: true,
            optionsLanguage: "en",
            answerAudioText: "Tualetas yra čia.",
            options: [
              { id: "a", text: "The toilet is far from here.", isCorrect: false },
              { id: "b", text: "The toilet is here.",    isCorrect: true  },
              { id: "c", text: "The hotel is here.",     isCorrect: false },
            ],
            feedback: { correct: "Čia means here. Tualetas yra čia — the toilet is here." },
          },
          {
            id: "s5m2l5_b4",
            type: "best_response",
            title: "Use the new chunk",
            prompt: { text: "You tell a local: Atsiprašau, man reikia vaistų. What is the most useful question to ask next?" },
            optionsLanguage: "lt",
            options: [
              { id: "a", text: "Kur yra vaistinė?", isCorrect: true },
              { id: "b", text: "Kur yra ligoninė?", isCorrect: false },
              { id: "c", text: "Kur yra kavinė?", isCorrect: false },
            ],
            feedback: {
              correct: "Kur yra vaistinė? — if you need medicine, the useful place to ask for is the pharmacy.",
            },
          },
          {
  id: "s5m2l5_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You need your hotel and ask a passer-by where it is.",
  sceneIntro: "You are checking your hotel address on your phone. Ask a passer-by where it is, then listen to the answer.",
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
      speakerText: "Laba diena!",
      sceneDirection: "The passer-by notices you checking a hotel address on your phone.",
      learnerPrompt: "Ask where the hotel is.",
      options: [
        {
          id: "a",
          text: "Laba diena! Kur yra kavinė?",
          result: "wrong",
          feedback: "The address on your phone is for the hotel, not a café.",
          progresses: false,
        },
        {
          id: "b",
          text: "Laba diena! Kur yra viešbutis?",
          textEn: "Yes! Where is the hotel?",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Atsiprašau, kur yra viešbutis?","result":"acceptable","feedback":"A natural polite alternative using language you already know.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Viešbutis yra ten. Eikite tiesiai.",
      sceneDirection: "The passer-by gives the hotel's location and one direction.",
      learnerPrompt: "What location and direction did you hear?",
      interactionMode: "comprehension",
      options: [
        {
          id: "a",
          text: "The hotel is here; go straight.",
          result: "wrong",
          feedback: "The passer-by said ten — there — not čia — here.",
          progresses: false,
        },
        {
          id: "b",
          text: "The hotel is over there; go straight.",
          learnerText: "Suprantu. Ačiū!",
          textEn: "I understand. Thank you!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "The hotel is over there; turn right.",
          result: "wrong",
          feedback: "Eikite tiesiai means go straight, not turn right.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Prašom. Ar jums dar reikia pagalbos?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Taip, labai.",
          result: "wrong",
          feedback: "Taip says you need more help, but this hotel question has been answered and you have no further request.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ne, ačiū. Viso gero!",
          textEn: "No, thank you. Goodbye!",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is also natural.","progresses":true},
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
        isCheckpoint: true,
        blocks: [
          {
            id: "s5m2c_b1",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "traukinių stotis", audioText: "traukinių stotis" },
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
            prompt: "Your wallet has been stolen and you need the police.",
            sentence: "Kur yra ___?",
            translation_en: "Where are the police?",
            options: [
              { id: "a", text: "vaistinė", isCorrect: false },
              { id: "b", text: "kavinė", isCorrect: false },
              { id: "c", text: "policija", isCorrect: true },
            ],
            explanation: "The situation explicitly needs the police, so policija is the place/service you are looking for.",
          },
          {
            id: "s5m2c_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Politely ask where the train station is, then ask if it's far.",
            targetText: "Atsiprašau, kur yra traukinių stotis? Ar toli?",
            audioText: "Atsiprašau, kur yra traukinių stotis? Ar toli?",
          },
          {
            id: "s5m2c_b5",
            type: "build_phrase",
            title: "Build the direction",
            prompt: { text: "A local points straight ahead. Build: The shop is there. Go straight ahead." },
            tokens: [
              { id: "t1", text: "Parduotuvė", correctIndex: 0 },
              { id: "t2", text: "yra", correctIndex: 1 },
              { id: "t3", text: "ten.", correctIndex: 2 },
              { id: "t4", text: "Eikite", correctIndex: 3 },
              { id: "t5", text: "tiesiai.", correctIndex: 4 },
              { id: "t6", text: "čia.", isDistractor: true, repairHint: "Čia means here. The local is pointing away from where you are standing." },
              { id: "t7", text: "kairėn.", isDistractor: true, repairHint: "Kairėn means to the left. The local points straight ahead." },
            ],
            answerText: "Parduotuvė yra ten. Eikite tiesiai.",
          },
          {
  id: "s5m2c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You need the pharmacy after arriving at the hotel. A full place-finding exchange.",
  sceneIntro: "At hotel reception, you need the pharmacy and are comfortable with a short walk.",
  location: "hotel reception",
  userRole: "guest",
  register: "polite_service",
  goal: "You need the pharmacy after arriving at the hotel. A full place-finding exchange.",
  focus: ["directions"],
  participants: [
    {
      "id": "receptionist",
      "label": "Receptionist",
      "name": "Austėja",
      "role": "receptionist",
      "gender": "female",
      "relationshipToUser": "stranger",
      "register": "polite_service"
    },
  ],
  objects: [
    {
      "id": "hotel",
      "lt": "viešbutis",
      "en": "hotel",
      "gender": "masculine",
      "number": "singular"
    },
    {
      "id": "pharmacy",
      "lt": "vaistinė",
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
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Taip! Kur yra ligoninė?",
          result: "wrong",
          feedback: "You need the pharmacy, not the hospital.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip! Kur yra vaistinė?",
          textEn: "Yes! Where is the pharmacy?",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Kur yra vaistinė?","result":"acceptable","feedback":"The shorter question is natural because the context is already clear.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Vaistinė yra ten. Pasukite dešinėn.",
      sceneDirection: "Austėja gives you the pharmacy's location and one turn from the hotel.",
      learnerPrompt: "What did Austėja say about the pharmacy?",
      interactionMode: "comprehension",
      help: {
        levels: [
          { sceneDirection: "Austėja gestures toward the street and then to the right.", speakerText: "Ten. Dešinėn." },
          { sceneDirection: "She traces the short outdoor route with her finger and points right." },
          { speakerText: "There. Turn right.", spokenLanguage: "en", audio: false },
        ],
      },
      options: [
        {
          id: "a",
          text: "The pharmacy is over there; turn left.",
          result: "wrong",
          feedback: "Austėja said dešinėn — right — not left.",
          progresses: false,
        },
        {
          id: "b",
          text: "The pharmacy is over there; turn right.",
          learnerText: "Suprantu. Ar toli?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "The hospital is over there; turn right.",
          result: "wrong",
          feedback: "Austėja named the pharmacy, not the hospital.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Ne, tai netoli. Trys minutės.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
                {
          id: "b",
          text: "Puiku! Ačiū labai. Viso gero.",
          textEn: "Great! Thank you very much. Goodbye.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Per toli.",
          result: "wrong",
          feedback: "The pharmacy is a three-minute walk, which you are comfortable with.",
          progresses: false,
        }
      ,
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is also natural.","progresses":true},
      ],
    }
  ],
},
          {
            id: "s5m2c_b7",
            type: "word_match",
            pairPages: [
              { id: "group_1", label: "Stations and transport", pairIds: ["m1", "m2", "m3", "m4"] },
              { id: "group_2", label: "Essential help", pairIds: ["m5", "m6", "m7", "m8"] },
              { id: "group_3", label: "Familiar places", pairIds: ["m9", "m10", "m11", "m12"] },
              { id: "group_4", label: "Asking where", pairIds: ["m13", "m14", "m15", "m16", "m17"] },
              { id: "group_5", label: "Earlier review", pairIds: ["m18", "m19", "m20"] },
            ],
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "autobusų stotis",     en: "bus station",      audioText: "autobusų stotis" },
              { id: "m2",  lt: "traukinių stotis", en: "train station",    audioText: "traukinių stotis" },
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
              { id: "m18", lt: "Tualetas yra čia.",   en: "The toilet is here.",     audioText: "Tualetas yra čia" },
              { id: "m19", lt: "Man reikia vaistų.",   en: "I need medicine.",        audioText: "Man reikia vaistų" },
              { id: "m20", lt: "paskui",              en: "then",                    audioText: "paskui" },
            ],
          },
        ],
      },
    ],
  };
}

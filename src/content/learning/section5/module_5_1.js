// src/content/learning/section5/module_5_1.js
// Module 5.1 — Where Is…?

export default function createModule_5_1(profile = {}) {
  const { userNameSafe = "Davidas" } = profile;

  return {
    id: "module_5_1",
    code: "5.1",
    title: "Where Is…?",
    status: "active",
    lessonCount: 5,
    lessons: [

      // ── Lesson 1 — Where Is…? ─────────────────────────────────────────────
      {
        id: "section_5_module_1_lesson_1",
        code: "5.1.1",
        title: "Where Is…?",
        purpose: "Retrieve and apply the familiar Kur yra…? frame in practical location tasks.",
        supportLevel: "high",
        newLanguageLoad: "none",
        notes: {
          pattern: "Kur yra…? is one of the most useful frames in the whole app. It works with any place word. You already know several — stotis, tualetas, viešbutis, vaistinė all slot straight in.",
          usage: [
            "Kur yra stotis? — Where is the station?",
            "Kur yra tualetas? — Where is the toilet?",
            "Kur yra viešbutis? — Where is the hotel?",
            "Kur yra bankas? — Where is the bank?",
          ],
        },
        blocks: [
          {
            id: "s5m1l1_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kur yra stotis?", audioText: "Kur yra stotis" },
            options: [
              { id: "a", text: "Where is the hotel?",    isCorrect: false },
              { id: "b", text: "Where is the station?",  isCorrect: true  },
              { id: "c", text: "Where is the toilet?",   isCorrect: false },
            ],
          },
          {
            id: "s5m1l1_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kur yra bankas?", audioText: "Kur yra bankas" },
            options: [
              { id: "a", text: "Where is the hotel?",    isCorrect: false },
              { id: "b", text: "Where is the bank?",     isCorrect: true  },
              { id: "c", text: "Where is the toilet?",   isCorrect: false },
            ],
          },
          {
            id: "s5m1l1_b4",
            type: "context_gap_select",
            prompt: "Choose the correct word",
            sentence: "Atsiprašau, ___ yra tualetas?",
            translation_en: "Excuse me, where is the toilet?",
            options: [
              { id: "a", text: "Kas",  isCorrect: false },
              { id: "b", text: "Kur",  isCorrect: true  },
              { id: "c", text: "Kada", isCorrect: false },
            ],
            explanation: "Kur means where. Kas means what or who, Kada means when.",
          },
          {
            id: "s5m1l1_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: Where is the hotel?",
            targetText: "Kur yra viešbutis",
            audioText: "Kur yra viešbutis",
          },
          {
  id: "s5m1l1_b6_v2",
  type: "scenario_v2",
  title: "Finding the bank",
  description: "On the street, you ask a passer-by where the bank is.",
  sceneIntro: "On the street, you ask a passer-by where the bank is.",
  location: "street",
  userRole: "traveller",
  register: "polite_neutral",
  goal: "Use Kur yra…? for a place you need.",
  focus: ["Kur yra…?", "bankas"],
  participants: [
    { id: "local", label: "Local", name: "Rasa", role: "passer-by", gender: "female", relationshipToUser: "stranger", register: "polite_neutral" },
  ],
  objects: [
    { id: "bank", lt: "bankas", en: "bank", gender: "masculine", number: "singular" },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Laba diena!",
      sceneDirection: "A passer-by stops near you on the street.",
      learnerPrompt: "Ask where the bank is.",
      options: [
        { id: "a", text: "Laba diena! Atsiprašau, kur yra bankas?", result: "best", progresses: true },
        { id: "b", text: "Viso gero.", result: "wrong", feedback: "You still need to find the bank.", progresses: false },
      
        {"id":"z","text":"Atsiprašau, kur yra bankas?","result":"acceptable","feedback":"Natural and polite without repeating the greeting.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Bankas yra ten.",
      sceneDirection: "She points across the street at the bank.",
      learnerPrompt: "Acknowledge the answer.",
      options: [
        { id: "a", text: "Ačiū labai!", result: "best", progresses: true },
        { id: "b", text: "Kur yra viešbutis?", result: "wrong", feedback: "You asked for the bank and she has just shown it to you.", progresses: false },
      
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is also natural.","progresses":true},
      ],
      finalSystemLine: { speakerId: "local", speakerLabel: "Local", speakerText: "Prašom. Viso gero!", sceneDirection: "She smiles and continues on her way." },
    },
  ],
},
        ],
      },

      // ── Lesson 2 — Here / There ───────────────────────────────────────────
      {
        id: "section_5_module_1_lesson_2",
        code: "5.1.2",
        title: "Here / There",
        purpose: "Make čia / ten usable in real location exchanges, not just recognisable as isolated words.",
        supportLevel: "high",
        newLanguageLoad: "low",
        notes: {
          pattern: "čia means here; ten means there. In real directions you will often hear them inside a full location answer: Viešbutis yra ten. Kavinė yra čia.",
          usage: [
            "Viešbutis yra ten. — The hotel is there.",
            "Kavinė yra čia. — The café is here.",
            "Tualetas yra ten. — The toilet is there.",
          ],
        },
        blocks: [
          {
            id: "s5m1l2_b1",
            type: "learn",
            title: "Short location replies",
            items: [
              { id: "i3", lt: "Tai čia.", en: "It's here.", audioText: "Tai čia", saveable: true, core: true },
              { id: "i4", lt: "Tai ten.", en: "It's there.", audioText: "Tai ten", saveable: true, core: true },
              { id: "i5", lt: "Viešbutis yra ten.", en: "The hotel is there.", audioText: "Viešbutis yra ten", saveable: false, core: false },
              { id: "i6", lt: "Kavinė yra čia.", en: "The café is here.", audioText: "Kavinė yra čia", saveable: false, core: false },
            ],
          },
          {
            id: "s5m1l2_b2",
            type: "listen_mcq",
            title: "Listen and locate it",
            prompt: { text: "Kavinė yra čia.", audioText: "Kavinė yra čia" },
            options: [
              { id: "a", text: "The café is right here.", isCorrect: true },
              { id: "b", text: "The café is over there.", isCorrect: false },
              { id: "c", text: "The hotel is right here.", isCorrect: false },
            ],
          },
          {
            id: "s5m1l2_b3",
            type: "best_response",
            title: "Use the situation",
            prompt: {
              text: "You ask: Kur yra viešbutis? The local points across the street at the hotel. Which reply fits?",
              audioText: "",
            },
            options: [
              { id: "a", text: "Viešbutis yra čia.", isCorrect: false },
              { id: "b", text: "Viešbutis yra ten.", isCorrect: true },
              { id: "c", text: "Kavinė yra ten.", isCorrect: false },
            ],
            feedback: {
              correct: "Viešbutis yra ten. Ten matches something the speaker is pointing to away from where you are.",
            },
          },
          {
            id: "s5m1l2_b4",
            type: "best_response",
            title: "Listen for both the place and position",
            prompt: {
              text: "You ask: Kur yra tualetas? The local points to a door immediately beside you. What would be a clear answer?",
              audioText: "",
            },
            options: [
              { id: "a", text: "Tualetas yra ten.", isCorrect: false },
              { id: "b", text: "Tualetas yra čia.", isCorrect: true },
              { id: "c", text: "Viešbutis yra čia.", isCorrect: false },
            ],
            feedback: {
              correct: "Tualetas yra čia. You need both the right place noun and the right location word.",
            },
          },
          {
            id: "s5m1l2_b5",
            type: "best_response",
            title: "Do not answer by elimination",
            prompt: {
              text: "A local says: Viešbutis yra ten. Which situation matches what you heard?",
              audioText: "Viešbutis yra ten",
            },
            options: [
              { id: "a", text: "The hotel is across the street.", isCorrect: true },
              { id: "b", text: "The hotel is beside you.", isCorrect: false },
              { id: "c", text: "The café is across the street.", isCorrect: false },
            ],
            feedback: {
              correct: "You had to identify both viešbutis (hotel) and ten (there), rather than just spotting a single familiar word.",
            },
          },
          {
            id: "s5m1l2_b6_v2",
            type: "scenario_v2",
            title: "Here and there",
            description: "You and Mantas are in a small square. The café is beside you and the hotel is across the street. Use čia and ten yourself, then ask a passer-by where the toilet is.",
            sceneIntro: "You and Mantas are in a small square. The café is beside you and the hotel is across the street. Use čia and ten yourself, then ask a passer-by where the toilet is.",
            location: "street",
            userRole: "traveller",
            register: "mixed",
            goal: "Produce and recognise čia / ten in full location answers while reusing familiar Kur yra…? questions.",
            focus: ["čia", "ten", "Kur yra…?", "place nouns"],
            participants: [
              { id: "friend", label: "Friend", name: "Mantas", role: "friend", gender: "male", relationshipToUser: "friend", register: "informal" },
              { id: "local", label: "Local", name: "Rasa", role: "passer-by", gender: "female", relationshipToUser: "stranger", register: "polite_neutral" },
            ],
            objects: [
              { id: "hotel", lt: "viešbutis", en: "hotel", gender: "masculine", number: "singular" },
              { id: "cafe", lt: "kavinė", en: "café", gender: "feminine", number: "singular" },
              { id: "toilet", lt: "tualetas", en: "toilet", gender: "masculine", number: "singular" },
            ],
            steps: [
              {
                id: "step_1",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Kur yra viešbutis?",
                sceneDirection: "The hotel is across the street from you.",
                learnerPrompt: "Tell Mantas where the hotel is.",
                options: [
                  { id: "a", text: "Viešbutis yra ten.", result: "best", progresses: true },
                  { id: "b", text: "Viešbutis yra čia.", result: "wrong", feedback: "Čia means here, but the hotel is across the street.", progresses: false },
                  { id: "c", text: "Kavinė yra ten.", result: "wrong", feedback: "That changes the place. Mantas asked about the hotel.", progresses: false },
                ],
              },
              {
                id: "step_2",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Kur yra kavinė?",
                sceneDirection: "The café is immediately beside you.",
                learnerPrompt: "Tell Mantas where the café is.",
                options: [
                  { id: "a", text: "Kavinė yra čia.", result: "best", progresses: true },
                  { id: "b", text: "Kavinė yra ten.", result: "wrong", feedback: "Ten means there, but the café is beside you.", progresses: false },
                  { id: "c", text: "Viešbutis yra čia.", result: "wrong", feedback: "That answers about the hotel, not the café.", progresses: false },
                ],
              },
              {
                id: "step_3",
                speakerId: "local",
                speakerLabel: "Local",
                speakerText: "Laba diena!",
                sceneDirection: "Rasa is passing by. You still need to find the toilet.",
                learnerPrompt: "Politely ask where the toilet is.",
                options: [
                  { id: "a", text: "Laba diena! Atsiprašau, kur yra tualetas?", result: "best", progresses: true },
                  { id: "b", text: "Atsiprašau, kur yra tualetas?", result: "acceptable", feedback: "Natural and polite without repeating the greeting.", progresses: true },
                  { id: "c", text: "Kur yra viešbutis?", result: "wrong", feedback: "You already know where the hotel is. You need the toilet.", progresses: false },
                ],
              },
              {
                id: "step_4",
                speakerId: "local",
                speakerLabel: "Local",
                speakerText: "Tualetas yra ten.",
                sceneDirection: "Rasa points further along the street.",
                learnerPrompt: "Show that you understood and thank her.",
                options: [
                  { id: "a", text: "Ten. Ačiū labai!", result: "best", progresses: true },
                  { id: "b", text: "Ačiū!", result: "acceptable", feedback: "Natural. Repeating ten is useful here because this lesson is checking that you understood the location.", progresses: true },
                  { id: "c", text: "Čia. Ačiū!", result: "wrong", feedback: "Rasa said ten — there — not čia — here.", progresses: false },
                ],
                finalSystemLine: {
                  speakerId: "local",
                  speakerLabel: "Local",
                  speakerText: "Prašom. Viso gero!",
                  sceneDirection: "Rasa smiles and continues on her way.",
                },
              },
            ],
          },
        ],
      },

      // ── Lesson 3 — Near / Far ─────────────────────────────────────────────
      {
        id: "section_5_module_1_lesson_3",
        code: "5.1.3",
        title: "Near / Far",
        purpose: "Add quick distance judgment language.",
        supportLevel: "high",
        newLanguageLoad: "low",
        blocks: [
          {
            id: "s5m1l3_b1",
            type: "learn",
            title: "Near and far",
            items: [
              { id: "i1", lt: "netoli",        en: "near / not far",  audioText: "netoli",        saveable: true, core: true },
              { id: "i2", lt: "toli",          en: "far",             audioText: "toli",          saveable: true, core: true },
              { id: "i3", lt: "Ar toli?",  en: "Is it far?",      audioText: "Ar tai toli",   saveable: true, core: true },
              { id: "i4", lt: "Ar netoli?",en: "Is it near?",     audioText: "Ar tai netoli", saveable: true, core: true },
              { id: "i5", lt: "Tai netoli.",   en: "It's near.",      audioText: "Tai netoli",    saveable: true, core: true },
              { id: "i6", lt: "Tai toli.",     en: "It's far.",       audioText: "Tai toli",      saveable: true, core: true },
            ],
          },
          {
            id: "s5m1l3_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Tai netoli.", audioText: "Tai netoli" },
            options: [
              { id: "a", text: "It's far.",   isCorrect: false },
              { id: "b", text: "It's there.", isCorrect: false },
              { id: "c", text: "It's near.",  isCorrect: true  },
            ],
          },
          {
            id: "s5m1l3_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar toli?", audioText: "Ar tai toli" },
            options: [
              { id: "a", text: "It's far.",  isCorrect: false },
              { id: "b", text: "Is it far?", isCorrect: true  },
              { id: "c", text: "Is it near?",isCorrect: false },
            ],
          },
          {
            id: "s5m1l3_b4",
            type: "context_gap_select",
            prompt: "Choose the correct word",
            sentence: "Viešbutis yra ___, tik penkios minutės.",
            translation_en: "The hotel is near, only five minutes.",
            options: [
              { id: "a", text: "toli",   isCorrect: false },
              { id: "b", text: "čia",    isCorrect: false },
              { id: "c", text: "netoli", isCorrect: true  },
            ],
            explanation: "Netoli means near or not far. Toli is the opposite — far. The context clue here is 'only five minutes'.",
          },
          {
            id: "s5m1l3_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: Is it far?",
            targetText: "Ar tai toli",
            audioText: "Ar tai toli",
          },
          {
  id: "s5m1l3_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're looking for the bus stop and need to know if it's far.",
  sceneIntro: "You're looking for the bus stop and need to know if it's far.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "You're looking for the bus stop and need to know if it's far.",
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
      speakerText: "Laba diena! Ar galiu padėti?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
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
          text: "Taip! Kur yra autobusų stotelė?",
          textEn: "Yes! Where is the bus stop?",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Kur yra autobusų stotelė?","result":"acceptable","feedback":"The shorter question is natural because the context is already clear.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Autobusų stotelė yra ten.",
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
          text: "Ar toli?",
          textEn: "Is it far?",
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
      id: "step_3",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Ne, tai netoli. Penkios minutės.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
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
          text: "Per brangu.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ,
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is also natural.","progresses":true},
      ],
    },
    {
      id: "step_4",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Prašom. Viso gero!",
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
          text: "Viso gero!",
          textEn: "Goodbye!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Laba diena.",
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

      // ── Lesson 4 — Left / Right / Straight Ahead ─────────────────────────
      {
        id: "section_5_module_1_lesson_4",
        code: "5.1.4",
        title: "Left / Right / Straight Ahead",
        purpose: "Teach the minimum viable direction set.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Start with the base direction words: kairė means left / the left side, and dešinė means right / the right side. When you are talking about movement, they become kairėn — to the left — and dešinėn — to the right. That is why turn left is Pasukite kairėn and turn right is Pasukite dešinėn. You do not need to memorise the grammar rule yet; recognise the base word inside the direction.",
          usage: [
            "kairė → kairėn — left → to the left",
            "dešinė → dešinėn — right → to the right",
            "tiesiai — straight ahead",
            "Pasukite kairėn — turn left",
            "Pasukite dešinėn — turn right",
            "Eikite tiesiai — go straight ahead",
            "paskui — then",
          ],
        },
        blocks: [
          {
            id: "s5m1l4_b1",
            type: "learn",
            title: "Directions",
            items: [
              { id: "i1", lt: "kairė",   en: "left / the left side",   audioText: "kairė",   saveable: true, core: true },
              { id: "i2", lt: "dešinė",  en: "right / the right side", audioText: "dešinė",  saveable: true, core: true },
              { id: "i3", lt: "tiesiai", en: "straight ahead",         audioText: "tiesiai", saveable: true, core: true },
              { id: "i4", lt: "paskui",  en: "then",                   audioText: "paskui",  saveable: true, core: false },
            ],
          },
          {
            id: "s5m1l4_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Pasukite kairėn.", audioText: "Pasukite kairėn" },
            options: [
              { id: "a", text: "Go straight ahead.", isCorrect: false },
              { id: "b", text: "Turn right.",        isCorrect: false },
              { id: "c", text: "Turn left.",         isCorrect: true  },
            ],
          },
          {
            id: "s5m1l4_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Eikite tiesiai.", audioText: "Eikite tiesiai" },
            options: [
              { id: "a", text: "Turn left.",         isCorrect: false },
              { id: "b", text: "Go straight ahead.", isCorrect: true  },
              { id: "c", text: "Turn right.",        isCorrect: false },
            ],
          },
          {
            id: "s5m1l4_b4",
            type: "context_gap_select",
            prompt: "Complete the direction",
            sentence: "Pasukite ___.",
            translation_en: "Turn right.",
            options: [
              { id: "a", text: "tiesiai",  isCorrect: false },
              { id: "b", text: "kairėn",   isCorrect: false },
              { id: "c", text: "dešinėn",  isCorrect: true  },
            ],
            explanation: "Dešinė means right; in a movement direction it becomes dešinėn — to the right. Kairė becomes kairėn — to the left. Tiesiai is straight ahead.",
          },
          {
            id: "s5m1l4_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: Go straight ahead",
            targetText: "Eikite tiesiai",
            audioText: "Eikite tiesiai",
          },
          {
  id: "s5m1l4_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You ask a local for directions to the bank. Listen carefully.",
  sceneIntro: "You ask a local for directions to the bank. Listen carefully.",
  location: "street",
  userRole: "traveller",
  register: "polite_service",
  goal: "You ask for directions to the pharmacy. Listen carefully.",
  focus: ["directions"],
  participants: [
    {
      "id": "local",
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
      "id": "bank",
      "lt": "bankas",
      "en": "bank",
      "gender": "feminine",
      "number": "singular"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Laba diena! Ar galiu jums padėti?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "Laba diena! Kur yra bankas?",
          textEn: "Good day! Where is the bank?",
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
      ,
        {"id":"z","text":"Atsiprašau, kur yra bankas?","result":"acceptable","feedback":"A natural polite alternative using language you already know.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Eikite tiesiai, paskui pasukite kairėn.",
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
          text: "Suprantu. Tiesiai, paskui kairėn.",
          textEn: "I understand. Straight, then left.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Kiek tai kainuoja?","result":"wrong","feedback":"This does not answer what the speaker is asking here.","progresses":false},
      ],
    },
    {
      id: "step_3",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Taip. Tai netoli.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Ar toli?",
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
          text: "Atsiprašau.",
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

      // ── Lesson 5 — Basic Location Exchange ───────────────────────────────
      {
        id: "section_5_module_1_lesson_5",
        code: "5.1.5",
        title: "Basic Location Exchange",
        purpose: "Bring the core location tools together in one short exchange.",
        supportLevel: "medium",
        newLanguageLoad: "very_low",
        blocks: [
          {
            id: "s5m1l5_b1",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Eikite tiesiai, paskui dešinėn.", audioText: "Eikite tiesiai, paskui dešinėn" },
            options: [
              { id: "a", text: "Turn left, then go straight.",  isCorrect: false },
              { id: "b", text: "Go straight, then turn right.", isCorrect: true  },
              { id: "c", text: "Turn right, then go straight.", isCorrect: false },
            ],
          },
          {
            id: "s5m1l5_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Ar netoli?", audioText: "Ar tai netoli" },
            options: [
              { id: "a", text: "Is it far?",   isCorrect: false },
              { id: "b", text: "Is it here?",  isCorrect: false },
              { id: "c", text: "Is it near?",  isCorrect: true  },
            ],
          },
          {
            id: "s5m1l5_b3",
            type: "conversation_turn_fill",
            scene_label: "On the street",
            prompt: "The hotel is just across the street. The local points directly at it. Complete the reply.",
            lines: [
              { speaker: "You",   text: "Atsiprašau, kur yra viešbutis?", audioText: "Atsiprašau, kur yra viešbutis", hasGap: false },
              { speaker: "Local", text: "Tai ___.",                        hasGap: true },
            ],
            options: [
              { id: "a", text: "toli",  isCorrect: false },
              { id: "b", text: "čia",   isCorrect: false },
              { id: "c", text: "ten",   isCorrect: true  },
            ],
            explanation: "Ten — there. The pointing cue tells you the hotel is away from where you are standing. Čia would mean here; toli would mean far, but the hotel is only across the street.",
            translation_en: "Excuse me, where is the hotel? — It's there.",
          },
          {
            id: "s5m1l5_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone tells you: Eikite tiesiai, paskui kairėn. What did they say?", audioText: "" },
            noOptionAudio: true,
            options: [
              { id: "a", text: "Turn left, then go straight.", isCorrect: false },
              { id: "b", text: "Go straight, then turn left.", isCorrect: true  },
              { id: "c", text: "Go right, then turn left.",    isCorrect: false },
            ],
            feedback: { correct: "Tiesiai = straight, paskui = then, kairėn = left. Order matters — straight first, then the turn." },
          },
          {
            id: "s5m1l5_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: Where is the bank?",
            targetText: "Kur yra bankas",
            audioText: "Kur yra bankas",
          },
          {
  id: "s5m1l5_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "A full short location exchange — ask, get directions, check distance, close.",
  sceneIntro: "A full short location exchange — ask, get directions, check distance, close.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "A full short location exchange — ask, get directions, check distance, close.",
  focus: ["directions"],
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
          text: "Taip! Kur yra tualetas?",
          textEn: "Yes! Where is the toilet?",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Kur yra tualetas?","result":"acceptable","feedback":"The shorter question is natural because the context is already clear.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Eikite tiesiai, paskui dešinėn. Tualetas yra ten.",
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
          text: "Ar toli?",
          textEn: "Is it far?",
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
      speakerText: "Ne, tai netoli. Viena minutė.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
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
          text: "Prašau kalbėkite lėčiau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ,
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is also natural.","progresses":true},
      ],
    },
    {
      id: "step_4",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Prašom! Viso gero.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Laba diena.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Viso gero!",
          textEn: "Goodbye!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Atsiprašau.",
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

      // ── Module 5.1 Checkpoint ─────────────────────────────────────────────
      {
        id: "section_5_module_1_checkpoint",
        code: "5.1.C",
        title: "Location Basics Check",
        purpose: "Confirm the core location-question system is fast and reliable.",
        supportLevel: "low",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s5m1c_b1",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kur yra viešbutis?", audioText: "Kur yra viešbutis" },
            options: [
              { id: "a", text: "Where is the pharmacy?", isCorrect: false },
              { id: "b", text: "Where is the hotel?",    isCorrect: true  },
              { id: "c", text: "Where is the station?",  isCorrect: false },
            ],
          },
          {
            id: "s5m1c_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Tai netoli.", audioText: "Tai netoli" },
            options: [
              { id: "a", text: "It's far.",   isCorrect: false },
              { id: "b", text: "It's there.", isCorrect: false },
              { id: "c", text: "It's near.",  isCorrect: true  },
            ],
          },
          {
            id: "s5m1c_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You want to know if the hotel is far. What do you ask?", audioText: "" },
            options: [
              { id: "a", text: "Kur yra viešbutis?", isCorrect: false },
              { id: "b", text: "Ar toli?",        isCorrect: true  },
              { id: "c", text: "Tai ten.",            isCorrect: false },
            ],
            feedback: { correct: "Ar toli? — Is it far? This is the standard distance check for any destination." },
          },
          {
            id: "s5m1c_b4",
            type: "context_gap_select",
            prompt: "Complete the direction",
            sentence: "Pasukite ___, paskui eikite tiesiai.",
            translation_en: "Turn left, then go straight.",
            options: [
              { id: "a", text: "tiesiai",  isCorrect: false },
              { id: "b", text: "dešinėn",  isCorrect: false },
              { id: "c", text: "kairėn",   isCorrect: true  },
            ],
            explanation: "Kairėn means to the left. Dešinėn is right. Tiesiai is straight ahead.",
          },
          {
            id: "s5m1c_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "You need the station. Politely ask where it is, then ask if it's far.",
            targetText: "Atsiprašau, kur yra stotis? Ar toli?",
            audioText: "Atsiprašau, kur yra stotis? Ar toli?",
          },
          {
  id: "s5m1c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You need the station. Ask a passer-by, check the distance, get one direction.",
  sceneIntro: "You need the station. Ask a passer-by, check the distance, get one direction.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "You need the station. Ask a passer-by, check the distance, get one direction.",
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
      speakerText: "Laba diena! Ar galiu padėti?",
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
          text: "Taip! Kur yra stotis?",
          textEn: "Yes! Where is the station?",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Kur yra stotis?","result":"acceptable","feedback":"The shorter question is natural because the context is already clear.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Stotis? Eikite tiesiai, paskui dešinėn.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      help: {
        levels: [
          { sceneDirection: "She points straight ahead, then gestures to the right.", speakerText: "Tiesiai. Paskui dešinėn." },
          { sceneDirection: "She traces the route with her finger: straight, then right." },
          { speakerText: "Straight, then right.", spokenLanguage: "en", audio: false },
        ],
      },
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
          text: "Suprantu. Ar toli?",
          textEn: "I understand. Is it far?",
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
      speakerText: "Ne, tai netoli. Penkios minutės.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
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
        }
      ,
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is also natural.","progresses":true},
      ],
    },
    {
      id: "step_4",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Prašom. Geros kelionės!",
      supportText: "geros kelionės — have a good journey",
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
          text: "Ačiū! Viso gero!",
          textEn: "Thank you! Goodbye!",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is also natural.","progresses":true},
      ],
    }
  ],
},
          {
            id: "s5m1c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Kur yra…?",          en: "Where is…?",            audioText: "Kur yra" },
              { id: "m2",  lt: "Kur yra stotis?",     en: "Where is the station?", audioText: "Kur yra stotis" },
              { id: "m3",  lt: "Kur yra tualetas?",   en: "Where is the toilet?",  audioText: "Kur yra tualetas" },
              { id: "m4",  lt: "Kur yra viešbutis?",  en: "Where is the hotel?",   audioText: "Kur yra viešbutis" },
              { id: "m5",  lt: "Kur yra bankas?",      en: "Where is the bank?",     audioText: "Kur yra bankas" },
              { id: "m6",  lt: "čia",                 en: "here",                  audioText: "čia" },
              { id: "m7",  lt: "ten",                 en: "there",                 audioText: "ten" },
              { id: "m8",  lt: "Tai čia.",            en: "It's here.",            audioText: "Tai čia" },
              { id: "m9",  lt: "Tai ten.",            en: "It's there.",           audioText: "Tai ten" },
              { id: "m10", lt: "netoli",              en: "near",                  audioText: "netoli" },
              { id: "m11", lt: "toli",                en: "far",                   audioText: "toli" },
              { id: "m12", lt: "Ar toli?",        en: "Is it far?",            audioText: "Ar tai toli" },
              { id: "m13", lt: "Tai netoli.",         en: "It's near.",            audioText: "Tai netoli" },
              { id: "m14", lt: "tiesiai",             en: "straight ahead",        audioText: "tiesiai" },
              { id: "m15", lt: "kairėn",              en: "to the left",           audioText: "kairėn" },
              { id: "m16", lt: "dešinėn",             en: "to the right",          audioText: "dešinėn" },
              { id: "m17", lt: "Eikite tiesiai.",     en: "Go straight ahead.",    audioText: "Eikite tiesiai" },
              { id: "m18", lt: "Pasukite kairėn.",    en: "Turn left.",            audioText: "Pasukite kairėn" },
              { id: "m19", lt: "Pasukite dešinėn.",   en: "Turn right.",           audioText: "Pasukite dešinėn" },
              { id: "m20", lt: "paskui",              en: "then",                  audioText: "paskui" },
            ],
          },
        ],
      },
    ],
  };
}

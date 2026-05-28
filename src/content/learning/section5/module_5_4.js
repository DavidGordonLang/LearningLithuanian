// src/content/learning/section5/module_5_4.js
// Module 5.4 — Asking and Understanding Directions

export default function createModule_5_4(profile = {}) {
  const { userNameSafe = "Davidas" } = profile;

  return {
    id: "module_5_4",
    code: "5.4",
    title: "Asking and Understanding Directions",
    status: "active",
    lessonCount: 5,
    lessons: [

      // ── Lesson 1 — How Do I Get To…? ─────────────────────────────────────
      {
        id: "section_5_module_4_lesson_1",
        code: "5.4.1",
        title: "How Do I Get To…?",
        purpose: "Teach one of the most valuable route questions in the app.",
        supportLevel: "high",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Kaip man nusigauti į…? is a long phrase but it works as a chunk. You don't need to break it down — just learn it as one unit. It means how do I get to somewhere and it is immediately useful for travel.",
          usage: [
            "Kaip man nusigauti į stotį? — How do I get to the station?",
            "Kaip man nusigauti į viešbutį? — How do I get to the hotel?",
            "Kaip nuvykti į oro uostą? — How do I get to the airport?",
          ],
        },
        blocks: [
          {
            id: "s5m4l1_b1",
            type: "learn",
            title: "How do I get to…?",
            items: [
              { id: "i1", lt: "Kaip man nusigauti į stotį?",   en: "How do I get to the station?",  audioText: "Kaip man nusigauti į stotį",   saveable: true, core: true },
              { id: "i2", lt: "Kaip man nusigauti į viešbutį?",en: "How do I get to the hotel?",    audioText: "Kaip man nusigauti į viešbutį",saveable: true, core: true },
              { id: "i3", lt: "Kaip nuvykti į oro uostą?",     en: "How do I get to the airport?",  audioText: "Kaip nuvykti į oro uostą",     saveable: true, core: false },
            ],
          },
          {
            id: "s5m4l1_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kaip man nusigauti į stotį?", audioText: "Kaip man nusigauti į stotį" },
            options: [
              { id: "a", text: "Where is the station?",        isCorrect: false },
              { id: "b", text: "How do I get to the station?", isCorrect: true  },
              { id: "c", text: "Is the station far?",          isCorrect: false },
            ],
          },
          {
            id: "s5m4l1_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kaip man nusigauti į viešbutį?", audioText: "Kaip man nusigauti į viešbutį" },
            options: [
              { id: "a", text: "Where is the hotel?",           isCorrect: false },
              { id: "b", text: "How do I get to the hotel?",    isCorrect: true  },
              { id: "c", text: "Is the hotel near?",            isCorrect: false },
            ],
          },
          {
            id: "s5m4l1_b4",
            type: "context_gap_select",
            prompt: "Complete the question",
            sentence: "Kaip man nusigauti ___ stotį?",
            translation_en: "How do I get to the station?",
            options: [
              { id: "a", text: "iš",  isCorrect: false },
              { id: "b", text: "į",   isCorrect: true  },
              { id: "c", text: "prie",isCorrect: false },
            ],
            explanation: "Į shows destination — how do I get TO the station. Iš would mean from, which changes the meaning entirely.",
          },
          {
            id: "s5m4l1_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: How do I get to the station?",
            targetText: "Kaip man nusigauti į stotį",
            audioText: "Kaip man nusigauti į stotį",
          },
          {
  id: "s5m4l1_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You need to get to the train station. Ask someone for directions.",
  sceneIntro: "You need to get to the train station. Ask someone for directions.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "You need to get to the train station. Ask someone for directions.",
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
      supportText: "Good day! Can I help?",
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
          text: "Laba diena! Kaip man nusigauti į geležinkelio stotį?",
          textEn: "Good day! How do I get to the train station?",
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
      speakerText: "Eikite tiesiai, paskui pasukite dešinėn.",
      supportText: "Go straight, then turn right.",
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
          text: "Kur yra viešbutis?",
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
      speakerText: "Ne, tai netoli. Apie penkios minutės.",
      supportText: "No, it's near. About five minutes.",
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
    },
    {
      id: "step_4",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Prašom. Geros kelionės!",
      supportText: "You're welcome. Have a good journey!",
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
          text: "Ačiū! Viso gero.",
          textEn: "Thank you! Goodbye.",
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

      // ── Lesson 2 — Is It Far? ─────────────────────────────────────────────
      {
        id: "section_5_module_4_lesson_2",
        code: "5.4.2",
        title: "Is It Far?",
        purpose: "Add route distance checking.",
        supportLevel: "high",
        newLanguageLoad: "low",
        blocks: [
          {
            id: "s5m4l2_b1",
            type: "learn",
            title: "Distance checking",
            items: [
              { id: "i1", lt: "Ar tai toli?",   en: "Is it far?",    audioText: "Ar tai toli",   saveable: true, core: true },
              { id: "i2", lt: "Ar tai netoli?", en: "Is it near?",   audioText: "Ar tai netoli", saveable: true, core: true },
              { id: "i3", lt: "Netoli.",        en: "Not far / near.",audioText: "Netoli",        saveable: true, core: true },
              { id: "i4", lt: "Toli.",          en: "Far.",          audioText: "Toli",          saveable: true, core: true },
              { id: "i5", lt: "Labai toli.",    en: "Very far.",     audioText: "Labai toli",    saveable: true, core: false },
            ],
          },
          {
            id: "s5m4l2_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Labai toli.", audioText: "Labai toli" },
            options: [
              { id: "a", text: "Not far.",  isCorrect: false },
              { id: "b", text: "Very far.", isCorrect: true  },
              { id: "c", text: "Near.",     isCorrect: false },
            ],
          },
          {
            id: "s5m4l2_b3",
            type: "conversation_turn_fill",
            scene_label: "In the street",
            lines: [
              { speaker: "You",   text: "Kaip man nusigauti į viešbutį?", audioText: "Kaip man nusigauti į viešbutį", hasGap: false },
              { speaker: "Local", text: "Eikite tiesiai.",                 audioText: "Eikite tiesiai",                hasGap: false },
              { speaker: "You",   text: "___?",                            hasGap: true },
            ],
            options: [
              { id: "a", text: "Kur yra stotis?", isCorrect: false },
              { id: "b", text: "Ar tai toli?",    isCorrect: true  },
              { id: "c", text: "Ačiū labai.",     isCorrect: false },
            ],
            explanation: "After getting directions the natural next question is Ar tai toli? — Is it far? It completes the exchange.",
            translation_en: "How do I get to the hotel? — Go straight. — Is it far?",
          },
          {
            id: "s5m4l2_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: Is it far?",
            targetText: "Ar tai toli",
            audioText: "Ar tai toli",
          },
          {
  id: "s5m4l2_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You ask how to get to the pharmacy and check whether it's far.",
  sceneIntro: "You ask how to get to the pharmacy and check whether it's far.",
  location: "pharmacy",
  userRole: "customer",
  register: "polite_service",
  goal: "You ask how to get to the pharmacy and check whether it's far.",
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
          text: "Laba diena! Kaip man nusigauti į vaistinę?",
          textEn: "Good day! How do I get to the pharmacy?",
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
      speakerText: "Eikite tiesiai.",
      supportText: "Go straight.",
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
      speakerId: "pharmacist",
      speakerLabel: "Pharmacist",
      speakerText: "Ne, netoli. Trys minutės.",
      supportText: "No, not far. Three minutes.",
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
          text: "Per toli.",
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

      // ── Lesson 3 — Go Left / Go Right / Go Straight ───────────────────────
      {
        id: "section_5_module_4_lesson_3",
        code: "5.4.3",
        title: "Go Left / Go Right / Go Straight",
        purpose: "Turn direction words into action instructions.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "You already know kairėn, dešinėn, and tiesiai. Now they appear as instructions — Eikite tiesiai, Pasukite kairėn, Pasukite dešinėn. Paskui means then and lets you chain two directions together.",
          usage: [
            "Eikite tiesiai — go straight ahead",
            "Pasukite kairėn — turn left",
            "Pasukite dešinėn — turn right",
            "Tiesiai, paskui kairėn — straight, then left",
          ],
        },
        blocks: [
          {
            id: "s5m4l3_b1",
            type: "learn",
            title: "Direction instructions",
            items: [
              { id: "i1", lt: "Eikite tiesiai.",           en: "Go straight ahead.",        audioText: "Eikite tiesiai",           saveable: true, core: true },
              { id: "i2", lt: "Pasukite kairėn.",          en: "Turn left.",                audioText: "Pasukite kairėn",          saveable: true, core: true },
              { id: "i3", lt: "Pasukite dešinėn.",         en: "Turn right.",               audioText: "Pasukite dešinėn",         saveable: true, core: true },
              { id: "i4", lt: "Tiesiai, paskui kairėn.",  en: "Straight, then left.",      audioText: "Tiesiai, paskui kairėn",   saveable: true, core: true },
              { id: "i5", lt: "Tiesiai, paskui dešinėn.", en: "Straight, then right.",     audioText: "Tiesiai, paskui dešinėn",  saveable: true, core: true },
            ],
          },
          {
            id: "s5m4l3_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Pasukite dešinėn.", audioText: "Pasukite dešinėn" },
            options: [
              { id: "a", text: "Go straight ahead.", isCorrect: false },
              { id: "b", text: "Turn left.",         isCorrect: false },
              { id: "c", text: "Turn right.",        isCorrect: true  },
            ],
          },
          {
            id: "s5m4l3_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Tiesiai, paskui kairėn.", audioText: "Tiesiai, paskui kairėn" },
            options: [
              { id: "a", text: "Left, then straight.",  isCorrect: false },
              { id: "b", text: "Straight, then left.",  isCorrect: true  },
              { id: "c", text: "Straight, then right.", isCorrect: false },
            ],
          },
          {
            id: "s5m4l3_b4",
            type: "context_gap_select",
            prompt: "Complete the directions",
            sentence: "Eikite tiesiai, paskui ___ kairėn.",
            translation_en: "Go straight, then turn left.",
            options: [
              { id: "a", text: "eikite",   isCorrect: false },
              { id: "b", text: "pasukite", isCorrect: true  },
              { id: "c", text: "ar",       isCorrect: false },
            ],
            explanation: "Pasukite means turn — it's the you-form command. Eikite means go. Straight uses eikite, turns use pasukite.",
          },
          {
            id: "s5m4l3_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: Turn left",
            targetText: "Pasukite kairėn",
            audioText: "Pasukite kairėn",
          },
          {
  id: "s5m4l3_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "Someone asks you for directions to the bus station.",
  sceneIntro: "Someone asks you for directions to the bus station.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "Someone asks you for directions to the bus station.",
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
      speakerText: "Atsiprašau! Kaip man nusigauti į autobusų stotį?",
      supportText: "Excuse me! How do I get to the bus station?",
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
          text: "Eikite tiesiai, paskui pasukite kairėn.",
          textEn: "Go straight, then turn left.",
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
      speakerText: "Suprantu. Tiesiai, paskui kairėn?",
      supportText: "I understand. Straight, then left?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Ne, dešinėn.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip, teisingai!",
          textEn: "Yes, that's right!",
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
      speakerText: "Ačiū labai!",
      supportText: "Thank you very much!",
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
          text: "Prašom! Viso gero.",
          textEn: "You're welcome! Goodbye.",
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

      // ── Lesson 4 — On Foot / By Bus ───────────────────────────────────────
      {
        id: "section_5_module_4_lesson_4",
        code: "5.4.4",
        title: "On Foot / By Bus",
        purpose: "Teach very basic route-mode language.",
        supportLevel: "high",
        newLanguageLoad: "low",
        blocks: [
          {
            id: "s5m4l4_b1",
            type: "learn",
            title: "How to get there",
            items: [
              { id: "i1", lt: "pėsčiomis",                   en: "on foot",              audioText: "pėsčiomis",                   saveable: true, core: true },
              { id: "i2", lt: "autobusu",                    en: "by bus",               audioText: "autobusu",                    saveable: true, core: true },
              { id: "i3", lt: "Galite eiti pėsčiomis.",      en: "You can go on foot.",  audioText: "Galite eiti pėsčiomis",       saveable: true, core: true },
              { id: "i4", lt: "Galite važiuoti autobusu.",   en: "You can go by bus.",   audioText: "Galite važiuoti autobusu",    saveable: true, core: true },
            ],
          },
          {
            id: "s5m4l4_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Galite eiti pėsčiomis.", audioText: "Galite eiti pėsčiomis" },
            options: [
              { id: "a", text: "You can go by bus.",   isCorrect: false },
              { id: "b", text: "You can go on foot.",  isCorrect: true  },
              { id: "c", text: "You can go by taxi.",  isCorrect: false },
            ],
          },
          {
            id: "s5m4l4_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone asks: Kaip man nusigauti į stotį? It's a 20 minute walk but there's a bus. What do you suggest?", audioText: "" },
            noOptionAudio: true,
            options: [
              { id: "a", text: "Tai labai toli.",              isCorrect: false },
              { id: "b", text: "Galite važiuoti autobusu.",    isCorrect: true  },
              { id: "c", text: "Eikite tiesiai.",              isCorrect: false },
            ],
            feedback: { correct: "Galite važiuoti autobusu — you can go by bus. The practical suggestion when walking is inconvenient." },
          },
          {
            id: "s5m4l4_b4",
            type: "context_gap_select",
            prompt: "Complete the reply",
            sentence: "Stotis netoli. Galite eiti ___.",
            translation_en: "The station is near. You can go on foot.",
            options: [
              { id: "a", text: "autobusu",   isCorrect: false },
              { id: "b", text: "pėsčiomis",  isCorrect: true  },
              { id: "c", text: "taksiu",     isCorrect: false },
            ],
            explanation: "Netoli (not far) makes pėsčiomis (on foot) the natural suggestion. Autobusu would suit a longer distance.",
          },
          {
            id: "s5m4l4_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: You can go by bus",
            targetText: "Galite važiuoti autobusu",
            audioText: "Galite važiuoti autobusu",
          },
          {
  id: "s5m4l4_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You ask how to get to the airport. It's too far to walk.",
  sceneIntro: "You ask how to get to the airport. It's too far to walk.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You ask how to get to the airport. It's too far to walk.",
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
      speakerText: "Laba diena! Ko ieškote?",
      supportText: "Good day! What are you looking for?",
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
          text: "Laba diena! Kaip nuvykti į oro uostą?",
          textEn: "Good day! How do I get to the airport?",
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
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Oro uostas yra toli. Galite važiuoti autobusu.",
      supportText: "The airport is far. You can go by bus.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Galite eiti pėsčiomis.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Suprantu. Kur yra autobusų stotelė?",
          textEn: "I understand. Where is the bus stop?",
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
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Stotelė yra ten, kairėn. Netoli.",
      supportText: "The bus stop is there, on the left. Not far.",
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
        ],
      },

      // ── Lesson 5 — Short Direction Scenario ──────────────────────────────
      {
        id: "section_5_module_4_lesson_5",
        code: "5.4.5",
        title: "Short Direction Scenario",
        purpose: "Bring route language together in a practical exchange.",
        supportLevel: "medium",
        newLanguageLoad: "very_low",
        blocks: [
          {
            id: "s5m4l5_b1",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Galite važiuoti autobusu arba eiti pėsčiomis.", audioText: "Galite važiuoti autobusu arba eiti pėsčiomis" },
            options: [
              { id: "a", text: "You can only go by bus.",                   isCorrect: false },
              { id: "b", text: "You can go by bus or on foot.",             isCorrect: true  },
              { id: "c", text: "You should go on foot, not by bus.",        isCorrect: false },
            ],
          },
          {
            id: "s5m4l5_b2",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You've asked for directions. The person says: Eikite tiesiai, paskui pasukite dešinėn. What do you say to confirm you understood?", audioText: "" },
            noOptionAudio: true,
            options: [
              { id: "a", text: "Ar tai toli?",                         isCorrect: false },
              { id: "b", text: "Suprantu — tiesiai, paskui dešinėn.",  isCorrect: true  },
              { id: "c", text: "Kur yra stotelė?",                     isCorrect: false },
            ],
            feedback: { correct: "Suprantu — tiesiai, paskui dešinėn. Repeating back the key direction confirms understanding and gives the other person a chance to correct you." },
          },
          {
            id: "s5m4l5_b3",
            type: "conversation_turn_fill",
            scene_label: "In the street",
            lines: [
              { speaker: "You",   text: "Atsiprašau, kaip man nusigauti į vaistinę?", audioText: "Atsiprašau, kaip man nusigauti į vaistinę", hasGap: false },
              { speaker: "Local", text: "Eikite tiesiai, paskui pasukite kairėn.",     audioText: "Eikite tiesiai, paskui pasukite kairėn",     hasGap: false },
              { speaker: "You",   text: "___?",                                        hasGap: true },
            ],
            options: [
              { id: "a", text: "Kur yra bankas?", isCorrect: false },
              { id: "b", text: "Ar tai toli?",    isCorrect: true  },
              { id: "c", text: "Viso gero.",      isCorrect: false },
            ],
            explanation: "After getting the route, Ar tai toli? is the natural follow-up — you want to know whether to walk or take transport.",
            translation_en: "Excuse me, how do I get to the pharmacy? — Go straight, then turn left. — Is it far?",
          },
          {
            id: "s5m4l5_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: How do I get to the hotel?",
            targetText: "Kaip man nusigauti į viešbutį",
            audioText: "Kaip man nusigauti į viešbutį",
          },
          {
  id: "s5m4l5_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "A full short direction exchange from start to finish — ask, get the route, check distance, confirm transport, close.",
  sceneIntro: "A full short direction exchange from start to finish — ask, get the route, check distance, confirm transport, close.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "A full short direction exchange from start to finish — ask, get the route, check distance, confirm transport, close.",
  focus: ["directions","time"],
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
      speakerText: "Laba diena! Ar galiu padėti?",
      supportText: "Good day! Can I help?",
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
          text: "Laba diena! Atsiprašau, kaip man nusigauti į autobusų stotį?",
          textEn: "Good day! Excuse me, how do I get to the bus station?",
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
      speakerText: "Eikite tiesiai, paskui pasukite kairėn.",
      supportText: "Go straight, then turn left.",
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
          text: "Kur yra stotelė?",
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
      speakerText: "Nelabai. Galite eiti pėsčiomis — dešimt minučių.",
      supportText: "Not really. You can walk — ten minutes.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Galite važiuoti autobusu?",
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

      // ── Module 5.4 Checkpoint ─────────────────────────────────────────────
      {
        id: "section_5_module_4_checkpoint",
        code: "5.4.C",
        title: "Directions Check",
        purpose: "Confirm route-asking and direction-following is working.",
        supportLevel: "low",
        newLanguageLoad: "none",
        blocks: [
          {
            id: "s5m4c_b1",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kaip man nusigauti į viešbutį?", audioText: "Kaip man nusigauti į viešbutį" },
            options: [
              { id: "a", text: "Where is the hotel?",           isCorrect: false },
              { id: "b", text: "How do I get to the hotel?",    isCorrect: true  },
              { id: "c", text: "Is the hotel far?",             isCorrect: false },
            ],
          },
          {
            id: "s5m4c_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Galite eiti pėsčiomis.", audioText: "Galite eiti pėsčiomis" },
            options: [
              { id: "a", text: "You can go by bus.",   isCorrect: false },
              { id: "b", text: "You can go on foot.",  isCorrect: true  },
              { id: "c", text: "You should take a taxi.", isCorrect: false },
            ],
          },
          {
            id: "s5m4c_b3",
            type: "context_gap_select",
            prompt: "Complete the reply",
            sentence: "Stotis yra toli. Galite važiuoti ___.",
            translation_en: "The station is far. You can go by bus.",
            options: [
              { id: "a", text: "pėsčiomis", isCorrect: false },
              { id: "b", text: "autobusu",  isCorrect: true  },
              { id: "c", text: "tiesiai",   isCorrect: false },
            ],
            explanation: "Toli (far) makes autobusu (by bus) the logical suggestion. Pėsčiomis (on foot) suits short distances.",
          },
          {
            id: "s5m4c_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: How do I get to the station?",
            targetText: "Kaip man nusigauti į stotį",
            audioText: "Kaip man nusigauti į stotį",
          },
          {
            id: "s5m4c_b5",
            type: "conversation_turn_fill",
            scene_label: "In the street",
            lines: [
              { speaker: "You",   text: "Kaip man nusigauti į autobusų stotį?", audioText: "Kaip man nusigauti į autobusų stotį", hasGap: false },
              { speaker: "Local", text: "___, paskui pasukite dešinėn.",         hasGap: true },
            ],
            options: [
              { id: "a", text: "Pasukite kairėn", isCorrect: false },
              { id: "b", text: "Eikite tiesiai",  isCorrect: true  },
              { id: "c", text: "Tai netoli",       isCorrect: false },
            ],
            explanation: "Eikite tiesiai, paskui pasukite dešinėn — go straight, then turn right. Directions typically start with the first action.",
            translation_en: "How do I get to the bus station? — Go straight, then turn right.",
          },
          {
  id: "s5m4c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "A full route-finding exchange — ask, get directions, check distance, choose transport, close.",
  sceneIntro: "A full route-finding exchange — ask, get directions, check distance, choose transport, close.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "A full route-finding exchange — ask, get directions, check distance, choose transport, close.",
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
      speakerText: "Laba diena! Ar galiu jums padėti?",
      supportText: "Good day! Can I help you?",
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
          text: "Taip! Kaip man nusigauti į geležinkelio stotį?",
          textEn: "Yes! How do I get to the train station?",
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
      speakerText: "Eikite tiesiai, paskui pasukite kairėn.",
      supportText: "Go straight, then turn left.",
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
          text: "Prašau kalbėkite lėčiau.",
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
      speakerText: "Taip, šiek tiek toli. Geriau važiuokite autobusu.",
      supportText: "Yes, a bit far. Better go by bus.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Aš eisiu pėsčiomis.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Suprantu. Kur yra autobusų stotelė?",
          textEn: "I understand. Where is the bus stop?",
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
      id: "step_4",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Stotelė yra ten, dešinėn. Netoli.",
      supportText: "The bus stop is there, on the right. Not far.",
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
            id: "s5m4c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Kaip man nusigauti į stotį?",    en: "How do I get to the station?",   audioText: "Kaip man nusigauti į stotį" },
              { id: "m2",  lt: "Kaip man nusigauti į viešbutį?", en: "How do I get to the hotel?",     audioText: "Kaip man nusigauti į viešbutį" },
              { id: "m3",  lt: "Kaip nuvykti į oro uostą?",      en: "How do I get to the airport?",   audioText: "Kaip nuvykti į oro uostą" },
              { id: "m4",  lt: "Ar tai toli?",                   en: "Is it far?",                     audioText: "Ar tai toli" },
              { id: "m5",  lt: "Ar tai netoli?",                 en: "Is it near?",                    audioText: "Ar tai netoli" },
              { id: "m6",  lt: "Netoli.",                        en: "Not far.",                       audioText: "Netoli" },
              { id: "m7",  lt: "Labai toli.",                    en: "Very far.",                      audioText: "Labai toli" },
              { id: "m8",  lt: "Eikite tiesiai.",                en: "Go straight ahead.",             audioText: "Eikite tiesiai" },
              { id: "m9",  lt: "Pasukite kairėn.",               en: "Turn left.",                     audioText: "Pasukite kairėn" },
              { id: "m10", lt: "Pasukite dešinėn.",              en: "Turn right.",                    audioText: "Pasukite dešinėn" },
              { id: "m11", lt: "Tiesiai, paskui kairėn.",        en: "Straight, then left.",           audioText: "Tiesiai, paskui kairėn" },
              { id: "m12", lt: "pėsčiomis",                      en: "on foot",                        audioText: "pėsčiomis" },
              { id: "m13", lt: "autobusu",                       en: "by bus",                         audioText: "autobusu" },
              { id: "m14", lt: "Galite eiti pėsčiomis.",         en: "You can go on foot.",            audioText: "Galite eiti pėsčiomis" },
              { id: "m15", lt: "Galite važiuoti autobusu.",      en: "You can go by bus.",             audioText: "Galite važiuoti autobusu" },
              { id: "m16", lt: "Suprantu.",                      en: "I understand.",                  audioText: "Suprantu" },
              { id: "m17", lt: "šiek tiek toli",                 en: "a bit far",                      audioText: "šiek tiek toli" },
              { id: "m18", lt: "arba",                           en: "or",                             audioText: "arba" },
              { id: "m19", lt: "Geros kelionės!",                en: "Have a good journey!",           audioText: "Geros kelionės" },
              { id: "m20", lt: "Nelabai.",                       en: "Not really.",                    audioText: "Nelabai" },
            ],
          },
        ],
      },
    ],
  };
}

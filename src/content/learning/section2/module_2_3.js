// src/content/learning/section2/module_2_3.js
// Module 2.3 — This / That / These / Those

export default function createModule_2_3(profile = {}) {
  return {
    id: "module_2_3",
    code: "2.3",
    title: "This / That / These / Those",
    status: "active",
    lessonCount: 6,
    lessons: [

      // ── Lesson 1 ────────────────────────────────────────────────────────────
      {
        id: "section_2_module_3_lesson_1",
        code: "2.3.1",
        title: "This / That",
        purpose: "Strengthen singular pointing and object reference. Builds on Kas tai? from Section 1.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Šitas = this (nearby). Tas = that (further away). Both are the everyday spoken forms for beginners — natural and transparent.",
          usage: [
            "Šitas geras. — This is good.",
            "Tas geras. — That is good.",
            "Kas šitas? — What is this?",
            "Kas tas? — What is that?",
            "Šitas, prašau. — This one, please.",
          ],
        },
        blocks: [
          {
            id: "s2m3l1_b1",
            type: "learn",
            title: "This / that",
            items: [
              { id: "t1", lt: "Šitas", en: "This", audioText: "Šitas", saveable: true, core: true },
              { id: "t2", lt: "Tas", en: "That", audioText: "Tas", saveable: true, core: true },
              { id: "t3", lt: "Šitas geras.", en: "This is good.", audioText: "Šitas geras", saveable: true, core: true },
              { id: "t4", lt: "Tas geras.", en: "That is good.", audioText: "Tas geras", saveable: true, core: true },
              { id: "t5", lt: "Kas šitas?", en: "What is this?", audioText: "Kas šitas", saveable: true, core: true },
              { id: "t6", lt: "Kas tas?", en: "What is that?", audioText: "Kas tas", saveable: true, core: true },
              { id: "t7", lt: "Duona", en: "Bread", audioText: "Duona", saveable: true, core: false },
              { id: "t8", lt: "Obuolys", en: "Apple", audioText: "Obuolys", saveable: true, core: false },
              { id: "t9", lt: "Sūris", en: "Cheese", audioText: "Sūris", saveable: true, core: false },
            ],
          },
          {
            id: "s2m3l1_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Šitas geras.", audioText: "Šitas geras" },
            options: [
              { id: "a", text: "That is good.", isCorrect: false },
              { id: "b", text: "This is good.", isCorrect: true },
              { id: "c", text: "This is bad.", isCorrect: false },
            ],
          },
          {
            id: "s2m3l1_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kas šitas?", audioText: "Kas šitas" },
            options: [
              { id: "a", text: "What is that?", isCorrect: false },
              { id: "b", text: "What is this?", isCorrect: true },
              { id: "c", text: "Is this good?", isCorrect: false },
            ],
          },
          {
            id: "s2m3l1_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You're pointing at an item right in front of you and want to know what it is." },
            options: [
              { id: "a", text: "Kas tas?", isCorrect: false },
              { id: "b", text: "Kas šitas?", isCorrect: true },
              { id: "c", text: "Kas ten?", isCorrect: false },
            ],
            feedback: { correct: "Kas šitas? — for something right in front of you. Kas tas? or Kas ten? for something further away." },
          },
          {
            id: "s2m3l1_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: What is this?",
            targetText: "Kas šitas?",
            audioText: "Kas šitas",
          },
          {
  id: "s2m3l1_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a market stall and see an unfamiliar item.",
  sceneIntro: "You're at a market stall and see an unfamiliar item.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're at a market stall and see an unfamiliar item.",
  focus: ["conversation practice"],
  participants: [
    {
      "id": "seller",
      "label": "Seller",
      "name": "Tomas",
      "role": "seller",
      "gender": "male",
      "relationshipToUser": "stranger",
      "register": "polite_service"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Atsiprašau…",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Noriu to.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Kas šitas?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Šitas geras.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_2",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Tai duona.",
      supportText: "That's bread.",
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
          text: "Ačiū! Šitas geras?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Man reikia pagalbos.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Taip, labai geras!",
      supportText: "Yes, very good!",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
          text: "Noriu šito, prašau.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Neturiu grynųjų.",
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

      // ── Lesson 2 ────────────────────────────────────────────────────────────
      {
        id: "section_2_module_3_lesson_2",
        code: "2.3.2",
        title: "This One / That One",
        purpose: "Move from identifying to selecting between options.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Noriu šito — I want this one. Noriu to — I want that one. The form shifts slightly but the meaning is natural.",
          usage: [
            "Šito noriu. — I want this one.",
            "To noriu. — I want that one.",
            "Ne šito. — Not this one.",
            "To, prašau. — That one, please.",
            "Šito, prašau. — This one, please.",
          ],
        },
        blocks: [
          {
            id: "s2m3l2_b1",
            type: "learn",
            title: "This one / that one",
            items: [
              { id: "o1", lt: "Noriu šito.", en: "I want this one.", audioText: "Noriu šito", saveable: true, core: true },
              { id: "o2", lt: "Noriu to.", en: "I want that one.", audioText: "Noriu to", saveable: true, core: true },
              { id: "o3", lt: "Ne šito.", en: "Not this one.", audioText: "Ne šito", saveable: true, core: true },
              { id: "o4", lt: "To, prašau.", en: "That one, please.", audioText: "To, prašau", saveable: true, core: true },
              { id: "o5", lt: "Šito, prašau.", en: "This one, please.", audioText: "Šito, prašau", saveable: true, core: true },
            ],
          },
          {
            id: "s2m3l2_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "To, prašau.", audioText: "To, prašau" },
            options: [
              { id: "a", text: "This one, please.", isCorrect: false },
              { id: "b", text: "That one, please.", isCorrect: true },
              { id: "c", text: "Not this one.", isCorrect: false },
            ],
          },
          {
            id: "s2m3l2_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ne šito.", audioText: "Ne šito" },
            options: [
              { id: "a", text: "This one, please.", isCorrect: false },
              { id: "b", text: "I want that one.", isCorrect: false },
              { id: "c", text: "Not this one.", isCorrect: true },
            ],
          },
          {
            id: "s2m3l2_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A shop assistant shows you two items. You want the one further away." },
            options: [
              { id: "a", text: "Šito, prašau.", isCorrect: false },
              { id: "b", text: "To, prašau.", isCorrect: true },
              { id: "c", text: "Ne šito.", isCorrect: false },
            ],
            feedback: { correct: "To, prašau — pointing to the one further away. Clean and natural." },
          },
          {
            id: "s2m3l2_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: This one, please",
            targetText: "Šito, prašau.",
            audioText: "Šito, prašau",
          },
          {
  id: "s2m3l2_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're choosing between two items at a stall.",
  sceneIntro: "You're choosing between two items at a stall.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're choosing between two items at a stall.",
  focus: ["conversation practice"],
  participants: [
    {
      "id": "seller",
      "label": "Seller",
      "name": "Tomas",
      "role": "seller",
      "gender": "male",
      "relationshipToUser": "stranger",
      "register": "polite_service"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Kurio norite?",
      supportText: "Which one do you want?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Neturiu grynųjų.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "To, prašau.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Kas šitas?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_2",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Šito?",
      supportText: "This one? (pointing to the wrong one)",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Taip, prašau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ne šito. To, prašau.",
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
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Gerai, prašau.",
      supportText: "OK, here you go.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
          text: "Ačiū labai!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Man reikia pagalbos.",
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

      // ── Lesson 3 ────────────────────────────────────────────────────────────
      {
        id: "section_2_module_3_lesson_3",
        code: "2.3.3",
        title: "These / Those",
        purpose: "Introduce plural pointing without overloading the learner.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Šitie = these. Tie = those. Plural pointing for when there's more than one item.",
          usage: [
            "Šitie geri. — These are good.",
            "Tie geri. — Those are good.",
            "Noriu šitų. — I want these.",
            "Noriu tų. — I want those.",
          ],
        },
        blocks: [
          {
            id: "s2m3l3_b1",
            type: "learn",
            title: "These / those",
            items: [
              { id: "pl1", lt: "Šitie", en: "These", audioText: "Šitie", saveable: true, core: true },
              { id: "pl2", lt: "Tie", en: "Those", audioText: "Tie", saveable: true, core: true },
              { id: "pl3", lt: "Šitie geri.", en: "These are good.", audioText: "Šitie geri", saveable: true, core: true },
              { id: "pl4", lt: "Tie geri.", en: "Those are good.", audioText: "Tie geri", saveable: true, core: true },
              { id: "pl5", lt: "Noriu šitų.", en: "I want these.", audioText: "Noriu šitų", saveable: true, core: true },
              { id: "pl6", lt: "Noriu tų.", en: "I want those.", audioText: "Noriu tų", saveable: true, core: true },
              { id: "pl7", lt: "Gėlės", en: "Flowers", audioText: "Gėlės", saveable: true, core: false },
              { id: "pl8", lt: "Vaisiai", en: "Fruit", audioText: "Vaisiai", saveable: true, core: false },
              { id: "pl9", lt: "Daržovės", en: "Vegetables", audioText: "Daržovės", saveable: true, core: false },
            ],
          },
          {
            id: "s2m3l3_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Noriu šitų.", audioText: "Noriu šitų" },
            options: [
              { id: "a", text: "I want those.", isCorrect: false },
              { id: "b", text: "I want these.", isCorrect: true },
              { id: "c", text: "I want this one.", isCorrect: false },
            ],
          },
          {
            id: "s2m3l3_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Tie geri.", audioText: "Tie geri" },
            options: [
              { id: "a", text: "These are good.", isCorrect: false },
              { id: "b", text: "Those are good.", isCorrect: true },
              { id: "c", text: "That is good.", isCorrect: false },
            ],
          },
          {
            id: "s2m3l3_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "I want these." },
            tokens: [
              { id: "t1", text: "Noriu", correctIndex: 0 },
              { id: "t2", text: "šitų.", correctIndex: 1 },
              { id: "t3", text: "tų.", isDistractor: true },
            ],
            answerText: "Noriu šitų.",
          },
          {
            id: "s2m3l3_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: These are good",
            targetText: "Šitie geri.",
            audioText: "Šitie geri",
          },
          {
  id: "s2m3l3_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a bakery choosing pastries.",
  sceneIntro: "You're at a bakery choosing pastries.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're at a bakery choosing pastries.",
  focus: ["conversation practice"],
  participants: [
    {
      "id": "seller",
      "label": "Seller",
      "name": "Tomas",
      "role": "seller",
      "gender": "male",
      "relationshipToUser": "stranger",
      "register": "polite_service"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Ko norite?",
      supportText: "What do you want?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Noriu to.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Noriu šitų, prašau.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Kas šitas?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_2",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Šitų? Jie labai geri.",
      supportText: "These? They're very good.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Ne, noriu tų.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Puiku! Ačiū.",
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

      // ── Lesson 4 ────────────────────────────────────────────────────────────
      {
        id: "section_2_module_3_lesson_4",
        code: "2.3.4",
        title: "Choosing and Comparing",
        purpose: "Apply all pointing language to real choice-making.",
        supportLevel: "low",
        newLanguageLoad: "low",
        notes: {
          pattern: "Kuris? = Which one? (singular). Kurie? = Which ones? (plural). These unlock real choosing conversations.",
          usage: [
            "Šito, ne to. — This one, not that one.",
            "Šitų, prašau. — These, please.",
            "Kuris? — Which one?",
            "Kurie? — Which ones?",
            "Tas geresnis. — That one is better.",
            "Šitie tinka. — These are fine / these work.",
          ],
        },
        blocks: [
          {
            id: "s2m3l4_b1",
            type: "learn",
            title: "Choosing and comparing",
            items: [
              { id: "ch1", lt: "Kuris?", en: "Which one?", audioText: "Kuris", saveable: true, core: true },
              { id: "ch2", lt: "Kurie?", en: "Which ones?", audioText: "Kurie", saveable: true, core: true },
              { id: "ch3", lt: "Šito, ne to.", en: "This one, not that one.", audioText: "Šito, ne to", saveable: true, core: true },
              { id: "ch4", lt: "Tas geresnis.", en: "That one is better.", audioText: "Tas geresnis", saveable: true, core: true },
              { id: "ch5", lt: "Šitie tinka.", en: "These are fine.", audioText: "Šitie tinka", saveable: true, core: true },
              { id: "ch6", lt: "Geresnis", en: "Better", audioText: "Geresnis", saveable: true, core: false },
              { id: "ch7", lt: "Batas", en: "Shoe", audioText: "Batas", saveable: true, core: false },
              { id: "ch8", lt: "Striukė", en: "Jacket", audioText: "Striukė", saveable: true, core: false },
              { id: "ch9", lt: "Dydis", en: "Size", audioText: "Dydis", saveable: true, core: false },
            ],
          },
          {
            id: "s2m3l4_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Tas geresnis.", audioText: "Tas geresnis" },
            options: [
              { id: "a", text: "This one is better.", isCorrect: false },
              { id: "b", text: "That one is better.", isCorrect: true },
              { id: "c", text: "These are better.", isCorrect: false },
            ],
          },
          {
            id: "s2m3l4_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A seller shows you multiple items and asks which ones you want." },
            options: [
              { id: "a", text: "Kuris?", isCorrect: false },
              { id: "b", text: "Šitie tinka.", isCorrect: true },
              { id: "c", text: "Kas šitas?", isCorrect: false },
            ],
            feedback: { correct: "Šitie tinka — these are fine / these will do. Natural and practical." },
          },
          {
            id: "s2m3l4_b4",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Šito, ne to.", audioText: "Šito, ne to" },
            options: [
              { id: "a", text: "That one, not this one.", isCorrect: false },
              { id: "b", text: "This one, not that one.", isCorrect: true },
              { id: "c", text: "Neither of these.", isCorrect: false },
            ],
          },
          {
            id: "s2m3l4_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: Which one?",
            targetText: "Kuris?",
            audioText: "Kuris",
          },
          {
  id: "s2m3l4_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a shoe shop comparing two pairs.",
  sceneIntro: "You're at a shoe shop comparing two pairs.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're at a shoe shop comparing two pairs.",
  focus: ["conversation practice"],
  participants: [
    {
      "id": "seller",
      "label": "Seller",
      "name": "Tomas",
      "role": "seller",
      "gender": "male",
      "relationshipToUser": "stranger",
      "register": "polite_service"
    },
  ],
  objects: [
    {
      "id": "card",
      "lt": "kortel?",
      "en": "card",
      "gender": "feminine",
      "number": "singular"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Kurie?",
      supportText: "Which ones?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Šitas geras.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Šitie tinka.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Noriu šitų.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_2",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "O tie? Jie geresni.",
      supportText: "What about those? They're better.",
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
          text: "Šito, ne to.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Taip? Ar galiu pažiūrėti?",
          result: "best",
          progresses: true,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Prašau.",
      supportText: "Here you go.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Tas geresnis. Noriu to.",
          result: "best",
          progresses: true,
        },
        {
          id: "b",
          text: "Ne šito.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
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
      id: "step_4",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Puiku! Ar galima kortele?",
      supportText: "Great! Can you pay by card?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Neturiu kortelės.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip, galima. Turiu kortelę.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Man reikia pagalbos.",
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

      // ── Lesson 5 ────────────────────────────────────────────────────────────
      {
        id: "section_2_module_3_lesson_5",
        code: "2.3.5",
        title: "Pattern to Notice",
        purpose: "Prevent confusion when Lithuanian pointing forms start to vary. Recognition only — not a grammar class.",
        supportLevel: "high",
        newLanguageLoad: "very_low",
        notes: {
          pattern: "Lithuanian this/that changes form. For now: šitas/tas (singular), šitie/tie (plural). Gender and case shift these forms further — just notice it, don't memorise it yet.",
          usage: [
            "šis vyras — this man (formal/written form)",
            "ši kava — this coffee (feminine)",
            "šie bilietai — these tickets (masculine plural)",
            "tos durys — those doors (feminine plural)",
          ],
        },
        blocks: [
          {
            id: "s2m3l5_b1",
            type: "learn",
            title: "Pattern to notice — form shifts",
            items: [
              { id: "pn1", lt: "šis vyras", en: "this man (formal form)", audioText: "šis vyras", saveable: false, core: false },
              { id: "pn2", lt: "ši kava", en: "this coffee (feminine)", audioText: "ši kava", saveable: false, core: false },
              { id: "pn3", lt: "šie bilietai", en: "these tickets", audioText: "šie bilietai", saveable: false, core: false },
              { id: "pn4", lt: "tos durys", en: "those doors", audioText: "tos durys", saveable: false, core: false },
              { id: "pn5", lt: "Šitas / šitie", en: "This / these (everyday speech)", audioText: "Šitas šitie", saveable: false, core: true },
              { id: "pn6", lt: "Tas / tie", en: "That / those (everyday speech)", audioText: "Tas tie", saveable: false, core: true },
            ],
          },
          {
            id: "s2m3l5_b2",
            type: "recognise_mcq",
            noOptionAudio: true,
            title: "Notice the pattern",
            prompt: { text: "You see the word 'šie' in a sentence. What is this form of?" },
            options: [
              { id: "a", text: "That (singular)", isCorrect: false },
              { id: "b", text: "These (plural — a form of šitas)", isCorrect: true },
              { id: "c", text: "Those (plural)", isCorrect: false },
            ],
          },
          {
            id: "s2m3l5_b3",
            type: "recognise_mcq",
            noOptionAudio: true,
            title: "Notice the pattern",
            prompt: { text: "A shopkeeper says 'ši kava'. They're pointing at the coffee next to you. What do they mean?" },
            options: [
              { id: "a", text: "That coffee (far away)", isCorrect: false },
              { id: "b", text: "This coffee (nearby — ši is a form of šitas)", isCorrect: true },
              { id: "c", text: "Those coffees", isCorrect: false },
            ],
          },
          {
            id: "s2m3l5_b4",
            type: "best_response",
            noOptionAudio: true,
            title: "Choose the best response",
            prompt: { text: "You see a new form 'tų' you haven't seen before. Based on what you know, what is it probably related to?" },
            options: [
              { id: "a", text: "Šitas (this)", isCorrect: false },
              { id: "b", text: "Tas / tie (that / those)", isCorrect: true },
              { id: "c", text: "Kuris (which)", isCorrect: false },
            ],
            feedback: { correct: "Tų is a form of tas/tie. You've already seen it in 'Noriu tų' — I want those." },
          },
          {
  id: "s2m3l5_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "A server in a café uses forms you partly recognise.",
  sceneIntro: "A server in a café uses forms you partly recognise.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "A server in a café uses forms you partly recognise.",
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
      speakerText: "Šis stalas laisvas.",
      supportText: "This table is free — šis is a form of šitas.",
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
          text: "Puiku! Ar galime atsisėsti?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Noriu tų.",
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
      speakerText: "Taip, galite.",
      supportText: "Yes, you can.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
          text: "Ačiū!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Man reikia bilieto.",
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

      // ── Checkpoint ──────────────────────────────────────────────────────────
      {
        id: "section_2_module_3_checkpoint",
        code: "2.3.C",
        title: "Checkpoint",
        purpose: "Check you can point, select, and compare using this/that/these/those.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s2m3c_b1",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A shop assistant asks which item you want. You want the one right in front of you." },
            options: [
              { id: "a", text: "To, prašau.", isCorrect: false },
              { id: "b", text: "Šito, prašau.", isCorrect: true },
              { id: "c", text: "Noriu tų.", isCorrect: false },
            ],
            feedback: { correct: "Šito, prašau — this one, for something right in front of you." },
          },
          {
            id: "s2m3c_b2",
            type: "listen_mcq",
            title: "Listen and identify",
            prompt: { text: "Noriu tų.", audioText: "Noriu tų" },
            options: [
              { id: "a", text: "I want this one.", isCorrect: false },
              { id: "b", text: "I want those.", isCorrect: true },
              { id: "c", text: "I want these.", isCorrect: false },
            ],
          },
          {
            id: "s2m3c_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You're shown two options and the one further away looks better to you." },
            options: [
              { id: "a", text: "Šitas geresnis.", isCorrect: false },
              { id: "b", text: "Tas geresnis. To, prašau.", isCorrect: true },
              { id: "c", text: "Šitie tinka.", isCorrect: false },
            ],
            feedback: { correct: "Tas geresnis — that one is better. Then To, prašau to order it." },
          },
          {
            id: "s2m3c_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "These are fine." },
            tokens: [
              { id: "t1", text: "Šitie", correctIndex: 0 },
              { id: "t2", text: "tinka.", correctIndex: 1 },
              { id: "t3", text: "geri.", isDistractor: true },
            ],
            answerText: "Šitie tinka.",
          },
          {
            id: "s2m3c_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: That one is better",
            targetText: "Tas geresnis.",
            audioText: "Tas geresnis",
          },
          {
  id: "s2m3c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're choosing items in a small shop.",
  sceneIntro: "You're choosing items in a small shop.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're choosing items in a small shop.",
  focus: ["conversation practice"],
  participants: [
    {
      "id": "seller",
      "label": "Seller",
      "name": "Tomas",
      "role": "seller",
      "gender": "male",
      "relationshipToUser": "stranger",
      "register": "polite_service"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Ko norite?",
      supportText: "What do you want?",
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
          text: "Noriu šitų, prašau.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Kas šitas?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_2",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Šitų? Ar šito?",
      supportText: "These? Or this one?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Šito, ne šitų.",
          result: "best",
          progresses: true,
        },
        {
          id: "b",
          text: "Noriu to.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Man reikia pagalbos.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Šito? Tai kainuoja du eurus.",
      supportText: "This one? It costs two euros.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Per brangu.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Gerai, ačiū!",
          textEn: "Great, thank you!",
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
          {
            id: "s2m3c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Šitas",           en: "This",                    audioText: "Šitas" },
              { id: "m2",  lt: "Tas",              en: "That",                    audioText: "Tas" },
              { id: "m3",  lt: "Šitie",            en: "These",                   audioText: "Šitie" },
              { id: "m4",  lt: "Tie",              en: "Those",                   audioText: "Tie" },
              { id: "m5",  lt: "Kas šitas?",       en: "What is this?",           audioText: "Kas šitas" },
              { id: "m6",  lt: "Šitas geras.",     en: "This is good.",           audioText: "Šitas geras" },
              { id: "m7",  lt: "Noriu šito.",      en: "I want this one.",        audioText: "Noriu šito" },
              { id: "m8",  lt: "Noriu to.",        en: "I want that one.",        audioText: "Noriu to" },
              { id: "m9",  lt: "To, prašau.",      en: "That one, please.",       audioText: "To, prašau" },
              { id: "m10", lt: "Ne šito.",         en: "Not this one.",           audioText: "Ne šito" },
              { id: "m11", lt: "Noriu šitų.",      en: "I want these.",           audioText: "Noriu šitų" },
              { id: "m12", lt: "Noriu tų.",        en: "I want those.",           audioText: "Noriu tų" },
              { id: "m13", lt: "Šitie geri.",      en: "These are good.",         audioText: "Šitie geri" },
              { id: "m14", lt: "Kuris?",           en: "Which one?",              audioText: "Kuris" },
              { id: "m15", lt: "Kurie?",           en: "Which ones?",             audioText: "Kurie" },
              { id: "m16", lt: "Tas geresnis.",    en: "That one is better.",     audioText: "Tas geresnis" },
              { id: "m17", lt: "Šitie tinka.",     en: "These are fine.",         audioText: "Šitie tinka" },
              { id: "m18", lt: "Šito, ne to.",     en: "This one, not that one.", audioText: "Šito, ne to" },
              { id: "m19", lt: "Geresnis",         en: "Better",                  audioText: "Geresnis" },
              { id: "m20", lt: "Šitų, prašau.",    en: "These, please.",          audioText: "Šitų, prašau" },
            ],
          },
        ],
      },

    ],
  };
}

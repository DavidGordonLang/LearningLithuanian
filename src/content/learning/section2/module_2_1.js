// src/content/learning/section2/module_2_1.js
// Module 2.1 — I Want / I Need / I Have

export default function createModule_2_1(profile = {}) {
  const {
    userNameSafe = "Davidas",
    userFromPhrase = "Aš esu iš Škotijos",
  } = profile;

  return {
    id: "module_2_1",
    code: "2.1",
    title: "I Want / I Need / I Have",
    status: "active",
    lessonCount: 5,
    lessons: [

      // ── Lesson 1 ────────────────────────────────────────────────────────────
      {
        id: "section_2_module_1_lesson_1",
        code: "2.1.1",
        title: "I Want…",
        purpose: "Teach the learner to express simple wants using a reusable first-person frame.",
        supportLevel: "high",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Aš noriu… / Noriu… — 'I want…'. The noun after noriu takes the genitive case — you'll see word endings shift slightly. Treat it as a pattern to get used to, not a rule to memorise.",
          usage: [
            "Noriu kavos — [I] want coffee (in a café; Aš is usually implied)",
            "Noriu vandens — [I] want water",
            "Noriu šito — I want this (pointing at something)",
            "Noriu to — I want that",
            "Ko norėtumėte? — What would you like? (polite service form)",
            "Ko nori? — What do you want? (casual, one person)",
          ],
        },
        blocks: [
          {
            id: "s2m1l1_b1",
            type: "learn",
            title: "I want…",
            items: [
              { id: "w1", lt: "Noriu…", en: "I want…", audioText: "Noriu", saveable: true, core: true },
              { id: "w2", lt: "Noriu kavos.", en: "[I] want coffee.", audioText: "Noriu kavos", saveable: true, core: true },
              { id: "w3", lt: "Noriu vandens.", en: "[I] want water.", audioText: "Noriu vandens", saveable: true, core: true },
              { id: "w4", lt: "Noriu šito.", en: "I want this.", audioText: "Noriu šito", saveable: true, core: true },
              { id: "w5", lt: "Noriu to.", en: "I want that.", audioText: "Noriu to", saveable: true, core: true },
              { id: "w6", lt: "Ko norėtumėte?", en: "What would you like?", audioText: "Ko norėtumėte", saveable: true, core: false },
              { id: "w6b", lt: "Ko nori?", en: "What do you want? (casual)", audioText: "Ko nori", saveable: true, core: false },
              { id: "w7", lt: "Arbata", en: "Tea", audioText: "Arbata", saveable: true, core: false },
              { id: "w8", lt: "Sultys", en: "Juice", audioText: "Sultys", saveable: true, core: false },
              { id: "w9", lt: "Sumuštinis", en: "Sandwich", audioText: "Sumuštinis", saveable: true, core: false },
            ],
          },
          {
            id: "s2m1l1_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Noriu kavos.", audioText: "Noriu kavos" },
            options: [
              { id: "a", text: "I have coffee.", isCorrect: false },
              { id: "b", text: "I want coffee.", isCorrect: true },
              { id: "c", text: "I need coffee.", isCorrect: false },
            ],
          },
          {
            id: "s2m1l1_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Noriu vandens.", audioText: "Noriu vandens" },
            options: [
              { id: "a", text: "I want coffee.", isCorrect: false },
              { id: "b", text: "I want water.", isCorrect: true },
              { id: "c", text: "I want this.", isCorrect: false },
            ],
          },
          {
            id: "s2m1l1_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "I want coffee." },
            tokens: [
              { id: "t1", text: "Noriu", correctIndex: 0 },
              { id: "t2", text: "kavos.", correctIndex: 1 },
              { id: "t3", text: "vandens.", isDistractor: true },
            ],
            answerText: "Noriu kavos.",
          },
          {
            id: "s2m1l1_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I want water",
            targetText: "Noriu vandens.",
            audioText: "Noriu vandens",
          },
          {
  id: "s2m1l1_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a café in Vilnius. A server approaches.",
  sceneIntro: "You're at a café in Vilnius. A server approaches.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You're at a café in Vilnius. A server approaches.",
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
      speakerText: "Laba diena! Ko norėtumėte?",
      supportText: "Good day! What would you like?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Viso gero",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Laba diena! Noriu kavos, prašau.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Aš nesuprantu",
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
      speakerText: "Prašau.",
      supportText: "Here you go.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
          text: "Ačiū labai!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Noriu to",
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
        id: "section_2_module_1_lesson_2",
        code: "2.1.2",
        title: "I Need…",
        purpose: "Teach practical need language. Man reikia pagalbos was introduced in 1.4 — this lesson properly establishes the full man reikia… frame.",
        supportLevel: "high",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Man reikia… — 'I need…'. This doesn't map word-for-word to English, but it's one of the most useful beginner frames. Learn it as a chunk.",
          usage: [
            "Man reikia vandens — I need water",
            "Man reikia pagalbos — I need help (already seen in 1.4 — now you know the frame behind it)",
            "Man reikia bilieto — I need a ticket",
            "Man reikia tualeto — I need a toilet",
            "Ko jums reikia? — What do you need? (what you might hear)",
          ],
        },
        blocks: [
          {
            id: "s2m1l2_b1",
            type: "learn",
            title: "I need…",
            items: [
              { id: "n1", lt: "Man reikia…", en: "I need…", audioText: "Man reikia", saveable: true, core: true },
              { id: "n2", lt: "Man reikia vandens.", en: "I need water.", audioText: "Man reikia vandens", saveable: true, core: true },
              { id: "n3", lt: "Man reikia pagalbos.", en: "I need help.", audioText: "Man reikia pagalbos", saveable: true, core: true },
              { id: "n4", lt: "Man reikia bilieto.", en: "I need a ticket.", audioText: "Man reikia bilieto", saveable: true, core: true },
              { id: "n5", lt: "Man reikia tualeto.", en: "I need a toilet.", audioText: "Man reikia tualeto", saveable: true, core: true },
              { id: "n6", lt: "Bilietas", en: "Ticket", audioText: "Bilietas", saveable: true, core: false },
              { id: "n7", lt: "Vaistai", en: "Medicine / medication", audioText: "Vaistai", saveable: true, core: false },
              { id: "n8", lt: "Pasas", en: "Passport", audioText: "Pasas", saveable: true, core: false },
            ],
          },
          {
            id: "s2m1l2_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Man reikia bilieto.", audioText: "Man reikia bilieto" },
            options: [
              { id: "a", text: "I want a ticket.", isCorrect: false },
              { id: "b", text: "I have a ticket.", isCorrect: false },
              { id: "c", text: "I need a ticket.", isCorrect: true },
            ],
          },
          {
            id: "s2m1l2_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You're at a station and urgently need the toilet. What do you say?" },
            options: [
              { id: "a", text: "Noriu kavos.", isCorrect: false },
              { id: "b", text: "Man reikia tualeto!", isCorrect: true },
              { id: "c", text: "Ačiū labai.", isCorrect: false },
            ],
            feedback: { correct: "Man reikia tualeto — need, not want. The right frame for urgency." },
          },
          {
            id: "s2m1l2_b4",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Man reikia pagalbos.", audioText: "Man reikia pagalbos" },
            options: [
              { id: "a", text: "I want help.", isCorrect: false },
              { id: "b", text: "I need help.", isCorrect: true },
              { id: "c", text: "I have help.", isCorrect: false },
            ],
          },
          {
            id: "s2m1l2_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "I need a ticket." },
            tokens: [
              { id: "t1", text: "Man", correctIndex: 0 },
              { id: "t2", text: "reikia", correctIndex: 1 },
              { id: "t3", text: "bilieto.", correctIndex: 2 },
              { id: "t4", text: "vandens.", isDistractor: true },
            ],
            answerText: "Man reikia bilieto.",
          },
          {
            id: "s2m1l2_b6",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I need help",
            targetText: "Man reikia pagalbos.",
            audioText: "Man reikia pagalbos",
          },
          {
  id: "s2m1l2_b7_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a ticket office at the station.",
  sceneIntro: "You're at a ticket office at the station.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "You're at a ticket office at the station.",
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
      "id": "ticket",
      "lt": "bilietas",
      "en": "ticket",
      "gender": "masculine",
      "number": "singular"
    },
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
          text: "Ne, ačiū",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip! Man reikia bilieto.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Noriu kavos.",
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
      speakerText: "Prašau.",
      supportText: "Here you go.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Man reikia vandens.",
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
          text: "Nesuprantu",
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
      speakerText: "Prašom. Viso gero!",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Taip, prašau",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Viso gero!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Atsiprašau",
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
        id: "section_2_module_1_lesson_3",
        code: "2.1.3",
        title: "I Have / I Don't Have",
        purpose: "Teach basic possession and its negation in practical contexts.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Turiu = I have. Neturiu = I don't have. The negation matters early — it changes what you can do in real situations.",
          usage: [
            "Turiu bilietą — I have a ticket",
            "Neturiu grynųjų — I don't have cash",
            "Pinigai — money",
            "Turiu kortelę — I have a card",
            "Neturiu laiko — I don't have time",
          ],
        },
        blocks: [
          {
            id: "s2m1l3_b1",
            type: "learn",
            title: "I have / I don't have",
            items: [
              { id: "h1", lt: "Turiu…", en: "I have…", audioText: "Turiu", saveable: true, core: true },
              { id: "h2", lt: "Neturiu…", en: "I don't have…", audioText: "Neturiu", saveable: true, core: true },
              { id: "h3", lt: "Turiu bilietą.", en: "I have a ticket.", audioText: "Turiu bilietą", saveable: true, core: true },
              { id: "h4", lt: "Neturiu grynųjų.", en: "I don't have cash.", audioText: "Neturiu grynųjų", saveable: true, core: true },
              { id: "h5", lt: "Turiu kortelę.", en: "I have a card.", audioText: "Turiu kortelę", saveable: true, core: true },
              { id: "h6", lt: "Neturiu laiko.", en: "I don't have time.", audioText: "Neturiu laiko", saveable: true, core: true },
              { id: "h7", lt: "Kortelė", en: "Card (payment)", audioText: "Kortelė", saveable: true, core: false },
              { id: "h8", lt: "Pinigai", en: "Money", audioText: "Pinigai", saveable: true, core: false },
              { id: "h9", lt: "Raktas", en: "Key", audioText: "Raktas", saveable: true, core: false },
              { id: "h10", lt: "Kišenė", en: "Pocket / wallet area", audioText: "Kišenė", saveable: true, core: false },
            ],
          },
          {
            id: "s2m1l3_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Neturiu grynųjų.", audioText: "Neturiu grynųjų" },
            options: [
              { id: "a", text: "I have cash.", isCorrect: false },
              { id: "b", text: "I need cash.", isCorrect: false },
              { id: "c", text: "I don't have cash.", isCorrect: true },
            ],
          },
          {
            id: "s2m1l3_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Turiu kortelę.", audioText: "Turiu kortelę" },
            options: [
              { id: "a", text: "I don't have a card.", isCorrect: false },
              { id: "b", text: "I need a card.", isCorrect: false },
              { id: "c", text: "I have a card.", isCorrect: true },
            ],
          },
          {
            id: "s2m1l3_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone asks if you can pay cash. You only have a card." },
            options: [
              { id: "a", text: "Turiu grynųjų.", isCorrect: false },
              { id: "b", text: "Man reikia pagalbos.", isCorrect: false },
              { id: "c", text: "Neturiu grynųjų, tik kortelę.", isCorrect: true },
            ],
            feedback: { correct: "Neturiu grynųjų, tik kortelę — I don't have cash, only a card. Clear and natural." },
          },
          {
            id: "s2m1l3_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I have a ticket",
            targetText: "Turiu bilietą.",
            audioText: "Turiu bilietą",
          },
          {
            id: "s2m1l3_b6",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I don't have cash",
            targetText: "Neturiu grynųjų.",
            audioText: "Neturiu grynųjų",
          },
          {
  id: "s2m1l3_b7_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a market stall. The seller asks how you're paying.",
  sceneIntro: "You're at a market stall. The seller asks how you're paying.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're at a market stall. The seller asks how you're paying.",
  focus: ["payment"],
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
      "lt": "kortelė",
      "en": "card",
      "gender": "feminine",
      "number": "singular"
    },
    {
      "id": "cash",
      "lt": "grynieji",
      "en": "cash",
      "gender": "masculine",
      "number": "plural"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Ar turite grynųjų?",
      supportText: "Do you have cash?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Noriu šito.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ne, neturiu grynųjų. Ar galima mokėti kortele?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Aš nesuprantu.",
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
      speakerText: "Gerai, galima mokėti kortele.",
      supportText: "Fine, you can pay by card.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Man reikia pagalbos.",
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
          text: "Neturiu laiko.",
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
        id: "section_2_module_1_lesson_4",
        code: "2.1.4",
        title: "Do You Have…?",
        purpose: "Turn possession language into interaction — asking about availability.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Ar turite…? — Do you have…? The ar makes it a yes/no question. Turime = we have. Neturime = we don't.",
          usage: [
            "Ar turite vandens? — Do you have water?",
            "Ar turite kavos? — Do you have coffee?",
            "Ar turite meniu? — Do you have a menu?",
            "Taip, turime. — Yes, we do.",
            "Ne, neturime. — No, we don't.",
          ],
        },
        blocks: [
          {
            id: "s2m1l4_b1",
            type: "learn",
            title: "Do you have…?",
            items: [
              { id: "d1", lt: "Ar turite…?", en: "Do you have…?", audioText: "Ar turite", saveable: true, core: true },
              { id: "d2", lt: "Ar turite vandens?", en: "Do you have water?", audioText: "Ar turite vandens", saveable: true, core: true },
              { id: "d3", lt: "Ar turite kavos?", en: "Do you have coffee?", audioText: "Ar turite kavos", saveable: true, core: true },
              { id: "d4", lt: "Ar turite meniu?", en: "Do you have a menu?", audioText: "Ar turite meniu", saveable: true, core: true },
              { id: "d5", lt: "Taip, turime.", en: "Yes, we do.", audioText: "Taip, turime", saveable: false, core: false },
              { id: "d6", lt: "Ne, neturime.", en: "No, we don't.", audioText: "Ne, neturime", saveable: false, core: false },
              { id: "d7", lt: "Meniu", en: "Menu", audioText: "Meniu", saveable: true, core: false },
              { id: "d8", lt: "Laikraštis", en: "Newspaper", audioText: "Laikraštis", saveable: true, core: false },
              { id: "d9", lt: "Kambario raktas", en: "Room key", audioText: "Kambario raktas", saveable: true, core: false },
            ],
          },
          {
            id: "s2m1l4_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Ar turite meniu?", audioText: "Ar turite meniu" },
            options: [
              { id: "a", text: "I need a menu.", isCorrect: false },
              { id: "b", text: "Do you have a menu?", isCorrect: true },
              { id: "c", text: "I want a menu.", isCorrect: false },
            ],
          },
          {
            id: "s2m1l4_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar turite vandens?", audioText: "Ar turite vandens" },
            options: [
              { id: "a", text: "I need water.", isCorrect: false },
              { id: "b", text: "Do you have water?", isCorrect: true },
              { id: "c", text: "Do you have coffee?", isCorrect: false },
            ],
          },
          {
            id: "s2m1l4_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Do you have coffee?" },
            tokens: [
              { id: "t1", text: "Ar", correctIndex: 0 },
              { id: "t2", text: "turite", correctIndex: 1 },
              { id: "t3", text: "kavos?", correctIndex: 2 },
              { id: "t4", text: "vandens?", isDistractor: true },
            ],
            answerText: "Ar turite kavos?",
          },
          {
            id: "s2m1l4_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You sit down at a restaurant and want to see the menu first." },
            options: [
              { id: "a", text: "Noriu kavos.", isCorrect: false },
              { id: "b", text: "Ar turite meniu?", isCorrect: true },
              { id: "c", text: "Man reikia pagalbos.", isCorrect: false },
            ],
            feedback: { correct: "Ar turite meniu? — natural first question in any restaurant." },
          },
          {
            id: "s2m1l4_b6",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask if they have water",
            targetText: "Ar turite vandens?",
            audioText: "Ar turite vandens",
          },
          {
  id: "s2m1l4_b7_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're in a small café. You want coffee but aren't sure they have it.",
  sceneIntro: "You're in a small café. You want coffee but aren't sure they have it.",
  location: "caf?",
  userRole: "customer",
  register: "polite_service",
  goal: "You're in a small café. You want coffee but aren't sure they have it.",
  focus: ["ordering"],
  participants: [
    {
      "id": "barista",
      "label": "Barista",
      "name": "Ieva",
      "role": "barista",
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
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "barista",
      speakerLabel: "Barista",
      speakerText: "Laba diena!",
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
          text: "Laba diena! Ar turite kavos?",
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
    },
    {
      id: "step_2",
      speakerId: "barista",
      speakerLabel: "Barista",
      speakerText: "Taip, turime.",
      supportText: "Yes, we do.",
      sceneDirection: "The conversation continues.",
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
          text: "Puiku! Noriu kavos.",
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
      speakerId: "barista",
      speakerLabel: "Barista",
      speakerText: "Prašau.",
      supportText: "Here you go.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Man reikia vandens.",
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
          text: "Ačiū labai!",
          result: "best",
          progresses: true,
        }
      ],
    }
  ],
},
        ],
      },

      // ── Checkpoint ──────────────────────────────────────────────────────────
      {
        id: "section_2_module_1_checkpoint",
        code: "2.1.C",
        title: "Checkpoint",
        purpose: "Check you can use all Module 2.1 frames without support.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s2m1c_b1",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You're thirsty and want to order something. What do you say?" },
            options: [
              { id: "a", text: "Turiu bilietą.", isCorrect: false },
              { id: "b", text: "Noriu vandens, prašau.", isCorrect: true },
              { id: "c", text: "Ar turite meniu?", isCorrect: false },
            ],
            feedback: { correct: "Noriu vandens, prašau — direct, natural, and polite." },
          },
          {
            id: "s2m1c_b2",
            type: "listen_mcq",
            title: "Listen and identify",
            prompt: { text: "Man reikia bilieto.", audioText: "Man reikia bilieto" },
            options: [
              { id: "a", text: "I want a ticket.", isCorrect: false },
              { id: "b", text: "I need a ticket.", isCorrect: true },
              { id: "c", text: "I have a ticket.", isCorrect: false },
            ],
          },
          {
            id: "s2m1c_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A cashier asks if you have cash. You don't — only a card." },
            options: [
              { id: "a", text: "Turiu grynųjų.", isCorrect: false },
              { id: "b", text: "Noriu to.", isCorrect: false },
              { id: "c", text: "Neturiu grynųjų, tik kortelę.", isCorrect: true },
            ],
            feedback: { correct: "Neturiu grynųjų, tik kortelę — I don't have cash, only a card." },
          },
          {
            id: "s2m1c_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Do you have a menu?" },
            tokens: [
              { id: "t1", text: "Ar", correctIndex: 0 },
              { id: "t2", text: "turite", correctIndex: 1 },
              { id: "t3", text: "meniu?", correctIndex: 2 },
              { id: "t4", text: "kavos?", isDistractor: true },
            ],
            answerText: "Ar turite meniu?",
          },
          {
            id: "s2m1c_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I need help",
            targetText: "Man reikia pagalbos.",
            audioText: "Man reikia pagalbos",
          },
          {
  id: "s2m1c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a hotel reception. You need a room and have a card to pay.",
  sceneIntro: "You're at a hotel reception. You need a room and have a card to pay.",
  location: "hotel reception",
  userRole: "guest",
  register: "polite_service",
  goal: "You're at a hotel reception. You need a room and have a card to pay.",
  focus: ["payment","directions"],
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
      "id": "card",
      "lt": "kortelė",
      "en": "card",
      "gender": "feminine",
      "number": "singular"
    },
    {
      "id": "cash",
      "lt": "grynieji",
      "en": "cash",
      "gender": "masculine",
      "number": "plural"
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
      speakerText: "Laba diena! Ar galiu jums padėti?",
      supportText: "Good day! Can I help you? Kambarys means room; kambario is the form used in Noriu kambario.",
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
          text: "Taip! Noriu kambario.",
          textEn: "Yes! I want a room.",
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
      speakerText: "Ar turite rezervaciją?",
      supportText: "Do you have a reservation?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Noriu kavos.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ne, neturiu.",
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
    },
    {
      id: "step_3",
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Ar turite grynųjų?",
      supportText: "Do you have cash?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Turiu grynųjų.",
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
          text: "Ne, neturiu grynųjų, tik kortelę.",
          result: "best",
          progresses: true,
        }
      ],
    },
    {
      id: "step_4",
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Gerai, galima mokėti kortele. Prašau.",
      supportText: "Fine, you can pay by card. The receptionist turns the card reader toward you.",
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
          {
            id: "s2m1c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Noriu…",             en: "I want…",                  audioText: "Noriu" },
              { id: "m2",  lt: "Noriu kavos.",        en: "[I] want coffee.",          audioText: "Noriu kavos" },
              { id: "m3",  lt: "Noriu vandens.",      en: "[I] want water.",           audioText: "Noriu vandens" },
              { id: "m4",  lt: "Noriu šito.",         en: "I want this.",              audioText: "Noriu šito" },
              { id: "m5",  lt: "Noriu to.",           en: "I want that.",              audioText: "Noriu to" },
              { id: "m6",  lt: "Man reikia…",         en: "I need…",                  audioText: "Man reikia" },
              { id: "m7",  lt: "Man reikia bilieto.", en: "I need a ticket.",          audioText: "Man reikia bilieto" },
              { id: "m8",  lt: "Man reikia tualeto.", en: "I need a toilet.",          audioText: "Man reikia tualeto" },
              { id: "m9",  lt: "Turiu bilietą.",      en: "I have a ticket.",          audioText: "Turiu bilietą" },
              { id: "m10", lt: "Neturiu grynųjų.",    en: "I don't have cash.",        audioText: "Neturiu grynųjų" },
              { id: "m11", lt: "Turiu kortelę.",      en: "I have a card.",            audioText: "Turiu kortelę" },
              { id: "m12", lt: "Neturiu laiko.",      en: "I don't have time.",        audioText: "Neturiu laiko" },
              { id: "m13", lt: "Ar turite vandens?",  en: "Do you have water?",        audioText: "Ar turite vandens" },
              { id: "m14", lt: "Ar turite kavos?",    en: "Do you have coffee?",       audioText: "Ar turite kavos" },
              { id: "m15", lt: "Ar turite meniu?",    en: "Do you have a menu?",       audioText: "Ar turite meniu" },
              { id: "m16", lt: "Taip, turime.",       en: "Yes, we do.",               audioText: "Taip, turime" },
              { id: "m17", lt: "Ne, neturime.",       en: "No, we don't.",             audioText: "Ne, neturime" },
              { id: "m18", lt: "Bilietas",            en: "Ticket",                    audioText: "Bilietas" },
              { id: "m19", lt: "Kortelė",             en: "Card (payment)",            audioText: "Kortelė" },
              { id: "m20", lt: "Ko norėtumėte?",      en: "What would you like?",      audioText: "Ko norėtumėte" },
            ],
          },
        ],
      },

    ],
  };
}

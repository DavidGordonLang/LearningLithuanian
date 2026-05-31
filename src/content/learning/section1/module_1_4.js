// src/content/learning/section1/module_1_4.js
// Module 1.4 — Help and Contact
// Factory function — receives profile for personalised scenario options

export default function createModule_1_4(profile = {}) {
  const {
    userNameSafe = "Davidas",
    userFromPhrase = "Aš esu iš Škotijos",
    userFromCountryLabelEn = "Scotland",
  } = profile;

  return {
    id: "module_1_4",
    code: "1.4",
    title: "Help and Contact",
    status: "active",
    lessonCount: 6,
    lessons: [

      // ── Lesson 1 ────────────────────────────────────────────────────────────
      {
        id: "section_1_module_4_lesson_1",
        code: "1.4.1",
        title: "Can You Help Me?",
        purpose: "Teach direct help-seeking language. Properly introduces 'Ar galiu jums padėti?' which appeared with helper text in Module 1.3 scenarios.",
        supportLevel: "high",
        newLanguageLoad: "low",
        notes: {
          pattern: "Ar galite…? is the polite plural/formal frame for asking someone to do something. You'll use it constantly.",
          usage: [
            "Ar galite man padėti? — Can you help me? (polite, to a stranger or staff)",
            "Padėkite man, prašau — Help me, please (more direct but still polite)",
            "Man reikia pagalbos — I need help (stating the need)",
            "Ar galiu jums padėti? — Can I help you? (what staff will say to you — now you know what it means)",
          ],
        },
        blocks: [
          {
            id: "s1m4l1_b1",
            type: "learn",
            title: "Asking for help",
            items: [
              { id: "h1", lt: "Ar galite man padėti?", en: "Can you help me?", audioText: "Ar galite man padėti", saveable: true, core: true },
              { id: "h2", lt: "Padėkite man, prašau", en: "Help me, please", audioText: "Padėkite man, prašau", saveable: true, core: true },
              { id: "h3", lt: "Man reikia pagalbos", en: "I need help", audioText: "Man reikia pagalbos", saveable: true, core: true },
              { id: "h4", lt: "Ar galiu jums padėti?", en: "Can I help you?", audioText: "Ar galiu jums padėti", saveable: true, core: true },
              { id: "h5", lt: "Pagalba", en: "Help", audioText: "Pagalba", saveable: true, core: false },
            ],
          },
          {
            id: "s1m4l1_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Ar galite man padėti?", audioText: "Ar galite man padėti" },
            options: [
              { id: "a", text: "Can I help you?", isCorrect: false },
              { id: "b", text: "Can you help me?", isCorrect: true },
              { id: "c", text: "I need help", isCorrect: false },
            ],
          },
          {
            id: "s1m4l1_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Man reikia pagalbos", audioText: "Man reikia pagalbos" },
            options: [
              { id: "a", text: "Can you help me?", isCorrect: false },
              { id: "b", text: "Help me, please", isCorrect: false },
              { id: "c", text: "I need help", isCorrect: true },
            ],
          },
          {
            id: "s1m4l1_b4",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Ar galiu jums padėti?", audioText: "Ar galiu jums padėti" },
            options: [
              { id: "a", text: "I need help", isCorrect: false },
              { id: "b", text: "Can I help you?", isCorrect: true },
              { id: "c", text: "Help me, please", isCorrect: false },
            ],
          },
          {
            id: "s1m4l1_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You've lost your wallet and need to get someone's attention." },
            options: [
              { id: "a", text: "Ačiū labai!", isCorrect: false },
              { id: "b", text: "Aš nesuprantu", isCorrect: false },
              { id: "c", text: "Atsiprašau, man reikia pagalbos!", isCorrect: true },
            ],
            feedback: { correct: "Atsiprašau to get attention, then man reikia pagalbos — exactly right." },
          },
          {
            id: "s1m4l1_b6",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask someone if they can help you",
            targetText: "Ar galite man padėti?",
            audioText: "Ar galite man padėti",
          },
          {
            id: "s1m4l1_b7",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "I need help" },
            tokens: [
              { id: "t1", text: "Man", correctIndex: 0 },
              { id: "t2", text: "reikia", correctIndex: 1 },
              { id: "t3", text: "pagalbos", correctIndex: 2 },
              { id: "t4", text: "padėti", isDistractor: true },
            ],
            answerText: "Man reikia pagalbos",
          },
          {
  id: "s1m4l1_b8_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're lost in Vilnius and need help from a passer-by.",
  sceneIntro: "You're lost in Vilnius and need help from a passer-by.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You're lost in Vilnius and need help from a passer-by.",
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
      speakerText: "Ar galiu jums padėti?",
      supportText: "They're asking if they can help you — this is your chance!",
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
          text: "Taip, man reikia pagalbos",
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
      speakerText: "Taip, žinoma.",
      supportText: "They said yes, of course.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Ačiū labai!",
          result: "best",
          progresses: true,
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
          text: "Prašau kalbėkite lėčiau",
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
        id: "section_1_module_4_lesson_2",
        code: "1.4.2",
        title: "What Is This? Is That…?",
        purpose: "Extend pointing language from Module 1.3. Kas tai/kas ten already taught — this lesson adds the confirmation form Ar tai…? / Ar ten…?",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Kas tai? asks what something is. Ar tai…? checks if your guess is right. Both are immediately useful.",
          usage: [
            "Kas tai? — What is this? (already known from 1.3)",
            "Kas ten? — What is that? (already known from 1.3)",
            "Ar tai tualetas? — Is this the toilet?",
            "Ar tai restoranas? — Is this a restaurant?",
            "Ar ten parduotuvė? — Is that a shop?",
            "Taip, tai… — Yes, it's…",
            "Ne, tai… — No, it's…",
          ],
        },
        blocks: [
          {
            id: "s1m4l2_b1",
            type: "learn",
            title: "Confirming what something is",
            items: [
              { id: "c1", lt: "Ar tai…?", en: "Is this…?", audioText: "Ar tai", saveable: true, core: true },
              { id: "c2", lt: "Ar ten…?", en: "Is that…?", audioText: "Ar ten", saveable: true, core: true },
              { id: "c3", lt: "Ar tai tualetas?", en: "Is this the toilet?", audioText: "Ar tai tualetas", saveable: true, core: true },
              { id: "c4", lt: "Ar ten restoranas?", en: "Is that a restaurant?", audioText: "Ar ten restoranas", saveable: true, core: true },
              { id: "c5", lt: "Restoranas", en: "Restaurant", audioText: "Restoranas", saveable: true, core: false },
              { id: "c6", lt: "Parduotuvė", en: "Shop / Store", audioText: "Parduotuvė", saveable: true, core: false },
              { id: "c7", lt: "Taip, tai…", en: "Yes, it's…", audioText: "Taip, tai", saveable: false, core: false },
              { id: "c8", lt: "Ne, tai…", en: "No, it's…", audioText: "Ne, tai", saveable: false, core: false },
            ],
          },
          {
            id: "s1m4l2_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Ar tai restoranas?", audioText: "Ar tai restoranas" },
            options: [
              { id: "a", text: "What is that restaurant?", isCorrect: false },
              { id: "b", text: "Is that a restaurant?", isCorrect: false },
              { id: "c", text: "Is this a restaurant?", isCorrect: true },
            ],
          },
          {
            id: "s1m4l2_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar ten parduotuvė?", audioText: "Ar ten parduotuvė" },
            options: [
              { id: "a", text: "Is this a shop?", isCorrect: false },
              { id: "b", text: "What is in that shop?", isCorrect: false },
              { id: "c", text: "Is that a shop?", isCorrect: true },
            ],
          },
          {
            id: "s1m4l2_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You see a sign on a door but you're not sure if it's the restaurant you're looking for." },
            options: [
              { id: "a", text: "Kas tai?", isCorrect: false },
              { id: "b", text: "Ar tai restoranas?", isCorrect: true },
              { id: "c", text: "Ką tai reiškia?", isCorrect: false },
            ],
            feedback: { correct: "Ar tai restoranas? — you're checking your guess, not just asking what it is." },
          },
          {
            id: "s1m4l2_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask if this is a restaurant",
            targetText: "Ar tai restoranas?",
            audioText: "Ar tai restoranas",
          },
          {
            id: "s1m4l2_b6",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Is that a shop?" },
            tokens: [
              { id: "t1", text: "Ar", correctIndex: 0 },
              { id: "t2", text: "ten", correctIndex: 1 },
              { id: "t3", text: "parduotuvė?", correctIndex: 2 },
              { id: "t4", text: "tai", isDistractor: true },
            ],
            answerText: "Ar ten parduotuvė?",
          },
          {
  id: "s1m4l2_b7_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're on a street in Vilnius looking for a restaurant. A local catches your eye.",
  sceneIntro: "You're on a street in Vilnius looking for a restaurant. A local catches your eye.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You're on a street in Vilnius looking for a restaurant. A local catches your eye.",
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
      speakerText: "Ar galiu jums padėti?",
      supportText: "They can see you're looking for something and offer to help.",
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
          text: "Viso gero!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Taip! Ar ten restoranas?",
          result: "best",
          progresses: true,
        }
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Ne, tai parduotuvė.",
      supportText: "No, that's a shop.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Taip, suprantu.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Prašau kalbėkite lėčiau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Ačiū! Kur yra restoranas?",
          result: "best",
          progresses: true,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Restoranas yra ten.",
      supportText: "They point down the street — the restaurant is over there.",
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
          text: "Ne, ačiū.",
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

      // ── Lesson 3 ────────────────────────────────────────────────────────────
      {
        id: "section_1_module_4_lesson_3",
        code: "1.4.3",
        title: "Where Is…?",
        purpose: "Introduce Kur yra…? as a reusable location question frame. Places kept tight — tualetas, stotis, autobusų stotelė. New nouns added naturally.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Kur yra…? is one of the most reusable frames in Lithuanian. Learn the frame, then slot in any place.",
          usage: [
            "Kur yra tualetas? — Where is the toilet?",
            "Kur yra stotis? — Where is the station?",
            "Kur yra autobusų stotelė? — Where is the bus stop?",
            "Kur yra viešbutis? — Where is the hotel?",
            "Kur yra bankas? — Where is the bank?",
            "Ten — there",
            "Va ten — over there (more definite, often with pointing)",
            "Čia — Here",
          ],
        },
        blocks: [
          {
            id: "s1m4l3_b1",
            type: "learn",
            title: "Asking where things are",
            items: [
              { id: "w1", lt: "Kur yra tualetas?", en: "Where is the toilet?", audioText: "Kur yra tualetas", saveable: true, core: true },
              { id: "w2", lt: "Kur yra stotis?", en: "Where is the station?", audioText: "Kur yra stotis", saveable: true, core: true },
              { id: "w3", lt: "Kur yra autobusų stotelė?", en: "Where is the bus stop?", audioText: "Kur yra autobusų stotelė", saveable: true, core: true },
              { id: "w4", lt: "Kur yra viešbutis?", en: "Where is the hotel?", audioText: "Kur yra viešbutis", saveable: true, core: true },
              { id: "w5", lt: "Kur yra bankas?", en: "Where is the bank?", audioText: "Kur yra bankas", saveable: true, core: true },
              { id: "w6", lt: "Viešbutis", en: "Hotel", audioText: "Viešbutis", saveable: true, core: false },
              { id: "w7", lt: "Bankas", en: "Bank", audioText: "Bankas", saveable: true, core: false },
              { id: "w8", lt: "Ten", en: "There", audioText: "Ten", saveable: false, core: false },
              { id: "w9", lt: "Va ten", en: "Over there", audioText: "Va ten", saveable: false, core: false },
              { id: "w10", lt: "Čia", en: "Here", audioText: "Čia", saveable: false, core: false },
            ],
          },
          {
            id: "s1m4l3_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kur yra stotis?", audioText: "Kur yra stotis" },
            options: [
              { id: "a", text: "Where is the hotel?", isCorrect: false },
              { id: "b", text: "Where is the bus stop?", isCorrect: false },
              { id: "c", text: "Where is the station?", isCorrect: true },
            ],
          },
          {
            id: "s1m4l3_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kur yra autobusų stotelė?", audioText: "Kur yra autobusų stotelė" },
            options: [
              { id: "a", text: "Where is the station?", isCorrect: false },
              { id: "b", text: "Where is the bus stop?", isCorrect: true },
              { id: "c", text: "Where is the hotel?", isCorrect: false },
            ],
          },
          {
            id: "s1m4l3_b4",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kur yra bankas?", audioText: "Kur yra bankas" },
            options: [
              { id: "a", text: "Where is the shop?", isCorrect: false },
              { id: "b", text: "Where is the restaurant?", isCorrect: false },
              { id: "c", text: "Where is the bank?", isCorrect: true },
            ],
          },
          {
            id: "s1m4l3_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask where the hotel is",
            targetText: "Kur yra viešbutis?",
            audioText: "Kur yra viešbutis",
          },
          {
            id: "s1m4l3_b6",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Where is the bank?" },
            tokens: [
              { id: "t1", text: "Kur", correctIndex: 0 },
              { id: "t2", text: "yra", correctIndex: 1 },
              { id: "t3", text: "bankas?", correctIndex: 2 },
              { id: "t4", text: "viešbutis?", isDistractor: true },
            ],
            answerText: "Kur yra bankas?",
          },
          {
  id: "s1m4l3_b7_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You've just arrived in Vilnius by train and need to find your hotel.",
  sceneIntro: "You've just arrived in Vilnius by train and need to find your hotel. A local woman notices you looking at your map.",
  location: "street near the station",
  userRole: "guest",
  register: "polite_service",
  goal: "You've just arrived in Vilnius by train and need to find your hotel.",
  focus: ["directions"],
  participants: [
    {
      "id": "receptionist",
      "label": "Local",
      "name": "Aust?ja",
      "role": "local resident",
      "gender": "female",
      "relationshipToUser": "stranger",
      "register": "polite_neutral"
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
      speakerId: "receptionist",
      speakerLabel: "Local",
      speakerText: "Ar galiu jums padėti?",
      supportText: "They're asking if they can help.",
      sceneDirection: "A local woman stops beside you and offers help.",
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
          text: "Taip! Kur yra viešbutis?",
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
      speakerId: "receptionist",
      speakerLabel: "Local",
      speakerText: "Viešbutis yra ten, prie stoties.",
      supportText: "They said: The hotel is over there, near the station.",
      sceneDirection: "She points down the street toward the hotel.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Prašau kalbėkite lėčiau",
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
          text: "Ar tai viešbutis?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "receptionist",
      speakerLabel: "Local",
      speakerText: "Prašom.",
      supportText: "You're welcome.",
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
          text: "Man reikia pagalbos",
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
        id: "section_1_module_4_lesson_4",
        code: "1.4.4",
        title: "Can I…? / Can We…?",
        purpose: "Introduce Ar galiu? and Ar galime? as reusable permission and coordination frames.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Ar galiu…? (can I?) and Ar galime…? (can we?) are hugely reusable frames. Slot in different actions and you have dozens of useful questions.",
          usage: [
            "Ar galiu? — Can I?",
            "Ar galime? — Can we?",
            "Ar galiu čia atsisėsti? — Can I sit here?",
            "Ar galime pradėti? — Can we start?",
            "Ar galiu čia sustoti? — Can I stop here?",
            "Taip, prašau — Yes, please (the reply you'll hear)",
          ],
        },
        blocks: [
          {
            id: "s1m4l4_b1",
            type: "learn",
            title: "Can I…? Can we…?",
            items: [
              { id: "g1", lt: "Ar galiu?", en: "Can I?", audioText: "Ar galiu", saveable: true, core: true },
              { id: "g2", lt: "Ar galime?", en: "Can we?", audioText: "Ar galime", saveable: true, core: true },
              { id: "g3", lt: "Ar galiu čia atsisėsti?", en: "Can I sit here?", audioText: "Ar galiu čia atsisėsti", saveable: true, core: true },
              { id: "g4", lt: "Ar galime pradėti?", en: "Can we start?", audioText: "Ar galime pradėti", saveable: true, core: true },
              { id: "g5", lt: "Ar galiu čia sustoti?", en: "Can I stop here?", audioText: "Ar galiu čia sustoti", saveable: true, core: false },
            ],
          },
          {
            id: "s1m4l4_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Ar galiu čia atsisėsti?", audioText: "Ar galiu čia atsisėsti" },
            options: [
              { id: "a", text: "Can we sit here?", isCorrect: false },
              { id: "b", text: "Is there a seat here?", isCorrect: false },
              { id: "c", text: "Can I sit here?", isCorrect: true },
            ],
          },
          {
            id: "s1m4l4_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar galime pradėti?", audioText: "Ar galime pradėti" },
            options: [
              { id: "a", text: "Can I start?", isCorrect: false },
              { id: "b", text: "Can we start?", isCorrect: true },
              { id: "c", text: "Can we stop?", isCorrect: false },
            ],
          },
          {
            id: "s1m4l4_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You're at a café and spot an empty chair at a table where someone is sitting." },
            options: [
              { id: "a", text: "Ar galime pradėti?", isCorrect: false },
              { id: "b", text: "Ar galiu čia atsisėsti?", isCorrect: true },
              { id: "c", text: "Man reikia pagalbos", isCorrect: false },
            ],
            feedback: { correct: "Ar galiu čia atsisėsti? — polite and exactly right in this situation." },
          },
          {
            id: "s1m4l4_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask if you can sit here",
            targetText: "Ar galiu čia atsisėsti?",
            audioText: "Ar galiu čia atsisėsti",
          },
          {
            id: "s1m4l4_b6",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Can we start?" },
            tokens: [
              { id: "t1", text: "Ar", correctIndex: 0 },
              { id: "t2", text: "galime", correctIndex: 1 },
              { id: "t3", text: "pradėti?", correctIndex: 2 },
              { id: "t4", text: "galiu", isDistractor: true },
            ],
            answerText: "Ar galime pradėti?",
          },
          {
  id: "s1m4l4_b7_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a busy café in Vilnius and need to find a seat.",
  sceneIntro: "You're at a busy café in Vilnius and need to find a seat.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You're at a busy café in Vilnius and need to find a seat.",
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
  objects: [
    {
      "id": "coffee",
      "lt": "kava",
      "en": "coffee",
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
      speakerText: "Laba diena!",
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
          text: "Laba diena!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Ačiū",
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
      speakerText: "Ar galiu jums padėti?",
      supportText: "They're asking if they can help you.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Taip! Ar galiu čia atsisėsti?",
          result: "best",
          progresses: true,
        },
        {
          id: "b",
          text: "Ar galime pradėti?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Man reikia pagalbos",
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
      speakerText: "Taip, prašau.",
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
          text: "Ačiū labai!",
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
      id: "step_4",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Ar norite kavos?",
      supportText: "They're asking if you'd like coffee.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Kur yra tualetas?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Aš nesuprantu",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Taip, prašau!",
          result: "best",
          progresses: true,
        }
      ],
    }
  ],
},
        ],
      },

      // ── Lesson 5 ────────────────────────────────────────────────────────────
      {
        id: "section_1_module_4_lesson_5",
        code: "1.4.5",
        title: "Tu and Jūs — A Pattern to Notice",
        purpose: "Recognition only. Stop learners being confused when they see two versions of 'you' — not mastery, just awareness.",
        supportLevel: "high",
        newLanguageLoad: "very_low",
        notes: {
          pattern: "Tu is informal — friends, family, peers. Jūs is polite or plural — strangers, staff, older people, more than one person. When in doubt, use jūs.",
          usage: [
            "tu — you (one person, informal)",
            "jūs — you (polite, or more than one person)",
            "Koks tavo vardas? — What's your name? (tu form — casual)",
            "Koks jūsų vardas? — What's your name? (jūs form — polite)",
            "Ar tu kalbi angliškai? — Do you speak English? (casual)",
            "Ar jūs kalbate angliškai? — Do you speak English? (polite — what you've been learning)",
          ],
        },
        blocks: [
          {
            id: "s1m4l5_b1",
            type: "learn",
            title: "Two ways to say 'you'",
            items: [
              { id: "y1", lt: "Tu", en: "You (informal — friend, peer)", audioText: "Tu", saveable: false, core: true },
              { id: "y2", lt: "Jūs", en: "You (polite or plural)", audioText: "Jūs", saveable: false, core: true },
              { id: "y3", lt: "Koks tavo vardas?", en: "What's your name? (informal)", audioText: "Koks tavo vardas", saveable: false, core: false },
              { id: "y4", lt: "Koks jūsų vardas?", en: "What's your name? (polite)", audioText: "Koks jūsų vardas", saveable: false, core: false },
              { id: "y5", lt: "Ar jūs kalbate angliškai?", en: "Do you speak English? (polite — what you've been learning)", audioText: "Ar jūs kalbate angliškai", saveable: false, core: false },
            ],
          },
          {
            id: "s1m4l5_b2",
            type: "recognise_mcq",
            title: "Tu or jūs?",
            prompt: { text: "You're asking a shop assistant for help. Which form should you use?" },
            options: [
              { id: "a", text: "Tu", isCorrect: false },
              { id: "b", text: "Jūs", isCorrect: true },
              { id: "c", text: "Either — it doesn't matter", isCorrect: false },
            ],
            feedback: { correct: "Jūs — the safe polite form with anyone you don't know well." },
          },
          {
            id: "s1m4l5_b3",
            type: "recognise_mcq",
            title: "Tu or jūs?",
            prompt: { text: "You're chatting with a Lithuanian friend your own age. Which form would they likely use with you?" },
            options: [
              { id: "a", text: "Jūs", isCorrect: false },
              { id: "b", text: "Tu", isCorrect: true },
              { id: "c", text: "Either — it doesn't matter", isCorrect: false },
            ],
            feedback: { correct: "Tu — the informal form between friends and peers your own age." },
          },
          {
            id: "s1m4l5_b4",
            type: "best_response",
            title: "Which is the polite version?",
            prompt: { text: "You want to ask someone's name politely — which do you use?" },
            options: [
              { id: "a", text: "Koks tavo vardas?", isCorrect: false },
              { id: "b", text: "Koks jūsų vardas?", isCorrect: true },
              { id: "c", text: "Kas tavo vardas?", isCorrect: false },
            ],
            feedback: { correct: "Koks jūsų vardas? — jūs form, right for any formal or unfamiliar situation." },
          },
          {
            id: "s1m4l5_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You've been learning 'Ar jūs kalbate angliškai?' — why jūs and not tu here?" },
            noOptionAudio: true,
            options: [
              { id: "a", text: "Tu is harder to pronounce", isCorrect: false },
              { id: "b", text: "You're usually asking a stranger, so jūs is right", isCorrect: true },
              { id: "c", text: "They mean the same thing", isCorrect: false },
            ],
            feedback: { correct: "Exactly — you'd normally ask a stranger if they speak English, so jūs is the right choice." },
          },
          {
  id: "s1m4l5_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "A Lithuanian colleague introduces you to two different people — notice how the language shifts.",
  sceneIntro: "A Lithuanian colleague introduces you to two different people — notice how the language shifts.",
  location: "work conversation",
  userRole: "colleague",
  register: "polite_friendly",
  goal: "A Lithuanian colleague introduces you to two different people — notice how the language shifts.",
  focus: ["numbers"],
  participants: [
    {
      "id": "colleague",
      "label": "Colleague",
      "name": "Rokas",
      "role": "colleague",
      "gender": "male",
      "relationshipToUser": "colleague",
      "register": "polite_friendly"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "colleague",
      speakerLabel: "Colleague",
      speakerText: "Labas! Koks tavo vardas?",
      supportText: "They're using tu — this is a casual, friendly greeting.",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Koks jūsų vardas?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: `Labas! Mano vardas ${userNameSafe}.`,
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
      speakerId: "colleague",
      speakerLabel: "Colleague",
      speakerText: "Laba diena. Koks jūsų vardas?",
      supportText: "Same question — but now they're using jūs. This person is more formal.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Iki!",
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
          text: `Laba diena. Mano vardas ${userNameSafe}.`,
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
        id: "section_1_module_4_checkpoint",
        code: "1.4.C",
        title: "Checkpoint",
        purpose: "Check you can use Module 1.4 language in real situations without support.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          // Situational choice — help-seeking
          {
            id: "s1m4c_b1",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You drop your bag in the street and things fall everywhere. A passer-by stops and catches your attention." },
            options: [
              { id: "a", text: "Ar galiu čia atsisėsti?", isCorrect: false },
              { id: "b", text: "Man reikia pagalbos!", isCorrect: true },
              { id: "c", text: "Kur yra stotis?", isCorrect: false },
            ],
            feedback: { correct: "Man reikia pagalbos — direct and clear for an urgent situation." },
          },
          // Listen — Ar galite man padėti?
          {
            id: "s1m4c_b2",
            type: "listen_mcq",
            title: "Listen and identify",
            prompt: { text: "Ar galite man padėti?", audioText: "Ar galite man padėti" },
            options: [
              { id: "a", text: "Can I help you?", isCorrect: false },
              { id: "b", text: "I need help", isCorrect: false },
              { id: "c", text: "Can you help me?", isCorrect: true },
            ],
          },
          // Ar tai / Ar ten distinction
          {
            id: "s1m4c_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You can see a building in the distance and want to check if it's the station." },
            options: [
              { id: "a", text: "Ar tai stotis?", isCorrect: false },
              { id: "b", text: "Kas tai?", isCorrect: false },
              { id: "c", text: "Ar ten stotis?", isCorrect: true },
            ],
            feedback: { correct: "Ar ten…? for something in the distance. Ar tai…? for something right in front of you." },
          },
          // Build — Kur yra viešbutis
          {
            id: "s1m4c_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Where is the hotel?" },
            tokens: [
              { id: "t1", text: "Kur", correctIndex: 0 },
              { id: "t2", text: "yra", correctIndex: 1 },
              { id: "t3", text: "viešbutis?", correctIndex: 2 },
              { id: "t4", text: "bankas?", isDistractor: true },
            ],
            answerText: "Kur yra viešbutis?",
          },
          // Tu vs Jūs — formal context
          {
            id: "s1m4c_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You're asking an elderly woman on the street for directions. Which do you use?" },
            options: [
              { id: "a", text: "Tu", isCorrect: false },
              { id: "b", text: "Jūs", isCorrect: true },
              { id: "c", text: "Either — it doesn't matter", isCorrect: false },
            ],
            feedback: { correct: "Jūs — always the right choice with strangers. Tu is for friends and peers." },
          },
          // Speak
          {
            id: "s1m4c_b6",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask where the bus stop is",
            targetText: "Kur yra autobusų stotelė?",
            audioText: "Kur yra autobusų stotelė",
          },
          // Scenario — full help interaction
          {
  id: "s1m4c_b7_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You've just arrived in Vilnius and need to find the bank. A local stops to help.",
  sceneIntro: "You've just arrived in Vilnius and need to find the bank. A local stops to help.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You've just arrived in Vilnius and need to find the bank. A local stops to help.",
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
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Laba diena! Ar galiu jums padėti?",
      supportText: "They're greeting you and offering help.",
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
          text: "Taip! Kur yra bankas?",
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
      speakerText: "Bankas yra ten, prie stoties.",
      supportText: "The bank is over there, near the station.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Prašau kalbėkite lėčiau",
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
          text: "Man reikia pagalbos",
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
      speakerText: "Prašom. Viso gero!",
      supportText: "You're welcome. Goodbye!",
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
          text: "Atsiprašau",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Viso gero!",
          result: "best",
          progresses: true,
        }
      ],
    }
  ],
},
          // Word match — 20 pairs covering all of module 1.4
          {
            id: "s1m4c_b8",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Ar galite man padėti?",    en: "Can you help me?",         audioText: "Ar galite man padėti" },
              { id: "m2",  lt: "Padėkite man, prašau",     en: "Help me, please",           audioText: "Padėkite man, prašau" },
              { id: "m3",  lt: "Man reikia pagalbos",       en: "I need help",               audioText: "Man reikia pagalbos" },
              { id: "m4",  lt: "Ar galiu jums padėti?",    en: "Can I help you?",           audioText: "Ar galiu jums padėti" },
              { id: "m5",  lt: "Pagalba",                  en: "Help",                      audioText: "Pagalba" },
              { id: "m6",  lt: "Ar tai…?",                 en: "Is this…?",                 audioText: "Ar tai" },
              { id: "m7",  lt: "Ar ten…?",                 en: "Is that…?",                 audioText: "Ar ten" },
              { id: "m8",  lt: "Restoranas",               en: "Restaurant",                audioText: "Restoranas" },
              { id: "m9",  lt: "Parduotuvė",               en: "Shop / Store",              audioText: "Parduotuvė" },
              { id: "m10", lt: "Kur yra tualetas?",        en: "Where is the toilet?",      audioText: "Kur yra tualetas" },
              { id: "m11", lt: "Kur yra stotis?",          en: "Where is the station?",     audioText: "Kur yra stotis" },
              { id: "m12", lt: "Kur yra autobusų stotelė?", en: "Where is the bus stop?",   audioText: "Kur yra autobusų stotelė" },
              { id: "m13", lt: "Viešbutis",                en: "Hotel",                     audioText: "Viešbutis" },
              { id: "m14", lt: "Bankas",                   en: "Bank",                      audioText: "Bankas" },
              { id: "m15", lt: "Ar galiu?",                en: "Can I?",                    audioText: "Ar galiu" },
              { id: "m16", lt: "Ar galime?",               en: "Can we?",                   audioText: "Ar galime" },
              { id: "m17", lt: "Ar galiu čia atsisėsti?",  en: "Can I sit here?",           audioText: "Ar galiu čia atsisėsti" },
              { id: "m18", lt: "Ar galime pradėti?",       en: "Can we start?",             audioText: "Ar galime pradėti" },
              { id: "m19", lt: "Tu",                       en: "You (informal)",            audioText: "Tu" },
              { id: "m20", lt: "Jūs",                      en: "You (polite / plural)",     audioText: "Jūs" },
            ],
          },
        ],
      },

    ],
  };
}

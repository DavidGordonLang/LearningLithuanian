// src/content/learning/section4/module_4_3.js
// Module 4.3 — Preferences and Problems

export default function createModule_4_3(profile = {}) {
  const { userNameSafe = "Davidas", speakerGender = "male" } = profile;
  const isMale = speakerGender !== "female";
  const vegetarX = isMale ? "vegetaras" : "vegetarė";
  const vegetarXEn = isMale ? "I am vegetarian. (male)" : "I am vegetarian. (female)";

  return {
    id: "module_4_3",
    code: "4.3",
    title: "Preferences and Problems",
    status: "active",
    lessonCount: 5,
    lessons: [

      // ── Lesson 1 — I Don't Want… ──────────────────────────────────────────────
      {
        id: "section_4_module_3_lesson_1",
        code: "4.3.1",
        title: "I Don't Want…",
        purpose: "Give the learner simple refusal and preference language — practical and polite.",
        supportLevel: "high",
        newLanguageLoad: "low",
        notes: {
          pattern: "Nenoriu… is the negative of Noriu… — just add ne- to the front. Nenoriu šito — I don't want this.",
          usage: [
            "Nenoriu šito — I don't want this",
            "Nenoriu to — I don't want that",
          ],
        },
        blocks: [
          {
            id: "s4m3l1_b1",
            type: "learn",
            title: "Refusing and preferring",
            items: [
              { id: "rf1", lt: "Nenoriu…", en: "I don't want…", audioText: "Nenoriu", saveable: true, core: true },
              { id: "rf2", lt: "Nenoriu šito.", en: "I don't want this.", audioText: "Nenoriu šito", saveable: true, core: true },
              { id: "rf3", lt: "Nenoriu to.", en: "I don't want that.", audioText: "Nenoriu to", saveable: true, core: true },
            ],
          },
          {
            id: "s4m3l1_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Nenoriu šito.", audioText: "Nenoriu šito" },
            options: [
              { id: "a", text: "I want this.", isCorrect: false },
              { id: "b", text: "I don't want that.", isCorrect: false },
              { id: "c", text: "I don't want this.", isCorrect: true },
            ],
          },
          {
            id: "s4m3l1_b3",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I don't want this",
            targetText: "Nenoriu šito",
            audioText: "Nenoriu šito",
          },
          {
            id: "s4m3l1_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Staff asks: Ar su cukrumi? You don't take sugar." },
            options: [
              { id: "a", text: "Taip, su cukrumi.", isCorrect: false },
              { id: "b", text: "Ne, be cukraus, prašau.", isCorrect: true },
              { id: "c", text: "Ar galėčiau gauti sąskaitą, prašau?", isCorrect: false },
            ],
            feedback: { correct: "Ne, be cukraus, prašau — No, without sugar, please. Polite and clear." },
          },
                    {
  id: "s4m3l1_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You order tea and then decline something you don't want.",
  sceneIntro: "You order tea and then decline something you don't want.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You order tea and then decline something you don't want.",
  focus: ["ordering"],
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
      sceneDirection: "The coffee is noticeably cold when it arrives.",
      learnerPrompt: "Accept the coffee for now.",
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
          text: "Laba diena! Norėčiau arbatos, prašau.",
          textEn: "Good day! I would like tea, please.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Norėčiau arbatos, prašau.","result":"acceptable","feedback":"Natural and polite without repeating the greeting.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Žinoma. Su cukrumi?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
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
          text: "Ne, be cukraus, prašau.",
          textEn: "No, without sugar, please.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Kiek tai kainuoja?",
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
      speakerText: "Ar norėtumėte šito?",
      sceneDirection: "The server points to a slice of cake beside your tea.",
      learnerPrompt: "Decline it politely.",
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
          text: "Ne, ačiū. Nenoriu šito.",
          textEn: "No, thank you. I don't want this.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Kiek tai kainuoja?",
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
      speakerText: "Gerai. Viso gero!",
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
        },
        {
          id: "c",
          text: "Prašau kalbėkite lėčiau.",
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

      // ── Lesson 2 — I Don't Eat… ───────────────────────────────────────────────
      {
        id: "section_4_module_3_lesson_2",
        code: "4.3.2",
        title: "I Don't Eat…",
        purpose: "Give the learner basic dietary restriction language — practical, not a vocabulary dump.",
        supportLevel: "high",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Nevalgau mėsos — I don't eat meat. Nevalgau follows the same ne- pattern as Nenoriu. Mėsa (meat) you already know from Section 2. Vegetaras (m) / vegetarė (f) — the form changes for gender, just as with alkanas/alkana.",
          usage: [
            "Nevalgau mėsos — I don't eat meat",
            "Aš vegetaras — I am vegetarian (male)",
            "Aš vegetarė — I am vegetarian (female)",
            "Be mėsos, prašau — without meat, please",
          ],
        },
        blocks: [
          {
            id: "s4m3l2_b1",
            type: "learn",
            title: "Dietary preferences",
            items: [
              { id: "dp1", lt: "Nevalgau mėsos.", en: "I don't eat meat.", audioText: "Nevalgau mėsos", saveable: true, core: true },
              { id: "dp2", lt: `Aš ${vegetarX}.`, en: vegetarXEn, audioText: `Aš ${vegetarX}`, saveable: true, core: true },
              { id: "dp4", lt: "Be mėsos, prašau.", en: "Without meat, please.", audioText: "Be mėsos, prašau", saveable: true, core: true },
              { id: "dp5", lt: "Ar valgote mėsą?", en: "Do you eat meat?", audioText: "Ar valgote mėsą", saveable: false, core: false },
              { id: "noun_salotos", lt: "salotos", en: "salad", audioText: "salotos", saveable: true, core: false },
            ],
          },
          {
            id: "s4m3l2_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Nevalgau mėsos.", audioText: "Nevalgau mėsos" },
            options: [
              { id: "a", text: "I don't eat fish.", isCorrect: false },
              { id: "b", text: "I don't eat meat.", isCorrect: true },
              { id: "c", text: "I want meat.", isCorrect: false },
            ],
          },
          {
            id: "s4m3l2_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            noOptionAudio: true,
            prompt: { text: `Aš ${vegetarX}.`, audioText: `Aš ${vegetarX}` },
            options: [
              { id: "a", text: "I don't eat meat.", isCorrect: false },
              { id: "b", text: vegetarXEn, isCorrect: true },
              { id: "c", text: "Without meat, please.", isCorrect: false },
            ],
          },
          {
            id: "s4m3l2_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I don't eat meat",
            targetText: "Nevalgau mėsos",
            audioText: "Nevalgau mėsos",
          },
                    {
  id: "s4m3l2_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "A waiter asks about your dietary preferences. You don't eat meat.",
  sceneIntro: "A waiter asks about your dietary preferences. You don't eat meat.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "A waiter asks about your dietary preferences. You don't eat meat.",
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
          text: "Laba diena! Norėčiau sriubos, prašau.",
          textEn: "Good day! I would like soup, please.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Norėčiau sriubos, prašau.","result":"acceptable","feedback":"Natural and polite without repeating the greeting.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Žinoma. Ar valgote mėsą?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      help: {
        levels: [
          { sceneDirection: "She points to the meat option on the menu.", speakerText: "Mėsą?" },
          { sceneDirection: "She points to the meat dish and then to you as a question." },
          { speakerText: "Do you eat meat?", spokenLanguage: "en", audio: false },
        ],
      },
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
          text: `Ne, nevalgau mėsos. Aš ${vegetarX}.`,
          textEn: "No, I don't eat meat. I'm vegetarian.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Kiek tai kainuoja?","result":"wrong","feedback":"This does not answer the speaker here.","progresses":false},
      ],
    },
    {
      id: "step_3",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Gerai, be mėsos.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "Ačiū! Kiek tai kainuoja?",
          textEn: "Thank you! How much is it?",
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
        {"id":"z","text":"Kiek tai kainuoja?","result":"wrong","feedback":"This does not answer the speaker here.","progresses":false},
      ],
    },
    {
      id: "step_4",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Šeši eurai. Grynaisiais ar kortele?",
      sceneDirection: "You want to pay in cash.",
      learnerPrompt: "Choose cash.",
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
          text: "Kortele, prašau.",
          textEn: "By card, please.",
          result: "wrong",
          feedback: "The scene says you want to pay in cash.",
          progresses: false,
        },
        {
          id: "c",
          text: "Per brangu.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ,
        {"id":"cash","text":"Grynaisiais, prašau.","result":"best","progresses":true},
      ],
    }
  ],
},
        ],
      },

      // ── Lesson 3 — This Is Not What I Ordered ────────────────────────────────
      {
        id: "section_4_module_3_lesson_3",
        code: "4.3.3",
        title: "This Is Not What I Ordered",
        purpose: "Give the learner calm, direct correction language for a simple order mistake.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Čia ne tai, ką užsisakiau — This is not what I ordered. A longer phrase but very useful. Aš užsisakiau… (I ordered…) lets you say what you actually asked for.",
          usage: [
            "Čia ne tai, ką užsisakiau — This is not what I ordered",
            "Aš užsisakiau kavą — I ordered coffee",
            "Aš užsisakiau arbatą — I ordered tea",
            "Ne šitą — Not this one",
          ],
        },
        blocks: [
          {
            id: "s4m3l3_b1",
            type: "learn",
            title: "Correcting an order mistake",
            items: [
              { id: "co1", lt: "Čia ne tai, ką užsisakiau.", en: "This is not what I ordered.", audioText: "Čia ne tai, ką užsisakiau", saveable: true, core: true },
              { id: "co2", lt: "Aš užsisakiau kavos.", en: "I ordered coffee.", audioText: "Aš užsisakiau kavą", saveable: true, core: true },
              { id: "co3", lt: "Aš užsisakiau arbatos.", en: "I ordered tea.", audioText: "Aš užsisakiau arbatą", saveable: true, core: true },
              { id: "co4", lt: "Ne šitą.", en: "Not this one.", audioText: "Ne šitą", saveable: true, core: true },
              { id: "co5", lt: "Ne tą.", en: "Not that one.", audioText: "Ne tą", saveable: true, core: true },
            ],
          },
          {
            id: "s4m3l3_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Čia ne tai, ką užsisakiau.", audioText: "Čia ne tai, ką užsisakiau" },
            options: [
              { id: "a", text: "Can you bring another one?", isCorrect: false },
              { id: "b", text: "This is not what I ordered.", isCorrect: true },
              { id: "c", text: "I ordered coffee.", isCorrect: false },
            ],
          },
          {
            id: "s4m3l3_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A waiter brings you tea but you ordered coffee. What do you say?" },
            options: [
              { id: "a", text: "Nenoriu šito.", isCorrect: false },
              { id: "b", text: "Čia ne tai, ką užsisakiau. Aš užsisakiau kavos.", isCorrect: true },
              { id: "c", text: "Ar galėčiau gauti sąskaitą, prašau?", isCorrect: false },
            ],
            feedback: { correct: "Čia ne tai, ką užsisakiau. Aš užsisakiau kavą — This is not what I ordered. I ordered coffee. Calm and clear." },
          },
          {
            id: "s4m3l3_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "This is not what I ordered." },
            tokens: [
              { id: "t1", text: "Čia", correctIndex: 0 },
              { id: "t2", text: "ne", correctIndex: 1 },
              { id: "t3", text: "tai,", correctIndex: 2 },
              { id: "t4", text: "ką", correctIndex: 3 },
              { id: "t5", text: "užsisakiau", correctIndex: 4 },
              { id: "t6", text: "šito", isDistractor: true },
              { id: "t7", text: "noriu", isDistractor: true },
            ],
            answerText: "Čia ne tai, ką užsisakiau",
          },
                    {
  id: "s4m3l3_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "A waiter brings the wrong drink. You correct it politely and confirm what you ordered.",
  sceneIntro: "A waiter brings the wrong drink. You correct it politely and confirm what you ordered.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "A waiter brings the wrong drink. You correct it politely and confirm what you ordered.",
  focus: ["ordering"],
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
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Prašom. Arbata su pienu.",
      sceneDirection: "The exchange begins.",
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
          text: "Atsiprašau — čia ne tai, ką užsisakiau. Aš užsisakiau kavos.",
          textEn: "Sorry — this is not what I ordered. I ordered coffee.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Labai gerai!",
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
      speakerText: "Labai atsiprašau. Kavos?",
      sceneDirection: "The server checks that coffee is what you wanted.",
      learnerPrompt: "Confirm the coffee and milk.",
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
          text: "Taip, kavos su pienu.",
          textEn: "Yes, coffee with milk.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Kiek tai kainuoja?","result":"wrong","feedback":"This does not answer the speaker here.","progresses":false},
      ],
    },
    {
      id: "step_3",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Žinoma. Prašom.",
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
          text: "Ačiū labai!",
          textEn: "Thank you very much!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Kiek tai kainuoja?",
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
      speakerText: "Ar viskas gerai?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
                {
          id: "b",
          text: "Taip, labai gerai! Ačiū.",
          textEn: "Yes, very good! Thank you.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Per karšta.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ,
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A simple thank-you is also natural.","progresses":true},
      ],
    }
  ],
},
        ],
      },

      // ── Lesson 4 — Can You Change It? ────────────────────────────────────────
      {
        id: "section_4_module_3_lesson_4",
        code: "4.3.4",
        title: "Can You Change It?",
        purpose: "Move from identifying a problem to asking for a fix — simple correction and replacement language.",
        supportLevel: "medium",
        newLanguageLoad: "low_to_medium",
        notes: {
          pattern: "Ar galite pakeisti? reuses the Ar galite frame from Section 2 with pakeisti (to change/swap). Kitą, prašau — Another one, please — is the simplest option.",
          usage: [
            "Ar galite pakeisti? — Can you change it?",
            "Ar galite atnešti kitą? — Can you bring another one?",
            "Kitą, prašau — Another one, please",
          ],
        },
        blocks: [
          {
            id: "s4m3l4_b1",
            type: "learn",
            title: "Asking for a correction",
            items: [
              { id: "cr1", lt: "Ar galite pakeisti?", en: "Can you change it?", audioText: "Ar galite pakeisti", saveable: true, core: true },
              { id: "cr2", lt: "Ar galite atnešti kitą?", en: "Can you bring another one?", audioText: "Ar galite atnešti kitą", saveable: true, core: true },
              { id: "cr3", lt: "Kitą, prašau.", en: "Another one, please.", audioText: "Kitą, prašau", saveable: true, core: true },
              { id: "cr4", lt: "Noriu šito vietoj to.", en: "I want this instead of that.", audioText: "Noriu šito vietoj to", saveable: true, core: false },
            ],
          },
          {
            id: "s4m3l4_b2",
            type: "recognise_mcq",
            noOptionAudio: true,
            title: "Choose the correct meaning",
            prompt: { text: "Ar galite pakeisti?", audioText: "Ar galite pakeisti" },
            options: [
              { id: "a", text: "Can I pay by card?", isCorrect: false },
              { id: "b", text: "Can you change it?", isCorrect: true },
              { id: "c", text: "Can you repeat that?", isCorrect: false },
            ],
          },
          {
            id: "s4m3l4_b3",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask for a correction: Can you change it?",
            targetText: "Ar galite pakeisti",
            audioText: "Ar galite pakeisti",
          },
          {
            id: "s4m3l4_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You ordered soup. When it arrives, you notice a hair in it. How do you ask the waiter to bring another one?" },
            options: [
              { id: "a", text: "Viso gero.", isCorrect: false },
              { id: "b", text: "Ar galite atnešti kitą?", isCorrect: true },
              { id: "c", text: "Kiek tai kainuoja?", isCorrect: false },
            ],
            feedback: { correct: "Ar galite atnešti kitą? — Can you bring another one? A natural request when you need a replacement." },
          },
                    {
            id: "s4m3l4_b5_v2",
            type: "scenario_v2",
            title: "Conversation",
            description: "You ordered soup. When it arrives, you notice a hair in it. Ask politely for a replacement, then finish the interaction naturally.",
            sceneIntro: "You ordered soup. When it arrives, you notice a hair in it. Ask politely for a replacement, then finish the interaction naturally.",
            location: "restaurant",
            userRole: "customer",
            register: "polite_service",
            goal: "Ask politely for a replacement when there is a problem with what you were served.",
            focus: ["Ar galite pakeisti?", "Ar galite atnešti kitą?", "Kitą, prašau"],
            participants: [
              {
                id: "server",
                label: "Server",
                name: "Rasa",
                role: "server",
                gender: "female",
                relationshipToUser: "stranger",
                register: "polite_service",
              },
            ],
            objects: [
              {
                id: "soup",
                lt: "sriuba",
                en: "soup",
                gender: "feminine",
                number: "singular",
              },
            ],
            steps: [
              {
                id: "step_1",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Prašom. Sriuba.",
                sceneDirection: "You notice a hair in the soup, so you do not want to keep this bowl.",
                learnerPrompt: "Ask politely if the server can bring another one.",
                options: [
                  {
                    id: "a",
                    text: "Atsiprašau. Ar galite atnešti kitą?",
                    textEn: "Sorry. Can you bring another one?",
                    result: "best",
                    progresses: true,
                  },
                  {
                    id: "b",
                    text: "Ar galite pakeisti?",
                    textEn: "Can you change it?",
                    result: "acceptable",
                    feedback: "Also natural. Ar galite atnešti kitą? is more specific when you want another one brought.",
                    progresses: true,
                  },
                  {
                    id: "c",
                    text: "Ačiū!",
                    result: "wrong",
                    feedback: "There is a problem with the soup, so accepting it does not fit the scene.",
                    progresses: false,
                  },
                ],
              },
              {
                id: "step_2",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Labai atsiprašau. Žinoma. Prašom.",
                sceneDirection: "Rasa takes the first bowl away and brings you a fresh bowl of soup.",
                learnerPrompt: "Thank her for replacing it.",
                options: [
                  { id: "a", text: "Ačiū labai!", result: "best", progresses: true },
                  { id: "b", text: "Ačiū!", result: "acceptable", feedback: "A simple thank-you is completely natural here.", progresses: true },
                  { id: "c", text: "Ar galite pakeisti?", result: "wrong", feedback: "She has already replaced it.", progresses: false },
                ],
              },
              {
                id: "step_3",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Ar dar ko nors?",
                sceneDirection: "Later, you have finished the replacement soup and are ready to pay.",
                learnerPrompt: "Say no thanks and ask for the bill.",
                options: [
                  { id: "a", text: "Ne, ačiū. Sąskaitą, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Sąskaitą, prašau.", result: "acceptable", feedback: "Shorter, but still natural in this context.", progresses: true },
                  { id: "c", text: "Dar vieną, prašau.", result: "wrong", feedback: "You have finished and are ready to pay.", progresses: false },
                ],
              },
              {
                id: "step_4",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Aštuoni eurai. Grynaisiais ar kortele?",
                sceneDirection: "You have both cash and a card, so either payment method is fine.",
                learnerPrompt: "Choose how you want to pay.",
                options: [
                  { id: "a", text: "Grynaisiais, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Kortele, prašau.", result: "best", progresses: true },
                  { id: "c", text: "Per brangu.", result: "wrong", feedback: "You have already finished the meal and are paying the bill.", progresses: false },
                ],
              },
            ],
          },
        ],
      },

      // ── Lesson 5 — Too Cold / Too Hot / Not Good ──────────────────────────────
      {
        id: "section_4_module_3_lesson_5",
        code: "4.3.5",
        title: "Too Cold / Too Hot / Not Good",
        purpose: "Give the learner simple reaction language — practical complaints without escalation.",
        supportLevel: "low",
        newLanguageLoad: "low",
        notes: {
          pattern: "Per… means 'too…' and goes before describing words: per šalta (too cold), per karšta (too hot), per brangu (too expensive — you already know this one from Section 3). Nelabai gerai is softer than 'not good' and sounds more natural.",
          usage: [
            "Per šalta — too cold",
            "Per karšta — too hot",
            "Nelabai gerai — not very good",
            "Labai gerai — very good",
            "Gerai — OK / fine (already known)",
          ],
        },
        blocks: [
          {
            id: "s4m3l5_b1",
            type: "learn",
            title: "Reactions to food and drink",
            items: [
              { id: "rx2", lt: "Per šalta.", en: "Too cold.", audioText: "Per šalta", saveable: true, core: true },
              { id: "rx1", lt: "Per karšta.", en: "Too hot.", audioText: "Per karšta", saveable: true, core: true },
              { id: "rx3", lt: "Nelabai gerai.", en: "Not very good.", audioText: "Nelabai gerai", saveable: true, core: true },
              { id: "rx4", lt: "Labai gerai.", en: "Very good.", audioText: "Labai gerai", saveable: true, core: true },
            ],
          },
          {
            id: "s4m3l5_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Per šalta.", audioText: "Per šalta" },
            options: [
              { id: "a", text: "Too cold.", isCorrect: true },
              { id: "b", text: "Not very good.", isCorrect: false },
              { id: "c", text: "Too hot.", isCorrect: false },
            ],
          },
          {
            id: "s4m3l5_b3",
            type: "recognise_mcq",
            noOptionAudio: true,
            title: "Choose the correct meaning",
            prompt: { text: "Nelabai gerai.", audioText: "Nelabai gerai" },
            options: [
              { id: "a", text: "Very good.", isCorrect: false },
              { id: "b", text: "Not very good.", isCorrect: true },
              { id: "c", text: "Too cold.", isCorrect: false },
            ],
          },
          {
            id: "s4m3l5_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Describe: too cold",
            targetText: "Per šalta",
            audioText: "Per šalta",
          },
                    {
            id: "s4m3l5_b5_v2",
            type: "scenario_v2",
            title: "Conversation",
            description: "Your coffee arrives. Thank the server, then notice it is too cold. Explain the problem, ask for another one after the server apologises, then ask for the bill and pay.",
            sceneIntro: "Your coffee arrives. Thank the server, then notice it is too cold. Explain the problem, ask for another one after the server apologises, then ask for the bill and pay.",
            location: "café",
            userRole: "customer",
            register: "polite_service",
            goal: "Move naturally from receiving the coffee to noticing it is too cold, requesting a replacement, and paying.",
            focus: ["Per šalta", "Ar galite atnešti kitą?", "Sąskaitą, prašau", "payment"],
            participants: [
              {
                id: "server",
                label: "Server",
                name: "Rasa",
                role: "server",
                gender: "female",
                relationshipToUser: "stranger",
                register: "polite_service",
              },
            ],
            objects: [
              {
                id: "coffee",
                lt: "kava",
                en: "coffee",
                gender: "feminine",
                number: "singular",
              },
            ],
            steps: [
              {
                id: "step_1",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Prašom. Kava su pienu.",
                sceneDirection: "Rasa brings the coffee you ordered.",
                learnerPrompt: "Thank her for the coffee.",
                options: [
                  { id: "a", text: "Ačiū!", result: "best", progresses: true },
                  { id: "b", text: "Kiek tai kainuoja?", result: "wrong", feedback: "First acknowledge the coffee Rasa has just brought.", progresses: false },
                  { id: "c", text: "Viso gero.", result: "wrong", feedback: "The café interaction is not finished.", progresses: false },
                ],
              },
              {
                id: "step_2",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Ar viskas gerai?",
                sceneDirection: "You take a sip and notice that the coffee is too cold.",
                learnerPrompt: "Tell Rasa that it is too cold.",
                options: [
                  { id: "a", text: "Nelabai — per šalta.", textEn: "Not really — too cold.", result: "best", progresses: true },
                  { id: "b", text: "Per šalta.", textEn: "Too cold.", result: "acceptable", feedback: "Direct and clear. Nelabai softens the complaint a little.", progresses: true },
                  { id: "c", text: "Taip, labai gerai!", result: "wrong", feedback: "The coffee is too cold, so this does not fit the situation.", progresses: false },
                ],
              },
              {
                id: "step_3",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Labai atsiprašau.",
                sceneDirection: "Rasa apologises for the cold coffee.",
                learnerPrompt: "Ask if she can bring another one.",
                options: [
                  { id: "a", text: "Ar galite atnešti kitą?", textEn: "Can you bring another one?", result: "best", progresses: true },
                  { id: "b", text: "Ar galite pakeisti?", textEn: "Can you change it?", result: "acceptable", feedback: "Also natural. Ar galite atnešti kitą? specifically asks for another one.", progresses: true },
                  { id: "c", text: "Ačiū labai.", result: "wrong", feedback: "Rasa has apologised, but you still need to ask for the replacement.", progresses: false },
                ],
              },
              {
                id: "step_4",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Žinoma. Prašom.",
                sceneDirection: "Rasa takes the cold coffee away and returns a moment later with a hot replacement.",
                learnerPrompt: "Thank her for the replacement.",
                options: [
                  { id: "a", text: "Ačiū labai!", result: "best", progresses: true },
                  { id: "b", text: "Gerai, ačiū.", result: "acceptable", feedback: "Also natural here.", progresses: true },
                  { id: "c", text: "Ar galite pakeisti?", result: "wrong", feedback: "She has already replaced the coffee.", progresses: false },
                ],
              },
              {
                id: "step_5",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Ar dar ko nors norėtumėte?",
                sceneDirection: "The replacement coffee is good, and you are ready to pay.",
                learnerPrompt: "Say no thanks and ask for the bill.",
                options: [
                  { id: "a", text: "Ne, ačiū. Sąskaitą, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Sąskaitą, prašau.", result: "acceptable", feedback: "Shorter, but still natural in this context.", progresses: true },
                  { id: "c", text: "Dar vieną, prašau.", result: "wrong", feedback: "You do not want anything else; you are ready to pay.", progresses: false },
                ],
              },
              {
                id: "step_6",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Aštuoni eurai. Grynaisiais ar kortele?",
                sceneDirection: "You have both cash and a card, so either payment method is fine.",
                learnerPrompt: "Choose how you want to pay.",
                options: [
                  { id: "a", text: "Grynaisiais, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Kortele, prašau.", result: "best", progresses: true },
                  { id: "c", text: "Per brangu.", result: "wrong", feedback: "You have finished the coffee and are paying the bill.", progresses: false },
                ],
              },
            ],
          },
        ],
      },

      // ── Module 4.3 Checkpoint ─────────────────────────────────────────────────
      {
        id: "section_4_module_3_checkpoint",
        code: "4.3.C",
        title: "Preferences and Problems",
        purpose: "Check you can refuse, state a preference, flag a problem, and ask for a correction.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s4m3c_b1",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Staff asks: Ar su cukrumi? You don't want sugar." },
            options: [
              { id: "a", text: "Taip, su cukrumi.", isCorrect: false },
              { id: "b", text: "Ne, be cukraus, prašau.", isCorrect: true },
              { id: "c", text: "Ar galėčiau gauti sąskaitą, prašau?", isCorrect: false },
            ],
            feedback: { correct: "Ne, be cukraus, prašau — No, without sugar, please." },
          },
          {
            id: "s4m3c_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Nevalgau mėsos.", audioText: "Nevalgau mėsos" },
            options: [
              { id: "a", text: "I don't want meat.", isCorrect: false },
              { id: "b", text: "I don't eat meat.", isCorrect: true },
              { id: "c", text: "Without meat, please.", isCorrect: false },
            ],
          },
          {
            id: "s4m3c_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Čia ne tai, ką užsisakiau.", audioText: "Čia ne tai, ką užsisakiau" },
            options: [
              { id: "a", text: "Can you change it?", isCorrect: false },
              { id: "b", text: "I don't want this.", isCorrect: false },
              { id: "c", text: "This is not what I ordered.", isCorrect: true },
            ],
          },
          {
            id: "s4m3c_b4",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Ar galite pakeisti?", audioText: "Ar galite pakeisti" },
            options: [
              { id: "a", text: "Can you repeat that?", isCorrect: false },
              { id: "b", text: "Can you change it?", isCorrect: true },
              { id: "c", text: "Can I pay by card?", isCorrect: false },
            ],
          },
          {
            id: "s4m3c_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Your coffee is too cold. What do you say?" },
            options: [
              { id: "a", text: "Nelabai gerai.", isCorrect: false },
              { id: "b", text: "Per šalta.", isCorrect: true },
              { id: "c", text: "Per karšta.", isCorrect: false },
            ],
            feedback: { correct: "Per šalta — Too cold. Direct and clear." },
          },
          {
            id: "s4m3c_b6",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "This is not what I ordered." },
            tokens: [
              { id: "t1", text: "Čia", correctIndex: 0 },
              { id: "t2", text: "ne", correctIndex: 1 },
              { id: "t3", text: "tai,", correctIndex: 2 },
              { id: "t4", text: "ką", correctIndex: 3 },
              { id: "t5", text: "užsisakiau", correctIndex: 4 },
              { id: "t6", text: "noriu", isDistractor: true },
              { id: "t7", text: "šito", isDistractor: true },
            ],
            answerText: "Čia ne tai, ką užsisakiau",
          },
          {
            id: "s4m3c_b7",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I don't eat meat",
            targetText: "Nevalgau mėsos",
            audioText: "Nevalgau mėsos",
          },
          {
            id: "s4m3c_b8",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask for a correction: Can you change it?",
            targetText: "Ar galite pakeisti",
            audioText: "Ar galite pakeisti",
          },
                    {
  id: "s4m3c_b9_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "A full café visit with a problem to solve — wrong order, temperature complaint, and payment.",
  sceneIntro: "A full café visit with a problem to solve — wrong order, temperature complaint, and payment.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "A full café visit with a problem to solve — wrong order, temperature complaint, and payment.",
  focus: ["ordering","payment"],
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
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Laba diena! Ko norėtumėte?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "Laba diena! Norėčiau arbatos su citrina, prašau.",
          textEn: "Good day! I would like tea with lemon, please.",
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
        {"id":"z","text":"Norėčiau arbatos su citrina, prašau.","result":"acceptable","feedback":"Natural and polite without repeating the greeting.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Prašom. Kava.",
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
          text: "Atsiprašau — čia ne tai, ką užsisakiau. Aš užsisakiau arbatos. Ar galite pakeisti?",
          textEn: "Sorry — this is not what I ordered. I ordered tea. Can you change it?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Per karšta.",
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
      speakerText: "Labai atsiprašau! Prašom — arbata su citrina. Ar viskas gerai?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Taip, labai gerai!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Nelabai — per šalta.",
          textEn: "Not really — too cold.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Kiek tai kainuoja?","result":"wrong","feedback":"This does not answer the speaker here.","progresses":false},
      ],
    },
    {
      id: "step_4",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Atsiprašau. Prašom — karšta arbata.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Ar galite pakeisti?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Labai gerai! Ačiū. Sąskaitą, prašau.",
          textEn: "Very good! Thank you. The bill, please.",
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
    },
    {
      id: "step_5",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Žinoma. Šeši eurai. Grynaisiais ar kortele?",
      sceneDirection: "You have both cash and a card, so either payment method is fine.",
      learnerPrompt: "Choose how you want to pay.",
      options: [
                {"id":"b","text":"Kortele, prašau.","textEn":"By card, please.","result":"best","progresses":true},
        {
          id: "c",
          text: "Per brangu.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ,
        {"id":"cash","text":"Grynaisiais, prašau.","result":"best","progresses":true},
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
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ačiū labai! Viso gero!",
          textEn: "Thank you very much! Goodbye!",
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
          {
            id: "s4m3c_b10",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Nenoriu šito.",               en: "I don't want this.",            audioText: "Nenoriu šito" },
              { id: "m2",  lt: "Nenoriu to.",                  en: "I don't want that.",            audioText: "Nenoriu to" },
              { id: "m3",  lt: "Be pieno, prašau.",            en: "Without milk, please.",         audioText: "Be pieno, prašau" },
              { id: "m4",  lt: "Be cukraus, prašau.",          en: "Without sugar, please.",        audioText: "Be cukraus, prašau" },
              { id: "m5",  lt: "Nevalgau mėsos.",              en: "I don't eat meat.",             audioText: "Nevalgau mėsos" },
              { id: "m6",  lt: "Aš vegetaras.",                en: "I am vegetarian. (male)",       audioText: "Aš vegetaras" },
              { id: "m7",  lt: "Aš vegetarė.",                 en: "I am vegetarian. (female)",     audioText: "Aš vegetarė" },
              { id: "m8",  lt: "Be mėsos, prašau.",            en: "Without meat, please.",         audioText: "Be mėsos, prašau" },
              { id: "m9",  lt: "Čia ne tai, ką užsisakiau.",     en: "This is not what I ordered.",   audioText: "Čia ne tai, ką užsisakiau" },
              { id: "m10", lt: "Aš užsisakiau kavos.",            en: "I ordered coffee.",             audioText: "Aš užsisakiau kavą" },
              { id: "m11", lt: "Aš užsisakiau arbatos.",          en: "I ordered tea.",                audioText: "Aš užsisakiau arbatą" },
              { id: "m12", lt: "Ne šitą.",                     en: "Not this one.",                 audioText: "Ne šitą" },
              { id: "m13", lt: "Ar galite pakeisti?",          en: "Can you change it?",            audioText: "Ar galite pakeisti" },
              { id: "m14", lt: "Ar galite atnešti kitą?",      en: "Can you bring another one?",    audioText: "Ar galite atnešti kitą" },
              { id: "m15", lt: "Kitą, prašau.",                en: "Another one, please.",          audioText: "Kitą, prašau" },
              { id: "m16", lt: "Per karšta.",                  en: "Too hot.",                      audioText: "Per karšta" },
              { id: "m17", lt: "Per šalta.",                   en: "Too cold.",                     audioText: "Per šalta" },
              { id: "m18", lt: "Nelabai gerai.",               en: "Not very good.",                audioText: "Nelabai gerai" },
              { id: "m19", lt: "Labai gerai.",                 en: "Very good.",                    audioText: "Labai gerai" },
              { id: "m20", lt: "salotos",                      en: "salad",                         audioText: "salotos" },
            ],
          },
        ],
      },
    ],
  };
}

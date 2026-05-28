// src/content/learning/section3/module_3_2.js
// Module 3.2 — Prices and Paying

export default function createModule_3_2(profile = {}) {
  const { userNameSafe = "Davidas" } = profile;

  return {
    id: "module_3_2",
    code: "3.2",
    title: "Prices and Paying",
    status: "active",
    lessonCount: 5,
    lessons: [

      // ── Lesson 1 — How Much Is It? ──────────────────────────────────────────
      {
        id: "section_3_module_2_lesson_1",
        code: "3.2.1",
        title: "How Much Is It?",
        purpose: "Teach the core price-question phrase and its variants.",
        supportLevel: "high",
        newLanguageLoad: "low",
        notes: {
          pattern: "Kiek tai kainuoja? is the most useful price question you'll learn. Kiek means 'how much / how many' and kainuoja means 'costs'. You already know šitas and tas from Section 2 — they slot straight in here.",
          usage: [
            "Kiek tai kainuoja? — how much does this cost?",
            "Kiek šitas kainuoja? — how much does this one cost?",
            "Kiek tas kainuoja? — how much does that one cost?",
          ],
        },
        blocks: [
          {
            id: "s3m2l1_b1",
            type: "learn",
            title: "Asking the price",
            items: [
              { id: "pq1", lt: "Kiek tai kainuoja?",   en: "How much does this cost?",       audioText: "Kiek tai kainuoja",   saveable: true, core: true },
              { id: "pq2", lt: "Kiek šitas kainuoja?", en: "How much does this one cost?",   audioText: "Kiek šitas kainuoja", saveable: true, core: true },
              { id: "pq3", lt: "Kiek tas kainuoja?",   en: "How much does that one cost?",   audioText: "Kiek tas kainuoja",   saveable: true, core: true },
              { id: "noun_knyga", lt: "knyga", en: "book", audioText: "knyga", core: false, saveable: true },
            ],
          },
          {
            id: "s3m2l1_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kiek tai kainuoja?", audioText: "Kiek tai kainuoja" },
            options: [
              { id: "a", text: "Where is it?", isCorrect: false },
              { id: "b", text: "How much does this cost?", isCorrect: true },
              { id: "c", text: "Do you have this?", isCorrect: false },
            ],
          },
          {
            id: "s3m2l1_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kiek tas kainuoja?", audioText: "Kiek tas kainuoja" },
            options: [
              { id: "a", text: "How much does this one cost?", isCorrect: false },
              { id: "b", text: "How much does that one cost?", isCorrect: true },
              { id: "c", text: "Do you have that?", isCorrect: false },
            ],
          },
          {
            id: "s3m2l1_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: how much does this cost?",
            targetText: "Kiek tai kainuoja?",
            audioText: "Kiek tai kainuoja",
          },
          {
            id: "s3m2l1_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "How much does this one cost?" },
            tokens: [
              { id: "t1", text: "Kiek",      correctIndex: 0 },
              { id: "t2", text: "šitas",     correctIndex: 1 },
              { id: "t3", text: "kainuoja?", correctIndex: 2 },
              { id: "t4", text: "tas",       isDistractor: true },
            ],
            answerText: "Kiek šitas kainuoja?",
          },
          {
  id: "s3m2l1_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're browsing a market stall. You want to know the price of a book.",
  sceneIntro: "You're browsing a market stall. You want to know the price of a book.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're browsing a market stall. You want to know the price of a book.",
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
  steps: [
    {
      id: "step_1",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Laba diena!",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Kiek tai kainuoja?",
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
          text: "Nesuprantu",
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
      speakerText: "Dešimt eurų.",
      supportText: "Ten euros.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
          text: "Gerai, ačiū!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Ar jūs kalbate angliškai?",
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

      // ── Lesson 2 — It Costs… ─────────────────────────────────────────────────
      {
        id: "section_3_module_2_lesson_2",
        code: "3.2.2",
        title: "It Costs…",
        purpose: "Train understanding of direct spoken price answers.",
        supportLevel: "high",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Tai kainuoja… — it costs… You'll notice numbers change slightly depending on what follows. Penkis eurus (five euros), dešimt eurų (ten euros). Don't worry about the rule — just get used to hearing the amounts.",
          usage: [
            "Tai kainuoja penkis eurus — it costs five euros",
            "Tai kainuoja dešimt eurų — it costs ten euros",
            "Tai kainuoja dvidešimt eurų — it costs twenty euros",
            "Tai kainuoja trisdešimt eurų — it costs thirty euros",
          ],
        },
        blocks: [
          {
            id: "s3m2l2_b1",
            type: "learn",
            title: "Price answers",
            items: [
              { id: "pa1", lt: "Tai kainuoja penkis eurus",    en: "It costs five euros",    audioText: "Tai kainuoja penkis eurus",    saveable: true, core: true },
              { id: "pa2", lt: "Tai kainuoja dešimt eurų",     en: "It costs ten euros",     audioText: "Tai kainuoja dešimt eurų",     saveable: true, core: true },
              { id: "pa3", lt: "Tai kainuoja dvidešimt eurų",  en: "It costs twenty euros",  audioText: "Tai kainuoja dvidešimt eurų",  saveable: true, core: true },
              { id: "pa4", lt: "Tai kainuoja trisdešimt eurų", en: "It costs thirty euros",  audioText: "Tai kainuoja trisdešimt eurų", saveable: true, core: true },
              { id: "noun_sask", lt: "sąskaita", en: "bill / receipt", audioText: "sąskaita", core: false, saveable: true },
            ],
          },
          {
            id: "s3m2l2_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Tai kainuoja dešimt eurų", audioText: "Tai kainuoja dešimt eurų" },
            options: [
              { id: "a", text: "It costs five euros", isCorrect: false },
              { id: "b", text: "It costs ten euros", isCorrect: true },
              { id: "c", text: "It costs twenty euros", isCorrect: false },
            ],
          },
          {
            id: "s3m2l2_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Tai kainuoja dvidešimt eurų", audioText: "Tai kainuoja dvidešimt eurų" },
            options: [
              { id: "a", text: "It costs twelve euros", isCorrect: false },
              { id: "b", text: "It costs thirty euros", isCorrect: false },
              { id: "c", text: "It costs twenty euros", isCorrect: true },
            ],
          },
          {
            id: "s3m2l2_b4",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Tai kainuoja penkis eurus", audioText: "Tai kainuoja penkis eurus" },
            options: [
              { id: "a", text: "It costs fifteen euros", isCorrect: false },
              { id: "b", text: "It costs five euros", isCorrect: true },
              { id: "c", text: "It costs fifty euros", isCorrect: false },
            ],
          },
          {
            id: "s3m2l2_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You ask the price and hear 'trisdešimt eurų'. What does that mean?" },
            noOptionAudio: true,
            options: [
              { id: "a", text: "Thirty euros", isCorrect: true },
              { id: "b", text: "Thirteen euros", isCorrect: false },
              { id: "c", text: "Three euros", isCorrect: false },
            ],
            feedback: { correct: "Trisdešimt — thirty. Not trylika (thirteen) or trys (three)." },
          },
          {
  id: "s3m2l2_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You ask about a hat at a market. The seller gives you the price.",
  sceneIntro: "You ask about a hat at a market. The seller gives you the price.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You ask about a hat at a market. The seller gives you the price.",
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
  steps: [
    {
      id: "step_1",
      speakerId: "seller",
      speakerLabel: "Seller",
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
          text: "Laba diena! Kiek šitas kainuoja?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Ar jūs kalbate angliškai?",
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
      speakerText: "Tai kainuoja penkiolika eurų.",
      supportText: "It costs fifteen euros. — imu means I'll take it.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
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
          text: "Gerai, imu!",
          textEn: "OK, I'll take it!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Iki",
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
      speakerText: "Prašom.",
      supportText: "Here you go.",
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
          text: "Ačiū labai!",
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

      // ── Lesson 3 — Cash or Card ──────────────────────────────────────────────
      {
        id: "section_3_module_2_lesson_3",
        code: "3.2.3",
        title: "Cash or Card",
        purpose: "Handle payment method language confidently.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Grynaisiais means 'with cash' (instrumental case — it changes from grynieji). Kortele means 'with a card' (same pattern). Ar galima mokėti kortele? is the most useful question — is it possible to pay by card?",
          usage: [
            "grynieji — cash",
            "kortelė — card",
            "Turiu grynųjų — I have cash",
            "Turiu kortelę — I have a card",
            "Ar galima mokėti kortele? — is it possible to pay by card?",
            "Grynaisiais ar kortele? — cash or card?",
          ],
        },
        blocks: [
          {
            id: "s3m2l3_b1",
            type: "learn",
            title: "Cash and card",
            items: [
              { id: "cc1", lt: "grynieji",                    en: "cash",                           audioText: "grynieji",                    saveable: true, core: true },
              { id: "cc2", lt: "kortelė",                     en: "card",                           audioText: "kortelė",                     saveable: true, core: true },
              { id: "cc3", lt: "Turiu grynųjų",               en: "I have cash",                    audioText: "Turiu grynųjų",               saveable: true, core: true },
              { id: "cc4", lt: "Turiu kortelę",               en: "I have a card",                  audioText: "Turiu kortelę",               saveable: true, core: true },
              { id: "cc5", lt: "Ar galima mokėti kortele?",   en: "Is it possible to pay by card?", audioText: "Ar galima mokėti kortele",     saveable: true, core: true },
              { id: "cc6", lt: "Grynaisiais ar kortele?",     en: "Cash or card?",                  audioText: "Grynaisiais ar kortele",       saveable: true, core: true },
            ],
          },
          {
            id: "s3m2l3_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar galima mokėti kortele?", audioText: "Ar galima mokėti kortele" },
            options: [
              { id: "a", text: "Do you have a card?", isCorrect: false },
              { id: "b", text: "Is it possible to pay by card?", isCorrect: true },
              { id: "c", text: "I want to pay by cash", isCorrect: false },
            ],
          },
          {
            id: "s3m2l3_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Turiu grynųjų", audioText: "Turiu grynųjų" },
            options: [
              { id: "a", text: "I need cash", isCorrect: false },
              { id: "b", text: "I have cash", isCorrect: true },
              { id: "c", text: "I want to pay cash", isCorrect: false },
            ],
          },
          {
            id: "s3m2l3_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: is it possible to pay by card?",
            targetText: "Ar galima mokėti kortele?",
            audioText: "Ar galima mokėti kortele",
          },
          {
            id: "s3m2l3_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A shop assistant asks you: 'Grynaisiais ar kortele?'" },
            options: [
              { id: "a", text: "Kiek tai kainuoja?", isCorrect: false },
              { id: "b", text: "Kortele, prašau", isCorrect: true },
              { id: "c", text: "Nesuprantu lietuviškai", isCorrect: false },
            ],
            feedback: { correct: "Kortele, prašau — by card, please. Clean and direct." },
          },
          {
  id: "s3m2l3_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're paying for coffee. The server asks how you want to pay.",
  sceneIntro: "You're paying for coffee. The server asks how you want to pay.",
  location: "caf?",
  userRole: "customer",
  register: "polite_service",
  goal: "You're paying for coffee. The server asks how you want to pay.",
  focus: ["ordering","payment"],
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
      speakerText: "Tai kainuoja septynis eurus.",
      supportText: "It costs seven euros.",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Ačiū, viso gero",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ar galima mokėti kortele?",
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
      id: "step_2",
      speakerId: "barista",
      speakerLabel: "Barista",
      speakerText: "Taip, galima.",
      supportText: "Yes, it is possible.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Turiu grynųjų",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Gerai, ačiū.",
          result: "best",
          progresses: true,
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
      speakerId: "barista",
      speakerLabel: "Barista",
      speakerText: "Prašom.",
      supportText: "Here you go.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
    }
  ],
},
        ],
      },

      // ── Lesson 4 — Expensive / Cheap / Okay ─────────────────────────────────
      {
        id: "section_3_module_2_lesson_4",
        code: "3.2.4",
        title: "Expensive, Cheap, Okay",
        purpose: "React simply and naturally to a price.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Brangu (expensive) and Tinka (that works / that's fine) are your two most useful price reaction words. Imu means 'I'll take it' — one word, very useful in shops.",
          usage: [
            "Brangu — expensive",
            "Per brangu — too expensive",
            "Nebrangiai — cheap / not expensive",
            "Gerai — okay / fine",
            "Tinka — that works / that's fine",
            "Imu — I'll take it",
          ],
        },
        blocks: [
          {
            id: "s3m2l4_b1",
            type: "learn",
            title: "Reacting to a price",
            items: [
              { id: "pr1", lt: "Brangu",      en: "Expensive",              audioText: "Brangu",      saveable: true, core: true },
              { id: "pr2", lt: "Per brangu",  en: "Too expensive",          audioText: "Per brangu",  saveable: true, core: true },
              { id: "pr3", lt: "Nebrangiai",  en: "Cheap / not expensive",  audioText: "Nebrangiai",  saveable: true, core: true },
              { id: "pr4", lt: "Tinka",       en: "That works / that's fine", audioText: "Tinka",     saveable: true, core: true },
              { id: "pr5", lt: "Imu",         en: "I'll take it",           audioText: "Imu",         saveable: true, core: true },
              { id: "noun_kep", lt: "kepurė", en: "hat", audioText: "kepurė", core: false, saveable: true },
            ],
          },
          {
            id: "s3m2l4_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Per brangu", audioText: "Per brangu" },
            options: [
              { id: "a", text: "A bit expensive", isCorrect: false },
              { id: "b", text: "Too expensive", isCorrect: true },
              { id: "c", text: "Very cheap", isCorrect: false },
            ],
          },
          {
            id: "s3m2l4_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Tinka", audioText: "Tinka" },
            options: [
              { id: "a", text: "Too expensive", isCorrect: false },
              { id: "b", text: "That works / that's fine", isCorrect: true },
              { id: "c", text: "I don't want it", isCorrect: false },
            ],
          },
          {
            id: "s3m2l4_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I'll take it",
            targetText: "Imu",
            audioText: "Imu",
          },
          {
            id: "s3m2l4_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You ask the price of a hat. The seller says 'šimtas eurų'. That's way too much." },
            options: [
              { id: "a", text: "Tinka!", isCorrect: false },
              { id: "b", text: "Imu", isCorrect: false },
              { id: "c", text: "Per brangu", isCorrect: true },
            ],
            feedback: { correct: "Per brangu — too expensive. One hundred euros for a hat is a reasonable objection." },
          },
          {
  id: "s3m2l4_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a market. You ask the price and decide whether to buy.",
  sceneIntro: "You're at a market. You ask the price and decide whether to buy.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're at a market. You ask the price and decide whether to buy.",
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
      "lt": "kortel?",
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
          text: "Laba diena! Kiek šitas kainuoja?",
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
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Tai kainuoja dvidešimt eurų.",
      supportText: "It costs twenty euros.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Per brangu",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Gerai, imu!",
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
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Grynaisiais ar kortele?",
      supportText: "Cash or card?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Tinka",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Kortele, prašau",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Brangu",
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
      speakerText: "Prašom.",
      supportText: "Here you go.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
          text: "Ačiū labai! Viso gero!",
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
    }
  ],
},
        ],
      },

      // ── Lesson 5 — Paying and Closing ───────────────────────────────────────
      {
        id: "section_3_module_2_lesson_5",
        code: "3.2.5",
        title: "Paying and Closing",
        purpose: "Complete a transaction from decision to goodbye.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Noriu sumokėti — I want to pay. Sąskaitą, prašau — the bill, please. These close a transaction naturally. You already know ačiū and viso gero — they do the rest.",
          usage: [
            "Noriu sumokėti — I want to pay",
            "Sąskaitą, prašau — the bill, please",
            "Žinoma — of course",
          ],
        },
        blocks: [
          {
            id: "s3m2l5_b1",
            type: "learn",
            title: "Closing a transaction",
            items: [
              { id: "cl1", lt: "Noriu sumokėti",  en: "I want to pay",     audioText: "Noriu sumokėti",  saveable: true, core: true },
              { id: "cl2", lt: "Sąskaitą, prašau", en: "The bill, please", audioText: "Sąskaitą, prašau", saveable: true, core: true },
              { id: "cl3", lt: "Žinoma",           en: "Of course",        audioText: "Žinoma",           saveable: true, core: true },
            ],
          },
          {
            id: "s3m2l5_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Noriu sumokėti", audioText: "Noriu sumokėti" },
            options: [
              { id: "a", text: "Can I have the menu?", isCorrect: false },
              { id: "b", text: "I want to pay", isCorrect: true },
              { id: "c", text: "It's too expensive", isCorrect: false },
            ],
          },
          {
            id: "s3m2l5_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Sąskaitą, prašau", audioText: "Sąskaitą, prašau" },
            options: [
              { id: "a", text: "One more, please", isCorrect: false },
              { id: "b", text: "The bill, please", isCorrect: true },
              { id: "c", text: "A receipt, please", isCorrect: false },
            ],
          },
          {
            id: "s3m2l5_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: the bill, please",
            targetText: "Sąskaitą, prašau",
            audioText: "Sąskaitą, prašau",
          },
          {
            id: "s3m2l5_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "I want to pay" },
            tokens: [
              { id: "t1", text: "Noriu",     correctIndex: 0 },
              { id: "t2", text: "sumokėti",  correctIndex: 1 },
              { id: "t3", text: "mokėti",    isDistractor: true },
              { id: "t4", text: "Turiu",     isDistractor: true },
            ],
            answerText: "Noriu sumokėti",
          },
          {
  id: "s3m2l5_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You've finished your meal in a café. You want to settle the bill.",
  sceneIntro: "You've finished your meal in a café. You want to settle the bill.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You've finished your meal in a café. You want to settle the bill.",
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
      speakerText: "Ar viskas gerai?",
      supportText: "Is everything okay?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
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
          text: "Taip, ačiū. Sąskaitą, prašau.",
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
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Žinoma. Tai kainuoja keturiolika eurų.",
      supportText: "Of course. It costs fourteen euros.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Brangu!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ar galima mokėti kortele?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Ačiū, viso gero",
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
      speakerText: "Taip, galima.",
      supportText: "Yes, you can.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Per brangu",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Gerai, ačiū.",
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
      id: "step_4",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Prašom. Ačiū, viso gero!",
      supportText: "Here you go. Thank you, goodbye!",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
          text: "Ačiū! Viso gero!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Taip, prašau",
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

      // ── Module 3.2 Checkpoint ────────────────────────────────────────────────
      {
        id: "section_3_module_2_checkpoint",
        code: "3.2.C",
        title: "Prices and Paying Check",
        purpose: "Handle a complete price-and-pay exchange from question to close.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s3m2c_b1",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kiek tai kainuoja?", audioText: "Kiek tai kainuoja" },
            options: [
              { id: "a", text: "Where is this?", isCorrect: false },
              { id: "b", text: "How much does this cost?", isCorrect: true },
              { id: "c", text: "Do you have this?", isCorrect: false },
            ],
          },
          {
            id: "s3m2c_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Tai kainuoja penkiolika eurų", audioText: "Tai kainuoja penkiolika eurų" },
            options: [
              { id: "a", text: "It costs fifteen euros", isCorrect: true },
              { id: "b", text: "It costs fifty euros", isCorrect: false },
              { id: "c", text: "It costs five euros", isCorrect: false },
            ],
          },
          {
            id: "s3m2c_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "The server asks: 'Grynaisiais ar kortele?'" },
            options: [
              { id: "a", text: "Noriu sumokėti", isCorrect: false },
              { id: "b", text: "Grynaisiais, prašau", isCorrect: true },
              { id: "c", text: "Kiek tai kainuoja?", isCorrect: false },
            ],
            feedback: { correct: "Grynaisiais, prašau — cash, please. Direct answer to cash or card." },
          },
          {
            id: "s3m2c_b4",
            type: "best_response",
            title: "Choose the best response",
            noOptionAudio: true,
            prompt: { text: "The price is keturiasdešimt eurų. That's fine for you. What do you say?" },
            options: [
              { id: "a", text: "Per brangu!", isCorrect: false },
              { id: "b", text: "Tinka. Imu.", isCorrect: true },
              { id: "c", text: "Nesuprantu", isCorrect: false },
            ],
            feedback: { correct: "Tinka. Imu. — That's fine. I'll take it. Clean, confident, exactly right." },
          },
          {
            id: "s3m2c_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "The bill, please" },
            tokens: [
              { id: "t1", text: "Sąskaitą,", correctIndex: 0 },
              { id: "t2", text: "prašau",    correctIndex: 1 },
              { id: "t3", text: "Noriu",     isDistractor: true },
              { id: "t4", text: "kortele",   isDistractor: true },
            ],
            answerText: "Sąskaitą, prašau",
          },
          {
  id: "s3m2c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "A full café transaction — from hello to goodbye.",
  sceneIntro: "A full café transaction — from hello to goodbye.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "A full café transaction — from hello to goodbye.",
  focus: ["greetings"],
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
      "lt": "kortel?",
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
      speakerText: "Laba diena! Ar galiu jums padėti?",
      supportText: "Can I help you?",
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
          text: "Laba diena! Kiek kava kainuoja?",
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
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Kava kainuoja tris eurus.",
      supportText: "Coffee costs three euros.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Per brangu",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Gerai. Vieną kavą, prašau.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Noriu sumokėti",
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
      speakerText: "Žinoma. Grynaisiais ar kortele?",
      supportText: "Of course. Cash or card?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Tinka",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Kortele, prašau",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Brangu",
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
      speakerText: "Prašom. Ačiū!",
      supportText: "Here you go. Thank you!",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
          text: "Ačiū! Viso gero!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Dar kartą, prašau",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    }
  ],
},
          {
            id: "s3m2c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Kiek tai kainuoja?",         en: "How much does this cost?",       audioText: "Kiek tai kainuoja" },
              { id: "m2",  lt: "Kiek šitas kainuoja?",       en: "How much does this one cost?",   audioText: "Kiek šitas kainuoja" },
              { id: "m3",  lt: "Tai kainuoja dešimt eurų",   en: "It costs ten euros",             audioText: "Tai kainuoja dešimt eurų" },
              { id: "m4",  lt: "Tai kainuoja penkis eurus",  en: "It costs five euros",            audioText: "Tai kainuoja penkis eurus" },
              { id: "m5",  lt: "grynieji",                   en: "cash",                           audioText: "grynieji" },
              { id: "m6",  lt: "kortelė",                    en: "card",                           audioText: "kortelė" },
              { id: "m7",  lt: "Turiu grynųjų",              en: "I have cash",                    audioText: "Turiu grynųjų" },
              { id: "m8",  lt: "Turiu kortelę",              en: "I have a card",                  audioText: "Turiu kortelę" },
              { id: "m9",  lt: "Ar galima mokėti kortele?",  en: "Can I pay by card?",             audioText: "Ar galima mokėti kortele" },
              { id: "m10", lt: "Grynaisiais ar kortele?",    en: "Cash or card?",                  audioText: "Grynaisiais ar kortele" },
              { id: "m11", lt: "Brangu",                     en: "Expensive",                      audioText: "Brangu" },
              { id: "m12", lt: "Per brangu",                 en: "Too expensive",                  audioText: "Per brangu" },
              { id: "m13", lt: "Nebrangiai",                 en: "Cheap / not expensive",          audioText: "Nebrangiai" },
              { id: "m14", lt: "Tinka",                      en: "That works / that's fine",       audioText: "Tinka" },
              { id: "m15", lt: "Imu",                        en: "I'll take it",                   audioText: "Imu" },
              { id: "m16", lt: "Noriu sumokėti",             en: "I want to pay",                  audioText: "Noriu sumokėti" },
              { id: "m17", lt: "Sąskaitą, prašau",          en: "The bill, please",               audioText: "Sąskaitą, prašau" },
              { id: "m18", lt: "Žinoma",                     en: "Of course",                      audioText: "Žinoma" },
              { id: "m19", lt: "sąskaita",                   en: "bill / receipt",                 audioText: "sąskaita" },
              { id: "m20", lt: "kepurė",                     en: "hat",                            audioText: "kepurė" },
            ],
          },
        ],
      },
    ],
  };
}

// src/content/learning/section3/module_3_4.js
// Module 3.4 — Age and Quantities

export default function createModule_3_4(profile = {}) {
  const {
    userNameSafe = "Davidas",
    userAgeYears = 30,
    userAgePhraseLt = "Man trisdešimt metų",
    userAgePhraseEn = "I am 30 years old",
  } = profile;

  return {
    id: "module_3_4",
    code: "3.4",
    title: "Age and Quantities",
    status: "active",
    lessonCount: 5,
    lessons: [

      // ── Lesson 1 — How Old Are You? / I Am… ─────────────────────────────────
      {
        id: "section_3_module_4_lesson_1",
        code: "3.4.1",
        title: "How Old Are You?",
        purpose: "Ask and answer age as a practical use of numbers in personal conversation.",
        supportLevel: "high",
        newLanguageLoad: "low",
        notes: {
          pattern: "Man [number] metų — I am [number] years old. Metų is the genitive plural of metai (years). Kiek jums metų? is the polite form; Kiek tau metų? is informal. Learn these as fixed chunks.",
          usage: [
            "Kiek jums metų? — how old are you? (formal)",
            "Kiek tau metų? — how old are you? (informal)",
            "Man dvidešimt metų — I am twenty years old",
            "Man trisdešimt metų — I am thirty years old",
          ],
        },
        blocks: [
          {
            id: "s3m4l1_b1",
            type: "learn",
            title: "Asking and saying age",
            items: [
              { id: "age1", lt: "Kiek jums metų?",    en: "How old are you? (formal)",   audioText: "Kiek jums metų",    saveable: true, core: true },
              { id: "age2", lt: "Kiek tau metų?",     en: "How old are you? (informal)", audioText: "Kiek tau metų",     saveable: true, core: true },
              { id: "age3", lt: "Man dvidešimt metų", en: "I am twenty years old",        audioText: "Man dvidešimt metų", saveable: false, core: false },
              { id: "age4", lt: userAgePhraseLt,      en: userAgePhraseEn,                audioText: userAgePhraseLt,     saveable: true,  core: true },
              { id: "noun_zmones", lt: "žmonės", en: "people", audioText: "žmonės", core: false, saveable: true },
            ],
          },
          {
            id: "s3m4l1_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kiek jums metų?", audioText: "Kiek jums metų" },
            options: [
              { id: "a", text: "How old am I?", isCorrect: false },
              { id: "b", text: "How old are you?", isCorrect: true },
              { id: "c", text: "How many are you?", isCorrect: false },
            ],
          },
          {
            id: "s3m4l1_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Man trisdešimt metų", audioText: "Man trisdešimt metų" },
            options: [
              { id: "a", text: "I am twenty years old", isCorrect: false },
              { id: "b", text: "I am thirty years old", isCorrect: true },
              { id: "c", text: "I am thirteen years old", isCorrect: false },
            ],
          },
          {
            id: "s3m4l1_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: how old are you? (formal)",
            targetText: "Kiek jums metų?",
            audioText: "Kiek jums metų",
          },
          {
            id: "s3m4l1_b4b",
            type: "speak_self_check",
            title: "Now say your own age",
            prompt: `Say: ${userAgePhraseEn}`,
            targetText: userAgePhraseLt,
            audioText: userAgePhraseLt,
          },
          {
            id: "s3m4l1_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "I am twenty years old" },
            tokens: [
              { id: "t1", text: "Man",       correctIndex: 0 },
              { id: "t2", text: "dvidešimt", correctIndex: 1 },
              { id: "t3", text: "metų",      correctIndex: 2 },
              { id: "t4", text: "trisdešimt", isDistractor: true },
            ],
            answerText: "Man dvidešimt metų",
          },
          {
  id: "s3m4l1_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're chatting with someone at an event. They ask your age.",
  sceneIntro: "You're chatting with someone at an event. They ask your age.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You're chatting with someone at an event. They ask your age.",
  focus: ["numbers"],
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
      speakerText: `Labas, ${userNameSafe}! Kiek jums metų?`,
      supportText: "How old are you?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Man reikia pagalbos",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: `${userAgePhraseLt}. O jums?`,
          textEn: `${userAgePhraseEn}. And you?`,
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
      speakerText: "Man dvidešimt aštuoni metai.",
      supportText: "I am twenty-eight.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Brangu",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Malonu susipažinti!",
          textEn: "Nice to meet you!",
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

      // ── Lesson 2 — How Many? ─────────────────────────────────────────────────
      {
        id: "section_3_module_4_lesson_2",
        code: "3.4.2",
        title: "How Many?",
        purpose: "Ask and answer quantity questions in small practical numbers.",
        supportLevel: "high",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Kiek? — how many? / how much? One word, very versatile. After small numbers, Lithuanian nouns often change form. Du bilietai (two tickets), trys kavos (three coffees) — learn these as chunks. Don't worry about the rules behind the endings yet.",
          usage: [
            "Kiek? — how many? / how much?",
            "Kiek bilietų? — how many tickets?",
            "Du bilietai, prašau — two tickets, please",
            "Trys kavos — three coffees",
            "Kiek kavų? — how many coffees?",
          ],
        },
        blocks: [
          {
            id: "s3m4l2_b1",
            type: "learn",
            title: "Asking and saying quantities",
            items: [
              { id: "q1", lt: "Kiek?",               en: "How many? / How much?",     audioText: "Kiek",               saveable: true, core: true },
              { id: "q2", lt: "Kiek bilietų?",        en: "How many tickets?",         audioText: "Kiek bilietų",        saveable: true, core: true },
              { id: "q3", lt: "Du bilietai, prašau",  en: "Two tickets, please",       audioText: "Du bilietai, prašau", saveable: true, core: true },
              { id: "q4", lt: "Kiek kavų?",           en: "How many coffees?",         audioText: "Kiek kavų",           saveable: true, core: true },
              { id: "q5", lt: "Trys kavos",           en: "Three coffees",             audioText: "Trys kavos",          saveable: true, core: true },
              { id: "noun_ping", lt: "pinigai", en: "money", audioText: "pinigai", core: false, saveable: true },
            ],
          },
          {
            id: "s3m4l2_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kiek bilietų?", audioText: "Kiek bilietų" },
            options: [
              { id: "a", text: "How many coffees?", isCorrect: false },
              { id: "b", text: "How many tickets?", isCorrect: true },
              { id: "c", text: "How much is the ticket?", isCorrect: false },
            ],
          },
          {
            id: "s3m4l2_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Du bilietai, prašau", audioText: "Du bilietai, prašau" },
            options: [
              { id: "a", text: "One ticket, please", isCorrect: false },
              { id: "b", text: "Three tickets, please", isCorrect: false },
              { id: "c", text: "Two tickets, please", isCorrect: true },
            ],
          },
          {
            id: "s3m4l2_b4",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Trys kavos", audioText: "Trys kavos" },
            options: [
              { id: "a", text: "Two coffees", isCorrect: false },
              { id: "b", text: "Three coffees", isCorrect: true },
              { id: "c", text: "Thirty coffees", isCorrect: false },
            ],
          },
          {
            id: "s3m4l2_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Two tickets, please" },
            tokens: [
              { id: "t1", text: "Du",       correctIndex: 0 },
              { id: "t2", text: "bilietai,", correctIndex: 1 },
              { id: "t3", text: "prašau",   correctIndex: 2 },
              { id: "t4", text: "Trys",     isDistractor: true },
            ],
            answerText: "Du bilietai, prašau",
          },
          {
  id: "s3m4l2_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a ticket counter. The assistant asks how many you need.",
  sceneIntro: "You're at a ticket counter. The assistant asks how many you need.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "You're at a ticket counter. The assistant asks how many you need.",
  focus: ["numbers"],
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
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Laba diena! Kiek bilietų?",
      supportText: "How many tickets?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Kiek tai kainuoja?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Du bilietai, prašau.",
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
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Du bilietai — dvidešimt eurų.",
      supportText: "Two tickets — twenty euros.",
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
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Taip, galima. Prašom.",
      supportText: "Yes, you can. Here you go.",
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

      // ── Lesson 3 — More / Less ───────────────────────────────────────────────
      {
        id: "section_3_module_4_lesson_3",
        code: "3.4.3",
        title: "More and Less",
        purpose: "Adjust quantities in practical situations.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Daugiau (more) and mažiau (less) are simple quantity adjusters. Dar vieną, prašau — one more, please — is one of the most natural things to say in a café or shop. Ar dar? — more? — is what a server will often ask you.",
          usage: [
            "daugiau — more",
            "mažiau — less",
            "Dar vieną, prašau — one more, please",
            "Mažiau, prašau — less, please",
            "Daugiau vandens, prašau — more water, please",
            "Ar dar? — more? / anything else?",
          ],
        },
        blocks: [
          {
            id: "s3m4l3_b1",
            type: "learn",
            title: "More and less",
            items: [
              { id: "ml1", lt: "daugiau",               en: "more",              audioText: "daugiau",               saveable: true, core: true },
              { id: "ml2", lt: "mažiau",                en: "less",              audioText: "mažiau",                saveable: true, core: true },
              { id: "ml3", lt: "Dar vieną, prašau",     en: "One more, please",  audioText: "Dar vieną, prašau",     saveable: true, core: true },
              { id: "ml4", lt: "Mažiau, prašau",        en: "Less, please",      audioText: "Mažiau, prašau",        saveable: true, core: true },
              { id: "ml5", lt: "Daugiau vandens, prašau", en: "More water, please", audioText: "Daugiau vandens, prašau", saveable: true, core: true },
              { id: "ml6", lt: "Ar dar?",               en: "More? / Anything else?", audioText: "Ar dar",           saveable: true, core: true },
            ],
          },
          {
            id: "s3m4l3_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Dar vieną, prašau", audioText: "Dar vieną, prašau" },
            options: [
              { id: "a", text: "Less, please", isCorrect: false },
              { id: "b", text: "One more, please", isCorrect: true },
              { id: "c", text: "One ticket, please", isCorrect: false },
            ],
          },
          {
            id: "s3m4l3_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Daugiau vandens, prašau", audioText: "Daugiau vandens, prašau" },
            options: [
              { id: "a", text: "More coffee, please", isCorrect: false },
              { id: "b", text: "Less water, please", isCorrect: false },
              { id: "c", text: "More water, please", isCorrect: true },
            ],
          },
          {
            id: "s3m4l3_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A server asks 'Ar dar?' after topping up your water. You want more." },
            options: [
              { id: "a", text: "Ne, ačiū", isCorrect: false },
              { id: "b", text: "Taip, dar vieną, prašau", isCorrect: true },
              { id: "c", text: "Mažiau, prašau", isCorrect: false },
            ],
            feedback: { correct: "Taip, dar vieną, prašau — yes, one more, please. Natural and polite." },
          },
          {
            id: "s3m4l3_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: one more, please",
            targetText: "Dar vieną, prašau",
            audioText: "Dar vieną, prašau",
          },
          {
  id: "s3m4l3_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're having coffee with a friend. The server comes to check in.",
  sceneIntro: "You're having coffee with a friend. The server comes to check in.",
  location: "caf?",
  userRole: "customer",
  register: "polite_service",
  goal: "You're having coffee with a friend. The server comes to check in.",
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
      speakerText: "Ar dar kavos?",
      supportText: "More coffee?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Mažiau, prašau",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip, dar vieną, prašau!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Kiek valandų?",
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
      speakerText: "Žinoma! Ir vandens?",
      supportText: "Of course! And water?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
          text: "Taip, daugiau vandens, prašau.",
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

      // ── Lesson 4 — Enough / Not Enough ──────────────────────────────────────
      {
        id: "section_3_module_4_lesson_4",
        code: "3.4.4",
        title: "Enough and Not Enough",
        purpose: "Express simple sufficiency or lack in practical situations.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Užtenka — that's enough. Nepakanka — not enough. These are two of the most useful judgment words in Lithuanian. Nepakanka pinigų (not enough money) and Nepakanka laiko (not enough time) are phrases you'll use or hear often.",
          usage: [
            "Pakanka — enough / it is enough",
            "Nepakanka — not enough",
            "Užtenka — that's enough",
            "Ar užtenka? — is it enough?",
            "Nepakanka laiko — not enough time",
            "Nepakanka pinigų — not enough money",
          ],
        },
        blocks: [
          {
            id: "s3m4l4_b1",
            type: "learn",
            title: "Enough and not enough",
            items: [
              { id: "en1", lt: "Pakanka",           en: "Enough / it is enough",   audioText: "Pakanka",           saveable: true, core: true },
              { id: "en2", lt: "Nepakanka",         en: "Not enough",              audioText: "Nepakanka",         saveable: true, core: true },
              { id: "en3", lt: "Užtenka",           en: "That's enough",           audioText: "Užtenka",           saveable: true, core: true },
              { id: "en4", lt: "Ar užtenka?",       en: "Is it enough?",           audioText: "Ar užtenka",        saveable: true, core: true },
              { id: "en5", lt: "Nepakanka laiko",   en: "Not enough time",         audioText: "Nepakanka laiko",   saveable: true, core: true },
              { id: "en6", lt: "Nepakanka pinigų",  en: "Not enough money",        audioText: "Nepakanka pinigų",  saveable: true, core: true },
              { id: "noun_laiko", lt: "laikas / laiko", en: "time", audioText: "laikas", core: false, saveable: true },
            ],
          },
          {
            id: "s3m4l4_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Nepakanka pinigų", audioText: "Nepakanka pinigų" },
            options: [
              { id: "a", text: "Not enough time", isCorrect: false },
              { id: "b", text: "Not enough money", isCorrect: true },
              { id: "c", text: "Too much money", isCorrect: false },
            ],
          },
          {
            id: "s3m4l4_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Užtenka", audioText: "Užtenka" },
            options: [
              { id: "a", text: "Not enough", isCorrect: false },
              { id: "b", text: "Too much", isCorrect: false },
              { id: "c", text: "That's enough", isCorrect: true },
            ],
          },
          {
            id: "s3m4l4_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Not enough time" },
            tokens: [
              { id: "t1", text: "Nepakanka", correctIndex: 0 },
              { id: "t2", text: "laiko",     correctIndex: 1 },
              { id: "t3", text: "pinigų",    isDistractor: true },
              { id: "t4", text: "Pakanka",   isDistractor: true },
            ],
            answerText: "Nepakanka laiko",
          },
          {
            id: "s3m4l4_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A server is pouring your coffee and asks 'Ar užtenka?' — they mean: is that enough coffee?" },
            options: [
              { id: "a", text: "Nepakanka laiko", isCorrect: false },
              { id: "b", text: "Taip, užtenka. Ačiū!", isCorrect: true },
              { id: "c", text: "Kiek tai kainuoja?", isCorrect: false },
            ],
            feedback: { correct: "Taip, užtenka. Ačiū! — yes, that's enough. Thank you! Clean and natural." },
          },
          {
  id: "s3m4l4_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a market and realise you may not have enough cash.",
  sceneIntro: "You're at a market and realise you may not have enough cash.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're at a market and realise you may not have enough cash.",
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
      speakerText: "Tai kainuoja penkiasdešimt eurų.",
      supportText: "It costs fifty euros.",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Imu!",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Atsiprašau — nepakanka pinigų. Ar galima mokėti kortele?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Tinka",
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
      speakerText: "Taip, galima kortele.",
      supportText: "Yes, card is fine.",
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
          text: "Gerai! Imu.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Per brangu",
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
      speakerText: "Ar užtenka?",
      supportText: "Is that enough / is that all?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Nepakanka laiko",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip, užtenka. Ačiū!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Daugiau, prašau",
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

      // ── Lesson 5 — Quantity in Action ────────────────────────────────────────
      {
        id: "section_3_module_4_lesson_5",
        code: "3.4.5",
        title: "Quantity in Action",
        purpose: "Combine all quantity language into realistic ordering and arranging situations.",
        supportLevel: "low",
        newLanguageLoad: "low",
        notes: {
          pattern: "This lesson pulls all the quantity language together — ordering, adjusting, confirming. Mes esame du (we are two) is the most natural way to tell a host or server how many people you are.",
          usage: [
            "Mes esame du — we are two",
            "Viena kava ir dvi arbatos — one coffee and two teas",
            "Dar vieną, prašau — one more, please",
            "Užtenka — that's enough",
            "Kiek jūsų? — how many of you are there?",
          ],
        },
        blocks: [
          {
            id: "s3m4l5_b1",
            type: "learn",
            title: "Quantity in real situations",
            items: [
              { id: "qa1", lt: "Mes esame du",                en: "We are two",                   audioText: "Mes esame du",                saveable: true, core: true },
              { id: "qa2", lt: "Viena kava ir dvi arbatos",   en: "One coffee and two teas",      audioText: "Viena kava ir dvi arbatos",   saveable: true, core: true },
              { id: "qa3", lt: "Kiek jūsų?",                  en: "How many of you are there?",   audioText: "Kiek jūsų",                   saveable: true, core: true },
            ],
          },
          {
            id: "s3m4l5_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Mes esame du", audioText: "Mes esame du" },
            options: [
              { id: "a", text: "We are ten", isCorrect: false },
              { id: "b", text: "We are two", isCorrect: true },
              { id: "c", text: "There are two of them", isCorrect: false },
            ],
          },
          {
            id: "s3m4l5_b3",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "One coffee and two teas" },
            tokens: [
              { id: "t1", text: "Viena",   correctIndex: 0 },
              { id: "t2", text: "kava",    correctIndex: 1 },
              { id: "t3", text: "ir",      correctIndex: 2 },
              { id: "t4", text: "dvi",     correctIndex: 3 },
              { id: "t5", text: "arbatos", correctIndex: 4 },
              { id: "t6", text: "trys",    isDistractor: true },
            ],
            answerText: "Viena kava ir dvi arbatos",
          },
          {
            id: "s3m4l5_b4",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kiek jūsų?", audioText: "Kiek jūsų" },
            options: [
              { id: "a", text: "How many tickets do you have?", isCorrect: false },
              { id: "b", text: "How many of you are there?", isCorrect: true },
              { id: "c", text: "How old are you?", isCorrect: false },
            ],
          },
          {
            id: "s3m4l5_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A host at a café asks 'Kiek jūsų?' — you're with one friend." },
            options: [
              { id: "a", text: "Du bilietai", isCorrect: false },
              { id: "b", text: "Mes esame du", isCorrect: true },
              { id: "c", text: "Kiek kavų?", isCorrect: false },
            ],
            feedback: { correct: "Mes esame du — we are two. That's the natural answer to 'how many of you?'" },
          },
          {
  id: "s3m4l5_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You and a friend arrive at a café. The host seats you and takes your order.",
  sceneIntro: "You and a friend arrive at a café. The host seats you and takes your order.",
  location: "casual conversation",
  userRole: "friend",
  register: "casual",
  goal: "You and a friend arrive at a café. The host seats you and takes your order.",
  focus: ["ordering"],
  participants: [
    {
      "id": "friend",
      "label": "Friend",
      "name": "Mantas",
      "role": "friend",
      "gender": "male",
      "relationshipToUser": "friend",
      "register": "casual"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "friend",
      speakerLabel: "Friend",
      speakerText: "Laba diena! Kiek jūsų?",
      supportText: "How many of you are there?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Du bilietai",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Mes esame du",
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
      speakerId: "friend",
      speakerLabel: "Friend",
      speakerText: "Prašom. Ką norėtumėte?",
      supportText: "Please, come this way. What would you like?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Kiek tai kainuoja?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Viena kava ir dvi arbatos, prašau.",
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
      speakerId: "friend",
      speakerLabel: "Friend",
      speakerText: "Žinoma. Ar dar?",
      supportText: "Of course. Anything else?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Daugiau kavų",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ne, ačiū. Užtenka.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Nepakanka laiko",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_4",
      speakerId: "friend",
      speakerLabel: "Friend",
      speakerText: "Prašom!",
      supportText: "Here you go!",
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
          text: "Dar vieną",
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

      // ── Module 3.4 Checkpoint ────────────────────────────────────────────────
      {
        id: "section_3_module_4_checkpoint",
        code: "3.4.C",
        title: "Quantities Check",
        purpose: "Handle age, quantity, more/less, and enough in practical situations.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s3m4c_b1",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kiek jums metų?", audioText: "Kiek jums metų" },
            options: [
              { id: "a", text: "How many are you?", isCorrect: false },
              { id: "b", text: "How old are you?", isCorrect: true },
              { id: "c", text: "How long have you been here?", isCorrect: false },
            ],
          },
          {
            id: "s3m4c_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kiek bilietų?", audioText: "Kiek bilietų" },
            options: [
              { id: "a", text: "How much is the ticket?", isCorrect: false },
              { id: "b", text: "How many tickets?", isCorrect: true },
              { id: "c", text: "Two tickets, please", isCorrect: false },
            ],
          },
          {
            id: "s3m4c_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A server asks 'Ar dar?' — you want one more coffee." },
            options: [
              { id: "a", text: "Ne, ačiū. Užtenka.", isCorrect: false },
              { id: "b", text: "Taip, dar vieną kavą, prašau.", isCorrect: true },
              { id: "c", text: "Nepakanka pinigų", isCorrect: false },
            ],
            feedback: { correct: "Taip, dar vieną kavą, prašau — yes, one more coffee, please. Perfect." },
          },
          {
            id: "s3m4c_b4",
            type: "best_response",
            title: "Choose the best response",
            noOptionAudio: true,
            prompt: { text: "You've had enough. The server asks 'Ar dar?' What do you say?" },
            options: [
              { id: "a", text: "Dar vieną, prašau", isCorrect: false },
              { id: "b", text: "Ne, ačiū. Užtenka.", isCorrect: true },
              { id: "c", text: "Daugiau vandens", isCorrect: false },
            ],
            feedback: { correct: "Ne, ačiū. Užtenka — no thank you. That's enough. Clean and natural." },
          },
          {
            id: "s3m4c_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Not enough money" },
            tokens: [
              { id: "t1", text: "Nepakanka", correctIndex: 0 },
              { id: "t2", text: "pinigų",    correctIndex: 1 },
              { id: "t3", text: "laiko",     isDistractor: true },
              { id: "t4", text: "Pakanka",   isDistractor: true },
            ],
            answerText: "Nepakanka pinigų",
          },
          {
  id: "s3m4c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You and two friends arrive at a restaurant to book a table.",
  sceneIntro: "You and two friends arrive at a restaurant to book a table.",
  location: "casual conversation",
  userRole: "friend",
  register: "casual",
  goal: "You and two friends arrive at a restaurant to book a table.",
  focus: ["conversation practice"],
  participants: [
    {
      "id": "friend",
      "label": "Friend",
      "name": "Mantas",
      "role": "friend",
      "gender": "male",
      "relationshipToUser": "friend",
      "register": "casual"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "friend",
      speakerLabel: "Friend",
      speakerText: "Laba diena! Kiek jūsų?",
      supportText: "How many of you are there?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Viena kava",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Mes esame trys",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Nepakanka laiko",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_2",
      speakerId: "friend",
      speakerLabel: "Friend",
      speakerText: "Gerai. Ką norėtumėte gerti?",
      supportText: "What would you like to drink?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Kiek tai kainuoja?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Dvi kavas ir vieną vandenį, prašau.",
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
      speakerId: "friend",
      speakerLabel: "Friend",
      speakerText: "Prašom. Ar dar?",
      supportText: "Here you go. Anything else?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Daugiau vandens, prašau.",
          result: "best",
          progresses: true,
        },
        {
          id: "b",
          text: "Nepakanka laiko",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
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
      speakerId: "friend",
      speakerLabel: "Friend",
      speakerText: "Žinoma. Dar kas nors?",
      supportText: "Of course. Anything else?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Dar vieną, prašau",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ne, ačiū. Užtenka.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Kiek bilietų?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    }
  ],
},
          {
            id: "s3m4c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Kiek jums metų?",         en: "How old are you? (formal)",   audioText: "Kiek jums metų" },
              { id: "m2",  lt: "Man trisdešimt metų",      en: "I am thirty years old",       audioText: "Man trisdešimt metų" },
              { id: "m3",  lt: "Kiek?",                    en: "How many? / How much?",       audioText: "Kiek" },
              { id: "m4",  lt: "Kiek bilietų?",            en: "How many tickets?",           audioText: "Kiek bilietų" },
              { id: "m5",  lt: "Du bilietai, prašau",      en: "Two tickets, please",         audioText: "Du bilietai, prašau" },
              { id: "m6",  lt: "Trys kavos",               en: "Three coffees",               audioText: "Trys kavos" },
              { id: "m7",  lt: "daugiau",                  en: "more",                        audioText: "daugiau" },
              { id: "m8",  lt: "mažiau",                   en: "less",                        audioText: "mažiau" },
              { id: "m9",  lt: "Dar vieną, prašau",        en: "One more, please",            audioText: "Dar vieną, prašau" },
              { id: "m10", lt: "Daugiau vandens, prašau",  en: "More water, please",          audioText: "Daugiau vandens, prašau" },
              { id: "m11", lt: "Ar dar?",                  en: "More? / Anything else?",      audioText: "Ar dar" },
              { id: "m12", lt: "Pakanka",                  en: "Enough",                      audioText: "Pakanka" },
              { id: "m13", lt: "Nepakanka",                en: "Not enough",                  audioText: "Nepakanka" },
              { id: "m14", lt: "Užtenka",                  en: "That's enough",               audioText: "Užtenka" },
              { id: "m15", lt: "Nepakanka laiko",          en: "Not enough time",             audioText: "Nepakanka laiko" },
              { id: "m16", lt: "Nepakanka pinigų",         en: "Not enough money",            audioText: "Nepakanka pinigų" },
              { id: "m17", lt: "Mes esame du",             en: "We are two",                  audioText: "Mes esame du" },
              { id: "m18", lt: "Viena kava ir dvi arbatos", en: "One coffee and two teas",   audioText: "Viena kava ir dvi arbatos" },
              { id: "m19", lt: "Kiek jūsų?",              en: "How many of you?",            audioText: "Kiek jūsų" },
              { id: "m20", lt: "pinigai",                  en: "money",                       audioText: "pinigai" },
            ],
          },
        ],
      },
    ],
  };
}

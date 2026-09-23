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
    lessonCount: 6,
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
          pattern: "Man [number] metų — I am [number] years old. In this age pattern, metai (years) appears as metų. Kiek jums metų? is the polite form; Kiek tau metų? is informal. Learn these as useful fixed chunks.",
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
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      help: {
        levels: [
          {
            sceneDirection: "The speaker slows down and points to the key detail in the scene.",
          },
          {
            speakerText: "How old are you?",
            spokenLanguage: "en",
            audio: false,
          },
        ],
      },
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
                }
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Man dvidešimt aštuoni metai.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      help: {
        levels: [
          {
            sceneDirection: "The speaker slows down and points to the key detail in the scene.",
          },
          {
            speakerText: "I am twenty-eight.",
            spokenLanguage: "en",
            audio: false,
          },
        ],
      },
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
          pattern: "Quantity phrases depend on the job the number is doing. The easiest pattern to remember is two: du goes with masculine things, while dvi goes with feminine things — du bilietai but dvi kavos. When you mean 'I need two/three…' or use the short service-request pattern, you will often hear dviejų / trijų and the noun ending in -ų: dviejų bilietų, trijų bilietų. Same numbers, different job.",
          usage: [
            "du bilietai — two tickets (bilietas is masculine)",
            "dvi kavos — two coffees (kava is feminine)",
            "Man reikia dviejų bilietų — I need two tickets",
            "Man reikia trijų bilietų — I need three tickets",
            "Dviejų bilietų, prašau — two tickets, please",
            "Kiek bilietų? / Kiek kavų? — how many tickets? / coffees?",
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
              { id: "q3", lt: "Dviejų bilietų, prašau", en: "Two tickets, please",     audioText: "Dviejų bilietų, prašau", saveable: true, core: true },
              { id: "q4", lt: "Kiek kavų?",           en: "How many coffees?",         audioText: "Kiek kavų",           saveable: true, core: true },
              { id: "q5", lt: "Trys kavos",           en: "Three coffees",             audioText: "Trys kavos",          saveable: true, core: true },
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
            prompt: { text: "Dviejų bilietų, prašau", audioText: "Dviejų bilietų, prašau" },
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
              { id: "t1", text: "Dviejų",    correctIndex: 0 },
              { id: "t2", text: "bilietų,",  correctIndex: 1 },
              { id: "t3", text: "prašau",   correctIndex: 2 },
              { id: "t4", text: "Trys",     isDistractor: true },
            ],
            answerText: "Dviejų bilietų, prašau",
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
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      help: {
        levels: [
          {
            sceneDirection: "The speaker slows down and points to the key detail in the scene.",
          },
          {
            speakerText: "How many tickets?",
            spokenLanguage: "en",
            audio: false,
          },
        ],
      },
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
                  text: "Dviejų bilietų, prašau.",
                  result: "best",
                  progresses: true,
                }
      ],
    },
    {
      id: "step_2",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Du bilietai — dvidešimt eurų.",
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
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      help: {
        levels: [
          {
            sceneDirection: "The speaker slows down and points to the key detail in the scene.",
          },
          {
            speakerText: "Yes, you can. Here you go.",
            spokenLanguage: "en",
            audio: false,
          },
        ],
      },
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
          pattern: "Daugiau (more) and mažiau (less) are simple quantity adjusters. Dar vieną, prašau — one more, please — is one of the most natural things to say in a café or shop. Ar dar ko nors? — anything else? — is a natural short service question.",
          usage: [
            "daugiau — more",
            "mažiau — less",
            "Dar vieną, prašau — one more, please",
            "Mažiau, prašau — less, please",
            "Daugiau vandens, prašau — more water, please",
            "Ar dar ko nors? — anything else?",
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
              { id: "ml6", lt: "Ar dar ko nors?",       en: "Anything else?",        audioText: "Ar dar ko nors",  saveable: true, core: true },
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
            prompt: { text: "A server asks 'Ar dar ko nors?' after you finish your coffee. You want one more coffee." },
            options: [
              { id: "a", text: "Ne, ačiū", isCorrect: false },
              { id: "b", text: "Taip, dar vieną kavą, prašau", isCorrect: true },
              { id: "c", text: "Mažiau, prašau", isCorrect: false },
            ],
            feedback: { correct: "Taip, dar vieną kavą, prašau — yes, one more coffee, please. The noun makes the request clear." },
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
  location: "café",
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
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      help: {
        levels: [
          {
            sceneDirection: "The speaker slows down and points to the key detail in the scene.",
          },
          {
            speakerText: "Of course! And water?",
            spokenLanguage: "en",
            audio: false,
          },
        ],
      },
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
                  text: "Taip, dar ir vandens, prašau.",
                  result: "best",
                  progresses: true,
                }
      ],
    }
  ],
},
        ],
      },

      // ── Lesson 4 — Enough? / That's Enough ───────────────────────────────────
      {
        id: "section_3_module_4_lesson_4",
        code: "3.4.4",
        title: "Enough? / That's Enough",
        purpose: "Handle real amount checks and say naturally when you have enough.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Ar užtenka? is a real amount check: 'is that enough?'. Užtenka means 'that's enough' and is the conversational form to prioritise here. If you still want more, answer with the quantity language you already know, such as Daugiau vandens, prašau. Keep this separate from Ar dar ko nors? — 'anything else?'.",
          usage: [
            "Ar užtenka? — is that enough?",
            "Užtenka — that's enough",
            "Taip, užtenka. Ačiū! — yes, that's enough. Thank you!",
            "Daugiau vandens, prašau — more water, please",
            "Ar dar ko nors? — anything else? (a different question)",
          ],
        },
        blocks: [
          {
            id: "s3m4l4_b1",
            type: "learn",
            title: "Enough?",
            items: [
              { id: "en1", lt: "Ar užtenka?",             en: "Is that enough?",                audioText: "Ar užtenka",             saveable: true, core: true },
              { id: "en2", lt: "Užtenka",                 en: "That's enough",                  audioText: "Užtenka",                 saveable: true, core: true },
              { id: "en3", lt: "Taip, užtenka. Ačiū!",    en: "Yes, that's enough. Thank you!", audioText: "Taip, užtenka. Ačiū!",    saveable: true, core: true },
            ],
          },
          {
            id: "s3m4l4_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar užtenka?", audioText: "Ar užtenka" },
            options: [
              { id: "a", text: "Do you want anything else?", isCorrect: false },
              { id: "b", text: "Is that enough?", isCorrect: true },
              { id: "c", text: "Is it too expensive?", isCorrect: false },
            ],
          },
          {
            id: "s3m4l4_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Užtenka", audioText: "Užtenka" },
            options: [
              { id: "a", text: "That's enough", isCorrect: true },
              { id: "b", text: "Not enough", isCorrect: false },
              { id: "c", text: "More, please", isCorrect: false },
            ],
          },
          {
            id: "s3m4l4_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A server is pouring water and asks 'Ar užtenka?' You have enough now." },
            options: [
              { id: "a", text: "Daugiau vandens, prašau", isCorrect: false },
              { id: "b", text: "Taip, užtenka. Ačiū!", isCorrect: true },
              { id: "c", text: "Kiek tai kainuoja?", isCorrect: false },
            ],
            feedback: { correct: "Taip, užtenka. Ačiū! — yes, that's enough. Thank you. This tells the server to stop pouring." },
          },
          {
            id: "s3m4l4_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A server asks 'Ar užtenka?' Your glass is still nearly empty and you want more water." },
            options: [
              { id: "a", text: "Taip, užtenka. Ačiū!", isCorrect: false },
              { id: "b", text: "Daugiau vandens, prašau", isCorrect: true },
              { id: "c", text: "Viso gero", isCorrect: false },
            ],
            feedback: { correct: "Daugiau vandens, prašau — more water, please. Ar užtenka? does not force a yes: answer according to the amount you actually want." },
          },
          {
            id: "s3m4l4_b6",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: yes, that's enough. Thank you!",
            targetText: "Taip, užtenka. Ačiū!",
            audioText: "Taip, užtenka. Ačiū!",
          },
          {
            id: "s3m4l4_b7_v2",
            type: "scenario_v2",
            title: "Enough water?",
            description: "At a café, Ieva is topping up your water. At first you want more; after another pour you have enough.",
            sceneIntro: "At a café, Ieva is topping up your water. At first you want more; after another pour you have enough.",
            location: "café",
            userRole: "customer",
            register: "polite_service",
            goal: "Respond naturally to the same amount check when the answer changes from more to enough.",
            focus: ["Ar užtenka?", "užtenka", "Daugiau vandens, prašau"],
            participants: [
              { id: "server", label: "Server", name: "Ieva", role: "server", gender: "female", relationshipToUser: "stranger", register: "polite_service" },
            ],
            steps: [
              {
                id: "step_1",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Ar užtenka?",
                sceneDirection: "Ieva pauses while pouring. Your glass is still only half full and you want more water.",
                learnerPrompt: "Tell Ieva you want more water.",
                options: [
                  { id: "a", text: "Taip, užtenka. Ačiū!", result: "wrong", feedback: "That would tell Ieva to stop, but you still want more water.", progresses: false },
                  { id: "b", text: "Daugiau vandens, prašau.", result: "best", progresses: true },
                  { id: "c", text: "Kiek tai kainuoja?", result: "wrong", feedback: "The question is about the amount of water, not the price.", progresses: false },
                ],
              },
              {
                id: "step_2",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Dabar užtenka?",
                sceneDirection: "She pours more. The glass is now full enough for you.",
                learnerPrompt: "Tell her it is enough now.",
                options: [
                  { id: "a", text: "Daugiau vandens, prašau.", result: "wrong", feedback: "You have enough now, so asking for more reverses the situation.", progresses: false },
                  { id: "b", text: "Taip, užtenka. Ačiū!", result: "best", progresses: true },
                  { id: "c", text: "Dar vieną, prašau.", result: "wrong", feedback: "Dar vieną asks for one more item; here you just need to stop the pour.", progresses: false },
                ],
              },
              {
                id: "step_3",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Prašom!",
                sceneDirection: "Ieva puts the water jug down.",
                learnerPrompt: "Close the exchange naturally.",
                options: [
                  { id: "a", text: "Ačiū!", result: "best", progresses: true },
                  { id: "b", text: "Daugiau vandens, prašau.", result: "wrong", feedback: "You just said the amount was enough.", progresses: false },
                  { id: "c", text: "Kiek bilietų?", result: "wrong", feedback: "That does not fit this café exchange.", progresses: false },
                ],
              },
            ],
          },
        ],
      },

      // ── Lesson 5 — Not Enough ────────────────────────────────────────────────
      {
        id: "section_3_module_4_lesson_5",
        code: "3.4.5",
        title: "Not Enough",
        purpose: "Express a shortage of time, money, or another resource and recognise the related positive form.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Nepakanka means 'there isn't enough'. Add what is missing: Nepakanka laiko — not enough time; Nepakanka pinigų — not enough money. Pakanka is the related positive form, 'there is enough', but it is recognition-level here. For everyday amount checks, keep using the conversational užtenka from the previous lesson.",
          usage: [
            "Nepakanka — not enough",
            "Nepakanka laiko — not enough time",
            "Nepakanka pinigų — not enough money",
            "Pakanka — there is enough / sufficient (recognise)",
            "Užtenka — that's enough (the conversational amount-check form you already know)",
          ],
        },
        blocks: [
          {
            id: "s3m4l5_b1",
            type: "learn",
            title: "Not enough",
            items: [
              { id: "ne1", lt: "Nepakanka",          en: "Not enough",                     audioText: "Nepakanka",          saveable: true, core: true },
              { id: "ne2", lt: "Nepakanka laiko",    en: "Not enough time",                audioText: "Nepakanka laiko",    saveable: true, core: true },
              { id: "ne3", lt: "Nepakanka pinigų",   en: "Not enough money",               audioText: "Nepakanka pinigų",   saveable: true, core: true },
              { id: "ne4", lt: "Pakanka",             en: "There is enough / sufficient",   audioText: "Pakanka",             saveable: true, core: false },
            ],
          },
          {
            id: "s3m4l5_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Nepakanka", audioText: "Nepakanka" },
            options: [
              { id: "a", text: "That's enough", isCorrect: false },
              { id: "b", text: "Not enough", isCorrect: true },
              { id: "c", text: "Too much", isCorrect: false },
            ],
          },
          {
            id: "s3m4l5_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Nepakanka laiko", audioText: "Nepakanka laiko" },
            options: [
              { id: "a", text: "Not enough money", isCorrect: false },
              { id: "b", text: "Not enough time", isCorrect: true },
              { id: "c", text: "Enough time", isCorrect: false },
            ],
          },
          {
            id: "s3m4l5_b4",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Nepakanka pinigų", audioText: "Nepakanka pinigų" },
            options: [
              { id: "a", text: "Not enough time", isCorrect: false },
              { id: "b", text: "Not enough money", isCorrect: true },
              { id: "c", text: "Too expensive", isCorrect: false },
            ],
          },
          {
            id: "s3m4l5_b5",
            type: "recognise_mcq",
            title: "Recognise the related form",
            prompt: { text: "Pakanka", audioText: "Pakanka" },
            options: [
              { id: "a", text: "There is enough / sufficient", isCorrect: true },
              { id: "b", text: "Not enough", isCorrect: false },
              { id: "c", text: "Anything else?", isCorrect: false },
            ],
          },
          {
            id: "s3m4l5_b6",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Your bus leaves very soon and you still have a long walk to the station. What is the problem?" },
            options: [
              { id: "a", text: "Nepakanka laiko", isCorrect: true },
              { id: "b", text: "Nepakanka pinigų", isCorrect: false },
              { id: "c", text: "Užtenka", isCorrect: false },
            ],
            feedback: { correct: "Nepakanka laiko — there isn't enough time. The missing resource is time." },
          },
          {
            id: "s3m4l5_b7",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Something costs twenty euros, but you only have ten euros. What is the problem?" },
            options: [
              { id: "a", text: "Nepakanka laiko", isCorrect: false },
              { id: "b", text: "Nepakanka pinigų", isCorrect: true },
              { id: "c", text: "Taip, užtenka", isCorrect: false },
            ],
            feedback: { correct: "Nepakanka pinigų — there isn't enough money. The missing resource is money." },
          },
          {
            id: "s3m4l5_b8",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Not enough money" },
            tokens: [
              { id: "t1", text: "Nepakanka", correctIndex: 0 },
              { id: "t2", text: "pinigų",    correctIndex: 1 },
              { id: "t3", text: "laiko",     isDistractor: true },
              { id: "t4", text: "Pakanka",   isDistractor: true, repairHint: "Pakanka is the positive form. The prompt says there is not enough." },
            ],
            answerText: "Nepakanka pinigų",
          },
          {
            id: "s3m4l5_b9",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: not enough time",
            targetText: "Nepakanka laiko",
            audioText: "Nepakanka laiko",
          },
          {
            id: "s3m4l5_b10_v2",
            type: "scenario_v2",
            title: "Not enough time",
            description: "Your bus leaves soon. You and a friend check whether there is enough time before you need to go.",
            sceneIntro: "Your bus leaves soon. You and a friend check whether there is enough time before you need to go.",
            location: "street",
            userRole: "traveller",
            register: "friendly",
            goal: "Recognise the sufficiency question and explain that there is not enough time.",
            focus: ["Nepakanka laiko", "Ar užtenka?"],
            participants: [
              { id: "friend", label: "Friend", name: "Mantas", role: "friend", gender: "male", relationshipToUser: "friend", register: "friendly" },
            ],
            steps: [
              {
                id: "step_1",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Ar užtenka laiko?",
                supportText: "Do we have enough time?",
                sceneDirection: "Your bus leaves soon and you still need to get to the station.",
                learnerPrompt: "Tell Mantas there is not enough time.",
                options: [
                  { id: "a", text: "Ne, nepakanka laiko.", result: "best", progresses: true },
                  { id: "b", text: "Taip, užtenka.", result: "wrong", feedback: "The scene says you do not have enough time.", progresses: false },
                  { id: "c", text: "Nepakanka pinigų.", result: "wrong", feedback: "Money is not the shortage in this situation.", progresses: false },
                ],
              },
              {
                id: "step_2",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Einame dabar?",
                supportText: "Shall we go now?",
                sceneDirection: "Mantas is ready to leave immediately.",
                learnerPrompt: "Agree to go now.",
                options: [
                  { id: "a", text: "Taip, einame.", result: "best", progresses: true },
                  { id: "b", text: "Vėliau.", result: "wrong", feedback: "You just said there is not enough time, so waiting does not fit.", progresses: false },
                  { id: "c", text: "Nepakanka pinigų.", result: "wrong", feedback: "Money is not the problem here.", progresses: false },
                ],
              },
            ],
          },
          {
            id: "s3m4l5_b11_v2",
            type: "scenario_v2",
            title: "Not enough money",
            description: "You and a friend look at something costing twenty euros. You only have ten euros.",
            sceneIntro: "You and a friend look at something costing twenty euros. You only have ten euros.",
            location: "market",
            userRole: "shopper",
            register: "friendly",
            goal: "Explain that there is not enough money, then state how much you have.",
            focus: ["Nepakanka pinigų", "numbers"],
            participants: [
              { id: "friend", label: "Friend", name: "Mantas", role: "friend", gender: "male", relationshipToUser: "friend", register: "friendly" },
            ],
            steps: [
              {
                id: "step_1",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Ar užtenka pinigų?",
                supportText: "Do you have enough money?",
                sceneDirection: "The price is twenty euros, but you only have ten euros.",
                learnerPrompt: "Tell Mantas there is not enough money.",
                options: [
                  { id: "a", text: "Ne, nepakanka pinigų.", result: "best", progresses: true },
                  { id: "b", text: "Taip, užtenka.", result: "wrong", feedback: "You only have ten euros for something costing twenty.", progresses: false },
                  { id: "c", text: "Nepakanka laiko.", result: "wrong", feedback: "Time is not the shortage in this situation.", progresses: false },
                ],
              },
              {
                id: "step_2",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Kiek turite?",
                supportText: "How much do you have?",
                sceneDirection: "You have ten euros.",
                learnerPrompt: "Say how much you have.",
                options: [
                  { id: "a", text: "Dešimt eurų.", result: "best", progresses: true },
                  { id: "b", text: "Dvidešimt eurų.", result: "wrong", feedback: "The scene says you only have ten euros.", progresses: false },
                  { id: "c", text: "Nepakanka laiko.", result: "wrong", feedback: "Mantas asked how much money you have.", progresses: false },
                ],
              },
            ],
          },
        ],
      },

      // ── Lesson 6 — Quantity in Action ────────────────────────────────────────
      {
        id: "section_3_module_4_lesson_6",
        code: "3.4.6",
        title: "Quantity in Action",
        purpose: "Combine all quantity language into realistic ordering and arranging situations.",
        supportLevel: "low",
        newLanguageLoad: "low",
        notes: {
          pattern: "This lesson combines the number patterns you have already seen. Do not try to force every number back to its dictionary form. Read the whole chunk: viena becomes vieną in a direct order, dvi stays dvi with a feminine plural, and dviese is the useful fixed phrase for 'two of us'. The goal is to recognise which familiar number family fits the situation.",
          usage: [
            "viena → vieną kavą — one coffee in an order",
            "dvi + feminine plural → dvi arbatas — two teas",
            "Mes esame dviese — there are two of us",
            "Dar vieną, prašau — one more, please",
            "Užtenka — that's enough",
            "Kiek jūsų? — how many of you are there?",
          ],
        },
        blocks: [
          {
            id: "s3m4l6_b1",
            type: "learn",
            title: "Quantity in real situations",
            items: [
              { id: "qa2", lt: "Vieną kavą ir dvi arbatas, prašau", en: "One coffee and two teas, please", audioText: "Vieną kavą ir dvi arbatas, prašau", saveable: true, core: true },
              { id: "qa3", lt: "Kiek jūsų?",                  en: "How many of you are there?",   audioText: "Kiek jūsų",                   saveable: true, core: true },
            ],
          },
          {
            id: "s3m4l6_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Mes esame dviese", audioText: "Mes esame dviese" },
            options: [
              { id: "a", text: "We are ten", isCorrect: false },
              { id: "b", text: "We are two", isCorrect: true },
              { id: "c", text: "There are two of them", isCorrect: false },
            ],
          },
          {
            id: "s3m4l6_b3",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "One coffee and two teas, please" },
            tokens: [
              { id: "t1", text: "Vieną", correctIndex: 0 },
              { id: "t2", text: "kavą", correctIndex: 1 },
              { id: "t3", text: "ir", correctIndex: 2 },
              { id: "t4", text: "dvi", correctIndex: 3 },
              { id: "t5", text: "arbatas,", correctIndex: 4 },
              { id: "t6", text: "prašau.", correctIndex: 5 },
              { id: "t7", text: "Viena", isDistractor: true, repairHint: "Viena is the basic feminine form “one”. In this order, kavą is the object, so the basic form isn’t the form used here." },
            ],
            answerText: "Vieną kavą ir dvi arbatas, prašau.",
          },
          {
            id: "s3m4l6_b4",
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
            id: "s3m4l6_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A host at a café asks 'Kiek jūsų?' — you're with one friend." },
            options: [
              { id: "a", text: "Du bilietai", isCorrect: false },
              { id: "b", text: "Mes esame dviese", isCorrect: true },
              { id: "c", text: "Kiek kavų?", isCorrect: false },
            ],
            feedback: { correct: "Mes esame dviese — there are two of us. That's the natural answer to 'how many of you?'" },
          },
          {
  id: "s3m4l6_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You and a friend arrive at a café. After giving your party size, you decide to order one coffee and two teas for the table.",
  sceneIntro: "You and a friend arrive at a café. After giving your party size, you decide to order one coffee and two teas for the table.",
  location: "café",
  userRole: "customer",
  register: "polite_service",
  goal: "Give your party size, then place the stated one-coffee-and-two-teas order.",
  focus: ["ordering"],
  participants: [
    {
      "id": "server",
      "label": "Server",
      "name": "Ieva",
      "role": "server",
      "gender": "female",
      "relationshipToUser": "stranger",
      "register": "polite_service"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Laba diena! Kiek jūsų?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      help: {
        levels: [
          {
            sceneDirection: "The speaker slows down and points to the key detail in the scene.",
          },
          {
            speakerText: "How many of you are there?",
            spokenLanguage: "en",
            audio: false,
          },
        ],
      },
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
                  text: "Mes esame dviese",
                  result: "best",
                  progresses: true,
                }
      ],
    },
    {
      id: "step_2",
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Prašom. Ką norėtumėte?",
      sceneDirection: "You have decided on one coffee and two teas for the table.",
      learnerPrompt: "Place that order.",
      help: {
        levels: [
          {
            sceneDirection: "The speaker slows down and points to the key detail in the scene.",
          },
          {
            speakerText: "Please, come this way. What would you like?",
            spokenLanguage: "en",
            audio: false,
          },
        ],
      },
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
                  text: "Vieną kavą ir dvi arbatas, prašau.",
                  result: "best",
                  progresses: true,
                }
      ],
    },
    {
      id: "step_3",
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Žinoma. Ar dar ko nors?",
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
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Prašom!",
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
            prompt: { text: "A server asks 'Ar dar ko nors?' — you want one more coffee." },
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
            prompt: { text: "You've had enough. The server asks 'Ar dar ko nors?' What do you say?" },
            options: [
              { id: "a", text: "Dar vieną, prašau", isCorrect: false },
              { id: "b", text: "Ne, ačiū. Užtenka.", isCorrect: true },
              { id: "c", text: "Daugiau vandens", isCorrect: false },
            ],
            feedback: { correct: "Ne, ačiū. Užtenka — no thank you, that's enough for now. Clean and natural." },
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
            id: "s3m4c_b5a",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Your bus leaves soon and you still have a long walk to the station. What is the problem?" },
            options: [
              { id: "a", text: "Nepakanka laiko", isCorrect: true },
              { id: "b", text: "Nepakanka pinigų", isCorrect: false },
              { id: "c", text: "Užtenka", isCorrect: false },
            ],
            feedback: { correct: "Nepakanka laiko — not enough time." },
          },
          {
            id: "s3m4c_b5b",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A ticket costs twenty euros, but you only have ten euros. What is the problem?" },
            options: [
              { id: "a", text: "Nepakanka laiko", isCorrect: false },
              { id: "b", text: "Nepakanka pinigų", isCorrect: true },
              { id: "c", text: "Taip, užtenka", isCorrect: false },
            ],
            feedback: { correct: "Nepakanka pinigų — not enough money." },
          },
          {
  id: "s3m4c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You and two friends arrive at a restaurant. There are three of you; two want coffee and one wants a glass of water. After the first order, one friend decides they would like some more water.",
  sceneIntro: "You and two friends arrive at a restaurant. There are three of you; two want coffee and one wants a glass of water. After the first order, one friend decides they would like some more water.",
  location: "restaurant",
  userRole: "customer",
  register: "polite_service",
  goal: "Give your party size, then order the drinks your group has chosen.",
  focus: ["conversation practice"],
  participants: [
    {
      "id": "server",
      "label": "Server",
      "name": "Ieva",
      "role": "server",
      "gender": "female",
      "relationshipToUser": "stranger",
      "register": "polite_service"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Laba diena! Kiek jūsų?",
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
          text: "Mes esame trise",
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
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Gerai. Ką norėtumėte gerti?",
      sceneDirection: "Two of you want coffee; the third person wants a glass of water.",
      learnerPrompt: "Order the drinks for your group.",
      help: {
        levels: [
          {
            sceneDirection: "The speaker slows down and points to the key detail in the scene.",
          },
          {
            speakerText: "What would you like to drink?",
            spokenLanguage: "en",
            audio: false,
          },
        ],
      },
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
                  text: "Dvi kavas ir stiklinę vandens, prašau.",
                  supportText: "stiklinę — glass",
                  result: "best",
                  progresses: true,
                }
      ],
    },
    {
      id: "step_3",
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Prašom. Ar dar ko nors norėtumėte?",
      sceneDirection: "One of your friends decides they would like some more water.",
      learnerPrompt: "Ask for more water.",
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
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Žinoma. Ar dar ko nors norėtumėte?",
      sceneDirection: "That is everything your group wants now.",
      learnerPrompt: "Say no thanks and that you have enough.",
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
              { id: "m5",  lt: "Dviejų bilietų, prašau",   en: "Two tickets, please",         audioText: "Dviejų bilietų, prašau" },
              { id: "m6",  lt: "Trys kavos",               en: "Three coffees",               audioText: "Trys kavos" },
              { id: "m7",  lt: "daugiau",                  en: "more",                        audioText: "daugiau" },
              { id: "m8",  lt: "mažiau",                   en: "less",                        audioText: "mažiau" },
              { id: "m9",  lt: "Dar vieną, prašau",        en: "One more, please",            audioText: "Dar vieną, prašau" },
              { id: "m10", lt: "Daugiau vandens, prašau",  en: "More water, please",          audioText: "Daugiau vandens, prašau" },
              { id: "m11", lt: "Ar dar ko nors?",          en: "Anything else?",              audioText: "Ar dar ko nors" },
              { id: "m12", lt: "Pakanka",                  en: "Enough",                      audioText: "Pakanka" },
              { id: "m13", lt: "Nepakanka",                en: "Not enough",                  audioText: "Nepakanka" },
              { id: "m14", lt: "Užtenka",                  en: "That's enough",               audioText: "Užtenka" },
              { id: "m15", lt: "Nepakanka laiko",          en: "Not enough time",             audioText: "Nepakanka laiko" },
              { id: "m16", lt: "Nepakanka pinigų",         en: "Not enough money",            audioText: "Nepakanka pinigų" },
              { id: "m17", lt: "Mes esame dviese",         en: "There are two of us",         audioText: "Mes esame dviese" },
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

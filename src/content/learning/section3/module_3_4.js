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

      // ── Lesson 4 — Enough / Not Enough ──────────────────────────────────────
      {
        id: "section_3_module_4_lesson_4",
        code: "3.4.4",
        title: "Enough and Not Enough",
        purpose: "Express simple sufficiency or lack in practical situations.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Užtenka means 'that's enough'; pakanka / nepakanka express sufficiency or shortage. Ar užtenka? fits a real amount check such as someone pouring a drink. It should not be treated as the general service question 'Is that all?'.",
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
              { id: "t4", text: "Pakanka",   isDistractor: true, repairHint: "Pakanka means “enough”. The prompt says “not enough”, so this positive form reverses the meaning." },
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
  title: "Is that enough?",
  description: "At a café, the server is pouring water and checks whether you have enough.",
  sceneIntro: "At a café, the server is pouring water and checks whether you have enough.",
  location: "café",
  userRole: "customer",
  register: "polite_service",
  goal: "Use Ar užtenka? as a genuine sufficiency check.",
  focus: ["Ar užtenka?", "užtenka", "Nesuprantu"],
  participants: [
    { id: "server", label: "Server", name: "Ieva", role: "server", gender: "female", relationshipToUser: "stranger", register: "polite_service" },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Ar užtenka?",
      sceneDirection: "Ieva pauses while pouring water into your glass and waits for you to say whether the amount is enough.",
      learnerPrompt: "Tell her that it is enough. If the question is unclear, use Nesuprantu.",
      help: {
        levels: [
          { sceneDirection: "She holds the water jug above your glass and makes a small stopping gesture.", speakerText: "Užtenka?" },
          { speakerText: "Is that enough?", spokenLanguage: "en", audio: false },
        ],
      },
      options: [
        { id: "a", text: "Taip, užtenka. Ačiū!", result: "best", progresses: true },
        { id: "b", text: "Nepakanka laiko.", result: "wrong", feedback: "The question is about the amount of water, not time.", progresses: false },
        { id: "c", text: "Kiek tai kainuoja?", result: "wrong", feedback: "The server is checking the amount of water, not the price.", progresses: false },
      ],
    },
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
            id: "s3m4l5_b1",
            type: "learn",
            title: "Quantity in real situations",
            items: [
              { id: "qa2", lt: "Vieną kavą ir dvi arbatas, prašau", en: "One coffee and two teas, please", audioText: "Vieną kavą ir dvi arbatas, prašau", saveable: true, core: true },
              { id: "qa3", lt: "Kiek jūsų?",                  en: "How many of you are there?",   audioText: "Kiek jūsų",                   saveable: true, core: true },
            ],
          },
          {
            id: "s3m4l5_b2",
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
            id: "s3m4l5_b3",
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
              { id: "b", text: "Mes esame dviese", isCorrect: true },
              { id: "c", text: "Kiek kavų?", isCorrect: false },
            ],
            feedback: { correct: "Mes esame dviese — there are two of us. That's the natural answer to 'how many of you?'" },
          },
          {
  id: "s3m4l5_b6_v2",
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
          text: "Ne, ačiū. Dabar užteks.",
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
              { id: "a", text: "Ne, ačiū. Dabar užteks.", isCorrect: false },
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
              { id: "b", text: "Ne, ačiū. Dabar užteks.", isCorrect: true },
              { id: "c", text: "Daugiau vandens", isCorrect: false },
            ],
            feedback: { correct: "Ne, ačiū. Dabar užteks — no thank you, that's enough for now. Clean and natural." },
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
  description: "You and two friends arrive at a restaurant. There are three of you; two want coffee and one wants a glass of water.",
  sceneIntro: "You and two friends arrive at a restaurant. There are three of you; two want coffee and one wants a glass of water.",
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
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Žinoma. Ar dar ko nors norėtumėte?",
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
          text: "Ne, ačiū. Dabar užteks.",
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

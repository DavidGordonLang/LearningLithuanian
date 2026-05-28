// src/content/learning/section3/module_3_3.js
// Module 3.3 — Time

export default function createModule_3_3(profile = {}) {
  const { userNameSafe = "Davidas" } = profile;

  return {
    id: "module_3_3",
    code: "3.3",
    title: "Time",
    status: "active",
    lessonCount: 5,
    lessons: [

      // ── Lesson 1 — What Time Is It? ──────────────────────────────────────────
      {
        id: "section_3_module_3_lesson_1",
        code: "3.3.1",
        title: "What Time Is It?",
        purpose: "Ask the time and understand simple hour-based answers.",
        supportLevel: "high",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Kiek valandų? is the most common way to ask the time. Kelinta valanda? is also used — you'll hear both. Clock answers use ordinal forms: trečia valanda (third hour = 3 o'clock), penkta valanda (fifth hour = 5 o'clock). Learn the phrases as chunks for now.",
          usage: [
            "Kiek valandų? — what time is it?",
            "Kelinta valanda? — what time is it? (which hour?)",
            "Viena valanda — one o'clock",
            "Trečia valanda — three o'clock",
            "Penkta valanda — five o'clock",
            "Dešimta valanda — ten o'clock",
          ],
        },
        blocks: [
          {
            id: "s3m3l1_b1",
            type: "learn",
            title: "Asking and telling the time",
            items: [
              { id: "t1", lt: "Kiek valandų?",    en: "What time is it?",   audioText: "Kiek valandų",    saveable: true, core: true },
              { id: "t2", lt: "Kelinta valanda?",  en: "What time is it?",   audioText: "Kelinta valanda", saveable: true, core: true },
              { id: "t3", lt: "Viena valanda",     en: "One o'clock",        audioText: "Viena valanda",   saveable: true, core: true },
              { id: "t4", lt: "Trečia valanda",    en: "Three o'clock",      audioText: "Trečia valanda",  saveable: true, core: true },
              { id: "t5", lt: "Penkta valanda",    en: "Five o'clock",       audioText: "Penkta valanda",  saveable: true, core: true },
              { id: "t6", lt: "Dešimta valanda",   en: "Ten o'clock",        audioText: "Dešimta valanda", saveable: true, core: true },
              { id: "noun_sus", lt: "susitikimas", en: "meeting", audioText: "susitikimas", core: false, saveable: true },
            ],
          },
          {
            id: "s3m3l1_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kiek valandų?", audioText: "Kiek valandų" },
            options: [
              { id: "a", text: "When do we start?", isCorrect: false },
              { id: "b", text: "What time is it?", isCorrect: true },
              { id: "c", text: "How long does it take?", isCorrect: false },
            ],
          },
          {
            id: "s3m3l1_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Trečia valanda", audioText: "Trečia valanda" },
            options: [
              { id: "a", text: "One o'clock", isCorrect: false },
              { id: "b", text: "Three o'clock", isCorrect: true },
              { id: "c", text: "Thirteen o'clock", isCorrect: false },
            ],
          },
          {
            id: "s3m3l1_b4",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Penkta valanda", audioText: "Penkta valanda" },
            options: [
              { id: "a", text: "Fifteen past the hour", isCorrect: false },
              { id: "b", text: "Five o'clock", isCorrect: true },
              { id: "c", text: "At five", isCorrect: false },
            ],
          },
          {
            id: "s3m3l1_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: what time is it?",
            targetText: "Kiek valandų?",
            audioText: "Kiek valandų",
          },
          {
            id: "s3m3l1_b6",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone asks 'Kiek valandų?' and you glance at your phone — it's 10:00. What do you say?" },
            options: [
              { id: "a", text: "Penki", isCorrect: false },
              { id: "b", text: "Dešimta valanda", isCorrect: true },
              { id: "c", text: "Dešimt valandų", isCorrect: false },
            ],
            feedback: { correct: "Dešimta valanda — ten o'clock. The ordinal form is used for stating the time." },
          },
        ],
      },

      // ── Lesson 2 — Now / Later / Today / Tomorrow ───────────────────────────
      {
        id: "section_3_module_3_lesson_2",
        code: "3.3.2",
        title: "Now, Later, Today, Tomorrow",
        purpose: "Use the core time-reference words in simple everyday situations.",
        supportLevel: "high",
        newLanguageLoad: "low",
        notes: {
          pattern: "Dabar (now), vėliau (later), šiandien (today), rytoj (tomorrow) — these four words will answer most basic timing questions. You already know Kada? (when?) from Section 2.",
          usage: [
            "dabar — now",
            "vėliau — later",
            "šiandien — today",
            "rytoj — tomorrow",
          ],
        },
        blocks: [
          {
            id: "s3m3l2_b1",
            type: "learn",
            title: "Time reference words",
            items: [
              { id: "tr1", lt: "dabar",    en: "now",      audioText: "dabar",    saveable: true, core: true },
              { id: "tr2", lt: "vėliau",   en: "later",    audioText: "vėliau",   saveable: true, core: true },
              { id: "tr3", lt: "šiandien", en: "today",    audioText: "šiandien", saveable: true, core: true },
              { id: "tr4", lt: "rytoj",    en: "tomorrow", audioText: "rytoj",    saveable: true, core: true },
            ],
          },
          {
            id: "s3m3l2_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "vėliau", audioText: "vėliau" },
            options: [
              { id: "a", text: "now", isCorrect: false },
              { id: "b", text: "tomorrow", isCorrect: false },
              { id: "c", text: "later", isCorrect: true },
            ],
          },
          {
            id: "s3m3l2_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "rytoj", audioText: "rytoj" },
            options: [
              { id: "a", text: "today", isCorrect: false },
              { id: "b", text: "tomorrow", isCorrect: true },
              { id: "c", text: "later", isCorrect: false },
            ],
          },
          {
            id: "s3m3l2_b4",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "šiandien", audioText: "šiandien" },
            options: [
              { id: "a", text: "yesterday", isCorrect: false },
              { id: "b", text: "tomorrow", isCorrect: false },
              { id: "c", text: "today", isCorrect: true },
            ],
          },
          {
            id: "s3m3l2_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "When? — Tomorrow." },
            tokens: [
              { id: "t1", text: "Kada?",   correctIndex: 0 },
              { id: "t2", text: "Rytoj.",  correctIndex: 1 },
              { id: "t3", text: "Dabar.",  isDistractor: true },
              { id: "t4", text: "Vėliau.", isDistractor: true },
            ],
            answerText: "Kada? Rytoj.",
          },
          {
  id: "s3m3l2_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You ask a colleague when your meeting is.",
  sceneIntro: "You ask a colleague when your meeting is.",
  location: "work conversation",
  userRole: "colleague",
  register: "polite_friendly",
  goal: "You ask a colleague when your meeting is.",
  focus: ["time"],
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
      speakerText: "Labas!",
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
          text: "Labas! Kada susitikimas?",
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
      speakerId: "colleague",
      speakerLabel: "Colleague",
      speakerText: "Šiandien, trečia valanda.",
      supportText: "Today, at three o'clock.",
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
          text: "Gerai, ačiū!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Rytoj?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "colleague",
      speakerLabel: "Colleague",
      speakerText: "Iki!",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Laba diena",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Iki!",
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

      // ── Lesson 3 — When Do We Start / Leave? ────────────────────────────────
      {
        id: "section_3_module_3_lesson_3",
        code: "3.3.3",
        title: "When Do We Start / Leave?",
        purpose: "Apply time questions to planning and movement.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Kada? questions apply everywhere — meetings, transport, start times. Kada išvyksta autobusas? — when does the bus leave? — is one of the most practically useful things you can ask at a transport stop.",
          usage: [
            "Kada pradedame? — when do we start?",
            "Kada einame? — when are we going?",
            "Kada išvyksta autobusas? — when does the bus leave?",
            "Kada tai prasideda? — when does it start?",
          ],
        },
        blocks: [
          {
            id: "s3m3l3_b1",
            type: "learn",
            title: "When questions for action",
            items: [
              { id: "wq1", lt: "Kada pradedame?",          en: "When do we start?",          audioText: "Kada pradedame",          saveable: true, core: true },
              { id: "wq2", lt: "Kada einame?",              en: "When are we going?",          audioText: "Kada einame",              saveable: true, core: true },
              { id: "wq3", lt: "Kada išvyksta autobusas?",  en: "When does the bus leave?",   audioText: "Kada išvyksta autobusas",  saveable: true, core: true },
              { id: "wq4", lt: "Kada tai prasideda?",       en: "When does it start?",        audioText: "Kada tai prasideda",       saveable: true, core: true },
              { id: "noun_auto", lt: "autobusas",           en: "bus",                        audioText: "autobusas",                core: false, saveable: true },
            ],
          },
          {
            id: "s3m3l3_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kada išvyksta autobusas?", audioText: "Kada išvyksta autobusas" },
            options: [
              { id: "a", text: "When does the bus arrive?", isCorrect: false },
              { id: "b", text: "When does the bus leave?", isCorrect: true },
              { id: "c", text: "Where is the bus stop?", isCorrect: false },
            ],
          },
          {
            id: "s3m3l3_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kada pradedame?", audioText: "Kada pradedame" },
            options: [
              { id: "a", text: "When did we start?", isCorrect: false },
              { id: "b", text: "When do we start?", isCorrect: true },
              { id: "c", text: "When are we going?", isCorrect: false },
            ],
          },
          {
            id: "s3m3l3_b4",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kada tai prasideda?", audioText: "Kada tai prasideda" },
            options: [
              { id: "a", text: "When is it over?", isCorrect: false },
              { id: "b", text: "What does this start?", isCorrect: false },
              { id: "c", text: "When does it start?", isCorrect: true },
            ],
          },
          {
            id: "s3m3l3_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You're at a bus stop and want to know when the next bus leaves." },
            options: [
              { id: "a", text: "Kiek valandų?", isCorrect: false },
              { id: "b", text: "Kada einame?", isCorrect: false },
              { id: "c", text: "Kada išvyksta autobusas?", isCorrect: true },
            ],
            feedback: { correct: "Kada išvyksta autobusas? — specifically asks about the bus departure, which is exactly right here." },
          },
          {
  id: "s3m3l3_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a train station and need to know departure time.",
  sceneIntro: "You're at a train station and need to know departure time.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "You're at a train station and need to know departure time.",
  focus: ["directions","time"],
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
      speakerText: "Laba diena! Ar galiu jums padėti?",
      supportText: "Can I help you?",
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
          text: "Laba diena. Kada išvyksta traukinys?",
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
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Traukinys išvyksta šeštą valandą.",
      supportText: "The train leaves at six o'clock.",
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
          text: "Šeštą valandą. Gerai, ačiū!",
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
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Prašom. Viso gero!",
      supportText: "You're welcome. Goodbye!",
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

      // ── Lesson 4 — At [Time] ─────────────────────────────────────────────────
      {
        id: "section_3_module_3_lesson_4",
        code: "3.3.4",
        title: "At a Specific Time",
        purpose: "Attach times to events — meetings, buses, appointments.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "In Lithuanian, 'at a time' uses a different word form than simply stating the time. Penkta valanda (it's five o'clock) becomes penktą valandą (at five o'clock). You'll see this pattern in real sentences — learn them as set phrases for now.",
          usage: [
            "penktą valandą — at five o'clock",
            "šeštą valandą — at six o'clock",
            "dešimtą valandą — at ten o'clock",
            "Pradedame penktą valandą — we start at five o'clock",
            "Susitinkame šeštą valandą — we meet at six o'clock",
          ],
        },
        blocks: [
          {
            id: "s3m3l4_b1",
            type: "learn",
            title: "Events at a time",
            items: [
              { id: "at1", lt: "Pradedame penktą valandą",           en: "We start at five o'clock",          audioText: "Pradedame penktą valandą",           saveable: true, core: true },
              { id: "at2", lt: "Susitinkame šeštą valandą",          en: "We meet at six o'clock",            audioText: "Susitinkame šeštą valandą",          saveable: true, core: true },
              { id: "at3", lt: "Autobusas išvyksta dešimtą valandą", en: "The bus leaves at ten o'clock",    audioText: "Autobusas išvyksta dešimtą valandą", saveable: true, core: true },
              { id: "noun_trk", lt: "traukinys", en: "train", audioText: "traukinys", core: false, saveable: true },
            ],
          },
          {
            id: "s3m3l4_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Pradedame penktą valandą", audioText: "Pradedame penktą valandą" },
            options: [
              { id: "a", text: "We start at three o'clock", isCorrect: false },
              { id: "b", text: "We start at five o'clock", isCorrect: true },
              { id: "c", text: "We meet at five o'clock", isCorrect: false },
            ],
          },
          {
            id: "s3m3l4_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Susitinkame šeštą valandą", audioText: "Susitinkame šeštą valandą" },
            options: [
              { id: "a", text: "We meet at five o'clock", isCorrect: false },
              { id: "b", text: "We start at six o'clock", isCorrect: false },
              { id: "c", text: "We meet at six o'clock", isCorrect: true },
            ],
          },
          {
            id: "s3m3l4_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "We start at five o'clock" },
            tokens: [
              { id: "t1", text: "Pradedame", correctIndex: 0 },
              { id: "t2", text: "penktą",    correctIndex: 1 },
              { id: "t3", text: "valandą",   correctIndex: 2 },
              { id: "t4", text: "šeštą",     isDistractor: true },
            ],
            answerText: "Pradedame penktą valandą",
          },
          {
            id: "s3m3l4_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: we meet at six o'clock",
            targetText: "Susitinkame šeštą valandą",
            audioText: "Susitinkame šeštą valandą",
          },
          {
  id: "s3m3l4_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're arranging a meeting time with a contact in Vilnius.",
  sceneIntro: "You're arranging a meeting time with a contact in Vilnius.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You're arranging a meeting time with a contact in Vilnius.",
  focus: ["time"],
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
      speakerText: "Labas! Kada susitinkame?",
      supportText: "When do we meet?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Šiandien",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Šiandien, penktą valandą?",
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
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Puiku! Susitinkame penktą valandą.",
      supportText: "Great! We meet at five o'clock.",
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
          text: "Gerai! Ir kur susitinkame?",
          textEn: "Great! And where do we meet?",
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
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Kavinėje. Iki!",
      supportText: "At the café. See you!",
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
          text: "Puiku! Iki!",
          textEn: "Great! See you!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Laba diena",
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

      // ── Lesson 5 — Real-World Timing ─────────────────────────────────────────
      {
        id: "section_3_module_3_lesson_5",
        code: "3.3.5",
        title: "Real-World Timing",
        purpose: "Handle opening hours, departures, and simple wait/timing exchanges.",
        supportLevel: "low",
        newLanguageLoad: "low",
        notes: {
          pattern: "Kada atsidaro? (when does it open?) and Kada užsidaro? (when does it close?) are two of the most useful questions you can ask at a shop or museum. Palaukite, prašau — please wait — is simple and very practical.",
          usage: [
            "Kada atsidaro? — when does it open?",
            "Kada užsidaro? — when does it close?",
            "Palaukite, prašau — please wait",
            "Devintą valandą — at nine o'clock",
          ],
        },
        blocks: [
          {
            id: "s3m3l5_b1",
            type: "learn",
            title: "Opening hours and timing",
            items: [
              { id: "oh1", lt: "Kada atsidaro?",    en: "When does it open?",  audioText: "Kada atsidaro",    saveable: true, core: true },
              { id: "oh2", lt: "Kada užsidaro?",    en: "When does it close?", audioText: "Kada užsidaro",    saveable: true, core: true },
              { id: "oh3", lt: "Palaukite, prašau", en: "Please wait",         audioText: "Palaukite, prašau", saveable: true, core: true },
              { id: "oh4", lt: "Devintą valandą",   en: "At nine o'clock",     audioText: "Devintą valandą",  saveable: true, core: true },
            ],
          },
          {
            id: "s3m3l5_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kada atsidaro?", audioText: "Kada atsidaro" },
            options: [
              { id: "a", text: "When does it close?", isCorrect: false },
              { id: "b", text: "When does it open?", isCorrect: true },
              { id: "c", text: "Is it open now?", isCorrect: false },
            ],
          },
          {
            id: "s3m3l5_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kada užsidaro?", audioText: "Kada užsidaro" },
            options: [
              { id: "a", text: "When does it open?", isCorrect: false },
              { id: "b", text: "When does it close?", isCorrect: true },
              { id: "c", text: "Is it closed?", isCorrect: false },
            ],
          },
          {
            id: "s3m3l5_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You arrive at a shop and it looks closed. What do you ask a passer-by?" },
            options: [
              { id: "a", text: "Kiek valandų?", isCorrect: false },
              { id: "b", text: "Kada atsidaro?", isCorrect: true },
              { id: "c", text: "Kada einame?", isCorrect: false },
            ],
            feedback: { correct: "Kada atsidaro? — when does it open? That's exactly the right question here." },
          },
          {
  id: "s3m3l5_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're outside a museum checking opening hours and asking about today's closing time.",
  sceneIntro: "You're outside a museum checking opening hours and asking about today's closing time.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You're outside a museum checking opening hours and asking about today's closing time.",
  focus: ["time"],
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
          text: "Laba diena! Kada atsidaro?",
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
      speakerText: "Atsidaro devintą valandą.",
      supportText: "It opens at nine o'clock.",
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
          text: "Ačiū. Ir kada užsidaro?",
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
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Šiandien užsidaro šeštą valandą.",
      supportText: "Today it closes at six o'clock.",
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
          text: "Gerai, ačiū labai!",
          textEn: "Great, thank you very much!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Rytoj?",
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

      // ── Module 3.3 Checkpoint ────────────────────────────────────────────────
      {
        id: "section_3_module_3_checkpoint",
        code: "3.3.C",
        title: "Time Check",
        purpose: "Handle timing questions in real planning and transport situations.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s3m3c_b1",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kiek valandų?", audioText: "Kiek valandų" },
            options: [
              { id: "a", text: "When do we start?", isCorrect: false },
              { id: "b", text: "What time is it?", isCorrect: true },
              { id: "c", text: "How long?", isCorrect: false },
            ],
          },
          {
            id: "s3m3c_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Susitinkame šeštą valandą", audioText: "Susitinkame šeštą valandą" },
            options: [
              { id: "a", text: "We start at six o'clock", isCorrect: false },
              { id: "b", text: "We meet at five o'clock", isCorrect: false },
              { id: "c", text: "We meet at six o'clock", isCorrect: true },
            ],
          },
          {
            id: "s3m3c_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone asks 'Kada einame?' and you're ready to go right now." },
            options: [
              { id: "a", text: "Rytoj", isCorrect: false },
              { id: "b", text: "Dabar!", isCorrect: true },
              { id: "c", text: "Šeštą valandą", isCorrect: false },
            ],
            feedback: { correct: "Dabar! — now! Simple and direct when you're ready to go." },
          },
          {
            id: "s3m3c_b4",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kada išvyksta autobusas?", audioText: "Kada išvyksta autobusas" },
            options: [
              { id: "a", text: "Where does the bus stop?", isCorrect: false },
              { id: "b", text: "When does the bus arrive?", isCorrect: false },
              { id: "c", text: "When does the bus leave?", isCorrect: true },
            ],
          },
          {
            id: "s3m3c_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "The bus leaves at ten o'clock" },
            tokens: [
              { id: "t1", text: "Autobusas",  correctIndex: 0 },
              { id: "t2", text: "išvyksta",   correctIndex: 1 },
              { id: "t3", text: "dešimtą",    correctIndex: 2 },
              { id: "t4", text: "valandą",    correctIndex: 3 },
              { id: "t5", text: "šeštą",      isDistractor: true },
            ],
            answerText: "Autobusas išvyksta dešimtą valandą",
          },
          {
  id: "s3m3c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're trying to get to a bus on time and checking details at the station desk.",
  sceneIntro: "You're trying to get to a bus on time and checking details at the station desk.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "You're trying to get to a bus on time and checking details at the station desk.",
  focus: ["directions","time"],
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
      speakerText: "Laba diena! Ar galiu jums padėti?",
      supportText: "Can I help you?",
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
          text: "Laba diena. Kada išvyksta autobusas į Kauną?",
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
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Autobusas išvyksta trečią valandą.",
      supportText: "The bus leaves at three o'clock.",
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
          text: "Trečią valandą — gerai, ačiū!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Rytoj?",
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
      speakerText: "Dabar antra valanda — turite laiko.",
      supportText: "It's two o'clock now — you have time.",
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
          text: "Gerai. Ačiū labai!",
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
    }
  ],
},
          {
            id: "s3m3c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Kiek valandų?",               en: "What time is it?",           audioText: "Kiek valandų" },
              { id: "m2",  lt: "Kelinta valanda?",             en: "What time is it?",           audioText: "Kelinta valanda" },
              { id: "m3",  lt: "Trečia valanda",               en: "Three o'clock",              audioText: "Trečia valanda" },
              { id: "m4",  lt: "Penkta valanda",               en: "Five o'clock",               audioText: "Penkta valanda" },
              { id: "m5",  lt: "dabar",                        en: "now",                        audioText: "dabar" },
              { id: "m6",  lt: "vėliau",                       en: "later",                      audioText: "vėliau" },
              { id: "m7",  lt: "šiandien",                     en: "today",                      audioText: "šiandien" },
              { id: "m8",  lt: "rytoj",                        en: "tomorrow",                   audioText: "rytoj" },
              { id: "m9",  lt: "Kada pradedame?",              en: "When do we start?",          audioText: "Kada pradedame" },
              { id: "m10", lt: "Kada išvyksta autobusas?",     en: "When does the bus leave?",   audioText: "Kada išvyksta autobusas" },
              { id: "m11", lt: "Pradedame penktą valandą",     en: "We start at five o'clock",   audioText: "Pradedame penktą valandą" },
              { id: "m12", lt: "Susitinkame šeštą valandą",   en: "We meet at six o'clock",     audioText: "Susitinkame šeštą valandą" },
              { id: "m13", lt: "Kada atsidaro?",               en: "When does it open?",         audioText: "Kada atsidaro" },
              { id: "m14", lt: "Kada užsidaro?",               en: "When does it close?",        audioText: "Kada užsidaro" },
              { id: "m15", lt: "Palaukite, prašau",            en: "Please wait",                audioText: "Palaukite, prašau" },
              { id: "m16", lt: "Devintą valandą",              en: "At nine o'clock",            audioText: "Devintą valandą" },
              { id: "m17", lt: "autobusas",                    en: "bus",                        audioText: "autobusas" },
              { id: "m18", lt: "traukinys",                    en: "train",                      audioText: "traukinys" },
              { id: "m19", lt: "susitikimas",                  en: "meeting",                    audioText: "susitikimas" },
              { id: "m20", lt: "Kada einame?",                 en: "When are we going?",         audioText: "Kada einame" },
            ],
          },
        ],
      },
    ],
  };
}

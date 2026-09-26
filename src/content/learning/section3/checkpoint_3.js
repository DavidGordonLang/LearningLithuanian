// src/content/learning/section3/checkpoint_3.js
// Section 3 Checkpoint — Numbers in Real Use

export default function createCheckpoint3(profile = {}) {
  const { userNameSafe = "Davidas" } = profile;

  return {
    id: "section_3_checkpoint",
    code: "3.C",
    title: "Numbers in Real Use",
    purpose: "Bring numbers, prices, time, and quantities together in practical situations.",
    isCheckpoint: true,
    isSectionCheckpoint: true,
    status: "active",
    supportLevel: "none",
    newLanguageLoad: "none",
    blocks: [

      // Block 1 — Quick Number Warm-Up ─────────────────────────────────────────
      {
        id: "s3c_b1",
        type: "best_response",
        title: "Choose the best response",
        noOptionAudio: true,
        answerAudioText: "penkiolika eurų",
        prompt: { text: "A market seller says 'penkiolika eurų'. How much is it?" },
        options: [
          { id: "a", text: "Fifty", isCorrect: false },
          { id: "b", text: "Fifteen", isCorrect: true },
          { id: "c", text: "Five", isCorrect: false },
        ],
        feedback: { correct: "Penkiolika — fifteen. Penkiasdešimt is fifty, penki is five." },
      },

      // Block 2 — Audio Number Recognition ─────────────────────────────────────
      {
        id: "s3c_b2",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Tai kainuoja trisdešimt eurų", audioText: "Tai kainuoja trisdešimt eurų" },
        options: [
          { id: "a", text: "It costs thirteen euros", isCorrect: false },
          { id: "b", text: "It costs three hundred euros", isCorrect: false },
          { id: "c", text: "It costs thirty euros", isCorrect: true },
        ],
      },

      {
        id: "s3c_b3",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Susitinkame šeštą valandą", audioText: "Susitinkame šeštą valandą" },
        options: [
          { id: "a", text: "We start at six o'clock", isCorrect: false },
          { id: "b", text: "We meet at six o'clock", isCorrect: true },
          { id: "c", text: "We meet at sixteen o'clock", isCorrect: false },
        ],
      },

      // Block 3 — Price Interaction ─────────────────────────────────────────────
      {
        id: "s3c_b4",
        type: "recognise_mcq",
        title: "Choose the correct meaning",
        prompt: { text: "Kiek kainuoja kava?", audioText: "Kiek kainuoja kava" },
        options: [
          { id: "a", text: "How much does that one cost?", isCorrect: false },
          { id: "b", text: "How much does the coffee cost?", isCorrect: true },
          { id: "c", text: "Can I have this?", isCorrect: false },
        ],
      },

      {
        id: "s3c_b5",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "You ask the price and hear 'keturiasdešimt eurų'. It's fine. You want to pay by card." },
        options: [
          { id: "a", text: "Per brangu", isCorrect: false },
          { id: "b", text: "Tinka. Ar galima mokėti kortele?", isCorrect: true },
          { id: "c", text: "Nesuprantu", isCorrect: false },
        ],
        feedback: { correct: "Tinka. Ar galima mokėti kortele? — that's fine. Can I pay by card? Perfect sequence." },
      },

      // Block 4 — Time Interaction ──────────────────────────────────────────────
      {
        id: "s3c_b6",
        type: "recognise_mcq",
        title: "Choose the correct meaning",
        prompt: { text: "Kada išvyksta traukinys?", audioText: "Kada išvyksta traukinys" },
        options: [
          { id: "a", text: "When does the bus leave?", isCorrect: false },
          { id: "b", text: "When does the train leave?", isCorrect: true },
          { id: "c", text: "When does the train arrive?", isCorrect: false },
        ],
      },

      {
        id: "s3c_b7",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "Someone asks 'Kada pradedame?' — you're starting right now." },
        options: [
          { id: "a", text: "Rytoj", isCorrect: false },
          { id: "b", text: "Šeštą valandą", isCorrect: false },
          { id: "c", text: "Dabar!", isCorrect: true },
        ],
        feedback: { correct: "Dabar! — now! Simple and exact." },
      },

      // Block 5 — Quantity Interaction ──────────────────────────────────────────
      {
        id: "s3c_b8",
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
        id: "s3c_b9",
        type: "build_phrase",
        title: "Build the phrase",
        prompt: { text: "How many of you are there?" },
        tokens: [
          { id: "t1", text: "Kiek",   correctIndex: 0 },
          { id: "t2", text: "jūsų?",  correctIndex: 1 },
          { id: "t3", text: "kavų?",  isDistractor: true },
          { id: "t4", text: "metų?",  isDistractor: true },
        ],
        answerText: "Kiek jūsų?",
      },

      // Block 6 — Full Conversation Chain ───────────────────────────────────────
      {
  id: "s3c_b10_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "At Vilnius station, you need two train tickets to Kaunas, one for you and one for a friend. Twenty euros fits your budget; you want to pay by card and check when the train leaves.",
  sceneIntro: "At Vilnius station, you need two train tickets to Kaunas, one for you and one for a friend. Twenty euros fits your budget; you want to pay by card and check when the train leaves.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "Buy two train tickets to Kaunas, pay by card and check the departure time.",
  focus: ["payment","time"],
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
      speakerText: "Laba diena! Ar galiu jums padėti?",
      sceneDirection: "You need two tickets to Kaunas for yourself and your friend.",
      learnerPrompt: "Ask for the two tickets to Kaunas.",
      help: {
        levels: [
          {
            sceneDirection: "The speaker slows down and points to the key detail in the scene.",
          },
          {
            speakerText: "Can I help you?",
            spokenLanguage: "en",
            audio: false,
          },
        ],
      },
      options: [
        {
                  id: "a",
                  text: "Laba diena. Man reikia trijų bilietų į Kauną, prašau.",
                  result: "wrong",
                  feedback: "Trijų asks for three tickets; you need two, so use dviejų.",
                  progresses: false,
                },
        {
                  id: "b",
                  text: "Laba diena. Man reikia dviejų bilietų į Kauną, prašau.",
                  result: "best",
                  progresses: true,
                }
      ],
    },
    {
      id: "step_2",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Tai kainuoja dvidešimt eurų.",
      sceneDirection: "Twenty euros is fine for you. You want to pay by card.",
      learnerPrompt: "Accept the price and ask to pay by card.",
      options: [
        {
          id: "a",
          text: "Per brangu!",
          result: "wrong",
          feedback: "You decided twenty euros is fine; Per brangu says it is too expensive.",
          progresses: false,
        },
        {
          id: "b",
          text: "Gerai. Ar galima mokėti kortele?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Grynaisiais, prašau.",
          result: "wrong",
          feedback: "Grynaisiais is cash; you want to pay by card. Ask Ar galima mokėti kortele?",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Taip, galima. Prašom.",
      sceneDirection: "Rasa hands you the tickets. You still need to know when the train leaves.",
      learnerPrompt: "Ask when the train departs.",
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
                  text: "Nepakanka pinigų",
                  result: "wrong",
                  feedback: "You can afford the tickets; you still need to ask when the train leaves.",
                  progresses: false,
                },
        {
                  id: "b",
                  text: "Ačiū. Ir — kada išvyksta traukinys?",
                  result: "best",
                  progresses: true,
                }
      ],
    },
    {
      id: "step_4",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Traukinys išvyksta penktą valandą.",
      sceneDirection: "Listen to the departure time before answering.",
      learnerPrompt: "When does the train leave?",
      interactionMode: "comprehension",
      help: { levels: [
        { sceneDirection: "Rasa holds up five fingers and repeats the time.", speakerText: "Penktą valandą." },
        { speakerText: "At five o'clock.", spokenLanguage: "en", audio: false },
      ] },
      options: [
        {
          id: "a",
          text: "At three o'clock.",
          result: "wrong",
          feedback: "Trečią is at three; Rasa said penktą, at five.",
          progresses: false,
        },
        {
          id: "b",
          text: "At five o'clock.",
          learnerText: "Gerai, ačiū labai!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "At two o'clock.",
          result: "wrong",
          feedback: "Rasa said penktą, at five, not two.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_5",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Prašom. Viso gero ir geros kelionės!",
      supportText: "geros kelionės — have a good journey",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      help: {
        levels: [
          {
            sceneDirection: "The speaker slows down and points to the key detail in the scene.",
          },
          {
            speakerText: "You're welcome. Goodbye and have a good journey!",
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
                  feedback: "Atsiprašau apologises; Rasa wished you a good journey, so thank her and say goodbye.",
                  progresses: false,
                },
        {
                  id: "b",
                  text: "Ačiū labai! Viso gero!",
                  result: "best",
                  progresses: true,
                },
        { id: "c", text: "Ačiū! Iki!", result: "acceptable", feedback: "A friendly closing works; viso gero is the polite service phrase practised here.", progresses: true }
      ],
    }
  ],
},

      // Word Match ──────────────────────────────────────────────────────────────
      {
        id: "s3c_b11",
        type: "word_match",
        pairPages: [
          { id: "group_1", label: "Numbers", pairIds: ["m1", "m2", "m3", "m4"] },
          { id: "group_2", label: "Prices and payment", pairIds: ["m5", "m6", "m7", "m8", "m9"] },
          { id: "group_3", label: "Time and travel", pairIds: ["m10", "m11", "m12", "m13", "m14"] },
          { id: "group_4", label: "Quantities", pairIds: ["m15", "m16", "m17"] },
          { id: "group_5", label: "Enough or not enough", pairIds: ["m18", "m19", "m20"] },
        ],
        title: "Match the pairs",
        pairs: [
          // Numbers
          { id: "m1",  lt: "penkiolika",               en: "fifteen",                      audioText: "penkiolika" },
          { id: "m2",  lt: "trisdešimt",               en: "thirty",                       audioText: "trisdešimt" },
          { id: "m3",  lt: "penkiasdešimt",            en: "fifty",                        audioText: "penkiasdešimt" },
          { id: "m4",  lt: "šimtas",                   en: "one hundred",                  audioText: "šimtas" },
          // Prices
          { id: "m5",  lt: "Kiek tai kainuoja?",       en: "How much does this cost?",     audioText: "Kiek tai kainuoja" },
          { id: "m6",  lt: "Ar galima mokėti kortele?", en: "Can I pay by card?",          audioText: "Ar galima mokėti kortele" },
          { id: "m7",  lt: "Per brangu",               en: "Too expensive",                audioText: "Per brangu" },
          { id: "m8",  lt: "Noriu sumokėti",           en: "I want to pay",                audioText: "Noriu sumokėti" },
          { id: "m9",  lt: "Ar galėčiau gauti sąskaitą, prašau?",        en: "Could I get the bill, please?",             audioText: "Ar galėčiau gauti sąskaitą, prašau?" },
          // Time
          { id: "m10", lt: "Kiek valandų?",            en: "What time is it?",             audioText: "Kiek valandų" },
          { id: "m11", lt: "Kada išvyksta autobusas?",  en: "When does the bus leave?",    audioText: "Kada išvyksta autobusas" },
          { id: "m12", lt: "Pradedame penktą valandą",  en: "We start at five o'clock",    audioText: "Pradedame penktą valandą" },
          { id: "m13", lt: "dabar",                    en: "now",                          audioText: "dabar" },
          { id: "m14", lt: "rytoj",                    en: "tomorrow",                     audioText: "rytoj" },
          // Quantities
          { id: "m15", lt: "Dviejų bilietų, prašau",   en: "Two tickets, please",          audioText: "Dviejų bilietų, prašau" },
          { id: "m16", lt: "Mes esame dviese",         en: "There are two of us",          audioText: "Mes esame dviese" },
          { id: "m17", lt: "Dar vieną, prašau",        en: "One more, please",             audioText: "Dar vieną, prašau" },
          { id: "m18", lt: "Užtenka",                  en: "That's enough",                audioText: "Užtenka" },
          { id: "m19", lt: "Nepakanka pinigų",         en: "Not enough money",             audioText: "Nepakanka pinigų" },
          { id: "m20", lt: "Kiek jūsų?",              en: "How many of you?",             audioText: "Kiek jūsų" },
        ],
      },
    ],
  };
}

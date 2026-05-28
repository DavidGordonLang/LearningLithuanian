// src/content/learning/section2/module_2_2.js
// Module 2.2 — Can / Can't / Possible?

export default function createModule_2_2(profile = {}) {
  const {
    userNameSafe = "Davidas",
  } = profile;

  return {
    id: "module_2_2",
    code: "2.2",
    title: "Can / Can't / Possible?",
    status: "active",
    lessonCount: 6,
    lessons: [

      // ── Lesson 1 ────────────────────────────────────────────────────────────
      {
        id: "section_2_module_2_lesson_1",
        code: "2.2.1",
        title: "Can I…?",
        purpose: "Teach permission and self-directed action. Expands on Section 1's early exposure to Ar galiu?",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Ar galiu…? — Can I…? A reusable permission frame. The reply you'll hear: Taip, galite (Yes, you can) or Ne, negalite (No, you can't).",
          usage: [
            "Ar galiu atsisėsti? — Can I sit down?",
            "Ar galiu eiti? — Can I go?",
            "Ar galiu įeiti? — Can I come in / enter?",
            "Ar galiu pažiūrėti? — Can I look / have a look?",
            "Taip, galite. — Yes, you can.",
          ],
        },
        blocks: [
          {
            id: "s2m2l1_b1",
            type: "learn",
            title: "Can I…?",
            items: [
              { id: "c1", lt: "Ar galiu atsisėsti?", en: "Can I sit down?", audioText: "Ar galiu atsisėsti", saveable: true, core: true },
              { id: "c2", lt: "Ar galiu eiti?", en: "Can I go?", audioText: "Ar galiu eiti", saveable: true, core: true },
              { id: "c3", lt: "Ar galiu įeiti?", en: "Can I come in?", audioText: "Ar galiu įeiti", saveable: true, core: true },
              { id: "c4", lt: "Ar galiu pažiūrėti?", en: "Can I have a look?", audioText: "Ar galiu pažiūrėti", saveable: true, core: true },
              { id: "c5", lt: "Taip, galite.", en: "Yes, you can.", audioText: "Taip, galite", saveable: false, core: false },
              { id: "c6", lt: "Kėdė", en: "Chair", audioText: "Kėdė", saveable: true, core: false },
              { id: "c7", lt: "Vieta", en: "Seat / place / spot", audioText: "Vieta", saveable: true, core: false },
            ],
          },
          {
            id: "s2m2l1_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Ar galiu įeiti?", audioText: "Ar galiu įeiti" },
            options: [
              { id: "a", text: "Can I sit down?", isCorrect: false },
              { id: "b", text: "Can I come in?", isCorrect: true },
              { id: "c", text: "Can I look?", isCorrect: false },
            ],
          },
          {
            id: "s2m2l1_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar galiu pažiūrėti?", audioText: "Ar galiu pažiūrėti" },
            options: [
              { id: "a", text: "Can I go?", isCorrect: false },
              { id: "b", text: "Can I come in?", isCorrect: false },
              { id: "c", text: "Can I have a look?", isCorrect: true },
            ],
          },
          {
            id: "s2m2l1_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You're at a shop and want to look at something behind the counter." },
            options: [
              { id: "a", text: "Noriu šito.", isCorrect: false },
              { id: "b", text: "Ar galiu pažiūrėti?", isCorrect: true },
              { id: "c", text: "Man reikia pagalbos.", isCorrect: false },
            ],
            feedback: { correct: "Ar galiu pažiūrėti? — polite and natural for any browsing situation." },
          },
          {
            id: "s2m2l1_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask if you can sit down",
            targetText: "Ar galiu atsisėsti?",
            audioText: "Ar galiu atsisėsti",
          },
          {
  id: "s2m2l1_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You arrive at a waiting room and see a chair next to someone.",
  sceneIntro: "You arrive at a waiting room and see a chair next to someone.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You arrive at a waiting room and see a chair next to someone.",
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
      speakerText: "Atsiprašau…",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Noriu atsisėsti.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ar galiu atsisėsti?",
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
          text: "Ne, ačiū.",
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
          text: "Viso gero.",
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
        id: "section_2_module_2_lesson_2",
        code: "2.2.2",
        title: "Can We…?",
        purpose: "Teach coordination language for shared action.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Ar galime…? — Can we…? Same frame as Ar galiu but for groups. Already appeared in Section 1 — this lesson makes it feel automatic.",
          usage: [
            "Ar galime pradėti? — Can we start?",
            "Ar galime eiti? — Can we go?",
            "Ar galime čia atsisėsti? — Can we sit here?",
            "Ar galime palaukti? — Can we wait?",
          ],
        },
        blocks: [
          {
            id: "s2m2l2_b1",
            type: "learn",
            title: "Can we…?",
            items: [
              { id: "w1", lt: "Ar galime pradėti?", en: "Can we start?", audioText: "Ar galime pradėti", saveable: true, core: true },
              { id: "w2", lt: "Ar galime eiti?", en: "Can we go?", audioText: "Ar galime eiti", saveable: true, core: true },
              { id: "w3", lt: "Ar galime čia atsisėsti?", en: "Can we sit here?", audioText: "Ar galime čia atsisėsti", saveable: true, core: true },
              { id: "w4", lt: "Ar galime palaukti?", en: "Can we wait?", audioText: "Ar galime palaukti", saveable: true, core: true },
              { id: "w5", lt: "Palaukti", en: "To wait", audioText: "Palaukti", saveable: false, core: false },
            ],
          },
          {
            id: "s2m2l2_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Ar galime palaukti?", audioText: "Ar galime palaukti" },
            options: [
              { id: "a", text: "Can we go?", isCorrect: false },
              { id: "b", text: "Can we start?", isCorrect: false },
              { id: "c", text: "Can we wait?", isCorrect: true },
            ],
          },
          {
            id: "s2m2l2_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar galime čia atsisėsti?", audioText: "Ar galime čia atsisėsti" },
            options: [
              { id: "a", text: "Can we start?", isCorrect: false },
              { id: "b", text: "Can we sit here?", isCorrect: true },
              { id: "c", text: "Can we wait?", isCorrect: false },
            ],
          },
          {
            id: "s2m2l2_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask if we can start",
            targetText: "Ar galime pradėti?",
            audioText: "Ar galime pradėti",
          },
          {
  id: "s2m2l2_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You and a friend arrive at a café and see a free table.",
  sceneIntro: "You and a friend arrive at a café and see a free table.",
  location: "casual conversation",
  userRole: "friend",
  register: "casual",
  goal: "You and a friend arrive at a café and see a free table.",
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
      speakerText: "Laba diena! Ar galiu jums padėti?",
      supportText: "Good day! Can I help you?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
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
          text: "Ar galime čia atsisėsti?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Noriu eiti.",
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
      speakerText: "Taip, galite.",
      supportText: "Yes, you can.",
      sceneDirection: "The conversation continues.",
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
          text: "Ačiū!",
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
      speakerId: "friend",
      speakerLabel: "Friend",
      speakerText: "Ko norite?",
      supportText: "What do you want?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Ar galime palaukti?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Noriu kavos, prašau.",
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
        id: "section_2_module_2_lesson_3",
        code: "2.2.3",
        title: "Can You…?",
        purpose: "Teach requesting action from another person. Recycles Section 1 help/repeat language naturally.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Ar galite…? — Can you…? The polite/formal form. One of the strongest public-use beginner tools in the course.",
          usage: [
            "Ar galite padėti? — Can you help?",
            "Ar galite pakartoti? — Can you repeat?",
            "Ar galite parodyti? — Can you show me?",
            "Ar galite kalbėti lėčiau? — Can you speak more slowly?",
            "Taip, žinoma. — Yes, of course.",
          ],
        },
        blocks: [
          {
            id: "s2m2l3_b1",
            type: "learn",
            title: "Can you…?",
            items: [
              { id: "cy1", lt: "Ar galite padėti?", en: "Can you help?", audioText: "Ar galite padėti", saveable: true, core: true },
              { id: "cy2", lt: "Ar galite pakartoti?", en: "Can you repeat?", audioText: "Ar galite pakartoti", saveable: true, core: true },
              { id: "cy3", lt: "Ar galite parodyti?", en: "Can you show me?", audioText: "Ar galite parodyti", saveable: true, core: true },
              { id: "cy4", lt: "Ar galite kalbėti lėčiau?", en: "Can you speak more slowly?", audioText: "Ar galite kalbėti lėčiau", saveable: true, core: true },
              { id: "cy5", lt: "Taip, žinoma.", en: "Yes, of course.", audioText: "Taip, žinoma", saveable: false, core: false },
              { id: "cy6", lt: "Parodyti", en: "To show", audioText: "Parodyti", saveable: false, core: false },
              { id: "cy7", lt: "Kelias", en: "Road / route / way", audioText: "Kelias", saveable: true, core: false },
              { id: "cy8", lt: "Taksi", en: "Taxi", audioText: "Taksi", saveable: true, core: false },
            ],
          },
          {
            id: "s2m2l3_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Ar galite parodyti?", audioText: "Ar galite parodyti" },
            options: [
              { id: "a", text: "Can you repeat?", isCorrect: false },
              { id: "b", text: "Can you show me?", isCorrect: true },
              { id: "c", text: "Can you help?", isCorrect: false },
            ],
          },
          {
            id: "s2m2l3_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar galite kalbėti lėčiau?", audioText: "Ar galite kalbėti lėčiau" },
            options: [
              { id: "a", text: "Can you help?", isCorrect: false },
              { id: "b", text: "Can you repeat?", isCorrect: false },
              { id: "c", text: "Can you speak more slowly?", isCorrect: true },
            ],
          },
          {
            id: "s2m2l3_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone is speaking too fast and you can't follow. What do you ask?" },
            options: [
              { id: "a", text: "Ar galite padėti?", isCorrect: false },
              { id: "b", text: "Ar galite parodyti?", isCorrect: false },
              { id: "c", text: "Ar galite kalbėti lėčiau?", isCorrect: true },
            ],
            feedback: { correct: "Ar galite kalbėti lėčiau? — your best tool when you're losing the pace." },
          },
          {
            id: "s2m2l3_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask if they can repeat",
            targetText: "Ar galite pakartoti?",
            audioText: "Ar galite pakartoti",
          },
          {
            id: "s2m2l3_b6",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Can you show me?" },
            tokens: [
              { id: "t1", text: "Ar", correctIndex: 0 },
              { id: "t2", text: "galite", correctIndex: 1 },
              { id: "t3", text: "parodyti?", correctIndex: 2 },
              { id: "t4", text: "pakartoti?", isDistractor: true },
            ],
            answerText: "Ar galite parodyti?",
          },
          {
  id: "s2m2l3_b7_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're in a shop and want to see an item more closely.",
  sceneIntro: "You're in a shop and want to see an item more closely.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're in a shop and want to see an item more closely.",
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
      speakerText: "Ar galiu jums padėti?",
      supportText: "Can I help you?",
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
          text: "Taip! Ar galite parodyti?",
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
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Taip, žinoma.",
      supportText: "Yes, of course.",
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
          text: "Ačiū labai!",
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
      ],
    },
    {
      id: "step_3",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Prašau.",
      supportText: "Here you go.",
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
          text: "Noriu šito.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Ar galite pakartoti?",
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
        id: "section_2_module_2_lesson_4",
        code: "2.2.4",
        title: "I Can / I Can't",
        purpose: "Add ability and limitation as response tools.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Galiu = I can. Negaliu = I can't. Simple, high-value contrast.",
          usage: [
            "Aš galiu kalbėti šiek tiek lietuviškai. — I can speak a little Lithuanian.",
            "Aš negaliu suprasti. — I can't understand.",
            "Aš galiu palaukti. — I can wait.",
            "Aš negaliu eiti. — I can't go.",
          ],
        },
        blocks: [
          {
            id: "s2m2l4_b1",
            type: "learn",
            title: "I can / I can't",
            items: [
              { id: "ic1", lt: "Aš galiu…", en: "I can…", audioText: "Aš galiu", saveable: true, core: true },
              { id: "ic2", lt: "Aš negaliu…", en: "I can't…", audioText: "Aš negaliu", saveable: true, core: true },
              { id: "ic3", lt: "Aš galiu kalbėti šiek tiek lietuviškai.", en: "I can speak a little Lithuanian.", audioText: "Aš galiu kalbėti šiek tiek lietuviškai", saveable: true, core: true },
              { id: "ic4", lt: "Aš negaliu suprasti.", en: "I can't understand.", audioText: "Aš negaliu suprasti", saveable: true, core: true },
              { id: "ic5", lt: "Aš galiu palaukti.", en: "I can wait.", audioText: "Aš galiu palaukti", saveable: true, core: true },
              { id: "ic6", lt: "Aš negaliu eiti.", en: "I can't go.", audioText: "Aš negaliu eiti", saveable: true, core: true },
            ],
          },
          {
            id: "s2m2l4_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Aš negaliu suprasti.", audioText: "Aš negaliu suprasti" },
            options: [
              { id: "a", text: "I can understand.", isCorrect: false },
              { id: "b", text: "I can't understand.", isCorrect: true },
              { id: "c", text: "I don't understand.", isCorrect: false },
            ],
          },
          {
            id: "s2m2l4_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Aš galiu palaukti.", audioText: "Aš galiu palaukti" },
            options: [
              { id: "a", text: "I can't wait.", isCorrect: false },
              { id: "b", text: "I need to wait.", isCorrect: false },
              { id: "c", text: "I can wait.", isCorrect: true },
            ],
          },
          {
            id: "s2m2l4_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone asks if you can go now. You can't." },
            options: [
              { id: "a", text: "Aš galiu eiti.", isCorrect: false },
              { id: "b", text: "Aš negaliu eiti.", isCorrect: true },
              { id: "c", text: "Aš galiu palaukti.", isCorrect: false },
            ],
            feedback: { correct: "Aš negaliu eiti — direct and clear." },
          },
          {
            id: "s2m2l4_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I can speak a little Lithuanian",
            targetText: "Aš galiu kalbėti šiek tiek lietuviškai.",
            audioText: "Aš galiu kalbėti šiek tiek lietuviškai",
          },
          {
            id: "s2m2l4_b6",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "I can't understand." },
            tokens: [
              { id: "t1", text: "Aš", correctIndex: 0 },
              { id: "t2", text: "negaliu", correctIndex: 1 },
              { id: "t3", text: "suprasti.", correctIndex: 2 },
              { id: "t4", text: "galiu", isDistractor: true },
            ],
            answerText: "Aš negaliu suprasti.",
          },
          {
  id: "s2m2l4_b7_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "Someone asks if you can come to something later.",
  sceneIntro: "Someone asks if you can come to something later.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "Someone asks if you can come to something later.",
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
      speakerText: "Ar galite eiti dabar?",
      supportText: "Can you go now?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Aš galiu eiti.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Aš negaliu eiti. Galiu palaukti.",
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
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Gerai, palaukite.",
      supportText: "Fine, please wait.",
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
        id: "section_2_module_2_lesson_5",
        code: "2.2.5",
        title: "Is It Possible?",
        purpose: "Introduce a softer, less direct possibility frame. Stretch lesson — recognition-focused.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Ar galima…? — Is it possible…? / Is it allowed? A softer frame than Ar galiu. Good for polite public situations.",
          usage: [
            "Ar galima mokėti kortele? — Is it possible to pay by card?",
            "Ar galima dabar? — Is it possible now?",
            "Ar galima čia laukti? — Is it possible to wait here?",
            "Taip, galima. — Yes, it's possible.",
          ],
        },
        blocks: [
          {
            id: "s2m2l5_b1",
            type: "learn",
            title: "Is it possible…?",
            items: [
              { id: "p1", lt: "Ar galima…?", en: "Is it possible…? / Is it allowed?", audioText: "Ar galima", saveable: true, core: true },
              { id: "p2", lt: "Ar galima mokėti kortele?", en: "Is it possible to pay by card?", audioText: "Ar galima mokėti kortele", saveable: true, core: true },
              { id: "p3", lt: "Ar galima dabar?", en: "Is it possible now?", audioText: "Ar galima dabar", saveable: true, core: true },
              { id: "p4", lt: "Ar galima čia laukti?", en: "Is it possible to wait here?", audioText: "Ar galima čia laukti", saveable: true, core: true },
              { id: "p5", lt: "Taip, galima.", en: "Yes, it's possible.", audioText: "Taip, galima", saveable: false, core: false },
              { id: "p6", lt: "Mokėti kortele", en: "To pay by card", audioText: "Mokėti kortele", saveable: true, core: false },
              { id: "p7", lt: "Kavinė", en: "Café", audioText: "Kavinė", saveable: true, core: false },
              { id: "p8", lt: "Grynaisiais", en: "With cash / in cash", audioText: "Grynaisiais", saveable: true, core: false },
            ],
          },
          {
            id: "s2m2l5_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Ar galima mokėti kortele?", audioText: "Ar galima mokėti kortele" },
            options: [
              { id: "a", text: "Can you pay by card?", isCorrect: false },
              { id: "b", text: "Do you have a card?", isCorrect: false },
              { id: "c", text: "Is it possible to pay by card?", isCorrect: true },
            ],
          },
          {
            id: "s2m2l5_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You're at a shop and want to know if you can pay by card rather than cash." },
            options: [
              { id: "a", text: "Ar galiu atsisėsti?", isCorrect: false },
              { id: "b", text: "Ar galima mokėti kortele?", isCorrect: true },
              { id: "c", text: "Turiu kortelę.", isCorrect: false },
            ],
            feedback: { correct: "Ar galima mokėti kortele? — polite and perfect for this situation." },
          },
          {
            id: "s2m2l5_b4",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar galima čia laukti?", audioText: "Ar galima čia laukti" },
            options: [
              { id: "a", text: "Is it possible to go here?", isCorrect: false },
              { id: "b", text: "Is it possible to wait here?", isCorrect: true },
              { id: "c", text: "Can I sit here?", isCorrect: false },
            ],
          },
          {
  id: "s2m2l5_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a market stall and want to pay by card.",
  sceneIntro: "You're at a market stall and want to pay by card.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're at a market stall and want to pay by card.",
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
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Prašau.",
      supportText: "Here you go / that's ready.",
      sceneDirection: "The exchange begins.",
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
          text: "Ar galima mokėti kortele?",
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
    },
    {
      id: "step_2",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Taip, galima.",
      supportText: "Yes, that's possible.",
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

      // ── Checkpoint ──────────────────────────────────────────────────────────
      {
        id: "section_2_module_2_checkpoint",
        code: "2.2.C",
        title: "Checkpoint",
        purpose: "Check you can use all Module 2.2 frames in practical situations.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s2m2c_b1",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You want to look at something on a shelf in a shop." },
            options: [
              { id: "a", text: "Noriu šito.", isCorrect: false },
              { id: "b", text: "Ar galiu pažiūrėti?", isCorrect: true },
              { id: "c", text: "Man reikia bilieto.", isCorrect: false },
            ],
            feedback: { correct: "Ar galiu pažiūrėti? — polite, natural, and exactly right." },
          },
          {
            id: "s2m2c_b2",
            type: "listen_mcq",
            title: "Listen and identify",
            prompt: { text: "Ar galite pakartoti?", audioText: "Ar galite pakartoti" },
            options: [
              { id: "a", text: "Can you help?", isCorrect: false },
              { id: "b", text: "Can you repeat?", isCorrect: true },
              { id: "c", text: "Can you show me?", isCorrect: false },
            ],
          },
          {
            id: "s2m2c_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone asks if you can go. You can — but you need to wait a moment first." },
            options: [
              { id: "a", text: "Aš negaliu eiti.", isCorrect: false },
              { id: "b", text: "Aš galiu eiti. Galiu palaukti.", isCorrect: false },
              { id: "c", text: "Taip, galiu. Bet galiu palaukti.", isCorrect: true },
            ],
            feedback: { correct: "Confirm you can, then add the condition — natural conversational flow." },
          },
          {
            id: "s2m2c_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Is it possible to pay by card?" },
            tokens: [
              { id: "t1", text: "Ar", correctIndex: 0 },
              { id: "t2", text: "galima", correctIndex: 1 },
              { id: "t3", text: "mokėti", correctIndex: 2 },
              { id: "t4", text: "kortele?", correctIndex: 3 },
              { id: "t5", text: "galite", isDistractor: true },
            ],
            answerText: "Ar galima mokėti kortele?",
          },
          {
            id: "s2m2c_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask if they can speak more slowly",
            targetText: "Ar galite kalbėti lėčiau?",
            audioText: "Ar galite kalbėti lėčiau",
          },
          {
  id: "s2m2c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a ticket office. You need a ticket and want to pay by card.",
  sceneIntro: "You're at a ticket office. You need a ticket and want to pay by card.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "You're at a ticket office. You need a ticket and want to pay by card.",
  focus: ["payment"],
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
      speakerText: "Laba diena! Ko norite?",
      supportText: "Good day! What do you want?",
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
          text: "Man reikia bilieto.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Aš negaliu eiti.",
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
      speakerText: "Ar turite grynųjų?",
      supportText: "Do you have cash?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Taip, turiu grynųjų.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ne, neturiu. Ar galima mokėti kortele?",
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
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Taip, galima. Prašau.",
      supportText: "Yes, that's fine. Here you go.",
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
          text: "Ačiū labai! Viso gero!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Ar galite pakartoti?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    }
  ],
},
          {
            id: "s2m2c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Ar galiu atsisėsti?",          en: "Can I sit down?",                  audioText: "Ar galiu atsisėsti" },
              { id: "m2",  lt: "Ar galiu įeiti?",               en: "Can I come in?",                   audioText: "Ar galiu įeiti" },
              { id: "m3",  lt: "Ar galiu pažiūrėti?",           en: "Can I have a look?",               audioText: "Ar galiu pažiūrėti" },
              { id: "m4",  lt: "Ar galime pradėti?",            en: "Can we start?",                    audioText: "Ar galime pradėti" },
              { id: "m5",  lt: "Ar galime palaukti?",           en: "Can we wait?",                     audioText: "Ar galime palaukti" },
              { id: "m6",  lt: "Ar galite padėti?",             en: "Can you help?",                    audioText: "Ar galite padėti" },
              { id: "m7",  lt: "Ar galite pakartoti?",          en: "Can you repeat?",                  audioText: "Ar galite pakartoti" },
              { id: "m8",  lt: "Ar galite parodyti?",           en: "Can you show me?",                 audioText: "Ar galite parodyti" },
              { id: "m9",  lt: "Ar galite kalbėti lėčiau?",     en: "Can you speak more slowly?",       audioText: "Ar galite kalbėti lėčiau" },
              { id: "m10", lt: "Aš galiu kalbėti šiek tiek lietuviškai.", en: "I can speak a little Lithuanian.", audioText: "Aš galiu kalbėti šiek tiek lietuviškai" },
              { id: "m11", lt: "Aš negaliu suprasti.",          en: "I can't understand.",              audioText: "Aš negaliu suprasti" },
              { id: "m12", lt: "Aš galiu palaukti.",            en: "I can wait.",                      audioText: "Aš galiu palaukti" },
              { id: "m13", lt: "Aš negaliu eiti.",              en: "I can't go.",                      audioText: "Aš negaliu eiti" },
              { id: "m14", lt: "Ar galima mokėti kortele?",     en: "Is it possible to pay by card?",   audioText: "Ar galima mokėti kortele" },
              { id: "m15", lt: "Ar galima dabar?",              en: "Is it possible now?",              audioText: "Ar galima dabar" },
              { id: "m16", lt: "Taip, galima.",                 en: "Yes, it's possible.",              audioText: "Taip, galima" },
              { id: "m17", lt: "Taip, galite.",                 en: "Yes, you can.",                    audioText: "Taip, galite" },
              { id: "m18", lt: "Parodyti",                      en: "To show",                          audioText: "Parodyti" },
              { id: "m19", lt: "Mokėti kortele",                en: "To pay by card",                   audioText: "Mokėti kortele" },
              { id: "m20", lt: "Palaukti",                      en: "To wait",                          audioText: "Palaukti" },
            ],
          },
        ],
      },

    ],
  };
}

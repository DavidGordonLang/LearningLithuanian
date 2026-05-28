// src/content/learning/section2/module_2_4.js
// Module 2.4 — Basic Questions

export default function createModule_2_4(profile = {}) {
  const {
    userFromPhrase = "Aš esu iš Škotijos",
    userFromCountryLabelEn = "Scotland",
  } = profile;

  return {
    id: "module_2_4",
    code: "2.4",
    title: "Basic Questions",
    status: "active",
    lessonCount: 6,
    lessons: [

      // ── Lesson 1 ────────────────────────────────────────────────────────────
      {
        id: "section_2_module_4_lesson_1",
        code: "2.4.1",
        title: "What?",
        purpose: "Teach the learner to ask for basic information. Builds on Kas tai? from Section 1.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Kas? = What? / Who? Ko norite? = What do you want? Ko jums reikia? = What do you need? The question word changes form depending on the verb.",
          usage: [
            "Kas tai? — What is this? (already known)",
            "Ko norite? — What do you want?",
            "Ko jums reikia? — What do you need?",
            "Kas atsitiko? — What happened?",
          ],
        },
        blocks: [
          {
            id: "s2m4l1_b1",
            type: "learn",
            title: "What?",
            items: [
              { id: "q1", lt: "Kas?", en: "What? / Who?", audioText: "Kas", saveable: true, core: true },
              { id: "q2", lt: "Kas tai?", en: "What is this?", audioText: "Kas tai", saveable: true, core: true },
              { id: "q3", lt: "Ko norite?", en: "What do you want?", audioText: "Ko norite", saveable: true, core: true },
              { id: "q4", lt: "Ko jums reikia?", en: "What do you need?", audioText: "Ko jums reikia", saveable: true, core: true },
              { id: "q5", lt: "Kas atsitiko?", en: "What happened?", audioText: "Kas atsitiko", saveable: true, core: false },
              { id: "q6", lt: "Žuvis", en: "Fish", audioText: "Žuvis", saveable: true, core: false },
              { id: "q7", lt: "Mėsa", en: "Meat", audioText: "Mėsa", saveable: true, core: false },
              { id: "q8", lt: "Sriuba", en: "Soup", audioText: "Sriuba", saveable: true, core: false },
            ],
          },
          {
            id: "s2m4l1_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Ko jums reikia?", audioText: "Ko jums reikia" },
            options: [
              { id: "a", text: "What do you want?", isCorrect: false },
              { id: "b", text: "What do you need?", isCorrect: true },
              { id: "c", text: "What is this?", isCorrect: false },
            ],
          },
          {
            id: "s2m4l1_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ko norite?", audioText: "Ko norite" },
            options: [
              { id: "a", text: "What do you need?", isCorrect: false },
              { id: "b", text: "What do you want?", isCorrect: true },
              { id: "c", text: "What is this?", isCorrect: false },
            ],
          },
          {
            id: "s2m4l1_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: What is this?",
            targetText: "Kas tai?",
            audioText: "Kas tai",
          },
          {
  id: "s2m4l1_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a help desk. They ask what you need.",
  sceneIntro: "You're at a help desk. They ask what you need.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "You're at a help desk. They ask what you need.",
  focus: ["conversation practice"],
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
  steps: [
    {
      id: "step_1",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Ko jums reikia?",
      supportText: "What do you need?",
      sceneDirection: "The exchange begins.",
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
          text: "Man reikia bilieto.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Šitas geras.",
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
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Ko norite?",
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
    }
  ],
},
        ],
      },

      // ── Lesson 2 ────────────────────────────────────────────────────────────
      {
        id: "section_2_module_4_lesson_2",
        code: "2.4.2",
        title: "Where?",
        purpose: "Expand location questioning. Kur yra…? was introduced in Section 1 — this lesson makes it broader.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Kur? = Where? The frame Kur yra…? is already familiar. New additions: Kur jūs gyvenate? and Kur einame?",
          usage: [
            "Kur yra stotis? — Where is the station? (already known)",
            "Kur jūs gyvenate? — Where do you live?",
            "Kur einame? — Where are we going?",
            "Kur mes esame? — Where are we?",
          ],
        },
        blocks: [
          {
            id: "s2m4l2_b1",
            type: "learn",
            title: "Where?",
            items: [
              { id: "wh1", lt: "Kur?", en: "Where?", audioText: "Kur", saveable: true, core: true },
              { id: "wh2", lt: "Kur yra stotis?", en: "Where is the station?", audioText: "Kur yra stotis", saveable: true, core: true },
              { id: "wh3", lt: "Kur jūs gyvenate?", en: "Where do you live?", audioText: "Kur jūs gyvenate", saveable: true, core: true },
              { id: "wh4", lt: "Kur einame?", en: "Where are we going?", audioText: "Kur einame", saveable: true, core: true },
              { id: "wh5", lt: "Kur mes esame?", en: "Where are we?", audioText: "Kur mes esame", saveable: true, core: false },
              { id: "wh6", lt: "Gyventi", en: "To live", audioText: "Gyventi", saveable: false, core: false },
            ],
          },
          {
            id: "s2m4l2_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kur jūs gyvenate?", audioText: "Kur jūs gyvenate" },
            options: [
              { id: "a", text: "Where are you going?", isCorrect: false },
              { id: "b", text: "Where do you live?", isCorrect: true },
              { id: "c", text: "Where are we?", isCorrect: false },
            ],
          },
          {
            id: "s2m4l2_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kur einame?", audioText: "Kur einame" },
            options: [
              { id: "a", text: "Where do you live?", isCorrect: false },
              { id: "b", text: "Where are we going?", isCorrect: true },
              { id: "c", text: "Where is the station?", isCorrect: false },
            ],
          },
          {
            id: "s2m4l2_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Where do you live?" },
            tokens: [
              { id: "t1", text: "Kur", correctIndex: 0 },
              { id: "t2", text: "jūs", correctIndex: 1 },
              { id: "t3", text: "gyvenate?", correctIndex: 2 },
              { id: "t4", text: "einame?", isDistractor: true },
            ],
            answerText: "Kur jūs gyvenate?",
          },
          {
            id: "s2m4l2_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: Where are we going?",
            targetText: "Kur einame?",
            audioText: "Kur einame",
          },
          {
  id: "s2m4l2_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You meet someone and they ask where you're from and where you live.",
  sceneIntro: "You meet someone and they ask where you're from and where you live.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You meet someone and they ask where you're from and where you live.",
  focus: ["directions"],
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
      speakerText: "Kur jūs gyvenate?",
      supportText: "Where do you live?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Kur einame?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: `${userFromPhrase}. Gyvenate Lietuvoje.`,
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
      speakerText: "Malonu susipažinti!",
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
          text: "Man irgi!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Ko norite?",
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
        id: "section_2_module_4_lesson_3",
        code: "2.4.3",
        title: "Who?",
        purpose: "Add people-based questioning. Builds on he/she awareness from Section 1.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Kas jis? = Who is he? Kas ji? = Who is she? Kas čia? = Who is this?",
          usage: [
            "Kas jis? — Who is he?",
            "Kas ji? — Who is she?",
            "Kas čia? — Who is this?",
            "Kas tu? — Who are you? (informal — limited)",
            "Jis mano draugas. — He is my friend.",
          ],
        },
        blocks: [
          {
            id: "s2m4l3_b1",
            type: "learn",
            title: "Who?",
            items: [
              { id: "wh1", lt: "Kas jis?", en: "Who is he?", audioText: "Kas jis", saveable: true, core: true },
              { id: "wh2", lt: "Kas ji?", en: "Who is she?", audioText: "Kas ji", saveable: true, core: true },
              { id: "wh3", lt: "Kas čia?", en: "Who is this?", audioText: "Kas čia", saveable: true, core: true },
              { id: "wh4", lt: "Jis mano draugas.", en: "He is my friend.", audioText: "Jis mano draugas", saveable: true, core: false },
              { id: "wh5", lt: "Ji mano draugė.", en: "She is my friend.", audioText: "Ji mano draugė", saveable: true, core: false },
              { id: "wh6", lt: "Kaimynas", en: "Neighbour (male)", audioText: "Kaimynas", saveable: true, core: false },
              { id: "wh7", lt: "Šeima", en: "Family", audioText: "Šeima", saveable: true, core: false },
            ],
          },
          {
            id: "s2m4l3_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kas čia?", audioText: "Kas čia" },
            options: [
              { id: "a", text: "Who is he?", isCorrect: false },
              { id: "b", text: "Who is this?", isCorrect: true },
              { id: "c", text: "Who is she?", isCorrect: false },
            ],
          },
          {
            id: "s2m4l3_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kas ji?", audioText: "Kas ji" },
            options: [
              { id: "a", text: "Who is he?", isCorrect: false },
              { id: "b", text: "Who is this?", isCorrect: false },
              { id: "c", text: "Who is she?", isCorrect: true },
            ],
          },
          {
            id: "s2m4l3_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone points at a person across the room and asks who they are. What do you say to ask back politely?" },
            options: [
              { id: "a", text: "Kas tai?", isCorrect: false },
              { id: "b", text: "Kas jis?", isCorrect: true },
              { id: "c", text: "Kas šitas?", isCorrect: false },
            ],
            feedback: { correct: "Kas jis? — who is he? Natural for asking about a specific person." },
          },
          {
            id: "s2m4l3_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: Who is she?",
            targetText: "Kas ji?",
            audioText: "Kas ji",
          },
          {
  id: "s2m4l3_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're with a Lithuanian friend and spot someone you don't recognise.",
  sceneIntro: "You're with a Lithuanian friend and spot someone you don't recognise.",
  location: "casual conversation",
  userRole: "friend",
  register: "casual",
  goal: "You're with a Lithuanian friend and spot someone you don't recognise.",
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
      speakerText: "Atsiprašau…",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Kas tai?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Kas jis?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Ar tu kalbi angliškai?",
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
      speakerText: "Jis mano kolega. Rokas.",
      supportText: "He's my colleague. Rokas.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Ko norite?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Malonu susipažinti!",
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
    }
  ],
},
        ],
      },

      // ── Lesson 4 ────────────────────────────────────────────────────────────
      {
        id: "section_2_module_4_lesson_4",
        code: "2.4.4",
        title: "When?",
        purpose: "Introduce basic time-question use without teaching the full time system.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Kada? = When? Paired with dabar (now), vėliau (later), rytoj (tomorrow) — these three cover most beginner time needs.",
          usage: [
            "Kada pradedame? — When do we start?",
            "Kada einame? — When are we going?",
            "Dabar. — Now.",
            "Vėliau. — Later.",
            "Rytoj. — Tomorrow.",
          ],
        },
        blocks: [
          {
            id: "s2m4l4_b1",
            type: "learn",
            title: "When?",
            items: [
              { id: "wn1", lt: "Kada?", en: "When?", audioText: "Kada", saveable: true, core: true },
              { id: "wn2", lt: "Kada pradedame?", en: "When do we start?", audioText: "Kada pradedame", saveable: true, core: true },
              { id: "wn3", lt: "Kada einame?", en: "When are we going?", audioText: "Kada einame", saveable: true, core: true },
              { id: "wn4", lt: "Dabar.", en: "Now.", audioText: "Dabar", saveable: true, core: true },
              { id: "wn5", lt: "Vėliau.", en: "Later.", audioText: "Vėliau", saveable: true, core: true },
              { id: "wn6", lt: "Rytoj.", en: "Tomorrow.", audioText: "Rytoj", saveable: true, core: true },
            ],
          },
          {
            id: "s2m4l4_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kada pradedame?", audioText: "Kada pradedame" },
            options: [
              { id: "a", text: "When are we going?", isCorrect: false },
              { id: "b", text: "When do we start?", isCorrect: true },
              { id: "c", text: "Can we start?", isCorrect: false },
            ],
          },
          {
            id: "s2m4l4_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Vėliau.", audioText: "Vėliau" },
            options: [
              { id: "a", text: "Now.", isCorrect: false },
              { id: "b", text: "Tomorrow.", isCorrect: false },
              { id: "c", text: "Later.", isCorrect: true },
            ],
          },
          {
            id: "s2m4l4_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Someone asks Kada einame? You can't go now — maybe tomorrow." },
            options: [
              { id: "a", text: "Dabar.", isCorrect: false },
              { id: "b", text: "Aš negaliu eiti. Gal rytoj.", isCorrect: true },
              { id: "c", text: "Ar galime pradėti?", isCorrect: false },
            ],
            feedback: { correct: "Aš negaliu eiti — I can't go. Gal rytoj — maybe tomorrow." },
          },
          {
            id: "s2m4l4_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: When do we start?",
            targetText: "Kada pradedame?",
            audioText: "Kada pradedame",
          },
          {
  id: "s2m4l4_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're arranging something with a Lithuanian contact.",
  sceneIntro: "You're arranging something with a Lithuanian contact.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You're arranging something with a Lithuanian contact.",
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
      speakerText: "Ar galite eiti rytoj?",
      supportText: "Can you go tomorrow?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Kada einame?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip, galiu!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Aš negaliu suprasti.",
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
      speakerText: "Kada pradedame?",
      supportText: "When do we start?",
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
          text: "Rytoj. Ar galime pradėti dabar?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Rytoj — gal vėliau?",
          result: "best",
          progresses: true,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Gerai! Iki rytojaus.",
      supportText: "OK! See you tomorrow.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Ko norite?",
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
          text: "Nesuprantu.",
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
        id: "section_2_module_4_lesson_5",
        code: "2.4.5",
        title: "How Much?",
        purpose: "Introduce one of the most useful real-world questions. Kiek? is a must-have for any practical interaction.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Kiek? = How much? / How many? Kiek tai kainuoja? is one of the most useful questions in the whole course.",
          usage: [
            "Kiek? — How much?",
            "Kiek tai kainuoja? — How much does this cost?",
            "Kiek šitas kainuoja? — How much is this one?",
            "Kiek tas kainuoja? — How much is that one?",
            "Brangu. — Expensive.",
            "Nebrangiai. — Inexpensive / cheap.",
          ],
        },
        blocks: [
          {
            id: "s2m4l5_b1",
            type: "learn",
            title: "How much?",
            items: [
              { id: "hm1", lt: "Kiek?", en: "How much? / How many?", audioText: "Kiek", saveable: true, core: true },
              { id: "hm2", lt: "Kiek tai kainuoja?", en: "How much does this cost?", audioText: "Kiek tai kainuoja", saveable: true, core: true },
              { id: "hm3", lt: "Kiek šitas kainuoja?", en: "How much is this one?", audioText: "Kiek šitas kainuoja", saveable: true, core: true },
              { id: "hm4", lt: "Kiek tas kainuoja?", en: "How much is that one?", audioText: "Kiek tas kainuoja", saveable: true, core: true },
              { id: "hm5", lt: "Brangu.", en: "Expensive.", audioText: "Brangu", saveable: true, core: true },
              { id: "hm6", lt: "Nebrangiai.", en: "Inexpensive / not expensive.", audioText: "Nebrangiai", saveable: true, core: true },
              { id: "hm7", lt: "Kainuoti", en: "To cost", audioText: "Kainuoti", saveable: false, core: false },
              { id: "hm8", lt: "Kaina", en: "Price", audioText: "Kaina", saveable: true, core: false },
              { id: "hm9", lt: "Turgus", en: "Market", audioText: "Turgus", saveable: true, core: false },
              { id: "hm10", lt: "Eurai", en: "Euros", audioText: "Eurai", saveable: true, core: false },
              { id: "hm11", lt: "Centai", en: "Cents", audioText: "Centai", saveable: true, core: false },
            ],
          },
          {
            id: "s2m4l5_b2",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kiek tai kainuoja?", audioText: "Kiek tai kainuoja" },
            options: [
              { id: "a", text: "How much is that one?", isCorrect: false },
              { id: "b", text: "How much does this cost?", isCorrect: true },
              { id: "c", text: "Is this expensive?", isCorrect: false },
            ],
          },
          {
            id: "s2m4l5_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kiek šitas kainuoja?", audioText: "Kiek šitas kainuoja" },
            options: [
              { id: "a", text: "How much is that one?", isCorrect: false },
              { id: "b", text: "How much does this cost?", isCorrect: false },
              { id: "c", text: "How much is this one?", isCorrect: true },
            ],
          },
          {
            id: "s2m4l5_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You pick something up in a shop and want to know the price." },
            options: [
              { id: "a", text: "Noriu šito.", isCorrect: false },
              { id: "b", text: "Kiek tai kainuoja?", isCorrect: true },
              { id: "c", text: "Ar turite meniu?", isCorrect: false },
            ],
            feedback: { correct: "Kiek tai kainuoja? — the most useful question in any shop." },
          },
          {
            id: "s2m4l5_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: How much does this cost?",
            targetText: "Kiek tai kainuoja?",
            audioText: "Kiek tai kainuoja",
          },
          {
            id: "s2m4l5_b6",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "How much is that one?" },
            tokens: [
              { id: "t1", text: "Kiek", correctIndex: 0 },
              { id: "t2", text: "tas", correctIndex: 1 },
              { id: "t3", text: "kainuoja?", correctIndex: 2 },
              { id: "t4", text: "šitas", isDistractor: true },
            ],
            answerText: "Kiek tas kainuoja?",
          },
          {
  id: "s2m4l5_b7_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a market and spot two items you like.",
  sceneIntro: "You're at a market and spot two items you like.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're at a market and spot two items you like.",
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
      speakerText: "Atsiprašau…",
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
          text: "Kiek šitas kainuoja?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Kas šitas?",
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
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Noriu to.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "O kiek tas kainuoja?",
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
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Tas — penkiolika eurų.",
      supportText: "That one — fifteen euros.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Brangu.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Viso gero.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "c",
          text: "Tas geresnis. Noriu to. Turiu kortelę.",
          result: "best",
          progresses: true,
        }
      ],
    },
    {
      id: "step_4",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Gerai, galima kortele. Prašau.",
      supportText: "Fine, card is OK. Here you go.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Ko norite?",
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
          text: "Kiek tai kainuoja?",
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
        id: "section_2_module_4_checkpoint",
        code: "2.4.C",
        title: "Checkpoint",
        purpose: "Check you can ask and respond to all basic question words in practical contexts.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s2m4c_b1",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You pick up an item in a shop and want to know the price." },
            options: [
              { id: "a", text: "Kas tai?", isCorrect: false },
              { id: "b", text: "Kiek tai kainuoja?", isCorrect: true },
              { id: "c", text: "Noriu šito.", isCorrect: false },
            ],
            feedback: { correct: "Kiek tai kainuoja? — the essential price question." },
          },
          {
            id: "s2m4c_b2",
            type: "listen_mcq",
            title: "Listen and identify",
            prompt: { text: "Kada einame?", audioText: "Kada einame" },
            options: [
              { id: "a", text: "Where are we going?", isCorrect: false },
              { id: "b", text: "When are we going?", isCorrect: true },
              { id: "c", text: "Can we go?", isCorrect: false },
            ],
          },
          {
            id: "s2m4c_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Kur jūs gyvenate?", audioText: "Kur jūs gyvenate" },
            options: [
              { id: "a", text: "Where are you going?", isCorrect: false },
              { id: "b", text: "Where do you live?", isCorrect: true },
              { id: "c", text: "Where are you from?", isCorrect: false },
            ],
          },
          {
            id: "s2m4c_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "How much is this one?" },
            tokens: [
              { id: "t1", text: "Kiek", correctIndex: 0 },
              { id: "t2", text: "šitas", correctIndex: 1 },
              { id: "t3", text: "kainuoja?", correctIndex: 2 },
              { id: "t4", text: "tas", isDistractor: true },
            ],
            answerText: "Kiek šitas kainuoja?",
          },
          {
            id: "s2m4c_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: Where is the station?",
            targetText: "Kur yra stotis?",
            audioText: "Kur yra stotis",
          },
          {
  id: "s2m4c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're in a shop. You want to find something and check the price.",
  sceneIntro: "You're in a shop. You want to find something and check the price.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're in a shop. You want to find something and check the price.",
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
      speakerText: "Ar galiu jums padėti?",
      supportText: "Can I help you?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Ko norite?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip! Kur yra kava?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Brangu.",
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
      speakerText: "Ten, prašau.",
      supportText: "Over there, please.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Kur einame?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ačiū! Kiek tai kainuoja?",
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
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Trys eurai.",
      supportText: "Three euros.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Brangu.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Noriu šito. Ar galima kortele?",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Aš negaliu suprasti.",
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
      speakerText: "Taip, galima. Prašau.",
      supportText: "Yes, that's fine. Here you go.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Ko norite?",
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
          text: "Kada einame?",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    }
  ],
},
          {
            id: "s2m4c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Kas?",                  en: "What? / Who?",                audioText: "Kas" },
              { id: "m2",  lt: "Ko norite?",             en: "What do you want?",           audioText: "Ko norite" },
              { id: "m3",  lt: "Ko jums reikia?",        en: "What do you need?",           audioText: "Ko jums reikia" },
              { id: "m4",  lt: "Kas atsitiko?",          en: "What happened?",              audioText: "Kas atsitiko" },
              { id: "m5",  lt: "Kur?",                   en: "Where?",                      audioText: "Kur" },
              { id: "m6",  lt: "Kur jūs gyvenate?",      en: "Where do you live?",          audioText: "Kur jūs gyvenate" },
              { id: "m7",  lt: "Kur einame?",            en: "Where are we going?",         audioText: "Kur einame" },
              { id: "m8",  lt: "Kas jis?",               en: "Who is he?",                  audioText: "Kas jis" },
              { id: "m9",  lt: "Kas ji?",                en: "Who is she?",                 audioText: "Kas ji" },
              { id: "m10", lt: "Kas čia?",               en: "Who is this?",                audioText: "Kas čia" },
              { id: "m11", lt: "Kada?",                  en: "When?",                       audioText: "Kada" },
              { id: "m12", lt: "Kada pradedame?",        en: "When do we start?",           audioText: "Kada pradedame" },
              { id: "m13", lt: "Dabar.",                 en: "Now.",                        audioText: "Dabar" },
              { id: "m14", lt: "Vėliau.",                en: "Later.",                      audioText: "Vėliau" },
              { id: "m15", lt: "Rytoj.",                 en: "Tomorrow.",                   audioText: "Rytoj" },
              { id: "m16", lt: "Kiek?",                  en: "How much?",                   audioText: "Kiek" },
              { id: "m17", lt: "Kiek tai kainuoja?",     en: "How much does this cost?",    audioText: "Kiek tai kainuoja" },
              { id: "m18", lt: "Brangu.",                en: "Expensive.",                  audioText: "Brangu" },
              { id: "m19", lt: "Nebrangiai.",            en: "Inexpensive.",                audioText: "Nebrangiai" },
              { id: "m20", lt: "Gyventi",                en: "To live",                     audioText: "Gyventi" },
            ],
          },
        ],
      },

    ],
  };
}

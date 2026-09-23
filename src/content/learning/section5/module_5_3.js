// src/content/learning/section5/module_5_3.js
// Module 5.3 — Going Somewhere

export default function createModule_5_3(profile = {}) {
  const { userNameSafe = "Davidas" } = profile;

  return {
    id: "module_5_3",
    code: "5.3",
    title: "Going Somewhere",
    status: "active",
    lessonCount: 5,
    lessons: [

      // ── Lesson 1 — I'm Going To… ──────────────────────────────────────────
      {
        id: "section_5_module_3_lesson_1",
        code: "5.3.1",
        title: "I'm Going To…",
        purpose: "Teach destination-based movement language.",
        supportLevel: "high",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Einu į + destination — I'm going to somewhere. You already know eikite (go, command). Einu is the first person form — I go or I'm going. The destination takes a different ending after į.",
          usage: [
            "Aš einu į stotį — I'm going to the station",
            "Aš einu į viešbutį — I'm going to the hotel",
            "Mes einame į kavinę — We're going to the café",
          ],
        },
        blocks: [
          {
            id: "s5m3l1_b1",
            type: "learn",
            title: "I'm going to…",
            items: [
              { id: "i1", lt: "Aš einu į stotį.",      en: "I'm going to the station.", audioText: "Aš einu į stotį",      saveable: true, core: true },
              { id: "i2", lt: "Aš einu į viešbutį.",   en: "I'm going to the hotel.",   audioText: "Aš einu į viešbutį",   saveable: true, core: true },
              { id: "i3", lt: "Mes einame į kavinę.",  en: "We're going to the café.",  audioText: "Mes einame į kavinę",  saveable: true, core: true },
              { id: "i4", lt: "Aš einu į vaistinę.",   en: "I'm going to the pharmacy.",audioText: "Aš einu į vaistinę",   saveable: true, core: false },
            ],
          },
          {
            id: "s5m3l1_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Aš einu į stotį.", audioText: "Aš einu į stotį" },
            options: [
              { id: "a", text: "I'm going to the hotel.",   isCorrect: false },
              { id: "b", text: "I'm going to the station.", isCorrect: true  },
              { id: "c", text: "I'm going to the café.",    isCorrect: false },
            ],
          },
          {
            id: "s5m3l1_b3",
            type: "choose_correct_form",
            base_word: "stotis",
            word_gloss_en: "station",
            prompt: "Complete the sentence",
            sentence: "Aš einu į ___.",
            translation_en: "I'm going to the station.",
            options: [
              { id: "a", text: "stotis",  isCorrect: false },
              { id: "b", text: "stoties", isCorrect: false },
              { id: "c", text: "stotį",   isCorrect: true  },
            ],
            explanation: "After į (to), the place word changes its ending. Stotis becomes stotį. You don't need to memorise the rule — just notice the pattern.",
          },
          {
            id: "s5m3l1_b4",
            type: "context_gap_select",
            prompt: "Choose the correct phrase",
            sentence: "___ einame į kavinę.",
            translation_en: "We're going to the café.",
            options: [
              { id: "a", text: "Aš",  isCorrect: false },
              { id: "b", text: "Mes", isCorrect: true  },
              { id: "c", text: "Jis", isCorrect: false },
            ],
            explanation: "Mes means we. Einame is the we-form of eiti (to go). Aš einu is I'm going.",
          },
          {
            id: "s5m3l1_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I'm going to the hotel",
            targetText: "Aš einu į viešbutį",
            audioText: "Aš einu į viešbutį",
          },
          {
            id: "s5m3l1_b6_v2",
            type: "scenario_v2",
            title: "Going to the hotel",
            description: "A colleague asks where you are going, then points out the hotel and tells you how far it is.",
            sceneIntro: "A colleague asks where you are going, then points out the hotel and tells you how far it is.",
            location: "street",
            userRole: "traveller",
            register: "informal",
            goal: "Use Einu į… while retrieving earlier location and distance language.",
            focus: ["Einu į"],
            participants: [{ id: "friend", label: "Colleague", name: "Mantas", role: "colleague", gender: "male", relationshipToUser: "colleague", register: "informal" }],
            steps: [
              {
                id: "step_1",
                speakerId: "friend",
                speakerLabel: "Colleague",
                speakerText: "Labas, Davidas! Kur eini?",
                sceneDirection: "You are going to the hotel.",
                learnerPrompt: "Tell Mantas where you are going.",
                options: [
                  { id: "a", text: "Labas! Aš einu į viešbutį.", result: "best", progresses: true },
                  { id: "b", text: "Viso gero.", result: "wrong", feedback: "He asked where you are going.", progresses: false },
                
        {"id":"z","text":"Aš einu į viešbutį.","result":"acceptable","feedback":"The greeting is optional once the conversation is underway.","progresses":true},
      ],
              },
              {
                id: "step_2",
                speakerId: "friend",
                speakerLabel: "Colleague",
                speakerText: "Viešbutis yra ten, tiesiai.",
                sceneDirection: "Mantas points straight ahead.",
                learnerPrompt: "Thank him and ask if it is far.",
                options: [
                  { id: "a", text: "Ačiū! Ar toli?", result: "best", progresses: true },
                  { id: "b", text: "Kur yra bankas?", result: "wrong", feedback: "You are asking about the hotel route.", progresses: false },
                
        {"id":"z","text":"Ar toli?","result":"acceptable","feedback":"The shorter distance question is natural once the destination is clear.","progresses":true},
      ],
              },
              {
                id: "step_3",
                speakerId: "friend",
                speakerLabel: "Colleague",
                speakerText: "Ne, tai netoli. Penkios minutės.",
                sceneDirection: "The hotel is only a short walk away.",
                learnerPrompt: "Acknowledge and thank him.",
                options: [
                  { id: "a", text: "Puiku! Ačiū labai.", result: "best", progresses: true },
                  { id: "b", text: "Per toli.", result: "wrong", feedback: "He just said it is near.", progresses: false },
                
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is also natural.","progresses":true},
      ],
              },
            ],
          },
        ],
      },

      // ── Lesson 2 — From… ──────────────────────────────────────────────────
      {
        id: "section_5_module_3_lesson_2",
        code: "5.3.2",
        title: "From…",
        purpose: "Teach simple movement starting-point language.",
        supportLevel: "high",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Iš means from. Like į before it, iš changes the ending of the place word that follows it. Viešbutis becomes viešbučio after iš. These patterns come up naturally — notice them without worrying about names for them yet.",
          usage: [
            "iš čia — from here",
            "iš viešbučio — from the hotel",
            "iš stoties — from the station",
          ],
        },
        blocks: [
          {
            id: "s5m3l2_b1",
            type: "learn",
            title: "From…",
            items: [
              { id: "i1", lt: "iš čia",          en: "from here",         audioText: "iš čia",          saveable: true, core: true },
              { id: "i2", lt: "iš viešbučio",    en: "from the hotel",    audioText: "iš viešbučio",    saveable: true, core: true },
              { id: "i3", lt: "iš stoties",      en: "from the station",  audioText: "iš stoties",      saveable: true, core: true },
              { id: "i4", lt: "Aš išeinu iš viešbučio.", en: "I'm leaving the hotel.", audioText: "Aš išeinu iš viešbučio", saveable: true, core: false },
            ],
          },
          {
            id: "s5m3l2_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "iš viešbučio", audioText: "iš viešbučio" },
            options: [
              { id: "a", text: "from the station", isCorrect: false },
              { id: "b", text: "from the hotel",   isCorrect: true  },
              { id: "c", text: "to the hotel",      isCorrect: false },
            ],
          },
          {
            id: "s5m3l2_b3",
            type: "choose_correct_form",
            base_word: "stotis",
            word_gloss_en: "station",
            prompt: "Complete the phrase",
            sentence: "Aš einu iš ___.",
            translation_en: "I'm going from the station.",
            options: [
              { id: "a", text: "stotį",   isCorrect: false },
              { id: "b", text: "stotis",  isCorrect: false },
              { id: "c", text: "stoties", isCorrect: true  },
            ],
            explanation: "After iš (from), the ending changes again — stotis becomes stoties. After į (to), it was stotį. The small word before stotis tells you which form to use.",
          },
          {
            id: "s5m3l2_b4",
            type: "context_gap_select",
            prompt: "Choose the correct word",
            sentence: "Aš einu ___ viešbučio į stotį.",
            translation_en: "I'm going from the hotel to the station.",
            options: [
              { id: "a", text: "į",   isCorrect: false },
              { id: "b", text: "iš",  isCorrect: true  },
              { id: "c", text: "čia", isCorrect: false },
            ],
            explanation: "Iš means from — the starting point. Į means to — the destination. Both change the form of the noun that follows.",
          },
          {
  id: "s5m3l2_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "Someone asks where you're coming from. You tell them and head to the station.",
  sceneIntro: "Someone asks where you're coming from. You tell them and head to the station.",
  location: "service desk",
  userRole: "traveller",
  register: "polite_service",
  goal: "Someone asks where you're coming from. You tell them and head to the station.",
  focus: ["directions"],
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
      speakerText: "Labas! Iš kur eini?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "Labas! Iš viešbučio. Einu į stotį.",
          textEn: "Hi! From the hotel. I'm going to the station.",
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
        {"id":"z","text":"Iš viešbučio. Einu į stotį.","result":"acceptable","feedback":"The greeting is optional once the conversation is underway.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Stotis yra netoli. Tiesiai, paskui kairėn.",
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
          text: "Ačiū! Suprantu.",
          textEn: "Thank you! I understand.",
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
    },
    {
      id: "step_3",
      speakerId: "assistant",
      speakerLabel: "Assistant",
      speakerText: "Prašom. Geros kelionės!",
      supportText: "geros kelionės — have a good journey",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Laba diena.",
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
          text: "Atsiprašau.",
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

      // ── Lesson 3 — In… ───────────────────────────────────────────────────
      {
        id: "section_5_module_3_lesson_3",
        code: "5.3.3",
        title: "In…",
        purpose: "Teach simple place-presence language.",
        supportLevel: "high",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Being in a place is expressed by another ending change. Viešbutis becomes viešbutyje, kavinė becomes kavinėje, miestas (city) becomes mieste. Again — just notice the pattern. To, from, and in all change the ending in different ways.",
          usage: [
            "mieste — in the city",
            "viešbutyje — in the hotel",
            "kavinėje — in the café",
          ],
        },
        blocks: [
          {
            id: "s5m3l3_b1",
            type: "learn",
            title: "In…",
            items: [
              { id: "i1", lt: "mieste",           en: "in the city",   audioText: "mieste",           saveable: true, core: true },
              { id: "i2", lt: "viešbutyje",       en: "in the hotel",  audioText: "viešbutyje",       saveable: true, core: true },
              { id: "i3", lt: "kavinėje",         en: "in the café",   audioText: "kavinėje",         saveable: true, core: true },
              { id: "i4", lt: "Aš esu mieste.",   en: "I'm in the city.",  audioText: "Aš esu mieste",    saveable: true, core: true },
              { id: "i5", lt: "Mes esame viešbutyje.", en: "We are in the hotel.", audioText: "Mes esame viešbutyje", saveable: true, core: true },
            ],
          },
          {
            id: "s5m3l3_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "viešbutyje", audioText: "viešbutyje" },
            options: [
              { id: "a", text: "to the hotel",   isCorrect: false },
              { id: "b", text: "from the hotel", isCorrect: false },
              { id: "c", text: "in the hotel",   isCorrect: true  },
            ],
          },
          {
            id: "s5m3l3_b3",
            type: "choose_correct_form",
            base_word: "kavinė",
            word_gloss_en: "café",
            prompt: "Complete the sentence",
            sentence: "Ji yra ___.",
            translation_en: "She is in the café.",
            options: [
              { id: "a", text: "kavinę",   isCorrect: false },
              { id: "b", text: "kavinėje", isCorrect: true  },
              { id: "c", text: "kavinės",  isCorrect: false },
            ],
            explanation: "Kavinėje means in the café — the location form. Kavinę is used after į (going to the café). Kavinės is the of-form.",
          },
          {
            id: "s5m3l3_b4",
            type: "context_gap_select",
            prompt: "Choose the correct form",
            sentence: "Kur jūs esate? — Aš esu ___.",
            translation_en: "Where are you? — I'm in the city.",
            options: [
              { id: "a", text: "miestą",  isCorrect: false },
              { id: "b", text: "miesto",  isCorrect: false },
              { id: "c", text: "mieste",  isCorrect: true  },
            ],
            explanation: "Mieste is the in-location form of miestas (city). Notice: miestą would follow į (going to the city), mieste follows esu (being in the city).",
          },
          {
            id: "s5m3l3_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I'm in the city",
            targetText: "Aš esu mieste",
            audioText: "Aš esu mieste",
          },
          {
            id: "s5m3l3_b6_v2",
            type: "scenario_v2",
            title: "Where are you?",
            description: "A friend asks where you are. You are at the hotel, while they are already at the café.",
            sceneIntro: "A friend asks where you are. You are at the hotel, while they are already at the café.",
            location: "text conversation",
            userRole: "friend",
            register: "informal",
            goal: "Contrast being in a place with going to a place using forms taught in this lesson.",
            focus: ["viešbutyje", "kavinėje", "į kavinę"],
            participants: [{ id: "friend", label: "Friend", name: "Mantas", role: "friend", gender: "male", relationshipToUser: "friend", register: "informal" }],
            steps: [
              {
                id: "step_1",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Labas! Kur tu esi?",
                sceneDirection: "You are at the hotel.",
                learnerPrompt: "Tell Mantas where you are.",
                options: [
                  { id: "a", text: "Labas! Esu viešbutyje.", result: "best", progresses: true },
                  { id: "b", text: "Einu į viešbutį.", result: "wrong", feedback: "The scene says you are already at the hotel.", progresses: false },
                
        {"id":"z","text":"Esu viešbutyje.","result":"acceptable","feedback":"The greeting is optional once the conversation is underway.","progresses":true},
      ],
              },
              {
                id: "step_2",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Aš esu kavinėje.",
                sceneDirection: "Mantas is already at the café. You are heading there now.",
                learnerPrompt: "Tell him you are going to the café.",
                options: [
                  { id: "a", text: "Gerai! Einu į kavinę.", result: "best", progresses: true },
                  { id: "b", text: "Esu kavinėje.", result: "wrong", feedback: "Mantas is at the café; you are still going there.", progresses: false },
                
        {"id":"z","text":"Kiek tai kainuoja?","result":"wrong","feedback":"This does not answer what the speaker is asking here.","progresses":false},
      ],
              },
              {
                id: "step_3",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Kavinė yra netoli.",
                sceneDirection: "The café is nearby.",
                learnerPrompt: "Acknowledge and close casually.",
                options: [
                  { id: "a", text: "Puiku! Iki!", result: "best", progresses: true },
                  { id: "b", text: "Per toli.", result: "wrong", feedback: "He just said the café is near.", progresses: false },
                
        {"id":"z","text":"Kiek tai kainuoja?","result":"wrong","feedback":"This does not answer what the speaker is asking here.","progresses":false},
      ],
              },
            ],
          },
        ],
      },

      // ── Lesson 4 — Where Are You Going? ──────────────────────────────────
      {
        id: "section_5_module_3_lesson_4",
        code: "5.3.4",
        title: "Where Are You Going?",
        purpose: "Turn movement language into interaction.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        blocks: [
          {
            id: "s5m3l4_b1",
            type: "learn",
            title: "Movement questions",
            items: [
              { id: "i1", lt: "Kur eini?",          en: "Where are you going? (informal)", audioText: "Kur eini",          saveable: true, core: true },
              { id: "i2", lt: "Kur einate?",        en: "Where are you going? (formal)",   audioText: "Kur einate",        saveable: true, core: true },
              { id: "i3", lt: "Kur mes einame?",    en: "Where are we going?",             audioText: "Kur mes einame",    saveable: true, core: true },
              { id: "i4", lt: "Ar einate į stotį?", en: "Are you going to the station?",  audioText: "Ar einate į stotį", saveable: true, core: false },
            ],
          },
          {
            id: "s5m3l4_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Kur einate?", audioText: "Kur einate" },
            options: [
              { id: "a", text: "Where are we going?",        isCorrect: false },
              { id: "b", text: "Where are you going?",       isCorrect: true  },
              { id: "c", text: "Are you going to the hotel?",isCorrect: false },
            ],
          },
          {
            id: "s5m3l4_b3",
            type: "conversation_turn_fill",
            scene_label: "In the street",
            lines: [
              { speaker: "Local", text: "Kur einate?", audioText: "Kur einate", hasGap: false },
              { speaker: "You",   text: "___ stotį.",  hasGap: true },
            ],
            options: [
              { id: "a", text: "Iš",  isCorrect: false },
              { id: "b", text: "Į",   isCorrect: true  },
              { id: "c", text: "Prie",isCorrect: false },
            ],
            explanation: "Į stotį — to the station. Į shows movement toward a destination. Iš would mean coming from.",
            translation_en: "Where are you going? — To the station.",
          },
          {
            id: "s5m3l4_b4",
            type: "context_gap_select",
            prompt: "Choose the correct form",
            sentence: "Ar ___ į viešbutį?",
            translation_en: "Are you going to the hotel?",
            options: [
              { id: "a", text: "eini",   isCorrect: false },
              { id: "b", text: "einate", isCorrect: true  },
              { id: "c", text: "einame", isCorrect: false },
            ],
            explanation: "Ar einate — are you going? (formal, addressing one person politely or a group). Eini is informal. Einame is we go.",
          },
          {
            id: "s5m3l4_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask: Where are you going? (formal)",
            targetText: "Kur einate",
            audioText: "Kur einate",
          },
          {
  id: "s5m3l4_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "A colleague spots you in the street and asks where you're heading.",
  sceneIntro: "A colleague spots you in the street and asks where you're heading.",
  location: "work conversation",
  userRole: "colleague",
  register: "polite_friendly",
  goal: "A colleague spots you in the street and asks where you're heading.",
  focus: ["directions"],
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
      speakerId: "colleague",
      speakerLabel: "Colleague",
      speakerText: "Labas! Kur eini?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "Labas! Į stotį. Einu namo.",
          textEn: "Hi! To the station. I'm going home.",
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
        {"id":"z","text":"Į stotį. Einu namo.","result":"acceptable","feedback":"The greeting is optional once the conversation is underway.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "colleague",
      speakerLabel: "Colleague",
      speakerText: "Ar stotis toli?",
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
          text: "Ne, tai netoli. Dešimt minučių.",
          textEn: "No, it's near. Ten minutes.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Ne, netoli. Dešimt minučių.","result":"acceptable","feedback":"A slightly shorter but natural answer.","progresses":true},
      ],
    },
    {
      id: "step_3",
      speakerId: "colleague",
      speakerLabel: "Colleague",
      speakerText: "Gerai. Iki!",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Laba diena.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Iki!",
          textEn: "Bye! Goodbye.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Atsiprašau.",
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

      // ── Lesson 5 — Pattern to Notice ─────────────────────────────────────
      {
        id: "section_5_module_3_lesson_5",
        code: "5.3.5",
        title: "Pattern to Notice",
        purpose: "Prevent the learner from being thrown off when place forms visibly shift.",
        supportLevel: "high",
        newLanguageLoad: "none",
        notes: {
          pattern: "Lithuanian uses endings to show what role a word plays in a sentence. To, from, and in are all expressed by changing the ending of the place word — not by keeping it the same and adding a separate word. You have already seen this happening. Here is the pattern in one place.",
          usage: [
            "į stotį — to the station (movement toward)",
            "iš stoties — from the station (movement away from)",
            "stotyje — at/in the station (being there)",
            "į viešbutį — to the hotel",
            "iš viešbučio — from the hotel",
            "viešbutyje — in the hotel",
          ],
        },
        blocks: [
          {
            id: "s5m3l5_b2",
            type: "choose_correct_form",
            base_word: "viešbutis",
            word_gloss_en: "hotel",
            prompt: "The sentence means: I'm going TO the hotel",
            sentence: "Aš einu į ___.",
            translation_en: "I'm going to the hotel.",
            options: [
              { id: "a", text: "viešbutyje", isCorrect: false },
              { id: "b", text: "viešbučio",  isCorrect: false },
              { id: "c", text: "viešbutį",   isCorrect: true  },
            ],
            explanation: "Movement toward — into — uses the į form. Viešbutis becomes viešbutį after į.",
          },
          {
            id: "s5m3l5_b3",
            type: "choose_correct_form",
            base_word: "viešbutis",
            word_gloss_en: "hotel",
            prompt: "The sentence means: I'm coming FROM the hotel",
            sentence: "Aš einu iš ___.",
            translation_en: "I'm leaving the hotel.",
            options: [
              { id: "a", text: "viešbutį",   isCorrect: false },
              { id: "b", text: "viešbučio",  isCorrect: true  },
              { id: "c", text: "viešbutyje", isCorrect: false },
            ],
            explanation: "Movement away from — from — uses the iš form. Viešbutis becomes viešbučio after iš.",
          },
          {
            id: "s5m3l5_b4",
            type: "context_gap_select",
            prompt: "Choose the correct form",
            sentence: "Mes esame ___.",
            translation_en: "We are in the hotel.",
            options: [
              { id: "a", text: "į viešbutį",   isCorrect: false },
              { id: "b", text: "iš viešbučio", isCorrect: false },
              { id: "c", text: "viešbutyje",   isCorrect: true  },
            ],
            explanation: "Esame means we are — no movement. Being in a place uses the location form: viešbutyje.",
          },
          {
  id: "s5m3l5_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You say where you are going and where you are coming from. Later, after you arrive, the same person checks where you are.",
  sceneIntro: "You say where you are going and where you are coming from. Later, after you arrive, the same person checks where you are.",
  location: "hotel reception",
  userRole: "guest",
  register: "polite_service",
  goal: "Notice how the hotel form changes across the conversation.",
  focus: ["directions"],
  participants: [
    {
      "id": "receptionist",
      "label": "Receptionist",
      "name": "Austėja",
      "role": "receptionist",
      "gender": "female",
      "relationshipToUser": "stranger",
      "register": "polite_service"
    },
  ],
  objects: [
    {
      "id": "hotel",
      "lt": "viešbutis",
      "en": "hotel",
      "gender": "masculine",
      "number": "singular"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Kur jūs einate?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "Aš einu į viešbutį.",
          textEn: "I'm going to the hotel.",
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
        {"id":"z","text":"einu į viešbutį.","result":"acceptable","feedback":"Lithuanian naturally allows the pronoun to be dropped here.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "O iš kur jūs einate?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Iš viešbučio.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Iš stoties.",
          textEn: "From the station.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Viešbutyje.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "receptionist",
      speakerLabel: "Receptionist",
      speakerText: "Dabar viešbutyje?",
      sceneDirection: "Later, after you arrive, she checks whether you are at the hotel now.",
      learnerPrompt: "Confirm that you are now at the hotel.",
      options: [
        {
          id: "a",
          text: "Iš viešbučio.",
          result: "wrong",
          feedback: "That means from the hotel. She is checking where you are now.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip, viešbutyje.",
          textEn: "Yes. Thank you!",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Taip.","result":"acceptable","feedback":"This confirms the question, though the fuller answer practises the location form.","progresses":true},
      ],
    }
  ],
},
        ],
      },

      // ── Module 5.3 Checkpoint ─────────────────────────────────────────────
      {
        id: "section_5_module_3_checkpoint",
        code: "5.3.C",
        title: "Going Somewhere Check",
        purpose: "Confirm movement and location language is working together.",
        supportLevel: "low",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s5m3c_b1",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Aš einu į stotį.", audioText: "Aš einu į stotį" },
            options: [
              { id: "a", text: "I'm coming from the station.", isCorrect: false },
              { id: "b", text: "I'm at the station.",          isCorrect: false },
              { id: "c", text: "I'm going to the station.",    isCorrect: true  },
            ],
          },
          {
            id: "s5m3c_b2",
            type: "choose_correct_form",
            base_word: "kavinė",
            word_gloss_en: "café",
            prompt: "The sentence means: We are IN the café",
            sentence: "Mes esame ___.",
            translation_en: "We are in the café.",
            options: [
              { id: "a", text: "kavinę",   isCorrect: false },
              { id: "b", text: "kavinėje", isCorrect: true  },
              { id: "c", text: "kavinės",  isCorrect: false },
            ],
            explanation: "Kavinėje is the in-location form of kavinė. Kavinę follows į (going to the café).",
          },
          {
            id: "s5m3c_b3",
            type: "context_gap_select",
            prompt: "Choose the correct word",
            sentence: "Aš einu ___ viešbučio į stotį.",
            translation_en: "I'm going from the hotel to the station.",
            options: [
              { id: "a", text: "į",  isCorrect: false },
              { id: "b", text: "iš", isCorrect: true  },
              { id: "c", text: "su", isCorrect: false },
            ],
            explanation: "Iš means from — the starting point. Į means to — the destination.",
          },
          {
            id: "s5m3c_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I'm going to the hotel",
            targetText: "Aš einu į viešbutį",
            audioText: "Aš einu į viešbutį",
          },
          {
            id: "s5m3c_b5",
            type: "conversation_turn_fill",
            scene_label: "In the street",
            lines: [
              { speaker: "Local", text: "Kur einate?",  audioText: "Kur einate", hasGap: false },
              { speaker: "You",   text: "___ kavinę.",  hasGap: true },
            ],
            options: [
              { id: "a", text: "Iš",  isCorrect: false },
              { id: "b", text: "Į",   isCorrect: true  },
              { id: "c", text: "Prie",isCorrect: false },
            ],
            explanation: "Į kavinę — to the café. Movement toward a destination uses į.",
            translation_en: "Where are you going? — To the café.",
          },
          {
  id: "s5m3c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "A full movement exchange — where from, where to, how far.",
  sceneIntro: "A full movement exchange — where from, where to, how far.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "A full movement exchange — where from, where to, how far.",
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
      speakerText: "Labas! Kur eini?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "Labas! Einu į kavinę.",
          textEn: "Hi! I'm going to the café. I'm in the city for an hour.",
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
        {"id":"z","text":"Einu į kavinę.","result":"acceptable","feedback":"The greeting is optional once the conversation is underway.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Iš kur eini?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Į stotį.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Iš viešbučio.",
          textEn: "From the hotel.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Viešbutyje.",
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
      speakerText: "Ar viešbutis toli?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "Ne, tai netoli. Dešimt minučių.",
          textEn: "No, it's near. Ten minutes.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Tai labai toli.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ,
        {"id":"z","text":"Ne, netoli. Dešimt minučių.","result":"acceptable","feedback":"A slightly shorter but natural answer.","progresses":true},
      ],
    },
    {
      id: "step_4",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Gerai! Iki!",
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
          text: "Iki!",
          textEn: "Bye! Goodbye.",
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
            id: "s5m3c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Aš einu į stotį.",       en: "I'm going to the station.",      audioText: "Aš einu į stotį" },
              { id: "m2",  lt: "Aš einu į viešbutį.",    en: "I'm going to the hotel.",        audioText: "Aš einu į viešbutį" },
              { id: "m3",  lt: "Mes einame į kavinę.",   en: "We're going to the café.",       audioText: "Mes einame į kavinę" },
              { id: "m4",  lt: "iš čia",                 en: "from here",                      audioText: "iš čia" },
              { id: "m5",  lt: "iš viešbučio",           en: "from the hotel",                 audioText: "iš viešbučio" },
              { id: "m6",  lt: "iš stoties",             en: "from the station",               audioText: "iš stoties" },
              { id: "m7",  lt: "mieste",                 en: "in the city",                    audioText: "mieste" },
              { id: "m8",  lt: "viešbutyje",             en: "in the hotel",                   audioText: "viešbutyje" },
              { id: "m9",  lt: "kavinėje",               en: "in the café",                    audioText: "kavinėje" },
              { id: "m10", lt: "Kur eini?",              en: "Where are you going? (informal)",audioText: "Kur eini" },
              { id: "m11", lt: "Kur einate?",            en: "Where are you going? (formal)",  audioText: "Kur einate" },
              { id: "m12", lt: "Ar einate į stotį?",    en: "Are you going to the station?",  audioText: "Ar einate į stotį" },
              { id: "m13", lt: "į stotį",               en: "to the station",                 audioText: "į stotį" },
              { id: "m14", lt: "stotyje",               en: "at the station",                 audioText: "stotyje" },
              { id: "m15", lt: "Aš išeinu iš viešbučio.", en: "I'm leaving the hotel.",        audioText: "Aš išeinu iš viešbučio" },
              { id: "m16", lt: "Kur mes einame?",          en: "Where are we going?",             audioText: "Kur mes einame" },
              { id: "m17", lt: "Aš einu į vaistinę.",      en: "I'm going to the pharmacy.",      audioText: "Aš einu į vaistinę" },
              { id: "m18", lt: "Aš esu mieste.",           en: "I'm in the city.",                 audioText: "Aš esu mieste" },
              { id: "m19", lt: "Mes esame viešbutyje.",    en: "We are in the hotel.",             audioText: "Mes esame viešbutyje" },
              { id: "m20", lt: "Ar toli?",                 en: "Is it far?",                       audioText: "Ar toli" },
            ],
          },
        ],
      },
    ],
  };
}

// src/content/learning/section4/module_4_4.js
// Module 4.4 — Social Food Interaction

export default function createModule_4_4(profile = {}) {
  const {
    userNameSafe = "Davidas",
    userAgePhraseLt = "Man trisdešimt metų",
    speakerGender = "male",
  } = profile;
  const isMale = speakerGender !== "female";
  const alkanas = isMale ? "alkanas" : "alkana";
  const istroskes = isMale ? "ištroškęs" : "ištroškusi";
  const vegetarX = isMale ? "vegetaras" : "vegetarė";
  const vegetarXEn = isMale ? "I am vegetarian. (male)" : "I am vegetarian. (female)";

  return {
    id: "module_4_4",
    code: "4.4",
    title: "Social Food Interaction",
    status: "active",
    lessonCount: 5,
    lessons: [

      // ── Lesson 1 — Are You Hungry? / Are You Thirsty? ────────────────────────
      {
        id: "section_4_module_4_lesson_1",
        code: "4.4.1",
        title: "Are You Hungry? / Are You Thirsty?",
        purpose: "Talk simply about hunger and thirst — the starting point for any social food interaction.",
        supportLevel: "high",
        newLanguageLoad: "low",
        notes: {
          pattern: "Alkanas / alkana means hungry and changes with gender. Ištroškęs / ištroškusi means thirsty. Aš noriu gerti literally means 'I want to drink' and is useful too, but it is not the direct equivalent of 'I'm thirsty'.",
          usage: [
            "Aš alkanas — I'm hungry (male)",
            "Aš alkana — I'm hungry (female)",
            "Aš ištroškęs / ištroškusi — I'm thirsty",
            "Ar tu alkanas? — Are you hungry? (informal, to male)",
          ],
        },
        blocks: [
          {
            id: "s4m4l1_b1",
            type: "learn",
            title: "Hunger and thirst",
            items: [
              { id: "ht1", lt: `Aš ${alkanas}.`, en: `I'm hungry.`, audioText: `Aš ${alkanas}`, saveable: true, core: true },
              { id: "ht2", lt: `Aš ${istroskes}.`, en: "I'm thirsty.", audioText: `Aš ${istroskes}`, saveable: true, core: true },
              { id: "ht2b", lt: "Aš noriu gerti.", en: "I want to drink.", audioText: "Aš noriu gerti", saveable: false, core: false },
              { id: "ht3", lt: "Ar tu alkanas?", en: "Are you hungry? (informal, to male)", audioText: "Ar tu alkanas", saveable: false, core: false },
              { id: "ht4", lt: "Ar tu alkana?", en: "Are you hungry? (informal, to female)", audioText: "Ar tu alkana", saveable: false, core: false },
            ],
          },
          {
            id: "s4m4l1_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Aš alkanas.", audioText: "Aš alkanas" },
            options: [
              { id: "a", text: "I'm thirsty.", isCorrect: false },
              { id: "b", text: "I'm hungry.", isCorrect: true },
              { id: "c", text: "I want to eat.", isCorrect: false },
            ],
          },
          {
            id: "s4m4l1_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: `Aš ${istroskes}.`, audioText: `Aš ${istroskes}` },
            options: [
              { id: "a", text: "I'm hungry.", isCorrect: false },
              { id: "b", text: "I want coffee.", isCorrect: false },
              { id: "c", text: "I'm thirsty.", isCorrect: true },
            ],
          },
          {
            id: "s4m4l1_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: `Say: I'm hungry`,
            targetText: `Aš ${alkanas}`,
            audioText: `Aš ${alkanas}`,
          },
          {
            id: "s4m4l1_b5_v2",
            type: "scenario_v2",
            title: "Hungry and thirsty",
            description: "A friend checks whether you are hungry. You explain that you are hungry and thirsty, then use earlier café language.",
            sceneIntro: "A friend checks whether you are hungry. You explain that you are hungry and thirsty, then use earlier café language.",
            location: "street",
            userRole: "friend",
            register: "informal",
            goal: "Use hungry/thirsty language while retrieving familiar wants and location language.",
            focus: ["alkanas", "ištroškęs", "noriu gerti"],
            participants: [{ id: "friend", label: "Friend", name: "Mantas", role: "friend", gender: "male", relationshipToUser: "friend", register: "informal" }],
            steps: [
              {
                id: "step_1",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Davidas, ar tu alkanas?",
                sceneDirection: "You are hungry.",
                learnerPrompt: "Say that you are hungry too.",
                help: { levels: [
                  { sceneDirection: "Mantas gestures towards his stomach.", speakerText: "Alkanas?" },
                  { speakerText: "Are you hungry?", spokenLanguage: "en", audio: false },
                ]},
                options: [
                  { id: "a", text: "Taip, aš alkanas. O tu?", result: "best", progresses: true },
                  { id: "b", text: "Ne, ačiū.", result: "wrong", feedback: "The scene says you are hungry.", progresses: false },
                
        {"id":"z","text":"Kiek tai kainuoja?","result":"wrong","feedback":"This does not answer the speaker here.","progresses":false},
      ],
              },
              {
                id: "step_2",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Aš irgi. Noriu gerti.",
                sceneDirection: "You are thirsty as well.",
                learnerPrompt: "Say you are thirsty and want water.",
                options: [
                  { id: "a", text: "Aš ištroškęs. Noriu vandens.", result: "best", progresses: true },
                  { id: "b", text: "Užtenka.", result: "wrong", feedback: "You are describing what you need, not stopping a pour.", progresses: false },
                
        {"id":"z","text":"Kiek tai kainuoja?","result":"wrong","feedback":"This does not answer the speaker here.","progresses":false},
      ],
              },
              {
                id: "step_3",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Gerai. Kavinė yra ten.",
                sceneDirection: "Mantas points to a café nearby.",
                learnerPrompt: "Acknowledge and thank him.",
                options: [
                  { id: "a", text: "Puiku! Ačiū.", result: "best", progresses: true },
                  { id: "b", text: "Kur yra bankas?", result: "wrong", feedback: "He has already shown you the café.", progresses: false },
                
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is natural.","progresses":true},
      ],
              },
            ],
          },
        ],
      },

      // ── Lesson 2 — Do You Want…? ─────────────────────────────────────────────
      {
        id: "section_4_module_4_lesson_2",
        code: "4.4.2",
        title: "Do You Want…?",
        purpose: "Offer something and respond — a simple social exchange around food and drink.",
        supportLevel: "high",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Ar nori…? is informal; Ar norite…? is formal/plural. After nori / norite, the thing being wanted often changes form. Do not memorise a grammar table yet — notice the useful chunks: sultys → sulčių, sumuštinis → sumuštinio, obuolys → obuolio, sausainis → sausainio.",
          usage: [
            "Ar nori sulčių? — Do you want juice? (informal)",
            "Ar norite sumuštinio? — Do you want a sandwich? (formal/plural)",
            "Ar nori obuolio? — Do you want an apple? (informal)",
            "Ar nori sausainio? — Do you want a biscuit / cookie? (informal)",
          ],
        },
        blocks: [
          {
            id: "s4m4l2_b1",
            type: "learn",
            title: "Offering and responding",
            items: [
              { id: "of1", lt: "Ar nori sulčių?", en: "Do you want juice? (informal)", audioText: "Ar nori sulčių", saveable: true, core: true },
              { id: "of2", lt: "Ar norite sumuštinio?", en: "Do you want a sandwich? (formal / plural)", audioText: "Ar norite sumuštinio", saveable: true, core: true },
              { id: "of3", lt: "Ar nori obuolio?", en: "Do you want an apple? (informal)", audioText: "Ar nori obuolio", saveable: true, core: true },
              { id: "of4", lt: "sausainis", en: "biscuit / cookie", audioText: "sausainis", saveable: true, core: false },
              { id: "of5", lt: "Ar nori sausainio?", en: "Do you want a biscuit / cookie? (informal)", audioText: "Ar nori sausainio", saveable: true, core: true },
            ],
          },
          {
            id: "s4m4l2_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar norite sumuštinio?", audioText: "Ar norite sumuštinio" },
            options: [
              { id: "a", text: "Do you want a sandwich?", isCorrect: true },
              { id: "b", text: "Do you want juice?", isCorrect: false },
              { id: "c", text: "What would you like?", isCorrect: false },
            ],
          },
          {
            id: "s4m4l2_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Your friend asks: Ar nori sausainio? You'd like one." },
            options: [
              { id: "a", text: "Ne, ačiū.", isCorrect: false },
              { id: "b", text: "Taip, prašau!", isCorrect: true },
              { id: "c", text: "Viso gero.", isCorrect: false },
            ],
            feedback: { correct: "Taip, prašau — Yes, please. A natural acceptance." },
          },
          {
            id: "s4m4l2_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask your friend: Do you want juice?",
            targetText: "Ar nori sulčių",
            audioText: "Ar nori sulčių",
          },
          {
            id: "s4m4l2_b5_v2",
            type: "scenario_v2",
            title: "Sharing lunch at work",
            description: "You brought a sandwich and juice to share with a colleague.",
            sceneIntro: "You brought a sandwich and juice to share with a colleague.",
            location: "work conversation",
            userRole: "colleague",
            register: "polite_friendly",
            goal: "Offer familiar food and drink using nori while retrieving older nouns.",
            focus: ["Ar nori…?", "sumuštinio", "sulčių"],
            participants: [
              { id: "colleague", label: "Colleague", name: "Rokas", role: "colleague", gender: "male", relationshipToUser: "colleague", register: "polite_friendly" },
            ],
            steps: [
              {
                id: "step_1",
                speakerId: "colleague",
                speakerLabel: "Colleague",
                speakerText: "Labas!",
                sceneDirection: "You brought an extra sandwich to share.",
                learnerPrompt: "Greet Rokas and offer him a sandwich.",
                options: [
                  { id: "a", text: "Labas! Ar nori sumuštinio?", result: "best", progresses: true },
                  { id: "b", text: "Labas! Ar nori sulčių?", result: "acceptable", feedback: "Also natural, but the scene first asks you to offer the sandwich.", progresses: true },
                  { id: "c", text: "Viso gero.", result: "wrong", feedback: "You have just started the conversation.", progresses: false },
                ],
              },
              {
                id: "step_2",
                speakerId: "colleague",
                speakerLabel: "Colleague",
                speakerText: "Taip, prašau. Ačiū!",
                sceneDirection: "You also have juice to share.",
                learnerPrompt: "Offer him juice too.",
                options: [
                  { id: "a", text: "Ar nori sulčių?", result: "best", progresses: true },
                  { id: "b", text: "Ar nori obuolio?", result: "acceptable", feedback: "That is a valid offer, but the scene says you have juice to share.", progresses: true },
                  { id: "c", text: "Kiek tai kainuoja?", result: "wrong", feedback: "You are sharing lunch with a colleague, not buying something.", progresses: false },
                ],
              },
              {
                id: "step_3",
                speakerId: "colleague",
                speakerLabel: "Colleague",
                speakerText: "Ne, ačiū. Užtenka.",
                sceneDirection: "Rokas has enough.",
                learnerPrompt: "Acknowledge and hand him the sandwich.",
                options: [
                  { id: "a", text: "Gerai. Prašom!", result: "best", progresses: true },
                  { id: "b", text: "Prašom!", result: "acceptable", feedback: "Short and natural here.", progresses: true },
                  { id: "c", text: "Ar nori dar?", result: "wrong", feedback: "He has just said that he has enough.", progresses: false },
                ],
              },
            ],
          },
        ],
      },

      // ── Lesson 3 — Let's Eat / Let's Drink / Let's Go ────────────────────────
      {
        id: "section_4_module_4_lesson_3",
        code: "4.4.3",
        title: "Let's Eat / Let's Drink / Let's Go",
        purpose: "Make simple social invitations around food and drink.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "Pavalgykime, Išgerkime, Eikime — these are invitation forms ending in -kime. Learn them as fixed social chunks. You already know kavinė (café) from Section 2.",
          usage: [
            "Pavalgykime — Let's eat",
            "Išgerkime sulčių — Let's drink juice",
            "Eikime į kavinę — Let's go to the café",
            "Gal vėliau? — Maybe later?",
          ],
        },
        blocks: [
          {
            id: "s4m4l3_b1",
            type: "learn",
            title: "Social invitations",
            items: [
              { id: "si1", lt: "Pavalgykime.", en: "Let's eat.", audioText: "Pavalgykime", saveable: true, core: true },
              { id: "si2", lt: "Išgerkime sulčių.", en: "Let's drink juice.", audioText: "Išgerkime sulčių", saveable: true, core: true },
              { id: "si3", lt: "Eikime į kavinę.", en: "Let's go to the café.", audioText: "Eikime į kavinę", saveable: true, core: true },
              { id: "si4", lt: "Gal vėliau?", en: "Maybe later?", audioText: "Gal vėliau", saveable: true, core: true },
            ],
          },
          {
            id: "s4m4l3_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Eikime į kavinę.", audioText: "Eikime į kavinę" },
            options: [
              { id: "a", text: "Let's eat.", isCorrect: false },
              { id: "b", text: "Let's go to the café.", isCorrect: true },
              { id: "c", text: "Let's drink juice.", isCorrect: false },
            ],
          },
          {
            id: "s4m4l3_b3",
            type: "recognise_mcq",
            noOptionAudio: true,
            title: "Choose the correct meaning",
            prompt: { text: "Pavalgykime.", audioText: "Pavalgykime" },
            options: [
              { id: "a", text: "Let's drink juice.", isCorrect: false },
              { id: "b", text: "Let's go.", isCorrect: false },
              { id: "c", text: "Let's eat.", isCorrect: true },
            ],
          },
          {
            id: "s4m4l3_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Suggest: Let's go to the café",
            targetText: "Eikime į kavinę",
            audioText: "Eikime į kavinę",
          },
          {
  id: "s4m4l3_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You suggest going to a café with a friend and having something to eat and drink.",
  sceneIntro: "You suggest going to a café with a friend and having something to eat and drink.",
  location: "café",
  userRole: "customer",
  register: "polite_service",
  goal: "Use social invitation language while retrieving sulčių from earlier lessons.",
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
      "id": "juice",
      "lt": "sultys",
      "en": "juice",
      "gender": "feminine",
      "number": "singular"
    },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "barista",
      speakerLabel: "Barista",
      speakerText: `Labas, ${userNameSafe}!`,
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
          text: "Labas! Eikime į kavinę!",
          textEn: "Hi! Let's go to the café!",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Kiek tai kainuoja?","result":"wrong","feedback":"This does not answer the speaker here.","progresses":false},
      ],
    },
    {
      id: "step_2",
      speakerId: "barista",
      speakerLabel: "Barista",
      speakerText: "Gerai! Dabar?",
      sceneDirection: "The conversation continues.",
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
          text: "Taip, dabar!",
          textEn: "Yes, now!",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Kiek tai kainuoja?","result":"wrong","feedback":"This does not answer the speaker here.","progresses":false},
      ],
    },
    {
      id: "step_3",
      speakerId: "barista",
      speakerLabel: "Barista",
      speakerText: "Puiku! Išgerkime sulčių.",
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
          text: "Taip! Ir gal pavalgykime.",
          textEn: "Yes! And maybe let's eat too.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A simple thank-you is also natural.","progresses":true},
      ],
    }
  ],
},
        ],
      },

      // ── Lesson 4 — For Me / For You / For Us ─────────────────────────────────
      {
        id: "section_4_module_4_lesson_4",
        code: "4.4.4",
        title: "For Me / For You / For Us",
        purpose: "Coordinate simple group orders — who something is for.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Man, tau, mums mean to/for me, to/for you, and to/for us. You have seen man before in Man reikia… and Man irgi. Now the same word appears in ordering context.",
          usage: [
            "man — for me / to me",
            "tau / jums — for you / to you",
            "mums — for us",
            "Man sulčių, prašau — Juice for me, please",
            "Mums du sumuštinius — Two sandwiches for us",
          ],
        },
        blocks: [
          {
            id: "s4m4l4_b1",
            type: "learn",
            title: "Ordering for others",
            items: [
              { id: "fo1", lt: "man", en: "for me / to me", audioText: "man", saveable: true, core: true },
              { id: "fo2", lt: "tau", en: "for you (informal)", audioText: "tau", saveable: true, core: true },
              { id: "fo3", lt: "jums", en: "for you (formal / plural)", audioText: "jums", saveable: true, core: true },
              { id: "fo4", lt: "mums", en: "for us", audioText: "mums", saveable: true, core: true },
              { id: "fo5", lt: "Man sulčių, prašau.", en: "Juice for me, please.", audioText: "Man sulčių, prašau", saveable: true, core: true },
              { id: "fo6", lt: "Mums du sumuštinius.", en: "Two sandwiches for us.", audioText: "Mums du sumuštinius", saveable: true, core: true },
              { id: "fo7", lt: "Jums sulčių?", en: "Juice for you?", audioText: "Jums sulčių", saveable: false, core: false },
              { id: "fo8", lt: "Kam sumuštinis?", en: "Who is the sandwich for?", audioText: "Kam sumuštinis", saveable: false, core: false },
            ],
          },
          {
            id: "s4m4l4_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Mums du sumuštinius.", audioText: "Mums du sumuštinius" },
            options: [
              { id: "a", text: "Two sandwiches for me.", isCorrect: false },
              { id: "b", text: "Two sandwiches for us.", isCorrect: true },
              { id: "c", text: "Juice for us.", isCorrect: false },
            ],
          },
          {
            id: "s4m4l4_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Man sulčių, prašau.", audioText: "Man sulčių, prašau" },
            options: [
              { id: "a", text: "Two juices, please.", isCorrect: false },
              { id: "b", text: "Juice for us, please.", isCorrect: false },
              { id: "c", text: "Juice for me, please.", isCorrect: true },
            ],
          },
          // ── Pattern to Notice ────────────────────────────────────────────────
          {
            id: "s4m4l4_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Two sandwiches for us." },
            tokens: [
              { id: "t1", text: "Mums", correctIndex: 0 },
              { id: "t2", text: "du", correctIndex: 1 },
              { id: "t3", text: "sumuštinius", correctIndex: 2 },
              { id: "t4", text: "Man", isDistractor: true, repairHint: "Man means “for me / to me”. The prompt says “for us”, so the singular “me” form doesn’t match the meaning." },
              { id: "t5", text: "sulčių.", isDistractor: true },
            ],
            answerText: "Mums du sumuštinius",
          },
          {
            id: "s4m4l4_b6_v2",
            type: "scenario_v2",
            title: "Lunch for us",
            description: "You and a colleague both want sandwiches. Order for both of you, add juice for yourself, then pay.",
            sceneIntro: "You and a colleague both want sandwiches. Order for both of you, add juice for yourself, then pay.",
            location: "café",
            userRole: "customer",
            register: "polite_service",
            goal: "Use mums and man naturally while retrieving sumuštinis, sultys, quantity and payment language.",
            focus: ["mums", "man", "sumuštinius", "sulčių"],
            participants: [{ id: "server", label: "Server", name: "Ieva", role: "server", gender: "female", relationshipToUser: "stranger", register: "polite_service" }],
            steps: [
              {
                id: "step_1",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Laba diena! Ko norėtumėte?",
                sceneDirection: "You and your colleague both want sandwiches.",
                learnerPrompt: "Order two sandwiches for both of you.",
                options: [
                  { id: "a", text: "Laba diena! Mums du sumuštinius, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Man vieną sumuštinį, prašau.", result: "wrong", feedback: "That only orders one sandwich for you; the scene says you need two for both of you.", progresses: false },
                  { id: "c", text: "Mums du sumuštinius, prašau.", result: "acceptable", feedback: "Natural and clear; the greeting is optional once the exchange is underway.", progresses: true },
                ],
              },
              {
                id: "step_2",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Jums sulčių?",
                sceneDirection: "Your colleague does not want juice, but you do.",
                learnerPrompt: "Ask for juice for yourself.",
                options: [
                  { id: "a", text: "Taip, prašau. Man sulčių.", result: "best", progresses: true },
                  { id: "b", text: "Man sulčių, prašau.", result: "acceptable", feedback: "A concise and natural answer.", progresses: true },
                  { id: "c", text: "Ne, ačiū.", result: "wrong", feedback: "The scene says you want juice for yourself.", progresses: false },
                ],
              },
              {
                id: "step_3",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Gerai. Dvylika eurų. Grynaisiais ar kortele?",
                sceneDirection: "You want to pay in cash.",
                learnerPrompt: "Choose cash.",
                options: [
                  { id: "a", text: "Kortele, prašau.", result: "wrong", feedback: "The scene says you want to use cash.", progresses: false },
                  { id: "b", text: "Grynaisiais, prašau.", result: "best", progresses: true },
                  { id: "c", text: "Grynaisiais.", result: "acceptable", feedback: "A shorter but clear payment answer.", progresses: true },
                ],
              },
              {
                id: "step_4",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Prašom.",
                sceneDirection: "The sandwiches and juice are handed over.",
                learnerPrompt: "Thank Ieva and close.",
                options: [
                  { id: "a", text: "Ačiū labai! Viso gero.", result: "best", progresses: true },
                  { id: "b", text: "Ačiū!", result: "acceptable", feedback: "A simple thank-you is also natural.", progresses: true },
                  { id: "c", text: "Atsiprašau.", result: "wrong", feedback: "Nothing needs an apology.", progresses: false },
                ],
              },
            ],
          },
        ],
      },

      // ── Lesson 5 — This Is Good ───────────────────────────────────────────────
      {
        id: "section_4_module_4_lesson_5",
        code: "4.4.5",
        title: "This Is Good",
        purpose: "React to food and drink with simple positive language — enough to sound human.",
        supportLevel: "low",
        newLanguageLoad: "low",
        notes: {
          pattern: "Tai skanu — this is tasty / delicious. Man patinka — I like it. These are short reactions that make social eating feel natural rather than transactional.",
          usage: [
            "Tai skanu — This is tasty / delicious",
            "Labai skanu — Very tasty",
            "Man patinka — I like it",
            "Neblogai — Not bad",
            "Labai gerai — Very good",
          ],
        },
        blocks: [
          {
            id: "s4m4l5_b1",
            type: "learn",
            title: "Reacting to food and drink",
            items: [
              { id: "rg1", lt: "Tai skanu.", en: "This is tasty / delicious.", audioText: "Tai skanu", saveable: true, core: true },
              { id: "rg2", lt: "Labai skanu.", en: "Very tasty.", audioText: "Labai skanu", saveable: true, core: true },
              { id: "rg3", lt: "Man patinka.", en: "I like it.", audioText: "Man patinka", saveable: true, core: true },
              { id: "rg4", lt: "Neblogai.", en: "Not bad.", audioText: "Neblogai", saveable: true, core: true },
              { id: "rg5", lt: "Ar skanu?", en: "Is it tasty?", audioText: "Ar skanu", saveable: false, core: false },
              { id: "noun_kepsnys", lt: "kepsnys", en: "steak / roast", audioText: "kepsnys", saveable: true, core: false },
            ],
          },
          {
            id: "s4m4l5_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Labai skanu.", audioText: "Labai skanu" },
            options: [
              { id: "a", text: "Not bad.", isCorrect: false },
              { id: "b", text: "Very tasty.", isCorrect: true },
              { id: "c", text: "I like it.", isCorrect: false },
            ],
          },
          {
            id: "s4m4l5_b3",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I like it",
            targetText: "Man patinka",
            audioText: "Man patinka",
          },
          {
            id: "s4m4l5_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Your friend asks: Ar skanu? The food is excellent." },
            options: [
              { id: "a", text: "Nelabai gerai.", isCorrect: false },
              { id: "b", text: "Taip, labai skanu! Man patinka.", isCorrect: true },
              { id: "c", text: "Per karšta.", isCorrect: false },
            ],
            feedback: { correct: "Taip, labai skanu! Man patinka — Yes, very tasty! I like it. Warm and natural." },
          },
          {
  id: "s4m4l5_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You and a friend are eating together at a café.",
  sceneIntro: "You and a friend are eating together at a café.",
  location: "casual conversation",
  userRole: "friend",
  register: "casual",
  goal: "You and a friend are eating together at a café.",
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
      speakerText: "Ar skanu?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Per karšta.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Taip! Labai skanu. Man patinka.",
          textEn: "Yes! Very tasty. I like it.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Kiek tai kainuoja?","result":"wrong","feedback":"This does not answer the speaker here.","progresses":false},
      ],
    },
    {
      id: "step_2",
      speakerId: "friend",
      speakerLabel: "Friend",
      speakerText: "Man irgi! Ar nori dar?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
                {
          id: "b",
          text: "Ne, ačiū. Užtenka.",
          textEn: "No, thank you. That's enough.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Ar galėčiau gauti sąskaitą, prašau?",
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

      // ── Module 4.4 Checkpoint ─────────────────────────────────────────────────
      {
        id: "section_4_module_4_checkpoint",
        code: "4.4.C",
        title: "Social Food Interaction",
        purpose: "Check you can offer, respond, invite, coordinate, and react naturally around food and drink.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s4m4c_b1",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "A colleague asks: Ar nori sausainio? You would like one." },
            options: [
              { id: "a", text: "Ne, ačiū.", isCorrect: false },
              { id: "b", text: "Taip, prašau!", isCorrect: true },
              { id: "c", text: "Viso gero.", isCorrect: false },
            ],
            feedback: { correct: "Taip, prašau — Yes, please. Natural and immediate." },
          },
          {
            id: "s4m4c_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Išgerkime sulčių.", audioText: "Išgerkime sulčių" },
            options: [
              { id: "a", text: "Let's eat.", isCorrect: false },
              { id: "b", text: "Let's drink juice.", isCorrect: true },
              { id: "c", text: "Let's go to the café.", isCorrect: false },
            ],
          },
          {
            id: "s4m4c_b3",
            type: "recognise_mcq",
            noOptionAudio: true,
            title: "Choose the correct meaning",
            prompt: { text: "Mums du sumuštinius.", audioText: "Mums du sumuštinius" },
            options: [
              { id: "a", text: "Two sandwiches for me.", isCorrect: false },
              { id: "b", text: "Two juices for us.", isCorrect: false },
              { id: "c", text: "Two sandwiches for us.", isCorrect: true },
            ],
          },
          {
            id: "s4m4c_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Your friend asks: Ar skanu? You really enjoyed the food." },
            options: [
              { id: "a", text: "Nelabai gerai.", isCorrect: false },
              { id: "b", text: "Taip, labai skanu! Man patinka.", isCorrect: true },
              { id: "c", text: "Per karšta.", isCorrect: false },
            ],
            feedback: { correct: "Taip, labai skanu! Man patinka — Yes, very tasty! I like it." },
          },
          {
            id: "s4m4c_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: Very tasty! I like it.",
            targetText: "Labai skanu! Man patinka",
            audioText: "Labai skanu! Man patinka",
          },
          {
            id: "s4m4c_b6_v2",
            type: "scenario_v2",
            title: "Social food interaction",
            description: "You and a friend decide to get food and drink, react to it, and decide when you have had enough.",
            sceneIntro: "You and a friend decide to get food and drink, react to it, and decide when you have had enough.",
            location: "café",
            userRole: "friend",
            register: "informal",
            goal: "Combine hunger, offers, let's-language, broader food vocabulary, preferences and enough in one social exchange.",
            focus: ["food and drink social language"],
            participants: [{ id: "friend", label: "Friend", name: "Mantas", role: "friend", gender: "male", relationshipToUser: "friend", register: "informal" }],
            steps: [
              {
                id: "step_1",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Labas, Davidas! Ar tu alkanas?",
                sceneDirection: "You are hungry.",
                learnerPrompt: "Suggest going to a café.",
                options: [
                  { id: "a", text: "Taip! Eikime į kavinę.", result: "best", progresses: true },
                  { id: "b", text: "Viso gero.", result: "wrong", feedback: "You have just started making a plan.", progresses: false },
                  { id: "c", text: "Taip, aš alkanas.", result: "acceptable", feedback: "This answers the question, but suggesting the café moves the plan forward.", progresses: true },
                ],
              },
              {
                id: "step_2",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Gerai! Ar nori sulčių?",
                sceneDirection: "You would like some juice.",
                learnerPrompt: "Accept the juice.",
                options: [
                  { id: "a", text: "Taip, prašau!", result: "best", progresses: true },
                  { id: "b", text: "Ne, ačiū.", result: "wrong", feedback: "The scene says you would like juice.", progresses: false },
                  { id: "c", text: "Taip, ačiū.", result: "acceptable", feedback: "Also natural here.", progresses: true },
                ],
              },
              {
                id: "step_3",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Aš noriu sumuštinio. Pavalgykime!",
                sceneDirection: "You agree that eating together sounds good.",
                learnerPrompt: "Agree using the let's-eat phrase.",
                options: [
                  { id: "a", text: "Taip! Pavalgykime.", result: "best", progresses: true },
                  { id: "b", text: "Gal vėliau?", result: "wrong", feedback: "The scene says you want to eat now.", progresses: false },
                  { id: "c", text: "Pavalgykime!", result: "acceptable", feedback: "A concise and natural agreement.", progresses: true },
                ],
              },
              {
                id: "step_4",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Ar skanu?",
                sceneDirection: "You like the food.",
                learnerPrompt: "Say that it is very tasty and you like it.",
                options: [
                  { id: "a", text: "Taip, labai skanu! Man patinka.", result: "best", progresses: true },
                  { id: "b", text: "Nelabai gerai.", result: "wrong", feedback: "The scene says you like it.", progresses: false },
                  { id: "c", text: "Labai skanu!", result: "acceptable", feedback: "Natural and clear; the fuller answer also practises Man patinka.", progresses: true },
                ],
              },
              {
                id: "step_5",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Man irgi! Ar nori dar?",
                sceneDirection: "You have had enough.",
                learnerPrompt: "Decline and say that is enough.",
                options: [
                  { id: "a", text: "Ne, ačiū. Užtenka.", result: "best", progresses: true },
                  { id: "b", text: "Dar vieną, prašau.", result: "wrong", feedback: "The scene says you have had enough.", progresses: false },
                  { id: "c", text: "Užtenka, ačiū.", result: "acceptable", feedback: "A natural equivalent.", progresses: true },
                ],
              },
              {
                id: "step_6",
                speakerId: "friend",
                speakerLabel: "Friend",
                speakerText: "Gerai. Viso gero!",
                sceneDirection: "You are both leaving.",
                learnerPrompt: "Say goodbye.",
                options: [
                  { id: "a", text: "Viso gero! Ačiū!", result: "best", progresses: true },
                  { id: "b", text: "Laba diena.", result: "wrong", feedback: "You are leaving, not greeting.", progresses: false },
                  { id: "c", text: "Viso gero!", result: "acceptable", feedback: "A natural simple goodbye.", progresses: true },
                ],
              },
            ],
          },
          {
            id: "s4m4c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Aš alkanas.",              en: "I'm hungry. (male)",                  audioText: "Aš alkanas" },
              { id: "m2",  lt: "Aš alkana.",               en: "I'm hungry. (female)",                audioText: "Aš alkana" },
              { id: "m3",  lt: "Aš noriu gerti.",          en: "I want to drink.",                    audioText: "Aš noriu gerti" },
              { id: "m4",  lt: "Ar nori sulčių?",          en: "Do you want juice? (informal)",       audioText: "Ar nori sulčių" },
              { id: "m5",  lt: "Ar norite sumuštinio?",    en: "Do you want a sandwich? (formal)",    audioText: "Ar norite sumuštinio" },
              { id: "m6",  lt: "Taip, prašau.",            en: "Yes, please.",                        audioText: "Taip, prašau" },
              { id: "m7",  lt: "Ne, ačiū.",                en: "No, thank you.",                      audioText: "Ne, ačiū" },
              { id: "m8",  lt: "Pavalgykime.",             en: "Let's eat.",                          audioText: "Pavalgykime" },
              { id: "m9",  lt: "Išgerkime sulčių.",        en: "Let's drink juice.",                  audioText: "Išgerkime sulčių" },
              { id: "m10", lt: "Eikime į kavinę.",         en: "Let's go to the café.",               audioText: "Eikime į kavinę" },
              { id: "m11", lt: "Gal vėliau?",              en: "Maybe later?",                        audioText: "Gal vėliau" },
              { id: "m12", lt: "man",                      en: "for me / to me",                      audioText: "man" },
              { id: "m13", lt: "mums",                     en: "for us",                              audioText: "mums" },
              { id: "m14", lt: "Man sulčių, prašau.",      en: "Juice for me, please.",               audioText: "Man sulčių, prašau" },
              { id: "m15", lt: "Mums du sumuštinius.",     en: "Two sandwiches for us.",              audioText: "Mums du sumuštinius" },
              { id: "m16", lt: "Tai skanu.",               en: "This is tasty / delicious.",          audioText: "Tai skanu" },
              { id: "m17", lt: "Labai skanu.",             en: "Very tasty.",                         audioText: "Labai skanu" },
              { id: "m18", lt: "Man patinka.",             en: "I like it.",                          audioText: "Man patinka" },
              { id: "m19", lt: "sausainis",                en: "biscuit / cookie",                    audioText: "sausainis" },
              { id: "m20", lt: "kepsnys",                  en: "steak / roast",                       audioText: "kepsnys" },
            ],
          },
        ],
      },
    ],
  };
}

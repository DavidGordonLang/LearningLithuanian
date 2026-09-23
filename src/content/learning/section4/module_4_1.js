// src/content/learning/section4/module_4_1.js
// Module 4.1 — Ordering Basics

export default function createModule_4_1(profile = {}) {
  const { userNameSafe = "Davidas" } = profile;

  return {
    id: "module_4_1",
    code: "4.1",
    title: "Ordering Basics",
    status: "active",
    lessonCount: 4,
    lessons: [

      // ── Lesson 1 — I Want… ───────────────────────────────────────────────────
      {
        id: "section_4_module_1_lesson_1",
        code: "4.1.1",
        title: "I Want…",
        purpose: "Reuse the familiar Noriu frame while adding food vocabulary inside a fuller café exchange.",
        supportLevel: "high",
        newLanguageLoad: "medium",
        notes: {
          pattern: "You already know Noriu… from Section 2. This lesson uses that familiar frame to add food: sriuba becomes sriubos, tortas becomes torto, and ledai becomes ledų after Noriu. Learn the useful chunks rather than memorising a grammar label.",
          usage: [
            "Noriu kavos — I want coffee (already known)",
            "Noriu vandens — I want water (already known)",
            "Noriu sriubos — I want soup",
            "Noriu torto — I want cake",
            "Noriu ledų — I want ice cream",
          ],
        },
        blocks: [
          {
            id: "s4m1l1_b1",
            type: "learn",
            title: "New food with a familiar pattern",
            items: [
              { id: "ow4", lt: "Noriu sriubos.", en: "I want soup.", audioText: "Noriu sriubos", saveable: true, core: true },
              { id: "ow5", lt: "Noriu torto.", en: "I want cake.", audioText: "Noriu torto", saveable: true, core: true },
              { id: "ow6", lt: "Noriu ledų.", en: "I want ice cream.", audioText: "Noriu ledų", saveable: true, core: true },
            ],
          },
          {
            id: "s4m1l1_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Noriu sriubos.", audioText: "Noriu sriubos" },
            options: [
              { id: "a", text: "I want cake.", isCorrect: false },
              { id: "b", text: "I want soup.", isCorrect: true },
              { id: "c", text: "I want ice cream.", isCorrect: false },
            ],
          },
          {
            id: "s4m1l1_b3",
            type: "recognise_mcq",
            noOptionAudio: true,
            title: "Choose the correct meaning",
            prompt: { text: "Noriu torto.", audioText: "Noriu torto" },
            options: [
              { id: "a", text: "I want coffee.", isCorrect: false },
              { id: "b", text: "I want cake.", isCorrect: true },
              { id: "c", text: "I want soup.", isCorrect: false },
            ],
          },
          {
            id: "s4m1l1_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I want ice cream",
            targetText: "Noriu ledų",
            audioText: "Noriu ledų",
          },
          {
            id: "s4m1l1_b5_v2",
            type: "scenario_v2",
            title: "Café order",
            description: "You stop at a café counter. Choose something to eat, add water, check the price, pay by card, and close the exchange.",
            sceneIntro: "You stop at a café counter. Choose something to eat, add water, check the price, pay by card, and close the exchange.",
            location: "café counter",
            userRole: "customer",
            register: "polite_service",
            goal: "Use the new food vocabulary while reusing language from earlier sections in one complete café exchange.",
            focus: ["Noriu sriubos", "Noriu torto", "Noriu ledų", "price", "payment"],
            participants: [
              {
                id: "staff",
                label: "Staff",
                name: "Ieva",
                role: "server",
                gender: "female",
                relationshipToUser: "stranger",
                register: "polite_service",
              },
            ],
            steps: [
              {
                id: "step_1_order",
                speakerId: "staff",
                speakerLabel: "Staff",
                speakerText: "Laba diena! Ko norėtumėte?",
                sceneDirection: "Soup, cake and ice cream are all available. Choose one.",
                learnerPrompt: "Greet Ieva and choose something to eat.",
                options: [
                  { id: "a", text: "Laba diena! Noriu sriubos, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Laba diena! Noriu torto, prašau.", result: "best", progresses: true },
                  { id: "c", text: "Laba diena! Noriu ledų, prašau.", result: "best", progresses: true },
                  { id: "d", text: "Viso gero.", result: "wrong", feedback: "That ends the conversation instead of ordering.", progresses: false },
                ],
              },
              {
                id: "step_2_water",
                speakerId: "staff",
                speakerLabel: "Staff",
                speakerText: "Žinoma. Ar dar ko nors?",
                sceneDirection: "You also want water.",
                learnerPrompt: "Add water to your order.",
                options: [
                  { id: "a", text: "Taip, noriu vandens, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Ne, ačiū.", result: "wrong", feedback: "The scene says you also want water.", progresses: false },
                  { id: "c", text: "Daugiau vandens, prašau.", result: "wrong", feedback: "Daugiau means more; you have not been given water yet.", progresses: false },
                ],
              },
              {
                id: "step_3_price",
                speakerId: "staff",
                speakerLabel: "Staff",
                speakerText: "Gerai.",
                sceneDirection: "Before paying, you want to know the total price.",
                learnerPrompt: "Ask how much it costs.",
                options: [
                  { id: "a", text: "Kiek tai kainuoja?", result: "best", progresses: true },
                  { id: "b", text: "Kiek bilietų?", result: "wrong", feedback: "You are paying for food, not asking how many tickets.", progresses: false },
                  { id: "c", text: "Užtenka.", result: "wrong", feedback: "You need to ask for the price before paying.", progresses: false },
                ],
              },
              {
                id: "step_4_payment",
                speakerId: "staff",
                speakerLabel: "Staff",
                speakerText: "Dešimt eurų.",
                sceneDirection: "You want to pay by card.",
                learnerPrompt: "Ask whether you can pay by card.",
                options: [
                  { id: "a", text: "Ar galima mokėti kortele?", result: "best", progresses: true },
                  { id: "b", text: "Grynaisiais, prašau.", result: "wrong", feedback: "The scene says you want to pay by card.", progresses: false },
                  { id: "c", text: "Per brangu.", result: "wrong", feedback: "You decided to buy the order; ask about card payment.", progresses: false },
                ],
              },
              {
                id: "step_5_close",
                speakerId: "staff",
                speakerLabel: "Staff",
                speakerText: "Taip, galima. Prašom.",
                sceneDirection: "Your payment is complete and Ieva hands over the order.",
                learnerPrompt: "Thank Ieva and say goodbye.",
                options: [
                  { id: "a", text: "Ačiū labai! Viso gero.", result: "best", progresses: true },
                  { id: "b", text: "Atsiprašau.", result: "wrong", feedback: "Nothing needs an apology; the transaction is complete.", progresses: false },
                  { id: "c", text: "Dar vieną, prašau.", result: "wrong", feedback: "The scene says you are finished and ready to leave.", progresses: false },
                ],
              },
            ],
          },
        ],
      },

      // ── Lesson 2 — I Would Like… ─────────────────────────────────────────────
      {
        id: "section_4_module_1_lesson_2",
        code: "4.1.2",
        title: "I Would Like…",
        purpose: "Upgrade to the polite ordering frame — the natural default in cafés and restaurants.",
        supportLevel: "high",
        newLanguageLoad: "low",
        notes: {
          pattern: "Norėčiau… is more polite than Noriu… and sounds better in public service situations. You saw it once in Lesson 1.1 — now it becomes your default when ordering.",
          usage: [
            "Norėčiau kavos — I would like coffee",
            "Norėčiau arbatos — I would like tea",
            "Norėčiau šito — I would like this",
            "Norėčiau užsisakyti — I would like to order",
          ],
        },
        blocks: [
          {
            id: "s4m1l2_b1",
            type: "learn",
            title: "Polite ordering with Norėčiau",
            items: [
              { id: "po1", lt: "Norėčiau kavos.", en: "I would like coffee.", audioText: "Norėčiau kavos", saveable: true, core: true },
              { id: "po2", lt: "Norėčiau arbatos.", en: "I would like tea.", audioText: "Norėčiau arbatos", saveable: true, core: true },
              { id: "po3", lt: "Norėčiau vandens.", en: "I would like water.", audioText: "Norėčiau vandens", saveable: true, core: true },
              { id: "po4", lt: "Norėčiau šito.", en: "I would like this.", audioText: "Norėčiau šito", saveable: true, core: true },
              { id: "po5", lt: "Norėčiau užsisakyti.", en: "I would like to order.", audioText: "Norėčiau užsisakyti", saveable: true, core: true },
            ],
          },
          {
            id: "s4m1l2_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Norėčiau kavos.", audioText: "Norėčiau kavos" },
            options: [
              { id: "a", text: "I want coffee.", isCorrect: false },
              { id: "b", text: "I would like coffee.", isCorrect: true },
              { id: "c", text: "I would like tea.", isCorrect: false },
            ],
          },
          {
            id: "s4m1l2_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You're ordering at a café. A member of staff is waiting. What sounds most natural?" },
            options: [
              { id: "a", text: "Noriu kavos.", isCorrect: false },
              { id: "b", text: "Norėčiau kavos.", isCorrect: true },
              { id: "c", text: "Kavos.", isCorrect: false },
            ],
            feedback: { correct: "Norėčiau kavos — I would like coffee. Polite and natural in any café or restaurant setting." },
          },
          {
            id: "s4m1l2_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Order politely: I would like tea",
            targetText: "Norėčiau arbatos",
            audioText: "Norėčiau arbatos",
          },
          {
  id: "s4m1l2_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You walk into a café in Vilnius and order your drink.",
  sceneIntro: "You walk into a café in Vilnius and order your drink.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_neutral",
  goal: "You walk into a café in Vilnius and order your drink.",
  focus: ["ordering"],
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
      speakerText: "Laba diena! Ko norėtumėte?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "Laba diena! Norėčiau kavos.",
          textEn: "Good day! I would like coffee.",
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
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Žinoma. Minutėlę.",
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
          text: "Ačiū.",
          textEn: "Thank you.",
          result: "best",
          progresses: true,
        }
      ],
    },
    {
      id: "step_3",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Prašom.",
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
          text: "Ačiū labai!",
          textEn: "Thank you very much!",
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

      // ── Lesson 3 — This / That, Please ───────────────────────────────────────
      {
        id: "section_4_module_1_lesson_3",
        code: "4.1.3",
        title: "This / That, Please",
        purpose: "Apply this/that forms directly to ordering — pointing and choosing at a counter or menu.",
        supportLevel: "high",
        newLanguageLoad: "low_to_medium",
        notes: {
          pattern: "After Noriu/Norėčiau, use Šito/To. When you're simply pointing and saying 'this one/that one, please', use Šitą/Tą. Both patterns work naturally at a counter — learn them as two useful chunks.",
          usage: [
            "Šito, prašau — This one, please",
            "To, prašau — That one, please",
            "Norėčiau šito — I would like this one",
          ],
        },
        blocks: [
          {
            id: "s4m1l3_b1",
            type: "learn",
            title: "Pointing to order",
            items: [
              { id: "pt2", lt: "To, prašau.", en: "That one, please.", audioText: "To, prašau", saveable: true, core: true },
              { id: "pt3", lt: "Šitą, prašau.", en: "This, please.", audioText: "Šitą, prašau", saveable: true, core: true },
              { id: "pt4", lt: "Tą, prašau.", en: "That, please.", audioText: "Tą, prašau", saveable: true, core: true },
              { id: "pt5", lt: "Kurio norėtumėte?", en: "Which one would you like?", audioText: "Kurio norėtumėte", saveable: false, core: false },
            ],
          },
          {
            id: "s4m1l3_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Šito, prašau.", audioText: "Šito, prašau" },
            options: [
              { id: "a", text: "That one, please.", isCorrect: false },
              { id: "b", text: "Which one?", isCorrect: false },
              { id: "c", text: "This one, please.", isCorrect: true },
            ],
          },
          {
            id: "s4m1l3_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "To, prašau.", audioText: "To, prašau" },
            options: [
              { id: "a", text: "This one, please.", isCorrect: false },
              { id: "b", text: "One more, please.", isCorrect: false },
              { id: "c", text: "That one, please.", isCorrect: true },
            ],
          },
          {
            id: "s4m1l3_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Point and say: This one, please",
            targetText: "Šito, prašau",
            audioText: "Šito, prašau",
          },
          {
  id: "s4m1l3_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a bakery counter. The staff asks which item you want.",
  sceneIntro: "You're at a bakery counter. The staff asks which item you want.",
  location: "shop counter",
  userRole: "customer",
  register: "polite_service",
  goal: "You're at a bakery counter. The staff asks which item you want.",
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
      speakerText: "Kurio norėtumėte?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      help: {
        levels: [
          { sceneDirection: "The seller gestures between the items on display.", speakerText: "Kurio?" },
          { sceneDirection: "He points to one item, then another, waiting for your choice." },
          { speakerText: "Which one would you like?", spokenLanguage: "en", audio: false },
        ],
      },
      options: [
                {
          id: "b",
          text: "Šito, prašau.",
          textEn: "This one, please.",
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
      id: "step_2",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Ar dar ko nors norėtumėte?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Taip, labai.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Norėčiau to, prašau.",
          textEn: "I would like that one, please.",
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
      id: "step_3",
      speakerId: "seller",
      speakerLabel: "Seller",
      speakerText: "Prašom.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
          text: "Ačiū labai!",
          textEn: "Thank you very much!",
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

      // ── Lesson 4 — One / Two / More ──────────────────────────────────────────
      {
        id: "section_4_module_1_lesson_4",
        code: "4.1.4",
        title: "One / Two / More",
        purpose: "Bring quantity into ordering — the small numbers that come up in every food and drink situation.",
        supportLevel: "medium",
        newLanguageLoad: "low",
        notes: {
          pattern: "When you order, the drink word changes its ending — and so does the number. Du (two) becomes dvi before feminine nouns like arbata: dvi arbatas. Kava becomes kavą, arbata becomes arbatas, vanduo becomes vandenį. This is Lithuanian showing the role of words through their endings. Just notice it for now — the patterns will become familiar.",
          usage: [
            "vieną kavą — one coffee (kavą, not kava)",
            "dvi arbatas — two teas (dvi, not du; arbatas, not arbata)",
            "vieną stiklinę vandens — one glass of water",
            "Dar vieną, prašau — one more, please",
          ],
        },
        blocks: [
          {
            id: "s4m1l4_b1",
            type: "learn",
            title: "Ordering with quantity",
            items: [
              { id: "oq1", lt: "Vieną kavą, prašau.", en: "One coffee, please.", audioText: "Vieną kavą, prašau", saveable: true, core: true },
              { id: "oq2", lt: "Dvi arbatas, prašau.", en: "Two teas, please.", audioText: "Dvi arbatas, prašau", saveable: true, core: true },
              { id: "oq3", lt: "Vieną stiklinę vandens, prašau.", en: "One glass of water, please.", audioText: "Vieną stiklinę vandens, prašau", saveable: true, core: true },
            ],
          },
          {
            id: "s4m1l4_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Vieną kavą, prašau.", audioText: "Vieną kavą, prašau" },
            options: [
              { id: "a", text: "Two coffees, please.", isCorrect: false },
              { id: "b", text: "One coffee, please.", isCorrect: true },
              { id: "c", text: "One tea, please.", isCorrect: false },
            ],
          },
          {
            id: "s4m1l4_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Dvi arbatas, prašau.", audioText: "Dvi arbatas, prašau" },
            options: [
              { id: "a", text: "Two coffees, please.", isCorrect: false },
              { id: "b", text: "One tea, please.", isCorrect: false },
              { id: "c", text: "Two teas, please.", isCorrect: true },
            ],
          },
          {
            id: "s4m1l4_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "One coffee, please." },
            tokens: [
              { id: "t1", text: "Vieną", correctIndex: 0 },
              { id: "t2", text: "kavą,", correctIndex: 1 },
              { id: "t3", text: "prašau", correctIndex: 2 },
              { id: "t4", text: "Dvi", isDistractor: true },
              { id: "t5", text: "arbatas,", isDistractor: true },
            ],
            answerText: "Vieną kavą, prašau",
          },
          {
            id: "s4m1l4_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Order: two teas, please",
            targetText: "Dvi arbatas, prašau",
            audioText: "Dvi arbatas, prašau",
          },
          {
  id: "s4m1l4_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You're at a café with a colleague. You order for both of you.",
  sceneIntro: "You're at a café with a colleague. You order for both of you.",
  location: "work conversation",
  userRole: "customer",
  register: "polite_friendly",
  goal: "You're at a café with a colleague. You order for both of you.",
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
      speakerText: "Ko norėtumėte?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "Dvi arbatas, prašau.",
          textEn: "Two teas, please.",
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
      id: "step_2",
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Ar dar ko nors norėtumėte?",
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
          text: "Taip! Vieną kavą, prašau.",
          textEn: "Yes! One coffee, please.",
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
    },
    {
      id: "step_3",
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Gerai. Prašom.",
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
          text: "Ačiū labai!",
          textEn: "Thank you very much!",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Dar vieną, prašau.",
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
      speakerText: "Ar dar ko nors norėtumėte?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Taip, labai.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ne, ačiū. Užtenka.",
          textEn: "No, thank you. That's enough.",
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

      // ── Module 4.1 Checkpoint ─────────────────────────────────────────────────
      {
        id: "section_4_module_1_checkpoint",
        code: "4.1.C",
        title: "Ordering Basics",
        purpose: "Check you can use core ordering frames, demonstratives, and quantity without support.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s4m1c_b1",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You're ordering at a café counter. Staff are waiting. Which sounds most natural?" },
            options: [
              { id: "a", text: "Kava, prašau!", isCorrect: false },
              { id: "b", text: "Norėčiau kavos.", isCorrect: true },
              { id: "c", text: "Noriu.", isCorrect: false },
            ],
            feedback: { correct: "Norėčiau kavos — the polite, natural default when ordering in a café or restaurant." },
          },
          {
            id: "s4m1c_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Norėčiau arbatos.", audioText: "Norėčiau arbatos" },
            options: [
              { id: "a", text: "I want coffee.", isCorrect: false },
              { id: "b", text: "I would like water.", isCorrect: false },
              { id: "c", text: "I would like tea.", isCorrect: true },
            ],
          },
          {
            id: "s4m1c_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Dvi arbatas, prašau.", audioText: "Dvi arbatas, prašau" },
            options: [
              { id: "a", text: "Two coffees, please.", isCorrect: false },
              { id: "b", text: "Two teas, please.", isCorrect: true },
              { id: "c", text: "One tea, please.", isCorrect: false },
            ],
          },
          {
            id: "s4m1c_b4",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Šito, prašau.", audioText: "Šito, prašau" },
            options: [
              { id: "a", text: "That one, please.", isCorrect: false },
              { id: "b", text: "One more, please.", isCorrect: false },
              { id: "c", text: "This one, please.", isCorrect: true },
            ],
          },
          {
            id: "s4m1c_b5",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Staff asks: Ko norėtumėte? You want tea." },
            options: [
              { id: "a", text: "Arbata.", isCorrect: false },
              { id: "b", text: "Norėčiau arbatos.", isCorrect: true },
              { id: "c", text: "Noriu kavos.", isCorrect: false },
            ],
            feedback: { correct: "Norėčiau arbatos — polite, and arbata changes to arbatos after Norėčiau. The go-to ordering frame." },
          },
          {
            id: "s4m1c_b6",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Two teas, please." },
            tokens: [
              { id: "t1", text: "Dvi", correctIndex: 0 },
              { id: "t2", text: "arbatas,", correctIndex: 1 },
              { id: "t3", text: "prašau", correctIndex: 2 },
              { id: "t4", text: "Vieną", isDistractor: true },
              { id: "t5", text: "kavą,", isDistractor: true },
            ],
            answerText: "Dvi arbatas, prašau",
          },
          {
            id: "s4m1c_b7",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Order politely: I would like water",
            targetText: "Norėčiau vandens",
            audioText: "Norėčiau vandens",
          },
          {
            id: "s4m1c_b8",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask for one more",
            targetText: "Dar vieną, prašau",
            audioText: "Dar vieną, prašau",
          },
          {
  id: "s4m1c_b9_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You stop at a café kiosk with a colleague. Order for both of you and close naturally.",
  sceneIntro: "You stop at a café kiosk with a colleague. Order for both of you and close naturally.",
  location: "work conversation",
  userRole: "colleague",
  register: "polite_friendly",
  goal: "You stop at a café kiosk with a colleague. Order for both of you and close naturally.",
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
      speakerText: "Laba diena! Ko norėtumėte?",
      sceneDirection: "The exchange begins.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "Laba diena! Vieną kavą ir vieną arbatą, prašau.",
          textEn: "Good day! One coffee and one tea, please.",
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
      id: "step_2",
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Gerai. Šito ar to?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
                {
          id: "b",
          text: "To, prašau.",
          textEn: "That one, please.",
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
      id: "step_3",
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Prašom.",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Prašom.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ačiū!",
          textEn: "Thank you!",
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
    },
    {
      id: "step_4",
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Ar dar ko nors norėtumėte?",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the most natural response.",
      options: [
        {
          id: "a",
          text: "Taip, labai.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ne, ačiū. Užtenka.",
          textEn: "No, thank you. That's enough.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Dar vieną, prašau.",
          result: "wrong",
          feedback: "This does not fit the situation. Choose the response that matches the speaker.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_5",
      speakerId: "server",
      speakerLabel: "Server",
      speakerText: "Gerai. Viso gero!",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
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
          text: "Viso gero! Ačiū!",
          textEn: "Goodbye! Thank you!",
          result: "best",
          progresses: true,
        }
      ],
    }
  ],
},
          {
            id: "s4m1c_b10",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Noriu kavos.",          en: "I want coffee.",           audioText: "Noriu kavos" },
              { id: "m2",  lt: "Noriu arbatos.",         en: "I want tea.",              audioText: "Noriu arbatos" },
              { id: "m3",  lt: "Noriu vandens.",         en: "I want water.",            audioText: "Noriu vandens" },
              { id: "m4",  lt: "Noriu šito.",            en: "I want this.",             audioText: "Noriu šito" },
              { id: "m5",  lt: "Norėčiau kavos.",        en: "I would like coffee.",     audioText: "Norėčiau kavos" },
              { id: "m6",  lt: "Norėčiau arbatos.",      en: "I would like tea.",        audioText: "Norėčiau arbatos" },
              { id: "m7",  lt: "Norėčiau šito.",         en: "I would like this.",       audioText: "Norėčiau šito" },
              { id: "m8",  lt: "Norėčiau užsisakyti.",   en: "I would like to order.",   audioText: "Norėčiau užsisakyti" },
              { id: "m9",  lt: "Šito, prašau.",          en: "This one, please.",        audioText: "Šito, prašau" },
              { id: "m10", lt: "To, prašau.",            en: "That one, please.",        audioText: "To, prašau" },
              { id: "m11", lt: "Šitą, prašau.",          en: "This, please.",            audioText: "Šitą, prašau" },
              { id: "m12", lt: "Tą, prašau.",            en: "That, please.",            audioText: "Tą, prašau" },
              { id: "m13", lt: "Vieną kavą, prašau.",    en: "One coffee, please.",      audioText: "Vieną kavą, prašau" },
              { id: "m14", lt: "Dvi arbatas, prašau.",   en: "Two teas, please.",        audioText: "Dvi arbatas, prašau" },
              { id: "m15", lt: "Vieną stiklinę vandens, prašau.", en: "One glass of water, please.", audioText: "Vieną stiklinę vandens, prašau" },
              { id: "m16", lt: "Dar vieną, prašau.",     en: "One more, please.",        audioText: "Dar vieną, prašau" },
              { id: "m17", lt: "Ko norėtumėte?",         en: "What would you like?",     audioText: "Ko norėtumėte" },
              { id: "m18", lt: "Ko norėtumėte?",         en: "What would you like?",     audioText: "Ko norėtumėte" },
              { id: "m19", lt: "tortas",                 en: "cake",                     audioText: "tortas" },
              { id: "m20", lt: "ledai",                  en: "ice cream",                audioText: "ledai" },
            ],
          },
        ],
      },
    ],
  };
}

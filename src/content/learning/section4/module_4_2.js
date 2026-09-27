// src/content/learning/section4/module_4_2.js
// Module 4.2 — At the Café

export default function createModule_4_2(profile = {}) {
  const { userNameSafe = "Davidas" } = profile;

  return {
    id: "module_4_2",
    code: "4.2",
    title: "At the Café",
    status: "active",
    lessonCount: 5,
    lessons: [

      // ── Lesson 1 — Coffee, Tea, Water ────────────────────────────────────────
      {
        id: "section_4_module_2_lesson_1",
        code: "4.2.1",
        title: "Coffee, Tea, Water",
        purpose: "Lock in the core drink items and the ordering question you will hear in every café.",
        supportLevel: "high",
        newLanguageLoad: "low",
        notes: {
          pattern: "Kava, arbata, vanduo are the base forms. When ordering, they commonly change to kavos, arbatos, vandens — the same forms you have already been using since Module 2.1.",
          usage: [
            "kava — coffee",
            "arbata — tea",
            "vanduo — water",
            "Norėčiau kavos — I would like coffee",
            "Vandens, prašau — Water, please",
          ],
        },
        blocks: [
          {
            id: "s4m2l1_b1",
            type: "learn",
            title: "Core drink vocabulary",
            items: [
              { id: "dr1", lt: "kava", en: "coffee", audioText: "kava", saveable: true, core: true },
              { id: "dr3", lt: "vanduo", en: "water", audioText: "vanduo", saveable: true, core: true },
              { id: "dr6", lt: "Vandens, prašau.", en: "Water, please.", audioText: "Vandens, prašau", saveable: true, core: true },
            ],
          },
          {
            id: "s4m2l1_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Norėčiau kavos.", audioText: "Norėčiau kavos" },
            options: [
              { id: "a", text: "I would like tea.", isCorrect: false },
              { id: "b", text: "I would like coffee.", isCorrect: true },
              { id: "c", text: "Water, please.", isCorrect: false },
            ],
          },
          {
            id: "s4m2l1_b3",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Vandens, prašau.", audioText: "Vandens, prašau" },
            options: [
              { id: "a", text: "Tea, please.", isCorrect: false },
              { id: "b", text: "Coffee, please.", isCorrect: false },
              { id: "c", text: "Water, please.", isCorrect: true },
            ],
          },
          {
            id: "s4m2l1_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I would like coffee",
            targetText: "Norėčiau kavos",
            audioText: "Norėčiau kavos",
          },
          {
            id: "s4m2l1_b4b",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I would like to order",
            targetText: "Norėčiau užsisakyti",
            audioText: "Norėčiau užsisakyti",
          },
          {
            id: "s4m2l1_b5_v2",
            type: "scenario_v2",
            title: "Drinks at a café",
            description: "You order coffee and water, then check the price and pay.",
            sceneIntro: "You order coffee and water, then check the price and pay.",
            location: "café",
            userRole: "customer",
            register: "polite_service",
            goal: "Use the drink vocabulary inside a familiar ordering and payment flow.",
            focus: ["kava", "vanduo", "Vandens, prašau"],
            participants: [{ id: "server", label: "Server", name: "Ieva", role: "server", gender: "female", relationshipToUser: "stranger", register: "polite_service" }],
            steps: [
              {
                id: "step_1",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Laba diena! Ko norėtumėte?",
                sceneDirection: "You want coffee.",
                learnerPrompt: "Order coffee politely.",
                options: [
                  { id: "a", text: "Laba diena! Norėčiau kavos, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Kavos, prašau.", result: "acceptable", feedback: "This is short but natural and polite. Norėčiau kavos, prašau is the fuller polite form.", progresses: true },
                  { id: "c", text: "Laba diena! Noriu kavos.", result: "awkward", feedback: "Understandable, but Noriu is more direct in a service setting. Norėčiau is the more natural polite choice here.", betterAnswer: "Laba diena! Norėčiau kavos, prašau.", progresses: true },
                  { id: "d", text: "Laba diena! Norėčiau arbatos, prašau.", result: "wrong", feedback: "You want coffee, not tea.", progresses: false },
                ],
              },
              {
                id: "step_2",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Ar dar ko nors?",
                sceneDirection: "You also want water.",
                learnerPrompt: "Ask for water.",
                options: [
                  { id: "a", text: "Vandens, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Taip, norėčiau vandens, prašau.", result: "best", progresses: true },
                  { id: "c", text: "Noriu vandens.", result: "awkward", feedback: "Understandable, but it is more direct than the polite forms you have learned for service situations.", betterAnswer: "Vandens, prašau.", progresses: true },
                  { id: "d", text: "Ne, ačiū.", result: "wrong", feedback: "The scene says you also want water.", progresses: false },
                ],
              },
              {
                id: "step_3",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Gerai.",
                sceneDirection: "You want to know the total.",
                learnerPrompt: "Ask the price.",
                options: [
                  { id: "a", text: "Kiek tai kainuoja?", result: "best", progresses: true },
                  { id: "b", text: "Kur yra stotis?", result: "wrong", feedback: "You are still at the café counter.", progresses: false },
                ],
              },
              {
                id: "step_4",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Septyni eurai. Grynaisiais ar kortele?",
                sceneDirection: "You want to pay by card.",
                learnerPrompt: "Choose card.",
                options: [
                  { id: "a", text: "Kortele, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Ar galima mokėti kortele?", result: "acceptable", feedback: "This is a little more explicit than necessary because Ieva already asked cash or card, but it is still natural and polite.", progresses: true },
                  { id: "c", text: "Grynaisiais, prašau.", result: "wrong", feedback: "The scene says you want to use your card.", progresses: false },
                ],
              },
              {
                id: "step_5",
                speakerId: "server",
                speakerLabel: "Server",
                speakerText: "Prašom.",
                sceneDirection: "Ieva hands over the drinks.",
                learnerPrompt: "Close naturally.",
                options: [
                  { id: "a", text: "Ačiū labai! Viso gero.", result: "best", progresses: true },
                  { id: "b", text: "Ačiū!", result: "acceptable", feedback: "A simple thank-you works naturally here, though adding Viso gero gives the exchange a clearer close.", progresses: true },
                  { id: "c", text: "Viso gero!", result: "acceptable", feedback: "This closes the exchange naturally. Adding Ačiū is a little warmer.", progresses: true },
                  { id: "d", text: "Atsiprašau.", result: "wrong", feedback: "Nothing needs an apology.", progresses: false },
                ],
              },
            ],
          },
        ],
      },

      // ── Lesson 2 — For Here / To Go ──────────────────────────────────────────
      {
        id: "section_4_module_2_lesson_2",
        code: "4.2.2",
        title: "For Here / To Go",
        purpose: "Handle one of the most common modern café interactions — the for-here or to-go question.",
        supportLevel: "high",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Čia ar išsinešti? — For here or to go? You already know čia (here). Išsinešti is the to-go form — learn it as a fixed chunk for now.",
          usage: [
            "Čia ar išsinešti? — For here or to go?",
            "Čia, prašau — For here, please",
            "Išsinešti, prašau — To go, please",
          ],
        },
        blocks: [
          {
            id: "s4m2l2_b1",
            type: "learn",
            title: "For here or to go",
            items: [
              { id: "fg1", lt: "Čia ar išsinešti?", en: "For here or to go?", audioText: "Čia ar išsinešti", saveable: true, core: true },
              { id: "fg2", lt: "Čia, prašau.", en: "For here, please.", audioText: "Čia, prašau", saveable: true, core: true },
              { id: "fg3", lt: "Išsinešti, prašau.", en: "To go, please.", audioText: "Išsinešti, prašau", saveable: true, core: true },
            ],
          },
          {
            id: "s4m2l2_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Čia ar išsinešti?", audioText: "Čia ar išsinešti" },
            options: [
              { id: "a", text: "Coffee or tea?", isCorrect: false },
              { id: "b", text: "For here or to go?", isCorrect: true },
              { id: "c", text: "Card or cash?", isCorrect: false },
            ],
          },
          {
            id: "s4m2l2_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Staff asks: Čia ar išsinešti? You want to sit down and drink it here." },
            options: [
              { id: "a", text: "Išsinešti, prašau.", isCorrect: false },
              { id: "b", text: "Čia, prašau.", isCorrect: true },
              { id: "c", text: "Norėčiau kavos.", isCorrect: false },
            ],
            feedback: { correct: "Čia, prašau — For here, please. Short and clear." },
          },
          {
            id: "s4m2l2_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say you want it to go",
            targetText: "Išsinešti, prašau",
            audioText: "Išsinešti, prašau",
          },
          {
            id: "s4m2l2_b5_v2",
            type: "scenario_v2",
            title: "Coffee to go",
            description: "You are in a hurry, so you order a coffee to take away, check the price and pay in cash.",
            sceneIntro: "You are in a hurry, so you order a coffee to take away, check the price and pay in cash.",
            location: "takeaway counter",
            userRole: "customer",
            register: "polite_service",
            goal: "Use the for-here / to-go language inside a complete purchase.",
            focus: ["Čia ar išsinešti?", "Išsinešti"],
            participants: [{ id: "barista", label: "Barista", name: "Ieva", role: "barista", gender: "female", relationshipToUser: "stranger", register: "polite_service" }],
            steps: [
              {
                id: "step_1",
                speakerId: "barista",
                speakerLabel: "Barista",
                speakerText: "Laba diena! Ko norėtumėte?",
                sceneDirection: "You want coffee.",
                learnerPrompt: "Order coffee politely.",
                options: [
                  { id: "a", text: "Laba diena! Norėčiau kavos, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Norėčiau arbatos, prašau.", result: "wrong", feedback: "You came for coffee to take away, not tea.", progresses: false },
                
        {"id":"z","text":"Norėčiau kavos, prašau.","result":"acceptable","feedback":"Natural and polite without repeating the greeting.","progresses":true},
      ],
              },
              {
                id: "step_2",
                speakerId: "barista",
                speakerLabel: "Barista",
                speakerText: "Čia ar išsinešti?",
                sceneDirection: "You are taking the coffee with you.",
                learnerPrompt: "Say it is to go.",
                help: { levels: [
                  { sceneDirection: "Ieva points to the tables and then to a takeaway cup.", speakerText: "Čia? Išsinešti?" },
                  { speakerText: "For here or to go?", spokenLanguage: "en", audio: false },
                ]},
                options: [
                  { id: "a", text: "Išsinešti, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Čia, prašau.", result: "wrong", feedback: "The scene says you are taking it with you.", progresses: false },
                
        {"id":"z","text":"Išsinešti.","result":"acceptable","feedback":"Shorter, but still clear.","progresses":true},
      ],
              },
              {
                id: "step_3",
                speakerId: "barista",
                speakerLabel: "Barista",
                speakerText: "Gerai.",
                sceneDirection: "You want to know the price.",
                learnerPrompt: "Ask how much it costs.",
                options: [
                  { id: "a", text: "Kiek tai kainuoja?", result: "best", progresses: true },
                  { id: "b", text: "Ar toli?", result: "wrong", feedback: "You need the price, not the distance.", progresses: false },
                
        {"id":"z","text":"Kur yra bankas?","result":"wrong","feedback":"A bank location does not tell you the price of your coffee.","progresses":false},
      ],
              },
              {
                id: "step_4",
                speakerId: "barista",
                speakerLabel: "Barista",
                speakerText: "Keturi eurai. Grynaisiais ar kortele?",
                sceneDirection: "You want to pay in cash.",
                learnerPrompt: "Choose cash.",
                options: [
                  {"id":"a","text":"Kortele, prašau.","result":"wrong","feedback":"The scene says you want to use cash.","progresses":false},
                  {"id":"b","text":"Grynaisiais, prašau.","result":"best","progresses":true},
                
        {"id":"z","text":"Grynaisiais.","result":"acceptable","feedback":"A shorter but clear payment answer.","progresses":true},
      ],
              },
              {
                id: "step_5",
                speakerId: "barista",
                speakerLabel: "Barista",
                speakerText: "Prašom. Viso gero!",
                sceneDirection: "Your takeaway coffee is ready.",
                learnerPrompt: "Close naturally.",
                options: [
                  { id: "a", text: "Ačiū! Viso gero!", result: "best", progresses: true },
                  { id: "b", text: "Atsiprašau.", result: "wrong", feedback: "Nothing needs an apology.", progresses: false },
                
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A simple thank-you is also natural.","progresses":true},
      ],
              },
            ],
          },
        ],
      },

      // ── Lesson 3 — With / Without ─────────────────────────────────────────────
      {
        id: "section_4_module_2_lesson_3",
        code: "4.2.3",
        title: "With / Without",
        purpose: "Customise a drink simply — the most useful café language after ordering.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "First name the ingredient: pienas (milk), cukrus (sugar), citrina (lemon). In a drink order, these change: pienas → su pienu (with milk), cukrus → be cukraus (without sugar), citrina → su citrina (with lemon). Notice the whole useful chunks; you do not need an endings table.",
          usage: [
            "su pienu — with milk",
            "be cukraus — without sugar",
            "su citrina — with lemon",
            "citrina → be citrinos — without lemon",
            "Su pienu ar be pieno? — With milk or without milk?",
            "Ar su cukrumi? — With sugar? (cukrus → su cukrumi)",
          ],
        },
        blocks: [
          {
            id: "s4m2l3_b1",
            type: "learn",
            title: "Customising with su and be",
            items: [
              { id: "cu4", lt: "pienas", en: "milk", audioText: "pienas", saveable: true, core: true },
              { id: "cu5", lt: "cukrus", en: "sugar", audioText: "cukrus", saveable: true, core: true },
              { id: "cu6", lt: "citrina", en: "lemon", audioText: "citrina", saveable: true, core: true },
              { id: "cu1", lt: "su pienu", en: "with milk", audioText: "su pienu", saveable: true, core: true },
              { id: "cu2", lt: "be cukraus", en: "without sugar", audioText: "be cukraus", saveable: true, core: true },
              { id: "cu3", lt: "su citrina", en: "with lemon", audioText: "su citrina", saveable: true, core: true },
              { id: "cu7", lt: "Norėčiau kavos su pienu.", en: "I would like coffee with milk.", audioText: "Norėčiau kavos su pienu", saveable: true, core: true },
              { id: "cu8", lt: "Arbatos be cukraus, prašau.", en: "Tea without sugar, please.", audioText: "Arbatos be cukraus, prašau", saveable: true, core: true },
              { id: "cu9", lt: "Su pienu ar be pieno?", en: "With milk or without milk?", audioText: "Su pienu ar be pieno", saveable: false, core: false },
              { id: "cu10", lt: "Ar su cukrumi?", en: "With sugar?", audioText: "Ar su cukrumi", saveable: false, core: false },
            ],
          },
          {
            id: "s4m2l3_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Su pienu ar be pieno?", audioText: "Su pienu ar be pieno" },
            options: [
              { id: "a", text: "With sugar or without?", isCorrect: false },
              { id: "b", text: "With milk or without milk?", isCorrect: true },
              { id: "c", text: "Coffee or tea?", isCorrect: false },
            ],
          },
          {
            id: "s4m2l3_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Arbatos be cukraus, prašau.", audioText: "Arbatos be cukraus, prašau" },
            options: [
              { id: "a", text: "Coffee with sugar, please.", isCorrect: false },
              { id: "b", text: "Tea with lemon, please.", isCorrect: false },
              { id: "c", text: "Tea without sugar, please.", isCorrect: true },
            ],
          },
          {
            id: "s4m2l3_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Tea without sugar, please." },
            tokens: [
              { id: "t1", text: "Arbatos", correctIndex: 0 },
              { id: "t2", text: "be", correctIndex: 1 },
              { id: "t3", text: "cukraus,", correctIndex: 2 },
              { id: "t4", text: "prašau", correctIndex: 3 },
              { id: "t5", text: "su", isDistractor: true, repairHint: "su means “with”. The prompt says “without sugar”, so its meaning is the opposite of what you’re trying to say." },
              { id: "t6", text: "pienu,", isDistractor: true },
            ],
            answerText: "Arbatos be cukraus, prašau",
          },
          // Retrieve the with/without distinction after building the phrase.
          {
            id: "s4m2l3_b5",
            type: "best_response",
            title: "Choose the useful chunk",
            prompt: { text: "Your coffee has milk, but you don't want sugar. The barista asks: Ar su cukrumi?" },
            options: [
              { id: "a", text: "Ne, be cukraus, prašau.", isCorrect: true },
              { id: "b", text: "Taip, su cukrumi.", isCorrect: false },
              { id: "c", text: "Be pieno, prašau.", isCorrect: false },
            ],
            feedback: { correct: "Be cukraus means without sugar. Su pienu still describes the milk in your coffee." },
          },
          {
            id: "s4m2l3_b6_v2",
            type: "scenario_v2",
            title: "Customise your coffee",
            description: "You order coffee with milk and without sugar, then check the price and pay.",
            sceneIntro: "You order coffee with milk and without sugar, then check the price and pay.",
            location: "café",
            userRole: "customer",
            register: "polite_service",
            goal: "Use su / be naturally inside a complete café transaction.",
            focus: ["su pienu", "be cukraus"],
            participants: [{ id: "barista", label: "Barista", name: "Ieva", role: "barista", gender: "female", relationshipToUser: "stranger", register: "polite_service" }],
            steps: [
              {
                id: "step_1",
                speakerId: "barista",
                speakerLabel: "Barista",
                speakerText: "Laba diena! Ko norėtumėte?",
                sceneDirection: "You want coffee.",
                learnerPrompt: "Order coffee politely.",
                options: [
                  { id: "a", text: "Laba diena! Norėčiau kavos, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Norėčiau arbatos, prašau.", result: "wrong", feedback: "You want coffee to customise with milk, not tea.", progresses: false },
                
        {"id":"z","text":"Norėčiau kavos, prašau.","result":"acceptable","feedback":"Natural and polite without repeating the greeting.","progresses":true},
      ],
              },
              {
                id: "step_2",
                speakerId: "barista",
                speakerLabel: "Barista",
                speakerText: "Su pienu ar be pieno?",
                sceneDirection: "You want milk.",
                learnerPrompt: "Choose coffee with milk.",
                options: [
                  { id: "a", text: "Su pienu, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Be pieno, prašau.", result: "wrong", feedback: "The scene says you want milk.", progresses: false },
                
        {"id":"z","text":"Su pienu.","result":"acceptable","feedback":"Short and natural after the direct question.","progresses":true},
      ],
              },
              {
                id: "step_3",
                speakerId: "barista",
                speakerLabel: "Barista",
                speakerText: "Ar su cukrumi?",
                sceneDirection: "You do not want sugar.",
                learnerPrompt: "Say without sugar.",
                options: [
                  { id: "a", text: "Ne, be cukraus, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Taip, su cukrumi.", result: "wrong", feedback: "The scene says no sugar.", progresses: false },
                
        {"id":"z","text":"Be cukraus, prašau.","result":"acceptable","feedback":"The shorter answer is still natural.","progresses":true},
      ],
              },
              {
                id: "step_4",
                speakerId: "barista",
                speakerLabel: "Barista",
                speakerText: "Gerai.",
                sceneDirection: "You want the total price.",
                learnerPrompt: "Ask how much it costs.",
                options: [
                  { id: "a", text: "Kiek tai kainuoja?", result: "best", progresses: true },
                  { id: "b", text: "Kur yra tualetas?", result: "wrong", feedback: "You are checking the price before paying.", progresses: false },
                
        {"id":"z","text":"Kur yra bankas?","result":"wrong","feedback":"A bank location does not tell you the price of this order.","progresses":false},
      ],
              },
              {
                id: "step_5",
                speakerId: "barista",
                speakerLabel: "Barista",
                speakerText: "Penki eurai. Grynaisiais ar kortele?",
                sceneDirection: "You have both cash and a card, so either payment method is fine.",
                learnerPrompt: "Choose how you want to pay.",
                options: [
                  {"id":"a","text":"Kortele, prašau.","result":"best","progresses":true},
                  {"id":"b","text":"Grynaisiais, prašau.","result":"best","progresses":true},
                
        {"id":"z","text":"Kortele.","result":"acceptable","feedback":"A shorter but clear payment answer.","progresses":true},
      ],
              },
              {
                id: "step_6",
                speakerId: "barista",
                speakerLabel: "Barista",
                speakerText: "Prašom.",
                sceneDirection: "Ieva hands you the coffee.",
                learnerPrompt: "Thank her and close.",
                options: [
                  { id: "a", text: "Ačiū labai! Viso gero.", result: "best", progresses: true },
                  { id: "b", text: "Dar vieną, prašau.", result: "wrong", feedback: "The transaction is finished.", progresses: false },
                
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A simple thank-you is also natural.","progresses":true},
      ],
              },
            ],
          },
        ],
      },

      // ── Lesson 4 — The Bill, Please ───────────────────────────────────────────
      {
        id: "section_4_module_2_lesson_4",
        code: "4.2.4",
        title: "The Bill, Please",
        purpose: "Apply already-known payment language in a natural café closing sequence.",
        supportLevel: "medium",
        newLanguageLoad: "none",
        notes: {
          pattern: "Sąskaitą, prašau and Noriu sumokėti are already in your vocabulary from Section 3. This lesson brings them into a natural closing sequence.",
          usage: [
            "Sąskaitą, prašau — The bill, please",
            "Noriu sumokėti — I want to pay",
            "Ar galima mokėti kortele? — Can I pay by card?",
          ],
        },
        blocks: [
          {
            id: "s4m2l4_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar galėčiau gauti sąskaitą, prašau?", audioText: "Ar galėčiau gauti sąskaitą, prašau" },
            options: [
              { id: "a", text: "The coffee, please.", isCorrect: false },
              { id: "b", text: "The bill, please.", isCorrect: true },
              { id: "c", text: "One more, please.", isCorrect: false },
            ],
          },
          {
            id: "s4m2l4_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You are finished at the café and want to pay. What do you say?" },
            options: [
              { id: "a", text: "Norėčiau kavos.", isCorrect: false },
              { id: "b", text: "Ar galėčiau gauti sąskaitą, prašau?", isCorrect: true },
              { id: "c", text: "Viso gero.", isCorrect: false },
            ],
            feedback: { correct: "Sąskaitą, prašau — The bill, please. The natural way to close any café or restaurant interaction." },
          },
          {
            id: "s4m2l4_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask for the bill",
            targetText: "Ar galėčiau gauti sąskaitą, prašau?",
            audioText: "Ar galėčiau gauti sąskaitą, prašau",
          },
          {
  id: "s4m2l4_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You have finished your coffee. Time to pay and leave.",
  sceneIntro: "You have finished your coffee. Time to pay and leave.",
  location: "café",
  userRole: "customer",
  register: "polite_service",
  goal: "You have finished your coffee. Time to pay and leave.",
  focus: ["ordering","payment","time"],
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
    {
      "id": "card",
      "lt": "kortelė",
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
      speakerId: "barista",
      speakerLabel: "Barista",
      speakerText: "Ar dar ko nors?",
      sceneDirection: "You have finished your coffee and are ready to pay.",
      learnerPrompt: "Say no thanks and ask for the bill.",
      options: [
        {
          id: "a",
          text: "Atsiprašau.",
          result: "wrong",
          feedback: "Ieva asked whether you want anything else; you are ready to ask for the bill.",
          progresses: false,
        },
        {
          id: "b",
          text: "Ne, ačiū. Sąskaitą, prašau.",
          textEn: "Yes, thank you! The bill, please.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Sąskaitą, prašau.","result":"acceptable","feedback":"A concise natural alternative.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "barista",
      speakerLabel: "Barista",
      speakerText: "Žinoma. Grynaisiais ar kortele?",
      sceneDirection: "You want to pay in cash.",
      learnerPrompt: "Choose cash.",
      help: {
        levels: [
          { sceneDirection: "The barista points to the cash tray and then the card terminal.", speakerText: "Kortele?" },
          { sceneDirection: "She holds up a bank card beside the terminal." },
          { speakerText: "Cash or card?", spokenLanguage: "en", audio: false },
        ],
      },
      options: [
        {
          id: "a",
          text: "Ar galėčiau gauti sąskaitą, prašau?",
          result: "wrong",
          feedback: "You already asked for the bill. Now answer cash or card.",
          progresses: false,
        },
        {"id":"b","text":"Kortele, prašau.","textEn":"By card, please.","result":"wrong","feedback":"The scene says you want to use cash.","progresses":false}
      ,
        {"id":"cash","text":"Grynaisiais, prašau.","result":"best","progresses":true},
      ],
    },
    {
      id: "step_3",
      speakerId: "barista",
      speakerLabel: "Barista",
      speakerText: "Prašom. Ačiū!",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Kiek tai kainuoja?",
          result: "wrong",
          feedback: "You have finished and paid; a price question belongs before payment.",
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
          text: "Kur yra tualetas?",
          result: "wrong",
          feedback: "You are leaving after paying, not asking for the toilet.",
          progresses: false,
        }
      ],
    }
  ],
},
        ],
      },

      // ── Lesson 5 — Simple Café Flow ───────────────────────────────────────────
      {
        id: "section_4_module_2_lesson_5",
        code: "4.2.5",
        title: "Simple Café Flow",
        purpose: "Bring the full café sequence together — almost entirely recycled language, just the flow is new.",
        supportLevel: "low",
        newLanguageLoad: "very_low",
        notes: {
          pattern: "A real café interaction is just a sequence of already-known steps: greet, order, for here / to go, customise, pay, close.",
        },
        blocks: [
          {
            id: "s4m2l5_b1",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Čia ar išsinešti?", audioText: "Čia ar išsinešti" },
            options: [
              { id: "a", text: "With milk or without?", isCorrect: false },
              { id: "b", text: "For here or to go?", isCorrect: true },
              { id: "c", text: "Cash or card?", isCorrect: false },
            ],
          },
          {
            id: "s4m2l5_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Grynaisiais ar kortele?", audioText: "Grynaisiais ar kortele" },
            options: [
              { id: "a", text: "For here or to go?", isCorrect: false },
              { id: "b", text: "Coffee or tea?", isCorrect: false },
              { id: "c", text: "Cash or card?", isCorrect: true },
            ],
          },
          {
            id: "s4m2l5_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Staff asks: Su pienu ar be pieno? You want it with milk." },
            options: [
              { id: "a", text: "Be cukraus, prašau.", isCorrect: false },
              { id: "b", text: "Su pienu, prašau.", isCorrect: true },
              { id: "c", text: "Išsinešti, prašau.", isCorrect: false },
            ],
            feedback: { correct: "Su pienu, prašau — With milk, please." },
          },
          {
            id: "s4m2l5_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Order: coffee with milk, please",
            targetText: "Kavos su pienu, prašau",
            audioText: "Kavos su pienu, prašau",
          },
          {
  id: "s4m2l5_b5_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "You have time to drink a coffee here, without milk. Afterwards, pay and leave.",
  sceneIntro: "You have time to drink a coffee at the café. You prefer it without milk. After the coffee, you will pay and leave.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_service",
  goal: "Order coffee for here without milk, request the bill after drinking it, and pay.",
  focus: ["greetings"],
  participants: [
    {
      "id": "local",
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
      "id": "card",
      "lt": "kortelė",
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
      speakerId: "local",
      speakerLabel: "Barista",
      speakerText: "Laba diena! Ko norėtumėte?",
      sceneDirection: "You want coffee and have just arrived.",
      learnerPrompt: "Order coffee politely.",
      options: [
        {
          id: "a",
          text: "Laba diena! Norėčiau arbatos.",
          result: "wrong",
          feedback: "You came for coffee here, not tea.",
          progresses: false,
        },
        {
          id: "b",
          text: "Laba diena! Norėčiau kavos.",
          textEn: "Good day! I would like coffee.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Norėčiau kavos.","result":"acceptable","feedback":"Natural and polite without repeating the greeting.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Barista",
      speakerText: "Čia ar išsinešti?",
      sceneDirection: "You will sit and drink the coffee here.",
      learnerPrompt: "Say that it is for here.",
      options: [
        {
          id: "a",
          text: "Išsinešti, prašau.",
          result: "wrong",
          feedback: "Išsinešti means to take away; you are drinking here.",
          progresses: false,
        },
        {
          id: "b",
          text: "Čia, prašau.",
          textEn: "For here, please.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Čia.","result":"acceptable","feedback":"Shorter, but still clear.","progresses":true},
      ],
    },
    {
      id: "step_3",
      speakerId: "local",
      speakerLabel: "Barista",
      speakerText: "Su pienu ar be pieno?",
      sceneDirection: "You prefer coffee without milk.",
      learnerPrompt: "Say without milk.",
      options: [
        {
          id: "a",
          text: "Su pienu, prašau.",
          result: "wrong",
          feedback: "You prefer coffee without milk; su pienu means with milk.",
          progresses: false,
        },
        {
          id: "b",
          text: "Be pieno, prašau.",
          textEn: "Without milk, please.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Be cukraus, prašau.",
          result: "wrong",
          feedback: "Be cukraus is without sugar; the barista asked whether you want milk.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_4",
      speakerId: "local",
      speakerLabel: "Barista",
      speakerText: "Ar dar ko nors?",
      sceneDirection: "Later, after finishing your coffee, you are ready to pay.",
      learnerPrompt: "Thank the server and ask for the bill.",
      options: [
        {
          id: "a",
          text: "Kiek tai kainuoja?",
          result: "awkward",
          feedback: "That can ask the total, but after drinking at the café, Sąskaitą, prašau asks directly for the bill.",
          betterAnswer: "Ačiū! Sąskaitą, prašau.",
          progresses: true,
        },
        {
          id: "b",
          text: "Ačiū! Sąskaitą, prašau.",
          textEn: "Thank you! The bill, please.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Dar vieną, prašau.",
          result: "wrong",
          feedback: "Dar vieną asks for another; you have finished and want the bill.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_5",
      speakerId: "local",
      speakerLabel: "Barista",
      speakerText: "Grynaisiais ar kortele?",
      sceneDirection: "You have both cash and a card, so either payment method is fine.",
      learnerPrompt: "Choose how you want to pay.",
      options: [
        {
          id: "a",
          text: "Ar galėčiau gauti sąskaitą, prašau?",
          result: "wrong",
          feedback: "You have already asked for the bill. Now choose a payment method.",
          progresses: false,
        },
        {"id":"b","text":"Kortele, prašau.","textEn":"By card, please.","result":"best","progresses":true}
      ,
        {"id":"cash","text":"Grynaisiais, prašau.","result":"best","progresses":true},
      ],
    },
  ],
},
        ],
      },

      // ── Module 4.2 Checkpoint ─────────────────────────────────────────────────
      {
        id: "section_4_module_2_checkpoint",
        code: "4.2.C",
        title: "At the Café",
        purpose: "Check you can handle a full café interaction without support.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s4m2c_b1",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "You want to order a tea. What do you say?" },
            options: [
              { id: "a", text: "Arbata, prašau!", isCorrect: false },
              { id: "b", text: "Norėčiau arbatos.", isCorrect: true },
              { id: "c", text: "Noriu.", isCorrect: false },
            ],
            feedback: { correct: "Norėčiau arbatos — I would like tea. The polite, natural ordering frame." },
          },
          {
            id: "s4m2c_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Norėčiau kavos su pienu, prašau.", audioText: "Norėčiau kavos su pienu, prašau" },
            options: [
              { id: "a", text: "I would like tea with lemon, please.", isCorrect: false },
              { id: "b", text: "I would like coffee with milk, please.", isCorrect: true },
              { id: "c", text: "I would like water, please.", isCorrect: false },
            ],
          },
          {
            id: "s4m2c_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Staff asks: Su pienu ar be pieno? You don't want milk." },
            options: [
              { id: "a", text: "Su pienu, prašau.", isCorrect: false },
              { id: "b", text: "Be pieno, prašau.", isCorrect: true },
              { id: "c", text: "Išsinešti, prašau.", isCorrect: false },
            ],
            feedback: { correct: "Be pieno, prašau — Without milk, please. Be… is the without chunk." },
          },
          {
            id: "s4m2c_b4",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Coffee with milk, please." },
            tokens: [
              { id: "t1", text: "Kavos", correctIndex: 0 },
              { id: "t2", text: "su", correctIndex: 1 },
              { id: "t3", text: "pienu,", correctIndex: 2 },
              { id: "t4", text: "prašau", correctIndex: 3 },
              { id: "t5", text: "be", isDistractor: true, repairHint: "be means “without”. The prompt says “with milk”, so its meaning is the opposite of what you’re trying to say." },
              { id: "t6", text: "cukraus,", isDistractor: true },
            ],
            answerText: "Kavos su pienu, prašau",
          },
          {
            id: "s4m2c_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Order politely: I would like tea without sugar",
            targetText: "Norėčiau arbatos be cukraus",
            audioText: "Norėčiau arbatos be cukraus",
          },
          {
  id: "s4m2c_b6_v2",
  type: "scenario_v2",
  title: "Conversation",
  description: "Order tea with lemon to take away and pay in cash.",
  sceneIntro: "You stop for tea to take away. You want lemon in it and have cash ready for the purchase.",
  location: "real-life exchange",
  userRole: "learner",
  register: "polite_service",
  goal: "Order takeaway tea with lemon and pay in cash.",
  focus: ["ordering","payment"],
  participants: [
    {
      "id": "local",
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
      "id": "card",
      "lt": "kortelė",
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
      speakerId: "local",
      speakerLabel: "Barista",
      speakerText: "Laba diena! Ko norėtumėte?",
      sceneDirection: "You want tea to take away.",
      learnerPrompt: "Order tea politely.",
      options: [
                {
          id: "b",
          text: "Laba diena! Norėčiau arbatos, prašau.",
          textEn: "Good day! I would like tea, please.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Laba diena! Norėčiau kavos, prašau.",
          result: "wrong",
          feedback: "You want tea with lemon, not coffee.",
          progresses: false,
        }
      ,
        {"id":"z","text":"Norėčiau arbatos, prašau.","result":"acceptable","feedback":"Natural and polite without repeating the greeting.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Barista",
      speakerText: "Čia ar išsinešti?",
      sceneDirection: "You are taking the tea with you.",
      learnerPrompt: "Say that it is to go.",
      options: [
        {
          id: "a",
          text: "Čia, prašau.",
          result: "wrong",
          feedback: "Čia means for here; you want the tea to go.",
          progresses: false,
        },
        {
          id: "b",
          text: "Išsinešti, prašau.",
          textEn: "To go, please.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Išsinešti.","result":"acceptable","feedback":"Shorter, but still clear.","progresses":true},
      ],
    },
    {
      id: "step_3",
      speakerId: "local",
      speakerLabel: "Barista",
      speakerText: "Su citrina ar be?",
      sceneDirection: "You want lemon in your tea.",
      learnerPrompt: "Choose tea with lemon.",
      options: [
        {
          id: "a",
          text: "Be citrinos, prašau.",
          result: "wrong",
          feedback: "Be citrinos means without lemon; you want it with lemon.",
          progresses: false,
        },
        {
          id: "b",
          text: "Su citrina, prašau.",
          textEn: "With lemon, please.",
          result: "best",
          progresses: true,
        },
        {
          id: "c",
          text: "Be cukraus, prašau.",
          result: "wrong",
          feedback: "That rejects sugar; the question is whether you want lemon.",
          progresses: false,
        }
      ],
    },
    {
      id: "step_4",
      speakerId: "local",
      speakerLabel: "Barista",
      speakerText: "Prašom. Grynaisiais ar kortele?",
      sceneDirection: "Your takeaway tea is ready. You want to pay with the cash you brought.",
      learnerPrompt: "Choose cash.",
      options: [
        {
          id: "a",
          text: "Ar galėčiau gauti sąskaitą, prašau?",
          result: "wrong",
          feedback: "The barista has handed you the tea and asked cash or card, not for the bill again.",
          progresses: false,
        },
        {
          id: "b",
          text: "Grynaisiais, prašau.",
          textEn: "Cash, please.",
          result: "best",
          progresses: true,
        }
      ,
        {"id":"z","text":"Grynaisiais.","result":"acceptable","feedback":"A shorter but clear payment answer.","progresses":true},
      ],
    },
    {
      id: "step_5",
      speakerId: "local",
      speakerLabel: "Barista",
      speakerText: "Ačiū! Viso gero!",
      sceneDirection: "The conversation continues.",
      learnerPrompt: "Choose the natural closing response.",
      options: [
        {
          id: "a",
          text: "Kiek tai kainuoja?",
          result: "wrong",
          feedback: "The tea has been paid for; the price question belongs earlier.",
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
          feedback: "No problem needs an apology; the barista is saying goodbye.",
          progresses: false,
        }
      ],
    }
  ],
},
          {
            id: "s4m2c_b7",
            type: "word_match",
            pairPages: [
              { id: "group_1", label: "Drinks", pairIds: ["m1", "m2", "m3", "m4"] },
              { id: "group_2", label: "Ordering here or to go", pairIds: ["m5", "m6", "m7", "m8", "m9"] },
              { id: "group_3", label: "With and without", pairIds: ["m10", "m11", "m12", "m19"] },
              { id: "group_4", label: "Ingredients and ordering", pairIds: ["m13", "m14", "m15", "m20"] },
              { id: "group_5", label: "Bill and payment", pairIds: ["m16", "m17", "m18"] },
            ],
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "kava",                    en: "coffee",                     audioText: "kava" },
              { id: "m2",  lt: "arbata",                  en: "tea",                        audioText: "arbata" },
              { id: "m3",  lt: "vanduo",                  en: "water",                      audioText: "vanduo" },
              { id: "m4",  lt: "sultys",                  en: "juice",                      audioText: "sultys" },
              { id: "m5",  lt: "Norėčiau kavos.",         en: "I would like coffee.",       audioText: "Norėčiau kavos" },
              { id: "m6",  lt: "Vandens, prašau.",        en: "Water, please.",             audioText: "Vandens, prašau" },
              { id: "m7",  lt: "Čia ar išsinešti?",       en: "For here or to go?",         audioText: "Čia ar išsinešti" },
              { id: "m8",  lt: "Čia, prašau.",            en: "For here, please.",          audioText: "Čia, prašau" },
              { id: "m9",  lt: "Išsinešti, prašau.",      en: "To go, please.",             audioText: "Išsinešti, prašau" },
              { id: "m10", lt: "su pienu",                en: "with milk",                  audioText: "su pienu" },
              { id: "m11", lt: "be cukraus",              en: "without sugar",              audioText: "be cukraus" },
              { id: "m12", lt: "su citrina",              en: "with lemon",                 audioText: "su citrina" },
              { id: "m13", lt: "pienas",                  en: "milk",                       audioText: "pienas" },
              { id: "m14", lt: "cukrus",                  en: "sugar",                      audioText: "cukrus" },
              { id: "m15", lt: "citrina",                 en: "lemon",                      audioText: "citrina" },
              { id: "m16", lt: "Ar galėčiau gauti sąskaitą, prašau?",       en: "The bill, please.",          audioText: "Ar galėčiau gauti sąskaitą, prašau" },
              { id: "m17", lt: "Ar galima mokėti kortele?",  en: "Can I pay by card?",         audioText: "Ar galima mokėti kortele" },
              { id: "m18", lt: "Grynaisiais ar kortele?", en: "Cash or card?",              audioText: "Grynaisiais ar kortele" },
              { id: "m19", lt: "Su pienu ar be pieno?",   en: "With milk or without milk?", audioText: "Su pienu ar be pieno" },
              { id: "m20", lt: "Norėčiau užsisakyti.",    en: "I would like to order.",     audioText: "Norėčiau užsisakyti" },
            ],
          },
        ],
      },
    ],
  };
}

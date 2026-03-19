// src/content/learning/section1.js

const section1 = {
  id: "section_1",
  code: "1",
  title: "First Contact",
  description: "Essential greetings, polite responses, and survival phrases.",
  status: "active",
  modules: [
    {
      id: "module_1_1",
      code: "1.1",
      title: "Greeting and Politeness",
      status: "active",
      lessons: [

        // ── Lesson 1 ──────────────────────────────────────────────────────────
        {
          id: "section_1_module_1_lesson_1",
          code: "1.1.1",
          title: "Hello and Goodbye",
          purpose: "Introduce first-contact opening and closing language.",
          supportLevel: "high",
          newLanguageLoad: "very_low",
          notes: {
            pattern: "Lithuanian greetings change by time of day. Labas works any time; Laba diena is daytime only.",
            usage: [
              "Labas — casual, any time of day",
              "Laba diena — formal or daytime",
              "Labas rytas / Labas vakaras — morning and evening specifically",
              "Viso gero / Iki — both mean goodbye, Iki is more casual",
            ],
          },
          blocks: [
            {
              id: "s1m1l1_b1",
              type: "learn",
              title: "Greetings and farewells",
              items: [
                { id: "g1", lt: "Labas", en: "Hello (casual)", audioText: "Labas", saveable: true, core: true },
                { id: "g2", lt: "Laba diena", en: "Good day / Hello (formal)", audioText: "Laba diena", saveable: true, core: true },
                { id: "g3", lt: "Labas rytas", en: "Good morning", audioText: "Labas rytas", saveable: true, core: true },
                { id: "g4", lt: "Labas vakaras", en: "Good evening", audioText: "Labas vakaras", saveable: true, core: true },
                { id: "g5", lt: "Viso gero", en: "Goodbye (take care)", audioText: "Viso gero", saveable: true, core: true },
                { id: "g6", lt: "Iki", en: "Bye (casual)", audioText: "Iki", saveable: true, core: true },
              ],
            },
            {
              id: "s1m1l1_b2",
              type: "listen_mcq",
              title: "Listen and choose",
              prompt: { text: "Labas", audioText: "Labas" },
              options: [
                { id: "a", text: "Goodbye", isCorrect: false },
                { id: "b", text: "Hello", isCorrect: true },
                { id: "c", text: "Good morning", isCorrect: false },
              ],
            },
            {
              id: "s1m1l1_b3",
              type: "recognise_mcq",
              title: "Choose the correct meaning",
              prompt: { text: "Laba diena", audioText: "Laba diena" },
              options: [
                { id: "a", text: "Good morning", isCorrect: false },
                { id: "b", text: "Good day / Hello", isCorrect: true },
                { id: "c", text: "Goodbye", isCorrect: false },
              ],
            },
            {
              id: "s1m1l1_b3b",
              type: "listen_mcq",
              title: "Listen and choose",
              prompt: { text: "Labas vakaras", audioText: "Labas vakaras" },
              options: [
                { id: "a", text: "Good morning", isCorrect: false },
                { id: "b", text: "Good evening", isCorrect: true },
                { id: "c", text: "Goodbye", isCorrect: false },
              ],
            },
            {
              id: "s1m1l1_b3c",
              type: "recognise_mcq",
              title: "Choose the correct meaning",
              prompt: { text: "Iki", audioText: "Iki" },
              options: [
                { id: "a", text: "Hello", isCorrect: false },
                { id: "b", text: "Good evening", isCorrect: false },
                { id: "c", text: "Bye (casual)", isCorrect: true },
              ],
            },
            {
              id: "s1m1l1_b4",
              type: "best_response",
              title: "Choose the best response",
              prompt: { text: "Someone says Laba diena to you in a shop." },
              options: [
                { id: "a", text: "Labas rytas", isCorrect: false },
                { id: "b", text: "Laba diena", isCorrect: true },
                { id: "c", text: "Viso gero", isCorrect: false },
              ],
              feedback: { correct: "Match the register — laba diena for laba diena." },
            },
            {
              id: "s1m1l1_b5",
              type: "speak_self_check",
              title: "Say it out loud",
              prompt: "Say hello in Lithuanian",
              targetText: "Labas",
              audioText: "Labas",
            },
            {
              id: "s1m1l1_b6",
              type: "build_phrase",
              title: "Build the phrase",
              prompt: { text: "Good morning" },
              tokens: [
                { id: "t3", text: "vakaras", isDistractor: true },
                { id: "t2", text: "rytas", correctIndex: 1 },
                { id: "t1", text: "Labas", correctIndex: 0 },
              ],
              answerText: "Labas rytas",
            },
            {
              id: "s1m1l1_b7",
              type: "scenario_chain",
              title: "Conversation",
              description: "Complete a short greeting exchange.",
              steps: [
                {
                  id: "step_1",
                  actor: "other",
                  text: "Labas!",
                  audioText: "Labas",
                  options: [
                    { id: "a", text: "Labas!", isCorrect: true },
                    { id: "b", text: "Viso gero", isCorrect: false },
                    { id: "c", text: "Ne", isCorrect: false },
                  ],
                },
                {
                  id: "step_2",
                  actor: "other",
                  text: "Viso gero!",
                  audioText: "Viso gero",
                  options: [
                    { id: "a", text: "Laba diena", isCorrect: false },
                    { id: "b", text: "Iki!", isCorrect: true },
                    { id: "c", text: "Taip", isCorrect: false },
                  ],
                },
              ],
            },
          ],
        },

        // ── Lesson 2 ──────────────────────────────────────────────────────────
        {
          id: "section_1_module_1_lesson_2",
          code: "1.1.2",
          title: "Yes, No, Please, Thank You",
          purpose: "Core polite responses that work in almost every situation.",
          supportLevel: "high",
          newLanguageLoad: "very_low",
          notes: {
            pattern: "Prašau does double duty — it means both 'please' and 'here you go / you're welcome'. Words combine naturally: Ne, ačiū is the polite way to say no.",
            usage: [
              "Taip / Ne — yes and no",
              "Taip, prašau — yes please (accepting something politely)",
              "Ne, ačiū — no thank you (declining something politely)",
              "Prašau — please (when asking) or here you go / you're welcome (when giving)",
              "Ačiū — thank you",
              "Ačiū labai — thank you very much",
            ],
          },
          blocks: [
            {
              id: "s1m1l2_b1",
              type: "learn",
              title: "Essential polite words",
              items: [
                { id: "p1", lt: "Taip", en: "Yes", audioText: "Taip", saveable: true, core: true },
                { id: "p2", lt: "Ne", en: "No", audioText: "Ne", saveable: true, core: true },
                { id: "p3", lt: "Prašau", en: "Please / Here you go / You're welcome", audioText: "Prašau", saveable: true, core: true },
                { id: "p4", lt: "Ačiū", en: "Thank you", audioText: "Ačiū", saveable: true, core: true },
                { id: "p5", lt: "Ačiū labai", en: "Thank you very much", audioText: "Ačiū labai", saveable: true, core: true },
                { id: "p6", lt: "Taip, prašau", en: "Yes please", audioText: "Taip, prašau", saveable: true, core: true },
                { id: "p7", lt: "Ne, ačiū", en: "No thank you", audioText: "Ne, ačiū", saveable: true, core: true },
                { id: "p8", lt: "Norėčiau kavos, prašau", en: "I'd like a coffee, please", audioText: "Norėčiau kavos, prašau", saveable: true, core: true },
              ],
            },
            {
              id: "s1m1l2_b1b",
              type: "listen_mcq",
              title: "Listen and choose",
              prompt: { text: "Taip", audioText: "Taip" },
              options: [
                { id: "a", text: "No", isCorrect: false },
                { id: "b", text: "Please", isCorrect: false },
                { id: "c", text: "Yes", isCorrect: true },
              ],
            },
            {
              id: "s1m1l2_b1c",
              type: "best_response",
              title: "Choose the best response",
              prompt: { text: "Someone offers you a second helping and you don't want it." },
              options: [
                { id: "a", text: "Taip, prašau", isCorrect: false },
                { id: "b", text: "Ne, ačiū", isCorrect: true },
                { id: "c", text: "Ačiū labai", isCorrect: false },
              ],
              feedback: { correct: "Ne, ačiū — no thank you. Bare 'Ne' can sound abrupt; adding ačiū keeps it polite." },
            },
            {
              id: "s1m1l2_b1d",
              type: "best_response",
              title: "Choose the best response",
              prompt: { text: "Someone offers you a coffee and you'd like one." },
              options: [
                { id: "a", text: "Ne, ačiū", isCorrect: false },
                { id: "b", text: "Taip, prašau", isCorrect: true },
                { id: "c", text: "Viso gero", isCorrect: false },
              ],
              feedback: { correct: "Taip, prašau — yes please. Much more natural than Taip alone." },
            },
            {
              id: "s1m1l2_b2",
              type: "listen_mcq",
              title: "Listen and choose",
              prompt: { text: "Ačiū", audioText: "Ačiū" },
              options: [
                { id: "a", text: "Please", isCorrect: false },
                { id: "b", text: "Yes", isCorrect: false },
                { id: "c", text: "Thank you", isCorrect: true },
              ],
            },
            {
              id: "s1m1l2_b3",
              type: "best_response",
              title: "Choose the best response",
              prompt: { text: "Someone hands you something and says Prašau." },
              options: [
                { id: "a", text: "Ačiū", isCorrect: true },
                { id: "b", text: "Ne", isCorrect: false },
                { id: "c", text: "Labas", isCorrect: false },
              ],
              feedback: { correct: "Prašau here means 'here you go' — Ačiū is the natural reply." },
            },
            {
              id: "s1m1l2_b4",
              type: "recognise_mcq",
              title: "Choose the correct meaning",
              prompt: { text: "Ačiū labai", audioText: "Ačiū labai" },
              options: [
                { id: "a", text: "Thank you very much", isCorrect: true },
                { id: "b", text: "You're welcome", isCorrect: false },
                { id: "c", text: "Please", isCorrect: false },
              ],
            },
            {
              id: "s1m1l2_b4b",
              type: "listen_mcq",
              title: "Listen and choose",
              prompt: { text: "Ne, ačiū", audioText: "Ne, ačiū" },
              options: [
                { id: "a", text: "Yes please", isCorrect: false },
                { id: "b", text: "No thank you", isCorrect: true },
                { id: "c", text: "Thank you very much", isCorrect: false },
              ],
            },
            {
              id: "s1m1l2_b4c",
              type: "recognise_mcq",
              title: "Choose the correct meaning",
              prompt: { text: "Norėčiau kavos, prašau", audioText: "Norėčiau kavos, prašau" },
              options: [
                { id: "a", text: "Here is your coffee", isCorrect: false },
                { id: "b", text: "I'd like a coffee, please", isCorrect: true },
                { id: "c", text: "No thank you", isCorrect: false },
              ],
              feedback: { correct: "Norėčiau means 'I would like' — a polite and natural way to order anything." },
            },
            {
              id: "s1m1l2_b5",
              type: "speak_self_check",
              title: "Say it out loud",
              prompt: "Say thank you in Lithuanian",
              targetText: "Ačiū",
              audioText: "Ačiū",
            },
            {
              id: "s1m1l2_b6",
              type: "scenario_chain",
              title: "Conversation",
              description: "You walk into a café. Order a coffee and complete the exchange.",
              steps: [
                {
                  id: "step_1",
                  actor: "other",
                  text: "Laba diena!",
                  audioText: "Laba diena",
                  options: [
                    { id: "a", text: "Laba diena!", isCorrect: true },
                    { id: "b", text: "Viso gero", isCorrect: false },
                    { id: "c", text: "Ne, ačiū", isCorrect: false },
                  ],
                },
                {
                  id: "step_2",
                  actor: "other",
                  text: "Taip?",
                  audioText: "Taip",
                  options: [
                    { id: "a", text: "Ačiū labai", isCorrect: false },
                    { id: "b", text: "Ne, ačiū", isCorrect: false },
                    { id: "c", text: "Norėčiau kavos, prašau", isCorrect: true },
                  ],
                },
                {
                  id: "step_3",
                  actor: "other",
                  text: "Prašau.",
                  audioText: "Prašau",
                  options: [
                    { id: "a", text: "Ačiū labai!", isCorrect: true },
                    { id: "b", text: "Ne, ačiū", isCorrect: false },
                    { id: "c", text: "Taip", isCorrect: false },
                  ],
                },
                {
                  id: "step_4",
                  actor: "other",
                  text: "Viso gero!",
                  audioText: "Viso gero",
                  options: [
                    { id: "a", text: "Atsiprašau", isCorrect: false },
                    { id: "b", text: "Taip, prašau", isCorrect: false },
                    { id: "c", text: "Iki!", isCorrect: true },
                  ],
                },
              ],
            },
          ],
        },

        // ── Lesson 3 ──────────────────────────────────────────────────────────
        {
          id: "section_1_module_1_lesson_3",
          code: "1.1.3",
          title: "Sorry and Excuse Me",
          purpose: "Teach interruption and light apology language.",
          supportLevel: "medium",
          newLanguageLoad: "low_to_medium",
          notes: {
            pattern: "One English idea often maps to different Lithuanian words depending on situation.",
            usage: [
              "Atsiprašau — sorry (apology) or excuse me (interruption)",
              "Atleiskite — more formal excuse me / forgive me",
              "Prašau dar kartą — one more time please (when you didn't catch something)",
            ],
          },
          blocks: [
            {
              id: "s1m1l3_b1",
              type: "learn",
              title: "Apology and interruption language",
              items: [
                { id: "sorry_1", lt: "Atsiprašau", en: "Sorry / Excuse me", audioText: "Atsiprašau", saveable: true, core: true },
                { id: "sorry_2", lt: "Prašau dar kartą", en: "One more time, please", audioText: "Prašau dar kartą", saveable: true, core: true },
                { id: "sorry_3", lt: "Atleiskite", en: "Excuse me / Forgive me (formal)", audioText: "Atleiskite", saveable: true, core: true },
              ],
            },
            {
              id: "s1m1l3_b2",
              type: "recognise_mcq",
              title: "Choose the right phrase",
              prompt: { text: "You bump into someone lightly and want to apologise." },
              options: [
                { id: "a", text: "Atsiprašau", isCorrect: true },
                { id: "b", text: "Taip", isCorrect: false },
                { id: "c", text: "Viso gero", isCorrect: false },
              ],
            },
            {
              id: "s1m1l3_b3",
              type: "recognise_mcq",
              title: "Choose the right phrase",
              prompt: { text: "You need someone to repeat what they said." },
              options: [
                { id: "a", text: "Prašau dar kartą", isCorrect: true },
                { id: "b", text: "Labas vakaras", isCorrect: false },
                { id: "c", text: "Ne", isCorrect: false },
              ],
            },
            {
              id: "s1m1l3_b3b",
              type: "recognise_mcq",
              title: "Choose the right phrase",
              prompt: { text: "You want to formally excuse yourself — more polite than usual." },
              options: [
                { id: "a", text: "Atsiprašau", isCorrect: false },
                { id: "b", text: "Atleiskite", isCorrect: true },
                { id: "c", text: "Prašau", isCorrect: false },
              ],
              feedback: { correct: "Atleiskite is the more formal version — used when you want to be especially polite or respectful." },
            },
            {
              id: "s1m1l3_b4",
              type: "build_phrase",
              title: "Build the phrase",
              prompt: { text: "One more time, please" },
              tokens: [
                { id: "t3", text: "kartą", correctIndex: 2 },
                { id: "t1", text: "Prašau", correctIndex: 0 },
                { id: "t2", text: "dar", correctIndex: 1 },
              ],
              answerText: "Prašau dar kartą",
            },
            {
              id: "s1m1l3_b5",
              type: "listen_mcq",
              title: "Listen and choose",
              prompt: { text: "Atsiprašau", audioText: "Atsiprašau" },
              options: [
                { id: "a", text: "Thank you", isCorrect: false },
                { id: "b", text: "Sorry / Excuse me", isCorrect: true },
                { id: "c", text: "Please / Here you go", isCorrect: false },
              ],
            },
            {
              id: "s1m1l3_b5b",
              type: "listen_mcq",
              title: "Listen and choose",
              prompt: { text: "Atleiskite", audioText: "Atleiskite" },
              options: [
                { id: "a", text: "One more time please", isCorrect: false },
                { id: "b", text: "Sorry / Excuse me (casual)", isCorrect: false },
                { id: "c", text: "Excuse me / Forgive me (formal)", isCorrect: true },
              ],
            },
            {
              id: "s1m1l3_b6",
              type: "best_response",
              title: "Use the right phrase",
              prompt: { text: "You want to get someone's attention politely on the street." },
              options: [
                { id: "a", text: "Atsiprašau", isCorrect: true },
                { id: "b", text: "Iki", isCorrect: false },
                { id: "c", text: "Ne", isCorrect: false },
              ],
              feedback: { correct: "Atsiprašau works both as 'excuse me' to get attention and 'sorry' to apologise." },
            },
            {
              id: "s1m1l3_b7",
              type: "best_response",
              title: "Use the right phrase",
              prompt: { text: "Someone speaks too quickly and you didn't catch it." },
              options: [
                { id: "a", text: "Prašau dar kartą", isCorrect: true },
                { id: "b", text: "Ačiū labai", isCorrect: false },
                { id: "c", text: "Labas rytas", isCorrect: false },
              ],
              feedback: { correct: "Prašau dar kartą — one more time please. A phrase you'll use constantly as a learner." },
            },
          ],
        },

        // ── Lesson 4 ──────────────────────────────────────────────────────────
        {
          id: "section_1_module_1_lesson_4",
          code: "1.1.4",
          title: "Polite Mini Exchanges",
          purpose: "Move from isolated words to short realistic exchanges.",
          supportLevel: "medium",
          newLanguageLoad: "very_low",
          notes: {
            pattern: "This lesson is about chaining phrases together — real conversations are just short chains.",
          },
          blocks: [
            {
              id: "s1m1l4_b1",
              type: "best_response",
              title: "Choose the correct response",
              prompt: { text: "Someone greets you with Labas as you walk in.", audioText: "Labas" },
              options: [
                { id: "a", text: "Labas!", isCorrect: true },
                { id: "b", text: "Viso gero", isCorrect: false },
                { id: "c", text: "Ne", isCorrect: false },
              ],
              feedback: { correct: "Match the greeting — Labas to Labas." },
            },
            {
              id: "s1m1l4_b2",
              type: "best_response",
              title: "Choose the best response",
              prompt: { text: "Someone helps you and hands something over saying Prašau.", audioText: "Prašau" },
              options: [
                { id: "a", text: "Ačiū", isCorrect: true },
                { id: "b", text: "Iki", isCorrect: false },
                { id: "c", text: "Labas rytas", isCorrect: false },
              ],
              feedback: { correct: "Prašau here means 'here you go' — Ačiū is the natural reply." },
            },
            {
              id: "s1m1l4_b3",
              type: "speak_self_check",
              title: "Say the response",
              prompt: "Someone says Labas to you — reply out loud",
              targetText: "Labas",
              audioText: "Labas",
            },
            {
              id: "s1m1l4_b4",
              type: "speak_self_check",
              title: "Say the response",
              prompt: "Someone hands you your coffee and says Prašau — reply out loud",
              targetText: "Ačiū",
              audioText: "Ačiū",
            },
            {
              id: "s1m1l4_b5",
              type: "scenario_chain",
              title: "Conversation",
              description: "You're at a hotel reception. The receptionist checks you in.",
              steps: [
                {
                  id: "step_1",
                  actor: "other",
                  text: "Laba diena!",
                  audioText: "Laba diena",
                  options: [
                    { id: "a", text: "Laba diena!", isCorrect: true },
                    { id: "b", text: "Ne", isCorrect: false },
                    { id: "c", text: "Ačiū", isCorrect: false },
                  ],
                },
                {
                  id: "step_2",
                  actor: "other",
                  text: "Prašau.",
                  audioText: "Prašau",
                  options: [
                    { id: "a", text: "Ačiū!", isCorrect: true },
                    { id: "b", text: "Viso gero", isCorrect: false },
                    { id: "c", text: "Atsiprašau", isCorrect: false },
                  ],
                },
                {
                  id: "step_3",
                  actor: "other",
                  text: "Viso gero!",
                  audioText: "Viso gero",
                  options: [
                    { id: "a", text: "Iki!", isCorrect: true },
                    { id: "b", text: "Taip", isCorrect: false },
                    { id: "c", text: "Prašau dar kartą", isCorrect: false },
                  ],
                },
              ],
            },
          ],
        },

        // ── Checkpoint ────────────────────────────────────────────────────────
        // No verbatim repeats from lessons. Every block uses a new framing,
        // new situation, or reversed prompt so the user has to actually recall
        // rather than recognise something they just saw.
        {
          id: "section_1_module_1_checkpoint",
          code: "1.1.C",
          title: "Checkpoint",
          purpose: "Check you can recall and use Module 1.1 language without support.",
          supportLevel: "none",
          newLanguageLoad: "none",
          isCheckpoint: true,
          blocks: [
            // Greetings — time-of-day reasoning (not just matching a sound)
            {
              id: "s1m1c_b1",
              type: "best_response",
              title: "Choose the best response",
              prompt: { text: "It's 9am. You walk into a shop. What do you say?" },
              options: [
                { id: "a", text: "Labas vakaras", isCorrect: false },
                { id: "b", text: "Labas rytas", isCorrect: true },
                { id: "c", text: "Viso gero", isCorrect: false },
              ],
              feedback: { correct: "Labas rytas — good morning. Time-appropriate and natural." },
            },
            // Farewell — choose the right register
            {
              id: "s1m1c_b2",
              type: "best_response",
              title: "Choose the best response",
              prompt: { text: "You're leaving a formal meeting. What's the right farewell?" },
              options: [
                { id: "a", text: "Iki", isCorrect: false },
                { id: "b", text: "Labas", isCorrect: false },
                { id: "c", text: "Viso gero", isCorrect: true },
              ],
              feedback: { correct: "Viso gero is more formal. Iki is casual — save it for friends." },
            },
            // Polite decline — new framing
            {
              id: "s1m1c_b3",
              type: "best_response",
              title: "Choose the best response",
              prompt: { text: "A waiter offers you dessert and you don't want any." },
              options: [
                { id: "a", text: "Taip, prašau", isCorrect: false },
                { id: "b", text: "Atsiprašau", isCorrect: false },
                { id: "c", text: "Ne, ačiū", isCorrect: true },
              ],
              feedback: { correct: "Ne, ačiū — polite, clear, and natural in any service situation." },
            },
            // Listen — Prašau dar kartą (new context: heard in the wild)
            {
              id: "s1m1c_b4",
              type: "listen_mcq",
              title: "Listen and identify",
              prompt: { text: "Prašau dar kartą", audioText: "Prašau dar kartą" },
              options: [
                { id: "a", text: "Here you go", isCorrect: false },
                { id: "b", text: "One more time, please", isCorrect: true },
                { id: "c", text: "You're welcome", isCorrect: false },
              ],
            },
            // Formal vs informal — Atleiskite vs Atsiprašau
            {
              id: "s1m1c_b5",
              type: "best_response",
              title: "Choose the best response",
              prompt: { text: "You need to interrupt an older person politely to ask for directions." },
              options: [
                { id: "a", text: "Atsiprašau", isCorrect: false },
                { id: "b", text: "Atleiskite", isCorrect: true },
                { id: "c", text: "Prašau dar kartą", isCorrect: false },
              ],
              feedback: { correct: "Atleiskite signals more respect — the right choice with someone older or in a formal context." },
            },
            // Build phrase — Labas vakaras this time (not Labas rytas)
            {
              id: "s1m1c_b6",
              type: "build_phrase",
              title: "Build the phrase",
              prompt: { text: "Good evening" },
              tokens: [
                { id: "t2", text: "vakaras", correctIndex: 1 },
                { id: "t3", text: "rytas", isDistractor: true },
                { id: "t1", text: "Labas", correctIndex: 0 },
              ],
              answerText: "Labas vakaras",
            },
            // Speak — Atsiprašau (different prompt from the lesson)
            {
              id: "s1m1c_b7",
              type: "speak_self_check",
              title: "Say it out loud",
              prompt: "You've just bumped into someone — say sorry",
              targetText: "Atsiprašau",
              audioText: "Atsiprašau",
            },
            // Listen — Ačiū labai in a new option set
            {
              id: "s1m1c_b8",
              type: "listen_mcq",
              title: "Listen and identify",
              prompt: { text: "Ačiū labai", audioText: "Ačiū labai" },
              options: [
                { id: "a", text: "No thank you", isCorrect: false },
                { id: "b", text: "You're welcome", isCorrect: false },
                { id: "c", text: "Thank you very much", isCorrect: true },
              ],
            },
            // Scenario — café order but in reverse: user is the server
            // Tests whether they can produce the right response even when
            // the role is flipped
            {
              id: "s1m1c_b9",
              type: "scenario_chain",
              title: "Conversation",
              description: "You're meeting a Lithuanian colleague for the first time at a café.",
              steps: [
                {
                  id: "step_1",
                  actor: "other",
                  text: "Laba diena! Kaip sekasi?",
                  audioText: "Laba diena",
                  options: [
                    { id: "a", text: "Viso gero!", isCorrect: false },
                    { id: "b", text: "Laba diena!", isCorrect: true },
                    { id: "c", text: "Atsiprašau", isCorrect: false },
                  ],
                },
                {
                  id: "step_2",
                  actor: "other",
                  text: "Prašau.",
                  audioText: "Prašau",
                  options: [
                    { id: "a", text: "Ne, ačiū", isCorrect: false },
                    { id: "b", text: "Ačiū labai!", isCorrect: true },
                    { id: "c", text: "Prašau dar kartą", isCorrect: false },
                  ],
                },
                {
                  id: "step_3",
                  actor: "other",
                  text: "Viso gero!",
                  audioText: "Viso gero",
                  options: [
                    { id: "a", text: "Taip, prašau", isCorrect: false },
                    { id: "b", text: "Labas rytas", isCorrect: false },
                    { id: "c", text: "Iki!", isCorrect: true },
                  ],
                },
              ],
            },
          ],
        },
            // Final block — match pairs across the whole module
            {
              id: "s1m1c_b10",
              type: "word_match",
              title: "Match the pairs",
              pairs: [
                { id: "m1", lt: "Labas", en: "Hello", audioText: "Labas" },
                { id: "m2", lt: "Viso gero", en: "Goodbye", audioText: "Viso gero" },
                { id: "m3", lt: "Ačiū", en: "Thank you", audioText: "Ačiū" },
                { id: "m4", lt: "Prašau", en: "Please / Here you go", audioText: "Prašau" },
                { id: "m5", lt: "Ne, ačiū", en: "No thank you", audioText: "Ne, ačiū" },
                { id: "m6", lt: "Taip, prašau", en: "Yes please", audioText: "Taip, prašau" },
                { id: "m7", lt: "Atsiprašau", en: "Sorry / Excuse me", audioText: "Atsiprašau" },
                { id: "m8", lt: "Prašau dar kartą", en: "One more time, please", audioText: "Prašau dar kartą" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default section1;

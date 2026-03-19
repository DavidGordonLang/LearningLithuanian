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
                { id: "g4", lt: "Labas vakaras", en: "Good evening", audioText: "Labas vakaras", saveable: true, core: false },
                { id: "g5", lt: "Viso gero", en: "Goodbye (take care)", audioText: "Viso gero", saveable: true, core: true },
                { id: "g6", lt: "Iki", en: "Bye (casual)", audioText: "Iki", saveable: true, core: true },
              ],
            },
            {
              id: "s1m1l1_b2",
              type: "listen_mcq",
              title: "Listen and choose",
              prompt: { audioText: "Labas" },
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
              id: "s1m1l1_b4",
              type: "best_response",
              title: "Choose the best response",
              prompt: { text: "Someone says Laba diena to you in a shop." },
              options: [
                { id: "a", text: "Labas rytas", isCorrect: false },
                { id: "b", text: "Laba diena", isCorrect: true },
                { id: "c", text: "Viso gero", isCorrect: false },
              ],
              feedback: { correct: "Matching the register — laba diena for laba diena." },
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
                { id: "t1", text: "Labas", correctIndex: 0 },
                { id: "t2", text: "rytas", correctIndex: 1 },
                { id: "t3", text: "vakaras", isDistractor: true },
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
            pattern: "Prašau does double duty — it means both 'please' and 'here you go / you're welcome'.",
            usage: [
              "Taip / Ne — yes and no",
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
              ],
            },
            {
              id: "s1m1l2_b2",
              type: "listen_mcq",
              title: "Listen and choose",
              prompt: { audioText: "Ačiū" },
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
              title: "What does this mean?",
              prompt: { text: "Ačiū labai", audioText: "Ačiū labai" },
              options: [
                { id: "a", text: "Thank you very much", isCorrect: true },
                { id: "b", text: "You're welcome", isCorrect: false },
                { id: "c", text: "Please", isCorrect: false },
              ],
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
              description: "A quick exchange at a café counter.",
              steps: [
                {
                  id: "step_1",
                  actor: "other",
                  text: "Prašau.",
                  audioText: "Prašau",
                  options: [
                    { id: "a", text: "Ačiū", isCorrect: true },
                    { id: "b", text: "Ne", isCorrect: false },
                    { id: "c", text: "Viso gero", isCorrect: false },
                  ],
                },
                {
                  id: "step_2",
                  actor: "other",
                  text: "Viso gero!",
                  audioText: "Viso gero",
                  options: [
                    { id: "a", text: "Taip", isCorrect: false },
                    { id: "b", text: "Iki!", isCorrect: true },
                    { id: "c", text: "Ačiū labai", isCorrect: false },
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
                { id: "sorry_3", lt: "Atleiskite", en: "Excuse me / Forgive me (formal)", audioText: "Atleiskite", saveable: true, core: false },
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
              id: "s1m1l3_b4",
              type: "build_phrase",
              title: "Build the phrase",
              prompt: { text: "One more time, please" },
              tokens: [
                { id: "t1", text: "Prašau", correctIndex: 0 },
                { id: "t2", text: "dar", correctIndex: 1 },
                { id: "t3", text: "kartą", correctIndex: 2 },
              ],
              answerText: "Prašau dar kartą",
            },
            {
              id: "s1m1l3_b5",
              type: "listen_mcq",
              title: "Listen and choose",
              prompt: { audioText: "Atsiprašau" },
              options: [
                { id: "a", text: "Ačiū", isCorrect: false },
                { id: "b", text: "Atsiprašau", isCorrect: true },
                { id: "c", text: "Prašau", isCorrect: false },
              ],
            },
            // Replaced scenario_chain (narrator/English steps) with two
            // best_response MCQ blocks — same learning goal, correct block type
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
              // Context shown above chat window, not read by TTS
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
                  // Hands over key card and says "here you go"
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
        {
          id: "section_1_module_1_checkpoint",
          code: "1.1.C",
          title: "Checkpoint",
          purpose: "Check you can recall and use Module 1.1 language without support.",
          supportLevel: "none",
          newLanguageLoad: "none",
          isCheckpoint: true,
          blocks: [
            {
              id: "s1m1c_b1",
              type: "listen_mcq",
              title: "Listen and identify",
              prompt: { audioText: "Laba diena" },
              options: [
                { id: "a", text: "Good morning", isCorrect: false },
                { id: "b", text: "Good day / Hello", isCorrect: true },
                { id: "c", text: "Goodbye", isCorrect: false },
              ],
            },
            {
              id: "s1m1c_b2",
              type: "recognise_mcq",
              title: "Translate this",
              prompt: { text: "Ačiū labai", audioText: "Ačiū labai" },
              options: [
                { id: "a", text: "Thank you very much", isCorrect: true },
                { id: "b", text: "Please", isCorrect: false },
                { id: "c", text: "Excuse me", isCorrect: false },
              ],
            },
            {
              id: "s1m1c_b3",
              type: "best_response",
              title: "Choose the best response",
              prompt: { text: "Someone says Atsiprašau after bumping into you." },
              options: [
                { id: "a", text: "Prašau", isCorrect: true },
                { id: "b", text: "Ne", isCorrect: false },
                { id: "c", text: "Viso gero", isCorrect: false },
              ],
              feedback: { correct: "Prašau here means 'it's fine / no worries'." },
            },
            {
              id: "s1m1c_b4",
              type: "build_phrase",
              title: "Build the phrase",
              prompt: { text: "One more time, please" },
              tokens: [
                { id: "t1", text: "Prašau", correctIndex: 0 },
                { id: "t2", text: "dar", correctIndex: 1 },
                { id: "t3", text: "kartą", correctIndex: 2 },
                { id: "t4", text: "labai", isDistractor: true },
              ],
              answerText: "Prašau dar kartą",
            },
            {
              id: "s1m1c_b5",
              type: "speak_self_check",
              title: "Say it out loud",
              prompt: "Say 'excuse me' to get someone's attention",
              targetText: "Atsiprašau",
              audioText: "Atsiprašau",
            },
            {
              id: "s1m1c_b6",
              type: "listen_mcq",
              title: "Listen and identify",
              prompt: { audioText: "Atsiprašau" },
              options: [
                { id: "a", text: "Thank you", isCorrect: false },
                { id: "b", text: "Goodbye", isCorrect: false },
                { id: "c", text: "Sorry / Excuse me", isCorrect: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default section1;

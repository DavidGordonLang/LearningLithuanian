// src/content/learning/section2/module_2_3.js
// Module 2.3 — This / That / Choosing

export default function createModule_2_3(profile = {}) {
  return {
    id: "module_2_3",
    code: "2.3",
    title: "This / That / Choosing",
    status: "active",
    lessonCount: 2,
    lessons: [

      // ── Lesson 1 ────────────────────────────────────────────────────────────
      {
        id: "section_2_module_3_lesson_1",
        code: "2.3.1",
        title: "This / That with Objects",
        purpose: "Teach singular near/far pointing with explicit noun gender and physical context rather than abstract English this/that translation.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "Distance and noun gender both matter. For the examples in this lesson: šitas / tas with masculine obuolys, and šita / ta with feminine duona. Learn the noun and pointing form together rather than memorising a grammar table.",
          usage: [
            "Šitas obuolys — this apple (nearby, masculine)",
            "Tas obuolys — that apple (further away, masculine)",
            "Šita duona — this bread (nearby, feminine)",
            "Ta duona — that bread (further away, feminine)",
          ],
        },
        blocks: [
          {
            id: "s2m3l1_b1",
            type: "learn",
            title: "Near, far, masculine, feminine",
            items: [
              { id: "d1", lt: "Šitas obuolys", en: "This apple", audioText: "Šitas obuolys", saveable: true, core: true },
              { id: "d2", lt: "Tas obuolys", en: "That apple", audioText: "Tas obuolys", saveable: true, core: true },
              { id: "d3", lt: "Šita duona", en: "This bread", audioText: "Šita duona", saveable: true, core: true },
              { id: "d4", lt: "Ta duona", en: "That bread", audioText: "Ta duona", saveable: true, core: true },
              { id: "d5", lt: "Obuolys", en: "Apple", audioText: "Obuolys", saveable: true, core: false },
              { id: "d6", lt: "Duona", en: "Bread", audioText: "Duona", saveable: true, core: false },
            ],
          },
          {
            id: "s2m3l1_b2",
            type: "context_gap_select",
            title: "Choose the form that fits",
            prompt: "An apple is on the counter directly in front of you.",
            sentence: "___ obuolys.",
            translation_en: "This apple.",
            options: [
              { id: "a", text: "Šitas", isCorrect: true },
              { id: "b", text: "Tas", isCorrect: false },
              { id: "c", text: "Šita", isCorrect: false },
            ],
            explanation: "The apple is nearby, so use the near form. Obuolys is masculine here, so the form is šitas.",
          },
          {
            id: "s2m3l1_b3",
            type: "context_gap_select",
            title: "Choose the form that fits",
            prompt: "A loaf of bread is on a shelf further away.",
            sentence: "___ duona.",
            translation_en: "That bread.",
            options: [
              { id: "a", text: "Šita", isCorrect: false },
              { id: "b", text: "Ta", isCorrect: true },
              { id: "c", text: "Tas", isCorrect: false },
            ],
            explanation: "The bread is further away, so use the far form. Duona is feminine here, so the form is ta.",
          },
          {
            id: "s2m3l1_b4",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Šita duona", audioText: "Šita duona" },
            options: [
              { id: "a", text: "This bread", isCorrect: true },
              { id: "b", text: "That bread", isCorrect: false },
              { id: "c", text: "This apple", isCorrect: false },
            ],
          },
          {
            id: "s2m3l1_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "That apple" },
            tokens: [
              { id: "t1", text: "Tas", correctIndex: 0 },
              { id: "t2", text: "obuolys", correctIndex: 1 },
              { id: "t3", text: "Ta", isDistractor: true },
            ],
            answerText: "Tas obuolys",
          },
          {
            id: "s2m3l1_b6",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: This bread",
            targetText: "Šita duona",
            audioText: "Šita duona",
          },
        ],
      },

      // ── Lesson 2 ────────────────────────────────────────────────────────────
      {
        id: "section_2_module_3_lesson_2",
        code: "2.3.2",
        title: "This One / That One",
        purpose: "Turn singular pointing into practical selection while making the masculine/feminine form shift visible in context.",
        supportLevel: "medium",
        newLanguageLoad: "medium",
        notes: {
          pattern: "When you select an item after noriu, the pointing form changes. In these chunks: šitas → šito and tas → to for a masculine item; šita → šitos and ta → tos for a feminine item. Notice the shift and learn the useful chunks rather than memorising case labels.",
          usage: [
            "Noriu šito — I want this one (masculine item)",
            "Noriu to — I want that one (masculine item)",
            "Noriu šitos — I want this one (feminine item)",
            "Noriu tos — I want that one (feminine item)",
            "Šito, prašau — This one, please (masculine item)",
            "Tos, prašau — That one, please (feminine item)",
          ],
        },
        blocks: [
          {
            id: "s2m3l2_b1",
            type: "learn",
            title: "Choosing one item",
            items: [
              { id: "o3", lt: "Noriu šitos.", en: "I want this one. (feminine item)", audioText: "Noriu šitos", saveable: true, core: true },
              { id: "o4", lt: "Noriu tos.", en: "I want that one. (feminine item)", audioText: "Noriu tos", saveable: true, core: true },
              { id: "o5", lt: "Šito, prašau.", en: "This one, please. (masculine item)", audioText: "Šito, prašau", saveable: true, core: true },
              { id: "o6", lt: "Tos, prašau.", en: "That one, please. (feminine item)", audioText: "Tos, prašau", saveable: true, core: true },
            ],
          },
          {
            id: "s2m3l2_b2",
            type: "context_gap_select",
            title: "Choose the form that fits",
            prompt: "A nearby apple is the one you want. Obuolys is masculine.",
            sentence: "Noriu ___.",
            translation_en: "I want this one.",
            options: [
              { id: "a", text: "šito", isCorrect: true },
              { id: "b", text: "šitos", isCorrect: false },
              { id: "c", text: "to", isCorrect: false },
            ],
            explanation: "Nearby masculine item: šito.",
          },
          {
            id: "s2m3l2_b3",
            type: "context_gap_select",
            title: "Choose the form that fits",
            prompt: "The loaf of bread you want is further away. Duona is feminine.",
            sentence: "Noriu ___.",
            translation_en: "I want that one.",
            options: [
              { id: "a", text: "tos", isCorrect: true },
              { id: "b", text: "to", isCorrect: false },
              { id: "c", text: "šitos", isCorrect: false },
            ],
            explanation: "Further-away feminine item: tos.",
          },
          {
            id: "s2m3l2_b4",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ne šitos. Tos, prašau.", audioText: "Ne šitos. Tos, prašau" },
            options: [
              { id: "a", text: "Not this one. That one, please. (feminine item)", isCorrect: true },
              { id: "b", text: "Not that one. This one, please. (feminine item)", isCorrect: false },
              { id: "c", text: "This one, please. (masculine item)", isCorrect: false },
            ],
          },
          {
            id: "s2m3l2_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "I want that one. (feminine item)" },
            tokens: [
              { id: "t1", text: "Noriu", correctIndex: 0 },
              { id: "t2", text: "tos.", correctIndex: 1 },
              { id: "t3", text: "to.", isDistractor: true },
            ],
            answerText: "Noriu tos.",
          },
          {
            id: "s2m3l2_b6",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: This one, please — for a masculine item",
            targetText: "Šito, prašau.",
            audioText: "Šito, prašau",
          },
          {
            id: "s2m3l2_b7_v2",
            type: "scenario_v2",
            title: "Choosing a loaf",
            description: "At a bakery, there are two loaves of bread: one beside you and one further along the counter. You want the one further away.",
            sceneIntro: "At a bakery, there are two loaves of bread: one beside you and one further along the counter. You want the one further away.",
            location: "bakery counter",
            userRole: "customer",
            register: "polite_service",
            goal: "Use feminine singular selection forms with clear near/far context.",
            focus: ["šitos", "tos", "Nesuprantu"],
            participants: [
              {
                id: "seller",
                label: "Seller",
                name: "Rasa",
                role: "bakery assistant",
                gender: "female",
                relationshipToUser: "stranger",
                register: "polite_service",
              },
            ],
            objects: [
              {
                id: "bread",
                lt: "duona",
                en: "bread",
                gender: "feminine",
                number: "singular",
              },
            ],
            steps: [
              {
                id: "step_1",
                speakerId: "seller",
                speakerLabel: "Seller",
                speakerText: "Ko norėtumėte?",
                sceneDirection: "One loaf is directly beside you; another loaf is further along the counter. You want the farther loaf.",
                learnerPrompt: "Choose the loaf you want.",
                options: [
                  { id: "a", text: "Noriu tos, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Noriu šitos, prašau.", result: "wrong", feedback: "Šitos points to the nearby loaf. The scene says you want the one further away.", progresses: false },
                  { id: "c", text: "Noriu to, prašau.", result: "wrong", feedback: "Duona is feminine here, so use the feminine selection form tos.", progresses: false },
                ],
              },
              {
                id: "step_2",
                speakerId: "seller",
                speakerLabel: "Seller",
                speakerText: "Šitos?",
                sceneDirection: "She points to the nearby loaf to check which one you mean.",
                learnerPrompt: "Correct the choice. If the question is unclear, use Nesuprantu.",
                help: {
                  levels: [
                    {
                      sceneDirection: "She taps the nearby loaf and asks again.",
                      speakerText: "Šitos?",
                    },
                    {
                      sceneDirection: "She points to the nearby loaf, then to you, waiting for yes or no.",
                    },
                    {
                      speakerText: "This one?",
                      spokenLanguage: "en",
                      audio: false,
                    },
                  ],
                },
                options: [
                  { id: "a", text: "Ne šitos. Tos, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Taip, šitos.", result: "wrong", feedback: "That accepts the nearby loaf, but you chose the farther one.", progresses: false },
                  { id: "c", text: "Ne šito. To, prašau.", result: "wrong", feedback: "Those are the masculine selection forms; duona is feminine here.", progresses: false },
                ],
              },
              {
                id: "step_3",
                speakerId: "seller",
                speakerLabel: "Seller",
                speakerText: "Gerai, prašau.",
                sceneDirection: "She picks up the farther loaf and places it in front of you.",
                learnerPrompt: "Acknowledge the handover.",
                options: [
                  { id: "a", text: "Ačiū labai!", result: "best", progresses: true },
                  { id: "b", text: "Ne, ačiū.", result: "wrong", feedback: "She has handed you the loaf you chose.", progresses: false },
                  { id: "c", text: "Kas čia?", result: "wrong", feedback: "You already know the item is bread and have just selected it.", progresses: false },
                ],
              },
            ],
          },
        ],
      },

      // ── Lesson 3 ────────────────────────────────────────────────────────────
            // ── Lesson 4 ────────────────────────────────────────────────────────────
            // ── Lesson 5 ────────────────────────────────────────────────────────────
            // ── Checkpoint ──────────────────────────────────────────────────────────
      {
        id: "section_2_module_3_checkpoint",
        code: "2.3.C",
        title: "Checkpoint",
        purpose: "Check you can distinguish near/far and masculine/feminine singular pointing and selection forms.",
        supportLevel: "none",
        newLanguageLoad: "none",
        isCheckpoint: true,
        blocks: [
          {
            id: "s2m3c_b1",
            type: "context_gap_select",
            title: "Near or far?",
            prompt: "An apple is on the counter directly in front of you.",
            sentence: "___ obuolys.",
            translation_en: "This apple.",
            options: [
              { id: "a", text: "Šitas", isCorrect: true },
              { id: "b", text: "Tas", isCorrect: false },
              { id: "c", text: "Šita", isCorrect: false },
            ],
            explanation: "Nearby + masculine obuolys = šitas.",
          },
          {
            id: "s2m3c_b2",
            type: "context_gap_select",
            title: "Near or far?",
            prompt: "A loaf of bread is further away on the shelf.",
            sentence: "___ duona.",
            translation_en: "That bread.",
            options: [
              { id: "a", text: "Ta", isCorrect: true },
              { id: "b", text: "Šita", isCorrect: false },
              { id: "c", text: "Tas", isCorrect: false },
            ],
            explanation: "Farther away + feminine duona = ta.",
          },
          {
            id: "s2m3c_b3",
            type: "listen_mcq",
            title: "Listen and identify",
            prompt: { text: "Noriu šitos.", audioText: "Noriu šitos" },
            options: [
              { id: "a", text: "I want this one. (feminine item)", isCorrect: true },
              { id: "b", text: "I want that one. (feminine item)", isCorrect: false },
              { id: "c", text: "I want this one. (masculine item)", isCorrect: false },
            ],
          },
          {
            id: "s2m3c_b4",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Two loaves of bread are on the counter. You want the one further away." },
            options: [
              { id: "a", text: "Šitos, prašau.", isCorrect: false },
              { id: "b", text: "Tos, prašau.", isCorrect: true },
              { id: "c", text: "To, prašau.", isCorrect: false },
            ],
            feedback: { correct: "Tos, prašau — farther away and feminine because the item is duona." },
          },
          {
            id: "s2m3c_b5",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Say: I want this one — for a masculine item",
            targetText: "Noriu šito.",
            audioText: "Noriu šito",
          },
          {
            id: "s2m3c_b6_v2",
            type: "scenario_v2",
            title: "Choosing an apple",
            description: "At a market stall, two apples are on display. You want the nearby one.",
            sceneIntro: "At a market stall, two apples are on display. You want the nearby one.",
            location: "market stall",
            userRole: "customer",
            register: "polite_service",
            goal: "Retrieve masculine singular near/far selection forms in a physical scene.",
            focus: ["šito", "to", "Nesuprantu"],
            participants: [
              {
                id: "seller",
                label: "Seller",
                name: "Tomas",
                role: "seller",
                gender: "male",
                relationshipToUser: "stranger",
                register: "polite_service",
              },
            ],
            objects: [
              {
                id: "apple",
                lt: "obuolys",
                en: "apple",
                gender: "masculine",
                number: "singular",
              },
            ],
            steps: [
              {
                id: "step_1",
                speakerId: "seller",
                speakerLabel: "Seller",
                speakerText: "Ko norėtumėte?",
                sceneDirection: "One apple is directly in front of you; another is further back. You want the nearby apple.",
                learnerPrompt: "Choose the apple you want.",
                options: [
                  { id: "a", text: "Noriu šito, prašau.", result: "best", progresses: true },
                  { id: "b", text: "Noriu to, prašau.", result: "wrong", feedback: "To points to the farther apple. You want the nearby one.", progresses: false },
                  { id: "c", text: "Noriu šitos, prašau.", result: "wrong", feedback: "Šitos is the feminine selection form; obuolys is masculine here.", progresses: false },
                ],
              },
              {
                id: "step_2",
                speakerId: "seller",
                speakerLabel: "Seller",
                speakerText: "Šito?",
                sceneDirection: "He points to the nearby apple to confirm your choice.",
                learnerPrompt: "Confirm the nearby apple. If the question is unclear, use Nesuprantu.",
                help: {
                  levels: [
                    {
                      sceneDirection: "He taps the nearby apple and asks again.",
                      speakerText: "Šito?",
                    },
                    {
                      sceneDirection: "He holds up the nearby apple and waits for confirmation.",
                    },
                    {
                      speakerText: "This one?",
                      spokenLanguage: "en",
                      audio: false,
                    },
                  ],
                },
                options: [
                  { id: "a", text: "Taip, šito.", result: "best", progresses: true },
                  { id: "b", text: "Ne, to.", result: "wrong", feedback: "That changes your choice to the farther apple.", progresses: false },
                  { id: "c", text: "Taip, šitos.", result: "wrong", feedback: "Šitos is feminine; obuolys is masculine here.", progresses: false },
                ],
              },
              {
                id: "step_3",
                speakerId: "seller",
                speakerLabel: "Seller",
                speakerText: "Prašau.",
                sceneDirection: "He places the nearby apple in front of you.",
                learnerPrompt: "Acknowledge the handover.",
                options: [
                  { id: "a", text: "Ačiū!", result: "best", progresses: true },
                  { id: "b", text: "Noriu to.", result: "wrong", feedback: "He has just handed you the apple you selected.", progresses: false },
                  { id: "c", text: "Viso gero!", result: "acceptable", feedback: "A farewell is possible here, but a quick thank-you is the more immediate response to the handover.", betterAnswer: "Ačiū!", progresses: true },
                ],
              },
            ],
          },
          {
            id: "s2m3c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Šitas",             en: "This (masculine)",                    audioText: "Šitas" },
              { id: "m2",  lt: "Tas",                en: "That (masculine)",                    audioText: "Tas" },
              { id: "m3",  lt: "Šita",               en: "This (feminine)",                     audioText: "Šita" },
              { id: "m4",  lt: "Ta",                 en: "That (feminine)",                     audioText: "Ta" },
              { id: "m5",  lt: "Šitas obuolys",      en: "This apple",                          audioText: "Šitas obuolys" },
              { id: "m6",  lt: "Tas obuolys",        en: "That apple",                          audioText: "Tas obuolys" },
              { id: "m7",  lt: "Šita duona",         en: "This bread",                          audioText: "Šita duona" },
              { id: "m8",  lt: "Ta duona",           en: "That bread",                          audioText: "Ta duona" },
              { id: "m9",  lt: "Noriu šito.",        en: "I want this one. (masculine)",        audioText: "Noriu šito" },
              { id: "m10", lt: "Noriu to.",          en: "I want that one. (masculine)",        audioText: "Noriu to" },
              { id: "m11", lt: "Noriu šitos.",       en: "I want this one. (feminine)",         audioText: "Noriu šitos" },
              { id: "m12", lt: "Noriu tos.",         en: "I want that one. (feminine)",         audioText: "Noriu tos" },
              { id: "m13", lt: "Šito, prašau.",      en: "This one, please. (masculine)",       audioText: "Šito, prašau" },
              { id: "m14", lt: "To, prašau.",        en: "That one, please. (masculine)",       audioText: "To, prašau" },
              { id: "m15", lt: "Šitos, prašau.",     en: "This one, please. (feminine)",        audioText: "Šitos, prašau" },
              { id: "m16", lt: "Tos, prašau.",       en: "That one, please. (feminine)",        audioText: "Tos, prašau" },
              // Spaced retrieval from earlier Section 2 modules
              { id: "m17", lt: "Man reikia bilieto.",       en: "I need a ticket.",                       audioText: "Man reikia bilieto" },
              { id: "m18", lt: "Ar galite parodyti?",       en: "Can you show me?",                        audioText: "Ar galite parodyti" },
              { id: "m19", lt: "Negaliu eiti.",             en: "I can't go.",                             audioText: "Negaliu eiti" },
              { id: "m20", lt: "Ar galima mokėti kortele?", en: "Is it possible to pay by card?",         audioText: "Ar galima mokėti kortele" },
            ],
          },
        ],
      },

    ],
  };
}

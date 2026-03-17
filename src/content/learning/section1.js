// src/content/learning/section1.js

export const LEARNING_BLOCK_TYPES = {
  LEARN: "learn",
  RECOGNISE_MCQ: "recognise_mcq",
  LISTEN_MCQ: "listen_mcq",
  BEST_RESPONSE: "best_response",
  SPEAK_SELF_CHECK: "speak_self_check",
  BUILD_PHRASE: "build_phrase",
  SCENARIO_CHAIN: "scenario_chain",
};

const TONES = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export const section1 = {
  id: "section_1",
  code: "1",
  title: "First Contact and Survival Basics",
  shortTitle: "First Contact",
  purpose:
    "Get the learner through the first minute of real interaction in Lithuanian without freezing.",
  sectionType: "core",
  moduleCount: 4,
  checkpointCount: 1,
  status: "active",
  modules: [
    {
      id: "section_1_module_1",
      code: "1.1",
      title: "Greeting and Politeness",
      purpose:
        "Teach the learner how to start and end contact cleanly and politely.",
      outcome: [
        "say hello and goodbye",
        "respond yes/no",
        "say please, thank you, sorry, excuse me",
        "recognise common polite exchanges",
        "sound socially appropriate instead of abrupt",
      ],
      status: "active",
      lessonCount: 4,
      checkpointId: "section_1_checkpoint_1",
      lessons: [
        {
          id: "section_1_module_1_lesson_1",
          code: "1.1.1",
          title: "Hello and Goodbye",
          purpose: "Introduce first-contact opening and closing language.",
          supportLevel: TONES.HIGH,
          newLanguageLoad: "very_low",
          recycledLanguage: [],
          completionRule: {
            minCompletedBlocks: 5,
            requireSpeakAttempt: true,
            requireScenarioCompletion: true,
          },
          rewards: {
            xp: 20,
            streakEligible: true,
          },
          autoSavePhrases: [
            { lt: "Labas", en: "Hello / Hi" },
            { lt: "Laba diena", en: "Good day / Hello" },
            { lt: "Viso gero", en: "Goodbye" },
            { lt: "Iki", en: "Bye / See you" },
          ],
          optionalSavePhrases: [
            { lt: "Labas rytas", en: "Good morning" },
            { lt: "Labas vakaras", en: "Good evening" },
          ],
          notes: {
            pattern:
              "Some greetings are neutral and some depend on time of day.",
            usage: [
              "Use Labas with friends, peers, and casual contact.",
              "Use Laba diena when you want to sound more polite or neutral.",
            ],
          },
          blocks: [
            {
              id: "s1m1l1_b1",
              type: LEARNING_BLOCK_TYPES.LEARN,
              title: "Learn the core greetings",
              items: [
                {
                  id: "greet_1",
                  lt: "Labas",
                  en: "Hello / Hi",
                  audioText: "Labas",
                  saveable: true,
                  core: true,
                },
                {
                  id: "greet_2",
                  lt: "Laba diena",
                  en: "Good day / Hello",
                  audioText: "Laba diena",
                  saveable: true,
                  core: true,
                },
                {
                  id: "greet_3",
                  lt: "Labas rytas",
                  en: "Good morning",
                  audioText: "Labas rytas",
                  saveable: true,
                  core: false,
                },
                {
                  id: "greet_4",
                  lt: "Labas vakaras",
                  en: "Good evening",
                  audioText: "Labas vakaras",
                  saveable: true,
                  core: false,
                },
                {
                  id: "greet_5",
                  lt: "Viso gero",
                  en: "Goodbye",
                  audioText: "Viso gero",
                  saveable: true,
                  core: true,
                },
                {
                  id: "greet_6",
                  lt: "Iki",
                  en: "Bye / See you",
                  audioText: "Iki",
                  saveable: true,
                  core: true,
                },
              ],
            },
            {
              id: "s1m1l1_b2",
              type: LEARNING_BLOCK_TYPES.RECOGNISE_MCQ,
              title: "Choose the correct phrase",
              prompt: {
                text: "Hello",
                lang: "en",
              },
              options: [
                { id: "a", text: "Labas", isCorrect: true },
                { id: "b", text: "Viso gero", isCorrect: false },
                { id: "c", text: "Iki", isCorrect: false },
              ],
              feedback: {
                correct: "Labas is a safe informal hello.",
              },
            },
            {
              id: "s1m1l1_b3",
              type: LEARNING_BLOCK_TYPES.RECOGNISE_MCQ,
              title: "Choose the correct meaning",
              prompt: {
                text: "Laba diena",
                lang: "lt",
                audioText: "Laba diena",
              },
              options: [
                { id: "a", text: "Good morning", isCorrect: false },
                { id: "b", text: "Good day / Hello", isCorrect: true },
                { id: "c", text: "Goodbye", isCorrect: false },
              ],
            },
            {
              id: "s1m1l1_b4",
              type: LEARNING_BLOCK_TYPES.LISTEN_MCQ,
              title: "Listen and choose",
              prompt: {
                audioText: "Labas vakaras",
              },
              options: [
                { id: "a", text: "Labas rytas", isCorrect: false },
                { id: "b", text: "Labas vakaras", isCorrect: true },
                { id: "c", text: "Laba diena", isCorrect: false },
              ],
            },
            {
              id: "s1m1l1_b5",
              type: LEARNING_BLOCK_TYPES.SPEAK_SELF_CHECK,
              title: "Say it out loud",
              prompt: "Say: Labas",
              targetText: "Labas",
              audioText: "Labas",
              showCapturedText: true,
              gradingMode: "self_check",
            },
            {
              id: "s1m1l1_b6",
              type: LEARNING_BLOCK_TYPES.SPEAK_SELF_CHECK,
              title: "Say it out loud",
              prompt: "Say: Viso gero",
              targetText: "Viso gero",
              audioText: "Viso gero",
              showCapturedText: true,
              gradingMode: "self_check",
            },
            {
              id: "s1m1l1_b7",
              type: LEARNING_BLOCK_TYPES.SCENARIO_CHAIN,
              title: "Mini scenario",
              description:
                "Someone greets you. Then the interaction ends. Choose the best responses.",
              steps: [
                {
                  id: "step_1",
                  actor: "other",
                  text: "Labas",
                  audioText: "Labas",
                  responseMode: "choice",
                  options: [
                    { id: "a", text: "Labas", isCorrect: true },
                    { id: "b", text: "Viso gero", isCorrect: false },
                    { id: "c", text: "Ačiū", isCorrect: false },
                  ],
                },
                {
                  id: "step_2",
                  actor: "other",
                  text: "Viso gero",
                  audioText: "Viso gero",
                  responseMode: "choice",
                  options: [
                    { id: "a", text: "Ne", isCorrect: false },
                    { id: "b", text: "Iki", isCorrect: true },
                    { id: "c", text: "Labas rytas", isCorrect: false },
                  ],
                },
              ],
            },
          ],
        },

        {
          id: "section_1_module_1_lesson_2",
          code: "1.1.2",
          title: "Yes, No, Please, Thank You",
          purpose:
            "Add polite micro-responses that make the learner sound socially normal.",
          supportLevel: TONES.HIGH,
          newLanguageLoad: "low",
          recycledLanguage: ["Labas", "Laba diena", "Viso gero"],
          completionRule: {
            minCompletedBlocks: 5,
            requireSpeakAttempt: true,
            requireScenarioCompletion: true,
          },
          rewards: {
            xp: 20,
            streakEligible: true,
          },
          autoSavePhrases: [
            { lt: "Taip", en: "Yes" },
            { lt: "Ne", en: "No" },
            { lt: "Prašau", en: "Please / Here you are / You're welcome" },
            { lt: "Ačiū", en: "Thank you / Thanks" },
          ],
          optionalSavePhrases: [{ lt: "Ačiū labai", en: "Thank you very much" }],
          notes: {
            pattern: "Short polite words matter a lot in live conversation.",
            usage: [
              "Prašau can mean please, here you are, or you're welcome depending on context.",
            ],
          },
          blocks: [
            {
              id: "s1m1l2_b1",
              type: LEARNING_BLOCK_TYPES.LEARN,
              title: "Learn the polite basics",
              items: [
                {
                  id: "polite_1",
                  lt: "Taip",
                  en: "Yes",
                  audioText: "Taip",
                  saveable: true,
                  core: true,
                },
                {
                  id: "polite_2",
                  lt: "Ne",
                  en: "No",
                  audioText: "Ne",
                  saveable: true,
                  core: true,
                },
                {
                  id: "polite_3",
                  lt: "Prašau",
                  en: "Please / Here you are / You're welcome",
                  audioText: "Prašau",
                  saveable: true,
                  core: true,
                },
                {
                  id: "polite_4",
                  lt: "Ačiū",
                  en: "Thank you / Thanks",
                  audioText: "Ačiū",
                  saveable: true,
                  core: true,
                },
                {
                  id: "polite_5",
                  lt: "Ačiū labai",
                  en: "Thank you very much",
                  audioText: "Ačiū labai",
                  saveable: true,
                  core: false,
                },
              ],
            },
            {
              id: "s1m1l2_b2",
              type: LEARNING_BLOCK_TYPES.RECOGNISE_MCQ,
              title: "Choose the right phrase",
              prompt: {
                text: "Thank you",
                lang: "en",
              },
              options: [
                { id: "a", text: "Ačiū", isCorrect: true },
                { id: "b", text: "Ne", isCorrect: false },
                { id: "c", text: "Labas", isCorrect: false },
              ],
            },
            {
              id: "s1m1l2_b3",
              type: LEARNING_BLOCK_TYPES.LISTEN_MCQ,
              title: "Listen and choose",
              prompt: {
                audioText: "Prašau",
              },
              options: [
                { id: "a", text: "Prašau", isCorrect: true },
                { id: "b", text: "Ačiū", isCorrect: false },
                { id: "c", text: "Taip", isCorrect: false },
              ],
            },
            {
              id: "s1m1l2_b4",
              type: LEARNING_BLOCK_TYPES.BEST_RESPONSE,
              title: "Choose the best response",
              prompt: {
                text: "Someone hands you something politely.",
                lang: "en",
              },
              options: [
                { id: "a", text: "Ačiū", isCorrect: true },
                { id: "b", text: "Ne", isCorrect: false },
                { id: "c", text: "Iki", isCorrect: false },
              ],
            },
            {
              id: "s1m1l2_b5",
              type: LEARNING_BLOCK_TYPES.BEST_RESPONSE,
              title: "Choose the best response",
              prompt: {
                text: "You are asked a yes-no question and the answer is yes.",
                lang: "en",
              },
              options: [
                { id: "a", text: "Taip", isCorrect: true },
                { id: "b", text: "Ačiū", isCorrect: false },
                { id: "c", text: "Viso gero", isCorrect: false },
              ],
            },
            {
              id: "s1m1l2_b6",
              type: LEARNING_BLOCK_TYPES.SPEAK_SELF_CHECK,
              title: "Say it out loud",
              prompt: "Say: Ačiū",
              targetText: "Ačiū",
              audioText: "Ačiū",
              showCapturedText: true,
              gradingMode: "self_check",
            },
            {
              id: "s1m1l2_b7",
              type: LEARNING_BLOCK_TYPES.SPEAK_SELF_CHECK,
              title: "Say it out loud",
              prompt: "Say: Taip",
              targetText: "Taip",
              audioText: "Taip",
              showCapturedText: true,
              gradingMode: "self_check",
            },
          ],
        },

        {
          id: "section_1_module_1_lesson_3",
          code: "1.1.3",
          title: "Sorry and Excuse Me",
          purpose: "Teach interruption and light apology language.",
          supportLevel: TONES.MEDIUM,
          newLanguageLoad: "low_to_medium",
          recycledLanguage: ["Prašau", "Ačiū", "Labas"],
          completionRule: {
            minCompletedBlocks: 5,
            requireProduceBlock: true,
            requireScenarioCompletion: true,
          },
          rewards: {
            xp: 20,
            streakEligible: true,
          },
          autoSavePhrases: [
            { lt: "Atsiprašau", en: "Sorry / Excuse me" },
            { lt: "Prašau dar kartą", en: "One more time, please" },
          ],
          optionalSavePhrases: [{ lt: "Atleiskite", en: "Excuse me / Forgive me" }],
          notes: {
            pattern:
              "One English idea often maps to different Lithuanian use depending on situation.",
          },
          blocks: [
            {
              id: "s1m1l3_b1",
              type: LEARNING_BLOCK_TYPES.LEARN,
              title: "Learn apology and interruption language",
              items: [
                {
                  id: "sorry_1",
                  lt: "Atsiprašau",
                  en: "Sorry / Excuse me",
                  audioText: "Atsiprašau",
                  saveable: true,
                  core: true,
                },
                {
                  id: "sorry_2",
                  lt: "Prašau dar kartą",
                  en: "One more time, please",
                  audioText: "Prašau dar kartą",
                  saveable: true,
                  core: true,
                },
                {
                  id: "sorry_3",
                  lt: "Atleiskite",
                  en: "Excuse me / Forgive me",
                  audioText: "Atleiskite",
                  saveable: true,
                  core: false,
                },
              ],
            },
            {
              id: "s1m1l3_b2",
              type: LEARNING_BLOCK_TYPES.RECOGNISE_MCQ,
              title: "Choose the right phrase",
              prompt: {
                text: "You bump into someone lightly and want to apologise.",
                lang: "en",
              },
              options: [
                { id: "a", text: "Atsiprašau", isCorrect: true },
                { id: "b", text: "Taip", isCorrect: false },
                { id: "c", text: "Viso gero", isCorrect: false },
              ],
            },
            {
              id: "s1m1l3_b3",
              type: LEARNING_BLOCK_TYPES.RECOGNISE_MCQ,
              title: "Choose the right phrase",
              prompt: {
                text: "You need someone to repeat what they said.",
                lang: "en",
              },
              options: [
                { id: "a", text: "Prašau dar kartą", isCorrect: true },
                { id: "b", text: "Labas vakaras", isCorrect: false },
                { id: "c", text: "Ne", isCorrect: false },
              ],
            },
            {
              id: "s1m1l3_b4",
              type: LEARNING_BLOCK_TYPES.BUILD_PHRASE,
              title: "Build the phrase",
              prompt: {
                text: "One more time, please",
                lang: "en",
              },
              tokens: [
                { id: "t1", text: "Prašau", correctIndex: 0 },
                { id: "t2", text: "dar", correctIndex: 1 },
                { id: "t3", text: "kartą", correctIndex: 2 },
              ],
              answerText: "Prašau dar kartą",
            },
            {
              id: "s1m1l3_b5",
              type: LEARNING_BLOCK_TYPES.LISTEN_MCQ,
              title: "Listen and choose",
              prompt: {
                audioText: "Atsiprašau",
              },
              options: [
                { id: "a", text: "Ačiū", isCorrect: false },
                { id: "b", text: "Atsiprašau", isCorrect: true },
                { id: "c", text: "Prašau", isCorrect: false },
              ],
            },
            {
              id: "s1m1l3_b6",
              type: LEARNING_BLOCK_TYPES.SCENARIO_CHAIN,
              title: "Scenario drill",
              description:
                "Use the right phrase to get attention or apologise briefly.",
              steps: [
                {
                  id: "step_1",
                  actor: "narrator",
                  text: "You want to get someone's attention politely.",
                  responseMode: "choice",
                  options: [
                    { id: "a", text: "Atsiprašau", isCorrect: true },
                    { id: "b", text: "Iki", isCorrect: false },
                    { id: "c", text: "Ne", isCorrect: false },
                  ],
                },
                {
                  id: "step_2",
                  actor: "narrator",
                  text: "You need them to say it again.",
                  responseMode: "choice",
                  options: [
                    { id: "a", text: "Prašau dar kartą", isCorrect: true },
                    { id: "b", text: "Ačiū labai", isCorrect: false },
                    { id: "c", text: "Labas rytas", isCorrect: false },
                  ],
                },
              ],
            },
          ],
        },

        {
          id: "section_1_module_1_lesson_4",
          code: "1.1.4",
          title: "Polite Mini Exchanges",
          purpose:
            "Stop the learner holding isolated words only and push them into tiny real exchanges.",
          supportLevel: TONES.MEDIUM,
          newLanguageLoad: "very_low",
          recycledLanguage: [
            "Labas",
            "Laba diena",
            "Viso gero",
            "Iki",
            "Taip",
            "Ne",
            "Prašau",
            "Ačiū",
            "Atsiprašau",
            "Prašau dar kartą",
          ],
          completionRule: {
            minCompletedBlocks: 4,
            requireSpeakAttempt: true,
            requireScenarioCompletion: true,
          },
          rewards: {
            xp: 25,
            streakEligible: true,
          },
          autoSavePhrases: [],
          optionalSavePhrases: [],
          notes: {
            pattern:
              "This lesson is about moving from isolated words to short realistic exchanges.",
          },
          blocks: [
            {
              id: "s1m1l4_b1",
              type: LEARNING_BLOCK_TYPES.RECOGNISE_MCQ,
              title: "Choose the correct phrase",
              prompt: {
                text: "Someone says: Labas",
                lang: "lt",
                audioText: "Labas",
              },
              options: [
                { id: "a", text: "Labas", isCorrect: true },
                { id: "b", text: "Viso gero", isCorrect: false },
                { id: "c", text: "Ne", isCorrect: false },
              ],
            },
            {
              id: "s1m1l4_b2",
              type: LEARNING_BLOCK_TYPES.BEST_RESPONSE,
              title: "Choose the best response",
              prompt: {
                text: "Someone helps you and hands something over.",
                lang: "en",
              },
              options: [
                { id: "a", text: "Ačiū", isCorrect: true },
                { id: "b", text: "Iki", isCorrect: false },
                { id: "c", text: "Labas rytas", isCorrect: false },
              ],
            },
            {
              id: "s1m1l4_b3",
              type: LEARNING_BLOCK_TYPES.SPEAK_SELF_CHECK,
              title: "Say the response",
              prompt: "Reply politely to: Labas",
              targetText: "Labas",
              audioText: "Labas",
              showCapturedText: true,
              gradingMode: "self_check",
            },
            {
              id: "s1m1l4_b4",
              type: LEARNING_BLOCK_TYPES.SCENARIO_CHAIN,
              title: "Conversation chain",
              description: "Complete a short polite exchange.",
              steps: [
                {
                  id: "step_1",
                  actor: "other",
                  text: "Laba diena",
                  audioText: "Laba diena",
                  responseMode: "choice",
                  options: [
                    { id: "a", text: "Laba diena", isCorrect: true },
                    { id: "b", text: "Ne", isCorrect: false },
                    { id: "c", text: "Ačiū", isCorrect: false },
                  ],
                },
                {
                  id: "step_2",
                  actor: "other",
                  text: "Prašau",
                  audioText: "Prašau",
                  responseMode: "choice",
                  options: [
                    { id: "a", text: "Ačiū", isCorrect: true },
                    { id: "b", text: "Viso gero", isCorrect: false },
                    { id: "c", text: "Atsiprašau", isCorrect: false },
                  ],
                },
                {
                  id: "step_3",
                  actor: "other",
                  text: "Viso gero",
                  audioText: "Viso gero",
                  responseMode: "choice",
                  options: [
                    { id: "a", text: "Iki", isCorrect: true },
                    { id: "b", text: "Taip", isCorrect: false },
                    { id: "c", text: "Prašau dar kartą", isCorrect: false },
                  ],
                },
              ],
            },
          ],
        },
      ],
      checkpoint: {
        id: "section_1_checkpoint_1",
        code: "Checkpoint 1",
        title: "First Interaction",
        passFeeling: "easy_but_earned",
        purpose:
          "Test whether the learner can complete a short first-contact interaction politely.",
        rewards: {
          xp: 40,
          streakEligible: true,
          marksModuleComplete: true,
        },
        autoSavePhrases: [],
        optionalSavePhrases: [],
        completionRule: {
          minCompletedBlocks: 4,
          requireSpeakAttempt: true,
          requireScenarioCompletion: true,
        },
        blocks: [
          {
            id: "s1cp1_b1",
            type: LEARNING_BLOCK_TYPES.RECOGNISE_MCQ,
            title: "Recognition check",
            prompt: {
              text: "Goodbye",
              lang: "en",
            },
            options: [
              { id: "a", text: "Viso gero", isCorrect: true },
              { id: "b", text: "Labas", isCorrect: false },
              { id: "c", text: "Ačiū", isCorrect: false },
            ],
          },
          {
            id: "s1cp1_b2",
            type: LEARNING_BLOCK_TYPES.LISTEN_MCQ,
            title: "Listening check",
            prompt: {
              audioText: "Atsiprašau",
            },
            options: [
              { id: "a", text: "Atsiprašau", isCorrect: true },
              { id: "b", text: "Prašau", isCorrect: false },
              { id: "c", text: "Iki", isCorrect: false },
            ],
          },
          {
            id: "s1cp1_b3",
            type: LEARNING_BLOCK_TYPES.SPEAK_SELF_CHECK,
            title: "Speaking check",
            prompt: "Say: Ačiū",
            targetText: "Ačiū",
            audioText: "Ačiū",
            showCapturedText: true,
            gradingMode: "self_check",
          },
          {
            id: "s1cp1_b4",
            type: LEARNING_BLOCK_TYPES.SCENARIO_CHAIN,
            title: "First interaction chain",
            description:
              "Complete a short three-step first-contact interaction.",
            steps: [
              {
                id: "step_1",
                actor: "other",
                text: "Labas",
                audioText: "Labas",
                responseMode: "choice",
                options: [
                  { id: "a", text: "Labas", isCorrect: true },
                  { id: "b", text: "Ne", isCorrect: false },
                  { id: "c", text: "Viso gero", isCorrect: false },
                ],
              },
              {
                id: "step_2",
                actor: "other",
                text: "Prašau",
                audioText: "Prašau",
                responseMode: "choice",
                options: [
                  { id: "a", text: "Ačiū", isCorrect: true },
                  { id: "b", text: "Labas vakaras", isCorrect: false },
                  { id: "c", text: "Prašau dar kartą", isCorrect: false },
                ],
              },
              {
                id: "step_3",
                actor: "other",
                text: "Viso gero",
                audioText: "Viso gero",
                responseMode: "choice",
                options: [
                  { id: "a", text: "Iki", isCorrect: true },
                  { id: "b", text: "Taip", isCorrect: false },
                  { id: "c", text: "Atsiprašau", isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
    },

    {
      id: "section_1_module_2",
      code: "1.2",
      title: "Who I Am",
      purpose:
        "Teach the learner how to identify themselves and introduce a second person.",
      outcome: [
        "say who they are",
        "give their name",
        "say where they are from",
        "say nice to meet you",
        "introduce another person simply",
      ],
      status: "planned",
      lessonCount: 0,
      checkpointId: null,
      lessons: [],
    },

    {
      id: "section_1_module_3",
      code: "1.3",
      title: "I Don’t Understand",
      purpose:
        "Give the learner safe ways to signal non-understanding and ask for clarity.",
      outcome: [
        "say they do not understand",
        "ask for repetition",
        "ask someone to speak more slowly",
        "stay in the conversation instead of freezing",
      ],
      status: "planned",
      lessonCount: 0,
      checkpointId: null,
      lessons: [],
    },

    {
      id: "section_1_module_4",
      code: "1.4",
      title: "Help and Contact",
      purpose:
        "Teach the learner to ask for help and manage very basic first-contact needs.",
      outcome: [
        "ask for help",
        "ask simple first-contact questions",
        "handle minimal contact language safely",
      ],
      status: "planned",
      lessonCount: 0,
      checkpointId: null,
      lessons: [],
    },
  ],
};

export default section1;

// src/content/learning/section4/checkpoint_4.js
// Section 4 Checkpoint — Food and Drink in Real Use

export default function createCheckpoint4(profile = {}) {
  const {
    userNameSafe = "Davidas",
    userFromPhrase = "Aš esu iš Škotijos",
    speakerGender = "male",
  } = profile;
  const isMale = speakerGender !== "female";
  const alkanas = isMale ? "alkanas" : "alkana";

  return {
    id: "section_4_checkpoint",
    code: "4.C",
    title: "Food and Drink in Real Use",
    purpose: "Bring the whole of Section 4 together. Real retrieval across all four modules.",
    isCheckpoint: true,
    isSectionCheckpoint: true,
    status: "active",
    supportLevel: "none",
    newLanguageLoad: "none",
    blocks: [

      // ── Block 1 — Quick Recognition Warm-Up ───────────────────────────────────
      {
        id: "s4c_b1",
        type: "recognise_mcq",
        title: "Choose the correct meaning",
        prompt: { text: "Norėčiau kavos.", audioText: "Norėčiau kavos" },
        options: [
          { id: "a", text: "I want coffee.", isCorrect: false },
          { id: "b", text: "I would like coffee.", isCorrect: true },
          { id: "c", text: "Do you want coffee?", isCorrect: false },
        ],
      },

      {
        id: "s4c_b2",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Čia ar išsinešti?", audioText: "Čia ar išsinešti" },
        options: [
          { id: "a", text: "Cash or card?", isCorrect: false },
          { id: "b", text: "For here or to go?", isCorrect: true },
          { id: "c", text: "With milk or without?", isCorrect: false },
        ],
      },

      {
        id: "s4c_b3",
        type: "recognise_mcq",
        title: "Choose the correct meaning",
        prompt: { text: "Čia ne tai, ką užsisakiau.", audioText: "Čia ne tai, ką užsisakiau" },
        options: [
          { id: "a", text: "I would like to order.", isCorrect: false },
          { id: "b", text: "This is not what I ordered.", isCorrect: true },
          { id: "c", text: "Can you change it?", isCorrect: false },
        ],
      },

      // ── Block 2 — Guided Production ───────────────────────────────────────────
      {
        id: "s4c_b4",
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
        id: "s4c_b5",
        type: "build_phrase",
        title: "Build the phrase",
        prompt: { text: "Tea without sugar, please." },
        tokens: [
          { id: "t1", text: "Arbatos", correctIndex: 0 },
          { id: "t2", text: "be", correctIndex: 1 },
          { id: "t3", text: "cukraus,", correctIndex: 2 },
          { id: "t4", text: "prašau", correctIndex: 3 },
          { id: "t5", text: "su", isDistractor: true },
          { id: "t6", text: "pienu,", isDistractor: true },
        ],
        answerText: "Arbatos be cukraus, prašau",
      },

      // ── Block 3 — Audio Service Response ──────────────────────────────────────
      {
        id: "s4c_b6",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "Staff asks: Grynaisiais ar kortele? You want to pay by card." },
        options: [
          { id: "a", text: "Ar galėčiau gauti sąskaitą, prašau?", isCorrect: false },
          { id: "b", text: "Kortele, prašau.", isCorrect: true },
          { id: "c", text: "Išsinešti, prašau.", isCorrect: false },
        ],
        feedback: { correct: "Kortele, prašau — By card, please. Direct and clear." },
      },

      {
        id: "s4c_b7",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Ar su cukrumi?", audioText: "Ar su cukrumi" },
        options: [
          { id: "a", text: "Is it too hot?", isCorrect: false },
          { id: "b", text: "With sugar?", isCorrect: true },
          { id: "c", text: "For here or to go?", isCorrect: false },
        ],
      },

      // ── Block 4 — Preference / Problem ────────────────────────────────────────
      {
        id: "s4c_b8",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "The wrong drink arrives. What do you say?" },
        options: [
          { id: "a", text: "Ačiū labai!", isCorrect: false },
          { id: "b", text: "Čia ne tai, ką užsisakiau. Ar galite pakeisti?", isCorrect: true },
          { id: "c", text: "Ar galėčiau gauti sąskaitą, prašau?", isCorrect: false },
        ],
        feedback: { correct: "Čia ne tai, ką užsisakiau. Ar galite pakeisti? — This is not what I ordered. Can you change it? Calm, clear, effective." },
      },

      {
        id: "s4c_b9",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "Staff asks: Ar viskas gerai? Your coffee is too cold." },
        options: [
          { id: "a", text: "Taip, labai gerai.", isCorrect: false },
          { id: "b", text: "Nelabai gerai — kava per šalta.", isCorrect: true },
          { id: "c", text: "Norėčiau arbatos.", isCorrect: false },
        ],
        feedback: { correct: "Nelabai gerai — per šalta. Not very good — too cold." },
      },

      // ── Block 5 — Social Offer / Response ─────────────────────────────────────
      {
        id: "s4c_b10",
        type: "speak_self_check",
        title: "Say it out loud",
        prompt: "Offer someone a biscuit / cookie: Do you want one?",
        targetText: "Ar nori sausainio",
        audioText: "Ar nori sausainio",
      },

      {
        id: "s4c_b11",
        type: "speak_self_check",
        title: "Say it out loud",
        prompt: "Ask for the bill",
        targetText: "Ar galėčiau gauti sąskaitą, prašau?",
        audioText: "Ar galėčiau gauti sąskaitą, prašau",
      },

      // ── Block 6 — Conversation Chain ──────────────────────────────────────────
            {
        id: "s4c_b12_v2",
        type: "scenario_v2",
        title: "Conversation",
        description: "You and your friend Mantas go to a café. You both want a sandwich, and you want juice. Order for both of you, eat there, correct a wrong item, then ask for the bill and pay in cash.",
        sceneIntro: "You and your friend Mantas go to a café. You both want a sandwich, and you want juice. Order for both of you, eat there, correct a wrong item, then ask for the bill and pay in cash.",
        location: "café",
        userRole: "customer",
        register: "mixed",
        goal: "Bring Section 4 together through a clear social-to-service interaction: make a plan, order for two, correct an order, react to food, decline more, ask for the bill, and pay.",
        focus: ["social invitation", "mums / man", "for here", "order correction", "skanu", "užtenka", "bill", "cash"],
        participants: [
          {
            id: "friend",
            label: "Friend",
            name: "Mantas",
            role: "friend",
            gender: "male",
            relationshipToUser: "friend",
            register: "informal",
          },
          {
            id: "server",
            label: "Server",
            name: "Rasa",
            role: "server",
            gender: "female",
            relationshipToUser: "stranger",
            register: "polite_service",
          },
        ],
        objects: [
          { id: "sandwich", lt: "sumuštinis", en: "sandwich", gender: "masculine", number: "singular" },
          { id: "soup", lt: "sriuba", en: "soup", gender: "feminine", number: "singular" },
          { id: "juice", lt: "sultys", en: "juice", gender: "feminine", number: "plural" },
          { id: "cash", lt: "grynieji", en: "cash", gender: "masculine", number: "plural" },
        ],
        steps: [
          {
            id: "step_1",
            speakerId: "friend",
            speakerLabel: "Friend",
            speakerText: `Labas, ${userNameSafe}! Ar tu ${alkanas}?`,
            sceneDirection: "You are hungry and would like to go to a café with Mantas.",
            learnerPrompt: "Respond and suggest going to the café.",
            options: [
              {
                id: "a",
                text: `Taip! Aš ${alkanas}. Eikime į kavinę.`,
                textEn: "Yes! I'm hungry. Let's go to the café.",
                result: "best",
                progresses: true,
              },
              {
                id: "b",
                text: "Taip. Pavalgykime!",
                textEn: "Yes. Let's eat!",
                result: "acceptable",
                feedback: "Natural and relevant. Eikime į kavinę also makes the destination explicit.",
                progresses: true,
              },
              {
                id: "c",
                text: "Ne, ačiū. Gal vėliau?",
                textEn: "No, thank you. Maybe later?",
                result: "wrong",
                feedback: "The scene says you are hungry and want to go now.",
                progresses: false,
              },
            ],
          },
          {
            id: "step_2",
            speakerId: "server",
            speakerLabel: "Server",
            speakerText: "Laba diena! Ko norėtumėte?",
            sceneDirection: "You and Mantas each want a sandwich. You also want juice. You are ordering for both of you.",
            learnerPrompt: "Order two sandwiches for both of you and juice for yourself.",
            options: [
              {
                id: "a",
                text: "Laba diena! Mums du sumuštinius ir man sulčių, prašau.",
                textEn: "Good day! Two sandwiches for us and juice for me, please.",
                result: "best",
                progresses: true,
              },
              {
                id: "b",
                text: "Mums du sumuštinius, prašau. Man sulčių.",
                textEn: "Two sandwiches for us, please. Juice for me.",
                result: "acceptable",
                feedback: "Also natural. You've already been greeted, and the single prašau makes the whole order polite.",
                progresses: true,
              },
              {
                id: "c",
                text: "Man du sumuštinius, prašau. Mums sulčių.",
                textEn: "Two sandwiches for me, please. Juice for us.",
                result: "wrong",
                feedback: "That reverses who the items are for. You need mums for the two sandwiches and man for your juice.",
                progresses: false,
              },
            ],
          },
          {
            id: "step_3",
            speakerId: "server",
            speakerLabel: "Server",
            speakerText: "Čia ar išsinešti?",
            sceneDirection: "You and Mantas plan to eat at the café.",
            learnerPrompt: "Say that the order is for here.",
            help: {
              levels: [
                { sceneDirection: "Rasa gestures towards the tables and then towards a takeaway bag.", speakerText: "Čia?" },
                { speakerText: "For here or to go?", spokenLanguage: "en", audio: false },
              ],
            },
            options: [
              {
                id: "a",
                text: "Čia, prašau.",
                textEn: "For here, please.",
                result: "best",
                progresses: true,
              },
              {
                id: "b",
                text: "Čia.",
                textEn: "For here.",
                result: "acceptable",
                feedback: "Short, but completely clear.",
                progresses: true,
              },
              {
                id: "c",
                text: "Išsinešti, prašau.",
                textEn: "To go, please.",
                result: "wrong",
                feedback: "That would make the order takeaway, but the scene says you are eating at the café.",
                progresses: false,
              },
            ],
          },
          {
            id: "step_4",
            speakerId: "server",
            speakerLabel: "Server",
            speakerText: "Prašom. Vienas sumuštinis ir sriuba.",
            sceneDirection: "You ordered two sandwiches. Rasa has brought one sandwich and a bowl of soup, so one item is wrong.",
            learnerPrompt: "Explain the mistake and ask for the correct item.",
            options: [
              {
                id: "a",
                text: "Atsiprašau — čia ne tai, ką užsisakiau. Mums du sumuštinius, prašau. Ar galite pakeisti?",
                textEn: "Excuse me — this isn't what I ordered. Two sandwiches for us, please. Can you change it?",
                result: "best",
                progresses: true,
              },
              {
                id: "b",
                text: "Atsiprašau. Mums du sumuštinius, prašau. Ar galite pakeisti?",
                textEn: "Excuse me. Two sandwiches for us, please. Can you change it?",
                result: "acceptable",
                feedback: "Clear and natural. The fuller answer also explicitly says that the order is wrong.",
                progresses: true,
              },
              {
                id: "c",
                text: "Atsiprašau. Sriubos nenoriu. Mums du sumuštinius, prašau.",
                textEn: "Excuse me. I don't want soup. Two sandwiches for us, please.",
                result: "awkward",
                feedback: "This communicates the problem, but it sounds more like a preference change than an order correction.",
                betterAnswer: "Atsiprašau — čia ne tai, ką užsisakiau. Mums du sumuštinius, prašau. Ar galite pakeisti?",
                progresses: true,
              },
            ],
          },
          {
            id: "step_5",
            speakerId: "server",
            speakerLabel: "Server",
            speakerText: "Labai atsiprašau. Žinoma. Prašom — du sumuštiniai. Ar skanu?",
            sceneDirection: "Rasa replaces the soup with the second sandwich. You try yours and like it.",
            learnerPrompt: "Tell Rasa that the food is very tasty.",
            options: [
              {
                id: "a",
                text: "Taip, labai skanu. Man patinka.",
                textEn: "Yes, very tasty. I like it.",
                result: "best",
                progresses: true,
              },
              {
                id: "b",
                text: "Labai skanu, ačiū.",
                textEn: "Very tasty, thank you.",
                result: "acceptable",
                feedback: "Natural and direct.",
                progresses: true,
              },
              {
                id: "c",
                text: "Taip, labai gerai.",
                textEn: "Yes, very good.",
                result: "awkward",
                feedback: "Understandable, but skanu is the more specific word for saying food tastes good.",
                betterAnswer: "Taip, labai skanu.",
                progresses: true,
              },
            ],
          },
          {
            id: "step_6",
            speakerId: "friend",
            speakerLabel: "Friend",
            speakerText: "Ar nori dar?",
            sceneDirection: "You have eaten enough and do not want anything more.",
            learnerPrompt: "Decline and say that you've had enough.",
            options: [
              {
                id: "a",
                text: "Ne, ačiū. Užtenka.",
                textEn: "No, thank you. That's enough.",
                result: "best",
                progresses: true,
              },
              {
                id: "b",
                text: "Užtenka, ačiū.",
                textEn: "That's enough, thank you.",
                result: "acceptable",
                feedback: "A natural equivalent.",
                progresses: true,
              },
              {
                id: "c",
                text: "Ne, ačiū.",
                textEn: "No, thank you.",
                result: "awkward",
                feedback: "This is a natural decline, but the task also asks you to say that you've had enough.",
                betterAnswer: "Ne, ačiū. Užtenka.",
                progresses: true,
              },
            ],
          },
          {
            id: "step_7",
            speakerId: "server",
            speakerLabel: "Server",
            speakerText: "Ar dar ko nors norėtumėte?",
            sceneDirection: "You do not want anything else and are ready to pay.",
            learnerPrompt: "Decline and ask for the bill.",
            options: [
              {
                id: "a",
                text: "Ne, ačiū. Ar galėčiau gauti sąskaitą, prašau?",
                textEn: "No, thank you. Could I get the bill, please?",
                result: "best",
                progresses: true,
              },
              {
                id: "b",
                text: "Ne, ačiū. Sąskaitą, prašau.",
                textEn: "No, thank you. The bill, please.",
                result: "acceptable",
                feedback: "Shorter, but natural and clear.",
                progresses: true,
              },
              {
                id: "c",
                text: "Ne, ačiū. Užtenka.",
                textEn: "No, thank you. That's enough.",
                result: "awkward",
                feedback: "That answers the offer, but it does not yet ask for the bill.",
                betterAnswer: "Ne, ačiū. Sąskaitą, prašau.",
                progresses: true,
              },
            ],
          },
          {
            id: "step_8",
            speakerId: "server",
            speakerLabel: "Server",
            speakerText: "Žinoma. Dvylika eurų. Grynaisiais ar kortele?",
            sceneDirection: "You want to pay in cash.",
            learnerPrompt: "Choose cash.",
            help: {
              levels: [
                { sceneDirection: "Rasa gestures towards the cash tray and then the card terminal.", speakerText: "Grynaisiais?" },
                { speakerText: "Cash or card?", spokenLanguage: "en", audio: false },
              ],
            },
            options: [
              {
                id: "a",
                text: "Grynaisiais, prašau.",
                textEn: "Cash, please.",
                result: "best",
                progresses: true,
              },
              {
                id: "b",
                text: "Turiu grynųjų.",
                textEn: "I have cash.",
                result: "acceptable",
                feedback: "Understandable and relevant, though Grynaisiais, prašau directly answers how you want to pay.",
                progresses: true,
              },
              {
                id: "c",
                text: "Kortele, prašau.",
                textEn: "By card, please.",
                result: "wrong",
                feedback: "The scene says you want to pay in cash.",
                progresses: false,
              },
            ],
          },
          {
            id: "step_9",
            speakerId: "server",
            speakerLabel: "Server",
            speakerText: "Ačiū. Viso gero!",
            sceneDirection: "You and Mantas are leaving the café.",
            learnerPrompt: "Close the conversation naturally.",
            options: [
              {
                id: "a",
                text: "Ačiū! Viso gero!",
                textEn: "Thank you! Goodbye!",
                result: "best",
                progresses: true,
              },
              {
                id: "b",
                text: "Viso gero!",
                textEn: "Goodbye!",
                result: "acceptable",
                feedback: "A natural simple closing.",
                progresses: true,
              },
              {
                id: "c",
                text: "Iki!",
                textEn: "See you!",
                result: "acceptable",
                feedback: "Also natural as a casual goodbye.",
                progresses: true,
              },
            ],
          },
        ],
      },

      // ── Word Match — ~5 best pairs from each of the 4 modules ─────────────────
      {
        id: "s4c_b13",
        type: "word_match",
        title: "Match the pairs",
        pairs: [
          { id: "m1",  lt: "Norėčiau kavos.",            en: "I would like coffee.",             audioText: "Norėčiau kavos" },
          { id: "m2",  lt: "Dvi arbatas, prašau.",        en: "Two teas, please.",                audioText: "Dvi arbatas, prašau" },
          { id: "m3",  lt: "Šito, prašau.",               en: "This one, please.",                audioText: "Šito, prašau" },
          { id: "m4",  lt: "Dar vieną, prašau.",          en: "One more, please.",                audioText: "Dar vieną, prašau" },
          { id: "m5",  lt: "Čia ar išsinešti?",           en: "For here or to go?",               audioText: "Čia ar išsinešti" },
          { id: "m6",  lt: "Išsinešti, prašau.",          en: "To go, please.",                   audioText: "Išsinešti, prašau" },
          { id: "m7",  lt: "su pienu",                    en: "with milk",                        audioText: "su pienu" },
          { id: "m8",  lt: "be cukraus",                  en: "without sugar",                    audioText: "be cukraus" },
          { id: "m9",  lt: "Ar galėčiau gauti sąskaitą, prašau?",           en: "The bill, please.",                audioText: "Ar galėčiau gauti sąskaitą, prašau" },
          { id: "m10", lt: "Ar galima mokėti kortele?",       en: "Can I pay by card?",               audioText: "Galima mokėti kortele" },
          { id: "m11", lt: "Nenoriu šito.",               en: "I don't want this.",               audioText: "Nenoriu šito" },
          { id: "m12", lt: "Nevalgau mėsos.",             en: "I don't eat meat.",                audioText: "Nevalgau mėsos" },
          { id: "m13", lt: "Čia ne tai, ką užsisakiau.",    en: "This is not what I ordered.",      audioText: "Čia ne tai, ką užsisakiau" },
          { id: "m14", lt: "Ar galite pakeisti?",         en: "Can you change it?",               audioText: "Ar galite pakeisti" },
          { id: "m15", lt: "Per karšta.",                 en: "Too hot.",                         audioText: "Per karšta" },
          { id: "m16", lt: "Ar nori sausainio?",          en: "Do you want a biscuit / cookie?",  audioText: "Ar nori sausainio" },
          { id: "m17", lt: "Pavalgykime.",                en: "Let's eat.",                       audioText: "Pavalgykime" },
          { id: "m18", lt: "Man sulčių, prašau.",         en: "Juice for me, please.",            audioText: "Man sulčių, prašau" },
          { id: "m19", lt: "Tai skanu.",                  en: "This is tasty / delicious.",       audioText: "Tai skanu" },
          { id: "m20", lt: "Man patinka.",                en: "I like it.",                       audioText: "Man patinka" },
        ],
      },
    ],
  };
}

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
          pattern: "Alkanas (hungry) changes ending by gender — alkanas for male, alkana for female. You have already seen this pattern with vegetaras / vegetarė. Aš noriu gerti — literally 'I want to drink' — is the natural way to say you're thirsty.",
          usage: [
            "Aš alkanas — I'm hungry (male)",
            "Aš alkana — I'm hungry (female)",
            "Aš noriu gerti — I'm thirsty",
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
              { id: "ht2", lt: "Aš noriu gerti.", en: "I'm thirsty.", audioText: "Aš noriu gerti", saveable: true, core: true },
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
            prompt: { text: "Aš noriu gerti.", audioText: "Aš noriu gerti" },
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
            id: "s4m4l1_b5",
            type: "scenario_chain",
            title: "Conversation",
            description: "You and a friend are deciding whether to stop for food.",
            steps: [
              {
                id: "step_1",
                actor: "other",
                text: `${userNameSafe}, ar tu alkanas?`,
                audioText: "Ar tu alkanas",
                helperText: "Are you hungry?",
                options: [
                  { id: "a", text: "Ne, ačiū.", isCorrect: false },
                  { id: "b", text: `Taip, aš ${alkanas}. O tu?`, en: "Yes, I'm hungry. And you?", isCorrect: true },
                  { id: "c", text: "Nesuprantu.", isCorrect: false },
                ],
              },
              {
                id: "step_2",
                actor: "other",
                text: "Aš irgi. Ir noriu gerti.",
                audioText: "Aš irgi. Ir noriu gerti",
                helperText: "Me too. And I'm thirsty.",
                options: [
                  { id: "a", text: "Viso gero.", isCorrect: false },
                  { id: "b", text: "Eikime į kavinę!", en: "Let's go to the café!", isCorrect: true },
                  { id: "c", text: "Nesuprantu.", isCorrect: false },
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
        newLanguageLoad: "low_to_medium",
        notes: {
          pattern: "Ar nori…? (informal) and Ar norite…? (formal/plural) — you know norite from Ko norite?. Taip, prašau / Ne, ačiū are your already-known yes and no responses.",
          usage: [
            "Ar nori kavos? — Do you want coffee? (informal)",
            "Ar norite kavos? — Do you want coffee? (formal/plural)",
            "Taip, prašau — Yes, please",
            "Ne, ačiū — No, thank you",
          ],
        },
        blocks: [
          {
            id: "s4m4l2_b1",
            type: "learn",
            title: "Offering and responding",
            items: [
              { id: "of1", lt: "Ar nori kavos?", en: "Do you want coffee? (informal)", audioText: "Ar nori kavos", saveable: true, core: true },
              { id: "of2", lt: "Ar norite kavos?", en: "Do you want coffee? (formal / plural)", audioText: "Ar norite kavos", saveable: true, core: true },
              { id: "of3", lt: "Ar nori arbatos?", en: "Do you want tea? (informal)", audioText: "Ar nori arbatos", saveable: true, core: true },
              { id: "of4", lt: "Taip, prašau.", en: "Yes, please.", audioText: "Taip, prašau", saveable: true, core: true },
              { id: "of5", lt: "Ne, ačiū.", en: "No, thank you.", audioText: "Ne, ačiū", saveable: true, core: true },
            ],
          },
          {
            id: "s4m4l2_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Ar nori kavos?", audioText: "Ar nori kavos" },
            options: [
              { id: "a", text: "I want coffee.", isCorrect: false },
              { id: "b", text: "Do you want coffee?", isCorrect: true },
              { id: "c", text: "What do you want?", isCorrect: false },
            ],
          },
          {
            id: "s4m4l2_b3",
            type: "best_response",
            title: "Choose the best response",
            prompt: { text: "Your friend asks: Ar nori arbatos? You'd love some." },
            options: [
              { id: "a", text: "Ne, ačiū.", isCorrect: false },
              { id: "b", text: "Taip, prašau!", isCorrect: true },
              { id: "c", text: "Nesuprantu.", isCorrect: false },
            ],
            feedback: { correct: "Taip, prašau — Yes, please. The natural, polite acceptance." },
          },
          {
            id: "s4m4l2_b4",
            type: "speak_self_check",
            title: "Say it out loud",
            prompt: "Ask your friend: Do you want coffee?",
            targetText: "Ar nori kavos",
            audioText: "Ar nori kavos",
          },
          {
            id: "s4m4l2_b5",
            type: "scenario_chain",
            title: "Conversation",
            description: "You offer a colleague something to drink.",
            steps: [
              {
                id: "step_1",
                actor: "other",
                text: "Labas!",
                audioText: "Labas",
                options: [
                  { id: "a", text: "Viso gero.", isCorrect: false },
                  { id: "b", text: "Labas! Ar nori kavos?", en: "Hi! Do you want coffee?", isCorrect: true },
                  { id: "c", text: "Nesuprantu.", isCorrect: false },
                ],
              },
              {
                id: "step_2",
                actor: "other",
                text: "Taip, prašau! Su pienu.",
                audioText: "Taip, prašau! Su pienu",
                helperText: "Yes, please! With milk.",
                options: [
                  { id: "a", text: "Ne, ačiū.", isCorrect: false },
                  { id: "b", text: "Gerai! Ar su cukrumi?", en: "Great! With sugar?", isCorrect: true },
                  { id: "c", text: "Nesuprantu.", isCorrect: false },
                ],
              },
              {
                id: "step_3",
                actor: "other",
                text: "Ne, be cukraus.",
                audioText: "Ne, be cukraus",
                helperText: "No, without sugar.",
                options: [
                  { id: "a", text: "Ko norite?", isCorrect: false },
                  { id: "b", text: "Gerai. Prašom!", en: "Great. Here you go!", isCorrect: true },
                  { id: "c", text: "Atsiprašau.", isCorrect: false },
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
            "Išgerkime kavos — Let's drink coffee",
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
              { id: "si2", lt: "Išgerkime kavos.", en: "Let's drink coffee.", audioText: "Išgerkime kavos", saveable: true, core: true },
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
              { id: "c", text: "Let's drink coffee.", isCorrect: false },
            ],
          },
          {
            id: "s4m4l3_b3",
            type: "recognise_mcq",
            noOptionAudio: true,
            title: "Choose the correct meaning",
            prompt: { text: "Pavalgykime.", audioText: "Pavalgykime" },
            options: [
              { id: "a", text: "Let's drink coffee.", isCorrect: false },
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
            id: "s4m4l3_b5",
            type: "scenario_chain",
            title: "Conversation",
            description: "You suggest going for a coffee with a friend.",
            steps: [
              {
                id: "step_1",
                actor: "other",
                text: `Labas, ${userNameSafe}!`,
                audioText: "Labas!",
                options: [
                  { id: "a", text: "Viso gero.", isCorrect: false },
                  { id: "b", text: "Labas! Eikime į kavinę!", en: "Hi! Let's go to the café!", isCorrect: true },
                  { id: "c", text: "Nesuprantu.", isCorrect: false },
                ],
              },
              {
                id: "step_2",
                actor: "other",
                text: "Gerai! Dabar?",
                audioText: "Gerai! Dabar",
                helperText: "Great! Now?",
                options: [
                  { id: "a", text: "Ne, ačiū.", isCorrect: false },
                  { id: "b", text: "Taip, dabar!", en: "Yes, now!", isCorrect: true },
                  { id: "c", text: "Nesuprantu.", isCorrect: false },
                ],
              },
              {
                id: "step_3",
                actor: "other",
                text: "Puiku! Išgerkime kavos.",
                audioText: "Puiku! Išgerkime kavos",
                helperText: "Great! Let's drink coffee.",
                options: [
                  { id: "a", text: "Ne, ačiū.", isCorrect: false },
                  { id: "b", text: "Taip! Ir gal pavalgykime.", en: "Yes! And maybe let's eat too.", isCorrect: true },
                  { id: "c", text: "Nesuprantu.", isCorrect: false },
                ],
              },
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
          pattern: "Man, tau, mums — these are dative forms meaning to me / for me, to you / for you, to us / for us. You have seen man before in Man reikia… and Man irgi. Now it appears in ordering context.",
          usage: [
            "man — for me / to me",
            "tau / jums — for you / to you",
            "mums — for us",
            "Man kavos, prašau — Coffee for me, please",
            "Mums dvi arbatas — Two teas for us",
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
              { id: "fo5", lt: "Man kavos, prašau.", en: "Coffee for me, please.", audioText: "Man kavos, prašau", saveable: true, core: true },
              { id: "fo6", lt: "Mums dvi arbatas.", en: "Two teas for us.", audioText: "Mums dvi arbatas", saveable: true, core: true },
              { id: "fo7", lt: "Jums vandens?", en: "Water for you?", audioText: "Jums vandens", saveable: false, core: false },
              { id: "fo8", lt: "Kam kava?", en: "Who is the coffee for?", audioText: "Kam kava", saveable: false, core: false },
            ],
          },
          {
            id: "s4m4l4_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Mums dvi arbatas.", audioText: "Mums dvi arbatas" },
            options: [
              { id: "a", text: "Two coffees for me.", isCorrect: false },
              { id: "b", text: "Two teas for us.", isCorrect: true },
              { id: "c", text: "Water for you.", isCorrect: false },
            ],
          },
          {
            id: "s4m4l4_b3",
            type: "recognise_mcq",
            title: "Choose the correct meaning",
            prompt: { text: "Man kavos, prašau.", audioText: "Man kavos, prašau" },
            options: [
              { id: "a", text: "Two coffees, please.", isCorrect: false },
              { id: "b", text: "Coffee for us, please.", isCorrect: false },
              { id: "c", text: "Coffee for me, please.", isCorrect: true },
            ],
          },
          // ── Pattern to Notice ────────────────────────────────────────────────
          {
            id: "s4m4l4_b4",
            type: "learn",
            title: "Pattern to notice — man, tau, mums",
            items: [
              { id: "pn1", lt: "Man reikia pagalbos.", en: "I need help. (man = to/for me)", audioText: "Man reikia pagalbos", saveable: false, core: false },
              { id: "pn2", lt: "Man kavos, prašau.", en: "Coffee for me, please.", audioText: "Man kavos, prašau", saveable: false, core: false },
              { id: "pn3", lt: "Tau kavos?", en: "Coffee for you? (tau = to/for you, informal)", audioText: "Tau kavos", saveable: false, core: false },
              { id: "pn4", lt: "Mums dvi arbatas.", en: "Two teas for us. (mums = to/for us)", audioText: "Mums dvi arbatas", saveable: false, core: false },
            ],
            notes: {
              pattern: "Man means for me or to me. Tau means for you (informal). Mums means for us. You have already used man many times — in Man reikia… (I need…) and Man irgi (me too). These are the same small word doing the same job in a new situation. You do not need to memorise grammar rules — just notice that man, tau, and mums all follow the same pattern: they tell you who something is for.",
            },
          },
          {
            id: "s4m4l4_b5",
            type: "build_phrase",
            title: "Build the phrase",
            prompt: { text: "Two teas for us." },
            tokens: [
              { id: "t1", text: "Mums", correctIndex: 0 },
              { id: "t2", text: "dvi", correctIndex: 1 },
              { id: "t3", text: "arbatas", correctIndex: 2 },
              { id: "t4", text: "Man", isDistractor: true },
              { id: "t5", text: "kavą.", isDistractor: true },
            ],
            answerText: "Mums dvi arbatas",
          },
          {
            id: "s4m4l4_b6",
            type: "scenario_chain",
            title: "Conversation",
            description: "You order for yourself and a colleague.",
            steps: [
              {
                id: "step_1",
                actor: "other",
                text: "Ko norėtumėte?",
                audioText: "Ko norėtumėte",
                helperText: "What would you like?",
                options: [
                  { id: "a", text: "Nesuprantu.", isCorrect: false },
                  { id: "b", text: "Man kavos ir tau arbatos, prašau.", en: "Coffee for me and tea for you, please.", isCorrect: true },
                  { id: "c", text: "Viso gero.", isCorrect: false },
                ],
              },
              {
                id: "step_2",
                actor: "other",
                text: "Gerai. Kam kava?",
                audioText: "Gerai. Kam kava",
                helperText: "OK. Who is the coffee for?",
                options: [
                  { id: "a", text: "Tau, prašau.", isCorrect: false },
                  { id: "b", text: "Man, prašau.", en: "For me, please.", isCorrect: true },
                  { id: "c", text: "Nesuprantu.", isCorrect: false },
                ],
              },
              {
                id: "step_3",
                actor: "other",
                text: "Prašom.",
                audioText: "Prašom",
                helperText: "Here you go.",
                options: [
                  { id: "a", text: "Ko norite?", isCorrect: false },
                  { id: "b", text: "Ačiū labai!", en: "Thank you very much!", isCorrect: true },
                  { id: "c", text: "Atsiprašau.", isCorrect: false },
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
            noOptionAudio: true,
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
            id: "s4m4l5_b5",
            type: "scenario_chain",
            title: "Conversation",
            description: "You and a friend are eating together at a café.",
            steps: [
              {
                id: "step_1",
                actor: "other",
                text: "Ar skanu?",
                audioText: "Ar skanu",
                helperText: "Is it tasty?",
                options: [
                  { id: "a", text: "Per karšta.", isCorrect: false },
                  { id: "b", text: "Taip! Labai skanu. Man patinka.", en: "Yes! Very tasty. I like it.", isCorrect: true },
                  { id: "c", text: "Nesuprantu.", isCorrect: false },
                ],
              },
              {
                id: "step_2",
                actor: "other",
                text: "Man irgi! Ar nori dar?",
                audioText: "Man irgi! Ar nori dar",
                helperText: "Me too! Do you want more?",
                options: [
                  { id: "a", text: "Nesuprantu.", isCorrect: false },
                  { id: "b", text: "Ne, ačiū. Pakanka.", en: "No, thank you. That's enough.", isCorrect: true },
                  { id: "c", text: "Sąskaitą, prašau.", isCorrect: false },
                ],
              },
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
            prompt: { text: "A colleague asks: Ar nori kavos? You would like some." },
            options: [
              { id: "a", text: "Ne, ačiū.", isCorrect: false },
              { id: "b", text: "Taip, prašau!", isCorrect: true },
              { id: "c", text: "Sąskaitą, prašau.", isCorrect: false },
            ],
            feedback: { correct: "Taip, prašau — Yes, please. Natural and immediate." },
          },
          {
            id: "s4m4c_b2",
            type: "listen_mcq",
            title: "Listen and choose",
            prompt: { text: "Eikime į kavinę.", audioText: "Eikime į kavinę" },
            options: [
              { id: "a", text: "Let's eat.", isCorrect: false },
              { id: "b", text: "Let's go to the café.", isCorrect: true },
              { id: "c", text: "Let's drink coffee.", isCorrect: false },
            ],
          },
          {
            id: "s4m4c_b3",
            type: "recognise_mcq",
            noOptionAudio: true,
            title: "Choose the correct meaning",
            prompt: { text: "Mums dvi arbatas.", audioText: "Mums dvi arbatas" },
            options: [
              { id: "a", text: "Coffee for me.", isCorrect: false },
              { id: "b", text: "Two teas for me.", isCorrect: false },
              { id: "c", text: "Two teas for us.", isCorrect: true },
            ],
          },
          {
            id: "s4m4c_b4",
            type: "best_response",
            noOptionAudio: true,
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
            prompt: "Suggest going to the café",
            targetText: "Eikime į kavinę",
            audioText: "Eikime į kavinę",
          },
          {
            id: "s4m4c_b6",
            type: "scenario_chain",
            title: "Conversation",
            description: "A relaxed social exchange — you and a friend decide to get food and drink together.",
            steps: [
              {
                id: "step_1",
                actor: "other",
                text: `Labas, ${userNameSafe}! Ar tu alkanas?`,
                audioText: "Labas! Ar tu alkanas",
                helperText: "Hi! Are you hungry?",
                options: [
                  { id: "a", text: "Ne, ačiū.", isCorrect: false },
                  { id: "b", text: "Taip! Eikime į kavinę.", en: "Yes! Let's go to the café.", isCorrect: true },
                  { id: "c", text: "Nesuprantu.", isCorrect: false },
                ],
              },
              {
                id: "step_2",
                actor: "other",
                text: "Gerai! Ar nori kavos?",
                audioText: "Gerai! Ar nori kavos",
                helperText: "Great! Do you want coffee?",
                options: [
                  { id: "a", text: "Viso gero.", isCorrect: false },
                  { id: "b", text: "Taip, prašau. Man kavos su pienu.", en: "Yes, please. Coffee with milk for me.", isCorrect: true },
                  { id: "c", text: "Nesuprantu.", isCorrect: false },
                ],
              },
              {
                id: "step_3",
                actor: "other",
                text: "Aš noriu arbatos. Ir pavalgykime!",
                audioText: "Aš noriu arbatos. Ir pavalgykime",
                helperText: "I want tea. And let's eat!",
                options: [
                  { id: "a", text: "Ko norite?", isCorrect: false },
                  { id: "b", text: "Taip! Labai gera idėja.", en: "Yes! Great idea.", isCorrect: true },
                  { id: "c", text: "Atsiprašau.", isCorrect: false },
                ],
              },
              {
                id: "step_4",
                actor: "other",
                text: "Ar skanu?",
                audioText: "Ar skanu",
                helperText: "Is it tasty?",
                options: [
                  { id: "a", text: "Per karšta.", isCorrect: false },
                  { id: "b", text: "Taip, labai skanu! Man patinka.", en: "Yes, very tasty! I like it.", isCorrect: true },
                  { id: "c", text: "Nesuprantu.", isCorrect: false },
                ],
              },
              {
                id: "step_5",
                actor: "other",
                text: "Man irgi! Viso gero!",
                audioText: "Man irgi! Viso gero",
                options: [
                  { id: "a", text: "Atsiprašau.", isCorrect: false },
                  { id: "b", text: "Viso gero! Ačiū!", en: "Goodbye! Thank you!", isCorrect: true },
                  { id: "c", text: "Nesuprantu.", isCorrect: false },
                ],
              },
            ],
          },
          {
            id: "s4m4c_b7",
            type: "word_match",
            title: "Match the pairs",
            pairs: [
              { id: "m1",  lt: "Aš alkanas.",         en: "I'm hungry. (male)",                  audioText: "Aš alkanas" },
              { id: "m2",  lt: "Aš alkana.",           en: "I'm hungry. (female)",                audioText: "Aš alkana" },
              { id: "m3",  lt: "Aš noriu gerti.",      en: "I'm thirsty.",                        audioText: "Aš noriu gerti" },
              { id: "m4",  lt: "Ar nori kavos?",       en: "Do you want coffee? (informal)",      audioText: "Ar nori kavos" },
              { id: "m5",  lt: "Ar norite kavos?",     en: "Do you want coffee? (formal)",        audioText: "Ar norite kavos" },
              { id: "m6",  lt: "Taip, prašau.",        en: "Yes, please.",                        audioText: "Taip, prašau" },
              { id: "m7",  lt: "Ne, ačiū.",            en: "No, thank you.",                      audioText: "Ne, ačiū" },
              { id: "m8",  lt: "Pavalgykime.",         en: "Let's eat.",                          audioText: "Pavalgykime" },
              { id: "m9",  lt: "Išgerkime kavos.",     en: "Let's drink coffee.",                 audioText: "Išgerkime kavos" },
              { id: "m10", lt: "Eikime į kavinę.",     en: "Let's go to the café.",               audioText: "Eikime į kavinę" },
              { id: "m11", lt: "Gal vėliau?",          en: "Maybe later?",                        audioText: "Gal vėliau" },
              { id: "m12", lt: "man",                  en: "for me / to me",                      audioText: "man" },
              { id: "m13", lt: "mums",                 en: "for us",                              audioText: "mums" },
              { id: "m14", lt: "Man kavos, prašau.",   en: "Coffee for me, please.",              audioText: "Man kavos, prašau" },
              { id: "m15", lt: "Mums dvi arbatas.",    en: "Two teas for us.",                    audioText: "Mums dvi arbatas" },
              { id: "m16", lt: "Tai skanu.",           en: "This is tasty / delicious.",          audioText: "Tai skanu" },
              { id: "m17", lt: "Labai skanu.",         en: "Very tasty.",                         audioText: "Labai skanu" },
              { id: "m18", lt: "Man patinka.",         en: "I like it.",                          audioText: "Man patinka" },
              { id: "m19", lt: "Neblogai.",            en: "Not bad.",                            audioText: "Neblogai" },
              { id: "m20", lt: "kepsnys",              en: "steak / roast",                       audioText: "kepsnys" },
            ],
          },
        ],
      },
    ],
  };
}

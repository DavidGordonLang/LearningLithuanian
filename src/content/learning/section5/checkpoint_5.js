// src/content/learning/section5/checkpoint_5.js
// Checkpoint 5 — Moving Through Real Space

export default function createCheckpoint5(profile = {}) {
  const { userNameSafe = "Davidas" } = profile;

  return {
    id: "section_5_checkpoint",
    code: "5.C",
    title: "Moving Through Real Space",
    purpose: "Bring the whole section together. Prove the learner can navigate a simple real-world location problem.",
    supportLevel: "low",
    newLanguageLoad: "none",
    blocks: [

      // Block 1 — Quick recognition warm-up
      {
        id: "s5cp_b1",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Kur yra autobusų stotis?", audioText: "Kur yra autobusų stotis" },
        options: [
          { id: "a", text: "Where is the train station?", isCorrect: false },
          { id: "b", text: "Where is the bus station?",   isCorrect: true  },
          { id: "c", text: "How do I get to the station?",isCorrect: false },
        ],
      },

      // Block 2 — Place identification
      {
        id: "s5cp_b2",
        type: "recognise_mcq",
        title: "Choose the correct meaning",
        prompt: { text: "vaistinė", audioText: "vaistinė" },
        options: [
          { id: "a", text: "hospital",  isCorrect: false },
          { id: "b", text: "pharmacy",  isCorrect: true  },
          { id: "c", text: "police",    isCorrect: false },
        ],
      },

      // Block 3 — Where-is exchange with form awareness
      {
        id: "s5cp_b3",
        type: "choose_correct_form",
        base_word: "stotis",
        word_gloss_en: "station",
        prompt: "Complete the question",
        sentence: "Kaip man nusigauti į ___?",
        translation_en: "How do I get to the station?",
        options: [
          { id: "a", text: "stotyje", isCorrect: false },
          { id: "b", text: "stoties", isCorrect: false },
          { id: "c", text: "stotį",   isCorrect: true  },
        ],
        explanation: "After į (to), stotis becomes stotį. The destination form is used when expressing movement toward somewhere.",
      },

      // Block 4 — Direction understanding
      {
        id: "s5cp_b4",
        type: "listen_mcq",
        title: "Listen and choose",
        prompt: { text: "Eikite tiesiai, paskui pasukite kairėn.", audioText: "Eikite tiesiai, paskui pasukite kairėn" },
        options: [
          { id: "a", text: "Turn left, then go straight.",  isCorrect: false },
          { id: "b", text: "Go straight, then turn left.",  isCorrect: true  },
          { id: "c", text: "Go straight, then turn right.", isCorrect: false },
        ],
      },

      // Block 5 — Movement language
      {
        id: "s5cp_b5",
        type: "context_gap_select",
        prompt: "Choose the correct form",
        sentence: "Aš einu ___ viešbučio į stotį.",
        translation_en: "I'm going from the hotel to the station.",
        options: [
          { id: "a", text: "į",   isCorrect: false },
          { id: "b", text: "iš",  isCorrect: true  },
          { id: "c", text: "prie",isCorrect: false },
        ],
        explanation: "Iš shows the starting point — from. Į shows the destination — to. Both change the form of the noun that follows.",
      },

      // Block 6 — Transport mode
      {
        id: "s5cp_b6",
        type: "best_response",
        title: "Choose the best response",
        prompt: { text: "You ask if the airport is far. The answer is: Taip, labai toli. What is the most useful follow-up?", audioText: "" },
        noOptionAudio: true,
        options: [
          { id: "a", text: "Eikite tiesiai.",               isCorrect: false },
          { id: "b", text: "Galite važiuoti autobusu.",      isCorrect: true  },
          { id: "c", text: "Tai čia pat.",                  isCorrect: false },
        ],
        feedback: { correct: "If it's very far, the practical suggestion is Galite važiuoti autobusu — you can go by bus. Walking is not the answer here." },
      },

      // Block 7 — Speak
      {
        id: "s5cp_b7",
        type: "speak_self_check",
        title: "Say it out loud",
        prompt: "Ask: How do I get to the pharmacy?",
        targetText: "Kaip man nusigauti į vaistinę",
        audioText: "Kaip man nusigauti į vaistinę",
      },

      // Block 8 — Conversation chain: full navigation scenario
      {
        id: "s5cp_b8",
        type: "scenario_chain",
        title: "Conversation",
        description: "You arrive in a Lithuanian city and need to get to your hotel. You don't know the way.",
        steps: [
          {
            id: "step_1",
            actor: "other",
            text: "Laba diena! Ar galiu jums padėti?",
            audioText: "Laba diena! Ar galiu jums padėti",
            helperText: "Good day! Can I help you?",
            options: [
              { id: "a", text: "Viso gero.", isCorrect: false },
              { id: "b", text: "Laba diena! Atsiprašau, kaip man nusigauti į viešbutį?", en: "Good day! Excuse me, how do I get to the hotel?", isCorrect: true },
              { id: "c", text: "Nesuprantu.", isCorrect: false },
            ],
          },
          {
            id: "step_2",
            actor: "other",
            text: "Koks viešbutis? Yra keli viešbučiai mieste.",
            audioText: "Koks viešbutis? Yra keli viešbučiai mieste",
            helperText: "Which hotel? There are several hotels in the city.",
            options: [
              { id: "a", text: "Nesuprantu.", isCorrect: false },
              { id: "b", text: "Viešbutis prie autobusų stoties.", en: "The hotel near the bus station.", isCorrect: true },
              { id: "c", text: "Per brangu.", isCorrect: false },
            ],
          },
          {
            id: "step_3",
            actor: "other",
            text: "A, suprantu! Eikite tiesiai, paskui pasukite dešinėn.",
            audioText: "A, suprantu! Eikite tiesiai, paskui pasukite dešinėn",
            helperText: "Ah, I understand! Go straight, then turn right.",
            options: [
              { id: "a", text: "Atsiprašau.", isCorrect: false },
              { id: "b", text: "Suprantu. Ar tai toli?", en: "I understand. Is it far?", isCorrect: true },
              { id: "c", text: "Kur yra kavinė?", isCorrect: false },
            ],
          },
          {
            id: "step_4",
            actor: "other",
            text: "Ne, netoli. Galite eiti pėsčiomis — penkios minutės.",
            audioText: "Ne, netoli. Galite eiti pėsčiomis — penkios minutės",
            helperText: "No, not far. You can walk — five minutes.",
            options: [
              { id: "a", text: "Galite važiuoti autobusu?", isCorrect: false },
              { id: "b", text: "Puiku! Ačiū labai.", en: "Great! Thank you very much.", isCorrect: true },
              { id: "c", text: "Nesuprantu.", isCorrect: false },
            ],
          },
          {
            id: "step_5",
            actor: "other",
            text: "Prašom! Geros kelionės ir gero apsigyvenimo!",
            audioText: "Prašom! Geros kelionės ir gero apsigyvenimo",
            helperText: "You're welcome! Have a good journey and a good stay!",
            options: [
              { id: "a", text: "Atsiprašau.", isCorrect: false },
              { id: "b", text: "Ačiū! Viso gero!", en: "Thank you! Goodbye!", isCorrect: true },
              { id: "c", text: "Laba diena.", isCorrect: false },
            ],
          },
        ],
      },

      // Block 9 — Word match: full section vocabulary
      {
        id: "s5cp_b9",
        type: "word_match",
        title: "Match the pairs",
        pairs: [
          { id: "m1",  lt: "Kur yra…?",                      en: "Where is…?",                    audioText: "Kur yra" },
          { id: "m2",  lt: "Kaip man nusigauti į stotį?",    en: "How do I get to the station?",  audioText: "Kaip man nusigauti į stotį" },
          { id: "m3",  lt: "Ar tai toli?",                   en: "Is it far?",                    audioText: "Ar tai toli" },
          { id: "m4",  lt: "Tai netoli.",                    en: "It's near.",                    audioText: "Tai netoli" },
          { id: "m5",  lt: "Eikite tiesiai.",                en: "Go straight ahead.",            audioText: "Eikite tiesiai" },
          { id: "m6",  lt: "Pasukite kairėn.",               en: "Turn left.",                    audioText: "Pasukite kairėn" },
          { id: "m7",  lt: "Pasukite dešinėn.",              en: "Turn right.",                   audioText: "Pasukite dešinėn" },
          { id: "m8",  lt: "autobusų stotis",                en: "bus station",                   audioText: "autobusų stotis" },
          { id: "m9",  lt: "geležinkelio stotis",            en: "train station",                 audioText: "geležinkelio stotis" },
          { id: "m10", lt: "vaistinė",                       en: "pharmacy",                      audioText: "vaistinė" },
          { id: "m11", lt: "viešbutis",                      en: "hotel",                         audioText: "viešbutis" },
          { id: "m12", lt: "Aš einu į stotį.",               en: "I'm going to the station.",     audioText: "Aš einu į stotį" },
          { id: "m13", lt: "iš viešbučio",                   en: "from the hotel",                audioText: "iš viešbučio" },
          { id: "m14", lt: "viešbutyje",                     en: "in the hotel",                  audioText: "viešbutyje" },
          { id: "m15", lt: "pėsčiomis",                      en: "on foot",                       audioText: "pėsčiomis" },
          { id: "m16", lt: "autobusu",                       en: "by bus",                        audioText: "autobusu" },
          { id: "m17", lt: "Galite eiti pėsčiomis.",         en: "You can go on foot.",           audioText: "Galite eiti pėsčiomis" },
          { id: "m18", lt: "Galite važiuoti autobusu.",      en: "You can go by bus.",            audioText: "Galite važiuoti autobusu" },
          { id: "m19", lt: "Geros kelionės!",                en: "Have a good journey!",          audioText: "Geros kelionės" },
          { id: "m20", lt: "Tiesiai, paskui kairėn.",        en: "Straight, then left.",          audioText: "Tiesiai, paskui kairėn" },
        ],
      },
    ],
  };
}

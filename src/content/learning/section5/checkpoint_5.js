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

      // Block 3 — Build the full route question
      {
        id: "s5cp_b3",
        type: "build_phrase",
        title: "Build the route question",
        prompt: { text: "You need the station. Build the whole question: How do I get to the station?" },
        tokens: [
          { id: "t1", text: "Kaip", correctIndex: 0 },
          { id: "t2", text: "man", correctIndex: 1 },
          { id: "t3", text: "nusigauti", correctIndex: 2 },
          { id: "t4", text: "į", correctIndex: 3 },
          { id: "t5", text: "stotį?", correctIndex: 4 },
          { id: "t6", text: "viešbutį?", isDistractor: true, repairHint: "Viešbutį means the hotel as a destination. The prompt asks for the station." },
          { id: "t7", text: "vaistinę?", isDistractor: true, repairHint: "Vaistinę means the pharmacy as a destination. The prompt asks for the station." },
        ],
        answerText: "Kaip man nusigauti į stotį?",
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
  id: "s5cp_b8_v2",
  type: "scenario_v2",
  title: "Finding your hotel",
  description: "You have just left the bus station and show a local your hotel address. You need to know how to get there.",
  sceneIntro: "You have just left the bus station and show a local your hotel address. You need to know how to get there.",
  location: "street outside the bus station",
  userRole: "traveller",
  register: "polite_neutral",
  goal: "Combine destination forms, route language, distance and walking advice in one coherent exchange.",
  focus: ["Kaip man nusigauti…?", "directions", "Ar toli?", "Nesuprantu"],
  participants: [
    { id: "local", label: "Local", name: "Rasa", role: "passer-by", gender: "female", relationshipToUser: "stranger", register: "polite_neutral" },
  ],
  objects: [
    { id: "hotel", lt: "viešbutis", en: "hotel", gender: "masculine", number: "singular" },
  ],
  steps: [
    {
      id: "step_1",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Laba diena!",
      sceneDirection: "You stop a passer-by and show her the hotel address on your phone.",
      learnerPrompt: "Ask how to get to the hotel.",
      options: [
        { id: "a", text: "Laba diena! Atsiprašau, kaip man nusigauti į viešbutį?", result: "best", progresses: true },
        { id: "b", text: "Kur yra kavinė?", result: "wrong", feedback: "You are trying to reach your hotel.", progresses: false },
      
        {"id":"z","text":"Atsiprašau, kaip man nusigauti į viešbutį?","result":"acceptable","feedback":"Natural and polite without repeating the greeting.","progresses":true},
      ],
    },
    {
      id: "step_2",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Eikite tiesiai, paskui pasukite dešinėn.",
      sceneDirection: "She points straight ahead, then gestures to the right at the next junction.",
      learnerPrompt: "If you understand the route, ask whether it is far. If not, use Nesuprantu.",
      help: {
        levels: [
          { sceneDirection: "She repeats the route more slowly while pointing.", speakerText: "Tiesiai. Paskui dešinėn." },
          { sceneDirection: "She traces the route on your phone: straight, then right." },
          { speakerText: "Straight, then right.", spokenLanguage: "en", audio: false },
        ],
      },
      options: [
        { id: "a", text: "Suprantu. Ar toli?", result: "best", progresses: true },
        { id: "b", text: "Kur yra autobusų stotis?", result: "wrong", feedback: "You have already left the bus station and are asking about the hotel.", progresses: false },
      
        {"id":"z","text":"Ar toli?","result":"acceptable","feedback":"The shorter distance question is natural once the destination is clear.","progresses":true},
      ],
    },
    {
      id: "step_3",
      speakerId: "local",
      speakerLabel: "Local",
      speakerText: "Ne, netoli. Galite eiti pėsčiomis — penkios minutės.",
      sceneDirection: "She points along the short walking route.",
      learnerPrompt: "Acknowledge the advice.",
      options: [
        { id: "a", text: "Puiku! Ačiū labai.", result: "best", progresses: true },
        { id: "b", text: "Galite važiuoti autobusu?", result: "wrong", feedback: "She has just said it is only a five-minute walk.", progresses: false },
      
        {"id":"z","text":"Ačiū!","result":"acceptable","feedback":"A shorter thank-you is also natural.","progresses":true},
      ],
      finalSystemLine: { speakerId: "local", speakerLabel: "Local", speakerText: "Prašom. Geros kelionės!", sceneDirection: "She smiles and continues on her way." },
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
          { id: "m3",  lt: "Ar toli?",                   en: "Is it far?",                    audioText: "Ar toli" },
          { id: "m4",  lt: "Tai netoli.",                    en: "It's near.",                    audioText: "Tai netoli" },
          { id: "m5",  lt: "Eikite tiesiai.",                en: "Go straight ahead.",            audioText: "Eikite tiesiai" },
          { id: "m6",  lt: "Pasukite kairėn.",               en: "Turn left.",                    audioText: "Pasukite kairėn" },
          { id: "m7",  lt: "Pasukite dešinėn.",              en: "Turn right.",                   audioText: "Pasukite dešinėn" },
          { id: "m8",  lt: "autobusų stotis",                en: "bus station",                   audioText: "autobusų stotis" },
          { id: "m9",  lt: "traukinių stotis",            en: "train station",                 audioText: "traukinių stotis" },
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

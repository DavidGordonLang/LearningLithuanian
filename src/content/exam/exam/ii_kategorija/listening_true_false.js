export const listeningTrueFalse = [
  {
    id: "ii-listen-tf-001",
    title: "Skelbimas keleiviams",
    instructionLt:
      "Paklausykite teksto. Pažymėkite, kurie teiginiai yra teisingi, kurie – neteisingi.",
    audio: {
      textLt:
        "Dėmesio keleiviai. Rytojaus pirmojo autobuso į Kauną išvykimo laikas keičiasi. Vietoje septintos valandos autobusas išvyks septynios trisdešimt. Bilietus galima nusipirkti internetu arba stoties kasoje. Prašome atvykti bent dešimt minučių anksčiau.",
    },
    transcriptLt:
      "Dėmesio keleiviai. Rytojaus pirmojo autobuso į Kauną išvykimo laikas keičiasi. Vietoje septintos valandos autobusas išvyks septynios trisdešimt. Bilietus galima nusipirkti internetu arba stoties kasoje. Prašome atvykti bent dešimt minučių anksčiau.",
    questions: [
      {
        id: "q1",
        promptLt: "Pirmasis autobusas išvyks septintą valandą.",
        correctAnswer: false,
        explanationLt:
          "Pranešime sakoma, kad jis išvyks septynios trisdešimt.",
      },
      {
        id: "q2",
        promptLt: "Bilietus galima pirkti internetu.",
        correctAnswer: true,
        explanationLt: "Tai tiesiogiai pasakyta pranešime.",
      },
      {
        id: "q3",
        promptLt: "Keleivių prašoma atvykti likus bent dešimčiai minučių.",
        correctAnswer: true,
        explanationLt:
          "Pranešime prašoma atvykti bent dešimt minučių anksčiau.",
      },
    ],
    support: {
      keywords: [
        { lt: "keleivis", en: "passenger" },
        { lt: "išvykimo laikas", en: "departure time" },
        { lt: "kasa", en: "ticket office" },
        { lt: "anksčiau", en: "earlier / in advance" },
      ],
    },
  },
  {
    id: "ii-listen-tf-002",
    title: "Skelbimas sporto klube",
    instructionLt:
      "Paklausykite teksto. Pažymėkite, kurie teiginiai yra teisingi, kurie – neteisingi.",
    audio: {
      textLt:
        "Sveiki. Primename, kad šį penktadienį sporto klubas dirbs trumpiau. Baseinas bus atidarytas tik iki penktos valandos vakaro, o grupinės treniruotės nevyks. Nariai gali naudotis treniruoklių sale kaip įprasta. Atsiprašome už nepatogumus.",
    },
    transcriptLt:
      "Sveiki. Primename, kad šį penktadienį sporto klubas dirbs trumpiau. Baseinas bus atidarytas tik iki penktos valandos vakaro, o grupinės treniruotės nevyks. Nariai gali naudotis treniruoklių sale kaip įprasta. Atsiprašome už nepatogumus.",
    questions: [
      {
        id: "q1",
        promptLt: "Penktadienį baseinas veiks iki vakaro pabaigos.",
        correctAnswer: false,
        explanationLt:
          "Baseinas bus atidarytas tik iki penktos valandos vakaro.",
      },
      {
        id: "q2",
        promptLt: "Grupinės treniruotės penktadienį nevyks.",
        correctAnswer: true,
        explanationLt: "Tai tiesiogiai pasakyta pranešime.",
      },
      {
        id: "q3",
        promptLt: "Treniruoklių sale bus galima naudotis kaip įprasta.",
        correctAnswer: true,
        explanationLt:
          "Nariai gali naudotis treniruoklių sale kaip įprasta.",
      },
    ],
    support: {
      keywords: [
        { lt: "dirbs trumpiau", en: "will be open for a shorter time" },
        { lt: "baseinas", en: "swimming pool" },
        { lt: "grupinės treniruotės", en: "group classes" },
        { lt: "nepatogumai", en: "inconvenience" },
      ],
    },
  },
];
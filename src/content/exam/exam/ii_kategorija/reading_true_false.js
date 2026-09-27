export const readingTrueFalse = [
  {
    id: "ii-read-tf-001",
    title: "Marijos gimtadienio staigmena",
    instructionLt:
      "Perskaitykite tekstą. Pažymėkite, kurie teiginiai yra teisingi, kurie – neteisingi.",
    sourceText:
      "Marija šią savaitę švenčia savo šešiasdešimtąjį gimtadienį. Ji jau seniai svajojo padaryti ką nors neįprasto, todėl jos šeima nupirko dovaną – šuolį parašiutu. Marija niekada anksčiau nešoko parašiutu, bet sako, kad dabar jaučiasi drąsesnė negu jaunystėje. Po šuolio ji planuoja su artimaisiais vakarieniauti mažame restorane prie ežero.",
    questions: [
      {
        id: "q1",
        promptLt: "Marija jau daug kartų yra šokusi parašiutu.",
        correctAnswer: false,
        explanationLt:
          "Tekste sakoma, kad ji niekada anksčiau nešoko parašiutu.",
      },
      {
        id: "q2",
        promptLt: "Gimtadienio dovaną Marijai nupirko šeima.",
        correctAnswer: true,
        explanationLt:
          "Tekste tiesiogiai parašyta, kad šeima nupirko šuolį parašiutu.",
      },
      {
        id: "q3",
        promptLt: "Po šuolio Marija važiuos ilsėtis prie jūros.",
        correctAnswer: false,
        explanationLt:
          "Po šuolio ji planuoja vakarieniauti restorane prie ežero, ne prie jūros.",
      },
    ],
    support: {
      keywords: [
        { lt: "gimtadienis", en: "birthday" },
        { lt: "šuolis parašiutu", en: "parachute jump" },
        { lt: "drąsesnė", en: "braver" },
        { lt: "artimieji", en: "close family" },
      ],
    },
  },
  {
    id: "ii-read-tf-002",
    title: "Bibliotekos darbo laikas",
    instructionLt:
      "Perskaitykite tekstą. Pažymėkite, kurie teiginiai yra teisingi, kurie – neteisingi.",
    sourceText:
      "Miestelio biblioteka nuo kitos savaitės keičia darbo laiką. Pirmadieniais ir trečiadieniais biblioteka dirbs nuo devintos valandos ryto iki šeštos valandos vakaro. Antradieniais lankytojai bus priimami tik iki pietų, nes po pietų vyks darbuotojų mokymai. Šeštadienį biblioteka bus uždaryta, tačiau sekmadienį joje vyks nemokamas knygų mainų renginys.",
    questions: [
      {
        id: "q1",
        promptLt: "Antradienį biblioteka dirbs visą dieną.",
        correctAnswer: false,
        explanationLt:
          "Tekste parašyta, kad antradienį lankytojai bus priimami tik iki pietų.",
      },
      {
        id: "q2",
        promptLt: "Sekmadienį bibliotekoje planuojamas knygų mainų renginys.",
        correctAnswer: true,
        explanationLt: "Tai nurodyta paskutiniame sakinyje.",
      },
      {
        id: "q3",
        promptLt: "Pirmadienį biblioteka pradės darbą devintą valandą.",
        correctAnswer: true,
        explanationLt:
          "Pirmadieniais biblioteka dirbs nuo devintos valandos ryto.",
      },
    ],
    support: {
      keywords: [
        { lt: "darbo laikas", en: "opening hours" },
        { lt: "iki pietų", en: "until noon" },
        { lt: "mokymai", en: "training" },
        { lt: "mainų renginys", en: "exchange event" },
      ],
    },
  },
];
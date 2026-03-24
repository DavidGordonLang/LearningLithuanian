// src/constants/countries.js

/**
 * Country dataset for learner profile + lesson personalisation.
 *
 * Design:
 * - `code` is the stable stored value in settings.
 * - `labels` are source-language UI labels.
 * - `lt` contains Lithuanian forms used by lessons.
 *
 * This is intentionally structured for future source-language expansion.
 * Today we only expose English labels in the UI.
 */

export const COUNTRIES = [
  {
    code: "australia",
    labels: { en: "Australia" },
    lt: { nominative: "Australija", genitive: "Australijos", locative: "Australijoje" },
  },
  {
    code: "austria",
    labels: { en: "Austria" },
    lt: { nominative: "Austrija", genitive: "Austrijos", locative: "Austrijoje" },
  },
  {
    code: "belarus",
    labels: { en: "Belarus" },
    lt: { nominative: "Baltarusija", genitive: "Baltarusijos", locative: "Baltarusijoje" },
  },
  {
    code: "belgium",
    labels: { en: "Belgium" },
    lt: { nominative: "Belgija", genitive: "Belgijos", locative: "Belgijoje" },
  },
  {
    code: "bosnia_herzegovina",
    labels: { en: "Bosnia and Herzegovina" },
    lt: {
      nominative: "Bosnija ir Hercegovina",
      genitive: "Bosnijos ir Hercegovinos",
      locative: "Bosnijoje ir Hercegovinoje",
    },
  },
  {
    code: "brazil",
    labels: { en: "Brazil" },
    lt: { nominative: "Brazilija", genitive: "Brazilijos", locative: "Brazilijoje" },
  },
  {
    code: "bulgaria",
    labels: { en: "Bulgaria" },
    lt: { nominative: "Bulgarija", genitive: "Bulgarijos", locative: "Bulgarijoje" },
  },
  {
    code: "canada",
    labels: { en: "Canada" },
    lt: { nominative: "Kanada", genitive: "Kanados", locative: "Kanadoje" },
  },
  {
    code: "chile",
    labels: { en: "Chile" },
    lt: { nominative: "Čilė", genitive: "Čilės", locative: "Čilėje" },
  },
  {
    code: "china",
    labels: { en: "China" },
    lt: { nominative: "Kinija", genitive: "Kinijos", locative: "Kinijoje" },
  },
  {
    code: "croatia",
    labels: { en: "Croatia" },
    lt: { nominative: "Kroatija", genitive: "Kroatijos", locative: "Kroatijoje" },
  },
  {
    code: "cyprus",
    labels: { en: "Cyprus" },
    lt: { nominative: "Kipras", genitive: "Kipro", locative: "Kipre" },
  },
  {
    code: "czech_republic",
    labels: { en: "Czech Republic" },
    lt: { nominative: "Čekija", genitive: "Čekijos", locative: "Čekijoje" },
  },
  {
    code: "denmark",
    labels: { en: "Denmark" },
    lt: { nominative: "Danija", genitive: "Danijos", locative: "Danijoje" },
  },
  {
    code: "egypt",
    labels: { en: "Egypt" },
    lt: { nominative: "Egiptas", genitive: "Egipto", locative: "Egipte" },
  },
  {
    code: "england",
    labels: { en: "England" },
    lt: { nominative: "Anglija", genitive: "Anglijos", locative: "Anglijoje" },
  },
  {
    code: "estonia",
    labels: { en: "Estonia" },
    lt: { nominative: "Estija", genitive: "Estijos", locative: "Estijoje" },
  },
  {
    code: "finland",
    labels: { en: "Finland" },
    lt: { nominative: "Suomija", genitive: "Suomijos", locative: "Suomijoje" },
  },
  {
    code: "france",
    labels: { en: "France" },
    lt: { nominative: "Prancūzija", genitive: "Prancūzijos", locative: "Prancūzijoje" },
  },
  {
    code: "germany",
    labels: { en: "Germany" },
    lt: { nominative: "Vokietija", genitive: "Vokietijos", locative: "Vokietijoje" },
  },
  {
    code: "greece",
    labels: { en: "Greece" },
    lt: { nominative: "Graikija", genitive: "Graikijos", locative: "Graikijoje" },
  },
  {
    code: "hungary",
    labels: { en: "Hungary" },
    lt: { nominative: "Vengrija", genitive: "Vengrijos", locative: "Vengrijoje" },
  },
  {
    code: "iceland",
    labels: { en: "Iceland" },
    lt: { nominative: "Islandija", genitive: "Islandijos", locative: "Islandijoje" },
  },
  {
    code: "india",
    labels: { en: "India" },
    lt: { nominative: "Indija", genitive: "Indijos", locative: "Indijoje" },
  },
  {
    code: "indonesia",
    labels: { en: "Indonesia" },
    lt: { nominative: "Indonezija", genitive: "Indonezijos", locative: "Indonezijoje" },
  },
  {
    code: "ireland",
    labels: { en: "Ireland" },
    lt: { nominative: "Airija", genitive: "Airijos", locative: "Airijoje" },
  },
  {
    code: "italy",
    labels: { en: "Italy" },
    lt: { nominative: "Italija", genitive: "Italijos", locative: "Italijoje" },
  },
  {
    code: "japan",
    labels: { en: "Japan" },
    lt: { nominative: "Japonija", genitive: "Japonijos", locative: "Japonijoje" },
  },
  {
    code: "kenya",
    labels: { en: "Kenya" },
    lt: { nominative: "Kenija", genitive: "Kenijos", locative: "Kenijoje" },
  },
  {
    code: "latvia",
    labels: { en: "Latvia" },
    lt: { nominative: "Latvija", genitive: "Latvijos", locative: "Latvijoje" },
  },
  {
    code: "lithuania",
    labels: { en: "Lithuania" },
    lt: { nominative: "Lietuva", genitive: "Lietuvos", locative: "Lietuvoje" },
  },
  {
    code: "luxembourg",
    labels: { en: "Luxembourg" },
    lt: { nominative: "Liuksemburgas", genitive: "Liuksemburgo", locative: "Liuksemburge" },
  },
  {
    code: "malaysia",
    labels: { en: "Malaysia" },
    lt: { nominative: "Malaizija", genitive: "Malaizijos", locative: "Malaizijoje" },
  },
  {
    code: "mexico",
    labels: { en: "Mexico" },
    lt: { nominative: "Meksika", genitive: "Meksikos", locative: "Meksikoje" },
  },
  {
    code: "moldova",
    labels: { en: "Moldova" },
    lt: { nominative: "Moldova", genitive: "Moldovos", locative: "Moldovoje" },
  },
  {
    code: "morocco",
    labels: { en: "Morocco" },
    lt: { nominative: "Marokas", genitive: "Maroko", locative: "Maroke" },
  },
  {
    code: "netherlands",
    labels: { en: "Netherlands" },
    lt: { nominative: "Nyderlandai", genitive: "Nyderlandų", locative: "Nyderlanduose" },
  },
  {
    code: "new_zealand",
    labels: { en: "New Zealand" },
    lt: {
      nominative: "Naujoji Zelandija",
      genitive: "Naujosios Zelandijos",
      locative: "Naujojoje Zelandijoje",
    },
  },
  {
    code: "nigeria",
    labels: { en: "Nigeria" },
    lt: { nominative: "Nigerija", genitive: "Nigerijos", locative: "Nigerijoje" },
  },
  {
    code: "north_macedonia",
    labels: { en: "North Macedonia" },
    lt: {
      nominative: "Šiaurės Makedonija",
      genitive: "Šiaurės Makedonijos",
      locative: "Šiaurės Makedonijoje",
    },
  },
  {
    code: "northern_ireland",
    labels: { en: "Northern Ireland" },
    lt: {
      nominative: "Šiaurės Airija",
      genitive: "Šiaurės Airijos",
      locative: "Šiaurės Airijoje",
    },
  },
  {
    code: "norway",
    labels: { en: "Norway" },
    lt: { nominative: "Norvegija", genitive: "Norvegijos", locative: "Norvegijoje" },
  },
  {
    code: "pakistan",
    labels: { en: "Pakistan" },
    lt: { nominative: "Pakistanas", genitive: "Pakistano", locative: "Pakistane" },
  },
  {
    code: "philippines",
    labels: { en: "Philippines" },
    lt: { nominative: "Filipinai", genitive: "Filipinų", locative: "Filipinuose" },
  },
  {
    code: "poland",
    labels: { en: "Poland" },
    lt: { nominative: "Lenkija", genitive: "Lenkijos", locative: "Lenkijoje" },
  },
  {
    code: "portugal",
    labels: { en: "Portugal" },
    lt: { nominative: "Portugalija", genitive: "Portugalijos", locative: "Portugalijoje" },
  },
  {
    code: "romania",
    labels: { en: "Romania" },
    lt: { nominative: "Rumunija", genitive: "Rumunijos", locative: "Rumunijoje" },
  },
  {
    code: "scotland",
    labels: { en: "Scotland" },
    lt: { nominative: "Škotija", genitive: "Škotijos", locative: "Škotijoje" },
  },
  {
    code: "serbia",
    labels: { en: "Serbia" },
    lt: { nominative: "Serbija", genitive: "Serbijos", locative: "Serbijoje" },
  },
  {
    code: "singapore",
    labels: { en: "Singapore" },
    lt: { nominative: "Singapūras", genitive: "Singapūro", locative: "Singapūre" },
  },
  {
    code: "slovakia",
    labels: { en: "Slovakia" },
    lt: { nominative: "Slovakija", genitive: "Slovakijos", locative: "Slovakijoje" },
  },
  {
    code: "slovenia",
    labels: { en: "Slovenia" },
    lt: { nominative: "Slovėnija", genitive: "Slovėnijos", locative: "Slovėnijoje" },
  },
  {
    code: "south_africa",
    labels: { en: "South Africa" },
    lt: {
      nominative: "Pietų Afrika",
      genitive: "Pietų Afrikos",
      locative: "Pietų Afrikoje",
    },
  },
  {
    code: "south_korea",
    labels: { en: "South Korea" },
    lt: {
      nominative: "Pietų Korėja",
      genitive: "Pietų Korėjos",
      locative: "Pietų Korėjoje",
    },
  },
  {
    code: "spain",
    labels: { en: "Spain" },
    lt: { nominative: "Ispanija", genitive: "Ispanijos", locative: "Ispanijoje" },
  },
  {
    code: "sweden",
    labels: { en: "Sweden" },
    lt: { nominative: "Švedija", genitive: "Švedijos", locative: "Švedijoje" },
  },
  {
    code: "switzerland",
    labels: { en: "Switzerland" },
    lt: { nominative: "Šveicarija", genitive: "Šveicarijos", locative: "Šveicarijoje" },
  },
  {
    code: "thailand",
    labels: { en: "Thailand" },
    lt: { nominative: "Tailandas", genitive: "Tailando", locative: "Tailande" },
  },
  {
    code: "turkey",
    labels: { en: "Turkey" },
    lt: { nominative: "Turkija", genitive: "Turkijos", locative: "Turkijoje" },
  },
  {
    code: "ukraine",
    labels: { en: "Ukraine" },
    lt: { nominative: "Ukraina", genitive: "Ukrainos", locative: "Ukrainoje" },
  },
  {
    code: "united_kingdom",
    labels: { en: "United Kingdom" },
    lt: {
      nominative: "Jungtinė Karalystė",
      genitive: "Jungtinės Karalystės",
      locative: "Jungtinėje Karalystėje",
    },
  },
  {
    code: "united_states",
    labels: { en: "United States" },
    lt: {
      nominative: "Jungtinės Amerikos Valstijos",
      genitive: "Jungtinių Amerikos Valstijų",
      locative: "Jungtinėse Amerikos Valstijose",
    },
  },
  {
    code: "vietnam",
    labels: { en: "Vietnam" },
    lt: { nominative: "Vietnamas", genitive: "Vietnamo", locative: "Vietname" },
  },
  {
    code: "wales",
    labels: { en: "Wales" },
    lt: { nominative: "Velsas", genitive: "Velso", locative: "Velse" },
  },
];

export const COUNTRY_OPTIONS_EN = [...COUNTRIES]
  .map((country) => ({
    value: country.code,
    label: country.labels.en,
  }))
  .sort((a, b) => a.label.localeCompare(b.label, "en"));

export function getCountryByCode(code) {
  return COUNTRIES.find((country) => country.code === code) || null;
}

export function getCountryLabel(code, sourceLang = "en") {
  const country = getCountryByCode(code);
  if (!country) return "";
  return country.labels?.[sourceLang] || country.labels?.en || "";
}

export function getCountryLithuanianForms(code) {
  const country = getCountryByCode(code);
  return country?.lt || null;
}

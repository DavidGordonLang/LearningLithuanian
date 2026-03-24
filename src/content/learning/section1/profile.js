// src/content/learning/section1/profile.js

import {
  getCountryLabel,
  getCountryLithuanianForms,
} from "../../../constants/countries";

const FALLBACK_NAME = "Davidas";

const FALLBACK_FROM_COUNTRY_CODE = "scotland";
const FALLBACK_FROM_LABEL_EN = "Scotland";
const FALLBACK_FROM_GENITIVE = "Škotijos";
const FALLBACK_FROM_PHRASE = `Aš esu iš ${FALLBACK_FROM_GENITIVE}`;

const FALLBACK_LIVES_IN_COUNTRY_CODE = "lithuania";
const FALLBACK_LIVES_IN_LABEL_EN = "Lithuania";
const FALLBACK_LIVES_IN_LOCATIVE = "Lietuvoje";

function cleanName(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function buildSection1Profile({
  userName,
  fromCountryCode,
  livesInCountryCode,
} = {}) {
  const userNameSafe = cleanName(userName) || FALLBACK_NAME;

  const userFromCountryCode =
    String(fromCountryCode || "").trim() || FALLBACK_FROM_COUNTRY_CODE;
  const fromForms = getCountryLithuanianForms(userFromCountryCode);
  const userFromCountryLtGenitive = fromForms?.genitive || FALLBACK_FROM_GENITIVE;
  const userFromCountryLabelEn =
    getCountryLabel(userFromCountryCode, "en") || FALLBACK_FROM_LABEL_EN;
  const userFromPhrase = `Aš esu iš ${userFromCountryLtGenitive}`;

  const userLivesInCountryCode =
    String(livesInCountryCode || "").trim() || FALLBACK_LIVES_IN_COUNTRY_CODE;
  const livesInForms = getCountryLithuanianForms(userLivesInCountryCode);
  const userLivesInCountryLtLocative =
    livesInForms?.locative || FALLBACK_LIVES_IN_LOCATIVE;
  const userLivesInCountryLabelEn =
    getCountryLabel(userLivesInCountryCode, "en") || FALLBACK_LIVES_IN_LABEL_EN;

  return {
    userNameSafe,

    userFromCountryCode,
    userFromCountryLabelEn,
    userFromCountryLtGenitive,
    userFromPhrase,

    userLivesInCountryCode,
    userLivesInCountryLabelEn,
    userLivesInCountryLtLocative,

    fallbackFromPhrase: FALLBACK_FROM_PHRASE,
  };
}

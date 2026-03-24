// src/content/learning/section1/profile.js

import { getCountryLithuanianForms } from "../../../constants/countries";

const FALLBACK_NAME = "Davidas";
const FALLBACK_FROM_COUNTRY_CODE = "scotland";
const FALLBACK_FROM_GENITIVE = "Škotijos";
const FALLBACK_FROM_PHRASE = `Aš esu iš ${FALLBACK_FROM_GENITIVE}`;

function cleanName(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function buildSection1Profile({ userName, fromCountryCode } = {}) {
  const userNameSafe = cleanName(userName) || FALLBACK_NAME;
  const userFromCountryCode = String(fromCountryCode || "").trim() || FALLBACK_FROM_COUNTRY_CODE;

  const fromForms = getCountryLithuanianForms(userFromCountryCode);
  const userFromCountryLtGenitive = fromForms?.genitive || FALLBACK_FROM_GENITIVE;
  const userFromPhrase = `Aš esu iš ${userFromCountryLtGenitive}`;

  return {
    userNameSafe,
    userFromCountryCode,
    userFromCountryLtGenitive,
    userFromPhrase,
  };
}

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

const FALLBACK_AGE = 30;
const FALLBACK_AGE_PHRASE_LT = "Man trisdešimt metų";
const FALLBACK_AGE_PHRASE_EN = "I am 30 years old";

// ─── Lithuanian number → age phrase ──────────────────────────────────────────
// Covers ages 1–99 using vocabulary taught in Section 3.1.
// Ages are expressed as "Man [number] metų" — a fixed chunk taught in 3.4.
// Note: Lithuanian grammar varies metų/metai by number, but for pedagogical
// consistency with the "learn as chunks" approach we use metų throughout.
// Native speakers understand all forms — learners say their age as a chunk.

const LT_ONES  = ["", "vienas", "du", "trys", "keturi", "penki", "šeši", "septyni", "aštuoni", "devyni"];
const LT_TEENS = ["dešimt", "vienuolika", "dvylika", "trylika", "keturiolika", "penkiolika", "šešiolika", "septyniolika", "aštuoniolika", "devyniolika"];
const LT_TENS  = ["", "", "dvidešimt", "trisdešimt", "keturiasdešimt", "penkiasdešimt", "šešiasdešimt", "septyniasdešimt", "aštuoniasdešimt", "devyniasdešimt"];

function ltAgeNumber(n) {
  if (!n || n < 1 || n > 99) return null;
  if (n < 10) return LT_ONES[n];
  if (n < 20) return LT_TEENS[n - 10];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? LT_TENS[tens] : `${LT_TENS[tens]} ${LT_ONES[ones]}`;
}

function ageFromDob(dob) {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const today = new Date();
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 1 && age <= 99 ? age : null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanName(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function buildSection1Profile({
  userName,
  fromCountryCode,
  livesInCountryCode,
  dateOfBirth,
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

  // Age
  const userAgeYears = ageFromDob(dateOfBirth) || FALLBACK_AGE;
  const ltNum = ltAgeNumber(userAgeYears);
  const userAgePhraseLt = ltNum ? `Man ${ltNum} metų` : FALLBACK_AGE_PHRASE_LT;
  const userAgePhraseEn = `I am ${userAgeYears} years old`;

  return {
    userNameSafe,

    userFromCountryCode,
    userFromCountryLabelEn,
    userFromCountryLtGenitive,
    userFromPhrase,

    userLivesInCountryCode,
    userLivesInCountryLabelEn,
    userLivesInCountryLtLocative,

    userAgeYears,
    userAgePhraseLt,
    userAgePhraseEn,

    fallbackFromPhrase: FALLBACK_FROM_PHRASE,
  };
}

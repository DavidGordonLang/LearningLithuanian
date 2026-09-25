// src/content/learning/section1/profile.js

import {
  getCountryLabel,
  getCountryLithuanianForms,
} from "../../../constants/countries.js";

const FALLBACK_NAME = "Davidas";

const FALLBACK_FROM_COUNTRY_CODE = "scotland";
const FALLBACK_FROM_LABEL_EN = "Scotland";
const FALLBACK_FROM_GENITIVE = "Škotijos";
const FALLBACK_FROM_PHRASE = `Aš esu iš ${FALLBACK_FROM_GENITIVE}`;

const FALLBACK_LIVES_IN_COUNTRY_CODE = "lithuania";
const FALLBACK_LIVES_IN_LABEL_EN = "Lithuania";
const FALLBACK_LIVES_IN_LOCATIVE = "Lietuvoje";

const FALLBACK_AGE = 30;

// ─── Lithuanian number → age phrase ──────────────────────────────────────────
// Bounded age model, 1–99. Metai is plural: use vieni/dveji/.../devyneri
// for units (including compound ages), but metų after 10–19 and exact tens.
// The forms agree with years, not the speaker's gender.
// Source: R. Jezukevičienė, Lithuanian Grammar: Paradigms, pp. 14, 21, 25.
// https://portalcris.lsmuni.lt/server/api/core/bitstreams/3fc7cc3b-76bd-49a2-85f0-511838d6e210/content
const LT_AGE_UNITS = ["", "vieni", "dveji", "treji", "ketveri", "penkeri", "šešeri", "septyneri", "aštuoneri", "devyneri"];
const LT_TEENS = ["dešimt", "vienuolika", "dvylika", "trylika", "keturiolika", "penkiolika", "šešiolika", "septyniolika", "aštuoniolika", "devyniolika"];
const LT_TENS  = ["", "", "dvidešimt", "trisdešimt", "keturiasdešimt", "penkiasdešimt", "šešiasdešimt", "septyniasdešimt", "aštuoniasdešimt", "devyniasdešimt"];

function ltAgeNumber(n) {
  if (!Number.isInteger(n) || n < 1 || n > 99) return null;
  if (n < 10) return LT_AGE_UNITS[n];
  if (n < 20) return LT_TEENS[n - 10];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? LT_TENS[tens] : `${LT_TENS[tens]} ${LT_AGE_UNITS[ones]}`;
}

function ageFromDob(dob, today) {
  if (typeof dob !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dob) || !Number.isFinite(today.getTime())) return null;
  const [year, month, day] = dob.split("-").map(Number);
  // A DOB is a calendar date, not a UTC instant. Validate without timezone
  // conversion or Date's rollover (e.g. 2023-02-29 must not become March 1).
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) return null;
  let age = today.getFullYear() - year;
  const currentMonth = today.getMonth() + 1;
  // February 29 birthdays advance on March 1 in non-leap years, as before.
  if (currentMonth < month || (currentMonth === month && today.getDate() < day)) age--;
  return age >= 1 && age <= 99 ? age : null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanName(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function buildSection1Profile({
  userName,
  speakerGender,
  fromCountryCode,
  livesInCountryCode,
  dateOfBirth,
} = {}, today = new Date()) {
  const userNameSafe = cleanName(userName) || FALLBACK_NAME;
  const safeSpeakerGender = speakerGender === "female" ? "female" : "male";

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
  const userAgeYears = ageFromDob(dateOfBirth, today) || FALLBACK_AGE;
  const ltNum = ltAgeNumber(userAgeYears);
  const usesMetu = (userAgeYears >= 10 && userAgeYears < 20) || userAgeYears % 10 === 0;
  const yearsWord = usesMetu ? "metų" : "metai";
  const userAgePhraseLt = `Man ${ltNum} ${yearsWord}`;
  const userAgePhraseEn = `I am ${userAgeYears} ${userAgeYears === 1 ? "year" : "years"} old`;

  return {
    userNameSafe,
    speakerGender: safeSpeakerGender,

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

import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { buildSection1Profile } from "../src/content/learning/section1/profile.js";
import createModule34 from "../src/content/learning/section3/module_3_4.js";
import { phraseMatchesSpeech } from "../src/lib/speechMatch.js";

const today = new Date(2026, 8, 25, 12);
const profileForAge = (age, speakerGender = "male") => buildSection1Profile({
  userName: speakerGender === "male" ? "Davidas" : "Barbora",
  speakerGender, dateOfBirth: `${2026 - age}-09-25`,
}, today);

// Independent native-review examples, not copied from the generator's tables.
const fixtures = new Map([
  [1, "vieni metai"], [2, "dveji metai"], [3, "treji metai"], [4, "ketveri metai"],
  [5, "penkeri metai"], [6, "šešeri metai"], [7, "septyneri metai"], [8, "aštuoneri metai"], [9, "devyneri metai"],
  [10, "dešimt metų"], [11, "vienuolika metų"], [12, "dvylika metų"], [13, "trylika metų"],
  [14, "keturiolika metų"], [15, "penkiolika metų"], [16, "šešiolika metų"],
  [17, "septyniolika metų"], [18, "aštuoniolika metų"], [19, "devyniolika metų"],
  [20, "dvidešimt metų"], [21, "dvidešimt vieni metai"], [25, "dvidešimt penkeri metai"],
  [28, "dvidešimt aštuoneri metai"], [30, "trisdešimt metų"], [40, "keturiasdešimt metų"],
  [45, "keturiasdešimt penkeri metai"], [50, "penkiasdešimt metų"],
  [60, "šešiasdešimt metų"], [99, "devyniasdešimt devyneri metai"],
]);

test("actual runtime profile builder produces the attested age families for both speaker genders", () => {
  for (const [age, expected] of fixtures) for (const gender of ["male", "female"]) {
    const profile = profileForAge(age, gender);
    assert.equal(profile.userAgeYears, age);
    assert.equal(profile.speakerGender, gender);
    assert.equal(profile.userAgePhraseLt, `Man ${expected}`, `${gender} age ${age}`);
    assert.equal(profile.userAgePhraseEn, `I am ${age} ${age === 1 ? "year" : "years"} old`);
  }
});

test("all supported runtime ages reach teaching, speaking and dialogue without a duplicate age Learn card", () => {
  for (let age = 1; age <= 99; age++) {
    const profile = profileForAge(age);
    const lesson = createModule34(profile).lessons.find(l => l.code === "3.4.1");
    const speakIndex = lesson.blocks.findIndex(b => b.id === "s3m4l1_b4b");
    const anchorIndex = lesson.blocks.findIndex(b => b.type === "learn" && b.items.some(i => i.lt === profile.userAgePhraseLt && i.audioText === i.lt));
    assert.ok(anchorIndex >= 0 && anchorIndex < speakIndex, `age ${age} taught before production`);
    const items = lesson.blocks[anchorIndex].items;
    assert.equal(new Set(items.map(i => i.lt)).size, items.length, `age ${age} unique Learn cards`);
    assert.equal(lesson.blocks[speakIndex].targetText, profile.userAgePhraseLt);
    assert.equal(lesson.blocks[speakIndex].audioText, profile.userAgePhraseLt);
    assert.ok(lesson.notes.usage.some(line => line.includes(`Your age: ${profile.userAgePhraseLt}`)));
    const scenario = lesson.blocks.find(b => b.type === "scenario_v2");
    assert.equal(scenario.steps[0].options.find(o => o.result === "best").text, `${profile.userAgePhraseLt}. O jums?`);
    assert.equal(scenario.steps[1].speakerText, "Man dvidešimt aštuoneri metai.");
  }
});

test("DOB birthdays, year changes and leap days use calendar dates", () => {
  const cases = [
    ["1981-09-25", [2026, 8, 24], 44], ["1981-09-25", [2026, 8, 25], 45], ["1981-09-25", [2026, 8, 26], 45],
    ["2000-01-01", [2025, 11, 31], 25], ["2000-01-01", [2026, 0, 1], 26],
    ["2000-02-29", [2024, 1, 28], 23], ["2000-02-29", [2024, 1, 29], 24],
    ["2000-02-29", [2025, 1, 28], 24], ["2000-02-29", [2025, 2, 1], 25],
    ["2025-09-25", [2026, 8, 24], 30], ["2025-09-25", [2026, 8, 25], 1],
    ["1926-09-25", [2026, 8, 24], 99], ["1926-09-25", [2026, 8, 25], 30],
  ];
  for (const [dateOfBirth, date, age] of cases) {
    assert.equal(buildSection1Profile({ dateOfBirth }, new Date(...date)).userAgeYears, age, `${dateOfBirth}, ${date}`);
  }
});

test("missing, malformed, impossible and out-of-range DOBs retain the safe age-30 fallback", () => {
  for (const dateOfBirth of [undefined, "", "bad", "2000-2-2", "2023-02-29", "1900-02-29", "2000-04-31", "2000-00-01", "2000-13-01", "2000-01-00", "2000-01-32", "2027-01-01", "2026-09-25", "1900-01-01"]) {
    assert.equal(buildSection1Profile({ dateOfBirth }, today).userAgePhraseLt, "Man trisdešimt metų", String(dateOfBirth));
  }
});

test("DOB midnight and live default clock work in timezones on either side of UTC", () => {
  const url = new URL("../src/content/learning/section1/profile.js", import.meta.url).href;
  const script = `import { buildSection1Profile as build } from ${JSON.stringify(url)};
    const today = new Date();
    const dob = [today.getFullYear()-25, String(today.getMonth()+1).padStart(2,'0'), String(today.getDate()).padStart(2,'0')].join('-');
    console.log(JSON.stringify([build({dateOfBirth:'1981-09-25'},new Date(2026,8,24,23,59)).userAgeYears, build({dateOfBirth:'1981-09-25'},new Date(2026,8,25,0,0)).userAgeYears,build({dateOfBirth:dob}).userAgeYears]));`;
  for (const TZ of ["UTC", "America/Los_Angeles", "Europe/Vilnius", "Pacific/Kiritimati"]) {
    assert.deepEqual(JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", script], { env: { ...process.env, TZ }, encoding: "utf8" })), [44,45,25], TZ);
  }
});

test("numeric STT accepts every runtime age and rejects every other supported age, in digits or words", () => {
  const profiles = Array.from({ length: 99 }, (_, i) => profileForAge(i + 1));
  for (const target of profiles) {
    const years = target.userAgePhraseLt.split(" ").at(-1);
    assert.equal(phraseMatchesSpeech(`Man ${target.userAgeYears} ${years}`, target.userAgePhraseLt), true);
    assert.equal(phraseMatchesSpeech(target.userAgePhraseLt, target.userAgePhraseLt), true);
    for (const heard of profiles) if (heard.userAgeYears !== target.userAgeYears) {
      assert.equal(phraseMatchesSpeech(`Man ${heard.userAgeYears} ${years}`, target.userAgePhraseLt), false, `numeric ${heard.userAgeYears} vs ${target.userAgeYears}`);
      assert.equal(phraseMatchesSpeech(heard.userAgePhraseLt, target.userAgePhraseLt), false, `spoken ${heard.userAgeYears} vs ${target.userAgeYears}`);
    }
  }
  assert.equal(phraseMatchesSpeech("Man keturiasdešimt šešeri metai", "Man keturiasdešimt septyneri metai"), false);
  assert.equal(phraseMatchesSpeech("Man 45 46 metai", profileForAge(45).userAgePhraseLt), false);
  assert.equal(phraseMatchesSpeech("Man 145 metai", profileForAge(45).userAgePhraseLt), false);
  assert.equal(phraseMatchesSpeech("45", profileForAge(45).userAgePhraseLt), false);
});

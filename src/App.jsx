import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lithuanian Trainer — App.jsx (Full Replace)
 * - Tabs: Phrases / Questions / Words / Numbers
 * - Search + sort (RAG / Newest / Oldest)
 * - RAG chips (mobile) + tri-column (wide)
 * - TTS: Azure primary + Browser fallback
 * - Long-press for slow audio (no duplicate plays)
 * - Quiz with promote/demote rules + XP/Level + streak
 * - Library: JSON import/clear, starter packs, duplicate finder
 * - EN↔LT UI swap
 */

/* =========================
   Constants & LocalStorage
   ========================= */
const COLS = [
  "English",
  "Lithuanian",
  "Phonetic",
  "Category",
  "Usage",
  "Notes",
  "RAG Icon",
  "Sheet",
];

const LS_KEY = "lt_phrasebook_v3";
const LSK_TTS_PROVIDER = "lt_tts_provider";
const LSK_AZURE_KEY = "lt_azure_key";
const LSK_AZURE_REGION = "lt_azure_region";
const LSK_AZURE_VOICE = "lt_azure_voice";
const LSK_STREAK = "lt_quiz_streak_v1";
const LSK_XP = "lt_xp_v1";
const LSK_SORT = "lt_sort_v1";
const LSK_DIR = "lt_direction_v1";

const STARTERS = {
  EN2LT: "/data/starter_en_to_lt.json",
  LT2EN: "/data/starter_lt_to_en.json",
  NUMBERS: "/data/starter_numbers.json", // ensure this file exists in /public/data
};

const LEVEL_STEP = 2500;
const XP_PER_CORRECT = 50;

/* =========================
   UI Strings
   ========================= */
const STR = {
  EN2LT: {
    appTitle1: "Lithuanian",
    appTitle2: "Trainer",
    subtitle: "Tap to play. Long-press to savour.",
    navHome: "Home",
    navLibrary: "Library",
    navSettings: "Settings",
    startQuiz: "Start Quiz",
    search: "Search…",
    sort: "Sort:",
    newest: "Newest",
    oldest: "Oldest",
    rag: "RAG",
    streak: "Streak",
    level: "Level",
    phrases: "Phrases",
    questions: "Questions",
    words: "Words",
    numbers: "Numbers",
    showDetails: "Show details",
    hideDetails: "Hide details",
    edit: "Edit",
    delete: "Delete",
    addEntry: "+ Add entry",
    english: "English",
    lithuanian: "Lithuanian",
    phonetic: "Phonetic",
    category: "Category",
    usage: "Usage",
    notes: "Notes",
    ragLabel: "RAG",
    sheet: "Sheet",
    save: "Save",
    cancel: "Cancel",
    browserVoice: "Browser (fallback)",
    azure: "Azure Speech",
    subKey: "Subscription Key",
    region: "Region",
    voice: "Voice",
    fetchVoices: "Fetch voices",
    choose: "— choose —",
    direction: "Direction",
    en2lt: "EN → LT",
    lt2en: "LT → EN",
    settings: "Settings",
    libraryTitle: "Library",
    installEN: "Install EN→LT starter",
    installLT: "Install LT→EN starter",
    installNums: "Install Numbers pack",
    importJSON: "Import JSON",
    clearAll: "Clear library",
    confirm: "Are you sure?",
    dupFinder: "Duplicate finder",
    scan: "Scan duplicates",
    exactGroups: "Exact duplicates",
    closeMatches: "Close matches",
    removeSelected: "Remove selected",
    similarity: "Similarity",
    prompt: "Prompt",
    chooseLT: "Choose the Lithuanian",
    correct: "Correct!",
    notQuite: "Not quite.",
    nextQuestion: "Next Question",
    score: "Score",
    done: "Done",
    retry: "Retry",
  },
  LT2EN: {
    appTitle1: "Anglų",
    appTitle2: "kalbos treniruoklis",
    subtitle: "Paliesk, kad klausytum. Ilgai spausk – lėčiau.",
    navHome: "Pagrindinis",
    navLibrary: "Biblioteka",
    navSettings: "Nustatymai",
    startQuiz: "Pradėti viktoriną",
    search: "Paieška…",
    sort: "Rūšiuoti:",
    newest: "Naujausi",
    oldest: "Seniausi",
    rag: "RAG",
    streak: "Serija",
    level: "Lygis",
    phrases: "Frazės",
    questions: "Klausimai",
    words: "Žodžiai",
    numbers: "Skaičiai",
    showDetails: "Rodyti informaciją",
    hideDetails: "Slėpti informaciją",
    edit: "Redaguoti",
    delete: "Šalinti",
    addEntry: "+ Pridėti įrašą",
    english: "Angliškai",
    lithuanian: "Lietuviškai",
    phonetic: "Tarimas",
    category: "Kategorija",
    usage: "Panaudojimas",
    notes: "Pastabos",
    ragLabel: "RAG",
    sheet: "Skiltis",
    save: "Išsaugoti",
    cancel: "Atšaukti",
    browserVoice: "Naršyklė (atsarginis)",
    azure: "Azure kalba",
    subKey: "Prenumeratos raktas",
    region: "Regionas",
    voice: "Balsas",
    fetchVoices: "Gauti balsus",
    choose: "— pasirinkite —",
    direction: "Kryptis",
    en2lt: "EN → LT",
    lt2en: "LT → EN",
    settings: "Nustatymai",
    libraryTitle: "Biblioteka",
    installEN: "Įdiegti EN→LT pradžią",
    installLT: "Įdiegti LT→EN pradžią",
    installNums: "Įdiegti skaičių paketą",
    importJSON: "Importuoti JSON",
    clearAll: "Išvalyti",
    confirm: "Ar tikrai?",
    dupFinder: "Dublikatų paieška",
    scan: "Skenuoti dublius",
    exactGroups: "Tikslūs dublikatai",
    closeMatches: "Artimi atitikmenys",
    removeSelected: "Šalinti pasirinktus",
    similarity: "Panašumas",
    prompt: "Užklausa",
    chooseLT: "Pasirinkite lietuvišką",
    correct: "Teisingai!",
    notQuite: "Ne visai.",
    nextQuestion: "Kitas klausimas",
    score: "Rezultatas",
    done: "Baigta",
    retry: "Kartoti",
  },
};

/* =========================
   Persistence & Utilities
   ========================= */
function loadRows() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = JSON.parse(raw || "[]");
    if (!Array.isArray(arr)) return [];
    // normalise
    return arr
      .map((r) => ({
        English: String(r.English || "").trim(),
        Lithuanian: String(r.Lithuanian || "").trim(),
        Phonetic: String(r.Phonetic || "").trim(),
        Category: String(r.Category || "").trim(),
        Usage: String(r.Usage || "").trim(),
        Notes: String(r.Notes || "").trim(),
        "RAG Icon": normalizeRag(r["RAG Icon"] || "🟠"),
        Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(r.Sheet)
          ? r.Sheet
          : "Phrases",
        _id: r._id || genId(),
        _ts: r._ts || nowTs(),
        _qstat:
          r._qstat || { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } },
      }))
      .filter((r) => r.English || r.Lithuanian);
  } catch {
    return [];
  }
}
function saveRows(rows) {
  localStorage.setItem(LS_KEY, JSON.stringify(rows));
}

const loadXP = () => {
  try {
    const raw = localStorage.getItem(LSK_XP);
    const v = Number(raw ?? "0");
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
};
const saveXP = (xp) => {
  const v = Number.isFinite(xp) ? xp : 0;
  localStorage.setItem(LSK_XP, String(v));
};

const todayKey = () => new Date().toISOString().slice(0, 10);
const loadStreak = () => {
  try {
    const s = JSON.parse(localStorage.getItem(LSK_STREAK) || "null");
    if (!s || typeof s.streak !== "number") return { streak: 0, lastDate: "" };
    return s;
  } catch {
    return { streak: 0, lastDate: "" };
  }
};
const saveStreak = (s) => localStorage.setItem(LSK_STREAK, JSON.stringify(s));

const nowTs = () => Date.now();
const genId = () => Math.random().toString(36).slice(2);
const cn = (...xs) => xs.filter(Boolean).join(" ");

function normalizeRag(icon = "") {
  const s = String(icon).trim().toLowerCase();
  if (["🔴", "red"].includes(icon) || s === "red") return "🔴";
  if (["🟠", "amber", "orange", "yellow"].includes(icon) || ["amber", "orange", "yellow"].includes(s))
    return "🟠";
  if (["🟢", "green"].includes(icon) || s === "green") return "🟢";
  return "🟠";
}
function daysBetween(d1, d2) {
  const a = new Date(d1 + "T00:00:00"),
    b = new Date(d2 + "T00:00:00");
  return Math.round((b - a) / 86400000);
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample(arr, n) {
  if (!arr.length || n <= 0) return [];
  if (n >= arr.length) return shuffle(arr);
  const idxs = new Set();
  while (idxs.size < n) idxs.add((Math.random() * arr.length) | 0);
  return [...idxs].map((i) => arr[i]);
}
function sim2(a = "", b = "") {
  const s1 = (a + "").toLowerCase().trim();
  const s2 = (b + "").toLowerCase().trim();
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  const grams = (s) => {
    const g = [];
    for (let i = 0; i < s.length - 1; i++) g.push(s.slice(i, i + 2));
    return g;
  };
  const g1 = grams(s1),
    g2 = grams(s2);
  if (!g1.length || !g2.length) return 0;
  const set1 = new Set(g1),
    set2 = new Set(g2);
  const inter = [...set1].filter((x) => set2.has(x)).length;
  const uni = new Set([...g1, ...g2]).size;
  return inter / uni;
}

/* =========================
   Speech helpers
   ========================= */
function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function speakBrowser(text, voice, rate = 1) {
  if (!window.speechSynthesis) {
    alert("Speech synthesis not supported.");
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang || "lt-LT";
  u.rate = rate;
  window.speechSynthesis.speak(u);
}
async function speakAzureHTTP(text, shortName, key, region, rateDelta = "0%") {
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml = `<speak version="1.0" xml:lang="lt-LT"><voice name="${shortName}"><prosody rate="${rateDelta}">${escapeXml(
    text
  )}</prosody></voice></speak>`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
    },
    body: ssml,
  });
  if (!res.ok) throw new Error("Azure TTS failed");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/* =========================
   Main App
   ========================= */
export default function App() {
  // layout
  const [page, setPage] = useState("home");
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onR = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  const WIDE = width >= 1024;

  // data + prefs
  const [rows, setRows] = useState(loadRows());
  const [tab, setTab] = useState("Phrases");
  const [q, setQ] = useState("");
  const [sortMode, setSortMode] = useState(() => localStorage.getItem(LSK_SORT) || "RAG");
  useEffect(() => localStorage.setItem(LSK_SORT, sortMode), [sortMode]);
  const [direction, setDirection] = useState(() => localStorage.getItem(LSK_DIR) || "EN2LT");
  useEffect(() => localStorage.setItem(LSK_DIR, direction), [direction]);
  const T = STR[direction];

  const [xp, setXp] = useState(loadXP());
  useEffect(() => saveXP(xp), [xp]);
  useEffect(() => {
    // heal bad persisted values
    if (!Number.isFinite(xp)) setXp(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const level = Math.floor(xp / LEVEL_STEP) + 1;
  const levelProgress = ((Number.isFinite(xp) ? xp : 0) % LEVEL_STEP);

  const [streak, setStreak] = useState(loadStreak());
  useEffect(() => saveStreak(streak), [streak]);

  // TTS
  const [ttsProvider, setTtsProvider] = useState(() => localStorage.getItem(LSK_TTS_PROVIDER) || "azure");
  useEffect(() => localStorage.setItem(LSK_TTS_PROVIDER, ttsProvider), [ttsProvider]);
  const [azureKey, setAzureKey] = useState(() => localStorage.getItem(LSK_AZURE_KEY) || "");
  const [azureRegion, setAzureRegion] = useState(() => localStorage.getItem(LSK_AZURE_REGION) || "");
  const [azureVoices, setAzureVoices] = useState([]);
  const [azureVoiceShortName, setAzureVoiceShortName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LSK_AZURE_VOICE) || "null")?.shortName || "";
    } catch {
      return "";
    }
  });
  useEffect(() => {
    if (azureKey) localStorage.setItem(LSK_AZURE_KEY, azureKey);
  }, [azureKey]);
  useEffect(() => {
    if (azureRegion) localStorage.setItem(LSK_AZURE_REGION, azureRegion);
  }, [azureRegion]);
  useEffect(() => {
    localStorage.setItem(LSK_AZURE_VOICE, JSON.stringify({ shortName: azureVoiceShortName }));
  }, [azureVoiceShortName]);

  const voices = useVoices();
  const [browserVoiceName, setBrowserVoiceName] = useState("");
  const browserVoice = useMemo(
    () => voices.find((v) => v.name === browserVoiceName) || voices[0],
    [voices, browserVoiceName]
  );

  // ui state
  const [expanded, setExpanded] = useState(new Set());
  const [editIdx, setEditIdx] = useState(null);
  const [editDraft, setEditDraft] = useState({
    English: "",
    Lithuanian: "",
    Phonetic: "",
    Category: "",
    Usage: "",
    Notes: "",
    "RAG Icon": "🟠",
    Sheet: "Phrases",
  });

  // audio instance
  const audioRef = useRef(null);

  // persist rows
  useEffect(() => saveRows(rows), [rows]);

  /* ====== Audio helpers ====== */
  async function playText(text, { slow = false } = {}) {
    try {
      // stop any current playback
      if (audioRef.current) {
        audioRef.current.pause?.();
        audioRef.current = null;
      }
      if (ttsProvider === "azure" && azureKey && azureRegion && azureVoiceShortName) {
        const url = await speakAzureHTTP(text, azureVoiceShortName, azureKey, azureRegion, slow ? "-25%" : "0%");
        const audio = new Audio(url);
        audioRef.current = audio;
        await audio.play();
      } else {
        speakBrowser(text, browserVoice, slow ? 0.8 : 1);
      }
    } catch (e) {
      alert(e.message || "Audio error");
    }
  }

  /* ====== Filtering & Sorting ====== */
  const filtered = useMemo(() => {
    const byTab = rows.filter((r) => r.Sheet === tab);
    const byQ = !q
      ? byTab
      : byTab.filter((r) =>
          `${r.English} ${r.Lithuanian} ${r.Phonetic} ${r.Category} ${r.Usage} ${r.Notes}`
            .toLowerCase()
            .includes(q.toLowerCase())
        );
    if (sortMode === "Newest") return [...byQ].sort((a, b) => (b._ts || 0) - (a._ts || 0));
    if (sortMode === "Oldest") return [...byQ].sort((a, b) => (a._ts || 0) - (b._ts || 0));
    const order = { "🔴": 0, "🟠": 1, "🟢": 2 };
    return [...byQ].sort(
      (a, b) => (order[normalizeRag(a["RAG Icon"])] ?? 1) - (order[normalizeRag(b["RAG Icon"])] ?? 1)
    );
  }, [rows, tab, q, sortMode]);

  const ragBuckets = useMemo(() => {
    const buckets = { "🔴": [], "🟠": [], "🟢": [] };
    for (const r of filtered) buckets[normalizeRag(r["RAG Icon"])].push(r);
    return buckets;
  }, [filtered]);

  const [ragChip, setRagChip] = useState("All");
  const chipFiltered = useMemo(() => {
    if (sortMode !== "RAG" || WIDE) return filtered;
    if (ragChip === "All") return filtered;
    return filtered.filter((r) => normalizeRag(r["RAG Icon"]) === ragChip);
  }, [filtered, sortMode, WIDE, ragChip]);

  /* ====== CRUD ====== */
  function startEdit(i) {
    setEditIdx(i);
    setEditDraft({ ...rows[i] });
  }
  function saveEdit(i) {
    const clean = { ...editDraft, "RAG Icon": normalizeRag(editDraft["RAG Icon"]) };
    if (!clean.English && !clean.Lithuanian) {
      alert("English & Lithuanian required");
      return;
    }
    setRows((prev) => prev.map((r, idx) => (idx === i ? clean : r)));
    setEditIdx(null);
  }
  function remove(i) {
    if (!confirm(T.confirm)) return;
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }
  function addDraft() {
    if (!editDraft.English && !editDraft.Lithuanian) {
      alert("English & Lithuanian required");
      return;
    }
    const clean = {
      ...editDraft,
      "RAG Icon": normalizeRag(editDraft["RAG Icon"]),
      _id: genId(),
      _ts: nowTs(),
      _qstat: { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } },
    };
    setRows((prev) => [clean, ...prev]);
    setEditDraft({
      English: "",
      Lithuanian: "",
      Phonetic: "",
      Category: "",
      Usage: "",
      Notes: "",
      "RAG Icon": "🟠",
      Sheet: "Phrases",
    });
  }

  /* ====== Library: import/starters/clear/dupes ====== */
  async function mergeRows(newRows) {
    const cleaned = newRows
      .map((r) => ({
        English: String(r.English || "").trim(),
        Lithuanian: String(r.Lithuanian || "").trim(),
        Phonetic: String(r.Phonetic || "").trim(),
        Category: String(r.Category || "").trim(),
        Usage: String(r.Usage || "").trim(),
        Notes: String(r.Notes || "").trim(),
        "RAG Icon": normalizeRag(r["RAG Icon"] || "🟠"),
        Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(r.Sheet) ? r.Sheet : "Phrases",
        _id: r._id || genId(),
        _ts: r._ts || nowTs(),
        _qstat: r._qstat || { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } },
      }))
      .filter((r) => r.English || r.Lithuanian);
    setRows((prev) => [...cleaned, ...prev]);
  }
  async function fetchStarter(kind) {
    try {
      const url = STARTERS[kind];
      if (!url) throw new Error("Starter not found");
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch starter");
      await mergeRows(await res.json());
      alert("Installed.");
    } catch (e) {
      alert("Starter error: " + e.message);
    }
  }
  async function importJsonFile(file) {
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data)) throw new Error("JSON must be an array");
      await mergeRows(data);
      alert("Imported.");
    } catch (e) {
      alert("Import failed: " + e.message);
    }
  }
  function clearLibrary() {
    if (!confirm(T.confirm)) return;
    setRows([]);
  }

  const [dupeResults, setDupeResults] = useState({ exact: [], close: [] });
  function scanDupes() {
    const map = new Map();
    rows.forEach((r, i) => {
      const key = `${r.English}|||${r.Lithuanian}`.toLowerCase().trim();
      map.set(key, (map.get(key) || []).concat(i));
    });
    const exact = [];
    for (const arr of map.values()) if (arr.length > 1) exact.push(arr);

    const close = [];
    const bySheet = rows.reduce((acc, r, i) => {
      (acc[r.Sheet] ||= []).push({ r, i });
      return acc;
    }, {});
    for (const list of Object.values(bySheet)) {
      for (let a = 0; a < list.length; a++) {
        for (let b = a + 1; b < list.length; b++) {
          const A = list[a],
            B = list[b];
          const s = (sim2(A.r.English, B.r.English) + sim2(A.r.Lithuanian, B.r.Lithuanian)) / 2;
          if (s >= 0.85) close.push([A.i, B.i, s]);
        }
      }
    }
    setDupeResults({ exact, close });
  }

  /* ====== Quiz ====== */
  const [quizOn, setQuizOn] = useState(false);
  const [quizQs, setQuizQs] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizChoice, setQuizChoice] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);

  function computeQuizPool(allRows, targetSize = 10) {
    const withPairs = allRows.filter((r) => r.English && r.Lithuanian);
    const red = withPairs.filter((r) => normalizeRag(r["RAG Icon"]) === "🔴");
    const amb = withPairs.filter((r) => normalizeRag(r["RAG Icon"]) === "🟠");
    const grn = withPairs.filter((r) => normalizeRag(r["RAG Icon"]) === "🟢");
    const needRed = Math.round(targetSize * 0.4);
    const needAmb = Math.round(targetSize * 0.5);
    const needGrn = targetSize - needRed - needAmb;
    const pool = [...sample(red, needRed), ...sample(amb, needAmb), ...sample(grn, needGrn)];
    return shuffle(pool).slice(0, targetSize);
  }

  function bumpRagAfterAnswer(item, correct) {
    const rag = normalizeRag(item["RAG Icon"]);
    item._qstat ||= { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } };
    const st = item._qstat;
    if (rag === "🔴") {
      if (correct) {
        st.red.ok = (st.red.ok || 0) + 1;
        if (st.red.ok >= 2) {
          item["RAG Icon"] = "🟠";
          st.red.ok = st.red.bad = 0;
        }
      } else {
        st.red.bad = (st.red.bad || 0) + 1;
      }
    } else if (rag === "🟠") {
      if (correct) {
        st.amb.ok = (st.amb.ok || 0) + 1;
        if (st.amb.ok >= 3) {
          item["RAG Icon"] = "🟢";
          st.amb.ok = st.amb.bad = 0;
        }
      } else {
        st.amb.bad = (st.amb.bad || 0) + 1;
        if (st.amb.bad >= 2) {
          item["RAG Icon"] = "🔴";
          st.amb.ok = st.amb.bad = 0;
        }
      }
    } else if (rag === "🟢") {
      if (!correct) {
        st.grn.bad = (st.grn.bad || 0) + 1;
        item["RAG Icon"] = "🟠";
        st.grn.ok = st.grn.bad = 0;
      } else {
        st.grn.ok = (st.grn.ok || 0) + 1;
      }
    }
  }

  function startQuiz() {
    const pool = computeQuizPool(rows, 10);
    if (!pool.length) {
      alert("Add some rows first.");
      return;
    }
    setQuizQs(pool);
    setQuizIdx(0);
    setQuizAnswered(false);
    setQuizChoice(null);
    setQuizOptions(makeOptions(pool[0]));
    setQuizOn(true);
  }

  function makeOptions(item) {
    const others = rows
      .filter((r) => r.Sheet === item.Sheet && r.Lithuanian && r.Lithuanian !== item.Lithuanian)
      .map((r) => r.Lithuanian);
    const opts = shuffle([item.Lithuanian, ...sample(others, 3)]).slice(0, 4);
    return opts;
  }

  async function answerQuiz(option) {
    if (quizAnswered) return;
    const item = quizQs[quizIdx];
    const correct = option === item.Lithuanian;
    setQuizChoice(option);
    setQuizAnswered(true);
    if (correct) setXp((x) => (Number.isFinite(x) ? x : 0) + XP_PER_CORRECT);
    await playText(item.Lithuanian, { slow: false });
    setRows((prev) =>
      prev.map((r) => {
        if (r === item || (r._id && item._id && r._id === item._id)) {
          const clone = { ...r };
          bumpRagAfterAnswer(clone, correct);
          return clone;
        }
        return r;
      })
    );
  }

  function nextQuiz() {
    if (quizIdx + 1 >= quizQs.length) {
      // update streak once per day
      const today = todayKey();
      let s = { ...streak };
      if (!s.lastDate || daysBetween(s.lastDate, today) >= 1) {
        s = { streak: (s.streak || 0) + 1, lastDate: today };
        setStreak(s);
      }
      setQuizOn(false);
      return;
    }
    const idx = quizIdx + 1;
    setQuizIdx(idx);
    setQuizAnswered(false);
    setQuizChoice(null);
    setQuizOptions(makeOptions(quizQs[idx]));
  }

  /* ====== Components ====== */
  function PlayButton({ text, rag }) {
    const color =
      rag === "🔴"
        ? "bg-red-600 hover:bg-red-500"
        : rag === "🟢"
        ? "bg-green-600 hover:bg-green-500"
        : "bg-amber-500 hover:bg-amber-400";
    return (
      <button
        onPointerDown={(e) => {
          const slow = e.pointerType === "mouse" ? e.buttons === 1 && e.pressure > 0.5 : true;
          // long press → slow; short click → normal
          let held = false;
          const t = setTimeout(() => {
            held = true;
            playText(text, { slow: true });
          }, 400);
          const up = () => {
            clearTimeout(t);
            if (!held) playText(text, { slow: false });
            window.removeEventListener("pointerup", up, true);
          };
          window.addEventListener("pointerup", up, true);
        }}
        className={cn("text-black px-3 py-2 rounded-md font-bold", color)}
        title="Tap to play. Long-press for slow."
      >
        ►
      </button>
    );
  }

  function EntryCard({ r, idx }) {
    const isEditing = editIdx === idx;
    const rag = normalizeRag(r["RAG Icon"]);
    const primary = direction === "EN2LT" ? r.Lithuanian : r.English;
    const secondary = direction === "EN2LT" ? r.English : r.Lithuanian;
    const speakText = direction === "EN2LT" ? r.Lithuanian : r.English;

    return (
      <div className="border border-zinc-700 rounded-xl p-4 flex flex-col gap-2">
        {!isEditing ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold">{primary || <i>—</i>}</div>
              <PlayButton text={speakText} rag={rag} />
            </div>
            <div className="text-sm text-zinc-300">{secondary}</div>
            {r.Phonetic && <div className="text-xs text-zinc-400">{r.Phonetic}</div>}
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span>{r.Category}</span>
              <span>•</span>
              <span>{r.Usage}</span>
              <span>•</span>
              <span>{rag}</span>
              <span>•</span>
              <span>{r.Sheet}</span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-zinc-800 rounded-md" onClick={() => startEdit(idx)}>
                {T.edit}
              </button>
              <button className="px-3 py-1 bg-zinc-800 rounded-md" onClick={() => remove(idx)}>
                {T.delete}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Input label={T.english} value={editDraft.English} onChange={(v) => setEditDraft((d) => ({ ...d, English: v }))} />
              <Input label={T.lithuanian} value={editDraft.Lithuanian} onChange={(v) => setEditDraft((d) => ({ ...d, Lithuanian: v }))} />
              <Input label={T.phonetic} value={editDraft.Phonetic} onChange={(v) => setEditDraft((d) => ({ ...d, Phonetic: v }))} />
              <Input label={T.category} value={editDraft.Category} onChange={(v) => setEditDraft((d) => ({ ...d, Category: v }))} />
              <Input label={T.usage} value={editDraft.Usage} onChange={(v) => setEditDraft((d) => ({ ...d, Usage: v }))} />
              <Input label={T.notes} value={editDraft.Notes} onChange={(v) => setEditDraft((d) => ({ ...d, Notes: v }))} />
              <Select
                label={T.ragLabel}
                value={editDraft["RAG Icon"]}
                onChange={(v) => setEditDraft((d) => ({ ...d, "RAG Icon": v }))}
                options={[
                  { v: "🔴", t: "🔴 Red" },
                  { v: "🟠", t: "🟠 Amber" },
                  { v: "🟢", t: "🟢 Green" },
                ]}
              />
              <Select
                label={T.sheet}
                value={editDraft.Sheet}
                onChange={(v) => setEditDraft((d) => ({ ...d, Sheet: v }))}
                options={[
                  { v: "Phrases", t: T.phrases },
                  { v: "Questions", t: T.questions },
                  { v: "Words", t: T.words },
                  { v: "Numbers", t: T.numbers },
                ]}
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-1 bg-zinc-800 rounded-md" onClick={() => saveEdit(idx)}>
                {T.save}
              </button>
              <button className="px-3 py-1 bg-zinc-800 rounded-md" onClick={() => setEditIdx(null)}>
                {T.cancel}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ====== Render ====== */
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Header */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div className="text-2xl font-extrabold tracking-tight">
            {T.appTitle1} <span className="text-amber-400">{T.appTitle2}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div>
              {T.level}: <b>{Number.isFinite(level) ? level : 1}</b>{" "}
              <span className="opacity-70">
                ({Number.isFinite(levelProgress) ? levelProgress : 0} / {LEVEL_STEP})
              </span>
            </div>
            <div>
              {T.streak}: <b>{streak.streak || 0}</b>
            </div>
            <Select
              value={direction}
              onChange={setDirection}
              options={[
                { v: "EN2LT", t: T.en2lt },
                { v: "LT2EN", t: T.lt2en },
              ]}
            />
          </div>
        </div>
        <div className="text-zinc-400 text-sm mt-1">{T.subtitle}</div>

        {/* Nav */}
        <div className="mt-4 flex items-center gap-2">
          <TabButton label={T.navHome} active={page === "home"} onClick={() => setPage("home")} />
          <TabButton label={T.navLibrary} active={page === "library"} onClick={() => setPage("library")} />
          <TabButton label={T.navSettings} active={page === "settings"} onClick={() => setPage("settings")} />
          {page === "home" && (
            <button className="ml-auto px-3 py-2 bg-amber-500 text-black rounded-md" onClick={startQuiz}>
              {T.startQuiz}
            </button>
          )}
        </div>

        {/* Content */}
        {page === "home" && (
          <>
            {/* Search + Sort + Tabs */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                className="px-3 py-2 bg-zinc-800 rounded-md w-full sm:w-80"
                placeholder={T.search}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <div className="flex items-center gap-2 text-sm">
                <span className="opacity-70">{T.sort}</span>
                <Select
                  value={sortMode}
                  onChange={setSortMode}
                  options={[
                    { v: "RAG", t: T.rag },
                    { v: "Newest", t: T.newest },
                    { v: "Oldest", t: T.oldest },
                  ]}
                />
              </div>
              <div className="flex items-center gap-1">
                {["Phrases", "Questions", "Words", "Numbers"].map((k) => (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm",
                      tab === k ? "bg-amber-500 text-black" : "bg-zinc-800"
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* RAG chips mobile */}
            {!WIDE && sortMode === "RAG" && (
              <div className="mt-3 flex items-center gap-2">
                {["All", "🔴", "🟠", "🟢"].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setRagChip(chip)}
                    className={cn(
                      "px-2 py-1 rounded-md text-xs",
                      ragChip === chip ? "bg-amber-500 text-black" : "bg-zinc-800"
                    )}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* List */}
            <div className="mt-4 grid gap-3">
              {!WIDE && chipFiltered.map((r, i) => <EntryCard key={r._id} r={r} idx={rows.indexOf(r)} />)}
              {WIDE && (
                <div className="grid grid-cols-3 gap-3">
                  {["🔴", "🟠", "🟢"].map((bucket) => (
                    <div key={bucket} className="flex flex-col gap-3">
                      <div className="text-sm opacity-70">{bucket}</div>
                      {ragBuckets[bucket].map((r) => (
                        <EntryCard key={r._id} r={r} idx={rows.indexOf(r)} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add entry */}
            <div className="mt-6 border-t border-zinc-800 pt-4">
              <div className="text-lg font-semibold mb-2">{T.addEntry}</div>
              <div className="grid sm:grid-cols-2 gap-2">
                <Input label={T.english} value={editDraft.English} onChange={(v) => setEditDraft((d) => ({ ...d, English: v }))} />
                <Input label={T.lithuanian} value={editDraft.Lithuanian} onChange={(v) => setEditDraft((d) => ({ ...d, Lithuanian: v }))} />
                <Input label={T.phonetic} value={editDraft.Phonetic} onChange={(v) => setEditDraft((d) => ({ ...d, Phonetic: v }))} />
                <Input label={T.category} value={editDraft.Category} onChange={(v) => setEditDraft((d) => ({ ...d, Category: v }))} />
                <Input label={T.usage} value={editDraft.Usage} onChange={(v) => setEditDraft((d) => ({ ...d, Usage: v }))} />
                <Input label={T.notes} value={editDraft.Notes} onChange={(v) => setEditDraft((d) => ({ ...d, Notes: v }))} />
                <Select
                  label={T.ragLabel}
                  value={editDraft["RAG Icon"]}
                  onChange={(v) => setEditDraft((d) => ({ ...d, "RAG Icon": v }))}
                  options={[
                    { v: "🔴", t: "🔴 Red" },
                    { v: "🟠", t: "🟠 Amber" },
                    { v: "🟢", t: "🟢 Green" },
                  ]}
                />
                <Select
                  label={T.sheet}
                  value={editDraft.Sheet}
                  onChange={(v) => setEditDraft((d) => ({ ...d, Sheet: v }))}
                  options={[
                    { v: "Phrases", t: T.phrases },
                    { v: "Questions", t: T.questions },
                    { v: "Words", t: T.words },
                    { v: "Numbers", t: T.numbers },
                  ]}
                />
              </div>
              <div className="mt-2">
                <button className="px-3 py-2 bg-amber-500 text-black rounded-md" onClick={addDraft}>
                  {T.save}
                </button>
              </div>
            </div>
          </>
        )}

        {page === "library" && (
          <div className="mt-4 grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button className="px-3 py-2 bg-zinc-800 rounded-md" onClick={() => fetchStarter("EN2LT")}>
                {T.installEN}
              </button>
              <button className="px-3 py-2 bg-zinc-800 rounded-md" onClick={() => fetchStarter("LT2EN")}>
                {T.installLT}
              </button>
              <button className="px-3 py-2 bg-zinc-800 rounded-md" onClick={() => fetchStarter("NUMBERS")}>
                {T.installNums}
              </button>
              <label className="px-3 py-2 bg-zinc-800 rounded-md cursor-pointer">
                {T.importJSON}
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) importJsonFile(f);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              <button className="px-3 py-2 bg-red-700 rounded-md" onClick={clearLibrary}>
                {T.clearAll}
              </button>
            </div>

            {/* Duplicate finder */}
            <div className="border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{T.dupFinder}</div>
                <button className="px-3 py-2 bg-zinc-800 rounded-md" onClick={scanDupes}>
                  {T.scan}
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div>
                  <div className="text-sm opacity-70 mb-1">{T.exactGroups}</div>
                  <div className="flex flex-col gap-2">
                    {dupeResults.exact.map((group, gi) => (
                      <div key={gi} className="bg-zinc-800 rounded-md p-2">
                        {group.map((idx) => {
                          const r = rows[idx];
                          return (
                            <div key={r._id} className="text-xs">
                              {r.English} — {r.Lithuanian}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    {!dupeResults.exact.length && <div className="text-xs opacity-60">—</div>}
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-70 mb-1">{T.closeMatches}</div>
                  <div className="flex flex-col gap-2">
                    {dupeResults.close.map(([a, b, s], gi) => {
                      const A = rows[a],
                        B = rows[b];
                      return (
                        <div key={gi} className="bg-zinc-800 rounded-md p-2 text-xs">
                          <div>
                            {A.English} — {A.Lithuanian}
                          </div>
                          <div>
                            {B.English} — {B.Lithuanian}
                          </div>
                          <div>
                            {T.similarity}: {(s * 100).toFixed(0)}%
                          </div>
                        </div>
                      );
                    })}
                    {!dupeResults.close.length && <div className="text-xs opacity-60">—</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {page === "settings" && (
          <div className="mt-4 grid gap-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Select
                label="TTS"
                value={ttsProvider}
                onChange={setTtsProvider}
                options={[
                  { v: "azure", t: T.azure },
                  { v: "browser", t: T.browserVoice },
                ]}
              />
              {ttsProvider === "browser" && (
                <Select
                  label="Browser Voice"
                  value={browserVoiceName}
                  onChange={setBrowserVoiceName}
                  options={(voices || []).map((v) => ({ v: v.name, t: v.name }))}
                />
              )}
            </div>

            {ttsProvider === "azure" && (
              <div className="grid md:grid-cols-3 gap-3">
                <Input label={T.subKey} value={azureKey} onChange={setAzureKey} />
                <Input label={T.region} value={azureRegion} onChange={setAzureRegion} />
                <Select
                  label={T.voice}
                  value={azureVoiceShortName}
                  onChange={setAzureVoiceShortName}
                  options={[
                    { v: "", t: T.choose },
                    ...azureVoices.map((v) => ({ v: v.shortName, t: `${v.displayName} (${v.locale})` })),
                  ]}
                />
                <div className="md:col-span-3">
                  <button
                    onClick={async () => {
                      try {
                        const url = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
                        const res = await fetch(url, { headers: { "Ocp-Apim-Subscription-Key": azureKey } });
                        if (!res.ok) throw new Error("Failed to fetch Azure voices");
                        const data = await res.json();
                        const vs = data.map((v) => ({
                          shortName: v.ShortName,
                          locale: v.Locale,
                          displayName: v.LocalName || v.FriendlyName || v.ShortName,
                        }));
                        setAzureVoices(vs);
                        if (!azureVoiceShortName && vs.length) setAzureVoiceShortName(vs[0].shortName);
                      } catch (e) {
                        alert(e.message);
                      }
                    }}
                    className="bg-zinc-800 px-3 py-2 rounded-md"
                  >
                    {T.fetchVoices}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quiz Overlay */}
      {quizOn && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 max-w-xl w-full">
            <div className="text-sm opacity-70 mb-1">
              {T.prompt} {quizIdx + 1}/{quizQs.length}
            </div>
            {quizQs[quizIdx] && (
              <>
                <div className="text-lg font-semibold mb-1">{quizQs[quizIdx].English}</div>
                <div className="text-xs opacity-60 mb-3">{T.chooseLT}</div>
                <div className="grid gap-2">
                  {quizOptions.map((opt, i) => {
                    const chosen = quizChoice === opt;
                    const correct = opt === quizQs[quizIdx].Lithuanian;
                    let bg = "bg-zinc-800";
                    if (quizAnswered) {
                      if (correct) bg = "bg-green-600";
                      else if (chosen && !correct) bg = "bg-red-600";
                    } else if (chosen) bg = "bg-amber-500 text-black";
                    return (
                      <button
                        key={i}
                        className={cn("px-3 py-2 rounded-md text-left", bg)}
                        onClick={() => answerQuiz(opt)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm">{quizAnswered ? (quizChoice === quizQs[quizIdx].Lithuanian ? T.correct : T.notQuite) : " "}</div>
                  <button className="px-3 py-2 bg-amber-500 text-black rounded-md" onClick={nextQuiz}>
                    {quizIdx + 1 >= quizQs.length ? T.done : T.nextQuestion}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   Small UI primitives
   ========================= */
function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2 rounded-md",
        active ? "bg-amber-500 text-black font-semibold" : "bg-zinc-800"
      )}
    >
      {label}
    </button>
  );
}
function Input({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="opacity-70">{label}</span>}
      <input
        className="px-3 py-2 bg-zinc-800 rounded-md"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="opacity-70">{label}</span>}
      <select
        className="px-3 py-2 bg-zinc-800 rounded-md"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.t ?? o.v}
          </option>
        ))}
      </select>
    </label>
  );
}

/* =========================
   Browser voices hook
   ========================= */
function useVoices() {
  const [voices, setVoices] = useState(() => (window.speechSynthesis?.getVoices?.() || []));
  useEffect(() => {
    const handle = () => setVoices(window.speechSynthesis.getVoices());
    window.speechSynthesis?.onvoiceschanged
      ? (window.speechSynthesis.onvoiceschanged = handle)
      : setTimeout(handle, 300);
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);
  return voices;
}

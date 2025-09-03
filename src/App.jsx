import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lithuanian Trainer — App.jsx
 * - Tabs: Phrases / Questions / Words / Numbers
 * - Search + clear
 * - Sort: RAG (default), Newest, Oldest
 * - RAG chips (mobile) and tri-column RAG grid (wide screens)
 * - TTS: Azure primary + Browser fallback (no double-play, long-press = slow)
 * - Quiz: promote/demote rules + XP/Level + streak
 * - Library: JSON import/clear, starter installs, duplicate finder
 * - Full UI language swap (EN→LT / LT→EN)
 */

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
  // NOTE: Numbers are embedded in these starter files (and optionally a combined file).
  // We no longer fetch /data/starter_numbers.json.
  COMBINED_OPTIONAL: "/data/starter_combined_dedup.json",
};

const LEVEL_STEP = 2500;
const XP_PER_CORRECT = 50;

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
    clearAll: "Išvalyti biblioteką",
    confirm: "Ar tikrai?",
    dupFinder: "Dublikatų paieška",
    scan: "Skenuoti dublikatus",
    exactGroups: "Tikslūs dublikatai",
    closeMatches: "Artimos atitiktis",
    removeSelected: "Pašalinti pažymėtus",
    similarity: "Panašumas",
    prompt: "Klausimas",
    chooseLT: "Pasirinkite lietuvišką variantą",
    correct: "Teisingai!",
    notQuite: "Ne visai.",
    nextQuestion: "Kitas klausimas",
    score: "Rezultatas",
    done: "Baigti",
    retry: "Kartoti",
  },
};

// LS helpers
const saveRows = (rows) => localStorage.setItem(LS_KEY, JSON.stringify(rows));
const loadRows = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

// *** FIX: robust XP load/save to avoid NaN propagation ***
const loadXP = () => {
  try {
    const raw = localStorage.getItem(LSK_XP);
    const v = Number(raw ?? "0");
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
};
const saveXP = (xp) =>
  localStorage.setItem(LSK_XP, String(Number.isFinite(xp) ? xp : 0));

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

// utils
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
  const a = new Date(d1 + "T00:00:00"), b = new Date(d2 + "T00:00:00");
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
  const g1 = grams(s1), g2 = grams(s2);
  const map = new Map();
  g1.forEach((x) => map.set(x, (map.get(x) || 0) + 1));
  let inter = 0;
  g2.forEach((x) => {
    if (map.get(x)) {
      inter++;
      map.set(x, map.get(x) - 1);
    }
  });
  return (2 * inter) / (g1.length + g2.length);
}

// voices
function useVoices() {
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    const refresh = () => {
      const v = window.speechSynthesis?.getVoices?.() || [];
      setVoices([...v].sort((a, b) => a.name.localeCompare(b.name)));
    };
    refresh();
    window.speechSynthesis?.addEventListener?.("voiceschanged", refresh);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", refresh);
  }, []);
  return voices;
}
function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
  // *** FIX: heal any bad persisted XP once on mount ***
  useEffect(() => {
    if (!Number.isFinite(xp)) setXp(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // *** FIX: compute level/progress from finite XP only ***
  const level = Math.floor((Number.isFinite(xp) ? xp : 0) / LEVEL_STEP) + 1;
  const levelProgress = (Number.isFinite(xp) ? xp : 0) % LEVEL_STEP;

  const [streak, setStreak] = useState(loadStreak());
  useEffect(() => saveStreak(streak), [streak]);

  // TTS
  const [ttsProvider, setTtsProvider] = useState(
    () => localStorage.getItem(LSK_TTS_PROVIDER) || "azure"
  );
  useEffect(() => localStorage.setItem(LSK_TTS_PROVIDER, ttsProvider), [ttsProvider]);
  const [azureKey, setAzureKey] = useState(() => localStorage.getItem(LSK_AZURE_KEY) || "");
  const [azureRegion, setAzureRegion] = useState(
    () => localStorage.getItem(LSK_AZURE_REGION) || ""
  );
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

  // audio helpers
  async function playText(text, { slow = false } = {}) {
    try {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          const src = audioRef.current.src || "";
          if (src.startsWith("blob:")) URL.revokeObjectURL(src);
        } catch {}
        audioRef.current = null;
      }
      if (ttsProvider === "azure" && azureKey && azureRegion && azureVoiceShortName) {
        const delta = slow ? "-40%" : "0%";
        const url = await speakAzureHTTP(text, azureVoiceShortName, azureKey, azureRegion, delta);
        const a = new Audio(url);
        audioRef.current = a;
        a.onended = () => {
          try { URL.revokeObjectURL(url); } catch {}
          if (audioRef.current === a) audioRef.current = null;
        };
        await a.play();
      } else {
        const rate = slow ? 0.6 : 1.0;
        speakBrowser(text, browserVoice, rate);
      }
    } catch (e) {
      console.error(e);
      alert("Voice error: " + (e?.message || e));
    }
  }
  function pressHandlers(text) {
    let timer = null;
    let firedSlow = false;
    let pressed = false;
    const start = (e) => {
      e.preventDefault();
      firedSlow = false;
      pressed = true;
      timer = setTimeout(() => {
        if (!pressed) return;
        firedSlow = true;
        playText(text, { slow: true });
      }, 550);
    };
    const finish = (e) => {
      e?.preventDefault?.();
      if (!pressed) return;
      pressed = false;
      if (timer) clearTimeout(timer);
      timer = null;
      if (!firedSlow) playText(text, { slow: false });
    };
    const cancel = (e) => {
      e?.preventDefault?.();
      pressed = false;
      if (timer) clearTimeout(timer);
      timer = null;
    };
    return {
      "data-press": "1",
      onPointerDown: start,
      onPointerUp: finish,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onContextMenu: (e) => e.preventDefault(),
    };
  }

  // filtering/sorting
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
      (a, b) =>
        (order[normalizeRag(a["RAG Icon"])] ?? 1) - (order[normalizeRag(b["RAG Icon"])] ?? 1)
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

  // CRUD
  function startEdit(i) {
    setEditIdx(i);
    setEditDraft({ ...rows[i] });
  }
  function saveEdit(i) {
    const clean = { ...editDraft, "RAG Icon": normalizeRag(editDraft["RAG Icon"]) };
    setRows((prev) => prev.map((r, idx) => (idx === i ? clean : r)));
    setEditIdx(null);
  }
  function remove(i) {
    if (!confirm(T.confirm)) return;
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  // library: import/starters/clear/dupes
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
        Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(r.Sheet)
          ? r.Sheet
          : "Phrases",
        _id: r._id || genId(),
        _ts: r._ts || nowTs(),
        _qstat:
          r._qstat || { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } },
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

  // NEW: install only Numbers by extracting from available starter files
  async function installNumbersOnly() {
    const urls = [
      STARTERS.COMBINED_OPTIONAL, // optional combined file first (if present)
      STARTERS.EN2LT,
      STARTERS.LT2EN,
    ].filter(Boolean);

    let found = [];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue; // skip missing files
        const data = await res.json();
        if (Array.isArray(data)) {
          const nums = data.filter((r) => String(r.Sheet) === "Numbers");
          found = found.concat(nums);
        }
      } catch {
        // ignore individual fetch errors; we’ll try the next file
      }
    }

    if (!found.length) {
      alert("No Numbers entries found in starter files.");
      return;
    }
    await mergeRows(found);
    alert(`Installed ${found.length} Numbers item(s).`);
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
          const A = list[a], B = list[b];
          const s = (sim2(A.r.English, B.r.English) + sim2(A.r.Lithuanian, B.r.Lithuanian)) / 2;
          if (s >= 0.85) close.push([A.i, B.i, s]);
        }
      }
    }
    setDiapeResults({ exact, close }); // typo fixed below!
  }
  // FIX the typo in setDiapeResults
  function setDiapeResults(v) { setDupeResults(v); }

  // quiz
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
    const needR = Math.min(Math.max(5, Math.floor(targetSize * 0.5)), red.length || 0);
    const needA = Math.min(Math.max(4, Math.floor(targetSize * 0.4)), amb.length || 0);
    const needG = Math.min(Math.max(1, Math.floor(targetSize * 0.1)), grn.length || 0);
    let picked = [...sample(red, needR), ...sample(amb, needA), ...sample(grn, needG)];
    while (picked.length < targetSize) {
      const leftovers = withPairs.filter((r) => !picked.includes(r));
      if (!leftovers.length) break;
      picked.push(leftovers[(Math.random() * leftovers.length) | 0]);
    }
    return shuffle(picked).slice(0, targetSize);
  }
  function startQuiz() {
    if (rows.length < 4) return alert("Add more entries first (need at least 4).");
    const pool = computeQuizPool(rows, 10);
    if (!pool.length) return alert("No quiz candidates found.");
    setQuizQs(pool);
    setQuizIdx(0);
    setQuizAnswered(false);
    setQuizChoice(null);
    const first = pool[0];
    const correctLt = first.Lithuanian;
    const distractors = sample(pool.filter((r) => r !== first && r.Lithuanian), 3).map((r) => r.Lithuanian);
    setQuizOptions(shuffle([correctLt, ...distractors]));
    setQuizOn(true);
  }
  function afterAnswerAdvance() {
    const nextIdx = quizIdx + 1;
    if (nextIdx >= quizQs.length) {
      const today = todayKey();
      if (streak.lastDate !== today) {
        const inc =
          streak.lastDate && daysBetween(streak.lastDate, today) === 1 ? streak.streak + 1 : 1;
        setStreak({ streak: inc, lastDate: today });
      }
      setQuizOn(false);
      return;
    }
    setQuizIdx(nextIdx);
    setQuizAnswered(false);
    setQuizChoice(null);
    const item = quizQs[nextIdx];
    const correctLt = item.Lithuanian;
    const distractors = sample(quizQs.filter((r) => r !== item && r.Lithuanian), 3).map((r) => r.Lithuanian);
    setQuizOptions(shuffle([correctLt, ...distractors]));
  }
  function bumpRagAfterAnswer(item, correct) {
    const rag = normalizeRag(item["RAG Icon"]);
    const st =
      (item._qstat ||= { red: { ok: 0, bad: 0 }, amb: { ok: 0, bad: 0 }, grn: { ok: 0, bad: 0 } });
    if (rag === "🔴") {
      if (correct) {
        st.red.ok = (st.red.ok || 0) + 1;
        if (st.red.ok >= 5) {
          item["RAG Icon"] = "🟠";
          st.red.ok = st.red.bad = 0;
        }
      } else {
        st.red.bad = (st.red.bad || 0) + 1;
      }
    } else if (rag === "🟠") {
      if (correct) {
        st.amb.ok = (st.amb.ok || 0) + 1;
        if (st.amb.ok >= 5) {
          item["RAG Icon"] = "🟢";
          st.amb.ok = st.amb.bad = 0;
        }
      } else {
        st.amb.bad = (st.amb.bad || 0) + 1;
        if (st.amb.bad >= 3) {
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
  async function answerQuiz(option) {
    if (quizAnswered) return;
    const item = quizQs[quizIdx];
    const correct = option === item.Lithuanian;
    setQuizChoice(option);
    setQuizAnswered(true);
    // *** FIX: guard XP increment against NaN ***
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

  // components
  function PlayButton({ text, rag }) {
    const color =
      rag === "🔴"
        ? "bg-red-600 hover:bg-red-500"
        : rag === "🟢"
        ? "bg-green-600 hover:bg-green-500"
        : "bg-amber-500 hover:bg-amber-400";
    return (
      <button
        className={cn(
          "shrink-0 w-10 h-10 rounded-xl transition flex items-center justify-center font-semibold text-zinc-900",
          color
        )}
        title="Tap = play, long-press = slow"
        {...pressHandlers(text)}
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        {!isEditing ? (
          <div className="flex items-start gap-2">
            <PlayButton text={speakText} rag={rag} />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-zinc-400 truncate">{secondary}</div>
              <div className="text-lg leading-tight font-medium break-words">{primary}</div>
              <div className="mt-1">
                <button
                  onClick={() =>
                    setExpanded((prev) => {
                      const n = new Set(prev);
                      n.has(idx) ? n.delete(idx) : n.add(idx);
                      return n;
                    })
                  }
                  className="text-[11px] px-2 py-0.5 rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
                >
                  {expanded.has(idx) ? T.hideDetails : T.showDetails}
                </button>
              </div>
              {expanded.has(idx) && (
                <>
                  {r.Phonetic && <div className="text-xs text-zinc-400 mt-1">{r.Phonetic}</div>}
                  {(r.Usage || r.Notes) && (
                    <div className="text-xs text-zinc-500 mt-1">
                      {r.Usage && (
                        <div className="mb-0.5">
                          <span className="text-zinc-400">{T.usage}: </span>
                          {r.Usage}
                        </div>
                      )}
                      {r.Notes && (
                        <div className="opacity-80">
                          <span className="text-zinc-400">{T.notes}: </span>
                          {r.Notes}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col gap-1 ml-2">
              <button
                onClick={() => startEdit(idx)}
                className="text-xs bg-zinc-800 px-2 py-1 rounded-md"
              >
                {T.edit}
              </button>
              <button
                onClick={() => remove(idx)}
                className="text-xs bg-zinc-800 text-red-400 px-2 py-1 rounded-md"
              >
                {T.delete}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <label className="col-span-2">
                {T.english}
                <input
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                  value={editDraft.English}
                  onChange={(e) => setEditDraft({ ...editDraft, English: e.target.value })}
                />
              </label>
              <label className="col-span-2">
                {T.lithuanian}
                <input
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                  value={editDraft.Lithuanian}
                  onChange={(e) => setEditDraft({ ...editDraft, Lithuanian: e.target.value })}
                />
              </label>
              <label>
                {T.phonetic}
                <input
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                  value={editDraft.Phonetic}
                  onChange={(e) => setEditDraft({ ...editDraft, Phonetic: e.target.value })}
                />
              </label>
              <label>
                {T.category}
                <input
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                  value={editDraft.Category}
                  onChange={(e) => setEditDraft({ ...editDraft, Category: e.target.value })}
                />
              </label>
              <label className="col-span-2">
                {T.usage}
                <input
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                  value={editDraft.Usage}
                  onChange={(e) => setEditDraft({ ...editDraft, Usage: e.target.value })}
                />
              </label>
              <label className="col-span-2">
                {T.notes}
                <input
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                  value={editDraft.Notes}
                  onChange={(e) => setEditDraft({ ...editDraft, Notes: e.target.value })}
                />
              </label>
              <label>
                {T.ragLabel}
                <select
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                  value={editDraft["RAG Icon"]}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, "RAG Icon": normalizeRag(e.target.value) })
                  }
                >
                  {["🔴", "🟠", "🟢"].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {T.sheet}
                <select
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                  value={editDraft.Sheet}
                  onChange={(e) => setEditDraft({ ...editDraft, Sheet: e.target.value })}
                >
                  {["Phrases", "Questions", "Words", "Numbers"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => saveEdit(idx)}
                className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md text-sm font-semibold"
              >
                {T.save}
              </button>
              <button
                onClick={() => setEditIdx(null)}
                className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
              >
                {T.cancel}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function Header() {
    return (
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-500 flex items-center justify-center font-bold text-zinc-900">
                LT
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-xl font-semibold truncate">
                  {T.appTitle1} <span className="hidden sm:inline">{T.appTitle2}</span>
                </div>
                <div className="text-xs text-zinc-400">{T.subtitle}</div>
              </div>
            </div>

            <select
              className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1"
              value={ttsProvider === "browser" ? browserVoiceName : ""}
              onChange={(e) => setBrowserVoiceName(e.target.value)}
              disabled={ttsProvider !== "browser"}
              title={ttsProvider === "azure" ? "Using Azure" : T.browserVoice}
            >
              <option value="">{ttsProvider === "azure" ? "Auto voice" : "Auto voice"}</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* nav */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              { key: "home", label: T.navHome },
              { key: "library", label: T.navLibrary },
              { key: "settings", label: T.navSettings },
            ].map((b) => (
              <button
                key={b.key}
                onClick={() => setPage(b.key)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2",
                  page === b.key
                    ? "bg-zinc-800 border-zinc-700"
                    : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                )}
              >
                {b.label}
              </button>
            ))}
          </div>

          <button
            onClick={startQuiz}
            className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl py-3 font-semibold"
          >
            {T.startQuiz}
          </button>
        </div>
      </div>
    );
  }

  function AddForm() {
    const [draft, setDraft] = useState({
      English: "",
      Lithuanian: "",
      Phonetic: "",
      Category: "",
      Usage: "",
      Notes: "",
      "RAG Icon": "🟠",
      Sheet: tab,
    });
    useEffect(() => setDraft((d) => ({ ...d, Sheet: tab })), [tab]);
    function addRow() {
      if (!draft.English || !draft.Lithuanian) {
        alert(`${T.english} & ${T.lithuanian} required`);
        return;
      }
      const row = {
        ...draft,
        "RAG Icon": normalizeRag(draft["RAG Icon"]),
        _id: genId(),
        _ts: nowTs(),
      };
      setRows((prev) => [row, ...prev]);
      setDraft({
        English: "",
        Lithuanian: "",
        Phonetic: "",
        Category: "",
        Usage: "",
        Notes: "",
        "RAG Icon": "🟠",
        Sheet: tab,
      });
    }
    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        <input
          className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
          placeholder={T.english}
          value={draft.English}
          onChange={(e) => setDraft({ ...draft, English: e.target.value })}
        />
        <input
          className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
          placeholder={T.lithuanian}
          value={draft.Lithuanian}
          onChange={(e) => setDraft({ ...draft, Lithuanian: e.target.value })}
        />
        <input
          className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
          placeholder={T.phonetic}
          value={draft.Phonetic}
          onChange={(e) => setDraft({ ...draft, Phonetic: e.target.value })}
        />
        <input
          className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
          placeholder={T.category}
          value={draft.Category}
          onChange={(e) => setDraft({ ...draft, Category: e.target.value })}
        />
        <input
          className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
          placeholder={T.usage}
          value={draft.Usage}
          onChange={(e) => setDraft({ ...draft, Usage: e.target.value })}
        />
        <input
          className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
          placeholder={T.notes}
          value={draft.Notes}
          onChange={(e) => setDraft({ ...draft, Notes: e.target.value })}
        />
        <select
          className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
          value={draft["RAG Icon"]}
          onChange={(e) => setDraft({ ...draft, "RAG Icon": normalizeRag(e.target.value) })}
        >
          {["🔴", "🟠", "🟢"].map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        <select
          className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
          value={draft.Sheet}
          onChange={(e) => setDraft({ ...draft, Sheet: e.target.value })}
        >
          {["Phrases", "Questions", "Words", "Numbers"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={addRow}
          className="col-span-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-md px-3 py-2 text-sm font-semibold"
        >
          {T.save}
        </button>
      </div>
    );
  }

  function LibraryView() {
    const fileRef = useRef(null);
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-24">
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => fetchStarter("EN2LT")} className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2">
            {T.installEN}
          </button>
          <button onClick={() => fetchStarter("LT2EN")} className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2">
            {T.installLT}
          </button>
          <button onClick={installNumbersOnly} className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2">
            {T.installNums}
          </button>

          <div className="col-span-1 sm:col-span-3 flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJsonFile(f);
                e.target.value = "";
              }}
            />
            <button onClick={() => fileRef.current?.click()} className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2">
              {T.importJSON}
            </button>
            <button onClick={clearLibrary} className="bg-zinc-900 border border-red-600 text-red-400 rounded-md px-3 py-2">
              {T.clearAll}
            </button>
          </div>
        </div>

        {/* Duplicates */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-semibold">{T.dupFinder}</div>
            <button onClick={scanDupes} className="bg-zinc-800 px-3 py-2 rounded-md">
              {T.scan}
            </button>
          </div>
          <div className="mt-3">
            <div className="text-sm text-zinc-400 mb-2">
              {T.closeMatches}: {dupeResults.close.length} pair(s)
            </div>
            <div className="space-y-3">
              {dupeResults.close.map(([i, j, s]) => {
                const A = rows[i], B = rows[j];
                return (
                  <div key={`${i}-${j}`} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                    <div className="text-xs text-zinc-400 mb-2">{T.similarity}: {(s * 100).toFixed(0)}%</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[{ row: A, idx: i }, { row: B, idx: j }].map(({ row, idx: ridx }) => (
                        <div key={ridx} className="border border-zinc-800 rounded-md p-2">
                          <div className="font-medium">
                            {row.English} — {row.Lithuanian} <span className="text-xs text-zinc-400">[{row.Sheet}]</span>
                          </div>
                          {(row.Usage || row.Notes) && (
                            <div className="mt-1 text-xs text-zinc-400 space-y-1">
                              {row.Usage && <div><span className="text-zinc-500">{T.usage}: </span>{row.Usage}</div>}
                              {row.Notes && <div><span className="text-zinc-500">{T.notes}: </span>{row.Notes}</div>}
                            </div>
                          )}
                          <div className="mt-2">
                            <button
                              className="text-xs bg-red-800/40 border border-red-600 px-2 py-1 rounded-md"
                              onClick={() => setRows((prev) => prev.filter((_, ii) => ii !== ridx))}
                            >
                              {T.delete}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function SettingsView() {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-20">
        <div className="mt-4 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 space-y-4">
          <div className="text-lg font-semibold">{T.settings}</div>
          <div>
            <div className="text-xs mb-1">{T.direction}</div>
            <div className="flex gap-2">
              {["EN2LT", "LT2EN"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm border",
                    direction === d ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-700"
                  )}
                >
                  {d === "EN2LT" ? T.en2lt : T.lt2en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs mb-1">TTS</div>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ttsprov"
                  checked={ttsProvider === "browser"}
                  onChange={() => setTtsProvider("browser")}
                />{" "}
                {T.browserVoice}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ttsprov"
                  checked={ttsProvider === "azure"}
                  onChange={() => setTtsProvider("azure")}
                />{" "}
                {T.azure}
              </label>
            </div>
          </div>

          {ttsProvider === "azure" && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <div className="text-xs mb-1">{T.subKey}</div>
                  <input
                    type="password"
                    value={azureKey}
                    onChange={(e) => setAzureKey(e.target.value)}
                    placeholder="Azure key"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <div className="text-xs mb-1">{T.region}</div>
                  <input
                    value={azureRegion}
                    onChange={(e) => setAzureRegion(e.target.value)}
                    placeholder="e.g. westeurope"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <div className="text-xs mb-1">{T.voice}</div>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                    value={azureVoiceShortName}
                    onChange={(e) => setAzureVoiceShortName(e.target.value)}
                  >
                    <option value="">{T.choose}</option>
                    {azureVoices.map((v) => (
                      <option key={v.shortName} value={v.shortName}>
                        {v.displayName} ({v.shortName})
                      </option>
                    ))}
                  </select>
                </div>
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
      </div>
    );
  }

  function HomeView() {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-28">
        {/* Search + Sort */}
        <div className="flex items-center gap-2 mt-3">
          <div className="relative flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={T.search}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm outline-none"
            />
            {q && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                onClick={() => setQ("")}
                aria-label="Clear"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">{T.sort}</span>
            <select
              className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
            >
              <option value="RAG">{T.rag}</option>
              <option value="Newest">{T.newest}</option>
              <option value="Oldest">{T.oldest}</option>
            </select>
          </div>
        </div>

        {/* Streak + Level */}
        <div className="mt-2 flex items-center gap-3">
          <div className="text-xs text-zinc-400">🔥 {T.streak}: <span className="font-semibold">{streak.streak}</span></div>
          <div className="text-xs text-zinc-400">🥇 {T.level} <span className="font-semibold">{level}</span></div>
          <div className="flex-1 h-2 bg-zinc-800 rounded-md overflow-hidden">
            <div className="h-full bg-emerald-600" style={{ width: `${(levelProgress / LEVEL_STEP) * 100}%` }} />
          </div>
          <div className="text-xs text-zinc-400">{levelProgress} / {LEVEL_STEP} XP</div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {["Phrases", "Questions", "Words", "Numbers"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border",
                tab === t ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-800"
              )}
            >
              {t === "Phrases" ? T.phrases : t === "Questions" ? T.questions : t === "Words" ? T.words : T.numbers}
            </button>
          ))}
        </div>

        {/* RAG chips (mobile) */}
        {sortMode === "RAG" && !WIDE && (
          <div className="mt-3 flex items-center gap-2">
            {["All", "🔴", "🟠", "🟢"].map((x) => (
              <button
                key={x}
                onClick={() => setRagChip(x)}
                className={cn(
                  "px-2 py-1 rounded-md text-xs border",
                  ragChip === x ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-700"
                )}
              >
                {x}
              </button>
            ))}
          </div>
        )}

        {/* tri-column grid (wide) or list (mobile) */}
        {sortMode === "RAG" && WIDE ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {["🔴", "🟠", "🟢"].map((k) => (
              <div key={k}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-white text-xs px-2 py-0.5 rounded-full bg-zinc-700">
                    {k}
                  </span>
                  <div className="text-sm text-zinc-400">{ragBuckets[k].length} item(s)</div>
                </div>
                <div className="space-y-2">
                  {ragBuckets[k].map((r) => {
                    const idx = rows.indexOf(r);
                    return <EntryCard key={r._id || idx} r={r} idx={idx} />;
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {chipFiltered.map((r) => {
              const idx = rows.indexOf(r);
              return <EntryCard key={r._id || idx} r={r} idx={idx} />;
            })}
          </div>
        )}

        {/* Add form */}
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <details>
              <summary className="cursor-pointer text-sm text-zinc-300">{T.addEntry}</summary>
              <AddForm />
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      {page === "library" ? <LibraryView /> : page === "settings" ? <SettingsView /> : <HomeView />}
      {/* Quiz modal */}
      {quizOn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            {quizQs.length > 0 && (() => {
              const item = quizQs[quizIdx];
              const questionText = item.English;
              const correctLt = item.Lithuanian;
              return (
                <>
                  <div className="text-sm text-zinc-400 mb-1">
                    {T.prompt} {quizIdx + 1} / {quizQs.length}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-lg font-medium flex-1">{questionText}</div>
                    <button
                      className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center font-semibold"
                      title="Tap = play, long-press = slow"
                      {...pressHandlers(correctLt)}
                    >
                      ►
                    </button>
                  </div>
                  <div className="text-sm text-zinc-400 mb-1">{T.chooseLT}</div>
                  <div className="space-y-2">
                    {quizOptions.map((opt) => {
                      const isSelected = quizChoice === opt;
                      const isCorrect = opt === correctLt;
                      const showColors = quizAnswered;
                      const base =
                        "w-full text-left px-3 py-2 rounded-md border flex items-center justify-between gap-2";
                      const color = !showColors
                        ? "bg-zinc-900 border-zinc-700"
                        : isCorrect
                        ? "bg-emerald-700/40 border-emerald-600"
                        : isSelected
                        ? "bg-red-900/40 border-red-600"
                        : "bg-zinc-900 border-zinc-700";
                      return (
                        <button
                          key={opt}
                          className={`${base} ${color}`}
                          onClick={() => !quizAnswered && answerQuiz(opt)}
                        >
                          <span className="flex-1">{opt}</span>
                          <span
                            className="shrink-0 w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center"
                            title="Tap = play, long-press = slow"
                            {...pressHandlers(opt)}
                          >
                            🔊
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => setQuizOn(false)}
                      className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
                    >
                      Close
                    </button>
                    {quizAnswered ? (
                      <button
                        onClick={afterAnswerAdvance}
                        className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md text-sm font-semibold"
                      >
                        {T.nextQuestion}
                      </button>
                    ) : (
                      <div className="text-sm text-zinc-400">&nbsp;</div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

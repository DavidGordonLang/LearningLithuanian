import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lithuanian Trainer — App.jsx
 * Fixes:
 * - i18n restored (UI labels switch by Direction: EN→LT = English UI, LT→EN = Lithuanian UI)
 * - Sort "Newest/Oldest" now uses updatedAt (fallback createdAt) + stable tie-break
 */

const SHEETS = ["Phrases", "Questions", "Words", "Numbers"];

// ---------------- Storage keys ----------------
const LSK_ROWS = "lt_phrasebook_v3";
const LSK_SETTINGS = "lt_settings_v1";
const LSK_STREAK = "lt_quiz_streak_v1";
const LSK_XP = "lt_xp_v1";

// Old keys (migration)
const OLD_LSK_ROWS = "lt_phrasebook_v2";
const OLD_LSK_TTS_PROVIDER = "lt_tts_provider";
const OLD_LSK_AZURE_KEY = "lt_azure_key";
const OLD_LSK_AZURE_REGION = "lt_azure_region";
const OLD_LSK_AZURE_VOICE = "lt_azure_voice";

// ---------------- Settings defaults ----------------
const defaultSettings = {
  ttsProvider: "azure", // "azure" | "browser"
  azureKey: "",
  azureRegion: "",
  azureVoiceShortName: "",
  browserVoiceName: "",
  mode: "EN2LT", // EN2LT | LT2EN  (also drives UI language)
  sort: "RAG", // RAG | NEW | OLD
  ragPriority: "", // "", "🔴", "🟠", "🟢"
};

// ---------------- Starters ----------------
const STARTER_MAP = {
  EN2LT: "/data/Starter_EN_to_LT_v3.json",
  LT2EN: "/data/Starter_LT_to_EN_v3.json",
  NUMBERS: "/data/Starter_Numbers_v1.json",
};

// ---------------- i18n ----------------
const I18N = {
  en: {
    appTitle: "Lithuanian Trainer",
    tagline: "Tap to play. Long-press to savour.",
    home: "Home",
    library: "Library",
    settings: "Settings",
    startQuiz: "Start Quiz",
    search: "Search...",
    sort: "Sort",
    sortRAG: "RAG",
    sortNewest: "Newest",
    sortOldest: "Oldest",
    streak: "Streak",
    levelShort: "Lv",
    xp: "XP",
    all: "All",
    showDetails: "Show details",
    hideDetails: "Hide details",
    phonetic: "Phonetic",
    category: "Category",
    usage: "Usage",
    notes: "Notes",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    addEntrySummary: "+ Add entry",
    add: "Add",
    english: "English",
    lithuanian: "Lithuanian",
    rag: "RAG",
    sheet: "Sheet",
    // settings page
    direction: "Direction",
    en2lt: "EN → LT",
    lt2en: "LT → EN",
    voiceProvider: "Voice provider",
    browserFallback: "Browser (fallback)",
    azureSpeech: "Azure Speech",
    subKey: "Subscription Key",
    region: "Region",
    voice: "Voice",
    fetchVoices: "Fetch voices",
    // library
    libraryTitle: "Library",
    libraryHint:
      "Import data (JSON or Excel). New rows are appended and duplicates are merged.",
    importJson: "Import JSON",
    importXlsx: "Import .xlsx",
    exportJson: "Export JSON",
    clearLibrary: "Clear Library",
    confirmClear: "Clear the entire library? This cannot be undone.",
    starters: "Starter packs",
    starterENLT: "Install EN→LT starter",
    starterLTEN: "Install LT→EN starter",
    starterNUM: "Install Numbers pack",
    // duplicates
    dupeFinder: "Duplicate finder",
    scanDupes: "Scan duplicates",
    exactDupes: (n) => `Exact duplicates: ${n} group(s)`,
    selectOlder: "Select older in each group",
    closeMatches: (n) => `Close matches: ${n} pair(s)`,
    archiveSelected: "Archive selected",
    showArchived: "Show archived items",
    restore: "Restore",
    emptyArchive: "Empty archive",
    totalItems: "Total items",
    active: "Active",
    archived: "Archived",
    // quiz
    quit: "Quit",
    prompt: "Prompt",
    chooseLt: "Choose the Lithuanian",
    correct: "Correct!",
    notQuite: "Not quite.",
    nextQuestion: "Next Question",
    // dialogs
    confirmDelete: "Delete this entry?",
    needMore: "Add more entries first (need at least 4).",
    noCandidates: "No quiz candidates found.",
  },
  lt: {
    appTitle: "Anglų kalbos treniruoklis",
    tagline: "Palieskite – groti. Ilgai paspauskite – lėtai.",
    home: "Pagrindinis",
    library: "Biblioteka",
    settings: "Nustatymai",
    startQuiz: "Pradėti viktoriną",
    search: "Paieška...",
    sort: "Rikiuoti",
    sortRAG: "RAG",
    sortNewest: "Naujausi",
    sortOldest: "Seniausi",
    streak: "Serija",
    levelShort: "Lyg.",
    xp: "XP",
    all: "Visi",
    showDetails: "Rodyti detales",
    hideDetails: "Slėpti detales",
    phonetic: "Tarimas",
    category: "Kategorija",
    usage: "Vartojimas",
    notes: "Pastabos",
    edit: "Redaguoti",
    delete: "Trinti",
    save: "Išsaugoti",
    cancel: "Atšaukti",
    addEntrySummary: "+ Pridėti įrašą",
    add: "Pridėti",
    english: "Angliškai",
    lithuanian: "Lietuviškai",
    rag: "RAG",
    sheet: "Skiltis",
    // settings page
    direction: "Kryptis",
    en2lt: "EN → LT",
    lt2en: "LT → EN",
    voiceProvider: "Balso paslaugų teikėjas",
    browserFallback: "Naršyklė (atsarginis)",
    azureSpeech: "Azure kalba",
    subKey: "Prenumeratos raktas",
    region: "Regionas",
    voice: "Balsas",
    fetchVoices: "Gauti balsus",
    // library
    libraryTitle: "Biblioteka",
    libraryHint:
      "Importuokite duomenis (JSON arba Excel). Naujos eilutės pridedamos, dublikatai sujungiami.",
    importJson: "Importuoti JSON",
    importXlsx: "Importuoti .xlsx",
    exportJson: "Eksportuoti JSON",
    clearLibrary: "Išvalyti biblioteką",
    confirmClear: "Išvalyti visą biblioteką? Veiksmo atšaukti negalima.",
    starters: "Pradžios paketai",
    starterENLT: "Įdiegti EN→LT paketą",
    starterLTEN: "Įdiegti LT→EN paketą",
    starterNUM: "Įdiegti skaičių paketą",
    // duplicates
    dupeFinder: "Dublikatų paieška",
    scanDupes: "Ieškoti dublikatų",
    exactDupes: (n) => `Tikslūs dublikatai: ${n} grupė(s)`,
    selectOlder: "Pasirinkti senesnius kiekvienoje grupėje",
    closeMatches: (n) => `Artimi atitikmenys: ${n} pora(-os)`,
    archiveSelected: "Archyvuoti pažymėtus",
    showArchived: "Rodyti archyvuotus įrašus",
    restore: "Atkurti",
    emptyArchive: "Išvalyti archyvą",
    totalItems: "Iš viso",
    active: "Aktyvūs",
    archived: "Archyvuoti",
    // quiz
    quit: "Baigti",
    prompt: "Užduotis",
    chooseLt: "Pasirinkite lietuvišką variantą",
    correct: "Teisingai!",
    notQuite: "Neteisinga.",
    nextQuestion: "Kitas klausimas",
    // dialogs
    confirmDelete: "Pašalinti šį įrašą?",
    needMore: "Pirmiausia pridėkite daugiau įrašų (reikia bent 4).",
    noCandidates: "Nerasta viktorinos kandidatų.",
  },
};

function tForMode(mode) {
  return mode === "LT2EN" ? I18N.lt : I18N.en;
}

// ---------------- Utils ----------------
function normalizeRag(icon = "") {
  const s = String(icon).trim();
  const low = s.toLowerCase();
  if (["🔴", "🟥", "red"].includes(s) || low === "red") return "🔴";
  if (
    ["🟠", "🟧", "🟨", "🟡"].includes(s) ||
    ["amber", "orange", "yellow"].includes(low)
  )
    return "🟠";
  if (["🟢", "🟩", "green"].includes(s) || low === "green") return "🟢";
  return "🟠";
}
const cn = (...xs) => xs.filter(Boolean).join(" ");
const todayKey = () => new Date().toISOString().slice(0, 10);
const rowKey = (r) =>
  `${(r.English || "").trim().toLowerCase()}|${(r.Lithuanian || "")
    .trim()
    .toLowerCase()}|${(r.Sheet || "").trim().toLowerCase()}`;

const levelForXp = (xp) => Math.max(1, Math.floor(xp / 2500) + 1);
const levelProgress = (xp) => {
  const base = (levelForXp(xp) - 1) * 2500;
  return Math.max(0, Math.min(1, (xp - base) / 2500));
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function weightedPick(pool, n) {
  const a = shuffle(pool);
  return a.slice(0, n);
}

// Fuzzy helpers (duplicate scan)
function stripDiacritics(s) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}
function normalizeText(s) {
  return stripDiacritics(String(s || "").toLowerCase())
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function levenshtein(a, b) {
  const m = a.length,
    n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  if (m < n) return levenshtein(b, a);
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    const ai = a.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const cost = ai === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}
function similarity(a, b) {
  const A = normalizeText(a),
    B = normalizeText(b);
  if (!A && !B) return 1;
  const d = levenshtein(A, B);
  return 1 - d / Math.max(A.length, B.length);
}

// XLSX UMD loader
async function loadXLSX() {
  if (window.XLSX) return window.XLSX;
  const urls = [
    "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.19.3/xlsx.full.min.js",
    "https://cdn.jsdelivr.net/npm/xlsx@0.19.3/dist/xlsx.full.min.js",
    "https://unpkg.com/xlsx@0.19.3/dist/xlsx.full.min.js",
  ];
  let lastErr;
  for (const src of urls) {
    try {
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => res();
        s.onerror = (e) => rej(e);
        document.head.appendChild(s);
      });
      if (window.XLSX) return window.XLSX;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Failed to load XLSX");
}

// Browser voices
function useVoices() {
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    const refresh = () => {
      const vs = window.speechSynthesis?.getVoices?.() || [];
      setVoices(
        [...vs].sort((a, b) => {
          const aLt = (a.lang || "").toLowerCase().startsWith("lt");
          const bLt = (b.lang || "").toLowerCase().startsWith("lt");
          if (aLt && !bLt) return -1;
          if (bLt && !aLt) return 1;
          return a.name.localeCompare(b.name);
        })
      );
    };
    refresh();
    window.speechSynthesis?.addEventListener?.("voiceschanged", refresh);
    return () =>
      window.speechSynthesis?.removeEventListener?.("voiceschanged", refresh);
  }, []);
  return voices;
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

// Azure TTS
function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
async function speakAzureHTTP(text, shortName, key, region, rateDelta = "0%") {
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml = `<speak version="1.0" xml:lang="lt-LT">
    <voice name="${shortName}">
      <prosody rate="${rateDelta}">${escapeXml(text)}</prosody>
    </voice>
  </speak>`;
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
  const fileRefJson = useRef(null);
  const fileRefXlsx = useRef(null);
  const addDetailsRef = useRef(null);
  const audioRef = useRef(null);

  const [page, setPage] = useState("home");
  const [tab, setTab] = useState("Phrases");
  const [q, setQ] = useState("");
  const [sortOpen, setSortOpen] = useState(false);

  // rows
  const [rows, setRows] = useState(() => {
    try {
      const raw = localStorage.getItem(LSK_ROWS);
      if (raw) return JSON.parse(raw);
      const oldRaw = localStorage.getItem(OLD_LSK_ROWS);
      if (oldRaw) {
        const migrated = JSON.parse(oldRaw) || [];
        localStorage.setItem(LSK_ROWS, JSON.stringify(migrated));
        return migrated;
      }
    } catch {}
    return [];
  });

  // settings (with migration)
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(LSK_SETTINGS);
      if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
      const s = { ...defaultSettings };
      const tp = localStorage.getItem(OLD_LSK_TTS_PROVIDER);
      if (tp) s.ttsProvider = tp;
      const ak = localStorage.getItem(OLD_LSK_AZURE_KEY);
      if (ak) s.azureKey = ak;
      const ar = localStorage.getItem(OLD_LSK_AZURE_REGION);
      if (ar) s.azureRegion = ar;
      try {
        const av = JSON.parse(localStorage.getItem(OLD_LSK_AZURE_VOICE) || "null");
        if (av?.shortName) s.azureVoiceShortName = av.shortName;
      } catch {}
      localStorage.setItem(LSK_SETTINGS, JSON.stringify(s));
      return s;
    } catch {
      return defaultSettings;
    }
  });

  // streak / xp
  const [streak, setStreak] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LSK_STREAK)) || {
        streak: 0,
        lastDate: "",
      };
    } catch {
      return { streak: 0, lastDate: "" };
    }
  });
  const [xp, setXp] = useState(() => {
    try {
      return Number(JSON.parse(localStorage.getItem(LSK_XP))) || 0;
    } catch {
      return 0;
    }
  });

  // voices
  const [azureVoices, setAzureVoices] = useState([]);
  const voices = useVoices();
  const browserVoice = useMemo(
    () =>
      voices.find((v) => v.name === settings.browserVoiceName) ||
      voices.find((v) => (v.lang || "").toLowerCase().startsWith("lt")) ||
      voices[0],
    [voices, settings.browserVoiceName]
  );

  // persist
  useEffect(() => localStorage.setItem(LSK_ROWS, JSON.stringify(rows)), [rows]);
  useEffect(
    () => localStorage.setItem(LSK_SETTINGS, JSON.stringify(settings)),
    [settings]
  );
  useEffect(() => localStorage.setItem(LSK_STREAK, JSON.stringify(streak)), [streak]);
  useEffect(() => localStorage.setItem(LSK_XP, JSON.stringify(xp)), [xp]);

  const t = tForMode(settings.mode); // current UI dictionary

  const sortLabel =
    settings.sort === "RAG" ? t.sortRAG : settings.sort === "NEW" ? t.sortNewest : t.sortOldest;

  // audio (single channel)
  async function playText(text, { slow = false } = {}) {
    try {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = "";
        } catch {}
        audioRef.current = null;
      }
      document.activeElement?.blur?.();

      if (
        settings.ttsProvider === "azure" &&
        settings.azureKey &&
        settings.azureRegion &&
        settings.azureVoiceShortName
      ) {
        const delta = slow ? "-40%" : "0%";
        const url = await speakAzureHTTP(
          text,
          settings.azureVoiceShortName,
          settings.azureKey,
          settings.azureRegion,
          delta
        );
        const a = new Audio(url);
        audioRef.current = a;
        a.onended = () => {
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };
        await a.play();
      } else {
        window.speechSynthesis?.cancel?.();
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
    const start = (e) => {
      e.preventDefault();
      e.stopPropagation();
      firedSlow = false;
      timer = setTimeout(() => {
        firedSlow = true;
        playText(text, { slow: true });
      }, 550);
    };
    const end = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (timer) {
        clearTimeout(timer);
        timer = null;
        if (!firedSlow) playText(text, { slow: false });
      }
    };
    return {
      onPointerDown: start,
      onPointerUp: end,
      onPointerLeave: end,
    };
  }

  // CRUD
  const [draft, setDraft] = useState({
    English: "",
    Lithuanian: "",
    Phonetic: "",
    Category: "",
    Usage: "",
    Notes: "",
    "RAG Icon": "🟠",
    Sheet: "Phrases",
    __stats: { rc: 0, ac: 0, ai: 0, gi: 0 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  const [editIdx, setEditIdx] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  function addRow() {
    if (!draft.English || !draft.Lithuanian) {
      alert(`${t.english} & ${t.lithuanian} ${t.add.toLowerCase()}?`.replace(" pridėti?", "are required.")); // keep simple
      return;
    }
    const row = { ...draft, "RAG Icon": normalizeRag(draft["RAG Icon"]) };
    row.createdAt = Date.now();
    row.updatedAt = Date.now();
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
      __stats: { rc: 0, ac: 0, ai: 0, gi: 0 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    if (addDetailsRef.current) addDetailsRef.current.open = false;
    document.activeElement?.blur?.();
  }
  function startEdit(i) {
    setEditIdx(i);
    setEditDraft({ ...rows[i] });
  }
  function saveEdit(i) {
    const clean = {
      ...editDraft,
      "RAG Icon": normalizeRag(editDraft["RAG Icon"]),
      updatedAt: Date.now(),
    };
    setRows((prev) => prev.map((r, idx) => (idx === i ? clean : r)));
    setEditIdx(null);
    setEditDraft(null);
  }
  function remove(i) {
    if (!confirm(t.confirmDelete)) return;
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  // import/export/clear/starters
  function exportJson(current = rows) {
    const blob = new Blob([JSON.stringify(current, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lt-phrasebook.json";
    a.click();
    URL.revokeObject

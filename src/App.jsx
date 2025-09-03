import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lithuanian Trainer — App.jsx
 * Fixes:
 * - Full UI i18n toggle: when mode = LT→EN, the entire UI shows Lithuanian labels.
 * - Newest/Oldest sort works even for legacy rows (one-time migration sets createdAt).
 * - Keeps all recent features: single-channel audio (no double play), RAG play colors,
 *   JSON/XLSX import, starters, duplicate finder with Usage/Notes, archive, search clear X,
 *   centered streak/level, RAG sort + priority chips, quiz logic, etc.
 */

const SHEETS = ["Phrases", "Questions", "Words", "Numbers"];

// Storage keys
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

// Defaults
const defaultSettings = {
  ttsProvider: "azure", // "azure" | "browser"
  azureKey: "",
  azureRegion: "",
  azureVoiceShortName: "",
  browserVoiceName: "",
  mode: "EN2LT", // EN2LT | LT2EN   (LT2EN => UI in Lithuanian)
  sort: "RAG", // RAG | NEW | OLD
  ragPriority: "", // "", "🔴", "🟠", "🟢"
};

const STARTER_MAP = {
  EN2LT: "/data/Starter_EN_to_LT_v3.json",
  LT2EN: "/data/Starter_LT_to_EN_v3.json",
  NUMBERS: "/data/Starter_Numbers_v1.json",
};

// ---------------- i18n ----------------
const STRINGS = {
  EN: {
    appTitle: "Lithuanian Trainer",
    tagline: "Tap to play. Long-press to savour.",
    home: "Home",
    library: "Library",
    settings: "Settings",
    startQuiz: "Start Quiz",
    search: "Search...",
    sort: "Sort",
    sortRAG: "RAG",
    sortNew: "Newest",
    sortOld: "Oldest",
    streak: "Streak",
    level: "Level",
    xp: "XP",
    all: "All",
    tabs: { Phrases: "Phrases", Questions: "Questions", Words: "Words", Numbers: "Numbers" },
    showDetails: "Show details",
    hideDetails: "Hide details",
    phonetic: "Phonetic",
    category: "Category",
    usage: "Usage",
    notes: "Notes",
    edit: "Edit",
    del: "Delete",
    addEntry: "+ Add entry",
    add: "Add",
    english: "English",
    lithuanian: "Lithuanian",
    rag: "RAG",
    sheet: "Sheet",
    quit: "Quit",
    prompt: "Prompt",
    chooseLt: "Choose the Lithuanian",
    correct: "Correct!",
    notQuite: "Not quite.",
    nextQuestion: "Next Question",
    libTitle: "Library",
    libDesc: "Import data (JSON or Excel). New rows are appended and duplicates are merged.",
    importJson: "Import JSON",
    importXlsx: "Import .xlsx",
    exportJson: "Export JSON",
    clearLibrary: "Clear Library",
    starters: "Starter packs",
    installEN2LT: "Install EN→LT starter",
    installLT2EN: "Install LT→EN starter",
    installNUM: "Install Numbers pack",
    dupeFinder: "Duplicate finder",
    scanDupes: "Scan duplicates",
    exactDupes: "Exact duplicates",
    closeMatches: "Close matches",
    selectOlder: "Select older in each group",
    archiveSelected: "Archive selected",
    showArchived: "Show archived items",
    restore: "Restore",
    emptyArchive: "Empty archive",
    total: "Total items",
    active: "Active",
    archived: "Archived",
    direction: "Direction",
    en2lt: "EN → LT",
    lt2en: "LT → EN",
    voiceProvider: "Voice provider",
    browserFallback: "Browser (fallback)",
    azureSpeech: "Azure Speech",
    subscriptionKey: "Subscription Key",
    region: "Region",
    voice: "Voice",
    fetchVoices: "Fetch voices",
    // Alerts
    needMore: "Add more entries first (need at least 4).",
    noPool: "No quiz candidates found.",
    enterRegionKey: "Enter region and key first.",
    importOk: (n) => `Imported ${n} item(s).`,
    importXlsxOk: (n) => `Imported ${n} item(s) from XLSX.`,
    installOk: (n) => `Installed ${n} item(s) from starter pack.`,
    importFail: (m) => `Import failed: ${m}`,
    xlsxFail: (m) => `XLSX import failed: ${m}`,
    clearConfirm: "Clear the entire library? This cannot be undone.",
    delConfirm: "Delete this entry?",
    voiceError: "Voice error: ",
    selectNone: "No items selected.",
    archivedOk: "Selected items archived.",
  },
  LT: {
    appTitle: "Anglų kalbos treniruoklis",
    tagline: "Paliesk, kad klausytum. Ilgai spausk – lėčiau.",
    home: "Pagrindinis",
    library: "Biblioteka",
    settings: "Nustatymai",
    startQuiz: "Pradėti viktoriną",
    search: "Paieška...",
    sort: "Rūšiuoti",
    sortRAG: "RAG",
    sortNew: "Naujausi",
    sortOld: "Seniausi",
    streak: "Serija",
    level: "Lygis",
    xp: "XP",
    all: "Visi",
    tabs: { Phrases: "Frazės", Questions: "Klausimai", Words: "Žodžiai", Numbers: "Skaičiai" },
    showDetails: "Rodyti informaciją",
    hideDetails: "Slėpti informaciją",
    phonetic: "Tarimas",
    category: "Kategorija",
    usage: "Vartojimas",
    notes: "Pastabos",
    edit: "Redaguoti",
    del: "Šalinti",
    addEntry: "+ Pridėti įrašą",
    add: "Pridėti",
    english: "Anglų kalba",
    lithuanian: "Lietuvių kalba",
    rag: "RAG",
    sheet: "Skiltis",
    quit: "Baigti",
    prompt: "Užduotis",
    chooseLt: "Pasirink lietuvišką variantą",
    correct: "Teisingai!",
    notQuite: "Ne visai.",
    nextQuestion: "Kitas klausimas",
    libTitle: "Biblioteka",
    libDesc:
      "Importuokite duomenis (JSON arba Excel). Naujos eilutės pridedamos, o dublikatai sujungiami.",
    importJson: "Importuoti JSON",
    importXlsx: "Importuoti .xlsx",
    exportJson: "Eksportuoti JSON",
    clearLibrary: "Išvalyti biblioteką",
    starters: "Pradiniai rinkiniai",
    installEN2LT: "Įdiegti EN→LT rinkinį",
    installLT2EN: "Įdiegti LT→EN rinkinį",
    installNUM: "Įdiegti Skaičių rinkinį",
    dupeFinder: "Dublikatų paieška",
    scanDupes: "Ieškoti dublikatų",
    exactDupes: "Tikslūs dublikatai",
    closeMatches: "Artimi atitikmenys",
    selectOlder: "Pažymėti senesnius kiekvienoje grupėje",
    archiveSelected: "Archyvuoti pažymėtus",
    showArchived: "Rodyti archyvuotus įrašus",
    restore: "Atkurti",
    emptyArchive: "Ištuštinti archyvą",
    total: "Iš viso",
    active: "Aktyvūs",
    archived: "Archyvuoti",
    direction: "Kryptis",
    en2lt: "EN → LT",
    lt2en: "LT → EN",
    voiceProvider: "Balso teikėjas",
    browserFallback: "Naršyklė (atsarginis)",
    azureSpeech: "Azure kalba",
    subscriptionKey: "Prenumeratos raktas",
    region: "Regionas",
    voice: "Balsas",
    fetchVoices: "Gauti balsus",
    // Alerts
    needMore: "Pirmiausia pridėkite daugiau įrašų (reikia bent 4).",
    noPool: "Nėra kandidatų viktorinai.",
    enterRegionKey: "Pirmiausia įveskite regioną ir raktą.",
    importOk: (n) => `Importuota ${n} įrašų.`,
    importXlsxOk: (n) => `Iš XLSX importuota ${n} įrašų.`,
    installOk: (n) => `Įdiegta ${n} įrašų iš pradinio rinkinio.`,
    importFail: (m) => `Importas nepavyko: ${m}`,
    xlsxFail: (m) => `XLSX importas nepavyko: ${m}`,
    clearConfirm: "Išvalyti visą biblioteką? Atstatyti nepavyks.",
    delConfirm: "Pašalinti šį įrašą?",
    voiceError: "Balso klaida: ",
    selectNone: "Nepasirinkta nė vieno įrašo.",
    archivedOk: "Pasirinkti įrašai archyvuoti.",
  },
};

// -------------- utils --------------
function normalizeRag(icon = "") {
  const s = String(icon).trim();
  const low = s.toLowerCase();
  if (["🔴", "🟥", "red"].includes(s) || low === "red") return "🔴";
  if (["🟠", "🟧", "🟨", "🟡"].includes(s) || ["amber", "orange", "yellow"].includes(low))
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

// Fuzzy helpers (for duplicate scan)
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

  // rows + migration
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

  // Persist
  useEffect(() => localStorage.setItem(LSK_ROWS, JSON.stringify(rows)), [rows]);
  useEffect(() => localStorage.setItem(LSK_SETTINGS, JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem(LSK_STREAK, JSON.stringify(streak)), [streak]);
  useEffect(() => localStorage.setItem(LSK_XP, JSON.stringify(xp)), [xp]);

  // One-time migration: ensure createdAt exists (preserve current order visually)
  useEffect(() => {
    if (!rows.length) return;
    const missing = rows.some((r) => !r.createdAt);
    if (!missing) return;
    // Assign increasing timestamps so current order is preserved as OLD->NEW left to right
    const now = Date.now();
    const updated = rows.map((r, i) => ({
      ...r,
      createdAt: r.createdAt || now - (rows.length - i) * 1000, // 1s apart
      updatedAt: r.updatedAt || now - (rows.length - i) * 1000,
    }));
    setRows(updated);
  }, []); // run once

  // i18n lang based on mode
  const uiLang = settings.mode === "LT2EN" ? "LT" : "EN";
  const T = STRINGS[uiLang];

  const sortLabel = settings.sort === "RAG" ? T.sortRAG : settings.sort === "NEW" ? T.sortNew : T.sortOld;

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
      alert((T.voiceError || "Voice error: ") + (e?.message || e));
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
      onContextMenu: (e) => e.preventDefault(),
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
      alert(uiLang === "LT" ? "Reikalingi laukeliai: Anglų ir Lietuvių." : "English & Lithuanian are required.");
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
    if (!confirm(T.delConfirm)) return;
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
    URL.revokeObjectURL(url);
  }
  function mergeRows(incoming) {
    setRows((prev) => {
      const map = new Map();
      [...prev, ...incoming].forEach((r) => {
        const k = rowKey(r);
        const ex = map.get(k);
        if (!ex || (r.updatedAt || 0) > (ex.updatedAt || 0)) map.set(k, r);
      });
      return Array.from(map.values());
    });
  }
  async function importJsonFile(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("JSON must be an array of rows.");
      const prepared = data
        .map((r) => ({
          English: r.English || "",
          Lithuanian: r.Lithuanian || "",
          Phonetic: r.Phonetic || "",
          Category: r.Category || "",
          Usage: r.Usage || "",
          Notes: r.Notes || "",
          "RAG Icon": normalizeRag(r["RAG Icon"] || r.RAG || "🟠"),
          Sheet: SHEETS.includes(r.Sheet) ? r.Sheet : "Phrases",
          __stats: r.__stats || { rc: 0, ac: 0, ai: 0, gi: 0 },
          __archived: !!r.__archived,
          createdAt: r.createdAt || Date.now(),
          updatedAt: Date.now(),
        }))
        .filter((r) => r.English || r.Lithuanian);
      mergeRows(prepared);
      alert(T.importOk(prepared.length));
    } catch (e) {
      console.error(e);
      alert(T.importFail(e.message));
    }
  }
  async function importXlsxFile(file) {
    try {
      const XLSX = await loadXLSX();
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const merged = [];
      const tabs = new Set(SHEETS);
      for (const name of wb.SheetNames) {
        const ws = wb.Sheets[name];
        if (!ws) continue;
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
        for (const r of json) {
          const row = {
            English: r.English ?? r.english ?? "",
            Lithuanian: r.Lithuanian ?? r.lithuanian ?? "",
            Phonetic: r.Phonetic ?? r.phonetic ?? "",
            Category: r.Category ?? r.category ?? "",
            Usage: r.Usage ?? r.usage ?? "",
            Notes: r.Notes ?? r.notes ?? "",
            "RAG Icon": normalizeRag(r["RAG Icon"] ?? r.RAG ?? r.rag ?? "🟠"),
            Sheet: tabs.has(name) ? name : SHEETS.includes(r.Sheet) ? r.Sheet : "Phrases",
            __stats: { rc: 0, ac: 0, ai: 0, gi: 0 },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          if (row.English || row.Lithuanian) merged.push(row);
        }
      }
      mergeRows(merged);
      alert(T.importXlsxOk(merged.length));
    } catch (e) {
      console.error(e);
      alert(T.xlsxFail(e.message));
    }
  }
  async function importStarter(which) {
    try {
      const url = STARTER_MAP[which];
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Starter not found at ${url}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Starter JSON invalid.");
      const prepared = data
        .map((r) => ({
          English: r.English || "",
          Lithuanian: r.Lithuanian || "",
          Phonetic: r.Phonetic || "",
          Category: r.Category || "",
          Usage: r.Usage || "",
          Notes: r.Notes || "",
          "RAG Icon": normalizeRag(r["RAG Icon"] || r.RAG || "🔴"),
          Sheet: SHEETS.includes(r.Sheet) ? r.Sheet : "Phrases",
          __stats: r.__stats || { rc: 0, ac: 0, ai: 0, gi: 0 },
          __archived: !!r.__archived,
          createdAt: r.createdAt || Date.now(),
          updatedAt: Date.now(),
        }))
        .filter((r) => r.English || r.Lithuanian);
      mergeRows(prepared);
      alert(T.installOk(prepared.length));
    } catch (e) {
      alert(e.message);
    }
  }
  function clearAll() {
    if (!confirm(T.clearConfirm)) return;
    setRows([]);
    setQ("");
    setTab("Phrases");
  }

  // filter/sort
  const filteredByTab = useMemo(() => {
    const arr = rows.filter((r) => !r.__archived && r.Sheet === tab);
    let out = arr;
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      out = out.filter((r) =>
        `${r.English} ${r.Lithuanian} ${r.Phonetic} ${r.Category} ${r.Usage} ${r.Notes}`
          .toLowerCase()
          .includes(qq)
      );
    }
    if (settings.sort === "NEW") {
      out = [...out].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (settings.sort === "OLD") {
      out = [...out].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    } else {
      const order = { "🔴": 0, "🟠": 1, "🟢": 2 };
      const priority = settings.ragPriority || "";
      const weight = (icon) =>
        (priority && icon !== priority ? 10 : 0) + (order[icon] ?? 99);
      out = [...out].sort(
        (a, b) =>
          weight(normalizeRag(a["RAG Icon"])) - weight(normalizeRag(b["RAG Icon"]))
      );
    }
    return out;
  }, [rows, tab, q, settings.sort, settings.ragPriority]);

  // quiz
  const [quizOn, setQuizOn] = useState(false);
  const [quizQs, setQuizQs] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizChoice, setQuizChoice] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizScore, setQuizScore] = useState(0);

  function startQuiz() {
    if (rows.filter((r) => !r.__archived).length < 4) {
      alert(T.needMore);
      return;
    }
    const active = rows.filter((r) => !r.__archived);
    const reds = active.filter((r) => normalizeRag(r["RAG Icon"]) === "🔴");
    const ambs = active.filter((r) => normalizeRag(r["RAG Icon"]) === "🟠");
    const grns = active.filter((r) => normalizeRag(r["RAG Icon"]) === "🟢");
    const pool = [
      ...weightedPick(reds, Math.ceil(10 * 0.5)),
      ...weightedPick(ambs, Math.ceil(10 * 0.4)),
      ...weightedPick(grns, Math.max(1, Math.floor(10 * 0.1))),
    ];
    const finalPool = shuffle(pool).slice(0, 10);
    if (!finalPool.length) {
      alert(T.noPool);
      return;
    }
    setQuizQs(finalPool);
    setQuizIdx(0);
    setQuizAnswered(false);
    setQuizChoice(null);
    setQuizScore(0);
    buildQuizOptions(finalPool[0], active);
    setQuizOn(true);
    setPage("home");
  }
  function buildQuizOptions(item, pool = rows.filter((r) => !r.__archived)) {
    const correct = item.Lithuanian;
    const others = shuffle(pool.filter((r) => r !== item && r.Lithuanian)).slice(0, 3);
    setQuizOptions(shuffle([correct, ...others.map((o) => o.Lithuanian)]));
  }
  function finishQuizAndStreak() {
    const today = todayKey();
    setStreak((s) => {
      let newStreak = s.streak;
      if (!s.lastDate) newStreak = 1;
      else if (s.lastDate !== today) {
        const d1 = new Date(s.lastDate + "T00:00:00");
        const d2 = new Date(today + "T00:00:00");
        const days = Math.round((d2 - d1) / 86400000);
        newStreak = days === 1 ? s.streak + 1 : 1;
      }
      return { streak: newStreak, lastDate: today };
    });
  }
  function updateRagAfterAnswer(item, correct) {
    setRows((prev) =>
      prev.map((r) => {
        if (rowKey(r) !== rowKey(item)) return r;
        const rag = normalizeRag(r["RAG Icon"]);
        const stats = { ...(r.__stats || { rc: 0, ac: 0, ai: 0, gi: 0 }) };
        if (correct) {
          if (rag === "🔴") {
            stats.rc = Math.min(9999, stats.rc + 1);
            if (stats.rc >= 5) {
              r["RAG Icon"] = "🟠";
              stats.rc = 0;
            }
          } else if (rag === "🟠") {
            stats.ac = Math.min(9999, stats.ac + 1);
            if (stats.ac >= 5) {
              r["RAG Icon"] = "🟢";
              stats.ac = 0;
              stats.ai = 0;
            }
          }
        } else {
          if (rag === "🟢") {
            r["RAG Icon"] = "🟠";
            stats.ac = 0;
            stats.gi = Math.min(9999, (stats.gi || 0) + 1);
          } else if (rag === "🟠") {
            stats.ai = Math.min(9999, (stats.ai || 0) + 1);
            if (stats.ai >= 3) {
              r["RAG Icon"] = "🔴";
              stats.ai = 0;
              stats.ac = 0;
            }
          }
        }
        return { ...r, __stats: stats, updatedAt: Date.now() };
      })
    );
  }
  async function answerQuiz(opt) {
    if (quizAnswered) return;
    const item = quizQs[quizIdx];
    const correctLt = item.Lithuanian;
    const ok = opt === correctLt;
    setQuizAnswered(true);
    setQuizChoice(opt);
    if (ok) setQuizScore((s) => s + 1);
    if (ok) setXp((x) => x + 50);
    await playText(correctLt, { slow: false });
    updateRagAfterAnswer(item, ok);
  }
  function nextQuiz() {
    const next = quizIdx + 1;
    if (next >= quizQs.length) {
      setQuizOn(false);
      finishQuizAndStreak();
      return;
    }
    setQuizIdx(next);
    setQuizAnswered(false);
    setQuizChoice(null);
    buildQuizOptions(quizQs[next]);
  }

  // Duplicate finder
  const [dupeScan, setDupeScan] = useState(null);
  const [selectedArchive, setSelectedArchive] = useState(new Set());
  const [showArchived, setShowArchived] = useState(false);

  function scanDuplicates() {
    const active = rows
      .map((r, idx) => ({ r, idx }))
      .filter((x) => !x.r.__archived);

    // exact
    const map = new Map();
    active.forEach(({ r, idx }) => {
      const k = rowKey(r);
      const list = map.get(k) || [];
      list.push(idx);
      map.set(k, list);
    });
    const exactGroups = Array.from(map.values()).filter((g) => g.length > 1);

    // close
    const CLOSE_THRESHOLD = 0.88;
    const closePairs = [];
    const bySheet = new Map();
    active.forEach((x) => {
      const arr = bySheet.get(x.r.Sheet) || [];
      arr.push(x);
      bySheet.set(x.r.Sheet, arr);
    });
    for (const [_sheet, arr] of bySheet) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const A = arr[i].r;
          const B = arr[j].r;
          const sEN = similarity(A.English, B.English);
          const sLT = similarity(A.Lithuanian, B.Lithuanian);
          const sim = Math.max(sEN, sLT);
          if (sim >= CLOSE_THRESHOLD)
            closePairs.push({ a: arr[i].idx, b: arr[j].idx, sim });
        }
      }
    }
    setDupeScan({ exactGroups, closePairs });
    setSelectedArchive(new Set());
  }
  function toggleArchiveSelection(idx) {
    setSelectedArchive((set) => {
      const n = new Set(set);
      if (n.has(idx)) n.delete(idx);
      else n.add(idx);
      return n;
    });
  }
  function selectOlderInGroups() {
    if (!dupeScan) return;
    const next = new Set(selectedArchive);
    dupeScan.exactGroups.forEach((group) => {
      const objs = group.map((i) => ({ i, t: rows[i].createdAt || 0 }));
      objs.sort((a, b) => b.t - a.t);
      for (let k = 1; k < objs.length; k++) next.add(objs[k].i);
    });
    setSelectedArchive(next);
  }
  function archiveSelected() {
    if (!selectedArchive.size) {
      alert(T.selectNone);
      return;
    }
    setRows((prev) =>
      prev.map((r, i) =>
        selectedArchive.has(i)
          ? { ...r, __archived: true, updatedAt: Date.now() }
          : r
      )
    );
    setSelectedArchive(new Set());
    alert(T.archivedOk);
  }
  function restoreArchived(i) {
    setRows((prev) =>
      prev.map((r, idx) =>
        idx === i ? { ...r, __archived: false, updatedAt: Date.now() } : r
      )
    );
  }
  function emptyArchive() {
    if (!confirm(uiLang === "LT" ? "Negrįžtamai ištrinti visus archyvuotus įrašus?" : "Permanently delete all archived items?")) return;
    setRows((prev) => prev.filter((r) => !r.__archived));
  }

  const ragBtnClass = (rag) =>
    rag === "🔴"
      ? "bg-red-600 hover:bg-red-500"
      : rag === "🟠"
      ? "bg-amber-500 hover:bg-amber-400"
      : "bg-emerald-600 hover:bg-emerald-500";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-500 flex items-center justify-center font-bold text-zinc-900">
              LT
            </div>
            <div className="leading-tight flex-1">
              <div className="text-lg font-semibold">{T.appTitle}</div>
              <div className="text-xs text-zinc-400">{T.tagline}</div>
            </div>

            {/* Browser voice selector (only when provider=browser) */}
            <select
              className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1"
              value={settings.browserVoiceName}
              onChange={(e) =>
                setSettings((s) => ({ ...s, browserVoiceName: e.target.value }))
              }
              disabled={settings.ttsProvider !== "browser"}
              title={
                settings.ttsProvider === "azure"
                  ? "Using Azure"
                  : "Browser voice"
              }
            >
              <option value="">{uiLang === "LT" ? "Automatinis balsas" : "Auto voice"}</option>
              {useVoices().map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Nav pills */}
          <div className="mt-2 flex items-center gap-2 overflow-x-auto">
            {[
              { id: "home", label: T.home },
              { id: "library", label: T.library },
              { id: "settings", label: T.settings },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPage(p.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border",
                  page === p.id
                    ? "bg-zinc-800 border-zinc-600"
                    : "bg-zinc-900 border-zinc-700"
                )}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={startQuiz}
              className="ml-auto bg-emerald-600 hover:bg-emerald-500 rounded-lg px-3 py-1.5 font-semibold"
            >
              {T.startQuiz}
            </button>
          </div>

          {/* Search + Sort */}
          <div className="mt-2 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={T.search}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm pr-8"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-700 hover:bg-zinc-600 text-xs flex items-center justify-center"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-2"
              >
                {T.sort}: {sortLabel}
              </button>
              {sortOpen && (
                <div className="absolute right-0 mt-1 z-50 min-w-[160px] bg-zinc-900 border border-zinc-700 rounded-md shadow-lg overflow-hidden">
                  {[
                    { id: "RAG", label: T.sortRAG },
                    { id: "NEW", label: T.sortNew },
                    { id: "OLD", label: T.sortOld },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSettings((s) => ({ ...s, sort: opt.id }));
                        setSortOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-zinc-800",
                        settings.sort === opt.id && "bg-zinc-800"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Streak/level bar + RAG chips */}
          <div className="mt-2 flex flex-col items-stretch gap-2">
            <div className="w-full">
              <div className="flex justify-center items-center gap-4 mb-1 text-xs text-zinc-400">
                <div>
                  🔥 {T.streak}: <span className="text-zinc-200">{streak.streak}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🥇</span>
                  <span>
                    {T.level} {levelForXp(xp)}
                  </span>
                  <span className="text-zinc-500">
                    {xp} {T.xp}
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-emerald-600"
                  style={{ width: `${Math.round(levelProgress(xp) * 100)}%` }}
                />
              </div>
            </div>

            {settings.sort === "RAG" && (
              <div className="grid grid-cols-4 gap-2 w-full">
                {[
                  { id: "", label: T.all },
                  { id: "🔴", color: "bg-red-500" },
                  { id: "🟠", color: "bg-amber-400" },
                  { id: "🟢", color: "bg-emerald-500" },
                ].map((x) => (
                  <button
                    key={x.id || "all"}
                    onClick={() =>
                      setSettings((s) => ({ ...s, ragPriority: x.id }))
                    }
                    className={cn(
                      "px-2 py-1 rounded-md text-xs border w-full flex items-center justify-center gap-2",
                      settings.ragPriority === x.id
                        ? "bg-emerald-600 border-emerald-600"
                        : "bg-zinc-900 border-zinc-700"
                    )}
                    title={x.id ? `Show ${x.id} first` : "No priority"}
                  >
                    {x.label ? (
                      x.label
                    ) : (
                      <span
                        className={cn(
                          "inline-block w-2.5 h-2.5 rounded-full",
                          x.color
                        )}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        {page === "home" && (
          <div className="max-w-xl mx-auto px-3 sm:px-4 pb-2">
            <div className="grid grid-cols-4 gap-2">
              {SHEETS.map((s) => (
                <button
                  key={s}
                  onClick={() => setTab(s)}
                  className={cn(
                    "w-full px-3 py-1.5 rounded-full text-sm border",
                    tab === s
                      ? "bg-emerald-600 border-emerald-600"
                      : "bg-zinc-900 border-zinc-800"
                  )}
                >
                  {T.tabs[s]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Home list */}
      {page === "home" && (
        <div className="max-w-xl mx-auto px-3 sm:px-4 pb-28">
          {filteredByTab.map((r, i) => {
            const idx = rows.indexOf(r);
            const isEditing = editIdx === idx;
            const speakText = settings.mode === "EN2LT" ? r.Lithuanian : r.English;

            return (
              <div
                key={`${rowKey(r)}-${i}`}
                className="mt-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3"
              >
                {!isEditing ? (
                  <div className="flex items-start gap-3">
                    <button
                      className={cn(
                        "shrink-0 w-10 h-10 rounded-xl transition flex items-center justify-center font-semibold select-none",
                        normalizeRag(r["RAG Icon"]) === "🔴"
                          ? "bg-red-600 hover:bg-red-500"
                          : normalizeRag(r["RAG Icon"]) === "🟠"
                          ? "bg-amber-500 hover:bg-amber-400"
                          : "bg-emerald-600 hover:bg-emerald-500"
                      )}
                      style={{ touchAction: "manipulation" }}
                      title={uiLang === "LT" ? "Paliesk – groti, ilgai spausk – lėčiau" : "Tap = play, long-press = slow"}
                      {...pressHandlers(speakText)}
                    >
                      ►
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-400 truncate">
                        {settings.mode === "EN2LT" ? r.English : r.Lithuanian}
                      </div>
                      <div className="text-lg leading-tight font-medium break-words">
                        {settings.mode === "EN2LT" ? r.Lithuanian : r.English}
                      </div>

                      <details className="mt-2">
                        <summary className="cursor-pointer text-[11px] px-2 py-0.5 inline-block rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800">
                          { /* toggle text via CSS won't localize; use details[open] trick below with two spans */ }
                          <span className="details-closed">{T.showDetails}</span>
                          <span className="details-open hidden">{T.hideDetails}</span>
                        </summary>
                        <div className="text-xs text-zinc-400 mt-2 space-y-1">
                          {r.Phonetic && (
                            <div>
                              <span className="text-zinc-500">{T.phonetic}: </span>
                              {r.Phonetic}
                            </div>
                          )}
                          {r.Category && (
                            <div>
                              <span className="text-zinc-500">{T.category}: </span>
                              {r.Category}
                            </div>
                          )}
                          {r.Usage && (
                            <div>
                              <span className="text-zinc-500">{T.usage}: </span>
                              {r.Usage}
                            </div>
                          )}
                          {r.Notes && (
                            <div>
                              <span className="text-zinc-500">{T.notes}: </span>
                              {r.Notes}
                            </div>
                          )}
                        </div>
                      </details>
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
                        {T.del}
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
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, English: e.target.value })
                          }
                        />
                      </label>
                      <label className="col-span-2">
                        {T.lithuanian}
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Lithuanian}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              Lithuanian: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        {T.phonetic}
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Phonetic}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, Phonetic: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        {T.category}
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Category}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, Category: e.target.value })
                          }
                        />
                      </label>
                      <label className="col-span-2">
                        {T.usage}
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Usage}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, Usage: e.target.value })
                          }
                        />
                      </label>
                      <label className="col-span-2">
                        {T.notes}
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Notes}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, Notes: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        {T.rag}
                        <select
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft["RAG Icon"]}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              "RAG Icon": normalizeRag(e.target.value),
                            })
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
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, Sheet: e.target.value })
                          }
                        >
                          {SHEETS.map((s) => (
                            <option key={s} value={s}>
                              {T.tabs[s]}
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
                        {uiLang === "LT" ? "Išsaugoti" : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setEditIdx(null);
                          setEditDraft(null);
                        }}
                        className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
                      >
                        {uiLang === "LT" ? "Atšaukti" : "Cancel"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add form */}
          <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800">
            <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
              <details ref={addDetailsRef}>
                <summary className="cursor-pointer text-sm text-zinc-300">
                  {T.addEntry}
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input
                    className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    placeholder={T.english}
                    value={draft.English}
                    onChange={(e) =>
                      setDraft({ ...draft, English: e.target.value })
                    }
                  />
                  <input
                    className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    placeholder={T.lithuanian}
                    value={draft.Lithuanian}
                    onChange={(e) =>
                      setDraft({ ...draft, Lithuanian: e.target.value })
                    }
                  />
                  <input
                    className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    placeholder={T.phonetic}
                    value={draft.Phonetic}
                    onChange={(e) =>
                      setDraft({ ...draft, Phonetic: e.target.value })
                    }
                  />
                  <input
                    className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    placeholder={T.category}
                    value={draft.Category}
                    onChange={(e) =>
                      setDraft({ ...draft, Category: e.target.value })
                    }
                  />
                  <input
                    className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    placeholder={T.usage}
                    value={draft.Usage}
                    onChange={(e) =>
                      setDraft({ ...draft, Usage: e.target.value })
                    }
                  />
                  <input
                    className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    placeholder={T.notes}
                    value={draft.Notes}
                    onChange={(e) =>
                      setDraft({ ...draft, Notes: e.target.value })
                    }
                  />
                  <select
                    className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    value={draft["RAG Icon"]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        "RAG Icon": normalizeRag(e.target.value),
                      })
                    }
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
                    {SHEETS.map((s) => (
                      <option key={s} value={s}>
                        {T.tabs[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addRow}
                    className="col-span-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-md px-3 py-2 text-sm font-semibold"
                  >
                    {T.add}
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Library */}
      {page === "library" && (
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
            <div className="text-lg font-semibold mb-2">{T.libTitle}</div>
            <div className="text-sm text-zinc-400 mb-2">{T.libDesc}</div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRefJson}
                type="file"
                accept=".json,application/json"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importJsonFile(f).finally(() => (e.target.value = ""));
                }}
                className="hidden"
              />
              <button
                onClick={() => fileRefJson.current?.click()}
                className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
              >
                {T.importJson}
              </button>

              <input
                ref={fileRefXlsx}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importXlsxFile(f).finally(() => (e.target.value = ""));
                }}
                className="hidden"
              />
              <button
                onClick={() => fileRefXlsx.current?.click()}
                className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
              >
                {T.importXlsx}
              </button>

              <button
                onClick={() => exportJson(rows)}
                className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
              >
                {T.exportJson}
              </button>

              <button
                onClick={clearAll}
                className="bg-zinc-900 border border-red-600 text-red-400 rounded-md text-sm px-3 py-2"
              >
                {T.clearLibrary}
              </button>
            </div>

            {/* Starters */}
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="text-sm font-medium mb-2">{T.starters}</div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
                  onClick={() => importStarter("EN2LT")}
                >
                  {T.installEN2LT}
                </button>
                <button
                  className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
                  onClick={() => importStarter("LT2EN")}
                >
                  {T.installLT2EN}
                </button>
                <button
                  className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
                  onClick={() => importStarter("NUMBERS")}
                >
                  {T.installNUM}
                </button>
              </div>
            </div>

            {/* Duplicate finder */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{T.dupeFinder}</div>
                <button
                  onClick={scanDuplicates}
                  className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
                >
                  {T.scanDupes}
                </button>
              </div>

              {dupeScan && (
                <div className="mt-3 space-y-4">
                  {/* Exact duplicates */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">
                        {T.exactDupes}: {dupeScan.exactGroups.length} group(s)
                      </div>
                      <button
                        onClick={selectOlderInGroups}
                        className="text-xs bg-zinc-800 px-2 py-1 rounded-md"
                      >
                        {T.selectOlder}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {dupeScan.exactGroups.map((group, gi) => (
                        <div key={gi} className="border border-zinc-800 rounded-md p-2">
                          <div className="text-xs text-zinc-400 mb-1">
                            Group {gi + 1}
                          </div>
                          {group.map((i) => {
                            const r = rows[i];
                            return (
                              <label key={i} className="flex items-start gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={selectedArchive.has(i)}
                                  onChange={() => toggleArchiveSelection(i)}
                                />
                                <div className="min-w-0">
                                  <div className="whitespace-normal">
                                    <b>{r.English}</b> — {r.Lithuanian}{" "}
                                    <span className="text-zinc-500">[{T.tabs[r.Sheet]}]</span>
                                  </div>
                                  {(r.Usage || r.Notes) && (
                                    <div className="mt-1 text-xs text-zinc-400 space-y-0.5">
                                      {r.Usage && (
                                        <div>
                                          <span className="text-zinc-500">{T.usage}: </span>
                                          {r.Usage}
                                        </div>
                                      )}
                                      {r.Notes && (
                                        <div>
                                          <span className="text-zinc-500">{T.notes}: </span>
                                          {r.Notes}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Close matches */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-md p-3">
                    <div className="font-medium mb-2">
                      {T.closeMatches}: {dupeScan.closePairs.length} pair(s)
                    </div>
                    <div className="space-y-3">
                      {dupeScan.closePairs.map((p, idx) => {
                        const a = rows[p.a], b = rows[p.b];
                        return (
                          <div key={idx} className="border border-zinc-800 rounded-md p-2">
                            <div className="text-xs text-zinc-400 mb-2">
                              Similarity: {(p.sim * 100).toFixed(0)}%
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* A */}
                              <label className="flex items-start gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={selectedArchive.has(p.a)}
                                  onChange={() => toggleArchiveSelection(p.a)}
                                />
                                <div className="min-w-0">
                                  <div className="whitespace-normal">
                                    <b>{a.English}</b> — {a.Lithuanian}{" "}
                                    <span className="text-zinc-500">[{T.tabs[a.Sheet]}]</span>
                                  </div>
                                  {(a.Usage || a.Notes) && (
                                    <div className="mt-1 text-xs text-zinc-400 space-y-0.5">
                                      {a.Usage && (
                                        <div>
                                          <span className="text-zinc-500">{T.usage}: </span>
                                          {a.Usage}
                                        </div>
                                      )}
                                      {a.Notes && (
                                        <div>
                                          <span className="text-zinc-500">{T.notes}: </span>
                                          {a.Notes}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </label>

                              {/* B */}
                              <label className="flex items-start gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={selectedArchive.has(p.b)}
                                  onChange={() => toggleArchiveSelection(p.b)}
                                />
                                <div className="min-w-0">
                                  <div className="whitespace-normal">
                                    <b>{b.English}</b> — {b.Lithuanian}{" "}
                                    <span className="text-zinc-500">[{T.tabs[b.Sheet]}]</span>
                                  </div>
                                  {(b.Usage || b.Notes) && (
                                    <div className="mt-1 text-xs text-zinc-400 space-y-0.5">
                                      {b.Usage && (
                                        <div>
                                          <span className="text-zinc-500">{T.usage}: </span>
                                          {b.Usage}
                                        </div>
                                      )}
                                      {b.Notes && (
                                        <div>
                                          <span className="text-zinc-500">{T.notes}: </span>
                                          {b.Notes}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-zinc-400">
                      {uiLang === "LT" ? "Pažymėta" : "Selected"}: {selectedArchive.size}
                    </div>
                    <button
                      onClick={archiveSelected}
                      className="bg-amber-600 hover:bg-amber-500 px-3 py-2 rounded-md text-sm"
                    >
                      {T.archiveSelected}
                    </button>
                  </div>
                </div>
              )}

              {/* Archive controls */}
              <div className="mt-4">
                <label className="text-sm flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                  />
                </label>
                <span className="text-sm ml-2">{T.showArchived}</span>

                {showArchived && (
                  <div className="mt-2 space-y-2">
                    {rows.map((r, i) =>
                      r.__archived ? (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-md p-2"
                        >
                          <div className="text-sm truncate">
                            <b>{r.English}</b> — {r.Lithuanian}{" "}
                            <span className="text-zinc-500">[{T.tabs[r.Sheet]}]</span>
                          </div>
                          <button
                            onClick={() => restoreArchived(i)}
                            className="text-xs bg-zinc-800 px-2 py-1 rounded-md"
                          >
                            {T.restore}
                          </button>
                        </div>
                      ) : null
                    )}
                    <button
                      onClick={emptyArchive}
                      className="bg-red-700 hover:bg-red-600 px-3 py-2 rounded-md text-sm"
                    >
                      {T.emptyArchive}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-zinc-400">
                {T.total}: <span className="text-zinc-200">{rows.length}</span> • {T.active}:{" "}
                <span className="text-zinc-200">
                  {rows.filter((r) => !r.__archived).length}
                </span>{" "}
                • {T.archived}:{" "}
                <span className="text-zinc-200">
                  {rows.filter((r) => r.__archived).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      {page === "settings" && (
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
            <div className="text-lg font-semibold mb-2">{T.settings}</div>

            {/* Direction */}
            <div className="mb-3">
              <div className="text-xs mb-1 text-zinc-400">{T.direction}</div>
              <div className="flex items-center gap-2">
                {[
                  { id: "EN2LT", label: T.en2lt },
                  { id: "LT2EN", label: T.lt2en },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSettings((s) => ({ ...s, mode: m.id }))}
                    className={cn(
                      "px-2 py-1 rounded-md text-xs border",
                      settings.mode === m.id
                        ? "bg-emerald-600 border-emerald-600"
                        : "bg-zinc-900 border-zinc-700"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider */}
            <div className="mb-3">
              <div className="text-xs mb-1 text-zinc-400">{T.voiceProvider}</div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ttsprov"
                    checked={settings.ttsProvider === "browser"}
                    onChange={() =>
                      setSettings((s) => ({ ...s, ttsProvider: "browser" }))
                    }
                  />
                  {T.browserFallback}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ttsprov"
                    checked={settings.ttsProvider === "azure"}
                    onChange={() =>
                      setSettings((s) => ({ ...s, ttsProvider: "azure" }))
                    }
                  />
                  {T.azureSpeech}
                </label>
              </div>
            </div>

            {/* Azure config + voice picker */}
            {settings.ttsProvider === "azure" && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs mb-1">{T.subscriptionKey}</div>
                    <input
                      type="password"
                      value={settings.azureKey}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, azureKey: e.target.value }))
                      }
                      placeholder={uiLang === "LT" ? "Azure raktas" : "Azure key"}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <div className="text-xs mb-1">{T.region}</div>
                    <input
                      value={settings.azureRegion}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          azureRegion: e.target.value,
                        }))
                      }
                      placeholder={uiLang === "LT" ? "pvz., westeurope" : "e.g. westeurope"}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <div className="text-xs mb-1">{T.voice}</div>
                    <select
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                      value={settings.azureVoiceShortName}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          azureVoiceShortName: e.target.value,
                        }))
                      }
                    >
                      <option value="">{uiLang === "LT" ? "— pasirinkite —" : "— choose —"}</option>
                      {azureVoices.map((v) => (
                        <option key={v.ShortName} value={v.ShortName}>
                          {v.LocalName || v.FriendlyName || v.ShortName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        if (!settings.azureRegion || !settings.azureKey) {
                          alert(T.enterRegionKey);
                          return;
                        }
                        const url = `https://${settings.azureRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
                        const res = await fetch(url, {
                          headers: {
                            "Ocp-Apim-Subscription-Key": settings.azureKey,
                          },
                        });
                        if (!res.ok) throw new Error("Failed to fetch Azure voices");
                        const data = await res.json();
                        setAzureVoices(data || []);
                        const lt = data.find(
                          (v) => (v.Locale || "").toLowerCase() === "lt-lt"
                        );
                        if (lt && !settings.azureVoiceShortName) {
                          setSettings((s) => ({
                            ...s,
                            azureVoiceShortName: lt.ShortName,
                          }));
                        }
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
      )}

      {/* Quiz modal */}
      {quizOn && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-[92%] max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-zinc-400">
                {uiLang === "LT" ? "Klausimas" : "Question"} {quizIdx + 1} / {quizQs.length}
              </div>
              <button
                onClick={() => setQuizOn(false)}
                className="text-xs bg-zinc-800 px-2 py-1 rounded-md"
              >
                {T.quit}
              </button>
            </div>

            {quizQs.length > 0 && (
              <>
                {(() => {
                  const item = quizQs[quizIdx];
                  const questionText = item.English;
                  const correctLt = item.Lithuanian;
                  return (
                    <>
                      <div className="text-sm text-zinc-400 mb-1">{T.prompt}</div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-lg font-medium flex-1">
                          {questionText}
                        </div>
                        <button
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-semibold select-none",
                            normalizeRag(item["RAG Icon"]) === "🔴"
                              ? "bg-red-600 hover:bg-red-500"
                              : normalizeRag(item["RAG Icon"]) === "🟠"
                              ? "bg-amber-500 hover:bg-amber-400"
                              : "bg-emerald-600 hover:bg-emerald-500"
                          )}
                          style={{ touchAction: "manipulation" }}
                          title={uiLang === "LT" ? "Paliesk – groti, ilgai spausk – lėčiau" : "Tap = play, long-press = slow"}
                          {...pressHandlers(correctLt)}
                        >
                          ►
                        </button>
                      </div>

                      <div className="text-sm text-zinc-400 mb-1">{T.chooseLt}</div>
                      <div className="space-y-2">
                        {quizOptions.map((opt) => {
                          const isSelected = quizChoice === opt;
                          const isCorrect = opt === correctLt;
                          const show = quizAnswered;
                          const base =
                            "w-full text-left px-3 py-2 rounded-md border flex items-center justify-between gap-2";
                          const color = !show
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
                                className="shrink-0 w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center select-none"
                                style={{ touchAction: "manipulation" }}
                                title={uiLang === "LT" ? "Paliesk – groti, ilgai spausk – lėčiau" : "Tap = play, long-press = slow"}
                                {...pressHandlers(opt)}
                              >
                                🔊
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {quizAnswered && (
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-sm text-zinc-300">
                            {quizChoice === correctLt ? T.correct : T.notQuite}
                          </div>
                          <button
                            onClick={nextQuiz}
                            className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md text-sm font-semibold"
                          >
                            {T.nextQuestion}
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}

      {/* Small CSS tweak so details summary swaps text */}
      <style>{`
        details > summary .details-open { display: none; }
        details[open] > summary .details-closed { display: none; }
        details[open] > summary .details-open { display: inline; }
      `}</style>
    </div>
  );
}

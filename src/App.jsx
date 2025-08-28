import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lithuanian/English Trainer
 * - i18n UI (EN↔LT)
 * - Starter packs (merge + dedupe)
 * - XLSX import (merge + dedupe), JSON export
 * - TTS: Azure Speech (primary) + Browser (fallback)
 * - Quiz: 50% 🔴, 40% 🟠, 10% 🟢; RAG promotions/demotions
 * - XP/Levels/Badges, daily streak
 * - Tabs: Phrases, Questions, Words, Numbers
 * - RAG-colored play buttons; long-press no-select; global search with tab badges
 */

const COLS = ["English", "Lithuanian", "Phonetic", "Category", "Usage", "Notes", "RAG Icon", "Sheet"];
const SHEET_KEYS = ["Phrases", "Questions", "Words", "Numbers"];

const LS_KEY = "lt_phrasebook_v2";
const LSK_TTS_PROVIDER = "lt_tts_provider"; // 'browser' | 'azure'
const LSK_AZURE_KEY = "lt_azure_key";
const LSK_AZURE_REGION = "lt_azure_region";
const LSK_AZURE_VOICE = "lt_azure_voice"; // {shortName}
const LSK_STREAK = "lt_quiz_streak_v1";
const LSK_XP = "lt_quiz_xp_v1";
const LSK_ONBOARDED = "lt_onboarded_v1";

const XP_PER_CORRECT = 50;
const XP_PER_LEVEL = 2500;

// ---------------- i18n strings ----------------
const STR = {
  en: {
    title: "Lithuanian Trainer",
    subtitle: "Tap to play. Long-press to savour.",
    actions: {
      import: "Import .xlsx",
      export: "Export JSON",
      clear: "Clear data",
      settings: "Settings",
      startQuiz: "Start Quiz",
      close: "Close",
    },
    searchPlaceholder: "Search…",
    mode: "Mode:",
    ragSort: "Sort RAG first",
    filter: { all: "All" },
    streak: "Streak",
    level: "Lv",
    tabs: { Phrases: "Phrases", Questions: "Questions", Words: "Words", Numbers: "Numbers" },
    details: { show: "Show details", hide: "Hide details" },
    labels: {
      english: "English",
      lithuanian: "Lithuanian",
      phonetic: "Phonetic",
      category: "Category",
      usage: "Usage",
      notes: "Notes",
      rag: "RAG",
      sheet: "Sheet",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
    },
    addEntry: { summary: "+ Add entry", add: "Add" },
    tooltips: { tapHold: "Tap = play, long-press = slow" },
    quiz: {
      quit: "Quit",
      promptLabel: "Prompt",
      chooseLt: "Choose the Lithuanian",
      correct: "Correct! (+50 XP)",
      wrong: "Not quite.",
      next: "Next Question",
      score: "Score",
    },
    voice: { auto: "Auto voice", provider: "Voice provider", browser: "Browser (fallback)", azure: "Azure Speech" },
    settingsTitle: "Settings",
    startersTitle: "Starter packs",
    startersHint: "Merge more starter data into your library (won’t overwrite existing rows):",
    starters: { loadENLT: "Load EN→LT", loadLTEN: "Load LT→EN", loadBoth: "Load Both", openChooser: "Open chooser" },
    azure: { key: "Subscription Key", region: "Region (e.g. westeurope)", voice: "Voice", fetch: "Fetch voices" },
    searchAllNote: "Showing results across all tabs",
  },
  lt: {
    title: "Anglų kalbos treniruoklis",
    subtitle: "Bakstelėkite – leisti. Ilgai palaikykite – lėtai.",
    actions: {
      import: "Importuoti .xlsx",
      export: "Eksportuoti JSON",
      clear: "Išvalyti duomenis",
      settings: "Nustatymai",
      startQuiz: "Pradėti testą",
      close: "Uždaryti",
    },
    searchPlaceholder: "Paieška…",
    mode: "Režimas:",
    ragSort: "Rikiuoti RAG pirmiau",
    filter: { all: "Visi" },
    streak: "Serija",
    level: "Lygis",
    tabs: { Phrases: "Frazės", Questions: "Klausimai", Words: "Žodžiai", Numbers: "Skaičiai" },
    details: { show: "Rodyti detales", hide: "Slėpti detales" },
    labels: {
      english: "Anglų",
      lithuanian: "Lietuvių",
      phonetic: "Tarimas",
      category: "Kategorija",
      usage: "Naudojimas",
      notes: "Pastabos",
      rag: "RAG",
      sheet: "Lapas",
      edit: "Redaguoti",
      delete: "Šalinti",
      save: "Išsaugoti",
      cancel: "Atšaukti",
    },
    addEntry: { summary: "+ Pridėti įrašą", add: "Pridėti" },
    tooltips: { tapHold: "Bakstelėti = leisti, ilgai palaikyti = lėtai" },
    quiz: {
      quit: "Baigti",
      promptLabel: "Užduotis",
      chooseLt: "Pasirinkite lietuvišką variantą",
      correct: "Teisingai! (+50 XP)",
      wrong: "Ne visai.",
      next: "Kitas klausimas",
      score: "Rezultatas",
    },
    voice: { auto: "Automatinis balsas", provider: "Balso tiekėjas", browser: "Naršyklė (atsarginis)", azure: "Azure kalba" },
    settingsTitle: "Nustatymai",
    startersTitle: "Pradinių duomenų rinkiniai",
    startersHint: "Sujunkite pradinį rinkinį su biblioteka (neperrašys esamų įrašų):",
    starters: { loadENLT: "Įkelti EN→LT", loadLTEN: "Įkelti LT→EN", loadBoth: "Įkelti abu", openChooser: "Atidaryti pasirinkimą" },
    azure: { key: "Prenumeratos raktas", region: "Regionas (pvz., westeurope)", voice: "Balsas", fetch: "Gauti balsus" },
    searchAllNote: "Rodomi rezultatai iš visų kortelių",
  },
};

// ---------------- storage helpers ----------------
const saveData = (rows) => localStorage.setItem(LS_KEY, JSON.stringify(rows));
const loadData = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
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
const loadXp = () => {
  const v = Number(localStorage.getItem(LSK_XP) || "0");
  return Number.isFinite(v) ? v : 0;
};
const saveXp = (xp) => localStorage.setItem(LSK_XP, String(xp));

// ---------------- utils ----------------
function daysBetween(d1, d2) {
  const a = new Date(d1 + "T00:00:00");
  const b = new Date(d2 + "T00:00:00");
  return Math.round((b - a) / 86400000);
}
function normalizeRag(icon = "") {
  const s = String(icon).trim();
  const low = s.toLowerCase();
  if (["🔴", "🟥", "red"].includes(s) || low === "red") return "🔴";
  if (["🟠", "🟧", "🟨", "🟡"].includes(s) || ["amber", "orange", "yellow"].includes(low)) return "🟠";
  if (["🟢", "🟩", "green"].includes(s) || low === "green") return "🟢";
  return "";
}
function cn(...xs) {
  return xs.filter(Boolean).join(" ");
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
  if (n <= 0 || !arr.length) return [];
  if (n >= arr.length) return shuffle(arr);
  const idxs = new Set();
  while (idxs.size < n) idxs.add((Math.random() * arr.length) | 0);
  return [...idxs].map((i) => arr[i]);
}
function pickDistractors(pool, correct, key, n = 3) {
  const others = pool.filter((r) => r !== correct && r[key]);
  const uniqueByKey = [];
  const seen = new Set();
  for (const r of shuffle(others)) {
    const v = r[key];
    if (seen.has(v)) continue;
    seen.add(v);
    uniqueByKey.push(r);
    if (uniqueByKey.length >= n) break;
  }
  return uniqueByKey;
}
function numberWithCommas(x) {
  return (x ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function ragBtnClass(rag) {
  switch (rag) {
    case "🔴":
      return "bg-red-600 hover:bg-red-500 active:bg-red-700";
    case "🟠":
      return "bg-amber-500 hover:bg-amber-400 active:bg-amber-600";
    case "🟢":
      return "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700";
    default:
      return "bg-zinc-700";
  }
}
const noSelectStyle = {
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
  touchAction: "manipulation",
};
function normKey(s = "") {
  return String(s).normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
}
function rowKey(r) {
  return `${(r.Sheet || "").trim()}||${normKey(r.English)}||${normKey(r.Lithuanian)}`;
}
function mergeRows(existing, incoming) {
  const map = new Map(existing.map((r) => [rowKey(r), r]));
  for (const r of incoming) {
    const k = rowKey(r);
    if (!map.has(k)) {
      map.set(k, { ...r, "RAG Icon": normalizeRag(r["RAG Icon"]) });
    } else {
      const cur = map.get(k);
      map.set(k, {
        ...cur,
        ...r,
        English: cur.English || r.English,
        Lithuanian: cur.Lithuanian || r.Lithuanian,
        "RAG Icon": normalizeRag(r["RAG Icon"] || cur["RAG Icon"]),
        __stats: cur.__stats,
      });
    }
  }
  return Array.from(map.values());
}

// ---------------- XLSX loader ----------------
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
async function importXlsx(file) {
  const XLSX = await loadXLSX();
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const merged = [];
  const tabs = new Set(SHEET_KEYS);
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
        "RAG Icon": normalizeRag(r["RAG Icon"] ?? r.RAG ?? r.rag ?? ""),
        Sheet: tabs.has(name) ? name : r.Sheet || "Phrases",
      };
      if (row.English || row.Lithuanian) merged.push(row);
    }
  }
  return merged;
}
function exportJson(rows) {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lt-phrasebook.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------- Voice ----------------
function useVoices() {
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    function refresh() {
      const v = window.speechSynthesis?.getVoices?.() || [];
      const sorted = [...v].sort((a, b) => {
        const aLt = (a.lang || "").toLowerCase().startsWith("lt");
        const bLt = (b.lang || "").toLowerCase().startsWith("lt");
        if (aLt && !bLt) return -1;
        if (bLt && !aLt) return 1;
        return a.name.localeCompare(b.name);
      });
      setVoices(sorted);
    }
    refresh();
    window.speechSynthesis?.addEventListener?.("voiceschanged", refresh);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", refresh);
  }, []);
  return voices;
}
function speakBrowser(text, voice, rate = 1) {
  if (!window.speechSynthesis) {
    alert("Speech synthesis not supported.");
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang || "lt-LT";
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
function langFromAzureShortName(shortName) {
  const m = shortName?.match(/^[a-z]{2}-[A-Z]{2}/);
  return m ? m[0] : "lt-LT";
}
async function speakAzureHTTP(text, shortName, key, region, rateDelta = "0%") {
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const lang = langFromAzureShortName(shortName);
  const ssml =
    `<speak version="1.0" xml:lang="${lang}">` +
    `<voice name="${shortName}"><prosody rate="${rateDelta}">${escapeXml(text)}</prosody></voice>` +
    `</speak>`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
    },
    body: ssml,
  });
  if (!res.ok) throw new Error("Azure TTS failed: " + res.status + " " + res.statusText);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ---------------- App ----------------
export default function App() {
  const fileRef = useRef(null);

  const [rows, setRows] = useState(loadData());
  const [tab, setTab] = useState("Phrases");
  const [q, setQ] = useState("");
  const [direction, setDirection] = useState("EN2LT");
  const [voiceName, setVoiceName] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [ragPriority, setRagPriority] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const uiLang = direction === "EN2LT" ? "en" : "lt";
  const t = (k) => k.split(".").reduce((o, p) => (o ? o[p] : undefined), STR[uiLang]) ?? k;
  const tabLabel = (key) => STR[uiLang]?.tabs?.[key] ?? key;

  const [starterOpen, setStarterOpen] = useState(() => {
    try {
      const hasData = (loadData() || []).length > 0;
      const seen = !!localStorage.getItem(LSK_ONBOARDED);
      return !hasData && !seen;
    } catch {
      return true;
    }
  });

  const [ttsProvider, setTtsProvider] = useState(() => localStorage.getItem(LSK_TTS_PROVIDER) || "azure");

  // Azure
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

  // Streak / XP / Level
  const [streak, setStreak] = useState(loadStreak());
  const [xp, setXp] = useState(loadXp());
  const level = 1 + Math.floor(xp / XP_PER_LEVEL);
  const levelBaseXp = (level - 1) * XP_PER_LEVEL;
  const xpIntoLevel = xp - levelBaseXp;
  const progressPct = Math.max(0, Math.min(100, (xpIntoLevel / XP_PER_LEVEL) * 100));
  const levelBadge = (lvl) => {
    if (lvl >= 1000) return "🔱";
    if (lvl >= 500) return "🧠";
    if (lvl >= 200) return "🚀";
    if (lvl >= 100) return "🌟";
    if (lvl >= 50) return "👑";
    if (lvl >= 20) return "🏆";
    if (lvl >= 10) return "🥇";
    if (lvl >= 5) return "🥈";
    return "🥉";
  };

  // Quiz state
  const [quizOn, setQuizOn] = useState(false);
  const [quizQs, setQuizQs] = useState([]);
  theQuiz:  // label just to anchor line numbers if needed
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizChoice, setQuizChoice] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizShowCongrats, setQuizShowCongrats] = useState(false);
  const [quizSessionXp, setQuizSessionXp] = useState(0);
  const [quizStartLevel, setQuizStartLevel] = useState(level);
  const [quizSessionId, setQuizSessionId] = useState("");

  const voices = useVoices();
  const voice = useMemo(
    () => voices.find((v) => v.name === voiceName) || voices.find((v) => (v.lang || "").toLowerCase().startsWith("lt")) || voices[0],
    [voices, voiceName]
  );

  const audioRef = useRef(null);

  useEffect(() => saveData(rows), [rows]);
  useEffect(() => localStorage.setItem(LSK_TTS_PROVIDER, ttsProvider), [ttsProvider]);
  useEffect(() => { if (azureKey) localStorage.setItem(LSK_AZURE_KEY, azureKey); }, [azureKey]);
  useEffect(() => { if (azureRegion) localStorage.setItem(LSK_AZURE_REGION, azureRegion); }, [azureRegion]);
  useEffect(() => { localStorage.setItem(LSK_AZURE_VOICE, JSON.stringify({ shortName: azureVoiceShortName })); }, [azureVoiceShortName]);
  useEffect(() => saveStreak(streak), [streak]);
  useEffect(() => saveXp(xp), [xp]);

  const [draft, setDraft] = useState({
    English: "",
    Lithuanian: "",
    Phonetic: "",
    Category: "",
    Usage: "",
    Notes: "",
    "RAG Icon": "🟠",
    Sheet: "Phrases",
  });
  const [editIdx, setEditIdx] = useState(null);
  const [editDraft, setEditDraft] = useState(draft);
  const [expanded, setExpanded] = useState(new Set());
  useEffect(() => { setDraft((d) => ({ ...d, Sheet: tab })); }, [tab]);

  // ---- search (global) ----
  const searchActive = q.trim().length > 0;
  const qLower = q.trim().toLowerCase();
  const matchesQuery = (r) =>
    !searchActive
      ? true
      : `${r.English} ${r.Lithuanian} ${r.Phonetic} ${r.Category} ${r.Usage} ${r.Notes}`.toLowerCase().includes(qLower);

  const searchCounts = useMemo(() => {
    if (!searchActive) return {};
    const counts = {};
    for (const key of SHEET_KEYS) {
      counts[key] = rows.filter((r) => r.Sheet === key && matchesQuery(r)).length;
    }
    return counts;
  }, [rows, qLower, searchActive]);

  const filteredForActiveTab = useMemo(() => rows.filter((r) => r.Sheet === tab).filter(matchesQuery), [rows, tab, qLower, searchActive]);
  const groups = useMemo(() => {
    const buckets = { "🔴": [], "🟠": [], "🟢": [], "": [] };
    for (const r of filteredForActiveTab) buckets[normalizeRag(r["RAG Icon"]) || ""].push(r);
    const order = ["🔴", "🟠", "🟢", ""];
    const keys = ragPriority && order.includes(ragPriority) ? [ragPriority, ...order.filter((x) => x !== ragPriority)] : order;
    return keys.map((k) => ({ key: k, items: buckets[k] }));
  }, [filteredForActiveTab, ragPriority]);

  const searchBySheet = useMemo(() => {
    if (!searchActive) return [];
    return SHEET_KEYS.map((k) => ({
      key: k,
      items: rows.filter((r) => r.Sheet === k && matchesQuery(r)),
    })).filter((sec) => sec.items.length > 0);
  }, [rows, qLower, searchActive]);

  // ---- starters ----
  async function fetchStarter(path, sourceName) {
    const res = await fetch(path);
    if (!res.ok) throw new Error("Failed to fetch starter: " + path);
    const arr = await res.json();
    return arr.map((r) => ({ ...r, Source: sourceName }));
  }
  async function loadStarter(choice) {
    const map = {
      enlt: "/data/starter_en_to_lt.json",
      lten: "/data/starter_lt_to_en.json",
      both: "/data/starter_combined_dedup.json",
    };
    const path = map[choice];
    const label = choice === "both" ? "Starter (Both)" : choice === "enlt" ? "Starter (EN→LT)" : "Starter (LT→EN)";
    try {
      const incoming = await fetchStarter(path, label);
      setRows((prev) => mergeRows(prev, incoming));
      localStorage.setItem(LSK_ONBOARDED, "1");
      setStarterOpen(false);
      alert(label + " merged successfully.");
    } catch (e) {
      alert(e.message || String(e));
    }
  }

  // ---- audio ----
  async function playText(text, { slow = false } = {}) {
    try {
      if (ttsProvider === "azure" && azureKey && azureRegion && azureVoiceShortName) {
        const delta = slow ? "-40%" : "0%";
        const url = await speakAzureHTTP(text, azureVoiceShortName, azureKey, azureRegion, delta);
        if (audioRef.current) {
          try { audioRef.current.pause(); } catch {}
          audioRef.current = null;
        }
        const a = new Audio(url);
        audioRef.current = a;
        a.onended = () => {
          URL.revokeObjectURL(url);
          if (audioRef.current === a) audioRef.current = null;
        };
        await a.play();
      } else {
        const rate = slow ? 0.6 : 1.0;
        speakBrowser(text, voice, rate);
      }
    } catch (e) {
      console.error(e);
      alert("Voice error: " + (e?.message || e));
    }
  }
  function pressHandlers(text) {
    let timer = null;
    const start = (e) => {
      e.preventDefault();
      timer = window.setTimeout(() => {
        timer = null;
        playText(text, { slow: true });
      }, 550);
    };
    const end = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
        playText(text, { slow: false });
      }
    };
    const cancel = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    return {
      onPointerDown: start,
      onPointerUp: end,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onContextMenu: (e) => e.preventDefault(),
      title: t("tooltips.tapHold"),
    };
  }

  // ---- CRUD ----
  function addRow() {
    if (!draft.English || !draft.Lithuanian) {
      alert("English & Lithuanian are required");
      return;
    }
    const row = { ...draft, "RAG Icon": normalizeRag(draft["RAG Icon"]) };
    setRows((prev) => [row, ...prev]);
    setDraft({ ...draft, English: "", Lithuanian: "", Phonetic: "", Category: "", Usage: "", Notes: "" });
  }
  function startEdit(globalIdx) {
    setEditIdx(globalIdx);
    setEditDraft({ ...rows[globalIdx] });
  }
  function saveEdit(globalIdx) {
    const clean = { ...editDraft, "RAG Icon": normalizeRag(editDraft["RAG Icon"]) };
    setRows((prev) => prev.map((r, i) => (i === globalIdx ? clean : r)));
    setEditIdx(null);
  }
  function cancelEdit() { setEditIdx(null); }
  function remove(globalIdx) {
    if (!confirm("Delete this entry?")) return;
    setRows((prev) => prev.filter((_, i) => i !== globalIdx));
  }
  async function onImportFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const newRows = await importXlsx(f);
      if (!newRows.length) {
        alert("No rows found in workbook.");
        return;
      }
      const tagged = newRows.map((r) => ({ ...r, Source: f.name || "Import" }));
      setRows((prev) => mergeRows(prev, tagged));
      setTab("Phrases");
      setQ("");
      alert("Imported " + newRows.length + " rows (merged; duplicates skipped).");
    } catch (err) {
      console.error(err);
      alert("Failed to import .xlsx (see console)");
    } finally {
      e.target.value = "";
    }
  }
  function clearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    localStorage.removeItem(LS_KEY);
    setRows([]);
    setQ("");
    setTab("Phrases");
    setConfirmClear(false);
  }

  // ---- per-row stats + RAG rules ----
  function ensureStats(r) {
    const s = r.__stats || {};
    return {
      redCorrectSessions: Number(s.redCorrectSessions) || 0,
      amberCorrectSessions: Number(s.amberCorrectSessions) || 0,
      lastCreditedSessionForRed: s.lastCreditedSessionForRed || "",
      lastCreditedSessionForAmber: s.lastCreditedSessionForAmber || "",
      amberWrongSessions: Number(s.amberWrongSessions) || 0,
      lastWrongCreditedSessionForAmber: s.lastWrongCreditedSessionForAmber || "",
    };
  }
  function applyRagUpdateForAnswer(row, { correct, sessionId }) {
    const rag = normalizeRag(row["RAG Icon"]) || "🟠";
    const stats = ensureStats(row);
    let newRag = rag;
    let ns = { ...stats };

    if (correct) {
      if (rag === "🔴") {
        if (ns.lastCreditedSessionForRed !== sessionId) {
          ns.redCorrectSessions += 1;
          ns.lastCreditedSessionForRed = sessionId;
        }
        if (ns.redCorrectSessions >= 5) {
          newRag = "🟠";
          ns.redCorrectSessions = 0;
          ns.lastCreditedSessionForRed = "";
          ns.amberCorrectSessions = 0;
          ns.lastCreditedSessionForAmber = "";
          ns.amberWrongSessions = 0;
          ns.lastWrongCreditedSessionForAmber = "";
        }
      } else if (rag === "🟠") {
        if (ns.lastCreditedSessionForAmber !== sessionId) {
          ns.amberCorrectSessions += 1;
          ns.lastCreditedSessionForAmber = sessionId;
        }
        if (ns.amberCorrectSessions >= 5) {
          newRag = "🟢";
          ns.amberCorrectSessions = 0;
          ns.lastCreditedSessionForAmber = "";
          ns.amberWrongSessions = 0;
          ns.lastWrongCreditedSessionForAmber = "";
        }
      }
    } else {
      if (rag === "🟢") {
        newRag = "🟠";
        ns.amberCorrectSessions = 0;
        ns.lastCreditedSessionForAmber = "";
        ns.amberWrongSessions = 0;
        ns.lastWrongCreditedSessionForAmber = "";
      } else if (rag === "🟠") {
        if (ns.lastWrongCreditedSessionForAmber !== sessionId) {
          ns.amberWrongSessions += 1;
          ns.lastWrongCreditedSessionForAmber = sessionId;
        }
        if (ns.amberWrongSessions >= 3) {
          newRag = "🔴";
          ns.amberWrongSessions = 0;
          ns.lastWrongCreditedSessionForAmber = "";
          ns.amberCorrectSessions = 0;
          ns.lastCreditedSessionForAmber = "";
        }
      }
    }
    return { ...row, "RAG Icon": newRag, __stats: ns };
  }

  // ---- quiz ----
  function computeQuizPool(allRows, targetSize = 10) {
    const withPairs = allRows.filter((r) => r.English && r.Lithuanian);
    const red = withPairs.filter((r) => normalizeRag(r["RAG Icon"]) === "🔴");
    const amb = withPairs.filter((r) => {
      const n = normalizeRag(r["RAG Icon"]);
      return n === "🟠" || n === "";
    });
    const grn = withPairs.filter((r) => normalizeRag(r["RAG Icon"]) === "🟢");

    const wantR = Math.floor(targetSize * 0.5);
    const wantA = Math.floor(targetSize * 0.4);
    const wantG = targetSize - wantR - wantA;

    const pickR = sample(red, Math.min(wantR, red.length));
    const pickA = sample(amb, Math.min(wantA, amb.length));
    const pickG = sample(grn, Math.min(wantG, grn.length));

    let picked = [...pickR, ...pickA, ...pickG];
    if (picked.length < targetSize) {
      const left = withPairs.filter((r) => !picked.includes(r));
      picked = [...picked, ...sample(left, targetSize - picked.length)];
    }
    return shuffle(picked).slice(0, targetSize);
  }

  function startQuiz() {
    if (rows.length < 4) {
      alert("Add more entries first (need at least 4).");
      return;
    }
    const pool = computeQuizPool(rows, 10);
    if (!pool.length) {
      alert("No quiz candidates found.");
      return;
    }
    const sessionId = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
    setQuizSessionId(sessionId);

    setQuizQs(pool);
    setQuizIdx(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setQuizChoice(null);
    setQuizSessionXp(0);
    setQuizStartLevel(level);

    const first = pool[0];
    const keyAns = "Lithuanian";
    const distractors = pickDistractors(pool, first, keyAns, 3);
    setQuizOptions(shuffle([first[keyAns], ...distractors.map((d) => d[keyAns])]));
    setQuizOn(true);
  }
  function quitQuiz() {
    if (!confirm("Quit the quiz? Your progress for this session won't count toward streak.")) return;
    setQuizOn(false);
  }
  function afterAnswerAdvance() {
    const nextIdx = quizIdx + 1;
    if (nextIdx >= quizQs.length) {
      const today = todayKey();
      if (streak.lastDate !== today) {
        const inc = streak.lastDate && daysBetween(streak.lastDate, today) === 1 ? streak.streak + 1 : 1;
        setStreak({ streak: inc, lastDate: today });
      }
      setQuizShowCongrats(true);
      return;
    }
    setQuizIdx(nextIdx);
    setQuizAnswered(false);
    setQuizChoice(null);

    const item = quizQs[nextIdx];
    const keyAns = "Lithuanian";
    const distractors = pickDistractors(quizQs, item, keyAns, 3);
    setQuizOptions(shuffle([item[keyAns], ...distractors.map((d) => d[keyAns])]));
  }
  async function answerQuiz(option) {
    if (quizAnswered) return;
    const item = quizQs[quizIdx];
    const correctText = item["Lithuanian"];
    const ok = option === correctText;

    setQuizChoice(option);
    setQuizAnswered(true);
    if (ok) {
      setQuizScore((s) => s + 1);
      setXp((x) => x + XP_PER_CORRECT);
      setQuizSessionXp((g) => g + XP_PER_CORRECT);
    }

    const k = rowKey(item);
    setRows((prev) => {
      const idx = prev.findIndex((r) => rowKey(r) === k);
      if (idx < 0) return prev;
      const updated = applyRagUpdateForAnswer(prev[idx], { correct: ok, sessionId: quizSessionId });
      const next = [...prev];
      next[idx] = updated;
      return next;
    });

    await playText(correctText, { slow: false });
  }

  // ---- small UI helpers ----
  const PlayButton = ({ text, ragIcon, className = "" }) => (
    <button
      className={cn(
        "shrink-0 w-10 h-10 rounded-xl transition flex items-center justify-center font-semibold select-none",
        ragBtnClass(normalizeRag(ragIcon)),
        className
      )}
      style={noSelectStyle}
      onContextMenu={(e) => e.preventDefault()}
      draggable={false}
      {...pressHandlers(text)}
    >
      ►
    </button>
  );
  const TinyAudioButton = ({ text }) => (
    <button
      className="shrink-0 w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center select-none"
      style={noSelectStyle}
      onContextMenu={(e) => e.preventDefault()}
      draggable={false}
      {...pressHandlers(text)}
    >
      🔊
    </button>
  );

  // ---------------- render ----------------
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-[180px]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-500 flex items-center justify-center font-bold text-zinc-900">LT</div>
            <div className="leading-tight">
              <div className="text-lg font-semibold">{t("title")}</div>
              <div className="text-xs text-zinc-400">{t("subtitle")}</div>
            </div>
          </div>

          {/* Voice select (browser) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1 flex-1 sm:flex-none"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              disabled={ttsProvider !== "browser"}
              title={ttsProvider === "azure" ? "Azure" : "Browser"}
            >
              <option value="">{t("voice.auto")}</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap w-full sm:w-auto pt-2 sm:pt-0">
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onImportFile} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1">
              <span className="hidden sm:inline">{t("actions.import")}</span><span className="sm:hidden">📥 XLSX</span>
            </button>
            <button onClick={() => exportJson(rows)} className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1">
              <span className="hidden sm:inline">{t("actions.export")}</span><span className="sm:hidden">📤 JSON</span>
            </button>
            <button onClick={clearAll} className="bg-zinc-900 border border-red-600 text-red-400 rounded-md text-xs px-2 py-1">
              {confirmClear ? (uiLang === "lt" ? "Paspauskite dar kartą" : "Tap again") : (<><span className="hidden sm:inline">{t("actions.clear")}</span><span className="sm:hidden">🗑</span></>)}
            </button>
            <button onClick={() => setSettingsOpen(true)} className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1">
              <span className="hidden sm:inline">{t("actions.settings")}</span><span className="sm:hidden">⚙️</span>
            </button>
            <button onClick={startQuiz} className="bg-emerald-600 hover:bg-emerald-500 rounded-md text-xs px-3 py-1 font-semibold">
              {t("actions.startQuiz")}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="max-w-xl mx-auto px-3 sm:px-4 pb-2 sm:pb-3 flex items-center gap-2 flex-wrap">
          {/* Search with custom X */}
          <div className="relative flex-1 min-w-[180px]">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md pl-3 pr-8 py-2 text-sm outline-none"
            />
            {q && (
              <button
                aria-label={uiLang === "lt" ? "Išvalyti paiešką" : "Clear search"}
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 text-sm"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-zinc-300">{t("mode")}</span>
            {["EN2LT", "LT2EN"].map((m) => (
              <button
                key={m}
                onClick={() => setDirection(m)}
                className={cn("px-2 py-1 rounded-md text-xs border", direction === m ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-700")}
                title={m === "EN2LT" ? "English to Lithuanian" : "Lithuanian to English"}
              >
                {m === "EN2LT" ? "EN→LT" : "LT→EN"}
              </button>
            ))}
          </div>

          <div className="text-xs text-zinc-300">{t("ragSort")}:</div>
          <div className="flex items-center gap-1">
            {["", "🔴", "🟠", "🟢"].map((x, i) => (
              <button
                key={i}
                onClick={() => setRagPriority(x)}
                className={cn("px-2 py-1 rounded-md text-xs border", ragPriority === x ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-700")}
                title={x ? "Show " + x + " first" : uiLang === "lt" ? "Be prioriteto" : "No priority"}
              >
                {x || t("filter.all")}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-xs text-zinc-400 whitespace-nowrap">🔥 {t("streak")}: <span className="font-semibold">{streak.streak}</span></div>
            <div className="flex items-center gap-2">
              <span className="text-xs">{levelBadge(level)} <span className="font-semibold">{t("level")} {numberWithCommas(level)}</span></span>
              <div className="w-28 h-2 rounded bg-zinc-800 overflow-hidden">
                <div className="h-2 bg-emerald-600" style={{ width: progressPct + "%" }} />
              </div>
              <span className="text-[11px] text-zinc-400">{numberWithCommas(xpIntoLevel)} / {numberWithCommas(XP_PER_LEVEL)} XP</span>
            </div>
          </div>
        </div>

        {searchActive && (
          <div className="max-w-xl mx-auto px-3 sm:px-4 pb-2 text-[11px] text-zinc-400">
            {STR[uiLang].searchAllNote}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 sticky top-[78px] bg-zinc-950/90 backdrop-blur z-10 border-b border-zinc-900">
        {SHEET_KEYS.map((key) => {
          const count = searchActive ? (searchCounts[key] || 0) : 0;
          const highlight = searchActive && count > 0;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn("mr-2 mb-2 px-3 py-1.5 rounded-full text-sm border", tab === key ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-800", highlight ? "ring-1 ring-emerald-500" : "")}
            >
              {tabLabel(key)}{searchActive ? " (" + String(count) + ")" : ""}
            </button>
          );
        })}
      </div>

      {/* List / Search results */}
      {!quizOn && (
        <div className="max-w-xl mx-auto px-3 sm:px-4 pb-28">
          {!searchActive ? (
            groups.map(({ key, items }) => (
              <div key={key || "none"} className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-white text-xs px-2 py-0.5 rounded-full bg-zinc-700">{key || "⬤"}</span>
                  <div className="text-sm text-zinc-400">{items.length} item(s)</div>
                </div>
                <div className="space-y-2">
                  {items.map((r) => {
                    const idx = rows.indexOf(r);
                    const isEditing = editIdx === idx;
                    const primary = direction === "EN2LT" ? r.Lithuanian : r.English;
                    const secondary = direction === "EN2LT" ? r.English : r.Lithuanian;
                    const speakText = direction === "EN2LT" ? r.Lithuanian : r.English;
                    const rag = normalizeRag(r["RAG Icon"]) || "🟠";

                    return (
                      <div key={String(r.English) + "-" + String(idx)} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                        {!isEditing ? (
                          <div className="flex items-start gap-2">
                            <PlayButton text={speakText} ragIcon={rag} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-zinc-400 truncate">{secondary}</div>
                              <div className="text-lg leading-tight font-medium break-words">{primary}</div>
                              <div className="mt-1">
                                <button
                                  onClick={() => setExpanded((prev) => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; })}
                                  className="text-[11px] px-2 py-0.5 rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
                                >
                                  {STR[uiLang].details[expanded.has(idx) ? "hide" : "show"]}
                                </button>
                              </div>
                              {expanded.has(idx) && (
                                <>
                                  {r.Phonetic && <div className="text-xs text-zinc-400 mt-1">{r.Phonetic}</div>}
                                  {(r.Usage || r.Notes) && (
                                    <div className="text-xs text-zinc-500 mt-1">
                                      {r.Usage && <div className="mb-0.5"><span className="text-zinc-400">{STR[uiLang].labels.usage}: </span>{r.Usage}</div>}
                                      {r.Notes && <div className="opacity-80"><span className="text-zinc-400">{STR[uiLang].labels.notes}: </span>{r.Notes}</div>}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 ml-2">
                              <button onClick={() => startEdit(idx)} className="text-xs bg-zinc-800 px-2 py-1 rounded-md">{STR[uiLang].labels.edit}</button>
                              <button onClick={() => remove(idx)} className="text-xs bg-zinc-800 text-red-400 px-2 py-1 rounded-md">{STR[uiLang].labels.delete}</button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                              <label className="col-span-2">
                                {STR[uiLang].labels.english}
                                <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.English} onChange={(e) => setEditDraft({ ...editDraft, English: e.target.value })} />
                              </label>
                              <label className="col-span-2">
                                {STR[uiLang].labels.lithuanian}
                                <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.Lithuanian} onChange={(e) => setEditDraft({ ...editDraft, Lithuanian: e.target.value })} />
                              </label>
                              <label>
                                {STR[uiLang].labels.phonetic}
                                <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.Phonetic} onChange={(e) => setEditDraft({ ...editDraft, Phonetic: e.target.value })} />
                              </label>
                              <label>
                                {STR[uiLang].labels.category}
                                <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.Category} onChange={(e) => setEditDraft({ ...editDraft, Category: e.target.value })} />
                              </label>
                              <label className="col-span-2">
                                {STR[uiLang].labels.usage}
                                <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.Usage} onChange={(e) => setEditDraft({ ...editDraft, Usage: e.target.value })} />
                              </label>
                              <label className="col-span-2">
                                {STR[uiLang].labels.notes}
                                <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.Notes} onChange={(e) => setEditDraft({ ...editDraft, Notes: e.target.value })} />
                              </label>
                              <label>
                                {STR[uiLang].labels.rag}
                                <select className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft["RAG Icon"]} onChange={(e) => setEditDraft({ ...editDraft, "RAG Icon": normalizeRag(e.target.value) })}>
                                  {"🔴 🟠 🟢".split(" ").map((x) => (<option key={x} value={x}>{x}</option>))}
                                </select>
                              </label>
                              <label>
                                {STR[uiLang].labels.sheet}
                                <select className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white" value={editDraft.Sheet} onChange={(e) => setEditDraft({ ...editDraft, Sheet: e.target.value })}>
                                  {SHEET_KEYS.map((s) => (<option key={s} value={s}>{tabLabel(s)}</option>))}
                                </select>
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => saveEdit(idx)} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md text-sm font-semibold">{STR[uiLang].labels.save}</button>
                              <button onClick={cancelEdit} className="bg-zinc-800 px-3 py-2 rounded-md text-sm">{STR[uiLang].labels.cancel}</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            // search across sheets
            searchBySheet.map(({ key, items }) => (
              <div key={key} className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-white text-xs px-2 py-0.5 rounded-full bg-zinc-700">{tabLabel(key)}</span>
                  <div className="text-sm text-zinc-400">{items.length} item(s)</div>
                </div>
                <div className="space-y-2">
                  {items.map((r) => {
                    const idx = rows.indexOf(r);
                    const isEditing = editIdx === idx;
                    const primary = direction === "EN2LT" ? r.Lithuanian : r.English;
                    const secondary = direction === "EN2LT" ? r.English : r.Lithuanian;
                    const speakText = direction === "EN2LT" ? r.Lithuanian : r.English;
                    const rag = normalizeRag(r["RAG Icon"]) || "🟠";

                    return (
                      <div key={String(r.English) + "-" + String(idx)} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                        {!isEditing ? (
                          <div className="flex items-start gap-2">
                            <PlayButton text={speakText} ragIcon={rag} />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-zinc-400 truncate">{secondary}</div>
                              <div className="text-lg leading-tight font-medium break-words">{primary}</div>
                              <div className="mt-1">
                                <button
                                  onClick={() => setExpanded((prev) => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; })}
                                  className="text-[11px] px-2 py-0.5 rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
                                >
                                  {STR[uiLang].details[expanded.has(idx) ? "hide" : "show"]}
                                </button>
                              </div>
                              {expanded.has(idx) && (
                                <>
                                  {r.Phonetic && <div className="text-xs text-zinc-400 mt-1">{r.Phonetic}</div>}
                                  {(r.Usage || r.Notes) && (
                                    <div className="text-xs text-zinc-500 mt-1">
                                      {r.Usage && <div className="mb-0.5"><span className="text-zinc-400">{STR[uiLang].labels.usage}: </span>{r.Usage}</div>}
                                      {r.Notes && <div className="opacity-80"><span className="text-zinc-400">{STR[uiLang].labels.notes}: </span>{r.Notes}</div>}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 ml-2">
                              <button onClick={() => startEdit(idx)} className="text-xs bg-zinc-800 px-2 py-1 rounded-md">{STR[uiLang].labels.edit}</button>
                              <button onClick={() => remove(idx)} className="text-xs bg-zinc-800 text-red-400 px-2 py-1 rounded-md">{STR[uiLang].labels.delete}</button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">{/* same edit form as above omitted for brevity in search view */}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quiz */}
      {quizOn && (
        <div className="max-w-xl mx-auto px-3 sm:px-4 pb-28">
          <div className="mt-3 mb-2 flex items-center justify-between">
            <div className="text-sm text-zinc-400">{(uiLang === "lt" ? "Klausimas" : "Question") + " " + String(quizIdx + 1) + " / " + String(quizQs.length)}</div>
            <button onClick={quitQuiz} className="text-xs bg-zinc-800 px-2 py-1 rounded-md">{t("quiz.quit")}</button>
          </div>

          {quizQs.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              {(() => {
                const item = quizQs[quizIdx];
                const questionText = item.English;
                const correctLt = item.Lithuanian;
                const rag = normalizeRag(item["RAG Icon"]) || "🟠";
                return (
                  <>
                    <div className="text-sm text-zinc-400 mb-1">{t("quiz.promptLabel")}</div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-lg font-medium flex-1">{questionText}</div>
                      <PlayButton text={correctLt} ragIcon={rag} />
                    </div>
                    <div className="text-sm text-zinc-400 mb-1">{t("quiz.chooseLt")}</div>
                    <div className="space-y-2">
                      {quizOptions.map((opt) => {
                        const isSelected = quizChoice === opt;
                        const isCorrect = opt === correctLt;
                        const showColors = quizAnswered;
                        const base = "w-full text-left px-3 py-2 rounded-md border flex items-center justify-between gap-2";
                        const color = !showColors
                          ? "bg-zinc-900 border-zinc-700"
                          : isCorrect
                          ? "bg-emerald-700/40 border-emerald-600"
                          : isSelected
                          ? "bg-red-900/40 border-red-600"
                          : "bg-zinc-900 border-zinc-700";
                        return (
                          <button key={opt} className={base + " " + color} onClick={() => !quizAnswered && answerQuiz(opt)}>
                            <span className="flex-1">{opt}</span>
                            <TinyAudioButton text={opt} />
                          </button>
                        );
                      })}
                    </div>
                    {quizAnswered && (
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-zinc-300">{quizChoice === correctLt ? t("quiz.correct") : t("quiz.wrong")}</div>
                        <button onClick={afterAnswerAdvance} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md text-sm font-semibold">{t("quiz.next")}</button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
          <div className="mt-3 text-sm text-zinc-400">{t("quiz.score")}: {quizScore} / {quizQs.length}</div>
        </div>
      )}

      {/* Add form */}
      {!quizOn && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800">
          <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <details>
              <summary className="cursor-pointer text-sm text-zinc-300">{t("addEntry.summary")}</summary>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder={t("labels.english")} value={draft.English} onChange={(e) => setDraft({ ...draft, English: e.target.value })} />
                <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder={t("labels.lithuanian")} value={draft.Lithuanian} onChange={(e) => setDraft({ ...draft, Lithuanian: e.target.value })} />
                <input className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder={t("labels.phonetic")} value={draft.Phonetic} onChange={(e) => setDraft({ ...draft, Phonetic: e.target.value })} />
                <input className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder={t("labels.category")} value={draft.Category} onChange={(e) => setDraft({ ...draft, Category: e.target.value })} />
                <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder={t("labels.usage")} value={draft.Usage} onChange={(e) => setDraft({ ...draft, Usage: e.target.value })} />
                <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder={t("labels.notes")} value={draft.Notes} onChange={(e) => setDraft({ ...draft, Notes: e.target.value })} />
                <select className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" value={draft["RAG Icon"]} onChange={(e) => setDraft({ ...draft, "RAG Icon": normalizeRag(e.target.value) })}>
                  {"🔴 🟠 🟢".split(" ").map((x) => (<option key={x} value={x}>{x}</option>))}
                </select>
                <select className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" value={draft.Sheet} onChange={(e) => setDraft({ ...draft, Sheet: e.target.value })}>
                  {SHEET_KEYS.map((s) => (<option key={s} value={s}>{tabLabel(s)}</option>))}
                </select>
                <button onClick={addRow} className="col-span-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-md px-3 py-2 text-sm font-semibold">{t("addEntry.add")}</button>
              </div>
            </details>
          </div>
        </div>
      )}

      <div className="h-24" />

      {/* Settings */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[92%] max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-4">
            <div className="text-lg font-semibold mb-2">{t("settingsTitle")}</div>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs mb-1">{t("voice.provider")}</div>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2"><input type="radio" name="ttsprov" checked={ttsProvider === "browser"} onChange={() => setTtsProvider("browser")} /> {t("voice.browser")}</label>
                  <label className="flex items-center gap-2"><input type="radio" name="ttsprov" checked={ttsProvider === "azure"} onChange={() => setTtsProvider("azure")} /> {t("voice.azure")}</label>
                </div>
              </div>

              {ttsProvider === "azure" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs mb-1">{t("azure.key")}</div>
                      <input type="password" value={azureKey} onChange={(e) => setAzureKey(e.target.value)} placeholder="Azure key" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2" />
                    </div>
                    <div>
                      <div className="text-xs mb-1">{t("azure.region")}</div>
                      <input value={azureRegion} onChange={(e) => setAzureRegion(e.target.value)} placeholder="westeurope" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2" />
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <div className="text-xs mb-1">{t("azure.voice")}</div>
                      <select className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2" value={azureVoiceShortName} onChange={(e) => setAzureVoiceShortName(e.target.value)}>
                        <option value="">- choose -</option>
                        {azureVoices.map((v) => (<option key={v.shortName} value={v.shortName}>{v.displayName} ({v.shortName})</option>))}
                      </select>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const url = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
                          const res = await fetch(url, { headers: { "Ocp-Apim-Subscription-Key": azureKey } });
                          if (!res.ok) throw new Error("Failed to fetch Azure voices");
                          const data = await res.json();
                          const vs = data.map((v) => ({ shortName: v.ShortName, locale: v.Locale, displayName: v.LocalName || v.FriendlyName || v.ShortName }));
                          setAzureVoices(vs);
                          if (!azureVoiceShortName && vs.length) setAzureVoiceShortName(vs[0].shortName);
                        } catch (e) {
                          alert(e.message);
                        }
                      }}
                      className="bg-zinc-800 px-3 py-2 rounded-md"
                    >
                      {t("azure.fetch")}
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-md border border-zinc-700 bg-zinc-950">
                <div className="font-medium mb-1">{t("startersTitle")}</div>
                <div className="text-xs text-zinc-400 mb-2">{t("startersHint")}</div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => loadStarter("enlt")} className="bg-emerald-600 hover:bg-emerald-500 px-2 py-1 rounded-md text-xs font-semibold">{t("starters.loadENLT")}</button>
                  <button onClick={() => loadStarter("lten")} className="bg-emerald-600 hover:bg-emerald-500 px-2 py-1 rounded-md text-xs font-semibold">{t("starters.loadLTEN")}</button>
                  <button onClick={() => loadStarter("both")} className="bg-zinc-800 px-2 py-1 rounded-md text-xs">{t("starters.loadBoth")}</button>
                  <button onClick={() => setStarterOpen(true)} className="bg-zinc-800 px-2 py-1 rounded-md text-xs">{t("starters.openChooser")}</button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setSettingsOpen(false)} className="bg-emerald-600 px-3 py-2 rounded-md">{t("actions.close")}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Congrats modal */}
      {quizShowCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[92%] max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5 text-center">
            <div className="text-2xl font-semibold mb-1">Nice work! 🎉</div>
            <div className="text-zinc-300 mb-1">{(uiLang === "lt" ? "Jūsų rezultatas" : "You scored") + " " + String(quizScore) + " / " + String(quizQs.length) + "."}</div>
            <div className="text-sm text-emerald-400 mb-2">+{quizSessionXp} XP</div>
            {1 + Math.floor(xp / XP_PER_LEVEL) > quizStartLevel && (
              <div className="text-sm mb-2">
                {(uiLang === "lt" ? "Lygiu aukštyn! " : "Level Up! ") + levelBadge(1 + Math.floor(xp / XP_PER_LEVEL))} {uiLang === "lt" ? "Dabar" : "Now"} <span className="font-semibold">{STR[uiLang].level} {numberWithCommas(1 + Math.floor(xp / XP_PER_LEVEL))}</span>
              </div>
            )}
            <div className="text-sm text-zinc-400 mb-4">🔥 {t("streak")}: <span className="font-semibold text-emerald-400">{streak.streak}</span></div>
            <div className="flex justify-center gap-2">
              <button onClick={() => { setQuizShowCongrats(false); setQuizOn(false); }} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-md font-semibold">{uiLang === "lt" ? "Baigti" : "Done"}</button>
              <button onClick={() => { setQuizShowCongrats(false); startQuiz(); }} className="bg-zinc-800 px-4 py-2 rounded-md">{uiLang === "lt" ? "Bandyti dar kartą" : "Retry"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Starter chooser */}
      {starterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[92%] max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5 text-center">
            <div className="text-xl font-semibold mb-2">{uiLang === "lt" ? "Įkelti pradinį rinkinį?" : "Load starter pack?"}</div>
            <div className="text-sm text-zinc-300 mb-4">
              {uiLang === "lt"
                ? "Pasirinkite rinkinį – duomenys bus sujungti su biblioteka (galėsite pridėti daugiau vėliau)."
                : "Choose a starter deck to merge into your library (you can import more later)."}
            </div>
            <div className="grid grid-cols-1 gap-2 mb-3">
              <button onClick={() => loadStarter("enlt")} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-md font-semibold">EN→LT Starter</button>
              <button onClick={() => loadStarter("lten")} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-md font-semibold">LT→EN Starter</button>
              <button onClick={() => loadStarter("both")} className="bg-zinc-800 px-4 py-2 rounded-md">{uiLang === "lt" ? "Abu kartu" : "Both (combined)"}</button>
            </div>
            <button onClick={() => { localStorage.setItem(LSK_ONBOARDED, "1"); setStarterOpen(false); }} className="text-sm text-zinc-400 underline">{uiLang === "lt" ? "Praleisti" : "Skip for now"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
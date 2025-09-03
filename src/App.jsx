import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lithuanian Trainer — responsive build
 * - Full-width header on large screens
 * - Tri-column (🔴/🟠/🟢) layout on wide landscape screens when Sort=RAG
 * - JSON import/export + starter packs
 * - Duplicates (exact + fuzzy) with Usage/Notes preview
 * - TTS: Azure (primary) + Browser (fallback), tap=normal, long-press=slow
 * - Quiz, XP/Levels, Streak
 * - i18n: EN→LT / LT→EN (UI strings swap)
 */

// -------------------- Keys & constants --------------------
const COLS = [
  "English",
  "Lithuanian",
  "Phonetic",
  "Category",
  "Usage",
  "Notes",
  "RAG Icon",
  "Sheet",
  "_ts", // created timestamp
];

const LS_KEY = "lt_phrasebook_v3";
const LSK_TTS_PROVIDER = "lt_tts_provider"; // 'browser' | 'azure'
const LSK_AZURE_KEY = "lt_azure_key";
const LSK_AZURE_REGION = "lt_azure_region";
const LSK_AZURE_VOICE = "lt_azure_voice"; // {shortName}
const LSK_STREAK = "lt_quiz_streak_v1"; // {streak:number, lastDate:"YYYY-MM-DD"}
const LSK_XP = "lt_xp_v1"; // {xp:number}
const LSK_DIR = "lt_dir_v1"; // "EN2LT" | "LT2EN"

const STARTER_EN2LT = "/data/starter_en2lt.json";
const STARTER_LT2EN = "/data/starter_lt2en.json";
const STARTER_NUMBERS = "/data/starter_numbers.json";

// -------------------- Local storage helpers --------------------
const saveData = (rows) => localStorage.setItem(LS_KEY, JSON.stringify(rows));
const loadData = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // ensure timestamps
    const now = Date.now();
    return arr.map((r) => (r._ts ? r : { ...r, _ts: now }));
  } catch {
    return [];
  }
};

const todayKey = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD
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

const loadXP = () => {
  try {
    const x = JSON.parse(localStorage.getItem(LSK_XP) || "null");
    return x && typeof x.xp === "number" ? x : { xp: 0 };
  } catch {
    return { xp: 0 };
  }
};
const saveXP = (x) => localStorage.setItem(LSK_XP, JSON.stringify(x));

function daysBetween(d1, d2) {
  const a = new Date(d1 + "T00:00:00");
  const b = new Date(d2 + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

// -------------------- Utils --------------------
function normalizeRag(icon = "") {
  const s = String(icon).trim();
  const low = s.toLowerCase();
  if (["🔴", "🟥", "red"].includes(s) || low === "red") return "🔴";
  if (["🟠", "🟧", "🟨", "🟡"].includes(s) || ["amber", "orange", "yellow"].includes(low))
    return "🟠";
  if (["🟢", "🟩", "green"].includes(s) || low === "green") return "🟢";
  return "🟠";
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

// quick fuzzy check for duplicates
function normStr(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ąčęėįšųūž\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
function sim(a, b) {
  const A = normStr(a),
    B = normStr(b);
  if (!A && !B) return 1;
  if (!A || !B) return 0;
  const sa = new Set(A.split(" "));
  const sb = new Set(B.split(" "));
  let hit = 0;
  sa.forEach((w) => sb.has(w) && hit++);
  return hit / Math.max(sa.size, sb.size);
}

// -------------------- Hooks --------------------
function useMedia(q) {
  const [ok, setOk] = useState(() => (typeof window !== "undefined" ? window.matchMedia(q).matches : false));
  useEffect(() => {
    const m = window.matchMedia(q);
    const handler = () => setOk(m.matches);
    handler();
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [q]);
  return ok;
}

// voices
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
  if (!res.ok) throw new Error("Azure TTS failed: " + res.status + " " + res.statusText);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// -------------------- i18n --------------------
const STR = {
  EN2LT: {
    appTitle: "Lithuanian Trainer",
    subtitle: "Tap to play. Long-press to savour.",
    home: "Home",
    library: "Library",
    settings: "Settings",
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
    usage: "Usage",
    notes: "Notes",
    category: "Category",
    phonetic: "Phonetic",
    sheet: "Sheet",
    english: "English",
    lithuanian: "Lithuanian",
    voiceProvider: "Voice provider",
    browser: "Browser (fallback)",
    azure: "Azure Speech",
    subKey: "Subscription Key",
    region: "Region",
    voice: "Voice",
    fetchVoices: "Fetch voices",
    select: "— choose —",
    direction: "Direction",
    en2lt: "EN → LT",
    lt2en: "LT → EN",
    jsonImport: "Import JSON",
    jsonExport: "Export JSON",
    installEN: "Install EN→LT starter",
    installLT: "Install LT→EN starter",
    installNum: "Install Numbers pack",
    dupes: "Duplicate finder",
    scanDupes: "Scan duplicates",
    exactDupes: "Exact duplicates",
    closeMatches: "Close matches",
    keep: "Keep",
    remove: "Remove",
    confirmClear: "Clear all data (are you sure?)",
    clear: "Clear data",
  },
  LT2EN: {
    appTitle: "Anglų kalbos treniruoklis",
    subtitle: "Paliesk, kad klausytum. Ilgai spausk – lėčiau.",
    home: "Pagrindinis",
    library: "Biblioteka",
    settings: "Nustatymai",
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
    usage: "Panaudojimas",
    notes: "Pastabos",
    category: "Kategorija",
    phonetic: "Fonetika",
    sheet: "Skiltis",
    english: "Angliškai",
    lithuanian: "Lietuviškai",
    voiceProvider: "Balso tiekėjas",
    browser: "Naršyklė (atsarginis)",
    azure: "Azure kalba",
    subKey: "Prenumeratos raktas",
    region: "Regionas",
    voice: "Balsas",
    fetchVoices: "Gauti balsus",
    select: "— pasirinkite —",
    direction: "Kryptis",
    en2lt: "EN → LT",
    lt2en: "LT → EN",
    jsonImport: "Importuoti JSON",
    jsonExport: "Eksportuoti JSON",
    installEN: "Įdiegti EN→LT paketą",
    installLT: "Įdiegti LT→EN paketą",
    installNum: "Įdiegti skaičių paketą",
    dupes: "Dublikatų paieška",
    scanDupes: "Ieškoti dublikatų",
    exactDupes: "Tikslūs dublikatai",
    closeMatches: "Artimi atitikmenys",
    keep: "Palikti",
    remove: "Pašalinti",
    confirmClear: "Išvalyti visus duomenis (ar tikrai?)",
    clear: "Išvalyti duomenis",
  },
};

// -------------------- App --------------------
export default function App() {
  const fileRef = useRef(null);
  const audioRef = useRef(null); // prevent overlapping audio

  const [rows, setRows] = useState(loadData());
  const [tab, setTab] = useState("Phrases");
  const [q, setQ] = useState("");
  const [direction, setDirection] = useState(() => localStorage.getItem(LSK_DIR) || "EN2LT");
  const T = STR[direction];

  const [sortMode, setSortMode] = useState("Newest"); // Newest | Oldest | RAG
  const [ragPriority, setRagPriority] = useState(""); // deprecated in tri-column mode; kept for phone single-column RAG
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panel, setPanel] = useState("home"); // home | library | settings
  const [confirmClear, setConfirmClear] = useState(false);

  // Quiz state (kept simple here)
  const [quizOn, setQuizOn] = useState(false);

  // TTS provider selector
  const [ttsProvider, setTtsProvider] = useState(() => localStorage.getItem(LSK_TTS_PROVIDER) || "azure");

  // Azure
  const [azureKey, setAzureKey] = useState(() => localStorage.getItem(LSK_AZURE_KEY) || "");
  const [azureRegion, setAzureRegion] = useState(() => localStorage.getItem(LSK_AZURE_REGION) || "");
  const [azureVoices, setAzureVoices] = useState([]); // {shortName, displayName}
  const [azureVoiceShortName, setAzureVoiceShortName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LSK_AZURE_VOICE) || "null")?.shortName || "";
    } catch {
      return "";
    }
  });

  // XP & Streak
  const [streak, setStreak] = useState(loadStreak());
  const [xpState, setXpState] = useState(loadXP());

  // Add/edit
  const emptyDraft = {
    English: "",
    Lithuanian: "",
    Phonetic: "",
    Category: "",
    Usage: "",
    Notes: "",
    "RAG Icon": "🟠",
    Sheet: "Phrases",
  };
  const [draft, setDraft] = useState(emptyDraft);
  const [editIdx, setEditIdx] = useState(null);
  const [editDraft, setEditDraft] = useState(emptyDraft);
  const [expanded, setExpanded] = useState(new Set());

  // Duplicates
  const [dupeScan, setDupeScan] = useState({ exact: [], close: [] });
  const [dupeSelected, setDupeSelected] = useState(new Set());

  // Voices
  const voices = useVoices();
  const [voiceName, setVoiceName] = useState("");
  const voice = useMemo(
    () =>
      voices.find((v) => v.name === voiceName) ||
      voices.find((v) => (v.lang || "").toLowerCase().startsWith("lt")) ||
      voices[0],
    [voices, voiceName]
  );

  // Persist
  useEffect(() => saveData(rows), [rows]);
  useEffect(() => localStorage.setItem(LSK_TTS_PROVIDER, ttsProvider), [ttsProvider]);
  useEffect(() => { if (azureKey) localStorage.setItem(LSK_AZURE_KEY, azureKey); }, [azureKey]);
  useEffect(() => { if (azureRegion) localStorage.setItem(LSK_AZURE_REGION, azureRegion); }, [azureRegion]);
  useEffect(() => {
    localStorage.setItem(LSK_AZURE_VOICE, JSON.stringify({ shortName: azureVoiceShortName }));
  }, [azureVoiceShortName]);
  useEffect(() => saveStreak(streak), [streak]);
  useEffect(() => saveXP(xpState), [xpState]);
  useEffect(() => localStorage.setItem(LSK_DIR, direction), [direction]);

  // Keep Add form Sheet synced with active tab
  useEffect(() => setDraft((d) => ({ ...d, Sheet: tab })), [tab]);

  // -------- Responsive flags for tri-column --------
  const isWide = useMedia("(min-width: 1024px)");
  const isLandscape = useMedia("(orientation: landscape)");
  const showTriColumn = isWide && isLandscape && sortMode === "RAG" && !quizOn && panel === "home";

  // ------------- Derived lists -------------
  const filtered = useMemo(() => {
    const filterByTab = rows.filter((r) => r.Sheet === tab);
    const haystack = (r) =>
      `${r.English} ${r.Lithuanian} ${r.Phonetic} ${r.Category} ${r.Usage} ${r.Notes}`.toLowerCase();
    const out = !q ? filterByTab : filterByTab.filter((r) => haystack(r).includes(q.toLowerCase()));
    // sort
    if (sortMode === "Newest") return [...out].sort((a, b) => (b._ts || 0) - (a._ts || 0));
    if (sortMode === "Oldest") return [...out].sort((a, b) => (a._ts || 0) - (b._ts || 0));
    // RAG: default ordering 🔴 → 🟠 → 🟢 (or ragPriority first on phones)
    const order = ["🔴", "🟠", "🟢"];
    const keys = ragPriority && order.includes(ragPriority) ? [ragPriority, ...order.filter((x) => x !== ragPriority)] : order;
    const buckets = { "🔴": [], "🟠": [], "🟢": [] };
    out.forEach((r) => buckets[normalizeRag(r["RAG Icon"])]?.push(r));
    return keys.flatMap((k) => buckets[k]);
  }, [rows, tab, q, sortMode, ragPriority]);

  // Buckets for tri-column
  const triBuckets = useMemo(() => {
    const reds = [];
    const ambs = [];
    const greens = [];
    filtered.forEach((r) => {
      const k = normalizeRag(r["RAG Icon"]);
      if (k === "🔴") reds.push(r);
      else if (k === "🟠") ambs.push(r);
      else greens.push(r);
    });
    return { reds, ambs, greens };
  }, [filtered]);

  // ---------- Audio helpers ----------
  async function playText(text, { slow = false } = {}) {
    try {
      // stop any previous playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }

      if (ttsProvider === "azure" && azureKey && azureRegion && azureVoiceShortName) {
        const delta = slow ? "-40%" : "0%";
        const url = await speakAzureHTTP(text, azureVoiceShortName, azureKey, azureRegion, delta);
        const a = new Audio(url);
        a.onended = () => URL.revokeObjectURL(url);
        audioRef.current = a;
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
    let firedSlow = false;
    const start = (e) => {
      e.preventDefault();
      firedSlow = false;
      timer = setTimeout(() => {
        firedSlow = true;
        playText(text, { slow: true });
      }, 550);
    };
    const end = (e) => {
      e?.preventDefault?.();
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
      onTouchStart: start,
      onTouchEnd: end,
    };
  }

  // ---------- CRUD ----------
  function addRow() {
    if (!draft.English || !draft.Lithuanian) {
      alert("English & Lithuanian are required");
      return;
    }
    const row = { ...draft, "RAG Icon": normalizeRag(draft["RAG Icon"]), _ts: Date.now() };
    setRows((prev) => [row, ...prev]);
    setDraft({ ...emptyDraft, Sheet: tab });
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
  function cancelEdit() {
    setEditIdx(null);
  }
  function remove(globalIdx) {
    if (!confirm("Delete this entry?")) return;
    setRows((prev) => prev.filter((_, i) => i !== globalIdx));
  }

  // ---------- JSON import / export / starters ----------
  async function installFrom(url) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      const now = Date.now();
      const cleaned = (Array.isArray(data) ? data : []).map((r, i) => ({
        English: r.English || "",
        Lithuanian: r.Lithuanian || "",
        Phonetic: r.Phonetic || "",
        Category: r.Category || "",
        Usage: r.Usage || "",
        Notes: r.Notes || "",
        "RAG Icon": normalizeRag(r["RAG Icon"] || "🟠"),
        Sheet: r.Sheet || "Phrases",
        _ts: r._ts || now + i,
      }));
      setRows((prev) => [...cleaned, ...prev]); // append (no overwrite)
      alert("Installed.");
    } catch (e) {
      alert("Failed to install: " + e.message);
    }
  }
  function exportJson() {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lt-phrasebook.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  async function onImportJson(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const json = JSON.parse(text);
      if (!Array.isArray(json) || !json.length) {
        alert("No rows found in JSON.");
        return;
      }
      const now = Date.now();
      const cleaned = json.map((r, i) => ({
        English: r.English || "",
        Lithuanian: r.Lithuanian || "",
        Phonetic: r.Phonetic || "",
        Category: r.Category || "",
        Usage: r.Usage || "",
        Notes: r.Notes || "",
        "RAG Icon": normalizeRag(r["RAG Icon"] || "🟠"),
        Sheet: r.Sheet || "Phrases",
        _ts: r._ts || now + i,
      }));
      setRows((prev) => [...cleaned, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Failed to import JSON (see console)");
    } finally {
      e.target.value = "";
    }
  }
  function clearAll() {
    if (!confirm(T.confirmClear)) return;
    localStorage.removeItem(LS_KEY);
    setRows([]);
    setQ("");
    setTab("Phrases");
  }

  // ---------- Duplicates ----------
  function scanDuplicates() {
    // exact by pair
    const key = (r) => `${normStr(r.English)}||${normStr(r.Lithuanian)}||${r.Sheet}`;
    const map = new Map();
    rows.forEach((r, i) => {
      const k = key(r);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(i);
    });
    const exact = [...map.values()].filter((arr) => arr.length > 1);

    // close by English OR Lithuanian similarity
    const close = [];
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const a = rows[i];
        const b = rows[j];
        if (a.Sheet !== b.Sheet) continue;
        const score = Math.max(sim(a.English, b.English), sim(a.Lithuanian, b.Lithuanian));
        if (score >= 0.88 && score < 1) {
          close.push({ i, j, score });
        }
      }
    }
    setDupeScan({ exact, close });
    setDupeSelected(new Set());
  }
  function toggleDupe(idx) {
    const n = new Set(dupeSelected);
    n.has(idx) ? n.delete(idx) : n.add(idx);
    setDupeSelected(n);
  }
  function removeSelectedDupes() {
    if (!dupeSelected.size) return;
    if (!confirm("Delete selected entries?")) return;
    // dupeSelected contains raw row indices. Remove safely by index set
    const toRemove = new Set(dupeSelected);
    setRows((prev) => prev.filter((_, i) => !toRemove.has(i)));
    setDupeSelected(new Set());
  }

  // ---------- UI helpers ----------
  function LevelBadge() {
    const xp = xpState.xp || 0;
    const lvl = Math.max(1, Math.floor(xp / 2500) + 1);
    const curr = (lvl - 1) * 2500;
    const next = lvl * 2500;
    const pct = Math.max(0, Math.min(1, (xp - curr) / (next - curr)));
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 text-sm">
          <span>🔥 {T.streak}: {streak.streak}</span>
          <span>🥇 {T.level} {lvl}</span>
          <span className="ml-auto text-sm">{xp} XP</span>
        </div>
        <div className="mt-1 h-2 rounded bg-zinc-800 overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${pct * 100}%` }} />
        </div>
      </div>
    );
  }

  function PlayButton({ text, rag = "🟠" }) {
    const color =
      rag === "🔴" ? "bg-red-600" : rag === "🟢" ? "bg-emerald-600" : "bg-amber-500";
    return (
      <button
        className={cn(
          "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-semibold text-zinc-900 select-none",
          color,
          "active:scale-[0.98] transition"
        )}
        title="Tap = play, long-press = slow"
        {...pressHandlers(text)}
      >
        ►
      </button>
    );
  }

  function Card({ r, idx }) {
    const isEditing = editIdx === idx;
    const primary = direction === "EN2LT" ? r.Lithuanian : r.English;
    const secondary = direction === "EN2LT" ? r.English : r.Lithuanian;

    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
        {!isEditing ? (
          <div className="flex items-start gap-3">
            <PlayButton text={r.Lithuanian} rag={normalizeRag(r["RAG Icon"])} />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-zinc-400 truncate">{secondary}</div>
              <div className="text-xl leading-snug font-medium break-words">{primary}</div>
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
                  {r.Phonetic && <div className="text-xs text-zinc-400 mt-1">{T.phonetic}: {r.Phonetic}</div>}
                  {(r.Usage || r.Notes) && (
                    <div className="text-xs text-zinc-400 mt-1 space-y-0.5">
                      {r.Usage && <div><span className="text-zinc-500">{T.usage}: </span>{r.Usage}</div>}
                      {r.Notes && <div><span className="text-zinc-500">{T.notes}: </span>{r.Notes}</div>}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col gap-1 ml-2">
              <button onClick={() => startEdit(idx)} className="text-xs bg-zinc-800 px-2 py-1 rounded-md">{T.edit}</button>
              <button onClick={() => remove(idx)} className="text-xs bg-zinc-800 text-red-400 px-2 py-1 rounded-md">{T.delete}</button>
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
                RAG
                <select
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                  value={editDraft["RAG Icon"]}
                  onChange={(e) => setEditDraft({ ...editDraft, "RAG Icon": normalizeRag(e.target.value) })}
                >
                  {"🔴 🟠 🟢".split(" ").map((x) => (
                    <option key={x} value={x}>{x}</option>
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
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={() => saveEdit(idx)} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md text-sm font-semibold">Save</button>
              <button onClick={cancelEdit} className="bg-zinc-800 px-3 py-2 rounded-md text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
        <div className="mx-auto w-full max-w-[92rem] px-3 sm:px-4 py-2 sm:py-3">
          {/* Title + voice */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-500 flex items-center justify-center font-bold text-zinc-900">
                  LT
                </div>
                <div className="leading-tight">
                  <div className="text-xl sm:text-2xl font-extrabold">{T.appTitle}</div>
                  <div className="text-xs text-zinc-400">{T.subtitle}</div>
                </div>
              </div>
              {/* Voice selector */}
              <select
                className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1 min-w-[180px]"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                disabled={ttsProvider !== "browser"}
                title={ttsProvider === "azure" ? "Using Azure" : "Browser voice"}
              >
                <option value="">{direction === "EN2LT" ? "Auto voice" : "Automatinis balsas"}</option>
                {useVoices().map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Nav row full-width on large screens */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "home", label: T.home },
                { key: "library", label: T.library },
                { key: "settings", label: T.settings },
              ].map((b) => (
                <button
                  key={b.key}
                  onClick={() => setPanel(b.key)}
                  className={cn(
                    "w-full rounded-xl px-3 py-2 border",
                    panel === b.key ? "bg-zinc-800 border-zinc-700" : "bg-zinc-900 border-zinc-800"
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setQuizOn(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-xl text-base sm:text-lg px-4 py-3 font-semibold"
            >
              {T.startQuiz}
            </button>
          </div>
        </div>
      </div>

      {/* Panel content */}
      {panel === "home" && !quizOn && (
        <div className="mx-auto w-full max-w-[92rem] px-3 sm:px-4 pb-28">
          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
            <div className="relative flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={T.search}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-3 text-base outline-none"
              />
              {!!q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  aria-label="Clear"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-zinc-400">{T.sort}</div>
              <div className="relative">
                <select
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value)}
                >
                  <option value="Newest">{T.newest}</option>
                  <option value="Oldest">{T.oldest}</option>
                  <option value="RAG">{T.rag}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Level */}
          <div className="mt-3"><LevelBadge /></div>

          {/* Tabs */}
          <div className="mt-3 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {[
              { key: "Phrases", label: T.phrases },
              { key: "Questions", label: T.questions },
              { key: "Words", label: T.words },
              { key: "Numbers", label: T.numbers },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-base border",
                  tab === t.key ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-800"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* List (tri-column on wide landscape + RAG) */}
          {!showTriColumn ? (
            <div className="mt-3 space-y-3">
              {filtered.map((r) => {
                const idx = rows.indexOf(r);
                return <Card key={`${r.English}-${idx}`} r={r} idx={idx} />;
              })}
            </div>
          ) : (
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: "🔴 Red", items: triBuckets.reds },
                  { title: "🟠 Amber", items: triBuckets.ambs },
                  { title: "🟢 Green", items: triBuckets.greens },
                ].map((col, ci) => (
                  <div key={ci} className="space-y-3">
                    <div className="text-sm text-zinc-400">{col.title} • {col.items.length}</div>
                    {col.items.map((r) => {
                      const idx = rows.indexOf(r);
                      return <Card key={`${r.English}-${idx}`} r={r} idx={idx} />;
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add form */}
          <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800">
            <div className="mx-auto w-full max-w-[92rem] px-3 sm:px-4 py-2 sm:py-3">
              <details>
                <summary className="cursor-pointer text-sm text-zinc-300">{T.addEntry}</summary>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder={T.english} value={draft.English} onChange={(e) => setDraft({ ...draft, English: e.target.value })} />
                  <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder={T.lithuanian} value={draft.Lithuanian} onChange={(e) => setDraft({ ...draft, Lithuanian: e.target.value })} />
                  <input className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder={T.phonetic} value={draft.Phonetic} onChange={(e) => setDraft({ ...draft, Phonetic: e.target.value })} />
                  <input className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder={T.category} value={draft.Category} onChange={(e) => setDraft({ ...draft, Category: e.target.value })} />
                  <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder={T.usage} value={draft.Usage} onChange={(e) => setDraft({ ...draft, Usage: e.target.value })} />
                  <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder={T.notes} value={draft.Notes} onChange={(e) => setDraft({ ...draft, Notes: e.target.value })} />
                  <select className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" value={draft["RAG Icon"]} onChange={(e) => setDraft({ ...draft, "RAG Icon": normalizeRag(e.target.value) })}>
                    {"🔴 🟠 🟢".split(" ").map((x) => (<option key={x} value={x}>{x}</option>))}
                  </select>
                  <select className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" value={draft.Sheet} onChange={(e) => setDraft({ ...draft, Sheet: e.target.value })}>
                    {["Phrases", "Questions", "Words", "Numbers"].map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                  <button onClick={addRow} className="col-span-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-md px-3 py-2 text-sm font-semibold">Add</button>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Library */}
      {panel === "library" && (
        <div className="mx-auto w-full max-w-[92rem] px-3 sm:px-4 pb-24">
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => fileRef.current?.click()} className="bg-zinc-900 border border-zinc-700 rounded-md text-sm px-3 py-2">{T.jsonImport}</button>
            <input ref={fileRef} type="file" accept=".json" onChange={onImportJson} className="hidden" />
            <button onClick={exportJson} className="bg-zinc-900 border border-zinc-700 rounded-md text-sm px-3 py-2">{T.jsonExport}</button>
            <button onClick={() => installFrom(STARTER_EN2LT)} className="bg-zinc-900 border border-zinc-700 rounded-md text-sm px-3 py-2">{T.installEN}</button>
            <button onClick={() => installFrom(STARTER_LT2EN)} className="bg-zinc-900 border border-zinc-700 rounded-md text-sm px-3 py-2">{T.installLT}</button>
            <button onClick={() => installFrom(STARTER_NUMBERS)} className="bg-zinc-900 border border-zinc-700 rounded-md text-sm px-3 py-2">{T.installNum}</button>
            <button onClick={clearAll} className="bg-zinc-900 border border-red-600 text-red-400 rounded-md text-sm px-3 py-2">{T.clear}</button>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-lg font-semibold">{T.dupes}</div>
            <button onClick={scanDuplicates} className="bg-zinc-800 px-3 py-2 rounded-md text-sm">{T.scanDupes}</button>
          </div>

          {/* Close matches */}
          <div className="mt-3 space-y-4">
            <div className="text-sm text-zinc-400">
              {T.closeMatches}: {dupeScan.close.length} pair(s)
            </div>
            {dupeScan.close.map((p, k) => {
              const a = rows[p.i];
              const b = rows[p.j];
              return (
                <div key={k} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                  <div className="text-xs text-zinc-400 mb-2">Similarity: {(p.score * 100).toFixed(0)}%</div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[{ row: a, idx: p.i }, { row: b, idx: p.j }].map(({ row, idx: rr }) => (
                      <label key={rr} className="flex gap-2">
                        <input
                          type="checkbox"
                          checked={dupeSelected.has(rr)}
                          onChange={() => toggleDupe(rr)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-semibold">{row.English} — {row.Lithuanian} <span className="text-zinc-500">[{row.Sheet}]</span></div>
                          {(row.Usage || row.Notes) && (
                            <div className="mt-1 text-xs text-zinc-400 space-y-0.5">
                              {row.Usage && <div><span className="text-zinc-500">{T.usage}: </span>{row.Usage}</div>}
                              {row.Notes && <div><span className="text-zinc-500">{T.notes}: </span>{row.Notes}</div>}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            {!!dupeScan.close.length && (
              <div>
                <button onClick={removeSelectedDupes} className="bg-red-600 hover:bg-red-500 rounded-md px-3 py-2 text-sm font-semibold">
                  {T.delete}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings */}
      {panel === "settings" && (
        <div className="mx-auto w-full max-w-[92rem] px-3 sm:px-4 pb-24">
          <div className="mt-4 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="text-lg font-semibold">{T.settings}</div>

            {/* Direction */}
            <div>
              <div className="text-xs mb-1">{T.direction}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDirection("EN2LT")}
                  className={cn("px-2 py-1 rounded-md text-xs border",
                    direction === "EN2LT" ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-700")}
                >
                  {T.en2lt}
                </button>
                <button
                  onClick={() => setDirection("LT2EN")}
                  className={cn("px-2 py-1 rounded-md text-xs border",
                    direction === "LT2EN" ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-700")}
                >
                  {T.lt2en}
                </button>
              </div>
            </div>

            {/* Voice provider */}
            <div>
              <div className="text-xs mb-1">{T.voiceProvider}</div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2">
                  <input type="radio" name="ttsprov" checked={ttsProvider === "browser"} onChange={() => setTtsProvider("browser")} /> {T.browser}
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="ttsprov" checked={ttsProvider === "azure"} onChange={() => setTtsProvider("azure")} /> {T.azure}
                </label>
              </div>
            </div>

            {/* Azure config */}
            {ttsProvider === "azure" && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
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
                      <option value="">{T.select}</option>
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
                          displayName: v.LocalName || v.FriendlyName || v.ShortName,
                        }));
                        setAzureVoices(vs);
                        if (!azureVoiceShortName && vs.length) setAzureVoiceShortName(vs[0].shortName);
                      } catch (e) { alert(e.message); }
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

      {/* Quiz placeholder (existing quiz mechanics can be reattached here) */}
      {quizOn && (
        <div className="mx-auto w-full max-w-[92rem] px-3 sm:px-4 py-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <div className="text-xl font-semibold mb-2">Quiz mode (coming from your previous state)</div>
            <button onClick={() => setQuizOn(false)} className="mt-2 bg-emerald-600 px-4 py-2 rounded-md font-semibold">
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

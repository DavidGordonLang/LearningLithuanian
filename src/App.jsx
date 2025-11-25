// src/App.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  memo,
  startTransition,
  useImperativeHandle,
  useSyncExternalStore,
} from "react";
import Header from "./components/Header";
import EntryCard from "./components/EntryCard";
import AddForm from "./components/AddForm";
import SearchDock from "./components/SearchDock";
import { searchStore } from "./searchStore";
import { usePhraseStore } from "./stores/phraseStore";

/* ============================================================================
   CONSTANTS
   ========================================================================== */
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
  COMBINED_OPTIONAL: "/data/starter_combined_dedup.json",
};

const LEVEL_STEP = 2500;
const XP_PER_CORRECT = 50;

/* ============================================================================
   UI STRINGS
   ========================================================================== */
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
    direction: "Learning direction",
    en2lt: "I’m learning Lithuanian (EN → LT)",
    lt2en: "I’m learning English (LT → EN)",
    settings: "Settings",
    libraryTitle: "Library",
    installEN: "Install “Learn Lithuanian” starter (EN → LT)",
    installLT: "Install “Learn English” starter (LT → EN)",
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
    chooseLT: "Choose the Lithuanuanian",
    correct: "Correct!",
    notQuite: "Not quite.",
    nextQuestion: "Next Question",
    score: "Score",
    done: "Done",
    retry: "Retry",
    providerNote: "Using your browser’s built-in voices. No key needed.",
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
    direction: "Mokymosi kryptis",
    en2lt: "Mokausi lietuvių (EN → LT)",
    lt2en: "Mokausi anglų (LT → EN)",
    settings: "Nustatymai",
    libraryTitle: "Biblioteka",
    installEN: "Įdiegti rinkinį „Mokausi lietuvių“ (EN → LT)",
    installLT: "Įdiegti rinkinį „Mokausi anglų“ (LT → EN)",
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
    providerNote: "Naudojami naršyklės balsai. Raktas nereikalingas.",
  },
};

/* ============================================================================
   HELPERS
   ========================================================================== */

const loadXP = () => {
  try {
    const v = Number(localStorage.getItem(LSK_XP) ?? "0");
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
    return s && typeof s.streak === "number"
      ? s
      : { streak: 0, lastDate: "" };
  } catch {
    return { streak: 0, lastDate: "" };
  }
};
const saveStreak = (s) =>
  localStorage.setItem(LSK_STREAK, JSON.stringify(s));

const nowTs = () => Date.now();
const genId = () => Math.random().toString(36).slice(2);
const cn = (...xs) => xs.filter(Boolean).join(" ");

function normalizeRag(icon = "") {
  const s = String(icon).trim().toLowerCase();
  if (["🔴", "red"].includes(icon) || s === "red") return "🔴";
  if (
    ["🟠", "amber", "orange", "yellow"].includes(icon) ||
    ["amber", "orange", "yellow"].includes(s)
  )
    return "🟠";
  if (["🟢", "green"].includes(icon) || s === "green") return "🟢";
  return "🟠";
}

function daysBetween(d1, d2) {
  const a = new Date(d1 + "T00:00:00");
  const b = new Date(d2 + "T00:00:00");
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
  const g1 = grams(s1);
  const g2 = grams(s2);
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

/* ============================================================================
   TTS
   ========================================================================== */

function useVoices() {
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    const refresh = () => {
      const v = window.speechSynthesis?.getVoices?.() || [];
      setVoices([...v].sort((a, b) => a.name.localeCompare(b.name)));
    };
    refresh();
    window.speechSynthesis?.addEventListener?.("voiceschanged", refresh);
    return () =>
      window.speechSynthesis?.removeEventListener?.("voiceschanged", refresh);
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

/* ============================================================================
   SEARCH BOX — focus-safe
   ========================================================================== */

const SearchBox = memo(
  forwardRef(function SearchBox({ placeholder = "Search…" }, ref) {
    const composingRef = useRef(false);
    const inputRef = useRef(null);
    useImperativeHandle(ref, () => inputRef.current);

    useEffect(() => {
      const el = inputRef.current;
      if (!el) return;
      const raw = searchStore.getRaw();
      if (raw && el.value !== raw) el.value = raw;
    }, []);

    return (
      <div className="relative flex-1">
        <label htmlFor="main-search" className="sr-only">
          Search phrases
        </label>
        <input
          id="main-search"
          ref={inputRef}
          defaultValue=""
          type="text"
          inputMode="search"
          enterKeyHint="search"
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm outline-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={(e) => {
            composingRef.current = false;
            startTransition(() => searchStore.setRaw(e.currentTarget.value));
          }}
          onInput={(e) => {
            if (!composingRef.current)
              startTransition(() => searchStore.setRaw(e.currentTarget.value));
          }}
        />
        <button
          type="button"
          data-role="clear-btn"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
          onClick={() => {
            const el = inputRef.current;
            if (el) {
              el.value = "";
              el.focus();
              startTransition(() => searchStore.clear());
            }
          }}
          aria-label="Clear"
        >
          ×
        </button>
      </div>
    );
  })
);

/* ============================================================================
   APP
   ========================================================================== */

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
  const HEADER_H = 56;
  const DOCK_H = 112;

  // phrase store (Zustand)
  const rows = usePhraseStore((s) => s.phrases);
  const setRows = usePhraseStore((s) => s.setPhrases);
  const removePhrase = usePhraseStore((s) => s.removePhrase);
  const saveEditedPhrase = usePhraseStore((s) => s.saveEditedPhrase);

  // data + prefs
  const [tab, setTab] = useState("Phrases");

  // search
  const qFilter = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );

  // sort + direction
  const [sortMode, setSortMode] = useState(
    () => localStorage.getItem(LSK_SORT) || "RAG"
  );
  useEffect(() => localStorage.setItem(LSK_SORT, sortMode), [sortMode]);

  const [direction, setDirection] = useState(
    () => localStorage.getItem(LSK_DIR) || "EN2LT"
  );
  useEffect(() => localStorage.setItem(LSK_DIR, direction), [direction]);
  const T = STR[direction];

  // gamification
  const [xp, setXp] = useState(loadXP());
  useEffect(() => saveXP(xp), [xp]);
  useEffect(() => {
    if (!Number.isFinite(xp)) setXp(0);
  }, [xp]);
  const level = Math.floor((Number.isFinite(xp) ? xp : 0) / LEVEL_STEP) + 1;
  const levelProgress = (Number.isFinite(xp) ? xp : 0) % LEVEL_STEP;

  const [streak, setStreak] = useState(loadStreak());
  useEffect(() => saveStreak(streak), [streak]);

  // TTS prefs
  const [ttsProvider, setTtsProvider] = useState(
    () => localStorage.getItem(LSK_TTS_PROVIDER) || "azure"
  );
  useEffect(
    () => localStorage.setItem(LSK_TTS_PROVIDER, ttsProvider),
    [ttsProvider]
  );

  const [azureKey, setAzureKey] = useState(
    () => localStorage.getItem(LSK_AZURE_KEY) || ""
  );
  const [azureRegion, setAzureRegion] = useState(
    () => localStorage.getItem(LSK_AZURE_REGION) || ""
  );
  const [azureVoices, setAzureVoices] = useState([]);
  const [azureVoiceShortName, setAzureVoiceShortName] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(LSK_AZURE_VOICE) || "null")
          ?.shortName || ""
      );
    } catch {
      return "";
    }
  });

  useEffect(() => {
    localStorage.setItem(LSK_AZURE_KEY, azureKey ?? "");
  }, [azureKey]);
  useEffect(() => {
    localStorage.setItem(LSK_AZURE_REGION, azureRegion ?? "");
  }, [azureRegion]);
  useEffect(() => {
    localStorage.setItem(
      LSK_AZURE_VOICE,
      JSON.stringify({ shortName: azureVoiceShortName })
    );
  }, [azureVoiceShortName]);

  const voices = useVoices();
  const [browserVoiceName, setBrowserVoiceName] = useState("");
  const browserVoice = useMemo(
    () => voices.find((v) => v.name === browserVoiceName) || voices[0],
    [voices, browserVoiceName]
  );

  // audio
  const audioRef = useRef(null);
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
      if (
        ttsProvider === "azure" &&
        azureKey &&
        azureRegion &&
        azureVoiceShortName
      ) {
        const delta = slow ? "-40%" : "0%";
        const url = await speakAzureHTTP(
          text,
          azureVoiceShortName,
          azureKey,
          azureRegion,
          delta
        );
        const a = new Audio(url);
        audioRef.current = a;
        a.onended = () => {
          try {
            URL.revokeObjectURL(url);
          } catch {}
          if (audioRef.current === a) audioRef.current = null;
        };
        await a.play();
      } else {
        speakBrowser(text, browserVoice, slow ? 0.6 : 1.0);
      }
    } catch (e) {
      console.error(e);
      alert("Voice error: " + (e?.message || e));
    }
  }

  // press handlers (card tap/long-press)
  function pressHandlers(text) {
    let timer = null;
    let firedSlow = false;
    let pressed = false;

    const start = (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const ae = document.activeElement;
        if (ae && typeof ae.blur === "function") ae.blur();
      } catch {}
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
      e?.stopPropagation?.();
      if (!pressed) return;
      pressed = false;
      if (timer) clearTimeout(timer);
      timer = null;
      if (!firedSlow) playText(text);
    };

    const cancel = (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
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

  // filter/sort
  const qNorm = (qFilter || "").trim().toLowerCase();
  const entryMatchesQuery = (r) =>
    !!qNorm &&
    ((r.English || "").toLowerCase().includes(qNorm) ||
      (r.Lithuanian || "").toLowerCase().includes(qNorm));

  const filtered = useMemo(() => {
    const base = qNorm
      ? rows.filter(entryMatchesQuery)
      : rows.filter((r) => r.Sheet === tab);

    if (sortMode === "Newest")
      return [...base].sort((a, b) => (b._ts || 0) - (a._ts || 0));
    if (sortMode === "Oldest")
      return [...base].sort((a, b) => (a._ts || 0) - (b._ts || 0));

    const order = { "🔴": 0, "🟠": 1, "🟢": 2 };
    return [...base].sort(
      (a, b) =>
        (order[normalizeRag(a["RAG Icon"])] ?? 1) -
        (order[normalizeRag(b["RAG Icon"])] ?? 1)
    );
  }, [rows, qNorm, sortMode, tab]);

  // edit/delete
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

  function startEditRow(i) {
    const row = rows[i];
    if (!row) return;
    setEditIdx(i);
    setEditDraft({ ...row });
  }

  function saveEdit(i) {
    const original = rows[i];
    if (!original) {
      setEditIdx(null);
      return;
    }
    const clean = {
      ...original,
      ...editDraft,
      "RAG Icon": normalizeRag(editDraft["RAG Icon"]),
    };
    if (clean._id && typeof saveEditedPhrase === "function") {
      saveEditedPhrase(clean);
    } else {
      // Fallback to direct state update if store helper missing
      setRows((prev) =>
        prev.map((r, idx) => (idx === i ? clean : r))
      );
    }
    setEditIdx(null);
  }

  function remove(i) {
    const row = rows[i];
    if (!row) return;
    if (!confirm(STR[direction].confirm)) return;

    if (row._id && typeof removePhrase === "function") {
      removePhrase(row._id);
    } else {
      setRows((prev) => prev.filter((_, idx) => idx !== i));
    }
  }

  // merge/import
  async function mergeRows(newRows) {
    const cleaned = newRows
      .map((r) => {
        const safe = (v) => {
          if (v == null) return "";
          if (typeof v === "number" && !Number.isFinite(v)) return "";
          return String(v).trim();
        };
        return {
          English: safe(r.English),
          Lithuanian: safe(r.Lithuanian),
          Phonetic: safe(r.Phonetic),
          Category: safe(r.Category),
          Usage: safe(r.Usage),
          Notes: safe(r.Notes),
          "RAG Icon": normalizeRag(r["RAG Icon"] || "🟠"),
          Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(r.Sheet)
            ? r.Sheet
            : "Phrases",
          _id: r._id || genId(),
          _ts: r._ts || nowTs(),
          _qstat:
            r._qstat || {
              red: { ok: 0, bad: 0 },
              amb: { ok: 0, bad: 0 },
              grn: { ok: 0, bad: 0 },
            },
        };
      })
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

  async function installNumbersOnly() {
    const urls = [
      STARTERS.COMBINED_OPTIONAL,
      STARTERS.EN2LT,
      STARTERS.LT2EN,
    ].filter(Boolean);
    let found = [];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        if (Array.isArray(data)) {
          const nums = data.filter((r) => String(r.Sheet) === "Numbers");
          found = found.concat(nums);
        }
      } catch {}
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
    if (!confirm(STR[direction].confirm)) return;
    setRows([]);
  }

  // dups
  const [dupeResults, setDupeResults] = useState({ exact: [], close: [] });

  function scanDupes() {
    const map = new Map();
    rows.forEach((r, i) => {
      const key = `${r.English}|||${r.Lithuanian}`.toLowerCase().trim();
      map.set(key, (map.get(key) || []).concat(i));
    });
    const exact = [];
    for (const arr of map.values()) {
      if (arr.length > 1) exact.push(arr);
    }

    const close = [];
    const bySheet = rows.reduce((acc, r, i) => {
      (acc[r.Sheet] ||= []).push({ r, i });
      return acc;
    }, {});
    for (const list of Object.values(bySheet)) {
      for (let a = 0; a < list.length; a++) {
        for (let b = a + 1; b < list.length; b++) {
          const A = list[a];
          const B = list[b];
          const s =
            (sim2(A.r.English, B.r.English) +
              sim2(A.r.Lithuanian, B.r.Lithuanian)) /
            2;
          if (s >= 0.85) close.push([A.i, B.i, s]);
        }
      }
    }
    setDupeResults({ exact, close });
  }

  // quiz
  const [quizOn, setQuizOn] = useState(false);
  const [quizQs, setQuizQs] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizChoice, setQuizChoice] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);

  function computeQuizPool(allRows, targetSize = 10) {
    const withPairs = allRows.filter((r) => r.English && r.Lithuanian);
    const red = withPairs.filter(
      (r) => normalizeRag(r["RAG Icon"]) === "🔴"
    );
    const amb = withPairs.filter(
      (r) => normalizeRag(r["RAG Icon"]) === "🟠"
    );
    const grn = withPairs.filter(
      (r) => normalizeRag(r["RAG Icon"]) === "🟢"
    );

    const needR = Math.min(
      Math.max(5, Math.floor(targetSize * 0.5)),
      red.length || 0
    );
    const needA = Math.min(
      Math.max(4, Math.floor(targetSize * 0.4)),
      amb.length || 0
    );
    const needG = Math.min(
      Math.max(1, Math.floor(targetSize * 0.1)),
      grn.length || 0
    );

    let picked = [
      ...sample(red, needR),
      ...sample(amb, needA),
      ...sample(grn, needG),
    ];
    while (picked.length < targetSize) {
      const leftovers = withPairs.filter((r) => !picked.includes(r));
      if (!leftovers.length) break;
      picked.push(leftovers[(Math.random() * leftovers.length) | 0]);
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
    setQuizQs(pool);
    setQuizIdx(0);
    setQuizAnswered(false);
    setQuizChoice(null);
    const first = pool[0];
    const correctLt = first.Lithuanian;
    const distractors = sample(
      pool.filter((r) => r !== first && r.Lithuanian),
      3
    ).map((r) => r.Lithuanian);
    setQuizOptions(shuffle([correctLt, ...distractors]));
    setQuizOn(true);
  }

  function afterAnswerAdvance() {
    const nextIdx = quizIdx + 1;
    if (nextIdx >= quizQs.length) {
      const today = todayKey();
      if (streak.lastDate !== today) {
        const inc =
          streak.lastDate && daysBetween(streak.lastDate, today) === 1
            ? streak.streak + 1
            : 1;
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
    const distractors = sample(
      quizQs.filter((r) => r !== item && r.Lithuanian),
      3
    ).map((r) => r.Lithuanian);
    setQuizOptions(shuffle([correctLt, ...distractors]));
  }

  function bumpRagAfterAnswer(item, correct) {
    const rag = normalizeRag(item["RAG Icon"]);
    const st =
      (item._qstat ||= {
        red: { ok: 0, bad: 0 },
        amb: { ok: 0, bad: 0 },
        grn: { ok: 0, bad: 0 },
      });

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
    if (correct)
      setXp((x) => (Number.isFinite(x) ? x : 0) + XP_PER_CORRECT);
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

  // Add modal
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (!addOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setAddOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addOpen]);

  useEffect(() => {
    if (!addOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [addOpen]);

  const setRowsFromAddForm = React.useCallback(
    (updater) => {
      setRows(updater);
    },
    [setRows]
  );

  /* --------------------------------- VIEWS -------------------------------- */

  function LibraryView() {
    const fileRef = useRef(null);

    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-24">
        <div style={{ height: HEADER_H + DOCK_H }} />

        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => fetchStarter("EN2LT")}
            className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
          >
            {T.installEN}
          </button>
          <button
            onClick={() => fetchStarter("LT2EN")}
            className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
          >
            {T.installLT}
          </button>
          <button
            onClick={installNumbersOnly}
            className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
          >
            {T.installNums}
          </button>
        </div>

        <div className="mt-3 col-span-1 sm:col-span-3 flex items-center gap-2">
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
          <button
            onClick={() => fileRef.current?.click()}
            className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
          >
            {T.importJSON}
          </button>
          <button
            onClick={() => {
              try {
                const blob = new Blob([JSON.stringify(rows, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "lithuanian_trainer_export.json";
                a.click();
                URL.revokeObjectURL(url);
              } catch (e) {
                alert("Export failed: " + e.message);
              }
            }}
            className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
          >
            Export JSON
          </button>
          <button
            onClick={clearLibrary}
            className="bg-zinc-900 border border-red-600 text-red-400 rounded-md px-3 py-2"
          >
            {T.clearAll}
          </button>
        </div>

        {/* Duplicates UI */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-semibold">{T.dupFinder}</div>
            <button
              onClick={scanDupes}
              className="bg-zinc-800 px-3 py-2 rounded-md"
            >
              {T.scan}
            </button>
          </div>

          <div className="text-sm text-zinc-400 mb-2">
            {T.exactGroups}: {dupeResults.exact.length} group(s)
          </div>
          <div className="space-y-3 mb-6">
            {dupeResults.exact.map((group, gi) => (
              <div
                key={gi}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.map((ridx) => {
                    const row = rows[ridx];
                    if (!row) return null;
                    return (
                      <div
                        key={ridx}
                        className="border border-zinc-800 rounded-md p-2"
                      >
                        <div className="font-medium">
                          {row.English} — {row.Lithuanian}{" "}
                          <span className="text-xs text-zinc-400">
                            [{row.Sheet}]
                          </span>
                        </div>
                        {(row.Usage || row.Notes) && (
                          <div className="mt-1 text-xs text-zinc-400 space-y-1">
                            {row.Usage && (
                              <div>
                                <span className="text-zinc-500">
                                  {T.usage}:{" "}
                                </span>
                                {row.Usage}
                              </div>
                            )}
                            {row.Notes && (
                              <div>
                                <span className="text-zinc-500">
                                  {T.notes}:{" "}
                                </span>
                                {row.Notes}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-2">
                          <button
                            className="text-xs bg-red-800/40 border border-red-600 px-2 py-1 rounded-md"
                            onClick={() => {
                              const target = rows[ridx];
                              if (target?._id && typeof removePhrase === "function") {
                                removePhrase(target._id);
                              } else {
                                setRows((prev) =>
                                  prev.filter((_, ii) => ii !== ridx)
                                );
                              }
                            }}
                          >
                            {T.delete}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-zinc-400 mb-2">
            {T.closeMatches}: {dupeResults.close.length} pair(s)
          </div>
          <div className="space-y-3">
            {dupeResults.close.map(([i, j, s]) => {
              const A = rows[i];
              const B = rows[j];
              if (!A || !B) return null;
              return (
                <div
                  key={`${i}-${j}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"
                >
                  <div className="text-xs text-zinc-400 mb-2">
                    {T.similarity}: {(s * 100).toFixed(0)}%
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[{ row: A, idx: i }, { row: B, idx: j }].map(
                      ({ row, idx: ridx }) => (
                        <div
                          key={ridx}
                          className="border border-zinc-800 rounded-md p-2"
                        >
                          <div className="font-medium">
                            {row.English} — {row.Lithuanian}{" "}
                            <span className="text-xs text-zinc-400">
                              [{row.Sheet}]
                            </span>
                          </div>
                          {(row.Usage || row.Notes) && (
                            <div className="mt-1 text-xs text-zinc-400 space-y-1">
                              {row.Usage && (
                                <div>
                                  <span className="text-zinc-500">
                                    {T.usage}:{" "}
                                  </span>
                                  {row.Usage}
                                </div>
                              )}
                              {row.Notes && (
                                <div>
                                  <span className="text-zinc-500">
                                    {T.notes}:{" "}
                                  </span>
                                  {row.Notes}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="mt-2">
                            <button
                              className="text-xs bg-red-800/40 border border-red-600 px-2 py-1 rounded-md"
                              onClick={() => {
                                const target = rows[ridx];
                                if (
                                  target?._id &&
                                  typeof removePhrase === "function"
                                ) {
                                  removePhrase(target._id);
                                } else {
                                  setRows((prev) =>
                                    prev.filter((_, ii) => ii !== ridx)
                                  );
                                }
                              }}
                            >
                              {T.delete}
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------- HOME = TRANSLATE ------------------------ */

  function HomeView() {
    // translation UI state
    const [srcText, setSrcText] = useState("");
    const [targetGender, setTargetGender] = useState("neutral");
    const [tone, setTone] = useState("friendly");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [justSaved, setJustSaved] = useState(false);

    async function handleTranslate() {
      setError("");
      setJustSaved(false);
      const text = srcText.trim();
      if (!text) {
        setError("Type something to translate first.");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            text,
            direction,
            gender: targetGender,
            tone,
          }),
        });
        if (!res.ok) {
          let msg = "Translate failed";
          try {
            const j = await res.json();
            if (j?.error) msg = j.error;
          } catch {}
          throw new Error(msg);
        }
        const data = await res.json();
        const english =
          data.english ||
          (direction === "EN2LT" ? text : data.english || "");
        const lithuanian =
          data.lithuanian ||
          (direction === "LT2EN" ? text : data.lithuanian || "");
        setResult({
          english: english || "",
          lithuanian: lithuanian || "",
          phonetic: data.phonetic || "",
          usage: data.usage || "",
          notes: data.notes || "",
          category: data.category || "",
        });
      } catch (e) {
        setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    }

    function handleSave() {
      if (!result) {
        setError("Translate something first.");
        return;
      }
      const english = (result.english || "").trim();
      const lithuanian = (result.lithuanian || "").trim();
      if (!english && !lithuanian) {
        setError("Nothing to save yet.");
        return;
      }
      const row = {
        English: english,
        Lithuanian: lithuanian,
        Phonetic: (result.phonetic || "").trim(),
        Usage: (result.usage || "").trim(),
        Notes: (result.notes || "").trim(),
        Category: (result.category || "").trim(),
        "RAG Icon": "🟠",
        Sheet: "Phrases",
        _id: genId(),
        _ts: nowTs(),
        source: "ai",
        verified: false,
      };
      setRows((prev) => [row, ...prev]);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    }

    function handlePlay() {
      if (!result) return;
      const targetPhrase =
        direction === "EN2LT"
          ? result.lithuanian || result.english
          : result.english || result.lithuanian;
      if (!targetPhrase || !targetPhrase.trim()) return;
      playText(targetPhrase, { slow: false });
    }

    const directionLabel =
      direction === "EN2LT" ? "EN → LT" : "LT → EN";
    const srcPlaceholder =
      direction === "EN2LT"
        ? "Type your English phrase…"
        : "Įrašykite lietuvišką frazę…";

    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-28">
        {/* Spacer for header + dock */}
        <div style={{ height: HEADER_H + DOCK_H }} />

        {/* Translation card */}
        <div className="mt-3 mb-6">
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-1">
                  Live translator
                </div>
                <div className="text-xl sm:text-2xl font-semibold">
                  Say it right — then save it.
                </div>
              </div>
              <div className="sm:ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDirection("EN2LT")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs border",
                    direction === "EN2LT"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-zinc-950 border-zinc-700 text-zinc-200"
                  )}
                >
                  EN → LT
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("LT2EN")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs border",
                    direction === "LT2EN"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-zinc-950 border-zinc-700 text-zinc-200"
                  )}
                >
                  LT → EN
                </button>
              </div>
            </div>

            {/* Source text */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-zinc-400">
                  What do you want to say?
                </div>
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 uppercase tracking-[0.18em]">
                  {directionLabel}
                </div>
              </div>
              <textarea
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm min-h-[72px] resize-y"
                value={srcText}
                onChange={(e) => {
                  setSrcText(e.target.value);
                  setError("");
                }}
                placeholder={srcPlaceholder}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            {/* Tone row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1">
                <div className="text-xs text-zinc-400 mb-1">
                  Speaking to…
                </div>
                <div className="inline-flex gap-1 rounded-full bg-zinc-950 p-1 border border-zinc-700/70">
                  {[
                    { value: "neutral", label: "Neutral" },
                    { value: "female", label: "Female" },
                    { value: "male", label: "Male" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTargetGender(opt.value)}
                      className={cn(
                        "px-3 py-1 text-xs rounded-full",
                        targetGender === opt.value
                          ? "bg-emerald-600 text-white"
                          : "text-zinc-200"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <div className="text-xs text-zinc-400 mb-1">Tone</div>
                <div className="inline-flex gap-1 rounded-full bg-zinc-950 p-1 border border-zinc-700/70">
                  {[
                    { value: "friendly", label: "Friendly / familiar" },
                    { value: "neutral", label: "Neutral" },
                    { value: "formal", label: "Polite / formal" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTone(opt.value)}
                      className={cn(
                        "px-3 py-1 text-xs rounded-full whitespace-nowrap",
                        tone === opt.value
                          ? "bg-emerald-600 text-white"
                          : "text-zinc-200"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-3 text-sm text-red-400">{error}</div>
            )}

            {/* Actions: translate + audio + save */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <button
                type="button"
                onClick={handleTranslate}
                disabled={loading}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2",
                  "bg-emerald-600 hover:bg-emerald-500",
                  loading && "opacity-60 cursor-wait"
                )}
              >
                {loading ? "Translating…" : "Translate with GPT"}
              </button>

              <div className="flex-1 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlay}
                  disabled={!result}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm flex items-center gap-2",
                    "bg-zinc-900 border border-zinc-700",
                    !result && "opacity-50 cursor-default"
                  )}
                >
                  <span className="text-lg leading-none">▶</span>
                  <span>
                    {direction === "EN2LT"
                      ? "Play Lithuanian"
                      : "Play English"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!result}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-semibold",
                    "bg-zinc-900 border border-zinc-700",
                    !result && "opacity-50 cursor-default"
                  )}
                >
                  Save to library
                </button>

                {justSaved && (
                  <span className="text-xs text-emerald-400">
                    Saved ✓
                  </span>
                )}
              </div>
            </div>

            {/* Result card */}
            {result && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-1">
                    English
                  </div>
                  <div className="font-medium">
                    {result.english || "—"}
                  </div>
                  {result.usage && (
                    <div className="mt-2 text-xs text-zinc-400">
                      <span className="text-zinc-500">Usage: </span>
                      {result.usage}
                    </div>
                  )}
                  {result.category && (
                    <div className="mt-1 text-xs text-zinc-400">
                      <span className="text-zinc-500">Category: </span>
                      {result.category}
                    </div>
                  )}
                </div>

                <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 mb-1">
                    Lithuanian
                  </div>
                  <div className="font-medium">
                    {result.lithuanian || "—"}
                  </div>
                  {result.phonetic && (
                    <div className="mt-2 text-xs text-zinc-400">
                      <span className="text-zinc-500">Phonetic: </span>
                      {result.phonetic}
                    </div>
                  )}
                  {result.notes && (
                    <div className="mt-1 text-xs text-zinc-400">
                      <span className="text-zinc-500">Notes: </span>
                      {result.notes}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Existing list view under the translator */}
        {sortMode === "RAG" && WIDE ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {["🔴", "🟠", "🟢"].map((k) => (
              <div key={k}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-white text-xs px-2 py-0.5 rounded-full bg-zinc-700">
                    {k}
                  </span>
                  <div className="text-sm text-zinc-400">
                    {
                      filtered.filter(
                        (r) => normalizeRag(r["RAG Icon"]) === k
                      ).length
                    }{" "}
                    item(s)
                  </div>
                </div>
                <div className="space-y-2">
                  {filtered
                    .filter((r) => normalizeRag(r["RAG Icon"]) === k)
                    .map((r) => {
                      const idx = rows.indexOf(r);
                      return (
                        <EntryCard
                          key={r._id || idx}
                          r={r}
                          idx={idx}
                          editIdx={editIdx}
                          setEditIdx={setEditIdx}
                          editDraft={editDraft}
                          setEditDraft={setEditDraft}
                          expanded={expanded}
                          setExpanded={setExpanded}
                          T={T}
                          direction={direction}
                          startEdit={startEditRow}
                          saveEdit={saveEdit}
                          remove={remove}
                          normalizeRag={normalizeRag}
                          pressHandlers={pressHandlers}
                          cn={cn}
                        />
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {filtered.map((r, idx) => (
              <EntryCard
                key={r._id || idx}
                r={r}
                idx={idx}
                editIdx={editIdx}
                setEditIdx={setEditIdx}
                editDraft={editDraft}
                setEditDraft={setEditDraft}
                expanded={expanded}
                setExpanded={setExpanded}
                T={T}
                direction={direction}
                startEdit={startEditRow}
                saveEdit={saveEdit}
                remove={remove}
                normalizeRag={normalizeRag}
                pressHandlers={pressHandlers}
                cn={cn}
              />
            ))}
          </div>
        )}

        {/* Floating Add Button */}
        <button
          aria-label="Add entry"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 shadow-xl flex items-center justify-center text-3xl font-bold"
          onClick={() => setAddOpen(true)}
        >
          +
        </button>
      </div>
    );
  }

  function SettingsView() {
    const [showKey, setShowKey] = useState(false);
    const isBrowser = ttsProvider === "browser";

    const [keyField, setKeyField] = useState(azureKey);
    const [regionField, setRegionField] = useState(azureRegion);

    const commitKey = () => setAzureKey(keyField);
    const commitRegion = () => setAzureRegion(regionField);

    async function fetchAzureVoices() {
      try {
        const url = `https://${
          regionField || azureRegion
        }.tts.speech.microsoft.com/cognitiveservices/voices/list`;
        const res = await fetch(url, {
          headers: { "Ocp-Apim-Subscription-Key": keyField || azureKey },
        });
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setAzureVoices(data || []);
      } catch (e) {
        alert("Failed to fetch voices. Check key/region.");
      }
    }

    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-24">
        <div style={{ height: HEADER_H + DOCK_H }} />
        <h2 className="text-2xl font-bold mb-4">{T.settings}</h2>

        {/* Direction */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
          <div className="text-sm font-semibold mb-2">
            {T.direction}
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="dir"
                checked={direction === "EN2LT"}
                onChange={() => setDirection("EN2LT")}
              />
              <span>{T.en2lt}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="dir"
                checked={direction === "LT2EN"}
                onChange={() => setDirection("LT2EN")}
              />
              <span>{T.lt2en}</span>
            </label>
          </div>
        </div>

        {/* TTS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="text-sm font-semibold mb-3">
            {T.azure} / {T.browserVoice}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {/* Provider */}
            <div>
              <div className="text-xs mb-1">Provider</div>
              <select
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                value={ttsProvider}
                onChange={(e) => setTtsProvider(e.target.value)}
              >
                <option value="azure">Azure Speech</option>
                <option value="browser">Browser (fallback)</option>
              </select>
              {isBrowser && (
                <div className="text-xs text-zinc-400 mt-1">
                  {T.providerNote}
                </div>
              )}
            </div>

            {/* Azure creds */}
            {!isBrowser && (
              <>
                <div>
                  <div className="text-xs mb-1">{T.subKey}</div>
                  <div className="flex items-center gap-2">
                    <input
                      type={showKey ? "text" : "password"}
                      value={keyField}
                      onChange={(e) => setKeyField(e.currentTarget.value)}
                      onBlur={commitKey}
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                      placeholder="••••••••••••••••"
                    />
                    <button
                      type="button"
                      className="px-2 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-xs"
                      onClick={() => setShowKey((v) => !v)}
                    >
                      {showKey ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      className="px-2 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-xs"
                      onClick={commitKey}
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs mb-1">{T.region}</div>
                  <div className="flex items-center gap-2">
                    <input
                      value={regionField}
                      onChange={(e) =>
                        setRegionField(e.currentTarget.value)
                      }
                      onBlur={commitRegion}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                      placeholder="westeurope, eastus, ..."
                    />
                    <button
                      type="button"
                      className="px-2 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-xs"
                      onClick={commitRegion}
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 items-end sm:col-span-2">
                  <button
                    type="button"
                    onClick={fetchAzureVoices}
                    className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700"
                  >
                    {T.fetchVoices}
                  </button>
                  <select
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                    value={azureVoiceShortName}
                    onChange={(e) =>
                      setAzureVoiceShortName(e.target.value)
                    }
                  >
                    <option value="">{T.choose}</option>
                    {azureVoices.map((v) => (
                      <option
                        key={v.ShortName || v.shortName}
                        value={v.ShortName || v.shortName}
                      >
                        {v.LocalName || v.Name || v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Browser voice */}
            {isBrowser && (
              <div className="sm:col-span-2">
                <div className="text-xs mb-1">Browser voice</div>
                <div className="flex gap-2">
                  <select
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                    value={browserVoiceName || voices[0]?.name || ""}
                    onChange={(e) => setBrowserVoiceName(e.target.value)}
                  >
                    {voices.length === 0 && (
                      <option value="">(No voices found yet)</option>
                    )}
                    {voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700"
                    onClick={() => {
                      try {
                        window.speechSynthesis?.getVoices?.();
                      } catch {}
                    }}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="text-sm mb-2">Test voice</div>
            <button
              className="px-4 py-2 rounded-md font-semibold bg-emerald-600 hover:bg-emerald-500"
              onClick={() =>
                playText(
                  direction === "EN2LT"
                    ? "Sveiki! Kaip sekasi?"
                    : "Hello! How are you?"
                )
              }
            >
              Play sample
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------- RENDER ------------------------------- */

  return (
    <>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Header T={T} cn={cn} />
        <SearchDock
          SearchBox={SearchBox}
          sortMode={sortMode}
          setSortMode={setSortMode}
          placeholder={T.search}
          T={T}
          offsetTop={HEADER_H}
          page={page}
          setPage={setPage}
          // optional: if SearchDock has quiz/start props you can pass startQuiz, level, streak here
        />
        {page === "library" ? (
          <LibraryView />
        ) : page === "settings" ? (
          <SettingsView />
        ) : (
          <HomeView />
        )}

        {/* Add Entry Modal */}
        {addOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Add entry"
            onPointerDown={() => {
              setAddOpen(false);
              if (document.activeElement instanceof HTMLElement)
                document.activeElement.blur();
            }}
          >
            <div
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">
                  {T.addEntry}
                </div>
                <button
                  className="px-2 py-1 rounded-md bg-zinc-800"
                  onClick={() => setAddOpen(false)}
                >
                  Close
                </button>
              </div>
              <AddForm
                tab={tab}
                setRows={setRowsFromAddForm}
                T={T}
                genId={genId}
                nowTs={nowTs}
                normalizeRag={normalizeRag}
                direction={direction}
                onSave={() => {
                  setSortMode("Newest");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setTimeout(() => setSortMode("RAG"), 0);
                }}
                onCancel={() => setAddOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

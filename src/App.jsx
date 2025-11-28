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
import AddForm from "./components/AddForm";
import SearchDock from "./components/SearchDock";
import HomeView from "./views/HomeView";
import SettingsView from "./views/SettingsView";
import { searchStore } from "./searchStore";
import { usePhraseStore } from "./stores/phraseStore";
import LibraryView from "./views/LibraryView";

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

    // HOME VIEW
    heroTitle: "Say it right — then save it.",
    heroBody:
      "Draft the phrase, tune the tone, hear it spoken, then save it to your library.",
    learningDirection: "Learning direction",
    enToLt: "English → Lithuanian",
    ltToEn: "Lithuanian → English",
    speakingTo: "Speaking to…",
    speakingNeutral: "Neutral",
    speakingMale: "Male",
    speakingFemale: "Female",
    tone: "Tone",
    toneFriendly: "Friendly",
    toneNeutral: "Neutral",
    tonePolite: "Polite",
    inputLabelEn: "What do you want to say in English?",
    inputLabelLt: "What do you want to say in Lithuanian?",
    translate: "Translate",
    clear: "Clear",
    addToLibrary: "Add to library",
    copiedToForm: "Copied to Add form",
    addedToLibrary: "Added to library",
    fieldRequired: "Please add a phrase first.",

    // LIBRARY VIEW
    libraryTitle: "Library",
    libraryCount: (n) => `${n} / ${n} phrases`,
    search: "Search...",
    sort: "Sort:",
    newest: "Newest",
    oldest: "Oldest",
    rag: "RAG",
    noResults: "No results found.",
    playLt: "LT",
    playEn: "EN",
    edit: "Edit",
    delete: "Delete",
    confirmDeleteTitle: "Delete phrase?",
    confirmDeleteBody: "This cannot be undone.",
    confirmDeleteYes: "Delete",
    confirmDeleteNo: "Cancel",

    // ADD / EDIT FORM
    addEntry: "Add phrase",
    editEntry: "Edit phrase",
    enLabel: "English",
    ltLabel: "Lithuanian",
    phoneticsLabel: "Phonetics",
    tagLabel: "Tag / Note",
    ragLabel: "RAG status",
    ragRed: "🔴 Needs work",
    ragAmber: "🟠 In progress",
    ragGreen: "🟢 Solid",
    save: "Save",
    cancel: "Cancel",

    // SETTINGS
    settingsTitle: "Settings",
    directionHeading: "Learning direction",
    directionEnToLt: "I’m learning Lithuanian (EN → LT)",
    directionLtToEn: "I’m learning English (LT → EN)",
    starterHeading: "Starter Pack",
    starterBody: "Quickly install example phrases for English → Lithuanian learning.",
    starterButton: "Install starter pack",
    ttsHeading: "Azure Speech / Browser (fallback)",
    ttsProviderLabel: "Provider",
    ttsProviderAzure: "Azure Speech",
    ttsProviderBrowser: "Browser only",
    ttsAzureKeyLabel: "Subscription Key",
    ttsAzureRegionLabel: "Region",
    ttsAzureRegionPlaceholder: "westeurope",
    ttsAzureFetchVoices: "Fetch voices",
    ttsAzureVoiceLabel: "— choose —",
    ttsTestVoice: "Test voice",
    ttsBrowserVoiceLabel: "Browser voice",
    ttsRateLabel: "Rate",
    ttsSave: "Save",
    ttsShow: "Show",
    ttsHide: "Hide",
  },
  LT2EN: {
    appTitle1: "Lithuanian",
    appTitle2: "Trainer",
    subtitle: "Tap to play. Long-press to savour.",
    navHome: "Home",
    navLibrary: "Library",
    navSettings: "Settings",

    heroTitle: "Pasakyk teisingai — tada išsaugok.",
    heroBody:
      "Sukurk frazę, parink toną, išgirsk, kaip ji skamba, ir išsaugok savo bibliotekoje.",
    learningDirection: "Mokymosi kryptis",
    enToLt: "Anglų → Lietuvių",
    ltToEn: "Lietuvių → Anglų",
    speakingTo: "Su kuo kalbi…",
    speakingNeutral: "Neutraliai",
    speakingMale: "Vyrui",
    speakingFemale: "Moteriai",
    tone: "Tonas",
    toneFriendly: "Draugiškas",
    toneNeutral: "Neutralus",
    tonePolite: "Mandagus",
    inputLabelEn: "Ką nori pasakyti angliškai?",
    inputLabelLt: "Ką nori pasakyti lietuviškai?",
    translate: "Versti",
    clear: "Išvalyti",
    addToLibrary: "Pridėti į biblioteką",
    copiedToForm: "Nukopijuota į pridėjimo formą",
    addedToLibrary: "Pridėta į biblioteką",
    fieldRequired: "Pirmiausia įrašyk frazę.",

    libraryTitle: "Biblioteka",
    libraryCount: (n) => `${n} / ${n} frazės`,
    search: "Paieška...",
    sort: "Rikiuoti:",
    newest: "Naujausios",
    oldest: "Seniausios",
    rag: "RAG",
    noResults: "Rezultatų nėra.",
    playLt: "LT",
    playEn: "EN",
    edit: "Redaguoti",
    delete: "Ištrinti",
    confirmDeleteTitle: "Ištrinti frazę?",
    confirmDeleteBody: "Šio veiksmo nebegalėsi atšaukti.",
    confirmDeleteYes: "Ištrinti",
    confirmDeleteNo: "Atšaukti",

    addEntry: "Pridėti frazę",
    editEntry: "Redaguoti frazę",
    enLabel: "Angliškai",
    ltLabel: "Lietuviškai",
    phoneticsLabel: "Tarimas",
    tagLabel: "Žyma / Pastaba",
    ragLabel: "RAG būsena",
    ragRed: "🔴 Reikia daug darbo",
    ragAmber: "🟠 Dar mokausi",
    ragGreen: "🟢 Tvirta",
    save: "Išsaugoti",
    cancel: "Atšaukti",

    settingsTitle: "Nustatymai",
    directionHeading: "Mokymosi kryptis",
    directionEnToLt: "Mokausi lietuvių kalbos (EN → LT)",
    directionLtToEn: "Mokausi anglų kalbos (LT → EN)",
    starterHeading: "Pradinis rinkinys",
    starterBody: "Greitai įsidiek pavyzdines frazes anglų → lietuvių kalbai.",
    starterButton: "Įdiegti pradžios rinkinį",
    ttsHeading: "Azure Speech / Naršyklė (atsarginis)",
    ttsProviderLabel: "Tiekėjas",
    ttsProviderAzure: "Azure Speech",
    ttsProviderBrowser: "Tik naršyklė",
    ttsAzureKeyLabel: "Prenumeratos raktas",
    ttsAzureRegionLabel: "Regionas",
    ttsAzureRegionPlaceholder: "westeurope",
    ttsAzureFetchVoices: "Gauti balsus",
    ttsAzureVoiceLabel: "— pasirink —",
    ttsTestVoice: "Išbandyti balsą",
    ttsBrowserVoiceLabel: "Naršyklės balsas",
    ttsRateLabel: "Greitis",
    ttsSave: "Išsaugoti",
    ttsShow: "Rodyti",
    ttsHide: "Slėpti",
  },
};

/* ============================================================================
   HELPERS
   ========================================================================== */

const cn = (...xs) => xs.filter(Boolean).join(" ");

const loadXP = () => {
  try {
    const v = Number(localStorage.getItem(LSK_XP) ?? "0");
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
};

const saveXP = (xp) => {
  localStorage.setItem(LSK_XP, String(Number.isFinite(xp) ? xp : 0));
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const loadStreak = () => {
  try {
    const raw = localStorage.getItem(LSK_STREAK);
    if (!raw) return { streak: 0, lastDate: "" };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.streak !== "number") {
      return { streak: 0, lastDate: "" };
    }
    return parsed;
  } catch {
    return { streak: 0, lastDate: "" };
  }
};

const saveStreak = (s) => {
  localStorage.setItem(LSK_STREAK, JSON.stringify(s));
};

const nowTs = () => Date.now();

const genId = () => Math.random().toString(36).slice(2);

function normalizeRag(icon = "") {
  const s = String(icon).trim().toLowerCase();
  if (["🔴", "red"].includes(icon) || s === "red") return "🔴";
  if (["🟠", "amber", "orange", "yellow"].includes(icon) || ["amber", "orange", "yellow"].includes(s))
    return "🟠";
  if (["🟢", "green"].includes(icon) || s === "green") return "🟢";
  return "🟠";
}

function daysBetween(a, b) {
  return Math.round(
    (new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000
  );
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
  const [voices, setVoices] = useState(() => {
    if (typeof window === "undefined") return [];
    const synth = window.speechSynthesis;
    if (!synth) return [];
    const vs = synth.getVoices();
    return vs || [];
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    const handler = () => {
      const vs = synth.getVoices();
      setVoices(vs || []);
    };

    handler();
    synth.addEventListener("voiceschanged", handler);
    return () => synth.removeEventListener("voiceschanged", handler);
  }, []);

  return voices;
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function speakBrowser(text, voice, rate = 1) {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        reject(new Error("Browser speech synthesis not available"));
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = rate;
      u.onend = () => resolve();
      u.onerror = (e) => reject(e.error || e);
      synth.speak(u);
    } catch (err) {
      reject(err);
    }
  });
}

async function speakAzureHTTP(text, shortName, key, region, rateDelta = "0%") {
  const ssml = `
    <speak version="1.0" xml:lang="en-US">
      <voice name="${shortName}">
        <prosody rate="${rateDelta}">
          ${escapeXml(text)}
        </prosody>
      </voice>
    </speak>
  `.trim();

  const res = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      },
      body: ssml,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Azure TTS failed: ${res.status} ${res.statusText}. Body: ${text}`
    );
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  return url;
}

/* ============================================================================
   SEARCH BOX
   ========================================================================== */

const SearchBox = memo(
  forwardRef(function SearchBox({ placeholder = "Search…" }, ref) {
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      clear: () => {
        searchStore.setQuery("");
        if (inputRef.current) inputRef.current.value = "";
      },
    }));

    const q = useSyncExternalStore(
      searchStore.subscribe,
      searchStore.getSnapshot,
      searchStore.getServerSnapshot
    );

    const [localValue, setLocalValue] = useState(q || "");

    useEffect(() => {
      setLocalValue(q || "");
    }, [q]);

    const onChange = (e) => {
      const v = e.target.value;
      setLocalValue(v);
      startTransition(() => {
        searchStore.setQuery(v);
      });
    };

    const onClear = () => {
      setLocalValue("");
      startTransition(() => {
        searchStore.setQuery("");
      });
      inputRef.current?.focus();
    };

    return (
      <div className="flex w-full items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 outline-none select-none"
          placeholder={placeholder}
          value={localValue}
          onChange={onChange}
        />
        {localValue ? (
          <button
            type="button"
            className="text-zinc-400 text-xs sm:text-sm"
            onClick={onClear}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
          >
            {STR.EN2LT.clear}
          </button>
        ) : null}
      </div>
    );
  })
);

/* ============================================================================
   APP
   ========================================================================== */

export default function App() {
  const [page, setPage] = useState("home");

  // dynamic header measurement
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;
    const measure = () => {
      const h = headerRef.current.getBoundingClientRect().height || 0;
      setHeaderHeight(h);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onR = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  const WIDE = width >= 1024; // kept for future layout decisions, even if not used yet

  // store
  const rows = usePhraseStore((s) => s.phrases);
  const setRows = usePhraseStore((s) => s.setPhrases);

  const [tab, setTab] = useState("Phrases");

  const qFilter = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );

  const [sortMode, setSortMode] = useState(() => {
    try {
      return localStorage.getItem(LSK_SORT) || "RAG";
    } catch {
      return "RAG";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(LSK_SORT, sortMode);
    } catch {}
  }, [sortMode]);

  const [direction, setDirection] = useState(() => {
    try {
      return localStorage.getItem(LSK_DIR) || "EN2LT";
    } catch {
      return "EN2LT";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(LSK_DIR, direction);
    } catch {}
  }, [direction]);

  const T = STR[direction];

  const [xp, setXp] = useState(loadXP);
  useEffect(() => {
    saveXP(xp);
  }, [xp]);

  const [streak, setStreak] = useState(loadStreak);
  useEffect(() => {
    saveStreak(streak);
  }, [streak]);

  const [ttsProvider, setTtsProvider] = useState(() => {
    try {
      return localStorage.getItem(LSK_TTS_PROVIDER) || "azure";
    } catch {
      return "azure";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(LSK_TTS_PROVIDER, ttsProvider);
    } catch {}
  }, [ttsProvider]);

  const [azureKey, setAzureKey] = useState(() => {
    try {
      return localStorage.getItem(LSK_AZURE_KEY) || "";
    } catch {
      return "";
    }
  });

  const [azureRegion, setAzureRegion] = useState(() => {
    try {
      return localStorage.getItem(LSK_AZURE_REGION) || "westeurope";
    } catch {
      return "westeurope";
    }
  });

  const [azureVoices, setAzureVoices] = useState([]);
  const [azureVoiceShortName, setAzureVoiceShortName] = useState(() => {
    try {
      const raw = localStorage.getItem(LSK_AZURE_VOICE);
      if (!raw) return "";
      const parsed = JSON.parse(raw);
      return parsed?.shortName || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LSK_AZURE_KEY, azureKey || "");
    } catch {}
  }, [azureKey]);

  useEffect(() => {
    try {
      localStorage.setItem(LSK_AZURE_REGION, azureRegion || "");
    } catch {}
  }, [azureRegion]);

  useEffect(() => {
    try {
      localStorage.setItem(
        LSK_AZURE_VOICE,
        JSON.stringify({ shortName: azureVoiceShortName || "" })
      );
    } catch {}
  }, [azureVoiceShortName]);

  const voices = useVoices();
  const [browserVoiceName, setBrowserVoiceName] = useState("");
  const browserVoice = useMemo(() => {
    if (!voices.length) return null;
    if (browserVoiceName) {
      const found = voices.find((v) => v.name === browserVoiceName);
      if (found) return found;
    }
    return voices[0] || null;
  }, [voices, browserVoiceName]);

  const audioRef = useRef(null);

  async function playText(text, { slow = false } = {}) {
    if (!text) return;
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (ttsProvider === "browser" || !azureKey || !azureRegion || !azureVoiceShortName) {
        const rate = slow ? 0.7 : 1.0;
        await speakBrowser(text, browserVoice, rate);
        return;
      }

      const rateDelta = slow ? "-20%" : "0%";
      const url = await speakAzureHTTP(
        text,
        azureVoiceShortName,
        azureKey,
        azureRegion,
        rateDelta
      );
      const audio = new Audio(url);
      audioRef.current = audio;
      await new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Audio playback error"));
        };
        audio.play().catch(reject);
      });
    } catch (err) {
      console.error("Playback failed:", err);
      try {
        const rate = slow ? 0.7 : 1.0;
        await speakBrowser(text, browserVoice, rate);
      } catch (err2) {
        console.error("Fallback TTS failed:", err2);
      }
    }
  }

  const qNorm = (qFilter || "").trim().toLowerCase();

  const entryMatchesQuery = (r) => {
    if (!qNorm) return true;
    const en = (r.English || "").toLowerCase();
    const lt = (r.Lithuanian || "").toLowerCase();
    const tag = (r.Tag || "").toLowerCase();
    return (
      en.includes(qNorm) ||
      lt.includes(qNorm) ||
      tag.includes(qNorm)
    );
  };

  const filtered = useMemo(() => {
    const base = rows.filter(entryMatchesQuery);
    const withMeta = base.map((r, idx) => ({
      ...r,
      _idx: idx,
      _createdTs: r.createdTs || r.createdAt || 0,
      _ragRank:
        r.RAG === "🟢" ? 0 :
        r.RAG === "🟠" ? 1 : 2,
    }));

    if (sortMode === "Newest") {
      return [...withMeta].sort((a, b) => b._createdTs - a._createdTs);
    }
    if (sortMode === "Oldest") {
      return [...withMeta].sort((a, b) => a._createdTs - b._createdTs);
    }
    return [...withMeta].sort((a, b) => {
      if (a._ragRank !== b._ragRank) return a._ragRank - b._ragRank;
      return a._idx - b._idx;
    });
  }, [rows, qNorm, sortMode]);

  async function mergeRows(newRows) {
    if (!Array.isArray(newRows) || !newRows.length) return;

    const byKey = new Map();
    const all = [...rows, ...newRows].map((r) => {
      const key = `${(r.English || "").trim()}|||${(r.Lithuanian || "").trim()}`;
      if (!byKey.has(key)) byKey.set(key, r);
      return r;
    });

    const deduped = Array.from(byKey.values()).map((r) => ({
      ...r,
      _id: r._id || genId(),
      RAG: normalizeRag(r.RAG || r.icon),
    }));

    setRows(deduped);
  }

  async function fetchStarter(kind) {
    const url = STARTERS[kind || "EN2LT"];
    if (!url) return;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch starter");
    const data = await res.json();
    if (!Array.isArray(data)) return;

    const mapped = data.map((r) => ({
      _id: genId(),
      English: r.English || r.en || "",
      Lithuanian: r.Lithuanian || r.lt || "",
      Phonetics: r.Phonetics || r.phonetics || "",
      Tag: r.Tag || r.tag || "",
      RAG: normalizeRag(r.RAG || r.icon),
      createdTs: r.createdTs || nowTs(),
    }));

    await mergeRows(mapped);
  }

  async function installNumbersOnly() {
    try {
      const res = await fetch("/data/starter_numbers_only.json");
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const mapped = data.map((r) => ({
        _id: genId(),
        English: r.English || "",
        Lithuanian: r.Lithuanian || "",
        Phonetics: r.Phonetics || "",
        Tag: r.Tag || "",
        RAG: normalizeRag(r.RAG || r.icon),
        createdTs: r.createdTs || nowTs(),
      }));
      await mergeRows(mapped);
    } catch (err) {
      console.error("Failed to install numbers-only starter:", err);
    }
  }

  async function importJsonFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("Expected array data.");
      const mapped = data.map((r) => ({
        _id: r._id || genId(),
        English: r.English || "",
        Lithuanian: r.Lithuanian || "",
        Phonetics: r.Phonetics || "",
        Tag: r.Tag || "",
        RAG: normalizeRag(r.RAG || r.icon),
        createdTs: r.createdTs || nowTs(),
      }));
      await mergeRows(mapped);
    } catch (err) {
      console.error("Import failed:", err);
    }
  }

  function clearLibrary() {
    if (!window.confirm("Clear entire library? This cannot be undone.")) return;
    setRows([]);
  }

  const [dupeResults, setDupeResults] = useState({ exact: [], close: [] });

  function scanDupes() {
    const list = rows;
    const exact = [];
    const close = [];

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        const sameEn =
          (a.English || "").trim().toLowerCase() ===
          (b.English || "").trim().toLowerCase();
        const sameLt =
          (a.Lithuanian || "").trim().toLowerCase() ===
          (b.Lithuanian || "").trim().toLowerCase();

        if (sameEn && sameLt) {
          exact.push([a, b]);
        } else {
          const simEn = sim2(a.English || "", b.English || "");
          const simLt = sim2(a.Lithuanian || "", b.Lithuanian || "");
          if (simEn >= 0.85 || simLt >= 0.85) {
            close.push({ a, b, simEn, simLt });
          }
        }
      }
    }

    setDupeResults({ exact, close });
  }

  const [quizOn, setQuizOn] = useState(false);
  const [quizQs, setQuizQs] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizChoice, setQuizChoice] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);

  function computeQuizPool(allRows, targetSize = 10) {
    if (!allRows.length) return [];
    const today = todayKey();
    const withMeta = allRows.map((r, idx) => {
      const d = r.lastQuizDate || "";
      const streakWeight =
        d && daysBetween(d, today) <= 2 ? 1 : 0;
      const ragWeight = r.RAG === "🟢" ? 3 : r.RAG === "🟠" ? 2 : 1;
      const spacingFactor = 1 + streakWeight + ragWeight;
      return { r, idx, spacingFactor };
    });

    const expanded = [];
    withMeta.forEach((x) => {
      const n = x.spacingFactor;
      for (let i = 0; i < n; i++) {
        expanded.push(x.r);
      }
    });

    if (!expanded.length) return sample(allRows, Math.min(targetSize, allRows.length));
    return sample(expanded, Math.min(targetSize, expanded.length));
  }

  function startQuiz() {
    if (!rows.length) return;
    const pool = computeQuizPool(rows, 12);
    if (!pool.length) return;
    setQuizQs(pool);
    setQuizIdx(0);
    setQuizAnswered(false);
    setQuizChoice(null);

    const first = pool[0];
    const others = rows.filter((r) => r._id !== first._id);
    const distractors = sample(others, 3);
    setQuizOptions(shuffle([first, ...distractors]));
    setQuizOn(true);
  }

  function bumpRagAfterAnswer(item, correct) {
    const prevIdx = rows.findIndex((r) => r._id === item._id);
    if (prevIdx === -1) return;

    const prev = rows[prevIdx];
    let nextRag = prev.RAG || "🟠";
    if (correct) {
      if (nextRag === "🔴") nextRag = "🟠";
      else if (nextRag === "🟠") nextRag = "🟢";
    } else {
      if (nextRag === "🟢") nextRag = "🟠";
      else if (nextRag === "🟠") nextRag = "🔴";
    }

    const updated = {
      ...prev,
      RAG: nextRag,
      lastQuizDate: todayKey(),
    };

    setRows((prevRows) => {
      const copy = [...prevRows];
      copy[prevIdx] = updated;
      return copy;
    });
  }

  async function answerQuiz(option) {
    if (quizAnswered) return;
    setQuizAnswered(true);
    setQuizChoice(option._id);

    const current = quizQs[quizIdx];
    const correct = option._id === current._id;

    bumpRagAfterAnswer(current, correct);

    if (correct) {
      const gainedXP = XP_PER_CORRECT;
      setXp((prev) => prev + gainedXP);

      const today = todayKey();
      setStreak((prev) => {
        const last = prev.lastDate || "";
        if (!last) return { streak: 1, lastDate: today };
        const diff = daysBetween(last, today);
        if (diff === 0) return prev;
        if (diff === 1) {
          return { streak: prev.streak + 1, lastDate: today };
        }
        return { streak: 1, lastDate: today };
      });
    }

    try {
      const text =
        direction === "EN2LT"
          ? option.Lithuanian || ""
          : option.English || "";
      await playText(text, { slow: false });
    } catch (err) {
      console.error("Quiz playback failed:", err);
    }
  }

  function afterAnswerAdvance() {
    if (!quizAnswered) return;
    const nextIndex = quizIdx + 1;
    if (nextIndex >= quizQs.length) {
      setQuizOn(false);
      return;
    }

    setQuizIdx(nextIndex);
    setQuizAnswered(false);
    setQuizChoice(null);

    const current = quizQs[nextIndex];
    const others = rows.filter((r) => r._id !== current._id);
    const distractors = sample(others, 3);
    setQuizOptions(shuffle([current, ...distractors]));
  }

  const [addOpen, setAddOpen] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  const editingRow = useMemo(
    () => rows.find((r) => r._id === editRowId) || null,
    [rows, editRowId]
  );

  const isEditing = !!editingRow;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setAddOpen(false);
        setEditRowId(null);
      }
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

  /* ------------------------------ RENDER --------------------------------- */

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header ref={headerRef} T={T} page={page} setPage={setPage} />

      <main>
        {page === "library" && (
          <SearchDock
            SearchBox={SearchBox}
            sortMode={sortMode}
            setSortMode={setSortMode}
            placeholder={T.search}
            T={T}
            offsetTop={headerHeight}
            page={page}
            // setPage still passed, in case you ever re-add nav there
            setPage={setPage}
          />
        )}

        {page === "library" ? (
          <LibraryView
            T={T}
            rows={rows}
            setRows={setRows}
            normalizeRag={normalizeRag}
            sortMode={sortMode}
            direction={direction}
            playText={playText}
            removePhrase={(id) => {
              const idx = rows.findIndex((r) => r._id === id);
              if (idx !== -1) {
                const removeFromStore =
                  usePhraseStore.getState().removePhrase;
                removeFromStore(idx);
              } else {
                setRows((prev) => prev.filter((r) => r._id !== id));
              }
            }}
            onEditRow={(id) => {
              setEditRowId(id);
              setAddOpen(true);
            }}
          />
        ) : page === "settings" ? (
          <SettingsView
            T={T}
            direction={direction}
            setDirection={setDirection}
            ttsProvider={ttsProvider}
            setTtsProvider={setTtsProvider}
            azureKey={azureKey}
            setAzureKey={setAzureKey}
            azureRegion={azureRegion}
            setAzureRegion={setAzureRegion}
            azureVoices={azureVoices}
            setAzureVoices={setAzureVoices}
            azureVoiceShortName={azureVoiceShortName}
            setAzureVoiceShortName={setAzureVoiceShortName}
            browserVoiceName={browserVoiceName}
            setBrowserVoiceName={setBrowserVoiceName}
            voices={voices}
            playText={playText}
            fetchStarter={fetchStarter}
            importJsonFile={importJsonFile}
            clearLibrary={clearLibrary}
            scanDupes={scanDupes}
            dupeResults={dupeResults}
            installNumbersOnly={installNumbersOnly}
            rows={rows}
            xp={xp}
            streak={streak}
            quizOn={quizOn}
            quizQs={quizQs}
            quizIdx={quizIdx}
            quizAnswered={quizAnswered}
            quizChoice={quizChoice}
            quizOptions={quizOptions}
            startQuiz={startQuiz}
            answerQuiz={answerQuiz}
            afterAnswerAdvance={afterAnswerAdvance}
            LEVEL_STEP={LEVEL_STEP}
            XP_PER_CORRECT={XP_PER_CORRECT}
          />
        ) : (
          <>
            <HomeView
              direction={direction}
              setDirection={setDirection}
              playText={playText}
              setRows={setRows}
              genId={genId}
              nowTs={nowTs}
              STR={STR}
              cn={cn}
              rows={rows}
              showToast={showToast}
            />

            {toast && (
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg z-[200] shadow-lg">
                {toast}
              </div>
            )}
          </>
        )}
      </main>

      {addOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onPointerDown={() => {
            setAddOpen(false);
            setEditRowId(null);
            document.activeElement?.blur?.();
          }}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">
                {isEditing ? T.editEntry : T.addEntry}
              </div>
              <button
                className="px-2 py-1 rounded-md bg-zinc-800 select-none"
                onClick={() => {
                  setAddOpen(false);
                  setEditRowId(null);
                }}
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
              >
                ×
              </button>
            </div>

            <AddForm
              tab={tab}
              T={T}
              genId={genId}
              nowTs={nowTs}
              normalizeRag={normalizeRag}
              direction={direction}
              mode={isEditing ? "edit" : "add"}
              initialRow={editingRow || undefined}
              onSubmit={(row) => {
                if (isEditing) {
                  setRows((prev) =>
                    prev.map((r) => (r._id === row._id ? row : r))
                  );
                } else {
                  setRows((prev) => [
                    {
                      ...row,
                      createdTs: nowTs(),
                    },
                    ...prev,
                  ]);
                  setSortMode("Newest");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setTimeout(() => setSortMode("RAG"), 0);
                }
                setAddOpen(false);
                setEditRowId(null);
              }}
              onCancel={() => {
                setAddOpen(false);
                setEditRowId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useDeferredValue,
  startTransition,
  forwardRef,
  memo,
} from "react";
import Header from "./components/Header";
import EntryCard from "./components/EntryCard";
import AddForm from "./components/AddForm";

/**
 * Lithuanian Trainer — App.jsx (mobile keyboard-stability build)
 * - Fix: swap window.resize width tracking for matchMedia("(min-width:1024px)")
 *        so the search input doesn't lose focus when the mobile keyboard opens.
 */

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
  },
};

// ---- LocalStorage helpers
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

// Robust XP load/save
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
    if (!s || typeof s.streak !== "number")
      return { streak: 0, lastDate: "" };
    return s;
  } catch {
    return { streak: 0, lastDate: "" };
  }
};
const saveStreak = (s) => localStorage.setItem(LSK_STREAK, JSON.stringify(s));

// ---- Utils
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

// ---- Voices / TTS
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

/** -------------------------
 *  SearchBox (isolated input)
 * ------------------------- */
const SearchBox = memo(
  forwardRef(function SearchBox(
    { value, onChangeValue, placeholder },
    ref
  ) {
    const userIntentRef = useRef(0);

    const onBlur = (e) => {
      const now = performance?.now ? performance.now() : Date.now();
      const delta = now - (userIntentRef.current || 0);
      const intended = delta >= 0 && delta < 350;
      const hasTarget =
        !!e.relatedTarget && e.relatedTarget instanceof HTMLElement;

      if (!intended && !hasTarget) {
        requestAnimationFrame(() => {
          const el = e.target;
          if (document.activeElement !== el) el?.focus?.({ preventScroll: true });
        });
      }
    };

    return (
      <div className="relative flex-1" data-skip-sticky>
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          onBlur={onBlur}
          onPointerDownCapture={() => {
            userIntentRef.current = performance?.now
              ? performance.now()
              : Date.now();
          }}
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm outline-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="search"
          inputMode="search"
          type="text"
        />
        {!!value && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            onClick={() => onChangeValue("")}
            aria-label="Clear"
          >
            ×
          </button>
        )}
      </div>
    );
  })
);

/** -------------------------
 *  Hook: matchMedia for WIDE
 *  (doesn't fire on soft keyboard)
 * ------------------------- */
function useWide() {
  const query = "(min-width: 1024px)";
  const get = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false;

  const [wide, setWide] = useState(get);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const handler = (e) => setWide(e.matches);
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else mql.addListener(handler);
    setWide(mql.matches);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler);
      else mql.removeListener(handler);
    };
  }, []);

  return wide;
}

export default function App() {
  // layout (replaced resize-with-width with media query)
  const WIDE = useWide();

  // ✅ restored (was missing in a previous patch)
  const [page, setPage] = useState("home");

  // data + prefs
  const [rows, setRows] = useState(loadRows());

  // one-time migration for stable keys/ts (prevents remount focus losses)
  useEffect(() => {
    let changed = false;
    const migrated = rows.map((r) => {
      if (!r._id || typeof r._id !== "string") {
        changed = true;
        return { ...r, _id: genId(), _ts: r._ts || nowTs() };
      }
      return r;
    });
    if (changed) setRows(migrated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [tab, setTab] = useState("Phrases");
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q); // defers heavy filtering while typing
  const searchRef = useRef(null);

  const [sortMode, setSortMode] = useState(
    () => localStorage.getItem(LSK_SORT) || "RAG"
  );
  useEffect(() => localStorage.setItem(LSK_SORT, sortMode), [sortMode]);
  const [direction, setDirection] = useState(
    () => localStorage.getItem(LSK_DIR) || "EN2LT"
  );
  useEffect(() => localStorage.setItem(LSK_DIR, direction), [direction]);
  const T = STR[direction];

  const [xp, setXp] = useState(loadXP());
  useEffect(() => saveXP(xp), [xp]);
  useEffect(() => {
    if (!Number.isFinite(xp)) setXp(0);
  }, []);
  const level = Math.floor((Number.isFinite(xp) ? xp : 0) / LEVEL_STEP) + 1;
  const levelProgress = (Number.isFinite(xp) ? xp : 0) % LEVEL_STEP;

  const [streak, setStreak] = useState(loadStreak());
  useEffect(() => saveStreak(streak), [streak]);

  // TTS
  const [ttsProvider, setTtsProvider] = useState(
    () => localStorage.getItem(LSK_TTS_PROVIDER) || "azure"
  );
  useEffect(() => localStorage.setItem(LSK_TTS_PROVIDER, ttsProvider), [
    ttsProvider,
  ]);
  const [azureKey, setAzureKey] = useState(
    () => localStorage.getItem(LSK_AZURE_KEY) || ""
  );
  const [azureRegion, setAzureRegion] = useState(
    () => localStorage.getItem(LSK_AZURE_REGION) || ""
  );
  const [azureVoices, setAzureVoices] = useState([]);
  const [azureVoiceShortName, setAzureVoiceShortName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LSK_AZURE_VOICE) || "null")
        ?.shortName || "";
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

  // --- ANDROID KEYBOARD "STICKY FOCUS" PATCH (scoped + opt-out) ---
  if (typeof window !== "undefined" && window.__lt_focus_lock_until == null) {
    window.__lt_focus_lock_until = 0;
  }
  useEffect(() => {
    if (typeof window !== "undefined") window.__lt_focus_lock_until = 0;

    const shouldSkip = (el) => {
      if (!el || !(el instanceof HTMLElement)) return true;
      if (el.closest("[data-skip-sticky]")) return true;
      if (el.matches?.('input[type="search"], [inputmode="search"]')) return true;
      if (searchRef.current && el === searchRef.current) return true;
      return false;
    };

    const onInputCapture = (evt) => {
      const el = evt.target;
      if (!(el instanceof HTMLElement)) return;
      if (evt.isComposing) return;
      if (shouldSkip(el)) return;

      const now = performance?.now ? performance.now() : Date.now();
      if (now < (window.__lt_focus_lock_until || 0)) return;

      let s, e;
      try {
        s = el.selectionStart;
        e = el.selectionEnd;
      } catch {}

      requestAnimationFrame(() => {
        const now2 = performance?.now ? performance.now() : Date.now();
        if (now2 < (window.__lt_focus_lock_until || 0)) return;

        if (document.activeElement !== el) {
          el.focus({ preventScroll: true });
          try {
            if (s != null && e != null) el.setSelectionRange(s, e);
          } catch {}
        }
      });
    };

    document.addEventListener("input", onInputCapture, true);
    return () => document.removeEventListener("input", onInputCapture, true);
  }, []);
  // ------------------------------------------------

  // Keep the keyboard from collapsing if the WebView drops focus from the search
  useEffect(() => {
    const ref = searchRef;
    const onFocusOut = (e) => {
      const t = e.target;
      if (!ref.current || t !== ref.current) return;

      const hasNewTarget = e.relatedTarget instanceof HTMLElement;
      if (!hasNewTarget) {
        requestAnimationFrame(() => {
          if (document.activeElement !== ref.current) {
            ref.current?.focus?.({ preventScroll: true });
          }
        });
      }
    };

    document.addEventListener("focusout", onFocusOut, true);
    return () => document.removeEventListener("focusout", onFocusOut, true);
  }, []);

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
        const rate = slow ? 0.6 : 1.0;
        speakBrowser(text, browserVoice, rate);
      }
    } catch (e) {
      console.error(e);
      alert("Voice error: " + (e?.message || e));
    }
  }

  // Press handlers
  function pressHandlers(text) {
    let timer = null;
    let firedSlow = false;
    let pressed = false;

    const start = (e) => {
      e.preventDefault();
      e.stopPropagation();
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
      if (!firedSlow) playText(text, { slow: false });
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

  // ---- FILTERING / SORTING

  const qNorm = dq.trim().toLowerCase();
  const entryMatchesQuery = (r) =>
    !!qNorm &&
    (((r.English || "").toLowerCase().includes(qNorm)) ||
      ((r.Lithuanian || "").toLowerCase().includes(qNorm)));

  const filtered = useMemo(() => {
    const haystack = qNorm ? rows : rows.filter((r) => r.Sheet === tab);
    const byQ = !qNorm ? haystack : haystack.filter(entryMatchesQuery);
    if (sortMode === "Newest")
      return [...byQ].sort((a, b) => (b._ts || 0) - (a._ts || 0));
    if (sortMode === "Oldest")
      return [...byQ].sort((a, b) => (a._ts || 0) - (b._ts || 0));
    const order = { "🔴": 0, "🟠": 1, "🟢": 2 };
    return [...byQ].sort(
      (a, b) =>
        (order[normalizeRag(a["RAG Icon"])] ?? 1) -
        (order[normalizeRag(b["RAG Icon"])] ?? 1)
    );
  }, [rows, tab, qNorm, sortMode]);

  const sheetCounts = useMemo(() => {
    if (!qNorm) return null;
    const counts = { Phrases: 0, Questions: 0, Words: 0, Numbers: 0 };
    for (const r of rows)
      if (entryMatchesQuery(r)) counts[r.Sheet] = (counts[r.Sheet] || 0) + 1;
    return counts;
  }, [rows, qNorm]);

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
          r._qstat || {
            red: { ok: 0, bad: 0 },
            amb: { ok: 0, bad: 0 },
            grn: { ok: 0, bad: 0 },
          },
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

  async function installNumbersOnly() {
    const urls = [STARTERS.COMBINED_OPTIONAL, STARTERS.EN2LT, STARTERS.LT2EN].filter(
      Boolean
    );
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
    if (!confirm(T.confirm)) return;
    setRows([]);
  }

  // Duplicate finder
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
          const s =
            (sim2(A.r.English, B.r.English) + sim2(A.r.Lithuanian, B.r.Lithuanian)) / 2;
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

  // ---------- Add Modal state ----------
  const [addOpen, setAddOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState(null);

  const setRowsFromAddForm = React.useCallback((updater) => {
    setRows((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      queueMicrotask(() => {
        setAddOpen(false);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
      return next;
    });
  }, []);
  // ------------------------------------

  function LibraryView() {
    const fileRef = useRef(null);
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-24">
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => fetchStarter("EN2LT")}
            className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
            title="English prompts → Lithuanian answers. Installs EN→LT starter."
          >
            {T.installEN}
          </button>
        </div>

        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => fetchStarter("LT2EN")}
            className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
            title="Lithuanian prompts → English answers. Installs LT→EN starter."
          >
            {T.installLT}
          </button>
          <button
            onClick={installNumbersOnly}
            className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2"
            title="Adds only entries from the Numbers sheet in the starter files."
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
            title="Import a custom JSON array of entries."
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
            title="Export your current library as JSON."
          >
            Export JSON
          </button>
          <button
            onClick={clearLibrary}
            className="bg-zinc-900 border border-red-600 text-red-400 rounded-md px-3 py-2"
            title="Remove all entries from your library."
          >
            {T.clearAll}
          </button>
        </div>

        {/* Duplicates */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-semibold">{T.dupFinder}</div>
            <button onClick={scanDupes} className="bg-zinc-800 px-3 py-2 rounded-md">
              {T.scan}
            </button>
          </div>

          {/* Exact duplicates */}
          <div className="text-sm text-zinc-400 mb-2">
            {T.exactGroups}: {dupeResults.exact.length} group(s)
          </div>
          <div className="space-y-3 mb-6">
            {dupeResults.exact.map((group, gi) => (
              <div key={gi} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.map((ridx) => {
                    const row = rows[ridx];
                    return (
                      <div key={ridx} className="border border-zinc-800 rounded-md p-2">
                        <div className="font-medium">
                          {row.English} — {row.Lithuanian}{" "}
                          <span className="text-xs text-zinc-400">[{row.Sheet}]</span>
                        </div>
                        {(row.Usage || row.Notes) && (
                          <div className="mt-1 text-xs text-zinc-400 space-y-1">
                            {row.Usage && (
                              <div>
                                <span className="text-zinc-500">{T.usage}: </span>
                                {row.Usage}
                              </div>
                            )}
                            {row.Notes && (
                              <div>
                                <span className="text-zinc-500">{T.notes}: </span>
                                {row.Notes}
                              </div>
                            )}
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
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Close matches */}
          <div className="text-sm text-zinc-400 mb-2">
            {T.closeMatches}: {dupeResults.close.length} pair(s)
          </div>
          <div className="space-y-3">
            {dupeResults.close.map(([i, j, s]) => {
              const A = rows[i],
                B = rows[j];
              return (
                <div key={`${i}-${j}`} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                  <div className="text-xs text-zinc-400 mb-2">
                    {T.similarity}: {(s * 100).toFixed(0)}%
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[{ row: A, idx: i }, { row: B, idx: j }].map(
                      ({ row, idx: ridx }) => (
                        <div key={ridx} className="border border-zinc-800 rounded-md p-2">
                          <div className="font-medium">
                            {row.English} — {row.Lithuanian}{" "}
                            <span className="text-xs text-zinc-400">[{row.Sheet}]</span>
                          </div>
                          {(row.Usage || row.Notes) && (
                            <div className="mt-1 text-xs text-zinc-400 space-y-1">
                              {row.Usage && (
                                <div>
                                  <span className="text-zinc-500">{T.usage}: </span>
                                  {row.Usage}
                                </div>
                              )}
                              {row.Notes && (
                                <div>
                                  <span className="text-zinc-500">{T.notes}: </span>
                                  {row.Notes}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="mt-2">
                            <button
                              className="text-xs bg-red-800/40 border border-red-600 px-2 py-1 rounded-md"
                              onClick={() =>
                                setRows((prev) => prev.filter((_, ii) => ii !== ridx))
                              }
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
                    direction === d
                      ? "bg-emerald-600 border-emerald-600"
                      : "bg-zinc-900 border-zinc-700"
                  )}
                  title={
                    d === "EN2LT"
                      ? "Prompts in English → answers in Lithuanian"
                      : "Prompts in Lithuanian → answers in English"
                  }
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

          {ttsProvider === "browser" && (
            <div className="space-y-2">
              <div className="text-xs mb-1">{T.voice}</div>
              <select
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                value={browserVoiceName}
                onChange={(e) => setBrowserVoiceName(e.target.value)}
                title={T.browserVoice}
              >
                <option value="">Auto voice</option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

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
                  disabled={!azureRegion || !azureKey}
                  onClick={async () => {
                    if (!azureRegion || !azureKey) {
                      alert("Enter Azure region and key first.");
                      return;
                    }
                    try {
                      const url = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
                      const res = await fetch(url, {
                        headers: { "Ocp-Apim-Subscription-Key": azureKey },
                      });
                      if (!res.ok) throw new Error("Failed to fetch Azure voices");
                      const data = await res.json();
                      const vs = data.map((v) => ({
                        shortName: v.ShortName,
                        locale: v.Locale,
                        displayName: v.LocalName || v.FriendlyName || v.ShortName,
                      }));
                      setAzureVoices(vs);
                      if (!azureVoiceShortName && vs.length)
                        setAzureVoiceShortName(vs[0].shortName);
                    } catch (e) {
                      alert(e.message);
                    }
                  }}
                  className={`bg-zinc-800 px-3 py-2 rounded-md ${
                    !azureRegion || !azureKey ? "opacity-50 cursor-not-allowed" : ""
                  }`}
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
          <SearchBox
            ref={searchRef}
            value={q}
            onChangeValue={(val) => startTransition(() => setQ(val))}
            placeholder={T.search}
          />
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
          <div className="text-xs text-zinc-400">
            🔥 {T.streak}: <span className="font-semibold">{streak.streak}</span>
          </div>
          <div className="text-xs text-zinc-400">
            🥇 {T.level} <span className="font-semibold">{level}</span>
          </div>
          <div className="flex-1 h-2 bg-zinc-800 rounded-md overflow-hidden">
            <div
              className="h-full bg-emerald-600"
              style={{ width: `${(levelProgress / LEVEL_STEP) * 100}%` }}
            />
          </div>
          <div className="text-xs text-zinc-400">
            {levelProgress} / {LEVEL_STEP} XP
          </div>
        </div>

        {/* Tabs (with highlights while searching) */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {["Phrases", "Questions", "Words", "Numbers"].map((t) => {
            const hits = sheetCounts?.[t] || 0;
            const searching = !!qNorm;
            const isActive = tab === t;
            const base =
              "relative px-3 py-1.5 rounded-full text-sm border transition-colors";
            const normal = isActive
              ? "bg-emerald-600 border-emerald-600"
              : "bg-zinc-900 border-zinc-800";
            const highlighted =
              hits > 0
                ? "ring-2 ring-emerald-500 ring-offset-0"
                : searching
                ? "opacity-60"
                : "";
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(base, normal, highlighted)}
                title={hits ? `${hits} match${hits === 1 ? "" : "es"}` : undefined}
              >
                {t === "Phrases"
                  ? T.phrases
                  : t === "Questions"
                  ? T.questions
                  : t === "Words"
                  ? T.words
                  : T.numbers}
                {hits > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 text-xs rounded-full bg-emerald-700 px-1">
                    {hits}
                  </span>
                )}
              </button>
            );
          })}
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
                  ragChip === x
                    ? "bg-emerald-600 border-emerald-600"
                    : "bg-zinc-900 border-zinc-700"
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
                    return (
                      <EntryCard
                        key={r._id || idx}
                        r={r}
                        idx={idx}
                        rows={rows}
                        setRows={setRows}
                        editIdx={editIdx}
                        setEditIdx={setEditIdx}
                        editDraft={editDraft}
                        setEditDraft={setEditDraft}
                        expanded={expanded}
                        setExpanded={setExpanded}
                        T={T}
                        direction={direction}
                        startEdit={startEdit}
                        saveEdit={saveEdit}
                        remove={remove}
                        normalizeRag={normalizeRag}
                        pressHandlers={pressHandlers}
                        cn={cn}
                        flashId={justAddedId}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {chipFiltered.map((r) => {
              const idx = rows.indexOf(r);
              return (
                <EntryCard
                  key={r._id || idx}
                  r={r}
                  idx={idx}
                  rows={rows}
                  setRows={setRows}
                  editIdx={editIdx}
                  setEditIdx={setEditIdx}
                  editDraft={editDraft}
                  setEditDraft={setEditDraft}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  T={T}
                  direction={direction}
                  startEdit={startEdit}
                  saveEdit={saveEdit}
                  remove={remove}
                  normalizeRag={normalizeRag}
                  pressHandlers={pressHandlers}
                  cn={cn}
                  flashId={justAddedId}
                />
              );
            })}
          </div>
        )}

        {/* Floating Add (+) Button */}
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header T={T} page={page} setPage={setPage} startQuiz={startQuiz} cn={cn} />

      {page === "library" ? (
        <LibraryView />
      ) : page === "settings" ? (
        <SettingsView />
      ) : (
        <HomeView />
      )}

      {/* Quiz modal */}
      {quizOn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            {quizQs.length > 0 &&
              (() => {
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

      {/* Add Entry Modal */}
      {addOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onPointerDown={() => {
            setAddOpen(false);
            if (document.activeElement instanceof HTMLElement)
              document.activeElement.blur();
          }}
        >
          <div
            className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">{T.addEntry}</div>
              <button className="px-2 py-1 rounded-md bg-zinc-800" onClick={() => setAddOpen(false)}>
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
              onSaved={(id) => {
                setSortMode("Newest");
                window.scrollTo({ top: 0, behavior: "smooth" });
                setJustAddedId(id);
                setTimeout(() => setJustAddedId(null), 1400);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

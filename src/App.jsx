import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lithuanian Trainer — full app
 * - List view with tabs, search, details toggle
 * - RAG sort (🔴 🟠 🟢), add/edit/delete
 * - XLSX import (UMD loader), JSON export (MERGES + DE-DUPES)
 * - TTS providers: Browser, ElevenLabs, Azure (tap = normal, long-press = slow)
 * - ElevenLabs monthly usage counter
 * - Quiz: multiple choice, audio before choice, feedback, weighted RAG sampling, daily streak
 * - Direction toggle EN→LT / LT→EN (list view)
 * - XP/Level system (50 XP per correct; 2500 XP per level)
 * - Starter packs modal on first run (EN→LT / LT→EN / Both)
 * - NEW: Numbers tab supported everywhere
 * - NEW: Starter packs can be loaded later from Settings (merge, not overwrite)
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
];

const LS_KEY = "lt_phrasebook_v2";
const LSK_TTS_PROVIDER = "lt_tts_provider"; // 'browser' | 'elevenlabs' | 'azure'
const LSK_ELEVEN_KEY = "lt_eleven_key";
const LSK_ELEVEN_VOICE = "lt_eleven_voice"; // {id,name}
const LSK_USAGE = "lt_eleven_usage_v1"; // {month:"YYYY-MM", requests:number}
const LSK_AZURE_KEY = "lt_azure_key";
const LSK_AZURE_REGION = "lt_azure_region";
const LSK_AZURE_VOICE = "lt_azure_voice"; // {shortName}
const LSK_STREAK = "lt_quiz_streak_v1"; // {streak:number, lastDate:"YYYY-MM-DD"}

// XP / Level
const LSK_XP = "lt_quiz_xp_v1"; // number
const XP_PER_CORRECT = 50;
const XP_PER_LEVEL = 2500;

// Onboarding (starter packs modal)
const LSK_ONBOARDED = "lt_onboarded_v1";

// Supported sheets/tabs
const SHEETS = ["Phrases", "Questions", "Words", "Numbers"];

// -------------------- Local storage helpers --------------------
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

const monthKey = () => new Date().toISOString().slice(0, 7); // YYYY-MM
const loadUsage = () => {
  try {
    const u = JSON.parse(localStorage.getItem(LSK_USAGE) || "null");
    if (!u || u.month !== monthKey()) return { month: monthKey(), requests: 0 };
    return u;
  } catch {
    return { month: monthKey(), requests: 0 };
  }
};
const saveUsage = (u) => localStorage.setItem(LSK_USAGE, JSON.stringify(u));

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

// XP helpers
const loadXp = () => {
  try {
    const v = Number(localStorage.getItem(LSK_XP) || "0");
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
};
const saveXp = (xp) => localStorage.setItem(LSK_XP, String(xp));

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
  return ""; // unknown/empty
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

// ---- Merge & de-dupe helpers (Sheet + English + Lithuanian) ----
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
      // Merge policy: keep current fields, fill blanks from incoming, normalize RAG
      map.set(k, {
        ...cur,
        ...r,
        English: cur.English || r.English,
        Lithuanian: cur.Lithuanian || r.Lithuanian,
        "RAG Icon": normalizeRag(r["RAG Icon"] || cur["RAG Icon"]),
      });
    }
  }
  return Array.from(map.values());
}

// -------------------- XLSX (UMD loader) --------------------
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
        "RAG Icon": normalizeRag(r["RAG Icon"] ?? r.RAG ?? r.rag ?? ""),
        Sheet: tabs.has(name) ? name : r.Sheet || "Phrases",
      };
      if (row.English || row.Lithuanian) merged.push(row);
    }
  }
  return merged;
}

function exportJson(rows) {
  const blob = new Blob([JSON.stringify(rows, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lt-phrasebook.json";
  a.click();
  URL.revokeObjectURL(url);
}

// -------------------- Voice (browser + ElevenLabs + Azure) --------------------
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
  u.rate = rate; // 1.0 normal, 0.6 slow
  window.speechSynthesis.cancel(); // stop any current browser TTS
  window.speechSynthesis.speak(u);
}

async function fetchElevenVoicesHTTP(key) {
  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": key },
  });
  if (!res.ok) throw new Error("Failed to fetch voices");
  const data = await res.json();
  return (data.voices || []).map((v) => ({ id: v.voice_id, name: v.name }));
}
async function speakElevenLabsHTTP(text, voiceId, key) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.7,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    }
  );
  if (!res.ok) throw new Error("ElevenLabs TTS failed: " + res.status + " " + res.statusText);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

function escapeXml(s){
  return String(s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
    .replace(/'/g,"&apos;");
}
async function speakAzureHTTP(text, shortName, key, region, rateDelta = "0%") {
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml =
    `<speak version="1.0" xml:lang="lt-LT">
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
  if (!res.ok) throw new Error("Azure TTS failed: " + res.status + " " + res.statusText);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// -------------------- App --------------------
export default function App() {
  const fileRef = useRef(null);

  const [rows, setRows] = useState(loadData());
  const [tab, setTab] = useState("Phrases");
  const [q, setQ] = useState("");
  const [direction, setDirection] = useState("EN2LT"); // for list view
  const [voiceName, setVoiceName] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [ragPriority, setRagPriority] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Starter packs modal (open on first run if no data)
  const [starterOpen, setStarterOpen] = useState(() => {
    try {
      const hasData = (loadData() || []).length > 0;
      const seen = !!localStorage.getItem(LSK_ONBOARDED);
      return !hasData && !seen;
    } catch {
      return true;
    }
  });

  // TTS provider selector
  const [ttsProvider, setTtsProvider] = useState(
    () => localStorage.getItem(LSK_TTS_PROVIDER) || "azure" // default to Azure
  );

  // ElevenLabs
  const [elevenKey, setElevenKey] = useState(
    () => localStorage.getItem(LSK_ELEVEN_KEY) || ""
  );
  const [elevenVoices, setElevenVoices] = useState([]); // {id,name}
  const [elevenVoiceId, setElevenVoiceId] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem(LSK_ELEVEN_VOICE) || "null");
      return v?.id || "";
    } catch {
      return "";
    }
  });
  const [elevenVoiceName, setElevenVoiceName] = useState(() => {
    try {
      const v = JSON.parse(localStorage.getItem(LSK_ELEVEN_VOICE) || "null");
      return v?.name || "";
    } catch {
      return "";
    }
  });
  const [usage, setUsage] = useState(loadUsage());

  // Azure
  const [azureKey, setAzureKey] = useState(() => localStorage.getItem(LSK_AZURE_KEY) || "");
  const [azureRegion, setAzureRegion] = useState(() => localStorage.getItem(LSK_AZURE_REGION) || "");
  const [azureVoices, setAzureVoices] = useState([]); // {shortName, locale, displayName}
  const [azureVoiceShortName, setAzureVoiceShortName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LSK_AZURE_VOICE) || "null")?.shortName || "";
    } catch {
      return "";
    }
  });

  // Streak
  const [streak, setStreak] = useState(loadStreak());

  // XP / Level (persistent)
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

  // Track per-quiz XP gain + starting level (to show level-up on congrats)
  const [quizSessionXp, setQuizSessionXp] = useState(0);
  const [quizStartLevel, setQuizStartLevel] = useState(level);

  // Form/edit/expand
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

  // Quiz state
  const [quizOn, setQuizOn] = useState(false);
  const [quizQs, setQuizQs] = useState([]); // array of rows
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizChoice, setQuizChoice] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]); // array of strings (answers)
  const [quizShowCongrats, setQuizShowCongrats] = useState(false);

  // voices
  const voices = useVoices();
  const voice = useMemo(
    () =>
      voices.find((v) => v.name === voiceName) ||
      voices.find((v) => (v.lang || "").toLowerCase().startsWith("lt")) ||
      voices[0],
    [voices, voiceName]
  );

  // SINGLE audio element for Azure/Eleven so they don't overlap
  const audioRef = useRef(null);

  // Persist data/settings
  useEffect(() => saveData(rows), [rows]);
  useEffect(() => localStorage.setItem(LSK_TTS_PROVIDER, ttsProvider), [ttsProvider]);
  useEffect(() => { if (elevenKey) localStorage.setItem(LSK_ELEVEN_KEY, elevenKey); }, [elevenKey]);
  useEffect(() => {
    localStorage.setItem(LSK_ELEVEN_VOICE, JSON.stringify({ id: elevenVoiceId, name: elevenVoiceName }));
  }, [elevenVoiceId, elevenVoiceName]);
  useEffect(() => saveUsage(usage), [usage]);
  useEffect(() => { if (azureKey) localStorage.setItem(LSK_AZURE_KEY, azureKey); }, [azureKey]);
  useEffect(() => { if (azureRegion) localStorage.setItem(LSK_AZURE_REGION, azureRegion); }, [azureRegion]);
  useEffect(() => {
    localStorage.setItem(LSK_AZURE_VOICE, JSON.stringify({ shortName: azureVoiceShortName }));
  }, [azureVoiceShortName]);
  useEffect(() => saveStreak(streak), [streak]);
  useEffect(() => saveXp(xp), [xp]); // persist XP

  // keep the Add form's Sheet synced with active tab
  useEffect(() => {
    setDraft((d) => ({ ...d, Sheet: tab }));
  }, [tab]);

  // Search + tab filtering (for list view only)
  const filtered = useMemo(() => {
    return rows
      .filter((r) => r.Sheet === tab)
      .filter((r) =>
        !q
          ? true
          : `${r.English} ${r.Lithuanian} ${r.Phonetic} ${r.Category} ${r.Usage} ${r.Notes}`
              .toLowerCase()
              .includes(q.toLowerCase())
      );
  }, [rows, tab, q]);

  // RAG grouping + priority (list view)
  const groups = useMemo(() => {
    const buckets = { "🔴": [], "🟠": [], "🟢": [], "": [] };
    for (const r of filtered) buckets[normalizeRag(r["RAG Icon"]) || ""].push(r);
    const order = ["🔴", "🟠", "🟢", ""];
    const keys =
      ragPriority && order.includes(ragPriority)
        ? [ragPriority, ...order.filter((x) => x !== ragPriority)]
        : order;
    return keys.map((k) => ({ key: k, items: buckets[k] }));
  }, [filtered, ragPriority]);

  // Map filtered rows to global index (for editing)
  const filteredWithIndex = useMemo(() => {
    const indices = [];
    rows.forEach((r, i) => {
      if (r.Sheet !== tab) return;
      const hay = `${r.English} ${r.Lithuanian} ${r.Phonetic} ${r.Category} ${r.Usage} ${r.Notes}`.toLowerCase();
      if (!q || hay.includes(q.toLowerCase())) indices.push(i);
    });
    return indices.map((i) => ({ idx: i, row: rows[i] }));
  }, [rows, tab, q]);

  // -------------------- Starter packs (first run + on demand) --------------------
  async function fetchStarter(path, sourceName) {
    const res = await fetch(path);
    if (!res.ok) throw new Error("Failed to fetch starter: " + path);
    const arr = await res.json();
    return arr.map((r) => ({ ...r, Source: sourceName })); // optional tagging
  }

  async function loadStarter(choice) {
    const map = {
      enlt: "/data/starter_en_to_lt.json",
      lten: "/data/starter_lt_to_en.json",
      both: "/data/starter_combined_dedup.json",
    };
    const path = map[choice];
    const label =
      choice === "both"
        ? "Starter (Both)"
        : choice === "enlt"
        ? "Starter (EN→LT)"
        : "Starter (LT→EN)";
    try {
      const incoming = await fetchStarter(path, label);
      setRows((prev) => mergeRows(prev, incoming));
      localStorage.setItem(LSK_ONBOARDED, "1");
      setStarterOpen(false);
      alert(`${label} merged successfully.`);
    } catch (e) {
      alert(e.message || String(e));
    }
  }

  // -------------------- Audio helpers --------------------
  async function playText(text, { slow = false } = {}) {
    try {
      if (ttsProvider === "elevenlabs" && elevenKey && elevenVoiceId) {
        setUsage((u) => {
          const base = u.month === monthKey() ? u : { month: monthKey(), requests: 0 };
          return { ...base, requests: (base.requests || 0) + 1 };
        });
        const url = await speakElevenLabsHTTP(text, elevenVoiceId, elevenKey);

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

      } else if (ttsProvider === "azure" && azureKey && azureRegion && azureVoiceShortName) {
        const delta = slow ? "-40%" : "0%"; // slow ≈ 60%
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
        speakBrowser(text, voice, rate); // browser TTS cancels itself
      }
    } catch (e) {
      console.error(e);
      alert("Voice error: " + (e?.message || e));
    }
  }

  // Pointer-only long-press handlers to avoid duplicate (touch+mouse) firing
  function pressHandlers(text) {
    let timer = null;

    const start = (e) => {
      e.preventDefault(); // avoid ghost click/mouse after touch
      timer = setTimeout(() => {
        timer = null;                // mark as consumed
        playText(text, { slow: true });
      }, 550); // hold ~0.55s for slow
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
    };
  }

  // -------------------- CRUD --------------------
  function addRow() {
    if (!draft.English || !draft.Lithuanian) {
      alert("English & Lithuanian are required");
      return;
    }
    const row = { ...draft, "RAG Icon": normalizeRag(draft["RAG Icon"]) };
    setRows((prev) => [row, ...prev]);
    setDraft({
      ...draft,
      English: "",
      Lithuanian: "",
      Phonetic: "",
      Category: "",
      Usage: "",
      Notes: "",
    });
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
  async function onImportFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const newRows = await importXlsx(f);
      if (!newRows.length) {
        alert("No rows found in workbook.");
        return;
      }
      // Tag with source filename (optional, handy later)
      const tagged = newRows.map((r) => ({ ...r, Source: f.name || "Import" }));
      // MERGE (do not overwrite)
      setRows((prev) => mergeRows(prev, tagged));
      setTab("Phrases");
      setQ("");
      alert(`Imported ${newRows.length} rows (merged; duplicates skipped).`);
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

  // -------------------- Quiz --------------------
  function computeQuizPool(allRows, targetSize = 10) {
    const withPairs = allRows.filter(r => r.English && r.Lithuanian);
    const red = withPairs.filter(r => normalizeRag(r["RAG Icon"]) === "🔴");
    const amb = withPairs.filter(r => normalizeRag(r["RAG Icon"]) === "🟠");
    const grn = withPairs.filter(r => normalizeRag(r["RAG Icon"]) === "🟢");
    let needR = Math.min(4, red.length);
    let needA = Math.min(5, amb.length);
    let needG = Math.min(1, grn.length);
    let picked = [...sample(red, needR), ...sample(amb, needA), ...sample(grn, needG)];
    // fill deficit if any
    while (picked.length < targetSize) {
      const leftovers = withPairs.filter(r => !picked.includes(r));
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
    setQuizScore(0);
    setQuizAnswered(false);
    setQuizChoice(null);
    setQuizSessionXp(0);
    setQuizStartLevel(1 + Math.floor(xp / XP_PER_LEVEL));

    // build first options
    const first = pool[0];
    const keyAns = "Lithuanian"; // answer side is always Lithuanian for choices
    const distractors = pickDistractors(pool, first, keyAns, 3);
    const opts = shuffle([first[keyAns], ...distractors.map(d => d[keyAns])]);
    setQuizOptions(opts);

    setQuizOn(true);
  }

  function quitQuiz() {
    if (!confirm("Quit the quiz? Your progress for this session won't count toward streak.")) return;
    setQuizOn(false);
  }

  function afterAnswerAdvance() {
    const nextIdx = quizIdx + 1;
    if (nextIdx >= quizQs.length) {
      // complete quiz → update streak (once per calendar day)
      const today = todayKey();
      if (streak.lastDate !== today) {
        const inc =
          streak.lastDate && daysBetween(streak.lastDate, today) === 1
            ? streak.streak + 1
            : 1;
        const updated = { streak: inc, lastDate: today };
        setStreak(updated);
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
    const opts = shuffle([item[keyAns], ...distractors.map(d => d[keyAns])]);
    setQuizOptions(opts);
  }

  async function answerQuiz(option) {
    if (quizAnswered) return;
    const item = quizQs[quizIdx];
    const correct = item["Lithuanian"];
    const ok = option === correct;

    setQuizChoice(option);
    setQuizAnswered(true);
    if (ok) {
      setQuizScore((s) => s + 1);
      setXp((xpPrev) => xpPrev + XP_PER_CORRECT);
      setQuizSessionXp((g) => g + XP_PER_CORRECT);
    }

    // Play correct audio after answer
    await playText(correct, { slow: false });
  }

  // -------------------- Render --------------------
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-[180px]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-500 flex items-center justify-center font-bold text-zinc-900">
              LT
            </div>
            <div className="leading-tight">
              <div className="text-lg font-semibold">Lithuanian Trainer</div>
              <div className="text-xs text-zinc-400">Tap to play. Long-press to savor.</div>
            </div>
          </div>

          {/* Voice selector + usage badge */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1 flex-1 sm:flex-none"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              disabled={ttsProvider !== "browser"}
              title={
                ttsProvider === "elevenlabs"
                  ? "Using ElevenLabs"
                  : ttsProvider === "azure"
                  ? "Using Azure"
                  : "Browser voice"
              }
            >
              <option value="">Auto voice</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>

            {ttsProvider === "elevenlabs" && (
              <div
                className="text-[11px] px-2 py-1 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300"
                title="Monthly usage (resets each calendar month)"
              >
                {(usage.requests || 0)} plays
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap w-full sm:w-auto pt-2 sm:pt-0">
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onImportFile} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1">
              <span className="hidden sm:inline">Import .xlsx</span><span className="sm:hidden">📥 XLSX</span>
            </button>
            <button onClick={() => exportJson(rows)} className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1">
              <span className="hidden sm:inline">Export JSON</span><span className="sm:hidden">📤 JSON</span>
            </button>
            <button onClick={clearAll} className="bg-zinc-900 border border-red-600 text-red-400 rounded-md text-xs px-2 py-1">
              {confirmClear ? "Tap again" : <> <span className="hidden sm:inline">Clear data</span><span className="sm:hidden">🗑</span> </>}
            </button>
            <button onClick={() => setSettingsOpen(true)} className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1">
              <span className="hidden sm:inline">Settings</span><span className="sm:hidden">⚙️</span>
            </button>
            <button onClick={startQuiz} className="bg-emerald-600 hover:bg-emerald-500 rounded-md text-xs px-3 py-1 font-semibold">
              Start Quiz
            </button>
          </div>
        </div>

        {/* Search + Mode + RAG sort + Streak + Level */}
        <div className="max-w-xl mx-auto px-3 sm:px-4 pb-2 sm:pb-3 flex items-center gap-2 flex-wrap">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="flex-1 min-w-[180px] bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm outline-none"
          />
          <div className="flex items-center gap-1">
            <span className="text-xs text-zinc-300">Mode:</span>
            {["EN2LT", "LT2EN"].map((m) => (
              <button
                key={m}
                onClick={() => setDirection(m)}
                className={cn(
                  "px-2 py-1 rounded-md text-xs border",
                  direction === m ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-700"
                )}
                title={m === "EN2LT" ? "English → Lithuanian" : "Lithuanian → English"}
              >
                {m === "EN2LT" ? "EN→LT" : "LT→EN"}
              </button>
            ))}
          </div>
          <div className="text-xs text-zinc-300">Sort RAG first:</div>
          <div className="flex items-center gap-1">
            {["", "🔴", "🟠", "🟢"].map((x, i) => (
              <button
                key={i}
                onClick={() => setRagPriority(x)}
                className={cn(
                  "px-2 py-1 rounded-md text-xs border",
                  ragPriority === x ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-700"
                )}
                title={x ? `Show ${x} first` : "No priority"}
              >
                {x || "All"}
              </button>
            ))}
          </div>

          {/* Right side stats */}
          <div className="ml-auto flex items-center gap-3">
            <div className="text-xs text-zinc-400 whitespace-nowrap">
              🔥 Streak: <span className="font-semibold">{streak.streak}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">
                {levelBadge(level)} <span className="font-semibold">Lv {numberWithCommas(level)}</span>
              </span>
              <div className="w-28 h-2 rounded bg-zinc-800 overflow-hidden">
                <div
                  className="h-2 bg-emerald-600"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-[11px] text-zinc-400">
                {numberWithCommas(xpIntoLevel)} / {numberWithCommas(XP_PER_LEVEL)} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 sticky top-[78px] bg-zinc-950/90 backdrop-blur z-10 border-b border-zinc-900">
        {SHEETS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "mr-2 mb-2 px-3 py-1.5 rounded-full text-sm border",
              tab === t ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-800"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List view */}
      {!quizOn && (
        <div className="max-w-xl mx-auto px-3 sm:px-4 pb-28">
          {groups.map(({ key, items }) => (
            <div key={key || "none"} className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-white text-xs px-2 py-0.5 rounded-full bg-zinc-700">
                  {key || "⬤"}
                </span>
                <div className="text-sm text-zinc-400">{items.length} item(s)</div>
              </div>
              <div className="space-y-2">
                {items.map((r) => {
                  const idx = rows.indexOf(r);
                  const isEditing = editIdx === idx;
                  const primary = direction === "EN2LT" ? r.Lithuanian : r.English;
                  const secondary = direction === "EN2LT" ? r.English : r.Lithuanian;

                  return (
                    <div key={`${r.English}-${idx}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                      {!isEditing ? (
                        <div className="flex items-start gap-2">
                          {/* Play button (tap = normal, hold = slow) */}
                          <button
                            className="shrink-0 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition flex items-center justify-center font-semibold"
                            title="Tap = play, long-press = slow"
                            {...pressHandlers(r.Lithuanian)}
                          >
                            ►
                          </button>
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
                                {expanded.has(idx) ? "Hide details" : "Show details"}
                              </button>
                            </div>

                            {expanded.has(idx) && (
                              <>
                                {r.Phonetic && <div className="text-xs text-zinc-400 mt-1">{r.Phonetic}</div>}
                                {(r.Usage || r.Notes) && (
                                  <div className="text-xs text-zinc-500 mt-1">
                                    {r.Usage && <div className="mb-0.5"><span className="text-zinc-400">Usage: </span>{r.Usage}</div>}
                                    {r.Notes && <div className="opacity-80"><span className="text-zinc-400">Notes: </span>{r.Notes}</div>}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 ml-2">
                            <button onClick={() => startEdit(idx)} className="text-xs bg-zinc-800 px-2 py-1 rounded-md">Edit</button>
                            <button onClick={() => remove(idx)} className="text-xs bg-zinc-800 text-red-400 px-2 py-1 rounded-md">Delete</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                            <label className="col-span-2">
                              English
                              <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                                value={editDraft.English}
                                onChange={(e) => setEditDraft({ ...editDraft, English: e.target.value })}
                              />
                            </label>
                            <label className="col-span-2">
                              Lithuanian
                              <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                                value={editDraft.Lithuanian}
                                onChange={(e) => setEditDraft({ ...editDraft, Lithuanian: e.target.value })}
                              />
                            </label>
                            <label>
                              Phonetic
                              <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                                value={editDraft.Phonetic}
                                onChange={(e) => setEditDraft({ ...editDraft, Phonetic: e.target.value })}
                              />
                            </label>
                            <label>
                              Category
                              <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                                value={editDraft.Category}
                                onChange={(e) => setEditDraft({ ...editDraft, Category: e.target.value })}
                              />
                            </label>
                            <label className="col-span-2">
                              Usage
                              <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                                value={editDraft.Usage}
                                onChange={(e) => setEditDraft({ ...editDraft, Usage: e.target.value })}
                              />
                            </label>
                            <label className="col-span-2">
                              Notes
                              <input className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                                value={editDraft.Notes}
                                onChange={(e) => setEditDraft({ ...editDraft, Notes: e.target.value })}
                              />
                            </label>
                            <label>
                              RAG
                              <select className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                                value={editDraft["RAG Icon"]}
                                onChange={(e) => setEditDraft({ ...editDraft, "RAG Icon": normalizeRag(e.target.value) })}
                              >
                                {"🔴 🟠 🟢".split(" ").map((x) => (
                                  <option key={x} value={x}>{x}</option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Sheet
                              <select className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                                value={editDraft.Sheet}
                                onChange={(e) => setEditDraft({ ...editDraft, Sheet: e.target.value })}
                              >
                                {SHEETS.map((s) => (
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
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz view */}
      {quizOn && (
        <div className="max-w-xl mx-auto px-3 sm:px-4 pb-28">
          <div className="mt-3 mb-2 flex items-center justify-between">
            <div className="text-sm text-zinc-400">Question {quizIdx + 1} / {quizQs.length}</div>
            <button onClick={quitQuiz} className="text-xs bg-zinc-800 px-2 py-1 rounded-md">Quit</button>
          </div>

          {quizQs.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
              {(() => {
                const item = quizQs[quizIdx];
                const questionText = item.English; // show English prompt
                const correctLt = item.Lithuanian;

                return (
                  <>
                    <div className="text-sm text-zinc-400 mb-1">Prompt</div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-lg font-medium flex-1">{questionText}</div>
                      {/* hear Lithuanian for the prompt (correct answer) */}
                      <button
                        className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center font-semibold"
                        title="Tap = play, long-press = slow"
                        {...pressHandlers(correctLt)}
                      >
                        ►
                      </button>
                    </div>

                    <div className="text-sm text-zinc-400 mb-1">Choose the Lithuanian</div>
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
                          <button
                            key={opt}
                            className={`${base} ${color}`}
                            onClick={() => !quizAnswered && answerQuiz(opt)}
                          >
                            <span className="flex-1">{opt}</span>
                            {/* preview audio for this option */}
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

                    {quizAnswered && (
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-zinc-300">
                          {quizChoice === correctLt ? "Correct! (+50 XP)" : "Not quite."}
                        </div>
                        <button
                          onClick={afterAnswerAdvance}
                          className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md text-sm font-semibold"
                        >
                          Next Question
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          <div className="mt-3 text-sm text-zinc-400">Score: {quizScore} / {quizQs.length}</div>
        </div>
      )}

      {/* Add form */}
      {!quizOn && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800">
          <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <details>
              <summary className="cursor-pointer text-sm text-zinc-300">+ Add entry</summary>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder="English" value={draft.English} onChange={(e) => setDraft({ ...draft, English: e.target.value })} />
                <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder="Lithuanian" value={draft.Lithuanian} onChange={(e) => setDraft({ ...draft, Lithuanian: e.target.value })} />
                <input className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder="Phonetic" value={draft.Phonetic} onChange={(e) => setDraft({ ...draft, Phonetic: e.target.value })} />
                <input className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder="Category" value={draft.Category} onChange={(e) => setDraft({ ...draft, Category: e.target.value })} />
                <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder="Usage" value={draft.Usage} onChange={(e) => setDraft({ ...draft, Usage: e.target.value })} />
                <input className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" placeholder="Notes" value={draft.Notes} onChange={(e) => setDraft({ ...draft, Notes: e.target.value })} />
                <select className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" value={draft["RAG Icon"]} onChange={(e) => setDraft({ ...draft, "RAG Icon": normalizeRag(e.target.value) })}>
                  {"🔴 🟠 🟢".split(" ").map((x) => (<option key={x} value={x}>{x}</option>))}
                </select>
                <select className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm" value={draft.Sheet} onChange={(e) => setDraft({ ...draft, Sheet: e.target.value })}>
                  {SHEETS.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
                <button onClick={addRow} className="col-span-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-md px-3 py-2 text-sm font-semibold">Add</button>
              </div>
            </details>
          </div>
        </div>
      )}

      <div className="h-24" />

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[92%] max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-4">
            <div className="text-lg font-semibold mb-2">Settings</div>
            <div className="space-y-4 text-sm">
              {/* Provider */}
              <div>
                <div className="text-xs mb-1">Voice provider</div>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="ttsprov" checked={ttsProvider === "browser"} onChange={() => setTtsProvider("browser")} /> Browser (fallback)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="ttsprov" checked={ttsProvider === "elevenlabs"} onChange={() => setTtsProvider("elevenlabs")} /> ElevenLabs
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="ttsprov" checked={ttsProvider === "azure"} onChange={() => setTtsProvider("azure")} /> Azure Speech
                  </label>
                </div>
              </div>

              {/* Starter packs on-demand */}
              <div className="p-3 rounded-md border border-zinc-700 bg-zinc-950">
                <div className="font-medium mb-1">Starter packs</div>
                <div className="text-xs text-zinc-400 mb-2">Merge more starter data into your library (won’t overwrite existing rows):</div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => loadStarter("enlt")} className="bg-emerald-600 hover:bg-emerald-500 px-2 py-1 rounded-md text-xs font-semibold">Load EN→LT</button>
                  <button onClick={() => loadStarter("lten")} className="bg-emerald-600 hover:bg-emerald-500 px-2 py-1 rounded-md text-xs font-semibold">Load LT→EN</button>
                  <button onClick={() => loadStarter("both")} className="bg-zinc-800 px-2 py-1 rounded-md text-xs">Load Both</button>
                  <button onClick={() => setStarterOpen(true)} className="bg-zinc-800 px-2 py-1 rounded-md text-xs">Open chooser</button>
                </div>
              </div>

              {/* ElevenLabs config */}
              {ttsProvider === "elevenlabs" && (
                <div className="space-y-2">
                  <div>
                    <div className="text-xs mb-1">ElevenLabs API Key</div>
                    <input
                      type="password"
                      value={elevenKey}
                      onChange={(e) => setElevenKey(e.target.value)}
                      placeholder="paste your xi-api-key"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <div className="text-xs mb-1">Voice</div>
                      <select
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                        value={elevenVoiceId}
                        onChange={(e) => {
                          const v = elevenVoices.find((vv) => vv.id === e.target.value);
                          setElevenVoiceId(e.target.value);
                          setElevenVoiceName(v?.name || "");
                        }}
                      >
                        <option value="">— choose —</option>
                        {elevenVoices.map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const vs = await fetchElevenVoicesHTTP(elevenKey);
                          setElevenVoices(vs);
                          if (!elevenVoiceId && vs.length) {
                            setElevenVoiceId(vs[0].id);
                            setElevenVoiceName(vs[0].name);
                          }
                        } catch (e) {
                          alert(e.message);
                        }
                      }}
                      className="bg-zinc-800 px-3 py-2 rounded-md"
                    >
                      Fetch voices
                    </button>
                  </div>

                  {/* Usage box */}
                  <div className="mt-3 p-3 rounded-md border border-zinc-700 bg-zinc-950">
                    <div className="font-medium mb-1">Monthly usage</div>
                    <div className="text-xs text-zinc-300">{usage.requests || 0} plays this month</div>
                    <div className="text-[11px] text-zinc-500">Resets automatically each calendar month.</div>
                    <div className="mt-2 flex gap-2">
                      <button className="bg-zinc-800 px-2 py-1 rounded-md text-xs" onClick={() => window.open("https://elevenlabs.io/subscription", "_blank")}>Manage plan</button>
                      <button className="bg-zinc-800 px-2 py-1 rounded-md text-xs" onClick={() => setUsage({ month: monthKey(), requests: 0 })}>Reset now</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Azure config */}
              {ttsProvider === "azure" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs mb-1">Subscription Key</div>
                      <input
                        type="password"
                        value={azureKey}
                        onChange={(e) => setAzureKey(e.target.value)}
                        placeholder="Azure key"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <div className="text-xs mb-1">Region</div>
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
                      <div className="text-xs mb-1">Voice</div>
                      <select
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                        value={azureVoiceShortName}
                        onChange={(e) => setAzureVoiceShortName(e.target.value)}
                      >
                        <option value="">— choose —</option>
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
                        } catch (e) { alert(e.message); }
                      }}
                      className="bg-zinc-800 px-3 py-2 rounded-md"
                    >
                      Fetch voices
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setSettingsOpen(false)} className="bg-emerald-600 px-3 py-2 rounded-md">Close</button>
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
            <div className="text-zinc-300 mb-1">You scored {quizScore} / {quizQs.length}.</div>
            <div className="text-sm text-emerald-400 mb-2">+{quizSessionXp} XP</div>
            {1 + Math.floor(xp / XP_PER_LEVEL) > quizStartLevel && (
              <div className="text-sm mb-2">
                Level Up! {levelBadge(1 + Math.floor(xp / XP_PER_LEVEL))} Now <span className="font-semibold">Lv {numberWithCommas(1 + Math.floor(xp / XP_PER_LEVEL))}</span>
              </div>
            )}
            <div className="text-sm text-zinc-400 mb-4">
              🔥 Daily streak: <span className="font-semibold text-emerald-400">{streak.streak}</span>
            </div>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => { setQuizShowCongrats(false); setQuizOn(false); }}
                className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-md font-semibold"
              >
                Done
              </button>
              <button
                onClick={() => { setQuizShowCongrats(false); startQuiz(); }}
                className="bg-zinc-800 px-4 py-2 rounded-md"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Starter packs modal (first run and on-demand) */}
      {starterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[92%] max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5 text-center">
            <div className="text-xl font-semibold mb-2">Load starter pack?</div>
            <div className="text-sm text-zinc-300 mb-4">
              Choose a starter deck to merge into your library (you can import more later).
            </div>
            <div className="grid grid-cols-1 gap-2 mb-3">
              <button onClick={() => loadStarter("enlt")} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-md font-semibold">
                EN→LT Starter
              </button>
              <button onClick={() => loadStarter("lten")} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-md font-semibold">
                LT→EN Starter
              </button>
              <button onClick={() => loadStarter("both")} className="bg-zinc-800 px-4 py-2 rounded-md">
                Both (combined)
              </button>
            </div>
            <button
              onClick={() => { localStorage.setItem(LSK_ONBOARDED, "1"); setStarterOpen(false); }}
              className="text-sm text-zinc-400 underline"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

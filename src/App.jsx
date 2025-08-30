import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lithuanian Trainer — App.jsx
 * - Home / Library / Settings pills (+ Start Quiz)
 * - JSON & XLSX import (append + dedupe), export, clear-all with confirm
 * - Tabs: Phrases / Questions / Words / Numbers
 * - Search with single clear ×
 * - Sort: RAG / Newest / Oldest
 *   - When Sort=RAG: full-width priority chips (All / red / amber / green)
 * - TTS: Azure (primary) + Browser (fallback). Long-press = slow.
 * - RAG-colored play buttons
 * - Quiz (50% 🔴 / 40% 🟠 / 10% 🟢) + promote/demote rules
 * - XP & Level (50 XP per correct, 2500 per level), Daily streak
 * - Migrations from old LS keys so data/keys aren’t lost
 * - Single audio channel + pointer-only press to prevent double audio
 */

const SHEETS = ["Phrases", "Questions", "Words", "Numbers"];
const LSK_ROWS = "lt_phrasebook_v3";
const LSK_SETTINGS = "lt_settings_v1";
const LSK_STREAK = "lt_quiz_streak_v1";
const LSK_XP = "lt_xp_v1";

// Old keys (migrate once)
const OLD_LSK_ROWS = "lt_phrasebook_v2";
const OLD_LSK_TTS_PROVIDER = "lt_tts_provider";
const OLD_LSK_AZURE_KEY = "lt_azure_key";
const OLD_LSK_AZURE_REGION = "lt_azure_region";
const OLD_LSK_AZURE_VOICE = "lt_azure_voice";

const defaultSettings = {
  ttsProvider: "azure", // 'azure' | 'browser'
  azureKey: "",
  azureRegion: "",
  azureVoiceShortName: "",
  browserVoiceName: "",
  mode: "EN2LT", // EN2LT | LT2EN
  sort: "RAG",   // RAG | NEW | OLD
  ragPriority: "", // "" | "🔴" | "🟠" | "🟢"
};

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
const levelForXp = (xp) => Math.max(1, Math.floor(xp / 2500) + 1);
const levelProgress = (xp) => {
  const base = (levelForXp(xp) - 1) * 2500;
  return Math.max(0, Math.min(1, (xp - base) / 2500));
};
const rowKey = (r) =>
  `${(r.English || "").trim().toLowerCase()}|${(r.Lithuanian || "")
    .trim()
    .toLowerCase()}|${(r.Sheet || "").trim().toLowerCase()}`;

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

/* -------------------- XLSX UMD (optional) -------------------- */
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

/* -------------------- Voices -------------------- */
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

/* -------------------- Azure TTS -------------------- */
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

/* -------------------- Main -------------------- */
export default function App() {
  const fileRefJson = useRef(null);
  const fileRefXlsx = useRef(null);
  const addDetailsRef = useRef(null);
  const audioRef = useRef(null); // single audio channel

  // UI
  const [page, setPage] = useState("home");
  const [tab, setTab] = useState("Phrases");
  const [q, setQ] = useState("");
  const [sortOpen, setSortOpen] = useState(false);

  // Data (with migration)
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

  // Settings (with migration)
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

  // Streak & XP
  const [streak, setStreak] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LSK_STREAK)) || { streak: 0, lastDate: "" };
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

  // Azure voices list
  const [azureVoices, setAzureVoices] = useState([]);

  // Browser voices
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
  useEffect(() => localStorage.setItem(LSK_SETTINGS, JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem(LSK_STREAK, JSON.stringify(streak)), [streak]);
  useEffect(() => localStorage.setItem(LSK_XP, JSON.stringify(xp)), [xp]);

  const sortLabel = settings.sort === "RAG" ? "RAG" : settings.sort === "NEW" ? "Newest" : "Oldest";
  const clearSearch = () => setQ("");

  /* -------------------- Audio -------------------- */
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

  // pointer-only long-press
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

  /* -------------------- CRUD -------------------- */
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
      alert("English & Lithuanian are required.");
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
    if (!confirm("Delete this entry?")) return;
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  /* -------------------- Import / Export / Clear -------------------- */
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
          createdAt: r.createdAt || Date.now(),
          updatedAt: Date.now(),
        }))
        .filter((r) => r.English || r.Lithuanian);

      setRows((prev) => {
        const map = new Map();
        [...prev, ...prepared].forEach((r) => {
          const k = rowKey(r);
          const ex = map.get(k);
          if (!ex || (r.updatedAt || 0) > (ex.updatedAt || 0)) map.set(k, r);
        });
        return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).reverse();
      });
      alert(`Imported ${prepared.length} item(s).`);
    } catch (e) {
      console.error(e);
      alert("Import failed: " + e.message);
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
      setRows((prev) => [...merged, ...prev]);
      alert(`Imported ${merged.length} item(s) from XLSX.`);
    } catch (e) {
      console.error(e);
      alert("XLSX import failed: " + e.message);
    }
  }

  function clearAll() {
    if (!confirm("Clear the entire library? This cannot be undone.")) return;
    setRows([]);
    setQ("");
    setTab("Phrases");
  }

  /* -------------------- Filter + Sort -------------------- */
  const filteredByTab = useMemo(() => {
    const arr = rows.filter((r) => r.Sheet === tab);
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
      out = [...out].sort((a, b) => weight(normalizeRag(a["RAG Icon"])) - weight(normalizeRag(b["RAG Icon"])));
    }
    return out;
  }, [rows, tab, q, settings.sort, settings.ragPriority]);

  /* -------------------- Quiz -------------------- */
  const [quizOn, setQuizOn] = useState(false);
  const [quizQs, setQuizQs] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizChoice, setQuizChoice] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizScore, setQuizScore] = useState(0);

  function startQuiz() {
    if (rows.length < 4) {
      alert("Add more entries first (need at least 4).");
      return;
    }
    const reds = rows.filter((r) => normalizeRag(r["RAG Icon"]) === "🔴");
    const ambs = rows.filter((r) => normalizeRag(r["RAG Icon"]) === "🟠");
    const grns = rows.filter((r) => normalizeRag(r["RAG Icon"]) === "🟢");
    const pool = [
      ...weightedPick(reds, Math.ceil(10 * 0.5)),
      ...weightedPick(ambs, Math.ceil(10 * 0.4)),
      ...weightedPick(grns, Math.max(1, Math.floor(10 * 0.1))),
    ];
    const finalPool = shuffle(pool).slice(0, 10);
    if (!finalPool.length) {
      alert("No quiz candidates found.");
      return;
    }
    setQuizQs(finalPool);
    setQuizIdx(0);
    setQuizAnswered(false);
    setQuizChoice(null);
    setQuizScore(0);
    buildQuizOptions(finalPool[0]);
    setQuizOn(true);
    setPage("home");
  }

  function buildQuizOptions(item) {
    const correct = item.Lithuanian;
    const others = shuffle(rows.filter((r) => r !== item && r.Lithuanian)).slice(0, 3);
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

  /* -------------------- Render -------------------- */
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
              <div className="text-lg font-semibold">Lithuanian Trainer</div>
              <div className="text-xs text-zinc-400">
                Tap to play. Long-press to savour.
              </div>
            </div>

            {/* Browser voice selector (enabled when browser provider) */}
            <select
              className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-1"
              value={settings.browserVoiceName}
              onChange={(e) =>
                setSettings((s) => ({ ...s, browserVoiceName: e.target.value }))
              }
              disabled={settings.ttsProvider !== "browser"}
              title={settings.ttsProvider === "azure" ? "Using Azure" : "Browser voice"}
            >
              <option value="">Auto voice</option>
              {useVoices().map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Pills */}
          <div className="mt-2 flex items-center gap-2 overflow-x-auto">
            {[
              { id: "home", label: "Home" },
              { id: "library", label: "Library" },
              { id: "settings", label: "Settings" },
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
              Start Quiz
            </button>
          </div>

          {/* Search + Sort */}
          <div className="mt-2 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm pr-8"
              />
              {q && (
                <button
                  onClick={clearSearch}
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
                Sort: {sortLabel}
              </button>
              {sortOpen && (
                <div className="absolute right-0 mt-1 z-50 min-w-[140px] bg-zinc-900 border border-zinc-700 rounded-md shadow-lg overflow-hidden">
                  {[
                    { id: "RAG", label: "RAG" },
                    { id: "NEW", label: "Newest" },
                    { id: "OLD", label: "Oldest" },
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

          {/* Centered Streak/Level (full width) + full-width RAG priority row */}
          <div className="mt-2 flex flex-col items-stretch gap-2">
            <div className="w-full">
              <div className="flex justify-center items-center gap-4 mb-1 text-xs text-zinc-400">
                <div>
                  🔥 Streak: <span className="text-zinc-200">{streak.streak}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🥇</span>
                  <span>Lv {levelForXp(xp)}</span>
                  <span className="text-zinc-500">{xp} XP</span>
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
                  { id: "", label: "All" },
                  { id: "🔴", color: "bg-red-500" },
                  { id: "🟠", color: "bg-amber-400" },
                  { id: "🟢", color: "bg-emerald-500" },
                ].map((x) => (
                  <button
                    key={x.id || "all"}
                    onClick={() => setSettings((s) => ({ ...s, ragPriority: x.id }))}
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
                      <span className={cn("inline-block w-2.5 h-2.5 rounded-full", x.color)} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs — full width, equal columns */}
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
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pages */}
      {page === "home" && (
        <div className="max-w-xl mx-auto px-3 sm:px-4 pb-28">
          {filteredByTab.map((r, i) => {
            const idx = rows.indexOf(r);
            const isEditing = editIdx === idx;
            const speakText = settings.mode === "EN2LT" ? r.Lithuanian : r.English;

            return (
              <div key={`${rowKey(r)}-${i}`} className="mt-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                {!isEditing ? (
                  <div className="flex items-start gap-3">
                    <button
                      className={cn(
                        "shrink-0 w-10 h-10 rounded-xl transition flex items-center justify-center font-semibold select-none",
                        ragBtnClass(normalizeRag(r["RAG Icon"]))
                      )}
                      style={{ touchAction: "manipulation" }}
                      onContextMenu={(e) => e.preventDefault()}
                      title="Tap = play, long-press = slow"
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
                          Show details
                        </summary>
                        <div className="text-xs text-zinc-400 mt-2 space-y-1">
                          {r.Phonetic && (
                            <div>
                              <span className="text-zinc-500">Phonetic: </span>
                              {r.Phonetic}
                            </div>
                          )}
                          {r.Category && (
                            <div>
                              <span className="text-zinc-500">Category: </span>
                              {r.Category}
                            </div>
                          )}
                          {r.Usage && (
                            <div>
                              <span className="text-zinc-500">Usage: </span>
                              {r.Usage}
                            </div>
                          )}
                          {r.Notes && (
                            <div>
                              <span className="text-zinc-500">Notes: </span>
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
                        Edit
                      </button>
                      <button
                        onClick={() => remove(idx)}
                        className="text-xs bg-zinc-800 text-red-400 px-2 py-1 rounded-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                      <label className="col-span-2">
                        English
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.English}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, English: e.target.value })
                          }
                        />
                      </label>
                      <label className="col-span-2">
                        Lithuanian
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Lithuanian}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, Lithuanian: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Phonetic
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Phonetic}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, Phonetic: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Category
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Category}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, Category: e.target.value })
                          }
                        />
                      </label>
                      <label className="col-span-2">
                        Usage
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Usage}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, Usage: e.target.value })
                          }
                        />
                      </label>
                      <label className="col-span-2">
                        Notes
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Notes}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, Notes: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        RAG
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
                        Sheet
                        <select
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Sheet}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, Sheet: e.target.value })
                          }
                        >
                          {SHEETS.map((s) => (
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
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditIdx(null);
                          setEditDraft(null);
                        }}
                        className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
                      >
                        Cancel
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
                  + Add entry
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input
                    className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    placeholder="English"
                    value={draft.English}
                    onChange={(e) => setDraft({ ...draft, English: e.target.value })}
                  />
                  <input
                    className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    placeholder="Lithuanian"
                    value={draft.Lithuanian}
                    onChange={(e) => setDraft({ ...draft, Lithuanian: e.target.value })}
                  />
                  <input
                    className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    placeholder="Phonetic"
                    value={draft.Phonetic}
                    onChange={(e) => setDraft({ ...draft, Phonetic: e.target.value })}
                  />
                  <input
                    className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    placeholder="Category"
                    value={draft.Category}
                    onChange={(e) => setDraft({ ...draft, Category: e.target.value })}
                  />
                  <input
                    className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    placeholder="Usage"
                    value={draft.Usage}
                    onChange={(e) => setDraft({ ...draft, Usage: e.target.value })}
                  />
                  <input
                    className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    placeholder="Notes"
                    value={draft.Notes}
                    onChange={(e) => setDraft({ ...draft, Notes: e.target.value })}
                  />
                  <select
                    className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm"
                    value={draft["RAG Icon"]}
                    onChange={(e) =>
                      setDraft({ ...draft, "RAG Icon": normalizeRag(e.target.value) })
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
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addRow}
                    className="col-span-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-md px-3 py-2 text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {page === "library" && (
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
            <div className="text-lg font-semibold mb-2">Library</div>
            <div className="text-sm text-zinc-400 mb-2">
              Import data (JSON or Excel). New rows are appended and duplicates
              are merged.
            </div>
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
                Import JSON
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
                Import .xlsx
              </button>

              <button
                onClick={() => exportJson(rows)}
                className="bg-zinc-800 px-3 py-2 rounded-md text-sm"
              >
                Export JSON
              </button>

              <button
                onClick={clearAll}
                className="bg-zinc-900 border border-red-600 text-red-400 rounded-md text-sm px-3 py-2"
              >
                Clear Library
              </button>
            </div>
            <div className="mt-3 text-xs text-zinc-400">
              Total items: <span className="text-zinc-200">{rows.length}</span>
            </div>
          </div>
        </div>
      )}

      {page === "settings" && (
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 space-y-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
            <div className="text-lg font-semibold mb-2">Settings</div>

            {/* Direction */}
            <div className="mb-3">
              <div className="text-xs mb-1 text-zinc-400">Direction</div>
              <div className="flex items-center gap-2">
                {[
                  { id: "EN2LT", label: "EN → LT" },
                  { id: "LT2EN", label: "LT → EN" },
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
              <div className="text-xs mb-1 text-zinc-400">Voice provider</div>
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
                  Browser (fallback)
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
                  Azure Speech
                </label>
              </div>
            </div>

            {/* Azure config + voice picker */}
            {settings.ttsProvider === "azure" && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs mb-1">Subscription Key</div>
                    <input
                      type="password"
                      value={settings.azureKey}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, azureKey: e.target.value }))
                      }
                      placeholder="Azure key"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <div className="text-xs mb-1">Region</div>
                    <input
                      value={settings.azureRegion}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, azureRegion: e.target.value }))
                      }
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
                      value={settings.azureVoiceShortName}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          azureVoiceShortName: e.target.value,
                        }))
                      }
                    >
                      <option value="">— choose —</option>
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
                          alert("Enter region and key first.");
                          return;
                        }
                        const url = `https://${settings.azureRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
                        const res = await fetch(url, {
                          headers: { "Ocp-Apim-Subscription-Key": settings.azureKey },
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
                    Fetch voices
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
                Question {quizIdx + 1} / {quizQs.length}
              </div>
              <button
                onClick={() => setQuizOn(false)}
                className="text-xs bg-zinc-800 px-2 py-1 rounded-md"
              >
                Quit
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
                      <div className="text-sm text-zinc-400 mb-1">Prompt</div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-lg font-medium flex-1">
                          {questionText}
                        </div>
                        <button
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-semibold select-none",
                            ragBtnClass(normalizeRag(item["RAG Icon"]))
                          )}
                          style={{ touchAction: "manipulation" }}
                          onContextMenu={(e) => e.preventDefault()}
                          title="Tap = play, long-press = slow"
                          {...pressHandlers(correctLt)}
                        >
                          ►
                        </button>
                      </div>

                      <div className="text-sm text-zinc-400 mb-1">
                        Choose the Lithuanian
                      </div>
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
                                onContextMenu={(e) => e.preventDefault()}
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
                            {quizChoice === correctLt ? "Correct!" : "Not quite."}
                          </div>
                          <button
                            onClick={nextQuiz}
                            className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md text-sm font-semibold"
                          >
                            Next Question
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
    </div>
  );
}
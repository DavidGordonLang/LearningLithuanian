import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Lithuanian Trainer — App.jsx (Capacitor/PWA friendly)
 * - Home / Library / Settings pills (Home highlighted)
 * - JSON import/merge (append) + Clear All (with confirm)
 * - Tabs: Phrases / Questions / Words / Numbers
 * - Search with single clear (×), keyboard-safe play
 * - Sort: RAG / Newest / Oldest (dropdown z-index fixed)
 * - TTS: Azure (primary) + Browser (fallback). Long-press → slow.
 * - RAG-colored play buttons
 * - Quiz (weighted 50/40/10) + RAG auto promote/demote counters
 * - XP & Level (50 XP per correct, +1 level each 2500 XP)
 * - Daily streak
 */

/* -------------------- Constants & LS keys -------------------- */
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

const SHEETS = ["Phrases", "Questions", "Words", "Numbers"];
const LSK_ROWS = "lt_phrasebook_v3";
const LSK_SETTINGS = "lt_settings_v1";
const LSK_STREAK = "lt_quiz_streak_v1";
const LSK_XP = "lt_xp_v1";

/* settings shape:
{
  ttsProvider: 'azure' | 'browser',
  azureKey: '', azureRegion: '', azureVoiceShortName: '',
  browserVoiceName: '',
  mode: 'EN2LT' | 'LT2EN',
  sort: 'RAG' | 'NEW' | 'OLD'
}
*/
const defaultSettings = {
  ttsProvider: "azure",
  azureKey: "",
  azureRegion: "",
  azureVoiceShortName: "",
  browserVoiceName: "",
  mode: "EN2LT",
  sort: "RAG",
};

/* -------------------- Helpers -------------------- */
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
  const into = xp - base;
  return Math.max(0, Math.min(1, into / 2500));
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
function weightedPick(pool, n, weightFn) {
  // simple roulette-wheel selection without replacement
  const items = pool.map((x) => ({ x, w: Math.max(0, weightFn(x)) }));
  const out = [];
  for (let k = 0; k < n && items.length; k++) {
    const total = items.reduce((s, it) => s + it.w, 0) || items.length;
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < items.length; idx++) {
      r -= items[idx].w || 1;
      if (r <= 0) break;
    }
    const pick = items.splice(Math.max(0, Math.min(idx, items.length - 1)), 1)[0];
    out.push(pick.x);
  }
  return out;
}

/* -------------------- XLSX UMD (optional) for future; JSON import is primary -------------------- */
async function loadXLSX() {
  if (window.XLSX) return window.XLSX;
  const urls = [
    "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.19.3/xlsx.full.min.js",
    "https://cdn.jsdelivr.net/npm/xlsx@0.19.3/dist/xlsx.full.min.js",
    "https://unpkg.com/xlsx@0.19.3/dist/xlsx.full.min.js",
  ];
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
    } catch {
      /* try chain */
    }
  }
  throw new Error("Failed to load XLSX library.");
}

/* -------------------- Browser voices -------------------- */
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
    alert("Speech synthesis not supported in this browser.");
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang || "lt-LT";
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

/* -------------------- Azure speech -------------------- */
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

/* -------------------- Main App -------------------- */
export default function App() {
  const fileRefJson = useRef(null);
  const fileRefXlsx = useRef(null);
  const addDetailsRef = useRef(null); // to auto-close

  // global UI
  const [page, setPage] = useState("home"); // 'home' | 'library' | 'settings'
  const [tab, setTab] = useState("Phrases");
  const [q, setQ] = useState("");
  const [sortOpen, setSortOpen] = useState(false);

  // data
  const [rows, setRows] = useState(() => {
    try {
      const raw = localStorage.getItem(LSK_ROWS);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // settings
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(LSK_SETTINGS);
      const got = raw ? JSON.parse(raw) : defaultSettings;
      return { ...defaultSettings, ...got };
    } catch {
      return defaultSettings;
    }
  });

  // streak & xp
  const [streak, setStreak] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(LSK_STREAK)) || {
          streak: 0,
          lastDate: "",
        }
      );
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

  // voice hooks
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

  // search helpers
  const clearSearch = () => setQ("");

  // sort
  const sortLabel = settings.sort === "RAG" ? "RAG" : settings.sort === "NEW" ? "Newest" : "Oldest";

  /* -------------------- Play helpers -------------------- */
  async function playText(text, { slow = false } = {}) {
    try {
      // blur any focused input to avoid keyboard popping after Add
      if (document.activeElement && "blur" in document.activeElement) {
        try {
          document.activeElement.blur();
        } catch {}
      }
      if (settings.ttsProvider === "azure" && settings.azureKey && settings.azureRegion && settings.azureVoiceShortName) {
        const delta = slow ? "-40%" : "0%";
        const url = await speakAzureHTTP(text, settings.azureVoiceShortName, settings.azureKey, settings.azureRegion, delta);
        const a = new Audio(url);
        a.onended = () => URL.revokeObjectURL(url);
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
      e?.preventDefault?.();
      e?.stopPropagation?.();
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
    __stats: { rc: 0, ac: 0, ai: 0, gi: 0 }, // redCorrect, amberCorrect, amberIncorrect, greenIncorrect
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
    const row = { ...draft };
    row["RAG Icon"] = normalizeRag(row["RAG Icon"]);
    row.createdAt = Date.now();
    row.updatedAt = Date.now();
    setRows((prev) => [row, ...prev]);

    // reset, close Add panel and blur to avoid keyboard popup
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
    // close <details>
    if (addDetailsRef.current) {
      addDetailsRef.current.open = false;
    }
    try {
      document.activeElement?.blur?.();
    } catch {}
  }

  function startEdit(i) {
    setEditIdx(i);
    setEditDraft({ ...rows[i] });
  }
  function saveEdit(i) {
    const clean = { ...editDraft, "RAG Icon": normalizeRag(editDraft["RAG Icon"]), updatedAt: Date.now() };
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
    const blob = new Blob([JSON.stringify(current, null, 2)], { type: "application/json" });
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
      if (!Array.isArray(data)) throw new Error("JSON must be an array of rows");
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

      // append + dedupe by rowKey (keep newest)
      setRows((prev) => {
        const map = new Map();
        [...prev, ...prepared].forEach((r) => {
          const k = rowKey(r);
          const exist = map.get(k);
          if (!exist || (r.updatedAt || 0) > (exist.updatedAt || 0)) map.set(k, r);
        });
        return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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
    // sort
    if (settings.sort === "NEW") {
      out = [...out].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (settings.sort === "OLD") {
      out = [...out].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    } else {
      // RAG order 🔴 🟠 🟢
      const order = { "🔴": 0, "🟠": 1, "🟢": 2 };
      out = [...out].sort((a, b) => (order[a["RAG Icon"]] ?? 9) - (order[b["RAG Icon"]] ?? 9));
    }
    return out;
  }, [rows, tab, q, settings.sort]);

  /* -------------------- Quiz logic -------------------- */
  const [quizOn, setQuizOn] = useState(false);
  const [quizSessionId, setQuizSessionId] = useState("");
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
    // weight by RAG: 50% 🔴 / 40% 🟠 / 10% 🟢
    const reds = rows.filter((r) => normalizeRag(r["RAG Icon"]) === "🔴");
    const ambs = rows.filter((r) => normalizeRag(r["RAG Icon"]) === "🟠");
    const grns = rows.filter((r) => normalizeRag(r["RAG Icon"]) === "🟢");
    const pool = [
      ...weightedPick(reds, Math.ceil(10 * 0.5), () => 1),
      ...weightedPick(ambs, Math.ceil(10 * 0.4), () => 1),
      ...weightedPick(grns, Math.max(1, Math.floor(10 * 0.1)), () => 1),
    ];
    const finalPool = shuffle(pool).slice(0, 10);
    if (!finalPool.length) {
      alert("No quiz candidates found.");
      return;
    }

    const sid = `${Date.now()}`;
    setQuizSessionId(sid);
    setQuizQs(finalPool);
    setQuizIdx(0);
    setQuizAnswered(false);
    setQuizChoice(null);
    setQuizScore(0);

    // first options
    buildQuizOptions(finalPool[0]);
    setQuizOn(true);
    setPage("home");
  }

  function buildQuizOptions(item) {
    const correct = item.Lithuanian;
    const others = shuffle(rows.filter((r) => r !== item && r.Lithuanian)).slice(0, 3);
    const opts = shuffle([correct, ...others.map((o) => o.Lithuanian)]);
    setQuizOptions(opts);
  }

  function finishQuizAndStreak() {
    const today = todayKey();
    setStreak((s) => {
      let inc = 1;
      if (s.lastDate && s.lastDate !== today) {
        const d1 = new Date(s.lastDate + "T00:00:00");
        const d2 = new Date(today + "T00:00:00");
        const days = Math.round((d2 - d1) / 86400000);
        inc = days === 1 ? s.streak + 1 : 1;
      } else if (!s.lastDate) {
        inc = 1;
      } else {
        inc = s.streak; // same day completion doesn’t increase
      }
      return { streak: inc, lastDate: today };
    });
  }

  // promote/demote rules
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
              // promote to 🟠 and reset counters relevant to 🔴
              r["RAG Icon"] = "🟠";
              stats.rc = 0;
              // keep others
            }
          } else if (rag === "🟠") {
            stats.ac = Math.min(9999, stats.ac + 1);
            if (stats.ac >= 5) {
              r["RAG Icon"] = "🟢";
              stats.ac = 0;
              stats.ai = 0; // reset amber incorrect tracker
            }
          } else if (rag === "🟢") {
            // no promotion from green
          }
        } else {
          if (rag === "🟢") {
            // any incorrect demotes to amber
            r["RAG Icon"] = "🟠";
            stats.ac = 0; // reset streak towards green
            stats.gi = Math.min(9999, (stats.gi || 0) + 1);
          } else if (rag === "🟠") {
            stats.ai = Math.min(9999, (stats.ai || 0) + 1);
            if (stats.ai >= 3) {
              r["RAG Icon"] = "🔴";
              stats.ai = 0; // reset after demotion
              stats.ac = 0;
            }
          } else if (rag === "🔴") {
            // stays red
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
    const correct = opt === correctLt;

    setQuizAnswered(true);
    setQuizChoice(opt);
    if (correct) {
      setQuizScore((s) => s + 1);
      setXp((x) => x + 50);
    }

    // play correct audio after answer
    await playText(correctLt, { slow: false });

    updateRagAfterAnswer(item, correct);
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
  // RAG colored button
  const ragBtnClass = (rag) =>
    rag === "🔴"
      ? "bg-red-600 hover:bg-red-500"
      : rag === "🟠"
      ? "bg-amber-500 hover:bg-amber-400"
      : rag === "🟢"
      ? "bg-emerald-600 hover:bg-emerald-500"
      : "bg-zinc-700 hover:bg-zinc-600";

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
              <div className="text-xs text-zinc-400">Tap to play. Long-press to savour.</div>
            </div>
            {/* Browser voice selector (disabled unless browser provider) */}
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
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Pills row */}
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

          {/* Search + sort */}
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

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="bg-zinc-900 border border-zinc-700 rounded-md text-xs px-2 py-2"
                title="Sort"
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

          {/* XP + streak */}
          <div className="mt-2 text-xs text-zinc-400 flex items-center gap-3">
            <div>🔥 Streak: <span className="text-zinc-200">{streak.streak}</span></div>
            <div className="flex items-center gap-1">
              <span>🥇</span>
              <span>Lv {levelForXp(xp)}</span>
              <div className="w-28 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-emerald-600"
                  style={{ width: `${Math.round(levelProgress(xp) * 100)}%` }}
                />
              </div>
              <span className="text-zinc-500">{xp} XP</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {page === "home" && (
          <div className="max-w-xl mx-auto px-3 sm:px-4 pb-2 flex items-center gap-2 overflow-x-auto">
            {SHEETS.map((s) => (
              <button
                key={s}
                onClick={() => setTab(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border",
                  tab === s ? "bg-emerald-600 border-emerald-600" : "bg-zinc-900 border-zinc-800"
                )}
              >
                {s}
              </button>
            ))}
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
                          {r.Phonetic && <div><span className="text-zinc-500">Phonetic: </span>{r.Phonetic}</div>}
                          {r.Category && <div><span className="text-zinc-500">Category: </span>{r.Category}</div>}
                          {r.Usage && <div><span className="text-zinc-500">Usage: </span>{r.Usage}</div>}
                          {r.Notes && <div><span className="text-zinc-500">Notes: </span>{r.Notes}</div>}
                        </div>
                      </details>
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
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.English}
                          onChange={(e) => setEditDraft({ ...editDraft, English: e.target.value })}
                        />
                      </label>
                      <label className="col-span-2">
                        Lithuanian
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Lithuanian}
                          onChange={(e) => setEditDraft({ ...editDraft, Lithuanian: e.target.value })}
                        />
                      </label>
                      <label>
                        Phonetic
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Phonetic}
                          onChange={(e) => setEditDraft({ ...editDraft, Phonetic: e.target.value })}
                        />
                      </label>
                      <label>
                        Category
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Category}
                          onChange={(e) => setEditDraft({ ...editDraft, Category: e.target.value })}
                        />
                      </label>
                      <label className="col-span-2">
                        Usage
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Usage}
                          onChange={(e) => setEditDraft({ ...editDraft, Usage: e.target.value })}
                        />
                      </label>
                      <label className="col-span-2">
                        Notes
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
                        Sheet
                        <select
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                          value={editDraft.Sheet}
                          onChange={(e) => setEditDraft({ ...editDraft, Sheet: e.target.value })}
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
              Import data (JSON or Excel). New rows are appended and duplicates are merged.
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

            {/* Mode */}
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
                    onChange={() => setSettings((s) => ({ ...s, ttsProvider: "browser" }))}
                  />
                  Browser (fallback)
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="ttsprov"
                    checked={settings.ttsProvider === "azure"}
                    onChange={() => setSettings((s) => ({ ...s, ttsProvider: "azure" }))}
                  />
                  Azure Speech
                </label>
              </div>
            </div>

            {/* Azure config */}
            {settings.ttsProvider === "azure" && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs mb-1">Subscription Key</div>
                    <input
                      type="password"
                      value={settings.azureKey}
                      onChange={(e) => setSettings((s) => ({ ...s, azureKey: e.target.value }))}
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
                    <div className="text-xs mb-1">Voice (ShortName)</div>
                    <input
                      value={settings.azureVoiceShortName}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, azureVoiceShortName: e.target.value }))
                      }
                      placeholder="e.g. lt-LT-OnaNeural"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const url = `https://${settings.azureRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
                        const res = await fetch(url, {
                          headers: { "Ocp-Apim-Subscription-Key": settings.azureKey },
                        });
                        if (!res.ok) throw new Error("Failed to fetch Azure voices");
                        const data = await res.json();
                        const firstLt =
                          data.find((v) => v.Locale?.toLowerCase() === "lt-lt") ||
                          data[0];
                        if (firstLt?.ShortName) {
                          setSettings((s) => ({ ...s, azureVoiceShortName: firstLt.ShortName }));
                          alert(`Set voice to ${firstLt.ShortName}`);
                        } else {
                          alert("Fetched voices, but none returned a ShortName.");
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

      {/* Quiz view modal overlay */}
      {quizOn && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-[92%] max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-zinc-400">
                Question {quizIdx + 1} / {quizQs.length}
              </div>
              <button onClick={() => setQuizOn(false)} className="text-xs bg-zinc-800 px-2 py-1 rounded-md">
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
                        <div className="text-lg font-medium flex-1">{questionText}</div>
                        <button
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-semibold select-none",
                            ragBtnClass(normalizeRag(item["RAG Icon"]))
                          )}
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
                                className="shrink-0 w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center select-none"
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
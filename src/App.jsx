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
const LSK_SORT = "lt_sort_v1";
const LSK_DIR = "lt_direction_v1";

const STARTERS = {
  EN2LT: "/data/starter_en_to_lt.json",
  LT2EN: "/data/starter_lt_to_en.json",
  COMBINED_OPTIONAL: "/data/starter_combined_dedup.json",
};

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
    installEN: 'Install "Learn Lithuanian" starter (EN → LT)',
    installLT: 'Install "Learn English" starter (LT → EN)',
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
    installEN: 'Įdiegti rinkinį „Mokausi lietuvių“ (EN → LT)',
    installLT: 'Įdiegti rinkinį „Mokausi anglų“ (LT → EN)',
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

const cn = (...xs) => xs.filter(Boolean).join(" ");

const nowTs = () => Date.now();
const genId = () => Math.random().toString(36).slice(2);

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
    .replace(/</g, "&lt/")
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
   SEARCH BOX
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
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm outline-none select-none"
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
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 select-none"
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
  const [page, setPage] = useState(() => localStorage.getItem("lt_page") || "home");
useEffect(() => {
  localStorage.setItem("lt_page", page);
}, [page]);

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
  const WIDE = width >= 1024; // reserved for future layout decisions

  // store
  const rows = usePhraseStore((s) => s.phrases);
  const setRows = usePhraseStore((s) => s.setPhrases);

  const [tab, setTab] = useState("Phrases");

  const qFilter = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );

  const [sortMode, setSortMode] = useState(
    () => localStorage.getItem(LSK_SORT) || "RAG"
  );
  useEffect(() => localStorage.setItem(LSK_SORT, sortMode), [sortMode]);

  const [direction, setDirection] = useState(
    () => localStorage.getItem(LSK_DIR) || "EN2LT"
  );
  useEffect(() => localStorage.setItem(LSK_DIR, direction), [direction]);
  const T = STR[direction];

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

  /* ============================================================================
     LIBRARY FILTERING
     ========================================================================== */

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

  /* ============================================================================
     IMPORT / STARTERS
     ========================================================================== */

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
    if (!confirm(T.confirm)) return;
    setRows([]);
  }

  /* ============================================================================
     ADD / EDIT MODAL + TOAST
     ========================================================================== */

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
    if (!addOpen) return;
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

  // Header is sticky; we push content down by its actual measured height.
  // SearchDock is rendered INSIDE <main> so Library content naturally sits under it.
  const contentOffset = headerHeight || 0;

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
          aria-label={isEditing ? T.edit : T.addEntry}
          onPointerDown={() => {
            setAddOpen(false);
            setEditRowId(null);
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
                {isEditing ? T.edit : T.addEntry}
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
                Close
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
                  setRows((prev) => [row, ...prev]);
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

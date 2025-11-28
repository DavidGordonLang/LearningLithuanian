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

    libraryTitle: "Library",
    libraryCount: (n) => `${n} phrases`,
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

    addEntry: "Add phrase",
    editEntry: "Edit phrase",
    enLabel: "English",
    ltLabel: "Lithuanian",
    phoneticsLabel: "Phonetics",
    tagLabel: "Tag / Note",
    ragLabel: "RAG status",
    save: "Save",
    cancel: "Cancel",

    settingsTitle: "Settings",
    directionHeading: "Learning direction",
    directionEnToLt: "I’m learning Lithuanian (EN → LT)",
    directionLtToEn: "I’m learning English (LT → EN)",

    starterHeading: "Starter Pack",
    starterButton: "Install starter pack",

    ttsHeading: "Azure Speech / Browser (fallback)",
    ttsProviderLabel: "Provider",
    ttsProviderAzure: "Azure Speech",
    ttsProviderBrowser: "Browser only",
    ttsAzureKeyLabel: "Subscription Key",
    ttsAzureRegionLabel: "Region",
    ttsAzureFetchVoices: "Fetch voices",
    ttsAzureVoiceLabel: "— choose —",
    ttsBrowserVoiceLabel: "Browser voice",
    ttsRateLabel: "Rate",
    providerNote: "Using your browser’s built-in voices. No key needed.",
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
    libraryCount: (n) => `${n} frazės`,
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

    addEntry: "Pridėti frazę",
    editEntry: "Redaguoti frazę",
    enLabel: "Angliškai",
    ltLabel: "Lietuviškai",
    phoneticsLabel: "Tarimas",
    tagLabel: "Žyma / Pastaba",
    ragLabel: "RAG būsena",
    save: "Išsaugoti",
    cancel: "Atšaukti",

    settingsTitle: "Nustatymai",
    directionHeading: "Mokymosi kryptis",
    directionEnToLt: "Mokausi lietuvių kalbos (EN → LT)",
    directionLtToEn: "Mokausi anglų kalbos (LT → EN)",

    starterHeading: "Pradinis rinkinys",
    starterButton: "Įdiegti pradžios rinkinį",

    ttsHeading: "Azure Speech / Naršyklė (atsarginis)",
    ttsProviderLabel: "Tiekėjas",
    ttsProviderAzure: "Azure Speech",
    ttsProviderBrowser: "Tik naršyklė",
    ttsAzureKeyLabel: "Prenumeratos raktas",
    ttsAzureRegionLabel: "Regionas",
    ttsAzureFetchVoices: "Gauti balsus",
    ttsAzureVoiceLabel: "— pasirink —",
    ttsBrowserVoiceLabel: "Naršyklės balsas",
    ttsRateLabel: "Greitis",
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
  const s = String(icon).toLowerCase();
  if (s.includes("🔴") || s === "red") return "🔴";
  if (s.includes("🟠") || ["amber", "orange", "yellow"].includes(s)) return "🟠";
  if (s.includes("🟢") || s === "green") return "🟢";
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
      setVoices([...v]);
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
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

async function speakAzureHTTP(text, shortName, key, region, rateDelta = "0%") {
  const ssml = `<speak><voice name="${shortName}"><prosody rate="${rateDelta}">${escapeXml(
    text
  )}</prosody></voice></speak>`;
  const res = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      },
      body: ssml,
    }
  );
  if (!res.ok) throw new Error("Azure TTS failed");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/* ============================================================================
   SEARCH BOX
   ========================================================================== */
const SearchBox = memo(
  forwardRef(function SearchBox({ placeholder = "Search…" }, ref) {
    const inputRef = useRef(null);
    const composingRef = useRef(false);

    useImperativeHandle(ref, () => inputRef.current);

    useEffect(() => {
      const el = inputRef.current;
      if (!el) return;
      const raw = searchStore.getRaw();
      if (raw && el.value !== raw) el.value = raw;
    }, []);

    return (
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm outline-none select-none"
          autoComplete="off"
          onCompositionStart={() => (composingRef.current = true)}
          onCompositionEnd={(e) => {
            composingRef.current = false;
            startTransition(() => searchStore.setRaw(e.target.value));
          }}
          onInput={(e) => {
            if (!composingRef.current)
              startTransition(() => searchStore.setRaw(e.target.value));
          }}
        />

        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400"
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
          onClick={() => {
            const el = inputRef.current;
            if (!el) return;
            el.value = "";
            el.focus();
            startTransition(() => searchStore.clear());
          }}
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
  const [page, setPage] = useState("home");

  // width tracking
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onR = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  // store
  const rows = usePhraseStore((s) => s.phrases);
  const setRows = usePhraseStore((s) => s.setPhrases);

  const [tab, setTab] = useState("Phrases");

  const qFilter = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );
  const qNorm = (qFilter || "").trim().toLowerCase();

  // sort mode
  const [sortMode, setSortMode] = useState(
    () => localStorage.getItem(LSK_SORT) || "RAG"
  );
  useEffect(() => localStorage.setItem(LSK_SORT, sortMode), [sortMode]);

  // direction
  const [direction, setDirection] = useState(
    () => localStorage.getItem(LSK_DIR) || "EN2LT"
  );
  useEffect(() => localStorage.setItem(LSK_DIR, direction), [direction]);

  const T = STR[direction];

  // TTS provider
  const [ttsProvider, setTtsProvider] = useState(
    () => localStorage.getItem(LSK_TTS_PROVIDER) || "azure"
  );
  useEffect(() => localStorage.setItem(LSK_TTS_PROVIDER, ttsProvider), [
    ttsProvider,
  ]);

  // Azure config
  const [azureKey, setAzureKey] = useState(
    () => localStorage.getItem(LSK_AZURE_KEY) || ""
  );
  const [azureRegion, setAzureRegion] = useState(
    () => localStorage.getItem(LSK_AZURE_REGION) || "westeurope"
  );
  const [azureVoices, setAzureVoices] = useState([]);
  const [azureVoiceShortName, setAzureVoiceShortName] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(LSK_AZURE_VOICE) || "{}")
          ?.shortName || ""
      );
    } catch {
      return "";
    }
  });

  useEffect(() => localStorage.setItem(LSK_AZURE_KEY, azureKey), [azureKey]);
  useEffect(
    () => localStorage.setItem(LSK_AZURE_REGION, azureRegion),
    [azureRegion]
  );
  useEffect(
    () =>
      localStorage.setItem(
        LSK_AZURE_VOICE,
        JSON.stringify({ shortName: azureVoiceShortName })
      ),
    [azureVoiceShortName]
  );

  // browser voices
  const voices = useVoices();
  const [browserVoiceName, setBrowserVoiceName] = useState("");
  const browserVoice = useMemo(() => {
    if (browserVoiceName) {
      return voices.find((v) => v.name === browserVoiceName) || voices[0];
    }
    return voices[0];
  }, [voices, browserVoiceName]);

  // audio playback
  const audioRef = useRef(null);

  async function playText(text, { slow = false } = {}) {
    try {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          if (audioRef.current.src?.startsWith("blob:"))
            URL.revokeObjectURL(audioRef.current.src);
        } catch {}
        audioRef.current = null;
      }

      if (
        ttsProvider === "azure" &&
        azureKey &&
        azureRegion &&
        azureVoiceShortName
      ) {
        const speed = slow ? "-40%" : "0%";
        const url = await speakAzureHTTP(
          text,
          azureVoiceShortName,
          azureKey,
          azureRegion,
          speed
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
    } catch (err) {
      alert("Voice error: " + err.message);
    }
  }

  /* ============================================================================
     FILTERED LIBRARY
     ========================================================================== */
  const filtered = useMemo(() => {
    const base = qNorm
      ? rows.filter(
          (r) =>
            r.English?.toLowerCase().includes(qNorm) ||
            r.Lithuanian?.toLowerCase().includes(qNorm)
        )
      : rows;

    const withMeta = base.map((r, i) => ({
      ...r,
      _idx: i,
      _ts: r._ts || 0,
      _rag: normalizeRag(r["RAG Icon"]),
    }));

    if (sortMode === "Newest")
      return [...withMeta].sort((a, b) => b._ts - a._ts);
    if (sortMode === "Oldest")
      return [...withMeta].sort((a, b) => a._ts - b._ts);

    const rank = { "🔴": 0, "🟠": 1, "🟢": 2 };
    return [...withMeta].sort((a, b) => {
      if (rank[a._rag] !== rank[b._rag]) return rank[a._rag] - rank[b._rag];
      return a._idx - b._idx;
    });
  }, [rows, qNorm, sortMode]);

  /* ============================================================================
     IMPORT / STARTERS
     ========================================================================== */

  async function mergeRows(newRows) {
    const mapped = newRows
      .map((r) => ({
        English: r.English || "",
        Lithuanian: r.Lithuanian || "",
        Phonetic: r.Phonetic || "",
        Category: r.Category || "",
        Usage: r.Usage || "",
        Notes: r.Notes || "",
        "RAG Icon": normalizeRag(r["RAG Icon"]),
        Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(r.Sheet)
          ? r.Sheet
          : "Phrases",
        _id: r._id || genId(),
        _ts: r._ts || nowTs(),
      }))
      .filter((r) => r.English || r.Lithuanian);

    setRows((prev) => [...mapped, ...prev]);
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
     DUPLICATE FINDER
     ========================================================================== */

  const [dupeResults, setDupeResults] = useState({ exact: [], close: [] });

  function scanDupes() {
    const exact = [];
    const map = new Map();

    rows.forEach((r, i) => {
      const key = `${r.English}|||${r.Lithuanian}`.toLowerCase().trim();
      map.set(key, (map.get(key) || []).concat(i));
    });

    for (const arr of map.values()) {
      if (arr.length > 1) exact.push(arr);
    }

    const close = [];
    for (let a = 0; a < rows.length; a++) {
      for (let b = a + 1; b < rows.length; b++) {
        const A = rows[a];
        const B = rows[b];
        const sim =
          (sim2(A.English, B.English) +
            sim2(A.Lithuanian, B.Lithuanian)) /
          2;
        if (sim >= 0.85) close.push([a, b, sim]);
      }
    }

    setDupeResults({ exact, close });
  }

  /* ============================================================================
     ADD / EDIT + TOAST
     ========================================================================== */
  const [addOpen, setAddOpen] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const editingRow = rows.find((r) => r._id === editRowId) || null;

  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setAddOpen(false);
        setEditRowId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!addOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [addOpen]);

  /* ============================================================================
     RENDER
     ========================================================================== */
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header T={T} page={page} setPage={setPage} />

      <main className="">
        {page === "library" && (
          <SearchDock
            SearchBox={SearchBox}
            sortMode={sortMode}
            setSortMode={setSortMode}
            placeholder={T.search}
            T={T}
            page={page}
            setPage={setPage}
          />
        )}

        {page === "library" ? (
          <LibraryView
            T={T}
            rows={filtered}
            setRows={setRows}
            normalizeRag={normalizeRag}
            sortMode={sortMode}
            direction={direction}
            playText={playText}
            removePhrase={(id) =>
              setRows((prev) => prev.filter((r) => r._id !== id))
            }
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
            installNumbersOnly={() => {}}
            rows={rows}
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
                {editingRow ? T.editEntry : T.addEntry}
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
              mode={editingRow ? "edit" : "add"}
              initialRow={editingRow || undefined}
              onSubmit={(row) => {
                if (editingRow) {
                  setRows((prev) =>
                    prev.map((r) => (r._id === row._id ? row : r))
                  );
                } else {
                  setRows((prev) => [
                    { ...row, _ts: nowTs() },
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

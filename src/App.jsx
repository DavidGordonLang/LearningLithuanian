// FULL FILE STARTS HERE
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
import LibraryView from "./views/LibraryView";
import DuplicateScannerView from "./views/DuplicateScannerView";

import { searchStore } from "./searchStore";
import { usePhraseStore } from "./stores/phraseStore";

/* ============================================================================
   CONSTANTS
   ========================================================================== */
const LSK_TTS_PROVIDER = "lt_tts_provider";
const LSK_AZURE_KEY = "lt_azure_key";
const LSK_AZURE_REGION = "lt_azure_region";
const LSK_AZURE_VOICE = "lt_azure_voice";
const LSK_SORT = "lt_sort_v1";
const LSK_DIR = "lt_direction_v1";
const LSK_PAGE = "lt_page";

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
    search: "Search…",
    sort: "Sort:",
    newest: "Newest",
    oldest: "Oldest",
    rag: "RAG",
    phrases: "Phrases",
    confirm: "Are you sure?",
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
    settings: "Settings",
    libraryTitle: "Library",
    fetchVoices: "Fetch voices",
    subKey: "Subscription Key",
    region: "Region",
    choose: "— choose —",
    browserVoice: "Browser (fallback)",
    azure: "Azure Speech",
    en2lt: "I’m learning Lithuanian (EN → LT)",
    lt2en: "I’m learning English (LT → EN)",
    addEntry: "Add Entry",
    edit: "Edit Entry",
  },
  LT2EN: {
    appTitle1: "Anglų",
    appTitle2: "kalbos treniruoklis",
    subtitle: "Paliesk, kad klausytum. Ilgai spausk – lėčiau.",
    navHome: "Pagrindinis",
    navLibrary: "Biblioteka",
    navSettings: "Nustatymai",
    search: "Paieška…",
    sort: "Rūšiuoti:",
    newest: "Naujausi",
    oldest: "Seniausi",
    rag: "RAG",
    phrases: "Frazės",
    confirm: "Ar tikrai?",
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
    settings: "Nustatymai",
    libraryTitle: "Biblioteka",
    fetchVoices: "Gauti balsus",
    subKey: "Prenumeratos raktas",
    region: "Regionas",
    choose: "— pasirinkite —",
    browserVoice: "Naršyklė (atsarginis)",
    azure: "Azure kalba",
    en2lt: "Mokausi lietuvių (EN → LT)",
    lt2en: "Mokausi anglų (LT → EN)",
    addEntry: "Pridėti įrašą",
    edit: "Redaguoti įrašą",
  },
};

/* ============================================================================
   HELPERS
   ========================================================================== */
const nowTs = () => Date.now();
const genId = () => Math.random().toString(36).slice(2);

function normalizeRag(icon = "") {
  const s = String(icon).trim().toLowerCase();
  if (["🔴", "red"].includes(icon) || s === "red") return "🔴";
  if (["🟠", "amber", "orange", "yellow"].includes(icon) || ["amber", "orange", "yellow"].includes(s)) return "🟠";
  if (["🟢", "green"].includes(icon) || s === "green") return "🟢";
  return "🟠";
}

/* ============================================================================
   VOICES
   ========================================================================== */
function useVoices() {
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    const refresh = () => {
      const v = window.speechSynthesis?.getVoices?.() || [];
      setVoices([...v].sort((a, b) => a.name.localeCompare(b.name)));
    };
    refresh();
    window.speechSynthesis?.addEventListener("voiceschanged", refresh);
    return () =>
      window.speechSynthesis?.removeEventListener("voiceschanged", refresh);
  }, []);
  return voices;
}

/* ============================================================================
   ESCAPE XML
   ========================================================================== */
function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/* ============================================================================
   AZURE TTS
   ========================================================================== */
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
   BROWSER TTS
   ========================================================================== */
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

/* ============================================================================
   SEARCH INPUT
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
        <input
          id="main-search"
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          defaultValue=""
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm outline-none"
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
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
          onClick={() => {
            const el = inputRef.current;
            if (el) {
              el.value = "";
              el.focus();
              startTransition(() => searchStore.clear());
            }
          }}
        >
          ×
        </button>
      </div>
    );
  })
);

/* ============================================================================
   MAIN APP
   ========================================================================== */
export default function App() {
  /* ================= PAGE STATE ================= */
  const [page, setPage] = useState(
    () => localStorage.getItem(LSK_PAGE) || "home"
  );
  useEffect(() => localStorage.setItem(LSK_PAGE, page), [page]);

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;
    const measure = () =>
      setHeaderHeight(headerRef.current.getBoundingClientRect().height || 0);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* ================= ROWS ================= */
  const rows = usePhraseStore((s) => s.phrases);
  const setRows = usePhraseStore((s) => s.setPhrases);

  /* ================= SORT ================= */
  const [sortMode, setSortMode] = useState(
    () => localStorage.getItem(LSK_SORT) || "RAG"
  );
  useEffect(() => localStorage.setItem(LSK_SORT, sortMode), [sortMode]);

  /* ================= DIRECTION ================= */
  const [direction, setDirection] = useState(
    () => localStorage.getItem(LSK_DIR) || "EN2LT"
  );
  useEffect(() => localStorage.setItem(LSK_DIR, direction), [direction]);
  const T = STR[direction];

  /* ============================================================================
     TTS PROVIDERS
     ========================================================================== */
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

  /* Persist Azure fields */
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
      alert("Voice error: " + e?.message);
    }
  }

  /* keep search store alive */
  const qSub = useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );
  void qSub;

  /* ============================================================================
     IMPORT / STARTERS / MERGE
     ========================================================================== */
  async function mergeRows(newRows) {
    const cleaned = newRows
      .map((r) => ({
        English: r.English?.trim() || "",
        Lithuanian: r.Lithuanian?.trim() || "",
        Phonetic: r.Phonetic?.trim() || "",
        Category: r.Category?.trim() || "",
        Usage: r.Usage?.trim() || "",
        Notes: r.Notes?.trim() || "",
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

  function clearLibrary() {
    if (!confirm(T.confirm)) return;
    setRows([]);
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

  /* ============================================================================
     ADD / EDIT MODAL
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

  // NEW: open form
  function onOpenAddForm() {
    setEditRowId(null);
    setAddOpen(true);
  }

  /* ============================================================================
     DELETING
     ========================================================================== */
  function removePhraseById(id) {
    const idx = rows.findIndex((r) => r._id === id);
    if (idx !== -1) {
      const removeFromStore = usePhraseStore.getState().removePhrase;
      removeFromStore(idx);
    } else {
      setRows((prev) => prev.filter((r) => r._id !== id));
    }
  }

  /* ============================================================================
     RESTORE FROM DUPES
     ========================================================================== */
  useEffect(() => {
    function onRestore(e) {
      const { item } = e.detail;
      setRows((prev) => [item, ...prev]);
    }
    window.addEventListener("restorePhrase", onRestore);
    return () => window.removeEventListener("restorePhrase", onRestore);
  }, [setRows]);

  /* ============================================================================
     RENDER
     ========================================================================== */
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
            removePhrase={removePhraseById}
            onEditRow={(id) => {
              setEditRowId(id);
              setAddOpen(true);
            }}
            onOpenAddForm={onOpenAddForm}
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
            clearLibrary={clearLibrary}
            importJsonFile={importJsonFile}
            rows={rows}
            onOpenDuplicateScanner={() => setPage("dupes")}
          />
        ) : page === "dupes" ? (
          <DuplicateScannerView
            T={T}
            rows={rows}
            removePhrase={removePhraseById}
            onBack={() => setPage("settings")}
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
              onOpenAddForm={onOpenAddForm}
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
              >
                Close
              </button>
            </div>

            {/* =======================
                UPDATED onSubmit (toast)
                ======================= */}
            <AddForm
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
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }

                setAddOpen(false);
                setEditRowId(null);

                // NEW: TOAST
                setToast("Entry saved to library");
                setTimeout(() => setToast(""), 2000);
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
// END FILE

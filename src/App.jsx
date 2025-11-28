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
import DuplicateScannerView from "./views/DuplicateScannerView";
import UserGuideModal from "./components/UserGuideModal";
import ChangeLogModal from "./components/ChangeLogModal";

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
const LSK_USER_GUIDE = "lt_seen_user_guide";

const STARTERS = {
  EN2LT: "/data/starter_en_to_lt.json",
};

/* ============================================================================
   TRANSLATIONS
   ========================================================================== */
const T_EN = {
  libraryTitle: "Library",
  english: "English",
  lithuanian: "Lithuanian",
  phonetic: "Phonetic",
  usage: "Usage",
  notes: "Notes",
  category: "Category",
  sortLabel: "Sort:",
  sortRag: "RAG",
  sortNewest: "Newest",
  sortOldest: "Oldest",
  confirm: "Delete this entry?",
  ragLabel: "Familiarity (RAG)",
  sheet: "Sheet",
  addEntry: "Add Entry",
  edit: "Edit Entry",
  cancel: "Cancel",
  save: "Save",
  azure: "Azure Speech",
};

/* ============================================================================
   TTS: react hook & azure helper
   ========================================================================== */
function useTts(initProvider = "azure", initAzureVoice = "lt-LT-LeonasNeural") {
  const [ttsProvider, setTtsProvider] = useState(initProvider);
  const [azureVoiceShortName, setAzureVoiceShortName] = useState(initAzureVoice);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    localStorage.setItem(LSK_TTS_PROVIDER, ttsProvider);
  }, [ttsProvider]);

  useEffect(() => {
    localStorage.setItem(LSK_AZURE_VOICE, azureVoiceShortName);
  }, [azureVoiceShortName]);

  async function playWithAzure(text, opts = {}) {
    const voiceName = azureVoiceShortName;
    if (!voiceName) {
      alert("Azure voice not configured.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/azure-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceShortName: voiceName,
          speakingRate: opts.slow ? 0.8 : 1.0,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error("TTS error:", body);
        throw new Error("Azure TTS failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
    } catch (err) {
      console.error(err);
      alert("Speech error.");
    } finally {
      setBusy(false);
    }
  }

  const playText = (text, opts = {}) => {
    if (!text) return;
    if (ttsProvider === "azure") {
      playWithAzure(text, opts);
    } else {
      playWithAzure(text, opts);
    }
  };

  return {
    ttsProvider,
    setTtsProvider,
    azureVoiceShortName,
    setAzureVoiceShortName,
    playText,
    busy,
  };
}

/* ============================================================================
   SEARCH DOCK WRAPPER
   ========================================================================== */
const SearchDockWrapper = memo(function SearchDockWrapper({
  sortMode,
  setSortMode,
}) {
  return <SearchDock sortMode={sortMode} setSortMode={setSortMode} />;
});

/* ============================================================================
   APP
   ========================================================================== */
export default function App() {
  const {
    rows,
    setRows,
    streak,
    xp,
    setStreak,
    setXp,
    hydrateFromLocalStorage,
  } = usePhraseStore();

  const [activeRoute, setActiveRoute] = useState("home");
  const [sortMode, setSortMode] = useState(
    () => localStorage.getItem(LSK_SORT) || "RAG"
  );
  const [toast, setToast] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [showDuplicateScanner, setShowDuplicateScanner] = useState(false);
  const [showChangeLog, setShowChangeLog] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);

  const {
    ttsProvider,
    setTtsProvider,
    azureVoiceShortName,
    setAzureVoiceShortName,
    playText,
    busy: ttsBusy,
  } = useTts(
    localStorage.getItem(LSK_TTS_PROVIDER) || "azure",
    localStorage.getItem(LSK_AZURE_VOICE) || "lt-LT-LeonasNeural"
  );

  const T = T_EN;

  useEffect(() => {
    hydrateFromLocalStorage();
  }, [hydrateFromLocalStorage]);

  useEffect(() => {
    localStorage.setItem(LSK_SORT, sortMode);
  }, [sortMode]);

  const genId = () => crypto.randomUUID();
  const nowTs = () => Date.now();

  const computingQuizStatsRef = useRef(false);
  const [quizStats, setQuizStats] = useState(null);

  const normalizeRag = (val) => {
    if (!val) return "🟠";
    if (val === "🔴" || val === "🟠" || val === "🟢") return val;
    if (typeof val === "string") {
      const lower = val.toLowerCase();
      if (lower.includes("red")) return "🔴";
      if (lower.includes("amber") || lower.includes("orange")) return "🟠";
      if (lower.includes("green")) return "🟢";
    }
    return "🟠";
  };

  useEffect(() => {
    if (computingQuizStatsRef.current) return;
    computingQuizStatsRef.current = true;

    startTransition(() => {
      try {
        const base = rows || [];
        let red = 0;
        let amb = 0;
        let grn = 0;

        for (const r of base) {
          const rag = normalizeRag(r["RAG Icon"]);
          if (rag === "🔴") red++;
          else if (rag === "🟢") grn++;
          else amb++;
        }

        setQuizStats({ red, amb, grn, total: base.length });
      } finally {
        computingQuizStatsRef.current = false;
      }
    });
  }, [rows]);

  useEffect(() => {
    try {
      const rawStreak = localStorage.getItem(LSK_STREAK);
      const rawXp = localStorage.getItem(LSK_XP);
      if (rawStreak) setStreak(JSON.parse(rawStreak));
      if (rawXp) setXp(JSON.parse(rawXp));
    } catch (err) {
      console.error("Failed to load streak/xp:", err);
    }
  }, [setStreak, setXp]);

  useEffect(() => {
    try {
      localStorage.setItem(LSK_STREAK, JSON.stringify(streak));
      localStorage.setItem(LSK_XP, JSON.stringify(xp));
    } catch (err) {
      console.error("Failed to persist streak/xp:", err);
    }
  }, [streak, xp]);

  const [searchMounted, setSearchMounted] = useState(false);
  const routeRef = useRef(activeRoute);
  useEffect(() => {
    routeRef.current = activeRoute;
  }, [activeRoute]);

  function mergeRows(imported) {
    if (!Array.isArray(imported)) return;
    const existingByKey = new Map();
    for (const r of rows) {
      const key = `${(r.English || "").trim().toLowerCase()}||${(r.Lithuanian || "")
        .trim()
        .toLowerCase()}`;
      existingByKey.set(key, r);
    }

    const cleaned = imported
      .map((r) => {
        const e = (r.English || "").trim();
        const l = (r.Lithuanian || "").trim();
        if (!e && !l) return null;

        const key = `${e.toLowerCase()}||${l.toLowerCase()}`;
        if (existingByKey.has(key)) return null;

        return {
          ...r,
          English: e,
          Lithuanian: l,
          _id: r._id || genId(),
          _ts: r._ts || nowTs(),
          _qstat:
            r._qstat ||
            {
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

  function clearLibrary() {
    if (!window.confirm("Clear ALL phrases?")) return;
    setRows([]);
    setToast("Library cleared");
    setTimeout(() => setToast(""), 2000);
  }

  function importJsonFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        mergeRows(json);
        setToast("Import complete");
        setTimeout(() => setToast(""), 2000);
      } catch (err) {
        alert("Import error: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  useEffect(() => {
    function onRestore(e) {
      const { item } = e.detail;
      setRows((prev) => [item, ...prev]);
    }
    window.addEventListener("restorePhrase", onRestore);
    return () => window.removeEventListener("restorePhrase", onRestore);
  }, [setRows]);

  const [currentTab, setCurrentTab] = useState("Phrases");
  const filteredRows = useMemo(
    () => rows.filter((r) => r.Sheet === currentTab),
    [rows, currentTab]
  );

  const breadcrumb = useMemo(() => {
    if (activeRoute === "home") return "Home";
    if (activeRoute === "library") return "Library";
    if (activeRoute === "settings") return "Settings";
    if (activeRoute === "duplicates") return "Duplicate Scanner";
    return "";
  }, [activeRoute]);

  useEffect(() => {
    if (!localStorage.getItem(LSK_USER_GUIDE)) {
      setShowUserGuide(true);
    }
  }, []);

  const editingRow = editRowId
    ? rows.find((r) => r._id === editRowId) || null
    : null;
  const isEditing = !!editingRow;

  const layoutClasses =
    "min-h-screen bg-zinc-950 text-zinc-100 flex flex-col";

  return (
    <div className={layoutClasses}>
      <div id="toast-root" />
      <Header
        activeRoute={activeRoute}
        setActiveRoute={setActiveRoute}
        breadcrumb={breadcrumb}
        quizStats={quizStats}
        streak={streak}
        xp={xp}
        ttsBusy={ttsBusy}
        onOpenUserGuide={() => setShowUserGuide(true)}
      />

      {/* SEARCH DOCK */}
      <div className="border-b border-zinc-900/80 bg-zinc-950/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2">
          <SearchDockWrapper
            sortMode={sortMode}
            setSortMode={setSortMode}
          />
        </div>
      </div>

      {/* MAIN ROUTES */}
      <main className="flex-1 overflow-y-auto">
        {activeRoute === "home" && (
          <HomeView
            playText={playText}
            onOpenAddForm={() => {
              setEditRowId(null);
              setAddOpen(true);
            }}
            setRows={setRows}
            genId={genId}
            nowTs={nowTs}
            showToast={(msg) => {
              setToast(msg);
              setTimeout(() => setToast(""), 2000);
            }}
            rows={rows}
          />
        )}

        {activeRoute === "library" && (
          <LibraryView
            T={T}
            rows={rows}
            setRows={setRows}
            normalizeRag={normalizeRag}
            sortMode={sortMode}
            playText={playText}
            removePhrase={(id) =>
              setRows((prev) => prev.filter((r) => r._id !== id))
            }
            onEditRow={(id) => {
              setEditRowId(id);
              setAddOpen(true);
            }}
            onOpenAddForm={() => {
              setEditRowId(null);
              setAddOpen(true);
            }}
          />
        )}

        {activeRoute === "settings" && !showDuplicateScanner && (
          <SettingsView
            T={T}
            ttsProvider={ttsProvider}
            setTtsProvider={setTtsProvider}
            azureVoiceShortName={azureVoiceShortName}
            setAzureVoiceShortName={setAzureVoiceShortName}
            playText={playText}
            fetchStarter={fetchStarter}
            clearLibrary={clearLibrary}
            importJsonFile={importJsonFile}
            rows={rows}
            onOpenDuplicateScanner={() => setShowDuplicateScanner(true)}
            onOpenChangeLog={() => setShowChangeLog(true)}
            onOpenUserGuide={() => setShowUserGuide(true)}
          />
        )}

        {activeRoute === "settings" && showDuplicateScanner && (
          <DuplicateScannerView
            T={T}
            rows={rows}
            removePhrase={(id) =>
              setRows((prev) => prev.filter((r) => r._id !== id))
            }
            onBack={() => setShowDuplicateScanner(false)}
          />
        )}
      </main>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/95 border border-zinc-800 rounded-full px-4 py-2 text-sm shadow-lg z-[999]">
          {toast}
        </div>
      )}

      {/* ADD FORM MODAL */}
      {addOpen && (
        <div
          className="
            fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm
            p-4 
            flex items-start justify-center
            overflow-y-auto
          "
          onPointerDown={() => {
            setAddOpen(false);
            setEditRowId(null);
            document.activeElement?.blur?.();
          }}
        >
          <div
            className="
              w-full max-w-2xl max-h-[85vh] overflow-y-auto
              bg-zinc-900/95 border border-zinc-800 rounded-2xl
              shadow-[0_0_20px_rgba(0,0,0,0.25)] backdrop-blur-sm
              p-4 mt-10
            "
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

            <AddForm
              T={T}
              genId={genId}
              nowTs={nowTs}
              normalizeRag={normalizeRag}
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

      {/* CHANGE LOG MODAL */}
      {showChangeLog && (
        <ChangeLogModal onClose={() => setShowChangeLog(false)} />
      )}

      {/* USER GUIDE MODAL */}
      {showUserGuide && (
        <UserGuideModal
          onClose={() => setShowUserGuide(false)}
          firstLaunch={!localStorage.getItem(LSK_USER_GUIDE)}
        />
      )}
    </div>
  );
}

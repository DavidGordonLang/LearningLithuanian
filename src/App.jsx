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
import LibraryView from "./views/LibraryView";
import DuplicateScannerView from "./views/DuplicateScannerView";
import ChangeLogModal from "./components/ChangeLogModal";
import UserGuideModal from "./components/UserGuideModal";
import WhatsNewModal from "./components/WhatsNewModal";

import { searchStore } from "./searchStore";
import { usePhraseStore } from "./stores/phraseStore";
import { supabase } from "./supabaseClient";

/* ============================================================================
   CONSTANTS
   ========================================================================== */
const APP_VERSION = "1.1.1-beta";

const LSK_TTS_PROVIDER = "lt_tts_provider";
const LSK_SORT = "lt_sort_v1";
const LSK_PAGE = "lt_page";
const LSK_USER_GUIDE = "lt_seen_user_guide";
const LSK_LAST_SEEN_VERSION = "lt_last_seen_version";

const STARTERS = {
  EN2LT: "/data/starter_en_to_lt.json",
};

/* ============================================================================
   STRINGS
   ========================================================================== */
const STR = {
  appTitle1: "Žodis",
  appTitle2: "",
  subtitle: "Tap to play. Long-press to savour.",
  navHome: "Home",
  navLibrary: "Library",
  navSettings: "Settings",
  search: "Search…",
  sort: "Sort:",
  newest: "Newest",
  oldest: "Oldest",
  rag: "RAG",
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
  azure: "Azure Speech",
  addEntry: "Add Entry",
  edit: "Edit Entry",
};

/* ============================================================================
   HELPERS
   ========================================================================== */
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
   SEARCH BOX
   ========================================================================== */
const SearchBox = memo(
  forwardRef(function SearchBox({ placeholder = "Search…" }, ref) {
    const composingRef = useRef(false);
    const inputRef = useRef(null);
    useImperativeHandle(ref, () => inputRef.current);

    useEffect(() => {
      const el = inputRef.current;
      const raw = searchStore.getRaw();
      if (el && raw && el.value !== raw) el.value = raw;
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
            startTransition(() =>
              searchStore.setRaw(e.currentTarget.value)
            );
          }}
          onInput={(e) => {
            if (!composingRef.current)
              startTransition(() =>
                searchStore.setRaw(e.currentTarget.value)
              );
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
  /* SUPABASE AUTH STATE (passive) */
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      setUser(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  /* PAGE */
  const [page, setPage] = useState(
    () => localStorage.getItem(LSK_PAGE) || "home"
  );
  useEffect(() => localStorage.setItem(LSK_PAGE, page), [page]);

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;
    const measure = () =>
      setHeaderHeight(
        headerRef.current.getBoundingClientRect().height || 0
      );
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* ROWS */
  const rows = usePhraseStore((s) => s.phrases);
  const setRows = usePhraseStore((s) => s.setPhrases);

  /* SORT */
  const [sortMode, setSortMode] = useState(
    () => localStorage.getItem(LSK_SORT) || "RAG"
  );
  useEffect(() => localStorage.setItem(LSK_SORT, sortMode), [sortMode]);

  /* STRING BUNDLE */
  const T = STR;

  /* VOICE SETTINGS */
  const [azureVoiceShortName, setAzureVoiceShortName] = useState(
    "lt-LT-LeonasNeural"
  );

  const audioRef = useRef(null);

  /* ============================================================================
     PLAY TEXT VIA API
     ========================================================================== */
  async function playText(text, { slow = false } = {}) {
    try {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
        audioRef.current = null;
      }

      const resp = await fetch("/api/azure-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: azureVoiceShortName,
          slow,
        }),
      });

      if (!resp.ok) throw new Error("Azure TTS failed");

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
      };

      await audio.play();
    } catch (e) {
      alert("Voice error: " + e.message);
    }
  }

  /* SEARCH SUBSCRIPTION */
  useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );

  /* IMPORT / MERGE */
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
        Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(
          r.Sheet
        )
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

  /* ADD / EDIT MODAL */
  const [addOpen, setAddOpen] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  const editingRow = useMemo(
    () => rows.find((r) => r._id === editRowId) || null,
    [rows, editRowId]
  );
  const isEditing = !!editingRow;

  /* Close via ESC */
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

  /* Prevent background scroll */
  useEffect(() => {
    if (!addOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [addOpen]);

  function onOpenAddForm() {
    setEditRowId(null);
    setAddOpen(true);
  }

  function removePhraseById(id) {
    const idx = rows.findIndex((r) => r._id === id);
    if (idx !== -1) {
      const removeFromStore = usePhraseStore.getState().removePhrase;
      removeFromStore(idx);
    } else {
      setRows((prev) => prev.filter((r) => r._id !== id));
    }
  }

  /* RESTORE (from duplicate scanner) */
  useEffect(() => {
    function onRestore(e) {
      const { item } = e.detail;
      setRows((prev) => [item, ...prev]);
    }
    window.addEventListener("restorePhrase", onRestore);
    return () => window.removeEventListener("restorePhrase", onRestore);
  }, []);

  /* MODALS */
  const [showChangeLog, setShowChangeLog] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  /* First-launch user guide */
  useEffect(() => {
    const seen = localStorage.getItem(LSK_USER_GUIDE);
    if (!seen) setShowUserGuide(true);
  }, []);

  /* What's New */
  useEffect(() => {
    const seen = localStorage.getItem(LSK_LAST_SEEN_VERSION);
    if (seen !== APP_VERSION) setShowWhatsNew(true);
  }, []);

  /* PAGE CHANGE */
  function goToPage(next, { scrollTop = false } = {}) {
    setPage(next);
    setAddOpen(false);
    setEditRowId(null);

    if (scrollTop) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }

  /* ============================================================================
     RENDER
     ========================================================================== */
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header ref={headerRef} T={T} page={page} setPage={goToPage} />

      <main className="pt-3">
        {page === "library" && (
          <SearchDock
            SearchBox={SearchBox}
            sortMode={sortMode}
            setSortMode={setSortMode}
            placeholder={T.search}
            T={T}
            offsetTop={headerHeight + 12}
            page={page}
            setPage={goToPage}
          />
        )}

        {page === "library" ? (
          <LibraryView
            T={T}
            rows={rows}
            setRows={setRows}
            normalizeRag={normalizeRag}
            sortMode={sortMode}
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
            ttsProvider="azure"
            setTtsProvider={() => {}}
            azureVoiceShortName={azureVoiceShortName}
            setAzureVoiceShortName={setAzureVoiceShortName}
            playText={playText}
            fetchStarter={fetchStarter}
            clearLibrary={clearLibrary}
            importJsonFile={importJsonFile}
            rows={rows}
            onOpenDuplicateScanner={() =>
              goToPage("dupes", { scrollTop: true })
            }
            onOpenChangeLog={() => setShowChangeLog(true)}
            onOpenUserGuide={() => setShowUserGuide(true)}
          />
        ) : page === "dupes" ? (
          <DuplicateScannerView
            T={T}
            rows={rows}
            removePhrase={removePhraseById}
            onBack={() => goToPage("settings", { scrollTop: true })}
          />
        ) : (
          <>
            <HomeView
              playText={playText}
              setRows={setRows}
              genId={genId}
              nowTs={nowTs}
              rows={rows}
              showToast={showToast}
              onOpenAddForm={onOpenAddForm}
            />

            {toast && (
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg z-[500] shadow-lg">
                {toast}
              </div>
            )}
          </>
        )}
      </main>

      {/* ADD / EDIT FORM MODAL */}
      {addOpen && (
        <div
          className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm overflow-y-auto"
          onPointerDown={() => {
            setAddOpen(false);
            setEditRowId(null);
            document.activeElement?.blur?.();
          }}
        >
          <div
            className="w-full max-w-2xl mx-auto px-4"
            style={{ paddingTop: headerHeight + 20, paddingBottom: 40 }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="bg-zinc-900/95 border border-zinc-800 rounded-3xl p-5">
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
        </div>
      )}

      {showWhatsNew && (
        <WhatsNewModal
          version={APP_VERSION}
          onClose={() => {
            localStorage.setItem(LSK_LAST_SEEN_VERSION, APP_VERSION);
            setShowWhatsNew(false);
          }}
          onViewChangelog={() => {
            localStorage.setItem(LSK_LAST_SEEN_VERSION, APP_VERSION);
            setShowWhatsNew(false);
            setShowChangeLog(true);
          }}
        />
      )}

      {showChangeLog && (
        <ChangeLogModal onClose={() => setShowChangeLog(false)} />
      )}

      {showUserGuide && (
        <UserGuideModal
          onClose={() => {
            setShowUserGuide(false);
            localStorage.setItem(LSK_USER_GUIDE, "1");
          }}
          firstLaunch={!localStorage.getItem(LSK_USER_GUIDE)}
        />
      )}
    </div>
  );
}

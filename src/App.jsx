// src/App.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
  forwardRef,
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

import AuthGate from "./components/AuthGate";
import BetaBlocked from "./components/BetaBlocked";

import { searchStore } from "./searchStore";
import { usePhraseStore } from "./stores/phraseStore";
import { initAuthListener, useAuthStore } from "./stores/authStore";
import { supabase } from "./supabaseClient";

/* ============================================================================
   CONSTANTS
   ========================================================================== */
const APP_VERSION = "1.4.1-beta";

const LSK_SORT = "lt_sort_v1";
const LSK_PAGE = "lt_page";
const LSK_USER_GUIDE = "lt_seen_user_guide";
const LSK_LAST_SEEN_VERSION = "lt_last_seen_version";

const STARTERS = {
  EN2LT: "/data/starter_en_to_lt.json",
};

const SWIPE_PAGES = ["home", "library", "settings"]; // only these are swipe-navigable

/* ============================================================================
   STRINGS
   ========================================================================== */
const STR = {
  appTitle1: "Žodis",
  appTitle2: "",
  subtitle: "",
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

/**
 * ✅ Must match src/stores/phraseStore.js identity rule:
 * Lithuanian-only, diacritics stripped, punctuation removed.
 */
function makeLtKey(r) {
  return String(r?.Lithuanian || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
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
  /* INIT AUTH (PASSIVE, ONCE) */
  useEffect(() => {
    initAuthListener();
  }, []);

  const authLoading = useAuthStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);

  /* BETA ACCESS GATE */
  const [allowlistChecked, setAllowlistChecked] = useState(false);
  const [isAllowlisted, setIsAllowlisted] = useState(false);

  useEffect(() => {
    let alive = true;

    async function check() {
      if (!user?.email) {
        if (!alive) return;
        setIsAllowlisted(false);
        setAllowlistChecked(true);
        return;
      }

      setAllowlistChecked(false);

      const email = String(user.email).toLowerCase();

      const { data, error } = await supabase
        .from("beta_allowlist")
        .select("email")
        .eq("email", email)
        .limit(1);

      if (!alive) return;

      if (error) {
        console.warn("Allowlist check failed:", error);
        setIsAllowlisted(false);
        setAllowlistChecked(true);
        return;
      }

      setIsAllowlisted((data?.length || 0) > 0);
      setAllowlistChecked(true);
    }

    check();

    return () => {
      alive = false;
    };
  }, [user?.email]);

  /* PAGE */
  const [page, setPage] = useState(() => localStorage.getItem(LSK_PAGE) || "home");
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

  /* ROWS */
  const rows = usePhraseStore((s) => s.phrases);
  const setRows = usePhraseStore((s) => s.setPhrases);

  // ✅ store-controlled
  const addPhrase = usePhraseStore((s) => s.addPhrase);
  const saveEditedPhrase = usePhraseStore((s) => s.saveEditedPhrase);

  const visibleRows = useMemo(() => rows.filter((r) => !r._deleted), [rows]);

  /* SORT */
  const [sortMode, setSortMode] = useState(() => localStorage.getItem(LSK_SORT) || "RAG");
  useEffect(() => localStorage.setItem(LSK_SORT, sortMode), [sortMode]);

  const T = STR;

  /* VOICE */
  const [azureVoiceShortName, setAzureVoiceShortName] = useState("lt-LT-LeonasNeural");
  const audioRef = useRef(null);

  async function playText(text, { slow = false } = {}) {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const resp = await fetch("/api/azure-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: azureVoiceShortName, slow }),
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

  useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );

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
        Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(r.Sheet) ? r.Sheet : "Phrases",
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

  async function mergeStarterRows(newRows) {
    const cleaned = newRows
      .map((r) => {
        const base = {
          English: r.English?.trim() || "",
          Lithuanian: r.Lithuanian?.trim() || "",
          Phonetic: r.Phonetic?.trim() || "",
          Category: r.Category?.trim() || "",
          Usage: r.Usage?.trim() || "",
          Notes: r.Notes?.trim() || "",
          "RAG Icon": normalizeRag(r["RAG Icon"] || "🟠"),
          Sheet: ["Phrases", "Questions", "Words", "Numbers"].includes(r.Sheet) ? r.Sheet : "Phrases",
          _id: r._id || genId(),
          _ts: r._ts || nowTs(),
          _qstat:
            r._qstat || {
              red: { ok: 0, bad: 0 },
              amb: { ok: 0, bad: 0 },
              grn: { ok: 0, bad: 0 },
            },
          Source: "starter",
          Touched: false,
        };

        const ck = makeLtKey(base);
        return { ...base, contentKey: ck };
      })
      .filter((r) => r.English || r.Lithuanian);

    setRows((prev) => {
      const existingKeys = new Set(
        prev
          .map((p) => p?.contentKey)
          .filter((k) => typeof k === "string" && k.length > 0)
      );

      const merged = [...prev];

      for (const row of cleaned) {
        const key = row?.contentKey;
        if (!key) {
          const existsById = prev.some((p) => p?._id === row._id);
          if (!existsById) merged.push(row);
          continue;
        }
        if (!existingKeys.has(key)) {
          merged.push(row);
          existingKeys.add(key);
        }
      }

      return merged;
    });
  }

  async function fetchStarter(kind) {
    const url = STARTERS[kind];
    if (!url) return alert("Starter not found");

    const res = await fetch(url);
    if (!res.ok) return alert("Failed to fetch starter");

    const data = await res.json();
    await mergeStarterRows(data);

    alert("Starter pack installed.");
  }

  function clearLibrary() {
    if (confirm(T.confirm)) setRows([]);
  }

  async function importJsonFile(file) {
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data)) throw new Error();
      await mergeRows(data);
      alert("Imported.");
    } catch {
      alert("Import failed.");
    }
  }

  const [addOpen, setAddOpen] = useState(false);
  const [editRowId, setEditRowId] = useState(null);

  const editingRow = useMemo(
    () => visibleRows.find((r) => r._id === editRowId) || null,
    [visibleRows, editRowId]
  );
  const isEditing = !!editingRow;

  function removePhraseById(id) {
    setRows((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, _deleted: true, _deleted_ts: Date.now() } : r
      )
    );
  }

  const [showChangeLog, setShowChangeLog] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(LSK_USER_GUIDE)) setShowUserGuide(true);
  }, []);

  useEffect(() => {
    if (localStorage.getItem(LSK_LAST_SEEN_VERSION) !== APP_VERSION) setShowWhatsNew(true);
  }, []);

  function goToPage(next) {
    setAddOpen(false);
    setEditRowId(null);
    setShowChangeLog(false);
    setShowUserGuide(false);
    setShowWhatsNew(false);
    setPage(next);
  }

  /* ============================================================================
     SWIPE NAV (SAFE: NO CONDITIONAL HOOKS)
     ========================================================================== */
  const swipeRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    pointerId: null,
    startT: 0,
    locked: null, // null | "h" | "v"
  });

  const canSwipe = useMemo(() => {
    // Only allow swipe between main tabs; never while modals open.
    if (addOpen || showChangeLog || showUserGuide || showWhatsNew) return false;
    if (!SWIPE_PAGES.includes(page)) return false;
    return true;
  }, [addOpen, showChangeLog, showUserGuide, showWhatsNew, page]);

  const pageIndex = useMemo(() => {
    const i = SWIPE_PAGES.indexOf(page);
    return i === -1 ? 0 : i;
  }, [page]);

  function swipeToIndex(nextIdx) {
    const clamped = Math.max(0, Math.min(SWIPE_PAGES.length - 1, nextIdx));
    const nextPage = SWIPE_PAGES[clamped];
    if (nextPage && nextPage !== page) goToPage(nextPage);
  }

  function isTextInputTarget(target) {
    if (!target) return false;
    const el = target.closest?.("input, textarea, select, [contenteditable='true']");
    return !!el;
  }

  function onPointerDown(e) {
    if (!canSwipe) return;
    if (e.pointerType === "mouse") return; // swipe is touch/pen only
    if (isTextInputTarget(e.target)) return;

    swipeRef.current.active = true;
    swipeRef.current.pointerId = e.pointerId;
    swipeRef.current.startX = e.clientX;
    swipeRef.current.startY = e.clientY;
    swipeRef.current.lastX = e.clientX;
    swipeRef.current.lastY = e.clientY;
    swipeRef.current.startT = Date.now();
    swipeRef.current.locked = null;
  }

  function onPointerMove(e) {
    if (!swipeRef.current.active) return;
    if (e.pointerId !== swipeRef.current.pointerId) return;

    swipeRef.current.lastX = e.clientX;
    swipeRef.current.lastY = e.clientY;

    const dx = e.clientX - swipeRef.current.startX;
    const dy = e.clientY - swipeRef.current.startY;

    // lock direction after small movement
    if (!swipeRef.current.locked) {
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      if (adx < 6 && ady < 6) return;
      swipeRef.current.locked = adx > ady ? "h" : "v";
    }

    // If horizontal swipe, prevent browser back/forward + weird selection
    if (swipeRef.current.locked === "h") {
      e.preventDefault?.();
    }
  }

  function onPointerUpOrCancel(e) {
    if (!swipeRef.current.active) return;
    if (e.pointerId !== swipeRef.current.pointerId) return;

    const dx = swipeRef.current.lastX - swipeRef.current.startX;
    const dy = swipeRef.current.lastY - swipeRef.current.startY;

    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    const elapsed = Date.now() - swipeRef.current.startT;

    // reset first
    swipeRef.current.active = false;
    swipeRef.current.pointerId = null;
    const locked = swipeRef.current.locked;
    swipeRef.current.locked = null;

    if (!canSwipe) return;

    // require a deliberate horizontal swipe
    if (locked !== "h") return;
    if (ady > 40) return; // too vertical
    if (adx < 55) return; // not far enough
    if (elapsed > 1200) return; // too slow; treat as scroll/drag

    // dx < 0 means swipe left (next page)
    if (dx < 0) swipeToIndex(pageIndex + 1);
    else swipeToIndex(pageIndex - 1);
  }

  /* MODAL SCROLL LOCK */
  useEffect(() => {
    if (!addOpen || authLoading) return;

    const body = document.body;
    const html = document.documentElement;

    const prevBody = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      overscrollBehavior: body.style.overscrollBehavior,
      touchAction: body.style.touchAction,
    };

    const prevHtml = {
      overflow: html.style.overflow,
      overscrollBehavior: html.style.overscrollBehavior,
      height: html.style.height,
    };

    let scrollY = window.scrollY || 0;

    const applyLock = () => {
      scrollY = Number.isFinite(window.scrollY) ? window.scrollY : scrollY;

      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      body.style.overscrollBehavior = "none";
      body.style.touchAction = "none";

      html.style.overflow = "hidden";
      html.style.overscrollBehavior = "none";
      html.style.height = "100%";
    };

    const reapplyIfNeeded = () => {
      if (!addOpen || authLoading) return;
      applyLock();
    };

    applyLock();

    window.addEventListener("pageshow", reapplyIfNeeded);
    window.addEventListener("focus", reapplyIfNeeded);
    window.addEventListener("resize", reapplyIfNeeded);
    window.addEventListener("orientationchange", reapplyIfNeeded);
    document.addEventListener("visibilitychange", reapplyIfNeeded);

    return () => {
      window.removeEventListener("pageshow", reapplyIfNeeded);
      window.removeEventListener("focus", reapplyIfNeeded);
      window.removeEventListener("resize", reapplyIfNeeded);
      window.removeEventListener("orientationchange", reapplyIfNeeded);
      document.removeEventListener("visibilitychange", reapplyIfNeeded);

      body.style.position = prevBody.position;
      body.style.top = prevBody.top;
      body.style.left = prevBody.left;
      body.style.right = prevBody.right;
      body.style.width = prevBody.width;
      body.style.overflow = prevBody.overflow;
      body.style.overscrollBehavior = prevBody.overscrollBehavior;
      body.style.touchAction = prevBody.touchAction;

      html.style.overflow = prevHtml.overflow;
      html.style.overscrollBehavior = prevHtml.overscrollBehavior;
      html.style.height = prevHtml.height;

      window.scrollTo(0, scrollY);
    };
  }, [addOpen, authLoading]);

  /* RENDER GATE (no early returns before hooks) */
  if (authLoading && !user) {
    return <div className="min-h-[100dvh] bg-zinc-950" />;
  }

  if (!user) {
    return <AuthGate />;
  }

  if (!allowlistChecked) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 text-zinc-200 flex items-center justify-center">
        Checking beta access…
      </div>
    );
  }

  if (!isAllowlisted) {
    return <BetaBlocked email={user.email} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header ref={headerRef} T={T} page={page} setPage={goToPage} />

      {/* Swipe wrapper (touch only). Allow vertical scroll; we only intercept locked horizontal swipes. */}
      <main
        className="pt-3 touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUpOrCancel}
        onPointerCancel={onPointerUpOrCancel}
      >
        {page === "library" && (
          <SearchDock
            SearchBox={SearchBox}
            sortMode={sortMode}
            setSortMode={setSortMode}
            placeholder={T.search}
            T={T}
            offsetTop={headerHeight}
            page={page}
            setPage={goToPage}
          />
        )}

        {page === "library" ? (
          <LibraryView
            T={T}
            rows={visibleRows}
            setRows={setRows}
            normalizeRag={normalizeRag}
            sortMode={sortMode}
            playText={playText}
            removePhrase={removePhraseById}
            onEditRow={(id) => {
              setEditRowId(id);
              setAddOpen(true);
            }}
            onOpenAddForm={() => {
              setEditRowId(null);
              setAddOpen(true);
            }}
          />
        ) : page === "settings" ? (
          <SettingsView
            T={T}
            azureVoiceShortName={azureVoiceShortName}
            setAzureVoiceShortName={setAzureVoiceShortName}
            playText={playText}
            fetchStarter={fetchStarter}
            clearLibrary={clearLibrary}
            importJsonFile={importJsonFile}
            rows={rows}
            onOpenDuplicateScanner={() => goToPage("dupes")}
            onOpenChangeLog={() => setShowChangeLog(true)}
            onOpenUserGuide={() => setShowUserGuide(true)}
          />
        ) : page === "dupes" ? (
          <DuplicateScannerView
            T={T}
            rows={visibleRows}
            removePhrase={removePhraseById}
            onBack={() => goToPage("settings")}
          />
        ) : (
          <HomeView
            playText={playText}
            setRows={setRows}
            genId={genId}
            nowTs={nowTs}
            rows={visibleRows}
            onOpenAddForm={() => {
              setEditRowId(null);
              setAddOpen(true);
            }}
          />
        )}
      </main>

      {addOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setAddOpen(false);
            setEditRowId(null);
          }}
        >
          <div
            className="w-full h-full px-3 pb-4 flex justify-center items-start"
            style={{ paddingTop: headerHeight + 16 }}
          >
            <div
              className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
              style={{ height: `calc(100dvh - ${headerHeight + 32}px)` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 pb-3 border-b border-zinc-800 shrink-0">
                <h3 className="text-lg font-semibold">{isEditing ? T.edit : T.addEntry}</h3>
              </div>

              <div className="p-5 pt-4 flex-1 min-h-0">
                <AddForm
                  T={T}
                  genId={genId}
                  nowTs={nowTs}
                  normalizeRag={normalizeRag}
                  mode={isEditing ? "edit" : "add"}
                  initialRow={editingRow || undefined}
                  onSubmit={(row) => {
                    if (isEditing) {
                      const index = rows.findIndex((r) => r._id === row._id);
                      if (index !== -1) saveEditedPhrase(index, row);
                    } else {
                      addPhrase(row);
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
        </div>
      )}

      {showWhatsNew && (
        <WhatsNewModal
          version={APP_VERSION}
          topOffset={headerHeight}
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

      {showChangeLog && <ChangeLogModal onClose={() => setShowChangeLog(false)} />}

      {showUserGuide && (
        <UserGuideModal
          topOffset={headerHeight}
          onClose={() => {
            setShowUserGuide(false);
            localStorage.setItem(LSK_USER_GUIDE, "1");
          }}
          firstLaunch
        />
      )}
    </div>
  );
}

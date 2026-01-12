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

const PAGES = ["home", "library", "settings"];

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

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function isInteractiveTarget(target) {
  if (!target) return false;
  const el = target.closest?.(
    "input, textarea, select, button, a, [role='button'], [data-no-swipe='true']"
  );
  return !!el;
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
  const [page, setPage] = useState(() => {
    const raw = localStorage.getItem(LSK_PAGE) || "home";
    return PAGES.includes(raw) ? raw : "home";
  });
  useEffect(() => localStorage.setItem(LSK_PAGE, page), [page]);

  const pageIndex = useMemo(() => {
    const idx = PAGES.indexOf(page);
    return idx === -1 ? 0 : idx;
  }, [page]);

  /* HEADER HEIGHT */
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;
    const measure = () =>
      setHeaderHeight(headerRef.current.getBoundingClientRect().height || 0);
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  /* VIEWPORT WIDTH (for correct translate) */
  const viewportRef = useRef(null);
  const [viewportW, setViewportW] = useState(
    typeof window !== "undefined" ? window.innerWidth || 360 : 360
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w && w > 0) setViewportW(w);
    };

    update();

    // ResizeObserver if available (best)
    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    } else {
      window.addEventListener("resize", update);
      window.addEventListener("orientationchange", update);
    }

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  /* ROWS */
  const rows = usePhraseStore((s) => s.phrases);
  const setRows = usePhraseStore((s) => s.setPhrases);

  // ✅ store-controlled
  const addPhrase = usePhraseStore((s) => s.addPhrase);
  const saveEditedPhrase = usePhraseStore((s) => s.saveEditedPhrase);

  const visibleRows = useMemo(() => rows.filter((r) => !r._deleted), [rows]);

  /* SORT */
  const [sortMode, setSortMode] = useState(
    () => localStorage.getItem(LSK_SORT) || "RAG"
  );
  useEffect(() => localStorage.setItem(LSK_SORT, sortMode), [sortMode]);

  const T = STR;

  /* VOICE */
  const [azureVoiceShortName, setAzureVoiceShortName] = useState(
    "lt-LT-LeonasNeural"
  );
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
    if (localStorage.getItem(LSK_LAST_SEEN_VERSION) !== APP_VERSION)
      setShowWhatsNew(true);
  }, []);

  // internalRoute keeps "dupes" as a settings sub-view without becoming a swipe-page
  const [internalRoute, setInternalRoute] = useState("main"); // "main" | "dupes"

  function goToPage(next) {
    setAddOpen(false);
    setEditRowId(null);
    setShowChangeLog(false);
    setShowUserGuide(false);
    setShowWhatsNew(false);

    if (next === "dupes") {
      setInternalRoute("dupes");
      setPage("settings");
      return;
    }

    setInternalRoute("main");
    if (PAGES.includes(next)) setPage(next);
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

  /* ============================================================================
     SWIPE PAGER (fixed-height viewport + per-page scroll)
     ========================================================================== */
  const trackRef = useRef(null);

  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const allowSwipeRef = useRef(true);
  const movedHorizRef = useRef(false);

  const [dragDX, setDragDX] = useState(0); // px

  useEffect(() => {
    if (draggingRef.current) return;
    setDragDX(0);
  }, [pageIndex]);

  function snapToIndex(idx) {
    const next = PAGES[clamp(idx, 0, PAGES.length - 1)];
    if (next && next !== page) setPage(next);
  }

  function onPointerDown(e) {
    if (addOpen) return;

    if (isInteractiveTarget(e.target)) {
      allowSwipeRef.current = false;
      return;
    }

    allowSwipeRef.current = true;
    draggingRef.current = true;
    movedHorizRef.current = false;

    startXRef.current = e.clientX;
    startYRef.current = e.clientY;

    setDragDX(0);

    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  }

  function onPointerMove(e) {
    if (!draggingRef.current) return;
    if (!allowSwipeRef.current) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    // tighter intent rules: avoid accidental page flips when scrolling
    if (!movedHorizRef.current) {
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);

      // if clearly vertical, abort swipe
      if (ady > 12 && ady > adx * 1.25) {
        draggingRef.current = false;
        setDragDX(0);
        return;
      }

      // require stronger horizontal commitment
      if (adx > 12 && adx > ady * 1.1) {
        movedHorizRef.current = true;
      } else {
        return;
      }
    }

    e.preventDefault?.();

    let nextDx = dx;

    // resistance at edges
    if (pageIndex === 0 && nextDx > 0) nextDx = nextDx * 0.35;
    if (pageIndex === PAGES.length - 1 && nextDx < 0) nextDx = nextDx * 0.35;

    nextDx = clamp(nextDx, -viewportW * 1.05, viewportW * 1.05);
    setDragDX(nextDx);
  }

  function onPointerUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    if (!allowSwipeRef.current) {
      allowSwipeRef.current = true;
      setDragDX(0);
      return;
    }

    const threshold = viewportW * 0.18;
    let nextIndex = pageIndex;

    if (dragDX < -threshold) nextIndex = pageIndex + 1;
    if (dragDX > threshold) nextIndex = pageIndex - 1;

    nextIndex = clamp(nextIndex, 0, PAGES.length - 1);

    setDragDX(0);
    snapToIndex(nextIndex);
  }

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

  const baseTranslate = -pageIndex * viewportW;
  const translatePx = baseTranslate + dragDX;

  const pagerHeight = `calc(100dvh - ${headerHeight}px)`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <Header ref={headerRef} T={T} page={page} setPage={goToPage} />

      {/* Pager viewport: fixed height, no document scroll */}
      <main
        ref={viewportRef}
        className="overflow-hidden"
        style={{
          height: pagerHeight,
          touchAction: "pan-y",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Track */}
        <div
          ref={trackRef}
          className="flex h-full"
          style={{
            transform: `translate3d(${translatePx}px, 0, 0)`,
            transition:
              draggingRef.current || dragDX !== 0
                ? "none"
                : "transform 220ms cubic-bezier(0.2, 0.9, 0.2, 1)",
            willChange: "transform",
          }}
        >
          {/* HOME (own scroll container) */}
          <section className="w-screen shrink-0 h-full overflow-y-auto overscroll-contain">
            <div className="pt-3">
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
            </div>
          </section>

          {/* LIBRARY (own scroll container) */}
          <section className="w-screen shrink-0 h-full overflow-y-auto overscroll-contain">
            <div className="pt-3">
              <SearchDock
                SearchBox={SearchBox}
                sortMode={sortMode}
                setSortMode={setSortMode}
                placeholder={T.search}
                T={T}
                offsetTop={headerHeight}
                page={"library"}
                setPage={goToPage}
              />

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
            </div>
          </section>

          {/* SETTINGS (own scroll container) */}
          <section className="w-screen shrink-0 h-full overflow-y-auto overscroll-contain">
            <div className="pt-3">
              {internalRoute === "dupes" ? (
                <DuplicateScannerView
                  T={T}
                  rows={visibleRows}
                  removePhrase={removePhraseById}
                  onBack={() => {
                    setInternalRoute("main");
                    setPage("settings");
                  }}
                />
              ) : (
                <SettingsView
                  T={T}
                  azureVoiceShortName={azureVoiceShortName}
                  setAzureVoiceShortName={setAzureVoiceShortName}
                  playText={playText}
                  fetchStarter={fetchStarter}
                  clearLibrary={clearLibrary}
                  importJsonFile={importJsonFile}
                  rows={rows}
                  onOpenDuplicateScanner={() => {
                    setInternalRoute("dupes");
                    setPage("settings");
                  }}
                  onOpenChangeLog={() => setShowChangeLog(true)}
                  onOpenUserGuide={() => setShowUserGuide(true)}
                />
              )}
            </div>
          </section>
        </div>
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
                <h3 className="text-lg font-semibold">
                  {isEditing ? T.edit : T.addEntry}
                </h3>
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

      {showChangeLog && (
        <ChangeLogModal onClose={() => setShowChangeLog(false)} />
      )}

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

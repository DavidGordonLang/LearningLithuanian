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
  const [page, setPage] = useState(
    () => localStorage.getItem(LSK_PAGE) || "home"
  );
  useEffect(() => localStorage.setItem(LSK_PAGE, page), [page]);

  const pageIndex = useMemo(() => {
    const idx = PAGES.indexOf(page);
    return idx === -1 ? 0 : idx;
  }, [page]);

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

  function goToPage(next) {
    setAddOpen(false);
    setEditRowId(null);
    setShowChangeLog(false);
    setShowUserGuide(false);
    setShowWhatsNew(false);
    setPage(next);
  }

  /* ============================================================================
     SWIPE PAGER (VISIBLE TRACK)
     - Keeps all pages mounted
     - Track moves with finger
     - Snaps on release
     ========================================================================== */
  const pagerRef = useRef(null);
  const dragStateRef = useRef({
    active: false,
    dragging: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastT: 0,
    vx: 0,
    width: 1,
  });

  const [dragX, setDragX] = useState(0); // px
  const [dragging, setDragging] = useState(false);

  // When page changes via tap or code, ensure we reset any drag
  useEffect(() => {
    setDragX(0);
    setDragging(false);
    dragStateRef.current.dragging = false;
    dragStateRef.current.active = false;
    dragStateRef.current.pointerId = null;
  }, [page]);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const onPointerDownPager = (e) => {
    if (addOpen) return; // don’t swipe while modal open
    if (!pagerRef.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const rect = pagerRef.current.getBoundingClientRect();
    const width = rect.width || 1;

    dragStateRef.current = {
      active: true,
      dragging: false,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastT: performance.now(),
      vx: 0,
      width,
    };

    // Don’t capture yet; we only capture once we know it’s a horizontal drag.
  };

  const onPointerMovePager = (e) => {
    const st = dragStateRef.current;
    if (!st.active || st.pointerId !== e.pointerId) return;

    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;

    // Determine intent: only start dragging when horizontal is clearly dominant
    if (!st.dragging) {
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // require a small commitment, and horizontal dominance
      if (absX < 10) return;
      if (absX < absY * 1.2) return;

      st.dragging = true;
      setDragging(true);

      // capture now that we’re sure
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    if (!st.dragging) return;

    // velocity (simple)
    const now = performance.now();
    const dt = Math.max(1, now - st.lastT);
    st.vx = (e.clientX - st.lastX) / dt; // px per ms
    st.lastX = e.clientX;
    st.lastT = now;

    // clamp to one page width in either direction
    const clamped = clamp(dx, -st.width, st.width);
    setDragX(clamped);
  };

  const finishSwipe = (e) => {
    const st = dragStateRef.current;
    if (!st.active || st.pointerId !== e.pointerId) return;

    const dx = dragX;
    const width = st.width || 1;
    const vx = st.vx || 0;

    const absDx = Math.abs(dx);
    const dir = dx < 0 ? 1 : -1; // left swipe -> +1 page, right swipe -> -1 page

    // thresholds: distance OR quick flick
    const distancePass = absDx > width * 0.18;
    const velocityPass = Math.abs(vx) > 0.9; // ~ fast flick

    let nextIndex = pageIndex;

    if (st.dragging && (distancePass || velocityPass)) {
      nextIndex = clamp(pageIndex + dir, 0, PAGES.length - 1);
    }

    // reset drag
    dragStateRef.current.active = false;
    dragStateRef.current.dragging = false;
    dragStateRef.current.pointerId = null;

    setDragging(false);
    setDragX(0);

    if (nextIndex !== pageIndex) {
      goToPage(PAGES[nextIndex]);
    }
  };

  const onPointerUpPager = (e) => finishSwipe(e);
  const onPointerCancelPager = (e) => finishSwipe(e);

  const trackTransform = useMemo(() => {
    // base position in px
    // translateX = -(index * width) + dragX
    const w = dragStateRef.current.width || 1;
    const base = -pageIndex * w;
    return base + (dragging ? dragX : 0);
  }, [pageIndex, dragX, dragging]);

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

      <main className="pt-3">
        {/* Fixed-under-header search UI only when Library is active (your choice “2”) */}
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

        {/* PAGER: pages stay mounted, track slides with swipe */}
        <div
          ref={pagerRef}
          className="relative w-full overflow-hidden"
          style={{
            touchAction: "pan-y", // allow vertical scroll, we handle horizontal
          }}
          onPointerDown={onPointerDownPager}
          onPointerMove={onPointerMovePager}
          onPointerUp={onPointerUpPager}
          onPointerCancel={onPointerCancelPager}
        >
          <div
            className="flex w-[300%]"
            style={{
              transform: `translateX(${trackTransform}px)`,
              transition: dragging ? "none" : "transform 220ms ease-out",
              willChange: "transform",
            }}
          >
            {/* HOME */}
            <div className="w-full shrink-0">
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

            {/* LIBRARY */}
            <div className="w-full shrink-0">
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

            {/* SETTINGS (includes dupes navigation like before) */}
            <div className="w-full shrink-0">
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
            </div>
          </div>
        </div>

        {/* DUPES is not part of the swipe pager (intentional) */}
        {page === "dupes" && (
          <DuplicateScannerView
            T={T}
            rows={visibleRows}
            removePhrase={removePhraseById}
            onBack={() => goToPage("settings")}
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

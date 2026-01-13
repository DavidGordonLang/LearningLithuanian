// src/App.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
  forwardRef,
  memo,
  useImperativeHandle,
  useSyncExternalStore,
  useLayoutEffect,
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
const APP_VERSION = "1.5.0-beta";

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
   SWIPE PAGER (pixel-accurate widths; header fixed; panels scroll independently)
   - Allows swipe on buttons (so play-area can swipe)
   - Still blocks swipe on text inputs/textarea/select/contenteditable
   - NEW: exposes live progress for header pill interpolation
   - FIX: always snaps back from overscroll edges (no sticking)
   ========================================================================== */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function isTextFieldEl(el) {
  if (!el) return false;
  // Any explicit block zone
  if (el.closest?.('[data-swipe-block="true"]')) return true;

  const tag = (el.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;

  // Contenteditable (or inside)
  if (el.isContentEditable) return true;
  if (el.closest?.("[contenteditable='true']")) return true;

  return false;
}

function SwipePager({ index, onIndexChange, onProgress, children }) {
  const hostRef = useRef(null);
  const trackRef = useRef(null);

  const pageCount = React.Children.count(children);

  const [vw, setVw] = useState(() => {
    if (typeof window === "undefined") return 360;
    return window.innerWidth || 360;
  });

  // drag state
  const drag = useRef({
    active: false,
    locked: false,
    startX: 0,
    startY: 0,
    dx: 0,
    startIndex: 0,
    raf: 0,
    dragging: false,
  });

  const currentXRef = useRef(-index * vw);

  const emitProgress = (x, draggingFlag) => {
    if (typeof onProgress !== "function") return;
    if (!vw) return;

    // progress uses the actual on-screen transform (including resisted overscroll)
    const p = (-x) / vw;
    onProgress(p, !!draggingFlag);
  };

  const applyTransform = (x, draggingFlag) => {
    const el = trackRef.current;
    if (!el) return;
    currentXRef.current = x;
    el.style.transform = `translate3d(${x}px,0,0)`;
    emitProgress(x, draggingFlag);
  };

  const snapTo = (nextIndex, { draggingFlag = false } = {}) => {
    const el = trackRef.current;
    if (!el) return;
    const x = -nextIndex * vw;
    el.style.transition = "transform 220ms cubic-bezier(0.2, 0.9, 0.2, 1)";
    applyTransform(x, draggingFlag);

    window.setTimeout(() => {
      if (trackRef.current) trackRef.current.style.transition = "none";
      // After snap completes, lock progress exactly to the page index
      if (typeof onProgress === "function") onProgress(nextIndex, false);
    }, 260);
  };

  // Measure host width (not window) so it stays correct even inside layouts
  useLayoutEffect(() => {
    const measure = () => {
      const host = hostRef.current;
      if (!host) return;
      const w = host.getBoundingClientRect().width || window.innerWidth || 360;
      setVw(w);

      const x = -index * w;
      // keep track aligned to current page
      if (trackRef.current) trackRef.current.style.transition = "none";
      applyTransform(x, false);
    };

    measure();

    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Snap when index changes (tap on pills)
  useEffect(() => {
    snapTo(index, { draggingFlag: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, vw]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const endGesture = () => {
      if (!drag.current.active) return;

      const dx = drag.current.dx || 0;

      drag.current.active = false;
      drag.current.locked = false;

      const threshold = Math.max(50, vw * 0.18);

      let next = index;
      if (dx <= -threshold) next = index + 1;
      else if (dx >= threshold) next = index - 1;

      next = clamp(next, 0, pageCount - 1);

      // Always snap back visually, even if the page index doesn't change.
      // This fixes "sticking" after resisted overscroll.
      if (next === index) {
        snapTo(index, { draggingFlag: false });
      } else {
        onIndexChange(next);
      }

      drag.current.dragging = false;
      if (typeof onProgress === "function") onProgress(next, false);
    };

    const onTouchStart = (e) => {
      if (!e.touches || e.touches.length !== 1) return;

      const target = e.target;

      // Block swipe on text fields (typing)
      if (isTextFieldEl(target)) return;

      const t = e.touches[0];
      drag.current.active = true;
      drag.current.locked = false;
      drag.current.startX = t.clientX;
      drag.current.startY = t.clientY;
      drag.current.dx = 0;
      drag.current.startIndex = index;
      drag.current.dragging = false;
    };

    const onTouchMove = (e) => {
      if (!drag.current.active || !e.touches || e.touches.length !== 1) return;

      const t = e.touches[0];
      const dx = t.clientX - drag.current.startX;
      const dy = t.clientY - drag.current.startY;

      if (!drag.current.locked) {
        // deadzone
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;

        // decide swipe vs scroll
        if (Math.abs(dx) > Math.abs(dy) * 1.15) {
          drag.current.locked = true;
          drag.current.dragging = true;

          // If a text input is focused, blur it so the keyboard doesn't fight the gesture.
          const ae = document.activeElement;
          if (
            ae &&
            (ae.tagName === "INPUT" ||
              ae.tagName === "TEXTAREA" ||
              ae.tagName === "SELECT")
          ) {
            try {
              ae.blur();
            } catch {}
          }
        } else {
          // vertical scroll gesture
          drag.current.active = false;
          drag.current.locked = false;
          drag.current.dragging = false;
          return;
        }
      }

      // horizontal swipe mode
      e.preventDefault();

      drag.current.dx = dx;

      // edge resistance
      const atFirst = index === 0 && dx > 0;
      const atLast = index === pageCount - 1 && dx < 0;
      const resisted = atFirst || atLast ? dx * 0.35 : dx;

      const x = -index * vw + resisted;

      if (drag.current.raf) cancelAnimationFrame(drag.current.raf);
      drag.current.raf = requestAnimationFrame(() =>
        applyTransform(x, true /* dragging */)
      );
    };

    host.addEventListener("touchstart", onTouchStart, { passive: true });
    host.addEventListener("touchmove", onTouchMove, { passive: false });
    host.addEventListener("touchend", endGesture, { passive: true });
    host.addEventListener("touchcancel", endGesture, { passive: true });

    return () => {
      host.removeEventListener("touchstart", onTouchStart);
      host.removeEventListener("touchmove", onTouchMove);
      host.removeEventListener("touchend", endGesture);
      host.removeEventListener("touchcancel", endGesture);
    };
  }, [index, onIndexChange, onProgress, pageCount, vw]);

  return (
    <div ref={hostRef} className="h-full w-full overflow-hidden touch-pan-y">
      <div
        ref={trackRef}
        className="h-full flex"
        style={{
          width: `${vw * pageCount}px`,
          transform: `translate3d(${-index * vw}px,0,0)`,
          transition: "none",
          willChange: "transform",
        }}
      >
        {React.Children.map(children, (child) => (
          <div
            className="h-full flex-none overflow-y-auto overscroll-contain"
            style={{ width: `${vw}px` }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

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

  const swipeTabs = ["home", "library", "settings"];
  const swipeIndex = Math.max(0, swipeTabs.indexOf(page));

  // Live swipe progress for header pill interpolation
  const [swipeProgress, setSwipeProgress] = useState(swipeIndex);
  const [isSwiping, setIsSwiping] = useState(false);

  // Keep header pill correct on non-drag navigation
  useEffect(() => {
    if (page === "dupes") return; // leave as-is (pager not visible)
    setSwipeProgress(swipeIndex);
    setIsSwiping(false);
  }, [page, swipeIndex]);

  // ✅ Used to force-remount HomeView when logo is tapped (clears translate box etc)
  const [homeResetKey, setHomeResetKey] = useState(0);

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

  /* ROWS */
  const rows = usePhraseStore((s) => s.phrases);
  const setRows = usePhraseStore((s) => s.setPhrases);

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

  // ✅ LOGO = "refresh" but default to home
  function handleLogoClick() {
    // Clear global search (old pull-to-refresh behaviour vibe)
    startTransition(() => searchStore.clear());

    // Drop keyboard if any input is focused
    const ae = document.activeElement;
    if (
      ae &&
      (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.tagName === "SELECT")
    ) {
      try {
        ae.blur();
      } catch {}
    }

    // Force HomeView remount to clear its local state (translate box etc.)
    setHomeResetKey((k) => k + 1);

    // Go home (also closes modals via goToPage)
    goToPage("home");
  }

  // Lock BODY scrolling so only the active panel scrolls (header stays visible)
  useEffect(() => {
    if (!user) return;

    const body = document.body;
    const html = document.documentElement;

    const prev = {
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
    };

    body.style.overflow = "hidden";
    body.style.height = "100%";
    html.style.overflow = "hidden";
    html.style.height = "100%";

    return () => {
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
      html.style.overflow = prev.htmlOverflow;
      html.style.height = prev.htmlHeight;
    };
  }, [user]);

  /* MODAL SCROLL LOCK (unchanged) */
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
    <div className="min-h-[100dvh] h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <Header
        ref={headerRef}
        T={T}
        page={page}
        setPage={goToPage}
        onLogoClick={handleLogoClick}
        swipeProgress={swipeProgress}
        isSwiping={isSwiping}
      />

      <main
        className="flex-1 overflow-hidden"
        style={{ height: `calc(100dvh - ${headerHeight}px)` }}
      >
        {page === "dupes" ? (
          <div className="h-full overflow-y-auto overscroll-contain">
            <DuplicateScannerView
              T={T}
              rows={visibleRows}
              removePhrase={removePhraseById}
              onBack={() => goToPage("settings")}
            />
          </div>
        ) : (
          <SwipePager
            index={swipeIndex}
            onIndexChange={(i) => goToPage(swipeTabs[i])}
            onProgress={(p, dragging) => {
              // clamp progress for safety; allow small overscroll visual movement at edges
              const clamped = Math.max(-0.25, Math.min(2.25, p));
              setSwipeProgress(clamped);
              setIsSwiping(!!dragging);
            }}
          >
            {/* HOME */}
            <div className="h-full">
              <HomeView
                key={homeResetKey}
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
            <div className="h-full">
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
              </div>

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

            {/* SETTINGS */}
            <div className="h-full">
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
          </SwipePager>
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

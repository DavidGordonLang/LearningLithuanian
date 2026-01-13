// src/App.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
  useSyncExternalStore,
} from "react";

import Header from "./components/Header";
import AddForm from "./components/AddForm";
import SearchDock from "./components/SearchDock";
import SearchBox from "./components/SearchBox";
import HomeView from "./views/HomeView";
import SettingsView from "./views/SettingsView";
import LibraryView from "./views/LibraryView";
import DuplicateScannerView from "./views/DuplicateScannerView";
import ChangeLogModal from "./components/ChangeLogModal";
import UserGuideModal from "./components/UserGuideModal";
import WhatsNewModal from "./components/WhatsNewModal";
import SwipePager from "./components/SwipePager";

import DailyRecallModal from "./components/DailyRecallModal";
import useDailyRecall from "./hooks/useDailyRecall";

import AuthGate from "./components/AuthGate";
import BetaBlocked from "./components/BetaBlocked";

import { searchStore } from "./searchStore";
import { usePhraseStore } from "./stores/phraseStore";
import { initAuthListener, useAuthStore } from "./stores/authStore";
import { supabase } from "./supabaseClient";

import useLocalStorageState from "./hooks/useLocalStorageState";
import useModalScrollLock from "./hooks/useModalScrollLock";
import useBetaAllowlist from "./hooks/useBetaAllowlist";
import useAppBodyScrollLock from "./hooks/useAppBodyScrollLock";
import useTTSPlayer from "./hooks/useTTSPlayer";

import { nowTs, genId } from "./utils/ids";
import { normalizeRag } from "./utils/rag";
import { makeLtKey } from "./utils/contentKey";

import {
  mergeRows as mergeRowsIO,
  mergeStarterRows as mergeStarterRowsIO,
  fetchStarter as fetchStarterIO,
  importJsonFile as importJsonFileIO,
  clearLibrary as clearLibraryIO,
} from "./services/libraryIO";

/* ============================================================================ */
const APP_VERSION = "1.5.2-beta";

const LSK_SORT = "lt_sort_v1";
const LSK_PAGE = "lt_page";
const LSK_USER_GUIDE = "lt_seen_user_guide";
const LSK_LAST_SEEN_VERSION = "lt_last_seen_version";

const STARTERS = {
  EN2LT: "/data/starter_en_to_lt.json",
};

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

/* ============================================================================ */
export default function App() {
  useEffect(() => {
    initAuthListener();
  }, []);

  const authLoading = useAuthStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);

  const { checked: allowlistChecked, allowed: isAllowlisted } = useBetaAllowlist({
    userEmail: user?.email,
    supabase,
  });

  /* PAGE */
  const [page, setPage] = useLocalStorageState(LSK_PAGE, "home");
  const swipeTabs = ["home", "library", "settings"];
  const swipeIndex = Math.max(0, swipeTabs.indexOf(page));

  const [swipeProgress, setSwipeProgress] = useState(swipeIndex);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    if (page === "dupes") return;
    setSwipeProgress(swipeIndex);
    setIsSwiping(false);
  }, [page, swipeIndex]);

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
  const [sortMode, setSortMode] = useLocalStorageState(LSK_SORT, "RAG");

  const T = STR;

  /* VOICE */
  const { voice: azureVoiceShortName, setVoice: setAzureVoiceShortName, playText } =
    useTTSPlayer({
      initialVoice: "lt-LT-LeonasNeural",
      maxIdbEntries: 200,
      onError: (e) => alert("Voice error: " + (e?.message || "Unknown error")),
    });

  useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );

  /* LIBRARY IO */
  const mergeRows = (newRows) =>
    mergeRowsIO(newRows, { setRows, normalizeRag, genId, nowTs });

  const mergeStarterRows = (newRows) =>
    mergeStarterRowsIO(newRows, {
      setRows,
      normalizeRag,
      makeLtKey,
      genId,
      nowTs,
    });

  const fetchStarter = (kind) =>
    fetchStarterIO(kind, { STARTERS, mergeStarterRowsImpl: mergeStarterRows });

  const importJsonFile = (file) =>
    importJsonFileIO(file, { mergeRowsImpl: mergeRows });

  const clearLibrary = () => clearLibraryIO({ T, setRows });

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

  useModalScrollLock({ active: addOpen, disabled: authLoading });
  useAppBodyScrollLock({ active: !!user });

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

  function handleLogoClick() {
    startTransition(() => searchStore.clear());

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

    setHomeResetKey((k) => k + 1);
    goToPage("home");
  }

  /* DAILY RECALL */
  const dailyBlocked =
    addOpen ||
    showWhatsNew ||
    showUserGuide ||
    showChangeLog ||
    page === "dupes";

  const dailyRecall = useDailyRecall({
    rows: visibleRows,
    blocked: dailyBlocked,
    minLibraryForUserMode: 8,
  });

  /* RENDER GATE */
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
                dailyRecallEnabled={dailyRecall.enabled}
                setDailyRecallEnabled={dailyRecall.setEnabled}
                showDailyRecallNow={dailyRecall.showNow}
              />
            </div>
          </SwipePager>
        )}
      </main>

      {/* DAILY RECALL MODAL */}
      {dailyRecall.isOpen && dailyRecall.phrase && (
        <DailyRecallModal
          phrase={dailyRecall.phrase}
          playText={playText}
          onClose={dailyRecall.close}
        />
      )}

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

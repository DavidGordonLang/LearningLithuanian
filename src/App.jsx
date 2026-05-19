import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
  useSyncExternalStore,
} from "react";

import Header from "./components/Header";
import AddForm from "./components/AddForm";
import SearchBox from "./components/SearchBox";
import HomeView from "./views/HomeView";
import SettingsView from "./views/SettingsView";
import LibraryView from "./views/LibraryView";
import ScenariosView from "./views/ScenariosView";
import ScenarioDetailView from "./views/ScenarioDetailView";
import TrainingView from "./views/TrainingView";
import DuplicateScannerView from "./views/DuplicateScannerView";
import AnalyticsView from "./views/AnalyticsView";
import ChangeLogModal from "./components/ChangeLogModal";
import UserGuideModal from "./components/UserGuideModal";
import WhatsNewModal from "./components/WhatsNewModal";
import OnboardingProfileModal from "./components/OnboardingProfileModal";
import ConfirmDialog from "./components/ConfirmDialog";
import SwipePager from "./components/SwipePager";
import ModalShell from "./components/ModalShell";

import DailyRecallModal from "./components/DailyRecallModal";
import useDailyRecall from "./hooks/useDailyRecall";

import AuthGate from "./components/AuthGate";
import BetaBlocked from "./components/BetaBlocked";

import { searchStore } from "./searchStore";
import { usePhraseStore } from "./stores/phraseStore";
import { useScenarioStore } from "./stores/scenarioStore";
import { initAuthListener, useAuthStore } from "./stores/authStore";
import { useSettingsStore } from "./stores/settingsStore";
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

import { trackEvent, trackError } from "./services/analytics";

/* ============================================================================ */
const APP_VERSION = "3.0.0-beta";

const LSK_PAGE = "lt_page";
const LSK_USER_GUIDE = "lt_seen_user_guide";
const LSK_LAST_SEEN_VERSION = "lt_last_seen_version";
const PROFILE_ONBOARDING_VERSION = 2;

const STARTERS = {
  EN2LT: "/data/starter_en_to_lt.json",
};

const STR = {
  appTitle1: "Žodis",
  appTitle2: "",
  subtitle: "",
  navHome: "Home",
  navLibrary: "Library",
  navScenarios: "Scenarios",
  navTraining: "Training",
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
  editEntry: "Edit Entry",
  delete: "Delete",
  showDetails: "Details",
  hideDetails: "Hide",
};

/* -------------------- Toast UI (stack + animation) -------------------- */

function ToastStack({ toasts, onDismiss }) {
  const visible = Array.isArray(toasts) ? toasts.slice(0, 3) : [];
  if (!visible.length) return null;

  return (
    <div className="fixed left-0 right-0 bottom-6 z-[90] flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-md space-y-2 pointer-events-auto">
        {visible.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const [show, setShow] = useState(false);
  const closeRef = useRef(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShow(true));
    const ms = typeof toast?.ms === "number" ? toast.ms : 2200;
    const timer = setTimeout(() => {
      if (closeRef.current) return;
      closeRef.current = true;
      setShow(false);
    }, ms);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [toast?.id]);

  useEffect(() => {
    if (!toast?.id) return;
    if (show) return;
    if (!closeRef.current) return;

    const t = setTimeout(() => {
      onDismiss?.(toast.id);
    }, 180);

    return () => clearTimeout(t);
  }, [show, toast?.id, onDismiss]);

  const msg = String(toast?.msg || "").trim();
  if (!msg) return null;

  return (
    <button
      type="button"
      onClick={() => {
        if (closeRef.current) return;
        closeRef.current = true;
        setShow(false);
      }}
      className={
        "w-full text-left select-none " +
        "rounded-2xl px-4 py-3 " +
        "backdrop-blur bg-zinc-900/85 " +
        "border border-zinc-700/70 " +
        "shadow-[0_12px_40px_rgba(0,0,0,0.55)] " +
        "transition-all duration-200 ease-out " +
        (show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")
      }
      aria-label="Dismiss notification"
    >
      <div className="flex items-start gap-3">
        <div
          className="
            mt-[2px]
            h-2.5 w-2.5 rounded-full
            bg-emerald-400
            shadow-[0_0_18px_rgba(52,211,153,0.55)]
            shrink-0
          "
        />
        <div className="text-sm text-zinc-100 leading-snug">{msg}</div>
      </div>

      <div className="mt-2 h-[1px] w-full bg-gradient-to-r from-emerald-400/40 via-zinc-400/10 to-transparent" />
    </button>
  );
}

/* ============================================================================ */

function AppBackground({ isLight }) {
  if (isLight) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ backgroundColor: "var(--z-bg)" }}>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 480px at 50% -100px, rgba(107,143,110,0.14), transparent 58%)," +
              "radial-gradient(700px 400px at 50% 45%, rgba(107,143,110,0.07), transparent 60%)," +
              "linear-gradient(180deg, #E4D6BC 0%, #EDE0C8 40%, #E8E0CE 100%)",
          }}
        />
      </div>
    );
  }
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ backgroundColor: "#0a0a0b" }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 50% -120px, rgba(16,185,129,0.16), rgba(0,0,0,0) 55%)," +
            "radial-gradient(900px 520px at 50% 38%, rgba(16,185,129,0.09), rgba(0,0,0,0) 62%)," +
            "linear-gradient(180deg, rgba(10,10,11,1) 0%, rgba(8,8,10,1) 45%, rgba(6,6,8,1) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 30%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.78) 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.25) 1px, rgba(0,0,0,0) 1px)",
          backgroundSize: "3px 3px",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}

function ScenarioPickerModal({
  open,
  scenarios,
  onClose,
  onPick,
  onCreateNew,
}) {
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (!open) setNewTitle("");
  }, [open]);

  if (!open) return null;

  return (
    <ModalShell
      open={open}
      title="Add to Scenario"
      subtitle="Choose an existing scenario or create a new one."
      onClose={onClose}
      zIndex="z-[120]"
    >
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {Array.isArray(scenarios) && scenarios.length > 0 ? (
              <div className="space-y-2">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    data-press
                    className="w-full text-left z-inset p-4 hover:bg-white/[0.05]"
                    onClick={() => onPick?.(scenario.id)}
                  >
                    <div className="text-sm font-semibold text-zinc-100">
                      {scenario.title}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="z-inset p-4 text-sm text-zinc-400">
                No scenarios yet. Create one below.
              </div>
            )}

            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="text-sm font-semibold text-zinc-200">
                Create new scenario
              </div>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. At a café"
                className="z-input w-full !rounded-2xl !px-4 !py-3 text-sm"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  data-press
                  className="z-btn z-btn-secondary px-4 py-2 rounded-2xl text-sm"
                  onClick={onClose}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  data-press
                  className="
                    z-btn px-5 py-2.5 rounded-2xl text-sm font-semibold
                    bg-emerald-600/90 hover:bg-emerald-500
                    border border-emerald-300/20
                    text-black
                  "
                  onClick={() => onCreateNew?.(newTitle)}
                >
                  Create and add
                </button>
              </div>
            </div>
          </div>
    </ModalShell>
  );
}

export default function App() {
  useEffect(() => {
    initAuthListener();
  }, []);

  // ── Theme: apply data-theme to <html> whenever themeMode changes ──────────
  const themeMode = useSettingsStore((s) => s.themeMode);
  const settingsLoading = useSettingsStore((s) => s.loading);
  const profileOnboardingVersion = useSettingsStore((s) => s.profileOnboardingVersion);
  const userName = useSettingsStore((s) => s.userName);
  const speakerGender = useSettingsStore((s) => s.speakerGender);
  const dateOfBirth = useSettingsStore((s) => s.dateOfBirth);
  const fromCountryCode = useSettingsStore((s) => s.fromCountryCode);
  const livesInCountryCode = useSettingsStore((s) => s.livesInCountryCode);
  const saveProfileOnboarding = useSettingsStore((s) => s.saveProfileOnboarding);
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "light") {
      root.setAttribute("data-theme", "light");
    } else if (themeMode === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      // auto: resolve against system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
  }, [themeMode]);

  const isLight = themeMode === "light" ||
    (themeMode === "auto" && !window.matchMedia("(prefers-color-scheme: dark)").matches);

  const authLoading = useAuthStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);

  const { checked: allowlistChecked, allowed: isAllowlisted } = useBetaAllowlist({
    userEmail: user?.email,
    supabase,
  });

  const [page, setPage] = useLocalStorageState(LSK_PAGE, "home");
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [libraryFocusPhraseId, setLibraryFocusPhraseId] = useState(null);

  const [scenarioPickerOpen, setScenarioPickerOpen] = useState(false);
  const [scenarioPickerSource, setScenarioPickerSource] = useState(null);
  const [pendingScenarioPhraseId, setPendingScenarioPhraseId] = useState(null);
  const [pendingScenarioTranslationPayload, setPendingScenarioTranslationPayload] =
    useState(null);

  const swipeTabs = ["home", "library", "scenarios", "training", "settings"];

  const swipeIndex = swipeTabs.includes(page)
    ? swipeTabs.indexOf(page)
    : swipeTabs.indexOf("settings");

  const [swipeProgress, setSwipeProgress] = useState(swipeIndex);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    if (page === "dupes" || page === "analytics" || page === "scenario-detail") return;
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

  const rows = usePhraseStore((s) => s.phrases);
  const setRows = usePhraseStore((s) => s.setPhrases);
  const addPhrase = usePhraseStore((s) => s.addPhrase);
  const saveEditedPhrase = usePhraseStore((s) => s.saveEditedPhrase);

  const scenarios = useScenarioStore((s) => s.scenarios);
  const createScenario = useScenarioStore((s) => s.createScenario);
  const addPhraseToScenario = useScenarioStore((s) => s.addPhraseToScenario);

  const selectedScenario = useMemo(() => {
    return (
      (Array.isArray(scenarios) ? scenarios : []).find((s) => s.id === selectedScenarioId) || null
    );
  }, [scenarios, selectedScenarioId]);

  const visibleRows = useMemo(() => rows.filter((r) => !r._deleted), [rows]);

  const T = STR;

  const [toasts, setToasts] = useState([]);
  const toastMaxRef = useRef(6);

  function showToast(msg, ms = 2200) {
    const text = String(msg || "").trim();
    if (!text) return;

    const id = Date.now() + Math.random();
    setToasts((prev) => {
      const next = [{ id, msg: text, ms }, ...(Array.isArray(prev) ? prev : [])];
      return next.slice(0, toastMaxRef.current);
    });
  }

  function dismissToast(id) {
    setToasts((prev) =>
      Array.isArray(prev) ? prev.filter((t) => t.id !== id) : []
    );
  }

  const {
    voice: azureVoiceShortName,
    setVoice: setAzureVoiceShortName,
    playText,
    preloadText,
    stop,
  } = useTTSPlayer({
    initialVoice: "lt-LT-LeonasNeural",
    maxIdbEntries: 200,
    onError: (e) => {
      try {
        trackError(e, { source: "tts_player" }, { app_version: APP_VERSION });
      } catch {}
      // Show a brief non-blocking toast rather than a blocking alert.
      // TTS failures are non-fatal — the user can tap the audio button again.
      showToast("Audio unavailable — check your connection", 3000);
    },
  });

  const playTextTracked = useCallback((text, opts) => {
    try {
      trackEvent(
        "tts_play",
        {
          voice: azureVoiceShortName,
          text_len: typeof text === "string" ? text.length : null,
        },
        { app_version: APP_VERSION }
      );
    } catch {}
    return playText(text, opts);
  }, [playText, azureVoiceShortName]);

  const preloadTextTracked = useCallback((text, opts) => {
    try {
      trackEvent(
        "tts_preload",
        {
          voice: azureVoiceShortName,
          text_len: typeof text === "string" ? text.length : null,
        },
        { app_version: APP_VERSION }
      );
    } catch {}
    return preloadText(text, opts);
  }, [preloadText, azureVoiceShortName]);

  const stopTextTracked = () => {
    try {
      trackEvent(
        "tts_stop",
        {
          voice: azureVoiceShortName,
        },
        { app_version: APP_VERSION }
      );
    } catch {}
    return stop();
  };

  useSyncExternalStore(
    searchStore.subscribe,
    searchStore.getSnapshot,
    searchStore.getServerSnapshot
  );

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

  const isEditing = editRowId != null;

  const editRow = useMemo(() => {
    if (!isEditing) return null;
    return rows.find((r) => r.id === editRowId || r._id === editRowId) || null;
  }, [isEditing, rows, editRowId]);

  const removePhraseById = async (id) => {
    if (!id) return false;
    const ok = await confirmAction({
      title: "Delete phrase?",
      body: "This will remove the phrase from your library.",
      confirmLabel: "Delete phrase",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!ok) return false;

    setRows((prev) =>
      Array.isArray(prev)
        ? prev.map((r) => {
            const rid = r?.id ?? null;
            const ruid = r?._id ?? null;

            if (rid === id || ruid === id) {
              return { ...r, _deleted: true, _ts: nowTs() };
            }
            return r;
          })
        : prev
    );
    return true;
  };

  const goToPage = (next) => {
    if (!next) return;
    startTransition(() => {
      setPage(next);
    });
  };

  function handleLogoClick() {
    setHomeResetKey((k) => k + 1);
    setSelectedScenarioId(null);
    setLibraryFocusPhraseId(null);
    goToPage("home");
  }

  function handleOpenScenario(scenarioId) {
    if (!scenarioId) return;
    setSelectedScenarioId(scenarioId);
    setPage("scenario-detail");
  }

  function handleBackFromScenarioDetail() {
    setSelectedScenarioId(null);
    setPage("scenarios");
  }

  function handleOpenPhraseInLibrary(phraseId) {
    if (!phraseId) return;
    setSelectedScenarioId(null);
    setLibraryFocusPhraseId(phraseId);
    setPage("library");
  }

  function handleLibraryFocusConsumed() {
    setLibraryFocusPhraseId(null);
  }

  function closeScenarioPicker() {
    setScenarioPickerOpen(false);
    setScenarioPickerSource(null);
    setPendingScenarioPhraseId(null);
    setPendingScenarioTranslationPayload(null);
  }

  function openScenarioPickerForTranslation(payload) {
    setScenarioPickerSource("translation");
    setPendingScenarioTranslationPayload(payload || null);
    setPendingScenarioPhraseId(null);
    setScenarioPickerOpen(true);
  }

  function openScenarioPickerForPhrase(phraseId) {
    setScenarioPickerSource("phrase");
    setPendingScenarioPhraseId(phraseId || null);
    setPendingScenarioTranslationPayload(null);
    setScenarioPickerOpen(true);
  }

  function getRowId(row) {
    return row?._id || row?.id || null;
  }

  function buildPhraseContentKeyFromLithuanian(lt) {
    return makeLtKey({ Lithuanian: String(lt || "").trim() });
  }

  function findActiveRowById(phraseId) {
    if (!phraseId) return null;

    return (
      (Array.isArray(rows) ? rows : []).find(
        (r) => !r?._deleted && getRowId(r) === phraseId
      ) || null
    );
  }

  function findActiveRowByLithuanian(lt) {
    const key = String(buildPhraseContentKeyFromLithuanian(lt)).trim();
    if (!key) return null;

    return (
      (Array.isArray(rows) ? rows : []).find((r) => {
        if (r?._deleted) return false;

        const rowKey = String(
          r?.contentKey ||
            buildPhraseContentKeyFromLithuanian(r?.Lithuanian || "")
        ).trim();

        return !!rowKey && rowKey === key;
      }) || null
    );
  }

  function findScenarioDuplicateByContent(scenarioId, candidateRow) {
    if (!scenarioId || !candidateRow) return null;

    const targetScenario =
      (Array.isArray(scenarios) ? scenarios : []).find(
        (s) => s.id === scenarioId
      ) || null;

    if (!targetScenario) return null;

    const candidateKey = String(
      candidateRow?.contentKey ||
        buildPhraseContentKeyFromLithuanian(candidateRow?.Lithuanian || "")
    ).trim();

    if (!candidateKey) return null;

    const linkedIds = Array.isArray(targetScenario.phraseIds)
      ? targetScenario.phraseIds
      : [];

    for (const linkedId of linkedIds) {
      const linkedRow = findActiveRowById(linkedId);
      if (!linkedRow) continue;

      const linkedKey = String(
        linkedRow?.contentKey ||
          buildPhraseContentKeyFromLithuanian(linkedRow?.Lithuanian || "")
      ).trim();

      if (linkedKey && linkedKey === candidateKey) {
        return linkedRow;
      }
    }

    return null;
  }

  function buildSavedRowFromTranslation(payload) {
    const lt = String(payload?.result?.ltOut || "").trim();
    const enLit = String(payload?.result?.enLiteral || "").trim();
    const enNat = String(payload?.result?.enNatural || "").trim();
    const phoEn = String(payload?.result?.phonetics || "").trim();
    const phoIpa = String(payload?.result?.phoneticsIpa || "").trim();

    if (!lt) {
      return { ok: false, error: "Could not save phrase." };
    }

    const existing = findActiveRowByLithuanian(lt);
    if (existing) {
      return { ok: true, row: existing, alreadyExisted: true };
    }

    const now = typeof nowTs === "function" ? nowTs() : Date.now();
    const id =
      typeof genId === "function"
        ? genId()
        : Math.random().toString(36).slice(2);
    const sourceLang = payload?.result?.sourceLang === "lt" ? "lt" : "en";

    const newRow = {
      _id: id,
      _ts: now,
      Sheet: "Phrases",
      Category: payload?.result?.categoryOut || "General",
      Lithuanian: lt,
      English: enNat || enLit || String(payload?.input || "").trim(),
      SourceLang: sourceLang,
      EnglishLiteral: enLit || enNat || "",
      EnglishNatural: enNat || enLit || "",
      EnglishOriginal: String(payload?.input || "").trim(),
      LithuanianOriginal: lt,
      Phonetic: phoEn,
      PhoneticIPA: phoIpa,
      Usage: String(payload?.result?.usageOut || "").trim(),
      Notes: String(payload?.result?.notesOut || "").trim(),
      "RAG Icon": "🟠",
      _qstat: {
        red: { ok: 0, bad: 0 },
        amb: { ok: 0, bad: 0 },
        grn: { ok: 0, bad: 0 },
      },
      Source: "user",
      Touched: true,
      _deleted: false,
      _deleted_ts: null,
      contentKey: buildPhraseContentKeyFromLithuanian(lt),
    };

    setRows((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return [newRow, ...arr];
    });

    return { ok: true, row: newRow, alreadyExisted: false };
  }

  function handleScenarioPick(scenarioId) {
    if (!scenarioId) return;

    if (scenarioPickerSource === "phrase") {
      const sourceRow = findActiveRowById(pendingScenarioPhraseId);

      if (!sourceRow) {
        alert("Phrase not found.");
        return;
      }

      const duplicateInScenario = findScenarioDuplicateByContent(
        scenarioId,
        sourceRow
      );

      if (duplicateInScenario) {
        alert("This phrase is already in that scenario.");
        return;
      }

      const linked = addPhraseToScenario(scenarioId, pendingScenarioPhraseId);

      if (!linked?.ok) {
        alert(linked?.error || "Could not add phrase to scenario.");
        return;
      }

      closeScenarioPicker();
      showToast("Added to scenario");
      return;
    }

    if (scenarioPickerSource === "translation") {
      const candidateLt = String(
        pendingScenarioTranslationPayload?.result?.ltOut || ""
      ).trim();

      if (!candidateLt) {
        alert("Could not save phrase.");
        return;
      }

      const duplicateInScenario = findScenarioDuplicateByContent(scenarioId, {
        Lithuanian: candidateLt,
        contentKey: buildPhraseContentKeyFromLithuanian(candidateLt),
      });

      if (duplicateInScenario) {
        alert("This phrase is already in that scenario.");
        return;
      }

      const saved = buildSavedRowFromTranslation(pendingScenarioTranslationPayload);

      if (!saved?.ok || !saved?.row) {
        alert(saved?.error || "Could not save phrase.");
        return;
      }

      const phraseId = getRowId(saved.row);
      const linked = addPhraseToScenario(scenarioId, phraseId);

      if (!linked?.ok) {
        alert(linked?.error || "Could not add phrase to scenario.");
        return;
      }

      closeScenarioPicker();
      showToast("Saved to library and added to scenario");
    }
  }

  function handleScenarioCreateAndPick(title) {
    const created = createScenario(title);

    if (!created?.ok || !created?.scenario?.id) {
      alert(created?.error || "Could not create scenario.");
      return;
    }

    handleScenarioPick(created.scenario.id);
  }

  const dailyRecall = useDailyRecall({
    rows: visibleRows,
    appVersion: APP_VERSION,
  });

  const [showChangeLog, setShowChangeLog] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [userGuideFirstLaunch, setUserGuideFirstLaunch] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showOnboardingProfile, setShowOnboardingProfile] = useState(false);
  const [confirmRequest, setConfirmRequest] = useState(null);
  const confirmResolveRef = useRef(null);

  const [seenUserGuide, setSeenUserGuide] = useLocalStorageState(
    LSK_USER_GUIDE,
    false
  );
  const [lastSeenVersion, setLastSeenVersion] = useLocalStorageState(
    LSK_LAST_SEEN_VERSION,
    ""
  );

  const hasSeenUserGuide = seenUserGuide === true || seenUserGuide === "true" || seenUserGuide === "1";
  const needsProfileOnboarding =
    !!user?.id &&
    !settingsLoading &&
    Number(profileOnboardingVersion || 0) < PROFILE_ONBOARDING_VERSION;

  useEffect(() => {
    if (settingsLoading || needsProfileOnboarding || showOnboardingProfile || showUserGuide) return;
    if (user?.id && !hasSeenUserGuide) return;
    if (!lastSeenVersion) {
      setShowWhatsNew(true);
      setLastSeenVersion(APP_VERSION);
      return;
    }
    if (lastSeenVersion !== APP_VERSION) {
      setShowWhatsNew(true);
      setLastSeenVersion(APP_VERSION);
    }
  }, [lastSeenVersion, setLastSeenVersion, settingsLoading, needsProfileOnboarding, showOnboardingProfile, showUserGuide, user?.id, hasSeenUserGuide]);

  useEffect(() => {
    if (!user?.id || settingsLoading) return;
    if (!needsProfileOnboarding) return;
    setShowWhatsNew(false);
    setShowUserGuide(false);
    setShowOnboardingProfile(true);
  }, [needsProfileOnboarding, settingsLoading, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    if (settingsLoading || needsProfileOnboarding || showOnboardingProfile) return;
    if (hasSeenUserGuide) return;
    setUserGuideFirstLaunch(true);
    setShowUserGuide(true);
  }, [user?.id, settingsLoading, needsProfileOnboarding, showOnboardingProfile, hasSeenUserGuide]);

  const saveOnboardingProfile = useCallback(async (values) => {
    await saveProfileOnboarding?.(user?.id, values, PROFILE_ONBOARDING_VERSION);
    setShowOnboardingProfile(false);
    showToast("Profile setup saved");
  }, [
    saveProfileOnboarding,
    user?.id,
  ]);

  const closeUserGuide = useCallback(() => {
    if (userGuideFirstLaunch) {
      setSeenUserGuide(true);
      setUserGuideFirstLaunch(false);
    }
    setShowUserGuide(false);
  }, [setSeenUserGuide, userGuideFirstLaunch]);

  const closeConfirm = useCallback((result) => {
    const resolve = confirmResolveRef.current;
    confirmResolveRef.current = null;
    setConfirmRequest(null);
    resolve?.(result);
  }, []);

  const confirmAction = useCallback((options = {}) => {
    if (confirmResolveRef.current) {
      confirmResolveRef.current(false);
    }

    setConfirmRequest(options || {});

    return new Promise((resolve) => {
      confirmResolveRef.current = resolve;
    });
  }, []);

  const hasConfirmOpen = !!confirmRequest;

  useModalScrollLock(
    showChangeLog || showUserGuide || showWhatsNew || showOnboardingProfile || addOpen || scenarioPickerOpen || hasConfirmOpen
  );
  useAppBodyScrollLock(
    showChangeLog || showUserGuide || showWhatsNew || showOnboardingProfile || addOpen || scenarioPickerOpen || hasConfirmOpen
  );

  const headerPage =
    page === "dupes" || page === "analytics"
      ? "settings"
      : page === "scenario-detail"
      ? "scenarios"
      : swipeTabs.includes(page)
      ? page
      : "scenarios";

  if (authLoading || !allowlistChecked) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-sm text-zinc-400">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  if (!isAllowlisted) {
    return <BetaBlocked />;
  }

  return (
    <div className="relative min-h-[100dvh] h-[100dvh] text-zinc-100 flex flex-col overflow-hidden" style={{ backgroundColor: "var(--z-bg)" }}>
      <AppBackground isLight={isLight} />

      <Header
        ref={headerRef}
        T={T}
        page={headerPage}
        setPage={(next) => {
          setSelectedScenarioId(null);
          setLibraryFocusPhraseId(null);
          goToPage(next);
        }}
        onLogoClick={handleLogoClick}
        swipeProgress={swipeProgress}
        isSwiping={isSwiping}
      />

      <main
        className="flex-1 overflow-hidden relative"
        style={{ height: `calc(100dvh - ${headerHeight}px)` }}
      >
        {page === "dupes" ? (
          <div className="h-full overflow-y-auto overscroll-contain">
            <div className="z-page z-page-y">
              <DuplicateScannerView
                T={T}
                rows={visibleRows}
                removePhrase={removePhraseById}
                onBack={() => goToPage("settings")}
              />
            </div>
          </div>
        ) : page === "analytics" ? (
          <div className="h-full overflow-y-auto overscroll-contain">
            <div className="z-page z-page-y">
              <AnalyticsView
                appVersion={APP_VERSION}
                onBack={() => goToPage("settings")}
              />
            </div>
          </div>
        ) : page === "scenario-detail" ? (
          <div className="h-full overflow-y-auto overscroll-contain">
            <div className="z-page z-page-y">
              <ScenarioDetailView
                T={T}
                scenario={selectedScenario}
                rows={visibleRows}
                playText={playTextTracked}
                onBack={handleBackFromScenarioDetail}
                onOpenPhraseInLibrary={handleOpenPhraseInLibrary}
                showToast={showToast}
              />
            </div>
          </div>
        ) : (
          <SwipePager
            index={swipeIndex}
            onIndexChange={(i) => goToPage(swipeTabs[i])}
            onProgress={(p, dragging) => {
              const clamped = Math.max(-0.25, Math.min(4.25, p));
              setSwipeProgress(clamped);
              setIsSwiping(!!dragging);
            }}
          >
            <div className="h-full">
              <HomeView
                key={homeResetKey}
                playText={playTextTracked}
                setRows={setRows}
                genId={genId}
                nowTs={nowTs}
                showToast={showToast}
                rows={visibleRows}
                onOpenAddForm={() => {
                  setEditRowId(null);
                  setAddOpen(true);
                }}
                onOpenScenarioPickerForTranslation={openScenarioPickerForTranslation}
              />
            </div>

            <div className="h-full">
              <LibraryView
                T={T}
                rows={visibleRows}
                setRows={setRows}
                normalizeRag={normalizeRag}
                playText={playTextTracked}
                SearchBox={SearchBox}
                searchPlaceholder={T.search}
                removePhrase={removePhraseById}
                onEditRow={(id) => {
                  setEditRowId(id);
                  setAddOpen(true);
                }}
                onOpenAddForm={() => {
                  setEditRowId(null);
                  setAddOpen(true);
                }}
                onOpenScenarioPickerForPhrase={openScenarioPickerForPhrase}
                focusPhraseId={libraryFocusPhraseId}
                onFocusPhraseHandled={handleLibraryFocusConsumed}
              />
            </div>

            <div className="h-full">
              <ScenariosView
                T={T}
                onOpenScenario={handleOpenScenario}
                confirmAction={confirmAction}
              />
            </div>

            <div className="h-full overflow-y-auto overscroll-contain">
              <TrainingView
                T={T}
                rows={visibleRows}
                setRows={setRows}
                playText={playTextTracked}
                preloadText={preloadTextTracked}
                stopText={stopTextTracked}
                showToast={showToast}
              />
            </div>

            <div className="h-full">
             <SettingsView
  T={T}
  appVersion={APP_VERSION}
  azureVoiceShortName={azureVoiceShortName}
  setAzureVoiceShortName={setAzureVoiceShortName}
  playText={playTextTracked}
  fetchStarter={fetchStarter}
  clearLibrary={clearLibrary}
  importJsonFile={importJsonFile}
  rows={rows}
  onOpenDuplicateScanner={() => goToPage("dupes")}
  onOpenChangeLog={() => setShowChangeLog(true)}
  onOpenUserGuide={() => {
    setUserGuideFirstLaunch(false);
    setShowUserGuide(true);
  }}
  onOpenOnboardingProfile={() => setShowOnboardingProfile(true)}
  onOpenAnalytics={() => goToPage("analytics")}
  dailyRecallEnabled={dailyRecall.enabled}
  setDailyRecallEnabled={dailyRecall.setEnabled}
  showDailyRecallNow={dailyRecall.showNow}
  showToast={showToast}
  confirmAction={confirmAction}
/>
            </div>
          </SwipePager>
        )}
      </main>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {dailyRecall.isOpen && dailyRecall.phrase && (
        <DailyRecallModal
          phrase={dailyRecall.phrase}
          playText={playTextTracked}
          onClose={dailyRecall.close}
        />
      )}

      {scenarioPickerOpen ? (
        <ScenarioPickerModal
          open={scenarioPickerOpen}
          scenarios={scenarios}
          onClose={closeScenarioPicker}
          onPick={handleScenarioPick}
          onCreateNew={handleScenarioCreateAndPick}
        />
      ) : null}

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
              className="w-full max-w-2xl z-card shadow-2xl overflow-y-auto flex flex-col"
              style={{ height: `calc(100dvh - ${headerHeight + 32}px)` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 pb-3 border-b border-white/10 shrink-0">
                <h3 className="z-title">
                  {isEditing ? T.editEntry : T.addEntry}
                </h3>
              </div>

              <div className="p-5 pt-4 flex-1 min-h-0">
                <AddForm
                  T={T}
                  genId={genId}
                  nowTs={nowTs}
                  normalizeRag={normalizeRag}
                  mode={isEditing ? "edit" : "add"}
                  initialRow={editRow}
                  onSubmit={(row) => {
                    if (isEditing) saveEditedPhrase(row);
                    else addPhrase(row);

                    setAddOpen(false);
                    setEditRowId(null);
                    showToast(isEditing ? "Saved" : "Added");
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

      {showChangeLog && (
        <ChangeLogModal
          appVersion={APP_VERSION}
          onClose={() => setShowChangeLog(false)}
        />
      )}

      <OnboardingProfileModal
        open={showOnboardingProfile}
        required={needsProfileOnboarding}
        initialValues={{
          userName,
          speakerGender,
          dateOfBirth,
          fromCountryCode,
          livesInCountryCode,
        }}
        onSave={saveOnboardingProfile}
        onClose={() => setShowOnboardingProfile(false)}
      />

      {showUserGuide && (
        <UserGuideModal
          firstLaunch={userGuideFirstLaunch}
          onClose={closeUserGuide}
        />
      )}

      {showWhatsNew && (
        <WhatsNewModal
          version={APP_VERSION}
          onClose={() => setShowWhatsNew(false)}
          onViewChangelog={() => {
            setShowWhatsNew(false);
            setShowChangeLog(true);
          }}
        />
      )}

      <ConfirmDialog
        open={hasConfirmOpen}
        title={confirmRequest?.title}
        body={confirmRequest?.body}
        confirmLabel={confirmRequest?.confirmLabel}
        cancelLabel={confirmRequest?.cancelLabel}
        destructive={!!confirmRequest?.destructive}
        onConfirm={() => closeConfirm(true)}
        onCancel={() => closeConfirm(false)}
      />
    </div>
  );
}

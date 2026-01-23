import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { usePhraseStore } from "../stores/phraseStore";
import {
  replaceUserPhrases,
  fetchUserPhrases,
  mergeUserPhrases,
} from "../stores/supabasePhrases";
import ConflictReviewModal from "../components/ConflictReviewModal";
import applyMergeResolutions from "../utils/applyMergeResolutions";

import {
  getDiagnosticsEnabled,
  setDiagnosticsEnabled,
  trackEvent,
  trackError,
} from "../services/analytics";

const ADMIN_EMAILS = ["davidgordonlang@gmail.com"];

/* ------------------------------
   Small helpers (UI-only)
   ------------------------------ */
const cn = (...xs) => xs.filter(Boolean).join(" ");

function SectionHeader({ title, subtitle, accent = false }) {
  return (
    <div className="px-1">
      <div
        className={cn(
          "text-[20px] sm:text-[22px] font-semibold tracking-tight",
          accent ? "text-emerald-200" : "text-zinc-100"
        )}
      >
        {title}
      </div>
      {subtitle ? (
        <div className="mt-1 text-[13px] sm:text-[14px] text-zinc-400 leading-snug">
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Collapsible panel:
 * - Title/subtitle are OUTSIDE (render style)
 * - The content is the soft card
 */
function CollapsibleSection({
  id,
  title,
  subtitle,
  open,
  setOpen,
  children,
  accentTitle,
  defaultOpen = false,
}) {
  // if no controlled state passed, fallback to internal
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = typeof open === "boolean" ? open : internalOpen;
  const toggle = () => {
    if (typeof setOpen === "function") setOpen(!isOpen);
    else setInternalOpen((v) => !v);
  };

  return (
    <section className="space-y-3">
      <button
        type="button"
        data-press
        onClick={toggle}
        className="w-full text-left"
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <div className="flex items-start justify-between gap-4">
          <SectionHeader title={title} subtitle={subtitle} accent={!!accentTitle} />
          <div
            className={cn(
              "shrink-0 mt-[2px] rounded-full",
              "h-9 w-9 flex items-center justify-center",
              "border border-white/10 bg-white/[0.04]",
              "text-zinc-200"
            )}
            aria-hidden="true"
          >
            <span className={cn("transition-transform", isOpen ? "rotate-180" : "")}>⌄</span>
          </div>
        </div>
      </button>

      {isOpen ? (
        <div
          id={id}
          className={cn(
            "z-card",
            "p-4 sm:p-5",
            "space-y-4"
          )}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}

export default function SettingsView({
  T,
  appVersion,
  azureVoiceShortName,
  setAzureVoiceShortName,
  playText,
  fetchStarter,
  clearLibrary,
  importJsonFile,
  rows,
  onOpenDuplicateScanner,
  onOpenChangeLog,
  onOpenUserGuide,
  onOpenAnalytics,

  dailyRecallEnabled,
  setDailyRecallEnabled,
  showDailyRecallNow,
}) {
  const { user, loading, signInWithGoogle, signOut } = useAuthStore();
  const setRows = usePhraseStore((s) => s.setPhrases);

  const [syncingUp, setSyncingUp] = useState(false);
  const [syncingDown, setSyncingDown] = useState(false);
  const [merging, setMerging] = useState(false);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [syncDirty, setSyncDirty] = useState(false);
  const [lastSyncLabel, setLastSyncLabel] = useState("");
  const [lastSyncAt, setLastSyncAt] = useState(null);

  // Conflict flow
  const [pendingConflicts, setPendingConflicts] = useState([]);
  const [pendingMergedRows, setPendingMergedRows] = useState([]);
  const [showConflictModal, setShowConflictModal] = useState(false);

  // Diagnostics toggle (local)
  const [diagnosticsOn, setDiagnosticsOn] = useState(() => getDiagnosticsEnabled());

  // Collapsible section state (per your preference)
  // Voice + Learning open by default. Others collapsed.
  const [openLearning, setOpenLearning] = useState(true);
  const [openVoice, setOpenVoice] = useState(true);
  const [openAccount, setOpenAccount] = useState(false);
  const [openData, setOpenData] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);
  const [openDiagnostics, setOpenDiagnostics] = useState(false);

  const isAdmin =
    !!user?.email &&
    ADMIN_EMAILS.map((e) => String(e).toLowerCase()).includes(String(user.email).toLowerCase());

  const getAllStoredPhrases = () => usePhraseStore.getState().phrases || [];

  const lastHashRef = useRef("");

  const localHash = useMemo(() => {
    try {
      const all = getAllStoredPhrases();
      const sig = all
        .map(
          (r) =>
            `${r?._id || ""}|${r?.contentKey || ""}|${r?._ts || 0}|${r?._deleted ? 1 : 0}`
        )
        .join("~");
      return String(sig.length) + ":" + String(sig.slice(0, 200));
    } catch {
      return "0:";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows?.length]);

  useEffect(() => {
    if (!lastHashRef.current) {
      lastHashRef.current = localHash;
      return;
    }

    if (localHash !== lastHashRef.current) {
      lastHashRef.current = localHash;
      setSyncDirty(true);
      setLastSyncLabel("");
      setLastSyncAt(null);
    }
  }, [localHash]);

  function markSynced(label) {
    setSyncDirty(false);
    setLastSyncLabel(label);
    setLastSyncAt(Date.now());
    lastHashRef.current = localHash;
  }

  function formatWhen(ts) {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return d.toLocaleString();
    } catch {
      return "";
    }
  }

  function exportJson() {
    const allPhrases = getAllStoredPhrases();

    const blob = new Blob([JSON.stringify(allPhrases, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zodis-library.json";
    a.click();
    URL.revokeObjectURL(url);

    try {
      trackEvent("export_json", {}, { app_version: appVersion });
    } catch {}
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importJsonFile(file);
      alert("Imported ✅");
      try {
        trackEvent("import_json", {}, { app_version: appVersion });
      } catch {}
    } catch (err) {
      try {
        trackError(err, { source: "import_json" }, { app_version: appVersion });
      } catch {}
      alert("Import failed: " + (err?.message || "Unknown error"));
    } finally {
      e.target.value = "";
    }
  }

  async function uploadLibraryToCloud() {
    if (!user) return;

    const ok = window.confirm(
      "Upload (overwrite):\n\nThis will REPLACE your cloud library with your local library.\n\nContinue?"
    );
    if (!ok) return;

    try {
      setSyncingUp(true);
      try {
        trackEvent("sync_upload_start", {}, { app_version: appVersion });
      } catch {}

      const allPhrases = getAllStoredPhrases();
      await replaceUserPhrases(allPhrases);
      markSynced("Uploaded");

      try {
        trackEvent("sync_upload_complete", { rows: allPhrases.length }, { app_version: appVersion });
      } catch {}

      alert("Uploaded to cloud ✅");
    } catch (e) {
      try {
        trackError(e, { source: "sync_upload" }, { app_version: appVersion });
      } catch {}
      alert("Upload failed: " + (e?.message || "Unknown error"));
    } finally {
      setSyncingUp(false);
    }
  }

  async function downloadLibraryFromCloud() {
    if (!user) return;

    const ok = window.confirm(
      "Download (overwrite):\n\nThis will REPLACE your entire local library with the cloud version.\n\nContinue?"
    );
    if (!ok) return;

    try {
      setSyncingDown(true);
      try {
        trackEvent("sync_download_start", {}, { app_version: appVersion });
      } catch {}

      const cloudRows = await fetchUserPhrases();
      setRows(cloudRows);
      markSynced("Downloaded");

      try {
        trackEvent("sync_download_complete", { rows: cloudRows.length }, { app_version: appVersion });
      } catch {}

      alert(`Downloaded ${cloudRows.length} entries ✅`);
    } catch (e) {
      try {
        trackError(e, { source: "sync_download" }, { app_version: appVersion });
      } catch {}
      alert("Download failed: " + (e?.message || "Unknown error"));
    } finally {
      setSyncingDown(false);
    }
  }

  async function mergeLibraryWithCloud() {
    if (!user) return;

    try {
      if (pendingConflicts.length) {
        try {
          trackEvent("sync_conflicts_review_open", {}, { app_version: appVersion });
        } catch {}
        setShowConflictModal(true);
        return;
      }

      setMerging(true);

      try {
        trackEvent("sync_merge_start", {}, { app_version: appVersion });
      } catch {}

      const localAll = getAllStoredPhrases();
      const result = await mergeUserPhrases(localAll);

      if (result.conflicts?.length) {
        try {
          trackEvent(
            "sync_conflicts_found",
            { count: result.conflicts.length },
            { app_version: appVersion }
          );
        } catch {}

        setPendingConflicts(result.conflicts);
        setPendingMergedRows(result.mergedRows || []);
        setShowConflictModal(true);
        return;
      }

      setRows(result.mergedRows);
      markSynced("Synced");

      try {
        trackEvent(
          "sync_merge_complete",
          { rows: result.mergedRows?.length || 0 },
          { app_version: appVersion }
        );
      } catch {}

      alert("Sync completed ✅");
    } catch (e) {
      try {
        trackError(e, { source: "sync_merge" }, { app_version: appVersion });
      } catch {}
      alert("Sync failed: " + (e?.message || "Unknown error"));
    } finally {
      setMerging(false);
    }
  }

  async function finishConflictSync(resolutions) {
    if (!user) return;

    if (!pendingMergedRows.length || !pendingConflicts.length) {
      setShowConflictModal(false);
      return;
    }

    try {
      setMerging(true);

      try {
        trackEvent(
          "sync_conflicts_finish_start",
          { count: pendingConflicts.length },
          { app_version: appVersion }
        );
      } catch {}

      const finalRows = applyMergeResolutions(pendingMergedRows, pendingConflicts, resolutions);

      await replaceUserPhrases(finalRows);

      setRows(finalRows);
      markSynced("Synced");

      setPendingConflicts([]);
      setPendingMergedRows([]);
      setShowConflictModal(false);

      try {
        trackEvent(
          "sync_conflicts_finish_complete",
          { rows: finalRows.length },
          { app_version: appVersion }
        );
      } catch {}

      alert("Sync completed ✅");
    } catch (e) {
      try {
        trackError(e, { source: "sync_conflicts_finish" }, { app_version: appVersion });
      } catch {}
      alert("Finish sync failed: " + (e?.message || "Unknown error"));
    } finally {
      setMerging(false);
    }
  }

  const syncBanner = (() => {
    if (!user) return null;

    if (pendingConflicts.length) {
      return (
        <div className="z-inset p-4 border border-amber-500/25 bg-amber-950/20">
          <div className="text-sm font-semibold text-amber-300">Sync paused</div>
          <div className="text-sm text-zinc-300 mt-1">
            {pendingConflicts.length} conflict(s) found. Review to finish syncing.
          </div>
          <div className="mt-3">
            <button
              type="button"
              data-press
              className="
                z-btn px-4 py-2 rounded-2xl text-sm
                bg-amber-500/90 hover:bg-amber-400
                border border-amber-300/20
                text-black font-semibold
              "
              onClick={() => {
                try {
                  trackEvent("sync_conflicts_review_open", {}, { app_version: appVersion });
                } catch {}
                setShowConflictModal(true);
              }}
            >
              Review conflicts
            </button>
          </div>
        </div>
      );
    }

    if (syncDirty) {
      return (
        <div className="z-inset p-4 border border-amber-500/25 bg-amber-950/20">
          <div className="text-sm font-semibold text-amber-300">Not synced</div>
          <div className="text-sm text-zinc-300 mt-1">
            Changes on this device haven’t been synced to cloud yet. Use{" "}
            <span className="text-amber-200 font-semibold">Sync (merge)</span> when you’re ready.
          </div>
        </div>
      );
    }

    if (lastSyncLabel) {
      return (
        <div className="z-inset p-4 border border-emerald-500/20 bg-emerald-950/15">
          <div className="text-sm font-semibold text-emerald-300">{lastSyncLabel}</div>
          {lastSyncAt ? (
            <div className="text-sm text-zinc-300 mt-1">{formatWhen(lastSyncAt)}</div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="z-inset p-4">
        <div className="text-sm font-semibold text-zinc-200">Sync status</div>
        <div className="text-sm text-zinc-400 mt-1">
          Use <span className="text-zinc-200 font-semibold">Sync (merge)</span> to keep devices
          aligned.
        </div>
      </div>
    );
  })();

  async function handleClearLibrary() {
    const ok = window.confirm("Clear your entire local library? This cannot be undone.");
    if (!ok) return;
    try {
      await clearLibrary?.();
      alert("Cleared ✅");
      try {
        trackEvent("library_clear", {}, { app_version: appVersion });
      } catch {}
    } catch (e) {
      try {
        trackError(e, { source: "library_clear" }, { app_version: appVersion });
      } catch {}
      alert("Could not clear: " + (e?.message || "Unknown error"));
    }
  }

  return (
    <div className="z-page z-page-y pb-28 space-y-8">
      <ConflictReviewModal
        open={showConflictModal}
        conflicts={pendingConflicts}
        onClose={() => setShowConflictModal(false)}
        onFinish={finishConflictSync}
      />

      {/* PAGE HEADER (no box) */}
      <div className="pt-2">
        <h2 className="text-[28px] sm:text-[30px] font-semibold tracking-tight text-zinc-100">
          {T?.navSettings || "Settings"}
        </h2>
        <p className="text-[14px] sm:text-[15px] text-zinc-400 mt-1">
          Account, voice, data, and diagnostics.
        </p>
      </div>

      {/* LEARNING (open by default) */}
      <CollapsibleSection
        id="sec-learning"
        title="Learning"
        subtitle="Light daily recall and learning aids."
        open={openLearning}
        setOpen={setOpenLearning}
        accentTitle
      >
        <div className="space-y-3">
          <div className="z-inset p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-zinc-200">Daily Recall</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Show one saved phrase when you open the app
                </div>
              </div>

              <button
                type="button"
                data-press
                className={
                  "z-btn px-4 py-2 rounded-2xl text-sm font-semibold " +
                  (dailyRecallEnabled
                    ? "bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black"
                    : "z-btn-secondary text-zinc-100")
                }
                onClick={() => setDailyRecallEnabled?.(!dailyRecallEnabled)}
              >
                {dailyRecallEnabled ? "On" : "Off"}
              </button>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                data-press
                className="z-btn z-btn-secondary px-4 py-2 rounded-2xl text-sm"
                onClick={showDailyRecallNow}
              >
                Show today’s recall
              </button>
            </div>
          </div>

          <div className="z-inset p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-zinc-200">Starter Pack</div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Adds the starter library to this device
                </div>
              </div>

              <button
                type="button"
                data-press
                className="
                  z-btn px-4 py-2 rounded-2xl
                  bg-emerald-600/90 hover:bg-emerald-500
                  border border-emerald-300/20
                  text-black font-semibold
                "
                onClick={() => {
                  try {
                    trackEvent("starter_install", {}, { app_version: appVersion });
                  } catch {}
                  fetchStarter?.("EN2LT");
                }}
              >
                Install
              </button>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* VOICE (open by default) */}
      <CollapsibleSection
        id="sec-voice"
        title="Voice"
        subtitle="Text-to-speech voice for Lithuanian audio."
        open={openVoice}
        setOpen={setOpenVoice}
        accentTitle
      >
        <div className="z-inset p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-zinc-300">Voice</div>
            <select
              className="z-input !py-2 !px-3 !rounded-2xl w-auto"
              value={azureVoiceShortName}
              onChange={(e) => setAzureVoiceShortName(e.target.value)}
            >
              <option value="lt-LT-LeonasNeural">Leonas (male)</option>
              <option value="lt-LT-OnaNeural">Ona (female)</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              data-press
              className="
                z-btn px-4 py-2 rounded-2xl
                bg-emerald-600/90 hover:bg-emerald-500
                border border-emerald-300/20
                text-black font-semibold
              "
              onClick={() => playText("Sveiki!")}
            >
              Play sample
            </button>
          </div>
        </div>
      </CollapsibleSection>

      {/* ACCOUNT & SYNC */}
      <CollapsibleSection
        id="sec-account"
        title="Account"
        subtitle={user ? String(user.email) : "Sign in to enable cloud sync."}
        open={openAccount}
        setOpen={setOpenAccount}
      >
        {syncBanner}

        <div className="flex flex-wrap gap-3">
          {!user ? (
            <button
              type="button"
              data-press
              className={
                "z-btn px-5 py-3 rounded-2xl font-semibold " +
                (loading ? "z-disabled " : "") +
                "bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black"
              }
              onClick={signInWithGoogle}
              disabled={loading}
            >
              {loading ? "Loading…" : "Sign in with Google"}
            </button>
          ) : (
            <>
              <button
                type="button"
                data-press
                className={
                  "z-btn px-5 py-3 rounded-2xl font-semibold " +
                  (merging ? "z-disabled " : "") +
                  "bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black"
                }
                onClick={mergeLibraryWithCloud}
                disabled={merging}
              >
                {merging ? "Syncing…" : "Sync (merge)"}
              </button>

              <button
                type="button"
                data-press
                className="z-btn z-btn-secondary px-5 py-3 rounded-2xl"
                onClick={signOut}
              >
                Sign out
              </button>
            </>
          )}
        </div>

        {user ? (
          <button
            type="button"
            data-press
            className="text-xs text-zinc-400 underline underline-offset-4"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? "Hide advanced sync options" : "Show advanced sync options"}
          </button>
        ) : null}

        {user && showAdvanced ? (
          <div className="z-inset p-4 space-y-3">
            <div className="text-sm text-zinc-300">
              Advanced options overwrite one side completely. Use carefully.
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                data-press
                className={
                  "z-btn px-5 py-3 rounded-2xl bg-white/[0.06] text-zinc-100 border border-white/10 " +
                  (syncingUp || syncingDown || merging ? "z-disabled" : "")
                }
                onClick={uploadLibraryToCloud}
                disabled={syncingUp || syncingDown || merging}
              >
                {syncingUp ? "Uploading…" : "Upload (overwrite)"}
              </button>

              <button
                type="button"
                data-press
                className={
                  "z-btn px-5 py-3 rounded-2xl bg-white/[0.06] text-zinc-100 border border-white/10 " +
                  (syncingUp || syncingDown || merging ? "z-disabled" : "")
                }
                onClick={downloadLibraryFromCloud}
                disabled={syncingUp || syncingDown || merging}
              >
                {syncingDown ? "Downloading…" : "Download (overwrite)"}
              </button>
            </div>
          </div>
        ) : null}
      </CollapsibleSection>

      {/* DATA */}
      <CollapsibleSection
        id="sec-data"
        title="Data & Advanced"
        subtitle="Export/import, duplicates, and destructive actions."
        open={openData}
        setOpen={setOpenData}
      >
        <div className="space-y-4">
          <div className="z-inset p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <input
                type="file"
                accept="application/json"
                onChange={handleImportFile}
                className="text-sm text-zinc-300"
              />

              <button
                type="button"
                data-press
                className="z-btn z-btn-secondary px-4 py-2 rounded-2xl text-sm"
                onClick={exportJson}
              >
                Export JSON (file)
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              data-press
              className="z-btn z-btn-secondary px-5 py-3 rounded-2xl justify-center"
              onClick={onOpenDuplicateScanner}
            >
              Duplicate scanner
            </button>

            <button
              type="button"
              data-press
              className="z-btn px-5 py-3 rounded-2xl justify-center bg-rose-500/15 border border-rose-400/20 text-rose-100 hover:bg-rose-500/20"
              onClick={handleClearLibrary}
            >
              Clear library
            </button>
          </div>
        </div>
      </CollapsibleSection>

      {/* ABOUT + ADMIN */}
      <CollapsibleSection
        id="sec-about"
        title="About"
        subtitle={`Version ${appVersion}`}
        open={openAbout}
        setOpen={setOpenAbout}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            data-press
            className="z-btn z-btn-secondary px-5 py-3 rounded-2xl justify-center"
            onClick={onOpenUserGuide}
          >
            User Guide
          </button>

          <button
            type="button"
            data-press
            className="z-btn z-btn-secondary px-5 py-3 rounded-2xl justify-center"
            onClick={onOpenChangeLog}
          >
            Change log
          </button>

          {isAdmin ? (
            <button
              type="button"
              data-press
              className="
                z-btn px-5 py-3 rounded-2xl
                bg-emerald-600/90 hover:bg-emerald-500
                border border-emerald-300/20
                text-black font-semibold
                sm:col-span-2
              "
              onClick={() => onOpenAnalytics?.()}
            >
              Analytics (admin)
            </button>
          ) : null}
        </div>
      </CollapsibleSection>

      {/* DIAGNOSTICS (quiet, collapsed by default) */}
      <CollapsibleSection
        id="sec-diagnostics"
        title="Diagnostics"
        subtitle="Anonymous usage + error reporting during beta."
        open={openDiagnostics}
        setOpen={setOpenDiagnostics}
      >
        <p className="text-sm text-zinc-400 leading-relaxed">
          During beta, we track basic usage (screens and feature clicks) and collect error reports.
          This helps improve stability and understand what people actually use. We do{" "}
          <span className="text-zinc-200 font-semibold">not</span> collect your phrase content.
        </p>

        <div className="z-inset p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-zinc-200">
                Share anonymous diagnostics
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Usage + errors (no phrase content)
              </div>
            </div>

            <button
              type="button"
              data-press
              className={
                "z-btn px-4 py-2 rounded-2xl text-sm font-semibold " +
                (diagnosticsOn
                  ? "bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black"
                  : "z-btn-secondary text-zinc-100")
              }
              onClick={() => {
                const next = !diagnosticsOn;
                setDiagnosticsOn(next);
                setDiagnosticsEnabled(next);

                try {
                  trackEvent(
                    "diagnostics_toggle",
                    { enabled: next ? 1 : 0 },
                    { app_version: appVersion }
                  );
                } catch {}
              }}
            >
              {diagnosticsOn ? "On" : "Off"}
            </button>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
// src/views/SettingsView.jsx
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

  const getAllStoredPhrases = () => usePhraseStore.getState().phrases || [];

  const lastHashRef = useRef("");

  const localHash = useMemo(() => {
    try {
      const all = getAllStoredPhrases();
      const sig = all
        .map(
          (r) =>
            `${r?._id || ""}|${r?.contentKey || ""}|${r?._ts || 0}|${
              r?._deleted ? 1 : 0
            }`
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
        trackEvent(
          "sync_upload_complete",
          { rows: allPhrases.length },
          { app_version: appVersion }
        );
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
        trackEvent(
          "sync_download_complete",
          { rows: cloudRows.length },
          { app_version: appVersion }
        );
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
      // If already paused, just reopen review UI
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

        // Pause: store conflicts + proposed merged rows, open review immediately
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

    // If state somehow got cleared, just close modal safely
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

      const finalRows = applyMergeResolutions(
        pendingMergedRows,
        pendingConflicts,
        resolutions
      );

      // Now that user has decided, it is safe to write
      await replaceUserPhrases(finalRows);

      setRows(finalRows);
      markSynced("Synced");

      // Clear paused state
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
        <div className="rounded-xl border border-amber-700 bg-amber-950/30 px-4 py-3 text-sm space-y-2">
          <div className="font-semibold text-amber-300">Sync paused</div>
          <div className="text-zinc-300">
            {pendingConflicts.length} conflict(s) found. Review to finish syncing.
          </div>
          <button
            type="button"
            className="bg-amber-500 text-black rounded-full px-4 py-1.5 text-xs font-semibold"
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
      );
    }

    if (syncDirty) {
      return (
        <div className="rounded-xl border border-amber-700 bg-amber-950/30 px-4 py-3 text-sm">
          <div className="font-semibold text-amber-300">Not synced</div>
          <div className="text-zinc-300 mt-1">
            Changes on this device haven’t been synced to cloud yet. Use{" "}
            <span className="text-amber-200 font-semibold">Sync (merge)</span>{" "}
            when you’re ready.
          </div>
        </div>
      );
    }

    if (lastSyncLabel) {
      return (
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/20 px-4 py-3 text-sm">
          <div className="font-semibold text-emerald-300">{lastSyncLabel}</div>
          {lastSyncAt ? (
            <div className="text-zinc-300 mt-1">{formatWhen(lastSyncAt)}</div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 px-4 py-3 text-sm">
        <div className="font-semibold text-zinc-200">Sync status</div>
        <div className="text-zinc-400 mt-1">
          Use <span className="text-zinc-200 font-semibold">Sync (merge)</span>{" "}
          to keep devices aligned.
        </div>
      </div>
    );
  })();

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28 space-y-8">
      <ConflictReviewModal
        open={showConflictModal}
        conflicts={pendingConflicts}
        onClose={() => setShowConflictModal(false)}
        onFinish={finishConflictSync}
      />

      {/* DIAGNOSTICS */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Diagnostics</div>
        <p className="text-sm text-zinc-400">
          During beta, we track basic usage (screens and feature clicks) and collect error reports.
          This helps improve stability and understand what people actually use.
          We do <span className="text-zinc-200 font-semibold">not</span> collect your phrase content.
        </p>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 px-4 py-3">
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
              className={
                "px-4 py-2 rounded-full text-sm font-semibold select-none transition " +
                (diagnosticsOn
                  ? "bg-emerald-500 text-black hover:bg-emerald-400 active:bg-emerald-300"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 active:bg-zinc-600")
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
      </section>

      {/* DAILY RECALL */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Daily Recall</div>
        <p className="text-sm text-zinc-400">
          Show one saved phrase when you open the app. Designed for light recall,
          not streaks.
        </p>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 px-4 py-3 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-zinc-200">
                Daily reminder phrase
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">Once per day</div>
            </div>

            <button
              type="button"
              className={
                "px-4 py-2 rounded-full text-sm font-semibold select-none transition " +
                (dailyRecallEnabled
                  ? "bg-emerald-500 text-black hover:bg-emerald-400 active:bg-emerald-300"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 active:bg-zinc-600")
              }
              onClick={() => setDailyRecallEnabled?.(!dailyRecallEnabled)}
            >
              {dailyRecallEnabled ? "On" : "Off"}
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="
                bg-zinc-800 text-zinc-200 rounded-full
                px-4 py-2 text-sm font-medium
                hover:bg-zinc-700 active:bg-zinc-600
                select-none
              "
              onClick={showDailyRecallNow}
            >
              Show today’s recall
            </button>
          </div>
        </div>
      </section>

      {/* STARTER PACK */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Starter Pack</div>
        <div className="text-sm text-zinc-400">
          Adds the starter library to this device. Re-installing won’t duplicate
          entries.
        </div>

        <button
          className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold"
          onClick={() => {
            try {
              trackEvent("starter_install", {}, { app_version: appVersion });
            } catch {}
            fetchStarter?.("EN2LT");
          }}
        >
          Install starter pack
        </button>
      </section>

      {/* ACCOUNT & SYNC */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Account &amp; Sync</div>

        {user ? (
          <div className="text-sm text-zinc-400">
            Signed in as <span className="text-zinc-200">{user.email}</span>
          </div>
        ) : (
          <div className="text-sm text-zinc-400">Sign in to enable cloud sync.</div>
        )}

        {syncBanner}

        <div className="flex flex-wrap gap-3">
          {!user ? (
            <button
              className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold"
              onClick={signInWithGoogle}
              disabled={loading}
            >
              {loading ? "Loading…" : "Sign in with Google"}
            </button>
          ) : (
            <>
              <button
                className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold"
                onClick={mergeLibraryWithCloud}
                disabled={merging}
              >
                {merging ? "Syncing…" : "Sync (merge)"}
              </button>

              <button
                className="bg-zinc-800 text-zinc-200 rounded-full px-5 py-2"
                onClick={signOut}
              >
                Sign out
              </button>
            </>
          )}
        </div>

        {user ? (
          <button
            className="text-xs text-zinc-400 underline underline-offset-4"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? "Hide advanced sync options" : "Show advanced sync options"}
          </button>
        ) : null}

        {user && showAdvanced ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 px-4 py-3 space-y-3">
            <div className="text-sm text-zinc-300">
              Advanced options overwrite one side completely. Use carefully.
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="bg-blue-600 text-white rounded-full px-5 py-2"
                onClick={uploadLibraryToCloud}
                disabled={syncingUp || syncingDown || merging}
              >
                {syncingUp ? "Uploading…" : "Upload (overwrite)"}
              </button>

              <button
                className="bg-blue-600 text-white rounded-full px-5 py-2"
                onClick={downloadLibraryFromCloud}
                disabled={syncingUp || syncingDown || merging}
              >
                {syncingDown ? "Downloading…" : "Download (overwrite)"}
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* VOICE SETTINGS */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Voice Settings</div>

        <select
          className="w-full bg-zinc-950/30 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200"
          value={azureVoiceShortName}
          onChange={(e) => setAzureVoiceShortName(e.target.value)}
        >
          <option value="lt-LT-LeonasNeural">Leonas (male)</option>
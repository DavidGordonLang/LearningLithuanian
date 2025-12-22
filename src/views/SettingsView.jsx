import React, { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { usePhraseStore } from "../stores/phraseStore";
import {
  replaceUserPhrases,
  fetchUserPhrases,
} from "../stores/supabasePhrases";

export default function SettingsView({
  T,
  azureVoiceShortName,
  setAzureVoiceShortName,
  playText,
  fetchStarter,
  clearLibrary,
  importJsonFile,
  rows, // UI rows (non-deleted only) — DO NOT use for export/sync
  onOpenDuplicateScanner,
  onOpenChangeLog,
  onOpenUserGuide,
}) {
  const { user, loading, signInWithGoogle, signOut } = useAuthStore();
  const setRows = usePhraseStore((s) => s.setPhrases);

  const [syncingUp, setSyncingUp] = useState(false);
  const [syncingDown, setSyncingDown] = useState(false);

  /**
   * IMPORTANT:
   * For data integrity, exports and cloud sync must use the
   * full phrase store (including tombstones), NOT UI-filtered rows.
   */
  const getAllStoredPhrases = () =>
    usePhraseStore.getState().phrases || [];

  /* EXPORT JSON (includes tombstones) */
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
  }

  /* IMPORT JSON */
  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    importJsonFile(file);
    e.target.value = "";
  }

  /* UPLOAD → CLOUD (includes tombstones) */
  async function uploadLibraryToCloud() {
    if (!user) return;

    try {
      setSyncingUp(true);
      const allPhrases = getAllStoredPhrases();
      await replaceUserPhrases(allPhrases);
      alert("Library uploaded to cloud ✅");
    } catch (e) {
      alert("Upload failed: " + (e?.message || "Unknown error"));
    } finally {
      setSyncingUp(false);
    }
  }

  /* DOWNLOAD → LOCAL (REPLACE) */
  async function downloadLibraryFromCloud() {
    if (!user) return;

    const ok = window.confirm(
      "This will replace your entire local library with the cloud version.\n\nContinue?"
    );
    if (!ok) return;

    try {
      setSyncingDown(true);
      const cloudRows = await fetchUserPhrases();
      setRows(cloudRows);
      alert(`Downloaded ${cloudRows.length} entries ✅`);
    } catch (e) {
      alert("Download failed: " + (e?.message || "Unknown error"));
    } finally {
      setSyncingDown(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28 space-y-8">
      {/* STARTER PACK */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Starter Pack</div>
        <button
          className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold"
          onClick={() => fetchStarter("EN2LT")}
        >
          Install starter pack
        </button>
      </section>

      {/* ACCOUNT & SYNC */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Account & Sync</div>

        {!user ? (
          <>
            <p className="text-sm text-zinc-400">
              Sign in to sync your library across devices.
            </p>

            <button
              className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold"
              onClick={signInWithGoogle}
              disabled={loading}
            >
              {loading ? "Connecting…" : "Sign in with Google"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-400">
              Signed in as{" "}
              <span className="text-zinc-200">{user.email}</span>
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                className="bg-blue-600 text-white rounded-full px-5 py-2 font-semibold"
                onClick={uploadLibraryToCloud}
                disabled={syncingUp}
              >
                {syncingUp ? "Uploading…" : "Upload library"}
              </button>

              <button
                className="bg-zinc-800 text-zinc-200 rounded-full px-5 py-2 font-semibold"
                onClick={downloadLibraryFromCloud}
                disabled={syncingDown}
              >
                {syncingDown ? "Downloading…" : "Download library"}
              </button>

              <button
                className="bg-zinc-800 text-zinc-200 rounded-full px-5 py-2"
                onClick={signOut}
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </section>

      {/* VOICE */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Voice Settings</div>

        <select
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
          value={azureVoiceShortName}
          onChange={(e) => setAzureVoiceShortName(e.target.value)}
        >
          <option value="lt-LT-LeonasNeural">Leonas (male)</option>
          <option value="lt-LT-OnaNeural">Ona (female)</option>
        </select>

        <button
          className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold"
          onClick={() => playText("Sveiki!")}
        >
          Play sample
        </button>
      </section>

      {/* YOUR DATA */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Your Data</div>

        <input
          type="file"
          accept="application/json"
          onChange={handleImportFile}
        />

        <button
          className="bg-zinc-800 text-zinc-200 rounded-full px-5 py-2"
          onClick={exportJson}
        >
          Export library
        </button>

        <button
          className="bg-blue-600 text-white rounded-full px-5 py-2"
          onClick={onOpenDuplicateScanner}
        >
          Duplicate scanner
        </button>

        <button
          className="bg-red-500 text-white rounded-full px-5 py-2"
          onClick={clearLibrary}
        >
          Clear library
        </button>
      </section>

      {/* ABOUT */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">About</div>

        <button
          className="bg-zinc-800 text-zinc-200 rounded-full px-5 py-2"
          onClick={onOpenUserGuide}
        >
          User Guide
        </button>

        <button
          className="bg-zinc-800 text-zinc-200 rounded-full px-5 py-2"
          onClick={onOpenChangeLog}
        >
          Change log
        </button>
      </section>
    </div>
  );
}

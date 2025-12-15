import React from "react";
import { useAuthStore } from "../stores/authStore";

export default function SettingsView({
  T,
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
}) {
  const { user, signInWithGoogle, signOut } = useAuthStore();

  /* EXPORT JSON */
  function exportJson() {
    try {
      const dataStr = JSON.stringify(rows, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lithuanian-trainer-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed: " + e.message);
    }
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    importJsonFile(file);
    e.target.value = "";
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28 space-y-8">

      {/* ACCOUNT & SYNC */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="text-lg font-semibold">Account & Sync</div>

        {!user ? (
          <>
            <p className="text-sm text-zinc-400">
              Your data is currently stored <strong>only on this device</strong>.
              Signing in enables secure cloud sync and backup across devices.
            </p>

            <button
              className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold hover:bg-emerald-400 active:bg-emerald-300"
              onClick={signInWithGoogle}
            >
              Sign in to enable sync
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-400">
              Signed in as{" "}
              <span className="text-zinc-200">{user.email}</span>
            </p>

            <p className="text-xs text-zinc-500">
              Sync infrastructure is active. Data syncing will be enabled in a
              future update.
            </p>

            <button
              className="bg-zinc-800 text-zinc-200 rounded-full px-5 py-2 hover:bg-zinc-700"
              onClick={signOut}
            >
              Sign out
            </button>
          </>
        )}
      </section>

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

      {/* VOICE SETTINGS */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Voice Settings</div>

        <select
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 opacity-60"
          disabled
        >
          <option>Azure Speech (recommended)</option>
        </select>

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

        <input type="file" accept="application/json" onChange={handleImportFile} />

        <button
          className="bg-zinc-800 text-zinc-200 rounded-full px-5 py-2"
          onClick={exportJson}
        >
          Export current library
        </button>

        <button
          className="bg-blue-600 text-white rounded-full px-5 py-2"
          onClick={onOpenDuplicateScanner}
        >
          Open duplicate scanner
        </button>

        <button
          className="bg-red-500 text-white rounded-full px-5 py-2"
          onClick={clearLibrary}
        >
          Clear entire library
        </button>
      </section>

      {/* ABOUT */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div className="text-lg font-semibold">About</div>
        <div className="text-sm text-zinc-400">
          App Version: <span className="text-zinc-200">1.1.1-beta</span>
        </div>

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
          View Change Log
        </button>
      </section>
    </div>
  );
}

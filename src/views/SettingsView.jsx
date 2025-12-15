import React from "react";
import { supabase } from "../supabaseClient";

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

  /* IMPORT JSON HANDLER */
  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    importJsonFile(file);
    e.target.value = "";
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28 space-y-8">
      {/* STARTER PACK */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Starter Pack</div>

        <button
          className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold hover:bg-emerald-400"
          onClick={() => fetchStarter("EN2LT")}
        >
          Install starter pack
        </button>
      </section>

      {/* VOICE SETTINGS */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Voice Settings</div>

        <div className="space-y-1">
          <label className="text-sm">Azure Speech</label>
          <select
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 opacity-60"
            disabled
          >
            <option>Azure Speech (recommended)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Select Voice</label>
          <select
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
            value={azureVoiceShortName}
            onChange={(e) => setAzureVoiceShortName(e.target.value)}
          >
            <option value="lt-LT-LeonasNeural">Leonas (male)</option>
            <option value="lt-LT-OnaNeural">Ona (female)</option>
          </select>
        </div>

        <button
          className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold hover:bg-emerald-400"
          onClick={() => playText("Sveiki!")}
        >
          Play sample
        </button>
      </section>

      {/* YOUR DATA */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-5">
        <div className="text-lg font-semibold">Your Data</div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="application/json"
            className="text-sm"
            onChange={handleImportFile}
          />
          <span className="text-xs text-zinc-400">
            Import phrases from a JSON file
          </span>
        </div>

        <button
          className="bg-zinc-800 text-zinc-200 rounded-full px-5 py-2 hover:bg-zinc-700"
          onClick={exportJson}
        >
          Export current library
        </button>

        <button
          className="bg-blue-600 text-white rounded-full px-5 py-2 hover:bg-blue-500"
          onClick={onOpenDuplicateScanner}
        >
          Open duplicate scanner
        </button>

        <button
          className="bg-red-500 text-white rounded-full px-5 py-2 hover:bg-red-400"
          onClick={clearLibrary}
        >
          Clear entire library
        </button>
      </section>

      {/* ACCOUNT / SYNC */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Account & Sync</div>

        <p className="text-sm text-zinc-400 leading-relaxed">
          You are currently using Žodis in <span className="text-zinc-200">local-only mode</span>.
          Your data lives on this device only.
        </p>

        <p className="text-sm text-zinc-400 leading-relaxed">
          Signing in lets you back up your library and sync it across devices.
          You can keep using the app without signing in if you prefer.
        </p>

        <button
          className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold hover:bg-emerald-400"
          onClick={signInWithGoogle}
        >
          Sign in to enable sync
        </button>
      </section>

      {/* ABOUT */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">About</div>

        <div className="text-sm text-zinc-400">
          App Version: <span className="text-zinc-200">1.1.1-beta</span>
        </div>

        <button
          className="bg-zinc-800 text-zinc-200 rounded-full px-5 py-2 hover:bg-zinc-700"
          onClick={onOpenUserGuide}
        >
          User Guide
        </button>

        <button
          className="bg-zinc-800 text-zinc-200 rounded-full px-5 py-2 hover:bg-zinc-700"
          onClick={onOpenChangeLog}
        >
          View Change Log
        </button>
      </section>
    </div>
  );
}

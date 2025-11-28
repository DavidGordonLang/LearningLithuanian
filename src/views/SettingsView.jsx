// src/views/SettingsView.jsx
import React from "react";

export default function SettingsView({
  T,
  ttsProvider,
  setTtsProvider,
  azureVoiceShortName,
  setAzureVoiceShortName,
  playText,
  fetchStarter,
  clearLibrary,
  importJsonFile,
  rows,
  onOpenDuplicateScanner,
  onOpenChangeLog,
  onOpenUserGuide
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

  /* IMPORT HANDLER */
  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    importJsonFile(file);
    e.target.value = "";
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28 space-y-8">

      {/* STARTER PACK */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="text-lg font-semibold">Starter Pack</div>
        <button
          className="px-4 py-2 bg-emerald-600 text-black rounded-md font-semibold hover:bg-emerald-500"
          onClick={() => fetchStarter("EN2LT")}
        >
          Install starter pack
        </button>
      </section>

      {/* AZURE SPEECH ONLY */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="text-lg font-semibold">Voice Settings</div>

        {/* Provider locked to Azure */}
        <div className="space-y-1">
          <label className="text-sm">{T.azure}</label>
          <select
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 cursor-not-allowed opacity-60"
            value="azure"
            disabled
          >
            <option>Azure Speech (recommended)</option>
          </select>
        </div>

        {/* Voice Selection */}
        <div className="space-y-1 pt-2">
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
          className="px-4 py-2 bg-emerald-600 text-black rounded-md hover:bg-emerald-500"
          onClick={() => playText("Sveiki!", { slow: false })}
        >
          Play sample
        </button>
      </section>

      {/* YOUR DATA */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="text-lg font-semibold">Your Data</div>

        {/* Import JSON */}
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

        {/* Export JSON */}
        <button
          className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-md hover:bg-zinc-700"
          onClick={exportJson}
        >
          Export current library
        </button>

        {/* Duplicate Scanner */}
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          onClick={onOpenDuplicateScanner}
        >
          Open duplicate scanner
        </button>

        {/* Clear library */}
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
          onClick={clearLibrary}
        >
          Clear entire library
        </button>
      </section>

      {/* ABOUT SECTION */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="text-lg font-semibold">About</div>

        <div className="text-sm text-zinc-400">
          App Version: <span className="text-zinc-200">1.0.0-beta</span>
        </div>

        <button
          className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-md hover:bg-zinc-700"
          onClick={onOpenUserGuide}
        >
          User Guide
        </button>

        <button
          className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-md hover:bg-zinc-700"
          onClick={onOpenChangeLog}
        >
          View Change Log
        </button>
      </section>

    </div>
  );
}

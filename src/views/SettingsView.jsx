import React from "react";
import { useAuthStore } from "../stores/authStore";

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
  onOpenUserGuide,
}) {
  const user = useAuthStore((s) => s.user);

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

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28 space-y-8">

      {/* ACCOUNT STATUS */}
      <section
        className="
          bg-zinc-900/95 border border-zinc-800
          rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)]
          p-4 space-y-2
        "
      >
        <div className="text-lg font-semibold">Account status</div>

        {user ? (
          <p className="text-sm text-zinc-300">
            Signed in as{" "}
            <span className="font-medium">{user.email}</span>
            <br />
            Your library can be synced across devices.
          </p>
        ) : (
          <p className="text-sm text-zinc-400">
            You’re using the app in local-only mode.
            <br />
            Your library is stored on this device only.
            <br />
            <span className="text-zinc-500">
              Signing in enables cross-device sync later.
            </span>
          </p>
        )}
      </section>

      {/* STARTER PACK */}
      <section
        className="
          bg-zinc-900/95 border border-zinc-800 
          rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] 
          p-4 space-y-4
        "
      >
        <div className="text-lg font-semibold">Starter Pack</div>

        <button
          className="
            bg-emerald-500 text-black 
            rounded-full px-5 py-2 font-semibold shadow 
            hover:bg-emerald-400 active:bg-emerald-300
            select-none
          "
          onClick={() => fetchStarter("EN2LT")}
        >
          Install starter pack
        </button>
      </section>

      {/* AZURE SPEECH */}
      <section
        className="
          bg-zinc-900/95 border border-zinc-800 
          rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] 
          p-4 space-y-4
        "
      >
        <div className="text-lg font-semibold">Voice Settings</div>

        {/* Provider (locked) */}
        <div className="space-y-1">
          <label className="text-sm">{T.azure}</label>
          <select
            className="
              w-full bg-zinc-950 border border-zinc-700 
              rounded-md px-3 py-2 cursor-not-allowed opacity-60
            "
            disabled
            value="azure"
          >
            <option>Azure Speech (recommended)</option>
          </select>
        </div>

        {/* Voice Selection */}
        <div className="space-y-1">
          <label className="text-sm">Select Voice</label>
          <select
            className="
              w-full bg-zinc-950 border border-zinc-700 
              rounded-md px-3 py-2
            "
            value={azureVoiceShortName}
            onChange={(e) => setAzureVoiceShortName(e.target.value)}
          >
            <option value="lt-LT-LeonasNeural">Leonas (male)</option>
            <option value="lt-LT-OnaNeural">Ona (female)</option>
          </select>
        </div>

        <button
          className="
            bg-emerald-500 text-black rounded-full 
            px-5 py-2 font-semibold shadow 
            hover:bg-emerald-400 active:bg-emerald-300
            select-none
          "
          onClick={() => playText("Sveiki!", { slow: false })}
        >
          Play sample
        </button>
      </section>

      {/* YOUR DATA */}
      <section
        className="
          bg-zinc-900/95 border border-zinc-800 
          rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] 
          p-4 space-y-5
        "
      >
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
          className="
            bg-zinc-800 text-zinc-200 rounded-full 
            px-5 py-2 font-medium
            hover:bg-zinc-700 active:bg-zinc-600
            select-none
          "
          onClick={exportJson}
        >
          Export current library
        </button>

        <button
          className="
            bg-blue-600 text-white rounded-full
            px-5 py-2 font-medium shadow
            hover:bg-blue-500 active:bg-blue-400
            select-none
          "
          onClick={onOpenDuplicateScanner}
        >
          Open duplicate scanner
        </button>

        <button
          className="
            bg-red-500 text-white rounded-full 
            px-5 py-2 font-medium shadow
            hover:bg-red-400 active:bg-red-300
            select-none
          "
          onClick={clearLibrary}
        >
          Clear entire library
        </button>
      </section>

      {/* ABOUT */}
      <section
        className="
          bg-zinc-900/95 border border-zinc-800 
          rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] 
          p-4 space-y-4
        "
      >
        <div className="text-lg font-semibold">About</div>

        <div className="text-sm text-zinc-400">
          App Version:{" "}
          <span className="text-zinc-200">1.1.1-beta</span>
        </div>

        <button
          className="
            bg-zinc-800 text-zinc-200 rounded-full 
            px-5 py-2 font-medium
            hover:bg-zinc-700 active:bg-zinc-600
            select-none
          "
          onClick={onOpenUserGuide}
        >
          User Guide
        </button>

        <button
          className="
            bg-zinc-800 text-zinc-200 rounded-full 
            px-5 py-2 font-medium
            hover:bg-zinc-700 active:bg-zinc-600
            select-none
          "
          onClick={onOpenChangeLog}
        >
          View Change Log
        </button>
      </section>
    </div>
  );
}

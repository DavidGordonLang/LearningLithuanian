return (
  <div className="bg-red-600 text-white p-4 text-center font-bold">
    SETTINGS VIEW TEST — IF YOU SEE THIS, YOU ARE EDITING THE RIGHT FILE
  </div>
);

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
  const { user, loading, signInWithGoogle, signOut } = useAuthStore();

  function exportJson() {
    const blob = new Blob([JSON.stringify(rows, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zodis-library.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    importJsonFile(file);
    e.target.value = "";
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
            <p className="text-sm text-zinc-400 leading-relaxed">
              Your data is currently stored only on this device.
              <br />
              Signing in enables secure cloud sync across devices.
            </p>

            <button
              className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold disabled:opacity-60"
              onClick={signInWithGoogle}
              disabled={loading}
            >
              {loading ? "Connecting…" : "Sign in to enable sync"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-400">
              Signed in as{" "}
              <span className="text-zinc-200">{user.email}</span>
            </p>

            <button
              className="bg-zinc-800 text-zinc-200 rounded-full px-5 py-2 font-medium"
              onClick={signOut}
            >
              Sign out
            </button>
          </>
        )}
      </section>

      {/* VOICE SETTINGS */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Voice Settings</div>

        <div className="space-y-1">
          <label className="text-sm">{T.azure}</label>
          <select
            disabled
            value="azure"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 opacity-60"
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
          className="bg-emerald-500 text-black rounded-full px-5 py-2 font-semibold"
          onClick={() => playText("Sveiki!", { slow: false })}
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
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
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

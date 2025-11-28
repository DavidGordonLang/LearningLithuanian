import React, { useState } from "react";

export default function SettingsView({
  T,
  direction,
  setDirection,
  ttsProvider,
  setTtsProvider,
  azureKey,
  setAzureKey,
  azureRegion,
  setAzureRegion,
  azureVoices,
  setAzureVoices,
  azureVoiceShortName,
  setAzureVoiceShortName,
  browserVoiceName,
  setBrowserVoiceName,
  voices,
  playText,
  fetchStarter,
  clearLibrary,
  importJsonFile,
  rows, // NEW for export
}) {
  const [showKey, setShowKey] = useState(false);

  /* ============================================================
     EXPORT JSON
     ============================================================ */
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

  /* ============================================================
     IMPORT HANDLER
     ============================================================ */
  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    importJsonFile(file);
    e.target.value = "";
  }

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28 space-y-8">

      {/* LEARNING DIRECTION */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-lg font-semibold mb-3">
          {T.direction}
        </div>

        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={direction === "EN2LT"}
              onChange={() => setDirection("EN2LT")}
            />
            {T.en2lt}
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={direction === "LT2EN"}
              onChange={() => setDirection("LT2EN")}
            />
            {T.lt2en}
          </label>
        </div>
      </section>

      {/* STARTER PACK */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="text-lg font-semibold">Starter Pack</div>
        <button
          className="px-4 py-2 bg-emerald-600 text-black rounded-md font-semibold hover:bg-emerald-500"
          onClick={() =>
            fetchStarter(direction === "EN2LT" ? "EN2LT" : "LT2EN")
          }
        >
          Install starter pack
        </button>
      </section>

      {/* AZURE SPEECH SETTINGS */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="text-lg font-semibold">Azure Speech / Browser</div>

        {/* Provider */}
        <div className="space-y-1">
          <label className="text-sm">{T.azure}</label>
          <select
            className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
            value={ttsProvider}
            onChange={(e) => setTtsProvider(e.target.value)}
          >
            <option value="azure">Azure Speech</option>
            <option value="browser">Browser (fallback)</option>
          </select>
        </div>

        {/* Region */}
        {ttsProvider === "azure" && (
          <>
            <div className="space-y-1">
              <label className="text-sm">{T.region}</label>
              <input
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                value={azureRegion}
                onChange={(e) => setAzureRegion(e.target.value)}
              />
            </div>

            {/* Subscription Key */}
            <div className="space-y-1">
              <label className="text-sm">{T.subKey}</label>
              <div className="flex gap-2">
                <input
                  type={showKey ? "text" : "password"}
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                  value={azureKey}
                  onChange={(e) => setAzureKey(e.target.value)}
                />
                <button
                  className="px-3 py-2 rounded-md bg-zinc-800"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Voices */}
            <div className="space-y-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                onClick={async () => {
                  try {
                    const region = azureRegion;
                    const key = azureKey;
                    const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
                    const res = await fetch(url, {
                      headers: { "Ocp-Apim-Subscription-Key": key },
                    });
                    const data = await res.json();
                    setAzureVoices(data);
                  } catch (e) {
                    alert("Failed to fetch voices");
                  }
                }}
              >
                {T.fetchVoices}
              </button>

              <select
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                value={azureVoiceShortName}
                onChange={(e) => setAzureVoiceShortName(e.target.value)}
              >
                <option value="">{T.choose}</option>
                {azureVoices.map((v) => (
                  <option key={v.ShortName} value={v.ShortName}>
                    {v.ShortName}
                  </option>
                ))}
              </select>

              {azureVoiceShortName && (
                <button
                  className="px-4 py-2 bg-emerald-600 text-black rounded-md hover:bg-emerald-500"
                  onClick={() => playText("Sveiki!", { slow: false })}
                >
                  Play sample
                </button>
              )}
            </div>
          </>
        )}
      </section>

      {/* ============================================================
          NEW: Your Data (Import / Export)
         ============================================================ */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="text-lg font-semibold">Your Data</div>

        {/* IMPORT JSON */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="application/json"
            className="text-sm"
            onChange={handleImportFile}
          />
          <span className="text-xs text-zinc-400">Import phrases from a JSON file</span>
        </div>

        {/* EXPORT JSON */}
        <button
          className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-md hover:bg-zinc-700"
          onClick={exportJson}
        >
          Export current library
        </button>

        {/* CLEAR LIBRARY */}
        <button
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
          onClick={clearLibrary}
        >
          Clear entire library
        </button>
      </section>
    </div>
  );
}

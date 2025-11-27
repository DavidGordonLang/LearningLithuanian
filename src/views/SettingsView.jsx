// src/views/SettingsView.jsx
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
  fetchStarter, // for starter pack install
}) {
  const [showKey, setShowKey] = useState(false);
  const [keyField, setKeyField] = useState(azureKey);
  const [regionField, setRegionField] = useState(azureRegion);

  const commitKey = () => setAzureKey(keyField);
  const commitRegion = () => setAzureRegion(regionField);

  async function fetchAzureVoices() {
    try {
      const url = `https://${
        regionField || azureRegion
      }.tts.speech.microsoft.com/cognitiveservices/voices/list`;

      const res = await fetch(url, {
        headers: { "Ocp-Apim-Subscription-Key": keyField || azureKey },
      });

      if (!res.ok) throw new Error("Failed to fetch voices");
      const data = await res.json();
      setAzureVoices(data || []);
    } catch {
      alert("Failed to fetch voices. Check key/region.");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-24">
      <h2 className="text-3xl font-bold mb-6">{T.settings}</h2>

      {/* Learning direction */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
        <div className="text-sm font-semibold mb-2">{T.direction}</div>

        <div className="flex gap-6 flex-wrap">
          <label className="flex items-center gap-2 select-none">
            <input
              type="radio"
              name="dir"
              checked={direction === "EN2LT"}
              onChange={() => setDirection("EN2LT")}
            />
            <span>{T.en2lt}</span>
          </label>

          <label className="flex items-center gap-2 select-none">
            <input
              type="radio"
              name="dir"
              checked={direction === "LT2EN"}
              onChange={() => setDirection("LT2EN")}
            />
            <span>{T.lt2en}</span>
          </label>
        </div>
      </div>

      {/* Starter pack (EN -> LT only) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
        <div className="text-sm font-semibold mb-2">Starter Pack</div>
        <p className="text-xs text-zinc-400 mb-3">
          Quickly install example phrases for English → Lithuanian learning.
        </p>
        <button
          onClick={() => fetchStarter("EN2LT")}
          className="px-4 py-2 rounded-md font-semibold bg-emerald-600 hover:bg-emerald-500 select-none"
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
        >
          Install starter pack
        </button>
      </div>

      {/* Azure / Browser */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="text-sm font-semibold mb-3">
          Azure Speech / Browser (fallback)
        </div>

        {/* Provider */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <div className="text-xs mb-1">Provider</div>
            <select
              className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
              value={ttsProvider}
              onChange={(e) => setTtsProvider(e.target.value)}
            >
              <option value="azure">Azure Speech</option>
              <option value="browser">Browser (fallback)</option>
            </select>
          </div>

          {/* Azure config */}
          {ttsProvider === "azure" && (
            <>
              <div>
                <div className="text-xs mb-1">{T.subKey}</div>
                <div className="flex items-center gap-2">
                  <input
                    type={showKey ? "text" : "password"}
                    value={keyField}
                    onChange={(e) => setKeyField(e.target.value)}
                    onBlur={commitKey}
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                    placeholder="••••••••••••••••"
                  />
                  <button
                    className="px-2 py-2 bg-zinc-800 border border-zinc-700 text-xs rounded-md select-none"
                    onClick={() => setShowKey((v) => !v)}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                  <button
                    className="px-2 py-2 bg-zinc-800 border border-zinc-700 text-xs rounded-md select-none"
                    onClick={commitKey}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs mb-1">{T.region}</div>
                <div className="flex items-center gap-2">
                  <input
                    value={regionField}
                    onChange={(e) => setRegionField(e.target.value)}
                    onBlur={commitRegion}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                    placeholder="westeurope, eastus…"
                  />
                  <button
                    className="px-2 py-2 bg-zinc-800 border border-zinc-700 text-xs rounded-md select-none"
                    onClick={commitRegion}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="flex gap-2 items-end sm:col-span-2">
                <button
                  type="button"
                  onClick={fetchAzureVoices}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md select-none"
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                >
                  {T.fetchVoices}
                </button>

                <select
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                  value={azureVoiceShortName}
                  onChange={(e) =>
                    setAzureVoiceShortName(e.target.value)
                  }
                >
                  <option value="">{T.choose}</option>
                  {azureVoices.map((v) => (
                    <option
                      key={v.ShortName || v.shortName}
                      value={v.ShortName || v.shortName}
                    >
                      {v.LocalName || v.Name || v.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Browser voice */}
          {ttsProvider === "browser" && (
            <div className="sm:col-span-2">
              <div className="text-xs mb-1">Browser voice</div>
              <select
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2"
                value={browserVoiceName}
                onChange={(e) => setBrowserVoiceName(e.target.value)}
              >
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="text-sm mb-2">Test voice</div>
          <button
            className="px-4 py-2 rounded-md font-semibold bg-emerald-600 hover:bg-emerald-500 select-none"
            onClick={() =>
              playText(
                direction === "EN2LT"
                  ? "Sveiki! Kaip sekasi?"
                  : "Hello! How are you?"
              )
            }
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
          >
            Play sample
          </button>
        </div>
      </div>
    </div>
  );
}

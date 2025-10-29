import React, { useEffect, useMemo, useState } from "react";

/**
 * HomeDock
 *
 * This component hosts quick-access controls, including the Audio/Voice settings.
 * It fixes:
 *  - BUG-3: Browser fallback loads voices via Web Speech API and can play a sample without Azure keys.
 *  - BUG-7: When provider = "browser", Azure Region/Key fields are hidden.
 *
 * Props:
 *  - value: { ttsProvider, azureRegion, azureKey, voiceName }
 *  - onChange(next)
 */
export default function HomeDock({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const ttsProvider = value?.ttsProvider || "browser";
  const supportsBrowserTTS =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const [voices, setVoices] = useState([]);

  // Load browser voices when using browser provider
  useEffect(() => {
    if (ttsProvider !== "browser" || !supportsBrowserTTS) {
      setVoices([]);
      return;
    }
    let mounted = true;

    const load = () => {
      const list = window.speechSynthesis.getVoices() || [];
      if (mounted) setVoices(list);
    };

    // Some browsers return empty list until voiceschanged fires
    load();
    window.speechSynthesis.onvoiceschanged = load;

    return () => {
      mounted = false;
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [ttsProvider, supportsBrowserTTS]);

  const canPlaySample = useMemo(() => {
    if (ttsProvider === "browser") {
      return supportsBrowserTTS && voices.length > 0;
    }
    return Boolean(value?.azureRegion && value?.azureKey && value?.voiceName);
  }, [
    ttsProvider,
    supportsBrowserTTS,
    voices.length,
    value?.azureRegion,
    value?.azureKey,
    value?.voiceName,
  ]);

  function setField(field, v) {
    onChange?.({ ...(value || {}), [field]: v });
  }

  function playSample() {
    if (ttsProvider === "browser" && supportsBrowserTTS && voices.length) {
      const v =
        voices.find((x) => x.name === value?.voiceName) || voices[0];
      const u = new SpeechSynthesisUtterance(
        "Sveiki! Tai pavyzdinis balsas."
      );
      u.voice = v || null;
      // Cancel any queued utterances just in case
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      return;
    }
    alert(
      "Azure sample playback will run in the app flow once your keys and voice are set."
    );
  }

  return (
    <div className="relative">
      <button
        className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring"
        onClick={() => setOpen((x) => !x)}
        aria-expanded={open}
        aria-controls="homedock-popover"
      >
        Settings
      </button>

      {open && (
        <div
          id="homedock-popover"
          role="dialog"
          aria-label="Audio and Voice Settings"
          className="absolute right-0 mt-2 w-[28rem] max-w-[95vw] rounded-xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl z-30"
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <h2 className="text-lg font-semibold">Audio & Voice</h2>
            <button
              className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring"
              aria-label="Close settings"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="grid gap-3">
            <label className="text-sm text-neutral-300">
              Provider
              <select
                className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
                value={ttsProvider}
                onChange={(e) => setField("ttsProvider", e.target.value)}
              >
                <option value="browser">Browser (fallback)</option>
                <option value="azure">Azure Speech</option>
              </select>
            </label>

            {/* Hide Azure credentials when in browser mode (BUG-7) */}
            {ttsProvider === "azure" && (
              <>
                <label className="text-sm text-neutral-300">
                  Azure Region
                  <input
                    className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
                    placeholder="e.g., uksouth"
                    value={value?.azureRegion || ""}
                    onChange={(e) => setField("azureRegion", e.target.value)}
                  />
                </label>

                <label className="text-sm text-neutral-300">
                  Azure Subscription Key
                  <input
                    className="mt-1 w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
                    placeholder="Paste your key"
                    value={value?.azureKey || ""}
                    onChange={(e) => setField("azureKey", e.target.value)}
                  />
                </label>
              </>
            )}

            <div className="grid gap-2">
              <label className="text-sm text-neutral-300">
                Voice{" "}
                {ttsProvider === "browser" && (
                  <span className="ml-2 text-xs text-neutral-400">
                    (Loaded from your browser)
                  </span>
                )}
              </label>

              {ttsProvider === "browser" ? (
                supportsBrowserTTS ? (
                  <select
                    className="rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
                    value={value?.voiceName || ""}
                    onChange={(e) => setField("voiceName", e.target.value)}
                  >
                    {voices.length === 0 ? (
                      <option value="">Loading voices…</option>
                    ) : (
                      voices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} — {v.lang}
                        </option>
                      ))
                    )}
                  </select>
                ) : (
                  <div className="text-sm text-red-400">
                    Your browser does not support speech synthesis.
                  </div>
                )
              ) : (
                <input
                  className="rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 focus:outline-none focus:ring"
                  placeholder="e.g., en-GB-SoniaNeural"
                  value={value?.voiceName || ""}
                  onChange={(e) => setField("voiceName", e.target.value)}
                />
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring disabled:opacity-60"
                onClick={playSample}
                disabled={!canPlaySample}
              >
                Play sample
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            {ttsProvider === "browser" && (
              <p className="text-xs text-neutral-400">
                Browser voices vary by OS and installed language packs. If a
                Lithuanian voice isn’t available, you can still practise with an
                English voice or switch to Azure later.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

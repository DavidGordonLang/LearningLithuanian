import { create } from "zustand";

// TTS store — will handle Azure keys, region, voice selection,
// and TTS playback. Right now it's just the scaffolding.

export const useTTSStore = create((set) => ({
  azureKey: "",
  azureRegion: "",
  azureVoice: "lt-LT-OnaNeural",

  // --- SETTERS ---
  setAzureKey: (key) => set({ azureKey: key }),
  setAzureRegion: (region) => set({ azureRegion: region }),
  setAzureVoice: (voice) => set({ azureVoice: voice }),

  // --- ACTIONS (wired later) ---
  speak: async (text) => {
    console.warn("speak() not implemented yet:", text);
  },
}));

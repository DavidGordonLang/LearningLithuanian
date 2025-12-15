import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // We keep PWA support, but disable SW generation for now
      // This keeps the app installable without caching complexity
      registerType: "autoUpdate",

      // We manage manifest ourselves in /public/manifest.json
      manifest: false,
      includeManifestIcons: true,

      // 🔒 Critical: disable service worker generation
      devOptions: {
        enabled: false,
      },

      workbox: {
        // Explicitly disable precaching to avoid build errors
        globPatterns: [],
      },
    }),
  ],
});

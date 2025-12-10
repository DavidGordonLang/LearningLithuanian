import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // Use your own manifest.json in /public
      includeManifestIcons: true,
      manifest: false,

      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
})
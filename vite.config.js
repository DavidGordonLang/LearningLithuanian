import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // ⬇️ add this block
      workbox: {
        navigateFallbackDenylist: [/^\/api\//], // don't route /api/* to index.html
      },
    }),
  ],
})

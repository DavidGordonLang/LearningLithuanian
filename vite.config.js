import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']
      }
      // We’re serving the manifest from /public, so we don’t need to
      // duplicate it here. If you preferred, you could put the manifest
      // object here instead.
    })
  ]
})

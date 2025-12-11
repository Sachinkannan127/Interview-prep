import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    // Increase the chunk size warning limit to 4000 KiB for Vercel deployment
    // This prevents chunk size warnings during production builds
    chunkSizeWarningLimit: 4000,
  },
})

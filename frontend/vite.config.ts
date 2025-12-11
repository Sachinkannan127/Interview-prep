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
    // Increase the chunk size warning limit to 2000 KiB to avoid noisy warnings
    // Adjust this value if you want a different threshold (value is in KiB)
    chunkSizeWarningLimit: 2000,
  },
})

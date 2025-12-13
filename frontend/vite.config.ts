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
    // Increase the chunk size warning limit to 5000 KiB for Vercel deployment
    // This prevents chunk size warnings during production builds
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate large dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'react-firebase-hooks'],
          'vendor-ui': ['lucide-react', 'react-hot-toast', 'react-helmet'],
          'vendor-pdf': ['jspdf'],
        },
      },
    },
  },
})

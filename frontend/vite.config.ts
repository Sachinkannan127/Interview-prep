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
        manualChunks(id) {
          // Separate vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('lucide-react') || id.includes('react-hot-toast') || id.includes('react-helmet')) {
              return 'vendor-ui';
            }
            if (id.includes('jspdf')) {
              return 'vendor-pdf';
            }
            // All other node_modules go into vendor
            return 'vendor';
          }
        },
      },
    },
  },
})

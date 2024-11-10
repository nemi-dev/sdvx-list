import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        sdvx: '/sdvx.html'
      },
      output: {

        entryFileNames: '[name].js', // Main entry files
        chunkFileNames: '[name]-[hash].js', // Shared chunks
        assetFileNames: '[name][extname]' // Static assets
      }
    }
  },
  plugins: [react()],
})

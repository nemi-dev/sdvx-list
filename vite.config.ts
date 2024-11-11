import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: '../nemi-app-index/sdvx',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
        chunkFileNames: 'index-[hash].js',
        assetFileNames: 'index[extname]',
      }
    }
  },
  plugins: [react()],
})

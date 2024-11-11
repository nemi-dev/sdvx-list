import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path'
console.log(path.resolve('../nemi-app-index/[name]/index.js'))
console.log(path.resolve('../nemi-app-index/[name]/index-[hash].js'))
console.log(path.resolve('../nemi-app-index/[name]/index[extname]'))
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

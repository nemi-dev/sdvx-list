import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { cdn } from "vite-plugin-cdn2";
import cdn from 'vite-plugin-cdn-import'

const plugins = [
  react(),
]

if (process.env.NODE_ENV === 'production') plugins.push(
  cdn({ modules: [
    {
      name: 'react',
      var: 'React',
      path: "https://www.unpkg.com/react@18/umd/react.production.min.js"
    },
    {
      name: 'react-dom',
      var: 'ReactDOM',
      path: "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
    }
  ]}),
)

// https://vite.dev/config/
export default defineConfig({
  base: '/sdvx',
  build: {
    outDir: '../nemi-app-index/sdvx',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
        chunkFileNames: 'index-[hash].js',
        assetFileNames: 'index[extname]',
      },
       // Treat React and ReactDOM as external in production builds
       external: process.env.NODE_ENV === 'production' ? ['react', 'react-dom'] : []
    }
  },
  plugins,
})

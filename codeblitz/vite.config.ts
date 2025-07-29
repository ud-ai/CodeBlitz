import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'contentScript') return 'contentScript.js'
          if (chunk.name === 'background') return 'background.js'
          return 'assets/[name].js'
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
})

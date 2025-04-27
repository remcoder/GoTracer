import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  publicDir: 'public',
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './js')
    }
  }
})

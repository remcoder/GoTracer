import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    vue(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./js/**/*.js"'
      }
    })
  ],
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
});

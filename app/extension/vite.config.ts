import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        background: 'src/background.ts',
        popup: 'src/popup.html', // optional
      },
      output: {
        entryFileNames: '[name].js',
      }
    }
  },
  publicDir: 'public', // copies manifest & icons
})

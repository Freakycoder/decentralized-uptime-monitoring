import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        popup: resolve(__dirname, 'src/popup/popup.html'), 
        content : resolve(__dirname, 'src/content.ts') 
      },
      output: {
        entryFileNames: '[name].js',
      }
    }
  },
  publicDir: 'public', 
})

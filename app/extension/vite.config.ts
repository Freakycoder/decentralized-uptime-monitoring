import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        popup: resolve(__dirname, 'src/popup/popup.html'), 
        content: resolve(__dirname, 'src/content.ts') 
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep popup.html in root, not in assets folder
          if (assetInfo.name === 'popup.html') {
            return '[name][extname]'
          }
          return 'assets/[name][extname]'
        }
      }
    },
    // Ensure modules work correctly in extension context
    target: 'chrome89',
    modulePreload: false,
    sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false
  },
  publicDir: 'public',
})
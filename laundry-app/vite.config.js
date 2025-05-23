import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js', 
  },
  build: {
    chunkSizeWarningLimit: 1000, // Meningkatkan batas peringatan ke 1000 kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Memisahkan library chart ke chunk terpisah
          'recharts': ['recharts'],
          // Memisahkan vendor lain
          'vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
})
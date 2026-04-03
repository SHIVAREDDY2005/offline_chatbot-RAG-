import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repoBase = '/offline_chatbot-RAG-/'

export default defineConfig({
  base: repoBase,
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

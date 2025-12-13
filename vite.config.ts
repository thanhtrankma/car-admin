import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/images': {
        target: 'http://171.244.43.84:9000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/images/, ''),
      },
    },
  },
})

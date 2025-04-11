import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // 可以是真实的本地开发API地址，或模拟API
        target: 'http://localhost:8787',
        changeOrigin: true,
        // 如果API没有/api前缀，可以重写路径
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}) 
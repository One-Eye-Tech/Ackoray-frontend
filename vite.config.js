import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // GitHub Pages 部署配置
  base: process.env.NODE_ENV === 'production' ? '/ackoray-frontend/' : '/',
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  // 开发服务器配置
  server: {
    host: '0.0.0.0', // 允许外部设备访问
    port: 5173, // 明确指定端口
    cors: {
      origin: '*', // 允许任何源
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true // 允许携带凭证
    },
    proxy: {
      // 代理上传文件的访问路径
      '/uploads': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false
      },
      // 代理所有API请求
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
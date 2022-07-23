import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const path = require("path");
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "./", 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css:{
    preprocessorOptions:{
      scss:{
        // 自动导入全局样式
        additionalData: "@import './src/assets/scss/base.scss';"
      }
    }
  }
})

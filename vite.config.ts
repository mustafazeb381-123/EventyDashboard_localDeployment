import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  define: {
    global: 'globalThis', // Add this line to fix global is not defined
  },

  server: {
    host: true,            // expose on all hosts
    port: 5173,
    allowedHosts: ['lvh.me', '*.lvh.me']
  },
})
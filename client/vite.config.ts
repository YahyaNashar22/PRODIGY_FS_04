import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // whenever i send to /api it will prefix it with the target
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      }
    }
  }
})

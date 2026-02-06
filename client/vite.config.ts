import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base for Tauri, /whiteboard/ for web deployment
  base: process.env.TAURI_ENV_PLATFORM ? '/' : '/whiteboard/',
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://phonebook-ypuz.onrender.com',
        changeOrigin: true,
      },
    }
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/oldProjects/KeizaalWidget/client/dist/',
  plugins: [react()],
})

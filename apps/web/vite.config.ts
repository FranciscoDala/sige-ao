import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // <- ESSA LINHA É A CHAVE
  build: {
    outDir: 'dist'
  }
})

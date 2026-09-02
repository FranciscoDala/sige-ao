import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '/', // <- 1. Importante pra SPA no Render
    build: {
        outDir: 'dist', // <- 2. Pasta que o Render vai servir
        emptyOutDir: true,
    },
    server: {
        port: 5173,
    }
})

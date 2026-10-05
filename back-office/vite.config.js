import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Le port est fixé (5173 pour le site public, 5174 pour le back-office) : l'API est
// réglée sur ces deux adresses (CORS_ORIGIN) et le back-office renvoie vers le site
// public à la sienne. Si le port est pris, Vite s'arrête au lieu d'en changer.
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true },
})

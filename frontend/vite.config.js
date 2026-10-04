import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Remplace %SITE_URL% dans index.html par l'adresse publique du site
// (variable VITE_SITE_URL, sans barre finale). Les balises de partage et de
// référencement ont besoin d'adresses complètes : https://…/og-image.png.
function siteUrl(url) {
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url),
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Lit les fichiers .env de ce dossier, et les variables passées au build.
  const env = loadEnv(mode, import.meta.dirname)
  const url = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')
  return {
    plugins: [react(), siteUrl(url)],
  }
})

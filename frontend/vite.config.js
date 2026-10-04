import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Adresse publique du site, utilisée quand VITE_SITE_URL n'est pas fournie :
// celle de la production pour un build, celle de Vite en développement.
const PRODUCTION_URL = 'https://orienta.flamme.work'
const DEVELOPMENT_URL = 'http://localhost:5173'

// Remplace %SITE_URL% dans index.html par l'adresse publique du site, sans
// barre finale. Les balises de partage et de référencement ont besoin
// d'adresses complètes : https://…/og-image.png.
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
  const fallback = mode === 'production' ? PRODUCTION_URL : DEVELOPMENT_URL
  const url = (env.VITE_SITE_URL || fallback).replace(/\/$/, '')
  return {
    plugins: [react(), siteUrl(url)],
  }
})

import './assets/css/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { initTheme } from './hooks/useTheme.js'

// Applique le thème clair/sombre choisi avant le premier affichage.
initTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

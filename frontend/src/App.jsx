import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import PageIntrouvable from './components/PageIntrouvable.jsx'
import Accueil from './pages/accueil/Accueil.jsx'
import APropos from './pages/a-propos/APropos.jsx'
import Debouches from './pages/debouches/Debouches.jsx'
import Favoris from './pages/favoris/Favoris.jsx'
import FicheFormation from './pages/formations/FicheFormation.jsx'
import FicheInstitut from './pages/instituts/FicheInstitut.jsx'
import { ROUTES } from './routes.js'

/* Routage du site public : toutes les pages s'affichent dans la mise en page commune
   (en-tête, pied de page). Chaque responsable remplace le contenu de SA page dans
   src/pages/ ; les routes n'ont pas à changer. */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path={ROUTES.accueil} element={<Accueil />} />
          <Route path={ROUTES.favoris} element={<Favoris />} />
          <Route path={ROUTES.formation()} element={<FicheFormation />} />
          <Route path={ROUTES.debouche()} element={<Debouches />} />
          <Route path={ROUTES.institut()} element={<FicheInstitut />} />
          <Route path={ROUTES.aPropos} element={<APropos />} />
          <Route path="*" element={<PageIntrouvable />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

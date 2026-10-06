import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { SearchProvider } from './context/SearchContext.jsx';
import Accueil from './pages/accueil/Accueil.jsx';
import APropos from './pages/a-propos/APropos.jsx';
import Debouches from './pages/debouches/Debouches.jsx';
import Favoris from './pages/favoris/Favoris.jsx';
import FicheFormation from './pages/formations/FicheFormation.jsx';
import FicheInstitut from './pages/instituts/FicheInstitut.jsx';
import { ROUTES } from './routes.js';

/* Routage du site public. Toutes les pages s'affichent dans <Layout>
   (en-tête + pied de page). Chaque responsable remplit le contenu de SA page
   dans src/pages/ ; les routes n'ont pas à changer. */
function App() {
  return (
    <FavoritesProvider>
      <SearchProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path={ROUTES.accueil} element={<Accueil />} />
              <Route path={ROUTES.favoris} element={<Favoris />} />
              <Route path={ROUTES.formation} element={<FicheFormation />} />
              <Route path={ROUTES.debouche} element={<Debouches />} />
              <Route path={ROUTES.institut} element={<FicheInstitut />} />
              <Route path={ROUTES.aPropos} element={<APropos />} />
              <Route path="*" element={<Navigate to={ROUTES.accueil} replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SearchProvider>
    </FavoritesProvider>
  );
}

export default App;

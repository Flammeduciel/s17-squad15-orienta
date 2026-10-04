import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import BackOfficeLayout from './components/admin/BackOfficeLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import Compte from './pages/compte/Compte.jsx'
import Connexion from './pages/connexion/Connexion.jsx'
import Cours from './pages/cours/Cours.jsx'
import FormulaireFormation from './pages/formations/FormulaireFormation.jsx'
import ListeFormations from './pages/formations/ListeFormations.jsx'
import FormulaireInstitut from './pages/instituts/FormulaireInstitut.jsx'
import ListeInstituts from './pages/instituts/ListeInstituts.jsx'
import Debouches from './pages/referentiels/Debouches.jsx'
import Diplomes from './pages/referentiels/Diplomes.jsx'
import Domaines from './pages/referentiels/Domaines.jsx'
import SeriesBac from './pages/referentiels/SeriesBac.jsx'
import TableauDeBord from './pages/tableau-de-bord/TableauDeBord.jsx'
import { ROUTES } from './routes.js'

/* Routage du back-office.
   - Les pages d'accès (connexion, réinitialisation) sont ouvertes à tous (P1).
   - Tout le reste passe par <ProtectedRoute> : sans session, retour à /connexion (S6).
   Chaque responsable remplace le contenu de SA page dans src/pages/ ; les routes n'ont pas à changer. */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.connexion} element={<Connexion />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<BackOfficeLayout />}>
              <Route path="/" element={<Navigate to={ROUTES.accueil} replace />} />
              <Route path={ROUTES.accueil} element={<TableauDeBord />} />

              {/* Les formulaires sont des routes enfants de leur liste : ils s'ouvrent
                  en fenêtre par-dessus elle, et gardent leur propre adresse. */}
              <Route path={ROUTES.instituts} element={<ListeInstituts />}>
                <Route path="nouveau" element={<FormulaireInstitut />} />
                <Route path=":id" element={<FormulaireInstitut />} />
              </Route>

              <Route path={ROUTES.formations} element={<ListeFormations />}>
                <Route path="nouvelle" element={<FormulaireFormation />} />
                <Route path=":id" element={<FormulaireFormation />} />
              </Route>

              <Route path={ROUTES.cours} element={<Cours />} />
              <Route path={ROUTES.diplomes} element={<Diplomes />} />
              <Route path={ROUTES.debouches} element={<Debouches />} />
              <Route path={ROUTES.series} element={<SeriesBac />} />
              <Route path={ROUTES.domaines} element={<Domaines />} />
              <Route path={ROUTES.compte} element={<Compte />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.accueil} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

# Back-office — interface Squad Orienta

Interface d'administration en React (JavaScript, Vite), réservée à la Squad.
L'apparence, les libellés et les parcours viennent de la maquette
`template/back-office.html` ; les appels respectent `docs/openapi.yaml`. La
répartition des pages est dans `docs/roadmap-dev.md`.

## Démarrer

```bash
npm install
npm run dev
```

→ Interface sur http://localhost:5174. L'adresse de l'API se règle avec
`VITE_API_URL` (voir `.env.example`).

## Où va quoi

```
back-office/src/
├── main.jsx       # Point d'entrée : charge le design system et monte l'application
├── App.jsx        # Routage : pages ouvertes (connexion) et pages protégées
├── routes.js      # Toutes les adresses du back-office au même endroit
├── config.js      # Réglages lus dans les variables VITE_…
├── assets/
│   └── css/       # Design system (ne pas écrire de CSS ailleurs)
├── api/           # Appels à l'API : client HTTP, authentification, session
├── components/    # Composants partagés : coquille (menu, barre), icônes, garde de session,
│                  # Status, Pagination, ConfirmDialog, ErrorBoundary
├── context/       # États partagés entre pages : session, messages éphémères
├── hooks/         # useFetch (lecture de l'API), useTheme (clair / sombre)
├── utils/         # Mise en forme des montants, dates et durées
└── pages/         # Un dossier par page ou groupe de pages, avec ses fichiers déjà créés
```

La connexion (P1) et la coquille (S6) sont faites. Les autres fichiers de pages
n'affichent que leur titre : il reste à les remplir en suivant la maquette. Les
routes sont déjà branchées dans `App.jsx`, il n'y a pas à y toucher.

## Session et appels à l'API

- `api/http.js` fournit `request(chemin, { method, params, body })`. Il ajoute tout seul
  le jeton de session (`Authorization: Bearer …`) : une page n'a rien à faire
  pour être authentifiée. `body` est un objet (envoyé en JSON) ou un `FormData`
  (dépôt d'image sur `/admin/images`). Les paramètres vides sont ignorés.
- Pour lire une ressource : `useFetch('/institutes', { page, per_page })` renvoie
  `{ data, loading, error, reload }`. `<Status loading />` et
  `<Status error={error} onRetry={reload} />` affichent l'attente ou l'échec.
- `Pagination` (pied de tableau) et `ConfirmDialog` (confirmation avant suppression)
  suivent la maquette ; `utils/format.js` met en forme montants, dates et durées.
- Une erreur de l'API devient une `ApiError` avec `status` (statut HTTP),
  `code` (code du contrat, ex. `ELEMENT_UTILISE`) et `message`.
- Si l'API refuse le jeton (expiré), la session est fermée et l'utilisateur
  revient à la page de connexion.
- Le compte connecté se lit avec `useAuth()` : `const { user } = useAuth()`.

Pour travailler sans lancer l'API, mettre `VITE_USE_MOCK_AUTH=true` dans `.env` :
la connexion passe alors par un faux backend (`squad` / `orienta2026`).

## Les pages

| Fichier | Page | Route | Ticket |
|---|---|---|---|
| `pages/connexion/Connexion.jsx` | Connexion, mot de passe oublié | `/connexion` | P1 |
| `pages/connexion/ResetPassword.jsx` | Nouveau mot de passe, ouvert depuis le lien reçu par e-mail | `/reinitialiser-mot-de-passe` | P1 |
| `pages/compte/Compte.jsx` | Compte | `/compte` | P10 |
| `pages/tableau-de-bord/TableauDeBord.jsx` | Tableau de bord | `/admin` | P11 |
| `pages/formations/ListeFormations.jsx` | Liste des formations | `/admin/formations` | P14 |
| `pages/formations/FormulaireFormation.jsx` | Formulaire formation | `/admin/formations/nouvelle`, `/admin/formations/:id` | P15 |
| `pages/instituts/ListeInstituts.jsx` | Liste des instituts | `/admin/instituts` | P16 |
| `pages/instituts/FormulaireInstitut.jsx` | Formulaire institut | `/admin/instituts/nouveau`, `/admin/instituts/:id` | P17 |
| `pages/cours/Cours.jsx` | Cours | `/admin/cours` | P19 |
| `pages/referentiels/Diplomes.jsx` | Diplômes | `/admin/diplomes` | P20 |
| `pages/referentiels/Debouches.jsx` | Débouchés | `/admin/debouches` | P21 |
| `pages/referentiels/SeriesBac.jsx` | Séries du bac | `/admin/series` | P22 |
| `pages/referentiels/Domaines.jsx` | Domaines d'insertion | `/admin/domaines` | P23 |

Un composant utilisé par une seule page reste dans le dossier de cette page ; il
ne monte dans `components/` que lorsqu'une deuxième page en a besoin.

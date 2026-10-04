# Frontend — site public Orienta

Site public en React (JavaScript, Vite). L'apparence, les libellés et les
parcours viennent de la maquette `template/index.html` ; les appels respectent
`docs/openapi.yaml`. La répartition des pages est dans `docs/roadmap-dev.md`.

## Démarrer

```bash
npm install
npm run dev
```

→ Site sur http://localhost:5173. L'adresse de l'API se règle avec
`VITE_API_URL` (voir `.env.example`).

## Où va quoi

```
frontend/src/
├── main.jsx       # Point d'entrée : charge le design system et monte l'application
├── App.jsx        # Routage : toutes les pages s'affichent dans l'en-tête et le pied de page
├── routes.js      # Toutes les adresses du site au même endroit
├── assets/
│   └── css/       # Design system (ne pas écrire de CSS ailleurs)
├── api/           # Appels à l'API : http.js (client) et catalogue.js (une fonction par route)
├── components/    # Composants partagés : en-tête, pied de page, cartes, badge d'agrément, icônes
├── context/       # États partagés entre pages : favoris
├── hooks/         # useApi (charger des données), useTheme (thème clair / sombre)
├── utils/         # Petites fonctions : montants, dates, durées, liens de contact
└── pages/         # Un dossier par page, avec son fichier déjà créé
```

## Charger des données dans une page

```jsx
import { getProgram } from '../../api/catalogue';
import PageState from '../../components/PageState';
import { useApi } from '../../hooks/useApi';

const { data: program, loading, error } = useApi(() => getProgram(id), [id]);
if (!program) return <PageState loading={loading} error={error} notFound="Formation introuvable" />;
```

- `api/catalogue.js` a une fonction par route de l'API ; une page ne fait jamais
  `fetch` elle-même.
- Une erreur de l'API est une `ApiError` avec `status`, `code` et `message`.
- Les favoris se lisent avec `useFavorites()`. Ils restent dans le navigateur :
  le site public n'a pas de compte.

## Les pages

| Fichier | Page | Route | Ticket |
|---|---|---|---|
| `pages/accueil/Accueil.jsx` | Accueil et recherche | `/` | P2 |
| `pages/favoris/Favoris.jsx` | Favoris | `/favoris` | P3 |
| `pages/formations/FicheFormation.jsx` | Fiche formation | `/formations/:id` | P4 |
| `pages/formations/FormulaireQuestion.jsx` | Question à un institut, affichée dans la fiche formation | — | P9 |
| `pages/debouches/Debouches.jsx` | Débouchés | `/debouches/:id` | P5 |
| `pages/instituts/FicheInstitut.jsx` | Fiche institut | `/instituts/:id` | P6 |
| `pages/a-propos/APropos.jsx` | À propos | `/a-propos` | P7 |

Un composant utilisé par une seule page reste dans le dossier de cette page ; il
ne monte dans `components/` que lorsqu'une deuxième page en a besoin.

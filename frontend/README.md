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
├── App.jsx        # Routage : toutes les pages dans la mise en page commune
├── routes.js      # Toutes les adresses du site au même endroit
├── assets/
│   └── css/       # Design system (ne pas écrire de CSS ailleurs)
├── api/           # Client HTTP (request, ApiError, errorMessage, imageUrl)
├── components/    # Composants partagés : mise en page, icônes, logo, état de chargement
├── context/       # États partagés entre pages : favoris
├── hooks/         # useFetch (lecture de l'API), useTheme (clair / sombre)
├── utils/         # Mise en forme des montants, dates et durées
└── pages/         # Un dossier par page, avec son fichier déjà créé
```

Chaque fichier de page existe déjà et n'affiche que son titre : il reste à le
remplir en suivant la maquette. Les routes sont déjà branchées dans `App.jsx`,
il n'y a pas à y toucher.

## Appeler l'API

- Pour lire une ressource : `useFetch('/institutes', { district, q })`. Il
  renvoie `{ data, loading, error, reload }` et refait l'appel quand le chemin ou
  les paramètres changent. Les paramètres vides sont ignorés.
- Pour afficher l'attente ou l'échec : `<Status loading />` et
  `<Status error={error} onRetry={reload} />`.
- Pour envoyer des données (`POST /contact`) : `request(chemin, { method, body })`
  de `api/http.js`.
- Une erreur de l'API devient une `ApiError` avec `status` (0 si le serveur est
  injoignable), `code` (code du contrat) et `message` (en français, à afficher tel quel).
- Les images des instituts arrivent avec une adresse relative : on les affiche
  avec `imageUrl(institut.image_url)` (qui renvoie `null` s'il n'y a pas d'image).
- Les favoris se lisent avec `useFavoris()` : `{ ids, count, isFavori(id), toggle(id) }`.
  Ils restent dans le navigateur (pas de compte étudiant).

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

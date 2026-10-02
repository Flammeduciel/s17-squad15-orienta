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
├── App.jsx        # Choisit la page à afficher
├── assets/
│   └── css/       # Design system (ne pas écrire de CSS ailleurs)
└── pages/         # Un dossier par page, avec son fichier déjà créé
```

Chaque fichier de page existe déjà et n'affiche que son titre : il reste à le
remplir en suivant la maquette.

D'autres dossiers arriveront avec le premier fichier qui en a besoin — git ne
garde pas un dossier vide :

| Dossier | Ce qu'on y mettra |
|---|---|
| `components/` | Les composants utilisés par plusieurs pages (en-tête, pied de page, carte de formation…) |
| `services/` | Les appels à l'API, un fichier par ressource |
| `context/` | Les états partagés entre pages : thème, favoris |
| `utils/` | Les petites fonctions sans dépendance (formatage des montants, des dates…) |
| `assets/images/` | Les images importées par le code |

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

# Back-office - interface Squad Orienta

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
├── api/           # Appels à l'API : http.js (client), auth.js, catalogue.js (une fonction par route)
├── components/    # Composants partagés : coquille, icônes, fenêtre de confirmation, pagination
├── context/       # États partagés entre pages : session, messages éphémères
├── hooks/         # useApi (charger et recharger des données), useTheme (thème clair / sombre)
├── utils/         # Petites fonctions : montants, dates, recherche sans accents, pagination
└── pages/         # Un dossier par page ou groupe de pages
```

Toutes les pages sont en place et suivent la maquette `template/back-office.html`.

## Session et appels à l'API

- `api/catalogue.js` a une fonction par route de l'API (`getPrograms`,
  `createInstitute`, `linkCourse`…). Une page ne fait jamais `fetch` elle-même.
- `api/http.js` ajoute tout seul le jeton de session (`Authorization: Bearer …`).
- Une erreur de l'API devient une `ApiError` avec `status` (statut HTTP),
  `code` (code du contrat, ex. `ELEMENT_UTILISE`) et `message`. `errorMessage(err)`
  donne le texte à afficher.
- Si l'API refuse le jeton (expiré), la session est fermée et l'utilisateur
  revient à la page de connexion.
- Le compte connecté se lit avec `useAuth()` : `const { user } = useAuth()`.

Charger des données dans une page, puis les relire après un enregistrement :

```jsx
const { data, loading, error, reload } = useApi(getPrograms, []);
if (!data) return <PageState loading={loading} error={error} />;
// … après un ajout ou une suppression :
reload();
```

Pour travailler sans lancer l'API, mettre `VITE_USE_MOCK_AUTH=true` dans `.env` :
la connexion passe alors par un faux backend (`squad@orienta.cg` / `orienta2026`). Les pages
du catalogue, elles, ont besoin de la vraie API.

## Les pages

| Fichier | Page | Route | Ticket |
|---|---|---|---|
| `pages/connexion/Connexion.jsx` | Connexion par adresse e-mail et mot de passe | `/connexion` | P1 |
| `pages/compte/Compte.jsx` | Compte | `/compte` | P10 |
| `pages/tableau-de-bord/TableauDeBord.jsx` | Tableau de bord | `/admin` | P11 |
| `pages/formations/ListeFormations.jsx` | Liste des formations | `/admin/formations` | P14 |
| `pages/formations/FormulaireFormation.jsx` | Formulaire formation | `/admin/formations/nouvelle`, `/admin/formations/:id` | P15 |
| `pages/instituts/ListeInstituts.jsx` | Liste des instituts | `/admin/instituts` | P16 |
| `pages/instituts/FormulaireInstitut.jsx` | Formulaire institut | `/admin/instituts/nouveau`, `/admin/instituts/:id` | P17 |
| `pages/cours/Cours.jsx` | Cours | `/admin/cours` | P19 |
| `pages/referentiels/Referentiel.jsx` | Écran commun aux quatre référentiels ci-dessous | - | P20 à P23 |
| `pages/referentiels/Diplomes.jsx` | Diplômes | `/admin/diplomes` | P20 |
| `pages/referentiels/Debouches.jsx` | Débouchés | `/admin/debouches` | P21 |
| `pages/referentiels/SeriesBac.jsx` | Séries du bac | `/admin/series` | P22 |
| `pages/referentiels/Domaines.jsx` | Domaines d'insertion | `/admin/domaines` | P23 |
| `pages/referentiels/Villes.jsx` | Villes | `/admin/villes` | - |
| `pages/referentiels/Arrondissements.jsx` | Arrondissements d'une ville | `/admin/arrondissements` | - |

Un composant utilisé par une seule page reste dans le dossier de cette page ; il
ne monte dans `components/` que lorsqu'une deuxième page en a besoin.

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
├── App.jsx        # Choisit la page à afficher
├── assets/
│   └── css/       # Design system (ne pas écrire de CSS ailleurs)
└── pages/         # Un dossier par page ou groupe de pages, avec ses fichiers déjà créés
```

Chaque fichier de page existe déjà et n'affiche que son titre : il reste à le
remplir en suivant la maquette.

D'autres dossiers arriveront avec le premier fichier qui en a besoin — git ne
garde pas un dossier vide :

| Dossier | Ce qu'on y mettra |
|---|---|
| `components/` | Les composants utilisés par plusieurs pages (menu latéral, tableau, pagination, fenêtre de confirmation…) |
| `services/` | Les appels à l'API, un fichier par ressource |
| `context/` | Les états partagés entre pages : session, thème |
| `utils/` | Les petites fonctions sans dépendance (formatage des montants, des dates…) |
| `assets/images/` | Les images importées par le code |

## Les pages

| Fichier | Page | Route | Ticket |
|---|---|---|---|
| `pages/connexion/Connexion.jsx` | Connexion, mot de passe oublié | `/connexion` | P1 |
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

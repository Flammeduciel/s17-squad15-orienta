# Backend — API Orienta

API REST en Node.js (Express) sur PostgreSQL. Le contrat à respecter est
`docs/openapi.yaml` ; le découpage du travail en blocs (BK1 à BK6) est dans
`docs/roadmap-dev.md`.

## Démarrer

```bash
npm install
cp .env.example .env      # puis ajuster DATABASE_URL
npm run db:migrate        # crée les tables
npm run db:seed           # jeu de démonstration, une seule fois
npm run dev               # relance l'API à chaque modification
```

→ API sur http://localhost:4000. `GET /health` donne l'état de l'API et de la
connexion à la base (`database.status` : `up`, `down` ou `not_configured`).

`npm run db:*` lit `DATABASE_URL` dans le terminal : faire `export
DATABASE_URL=…` avant, ou lancer toute la pile avec `docker compose up --build`
depuis la racine du dépôt (base, API et les deux interfaces).

## Où va quoi

```
backend/
├── server.js          # Point d'entrée : écoute le port
├── scripts/           # migrate.sql, seed.sql, reset.sql, start.sh
├── uploads/           # Images déposées (hors dépôt)
└── src/
    ├── app.js         # L'application Express : chaque ressource y branche ses routes
    ├── config/        # Variables d'environnement (env.js), connexion PostgreSQL (db.js)
    ├── routes/        # Déclaration des routes, un fichier par ressource
    ├── controllers/   # Une fonction par route : lit la requête, appelle le modèle, répond
    ├── models/        # Requêtes SQL, un fichier par table ou groupe de tables
    ├── middlewares/   # Erreurs, CORS, validation ; bientôt l'authentification et le dépôt de fichier
    ├── validators/    # Schémas de validation : common.js, puis un fichier par ressource
    ├── services/      # Ce qui sort de l'API : envoi d'e-mail, stockage des images
    └── utils/         # Fonctions sans dépendance (httpError.js)
```

La route `/health` sert d'exemple complet : `routes/health.js` déclare la route,
`controllers/health.js` y répond. `models/` et `services/` n'ont pas encore de
code : un court README y dit ce qu'on y mettra.

## Ce que le socle fournit

**Erreurs.** Toute erreur repart au format `Error` du contrat (`code` +
`message`). On la lève avec `httpError(statut, code, message)` ; le middleware
d'erreurs fait le reste. Express 5 transmet tout seul les erreurs d'un
contrôleur `async` : pas besoin de `try / catch` pour les faire remonter.

**Validation.** `validate({ params, query, body })` contrôle une requête avec
des schémas zod avant le contrôleur. Les valeurs converties sont dans
`req.valid` ; une entrée incorrecte répond 400 `PARAMETRE_INVALIDE` en nommant
le champ. Les briques communes (identifiant, booléen, entier, texte
obligatoire) sont dans `validators/common.js`.

```js
const validate = require('../middlewares/validate');
const { idParams } = require('../validators/common');

router.get('/programs/:id', validate({ params: idParams }), getProgram);
// dans le contrôleur : req.valid.params.id est déjà un nombre
```

**Base de données.** `config/db.js` exporte le pool PostgreSQL : un modèle fait
`const { pool } = require('../config/db')` puis `pool.query(sql, valeurs)`,
toujours avec des paramètres `$1`, `$2`… jamais en collant une valeur dans le
SQL.

**CORS.** Pour l'instant, toutes les origines sont acceptées : chaque
développeur doit pouvoir appeler l'API depuis son poste pour tester ses pages.
La version restreinte à `CORS_ORIGIN` est écrite, commentée, dans
`middlewares/cors.js` : elle est à rétablir avant la mise en production.

**Documentation du code.** Les fonctions sont documentées en JSDoc (`@param`,
`@returns`, `@example`) : l'éditeur affiche cette aide au survol et à la saisie.
Toute nouvelle fonction suit la même forme.

**Images.** Le dossier `uploads/` est servi sous `/uploads` : une image déposée
dans `uploads/institutes/photo.jpg` est lisible à `/uploads/institutes/photo.jpg`.

Un fichier par ressource dans `routes/`, `controllers/`, `models/` et
`validators/`, avec le même nom partout :

| Ressource | Nom de fichier | Bloc |
|---|---|---|
| Authentification | `auth` | BK2 |
| Domaines, diplômes, séries du bac, débouchés | `domains`, `degrees`, `bacSeries`, `careers` | BK3 |
| Instituts, arrondissements, images | `institutes`, `districts`, `images` | BK4 |
| Formations, indicateurs | `programs`, `indicators` | BK5 |
| Cours, contact | `courses`, `contact` | BK6 |

Le socle (BK1) est en place : `config/`, les middlewares communs, `utils/` et
`validators/common.js`.

Une requête suit toujours le même chemin :
`routes` → `middlewares` → `validators` → `controllers` → `models`.

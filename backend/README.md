# Backend — API Orienta

API REST en Node.js (Express) sur PostgreSQL. Le contrat à respecter est
`docs/openapi.yaml` ; le découpage du travail en blocs (BK1 à BK6) est dans
`docs/roadmap-dev.md`.

## Démarrer

```bash
npm install
node server.js
```

→ API sur http://localhost:4000. `GET /health` donne l'état de l'API et de la
connexion à la base (`database.status` : `up`, `down` ou `not_configured`).

La base se prépare avec `scripts/migrate.sql`, puis `scripts/seed.sql` pour le
jeu de démonstration. Les variables attendues sont dans `.env.example`.

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
    ├── middlewares/   # Gestion des erreurs (errors.js), bientôt l'authentification et le dépôt de fichier
    ├── validators/    # Contrôle des paramètres et des corps de requête
    ├── services/      # Ce qui sort de l'API : envoi d'e-mail, stockage des images
    └── utils/         # Fonctions sans dépendance (httpError.js)
```

La route `/health` sert d'exemple complet : `routes/health.js` déclare la route,
`controllers/health.js` y répond. `models/`, `validators/` et `services/` n'ont
pas encore de code : un court README y dit ce qu'on y mettra.

Toute erreur repart au format `Error` du contrat (`code` + `message`) : on la
lève avec `httpError(statut, code, message)`, le middleware d'erreurs fait le
reste.

Un fichier par ressource dans `routes/`, `controllers/`, `models/` et
`validators/`, avec le même nom partout :

| Ressource | Nom de fichier | Bloc |
|---|---|---|
| Authentification | `auth` | BK2 |
| Domaines, diplômes, séries du bac, débouchés | `domains`, `degrees`, `bacSeries`, `careers` | BK3 |
| Instituts, arrondissements, images | `institutes`, `districts`, `images` | BK4 |
| Formations, indicateurs | `programs`, `indicators` | BK5 |
| Cours, contact | `courses`, `contact` | BK6 |

Le socle (BK1) pose `config/`, les middlewares communs et `utils/`.

Une requête suit toujours le même chemin :
`routes` → `middlewares` → `validators` → `controllers` → `models`.

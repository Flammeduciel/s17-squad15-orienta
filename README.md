# Orienta Brazzaville

Plateforme d'orientation des nouveaux bacheliers vers les instituts privés de Brazzaville.

## Branches

| Branche | Rôle |
| ------- | ---- |
| `main` | Versions stables uniquement. Les changements arrivent par PR depuis `develop`. |
| `develop` | Branche d'intégration. Tout le travail y est fusionné avant passage en `main`. |

## Vue d'ensemble

Orienta centralise les fiches des instituts privés de Brazzaville (formations, programmes, diplômes, frais, agréments, contacts) pour aider les bacheliers à choisir leur orientation sans se déplacer.

## Structure du projet

```
orienta/
├── backend/          # API REST — Node.js (Express) + PostgreSQL
│   └── scripts/      # migrate.sql, seed.sql, reset.sql, start.sh
├── frontend/         # Site public — React (JavaScript, Vite)
├── back-office/      # Interface Squad — React (JavaScript, Vite)
├── template/         # Maquettes HTML autonomes : index.html (site public), back-office.html
├── product/          # Product Discovery, catalogue des exigences, user stories, FRD
├── docs/             # Contrat d'API (openapi.yaml), schéma de base, roadmap, cadrage Jira
└── deploy.md         # Guide de déploiement Dokploy
```

Les maquettes de `template/` font foi pour l'apparence, les libellés et les
parcours ; `docs/openapi.yaml` et `backend/scripts/migrate.sql` portent le même
modèle de données qu'elles.

## Stack technique

| Partie | Techno |
|---|---|
| Backend | Node.js + Express + PostgreSQL |
| Frontend | React + JavaScript + Vite |
| Back-office | React + JavaScript + Vite |
| API | REST (contrat OpenAPI, version 2.0.0) |
| Auth | JWT (routes /admin) |

## Démarrage rapide

### Backend
```bash
cd backend
npm install
npm run dev
```
→ API sur http://localhost:4000/api

### Frontend
```bash
cd frontend
npm install
npm run dev
```
→ Site public sur http://localhost:5173

### Back-office
```bash
cd back-office
npm install
npm run dev
```
→ Interface Squad sur http://localhost:5174

## Contrat d'API

Le fichier `docs/openapi.yaml` est la source de vérité pour les 3 applications. Il décrit tous les endpoints, les paramètres et les formats de réponses. Toute modification passe par une PR revue par le lead dev.

**Nomenclature :** chemins, paramètres et champs de réponse sont en anglais, alignés sur les colonnes de la base (`docs/schema.sql`). Seul le contenu métier reste en français — libellés affichés, messages d'erreur, noms des diplômes, des débouchés ou des arrondissements.

### Endpoints principaux

| Méthode | Endpoint | Description |
|---|---|---|
| GET | /programs | Rechercher des formations publiées (filtres) |
| GET | /programs/:id | Fiche détaillée d'une formation, programme par année |
| GET | /institutes | Lister les instituts (mêmes filtres que les formations) |
| GET | /institutes/:id | Fiche détaillée d'un institut |
| GET | /domains, /degrees, /bac-series, /careers, /districts | Listes de référence pour les filtres |
| POST | /contact | Envoyer une question à un institut |
| POST | /auth/login | Connexion Squad |
| POST | /auth/password-reset | Mot de passe oublié (lien de réinitialisation) |
| GET | /admin/indicators | Les 5 KPI du dashboard |
| GET/POST/PUT/DELETE | /admin/programs | CRUD formations |
| POST/PUT/DELETE | /admin/institutes | CRUD instituts |
| GET/POST/PUT/DELETE | /admin/courses | Catalogue de cours, rattachés aux formations |
| POST/PUT/DELETE | /admin/degrees, /admin/bac-series, /admin/domains, /admin/careers | CRUD des référentiels |

Le contrat complet compte 43 opérations ; ce tableau n'en donne que les familles.

## Rôles de l'équipe

| Rôle | Responsabilités |
|---|---|
| Lead dev | Contrat d'API, revues de code, intégration |
| Dev Backend | Modèle de données, API REST, auth, upload |
| Dev Frontend | Site public (accueil, recherche, fiches, contact) |
| Dev Back-office | Login, dashboard KPI, CRUD (instituts, formations, cours, diplômes, débouchés, séries, domaines) |

## Statut actuel

- [x] Product Discovery (PM)
- [x] FRD + User Stories + Catalogue (BA)
- [x] Maquettes HTML (site public et back-office) alignées sur le catalogue d'exigences
- [x] Contrat d'API OpenAPI
- [x] Schéma de base de données + seeds
- [ ] Développement backend
- [ ] Développement frontend
- [ ] Développement back-office
- [ ] Intégration

## Règles de gestion

1. Le contrat d'API ne change pas en silence — toute modification passe par une PR revue par le lead dev.
2. Les 3 apps consomment le même contrat — les appels API respectent openapi.yaml.
3. Pas de compte utilisateur côté étudiant — l'accès public est totalement libre.
4. L'admin est réservé à la Squad — authentification JWT requise pour les routes /admin, et aucune inscription : les comptes sont ouverts par un SuperAdmin.

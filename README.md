# Kelasi Brazzaville

Plateforme d'orientation des nouveaux bacheliers vers les instituts privés de Brazzaville.

## Branches

| Branche | Rôle |
| ------- | ---- |
| `main` | Versions stables uniquement. Les changements arrivent par PR depuis `develop`. |
| `develop` | Branche d'intégration. Tout le travail y est fusionné avant passage en `main`. |

## Vue d'ensemble

Kelasi centralise les fiches des instituts privés de Brazzaville (formations, programmes, diplômes, frais, agréments, contacts) pour aider les bacheliers à choisir leur orientation sans se déplacer.

## Structure du projet

```
kelasi/
├── backend/          # API REST — Node.js (Express) + base de données
├── frontend/         # Site public — React (JavaScript, Vite)
├── back-office/      # Interface Squad — React (JavaScript, Vite)
├── docs/             # Schéma BDD + contrat d'API
└── deploy.md         # Guide de déploiement Dokploy
└── docs/
    └── openapi.yaml  # Contrat d'API (source de vérité pour les 3 apps)
```

## Stack technique

| Partie | Techno |
|---|---|
| Backend | Node.js + Express + PostgreSQL |
| Frontend | React + JavaScript + Vite |
| Back-office | React + JavaScript + Vite |
| API | REST (contrat OpenAPI v1) |
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

**Nomenclature :** chemins, paramètres et champs de réponse sont en anglais, alignés sur les colonnes de la base (`docs/schema.sql`). Seul le contenu métier reste en français — libellés affichés, messages d'erreur, valeurs d'énumération comme `BTS` ou `en_cours`. Les paths `/contact`, `/auth/*` et `/admin/images` étaient déjà en anglais.

### Endpoints principaux

| Méthode | Endpoint | Description |
|---|---|---|
| GET | /programs | Rechercher des formations (filtres) |
| GET | /programs/:id | Fiche détaillée d'une formation |
| GET | /institutes | Lister les instituts |
| GET | /institutes/:id | Fiche détaillée d'un institut |
| POST | /contact | Envoyer une question à un institut |
| POST | /referrals | Demande de référencement |
| POST | /auth/login | Connexion Squad |
| GET | /admin/indicators | KPI du dashboard |
| POST/PUT/DELETE | /admin/programs | CRUD formations |
| POST/PUT/DELETE | /admin/institutes | CRUD instituts |

## Rôles de l'équipe

| Rôle | Responsabilités |
|---|---|
| Lead dev | Contrat d'API, revues de code, intégration |
| Dev Backend | Modèle de données, API REST, auth, upload |
| Dev Frontend | Site public (accueil, recherche, fiches, contact) |
| Dev Back-office | Login, dashboard KPI, CRUD |

## Statut actuel

- [x] Product Discovery (PM)
- [x] FRD + User Stories + Catalogue (BA)
- [x] Template HTML V2 (conforme)
- [x] Contrat d'API OpenAPI
- [ ] Schéma de base de données + seeds
- [ ] Développement backend
- [ ] Développement frontend
- [ ] Développement back-office
- [ ] Intégration

## Règles de gestion

1. Le contrat d'API ne change pas en silence — toute modification passe par une PR revue par le lead dev.
2. Les 3 apps consomment le même contrat — les appels API respectent openapi.yaml.
3. Pas de compte utilisateur côté étudiant — l'accès public est totalement libre.
4. L'admin est réservé à la Squad — authentification JWT requise pour les routes /admin.

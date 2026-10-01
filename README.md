# Kelasi Brazzaville

Plateforme reliant les nouveaux bacheliers de Brazzaville aux instituts
supérieurs privés : comparer les formations, les diplômes, les frais et les
agréments avant de s'inscrire.

## Branches

| Branche | Rôle |
| ------- | ---- |
| `main` | Versions stables uniquement. Les changements arrivent par PR depuis `develop`. |
| `develop` | Branche d'intégration. Tout le travail y est fusionné avant passage en `main`. |

Ce dépôt démarre avec `main` réduit au minimum (`.gitignore`, `.gitattributes`
et ce README) afin d'avoir une base stable sur laquelle la première PR
`develop` → `main` soit reviewable. Le contenu du projet (contrat d'API,
schéma BDD, backend, frontend, back-office, guide de déploiement) vit sur
`develop`.

## Documentation

À lire sur `develop`, une fois la première PR mergée :

- `docs/openapi.yaml` — contrat d'API, source de vérité pour les trois applications
- `docs/schema.md` — schéma de la base (diagramme Mermaid + référence des colonnes)
- `docs/schema.sql` — schéma SQL sous forme de documentation
- `deploy.md` — guide de déploiement Dokploy
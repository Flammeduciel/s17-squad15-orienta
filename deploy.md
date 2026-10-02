# Déploiement sur Dokploy

Orienta se déploie comme **trois applications Dokploy séparées** (frontend,
back-office, backend), toutes trois construites depuis ce même dépôt Git via
leur propre `Dockerfile`, plus **un service PostgreSQL** géré par Dokploy (pas
de conteneur Postgres dans ce dépôt).

Le back-office est une application React + Vite **distincte** du frontend public —
même stack, même dépôt, mais un domaine et un déploiement à part. Un bachelier ne
doit jamais atterrir dessus, et son accès est de toute façon gardé côté backend
(authentification JWT requise sur toutes les routes `/admin`).

```mermaid
flowchart TD
    NAV[Navigateur<br/>public] -->|HTTPS| FE["frontend<br/>React + Vite (nginx)<br/>port 3000"]
    ADM[Navigateur<br/>Squad] -->|HTTPS| BO["back-office<br/>React + Vite (nginx)<br/>port 3000"]
    FE -->|fetch| BE["backend<br/>Node + Express<br/>port 4000"]
    BO -->|fetch<br/>+ Bearer JWT| BE
    BE -->|SQL + start.sh<br/>psql -f migrate.sql| DB[("PostgreSQL<br/>service Dokploy")]
```

Deux domaines distincts pour le frontend public et le back-office, un seul
backend, une seule base.

## Prérequis

- Le dépôt Git poussé sur une plateforme accessible par Dokploy.
- Un service PostgreSQL créé dans Dokploy (**Databases → PostgreSQL**), avec
  sa chaîne de connexion notée quelque part.

## 1. Créer la base PostgreSQL

Dans Dokploy : **Databases → Create → PostgreSQL**. Une fois créée, Dokploy
fournit une chaîne `DATABASE_URL` du type :

```
postgresql://<user>:<password>@<host interne dokploy>:5432/<database>
```

Utilise le **hostname interne** fourni par Dokploy (les services communiquent
sur le même réseau Docker) plutôt qu'une adresse publique.

## 2. Déployer le backend

Créer une nouvelle **Application** dans Dokploy :

- **Source** : ce dépôt Git, branche `main`
- **Build type** : Dockerfile
- **Build Path** : `backend`
- **Dockerfile path** : `backend/Dockerfile`
- **Port** : `4000`
- **Health check path** : `/health`

**Variables d'environnement** (Environment, pas Build Arguments) :

| Variable       | Requis | Valeur                                                                                         |
| -------------- | ------ | ---------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Oui    | La chaîne de connexion du service PostgreSQL (étape 1)                                         |
| `JWT_SECRET`   | Oui    | Une chaîne aléatoire longue et secrète — jamais la valeur par défaut de développement           |
| `CORS_ORIGIN`  | Oui    | Les URLs publiques autorisées à appeler l'API, séparées par des virgules, **sans slash final** — ex. `https://orienta.exemple.com,https://back-office.orienta.exemple.com` |
| `PORT`         | Non    | `4000` (déjà la valeur par défaut)                                                              |

Au démarrage du conteneur, `backend/scripts/start.sh` s'exécute automatiquement :
il applique les migrations SQL (`psql -f migrate.sql`) puis démarre le serveur.
Les tables sont créées toutes seules au premier déploiement, rien à faire à la
main. Le script est idempotent : le rejouer sur une base déjà à jour ne change
rien. En revanche, **le seed n'est jamais exécuté automatiquement**
(il contient des données de démonstration) — voir « Créer le premier compte
administrateur » plus bas.

Le schéma complet (tables, colonnes, index, vue `indicators`) est documenté dans
`docs/schema.md` (diagramme Mermaid) et `docs/schema.sql`. Le `migrate.sql` embarqué
dans l'image en est l'application exécutable.

**Base créée avec le premier schéma (Kelasi).** Ce schéma ne peut pas être
transformé sur place. Si ses tables sont vides, `migrate.sql` les reconstruit
tout seul. Si elles contiennent des données (par exemple l'ancien seed), la
migration s'arrête avec un message explicite et **le conteneur ne démarre pas** :
il faut alors lancer une fois, à la main, `psql $DATABASE_URL -f scripts/reset.sql`
— il efface le catalogue mais conserve les comptes — puis redéployer.

**Images des instituts.** L'API enregistre les images déposées dans `/app/uploads`
et les sert sous `/uploads`. Dans Dokploy, monte un **volume persistant** sur
`/app/uploads` (onglet *Volumes* de l'application backend) : sans lui, les images
disparaissent à chaque redéploiement.

Une fois déployé, attribue un domaine à cette application dans Dokploy (ex.
`api.orienta.exemple.com`) et vérifie `https://<domaine>/health`. La réponse doit porter `"status": "ok"` et
`"database": {"status": "up", …}` :

```json
{
  "status": "ok",
  "service": "orienta-api",
  "version": "1.0.0",
  "environment": "production",
  "uptime_seconds": 42,
  "timestamp": "2026-10-02T22:27:03.644Z",
  "database": { "status": "up", "latency_ms": 15 }
}
```

- `database.status` vaut `not_configured` si `DATABASE_URL` est absente : l'API
  répond 200, mais elle n'a pas de base.
- Si la base est configurée et ne répond pas, `/health` renvoie **503** avec
  `"status": "degraded"` et `"database": {"status": "down"}`. Dokploy considère
  alors le conteneur comme défaillant. La cause est dans les journaux du backend.

## 3. Déployer le frontend

Créer une deuxième **Application** dans Dokploy :

- **Source** : le même dépôt Git
- **Build type** : Dockerfile
- **Build Path** : `frontend`
- **Dockerfile path** : `frontend/Dockerfile`
- **Port** : `3000`

**Build Arguments** (⚠️ pas dans "Environment Settings") :

| Argument               | Valeur                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| `VITE_API_URL`        | L'URL publique du backend, ex. `https://api.orienta.exemple.com`     |

Aucune variable requise dans "Environment Settings" pour le frontend.

> **Piège classique** : `VITE_API_URL` est injectée dans le code JavaScript
> **au moment du build** (`vite build`, exécuté dans l'étape `builder` du
> Dockerfile), pas lue au démarrage du conteneur. Une variable mise dans
> "Environment Settings" n'existe que quand le conteneur tourne déjà — trop
> tard. Si elle atterrit dans "Environment" au lieu de "Build Arguments", le
> code compilé retombe sur sa valeur par défaut (`http://localhost:4000`) et
> l'app déployée essaie d'appeler `localhost` depuis le navigateur des
> visiteurs. Toujours la passer en argument de build, et **redéployer avec un
> rebuild** (pas juste un restart) après l'avoir ajoutée ou changée.

Attribue un domaine au frontend (ex. `orienta.exemple.com`), puis retourne sur
l'application **backend** et vérifie que `CORS_ORIGIN` inclut bien ce domaine
exact (avec `https://`, sans slash final) — sinon les requêtes CORS échoueront
silencieusement.

## 4. Déployer le back-office

Créer une troisième **Application** dans Dokploy :

- **Source** : le même dépôt Git
- **Build type** : Dockerfile
- **Build Path** : `back-office`
- **Dockerfile path** : `back-office/Dockerfile`
- **Port** : `3000`

**Build Arguments** (même piège que pour le frontend) :

| Argument               | Valeur                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| `VITE_API_URL`        | L'URL publique du backend, ex. `https://api.orienta.exemple.com`     |

Attribue un domaine **distinct** au back-office (ex.
`back-office.orienta.exemple.com`) — jamais le même que le frontend public.

Retourne ensuite sur l'application **backend** et ajoute ce domaine à
`CORS_ORIGIN` (toujours `https://`, sans slash final, séparé du précédent par
une virgule) — c'est ce qui autorise le back-office à appeler le backend en CORS
et à envoyer le token `Authorization: Bearer`.

## Créer le premier compte administrateur en production

Le seed (`backend/scripts/seed.sql`) crée un compte admin de démonstration
(`squad` / `orienta2026`) — pratique en local, **à ne jamais exécuter tel quel en
production** (mot de passe public dans ce dépôt). Deux options pour le premier
admin réel :

1. Insérer un utilisateur (identifiant, e-mail, hash bcrypt du mot de passe)
   dans la table `users` via le terminal PostgreSQL de Dokploy. Il n'existe pas
   de route d'inscription : c'est voulu, le back-office est réservé à la Squad.
2. Ou exécuter le seed une fois en changeant le mot de passe dans `seed.sql`
   avant de le lancer manuellement dans le conteneur backend
   (`psql $DATABASE_URL -f scripts/seed.sql`), puis changer ce mot de passe
   immédiatement avec « Mot de passe oublié » (renseigner d'abord l'e-mail du
   compte dans `users`, le seed le laisse vide).

Les données de démonstration (instituts, formations) créées par le seed sont,
elles, un bon point de départ — à ajuster ensuite depuis le back-office plutôt
qu'à re-seeder.

## Vérification post-déploiement

1. Ouvrir le frontend → l'accueil doit afficher les formations (confirme que
   `VITE_API_URL` pointe bien vers le backend et que celui-ci répond).
2. Rechercher une formation, ouvrir une fiche → confirme l'affichage des
   détails et le badge d'agrément.
3. Se connecter au back-office avec le compte admin → le dashboard doit afficher
   les KPI (établissements, districts, domaines, diplômes, débouchés).
4. Créer/modifier une formation depuis le back-office → confirme l'écriture en
   base.

## Variables d'environnement — résumé

**Backend**

| Variable       | Requis | Exemple                                                        |
| -------------- | ------ | ----------------------------------------------------------------- |
| `DATABASE_URL` | Oui    | `postgresql://user:pass@host:5432/db`                          |
| `JWT_SECRET`   | Oui    | une chaîne aléatoire longue                                     |
| `CORS_ORIGIN`  | Oui    | `https://orienta.exemple.com,https://back-office.orienta.exemple.com` |
| `PORT`         | Non    | `4000` (valeur par défaut)                                      |

**Frontend et back-office** (identique pour les deux)

| Variable               | Requis | Type           | Exemple                                  |
| ---------------------- | ------ | ---------------- | ------------------------------------------- |
| `VITE_API_URL`        | Oui    | Build Argument | `https://api.orienta.exemple.com`         |

## Dépannage

- **Le frontend charge mais aucune donnée ne s'affiche** : ouvrir la console
  navigateur — une erreur CORS signifie presque toujours que `CORS_ORIGIN`
  (backend) ou `VITE_API_URL` (frontend/back-office, au build) est mal renseigné.
- **Erreur de connexion à la base au démarrage du backend** : vérifier que
  `DATABASE_URL` utilise le hostname **interne** Dokploy du service Postgres,
  et que le service Postgres est bien démarré avant le backend.
- **`VITE_API_URL` reste sur `localhost:4000` une fois déployé** : c'est le
  piège Build Argument vs Environment ci-dessus. Le déplacer, puis redéployer
  avec un **rebuild** complet (un simple restart ne relance pas `vite build`,
  donc ne change rien).
- **Le build Docker échoue sur `"/package.json": not found`** : le **Build Path**
  de l'application a été perdu (remis à la racine du dépôt). Remettre `backend`,
  `frontend` ou `back-office` selon l'application concernée (voir étapes 2 à 4),
  puis redéployer.

## Tester le build Docker en local (optionnel)

Sans Dokploy, pour vérifier qu'une image se construit correctement :

```bash
docker build -t orienta-backend ./backend
docker build --build-arg VITE_API_URL=http://localhost:4000 -t orienta-frontend ./frontend
docker build --build-arg VITE_API_URL=http://localhost:4000 -t orienta-back-office ./back-office
```

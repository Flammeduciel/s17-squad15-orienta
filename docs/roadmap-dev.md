# Roadmap de développement — Orienta Brazzaville

Ce qu'il faut construire, qui le construit, et ce qui dépend de quoi.

---

## 1. Principe

Le travail se découpe en trois ensembles :

- **Le backend**, en **6 blocs**, porté par **Flamme** et **Gilles**.
- **Le socle des interfaces**, en **3 briques**, dont dépendent toutes les pages.
- **Les 19 pages** — 7 sur le site public, 12 dans le back-office — réparties
  entre **Elie**, **Arsène**, **Fresnel** et **Samuel**. Chacun a des pages des
  deux côtés et suit un même sujet de bout en bout.

Chaque bloc, chaque brique et chaque page est une branche. Deux branches ne
touchent jamais les mêmes fichiers, donc les développeurs ne se gênent pas.

Cette roadmap ne couvre que l'implémentation. Les tests automatisés,
l'observabilité, les optimisations de performance et la reprise des données
réelles sont planifiés après, dans un second temps.

### Ce qui a changé depuis la première version

Les maquettes (`template/`) ont été réalignées sur le catalogue d'exigences, puis
le contrat (`docs/openapi.yaml`, version 2.0.0) et le schéma de base ont suivi.

- **Trois pages retirées.** « Référencer un institut » (P8), « Demandes de
  contact » (P12) et « Demandes de référencement » (P13) n'ont aucune exigence
  derrière elles : la Squad collecte elle-même les informations des instituts,
  et une question posée depuis une fiche part par e-mail vers l'institut.
- **Cinq pages ajoutées au back-office** (P19 à P23) : cours, diplômes,
  débouchés, séries du bac et domaines d'insertion.
- **L'accueil part des instituts**, plus des métiers : recherche « institut,
  filière ou diplôme » et quatre accès — instituts, formations, diplômes,
  débouchés (EX-09).
- **La durée appartient au diplôme**, les frais sont saisis par niveau, et les
  cours forment un catalogue partagé entre formations.
- **Pas d'inscription dans le back-office.** EX-15 la demande encore dans le
  catalogue d'exigences ; le Product Discovery (§10) la signalait déjà comme un
  problème de sécurité. À faire corriger par le BA.
- **Le backend est confié à deux développeurs**, Flamme et Gilles, et découpé en
  blocs. Les pages de Gilles et celles du lead technique sont redistribuées.

Les numéros P8, P12, P13 et P18 ne sont pas réattribués.

---

## 2. Backend — 6 blocs

Les routes citées sont celles de `docs/openapi.yaml`. La base est déjà décrite
par `backend/scripts/migrate.sql` et remplie par `backend/scripts/seed.sql`.

| # | Bloc | Développeur | Branche | Contenu | Dépend de |
|---|------|-------------|---------|---------|-----------|
| BK1 | Socle de l'API | **Flamme** | `feat/backend-socle-api` | Structure Express, connexion PostgreSQL, validation des entrées, format d'erreur commun (`Error`), CORS, service des images déposées. | — |
| BK2 | Authentification | **Flamme** | `feat/backend-auth` | `POST /auth/login` (adresse e-mail et mot de passe), `POST /auth/logout`, protection de toutes les routes `/admin` par jeton. | BK1 |
| BK3 | Référentiels | **Gilles** | `feat/backend-referentiels` | Domaines, diplômes, séries du bac, débouchés : lecture publique (`/domains`, `/degrees`, `/bac-series`, `/careers`) et CRUD `/admin/…`. Suppression refusée (409) tant que l'élément est utilisé. Changer la durée d'un diplôme ajuste ses formations. | BK1 pour la lecture, BK2 pour le CRUD |
| BK4 | Instituts | **Gilles** | `feat/backend-instituts` | `GET /institutes` (liste et filtres propres à l'institut), `GET /institutes/{id}`, `GET /districts`, CRUD `/admin/institutes`, dépôt d'image `/admin/images`. | BK1 pour la lecture, BK2 pour le CRUD |
| BK5 | Formations | **Flamme** | `feat/backend-formations` | `GET /programs` (recherche multi-critères) et `GET /programs/{id}`, CRUD `/admin/programs` avec frais par niveau, séries et débouchés, statut publié ou brouillon. Ajoute à `GET /institutes` les filtres qui portent sur les formations. `GET /admin/indicators` (les 5 KPI). | BK3, BK4 |
| BK6 | Cours et contact | **Gilles** | `feat/backend-cours-contact` | Catalogue `/admin/courses`, rattachement d'un cours à une formation par année (`/admin/programs/{id}/courses/{course_id}`), programme par année dans la fiche formation, `POST /contact` (envoi à l'institut et accusé de réception). | BK5 |

BK3 et BK4 avancent en parallèle de BK2 : leurs routes de lecture n'ont pas
besoin de l'authentification, seul leur CRUD l'attend.

---

## 3. Socle des interfaces — 3 briques

| # | Brique | Développeur | Branche | Contenu | Dépend de |
|---|--------|-------------|---------|---------|-----------|
| S4 | Design system | **Flamme** | `frontend-init-design` | Le CSS du prototype extrait en couches et branché dans les deux interfaces. **Livré.** | — |
| S5 | Couche commune des interfaces | **Arsène** | `feat/shared-socle-frontends` | Configuration Vite commune, client HTTP, gestion des erreurs, contextes de session et de thème, composants transverses. | S4 |
| S6 | Squelette du back-office | **Samuel** | `feat/back-office-squelette-auth` | Disposition générale, navigation latérale, garde de session. Livré avec les pages P1 et P10. | S4, S5 |

L'environnement de développement (`docker-compose.yml` avec PostgreSQL, l'API et
les deux interfaces, `.env.example`) est préparé par **Flamme** avec BK1.

---

## 4. Site public — 7 pages

| # | Page | Route | Développeur | Branche | Critère de recette |
|---|------|-------|-------------|---------|---------------------|
| P2 | Accueil et recherche | `/` | **Arsène AKIANA** | `feat/frontend-accueil` | L'accueil présente la recherche « institut, filière ou diplôme » et quatre accès : instituts, formations, diplômes, débouchés. La liste des instituts s'affiche par défaut ; chaque accès change la grille. Les filtres (arrondissement, débouché, diplôme, durée, budget, série du bac, organisation) s'appliquent aux quatre vues. Une recherche sans résultat affiche « Résultat introuvable » et propose d'effacer les filtres. |
| P3 | Favoris | `/favoris` | **Samuel AKOMBO** | `feat/frontend-favoris` | La liste des formations mises de côté s'affiche, se persiste d'une visite à l'autre et se recharge depuis l'API. |
| P4 | Fiche formation | `/formations/:id` | **Elie NGANGA** | `feat/frontend-fiche-formation` | Toutes les informations du contrat s'affichent : diplôme et durée, frais par niveau, séries admises et autres conditions d'admission, cours du soir, stage, paiement en tranches, programme année par année, débouchés. Les débouchés sont cliquables, les autres formations de l'institut listées, WhatsApp et le téléphone fonctionnent. |
| P5 | Débouchés | `/debouches/:id` | **Elie NGANGA** | `feat/frontend-debouches` | Un débouché sélectionné depuis une fiche ou depuis l'accueil filtre les formations qui y mènent. Le débouché est lisible dans l'adresse. |
| P6 | Fiche institut | `/instituts/:id` | **Arsène AKIANA** | `feat/frontend-fiche-institut` | Image, présentation, coordonnées, badge bleu et numéro si l'institut est agréé (nom seul sinon), frais d'inscription, clôture et rentrée, avantages, diplômes délivrés, débouchés, tarifs par niveau et conditions d'admission de chaque formation publiée. Contact par WhatsApp pré-rempli, e-mail et appel. |
| P7 | À propos | `/a-propos` | **Fresnel OBA VERCHY** | `feat/frontend-a-propos` | Le problème décrit, ce que fait Orienta, le public visé et l'engagement sur l'information s'affichent. |
| P9 | Question à un institut | formulaire de la fiche formation | **Samuel AKOMBO** | `feat/frontend-contact` | Le formulaire (nom, e-mail, question) envoie la demande à `POST /contact` et affiche l'accusé de réception. Il porte déjà la formation depuis laquelle il est ouvert. |

---

## 5. Back-office — 12 pages

| # | Page | Route | Développeur | Branche | Critère de recette |
|---|------|-------|-------------|---------|---------------------|
| P1 | Connexion | `/connexion` | **Samuel AKOMBO** | `feat/back-office-squelette-auth` | L'adresse e-mail et le mot de passe valides ouvrent la session ; les identifiants erronés affichent une erreur explicite. Aucune inscription, aucun « mot de passe oublié ». La session se maintient d'une visite à l'autre et la page est inaccessible sans elle. |
| P10 | Compte | `/compte` | **Samuel AKOMBO** | `feat/back-office-squelette-auth` | Le compte connecté s'affiche et la déconnexion ferme la session puis revient à la connexion. |
| P11 | Tableau de bord | `/admin` | **Fresnel OBA VERCHY** | `feat/back-office-dashboard` | Les 5 indicateurs de `GET /admin/indicators` s'affichent : établissements, formations et filières, arrondissements couverts, diplômes délivrés, débouchés. |
| P14 | Liste des formations | `/admin/formations` | **Elie NGANGA** | `feat/back-office-formations-liste` | Le tableau liste toutes les formations, brouillons compris, se recherche, se filtre par domaine et par statut, et se pagine. Chaque ligne offre l'édition et la suppression avec confirmation. |
| P15 | Formulaire formation | `/admin/formations/nouvelle`<br>`/admin/formations/:id` | **Elie NGANGA** | `feat/back-office-formations-formulaire` | Création et édition : le diplôme choisi donne la durée, les frais se saisissent par niveau, les séries du bac et les débouchés se cochent dans leurs référentiels, le statut est publié ou brouillon. Le programme s'affiche année par année et renvoie vers la page Cours. Une formation créée enchaîne sur l'ajout de ses cours. |
| P16 | Liste des instituts | `/admin/instituts` | **Arsène AKIANA** | `feat/back-office-instituts-liste` | Le tableau liste les instituts avec leur agrément (numéro ou « Non agréé »), se filtre par arrondissement et par agrément. La suppression annonce le nombre de formations emportées et demande confirmation. |
| P17 | Formulaire institut | `/admin/instituts/nouveau`<br>`/admin/instituts/:id` | **Arsène AKIANA** | `feat/back-office-instituts-formulaire` | Création et édition : identité, arrondissement, coordonnées, numéro d'agrément, frais, clôture et rentrée, description, avantages. L'image de l'institut se dépose depuis le formulaire même (JPEG, PNG ou WebP, 2 Mo maximum) : elle s'affiche en aperçu, se remplace et se retire. Un institut sans image garde le bloc coloré à son sigle. |
| P19 | Cours | `/admin/cours` | **Samuel AKOMBO** | `feat/back-office-cours` | Le catalogue de cours se liste, se recherche et se filtre par formation. Un cours se crée avec ses rattachements (formation et année d'études) ; un même cours se rattache à plusieurs formations. Depuis une formation filtrée, un cours existant se rattache ou se retire sans quitter la page. |
| P20 | Diplômes | `/admin/diplomes` | **Fresnel OBA VERCHY** | `feat/back-office-referentiels` | Ajout, modification, suppression d'un diplôme avec sa durée d'études (1 à 5 ans). La suppression est refusée tant qu'une formation le délivre. |
| P21 | Débouchés | `/admin/debouches` | **Fresnel OBA VERCHY** | `feat/back-office-referentiels` | Ajout, modification, suppression d'un débouché avec son domaine d'insertion. La suppression est refusée tant qu'une formation le porte. |
| P22 | Séries du bac | `/admin/series` | **Fresnel OBA VERCHY** | `feat/back-office-referentiels` | Ajout, modification, suppression d'une série (code et libellé). La suppression est refusée tant qu'une formation l'admet. |
| P23 | Domaines d'insertion | `/admin/domaines` | **Fresnel OBA VERCHY** | `feat/back-office-referentiels` | Ajout, modification, suppression d'un domaine avec sa couleur. La suppression est refusée tant qu'une formation ou un débouché y est rattaché. |

---

## 6. Qui fait quoi

| Développeur | Sujet | Backend / socle | Site public | Back-office |
|-------------|-------|-----------------|-------------|-------------|
| **Flamme** (lead technique) | Backend | BK1, BK2, BK5, S4 | — | — |
| **Gilles BITEMO** | Backend | BK3, BK4, BK6 | — | — |
| **Elie NGANGA** | Formations | — | P4, P5 | P14, P15 |
| **Arsène AKIANA** | Instituts | S5 | P2, P6 | P16, P17 |
| **Fresnel OBA VERCHY** | Pilotage et référentiels | — | P7 | P11, P20, P21, P22, P23 |
| **Samuel AKOMBO** | Accès et cours | S6 | P3, P9 | P1, P10, P19 |

Le lead technique relit en plus l'ensemble des pull requests.

**Flamme** prend les blocs dont tout dépend (socle, authentification) et le plus
lourd, la recherche des formations. **Gilles** prend les trois blocs qui se
ressemblent : des listes à lire et à administrer.

**Elie** porte la formation, de la fiche publique au formulaire d'administration.
**Arsène** fait de même pour les instituts, et écrit l'accueil, qui les liste par
défaut ; c'est la première page publique, d'où la couche commune (S5).
**Fresnel** a cinq pages de back-office, mais ses quatre référentiels sont le
même écran décliné quatre fois, dans une seule branche. **Samuel** ouvre le
back-office (squelette, connexion, compte) et porte le catalogue de cours.

---

## 7. Dépendances

« A dépend de B » veut dire : A ne peut pas être terminé tant que B n'est pas
livré. Une page peut être **écrite** contre le contrat `docs/openapi.yaml` avant
que son bloc backend soit prêt ; elle ne peut pas être **recettée** sans lui.

### 7.1 Backend

| Ceci | dépend de | parce que |
|------|-----------|-----------|
| BK2 Authentification | BK1 | Utilise la structure de l'API et la connexion à la base. |
| BK3 Référentiels | BK1 | Idem, pour les routes de lecture. |
| BK3 Référentiels (CRUD) | BK2 | Les routes `/admin` exigent un jeton. |
| BK4 Instituts | BK1 | Idem, pour les routes de lecture. |
| BK4 Instituts (CRUD, image) | BK2 | Les routes `/admin` exigent un jeton. |
| BK5 Formations | BK3 | Une formation référence un diplôme, un domaine, des séries et des débouchés. |
| BK5 Formations | BK4 | Une formation appartient à un institut. |
| BK6 Cours et contact | BK5 | Un cours se rattache à une formation ; une question vise une formation. |

### 7.2 Socle des interfaces

| Ceci | dépend de | parce que |
|------|-----------|-----------|
| S5 Couche commune | S4 (livré) | Les composants transverses utilisent le design system. |
| S6 Squelette du back-office | S5 | Utilise le client HTTP et le contexte de session. |
| **Toutes les pages** | S5 | Aucune page n'appelle l'API sans la couche commune. |
| **Toutes les pages du back-office** | S6 et P1 | Elles s'affichent dans le squelette, derrière la connexion. |

### 7.3 Site public

| Ceci | dépend de | parce que |
|------|-----------|-----------|
| P2 Accueil et recherche | BK4 | Liste les instituts. |
| P2 Accueil et recherche | BK3 | Les filtres et les vues Diplômes et Débouchés lisent les référentiels. |
| P2 Accueil et recherche | BK5 | Vue Formations, et filtres qui portent sur les formations. |
| P3 Favoris | P2 | Réutilise la carte de formation de l'accueil. |
| P3 Favoris | BK5 | Recharge les formations depuis l'API. |
| P4 Fiche formation | BK5 | Affiche la fiche d'une formation. |
| P4 Fiche formation | BK6 | Le programme par année vient des cours rattachés. |
| P5 Débouchés | P2 | Réutilise la grille et les filtres de l'accueil. |
| P5 Débouchés | P4 | On y arrive depuis les débouchés d'une fiche formation. |
| P5 Débouchés | BK3, BK5 | Lit le débouché, puis les formations qui y mènent. |
| P6 Fiche institut | BK4 | Affiche la fiche d'un institut. |
| P6 Fiche institut | BK5 | Liste ses formations, leurs tarifs et leurs conditions d'admission. |
| P6 Fiche institut | P2 | Réutilise la carte de formation. |
| P7 À propos | — | Page statique : seulement le socle. |
| P9 Question à un institut | P4 | Le formulaire s'intègre à la fiche formation. |
| P9 Question à un institut | BK6 | Appelle `POST /contact`. |

### 7.4 Back-office

| Ceci | dépend de | parce que |
|------|-----------|-----------|
| P1 Connexion | BK2 | Appelle la connexion. |
| P10 Compte | P1 | Affiche la session ouverte et la ferme. |
| P11 Tableau de bord | BK5 | Lit les 5 KPI. |
| P14 Liste des formations | BK5 | Liste, filtre et supprime les formations. |
| P15 Formulaire formation | P14 | Réutilise les contrôles de la liste et y revient. |
| P15 Formulaire formation | BK5 | Crée et modifie une formation. |
| P15 Formulaire formation | BK3, BK4 | Propose les diplômes, domaines, séries, débouchés et instituts. |
| P16 Liste des instituts | BK4 | Liste, filtre et supprime les instituts. |
| P17 Formulaire institut | P16 | Réutilise les contrôles de la liste et y revient. |
| P17 Formulaire institut | BK4 | Crée et modifie un institut, dépose son image. |
| P19 Cours | BK6 | Gère le catalogue et les rattachements. |
| P19 Cours | P15 | P15 y renvoie après la création d'une formation. |
| P20 à P23 Référentiels | BK3 | CRUD des diplômes, débouchés, séries et domaines. |

P15 n'attend pas les pages P20 à P23 : les référentiels sont déjà remplis par le
jeu de démonstration.

### 7.5 Ordre de démarrage

| Étape | Backend | Interfaces |
|-------|---------|------------|
| 1 | BK1 (Flamme) | S5 (Arsène) ; P7 dès que S5 est livré (Fresnel) |
| 2 | BK2 (Flamme) ; BK3 et BK4 (Gilles) | S6 avec P1 et P10 (Samuel) |
| 3 | BK5 (Flamme) | P16, P17, P6 (Arsène) ; P20 à P23 (Fresnel) |
| 4 | BK6 (Gilles) | P2 (Arsène) ; P14, P15, P4 (Elie) ; P11 (Fresnel) ; P3 (Samuel) |
| 5 | — | P5 (Elie) ; P19, P9 (Samuel) |

En attendant leur étape, Elie et Samuel écrivent leurs pages contre le contrat,
avec le jeu de démonstration des maquettes.

---

## 8. Nommage des branches

`<type>/<domaine>-<sujet>`, en minuscules, séparateur `-`.

| Type | Usage |
|------|-------|
| `feat` | nouvelle fonctionnalité |
| `fix` | correction de bug |
| `chore` | outillage, configuration, infrastructure |
| `docs` | documentation |

Domaines employés : `backend`, `ops`, `shared`, `back-office`, `frontend`.

Exception : `frontend-init-design` est le nom retenu à la création du design
system et conservé tel quel.

---

## 9. Revue et fusion

Le lead technique relit chaque pull request. Elle est acceptée si :

1. `npm run lint` et `npm run build` passent.
2. Le code respecte `docs/openapi.yaml`. Toute divergence se corrige dans le
   contrat, par pull request dédié — jamais par une dérogation dans le code.
3. Le message de commit suit Conventional Commits, rédigé en français.
4. La pull request porte sur un seul bloc ou une seule page. Une pull request qui
   en couvre deux est refusée, sauf les quatre référentiels (P20 à P23) et le
   squelette avec P1 et P10, livrés chacun dans une seule branche.

---

## 10. Règles permanentes

- Une branche par bloc ou par page, jamais de commit direct sur `develop`.
- Aucun envoi sur le dépôt distant sans accord explicite du lead technique.
- Toute modification du design system passe par `frontend-init-design`, jamais
  depuis un lot métier.
- Une classe manquante au design system s'ajoute dans le design system avant
  d'être contournée en CSS local.

---

## 11. Coordination

| Développeur | Courriel | Téléphone |
|-------------|----------|-----------|
| FS Samuel AKOMBO | samuelakombo0@gmail.com | +242 06 957 94 03 |
| FS Fresnel Alphonse OBA VERCHY | obaverchy@gmail.com | +242 06 525 47 76 |
| FS Flamme Du Ciel Jourdrigue (WASSANGOU) | flammewassangou@gmail.com | +242 06 559 07 14 |
| FS Elie Rachel NGANGA | ngangaelierachel@gmail.com | +242 06 406 49 05 |
| FS Arsène Gloire AKIANA | akianaarsenegloire@gmail.com | +242 06 752 51 62 |
| FS Gilles Brant BITEMO | bitemogilles@gmail.com | +242 06 689 39 75 |

Point hebdomadaire : une ligne par développeur, indiquant ce qui est fusionné et
ce qui bloque. Un blocage non signalé au-delà de 48 heures est repris par le lead
technique.

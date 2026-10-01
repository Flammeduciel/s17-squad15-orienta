# Roadmap de développement — Kelasi Brazzaville

Pages à produire, répartition entre les six développeurs, ordre d'exécution et
règles de contribution.

---

## 1. Principe

Le produit compte **17 pages** : 8 sur le site public, 9 dans le back-office,
et **7 chantiers backend** dont dépend la moitié des pages. Le travail est
réparti en quatre vagues.

**Vague 1 — le socle.** Six briques dont dépend tout le reste : l'API REST,
l'environnement de développement, le design system, la couche partagée par les
deux interfaces, et le squelette du back-office. Attribuées au lead technique,
car chacune bloque tous les autres et qu'aucune n'est une fonctionnalité.

**Vague 2 — le site public.** Les 8 pages du site, réparties en quatre lots.

**Vague 3 — le back-office.** Les 9 pages d'administration, réparties en quatre
lots.

**Vague 4 — les fondations backend.** Les chantiers qui n'ont pas de page
visible mais bloquent la production : lecture des demandes, tests, déploiement,
observabilité, durcissement. Répartis entre les développeurs qui ont le plus de
charge page.

Chaque page et chaque chantier est une branche. Deux branches ne touchent jamais
les mêmes fichiers, donc les développeurs ne se gênent pas.

### Ce qui manque au contrat

Deux écrans de la vague 3 n'ont aucune route derrière eux. C'est à corriger en
vague 1, pas en cours de route :

- **Les demandes reçues ne sont pas lisibles.** `POST /contact` et
  `POST /referrals` écrivent en base, mais rien ne permet de les consulter. Les
  pages P12 et P13 n'ont donc aucune source. Il manque deux routes de lecture
  sous `/admin`, ainsi que la colonne de statut qui permet de les marquer comme
  traitées.
- **Aucune route ne permet de créer un compte depuis une demande de
  référencement.** La page P13 le promet dans son critère de recette. Il faut
  une route d'acceptation qui crée l'institut et le compte, ou la promesse est
  retirée de la page.

Ces deux points sont traités en vague 1 par le lead technique, avec mise à jour
de `docs/openapi.yaml`.

---

## 2. Vague 1 — Socle

| Branche | Titre | Contenu |
|---------|-------|---------|
| `feat/backend-api-rest` | API REST | Les dix-sept routes du contrat `docs/openapi.yaml`. Validation, limitation de débit, authentification par jeton. |
| `feat/backend-lecture-demandes` | Lecture des demandes | Les deux routes manquantes sous `/admin` pour consulter les demandes de contact et de référencement, la colonne de statut, et la route d'acceptation qui crée l'institut et son compte. Corrige `docs/openapi.yaml` avant d'écrire le code. |
| `chore/ops-stack-de-developpement` | Environnement de développement | `docker-compose.yml` orchestrant PostgreSQL, l'API et les deux interfaces. Un `.env.example` documenté, un jeu de démonstration, un compte de test. |
| `frontend-init-design` | Design system | Le CSS du prototype extrait en sept couches et branché dans les deux interfaces. Source unique de style : aucune CSS écrite à la main dans une application. |
| `feat/shared-socle-frontends` | Socle partagé des interfaces | Configuration Vite commune, client HTTP, gestion des erreurs, contextes d'authentification et de thème, composants transverses. |
| `feat/back-office-squelette-auth` | Squelette du back-office | Pages P1 et P10 ci-dessous, plus la disposition générale et la navigation latérale. Fournit le cadre dans lequel s'écrivent les huit autres pages d'administration. |

L'ordre importe : `feat/backend-api-rest` puis
`feat/backend-lecture-demandes`, car les pages P12 et P13 ne peuvent pas
commencer avant.

---

## 3. Vague 2 — Site public

| # | Page | Route | Développeur | Branche | Critère de recette |
|---|------|-------|-------------|---------|---------------------|
| P2 | Catalogue | `/` | **Gilles BITEMO** | `feat/frontend-catalogue` | Les formations s'affichent par carte, avec recherche textuelle et les six filtres (métier, diplôme, durée, budget, série du bac, arrondissement, organisation). Un état vide propose de réinitialiser les filtres. |
| P3 | Favoris | `/favoris` | **Gilles BITEMO** | `feat/frontend-favoris` | La liste des formations mises de côté s'affiche, se persiste d'une visite à l'autre et se recharge depuis l'API. |
| P4 | Fiche formation | `/formations/:id` | **Elie NGANGA** | `feat/frontend-fiche-formation` | Toutes les informations du contrat s'affichent : frais, durée, diplôme, séries, cours du soir, stage, paiement en tranches, cours, débouchés. Les métiers vers lesquels elle mène sont cliquables, les autres formations de l'institut listées, un bouton contact et WhatsApp fonctionnent. |
| P5 | Métiers | `/metiers/:slug` | **Elie NGANGA** | `feat/frontend-metiers` | Un métier sélectionné depuis une fiche formation filtre le catalogue et affiche les formations qui y mènent. Le métier est lisible dans l'adresse. |
| P6 | Fiche institut | `/instituts/:id` | **Arsène AKIANA** | `feat/frontend-fiche-institut` | Présentation, coordonnées, statut d'agrément, frais d'inscription, date de rentrée, liste des formations publiées, formulaire de contact pré-rempli. |
| P7 | À propos | `/a-propos` | **Gilles BITEMO** | `feat/frontend-a-propos` | Le problème décrit, ce que fait Kelasi, le public visé et l'engagement sur l'information s'affichent. |
| P8 | Référencer un institut | `/referencer` | **Samuel AKOMBO** | `feat/frontend-referencer` | Le formulaire de référencement se remplit, se valide et enregistre la demande ; un accusé de réception s'affiche. |
| P9 | Contact et rendez-vous | `/contact` | **Samuel AKOMBO** | `feat/frontend-contact` | La prise de rendez-vous transmet la demande et affiche sa confirmation. Utilisée aussi en version réduite dans la fiche institut. |

---

## 4. Vague 3 — Back-office

| # | Page | Route | Développeur | Branche | Critère de recette |
|---|------|-------|-------------|---------|---------------------|
| P1 | Connexion | `/connexion` | **Lead technique** | `feat/back-office-squelette-auth` | L'identifiant et le mot de passe valides ouvrent la session ; les identifiants erronés affichent une erreur explicite. La session se maintient d'une visite à l'autre et la page est inaccessible sans elle. |
| P10 | Compte | `/compte` | **Lead technique** | `feat/back-office-squelette-auth` | Le compte connecté s'affiche et la déconnexion ferme la session puis revient à la connexion. |
| P11 | Tableau de bord | `/admin` | **Fresnel OBA VERCHY** | `feat/back-office-dashboard` | Les indicateurs de `GET /admin/indicators` s'affichent : formations, instituts, arrondissements couverts, dossiers de contact et de référencement en attente. |
| P12 | Demandes de contact | `/admin/demandes/contact` | **Fresnel OBA VERCHY** | `feat/back-office-demandes-contact` | Les demandes se listent, se filtrent par statut, s'ouvrent au détail et se marquent comme traitées. |
| P13 | Demandes de référencement | `/admin/demandes/referencement` | **Fresnel OBA VERCHY** | `feat/back-office-demandes-referencement` | Les demandes de référencement se listent et s'ouvrent au détail. Une demande validée crée le compte de l'institut. |
| P14 | Liste des formations | `/admin/formations` | **Elie NGANGA** | `feat/back-office-formations-liste` | Le tableau liste toutes les formations, se filtre par institut et par domaine, et se pagine. Chaque ligne offre l'édition et la suppression. |
| P15 | Formulaire formation | `/admin/formations/nouvelle`<br>`/admin/formations/:id` | **Elie NGANGA** | `feat/back-office-formations-formulaire` | Création et édition : toutes les informations du contrat, la cohérence degré et durée contrôlée, les séries du bac validées, les cours et débouchés saisis ligne par ligne. |
| P16 | Liste des instituts | `/admin/instituts` | **Arsène AKIANA** | `feat/back-office-instituts-liste` | Le tableau liste les instituts avec leur statut d'agrément, se filtre par arrondissement et par statut. |
| P17 | Formulaire institut | `/admin/instituts/nouveau`<br>`/admin/instituts/:id` | **Arsène AKIANA** | `feat/back-office-instituts-formulaire` | Création et édition : identité, arrondissement, coordonnées, numéro d'agrément, frais, rentrée, description. Le logo se dépose depuis le formulaire même (JPEG, PNG ou WebP, 2 Mo maximum) : il s'affiche en aperçu, se remplace et se retire. Un institut sans logo garde le bloc coloré à son sigle. |

---

## 5. Vague 4 — Chantiers backend

Aucun de ces chantiers n'a de page visible, mais chacun bloque la mise en
production ou la fiabilité.

| # | Chantier | Branche | Développeur | Contenu | Critère de recette |
|---|----------|---------|-------------|---------|---------------------|
| B1 | Tests automatisés | `feat/backend-tests` | **Gilles BITEMO** | Tests d'intégration sur les dix-sept routes : consultation, filtres du catalogue, authentification, contrôle d'accès aux routes d'administration, upload d'image. Base de données de test isolée. | La suite passe en une commande et échoue si une route change de comportement. |
| B2 | Déploiement et images | `chore/ops-deploiement` | **Arsène AKIANA** | Fichiers de déploiement des trois applications, variables d'environnement de production, procédure de migration et de retour arrière. | Une installation neuve suit la procédure documentée sans intervention manuelle. |
| B3 | Observabilité | `feat/backend-observabilite` | **Fresnel OBA VERCHY** | Journalisation structurée avec un identifiant de requête, route de santé approfondie, mesure du temps de réponse, en-têtes de sécurité, politique d'origines restrictive. | Une requête échouée se retrouve par son identifiant dans les journaux ; la route de santé indique l'état de la base. |
| B4 | Performance et données | `feat/backend-performance` | **Elie NGANGA** | Index sur les colonnes filtrées du catalogue et sur les dates des demandes, pagination par curseur sur les longues listes, correction des requêtes qui chargent des tables entières. | Le catalogue reste rapide avec dix mille formations ; aucune liste d'administration ne renvoie plus la totalité de la table. |
| B5 | Qualité et documentation | `docs/architecture-et-api` | **Samuel AKOMBO** | Documentation de l'architecture, guide de contribution, et vérification que le code et `docs/openapi.yaml` ne divergent pas. | Un nouveau développeur installe le projet et comprend son fonctionnement sans accompagnement humain. |
| B6 | Reprise des données réelles | `chore/backend-donnees-reelles` | **Lead technique** | Remplacement du jeu de démonstration par les formations, instituts, frais et contacts réels de Brazzaville, avec contrôle de cohérence degré et durée. | Un bachelier trouve les instituts réels de son arrondissement, avec des frais et des contacts vérifiés. |
| B7 | Sécurité du compte administrateur | `feat/backend-securite-compte` | **Lead technique** | Rotation des secrets, expiration et renouvellement du jeton, limitation des tentatives de connexion, journalisation des connexions, réinitialisation de mot de passe. | Un mot de passe compromis ne permet pas l'accès ; un jeton expiré est refusé sans planter le client. |

### Pourquoi ces affectations

Les chantiers sont distribués pour équilibrer la charge, pas pour regrouper par
compétence : chacun est indépendant des autres et ne touche pas les mêmes
fichiers.

**Gilles** prend les tests, car son lot de pages est le plus court et parce que
la suite de tests est ce qui rend les lots des autres vérifiables avant fusion.
C'est le seul chantier dont le résultat bénéficie à toute l'équipe.

**Arsène** prend le déploiement, chantier sans lien avec le code applicatif et
donc sans risque de conflit avec les autres lots.

**Fresnel** prend l'observabilité, qui prolonge son lot de pilotage : la route
de santé alimente son tableau de bord.

**Elie** prend la performance, qui concerne majoritairement le catalogue des
formations — son fil métier.

**Samuel** prend la documentation, cohérente avec son rôle de liaison entre le
public et l'administration.

**Le lead technique** prend les deux chantiers qui ne se délèguent pas : les
données réelles, qui exigent de vérifier les frais et contacts auprès des
instituts, et la sécurité des comptes, qui engage sa responsabilité.

---

## 6. Charge par développeur

| Développeur | Pages | Chantiers | Total |
|-------------|-------|-----------|-------|
| **Gilles BITEMO** | P2, P3, P7 | B1 | 4 |
| **Elie NGANGA** | P4, P5, P14, P15 | B4 | 5 |
| **Arsène AKIANA** | P6, P16, P17 | B2 | 4 |
| **Fresnel OBA VERCHY** | P11, P12, P13 | B3 | 4 |
| **Samuel AKOMBO** | P8, P9 | B5 | 3 |
| **Lead technique** | P1, P10 | B6, B7 | 4 |

S'y ajoute pour le lead technique le socle complet — six branches — et la revue
de l'ensemble des pull requests.

Le lot de Samuel passe à trois éléments depuis que le logo est déposé depuis le
formulaire institut (P17) au lieu d'une médiathèque à part. Deux rééquilibrages
possibles, à trancher : lui confier P10 (compte), aujourd'hui dans la branche du
squelette du lead technique, ou un des deux chantiers du lead. À défaut, il
reste disponible pour épauler les lots les plus longs, P14 et P15 d'Elie.

---

## 7. Pourquoi ces affectations de pages

Chaque développeur suit un fil métier de bout en bout — le site public et le
back-office qui le concerne : les mêmes données, les mêmes termes, la même
logique de formulaire.

**Gilles** prend le catalogue, dont il fixe le modèle de rendu réutilisé par
toutes les autres pages publiques : carte de formation, filtres, liste vide,
squelette de chargement. Sa page est donc la première à écrire. Les favoris en
dépendent directement.

**Elie** porte la formation, de la fiche publique au formulaire d'administration.
C'est le fil le plus long — un formulaire à quinze champs — mais il le partage
avec personne : aucun autre développeur ne touche aux formations.

**Arsène** suit le même raisonnement sur les instituts, avec une page publique
en plus que la fiche.

**Fresnel** n'a rien sur le site public parce que les indicateurs et les demandes
n'existent que pour l'équipe. Ses trois pages partagent la même mécanique de
tableau avec filtres et statuts, d'où deux branches seulement : la liste des
statuts est factorisée.

**Samuel** relie le public et l'administration : les deux formulaires publics qui
alimentent les demandes de Fresnel. Le logo des instituts n'est plus une page à
part : il se dépose depuis le formulaire d'Arsène, sans écran dédié ni branche
supplémentaire.

**Le lead technique** ne produit pas de fonctionnalité : il livre le socle, relit
chaque pull request, et prend les deux pages triviales — connexion et compte —
dont dépendent les huit autres pages d'administration.

### Ordre d'exécution imposé

1. Le socle complet avant toute page.
2. Le catalogue (P2) avant les pages qui le réutilisent comme modèle.
3. Les formulaires d'administration avant les listes correspondantes.

Le dépôt d'image suit le formulaire institut (P17) : il n'a plus d'ordre propre.

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
4. La pull request porte sur une seule page. Une pull request qui en couvre
   deux est refusée.

---

## 10. Règles permanentes

- Une branche par page, jamais de commit direct sur `develop`.
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
# Cadrage Jira — Kelasi Brazzaville

Document destiné au Business Analyst, pour créer et organiser le backlog dans
Jira. Il ne contient aucune décision : il reprend le périmètre et les
affectations validés dans `docs/roadmap-dev.md`, et signale ce qui reste à
valider.

---

## 1. Objet

Le produit compte **17 pages** (8 sur le site public, 9 dans le back-office) et
**13 chantiers techniques**. Ce document fournit, pour chacun, la User Story, les
critères d'acceptation au format Given/When/Then, la priorité, le développeur
assigné et les dépendances.

L'objectif est que la création des tickets soit mécanique : le BA n'a qu'à
transposer, compléter les champs Jira et créer les liens.

---

## 2. Sources de vérité

| Source | Rôle | Règle |
|--------|------|-------|
| `docs/openapi.yaml` | Contrat d'API. Les 17 routes décrivent ce que le système expose. | Une divergence entre le code et ce fichier se corrige dans le contrat, par PR dédié — jamais par une dérogation dans le code. |
| `template/index.html` | Prototype. Définit l'apparence, les libellés et les parcours. | Une page peut diverger du prototype si le contrat l'impose ; dans ce cas, le signaler. |
| `docs/roadmap-dev.md` | Répartition validée des pages et chantiers. | N'est pas modifiable par le BA sans arbitrage du lead technique. |
| `docs/schema.sql` | Schéma de la base, 12 tables et une vue. | Toute colonne utilisée par un critère d'acceptation doit exister ici. |

**Outil de gestion de projet : Jira.** Aucun autre outil n'est utilisé pour ce
projet. Si l'organisation Kanban est retenue, ne pas créer de sprints : la
section 7 donne alors l'ordre d'entrée dans le backlog.

---

## 3. Organisation Jira proposée

### 3.1 Epics

Un epic par module fonctionnel, jamais par sprint ni par développeur.

| Clé epic | Nom | Tickets |
|----------|-----|---------|
| `SOCR` | Socle et environnement | S1 à S6 |
| `PUBC` | Site public — catalogue et pages | P2, P3, P4, P5, P6, P7 |
| `PUBD` | Site public — formulaires et contact | P8, P9 |
| `ADMA` | Back-office — accès | P1, P10 |
| `ADMD` | Back-office — pilotage et demandes | P11, P12, P13 |
| `ADMF` | Back-office — formations | P14, P15 |
| `ADMI` | Back-office — instituts | P16, P17 |
| `TECH` | Fondations techniques | B1 à B7 |

### 3.2 Champs à renseigner pour chaque ticket

| Champ | Valeur |
|-------|--------|
| Type | Story |
| Epic | Selon la table 3.1 |
| Assigné | Selon la section 6 |
| Priorité | Selon la section 5 |
| Labels | `frontend` ou `back-office` ou `backend`, plus `socle` pour S1 à S6 |
| Dépendances | Section 7 |
| Sprint | Section 7 |

---

## 4. Stories — pages

Chaque ligne contient la User Story et deux critères d'acceptation. Si l'écran
exige davantage de critères, le BA les ajoute sans contredire ceux-ci.

### 4.1 Site public — catalogue et pages (epic `PUBC`)

| Réf | Page | Assigné |
|---|---|---|
| P2 | Catalogue `/` | Gilles BITEMO |
| P3 | Favoris `/favoris` | Gilles BITEMO |
| P4 | Fiche formation `/formations/:id` | Elie NGANGA |
| P5 | Métiers `/metiers/:slug` | Elie NGANGA |
| P6 | Fiche institut `/instituts/:id` | Arsène AKIANA |
| P7 | À propos `/a-propos` | Gilles BITEMO |

**P2 — Catalogue**
- US : En tant quvisitor, je veux consulter les formations des instituts privés de Brazzaville avec des filtres, afin de trouver celles qui correspondent à mon projet.
- CA1 : *Given* des formations publiées existent, *When* j'ouvre la page d'accueil, *Then* elles s'affichent sous forme de cartes indiquant l'intitulé, l'institut, le diplôme et les frais annuels.
- CA2 : *Given* aucune formation ne correspond aux filtres sélectionnés, *When* la liste se recharge, *Then* un message le signale et propose de réinitialiser les filtres.
- Compléments à vérifier : recherche textuelle ; les six filtres du prototype (métier visé, diplôme, durée, budget annuel, série du bac, arrondissement, organisation) ; les filtres se reflètent dans l'adresse.

**P3 — Favoris**
- US : En tant que visiteur, je veux mettre de côté les formations qui m'intéressent, afin de les retrouver plus tard.
- CA1 : *Given* j'ai mis une formation de côté, *When* je quitte le site puis j'y reviens, *Then* elle figure toujours dans mes favoris.
- CA2 : *Given* j'ai retiré une formation de mes favoris, *When* j'ouvre la page des favoris, *Then* elle n'y figure plus.

**P4 — Fiche formation**
- US : En tant que visiteur, je veux consulter le détail d'une formation, afin de vérifier qu'elle correspond à mon projet avant de me déplacer.
- CA1 : *Given* une formation existe, *When* j'ouvre sa fiche, *Then* j'y vois les frais, la durée, le diplôme visé, les séries du bac acceptées, l'existence de cours du soir, la durée de stage, le paiement en tranches, les cours et les débouchés.
- CA2 : *Given* la formation appartient à un institut, *When* j'ouvre sa fiche, *Then* les autres formations de cet institut sont proposées, ainsi qu'un moyen de la contacter par téléphone et par WhatsApp.
- Compléments à vérifier : les métiers vers lesquels la formation mène sont cliquables et mènent à P5 ; l'identifiant absent de la fiche affiche une page d'erreur et non un écran vide.

**P5 — Métiers**
- US : En tant que visiteur, je veux voir les formations qui mènent à un métier donné, afin de savoir quelles études viser pour ce métier.
- CA1 : *Given* j'ai sélectionné un métier depuis une fiche formation, *When* j'arrive sur la page du métier, *Then* le catalogue est filtré sur ce métier et le nom du métier est lisible dans l'adresse.
- CA2 : *Given* un métier n'a aucune formation, *When* j'ouvre sa page, *Then* un message l'indique et propose de revenir au catalogue.

**P6 — Fiche institut**
- US : En tant que visiteur, je veux consulter la fiche d'un institut, afin de vérifier qu'il est sérieux avant de m'y inscrire.
- CA1 : *Given* un institut existe, *When* j'ouvre sa fiche, *Then* j'y vois sa présentation, son adresse, ses contacts, son statut d'agrément, ses frais d'inscription et sa date de rentrée.
- CA2 : *Given* un institut publie des formations, *When* j'ouvre sa fiche, *Then* elles sont listées et le formulaire de contact est pré-rempli avec l'institut choisi.

**P7 — À propos**
- US : En tant que visiteur, je veux comprendre à quoi sert Kelasi, afin de savoir si je peux m'y fier pour choisir mon orientation.
- CA1 : *Given* j'ouvre la page À propos, *Then* le problème décrit, ce que fait Kelasi, le public visé et l'engagement sur l'information sont présentés.
- Complément : le contenu reprend les quatre sections du prototype.

### 4.2 Site public — formulaires et contact (epic `PUBD`)

| Réf | Page | Assigné |
|---|---|---|
| P8 | Référencer un institut `/referencer` | Samuel AKOMBO |
| P9 | Contact et rendez-vous `/contact` | Samuel AKOMBO |

**P8 — Référencer un institut**
- US : En tant que dirigeant d'institut privé, je veux demander à être référencé, afin que les bacheliers de Brazzaville me trouvent.
- CA1 : *Given* j'ai rempli le formulaire de référencement, *When* je le valide, *Then* ma demande est enregistrée et un accusé de réception s'affiche.
- CA2 : *Given* un champ obligatoire est vide ou incorrect, *When* je valide, *Then* le formulaire est refusé et le champ fautif est signalé.

**P9 — Contact et rendez-vous**
- US : En tant que visiteur, je veux demander un rendez-vous auprès d'un institut, afin de visiter ses locaux avant de m'inscrire.
- CA1 : *Given* j'ai renseigné mon nom, mon adresse électronique, mon téléphone et mon message, *When* j'envoie la demande, *Then* elle est enregistrée et une confirmation s'affiche.
- CA2 : *Given* j'envoie une demande depuis la fiche d'un institut, *When* la demande part, *Then* elle porte déjà le nom de cet institut.
- Attention à la formulation : le champ « adresse électronique » du prototype est ambigu — à confirmer, voir section 8.

### 4.3 Back-office — accès (epic `ADMA`)

| Réf | Page | Assigné |
|---|---|---|
| P1 | Connexion `/connexion` | Lead technique |
| P10 | Compte `/compte` | Lead technique |

**P1 — Connexion**
- US : En tant qu'administrateur, je veux me connecter avec mon identifiant et mon mot de passe, afin d'accéder aux pages d'administration.
- CA1 : *Given* mon identifiant et mon mot de passe sont valides, *When* je les saisis, *Then* j'accède au tableau de bord.
- CA2 : *Given* mon identifiant ou mon mot de passe est erroné, *When* je les saisis, *Then* un message explicite s'affiche sans révéler lequel des deux est incorrect.
- Complément : la session se maintient d'une visite à l'autre ; toute page d'administration est inaccessible sans session.

**P10 — Compte**
- US : En tant qu'administrateur, je veux consulter mon compte et me déconnecter, afin de clôturer mon travail en toute sécurité.
- CA1 : *Given* je suis connecté, *When* j'ouvre la page compte, *Then* mon identité et mon rôle s'affichent.
- CA2 : *Given* je suis connecté, *When* je me déconnecte, *Then* la session est fermée et je reviens à la page de connexion.

### 4.4 Back-office — pilotage et demandes (epic `ADMD`)

| Réf | Page | Assigné |
|---|---|---|
| P11 | Tableau de bord `/admin` | Fresnel OBA VERCHY |
| P12 | Demandes de contact `/admin/demandes/contact` | Fresnel OBA VERCHY |
| P13 | Demandes de référencement `/admin/demandes/referencement` | Fresnel OBA VERCHY |

**P11 — Tableau de bord**
- US : En tant qu'administrateur, je veux voir l'état du catalogue et le nombre de demandes en attente, afin de savoir ce qui demande mon attention.
- CA1 : *Given* le catalogue contient des données, *When* j'ouvre le tableau de bord, *Then* le nombre de formations, le nombre d'instituts, le nombre d'arrondissements couverts et le nombre de demandes en attente s'affichent.
- CA2 : *Given* la base de données est injoignable, *When* j'ouvre le tableau de bord, *Then* un message d'erreur s'affiche plutôt qu'un tableau vide.

**P12 — Demandes de contact**
- US : En tant qu'administrateur, je veux consulter les demandes de rendez-vous reçues, afin d'y répondre et de ne perdre aucune demande.
- CA1 : *Given* des demandes ont été reçues, *When* j'ouvre la page, *Then* elles sont listées avec leur date, leur objet et leur statut.
- CA2 : *Given* une demande est nouvelle, *When* je l'ouvre puis je la marque comme traitée, *Then* son statut change et elle disparaît du compteur des demandes en attente.

**P13 — Demandes de référencement**
- US : En tant qu'administrateur, je veux consulter les demandes de référencement et donner la suite, afin que les instituts intéressés figurent sur Kelasi.
- CA1 : *Given* des demandes de référencement ont été reçues, *When* j'ouvre la page, *Then* elles sont listées avec l'institut, l'arrondissement, le contact et le numéro d'agrément annoncé.
- CA2 : *Given* une demande est recevable, *When* je l'accepte, *Then* le compte de l'institut est créé et l'institut apparaît dans la liste des instituts.
- **Dépend de S2.** Sans la route d'acceptation, ce second critère est inatteignable — voir section 8.

### 4.5 Back-office — formations (epic `ADMF`)

| Réf | Page | Assigné |
|---|---|---|
| P14 | Liste des formations `/admin/formations` | Elie NGANGA |
| P15 | Formulaire formation `/admin/formations/nouvelle` et `/:id` | Elie NGANGA |

**P14 — Liste des formations**
- US : En tant qu'administrateur, je veux parcourir les formations publiées, afin de corriger ou retirer celles qui sont incomplètes.
- CA1 : *Given* le catalogue contient des formations, *When* j'ouvre la liste, *Then* elles s'affichent avec l'institut, le domaine, le diplôme et les frais annuels.
- CA2 : *Given* la liste est longue, *When* j'atteins la fin des résultats, *Then* la liste est paginée et je peux passer à la page suivante.
- Compléments : filtres par institut et par domaine ; chaque ligne offre l'édition et la suppression.

**P15 — Formulaire formation**
- US : En tant qu'administrateur, je veux créer et modifier une formation, afin que le catalogue reste à jour.
- CA1 : *Given* je remplis tous les champs d'une nouvelle formation, *When* je l'enregistre, *Then* elle apparaît dans le catalogue public.
- CA2 : *Given* j'ai choisi un diplôme de niveau licence, *When* je saisis une durée qui ne correspond pas à ce diplôme, *Then* l'enregistrement est refusé et l'incohérence est expliquée.
- Compléments à vérifier : les séries du bac sont saisies et validées ; les cours et les débouchés se saisissent ligne par ligne ; la modification d'une formation existante reprend toutes ses valeurs.

### 4.6 Back-office — instituts (epic `ADMI`)

| Réf | Page | Assigné |
|---|---|---|
| P16 | Liste des instituts `/admin/instituts` | Arsène AKIANA |
| P17 | Formulaire institut `/admin/instituts/nouveau` et `/:id` | Arsène AKIANA |

**P16 — Liste des instituts**
- US : En tant qu'administrateur, je veux parcourir les instituts référencés, afin de vérifier leurs informations et leur agrément.
- CA1 : *Given* des instituts sont référencés, *When* j'ouvre la liste, *Then* ils s'affichent avec leur sigle, leur nom, leur arrondissement et leur statut d'agrément.
- CA2 : *Given* plusieurs arrondissements sont représentés, *When* je filtre par arrondissement ou par statut d'agrément, *Then* seuls les instituts correspondants restent affichés.

**P17 — Formulaire institut**
- US : En tant qu'administrateur, je veux créer et modifier un institut, afin que sa fiche publique soit exacte.
- CA1 : *Given* je remplis tous les champs obligatoires d'un nouvel institut, *When* je l'enregistre, *Then* sa fiche publique est accessible.
- CA2 : *Given* je laisse le numéro d'agrément vide, *When* j'enregistre, *Then* l'institut est enregistré et sa fiche indique que l'agrément est en cours de vérification.
- CA3 : *Given* je choisis un fichier image valide (JPEG, PNG ou WebP, 2 Mo maximum), *When* je l'enregistre, *Then* il devient le logo de l'institut ; retirer le logo ramène le bloc coloré au sigle.
- CA4 : *Given* je choisis un fichier d'un autre format ou trop lourd, *When* je le sélectionne, *Then* il est refusé avec un message explicite et l'aperçu en place est conservé.
- Compléments : identité, arrondissement, adresse, téléphone, WhatsApp, courriel, frais d'inscription, clôture des inscriptions, rentrée, description, logo (dépôt, remplacement, retrait).

---

## 5. Stories — fondations techniques

### 5.1 Socle (epic `SOCR`, assigné au lead technique)

| Réf | Chantier |
|---|---|
| S1 | API REST conforme au contrat |
| S2 | Lecture des demandes et acceptation du référencement |
| S3 | Environnement de développement |
| S4 | Design system |
| S5 | Socle partagé des interfaces |
| S6 | Squelette du back-office |

S1 à S6 ne sont pas des User Stories : ce sont des chantiers techniques sans
valeur utilisateur directe. Les enregistrer comme **tâches**, pas comme stories,
sauf S4 et S6 qui produisent un livrable visible.

**S2** porte deux corrections absentes du contrat actuel. Elles doivent être
inscrites dans `docs/openapi.yaml` avant l'écriture du code :
- deux routes de lecture des demandes de contact et de référencement sous
  `/admin`, avec filtre par statut ;
- une route d'acceptation d'une demande de référencement qui crée l'institut et
  son compte ;
- une colonne de statut sur les deux tables de demandes.

### 5.2 Fondations (epic `TECH`)

| Réf | Chantier | Assigné | Priorité |
|---|---|---|---|
| B1 | Tests automatisés | Gilles BITEMO | Must Have |
| B2 | Déploiement et images | Arsène AKIANA | Must Have |
| B3 | Observabilité | Fresnel OBA VERCHY | Must Have |
| B4 | Performance et données | Elie NGANGA | Should Have |
| B5 | Documentation | Samuel AKOMBO | Should Have |
| B6 | Données réelles | Lead technique | Must Have |
| B7 | Sécurité des comptes | Lead technique | Must Have |

**B1 — Tests automatisés**
- US : En tant que développeur, je veux une suite de tests de non-régression couvrant les routes, afin de fusionner sans casser le comportement existant.
- CA1 : *Given* la base de données de test est prête, *When* je lance la commande de test, *Then* les 17 routes sont vérifiées, y compris le refus d'accès aux routes d'administration sans session.
- CA2 : *Given* une route change de comportement, *When* la suite s'exécute, *Then* elle échoue et désigne la route concernée.

**B2 — Déploiement et images**
- CA1 : *Given* une installation neuve, *When* je suis la procédure documentée, *Then* les trois applications et la base de données sont opérationnelles sans intervention manuelle.
- CA2 : *Given* un déploiement en échec, *When* j'applique la procédure de retour arrière, *Then* la version précédente est restaurée.

**B3 — Observabilité**
- CA1 : *Given* une requête échouée, *When* je cherche son identifiant dans les journaux, *Then* je retrouve la cause de l'échec.
- CA2 : *Given* la base de données est injoignable, *When* j'appelle la route de santé, *Then* elle signale l'indisponibilité au lieu de renvoyer un succès.

**B4 — Performance et données**
- CA1 : *Given* dix mille formations, *When* je consulte le catalogue filtré, *Then* la réponse reste inférieure à une seconde.
- CA2 : *Given* une liste d'administration dépasse la taille d'une page, *When* je la consulte, *Then* elle est paginée au lieu de tout renvoyer.

**B5 — Documentation**
- CA1 : *Given* un développeur rejoint le projet, *When* il suit le guide d'installation et la description d'architecture, *Then* il fait tourner le projet sans accompagnement.
- CA2 : *Given* une route du code n'existe pas dans `docs/openapi.yaml`, *When* la vérification est lancée, *Then* elle signale l'écart.

**B6 — Données réelles**
- CA1 : *Given* les données de démonstration sont remplacées, *When* un bachelier filtre par son arrondissement, *Then* il trouve les instituts réellement présents à Brazzaville.
- CA2 : *Given* les données réelles sont chargées, *When* la cohérence degré et durée est contrôlée, *Then* aucune formation ne présente d'incohérence.

**B7 — Sécurité des comptes**
- CA1 : *Given* un mot de passe a été compromis et la rotation est faite, *Then* il ne permet plus aucun accès.
- CA2 : *Given* un jeton est expiré, *When* il est utilisé, *Then* l'accès est refusé sans erreur côté client.

---

## 6. Affectations

| Développeur | Pages | Chantiers | Total |
|---|---|---|---|
| Gilles BITEMO | P2, P3, P7 | B1 | 4 |
| Elie NGANGA | P4, P5, P14, P15 | B4 | 5 |
| Arsène AKIANA | P6, P16, P17 | B2 | 4 |
| Fresnel OBA VERCHY | P11, P12, P13 | B3 | 4 |
| Samuel AKOMBO | P8, P9 | B5 | 3 |
| Lead technique | P1, P10 | B6, B7 | 4 |

Le lead technique porte en outre S1 à S6 et la revue de toutes les pull
requests. **Son volume est le plus élevé** : c'est le premier arbitrage à
résoudre, soit en retirant une page, soit en confiant S5 à un autre
développeur. Le lot de Samuel est désormais le plus court (P18 ayant disparu) :
lui confier P10 ferait retomber l'écart.

Coordonnées des assignés : voir `docs/roadmap-dev.md`, section 11.

---

## 7. Priorités et dépendances

### 7.1 Priorités MoSCoW

| Priorité | Tickets | Raison |
|---|---|---|
| Must Have | S1, S2, S3, S4, S5, S6, P1, P2, P4, P10, P11, P12, P13, P14, P15, P16, P17, B1, B2, B6, B7 | Sans eux le produit n'est ni démontrable ni vendable. |
| Should Have | P3, P5, P6, P8, P9, B3, B5 | Améliorent l'usage ou la maintenance sans bloquer la livraison. |
| Could Have | P7 | Utile mais reportable. |

P7 est en Could Have : la page À propos n'empêche pas le lancement. Si le
calendrier se resserre, c'est la première à repousser.

### 7.2 Dépendances

À matérialiser dans Jira par le champ « bloque / est bloé par ».

| Ticket | Dépend de | Nature |
|---|---|---|
| P3 | P2 | Réutilise le rendu du catalogue |
| P5 | P4, P2 | Reçoit le métier depuis la fiche, filtre le catalogue |
| P6 | P9 | Réutilise le formulaire de contact |
| P9 | — | — |
| P10 | P1 | Dépend de la session ouverte |
| P11 | P1 | Nécessite une session |
| P12, P13 | **S2** | **Bloqué : route de lecture inexistante** |
| P13 | S2 | Bloqué : route d'acceptation inexistante |
| P14 | P1 | Nécessite une session |
| P15 | P14 | Réutilise les contrôles de la liste |
| P16 | P1 | Nécessite une session |
| P17 | P16 | Réutilise les contrôles de la liste |
| Toutes pages | S1, S3, S4, S5 | Socle obligatoire |
| B1 | S1 | Teste l'API |
| B2 | S1, S2 | Déploie l'API complète |
| B3 | S1 | Instrumente l'API |
| B4 | S1 | Optimise l'API |
| B5 | S1 | Documente l'API |
| B7 | S1, S6 | Protège la session |

### 7.3 Ordre d'exécution

1. **Socle complet** : S1, S2, S3, S4, S5, S6. Rien ne démarre avant.
2. **P2** avant les pages qui réutilisent son modèle de rendu (P3, P5).
3. **P14 avant P15**, et **P16 avant P17** : les formulaires réutilisent les
   contrôles des listes.
4. **B6 avant la livraison** : un catalogue de démonstration ne peut pas être
   vendu à des étudiants.

---

## 8. Points à valider avant création des tickets

Cinq points ne sont pas tranchés. Ne pas inventer la réponse : demander au lead
technique, puis consigner la décision.

| # | Question | Enjeu | Qui décide |
|---|---|---|---|
| 1 | Les routes de lecture des demandes et d'acceptation du référencement sont-elles ajoutées au contrat, ou P12 et P13 perdent-elles leur second critère ? | Deux pages entières | Lead technique |
| 2 | Le formulaire de contact demande une adresse électronique ; le prototype utilise un champ ambigu à cet endroit | Bloque la rédaction du critère de P9 | Lead technique |
| 3 | La suppression d'une formation ou d'un institut est-elle définitive ou réversible ? Le prototype ne demande pas de confirmation alors que le critère la mentionne | Règle métier, à écrire dans la fiche FRD | Lead technique |
| 4 | Le volume réel de demandes est-il suffisant pour justifier une pagination dans le back-office, ou P12 et P13 peuvent-ils afficher une liste simple ? | Détermine le contenu du critère | Lead technique |
| 5 | Le back-office est-il réservé à une seule équipe interne, ou plusieurs instituts disposeront-ils de leur propre compte ? | Change le périmètre de B7 et la règle d'accès aux données | Lead technique |

Un sixième point n'est pas une question mais une correction à faire au moment de
la rédaction des fiches FRD : la page P12 suppose l'existence d'un **statut**
sur les demandes, or `docs/schema.sql` ne définit aujourd'hui aucune colonne de
ce type sur `contact_requests` ni sur `referral_requests`. La fiche FRD doit
porter cette colonne comme donnée en entrée, en cohérence avec S2.

---

## 9. Règles de contribution

À reporter dans la description du projet Jira.

1. Aucun commit direct sur la branche de développement.
2. Aucun envoi sur le dépôt distant sans accord explicite du lead technique.
3. Le design system est la seule source de style : aucune CSS écrite à la main
   dans une application. Une classe manquante s'ajoute dans le design system
   avant d'être contournée.
4. Toute modification du design system est demandée séparément au lead
   technique, jamais depuis un ticket métier.
5. Message de commit au format Conventional Commits, rédigé en français :
   `type(scope) : description`.
6. Une pull request porte sur un seul ticket. Une pull request couvrant deux
   tickets est refusée.
7. Critères d'acceptation d'un ticket : `npm run lint` et `npm run build`
   passent, et le code respecte `docs/openapi.yaml`.

---

## 10. Ce que le BA a à faire

1. Créer les 8 epics de la section 3.1.
2. Créer les 30 tickets : 17 pages, 7 chantiers techniques, 6 tâches de socle
   (S1 à S6, les tâches sauf S4 et S6 qui produisent un livrable visible).
3. Reporter les User Stories et critères d'acceptation des sections 4 et 5.
4. Renseigner les affectations de la section 6 et les priorités de la
   section 7.1.
5. Matérialiser les dépendances de la section 7.2.
6. Organiser les sprints selon la section 7.3, ou ne pas créer de sprint si le
   projet est conduit en Kanban.
7. Transmettre les cinq questions de la section 8 au lead technique et
   enregistrer ses réponses dans les tickets concernés.
8. Ne pas modifier la répartition des tâches sans arbitrage du lead technique :
   elle a été construite pour que deux tickets ne touchent jamais les mêmes
   fichiers.
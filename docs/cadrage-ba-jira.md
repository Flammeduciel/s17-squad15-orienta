# Cadrage Jira — Orienta Brazzaville

Document destiné au Business Analyst, pour créer et organiser le backlog dans
Jira. Il ne contient aucune décision : il reprend le périmètre et les
affectations validés dans `docs/roadmap-dev.md`, et signale ce qui reste à
valider.

---

## 1. Objet

Le produit compte **19 pages** (7 sur le site public, 12 dans le back-office),
**6 blocs backend** et **3 briques de socle**. Ce document fournit, pour chacun, la User Story, les
critères d'acceptation au format Given/When/Then, la priorité, le développeur
assigné et les dépendances.

L'objectif est que la création des tickets soit mécanique : le BA n'a qu'à
transposer, compléter les champs Jira et créer les liens.

---

## 2. Sources de vérité

| Source | Rôle | Règle |
|--------|------|-------|
| `docs/openapi.yaml` | Contrat d'API (version 2.0.0). Ses 43 opérations décrivent ce que le système expose. | Une divergence entre le code et ce fichier se corrige dans le contrat, par PR dédié — jamais par une dérogation dans le code. |
| `template/index.html` et `template/back-office.html` | Maquettes du site public et du back-office. Définissent l'apparence, les libellés et les parcours. | Une page peut diverger d'une maquette si le contrat l'impose ; dans ce cas, le signaler. |
| `docs/roadmap-dev.md` | Répartition validée des pages et chantiers. | N'est pas modifiable par le BA sans arbitrage du lead technique. |
| `docs/schema.sql` | Schéma de la base, 13 tables et une vue. | Toute colonne utilisée par un critère d'acceptation doit exister ici. |

**Outil de gestion de projet : Jira.** Aucun autre outil n'est utilisé pour ce
projet. Si l'organisation Kanban est retenue, ne pas créer de sprints : la
section 7 donne alors l'ordre d'entrée dans le backlog.

---

## 3. Organisation Jira proposée

### 3.1 Epics

Un epic par module fonctionnel, jamais par sprint ni par développeur.

| Clé epic | Nom | Tickets |
|----------|-----|---------|
| `SOCR` | Socle des interfaces | S4, S5, S6 |
| `BACK` | Backend | BK1 à BK6 |
| `PUBC` | Site public — catalogue et pages | P2, P3, P4, P5, P6, P7 |
| `PUBD` | Site public — contact | P9 |
| `ADMA` | Back-office — accès | P1, P10 |
| `ADMD` | Back-office — pilotage | P11 |
| `ADMF` | Back-office — formations | P14, P15 |
| `ADMI` | Back-office — instituts | P16, P17 |
| `ADMR` | Back-office — cours et référentiels | P19, P20, P21, P22, P23 |

### 3.2 Champs à renseigner pour chaque ticket

| Champ | Valeur |
|-------|--------|
| Type | Story |
| Epic | Selon la table 3.1 |
| Assigné | Selon la section 6 |
| Priorité | Selon la section 5 |
| Labels | `frontend` ou `back-office` ou `backend`, plus `socle` pour S4 à S6 |
| Dépendances | Section 7 |
| Sprint | Section 7 |

---

## 4. Stories — pages

Chaque ligne contient la User Story et deux critères d'acceptation. Si l'écran
exige davantage de critères, le BA les ajoute sans contredire ceux-ci.

### 4.1 Site public — catalogue et pages (epic `PUBC`)

| Réf | Page | Assigné |
|---|---|---|
| P2 | Accueil et recherche `/` | Arsène AKIANA |
| P3 | Favoris `/favoris` | Samuel AKOMBO |
| P4 | Fiche formation `/formations/:id` | Elie NGANGA |
| P5 | Débouchés `/debouches/:id` | Elie NGANGA |
| P6 | Fiche institut `/instituts/:id` | Arsène AKIANA |
| P7 | À propos `/a-propos` | Fresnel OBA VERCHY |

**P2 — Accueil et recherche**
- US : En tant que visiteur, je veux trouver un institut, une filière ou un diplôme depuis l'accueil, afin de repérer les établissements qui correspondent à mon projet.
- CA1 : *Given* j'ouvre la page d'accueil, *Then* une barre de recherche « institut, filière ou diplôme » et quatre accès — instituts, formations, diplômes, débouchés — s'affichent, et la liste des instituts est présentée par défaut avec leur arrondissement, leur badge d'agrément et leurs frais d'inscription.
- CA2 : *Given* aucun résultat ne correspond à ma recherche ou à mes filtres, *When* la liste se recharge, *Then* le message « Résultat introuvable » s'affiche, invite à vérifier l'orthographe et propose d'effacer les filtres.
- Compléments à vérifier : chaque accès change la grille (instituts, formations, diplômes avec leur durée, débouchés) ; les filtres du prototype (arrondissement, débouché visé, diplôme, durée, budget annuel, série du bac, organisation) ; les séries, durées et domaines proposés viennent des référentiels, pas de listes figées ; les filtres se reflètent dans l'adresse.

**P3 — Favoris**
- US : En tant que visiteur, je veux mettre de côté les formations qui m'intéressent, afin de les retrouver plus tard.
- CA1 : *Given* j'ai mis une formation de côté, *When* je quitte le site puis j'y reviens, *Then* elle figure toujours dans mes favoris.
- CA2 : *Given* j'ai retiré une formation de mes favoris, *When* j'ouvre la page des favoris, *Then* elle n'y figure plus.

**P4 — Fiche formation**
- US : En tant que visiteur, je veux consulter le détail d'une formation, afin de vérifier qu'elle correspond à mon projet avant de me déplacer.
- CA1 : *Given* une formation existe, *When* j'ouvre sa fiche, *Then* j'y vois le diplôme et sa durée, les frais par niveau, les séries du bac admises et les autres conditions d'admission, l'existence de cours du soir, la durée de stage, le paiement en tranches, le programme année par année et les débouchés.
- CA2 : *Given* la formation appartient à un institut, *When* j'ouvre sa fiche, *Then* les autres formations de cet institut sont proposées, ainsi qu'un moyen de contacter l'institut par téléphone, par WhatsApp et par le formulaire de question.
- Compléments à vérifier : les débouchés de la formation sont cliquables et mènent à P5 ; une formation en brouillon n'est pas consultable ; l'identifiant absent de la fiche affiche une page d'erreur et non un écran vide.

**P5 — Débouchés**
- US : En tant que visiteur, je veux voir les formations qui mènent à un débouché donné, afin de savoir quelles études viser pour ce métier.
- CA1 : *Given* j'ai sélectionné un débouché depuis une fiche ou depuis l'accueil, *When* j'arrive sur sa page, *Then* les formations sont filtrées sur ce débouché et son nom est lisible dans l'adresse.
- CA2 : *Given* un débouché n'a aucune formation publiée, *When* j'ouvre sa page, *Then* un message l'indique et propose de revenir à l'accueil.

**P6 — Fiche institut**
- US : En tant que visiteur, je veux consulter la fiche d'un institut, afin de vérifier qu'il est sérieux avant de m'y inscrire.
- CA1 : *Given* un institut existe, *When* j'ouvre sa fiche, *Then* j'y vois son image, sa présentation, son adresse, ses contacts, ses frais d'inscription, sa clôture d'inscription et sa date de rentrée ; s'il est agréé, un badge bleu et son numéro d'agrément, sinon son nom seul.
- CA2 : *Given* un institut publie des formations, *When* j'ouvre sa fiche, *Then* j'y vois ses diplômes délivrés, ses débouchés, et pour chaque formation publiée ses tarifs par niveau et ses conditions d'admission.
- Compléments : avantages de l'institut s'il en a ; contact par WhatsApp avec message pré-rempli, par e-mail et par appel.

**P7 — À propos**
- US : En tant que visiteur, je veux comprendre à quoi sert Orienta, afin de savoir si je peux m'y fier pour choisir mon orientation.
- CA1 : *Given* j'ouvre la page À propos, *Then* le problème décrit, ce que fait Orienta, le public visé et l'engagement sur l'information sont présentés.
- Complément : le contenu reprend les quatre sections du prototype.

### 4.2 Site public — contact (epic `PUBD`)

| Réf | Page | Assigné |
|---|---|---|
| P9 | Question à un institut (formulaire de la fiche formation) | Samuel AKOMBO |

**P9 — Question à un institut**
- US : En tant que visiteur, je veux poser une question à un institut depuis la fiche d'une formation, afin d'obtenir une réponse avant de me déplacer.
- CA1 : *Given* j'ai renseigné mon nom, mon adresse e-mail et ma question, *When* j'envoie le formulaire, *Then* la question est transmise à l'institut et un accusé de réception s'affiche.
- CA2 : *Given* j'ouvre le formulaire depuis la fiche d'une formation, *When* la demande part, *Then* elle porte déjà cette formation et son institut.
- Complément : un champ vide ou une adresse e-mail incorrecte refuse l'envoi et signale le champ fautif.

La page « Référencer un institut » (P8) est retirée : aucune exigence ne la
demande, et la Squad collecte elle-même les informations des instituts.

### 4.3 Back-office — accès (epic `ADMA`)

| Réf | Page | Assigné |
|---|---|---|
| P1 | Connexion `/connexion` | Samuel AKOMBO |
| P10 | Compte `/compte` | Samuel AKOMBO |

**P1 — Connexion**
- US : En tant qu'administrateur, je veux me connecter avec mon nom d'utilisateur et mon mot de passe, afin d'accéder aux pages d'administration.
- CA1 : *Given* mon identifiant et mon mot de passe sont valides, *When* je les saisis, *Then* j'accède au tableau de bord.
- CA2 : *Given* mon identifiant ou mon mot de passe est erroné, *When* je les saisis, *Then* un message explicite s'affiche sans révéler lequel des deux est incorrect.
- CA3 : *Given* j'ai oublié mon mot de passe, *When* je clique sur « Mot de passe oublié » et saisis l'e-mail de mon compte, *Then* un lien de réinitialisation m'est envoyé (EX-17).
- Compléments : la session se maintient d'une visite à l'autre ; toute page d'administration est inaccessible sans session ; la page ne propose aucune inscription, les comptes sont ouverts par un SuperAdmin.

**P10 — Compte**
- US : En tant qu'administrateur, je veux consulter mon compte et me déconnecter, afin de clôturer mon travail en toute sécurité.
- CA1 : *Given* je suis connecté, *When* j'ouvre la page compte, *Then* mon identité et mon rôle s'affichent.
- CA2 : *Given* je suis connecté, *When* je me déconnecte, *Then* la session est fermée et je reviens à la page de connexion.

### 4.4 Back-office — pilotage (epic `ADMD`)

| Réf | Page | Assigné |
|---|---|---|
| P11 | Tableau de bord `/admin` | Fresnel OBA VERCHY |

**P11 — Tableau de bord**
- US : En tant qu'administrateur, je veux voir les indicateurs clés du catalogue, afin de piloter la plateforme.
- CA1 : *Given* le catalogue contient des données, *When* j'ouvre le tableau de bord, *Then* les 5 indicateurs s'affichent : nombre d'établissements, de formations et filières, d'arrondissements couverts, de diplômes délivrés et de débouchés (EX-07).
- CA2 : *Given* la base de données est injoignable, *When* j'ouvre le tableau de bord, *Then* un message d'erreur s'affiche plutôt qu'un tableau vide.
- Complément : les cartes restent lisibles sur petit écran, sans débordement.

Les pages « Demandes de contact » (P12) et « Demandes de référencement » (P13)
sont retirées : aucune exigence ne prévoit de boîte de réception dans le
back-office.

### 4.5 Back-office — formations (epic `ADMF`)

| Réf | Page | Assigné |
|---|---|---|
| P14 | Liste des formations `/admin/formations` | Elie NGANGA |
| P15 | Formulaire formation `/admin/formations/nouvelle` et `/:id` | Elie NGANGA |

**P14 — Liste des formations**
- US : En tant qu'administrateur, je veux parcourir les formations, publiées ou en brouillon, afin de corriger ou retirer celles qui sont incomplètes.
- CA1 : *Given* le catalogue contient des formations, *When* j'ouvre la liste, *Then* elles s'affichent avec l'institut, le domaine, le diplôme et les frais annuels.
- CA2 : *Given* la liste est longue, *When* j'atteins la fin des résultats, *Then* la liste est paginée et je peux passer à la page suivante.
- Compléments : recherche, filtres par domaine et par statut ; chaque ligne offre l'édition et la suppression avec confirmation.

**P15 — Formulaire formation**
- US : En tant qu'administrateur, je veux créer et modifier une formation, afin que le catalogue reste à jour.
- CA1 : *Given* je remplis tous les champs d'une nouvelle formation au statut publié, *When* je l'enregistre, *Then* elle apparaît sur le site public ; au statut brouillon, elle n'y apparaît pas.
- CA2 : *Given* je choisis un diplôme, *When* je le sélectionne, *Then* la durée des études s'affiche d'après ce diplôme, sans être saisie, et un champ de frais est proposé pour chaque année.
- Compléments à vérifier : les séries du bac et les débouchés se cochent dans leurs référentiels ; aucune série cochée signifie que la série n'est pas un critère ; le programme s'affiche année par année et renvoie vers la page Cours (P19) ; une formation créée enchaîne sur l'ajout de ses cours ; un même institut ne peut pas avoir deux formations du même nom ; la modification reprend toutes les valeurs.

### 4.6 Back-office — instituts (epic `ADMI`)

| Réf | Page | Assigné |
|---|---|---|
| P16 | Liste des instituts `/admin/instituts` | Arsène AKIANA |
| P17 | Formulaire institut `/admin/instituts/nouveau` et `/:id` | Arsène AKIANA |

**P16 — Liste des instituts**
- US : En tant qu'administrateur, je veux parcourir les instituts référencés, afin de vérifier leurs informations et leur agrément.
- CA1 : *Given* des instituts sont référencés, *When* j'ouvre la liste, *Then* ils s'affichent avec leur sigle, leur nom, leur arrondissement et leur numéro d'agrément, ou la mention « Non agréé ».
- CA2 : *Given* plusieurs arrondissements sont représentés, *When* je filtre par arrondissement ou par agrément, *Then* seuls les instituts correspondants restent affichés.

**P17 — Formulaire institut**
- US : En tant qu'administrateur, je veux créer et modifier un institut, afin que sa fiche publique soit exacte.
- CA1 : *Given* je remplis tous les champs obligatoires d'un nouvel institut, *When* je l'enregistre, *Then* sa fiche publique est accessible.
- CA2 : *Given* je laisse le numéro d'agrément vide, *When* j'enregistre, *Then* l'institut est enregistré comme non agréé et sa fiche publique affiche son nom seul, sans badge (EX-14).
- CA3 : *Given* je choisis un fichier image valide (JPEG, PNG ou WebP, 2 Mo maximum), *When* je l'enregistre, *Then* il devient l'image de l'institut, affichée sur sa fiche publique ; retirer l'image ramène le bloc coloré au sigle.
- CA4 : *Given* je choisis un fichier d'un autre format ou trop lourd, *When* je le sélectionne, *Then* il est refusé avec un message explicite et l'aperçu en place est conservé.
- Compléments : identité, arrondissement, adresse, téléphone, WhatsApp, courriel, frais d'inscription, clôture des inscriptions, rentrée (jamais avant la clôture), description, avantages, image (dépôt, remplacement, retrait) ; nom et sigle uniques ; supprimer un institut supprime ses formations, après confirmation.

### 4.7 Back-office — cours et référentiels (epic `ADMR`)

| Réf | Page | Assigné |
|---|---|---|
| P19 | Cours `/admin/cours` | Samuel AKOMBO |
| P20 | Diplômes `/admin/diplomes` | Fresnel OBA VERCHY |
| P21 | Débouchés `/admin/debouches` | Fresnel OBA VERCHY |
| P22 | Séries du bac `/admin/series` | Fresnel OBA VERCHY |
| P23 | Domaines d'insertion `/admin/domaines` | Fresnel OBA VERCHY |

**P19 — Cours**
- US : En tant qu'administrateur, je veux gérer un catalogue de cours et les rattacher aux formations, afin que le programme de chaque formation soit exact, année par année.
- CA1 : *Given* je crée un cours et je le rattache à deux formations en précisant l'année d'études de chacune, *When* j'enregistre, *Then* il apparaît dans le programme des deux formations, à l'année choisie.
- CA2 : *Given* la liste est filtrée sur une formation, *When* je rattache un cours déjà au catalogue ou que j'en retire un, *Then* le programme de cette formation change et le cours reste au catalogue.
- Compléments : les années proposées viennent du diplôme de la formation ; un intitulé déjà présent au catalogue est refusé ; supprimer un cours le retire de toutes ses formations, après confirmation.

**P20 — Diplômes**
- US : En tant qu'administrateur, je veux gérer les diplômes et leur durée, afin que chaque formation affiche la bonne durée d'études.
- CA1 : *Given* j'ajoute un diplôme avec une durée de 1 à 5 ans, *When* j'enregistre, *Then* il est proposé dans le formulaire formation et dans la recherche publique.
- CA2 : *Given* un diplôme est délivré par au moins une formation, *When* je tente de le supprimer, *Then* la suppression est refusée et le nombre de formations concernées est indiqué.
- Complément : modifier la durée s'applique à toutes les formations du diplôme (frais et programme ajustés).

**P21 — Débouchés**
- US : En tant qu'administrateur, je veux gérer les débouchés et leur domaine d'insertion, afin de les rattacher aux formations (EX-08).
- CA1 : *Given* j'ajoute un débouché avec son domaine, *When* j'enregistre, *Then* il est proposé dans le formulaire formation.
- CA2 : *Given* un débouché est porté par une formation, *When* je tente de le supprimer, *Then* la suppression est refusée.
- Complément : renommer un débouché se répercute dans les formations qui le portent.

**P22 — Séries du bac**
- US : En tant qu'administrateur, je veux gérer les séries du bac, afin de les rattacher aux formations comme conditions d'admission.
- CA1 : *Given* j'ajoute une série avec son code et son libellé, *When* j'enregistre, *Then* elle est proposée dans le formulaire formation et dans le filtre public « Ma série du bac ».
- CA2 : *Given* une série est admise par une formation, *When* je tente de la supprimer, *Then* la suppression est refusée.

**P23 — Domaines d'insertion**
- US : En tant qu'administrateur, je veux gérer les domaines d'insertion, afin de classer les formations et les débouchés.
- CA1 : *Given* j'ajoute un domaine avec sa couleur, *When* j'enregistre, *Then* il est proposé dans les formulaires formation et débouché, et dans la barre de catégories du site public.
- CA2 : *Given* un domaine classe une formation ou un débouché, *When* je tente de le supprimer, *Then* la suppression est refusée.
- Complément : renommer un domaine ne change rien à ce qui y est rattaché.

---

## 5. Tâches — backend et socle

Ce ne sont pas des User Stories : ce sont des chantiers techniques. Les
enregistrer comme **tâches**. Le détail du contenu de chacun est dans
`docs/roadmap-dev.md`, sections 2 et 3.

### 5.1 Backend (epic `BACK`)

| Réf | Bloc | Assigné | Terminé quand |
|---|---|---|---|
| BK1 | Socle de l'API | Flamme | L'API démarre, se connecte à la base et renvoie ses erreurs au format commun. |
| BK2 | Authentification | Flamme | La connexion délivre un jeton, toute route `/admin` le réclame. La connexion se fait par adresse e-mail et mot de passe. |
| BK3 | Référentiels | Gilles BITEMO | Domaines, diplômes, séries du bac et débouchés se lisent publiquement et s'administrent ; un élément utilisé ne peut pas être supprimé. |
| BK4 | Instituts | Gilles BITEMO | Les instituts se listent, se consultent et s'administrent ; leur image se dépose. |
| BK5 | Formations | Flamme | Les formations se recherchent, se consultent et s'administrent avec leurs frais par niveau, séries et débouchés ; les 5 KPI sont servis. |
| BK6 | Cours et contact | Gilles BITEMO | Les cours s'administrent et se rattachent aux formations par année ; une question posée depuis une fiche est transmise à l'institut. |

### 5.2 Socle des interfaces (epic `SOCR`)

| Réf | Brique | Assigné | Terminé quand |
|---|---|---|---|
| S4 | Design system | Flamme | **Livré.** |
| S5 | Couche commune des interfaces | Arsène AKIANA | Les deux interfaces appellent l'API, gèrent les erreurs et la session par les mêmes composants. |
| S6 | Squelette du back-office | Samuel AKOMBO | La mise en page, le menu latéral et la garde de session encadrent les pages d'administration. Livré avec P1 et P10. |

Les anciens tickets S1 (API REST), S2 (lecture des demandes) et S3
(environnement de développement) n'existent plus : S1 est remplacé par les six
blocs backend, S2 est retiré avec les pages P12 et P13, S3 est fait avec BK1. Les
chantiers B1 à B7 (tests, déploiement, observabilité, performance,
documentation, données réelles, sécurité) sortent de ce backlog : ils seront
planifiés après l'implémentation.

---

## 6. Affectations

| Développeur | Sujet | Backend / socle | Site public | Back-office |
|---|---|---|---|---|
| Flamme (lead technique) | Backend | BK1, BK2, BK5, S4 | — | — |
| Gilles BITEMO | Backend | BK3, BK4, BK6 | — | — |
| Elie NGANGA | Formations | — | P4, P5 | P14, P15 |
| Arsène AKIANA | Instituts | S5 | P2, P6 | P16, P17 |
| Fresnel OBA VERCHY | Pilotage et référentiels | — | P7 | P11, P20, P21, P22, P23 |
| Samuel AKOMBO | Accès et cours | S6 | P3, P9 | P1, P10, P19 |

Le backend est porté par Flamme et Gilles ; les quatre autres développeurs ont
chacun des pages sur le site public et dans le back-office. Le lead technique
relit en plus toutes les pull requests. Les quatre référentiels de Fresnel
partagent une seule mécanique et une seule branche.

Coordonnées des assignés : voir `docs/roadmap-dev.md`, section 11.

---

## 7. Priorités et dépendances

### 7.1 Priorités MoSCoW

| Priorité | Tickets | Raison |
|---|---|---|
| Must Have | BK1 à BK6, S5, S6, P1, P2, P4, P6, P9, P10, P11, P14, P15, P16, P17, P19, P20, P21 | Sans eux le produit n'est ni démontrable ni conforme au catalogue d'exigences (EX-01 à EX-16). |
| Should Have | P3, P5, P22, P23 | Améliorent l'usage sans bloquer la livraison. |
| Could Have | P7 | Utile mais reportable. |

P7 est en Could Have : la page À propos n'empêche pas le lancement. Si le
calendrier se resserre, c'est la première à repousser.

### 7.2 Dépendances

À matérialiser dans Jira par le lien « est bloqué par ». Chaque ligne se lit :
**le ticket de gauche est bloqué par celui de droite**. Un ticket bloqué peut être
développé contre le contrat `docs/openapi.yaml`, mais pas recetté.

**Backend**

| Ticket | Est bloqué par | Raison |
|---|---|---|
| BK2 | BK1 | Utilise la structure de l'API et la connexion à la base |
| BK3 | BK1, BK2 | BK1 pour la lecture publique, BK2 pour le CRUD `/admin` |
| BK4 | BK1, BK2 | BK1 pour la lecture publique, BK2 pour le CRUD `/admin` et l'image |
| BK5 | BK3, BK4 | Une formation référence diplôme, domaine, séries, débouchés et institut |
| BK6 | BK5 | Un cours se rattache à une formation ; une question vise une formation |

**Socle des interfaces**

| Ticket | Est bloqué par | Raison |
|---|---|---|
| S5 | S4 (livré) | Les composants transverses utilisent le design system |
| S6 | S5 | Utilise le client HTTP et le contexte de session |
| Toutes les pages | S5 | Aucune page n'appelle l'API sans la couche commune |
| Toutes les pages du back-office | S6, P1 | Elles s'affichent dans le squelette, derrière la connexion |

**Site public**

| Ticket | Est bloqué par | Raison |
|---|---|---|
| P2 | BK3, BK4, BK5 | Liste les instituts, lit les référentiels pour les filtres, affiche les formations |
| P3 | P2, BK5 | Réutilise la carte de formation ; recharge les formations |
| P4 | BK5, BK6 | Fiche de la formation ; programme par année issu des cours |
| P5 | P2, P4, BK3, BK5 | Réutilise la grille de l'accueil ; on y arrive depuis une fiche formation |
| P6 | P2, BK4, BK5 | Fiche de l'institut ; réutilise la carte de formation et liste ses formations |
| P7 | — | Page statique : seulement le socle |
| P9 | P4, BK6 | S'intègre à la fiche formation ; appelle `POST /contact` |

**Back-office**

| Ticket | Est bloqué par | Raison |
|---|---|---|
| P1 | BK2 | Connexion |
| P10 | P1 | Affiche la session ouverte et la ferme |
| P11 | BK5 | Lit les 5 KPI |
| P14 | BK5 | Liste, filtre et supprime les formations |
| P15 | P14, BK3, BK4, BK5 | Réutilise les contrôles de la liste ; propose référentiels et instituts |
| P16 | BK4 | Liste, filtre et supprime les instituts |
| P17 | P16, BK4 | Réutilise les contrôles de la liste ; dépose l'image |
| P19 | P15, BK6 | P15 y renvoie après une création ; gère cours et rattachements |
| P20, P21, P22, P23 | BK3 | CRUD des diplômes, débouchés, séries et domaines |

P15 n'est pas bloqué par P20 à P23 : les référentiels sont déjà remplis par le
jeu de démonstration.

### 7.3 Ordre d'exécution

| Étape | Backend | Interfaces |
|---|---|---|
| 1 | BK1 | S5, puis P7 |
| 2 | BK2 ; BK3 et BK4 en parallèle | S6 avec P1 et P10 |
| 3 | BK5 | P16, P17, P6 ; P20 à P23 |
| 4 | BK6 | P2 ; P14, P15, P4 ; P11 ; P3 |
| 5 | — | P5 ; P19, P9 |

---

## 8. Points à valider avant création des tickets

### 8.1 Points tranchés par les maquettes et le contrat

Ces questions figuraient dans la version précédente ; elles sont closes.

| Ancienne question | Réponse |
|---|---|
| Routes de lecture des demandes et d'acceptation du référencement | Sans objet : P8, P12, P13 et S2 sont retirés. |
| Champ ambigu du formulaire de contact | Le formulaire demande le nom, l'adresse e-mail et la question. |
| Suppression définitive ou réversible | Définitive, toujours après confirmation. Supprimer un institut supprime ses formations ; un référentiel encore utilisé ne peut pas être supprimé. |
| Pagination des demandes | Sans objet. |
| Back-office pour une ou plusieurs équipes | Réservé à la Squad. Les instituts n'ont aucun accès (Product Discovery §2). |

### 8.2 Points encore ouverts

Ne pas inventer la réponse : demander, puis consigner la décision.

| # | Question | Enjeu | Qui décide |
|---|---|---|---|
| 1 | EX-15 / US-15 demandent un formulaire de création de compte administrateur ; il a été retiré du back-office pour raison de sécurité (Product Discovery §10). L'exigence est-elle retirée ou reformulée (« un SuperAdmin ouvre les comptes ») ? | Le catalogue d'exigences et le produit se contredisent | PM et BA |
| 2 | Les favoris (P3) et les filtres budget, série, cours du soir et stage ne correspondent à aucune exigence. Sont-ils gardés en Should Have ou retirés ? | Périmètre de P2 et P3 | PM |
| 3 | Le nom affiché était « Kelasi » dans les premières maquettes ; il est maintenant « Orienta » partout, comme dans les documents produit. À confirmer. | Libellés de toutes les pages | PM |

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

1. Créer les 9 epics de la section 3.1.
2. Créer les 28 tickets : 19 pages, 6 blocs backend (BK1 à BK6) et 3 briques
   de socle (S4 à S6), les blocs et les briques en tâches.
3. Reporter les User Stories et critères d'acceptation des sections 4 et 5.
4. Renseigner les affectations de la section 6 et les priorités de la
   section 7.1.
5. Matérialiser les dépendances de la section 7.2.
6. Organiser les sprints selon la section 7.3, ou ne pas créer de sprint si le
   projet est conduit en Kanban.
7. Transmettre les trois questions de la section 8.2 à leurs décideurs et
   enregistrer les réponses dans les tickets concernés.
8. Ne pas modifier la répartition des tâches sans arbitrage du lead technique :
   elle a été construite pour que deux tickets ne touchent jamais les mêmes
   fichiers.
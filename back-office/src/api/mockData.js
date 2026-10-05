// Données de démonstration, tirées de la maquette back-office.html.
// Utilisées uniquement quand VITE_USE_MOCK_API=true (voir src/config.js).

export const SEED_FORMATIONS = [
  {
    "id": "compta",
    "nom": "Comptabilité et gestion des entreprises",
    "institut": "ISGF",
    "diplome": "BTS",
    "duree": 2
  },
  {
    "id": "banque",
    "nom": "Banque et assurance",
    "institut": "ISGF",
    "diplome": "Licence pro",
    "duree": 3
  },
  {
    "id": "rh",
    "nom": "Gestion des ressources humaines",
    "institut": "ISGF",
    "diplome": "Licence",
    "duree": 3
  },
  {
    "id": "audit",
    "nom": "Audit et contrôle de gestion",
    "institut": "ISGF",
    "diplome": "Master",
    "duree": 2
  },
  {
    "id": "devweb",
    "nom": "Développement web et mobile",
    "institut": "ESIM",
    "diplome": "BTS",
    "duree": 2
  },
  {
    "id": "reseaux",
    "nom": "Réseaux et télécommunications",
    "institut": "ESIM",
    "diplome": "Licence",
    "duree": 3
  },
  {
    "id": "logiciel",
    "nom": "Génie logiciel",
    "institut": "ESIM",
    "diplome": "Master",
    "duree": 2
  },
  {
    "id": "maint",
    "nom": "Maintenance informatique",
    "institut": "ESIM",
    "diplome": "BTS",
    "duree": 2
  },
  {
    "id": "electro",
    "nom": "Électrotechnique",
    "institut": "IPM",
    "diplome": "BTS",
    "duree": 2
  },
  {
    "id": "gc",
    "nom": "Génie civil et bâtiment",
    "institut": "IPM",
    "diplome": "Licence",
    "duree": 3
  },
  {
    "id": "prodpet",
    "nom": "Production pétrolière",
    "institut": "IPM",
    "diplome": "BTS",
    "duree": 2
  },
  {
    "id": "hse",
    "nom": "Hygiène, sécurité et environnement (HSE)",
    "institut": "IPM",
    "diplome": "Licence pro",
    "duree": 3
  },
  {
    "id": "infirm",
    "nom": "Sciences infirmières",
    "institut": "ISD",
    "diplome": "Licence",
    "duree": 3
  },
  {
    "id": "labo",
    "nom": "Techniques de laboratoire médical",
    "institut": "ISD",
    "diplome": "BTS",
    "duree": 2
  },
  {
    "id": "sagef",
    "nom": "Sage-femme",
    "institut": "ISD",
    "diplome": "Licence",
    "duree": 3
  },
  {
    "id": "pharma",
    "nom": "Préparateur en pharmacie",
    "institut": "ISD",
    "diplome": "BTS",
    "duree": 2
  },
  {
    "id": "journ",
    "nom": "Communication et journalisme",
    "institut": "IHT",
    "diplome": "Licence",
    "duree": 3
  },
  {
    "id": "mkt",
    "nom": "Marketing digital",
    "institut": "IHT",
    "diplome": "BTS",
    "duree": 2
  },
  {
    "id": "transp",
    "nom": "Transport et logistique",
    "institut": "ECLC",
    "diplome": "BTS",
    "duree": 2
  },
  {
    "id": "cominter",
    "nom": "Commerce international",
    "institut": "ECLC",
    "diplome": "Licence",
    "duree": 3
  },
  {
    "id": "droitaff",
    "nom": "Droit des affaires",
    "institut": "IJL",
    "diplome": "Licence",
    "duree": 3
  },
  {
    "id": "adminpub",
    "nom": "Administration publique",
    "institut": "IJL",
    "diplome": "Licence",
    "duree": 3
  },
  {
    "id": "secret",
    "nom": "Secrétariat de direction",
    "institut": "IJL",
    "diplome": "BTS",
    "duree": 2
  },
  {
    "id": "agro",
    "nom": "Agronomie et agro-business",
    "institut": "ISAM",
    "diplome": "BTS",
    "duree": 2
  },
  {
    "id": "envir",
    "nom": "Environnement, eaux et forêts",
    "institut": "ISAM",
    "diplome": "Licence",
    "duree": 3
  },
  {
    "id": "hotel",
    "nom": "Hôtellerie et tourisme",
    "institut": "ISAM",
    "diplome": "BTS",
    "duree": 2
  }
]

export const SEED_COURS = [
  {
    "id": "c1",
    "nom": "Comptabilité générale",
    "liens": [
      {
        "formation": "compta",
        "annee": 1
      }
    ]
  },
  {
    "id": "c2",
    "nom": "Mathématiques financières",
    "liens": [
      {
        "formation": "compta",
        "annee": 1
      }
    ]
  },
  {
    "id": "c3",
    "nom": "Droit des affaires",
    "liens": [
      {
        "formation": "compta",
        "annee": 1
      }
    ]
  },
  {
    "id": "c4",
    "nom": "Excel et Word",
    "liens": [
      {
        "formation": "compta",
        "annee": 1
      }
    ]
  },
  {
    "id": "c5",
    "nom": "Comptabilité analytique",
    "liens": [
      {
        "formation": "compta",
        "annee": 2
      }
    ]
  },
  {
    "id": "c6",
    "nom": "Fiscalité congolaise",
    "liens": [
      {
        "formation": "compta",
        "annee": 2
      }
    ]
  },
  {
    "id": "c7",
    "nom": "Logiciel Sage Compta",
    "liens": [
      {
        "formation": "compta",
        "annee": 2
      }
    ]
  },
  {
    "id": "c8",
    "nom": "Économie générale",
    "liens": [
      {
        "formation": "banque",
        "annee": 1
      }
    ]
  },
  {
    "id": "c9",
    "nom": "Comptabilité",
    "liens": [
      {
        "formation": "banque",
        "annee": 1
      },
      {
        "formation": "cominter",
        "annee": 1
      }
    ]
  },
  {
    "id": "c10",
    "nom": "Statistiques",
    "liens": [
      {
        "formation": "banque",
        "annee": 1
      }
    ]
  },
  {
    "id": "c11",
    "nom": "Techniques bancaires",
    "liens": [
      {
        "formation": "banque",
        "annee": 2
      }
    ]
  },
  {
    "id": "c12",
    "nom": "Droit bancaire CEMAC",
    "liens": [
      {
        "formation": "banque",
        "annee": 2
      }
    ]
  },
  {
    "id": "c13",
    "nom": "Marketing des services",
    "liens": [
      {
        "formation": "banque",
        "annee": 2
      }
    ]
  },
  {
    "id": "c14",
    "nom": "Analyse du risque crédit",
    "liens": [
      {
        "formation": "banque",
        "annee": 3
      }
    ]
  },
  {
    "id": "c15",
    "nom": "Assurance IARD",
    "liens": [
      {
        "formation": "banque",
        "annee": 3
      }
    ]
  },
  {
    "id": "c16",
    "nom": "Introduction au management",
    "liens": [
      {
        "formation": "rh",
        "annee": 1
      }
    ]
  },
  {
    "id": "c17",
    "nom": "Psychologie du travail",
    "liens": [
      {
        "formation": "rh",
        "annee": 1
      }
    ]
  },
  {
    "id": "c18",
    "nom": "Droit civil",
    "liens": [
      {
        "formation": "rh",
        "annee": 1
      },
      {
        "formation": "droitaff",
        "annee": 1
      }
    ]
  },
  {
    "id": "c19",
    "nom": "Droit du travail congolais",
    "liens": [
      {
        "formation": "rh",
        "annee": 2
      }
    ]
  },
  {
    "id": "c20",
    "nom": "Paie et administration du personnel",
    "liens": [
      {
        "formation": "rh",
        "annee": 2
      }
    ]
  },
  {
    "id": "c21",
    "nom": "Communication interne",
    "liens": [
      {
        "formation": "rh",
        "annee": 2
      }
    ]
  },
  {
    "id": "c22",
    "nom": "Recrutement et formation",
    "liens": [
      {
        "formation": "rh",
        "annee": 3
      }
    ]
  },
  {
    "id": "c23",
    "nom": "GPEC",
    "liens": [
      {
        "formation": "rh",
        "annee": 3
      }
    ]
  },
  {
    "id": "c24",
    "nom": "Audit comptable et financier",
    "liens": [
      {
        "formation": "audit",
        "annee": 1
      }
    ]
  },
  {
    "id": "c25",
    "nom": "Contrôle interne",
    "liens": [
      {
        "formation": "audit",
        "annee": 1
      }
    ]
  },
  {
    "id": "c26",
    "nom": "Normes OHADA",
    "liens": [
      {
        "formation": "audit",
        "annee": 1
      }
    ]
  },
  {
    "id": "c27",
    "nom": "Tableaux de bord",
    "liens": [
      {
        "formation": "audit",
        "annee": 2
      }
    ]
  },
  {
    "id": "c28",
    "nom": "Consolidation des comptes",
    "liens": [
      {
        "formation": "audit",
        "annee": 2
      }
    ]
  },
  {
    "id": "c29",
    "nom": "Algorithmique",
    "liens": [
      {
        "formation": "devweb",
        "annee": 1
      }
    ]
  },
  {
    "id": "c30",
    "nom": "HTML, CSS, JavaScript",
    "liens": [
      {
        "formation": "devweb",
        "annee": 1
      }
    ]
  },
  {
    "id": "c31",
    "nom": "Bases de données SQL",
    "liens": [
      {
        "formation": "devweb",
        "annee": 1
      }
    ]
  },
  {
    "id": "c32",
    "nom": "Anglais technique",
    "liens": [
      {
        "formation": "devweb",
        "annee": 1
      }
    ]
  },
  {
    "id": "c33",
    "nom": "Frameworks web",
    "liens": [
      {
        "formation": "devweb",
        "annee": 2
      }
    ]
  },
  {
    "id": "c34",
    "nom": "Développement Android",
    "liens": [
      {
        "formation": "devweb",
        "annee": 2
      }
    ]
  },
  {
    "id": "c35",
    "nom": "Projet client réel",
    "liens": [
      {
        "formation": "devweb",
        "annee": 2
      }
    ]
  },
  {
    "id": "c36",
    "nom": "Électronique numérique",
    "liens": [
      {
        "formation": "reseaux",
        "annee": 1
      }
    ]
  },
  {
    "id": "c37",
    "nom": "Systèmes d'exploitation",
    "liens": [
      {
        "formation": "reseaux",
        "annee": 1
      }
    ]
  },
  {
    "id": "c38",
    "nom": "Mathématiques",
    "liens": [
      {
        "formation": "reseaux",
        "annee": 1
      }
    ]
  },
  {
    "id": "c39",
    "nom": "Réseaux TCP/IP",
    "liens": [
      {
        "formation": "reseaux",
        "annee": 2
      }
    ]
  },
  {
    "id": "c40",
    "nom": "Administration Linux",
    "liens": [
      {
        "formation": "reseaux",
        "annee": 2
      }
    ]
  },
  {
    "id": "c41",
    "nom": "Téléphonie mobile",
    "liens": [
      {
        "formation": "reseaux",
        "annee": 2
      }
    ]
  },
  {
    "id": "c42",
    "nom": "Sécurité des réseaux",
    "liens": [
      {
        "formation": "reseaux",
        "annee": 3
      }
    ]
  },
  {
    "id": "c43",
    "nom": "Fibre optique",
    "liens": [
      {
        "formation": "reseaux",
        "annee": 3
      }
    ]
  },
  {
    "id": "c44",
    "nom": "Architecture logicielle",
    "liens": [
      {
        "formation": "logiciel",
        "annee": 1
      }
    ]
  },
  {
    "id": "c45",
    "nom": "Gestion de projet agile",
    "liens": [
      {
        "formation": "logiciel",
        "annee": 1
      }
    ]
  },
  {
    "id": "c46",
    "nom": "Intelligence artificielle",
    "liens": [
      {
        "formation": "logiciel",
        "annee": 2
      }
    ]
  },
  {
    "id": "c47",
    "nom": "Cloud et DevOps",
    "liens": [
      {
        "formation": "logiciel",
        "annee": 2
      }
    ]
  },
  {
    "id": "c48",
    "nom": "Architecture des ordinateurs",
    "liens": [
      {
        "formation": "maint",
        "annee": 1
      }
    ]
  },
  {
    "id": "c49",
    "nom": "Installation de systèmes",
    "liens": [
      {
        "formation": "maint",
        "annee": 1
      }
    ]
  },
  {
    "id": "c50",
    "nom": "Électronique",
    "liens": [
      {
        "formation": "maint",
        "annee": 1
      }
    ]
  },
  {
    "id": "c51",
    "nom": "Dépannage matériel",
    "liens": [
      {
        "formation": "maint",
        "annee": 2
      }
    ]
  },
  {
    "id": "c52",
    "nom": "Réseaux locaux",
    "liens": [
      {
        "formation": "maint",
        "annee": 2
      }
    ]
  },
  {
    "id": "c53",
    "nom": "Accueil et support utilisateur",
    "liens": [
      {
        "formation": "maint",
        "annee": 2
      }
    ]
  },
  {
    "id": "c54",
    "nom": "Électricité générale",
    "liens": [
      {
        "formation": "electro",
        "annee": 1
      }
    ]
  },
  {
    "id": "c55",
    "nom": "Schémas électriques",
    "liens": [
      {
        "formation": "electro",
        "annee": 1
      }
    ]
  },
  {
    "id": "c56",
    "nom": "Mesures",
    "liens": [
      {
        "formation": "electro",
        "annee": 1
      }
    ]
  },
  {
    "id": "c57",
    "nom": "Dessin technique",
    "liens": [
      {
        "formation": "electro",
        "annee": 1
      }
    ]
  },
  {
    "id": "c58",
    "nom": "Machines électriques",
    "liens": [
      {
        "formation": "electro",
        "annee": 2
      }
    ]
  },
  {
    "id": "c59",
    "nom": "Automatismes",
    "liens": [
      {
        "formation": "electro",
        "annee": 2
      }
    ]
  },
  {
    "id": "c60",
    "nom": "Énergie solaire",
    "liens": [
      {
        "formation": "electro",
        "annee": 2
      }
    ]
  },
  {
    "id": "c61",
    "nom": "Résistance des matériaux",
    "liens": [
      {
        "formation": "gc",
        "annee": 1
      }
    ]
  },
  {
    "id": "c62",
    "nom": "Topographie",
    "liens": [
      {
        "formation": "gc",
        "annee": 1
      }
    ]
  },
  {
    "id": "c63",
    "nom": "AutoCAD",
    "liens": [
      {
        "formation": "gc",
        "annee": 1
      }
    ]
  },
  {
    "id": "c64",
    "nom": "Béton armé",
    "liens": [
      {
        "formation": "gc",
        "annee": 2
      }
    ]
  },
  {
    "id": "c65",
    "nom": "Métré et devis",
    "liens": [
      {
        "formation": "gc",
        "annee": 2
      }
    ]
  },
  {
    "id": "c66",
    "nom": "Géotechnique",
    "liens": [
      {
        "formation": "gc",
        "annee": 2
      }
    ]
  },
  {
    "id": "c67",
    "nom": "Conduite de chantier",
    "liens": [
      {
        "formation": "gc",
        "annee": 3
      }
    ]
  },
  {
    "id": "c68",
    "nom": "Routes et ouvrages",
    "liens": [
      {
        "formation": "gc",
        "annee": 3
      }
    ]
  },
  {
    "id": "c69",
    "nom": "Géologie pétrolière",
    "liens": [
      {
        "formation": "prodpet",
        "annee": 1
      }
    ]
  },
  {
    "id": "c70",
    "nom": "Mécanique des fluides",
    "liens": [
      {
        "formation": "prodpet",
        "annee": 1
      }
    ]
  },
  {
    "id": "c71",
    "nom": "Chimie des hydrocarbures",
    "liens": [
      {
        "formation": "prodpet",
        "annee": 1
      }
    ]
  },
  {
    "id": "c72",
    "nom": "Procédés de production",
    "liens": [
      {
        "formation": "prodpet",
        "annee": 2
      }
    ]
  },
  {
    "id": "c73",
    "nom": "Instrumentation",
    "liens": [
      {
        "formation": "prodpet",
        "annee": 2
      }
    ]
  },
  {
    "id": "c74",
    "nom": "Sécurité sur site",
    "liens": [
      {
        "formation": "prodpet",
        "annee": 2
      }
    ]
  },
  {
    "id": "c75",
    "nom": "Réglementation HSE",
    "liens": [
      {
        "formation": "hse",
        "annee": 1
      }
    ]
  },
  {
    "id": "c76",
    "nom": "Prévention des risques",
    "liens": [
      {
        "formation": "hse",
        "annee": 1
      }
    ]
  },
  {
    "id": "c77",
    "nom": "Secourisme",
    "liens": [
      {
        "formation": "hse",
        "annee": 1
      }
    ]
  },
  {
    "id": "c78",
    "nom": "Gestion des déchets",
    "liens": [
      {
        "formation": "hse",
        "annee": 2
      }
    ]
  },
  {
    "id": "c79",
    "nom": "Audit sécurité",
    "liens": [
      {
        "formation": "hse",
        "annee": 2
      }
    ]
  },
  {
    "id": "c80",
    "nom": "Plan d'urgence",
    "liens": [
      {
        "formation": "hse",
        "annee": 2
      }
    ]
  },
  {
    "id": "c81",
    "nom": "Normes ISO 14001 et 45001",
    "liens": [
      {
        "formation": "hse",
        "annee": 3
      }
    ]
  },
  {
    "id": "c82",
    "nom": "Anatomie et physiologie",
    "liens": [
      {
        "formation": "infirm",
        "annee": 1
      }
    ]
  },
  {
    "id": "c83",
    "nom": "Soins infirmiers de base",
    "liens": [
      {
        "formation": "infirm",
        "annee": 1
      }
    ]
  },
  {
    "id": "c84",
    "nom": "Hygiène hospitalière",
    "liens": [
      {
        "formation": "infirm",
        "annee": 1
      }
    ]
  },
  {
    "id": "c85",
    "nom": "Pharmacologie",
    "liens": [
      {
        "formation": "infirm",
        "annee": 2
      }
    ]
  },
  {
    "id": "c86",
    "nom": "Soins en pédiatrie",
    "liens": [
      {
        "formation": "infirm",
        "annee": 2
      }
    ]
  },
  {
    "id": "c87",
    "nom": "Urgences et réanimation",
    "liens": [
      {
        "formation": "infirm",
        "annee": 2
      }
    ]
  },
  {
    "id": "c88",
    "nom": "Santé communautaire",
    "liens": [
      {
        "formation": "infirm",
        "annee": 3
      }
    ]
  },
  {
    "id": "c89",
    "nom": "Biochimie",
    "liens": [
      {
        "formation": "labo",
        "annee": 1
      }
    ]
  },
  {
    "id": "c90",
    "nom": "Hématologie",
    "liens": [
      {
        "formation": "labo",
        "annee": 1
      }
    ]
  },
  {
    "id": "c91",
    "nom": "Microbiologie",
    "liens": [
      {
        "formation": "labo",
        "annee": 1
      }
    ]
  },
  {
    "id": "c92",
    "nom": "Parasitologie",
    "liens": [
      {
        "formation": "labo",
        "annee": 2
      }
    ]
  },
  {
    "id": "c93",
    "nom": "Contrôle qualité",
    "liens": [
      {
        "formation": "labo",
        "annee": 2
      }
    ]
  },
  {
    "id": "c94",
    "nom": "Anatomie",
    "liens": [
      {
        "formation": "sagef",
        "annee": 1
      }
    ]
  },
  {
    "id": "c95",
    "nom": "Obstétrique",
    "liens": [
      {
        "formation": "sagef",
        "annee": 1
      }
    ]
  },
  {
    "id": "c96",
    "nom": "Soins du nouveau-né",
    "liens": [
      {
        "formation": "sagef",
        "annee": 2
      }
    ]
  },
  {
    "id": "c97",
    "nom": "Suivi de grossesse",
    "liens": [
      {
        "formation": "sagef",
        "annee": 2
      }
    ]
  },
  {
    "id": "c98",
    "nom": "Accouchement",
    "liens": [
      {
        "formation": "sagef",
        "annee": 3
      }
    ]
  },
  {
    "id": "c99",
    "nom": "Planification familiale",
    "liens": [
      {
        "formation": "sagef",
        "annee": 3
      }
    ]
  },
  {
    "id": "c100",
    "nom": "Chimie",
    "liens": [
      {
        "formation": "pharma",
        "annee": 1
      }
    ]
  },
  {
    "id": "c101",
    "nom": "Botanique médicinale",
    "liens": [
      {
        "formation": "pharma",
        "annee": 1
      }
    ]
  },
  {
    "id": "c102",
    "nom": "Galénique",
    "liens": [
      {
        "formation": "pharma",
        "annee": 1
      }
    ]
  },
  {
    "id": "c103",
    "nom": "Législation pharmaceutique",
    "liens": [
      {
        "formation": "pharma",
        "annee": 2
      }
    ]
  },
  {
    "id": "c104",
    "nom": "Gestion d'officine",
    "liens": [
      {
        "formation": "pharma",
        "annee": 2
      }
    ]
  },
  {
    "id": "c105",
    "nom": "Techniques d'expression",
    "liens": [
      {
        "formation": "journ",
        "annee": 1
      }
    ]
  },
  {
    "id": "c106",
    "nom": "Histoire des médias",
    "liens": [
      {
        "formation": "journ",
        "annee": 1
      }
    ]
  },
  {
    "id": "c107",
    "nom": "Culture générale",
    "liens": [
      {
        "formation": "journ",
        "annee": 1
      }
    ]
  },
  {
    "id": "c108",
    "nom": "Écriture journalistique",
    "liens": [
      {
        "formation": "journ",
        "annee": 2
      }
    ]
  },
  {
    "id": "c109",
    "nom": "Radio et podcast",
    "liens": [
      {
        "formation": "journ",
        "annee": 2
      }
    ]
  },
  {
    "id": "c110",
    "nom": "Photo et vidéo",
    "liens": [
      {
        "formation": "journ",
        "annee": 2
      }
    ]
  },
  {
    "id": "c111",
    "nom": "Communication des organisations",
    "liens": [
      {
        "formation": "journ",
        "annee": 3
      }
    ]
  },
  {
    "id": "c112",
    "nom": "Déontologie",
    "liens": [
      {
        "formation": "journ",
        "annee": 3
      }
    ]
  },
  {
    "id": "c113",
    "nom": "Fondamentaux du marketing",
    "liens": [
      {
        "formation": "mkt",
        "annee": 1
      }
    ]
  },
  {
    "id": "c114",
    "nom": "Réseaux sociaux",
    "liens": [
      {
        "formation": "mkt",
        "annee": 1
      }
    ]
  },
  {
    "id": "c115",
    "nom": "Canva et Figma",
    "liens": [
      {
        "formation": "mkt",
        "annee": 1
      }
    ]
  },
  {
    "id": "c116",
    "nom": "Publicité en ligne",
    "liens": [
      {
        "formation": "mkt",
        "annee": 2
      }
    ]
  },
  {
    "id": "c117",
    "nom": "Mesure d'audience",
    "liens": [
      {
        "formation": "mkt",
        "annee": 2
      }
    ]
  },
  {
    "id": "c118",
    "nom": "Projet pour une PME locale",
    "liens": [
      {
        "formation": "mkt",
        "annee": 2
      }
    ]
  },
  {
    "id": "c119",
    "nom": "Chaîne logistique",
    "liens": [
      {
        "formation": "transp",
        "annee": 1
      }
    ]
  },
  {
    "id": "c120",
    "nom": "Géographie des transports",
    "liens": [
      {
        "formation": "transp",
        "annee": 1
      }
    ]
  },
  {
    "id": "c121",
    "nom": "Gestion des stocks",
    "liens": [
      {
        "formation": "transp",
        "annee": 1
      }
    ]
  },
  {
    "id": "c122",
    "nom": "Transit et douane",
    "liens": [
      {
        "formation": "transp",
        "annee": 2
      }
    ]
  },
  {
    "id": "c123",
    "nom": "Transport fluvial et ferroviaire",
    "liens": [
      {
        "formation": "transp",
        "annee": 2
      }
    ]
  },
  {
    "id": "c124",
    "nom": "Économie internationale",
    "liens": [
      {
        "formation": "cominter",
        "annee": 1
      }
    ]
  },
  {
    "id": "c125",
    "nom": "Anglais des affaires",
    "liens": [
      {
        "formation": "cominter",
        "annee": 1
      }
    ]
  },
  {
    "id": "c126",
    "nom": "Incoterms",
    "liens": [
      {
        "formation": "cominter",
        "annee": 2
      }
    ]
  },
  {
    "id": "c127",
    "nom": "Réglementation CEMAC",
    "liens": [
      {
        "formation": "cominter",
        "annee": 2
      }
    ]
  },
  {
    "id": "c128",
    "nom": "Négociation",
    "liens": [
      {
        "formation": "cominter",
        "annee": 2
      }
    ]
  },
  {
    "id": "c129",
    "nom": "Import-export",
    "liens": [
      {
        "formation": "cominter",
        "annee": 3
      }
    ]
  },
  {
    "id": "c130",
    "nom": "Introduction au droit",
    "liens": [
      {
        "formation": "droitaff",
        "annee": 1
      }
    ]
  },
  {
    "id": "c131",
    "nom": "Droit constitutionnel",
    "liens": [
      {
        "formation": "droitaff",
        "annee": 1
      }
    ]
  },
  {
    "id": "c132",
    "nom": "Droit OHADA",
    "liens": [
      {
        "formation": "droitaff",
        "annee": 2
      }
    ]
  },
  {
    "id": "c133",
    "nom": "Droit des contrats",
    "liens": [
      {
        "formation": "droitaff",
        "annee": 2
      }
    ]
  },
  {
    "id": "c134",
    "nom": "Droit fiscal",
    "liens": [
      {
        "formation": "droitaff",
        "annee": 2
      }
    ]
  },
  {
    "id": "c135",
    "nom": "Contentieux",
    "liens": [
      {
        "formation": "droitaff",
        "annee": 3
      }
    ]
  },
  {
    "id": "c136",
    "nom": "Institutions du Congo",
    "liens": [
      {
        "formation": "adminpub",
        "annee": 1
      }
    ]
  },
  {
    "id": "c137",
    "nom": "Finances publiques",
    "liens": [
      {
        "formation": "adminpub",
        "annee": 1
      }
    ]
  },
  {
    "id": "c138",
    "nom": "Droit administratif",
    "liens": [
      {
        "formation": "adminpub",
        "annee": 2
      }
    ]
  },
  {
    "id": "c139",
    "nom": "Gestion des collectivités",
    "liens": [
      {
        "formation": "adminpub",
        "annee": 2
      }
    ]
  },
  {
    "id": "c140",
    "nom": "Rédaction administrative",
    "liens": [
      {
        "formation": "adminpub",
        "annee": 3
      }
    ]
  },
  {
    "id": "c141",
    "nom": "Marchés publics",
    "liens": [
      {
        "formation": "adminpub",
        "annee": 3
      }
    ]
  },
  {
    "id": "c142",
    "nom": "Techniques de secrétariat",
    "liens": [
      {
        "formation": "secret",
        "annee": 1
      }
    ]
  },
  {
    "id": "c143",
    "nom": "Bureautique",
    "liens": [
      {
        "formation": "secret",
        "annee": 1
      }
    ]
  },
  {
    "id": "c144",
    "nom": "Correspondance professionnelle",
    "liens": [
      {
        "formation": "secret",
        "annee": 1
      }
    ]
  },
  {
    "id": "c145",
    "nom": "Anglais",
    "liens": [
      {
        "formation": "secret",
        "annee": 2
      }
    ]
  },
  {
    "id": "c146",
    "nom": "Organisation d'événements",
    "liens": [
      {
        "formation": "secret",
        "annee": 2
      }
    ]
  },
  {
    "id": "c147",
    "nom": "Archivage",
    "liens": [
      {
        "formation": "secret",
        "annee": 2
      }
    ]
  },
  {
    "id": "c148",
    "nom": "Biologie végétale",
    "liens": [
      {
        "formation": "agro",
        "annee": 1
      }
    ]
  },
  {
    "id": "c149",
    "nom": "Sciences du sol",
    "liens": [
      {
        "formation": "agro",
        "annee": 1
      }
    ]
  },
  {
    "id": "c150",
    "nom": "Élevage",
    "liens": [
      {
        "formation": "agro",
        "annee": 1
      }
    ]
  },
  {
    "id": "c151",
    "nom": "Maraîchage",
    "liens": [
      {
        "formation": "agro",
        "annee": 2
      }
    ]
  },
  {
    "id": "c152",
    "nom": "Gestion d'une exploitation",
    "liens": [
      {
        "formation": "agro",
        "annee": 2
      }
    ]
  },
  {
    "id": "c153",
    "nom": "Commercialisation des produits",
    "liens": [
      {
        "formation": "agro",
        "annee": 2
      }
    ]
  },
  {
    "id": "c154",
    "nom": "Écologie",
    "liens": [
      {
        "formation": "envir",
        "annee": 1
      }
    ]
  },
  {
    "id": "c155",
    "nom": "Botanique forestière",
    "liens": [
      {
        "formation": "envir",
        "annee": 1
      }
    ]
  },
  {
    "id": "c156",
    "nom": "Cartographie SIG",
    "liens": [
      {
        "formation": "envir",
        "annee": 2
      }
    ]
  },
  {
    "id": "c157",
    "nom": "Gestion des forêts",
    "liens": [
      {
        "formation": "envir",
        "annee": 2
      }
    ]
  },
  {
    "id": "c158",
    "nom": "Faune sauvage",
    "liens": [
      {
        "formation": "envir",
        "annee": 3
      }
    ]
  },
  {
    "id": "c159",
    "nom": "Études d'impact",
    "liens": [
      {
        "formation": "envir",
        "annee": 3
      }
    ]
  },
  {
    "id": "c160",
    "nom": "Accueil et réception",
    "liens": [
      {
        "formation": "hotel",
        "annee": 1
      }
    ]
  },
  {
    "id": "c161",
    "nom": "Service en salle",
    "liens": [
      {
        "formation": "hotel",
        "annee": 1
      }
    ]
  },
  {
    "id": "c162",
    "nom": "Anglais du tourisme",
    "liens": [
      {
        "formation": "hotel",
        "annee": 1
      }
    ]
  },
  {
    "id": "c163",
    "nom": "Patrimoine du Congo",
    "liens": [
      {
        "formation": "hotel",
        "annee": 2
      }
    ]
  },
  {
    "id": "c164",
    "nom": "Gestion hôtelière",
    "liens": [
      {
        "formation": "hotel",
        "annee": 2
      }
    ]
  },
  {
    "id": "c165",
    "nom": "Organisation de circuits",
    "liens": [
      {
        "formation": "hotel",
        "annee": 2
      }
    ]
  }
]

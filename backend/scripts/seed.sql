-- ============================================================================
-- ORIENTA BRAZZAVILLE - Données de démonstration (seed)
-- ============================================================================
-- Exécuter avec : psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f backend/scripts/seed.sql
-- Insère le même jeu de démonstration que les maquettes (template/) :
-- 1 ville et ses 9 arrondissements, 10 domaines, 4 diplômes, 7 séries du bac,
-- 8 instituts, 26 formations,
-- 65 débouchés et 165 cours, avec les tarifs par niveau, les séries admises et
-- le programme par année de chaque formation.
--
-- Nomenclature alignée sur backend/scripts/migrate.sql (noms anglais).
--
-- ATTENTION - ce seed est à exécuter UNE SEULE FOIS, sur une base fraîchement
-- migrée. Un garde-fou ci-dessous le fait échouer proprement si la base
-- contient déjà des instituts, plutôt que de mélanger démonstration et données
-- réelles.
-- ============================================================================

BEGIN;

-- Garde-fou : refuse de tourner si la base contient déjà des données.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM institutes LIMIT 1) THEN
        RAISE EXCEPTION 'La base contient déjà des instituts : seed non exécuté (il est conçu pour une base vide, exécuté une seule fois).';
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Domaines d'insertion (10)
-- ---------------------------------------------------------------------------
-- L'icône est un nom Font Awesome, sans le préfixe « fa- ».
-- Les identifiants sont des UUID générés par la base : ce seed ne les connaît
-- pas d'avance. Chaque domaine reçoit donc ici un code court (`gestion`,
-- `info`…), qui n'existe que dans ce fichier et sert à le désigner plus bas.
CREATE TEMP TABLE seed_domains (code TEXT, name TEXT, color TEXT, icon TEXT) ON COMMIT DROP;

INSERT INTO seed_domains (code, name, color, icon) VALUES
    ('gestion', 'Gestion & Finance', '#1E6B4A', 'chart-line'),
    ('info', 'Informatique', '#2B51A3', 'laptop-code'),
    ('sante', 'Santé', '#B03352', 'stethoscope'),
    ('btp', 'BTP & Génie', '#9A5412', 'helmet-safety'),
    ('petrole', 'Pétrole & Mines', '#2F3B45', 'oil-well'),
    ('com', 'Communication', '#6D40A6', 'bullhorn'),
    ('logi', 'Transport & Logistique', '#0D6F7C', 'truck'),
    ('droit', 'Droit & Administration', '#7A2E2E', 'scale-balanced'),
    ('agro', 'Agronomie & Environnement', '#4C7A1E', 'leaf'),
    ('hotel', 'Hôtellerie & Tourisme', '#B5562A', 'hotel');

INSERT INTO domains (name, color, icon)
SELECT name, color, icon FROM seed_domains
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Diplômes (4) - la durée des études est portée par le diplôme.
-- ---------------------------------------------------------------------------
INSERT INTO degrees (name, duration) VALUES
    ('BTS', 2),
    ('Licence', 3),
    ('Licence pro', 3),
    ('Master', 2)
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Séries du baccalauréat (7)
-- ---------------------------------------------------------------------------
INSERT INTO bac_series (code, label) VALUES
    ('A', 'Lettres'),
    ('B', 'Économie'),
    ('C', 'Maths-Physique'),
    ('D', 'Sciences'),
    ('E', 'Technique'),
    ('F', 'Technique industrielle'),
    ('G', 'Tertiaire')
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Ville et arrondissements : Brazzaville et ses 9 arrondissements.
-- ---------------------------------------------------------------------------
INSERT INTO cities (name) VALUES ('Brazzaville')
ON CONFLICT (name) DO NOTHING;

INSERT INTO districts (city_id, name)
SELECT c.id, v.name
FROM cities c
CROSS JOIN (VALUES
    ('Makélékélé'), ('Bacongo'), ('Poto-Poto'), ('Moungali'), ('Ouenzé'),
    ('Talangaï'), ('Mfilou'), ('Madibou'), ('Djoué')
) AS v(name)
WHERE c.name = 'Brazzaville'
ON CONFLICT (city_id, name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Instituts (8)
-- La liste est posée dans une table temporaire, avec le nom de l'arrondissement :
-- l'insertion retrouve ensuite son identifiant. Un numéro d'agrément NULL
-- signifie « non agréé » : l'institut apparaît sans badge.
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE seed_institutes (
    name TEXT, short_name TEXT, district TEXT, address TEXT, phone TEXT, whatsapp TEXT, email TEXT,
    color TEXT, description TEXT, registration_fee INT, registration_deadline DATE, start_date DATE,
    accreditation_number TEXT
) ON COMMIT DROP;

INSERT INTO seed_institutes (name, short_name, district, address, phone, whatsapp, email, color, description,
                             registration_fee, registration_deadline, start_date, accreditation_number) VALUES
    ('Institut Supérieur de Gestion du Fleuve', 'ISGF', 'Poto-Poto', 'Avenue de la Paix, Poto-Poto',
     '+242 06 612 40 18', '242066124018', 'contact@isgf.cg', '#1E6B4A',
     'Spécialisé dans la gestion, la comptabilité et la banque depuis 2009. Cours en journée et en soirée.',
     50000, '2026-10-15', '2026-11-03', 'N° 047/MESRTI/2009'),

    ('École Supérieure d''Informatique du Mayombe', 'ESIM', 'Moungali', 'Rue Mbaka, Moungali',
     '+242 05 530 22 71', '242055302271', 'info@esim.cg', '#2B51A3',
     'Un poste par étudiant en salle machine et un projet réel avec une entreprise locale chaque année.',
     60000, '2026-10-04', '2026-10-27', 'N° 112/MESRTI/2011'),

    ('Institut Polytechnique Les Manguiers', 'IPM', 'Bacongo', 'Avenue Matsoua, Bacongo',
     '+242 06 877 15 03', '242068771503', 'contact@ipm.cg', '#9A5412',
     'Formations techniques avec ateliers équipés : électricité, bâtiment, pétrole et sécurité industrielle.',
     45000, '2026-10-20', '2026-11-03', 'N° 089/MESRTI/2008'),

    ('Institut de Santé du Djoué', 'ISD', 'Makélékélé', 'Route du Djoué, Makélékélé',
     '+242 06 409 88 52', '242064098852', 'contact@isd.cg', '#B03352',
     'Métiers paramédicaux, avec stages encadrés dans des centres de santé de Brazzaville.',
     75000, '2026-09-27', '2026-10-20', 'N° 156/MESRTI/2012'),

    ('Institut Horizon de Talangaï', 'IHT', 'Talangaï', 'Avenue de l''Intendance, Talangaï',
     '+242 05 744 31 60', '242057443160', 'contact@iht.cg', '#6D40A6',
     'Communication, journalisme et marketing digital. Studio radio et atelier vidéo sur place.',
     40000, '2026-10-31', '2026-11-10', 'N° 203/MESRTI/2015'),

    ('École de Commerce et Logistique de la Corniche', 'ECLC', 'Ouenzé', 'Boulevard de la Corniche, Ouenzé',
     '+242 06 255 67 09', '242062556709', 'contact@eclc.cg', '#0D6F7C',
     'Commerce international, transit et logistique, en lien avec le port fluvial et le corridor vers Pointe-Noire.',
     50000, '2026-10-15', '2026-11-03', 'N° 178/MESRTI/2014'),

    ('Institut Juridique Lumière', 'IJL', 'Djoué', 'Route du Pool, Djoué',
     '+242 06 318 72 44', '242063187244', 'contact@ijl.cg', '#7A2E2E',
     'Droit, administration et secrétariat. Nombreuses formations en cours du soir pour ceux qui travaillent.',
     40000, '2026-10-25', '2026-11-03', 'N° 131/MESRTI/2010'),

    ('Institut des Sciences Appliquées de Mfilou', 'ISAM', 'Mfilou', 'Route de Kinkala, Mfilou',
     '+242 05 690 13 27', '242056901327', 'contact@isam.cg', '#4C7A1E',
     'Agronomie, environnement et tourisme, avec une ferme-école et un hôtel d''application.',
     35000, '2026-10-10', '2026-10-27', NULL);

INSERT INTO institutes (name, short_name, district_id, address, phone, whatsapp, email, color, description,
                        registration_fee, registration_deadline, start_date, accreditation_number)
SELECT v.name, v.short_name, ds.id, v.address, v.phone, v.whatsapp, v.email, v.color, v.description,
       v.registration_fee, v.registration_deadline, v.start_date, v.accreditation_number
FROM seed_institutes v
JOIN districts ds ON ds.name = v.district
JOIN cities c ON c.id = ds.city_id AND c.name = 'Brazzaville';

-- ---------------------------------------------------------------------------
-- Formations (26)
-- La liste est posée dans une table temporaire : elle alimente ensuite les
-- formations, leurs tarifs par niveau et leurs séries admises. `pos` garde
-- l'ordre de la liste. Dans ce jeu, chaque intitulé de formation est unique :
-- les sections suivantes s'en servent comme clé.
--   domain     : code du domaine, donné plus haut dans seed_domains.
--   duration   : rappel de la durée du diplôme, vérifié plus bas.
--   tuition    : frais annuels, identiques pour chaque niveau dans ce jeu.
--   bac_series : lettres des séries admises ; NULL = pas de critère de série.
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE seed_programs (
    pos SERIAL, institute TEXT, domain TEXT, name TEXT, degree TEXT, duration INT, tuition INT,
    bac_series TEXT, evening BOOLEAN, internship_months INT, installments BOOLEAN
) ON COMMIT DROP;

INSERT INTO seed_programs (institute, domain, name, degree, duration, tuition, bac_series, evening, internship_months, installments) VALUES
    -- ISGF (gestion)
    ('Institut Supérieur de Gestion du Fleuve', 'gestion', 'Comptabilité et gestion des entreprises', 'BTS',        2, 420000, 'BCDG',   TRUE,  3, TRUE),
    ('Institut Supérieur de Gestion du Fleuve', 'gestion', 'Banque et assurance',                    'Licence pro', 3, 520000, 'BCD',    FALSE, 4, TRUE),
    ('Institut Supérieur de Gestion du Fleuve', 'gestion', 'Gestion des ressources humaines',      'Licence',    3, 480000, 'ABCDG',  TRUE,  3, TRUE),
    ('Institut Supérieur de Gestion du Fleuve', 'gestion', 'Audit et contrôle de gestion',          'Master',     2, 780000, NULL,     FALSE, 6, TRUE),
    -- ESIM (info)
    ('École Supérieure d''Informatique du Mayombe', 'info', 'Développement web et mobile',        'BTS',     2, 480000, 'CDEF',   FALSE, 3, TRUE),
    ('École Supérieure d''Informatique du Mayombe', 'info', 'Réseaux et télécommunications',     'Licence', 3, 560000, 'CDE',    FALSE, 3, TRUE),
    ('École Supérieure d''Informatique du Mayombe', 'info', 'Génie logiciel',                    'Master',  2, 750000, NULL,     FALSE, 6, FALSE),
    ('École Supérieure d''Informatique du Mayombe', 'info', 'Maintenance informatique',          'BTS',     2, 380000, 'CDEFG',  TRUE,  2, TRUE),
    -- IPM (btp, petrole)
    ('Institut Polytechnique Les Manguiers', 'btp', 'Électrotechnique',                                'BTS',        2, 450000, 'CDEF',   FALSE, 3, TRUE),
    ('Institut Polytechnique Les Manguiers', 'btp', 'Génie civil et bâtiment',                          'Licence',    3, 540000, 'CDE',    FALSE, 3, TRUE),
    ('Institut Polytechnique Les Manguiers', 'petrole', 'Production pétrolière',                        'BTS',        2, 690000, 'CDE',    FALSE, 4, TRUE),
    ('Institut Polytechnique Les Manguiers', 'petrole', 'Hygiène, sécurité et environnement (HSE)',     'Licence pro', 3, 620000, 'CDEF',   FALSE, 4, TRUE),
    -- ISD (sante)
    ('Institut de Santé du Djoué', 'sante', 'Sciences infirmières',                    'Licence', 3, 650000, 'CD', FALSE, 6, TRUE),
    ('Institut de Santé du Djoué', 'sante', 'Techniques de laboratoire médical',       'BTS',     2, 580000, 'CD', FALSE, 3, TRUE),
    ('Institut de Santé du Djoué', 'sante', 'Sage-femme',                             'Licence', 3, 680000, 'CD', FALSE, 6, TRUE),
    ('Institut de Santé du Djoué', 'sante', 'Préparateur en pharmacie',               'BTS',     2, 500000, 'CD', TRUE,  3, TRUE),
    -- IHT (com)
    ('Institut Horizon de Talangaï', 'com', 'Communication et journalisme',           'Licence', 3, 460000, 'ABCDG', FALSE, 3, TRUE),
    ('Institut Horizon de Talangaï', 'com', 'Marketing digital',                      'BTS',     2, 400000, 'ABCDG', TRUE,  3, TRUE),
    -- ECLC (logi)
    ('École de Commerce et Logistique de la Corniche', 'logi', 'Transport et logistique',  'BTS',     2, 440000, 'BCDG', TRUE, 3, TRUE),
    ('École de Commerce et Logistique de la Corniche', 'logi', 'Commerce international',  'Licence', 3, 510000, 'BCDG', FALSE, 3, TRUE),
    -- IJL (droit)
    ('Institut Juridique Lumière', 'droit', 'Droit des affaires',            'Licence', 3, 470000, 'ABCDG', TRUE, 2, TRUE),
    ('Institut Juridique Lumière', 'droit', 'Administration publique',       'Licence', 3, 430000, 'ABCDG', TRUE, 2, TRUE),
    ('Institut Juridique Lumière', 'droit', 'Secrétariat de direction',     'BTS',     2, 350000, 'ABCDG', TRUE, 2, TRUE),
    -- ISAM (agro, hotel)
    ('Institut des Sciences Appliquées de Mfilou', 'agro', 'Agronomie et agro-business',          'BTS',     2, 390000, 'CD',     FALSE, 4, TRUE),
    ('Institut des Sciences Appliquées de Mfilou', 'agro', 'Environnement, eaux et forêts',      'Licence', 3, 470000, 'CD',     FALSE, 3, TRUE),
    ('Institut des Sciences Appliquées de Mfilou', 'hotel', 'Hôtellerie et tourisme',               'BTS',     2, 410000, 'ABCDG',  FALSE, 4, TRUE);

-- Garde-fou : la durée notée ci-dessus doit être celle du diplôme.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM seed_programs v LEFT JOIN degrees d ON d.name = v.degree WHERE d.duration IS DISTINCT FROM v.duration) THEN
        RAISE EXCEPTION 'Seed incohérent : une formation annonce une durée différente de celle de son diplôme.';
    END IF;
END $$;

INSERT INTO programs (institute_id, domain_id, degree_id, name, evening, internship_months, installments, status)
SELECT i.id, dom.id, d.id, v.name, v.evening, v.internship_months, v.installments, 'published'
FROM seed_programs v
JOIN institutes i ON i.name = v.institute
JOIN degrees d ON d.name = v.degree
JOIN seed_domains sd ON sd.code = v.domain
JOIN domains dom ON dom.name = sd.name
ORDER BY v.pos;

-- ---------------------------------------------------------------------------
-- Tarifs par niveau - un montant par année d'études du diplôme.
-- ---------------------------------------------------------------------------
INSERT INTO program_fees (program_id, year, amount)
SELECT p.id, g.year, v.tuition
FROM seed_programs v
JOIN programs p ON p.name = v.name
JOIN degrees d ON d.id = p.degree_id
CROSS JOIN generate_series(1, d.duration) AS g(year);

-- ---------------------------------------------------------------------------
-- Séries du bac admises par formation - une ligne par lettre.
-- ---------------------------------------------------------------------------
INSERT INTO program_bac_series (program_id, series_id)
SELECT p.id, s.id
FROM seed_programs v
JOIN programs p ON p.name = v.name
CROSS JOIN LATERAL regexp_split_to_table(v.bac_series, '') AS letter
JOIN bac_series s ON s.code = letter;

-- ---------------------------------------------------------------------------
-- Débouchés (65) et relations formations ↔ débouchés
-- Un débouché est classé dans le domaine de la première formation qui le porte.
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE seed_program_careers ON COMMIT DROP AS
SELECT m.program_name, career_name
FROM (VALUES
    ('Comptabilité et gestion des entreprises',  ARRAY['Aide-comptable', 'Assistant de gestion', 'Caissier']),
    ('Banque et assurance',                     ARRAY['Chargé de clientèle bancaire', 'Conseiller en assurance', 'Analyste crédit']),
    ('Gestion des ressources humaines',        ARRAY['Assistant RH', 'Gestionnaire de paie', 'Chargé de recrutement']),
    ('Audit et contrôle de gestion',           ARRAY['Auditeur', 'Contrôleur de gestion', 'Comptable']),
    ('Développement web et mobile',             ARRAY['Développeur web', 'Développeur mobile', 'Intégrateur web']),
    ('Réseaux et télécommunications',          ARRAY['Technicien réseau', 'Administrateur système', 'Technicien télécom']),
    ('Génie logiciel',                         ARRAY['Ingénieur logiciel', 'Chef de projet informatique']),
    ('Maintenance informatique',                ARRAY['Technicien de maintenance', 'Support informatique']),
    ('Électrotechnique',                       ARRAY['Électricien bâtiment', 'Technicien de maintenance', 'Installateur solaire']),
    ('Génie civil et bâtiment',                ARRAY['Conducteur de travaux', 'Métreur', 'Dessinateur projeteur']),
    ('Production pétrolière',                  ARRAY['Opérateur de production', 'Technicien de forage', 'Agent HSE']),
    ('Hygiène, sécurité et environnement (HSE)', ARRAY['Agent HSE', 'Responsable sécurité', 'Chargé environnement']),
    ('Sciences infirmières',                   ARRAY['Infirmier', 'Agent de santé communautaire']),
    ('Techniques de laboratoire médical',      ARRAY['Technicien de laboratoire']),
    ('Sage-femme',                             ARRAY['Sage-femme', 'Agent de santé maternelle']),
    ('Préparateur en pharmacie',               ARRAY['Préparateur en pharmacie', 'Délégué médical']),
    ('Communication et journalisme',           ARRAY['Journaliste', 'Animateur radio', 'Chargé de communication']),
    ('Marketing digital',                      ARRAY['Community manager', 'Assistant marketing', 'Graphiste']),
    ('Transport et logistique',                ARRAY['Agent de transit', 'Déclarant en douane', 'Gestionnaire d''entrepôt']),
    ('Commerce international',                 ARRAY['Commercial export', 'Assistant import-export', 'Déclarant en douane']),
    ('Droit des affaires',                     ARRAY['Juriste d''entreprise', 'Assistant juridique', 'Clerc de notaire']),
    ('Administration publique',                ARRAY['Agent administratif', 'Secrétaire de direction', 'Assistant de collectivité']),
    ('Secrétariat de direction',               ARRAY['Secrétaire de direction', 'Assistant administratif']),
    ('Agronomie et agro-business',             ARRAY['Technicien agricole', 'Entrepreneur agricole', 'Conseiller agricole']),
    ('Environnement, eaux et forêts',         ARRAY['Agent des eaux et forêts', 'Chargé environnement', 'Technicien en aménagement']),
    ('Hôtellerie et tourisme',                  ARRAY['Réceptionniste', 'Guide touristique', 'Gestionnaire hôtelier'])
) AS m(program_name, careers)
CROSS JOIN LATERAL UNNEST(m.careers) AS career_name;

INSERT INTO careers (name, domain_id)
SELECT DISTINCT ON (pc.career_name) pc.career_name, dom.id
FROM seed_program_careers pc
JOIN seed_programs v ON v.name = pc.program_name
JOIN seed_domains sd ON sd.code = v.domain
JOIN domains dom ON dom.name = sd.name
ORDER BY pc.career_name, v.pos
ON CONFLICT (name) DO NOTHING;

INSERT INTO program_careers (program_id, career_id)
SELECT p.id, c.id
FROM seed_program_careers pc
JOIN programs p ON p.name = pc.program_name
JOIN careers c ON c.name = pc.career_name
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Cours (165) et programme par année
-- Les cours forment un catalogue partagé : « Comptabilité » et « Droit civil »
-- sont rattachés chacun à deux formations.
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE seed_program_courses ON COMMIT DROP AS
SELECT c.program_name, u.course_name, u.ord
FROM (VALUES
    ('Comptabilité et gestion des entreprises', ARRAY['Comptabilité générale', 'Mathématiques financières', 'Droit des affaires', 'Excel et Word', 'Comptabilité analytique', 'Fiscalité congolaise', 'Logiciel Sage Compta']),
    ('Banque et assurance',                     ARRAY['Économie générale', 'Comptabilité', 'Statistiques', 'Techniques bancaires', 'Droit bancaire CEMAC', 'Marketing des services', 'Analyse du risque crédit', 'Assurance IARD']),
    ('Gestion des ressources humaines',        ARRAY['Introduction au management', 'Psychologie du travail', 'Droit civil', 'Droit du travail congolais', 'Paie et administration du personnel', 'Communication interne', 'Recrutement et formation', 'GPEC']),
    ('Audit et contrôle de gestion',           ARRAY['Audit comptable et financier', 'Contrôle interne', 'Normes OHADA', 'Tableaux de bord', 'Consolidation des comptes']),
    ('Développement web et mobile',             ARRAY['Algorithmique', 'HTML, CSS, JavaScript', 'Bases de données SQL', 'Anglais technique', 'Frameworks web', 'Développement Android', 'Projet client réel']),
    ('Réseaux et télécommunications',          ARRAY['Électronique numérique', 'Systèmes d''exploitation', 'Mathématiques', 'Réseaux TCP/IP', 'Administration Linux', 'Téléphonie mobile', 'Sécurité des réseaux', 'Fibre optique']),
    ('Génie logiciel',                         ARRAY['Architecture logicielle', 'Gestion de projet agile', 'Intelligence artificielle', 'Cloud et DevOps']),
    ('Maintenance informatique',                ARRAY['Architecture des ordinateurs', 'Installation de systèmes', 'Électronique', 'Dépannage matériel', 'Réseaux locaux', 'Accueil et support utilisateur']),
    ('Électrotechnique',                       ARRAY['Électricité générale', 'Schémas électriques', 'Mesures', 'Dessin technique', 'Machines électriques', 'Automatismes', 'Énergie solaire']),
    ('Génie civil et bâtiment',                ARRAY['Résistance des matériaux', 'Topographie', 'AutoCAD', 'Béton armé', 'Métré et devis', 'Géotechnique', 'Conduite de chantier', 'Routes et ouvrages']),
    ('Production pétrolière',                  ARRAY['Géologie pétrolière', 'Mécanique des fluides', 'Chimie des hydrocarbures', 'Procédés de production', 'Instrumentation', 'Sécurité sur site']),
    ('Hygiène, sécurité et environnement (HSE)', ARRAY['Réglementation HSE', 'Prévention des risques', 'Secourisme', 'Gestion des déchets', 'Audit sécurité', 'Plan d''urgence', 'Normes ISO 14001 et 45001']),
    ('Sciences infirmières',                   ARRAY['Anatomie et physiologie', 'Soins infirmiers de base', 'Hygiène hospitalière', 'Pharmacologie', 'Soins en pédiatrie', 'Urgences et réanimation', 'Santé communautaire']),
    ('Techniques de laboratoire médical',      ARRAY['Biochimie', 'Hématologie', 'Microbiologie', 'Parasitologie', 'Contrôle qualité']),
    ('Sage-femme',                             ARRAY['Anatomie', 'Obstétrique', 'Soins du nouveau-né', 'Suivi de grossesse', 'Accouchement', 'Planification familiale']),
    ('Préparateur en pharmacie',               ARRAY['Chimie', 'Botanique médicinale', 'Galénique', 'Législation pharmaceutique', 'Gestion d''officine']),
    ('Communication et journalisme',           ARRAY['Techniques d''expression', 'Histoire des médias', 'Culture générale', 'Écriture journalistique', 'Radio et podcast', 'Photo et vidéo', 'Communication des organisations', 'Déontologie']),
    ('Marketing digital',                      ARRAY['Fondamentaux du marketing', 'Réseaux sociaux', 'Canva et Figma', 'Publicité en ligne', 'Mesure d''audience', 'Projet pour une PME locale']),
    ('Transport et logistique',                ARRAY['Chaîne logistique', 'Géographie des transports', 'Gestion des stocks', 'Transit et douane', 'Transport fluvial et ferroviaire']),
    ('Commerce international',                 ARRAY['Économie internationale', 'Comptabilité', 'Anglais des affaires', 'Incoterms', 'Réglementation CEMAC', 'Négociation', 'Import-export']),
    ('Droit des affaires',                     ARRAY['Introduction au droit', 'Droit civil', 'Droit constitutionnel', 'Droit OHADA', 'Droit des contrats', 'Droit fiscal', 'Contentieux']),
    ('Administration publique',                ARRAY['Institutions du Congo', 'Finances publiques', 'Droit administratif', 'Gestion des collectivités', 'Rédaction administrative', 'Marchés publics']),
    ('Secrétariat de direction',               ARRAY['Techniques de secrétariat', 'Bureautique', 'Correspondance professionnelle', 'Anglais', 'Organisation d''événements', 'Archivage']),
    ('Agronomie et agro-business',             ARRAY['Biologie végétale', 'Sciences du sol', 'Élevage', 'Maraîchage', 'Gestion d''une exploitation', 'Commercialisation des produits']),
    ('Environnement, eaux et forêts',         ARRAY['Écologie', 'Botanique forestière', 'Cartographie SIG', 'Gestion des forêts', 'Faune sauvage', 'Études d''impact']),
    ('Hôtellerie et tourisme',                  ARRAY['Accueil et réception', 'Service en salle', 'Anglais du tourisme', 'Patrimoine du Congo', 'Gestion hôtelière', 'Organisation de circuits'])
) AS c(program_name, courses)
CROSS JOIN LATERAL UNNEST(c.courses) WITH ORDINALITY AS u(course_name, ord);

INSERT INTO courses (name)
SELECT DISTINCT course_name FROM seed_program_courses
ON CONFLICT (name) DO NOTHING;

-- Répartition par année, comme dans les maquettes : les cours sont découpés
-- dans l'ordre en blocs égaux, un bloc par année (7 cours sur 2 ans = 4 puis 3).
INSERT INTO program_courses (program_id, course_id, year, position)
SELECT p.id, c.id, ((pc.ord - 1) / CEIL(n.total::numeric / d.duration)::int) + 1, pc.ord
FROM seed_program_courses pc
JOIN programs p ON p.name = pc.program_name
JOIN degrees d ON d.id = p.degree_id
JOIN courses c ON c.name = pc.course_name
JOIN (SELECT program_name, COUNT(*) AS total FROM seed_program_courses GROUP BY program_name) n
  ON n.program_name = pc.program_name;

-- ---------------------------------------------------------------------------
-- Compte Squad par défaut : squad@orienta.cg / orienta2026 (À CHANGER)
-- Le hash ci-dessous est un bcrypt réel, généré pour ce mot de passe.
-- Ne jamais exécuter ce seed en production : changez d'abord le mot de passe.
-- ---------------------------------------------------------------------------
INSERT INTO users (email, password_hash, name, role)
VALUES ('squad@orienta.cg', '$2b$10$6x9Auqu6/4/0L7O341ZcS./yDm2B/wU.K/mWKFDu8wmB1RtQScNdC', 'Squad', 'superadmin')
ON CONFLICT (email) DO NOTHING;

COMMIT;

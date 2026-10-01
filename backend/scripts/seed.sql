-- ============================================================================
-- KELASI BRAZZAVILLE — Données de démonstration (seed)
-- ============================================================================
-- Exécuter avec : psql -U <user> -d kelasi -f backend/scripts/seed.sql
-- Insère les 10 domaines, 8 instituts et 26 formations de démonstration,
-- ainsi que leurs métiers, cours et découpages par année.
--
-- Nomenclature alignée sur backend/scripts/migrate.sql (noms anglais).
--
-- ATTENTION — ce seed est à exécuter UNE SEULE FOIS, sur une base freshly
-- migrée. Les tables institutes / programs / courses n'ont pas de contrainte
-- UNIQUE qui permette un INSERT idempotent : relancer le fichier dupliquerait
-- les données (les domaines, métiers et l'utilisateur, eux, sont protégés par
-- ON CONFLICT DO NOTHING). Un garde-fou ci-dessous fait échouer le script
-- proprement plutôt que de polluer la base.
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
-- Domaines (10)
-- ---------------------------------------------------------------------------
INSERT INTO domains (id, name, color) VALUES
    ('gestion', 'Gestion & Finance', '#1E6B4A'),
    ('info', 'Informatique', '#2B51A3'),
    ('sante', 'Santé', '#B03352'),
    ('btp', 'BTP & Génie', '#9A5412'),
    ('petrole', 'Pétrole & Mines', '#2F3B45'),
    ('com', 'Communication', '#6D40A6'),
    ('logi', 'Transport & Logistique', '#0D6F7C'),
    ('droit', 'Droit & Administration', '#7A2E2E'),
    ('agro', 'Agronomie & Environnement', '#4C7A1E'),
    ('hotel', 'Hôtellerie & Tourisme', '#B5562A')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Instituts (8)
-- `district` utilise les slugs sans accents du domaine public (voir docs/openapi.yaml).
-- ---------------------------------------------------------------------------
INSERT INTO institutes (name, short_name, district, address, phone, whatsapp, email, color, description,
                         registration_fee, registration_deadline, start_date,
                         accreditation_status, accreditation_number) VALUES
    ('Institut Supérieur de Gestion du Fleuve', 'ISGF', 'Poto-Poto', 'Avenue de la Paix, Poto-Poto',
     '+242 06 612 40 18', '242066124018', 'contact@isgf.cg', '#1E6B4A',
     'Spécialisé dans la gestion, la comptabilité et la banque depuis 2009. Cours en journée et en soirée.',
     50000, '15 oct.', '3 nov. 2026', 'agre', 'N° 047/MESRTI/2009'),

    ('École Supérieure d''Informatique du Mayombe', 'ESIM', 'Moungali', 'Rue Mbaka, Moungali',
     '+242 05 530 22 71', '242055302271', 'info@esim.cg', '#2B51A3',
     'Un poste par étudiant en salle machine et un projet réel avec une entreprise locale chaque année.',
     60000, '4 oct.', '27 oct. 2026', 'agre', 'N° 112/MESRTI/2011'),

    ('Institut Polytechnique Les Manguiers', 'IPM', 'Bacongo', 'Avenue Matsoua, Bacongo',
     '+242 06 877 15 03', '242068771503', 'contact@ipm.cg', '#9A5412',
     'Formations techniques avec ateliers équipés : électricité, bâtiment, pétrole et sécurité industrielle.',
     45000, '20 oct.', '3 nov. 2026', 'agre', 'N° 089/MESRTI/2008'),

    ('Institut de Santé du Djoué', 'ISD', 'Makelekele', 'Route du Djoué, Makélékélé',
     '+242 06 409 88 52', '242064098852', 'contact@isd.cg', '#B03352',
     'Métiers paramédicaux, avec stages encadrés dans des centres de santé de Brazzaville.',
     75000, '27 sept.', '20 oct. 2026', 'agre', 'N° 156/MESRTI/2012'),

    ('Institut Horizon de Talangaï', 'IHT', 'Talangai', 'Avenue de l''Intendance, Talangaï',
     '+242 05 744 31 60', '242057443160', 'contact@iht.cg', '#6D40A6',
     'Communication, journalisme et marketing digital. Studio radio et atelier vidéo sur place.',
     40000, '31 oct.', '10 nov. 2026', 'agre', 'N° 203/MESRTI/2015'),

    ('École de Commerce et Logistique de la Corniche', 'ECLC', 'Ouenze', 'Boulevard de la Corniche, Ouenzé',
     '+242 06 255 67 09', '242062556709', 'contact@eclc.cg', '#0D6F7C',
     'Commerce international, transit et logistique, en lien avec le port fluvial et le corridor vers Pointe-Noire.',
     50000, '15 oct.', '3 nov. 2026', 'agre', 'N° 178/MESRTI/2014'),

    ('Institut Juridique Lumière', 'IJL', 'Djoue', 'Route du Pool, Djoué',
     '+242 06 318 72 44', '242063187244', 'contact@ijl.cg', '#7A2E2E',
     'Droit, administration et secrétariat. Nombreuses formations en cours du soir pour ceux qui travaillent.',
     40000, '25 oct.', '3 nov. 2026', 'agre', 'N° 131/MESRTI/2010'),

    ('Institut des Sciences Appliquées de Mfilou', 'ISAM', 'Mfilou', 'Route de Kinkala, Mfilou',
     '+242 05 690 13 27', '242056901327', 'contact@isam.cg', '#4C7A1E',
     'Agronomie, environnement et tourisme, avec une ferme-école et un hôtel d''application.',
     35000, '10 oct.', '27 oct. 2026', 'en_cours', NULL);

-- ---------------------------------------------------------------------------
-- Formations (26)
-- Les instituts sont référencés par leur nom pour éviter de dépendre des ids.
-- ---------------------------------------------------------------------------
INSERT INTO programs (institute_id, domain_id, name, degree, duration, tuition,
                       bac_series, evening, internship_months, installments)
SELECT i.id, v.domain_id, v.name, v.degree, v.duration, v.tuition,
       v.bac_series, v.evening, v.internship_months, v.installments
FROM (VALUES
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
    ('Institut des Sciences Appliquées de Mfilou', 'hotel', 'Hôtellerie et tourisme',               'BTS',     2, 410000, 'ABCDG',  FALSE, 4, TRUE)
) AS v(institute, domain_id, name, degree, duration, tuition, bac_series, evening, internship_months, installments)
JOIN institutes i ON i.name = v.institute;

-- ---------------------------------------------------------------------------
-- Métiers (débouchés) — sans doublon : careers.name est UNIQUE.
-- ---------------------------------------------------------------------------
INSERT INTO careers (name) VALUES
    -- gestion
    ('Aide-comptable'), ('Assistant de gestion'), ('Caissier'),
    ('Chargé de clientèle bancaire'), ('Conseiller en assurance'), ('Analyste crédit'),
    ('Assistant RH'), ('Gestionnaire de paie'), ('Chargé de recrutement'),
    ('Auditeur'), ('Contrôleur de gestion'), ('Comptable'),
    -- informatique
    ('Développeur web'), ('Développeur mobile'), ('Intégrateur web'),
    ('Technicien réseau'), ('Administrateur système'), ('Technicien télécom'),
    ('Ingénieur logiciel'), ('Chef de projet informatique'),
    ('Technicien de maintenance'), ('Support informatique'),
    -- btp / petrole
    ('Électricien bâtiment'), ('Installateur solaire'),
    ('Conducteur de travaux'), ('Métreur'), ('Dessinateur projeteur'),
    ('Opérateur de production'), ('Technicien de forage'), ('Agent HSE'),
    ('Responsable sécurité'), ('Chargé environnement'),
    -- santé
    ('Infirmier'), ('Agent de santé communautaire'), ('Technicien de laboratoire'),
    ('Sage-femme'), ('Agent de santé maternelle'),
    ('Préparateur en pharmacie'), ('Délégué médical'),
    -- communication
    ('Journaliste'), ('Animateur radio'), ('Chargé de communication'),
    ('Community manager'), ('Assistant marketing'), ('Graphiste'),
    -- logistique / commerce
    ('Agent de transit'), ('Déclarant en douane'), ('Gestionnaire d''entrepôt'),
    ('Commercial export'), ('Assistant import-export'),
    -- droit
    ('Juriste d''entreprise'), ('Assistant juridique'), ('Clerc de notaire'),
    ('Agent administratif'), ('Secrétaire de direction'), ('Assistant de collectivité'),
    ('Assistant administratif'),
    -- agro / hotel
    ('Technicien agricole'), ('Entrepreneur agricole'), ('Conseiller agricole'),
    ('Agent des eaux et forêts'), ('Technicien en aménagement'),
    ('Réceptionniste'), ('Guide touristique'), ('Gestionnaire hôtelier')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Relations programmes ↔ métiers
-- ---------------------------------------------------------------------------
INSERT INTO program_careers (program_id, career_id)
SELECT p.id, c.id
FROM programs p
JOIN (VALUES
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
) AS m(program_name, careers) ON m.program_name = p.name
CROSS JOIN LATERAL UNNEST(m.careers) AS career_name
JOIN careers c ON c.name = career_name
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Cours par programme
-- ---------------------------------------------------------------------------
INSERT INTO courses (program_id, name)
SELECT p.id, course_name
FROM programs p
JOIN (VALUES
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
) AS c(program_name, courses) ON c.program_name = p.name
CROSS JOIN LATERAL UNNEST(c.courses) AS course_name;

-- ---------------------------------------------------------------------------
-- Années du programme — une ligne par année, étiquette adaptée au diplôme.
-- ---------------------------------------------------------------------------
INSERT INTO program_years (program_id, level, "order")
SELECT p.id,
       CASE p.degree
           WHEN 'Master'  THEN 'M' || g.n
           WHEN 'BTS'     THEN g.n || 'e année'
           ELSE 'L' || g.n
       END,
       g.n
FROM programs p
CROSS JOIN generate_series(1, p.duration) AS g(n);

-- ---------------------------------------------------------------------------
-- Répartition des cours dans les années — un programme a `duration` années,
-- on répartit ses cours en round-robin : année = (rang - 1) % duration + 1.
-- ---------------------------------------------------------------------------
INSERT INTO year_courses (year_id, course_id, "order")
SELECT y.id, ranked.id, ROW_NUMBER() OVER (PARTITION BY y.id ORDER BY ranked.rn)
FROM (
    SELECT id, program_id,
           ROW_NUMBER() OVER (PARTITION BY program_id ORDER BY id) AS rn
    FROM courses
) ranked
JOIN programs p ON p.id = ranked.program_id
JOIN program_years y ON y.program_id = p.id
WHERE y."order" = ((ranked.rn - 1) % p.duration) + 1
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Utilisateur Squad par défaut (mot de passe : kelasi2026 — À CHANGER)
-- Le hash ci-dessous est un bcrypt réel, généré pour ce mot de passe.
-- Ne jamais exécuter ce seed en production : changez d'abord le mot de passe.
-- ---------------------------------------------------------------------------
INSERT INTO users (username, password_hash, name, role)
VALUES ('squad', '$2b$10$thghllGrQKoqWArksnORXuD2fkv8c987MJ3zrjDptxZ2DSMOnuQ4q', 'Membre Squad', 'squad')
ON CONFLICT (username) DO NOTHING;

COMMIT;
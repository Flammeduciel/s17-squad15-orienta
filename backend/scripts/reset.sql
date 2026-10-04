-- ============================================================================
-- ORIENTA BRAZZAVILLE - Réinitialisation du catalogue
-- ============================================================================
-- Exécuter avec : psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f backend/scripts/reset.sql
--
-- EFFACE tout le catalogue (instituts, formations, cours, diplômes, débouchés,
-- séries, domaines, villes, arrondissements, demandes) : à lancer à la main, en connaissance de cause.
-- Les comptes (`users`) sont conservés.
--
-- Sert à repartir d'une base propre, notamment quand migrate.sql refuse de
-- reconstruire un ancien schéma qui contient des données. Enchaîner ensuite
-- avec migrate.sql, puis seed.sql pour les données de démonstration.
-- ============================================================================

BEGIN;

DROP VIEW IF EXISTS indicators;

DROP TABLE IF EXISTS
    -- schéma actuel
    program_courses, program_careers, program_bac_series, program_fees, contact_requests,
    courses, careers, programs, institutes, districts, cities, bac_series, degrees, domains,
    -- tables du premier schéma
    year_courses, program_years, referral_requests
CASCADE;

COMMIT;

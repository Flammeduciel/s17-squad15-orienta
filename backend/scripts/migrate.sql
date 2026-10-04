-- ============================================================================
-- ORIENTA BRAZZAVILLE — Migration (PostgreSQL 12+)
-- ============================================================================
-- Run with: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f backend/scripts/migrate.sql
-- Creates all tables, indexes and the indicators view.
--
-- The script is idempotent: scripts/start.sh runs it at every start of the API.
-- The model follows the back-office (template/back-office.html): every list the
-- Squad manages there is a table here — institutes, programs, courses, degrees,
-- careers, bac series and domains.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Upgrade from the first schema (Kelasi)
-- ---------------------------------------------------------------------------
-- The first schema stored the degree as a text column of `programs`, tied each
-- course to a single program and had no table for degrees or bac series. It
-- cannot be altered in place into the model below, so it is rebuilt — but only
-- when it holds no data. With data, the migration stops: run scripts/reset.sql
-- knowingly, then start again. Accounts (`users`) are always kept.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'programs' AND column_name = 'degree'
    ) THEN
        IF EXISTS (SELECT 1 FROM institutes LIMIT 1) THEN
            RAISE EXCEPTION 'Ancien schéma détecté avec des données : la migration ne supprime rien d''elle-même. Exécutez backend/scripts/reset.sql (il efface le catalogue, pas les comptes), puis relancez la migration.';
        END IF;
        DROP VIEW IF EXISTS indicators;
        DROP TABLE IF EXISTS year_courses, program_years, courses, program_careers, careers,
                             contact_requests, referral_requests, programs, institutes, domains CASCADE;
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Table: users (Squad accounts — EX-15, EX-16)
-- ---------------------------------------------------------------------------
-- A member of the Squad signs in with an e-mail address and a password.
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'superadmin',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Databases created when the login was a username: an account without e-mail
-- gets "<username>@orienta.cg", then the username column is dropped.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(150) UNIQUE;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'users' AND column_name = 'username') THEN
        UPDATE users SET email = username || '@orienta.cg' WHERE email IS NULL;
        ALTER TABLE users DROP COLUMN username;
    END IF;
END $$;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'superadmin';

-- ---------------------------------------------------------------------------
-- Table: domains (domaines d'insertion)
-- ---------------------------------------------------------------------------
-- The id is a stable slug: renaming a domain touches neither programs nor careers.
CREATE TABLE IF NOT EXISTS domains (
    id      VARCHAR(20) PRIMARY KEY,
    name    VARCHAR(100) NOT NULL UNIQUE,
    color   VARCHAR(7) NOT NULL,
    -- Font Awesome icon name, without the "fa-" prefix (ex: 'stethoscope').
    icon    VARCHAR(40) NOT NULL DEFAULT 'shapes'
);

-- Databases created before the icon column: add it, then give the ten original
-- domains their icon. A domain whose icon was already chosen is left untouched.
ALTER TABLE domains ADD COLUMN IF NOT EXISTS icon VARCHAR(40) NOT NULL DEFAULT 'shapes';

UPDATE domains SET icon = v.icon
FROM (VALUES
    ('gestion', 'chart-line'), ('info', 'laptop-code'), ('sante', 'stethoscope'),
    ('btp', 'helmet-safety'), ('petrole', 'oil-well'), ('com', 'bullhorn'),
    ('logi', 'truck'), ('droit', 'scale-balanced'), ('agro', 'leaf'), ('hotel', 'hotel')
) AS v(id, icon)
WHERE domains.id = v.id AND domains.icon = 'shapes';

-- ---------------------------------------------------------------------------
-- Table: degrees (diplômes)
-- ---------------------------------------------------------------------------
-- The length of studies belongs to the degree: every program awarding it lasts
-- `duration` years.
CREATE TABLE IF NOT EXISTS degrees (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    duration    SMALLINT NOT NULL CHECK (duration BETWEEN 1 AND 5)
);

-- ---------------------------------------------------------------------------
-- Table: bac_series (séries du baccalauréat)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bac_series (
    id      SERIAL PRIMARY KEY,
    code    VARCHAR(10) NOT NULL UNIQUE,
    label   VARCHAR(100)
);

-- ---------------------------------------------------------------------------
-- Table: institutes
-- ---------------------------------------------------------------------------
-- An institute is accredited when it has an accreditation number: `accredited`
-- is derived from it, so the blue badge can never disagree with the number.
CREATE TABLE IF NOT EXISTS institutes (
    id                    SERIAL PRIMARY KEY,
    name                  VARCHAR(200) NOT NULL UNIQUE,
    short_name            VARCHAR(20) NOT NULL UNIQUE,
    district              VARCHAR(50) NOT NULL
                          CHECK (district IN ('Makélékélé', 'Bacongo', 'Poto-Poto', 'Moungali', 'Ouenzé',
                                              'Talangaï', 'Mfilou', 'Madibou', 'Djoué')),
    address               VARCHAR(300),
    phone                 VARCHAR(20),
    whatsapp              VARCHAR(20),
    email                 VARCHAR(150),
    color                 VARCHAR(7) DEFAULT '#17693F',
    image_url             TEXT,
    banner_url            TEXT,
    description           TEXT,
    benefits              TEXT[] NOT NULL DEFAULT '{}',
    registration_fee      INTEGER NOT NULL DEFAULT 0 CHECK (registration_fee >= 0),
    registration_deadline DATE,
    start_date            DATE,
    accreditation_number  VARCHAR(100) CHECK (accreditation_number IS NULL OR btrim(accreditation_number) <> ''),
    accredited            BOOLEAN GENERATED ALWAYS AS (accreditation_number IS NOT NULL) STORED,
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (registration_deadline IS NULL OR start_date IS NULL OR start_date >= registration_deadline)
);

-- Databases created before the banner column.
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS banner_url TEXT;

CREATE INDEX IF NOT EXISTS idx_institutes_district ON institutes(district);

-- ---------------------------------------------------------------------------
-- Table: programs (formations)
-- ---------------------------------------------------------------------------
-- A program belongs to one institute; two institutes may offer a program with
-- the same name. A domain or a degree still used by a program cannot be deleted.
-- Only `published` programs are shown on the public site.
CREATE TABLE IF NOT EXISTS programs (
    id                      SERIAL PRIMARY KEY,
    institute_id            INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    domain_id               VARCHAR(20) NOT NULL REFERENCES domains(id),
    degree_id               INTEGER NOT NULL REFERENCES degrees(id),
    name                    VARCHAR(200) NOT NULL,
    description             TEXT,
    admission_requirements  TEXT,
    evening                 BOOLEAN NOT NULL DEFAULT FALSE,
    internship_months       INTEGER NOT NULL DEFAULT 0 CHECK (internship_months BETWEEN 0 AND 12),
    installments            BOOLEAN NOT NULL DEFAULT FALSE,
    status                  VARCHAR(10) NOT NULL DEFAULT 'published'
                            CHECK (status IN ('published', 'draft')),
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (institute_id, name)
);

CREATE INDEX IF NOT EXISTS idx_programs_institute ON programs(institute_id);
CREATE INDEX IF NOT EXISTS idx_programs_domain ON programs(domain_id);
CREATE INDEX IF NOT EXISTS idx_programs_degree ON programs(degree_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);

-- ---------------------------------------------------------------------------
-- Table: program_fees (tarifs par niveau)
-- ---------------------------------------------------------------------------
-- One yearly amount per year of study. The API keeps `year` within the degree
-- duration (a CHECK cannot read another table).
CREATE TABLE IF NOT EXISTS program_fees (
    program_id  INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    year        SMALLINT NOT NULL CHECK (year >= 1),
    amount      INTEGER NOT NULL CHECK (amount > 0),
    PRIMARY KEY (program_id, year)
);

CREATE INDEX IF NOT EXISTS idx_program_fees_amount ON program_fees(amount);

-- ---------------------------------------------------------------------------
-- Table: program_bac_series (séries admises par formation)
-- ---------------------------------------------------------------------------
-- No row for a program means the series is not an admission criterion.
CREATE TABLE IF NOT EXISTS program_bac_series (
    program_id  INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    series_id   INTEGER NOT NULL REFERENCES bac_series(id),
    PRIMARY KEY (program_id, series_id)
);

CREATE INDEX IF NOT EXISTS idx_program_bac_series_series ON program_bac_series(series_id);

-- ---------------------------------------------------------------------------
-- Table: careers (débouchés)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS careers (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    domain_id   VARCHAR(20) NOT NULL REFERENCES domains(id)
);

CREATE INDEX IF NOT EXISTS idx_careers_domain ON careers(domain_id);

-- ---------------------------------------------------------------------------
-- Table: program_careers
-- ---------------------------------------------------------------------------
-- A career still attached to a program cannot be deleted.
CREATE TABLE IF NOT EXISTS program_careers (
    program_id    INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    career_id     INTEGER NOT NULL REFERENCES careers(id),
    PRIMARY KEY (program_id, career_id)
);

CREATE INDEX IF NOT EXISTS idx_program_careers_career ON program_careers(career_id);

-- ---------------------------------------------------------------------------
-- Table: courses (catalogue de cours)
-- ---------------------------------------------------------------------------
-- Shared catalogue: one course (Français, Mathématiques…) can be attached to
-- several programs.
CREATE TABLE IF NOT EXISTS courses (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(200) NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------------
-- Table: program_courses (programme par année)
-- ---------------------------------------------------------------------------
-- A course is attached once to a program, in a given year of study. Deleting a
-- course removes it from every program. `year` is kept within the degree
-- duration by the API.
CREATE TABLE IF NOT EXISTS program_courses (
    program_id  INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    year        SMALLINT NOT NULL CHECK (year >= 1),
    position    INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (program_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_program_courses_course ON program_courses(course_id);

-- ---------------------------------------------------------------------------
-- Table: contact_requests (EX-06)
-- ---------------------------------------------------------------------------
-- Trace of the questions sent from a public program page and relayed by e-mail
-- to the institute. The back-office has no inbox for them.
CREATE TABLE IF NOT EXISTS contact_requests (
    id              SERIAL PRIMARY KEY,
    program_id      INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    message         TEXT NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- View: indicators (the 5 dashboard KPI — EX-07)
-- ---------------------------------------------------------------------------
-- Dropped first: CREATE OR REPLACE cannot rename the columns of an existing view.
DROP VIEW IF EXISTS indicators;
CREATE VIEW indicators AS
SELECT
    (SELECT COUNT(*) FROM institutes) AS nb_institutes,
    (SELECT COUNT(*) FROM programs) AS nb_programs,
    (SELECT COUNT(DISTINCT district) FROM institutes) AS nb_districts_covered,
    (SELECT COUNT(*) FROM degrees) AS nb_degrees,
    (SELECT COUNT(*) FROM careers) AS nb_careers;

COMMIT;

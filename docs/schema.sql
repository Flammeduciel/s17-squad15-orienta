-- ============================================================================
-- KELASI BRAZZAVILLE — Database Schema (PostgreSQL)
-- ============================================================================
-- Source of truth: docs/openapi.yaml
-- English nomenclature for all tables and columns.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Table: users (Squad authentication)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'squad',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Table: domains (10 training domains)
-- ---------------------------------------------------------------------------
CREATE TABLE domains (
    id      VARCHAR(20) PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    color   VARCHAR(7) NOT NULL
);

-- ---------------------------------------------------------------------------
-- Table: institutes
-- ---------------------------------------------------------------------------
CREATE TABLE institutes (
    id                    SERIAL PRIMARY KEY,
    name                  VARCHAR(200) NOT NULL,
    short_name            VARCHAR(20) NOT NULL,
    district              VARCHAR(50) NOT NULL,
    address               VARCHAR(300),
    phone                 VARCHAR(20),
    whatsapp              VARCHAR(20),
    email                 VARCHAR(150),
    color                 VARCHAR(7) DEFAULT '#17693F',
    image_url             TEXT,
    description           TEXT,
    registration_fee      INTEGER DEFAULT 0,
    registration_deadline VARCHAR(50),
    start_date            VARCHAR(50),
    accreditation_status  VARCHAR(10) NOT NULL DEFAULT 'en_cours'
                          CHECK (accreditation_status IN ('agre', 'en_cours')),
    accreditation_number  VARCHAR(100),
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_institutes_district ON institutes(district);

-- ---------------------------------------------------------------------------
-- Table: programs
-- ---------------------------------------------------------------------------
CREATE TABLE programs (
    id                SERIAL PRIMARY KEY,
    institute_id      INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    domain_id         VARCHAR(20) NOT NULL REFERENCES domains(id),
    name              VARCHAR(200) NOT NULL,
    degree            VARCHAR(20) NOT NULL
                      CHECK (degree IN ('BTS', 'Licence', 'Licence pro', 'Master')),
    duration          INTEGER NOT NULL CHECK (duration IN (2, 3)),
    tuition           INTEGER NOT NULL DEFAULT 0,
    bac_series        VARCHAR(10),
    evening           BOOLEAN DEFAULT FALSE,
    internship_months INTEGER DEFAULT 0,
    installments      BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_programs_institute ON programs(institute_id);
CREATE INDEX idx_programs_domain ON programs(domain_id);
CREATE INDEX idx_programs_degree ON programs(degree);
CREATE INDEX idx_programs_duration ON programs(duration);
CREATE INDEX idx_programs_tuition ON programs(tuition);

-- ---------------------------------------------------------------------------
-- Table: careers
-- ---------------------------------------------------------------------------
CREATE TABLE careers (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(100) NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------------
-- Table: program_careers (N-N)
-- ---------------------------------------------------------------------------
CREATE TABLE program_careers (
    program_id    INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    career_id     INTEGER NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    PRIMARY KEY (program_id, career_id)
);

-- ---------------------------------------------------------------------------
-- Table: courses
-- ---------------------------------------------------------------------------
CREATE TABLE courses (
    id              SERIAL PRIMARY KEY,
    program_id      INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL
);

CREATE INDEX idx_courses_program ON courses(program_id);

-- ---------------------------------------------------------------------------
-- Table: program_years
-- ---------------------------------------------------------------------------
CREATE TABLE program_years (
    id              SERIAL PRIMARY KEY,
    program_id      INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    level           VARCHAR(20) NOT NULL,
    "order"         INTEGER NOT NULL
);

CREATE INDEX idx_program_years_program ON program_years(program_id);

-- ---------------------------------------------------------------------------
-- Table: year_courses (N-N, ordered)
-- ---------------------------------------------------------------------------
CREATE TABLE year_courses (
    year_id         INTEGER NOT NULL REFERENCES program_years(id) ON DELETE CASCADE,
    course_id       INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "order"         INTEGER NOT NULL,
    PRIMARY KEY (year_id, course_id)
);

-- ---------------------------------------------------------------------------
-- Table: contact_requests
-- ---------------------------------------------------------------------------
CREATE TABLE contact_requests (
    id              SERIAL PRIMARY KEY,
    program_id      INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    message         TEXT NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Table: referral_requests
-- ---------------------------------------------------------------------------
CREATE TABLE referral_requests (
    id                  SERIAL PRIMARY KEY,
    institute_name      VARCHAR(200) NOT NULL,
    district            VARCHAR(50) NOT NULL,
    phone               VARCHAR(20) NOT NULL,
    contact_person      VARCHAR(100) NOT NULL,
    accreditation_number VARCHAR(100),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- View: indicators (dashboard KPI)
-- ---------------------------------------------------------------------------
CREATE VIEW indicators AS
SELECT
    (SELECT COUNT(*) FROM institutes) AS nb_institutes,
    (SELECT COUNT(DISTINCT district) FROM institutes) AS nb_districts_covered,
    (SELECT COUNT(DISTINCT domain_id) FROM programs) AS nb_domains,
    (SELECT COUNT(DISTINCT degree) FROM programs) AS nb_degrees,
    (SELECT COUNT(*) FROM careers) AS nb_careers;

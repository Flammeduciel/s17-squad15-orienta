/**
 * Requêtes SQL sur la table `institutes`.
 *
 * @module models/institutes
 */
const { query } = require('../config/db');

/* Colonnes de la liste : celles de `InstituteSummary` dans le contrat. Le nombre
   de formations et les diplômes ne comptent que les formations publiées. */
const SUMMARY = `
  i.id, i.short_name, i.name, i.district_id, ds.name AS district, c.name AS city, i.accredited, i.accreditation_number,
  i.color, i.image_url, i.registration_fee,
  (SELECT COUNT(*) FROM programs p
    WHERE p.institute_id = i.id AND p.status = 'published')::int AS program_count,
  (SELECT COALESCE(array_agg(DISTINCT d.name), '{}')
     FROM programs p JOIN degrees d ON d.id = p.degree_id
    WHERE p.institute_id = i.id AND p.status = 'published') AS degrees`;

/* Un institut est lu avec son arrondissement et sa ville. */
const FROM = `
  FROM institutes i
  JOIN districts ds ON ds.id = i.district_id
  JOIN cities c ON c.id = ds.city_id`;

/* Colonnes de la fiche : `InstituteDetail`. Les dates sont renvoyées en texte
   `AAAA-MM-JJ` pour ne pas dépendre du fuseau horaire du serveur. */
const DETAIL = `${SUMMARY},
  i.banner_url, i.address, i.phone, i.whatsapp, i.email, i.description, i.benefits,
  to_char(i.registration_deadline, 'YYYY-MM-DD') AS registration_deadline,
  to_char(i.start_date, 'YYYY-MM-DD') AS start_date`;

/**
 * @param {object} filters
 * @param {string[]} [filters.district_id] Un de ces arrondissements.
 * @param {boolean} [filters.accredited] Vrai : seulement les instituts agréés.
 * @returns {Promise<object[]>} Instituts triés par sigle.
 */
async function findAll({ district_id, accredited }) {
  const where = [];
  const params = [];
  if (district_id) {
    params.push(district_id);
    where.push(`i.district_id = ANY($${params.length}::uuid[])`);
  }
  if (accredited) {
    where.push('i.accredited');
  }
  const { rows } = await query(
    `SELECT ${SUMMARY} ${FROM}
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY i.short_name`,
    params,
  );
  return rows;
}

/** @param {string} id */
async function findById(id) {
  const { rows } = await query(`SELECT ${DETAIL} ${FROM} WHERE i.id = $1`, [id]);
  return rows[0] || null;
}

/**
 * Cherche un autre institut portant ce nom ou ce sigle.
 *
 * @param {string} name
 * @param {string} shortName
 * @returns {Promise<{ id: string, name: string, short_name: string }|null>}
 */
async function findByNameOrShortName(name, shortName) {
  const { rows } = await query(
    `SELECT id, name, short_name FROM institutes
     WHERE lower(name) = lower($1) OR lower(short_name) = lower($2)`,
    [name, shortName],
  );
  return rows[0] || null;
}

/* Ordre des valeurs partagé par la création et la modification. */
function values(institute) {
  return [
    institute.name,
    institute.short_name,
    institute.district_id,
    institute.address,
    institute.phone,
    institute.whatsapp,
    institute.email,
    institute.color,
    institute.image_url,
    institute.banner_url,
    institute.description,
    institute.benefits,
    institute.registration_fee,
    institute.registration_deadline,
    institute.start_date,
    institute.accreditation_number,
  ];
}

/** @returns {Promise<string>} Identifiant du nouvel institut. */
async function create(institute) {
  const { rows } = await query(
    `INSERT INTO institutes (name, short_name, district_id, address, phone, whatsapp, email, color,
                             image_url, banner_url, description, benefits, registration_fee,
                             registration_deadline, start_date, accreditation_number)
     VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, '#17693F'), $9, $10, $11, $12, $13, $14, $15, $16)
     RETURNING id`,
    values(institute),
  );
  return rows[0].id;
}

/** @returns {Promise<boolean>} Faux si l'institut n'existe pas. */
async function update(id, institute) {
  const { rowCount } = await query(
    `UPDATE institutes SET
       name = $1, short_name = $2, district_id = $3, address = $4, phone = $5, whatsapp = $6,
       email = $7, color = COALESCE($8, color), image_url = $9, banner_url = $10, description = $11,
       benefits = $12, registration_fee = $13, registration_deadline = $14, start_date = $15,
       accreditation_number = $16, updated_at = NOW()
     WHERE id = $17`,
    [...values(institute), id],
  );
  return rowCount > 0;
}

/** Supprime l'institut ; ses formations partent avec lui (cascade en base). */
async function remove(id) {
  const { rowCount } = await query('DELETE FROM institutes WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, findByNameOrShortName, create, update, remove };

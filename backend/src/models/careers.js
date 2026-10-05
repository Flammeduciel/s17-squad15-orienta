/**
 * Requêtes SQL sur la table `careers` (débouchés) et `program_careers`.
 *
 * @module models/careers
 */
const { query } = require("../config/db");

/**
 * @typedef {object} Career
 * @property {number} id
 * @property {string} name
 * @property {string} domain_id Slug du domaine d'insertion.
 * @property {number} program_count Nombre de formations qui portent ce débouché.
 */

/**
 * Débouchés portés par au moins une formation publiée, avec le nombre de
 * formations publiées (lecture publique).
 *
 * @returns {Promise<Career[]>}
 */
async function listPublic() {
  const { rows } = await query(
    `SELECT c.id, c.name, c.domain_id, COUNT(p.id)::int AS program_count
       FROM careers c
       JOIN program_careers pc ON pc.career_id = c.id
       JOIN programs p ON p.id = pc.program_id AND p.status = 'published'
      GROUP BY c.id
      ORDER BY c.name`,
  );
  return rows;
}

/**
 * Tous les débouchés, avec le nombre de formations (brouillons compris),
 * c'est-à-dire ce qui empêche leur suppression (lecture admin).
 *
 * @returns {Promise<Career[]>}
 */
async function listAll() {
  const { rows } = await query(
    `SELECT c.id, c.name, c.domain_id, COUNT(pc.program_id)::int AS program_count
       FROM careers c
       LEFT JOIN program_careers pc ON pc.career_id = c.id
      GROUP BY c.id
      ORDER BY c.name`,
  );
  return rows;
}

/**
 * @param {number} id
 * @returns {Promise<Career|null>}
 */
async function findById(id) {
  const { rows } = await query(
    `SELECT c.id, c.name, c.domain_id, COUNT(pc.program_id)::int AS program_count
       FROM careers c
       LEFT JOIN program_careers pc ON pc.career_id = c.id
      WHERE c.id = $1
      GROUP BY c.id`,
    [id],
  );
  return rows[0] || null;
}

/**
 * @param {{ name: string, domain_id: string }} data
 * @returns {Promise<Career>}
 */
async function create({ name, domain_id: domainId }) {
  const { rows } = await query(
    "INSERT INTO careers (name, domain_id) VALUES ($1, $2) RETURNING id",
    [name, domainId],
  );
  return findById(rows[0].id);
}

/**
 * @param {number} id
 * @param {{ name: string, domain_id: string }} data
 * @returns {Promise<Career|null>} `null` si le débouché n'existe pas.
 */
async function update(id, { name, domain_id: domainId }) {
  const { rowCount } = await query(
    "UPDATE careers SET name = $2, domain_id = $3 WHERE id = $1",
    [id, name, domainId],
  );
  return rowCount > 0 ? findById(id) : null;
}

/**
 * @param {number} id
 * @returns {Promise<boolean>} `true` si une ligne a été supprimée.
 */
async function remove(id) {
  const { rowCount } = await query("DELETE FROM careers WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { listPublic, listAll, findById, create, update, remove };

/**
 * Requêtes SQL sur la table `domains` (domaines d'insertion).
 *
 * @module models/domains
 */
const { query } = require("../config/db");

/**
 * @typedef {object} Domain
 * @property {string} id Slug stable (`sante`).
 * @property {string} name
 * @property {string} color Hexadécimal `#RRGGBB`.
 */

const COLUMNS = "id, name, color";

/** @returns {Promise<Domain[]>} */
async function list() {
  const { rows } = await query(`SELECT ${COLUMNS} FROM domains ORDER BY name`);
  return rows;
}

/**
 * @param {string} id
 * @returns {Promise<Domain|null>}
 */
async function findById(id) {
  const { rows } = await query(`SELECT ${COLUMNS} FROM domains WHERE id = $1`, [
    id,
  ]);
  return rows[0] || null;
}

/**
 * @param {Domain} domain
 * @returns {Promise<Domain>}
 */
async function create({ id, name, color }) {
  const { rows } = await query(
    `INSERT INTO domains (id, name, color) VALUES ($1, $2, $3) RETURNING ${COLUMNS}`,
    [id, name, color],
  );
  return rows[0];
}

/**
 * Le slug n'est jamais modifié : seuls le nom et la couleur changent.
 *
 * @param {string} id
 * @param {{ name: string, color: string }} data
 * @returns {Promise<Domain|null>} `null` si le domaine n'existe pas.
 */
async function update(id, { name, color }) {
  const { rows } = await query(
    `UPDATE domains SET name = $2, color = $3 WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, name, color],
  );
  return rows[0] || null;
}

/**
 * @param {string} id
 * @returns {Promise<boolean>} `true` si une ligne a été supprimée.
 */
async function remove(id) {
  const { rowCount } = await query("DELETE FROM domains WHERE id = $1", [id]);
  return rowCount > 0;
}

/**
 * Nombre de formations et de débouchés rattachés au domaine.
 *
 * @param {string} id
 * @returns {Promise<{ programs: number, careers: number }>}
 */
async function countUsage(id) {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM programs WHERE domain_id = $1)::int AS programs,
       (SELECT COUNT(*) FROM careers WHERE domain_id = $1)::int AS careers`,
    [id],
  );
  return rows[0];
}

module.exports = { list, findById, create, update, remove, countUsage };

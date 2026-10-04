/**
 * Requêtes SQL sur la table `bac_series` (séries du baccalauréat).
 *
 * @module models/bacSeries
 */
const { query } = require("../config/db");

/**
 * @typedef {object} BacSeries
 * @property {number} id
 * @property {string} code
 * @property {string|null} label
 */

const COLUMNS = "id, code, label";

/** @returns {Promise<BacSeries[]>} */
async function list() {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM bac_series ORDER BY code`,
  );
  return rows;
}

/**
 * @param {number} id
 * @returns {Promise<BacSeries|null>}
 */
async function findById(id) {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM bac_series WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}

/**
 * @param {{ code: string, label: string|null }} data
 * @returns {Promise<BacSeries>}
 */
async function create({ code, label }) {
  const { rows } = await query(
    `INSERT INTO bac_series (code, label) VALUES ($1, $2) RETURNING ${COLUMNS}`,
    [code, label],
  );
  return rows[0];
}

/**
 * @param {number} id
 * @param {{ code: string, label: string|null }} data
 * @returns {Promise<BacSeries|null>} `null` si la série n'existe pas.
 */
async function update(id, { code, label }) {
  const { rows } = await query(
    `UPDATE bac_series SET code = $2, label = $3 WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, code, label],
  );
  return rows[0] || null;
}

/**
 * @param {number} id
 * @returns {Promise<boolean>} `true` si une ligne a été supprimée.
 */
async function remove(id) {
  const { rowCount } = await query("DELETE FROM bac_series WHERE id = $1", [
    id,
  ]);
  return rowCount > 0;
}

/**
 * Nombre de formations qui admettent cette série.
 *
 * @param {number} id
 * @returns {Promise<number>}
 */
async function countPrograms(id) {
  const { rows } = await query(
    "SELECT COUNT(*)::int AS total FROM program_bac_series WHERE series_id = $1",
    [id],
  );
  return rows[0].total;
}

module.exports = { list, findById, create, update, remove, countPrograms };

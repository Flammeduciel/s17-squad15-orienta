/**
 * Requêtes SQL sur la table `bac_series` (séries du baccalauréat).
 *
 * @module models/bacSeries
 */
const { query } = require('../config/db');

async function findAll() {
  const { rows } = await query('SELECT id, code, label FROM bac_series ORDER BY code');
  return rows;
}

async function findById(id) {
  const { rows } = await query('SELECT id, code, label FROM bac_series WHERE id = $1', [id]);
  return rows[0] || null;
}

async function findByCode(code) {
  const { rows } = await query('SELECT id, code, label FROM bac_series WHERE lower(code) = lower($1)', [code]);
  return rows[0] || null;
}

async function create({ code, label }) {
  const { rows } = await query(
    'INSERT INTO bac_series (code, label) VALUES ($1, $2) RETURNING id, code, label',
    [code, label],
  );
  return rows[0];
}

async function update(id, { code, label }) {
  const { rows } = await query(
    'UPDATE bac_series SET code = $1, label = $2 WHERE id = $3 RETURNING id, code, label',
    [code, label, id],
  );
  return rows[0] || null;
}

async function remove(id) {
  await query('DELETE FROM bac_series WHERE id = $1', [id]);
}

/** @returns {Promise<number>} Nombre de formations qui admettent cette série. */
async function countPrograms(id) {
  const { rows } = await query('SELECT COUNT(*)::int AS total FROM program_bac_series WHERE series_id = $1', [id]);
  return rows[0].total;
}

module.exports = { findAll, findById, findByCode, create, update, remove, countPrograms };

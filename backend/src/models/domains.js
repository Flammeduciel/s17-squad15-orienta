/**
 * Requêtes SQL sur la table `domains` (domaines d'insertion).
 *
 * @module models/domains
 */
const { query } = require('../config/db');

/** @returns {Promise<object[]>} Tous les domaines, par ordre alphabétique. */
async function findAll() {
  const { rows } = await query('SELECT id, name, color, icon FROM domains ORDER BY name');
  return rows;
}

/** @param {string} id Slug du domaine. */
async function findById(id) {
  const { rows } = await query('SELECT id, name, color, icon FROM domains WHERE id = $1', [id]);
  return rows[0] || null;
}

/** @param {string} name Nom à chercher, sans tenir compte de la casse. */
async function findByName(name) {
  const { rows } = await query('SELECT id, name, color, icon FROM domains WHERE lower(name) = lower($1)', [name]);
  return rows[0] || null;
}

async function create({ id, name, color, icon }) {
  const { rows } = await query(
    'INSERT INTO domains (id, name, color, icon) VALUES ($1, $2, $3, $4) RETURNING id, name, color, icon',
    [id, name, color, icon],
  );
  return rows[0];
}

async function update(id, { name, color, icon }) {
  const { rows } = await query(
    'UPDATE domains SET name = $1, color = $2, icon = $3 WHERE id = $4 RETURNING id, name, color, icon',
    [name, color, icon, id],
  );
  return rows[0] || null;
}

async function remove(id) {
  await query('DELETE FROM domains WHERE id = $1', [id]);
}

/** @returns {Promise<{ programs: number, careers: number }>} Ce qui est rattaché au domaine. */
async function countUsage(id) {
  const { rows } = await query(
    `SELECT (SELECT COUNT(*) FROM programs WHERE domain_id = $1)::int AS programs,
            (SELECT COUNT(*) FROM careers WHERE domain_id = $1)::int AS careers`,
    [id],
  );
  return rows[0];
}

module.exports = { findAll, findById, findByName, create, update, remove, countUsage };

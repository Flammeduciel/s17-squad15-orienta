/**
 * Requêtes SQL sur la table `cities` (villes).
 *
 * @module models/cities
 */
const { query } = require('../config/db');

/** Toutes les villes, avec leur nombre d'arrondissements. */
async function findAll() {
  const { rows } = await query(
    `SELECT c.id, c.name, COUNT(d.id)::int AS district_count
     FROM cities c
     LEFT JOIN districts d ON d.city_id = c.id
     GROUP BY c.id
     ORDER BY c.name`,
  );
  return rows;
}

async function findById(id) {
  const { rows } = await query('SELECT id, name FROM cities WHERE id = $1', [id]);
  return rows[0] || null;
}

async function findByName(name) {
  const { rows } = await query('SELECT id, name FROM cities WHERE lower(name) = lower($1)', [name]);
  return rows[0] || null;
}

async function create({ name }) {
  const { rows } = await query('INSERT INTO cities (name) VALUES ($1) RETURNING id, name', [name]);
  return rows[0];
}

async function update(id, { name }) {
  const { rows } = await query('UPDATE cities SET name = $1 WHERE id = $2 RETURNING id, name', [name, id]);
  return rows[0] || null;
}

async function remove(id) {
  await query('DELETE FROM cities WHERE id = $1', [id]);
}

/** @returns {Promise<number>} Nombre d'arrondissements de cette ville. */
async function countDistricts(id) {
  const { rows } = await query('SELECT COUNT(*)::int AS total FROM districts WHERE city_id = $1', [id]);
  return rows[0].total;
}

module.exports = { findAll, findById, findByName, create, update, remove, countDistricts };

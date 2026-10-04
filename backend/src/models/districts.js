/**
 * Requêtes SQL sur la table `districts` (arrondissements).
 *
 * @module models/districts
 */
const { query } = require('../config/db');

/**
 * Tous les arrondissements, classés par ville, avec leur nombre d'instituts et
 * de formations publiées.
 */
async function findAll() {
  const { rows } = await query(
    `SELECT d.id, d.name, d.city_id, c.name AS city,
            COUNT(DISTINCT i.id)::int AS institute_count,
            COUNT(p.id)::int AS program_count
     FROM districts d
     JOIN cities c ON c.id = d.city_id
     LEFT JOIN institutes i ON i.district_id = d.id
     LEFT JOIN programs p ON p.institute_id = i.id AND p.status = 'published'
     GROUP BY d.id, c.name
     ORDER BY c.name, d.name`,
  );
  return rows;
}

async function findById(id) {
  const { rows } = await query('SELECT id, name, city_id FROM districts WHERE id = $1', [id]);
  return rows[0] || null;
}

/** Cherche un arrondissement de ce nom dans cette ville, sans tenir compte de la casse. */
async function findByName(cityId, name) {
  const { rows } = await query(
    'SELECT id, name, city_id FROM districts WHERE city_id = $1 AND lower(name) = lower($2)',
    [cityId, name],
  );
  return rows[0] || null;
}

async function create({ name, city_id }) {
  const { rows } = await query(
    'INSERT INTO districts (name, city_id) VALUES ($1, $2) RETURNING id, name, city_id',
    [name, city_id],
  );
  return rows[0];
}

async function update(id, { name, city_id }) {
  const { rows } = await query(
    'UPDATE districts SET name = $1, city_id = $2 WHERE id = $3 RETURNING id, name, city_id',
    [name, city_id, id],
  );
  return rows[0] || null;
}

async function remove(id) {
  await query('DELETE FROM districts WHERE id = $1', [id]);
}

/** @returns {Promise<number>} Nombre d'instituts situés dans cet arrondissement. */
async function countInstitutes(id) {
  const { rows } = await query('SELECT COUNT(*)::int AS total FROM institutes WHERE district_id = $1', [id]);
  return rows[0].total;
}

module.exports = { findAll, findById, findByName, create, update, remove, countInstitutes };

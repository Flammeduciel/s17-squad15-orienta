/**
 * Requêtes SQL sur la table `careers` (débouchés).
 *
 * @module models/careers
 */
const { query } = require('../config/db');

/**
 * Débouchés portés par au moins une formation publiée : ceux que le site public
 * propose dans son filtre.
 */
async function findPublished() {
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

/** Tous les débouchés du référentiel, même sans formation, pour le back-office. */
async function findAll() {
  const { rows } = await query(
    `SELECT c.id, c.name, c.domain_id, COUNT(pc.program_id)::int AS program_count
     FROM careers c
     LEFT JOIN program_careers pc ON pc.career_id = c.id
     GROUP BY c.id
     ORDER BY c.name`,
  );
  return rows;
}

async function findById(id) {
  const { rows } = await query('SELECT id, name, domain_id FROM careers WHERE id = $1', [id]);
  return rows[0] || null;
}

async function findByName(name) {
  const { rows } = await query('SELECT id, name, domain_id FROM careers WHERE lower(name) = lower($1)', [name]);
  return rows[0] || null;
}

async function create({ name, domain_id }) {
  const { rows } = await query(
    'INSERT INTO careers (name, domain_id) VALUES ($1, $2) RETURNING id, name, domain_id',
    [name, domain_id],
  );
  return rows[0];
}

async function update(id, { name, domain_id }) {
  const { rows } = await query(
    'UPDATE careers SET name = $1, domain_id = $2 WHERE id = $3 RETURNING id, name, domain_id',
    [name, domain_id, id],
  );
  return rows[0] || null;
}

async function remove(id) {
  await query('DELETE FROM careers WHERE id = $1', [id]);
}

/** @returns {Promise<number>} Nombre de formations qui portent ce débouché. */
async function countPrograms(id) {
  const { rows } = await query('SELECT COUNT(*)::int AS total FROM program_careers WHERE career_id = $1', [id]);
  return rows[0].total;
}

module.exports = { findPublished, findAll, findById, findByName, create, update, remove, countPrograms };

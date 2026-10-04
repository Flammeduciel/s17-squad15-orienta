/**
 * Requêtes SQL sur la table `degrees` (diplômes).
 *
 * @module models/degrees
 */
const { query, transaction } = require('../config/db');

/** @returns {Promise<object[]>} Les diplômes, avec le nombre de formations publiées qui les délivrent. */
async function findAll() {
  const { rows } = await query(
    `SELECT d.id, d.name, d.duration,
            COUNT(p.id) FILTER (WHERE p.status = 'published')::int AS program_count
     FROM degrees d
     LEFT JOIN programs p ON p.degree_id = d.id
     GROUP BY d.id
     ORDER BY d.id`,
  );
  return rows;
}

async function findById(id) {
  const { rows } = await query('SELECT id, name, duration FROM degrees WHERE id = $1', [id]);
  return rows[0] || null;
}

async function findByName(name) {
  const { rows } = await query('SELECT id, name, duration FROM degrees WHERE lower(name) = lower($1)', [name]);
  return rows[0] || null;
}

async function create({ name, duration }) {
  const { rows } = await query(
    'INSERT INTO degrees (name, duration) VALUES ($1, $2) RETURNING id, name, duration',
    [name, duration],
  );
  return rows[0];
}

/**
 * Modifie un diplôme. Sa durée s'applique à toutes ses formations : on ajuste
 * donc, dans la même transaction, leurs frais et leur programme.
 *
 * @param {number} id
 * @param {{ name: string, duration: number }} degree
 */
async function update(id, { name, duration }) {
  return transaction(async (client) => {
    await client.query('UPDATE degrees SET name = $1, duration = $2 WHERE id = $3', [name, duration, id]);

    // Années en trop : leurs frais disparaissent…
    await client.query(
      `DELETE FROM program_fees
       WHERE year > $1 AND program_id IN (SELECT id FROM programs WHERE degree_id = $2)`,
      [duration, id],
    );
    // …et leurs cours sont ramenés sur la dernière année.
    await client.query(
      `UPDATE program_courses SET year = $1
       WHERE year > $1 AND program_id IN (SELECT id FROM programs WHERE degree_id = $2)`,
      [duration, id],
    );
    // Années en plus : elles reprennent le montant de la dernière année connue.
    await client.query(
      `INSERT INTO program_fees (program_id, year, amount)
       SELECT p.id, y.year, last.amount
       FROM programs p
       CROSS JOIN generate_series(1, $1::int) AS y(year)
       JOIN LATERAL (
         SELECT amount FROM program_fees WHERE program_id = p.id ORDER BY year DESC LIMIT 1
       ) AS last ON TRUE
       WHERE p.degree_id = $2
       ON CONFLICT (program_id, year) DO NOTHING`,
      [duration, id],
    );
  });
}

async function remove(id) {
  await query('DELETE FROM degrees WHERE id = $1', [id]);
}

/** @returns {Promise<number>} Nombre de formations, brouillons compris, qui délivrent ce diplôme. */
async function countPrograms(id) {
  const { rows } = await query('SELECT COUNT(*)::int AS total FROM programs WHERE degree_id = $1', [id]);
  return rows[0].total;
}

module.exports = { findAll, findById, findByName, create, update, remove, countPrograms };

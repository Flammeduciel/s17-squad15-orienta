/**
 * Requêtes SQL sur la table `degrees` (diplômes), et ajustement des formations
 * quand la durée d'un diplôme change.
 *
 * @module models/degrees
 */
const { pool } = require("../config/db");
const { query } = require("../config/db");
const httpError = require("../utils/httpError");

/**
 * @typedef {object} Degree
 * @property {number} id
 * @property {string} name
 * @property {number} duration Durée des études en années (1 à 5).
 * @property {number} program_count Nombre de formations qui délivrent ce diplôme.
 */

/**
 * Lecture publique : `program_count` ne compte que les formations publiées.
 * Un diplôme sans formation publiée reste listé (compte 0).
 *
 * @returns {Promise<Degree[]>}
 */
async function listPublic() {
  const { rows } = await query(
    `SELECT d.id, d.name, d.duration, COUNT(p.id)::int AS program_count
       FROM degrees d
       LEFT JOIN programs p ON p.degree_id = d.id AND p.status = 'published'
      GROUP BY d.id
      ORDER BY d.duration, d.name`,
  );
  return rows;
}

/**
 * `program_count` compte toutes les formations, brouillons compris : c'est ce
 * qui empêche la suppression.
 *
 * @param {number} id
 * @returns {Promise<Degree|null>}
 */
async function findById(id) {
  const { rows } = await query(
    `SELECT d.id, d.name, d.duration, COUNT(p.id)::int AS program_count
       FROM degrees d
       LEFT JOIN programs p ON p.degree_id = d.id
      WHERE d.id = $1
      GROUP BY d.id`,
    [id],
  );
  return rows[0] || null;
}

/**
 * @param {{ name: string, duration: number }} data
 * @returns {Promise<Degree>}
 */
async function create({ name, duration }) {
  const { rows } = await query(
    "INSERT INTO degrees (name, duration) VALUES ($1, $2) RETURNING id",
    [name, duration],
  );
  return findById(rows[0].id);
}

/**
 * Modifie le diplôme et ajuste ses formations dans UNE transaction : si une
 * étape échoue (nom déjà pris, panne), rien n'est modifié.
 *
 * - Durée qui diminue : frais des années retirées supprimés, cours de ces
 *   années ramenés sur la dernière année conservée.
 * - Durée qui augmente : chaque formation reçoit les années ajoutées avec le
 *   montant de sa dernière année.
 *
 * @param {number} id
 * @param {{ name: string, duration: number }} data
 * @returns {Promise<Degree|null>} `null` si le diplôme n'existe pas.
 */
async function updateWithPrograms(id, { name, duration }) {
  if (!pool) {
    throw httpError(
      503,
      "BASE_INDISPONIBLE",
      "La base de données n'est pas configurée.",
    );
  }
  const client = await pool.connect();
  let found = true;
  try {
    await client.query("BEGIN");

    // Verrou : deux changements de durée simultanés ne se mélangent pas.
    const current = await client.query(
      "SELECT duration FROM degrees WHERE id = $1 FOR UPDATE",
      [id],
    );
    if (current.rowCount === 0) {
      found = false;
      await client.query("ROLLBACK");
    } else {
      const oldDuration = current.rows[0].duration;
      await client.query(
        "UPDATE degrees SET name = $2, duration = $3 WHERE id = $1",
        [id, name, duration],
      );

      if (duration < oldDuration) {
        await client.query(
          `DELETE FROM program_fees
            WHERE year > $2
              AND program_id IN (SELECT id FROM programs WHERE degree_id = $1)`,
          [id, duration],
        );
        await client.query(
          `UPDATE program_courses SET year = $2
            WHERE year > $2
              AND program_id IN (SELECT id FROM programs WHERE degree_id = $1)`,
          [id, duration],
        );
      } else if (duration > oldDuration) {
        await client.query(
          `INSERT INTO program_fees (program_id, year, amount)
           SELECT pf.program_id, y.year, pf.amount
             FROM program_fees pf
             JOIN programs p ON p.id = pf.program_id
            CROSS JOIN generate_series($2::int + 1, $3::int) AS y(year)
            WHERE p.degree_id = $1
              AND pf.year = (SELECT MAX(year) FROM program_fees WHERE program_id = pf.program_id)
           ON CONFLICT DO NOTHING`,
          [id, oldDuration, duration],
        );
      }
      await client.query("COMMIT");
    }
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
  return found ? findById(id) : null;
}

/**
 * @param {number} id
 * @returns {Promise<boolean>} `true` si une ligne a été supprimée.
 */
async function remove(id) {
  const { rowCount } = await query("DELETE FROM degrees WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { listPublic, findById, create, updateWithPrograms, remove };

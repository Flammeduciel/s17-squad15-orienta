/**
 * Requêtes SQL sur la table `contact_requests`.
 *
 * @module models/contact
 */
const { query } = require("../config/db");

/**
 * @param {{ program_id: number, name: string, email: string, message: string }} request
 * @returns {Promise<number>} Identifiant de la demande.
 */
async function create({ program_id: programId, name, email, message }) {
  const { rows } = await query(
    "INSERT INTO contact_requests (program_id, name, email, message) VALUES ($1, $2, $3, $4) RETURNING id",
    [programId, name, email, message],
  );
  return rows[0].id;
}

/**
 * Formation publiée et contact de son institut.
 *
 * @param {number} programId
 * @returns {Promise<{ program_name: string, institute_name: string, institute_email: string|null }|null>}
 */
async function findTarget(programId) {
  const { rows } = await query(
    `SELECT p.name AS program_name, i.name AS institute_name, i.email AS institute_email
       FROM programs p JOIN institutes i ON i.id = p.institute_id
      WHERE p.id = $1 AND p.status = 'published'`,
    [programId],
  );
  return rows[0] || null;
}

module.exports = { create, findTarget };

/**
 * Requêtes SQL sur les arrondissements (colonne `institutes.district`).
 *
 * @module models/districts
 */
const { query } = require("../config/db");

/**
 * Les 9 arrondissements de Brazzaville, avec leurs accents. Même liste que la
 * contrainte CHECK de `institutes.district` et que `DistrictName` du contrat.
 */
const DISTRICTS = [
  "Makélékélé",
  "Bacongo",
  "Poto-Poto",
  "Moungali",
  "Ouenzé",
  "Talangaï",
  "Mfilou",
  "Madibou",
  "Djoué",
];

/**
 * @typedef {object} District
 * @property {string} name
 * @property {number} program_count Formations publiées dans l'arrondissement.
 */

/**
 * Les 9 arrondissements, y compris ceux sans institut (compte à 0).
 *
 * @returns {Promise<District[]>}
 */
async function list() {
  const { rows } = await query(
    `SELECT i.district AS name, COUNT(p.id)::int AS program_count
       FROM institutes i
       LEFT JOIN programs p ON p.institute_id = i.id AND p.status = 'published'
      GROUP BY i.district`,
  );
  const counts = new Map(rows.map((row) => [row.name, row.program_count]));
  return DISTRICTS.map((name) => ({
    name,
    program_count: counts.get(name) || 0,
  }));
}

module.exports = { DISTRICTS, list };

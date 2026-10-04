/**
 * Requêtes SQL de lecture sur la table `institutes`.
 *
 * @module models/institutes
 */
const { query } = require("../config/db");

/**
 * @typedef {object} InstituteSummary
 * @property {number} id
 * @property {string} short_name
 * @property {string} name
 * @property {string} district
 * @property {boolean} accredited
 * @property {string|null} accreditation_number
 * @property {string|null} color
 * @property {string|null} image_url
 * @property {number} registration_fee FCFA.
 * @property {number} program_count Formations publiées.
 * @property {string[]} degrees Noms des diplômes délivrés par ces formations.
 */

/** Colonnes de la liste, avec les deux agrégats des formations publiées. */
const SUMMARY_COLUMNS = `
  i.id, i.short_name, i.name, i.district, i.accredited, i.accreditation_number,
  i.color, i.image_url, i.registration_fee,
  (SELECT COUNT(*)::int FROM programs p
    WHERE p.institute_id = i.id AND p.status = 'published') AS program_count,
  COALESCE(
    (SELECT array_agg(DISTINCT d.name ORDER BY d.name)
       FROM programs p JOIN degrees d ON d.id = p.degree_id
      WHERE p.institute_id = i.id AND p.status = 'published'),
    ARRAY[]::varchar[]
  ) AS degrees`;

/** Colonnes supplémentaires de la fiche. Les dates sortent en `YYYY-MM-DD`. */
const DETAIL_COLUMNS = `
  i.address, i.phone, i.whatsapp, i.email, i.description, i.benefits,
  to_char(i.registration_deadline, 'YYYY-MM-DD') AS registration_deadline,
  to_char(i.start_date, 'YYYY-MM-DD') AS start_date`;

/**
 * Minuscules et sans accents, côté SQL. Même transformation que `fold()` côté JS.
 *
 * @param {string} column
 * @returns {string}
 */
const sqlFold = (column) =>
  `translate(lower(${column}), 'àâäéèêëîïôöùûüç', 'aaaeeeeiioouuuc')`;

/**
 * @param {string} text
 * @returns {string}
 */
const fold = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 * Liste des instituts. Sans critère : tous. `strpos` plutôt que `ILIKE`, pour
 * que `%` et `_` saisis par le visiteur restent des caractères ordinaires.
 *
 * Seuls `q`, `district` et `accredited` sont appliqués ici. Les filtres qui
 * portent sur les formations sont ajoutés par BK5 : ils se branchent sur
 * `conditions`/`params` et sur la requête.
 *
 * @param {{ q?: string, district?: string, accredited?: boolean }} filters
 * @returns {Promise<InstituteSummary[]>}
 */
async function list({ q, district, accredited } = {}) {
  const conditions = [];
  const params = [];

  if (q) {
    params.push(fold(q));
    const p = `$${params.length}`;
    conditions.push(
      `(strpos(${sqlFold("i.name")}, ${p}) > 0
        OR strpos(${sqlFold("i.short_name")}, ${p}) > 0
        OR strpos(${sqlFold("i.district")}, ${p}) > 0)`,
    );
  }
  if (district) {
    params.push(district);
    conditions.push(`i.district = $${params.length}`);
  }
  if (accredited) {
    conditions.push("i.accredited");
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT ${SUMMARY_COLUMNS} FROM institutes i ${where} ORDER BY i.name`,
    params,
  );
  return rows;
}

/**
 * Fiche d'un institut. `programs` (formations publiées) est ajouté par le
 * contrôleur : il vient de BK5.
 *
 * @param {number} id
 * @returns {Promise<(InstituteSummary & object)|null>}
 */
async function findById(id) {
  const { rows } = await query(
    `SELECT ${SUMMARY_COLUMNS}, ${DETAIL_COLUMNS} FROM institutes i WHERE i.id = $1`,
    [id],
  );
  return rows[0] || null;
}

module.exports = { list, findById };

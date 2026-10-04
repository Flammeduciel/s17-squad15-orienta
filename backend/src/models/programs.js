/**
 * Requêtes SQL sur les formations : table `programs` et ses tables liées
 * (`program_fees`, `program_bac_series`, `program_careers`).
 *
 * @module models/programs
 */
const { query, transaction } = require('../config/db');

/* Une formation avec son diplôme, son domaine et ses frais de 1re année. */
const SELECT = `
  SELECT p.id, p.name, p.status, p.description, p.admission_requirements, p.evening,
         p.internship_months, p.installments, p.institute_id,
         d.id AS degree_id, d.name AS degree_name, d.duration,
         dom.id AS domain_id, dom.name AS domain_name, dom.color AS domain_color, dom.icon AS domain_icon,
         (SELECT amount FROM program_fees f WHERE f.program_id = p.id AND f.year = 1) AS tuition
  FROM programs p
  JOIN degrees d ON d.id = p.degree_id
  JOIN domains dom ON dom.id = p.domain_id
  JOIN institutes i ON i.id = p.institute_id`;

const SORTS = {
  relevance: 'i.short_name, p.name',
  tuition_asc: 'tuition ASC, p.name',
  tuition_desc: 'tuition DESC, p.name',
  duration: 'd.duration, tuition, p.name',
};

/**
 * Formations correspondant aux critères. Chaque critère absent est ignoré.
 *
 * @param {object} filters
 * @param {'published'|'draft'} [filters.status]
 * @param {string} [filters.institute_id]
 * @param {string} [filters.domain_id]
 * @param {string[]} [filters.district] Un de ces arrondissements.
 * @param {string[]} [filters.degree_id] Un de ces diplômes.
 * @param {string[]} [filters.career_id] Au moins un de ces débouchés.
 * @param {number[]} [filters.duration] Une de ces durées.
 * @param {number} [filters.max_tuition] Frais de 1re année maximum.
 * @param {string} [filters.bac_series] Code de série ; une formation sans série est ouverte à toutes.
 * @param {boolean} [filters.evening]
 * @param {boolean} [filters.internship]
 * @param {boolean} [filters.installments]
 * @param {string} [filters.sort]
 * @returns {Promise<object[]>} Lignes brutes, à compléter avec `findRelations`.
 */
async function findAll(filters) {
  const where = [];
  const params = [];
  // Ajoute une condition « colonne = valeur » et sa valeur.
  const add = (condition, value) => {
    params.push(value);
    where.push(condition.replace('?', `$${params.length}`));
  };

  if (filters.status) add('p.status = ?', filters.status);
  if (filters.institute_id) add('p.institute_id = ?', filters.institute_id);
  if (filters.domain_id) add('p.domain_id = ?', filters.domain_id);
  // Critères à plusieurs valeurs : « = ANY(liste) » veut dire « une des valeurs de la liste ».
  if (filters.district) add('i.district = ANY(?::text[])', filters.district);
  if (filters.degree_id) add('p.degree_id = ANY(?::uuid[])', filters.degree_id);
  if (filters.duration) add('d.duration = ANY(?::int[])', filters.duration);
  if (filters.career_id) {
    add(
      'EXISTS (SELECT 1 FROM program_careers pc WHERE pc.program_id = p.id AND pc.career_id = ANY(?::uuid[]))',
      filters.career_id,
    );
  }
  if (filters.max_tuition !== undefined) {
    add('(SELECT amount FROM program_fees f WHERE f.program_id = p.id AND f.year = 1) <= ?', filters.max_tuition);
  }
  if (filters.bac_series) {
    add(
      `(NOT EXISTS (SELECT 1 FROM program_bac_series pb WHERE pb.program_id = p.id)
        OR EXISTS (SELECT 1 FROM program_bac_series pb JOIN bac_series s ON s.id = pb.series_id
                   WHERE pb.program_id = p.id AND s.code = ?))`,
      filters.bac_series,
    );
  }
  if (filters.evening) where.push('p.evening');
  if (filters.internship) where.push('p.internship_months > 0');
  if (filters.installments) where.push('p.installments');

  const { rows } = await query(
    `${SELECT}
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY ${SORTS[filters.sort] || SORTS.relevance}`,
    params,
  );
  return rows;
}

/** @param {string} id */
async function findById(id) {
  const { rows } = await query(`${SELECT} WHERE p.id = $1`, [id]);
  return rows[0] || null;
}

/**
 * Frais, séries, débouchés et cours d'une liste de formations, en quatre requêtes.
 *
 * @param {string[]} programIds
 * @returns {Promise<{ fees: object[], series: object[], careers: object[], courses: object[] }>}
 */
async function findRelations(programIds) {
  const fees = await query(
    'SELECT program_id, year, amount FROM program_fees WHERE program_id = ANY($1::uuid[]) ORDER BY year',
    [programIds],
  );
  const series = await query(
    `SELECT pb.program_id, s.code FROM program_bac_series pb
     JOIN bac_series s ON s.id = pb.series_id
     WHERE pb.program_id = ANY($1::uuid[]) ORDER BY s.code`,
    [programIds],
  );
  const careers = await query(
    `SELECT pc.program_id, c.name FROM program_careers pc
     JOIN careers c ON c.id = pc.career_id
     WHERE pc.program_id = ANY($1::uuid[]) ORDER BY c.name`,
    [programIds],
  );
  const courses = await query(
    `SELECT pc.program_id, pc.year, c.name FROM program_courses pc
     JOIN courses c ON c.id = pc.course_id
     WHERE pc.program_id = ANY($1::uuid[]) ORDER BY pc.year, pc.position`,
    [programIds],
  );
  return { fees: fees.rows, series: series.rows, careers: careers.rows, courses: courses.rows };
}

/** Cherche une autre formation du même nom dans le même institut. */
async function findByName(instituteId, name) {
  const { rows } = await query(
    'SELECT id FROM programs WHERE institute_id = $1 AND lower(name) = lower($2)',
    [instituteId, name],
  );
  return rows[0] || null;
}

/** @returns {Promise<number>} Combien des identifiants donnés existent dans la table. */
async function countExisting(table, ids) {
  const { rows } = await query(`SELECT COUNT(*)::int AS total FROM ${table} WHERE id = ANY($1::uuid[])`, [ids]);
  return rows[0].total;
}

/* Remplace les frais, les séries et les débouchés d'une formation. */
async function saveRelations(client, programId, program) {
  await client.query('DELETE FROM program_fees WHERE program_id = $1', [programId]);
  await client.query('DELETE FROM program_bac_series WHERE program_id = $1', [programId]);
  await client.query('DELETE FROM program_careers WHERE program_id = $1', [programId]);
  for (let index = 0; index < program.fees.length; index += 1) {
    await client.query('INSERT INTO program_fees (program_id, year, amount) VALUES ($1, $2, $3)', [
      programId,
      index + 1,
      program.fees[index],
    ]);
  }
  for (const seriesId of program.bac_series_ids) {
    await client.query('INSERT INTO program_bac_series (program_id, series_id) VALUES ($1, $2)', [programId, seriesId]);
  }
  for (const careerId of program.career_ids) {
    await client.query('INSERT INTO program_careers (program_id, career_id) VALUES ($1, $2)', [programId, careerId]);
  }
}

function values(program) {
  return [
    program.institute_id,
    program.domain_id,
    program.degree_id,
    program.name,
    program.description,
    program.admission_requirements,
    program.evening,
    program.internship_months,
    program.installments,
    program.status,
  ];
}

/** @returns {Promise<string>} Identifiant de la nouvelle formation. */
async function create(program) {
  return transaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO programs (institute_id, domain_id, degree_id, name, description,
                             admission_requirements, evening, internship_months, installments, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      values(program),
    );
    await saveRelations(client, rows[0].id, program);
    return rows[0].id;
  });
}

/**
 * @param {string} id
 * @param {object} program Corps validé de la requête.
 * @param {number} duration Durée du diplôme choisi : les cours rattachés à une
 *   année qui n'existe plus sont ramenés sur la dernière année.
 */
async function update(id, program, duration) {
  return transaction(async (client) => {
    await client.query(
      `UPDATE programs SET
         institute_id = $1, domain_id = $2, degree_id = $3, name = $4, description = $5,
         admission_requirements = $6, evening = $7, internship_months = $8, installments = $9,
         status = $10, updated_at = NOW()
       WHERE id = $11`,
      [...values(program), id],
    );
    await saveRelations(client, id, program);
    await client.query('UPDATE program_courses SET year = $1 WHERE program_id = $2 AND year > $1', [duration, id]);
  });
}

/** Supprime la formation ; ses frais, séries, débouchés et rattachements partent avec elle. */
async function remove(id) {
  const { rowCount } = await query('DELETE FROM programs WHERE id = $1', [id]);
  return rowCount > 0;
}

/** @returns {Promise<object>} Les 5 KPI du tableau de bord (vue `indicators`). */
async function findIndicators() {
  const { rows } = await query(
    `SELECT nb_institutes::int, nb_programs::int, nb_districts_covered::int,
            nb_degrees::int, nb_careers::int
     FROM indicators`,
  );
  return rows[0];
}

module.exports = {
  findAll,
  findById,
  findRelations,
  findByName,
  countExisting,
  create,
  update,
  remove,
  findIndicators,
};

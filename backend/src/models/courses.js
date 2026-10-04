/**
 * Requêtes SQL sur le catalogue de cours (`courses`) et ses rattachements aux
 * formations (`program_courses`).
 *
 * @module models/courses
 */
const { query, transaction } = require('../config/db');

/**
 * Tous les cours avec leurs rattachements : une ligne par couple cours /
 * formation, ou une seule ligne (formation vide) pour un cours sans formation.
 *
 * @returns {Promise<object[]>}
 */
async function findAllWithPrograms() {
  const { rows } = await query(
    `SELECT c.id, c.name, pc.program_id, pc.year, p.name AS program_name, i.short_name AS institute_short_name
     FROM courses c
     LEFT JOIN program_courses pc ON pc.course_id = c.id
     LEFT JOIN programs p ON p.id = pc.program_id
     LEFT JOIN institutes i ON i.id = p.institute_id
     ORDER BY c.name, p.name`,
  );
  return rows;
}

async function findById(id) {
  const { rows } = await query('SELECT id, name FROM courses WHERE id = $1', [id]);
  return rows[0] || null;
}

async function findByName(name) {
  const { rows } = await query('SELECT id, name FROM courses WHERE lower(name) = lower($1)', [name]);
  return rows[0] || null;
}

/**
 * Durée (celle du diplôme) des formations demandées.
 *
 * @param {number[]} programIds
 * @returns {Promise<{ id: number, name: string, duration: number }[]>}
 */
async function findProgramDurations(programIds) {
  const { rows } = await query(
    `SELECT p.id, p.name, d.duration FROM programs p
     JOIN degrees d ON d.id = p.degree_id
     WHERE p.id = ANY($1)`,
    [programIds],
  );
  return rows;
}

/* Rattache un cours à une formation, à la suite des cours déjà rattachés. */
async function insertLink(client, programId, courseId, year) {
  await client.query(
    `INSERT INTO program_courses (program_id, course_id, year, position)
     VALUES ($1, $2, $3, (SELECT COALESCE(MAX(position), 0) + 1 FROM program_courses WHERE program_id = $1))`,
    [programId, courseId, year],
  );
}

/**
 * @param {string} name
 * @param {{ program_id: number, year: number }[]} links Formations à rattacher.
 * @returns {Promise<number>} Identifiant du nouveau cours.
 */
async function create(name, links) {
  return transaction(async (client) => {
    const { rows } = await client.query('INSERT INTO courses (name) VALUES ($1) RETURNING id', [name]);
    for (const link of links) {
      await insertLink(client, link.program_id, rows[0].id, link.year);
    }
    return rows[0].id;
  });
}

/**
 * Renomme un cours et remplace la liste de ses formations. Un rattachement
 * conservé garde sa place dans le programme ; seule son année peut changer.
 *
 * @param {number} id
 * @param {string} name
 * @param {{ program_id: number, year: number }[]} links
 */
async function update(id, name, links) {
  return transaction(async (client) => {
    await client.query('UPDATE courses SET name = $1 WHERE id = $2', [name, id]);
    const programIds = links.map((link) => link.program_id);
    await client.query('DELETE FROM program_courses WHERE course_id = $1 AND NOT (program_id = ANY($2))', [id, programIds]);
    for (const link of links) {
      const { rowCount } = await client.query(
        'UPDATE program_courses SET year = $1 WHERE program_id = $2 AND course_id = $3',
        [link.year, link.program_id, id],
      );
      if (rowCount === 0) {
        await insertLink(client, link.program_id, id, link.year);
      }
    }
  });
}

/** Supprime le cours ; il disparaît du programme de toutes ses formations. */
async function remove(id) {
  const { rowCount } = await query('DELETE FROM courses WHERE id = $1', [id]);
  return rowCount > 0;
}

/** Rattache un cours à une formation, ou change son année s'il l'est déjà. */
async function link(programId, courseId, year) {
  return transaction(async (client) => {
    const { rowCount } = await client.query(
      'UPDATE program_courses SET year = $1 WHERE program_id = $2 AND course_id = $3',
      [year, programId, courseId],
    );
    if (rowCount === 0) {
      await insertLink(client, programId, courseId, year);
    }
  });
}

/** @returns {Promise<boolean>} Faux si le cours n'était pas rattaché à la formation. */
async function unlink(programId, courseId) {
  const { rowCount } = await query('DELETE FROM program_courses WHERE program_id = $1 AND course_id = $2', [
    programId,
    courseId,
  ]);
  return rowCount > 0;
}

module.exports = {
  findAllWithPrograms,
  findById,
  findByName,
  findProgramDurations,
  create,
  update,
  remove,
  link,
  unlink,
};

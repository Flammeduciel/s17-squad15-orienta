/**
 * Requêtes SQL sur le catalogue de cours (`courses`) et leurs rattachements
 * aux formations (`program_courses`).
 *
 * @module models/courses
 */
const { query, transaction } = require("../config/db");
const { matches } = require("../utils/text");

/**
 * @typedef {object} Course
 * @property {number} id
 * @property {string} name
 * @property {{ program_id: number, program_name: string, institute_short_name: string, year: number }[]} programs
 */

const SELECT_LINKS = `
  SELECT c.id, c.name, pc.program_id, p.name AS program_name,
         i.short_name AS institute_short_name, pc.year
    FROM courses c
    LEFT JOIN program_courses pc ON pc.course_id = c.id
    LEFT JOIN programs p ON p.id = pc.program_id
    LEFT JOIN institutes i ON i.id = p.institute_id`;

/** Regroupe les lignes (un cours par rattachement) en cours avec leur liste `programs`. */
function group(rows) {
  const byId = new Map();
  for (const row of rows) {
    if (!byId.has(row.id))
      byId.set(row.id, { id: row.id, name: row.name, programs: [] });
    if (row.program_id !== null) {
      byId.get(row.id).programs.push({
        program_id: row.program_id,
        program_name: row.program_name,
        institute_short_name: row.institute_short_name,
        year: row.year,
      });
    }
  }
  return [...byId.values()];
}

/**
 * @param {{ q?: string, program_id?: number }} filters
 * @returns {Promise<Course[]>}
 */
async function list({ q, program_id: programId } = {}) {
  const params = [];
  let where = "";
  if (programId) {
    params.push(programId);
    where =
      "WHERE c.id IN (SELECT course_id FROM program_courses WHERE program_id = $1)";
  }
  const { rows } = await query(
    `${SELECT_LINKS} ${where} ORDER BY c.name, c.id, pc.year, p.name`,
    params,
  );
  const courses = group(rows);
  return q ? courses.filter((course) => matches(q, course.name)) : courses;
}

/**
 * @param {number} id
 * @returns {Promise<Course|null>}
 */
async function findById(id) {
  const { rows } = await query(
    `${SELECT_LINKS} WHERE c.id = $1 ORDER BY pc.year, p.name`,
    [id],
  );
  return group(rows)[0] || null;
}

/**
 * Cours d'une formation, dans l'ordre du programme (année, position, nom).
 *
 * @param {number} programId
 * @returns {Promise<{ name: string, year: number }[]>}
 */
async function findByProgram(programId) {
  const { rows } = await query(
    `SELECT c.name, pc.year
       FROM program_courses pc JOIN courses c ON c.id = pc.course_id
      WHERE pc.program_id = $1
      ORDER BY pc.year, pc.position, c.name`,
    [programId],
  );
  return rows;
}

/** Rattache un cours ; sans position, il passe en fin d'année. */
async function attach(
  client,
  courseId,
  { program_id: programId, year },
  position,
) {
  await client.query(
    `INSERT INTO program_courses (program_id, course_id, year, position)
     VALUES ($1, $2, $3, COALESCE($4::int,
       (SELECT COALESCE(MAX(position), 0) + 1 FROM program_courses WHERE program_id = $1 AND year = $3)))`,
    [programId, courseId, year, position],
  );
}

/**
 * @param {{ name: string, programs: { program_id: number, year: number }[] }} data
 * @returns {Promise<number>} Identifiant du cours créé.
 */
async function create({ name, programs }) {
  return transaction(async (client) => {
    const { rows } = await client.query(
      "INSERT INTO courses (name) VALUES ($1) RETURNING id",
      [name],
    );
    for (const link of programs) await attach(client, rows[0].id, link, null);
    return rows[0].id;
  });
}

/**
 * Renomme le cours et remplace ses rattachements. Un rattachement qui garde la
 * même formation et la même année garde sa position.
 *
 * @param {number} id
 * @param {{ name: string, programs: { program_id: number, year: number }[] }} data
 * @returns {Promise<boolean>} `false` si le cours n'existe pas.
 */
async function update(id, { name, programs }) {
  return transaction(async (client) => {
    const renamed = await client.query(
      "UPDATE courses SET name = $2 WHERE id = $1",
      [id, name],
    );
    if (renamed.rowCount === 0) return false;
    const old = await client.query(
      "SELECT program_id, year, position FROM program_courses WHERE course_id = $1",
      [id],
    );
    const previous = new Map(old.rows.map((row) => [row.program_id, row]));
    await client.query("DELETE FROM program_courses WHERE course_id = $1", [
      id,
    ]);
    for (const link of programs) {
      const before = previous.get(link.program_id);
      await attach(
        client,
        id,
        link,
        before && before.year === link.year ? before.position : null,
      );
    }
    return true;
  });
}

/**
 * @param {number} id
 * @returns {Promise<boolean>}
 */
async function remove(id) {
  const { rowCount } = await query("DELETE FROM courses WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { list, findById, findByProgram, create, update, remove };

const httpError = require('../utils/httpError');
const { matches } = require('../utils/text');
const courses = require('../models/courses');
const programService = require('../services/programs');

const NOT_FOUND = [404, 'COURS_INTROUVABLE', 'Aucun cours ne correspond à cet identifiant.'];
const PROGRAM_NOT_FOUND = [404, 'FORMATION_INTROUVABLE', 'Aucune formation ne correspond à cet identifiant.'];
const invalid = (message) => httpError(400, 'PARAMETRE_INVALIDE', message);

/**
 * Regroupe les lignes « cours / formation » en cours à la forme du contrat :
 * `{ id, name, programs: [{ program_id, program_name, institute_short_name, year }] }`.
 *
 * @param {object[]} rows Lignes de `courses.findAllWithPrograms`.
 * @returns {object[]}
 */
function groupCourses(rows) {
  const list = [];
  for (const row of rows) {
    let course = list.find((item) => item.id === row.id);
    if (!course) {
      course = { id: row.id, name: row.name, programs: [] };
      list.push(course);
    }
    if (row.program_id) {
      course.programs.push({
        program_id: row.program_id,
        program_name: row.program_name,
        institute_short_name: row.institute_short_name,
        year: row.year,
      });
    }
  }
  return list;
}

/** Relit un cours à la forme du contrat. */
async function getCourse(id) {
  const all = groupCourses(await courses.findAllWithPrograms());
  return all.find((course) => course.id === id);
}

/** `GET /admin/courses` - catalogue de cours, filtrable par nom et par formation. */
async function listCourses(req, res) {
  const { q, program_id: programId } = req.valid.query;
  let list = groupCourses(await courses.findAllWithPrograms());
  if (q) list = list.filter((course) => matches(q, course.name));
  if (programId) list = list.filter((course) => course.programs.some((program) => program.program_id === programId));
  res.json(list);
}

/**
 * Vérifie les rattachements demandés : chaque formation existe, n'apparaît
 * qu'une fois, et l'année ne dépasse pas la durée de son diplôme.
 *
 * @param {{ program_id: string, year: number }[]} links
 */
async function checkLinks(links) {
  const ids = links.map((link) => link.program_id);
  if (new Set(ids).size !== ids.length) {
    throw invalid('« programs » : une formation est rattachée deux fois.');
  }
  const found = await courses.findProgramDurations(ids);
  for (const link of links) {
    const program = found.find((item) => item.id === link.program_id);
    if (!program) throw invalid(`« programs » : la formation ${link.program_id} n'existe pas.`);
    if (link.year > program.duration) {
      throw invalid(`« programs » : « ${program.name} » ne dure que ${program.duration} an(s).`);
    }
  }
}

/** `POST /admin/courses` */
async function createCourse(req, res) {
  const { name, programs } = req.valid.body;
  if (await courses.findByName(name)) {
    throw httpError(409, 'DEJA_EXISTANT', `Le cours « ${name} » existe déjà au catalogue.`);
  }
  await checkLinks(programs);
  const id = await courses.create(name, programs);
  res.status(201).json(await getCourse(id));
}

/** `PUT /admin/courses/:id` - `programs` remplace toute la liste des rattachements. */
async function updateCourse(req, res) {
  const { id } = req.valid.params;
  const { name, programs } = req.valid.body;
  if (!(await courses.findById(id))) throw httpError(...NOT_FOUND);
  const sameName = await courses.findByName(name);
  if (sameName && sameName.id !== id) {
    throw httpError(409, 'DEJA_EXISTANT', `Le cours « ${name} » existe déjà au catalogue.`);
  }
  await checkLinks(programs);
  await courses.update(id, name, programs);
  res.json(await getCourse(id));
}

/** `DELETE /admin/courses/:id` */
async function deleteCourse(req, res) {
  const found = await courses.remove(req.valid.params.id);
  if (!found) throw httpError(...NOT_FOUND);
  res.status(204).end();
}

/** `PUT /admin/programs/:id/courses/:course_id` - rattache un cours, ou change son année. */
async function linkCourse(req, res) {
  const { id: programId, course_id: courseId } = req.valid.params;
  const { year } = req.valid.body;
  if (!(await courses.findById(courseId))) throw httpError(...NOT_FOUND);
  const [program] = await courses.findProgramDurations([programId]);
  if (!program) throw httpError(...PROGRAM_NOT_FOUND);
  if (year > program.duration) {
    throw invalid(`« year » : « ${program.name} » ne dure que ${program.duration} an(s).`);
  }
  await courses.link(programId, courseId, year);
  res.json(await programService.getDetail(programId));
}

/** `DELETE /admin/programs/:id/courses/:course_id` - le cours reste au catalogue. */
async function unlinkCourse(req, res) {
  const { id: programId, course_id: courseId } = req.valid.params;
  const found = await courses.unlink(programId, courseId);
  if (!found) throw httpError(404, 'COURS_INTROUVABLE', "Ce cours n'est pas rattaché à cette formation.");
  res.status(204).end();
}

module.exports = { listCourses, createCourse, updateCourse, deleteCourse, linkCourse, unlinkCourse };

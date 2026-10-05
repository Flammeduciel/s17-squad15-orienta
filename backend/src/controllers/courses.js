const programService = require("../services/programs");
const httpError = require("../utils/httpError");
const { translatePgError } = require("../utils/pgErrors");
const courses = require("../models/courses");
const programs = require("../models/programs");

const notFound = () =>
  httpError(
    404,
    "COURS_INTROUVABLE",
    "Aucun cours ne correspond à cet identifiant.",
  );

/**
 * Vérifie chaque rattachement : la formation existe, et l'année ne dépasse
 * pas la durée de son diplôme.
 *
 * @param {{ program_id: number, year: number }[]} links
 * @returns {Promise<void>}
 */
async function checkLinks(links) {
  for (const { program_id: programId, year } of links) {
    const program = await programs.findById(programId);
    if (!program) {
      throw httpError(
        400,
        "PARAMETRE_INVALIDE",
        `« programs » : la formation ${programId} n'existe pas.`,
      );
    }
    if (year > program.duration) {
      throw httpError(
        400,
        "PARAMETRE_INVALIDE",
        `« programs » : l'année ${year} dépasse la durée (${program.duration} an${program.duration > 1 ? "s" : ""}) de « ${program.name} ».`,
      );
    }
  }
}

const duplicate = (name) => ({
  duplicate: `Un cours nommé « ${name} » existe déjà.`,
  inUse: "Une des formations rattachées n'existe plus.",
});

/** `GET /admin/courses` : 200, tableau de cours avec leurs formations. */
async function list(req, res) {
  res.json(await courses.list(req.valid.query));
}

/** `POST /admin/courses` : 201 avec le cours créé. */
async function create(req, res) {
  const body = req.valid.body;
  await checkLinks(body.programs);
  let id;
  try {
    id = await courses.create(body);
  } catch (error) {
    throw translatePgError(error, duplicate(body.name));
  }
  res.status(201).json(await courses.findById(id));
}

/** `PUT /admin/courses/:id` : 200. `programs` remplace la liste complète. */
async function update(req, res) {
  const { id } = req.valid.params;
  const body = req.valid.body;
  await checkLinks(body.programs);
  let found;
  try {
    found = await courses.update(id, body);
  } catch (error) {
    throw translatePgError(error, duplicate(body.name));
  }
  if (!found) throw notFound();
  res.json(await courses.findById(id));
}

/** `DELETE /admin/courses/:id` : 204. Le cours disparaît de toutes ses formations. */
async function remove(req, res) {
  if (!(await courses.remove(req.valid.params.id))) throw notFound();
  res.status(204).end();
}

/** `PUT /admin/programs/:id/courses/:course_id` : 200 avec la fiche formation à jour. */
async function attachToProgram(req, res) {
  const { id: programId, course_id: courseId } = req.valid.params;
  const { year } = req.valid.body;
  const program = await programs.findById(programId);
  if (!program) {
    throw httpError(404, 'FORMATION_INTROUVABLE', 'Aucune formation ne correspond à cet identifiant.');
  }
  if (!(await courses.findById(courseId))) throw notFound();
  await checkLinks([{ program_id: programId, year }]);
  await courses.setLink(programId, courseId, year);
  res.json(await programService.getDetail(programId));
}

/** `DELETE /admin/programs/:id/courses/:course_id` : 204. Le cours reste au catalogue. */
async function detachFromProgram(req, res) {
  const { id: programId, course_id: courseId } = req.valid.params;
  if (!(await courses.removeLink(programId, courseId))) {
    throw httpError(404, 'RATTACHEMENT_INTROUVABLE', "Ce cours n'est pas rattaché à cette formation.");
  }
  res.status(204).end();
}

module.exports = { list, create, update, remove, attachToProgram, detachFromProgram };

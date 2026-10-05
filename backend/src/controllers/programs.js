const httpError = require('../utils/httpError');
const programs = require('../models/programs');
const institutes = require('../models/institutes');
const domains = require('../models/domains');
const degrees = require('../models/degrees');
const programService = require('../services/programs');

const notFound = () =>
  httpError(404, 'FORMATION_INTROUVABLE', 'Aucune formation ne correspond à cet identifiant.');
const invalid = (message) => httpError(400, 'PARAMETRE_INVALIDE', message);

/** `GET /programs` : 200, `{ total, items }` parmi les formations publiées. */
async function list(req, res) {
  const items = await programService.search({ ...req.valid.query, status: 'published' });
  res.json({ total: items.length, items });
}

/** `GET /programs/:id` : 200 avec la fiche d'une formation publiée ; un brouillon répond 404. */
async function get(req, res) {
  const program = await programService.getDetail(req.valid.params.id);
  if (!program || program.status !== 'published') throw notFound();
  res.json(program);
}

/** `GET /admin/programs` : 200, toutes les formations, brouillons compris. */
async function listAll(req, res) {
  const items = await programService.search(req.valid.query);
  res.json({ total: items.length, items });
}

/** `GET /admin/programs/:id` : 200 avec la fiche, brouillon compris, ou 404. */
async function getAny(req, res) {
  const program = await programService.getDetail(req.valid.params.id);
  if (!program) throw notFound();
  res.json(program);
}

/**
 * Vérifie tout ce que la base ne peut pas dire clairement : l'institut, le
 * domaine, le diplôme, les séries et les débouchés existent, il y a un montant
 * par année du diplôme, et l'institut n'a pas déjà une formation de ce nom.
 *
 * @param {object} body Corps validé.
 * @param {number|null} currentId Formation en cours de modification, sinon `null`.
 * @returns {Promise<object>} Le diplôme choisi.
 */
async function checkProgram(body, currentId) {
  if (!(await institutes.findById(body.institute_id))) throw invalid("« institute_id » : cet institut n'existe pas.");
  if (!(await domains.findById(body.domain_id))) throw invalid("« domain_id » : ce domaine n'existe pas.");
  const degree = await degrees.findById(body.degree_id);
  if (!degree) throw invalid("« degree_id » : ce diplôme n'existe pas.");
  if (body.fees.length !== degree.duration) {
    throw invalid(`« fees » : il faut ${degree.duration} montant(s), un par année du diplôme « ${degree.name} ».`);
  }
  if ((await programs.countExisting('careers', body.career_ids)) !== new Set(body.career_ids).size) {
    throw invalid("« career_ids » : un des débouchés n'existe pas.");
  }
  if ((await programs.countExisting('bac_series', body.bac_series_ids)) !== new Set(body.bac_series_ids).size) {
    throw invalid("« bac_series_ids » : une des séries n'existe pas.");
  }
  const sameName = await programs.findByName(body.institute_id, body.name);
  if (sameName && sameName.id !== currentId) {
    throw httpError(409, 'NOM_DEJA_UTILISE', `Cet institut propose déjà une formation « ${body.name} ».`);
  }
  return degree;
}

/** `POST /admin/programs` : 201 avec la fiche créée. */
async function create(req, res) {
  await checkProgram(req.valid.body, null);
  const id = await programs.create(req.valid.body);
  res.status(201).json(await programService.getDetail(id));
}

/** `PUT /admin/programs/:id` : 200 avec la fiche mise à jour. */
async function update(req, res) {
  const { id } = req.valid.params;
  if (!(await programs.findById(id))) throw notFound();
  const degree = await checkProgram(req.valid.body, id);
  await programs.update(id, req.valid.body, degree.duration);
  res.json(await programService.getDetail(id));
}

/** `DELETE /admin/programs/:id` : 204. */
async function remove(req, res) {
  if (!(await programs.remove(req.valid.params.id))) throw notFound();
  res.status(204).end();
}

/** `GET /admin/indicators` : 200, les 5 KPI du tableau de bord (EX-07). */
async function indicators(req, res) {
  res.json(await programs.findIndicators());
}

module.exports = { list, get, listAll, getAny, create, update, remove, indicators };

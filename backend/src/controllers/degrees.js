const httpError = require('../utils/httpError');
const degrees = require('../models/degrees');

const NOT_FOUND = [404, 'DIPLOME_INTROUVABLE', 'Aucun diplôme ne correspond à cet identifiant.'];

/** `GET /degrees` — liste des diplômes avec leur durée. */
async function listDegrees(req, res) {
  res.json(await degrees.findAll());
}

/** `POST /admin/degrees` */
async function createDegree(req, res) {
  const { name, duration } = req.valid.body;
  if (await degrees.findByName(name)) {
    throw httpError(409, 'DEJA_EXISTANT', `Le diplôme « ${name} » existe déjà.`);
  }
  const degree = await degrees.create({ name, duration });
  res.status(201).json({ ...degree, program_count: 0 });
}

/** `PUT /admin/degrees/:id` — changer la durée ajuste les formations du diplôme. */
async function updateDegree(req, res) {
  const { id } = req.valid.params;
  const { name, duration } = req.valid.body;
  if (!(await degrees.findById(id))) throw httpError(...NOT_FOUND);
  const sameName = await degrees.findByName(name);
  if (sameName && sameName.id !== id) {
    throw httpError(409, 'DEJA_EXISTANT', `Le diplôme « ${name} » existe déjà.`);
  }
  await degrees.update(id, { name, duration });
  const all = await degrees.findAll();
  res.json(all.find((degree) => degree.id === id));
}

/** `DELETE /admin/degrees/:id` — refusé tant qu'une formation délivre ce diplôme. */
async function deleteDegree(req, res) {
  const { id } = req.valid.params;
  const degree = await degrees.findById(id);
  if (!degree) throw httpError(...NOT_FOUND);
  const total = await degrees.countPrograms(id);
  if (total > 0) {
    throw httpError(409, 'ELEMENT_UTILISE', `« ${degree.name} » est utilisé par ${total} formation(s) : modifiez-les d'abord.`);
  }
  await degrees.remove(id);
  res.status(204).end();
}

module.exports = { listDegrees, createDegree, updateDegree, deleteDegree };

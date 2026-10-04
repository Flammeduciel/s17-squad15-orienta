const httpError = require('../utils/httpError');
const careers = require('../models/careers');
const domains = require('../models/domains');

const NOT_FOUND = [404, 'DEBOUCHE_INTROUVABLE', 'Aucun débouché ne correspond à cet identifiant.'];

/** Vérifie que le domaine choisi existe, sinon 400. */
async function checkDomain(domainId) {
  if (!(await domains.findById(domainId))) {
    throw httpError(400, 'PARAMETRE_INVALIDE', "« domain_id » : ce domaine n'existe pas.");
  }
}

/** `GET /careers` — débouchés proposés sur le site public. */
async function listCareers(req, res) {
  res.json(await careers.findPublished());
}

/** `GET /admin/careers` — tout le référentiel, pour le back-office. */
async function listAllCareers(req, res) {
  res.json(await careers.findAll());
}

/** `POST /admin/careers` */
async function createCareer(req, res) {
  const { name, domain_id } = req.valid.body;
  await checkDomain(domain_id);
  if (await careers.findByName(name)) {
    throw httpError(409, 'DEJA_EXISTANT', `Le débouché « ${name} » existe déjà.`);
  }
  const career = await careers.create({ name, domain_id });
  res.status(201).json({ ...career, program_count: 0 });
}

/** `PUT /admin/careers/:id` */
async function updateCareer(req, res) {
  const { id } = req.valid.params;
  const { name, domain_id } = req.valid.body;
  await checkDomain(domain_id);
  const sameName = await careers.findByName(name);
  if (sameName && sameName.id !== id) {
    throw httpError(409, 'DEJA_EXISTANT', `Le débouché « ${name} » existe déjà.`);
  }
  const career = await careers.update(id, { name, domain_id });
  if (!career) throw httpError(...NOT_FOUND);
  res.json({ ...career, program_count: await careers.countPrograms(id) });
}

/** `DELETE /admin/careers/:id` — refusé tant qu'une formation porte ce débouché. */
async function deleteCareer(req, res) {
  const { id } = req.valid.params;
  const career = await careers.findById(id);
  if (!career) throw httpError(...NOT_FOUND);
  const total = await careers.countPrograms(id);
  if (total > 0) {
    throw httpError(409, 'ELEMENT_UTILISE', `« ${career.name} » est utilisé par ${total} formation(s) : modifiez-les d'abord.`);
  }
  await careers.remove(id);
  res.status(204).end();
}

module.exports = { listCareers, listAllCareers, createCareer, updateCareer, deleteCareer };

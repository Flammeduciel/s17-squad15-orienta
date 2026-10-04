const httpError = require('../utils/httpError');
const slugify = require('../utils/slug');
const domains = require('../models/domains');

const NOT_FOUND = [404, 'DOMAINE_INTROUVABLE', 'Aucun domaine ne correspond à cet identifiant.'];

/** `GET /domains` - liste des domaines d'insertion. */
async function listDomains(req, res) {
  res.json(await domains.findAll());
}

/** `POST /admin/domains` - crée un domaine ; son identifiant est tiré de son nom. */
async function createDomain(req, res) {
  const { name, color, icon } = req.valid.body;
  if (await domains.findByName(name)) {
    throw httpError(409, 'DEJA_EXISTANT', `Le domaine « ${name} » existe déjà.`);
  }
  // Deux noms différents peuvent donner le même identifiant : on ajoute alors un numéro.
  const base = slugify(name, 17) || 'domaine';
  let id = base;
  for (let n = 2; await domains.findById(id); n += 1) {
    id = `${base}-${n}`;
  }
  res.status(201).json(await domains.create({ id, name, color, icon }));
}

/** `PUT /admin/domains/:id` - change le nom, la couleur ou l'icône ; l'identifiant ne change pas. */
async function updateDomain(req, res) {
  const { id } = req.valid.params;
  const { name, color, icon } = req.valid.body;
  const sameName = await domains.findByName(name);
  if (sameName && sameName.id !== id) {
    throw httpError(409, 'DEJA_EXISTANT', `Le domaine « ${name} » existe déjà.`);
  }
  const domain = await domains.update(id, { name, color, icon });
  if (!domain) throw httpError(...NOT_FOUND);
  res.json(domain);
}

/** `DELETE /admin/domains/:id` - refusé tant qu'une formation ou un débouché y est rattaché. */
async function deleteDomain(req, res) {
  const { id } = req.valid.params;
  const domain = await domains.findById(id);
  if (!domain) throw httpError(...NOT_FOUND);
  const usage = await domains.countUsage(id);
  if (usage.programs > 0 || usage.careers > 0) {
    throw httpError(
      409,
      'ELEMENT_UTILISE',
      `« ${domain.name} » classe encore ${usage.programs} formation(s) et ${usage.careers} débouché(s) : modifiez-les d'abord.`,
    );
  }
  await domains.remove(id);
  res.status(204).end();
}

module.exports = { listDomains, createDomain, updateDomain, deleteDomain };

const httpError = require('../utils/httpError');
const { matches } = require('../utils/text');
const DISTRICTS = require('../utils/districts');
const institutes = require('../models/institutes');

const NOT_FOUND = [404, 'INSTITUT_INTROUVABLE', 'Aucun institut ne correspond à cet identifiant.'];

/**
 * `GET /institutes` — liste des instituts.
 *
 * L'arrondissement et l'agrément sont filtrés en SQL ; la recherche `q`, qui
 * ignore la casse et les accents, est faite ici.
 */
async function listInstitutes(req, res) {
  const { q, district, accredited } = req.valid.query;
  let items = await institutes.findAll({ district, accredited });
  if (q) {
    items = items.filter((institute) =>
      matches(q, `${institute.name} ${institute.short_name} ${institute.district}`),
    );
  }
  res.json({ total: items.length, items });
}

/** `GET /institutes/:id` — fiche d'un institut. */
async function getInstitute(req, res) {
  const institute = await institutes.findById(req.valid.params.id);
  if (!institute) throw httpError(...NOT_FOUND);
  // Les formations de l'institut seront jointes par le bloc BK5.
  res.json({ ...institute, programs: [] });
}

/** `GET /districts` — les 9 arrondissements, avec leur nombre de formations publiées. */
async function listDistricts(req, res) {
  const counts = await institutes.countProgramsByDistrict();
  res.json(
    DISTRICTS.map((name) => {
      const found = counts.find((count) => count.name === name);
      return { name, program_count: found ? found.program_count : 0 };
    }),
  );
}

/** Refuse un nom ou un sigle déjà porté par un autre institut. */
async function checkUnique(body, currentId) {
  const other = await institutes.findByNameOrShortName(body.name, body.short_name);
  if (other && other.id !== currentId) {
    throw httpError(409, 'DEJA_EXISTANT', `Le nom ou le sigle est déjà utilisé par « ${other.name} » (${other.short_name}).`);
  }
}

/** `POST /admin/institutes` */
async function createInstitute(req, res) {
  await checkUnique(req.valid.body, null);
  const id = await institutes.create(req.valid.body);
  res.status(201).json({ ...(await institutes.findById(id)), programs: [] });
}

/** `PUT /admin/institutes/:id` */
async function updateInstitute(req, res) {
  const { id } = req.valid.params;
  await checkUnique(req.valid.body, id);
  const found = await institutes.update(id, req.valid.body);
  if (!found) throw httpError(...NOT_FOUND);
  res.json({ ...(await institutes.findById(id)), programs: [] });
}

/** `DELETE /admin/institutes/:id` — supprime aussi les formations de l'institut. */
async function deleteInstitute(req, res) {
  const found = await institutes.remove(req.valid.params.id);
  if (!found) throw httpError(...NOT_FOUND);
  res.status(204).end();
}

module.exports = {
  listInstitutes,
  getInstitute,
  listDistricts,
  createInstitute,
  updateInstitute,
  deleteInstitute,
};

const httpError = require('../utils/httpError');
const districts = require('../models/districts');
const cities = require('../models/cities');

const NOT_FOUND = [404, 'ARRONDISSEMENT_INTROUVABLE', 'Aucun arrondissement ne correspond à cet identifiant.'];

/** Vérifie que la ville choisie existe (sinon 400) et que le nom y est libre (sinon 409). */
async function checkDistrict(body, currentId) {
  const city = await cities.findById(body.city_id);
  if (!city) {
    throw httpError(400, 'PARAMETRE_INVALIDE', "« city_id » : cette ville n'existe pas.");
  }
  const sameName = await districts.findByName(body.city_id, body.name);
  if (sameName && sameName.id !== currentId) {
    throw httpError(409, 'DEJA_EXISTANT', `L'arrondissement « ${body.name} » existe déjà à ${city.name}.`);
  }
  return city;
}

/** `GET /districts` - les arrondissements, avec leur ville et leurs comptes. */
async function listDistricts(req, res) {
  res.json(await districts.findAll());
}

/** `POST /admin/districts` */
async function createDistrict(req, res) {
  const city = await checkDistrict(req.valid.body, null);
  const district = await districts.create(req.valid.body);
  res.status(201).json({ ...district, city: city.name, institute_count: 0, program_count: 0 });
}

/** `PUT /admin/districts/:id` */
async function updateDistrict(req, res) {
  const { id } = req.valid.params;
  await checkDistrict(req.valid.body, id);
  const district = await districts.update(id, req.valid.body);
  if (!district) throw httpError(...NOT_FOUND);
  const all = await districts.findAll();
  res.json(all.find((item) => item.id === id));
}

/** `DELETE /admin/districts/:id` - refusé tant qu'un institut s'y trouve. */
async function deleteDistrict(req, res) {
  const { id } = req.valid.params;
  const district = await districts.findById(id);
  if (!district) throw httpError(...NOT_FOUND);
  const total = await districts.countInstitutes(id);
  if (total > 0) {
    throw httpError(409, 'ELEMENT_UTILISE', `« ${district.name} » compte ${total} institut(s) : déplacez-les d'abord.`);
  }
  await districts.remove(id);
  res.status(204).end();
}

module.exports = { listDistricts, createDistrict, updateDistrict, deleteDistrict };

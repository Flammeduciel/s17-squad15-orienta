const httpError = require('../utils/httpError');
const cities = require('../models/cities');

const NOT_FOUND = [404, 'VILLE_INTROUVABLE', 'Aucune ville ne correspond à cet identifiant.'];

/** `GET /cities` - les villes, avec leur nombre d'arrondissements. */
async function listCities(req, res) {
  res.json(await cities.findAll());
}

/** `POST /admin/cities` */
async function createCity(req, res) {
  const { name } = req.valid.body;
  if (await cities.findByName(name)) {
    throw httpError(409, 'DEJA_EXISTANT', `La ville « ${name} » existe déjà.`);
  }
  const city = await cities.create({ name });
  res.status(201).json({ ...city, district_count: 0 });
}

/** `PUT /admin/cities/:id` */
async function updateCity(req, res) {
  const { id } = req.valid.params;
  const { name } = req.valid.body;
  const sameName = await cities.findByName(name);
  if (sameName && sameName.id !== id) {
    throw httpError(409, 'DEJA_EXISTANT', `La ville « ${name} » existe déjà.`);
  }
  const city = await cities.update(id, { name });
  if (!city) throw httpError(...NOT_FOUND);
  res.json({ ...city, district_count: await cities.countDistricts(id) });
}

/** `DELETE /admin/cities/:id` - refusé tant que la ville a des arrondissements. */
async function deleteCity(req, res) {
  const { id } = req.valid.params;
  const city = await cities.findById(id);
  if (!city) throw httpError(...NOT_FOUND);
  const total = await cities.countDistricts(id);
  if (total > 0) {
    throw httpError(409, 'ELEMENT_UTILISE', `« ${city.name} » a ${total} arrondissement(s) : supprimez-les d'abord.`);
  }
  await cities.remove(id);
  res.status(204).end();
}

module.exports = { listCities, createCity, updateCity, deleteCity };
